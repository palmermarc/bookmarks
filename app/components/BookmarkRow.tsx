'use client'
import { useState } from 'react'
import { AppBookmark, AppTag } from '@/lib/adapter'
import { domainOf, relativeDay } from '@/lib/utils'
import { IconGrip, IconExternal, IconEdit, IconTrash, IconStar, IconCopy, IconCheck } from './icons'
import Favicon from './Favicon'
import TagChips from './TagChips'
import { ItemIcon } from './IconRenderer'

interface BookmarkRowProps {
  bm: AppBookmark
  tags: AppTag[]
  dragMode: boolean
  dragging: boolean
  dragOver: boolean
  moveMode?: boolean
  onFav: (id: string) => void
  onEdit: (bm: AppBookmark) => void
  onDelete: (bm: AppBookmark) => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
  onMoveDragStart?: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function BookmarkRow({
  bm, tags, dragMode, dragging, dragOver, moveMode,
  onFav, onEdit, onDelete,
  onDragStart, onDragOver, onDrop, onDragEnd,
  onMoveDragStart, onContextMenu,
}: BookmarkRowProps) {
  const [copied, setCopied] = useState(false)

  function copyUrl() {
    navigator.clipboard.writeText(bm.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={'bm-row' + (dragging ? ' is-dragging' : '') + (dragOver ? ' is-dragover' : '')}
      draggable={dragMode || moveMode}
      onDragStart={dragMode ? onDragStart : moveMode ? () => onMoveDragStart?.(bm.id) : undefined}
      onDragOver={dragMode ? onDragOver : undefined}
      onDrop={dragMode ? onDrop : undefined}
      onDragEnd={dragMode ? onDragEnd : undefined}
      onContextMenu={onContextMenu ? (e) => { e.preventDefault(); onContextMenu(e) } : undefined}
    >
      {(dragMode || moveMode) && <span className="row-grip"><IconGrip size={16} /></span>}
      {bm.icon
        ? <span className="bm-favicon"><ItemIcon icon={bm.icon} size={26} fallback={null} /></span>
        : <Favicon url={bm.url} />
      }
      <a className="bm-main" href={bm.url} target="_blank" rel="noopener noreferrer" title={bm.url}>
        <span className="bm-title">{bm.title}</span>
        <span className="bm-domain">{domainOf(bm.url)}</span>
      </a>
      <TagChips ids={bm.tags} tags={tags} />
      <span className="bm-time">{relativeDay(bm.addedDaysAgo)}</span>
      <button
        className={'star-btn' + (bm.fav ? ' on' : '')}
        onClick={() => onFav(bm.id)}
        title={bm.fav ? 'Remove favorite' : 'Add favorite'}
      >
        <IconStar size={16} filled={bm.fav} />
      </button>
      <span className="row-actions">
        <a className="icon-btn" title="Open" href={bm.url} target="_blank" rel="noopener noreferrer">
          <IconExternal size={15} />
        </a>
        <button className="icon-btn" title="Copy URL" onClick={copyUrl}>
          {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
        </button>
        <button className="icon-btn" title="Edit" onClick={() => onEdit(bm)}>
          <IconEdit size={15} />
        </button>
        <button className="icon-btn" title="Delete" onClick={() => onDelete(bm)}>
          <IconTrash size={15} />
        </button>
      </span>
    </div>
  )
}
