'use client'

import { useState, FC, SVGProps } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import * as solidIcons from '@fortawesome/free-solid-svg-icons'
import * as heroIcons from '@heroicons/react/24/outline'
import Overlay from './Overlay'
import { IconX } from './icons'

interface DriveFile { id: string; name: string; thumbnailLink?: string }

interface IconSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectIcon: (icon: string) => void
}

export default function IconSelectorModal({ isOpen, onClose, onSelectIcon }: IconSelectorModalProps) {
  const [tab, setTab] = useState<'icons' | 'drive'>('icons')
  const [searchTerm, setSearchTerm] = useState('')
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [driveLoading, setDriveLoading] = useState(false)
  const [driveLoaded, setDriveLoaded] = useState(false)

  const faIcons = Object.entries(solidIcons)
    .filter(([, v]) => v !== null && typeof v === 'object' && 'iconName' in v)
    .map(([k]) => `fa-solid fa-${k}`)
  const hIcons = Object.entries(heroIcons)
    .filter(([, v]) => typeof v === 'function')
    .map(([k]) => `hero-outline-${k}`)
  const icons = [...faIcons, ...hIcons]

  const filteredIcons = icons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const loadDrive = async () => {
    setDriveLoading(true)
    try {
      const r = await fetch('/api/drive/icons')
      const j = await r.json()
      setDriveFiles(j.files ?? [])
    } catch {
      setDriveFiles([])
    }
    setDriveLoading(false)
    setDriveLoaded(true)
  }

  const switchToDrive = () => {
    setTab('drive')
    if (!driveLoaded) loadDrive()
  }

  if (!isOpen) return null

  const renderIcon = (icon: string) => {
    if (icon.startsWith('fa-solid')) {
      const iconName = icon.replace('fa-solid fa-', '')
      const solidIcon = (solidIcons as unknown as { [key: string]: IconDefinition })[iconName]
      if (solidIcon) return <FontAwesomeIcon icon={solidIcon} style={{ width: 18, height: 18 }} />
    } else if (icon.startsWith('hero-outline')) {
      const iconName = icon.replace('hero-outline-', '')
      const HeroIcon = (heroIcons as unknown as { [key: string]: FC<SVGProps<SVGSVGElement>> })[iconName]
      if (HeroIcon) return <HeroIcon style={{ width: 18, height: 18 }} />
    }
    return null
  }

  return (
    <Overlay onClose={onClose} wide>
      <div className="modal-head">
        <h2>Select Icon</h2>
        <button className="icon-btn" onClick={onClose}><IconX size={16} /></button>
      </div>
      <div className="type-tabs" style={{ padding: '0 16px 12px' }}>
        <button className={'type-tab' + (tab === 'icons' ? ' on' : '')} onClick={() => setTab('icons')}>Icons</button>
        <button className={'type-tab' + (tab === 'drive' ? ' on' : '')} onClick={switchToDrive}>Drive</button>
      </div>
      <div className="modal-body">
        {tab === 'icons' && (
          <>
            <input
              className="inp"
              type="text"
              placeholder="Search icons…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="icon-grid">
              {filteredIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="icon-btn-pick"
                  title={icon}
                  onClick={() => onSelectIcon(icon)}
                >
                  {renderIcon(icon)}
                </button>
              ))}
            </div>
          </>
        )}
        {tab === 'drive' && (
          driveLoading
            ? <div className="drive-empty">Loading…</div>
            : driveFiles.length === 0
            ? (
              <div className="drive-empty">
                No images found. Upload PNG, JPG, or SVG files to a folder named <strong>icons</strong> inside a folder named <strong>bookmarks</strong> in your Google Drive.<br /><br />You may need to sign out and sign back in to grant Drive access.
              </div>
            ) : (
              <div className="icon-grid">
                {driveFiles.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className="icon-btn-pick"
                    title={f.name}
                    onClick={() => onSelectIcon(`drive-${f.id}`)}
                  >
                    {f.thumbnailLink
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={f.thumbnailLink} style={{ width: 28, height: 28, objectFit: 'contain' }} alt={f.name} />
                      : <span style={{ fontSize: 10 }}>{f.name}</span>}
                  </button>
                ))}
              </div>
            )
        )}
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Overlay>
  )
}
