'use client'
import { useState, useRef, useEffect } from 'react'
import { Session } from 'next-auth'
import { signIn } from 'next-auth/react'

interface AvatarMenuProps {
  session: Session
  onSignOut: () => void
}

type BackupState = 'idle' | 'loading' | 'done' | 'error'

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
  const [imgError, setImgError] = useState(false)
  const [backupState, setBackupState] = useState<BackupState>('idle')
  const [driveDenied, setDriveDenied] = useState(false)
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
  const image = session.user?.image
  const ini = initials(name, email)
  const hasDriveAccess = (session as Session & { hasDriveAccess?: boolean }).hasDriveAccess
  const needsDriveAccess = hasDriveAccess === false || driveDenied

  const handleBackup = async () => {
    setBackupState('loading')
    try {
      const r = await fetch('/api/drive/backup', { method: 'POST' })
      if (r.ok) {
        setBackupState('done')
      } else {
        const j = await r.json().catch(() => ({}))
        if (j.error === 'drive_access_denied') setDriveDenied(true)
        setBackupState('error')
      }
    } catch {
      setBackupState('error')
    }
    setTimeout(() => setBackupState('idle'), 2500)
  }

  return (
    <div className="menu-wrap" ref={ref}>
      <button className="avatar" onClick={() => setOpen((o) => !o)} title={name ?? email ?? 'Account'}>
        {image && !imgError
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={image} className="avatar-img" onError={() => setImgError(true)} referrerPolicy="no-referrer" alt="" />
          : <span className="avatar-initials">{ini}</span>
        }
      </button>
      {open && (
        <div className="menu menu-right fade-in" style={{ minWidth: 220 }}>
          <div className="menu-user">
            <span className="avatar avatar-lg">
              {image && !imgError
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={image} className="avatar-img" referrerPolicy="no-referrer" alt="" />
                : <span className="avatar-initials">{ini}</span>
              }
            </span>
            <div>
              {name && <div className="menu-user-name">{name}</div>}
              {email && <div className="menu-user-mail">{email}</div>}
            </div>
          </div>
          <div className="menu-sep" />
          {needsDriveAccess ? (
            <div className="menu-item-stack">
              <span className="menu-hint">
                Backups need access to a &quot;bookmarks&quot; folder in Drive — you didn&apos;t grant this yet.
              </span>
              <button className="menu-item" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
                <span>Grant Drive access</span>
              </button>
            </div>
          ) : (
            <button className="menu-item" onClick={handleBackup} disabled={backupState === 'loading'}>
              <span>Backup to Drive</span>
              {backupState !== 'idle' && (
                <span className="menu-badge">
                  {backupState === 'loading' ? 'Backing up…' : backupState === 'done' ? 'Backed up ✓' : 'Failed'}
                </span>
              )}
            </button>
          )}
          <div className="menu-sep" />
          <button className="menu-item danger" onClick={() => { setOpen(false); onSignOut() }}>
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}
