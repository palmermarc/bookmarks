import React from 'react'
import { AppCategory, AppFolder, ViewState } from '@/lib/adapter'
import { IconFolder, IconChevron } from './icons'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  count?: number
  active: boolean
  onClick: () => void
  accent?: boolean
  indent?: number
  trailing?: React.ReactNode
  faint?: boolean
}

export function NavItem({ icon, label, count, active, onClick, accent, indent = 0, trailing, faint }: NavItemProps) {
  return (
    <button
      className="nav-item"
      data-active={active ? '1' : undefined}
      onClick={onClick}
      style={{ paddingLeft: 10 + indent * 16 }}
    >
      <span className="nav-icon" style={accent ? { color: 'var(--accent)' } : undefined}>{icon}</span>
      <span className="nav-label" style={faint ? { color: 'var(--text-2)' } : undefined}>{label}</span>
      {trailing}
      {count != null && <span className="nav-count">{count}</span>}
    </button>
  )
}

interface CategoryGroupProps {
  cat: AppCategory
  folders: AppFolder[]
  bmCount: number
  expanded: boolean
  onToggle: () => void
  view: ViewState
  onSelect: (v: ViewState) => void
  folderCount: (fid: string) => number
}

export function CategoryGroup({ cat, folders, bmCount, expanded, onToggle, view, onSelect, folderCount }: CategoryGroupProps) {
  const isActive = view.type === 'category' && view.id === cat.id
  return (
    <div className="cat-group">
      <div className="nav-item cat-head" data-active={isActive ? '1' : undefined}>
        <button
          className="cat-caret"
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
        >
          <IconChevron size={13} />
        </button>
        <button className="cat-main" onClick={() => onSelect({ type: 'category', id: cat.id })}>
          <span className="cat-dot" style={{ background: `oklch(0.72 0.14 ${cat.color || 33})` }} />
          <span className="nav-label">{cat.name}</span>
          <span className="nav-count">{bmCount}</span>
        </button>
      </div>
      {expanded && (
        <div className="cat-children">
          {folders.map((f) => (
            <NavItem
              key={f.id}
              indent={1}
              icon={<IconFolder size={15} />}
              label={f.name}
              count={folderCount(f.id)}
              active={view.type === 'folder' && view.id === f.id}
              onClick={() => onSelect({ type: 'folder', id: f.id })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
