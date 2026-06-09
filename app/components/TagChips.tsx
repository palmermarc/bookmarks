import { AppTag } from '@/lib/adapter'

interface TagChipsProps {
  ids: string[]
  tags: AppTag[]
}

export default function TagChips({ ids, tags }: TagChipsProps) {
  if (!ids.length) return null
  return (
    <span className="row-tags">
      {ids.map((id) => {
        const t = tags.find((x) => x.id === id)
        if (!t) return null
        return (
          <span key={id} className="chip" style={{ '--chip-h': t.hue } as React.CSSProperties}>
            {t.label}
          </span>
        )
      })}
    </span>
  )
}
