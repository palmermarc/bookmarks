'use client'
import { useEffect, useRef } from 'react'
import { AppBookmark } from '@/lib/adapter'
import { IconEdit, IconTrash, IconStar, IconPhoto } from './icons'

interface ContextMenuProps {
  x: number
  y: number
  bm: AppBookmark
  onClose: () => void
  onEdit: () => void
  onChangeIcon: () => void
  onDelete: () => void
  onFav: () => void
}

export default function ContextMenu({ x, y, bm, onClose, onEdit, onChangeIcon, onDelete, onFav }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown) }
  }, [onClose])

  const style: React.CSSProperties = { position: 'fixed', left: x, top: y, zIndex: 9999 }
  const act = (fn: () => void) => { fn(); onClose() }

  return (
    <div className="ctx-menu fade-in" style={style} ref={ref}>
      <button className="ctx-item" onClick={() => act(onEdit)}>
        <IconEdit size={14} /> Edit
      </button>
      <button className="ctx-item" onClick={() => act(onChangeIcon)}>
        <IconPhoto size={14} /> Change Icon
      </button>
      <div className="ctx-sep" />
      <button className="ctx-item" onClick={() => act(onFav)}>
        <IconStar size={14} filled={bm.fav} /> {bm.fav ? 'Remove Favorite' : 'Mark as Favorite'}
      </button>
      <div className="ctx-sep" />
      <button className="ctx-item danger" onClick={() => act(onDelete)}>
        <IconTrash size={14} /> Delete
      </button>
    </div>
  )
}
