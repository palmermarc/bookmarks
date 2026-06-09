'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Item } from '@/lib/definitions'
import {
  adaptItems, resolveParentId,
  AppData, AppCategory, AppFolder, AppBookmark, ViewState, SortOption, ItemKind, EditDraft, ModalState, DeleteTarget,
} from '@/lib/adapter'
import { domainOf } from '@/lib/utils'

import Sidebar from '@/app/components/Sidebar'
import BookmarkRow from '@/app/components/BookmarkRow'
import FolderRow from '@/app/components/FolderRow'
import ViewHeader from '@/app/components/ViewHeader'
import SortMenu from '@/app/components/SortMenu'
import AvatarMenu from '@/app/components/AvatarMenu'
import EditModal from '@/app/components/modals/EditModal'
import ConfirmModal from '@/app/components/modals/ConfirmModal'
import ImportModal from '@/app/components/modals/ImportModal'
import {
  IconBookmark, IconSearch, IconStar, IconClock, IconFolder, IconLayers,
  IconTag, IconGrip, IconPlus, IconImport, IconEdit,
} from '@/app/components/icons'
import ContextMenu from '@/app/components/ContextMenu'
import IconSelectorModal from '@/app/components/IconSelectorModal'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [data, setData] = useState<AppData>({ categories: [], folders: [], bookmarks: [], tags: [] })
  const [view, setView] = useState<ViewState>({ type: 'all' })
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('recent')
  const [dragMode, setDragMode] = useState(false)
  const [moveMode, setMoveMode] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; bm: AppBookmark } | null>(null)
  const [iconPickBm, setIconPickBm] = useState<AppBookmark | null>(null)

  // ── Auth guard ───────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  // ── "/" focuses search ───────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT' &&
        !modal
      ) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('.search input')?.focus()
      }
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [modal])

  // ── Data ─────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/items')
    if (res.ok) {
      const items: Item[] = await res.json()
      setData(adaptItems(items))
    }
  }, [])

  useEffect(() => { if (status === 'authenticated') fetchItems() }, [status, fetchItems])

  // ── Toast ────────────────────────────────────────────────────
  const flash = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }, [])

  // ── View meta ────────────────────────────────────────────────
  const viewMeta = useMemo(() => {
    const { categories, folders, tags } = data
    if (query.trim()) return { title: `Results for "${query}"`, icon: <IconSearch size={18} /> }
    switch (view.type) {
      case 'fav':    return { title: 'Favorites',      icon: <IconStar size={18} filled /> }
      case 'recent': return { title: 'Recently Added', icon: <IconClock size={18} /> }
      case 'tag': {
        const tg = tags.find(x => x.id === view.id)
        return { title: tg ? '#' + tg.label : 'Tag', icon: <IconTag size={18} />, dot: tg?.hue }
      }
      case 'folder': {
        const f = folders.find(x => x.id === view.id)
        const c = f && categories.find(x => x.id === f.categoryId)
        return { title: f?.name ?? 'Folder', icon: <IconFolder size={18} />, crumb: c ? c.name : 'Folders' }
      }
      case 'category': {
        const c = categories.find(x => x.id === view.id)
        return { title: c?.name ?? 'Category', icon: <IconLayers size={18} />, dot: c?.color }
      }
      default: return { title: 'All Bookmarks', icon: <IconLayers size={18} /> }
    }
  }, [view, query, data])

  // ── Visible bookmarks ────────────────────────────────────────
  const visible = useMemo(() => {
    const { bookmarks, tags } = data
    let list = bookmarks
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.tags.some(tid => tags.find(x => x.id === tid)?.label.includes(q))
      )
    } else {
      switch (view.type) {
        case 'fav':      list = list.filter(b => b.fav); break
        case 'recent':   list = list.filter(b => b.addedDaysAgo <= 3); break
        case 'tag':      list = list.filter(b => b.tags.includes(view.id)); break
        case 'folder':   list = list.filter(b => b.folderId === view.id); break
        case 'category': list = list.filter(b => b.categoryId === view.id && !b.folderId); break
      }
    }
    const arr = [...list]
    if (!dragMode) {
      switch (sort) {
        case 'az':     arr.sort((a, b) => a.title.localeCompare(b.title)); break
        case 'za':     arr.sort((a, b) => b.title.localeCompare(a.title)); break
        case 'domain': arr.sort((a, b) => domainOf(a.url).localeCompare(domainOf(b.url))); break
        case 'fav':    arr.sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || a.addedDaysAgo - b.addedDaysAgo); break
        case 'recent': arr.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo); break
        case 'manual': break
        default:       arr.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo); break
      }
    }
    return arr
  }, [data, view, query, sort, dragMode])

  const childFolders = useMemo(() =>
    view.type === 'category' && !query.trim()
      ? data.folders.filter(f => f.categoryId === view.id)
      : [],
    [view, data.folders, query]
  )

  const folderCount = (fid: string) => data.bookmarks.filter(b => b.folderId === fid).length

  // ── Mutations ────────────────────────────────────────────────
  const saveItem = useCallback(async (kind: ItemKind, form: EditDraft) => {
    const isEdit = !!form.id
    try {
      if (kind === 'bookmark') {
        const parentId = resolveParentId(form.parent, data)
        const url = form.url?.startsWith('http') ? form.url : `https://${form.url}`
        const payload = {
          name: form.title || domainOf(url),
          url,
          icon: form.icon ?? '',
          parent_id: parentId,
        }
        if (isEdit) {
          const bm = data.bookmarks.find(b => b.id === form.id)
          await fetch(`/api/items/${bm!.dbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        } else {
          await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, type: 'bookmark' }),
          })
        }
      }

      if (kind === 'folder') {
        const catDbId = form.categoryId
          ? data.categories.find(c => c.id === form.categoryId)?.dbId ?? null
          : null
        const payload = { name: form.name, icon: form.icon ?? '', parent_id: catDbId }
        if (isEdit) {
          const fol = data.folders.find(f => f.id === form.id)
          await fetch(`/api/items/${fol!.dbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        } else {
          await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, type: 'folder' }),
          })
        }
      }

      if (kind === 'category') {
        const payload = { name: form.name, icon: form.icon ?? '' }
        if (isEdit) {
          const cat = data.categories.find(c => c.id === form.id)
          await fetch(`/api/categories/${cat!.dbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        } else {
          await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: form.name, icon: form.icon ?? '', type: 'category', parent_id: null }),
          })
        }
      }

      setModal(null)
      flash(isEdit ? 'Saved changes' : `${kind[0].toUpperCase() + kind.slice(1)} created`)
      fetchItems()
    } catch (err) {
      console.error('saveItem error', err)
    }
  }, [data, flash, fetchItems])

  const doDelete = useCallback(async (target: DeleteTarget) => {
    try {
      if (target.kind === 'category') {
        await fetch(`/api/categories/${target.dbId}`, { method: 'DELETE' })
      } else {
        await fetch(`/api/items/${target.dbId}`, { method: 'DELETE' })
      }
      setModal(null)
      flash('Deleted')
      if (view.type === 'folder' && target.kind === 'folder') setView({ type: 'all' })
      if (view.type === 'category' && target.kind === 'category') setView({ type: 'all' })
      fetchItems()
    } catch (err) {
      console.error('doDelete error', err)
    }
  }, [flash, fetchItems, view])

  // ── Drag reorder ─────────────────────────────────────────────
  const onDrop = useCallback(async (targetId: string) => {
    if (!dragId || !targetId || dragId === targetId) {
      setDragId(null); setOverId(null); return
    }
    const arr = [...data.bookmarks]
    const from = arr.findIndex(b => b.id === dragId)
    const to   = arr.findIndex(b => b.id === targetId)
    if (from < 0 || to < 0) { setDragId(null); setOverId(null); return }
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    setData(d => ({ ...d, bookmarks: arr }))
    setSort('manual')
    setDragId(null); setOverId(null)
    try {
      await fetch('/api/items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: arr.map(b => ({ id: b.dbId })) }),
      })
    } catch (err) {
      console.error('reorder error', err)
      fetchItems()
    }
  }, [dragId, data.bookmarks, fetchItems])

  // ── Favorite toggle ──────────────────────────────────────────
  const onFav = useCallback(async (id: string) => {
    const bm = data.bookmarks.find(b => b.id === id)
    if (!bm) return
    const next = !bm.fav
    setData(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b => b.id === id ? { ...b, fav: next } : b),
    }))
    await fetch(`/api/items/${bm.dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fav: next }),
    })
  }, [data.bookmarks])

  // ── Category / folder reorder ────────────────────────────────
  const onReorderCats = useCallback(async (cats: AppCategory[]) => {
    setData(d => ({ ...d, categories: cats }))
    await fetch('/api/items/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cats.map(c => ({ id: c.dbId })) }),
    })
  }, [])

  const onReorderFolders = useCallback(async (folders: AppFolder[]) => {
    setData(d => ({ ...d, folders }))
    await fetch('/api/items/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: folders.map(f => ({ id: f.dbId })) }),
    })
  }, [])

  // ── Move to folder ───────────────────────────────────────────
  const onMoveToFolder = useCallback(async (bookmarkId: string, targetFolderId: string | null, targetCatId: string | null) => {
    const bm = data.bookmarks.find(b => b.id === bookmarkId)
    if (!bm) return
    const parentDbId = targetFolderId
      ? data.folders.find(f => f.id === targetFolderId)?.dbId ?? null
      : targetCatId
        ? data.categories.find(c => c.id === targetCatId)?.dbId ?? null
        : null
    setData(d => ({
      ...d,
      bookmarks: d.bookmarks.map(b => b.id === bookmarkId
        ? { ...b, folderId: targetFolderId, categoryId: targetCatId, dbParentId: parentDbId }
        : b
      ),
    }))
    setMovingId(null)
    await fetch(`/api/items/${bm.dbId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: bm.title, url: bm.url, icon: '', parent_id: parentDbId }),
    })
    fetchItems()
  }, [data, fetchItems])

  // ── Change icon (direct, bypasses EditModal) ─────────────────
  const onChangeIcon = useCallback(async (bookmarkId: string, icon: string) => {
    const bm = data.bookmarks.find(b => b.id === bookmarkId)
    if (!bm) return
    setData(d => ({
      ...d,
      bookmarks: d.bookmarks.map(b => b.id === bookmarkId ? { ...b, icon } : b),
    }))
    await fetch(`/api/items/${bm.dbId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: bm.title, url: bm.url, icon, parent_id: bm.dbParentId }),
    })
    fetchItems()
  }, [data, fetchItems])

  const bmToDraft = (bm: AppBookmark): EditDraft => ({
    kind: 'bookmark',
    id: bm.id,
    title: bm.title,
    url: bm.url,
    icon: bm.icon,
    fav: bm.fav,
    tags: [...bm.tags],
    parent: bm.folderId ? 'f:' + bm.folderId : bm.categoryId ? 'c:' + bm.categoryId : '',
  })

  // ── New draft ────────────────────────────────────────────────
  const newDraft = (kind: ItemKind = 'bookmark'): EditDraft => {
    const d: EditDraft = { kind, tags: [] }
    if (kind === 'bookmark') {
      if (view.type === 'category') d.parent = 'c:' + view.id
      else if (view.type === 'folder') d.parent = 'f:' + view.id
      else if (view.type === 'fav') d.fav = true
    } else if (kind === 'folder' && view.type === 'category') {
      d.categoryId = view.id
    }
    return d
  }

  // ── Empty state ──────────────────────────────────────────────
  const emptyMsg = query.trim()
    ? 'No bookmarks match your search.'
    : view.type === 'fav'
    ? 'No favorites yet. Tap the star on any bookmark.'
    : 'Nothing here yet.'

  const totalInView = visible.length + childFolders.length

  if (status === 'loading' || status === 'unauthenticated') return null

  return (
    <div className="app">
      <Sidebar
        data={data}
        view={view}
        onSelect={(v) => { setView(v); setQuery('') }}
        query={query}
        setQuery={setQuery}
        onReorderCats={onReorderCats}
        onReorderFolders={onReorderFolders}
        moveMode={moveMode}
        movingId={movingId}
        onMoveToFolder={onMoveToFolder}
      />

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <ViewHeader
              title={viewMeta.title}
              icon={viewMeta.icon}
              dot={'dot' in viewMeta ? viewMeta.dot : undefined}
              crumb={'crumb' in viewMeta ? viewMeta.crumb : undefined}
              count={query.trim() ? visible.length : totalInView}
              sub={view.type === 'category' && childFolders.length > 0
                ? `${childFolders.length} folder${childFolders.length > 1 ? 's' : ''}`
                : null}
            />
            {view.type === 'category' && (() => {
              const cat = data.categories.find(c => c.id === view.id)
              return cat ? (
                <button className="btn btn-ghost" title="Edit category" onClick={() => setModal({
                  kind: 'edit',
                  draft: { kind: 'category', id: cat.id, name: cat.name, icon: cat.icon, color: cat.color },
                })}>
                  <IconEdit size={15} />
                </button>
              ) : null
            })()}
            {view.type === 'folder' && (() => {
              const fol = data.folders.find(f => f.id === view.id)
              return fol ? (
                <button className="btn btn-ghost" title="Edit folder" onClick={() => setModal({
                  kind: 'edit',
                  draft: { kind: 'folder', id: fol.id, name: fol.name, icon: fol.icon, categoryId: fol.categoryId ?? undefined },
                })}>
                  <IconEdit size={15} />
                </button>
              ) : null
            })()}
          </div>
          <div className="topbar-right">
            <SortMenu sort={sort} setSort={setSort} />
            <button
              className={'btn btn-ghost' + (dragMode ? ' on-toggle' : '')}
              onClick={() => { setDragMode(m => !m); setMoveMode(false); setMovingId(null) }}
            >
              <IconGrip size={15} /> {dragMode ? 'Done' : 'Reorder'}
            </button>
            <button
              className={'btn btn-ghost' + (moveMode ? ' on-toggle' : '')}
              onClick={() => { setMoveMode(m => !m); setDragMode(false); setMovingId(null) }}
            >
              <IconFolder size={15} /> {moveMode ? 'Done' : 'Move'}
            </button>
            <div className="bar-sep" />
            <button className="btn" onClick={() => setModal({ kind: 'import' })}>
              <IconImport size={15} /> Import
            </button>
            <button
              className="btn btn-accent"
              onClick={() => setModal({ kind: 'edit', draft: newDraft('bookmark') })}
            >
              <IconPlus size={15} /> New
            </button>
            {session && (
              <AvatarMenu
                session={session}
                onSignOut={() => signOut({ callbackUrl: '/' })}
              />
            )}
          </div>
        </header>

        <div className="content">
          {childFolders.length > 0 && (
            <section className="folder-section">
              <div className="section-label">Folders</div>
              <div className="folder-grid">
                {childFolders.map((f) => (
                  <FolderRow
                    key={f.id}
                    folder={f}
                    count={folderCount(f.id)}
                    onOpen={(fo) => setView({ type: 'folder', id: fo.id })}
                    onEdit={(fo) => setModal({
                      kind: 'edit',
                      draft: { kind: 'folder', id: fo.id, name: fo.name, icon: fo.icon, categoryId: fo.categoryId ?? undefined },
                    })}
                    onDelete={(fo) => setModal({
                      kind: 'confirm',
                      target: { kind: 'folder', id: fo.id, dbId: fo.dbId, name: fo.name },
                    })}
                  />
                ))}
              </div>
            </section>
          )}

          {visible.length > 0 ? (
            <section>
              {childFolders.length > 0 && <div className="section-label">Bookmarks</div>}
              <div className="bm-list">
                {visible.map((b) => (
                  <BookmarkRow
                    key={b.id}
                    bm={b}
                    tags={data.tags}
                    dragMode={dragMode}
                    moveMode={moveMode}
                    dragging={dragId === b.id}
                    dragOver={overId === b.id}
                    onFav={onFav}
                    onMoveDragStart={setMovingId}
                    onOpen={(bm) => window.open(bm.url, '_blank', 'noopener')}
                    onEdit={(bm) => setModal({
                      kind: 'edit',
                      draft: {
                        kind: 'bookmark',
                        id: bm.id,
                        title: bm.title,
                        url: bm.url,
                        tags: [...bm.tags],
                        fav: bm.fav,
                        parent: bm.folderId
                          ? 'f:' + bm.folderId
                          : bm.categoryId
                          ? 'c:' + bm.categoryId
                          : '',
                      },
                    })}
                    onDelete={(bm) => setModal({
                      kind: 'confirm',
                      target: { kind: 'bookmark', id: bm.id, dbId: bm.dbId, name: bm.title },
                    })}
                    onDragStart={(e) => { setDragId(b.id); e.dataTransfer.effectAllowed = 'move' }}
                    onDragOver={(e) => { e.preventDefault(); setOverId(b.id) }}
                    onDrop={() => onDrop(b.id)}
                    onDragEnd={() => { setDragId(null); setOverId(null) }}
                    onContextMenu={(e) => setCtxMenu({ x: e.clientX, y: e.clientY, bm: b })}
                  />
                ))}
              </div>
            </section>
          ) : childFolders.length === 0 && (
            <div className="empty fade-in">
              <div className="empty-ic"><IconBookmark size={26} /></div>
              <div className="empty-title">{emptyMsg}</div>
              {!query.trim() && (
                <button
                  className="btn btn-accent"
                  onClick={() => setModal({ kind: 'edit', draft: newDraft('bookmark') })}
                >
                  <IconPlus size={15} /> Add a bookmark
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {modal?.kind === 'edit' && (
        <EditModal
          data={data}
          draft={modal.draft}
          onClose={() => setModal(null)}
          onSave={saveItem}
        />
      )}
      {modal?.kind === 'import' && (
        <ImportModal
          categories={data.categories}
          onClose={() => setModal(null)}
          onComplete={() => { setModal(null); fetchItems(); flash('Import complete') }}
        />
      )}
      {modal?.kind === 'confirm' && (
        <ConfirmModal
          title={`Delete ${modal.target.kind}?`}
          message={
            modal.target.kind === 'bookmark'
              ? `"${modal.target.name}" will be removed.`
              : `"${modal.target.name}" will be deleted. Items inside become loose (not deleted).`
          }
          onClose={() => setModal(null)}
          onConfirm={() => doDelete(modal.target)}
        />
      )}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          bm={ctxMenu.bm}
          onClose={() => setCtxMenu(null)}
          onEdit={() => setModal({ kind: 'edit', draft: bmToDraft(ctxMenu.bm) })}
          onChangeIcon={() => setIconPickBm(ctxMenu.bm)}
          onDelete={() => setModal({ kind: 'confirm', target: { kind: 'bookmark', id: ctxMenu.bm.id, dbId: ctxMenu.bm.dbId, name: ctxMenu.bm.title } })}
          onFav={() => onFav(ctxMenu.bm.id)}
        />
      )}
      {iconPickBm && (
        <IconSelectorModal
          isOpen
          onClose={() => setIconPickBm(null)}
          onSelectIcon={(icon) => { onChangeIcon(iconPickBm.id, icon); setIconPickBm(null) }}
        />
      )}

      {toast && <div className="toast fade-in">{toast}</div>}
    </div>
  )
}
