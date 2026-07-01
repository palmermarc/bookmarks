import React, { useState } from 'react'
import { AppCategory, AppFolder, ViewState } from '@/lib/adapter'
import { IconFolder, IconChevron } from './icons'
import { ItemIcon } from './IconRenderer'

interface DragProps {
  dragging?: boolean
  dragOver?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: () => void
  onDragEnd?: () => void
}

interface NavItemProps extends DragProps {
  icon: React.ReactNode
  label: string
  count?: number
  active: boolean
  onClick: () => void
  accent?: boolean
  indent?: number
  trailing?: React.ReactNode
  faint?: boolean
  moveTarget?: boolean
  onMoveDrop?: () => void
}

export function NavItem({ icon, label, count, active, onClick, accent, indent = 0, trailing, faint, dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, moveTarget, onMoveDrop }: NavItemProps) {
  return (
    <button
      className={'nav-item' + (dragging ? ' is-dragging' : '') + (dragOver ? ' is-dragover' : '') + (moveTarget ? ' move-target' : '')}
      data-active={active ? '1' : undefined}
      onClick={onClick}
      style={{ paddingLeft: 10 + indent * 16 }}
      draggable={!!(onDragStart)}
      onDragStart={onDragStart}
      onDragOver={onDragOver ?? (moveTarget ? (e) => e.preventDefault() : undefined)}
      onDrop={onDrop ?? (moveTarget && onMoveDrop ? (e) => { e.stopPropagation(); onMoveDrop() } : undefined)}
      onDragEnd={onDragEnd}
    >
      <span className="nav-icon" style={accent ? { color: 'var(--accent)' } : undefined}>{icon}</span>
      <span className="nav-label" style={faint ? { color: 'var(--text-2)' } : undefined}>{label}</span>
      {trailing}
      {count != null && <span className="nav-count">{count}</span>}
    </button>
  )
}

interface CategoryGroupProps extends DragProps {
  cat: AppCategory
  folders: AppFolder[]
  bmCount: number
  expanded: boolean
  onToggle: () => void
  view: ViewState
  onSelect: (v: ViewState) => void
  folderCount: (fid: string) => number
  moveTarget?: boolean
  onMoveDrop?: (folderId: string | null, catId: string) => void
  onReorderFolders?: (folders: AppFolder[]) => void
}

export function CategoryGroup({ cat, folders, bmCount, expanded, onToggle, view, onSelect, folderCount, dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, moveTarget, onMoveDrop, onReorderFolders }: CategoryGroupProps) {
  const isActive = view.type === 'category' && view.id === cat.id
  const [folDragId, setFolDragId] = useState<string | null>(null)
  const [folOverId, setFolOverId] = useState<string | null>(null)

  const onFolDrop = (targetId: string) => {
    if (!folDragId || folDragId === targetId) { setFolDragId(null); setFolOverId(null); return }
    const arr = [...folders]
    const from = arr.findIndex(f => f.id === folDragId)
    const to   = arr.findIndex(f => f.id === targetId)
    if (from < 0 || to < 0) { setFolDragId(null); setFolOverId(null); return }
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    setFolDragId(null); setFolOverId(null)
    onReorderFolders?.(arr)
  }

  return (
    <div
      className={'cat-group' + (dragging ? ' is-dragging' : '') + (dragOver ? ' is-dragover' : '') + (moveTarget ? ' move-target' : '')}
      draggable={!!(onDragStart)}
      onDragStart={onDragStart}
      onDragOver={onDragOver ?? (moveTarget ? (e) => e.preventDefault() : undefined)}
      onDrop={onDrop ?? (moveTarget ? () => onMoveDrop?.(null, cat.id) : undefined)}
      onDragEnd={onDragEnd}
    >
      <div className="nav-item cat-head" data-active={isActive ? '1' : undefined}>
        <button
          className="cat-caret"
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
        >
          <IconChevron size={13} />
        </button>
        <button className="cat-main" onClick={() => onSelect({ type: 'category', id: cat.id })}>
          <ItemIcon
            icon={cat.icon}
            fallback={<span className="cat-dot" style={{ background: `oklch(0.72 0.14 ${cat.color || 33})` }} />}
          />
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
              icon={<ItemIcon icon={f.icon} fallback={<IconFolder size={15} />} />}
              label={f.name}
              count={folderCount(f.id)}
              active={view.type === 'folder' && view.id === f.id}
              onClick={() => onSelect({ type: 'folder', id: f.id })}
              dragging={folDragId === f.id}
              dragOver={folOverId === f.id}
              onDragStart={!moveTarget ? (e) => { setFolDragId(f.id); e.dataTransfer.effectAllowed = 'move' } : undefined}
              onDragOver={!moveTarget ? (e) => { e.preventDefault(); setFolOverId(f.id) } : undefined}
              onDrop={!moveTarget ? () => onFolDrop(f.id) : undefined}
              onDragEnd={!moveTarget ? () => { setFolDragId(null); setFolOverId(null) } : undefined}
              moveTarget={moveTarget}
              onMoveDrop={() => onMoveDrop?.(f.id, cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
