'use client'
import React, { useState } from 'react'
import { AppCategory, AppData, AppFolder, ViewState } from '@/lib/adapter'
import { IconSearch, IconX, IconLayers, IconStar, IconClock, IconFolder, IconChevronDown } from './icons'
import { NavItem, CategoryGroup } from './NavItem'

interface SidebarProps {
  data: AppData
  view: ViewState
  onSelect: (v: ViewState) => void
  query: string
  setQuery: (q: string) => void
  header?: React.ReactNode
  onReorderCats?: (cats: AppCategory[]) => void
  onReorderFolders?: (folders: AppFolder[]) => void
  moveMode?: boolean
  movingId?: string | null
  onMoveToFolder?: (bookmarkId: string, folderId: string | null, catId: string | null) => void
}

export default function Sidebar({ data, view, onSelect, query, setQuery, header, onReorderCats, onReorderFolders, moveMode, movingId, onMoveToFolder }: SidebarProps) {
  const { categories, folders, bookmarks, tags } = data
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(categories.map((c) => c.id)))
  const [showTags, setShowTags] = useState(true)

  // Category drag state
  const [catDragId, setCatDragId] = useState<string | null>(null)
  const [catOverId, setCatOverId] = useState<string | null>(null)

  // Folder drag state
  const [folDragId, setFolDragId] = useState<string | null>(null)
  const [folOverId, setFolOverId] = useState<string | null>(null)

  const toggle = (id: string) => setExpanded((prev) => {
    const n = new Set(prev)
    if (n.has(id)) { n.delete(id) } else { n.add(id) }
    return n
  })

  const catBmCount = (cid: string) => bookmarks.filter((b) => {
    if (b.folderId) {
      const f = folders.find((x) => x.id === b.folderId)
      return f && f.categoryId === cid
    }
    return b.categoryId === cid
  }).length

  const folderCount = (fid: string) => bookmarks.filter((b) => b.folderId === fid).length
  const tagCount = (tid: string) => bookmarks.filter((b) => b.tags.includes(tid)).length

  const looseFolders = folders.filter((f) => !f.categoryId)
  const favCount = bookmarks.filter((b) => b.fav).length
  const recentCount = bookmarks.filter((b) => b.addedDaysAgo <= 3).length

  const onCatDrop = (targetId: string) => {
    if (!catDragId || catDragId === targetId) { setCatDragId(null); setCatOverId(null); return }
    const arr = [...categories]
    const from = arr.findIndex(c => c.id === catDragId)
    const to   = arr.findIndex(c => c.id === targetId)
    if (from < 0 || to < 0) { setCatDragId(null); setCatOverId(null); return }
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    setCatDragId(null); setCatOverId(null)
    onReorderCats?.(arr)
  }

  const onFolDrop = (targetId: string) => {
    if (!folDragId || folDragId === targetId) { setFolDragId(null); setFolOverId(null); return }
    const arr = [...looseFolders]
    const from = arr.findIndex(f => f.id === folDragId)
    const to   = arr.findIndex(f => f.id === targetId)
    if (from < 0 || to < 0) { setFolDragId(null); setFolOverId(null); return }
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    setFolDragId(null); setFolOverId(null)
    // Merge reordered loose folders back with category-bound folders
    const catFolders = folders.filter(f => f.categoryId)
    onReorderFolders?.([...catFolders, ...arr])
  }

  return (
    <aside className="sidebar">
      {header}

      <div className="search">
        <IconSearch size={15} className="search-ic" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bookmarks…"
          spellCheck={false}
        />
        {query
          ? <button className="search-clear" onClick={() => setQuery('')}><IconX size={13} /></button>
          : <kbd className="search-kbd">/</kbd>
        }
      </div>

      <nav className="nav-scroll">
        <div className="nav-section">
          <NavItem icon={<IconLayers size={16} />} label="All Bookmarks" count={bookmarks.length}
            active={view.type === 'all'} onClick={() => onSelect({ type: 'all' })} />
          <NavItem icon={<IconStar size={16} />} label="Favorites" count={favCount} accent
            active={view.type === 'fav'} onClick={() => onSelect({ type: 'fav' })} />
          <NavItem icon={<IconClock size={16} />} label="Recently Added" count={recentCount}
            active={view.type === 'recent'} onClick={() => onSelect({ type: 'recent' })} />
        </div>

        <div className="nav-heading">Categories</div>
        <div className="nav-section">
          {categories.map((c) => (
            <CategoryGroup
              key={c.id}
              cat={c}
              folders={folders.filter((f) => f.categoryId === c.id)}
              bmCount={catBmCount(c.id)}
              folderCount={folderCount}
              expanded={expanded.has(c.id)}
              onToggle={() => toggle(c.id)}
              view={view}
              onSelect={onSelect}
              dragging={catDragId === c.id}
              dragOver={catOverId === c.id}
              onDragStart={!moveMode ? (e) => { setCatDragId(c.id); e.dataTransfer.effectAllowed = 'move' } : undefined}
              onDragOver={!moveMode ? (e) => { e.preventDefault(); setCatOverId(c.id) } : undefined}
              onDrop={!moveMode ? () => onCatDrop(c.id) : undefined}
              onDragEnd={!moveMode ? () => { setCatDragId(null); setCatOverId(null) } : undefined}
              moveTarget={moveMode}
              onMoveDrop={(folderId, catId) => movingId && onMoveToFolder?.(movingId, folderId, catId)}
            />
          ))}
        </div>

        {looseFolders.length > 0 && (
          <>
            <div className="nav-heading">Folders</div>
            <div className="nav-section">
              {looseFolders.map((f) => (
                <NavItem
                  key={f.id}
                  icon={f.icon ? <span style={{ fontSize: 15 }}>{f.icon}</span> : <IconFolder size={15} />}
                  label={f.name}
                  count={folderCount(f.id)}
                  active={view.type === 'folder' && view.id === f.id}
                  onClick={() => onSelect({ type: 'folder', id: f.id })}
                  dragging={folDragId === f.id}
                  dragOver={folOverId === f.id}
                  onDragStart={!moveMode ? (e) => { setFolDragId(f.id); e.dataTransfer.effectAllowed = 'move' } : undefined}
                  onDragOver={!moveMode ? (e) => { e.preventDefault(); setFolOverId(f.id) } : undefined}
                  onDrop={!moveMode ? () => onFolDrop(f.id) : undefined}
                  onDragEnd={!moveMode ? () => { setFolDragId(null); setFolOverId(null) } : undefined}
                  moveTarget={moveMode}
                  onMoveDrop={() => movingId && onMoveToFolder?.(movingId, f.id, null)}
                />
              ))}
            </div>
          </>
        )}

        <div className="nav-heading clickable" onClick={() => setShowTags((s) => !s)}>
          <span>Tags</span>
          <IconChevronDown size={13} style={{
            transform: showTags ? 'none' : 'rotate(-90deg)',
            transition: 'transform .15s',
            color: 'var(--text-4)',
          }} />
        </div>
        {showTags && tags.length > 0 && (
          <div className="tag-wrap">
            {tags.map((t) => {
              const active = view.type === 'tag' && view.id === t.id
              return (
                <button
                  key={t.id}
                  className="tag-pill"
                  data-active={active ? '1' : undefined}
                  style={{ '--chip-h': t.hue } as React.CSSProperties}
                  onClick={() => onSelect({ type: 'tag', id: t.id })}
                >
                  <span className="chip-dot" />
                  {t.label}
                  <span className="tag-pill-count">{tagCount(t.id)}</span>
                </button>
              )
            })}
          </div>
        )}
        <div style={{ height: 16 }} />
      </nav>
    </aside>
  )
}
