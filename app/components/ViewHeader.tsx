interface ViewHeaderProps {
  title: string
  icon: React.ReactNode
  dot?: number
  crumb?: string | null
  count: number
  sub?: string | null
}

export default function ViewHeader({ title, icon, dot, crumb, count, sub }: ViewHeaderProps) {
  return (
    <div className="view-head fade-in">
      <div
        className="view-head-icon"
        style={dot ? {
          background: `oklch(0.7 0.14 ${dot} / 0.16)`,
          color: `oklch(0.78 0.14 ${dot})`,
        } : undefined}
      >
        {icon}
      </div>
      <div className="view-head-text">
        {crumb && <div className="crumb">{crumb}</div>}
        <h1 className="view-title">{title}</h1>
        <div className="view-sub">
          {count} {count === 1 ? 'bookmark' : 'bookmarks'}
          {sub ? ` · ${sub}` : ''}
        </div>
      </div>
    </div>
  )
}
