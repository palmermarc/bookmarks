'use client'
import { useEffect } from 'react'

interface OverlayProps {
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}

export default function Overlay({ onClose, children, wide }: OverlayProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={'modal' + (wide ? ' modal-wide' : '')}>
        {children}
      </div>
    </div>
  )
}
