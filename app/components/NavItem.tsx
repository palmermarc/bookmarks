import React from 'react'
import { AppCategory, AppFolder, ViewState } from '@/lib/adapter'
import { IconFolder, IconChevron } from './icons'
import IconRenderer from './IconRenderer'

function ItemIcon({ icon, fallback }: { icon?: string; fallback: React.ReactNode }) {
  if (!icon) return <>{fallback}</>
  if (icon.startsWith('fa-') || icon.startsWith('hero-') || icon.startsWith('drive-'))
    return <IconRenderer icon={icon} style={{ width: 15, height: 15 }} />
  return <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
}

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
}

export function CategoryGroup({ cat, folders, bmCount, expanded, onToggle, view, onSelect, folderCount, dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, moveTarget, onMoveDrop }: CategoryGroupProps) {
  const isActive = view.type === 'category' && view.id === cat.id
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
              moveTarget={moveTarget}
              onMoveDrop={() => onMoveDrop?.(f.id, cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
