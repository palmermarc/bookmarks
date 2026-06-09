'use client'
import { useState, useRef, useEffect } from 'react'
import { Session } from 'next-auth'

interface AvatarMenuProps {
  session: Session
  onSignOut: () => void
}

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return 'ME'
}

export default function AvatarMenu({ session, onSignOut }: AvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const name = session.user?.name
  const email = session.user?.email
  const ini = initials(name, email)

  return (
    <div className="menu-wrap" ref={ref}>
      <button className="avatar" onClick={() => setOpen((o) => !o)} title={name ?? email ?? 'Account'}>
        <span className="avatar-initials">{ini}</span>
      </button>
      {open && (
        <div className="menu menu-right fade-in" style={{ minWidth: 220 }}>
          <div className="menu-user">
            <span className="avatar avatar-lg"><span className="avatar-initials">{ini}</span></span>
            <div>
              {name && <div className="menu-user-name">{name}</div>}
              {email && <div className="menu-user-mail">{email}</div>}
            </div>
          </div>
          <div className="menu-sep" />
          <button className="menu-item">
            <span>Sync status</span>
            <span className="menu-badge">Synced</span>
          </button>
          <div className="menu-sep" />
          <button className="menu-item danger" onClick={() => { setOpen(false); onSignOut() }}>
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}
