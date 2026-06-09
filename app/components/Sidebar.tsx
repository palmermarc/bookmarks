'use client'
import React, { useState } from 'react'
import { AppData, ViewState } from '@/lib/adapter'
import { IconSearch, IconX, IconLayers, IconStar, IconClock, IconFolder, IconChevronDown } from './icons'
import { NavItem, CategoryGroup } from './NavItem'

interface SidebarProps {
  data: AppData
  view: ViewState
  onSelect: (v: ViewState) => void
  query: string
  setQuery: (q: string) => void
  header?: React.ReactNode
}

export default function Sidebar({ data, view, onSelect, query, setQuery, header }: SidebarProps) {
  const { categories, folders, bookmarks, tags } = data
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(categories.map((c) => c.id)))
  const [showTags, setShowTags] = useState(true)

  const toggle = (id: string) => setExpanded((prev) => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
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
            />
          ))}
        </div>

        {looseFolders.length > 0 && (
          <>
            <div className="nav-heading">Folders</div>
            <div className="nav-section">
              {looseFolders.map((f) => (
                <NavItem key={f.id} icon={<IconFolder size={15} />} label={f.name}
                  count={folderCount(f.id)}
                  active={view.type === 'folder' && view.id === f.id}
                  onClick={() => onSelect({ type: 'folder', id: f.id })} />
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
