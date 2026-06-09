'use client'
import { useState, useRef, useEffect } from 'react'
import { SortOption } from '@/lib/adapter'
import { IconSort, IconChevronDown, IconCheck } from './icons'

interface SortMenuProps {
  sort: SortOption
  setSort: (s: SortOption) => void
}

const OPTS: { id: SortOption; label: string }[] = [
  { id: 'manual', label: 'Manual order' },
  { id: 'recent', label: 'Recently added' },
  { id: 'az',     label: 'Title A–Z' },
  { id: 'za',     label: 'Title Z–A' },
  { id: 'domain', label: 'Domain' },
  { id: 'fav',    label: 'Favorites first' },
]

export default function SortMenu({ sort, setSort }: SortMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const cur = OPTS.find((o) => o.id === sort)

  return (
    <div className="menu-wrap" ref={ref}>
      <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)}>
        <IconSort size={15} />
        <span className="sort-label">{cur?.label}</span>
        <IconChevronDown size={13} style={{ color: 'var(--text-4)' }} />
      </button>
      {open && (
        <div className="menu fade-in">
          {OPTS.map((o) => (
            <button key={o.id} className="menu-item" onClick={() => { setSort(o.id); setOpen(false) }}>
              <span>{o.label}</span>
              {sort === o.id && <IconCheck size={15} style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
