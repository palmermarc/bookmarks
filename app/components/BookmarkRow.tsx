'use client'
import { AppBookmark, AppTag } from '@/lib/adapter'
import { domainOf, relativeDay } from '@/lib/utils'
import { IconGrip, IconExternal, IconEdit, IconTrash, IconStar } from './icons'
import Favicon from './Favicon'
import TagChips from './TagChips'

interface BookmarkRowProps {
  bm: AppBookmark
  tags: AppTag[]
  dragMode: boolean
  dragging: boolean
  dragOver: boolean
  onFav: (id: string) => void
  onEdit: (bm: AppBookmark) => void
  onDelete: (bm: AppBookmark) => void
  onOpen: (bm: AppBookmark) => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
}

export default function BookmarkRow({
  bm, tags, dragMode, dragging, dragOver,
  onFav, onEdit, onDelete, onOpen,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: BookmarkRowProps) {
  return (
    <div
      className={'bm-row' + (dragging ? ' is-dragging' : '') + (dragOver ? ' is-dragover' : '')}
      draggable={dragMode}
      onDragStart={dragMode ? onDragStart : undefined}
      onDragOver={dragMode ? onDragOver : undefined}
      onDrop={dragMode ? onDrop : undefined}
      onDragEnd={dragMode ? onDragEnd : undefined}
    >
      {dragMode && <span className="row-grip"><IconGrip size={16} /></span>}
      <Favicon url={bm.url} />
      <button className="bm-main" onClick={() => onOpen(bm)} title={bm.url}>
        <span className="bm-title">{bm.title}</span>
        <span className="bm-domain">{domainOf(bm.url)}</span>
      </button>
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
        <button className="icon-btn" title="Open" onClick={() => onOpen(bm)}>
          <IconExternal size={15} />
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
