import React from 'react'

export interface IconProps {
  size?: number
  sw?: number
  style?: React.CSSProperties
  className?: string
  filled?: boolean
}

function Ic(path: React.ReactNode, vb = '0 0 24 24') {
  return function Icon({ size = 16, sw = 1.6, style, className }: IconProps) {
    return (
      <svg viewBox={vb} width={size} height={size}
           fill="none" stroke="currentColor" strokeWidth={sw}
           strokeLinecap="round" strokeLinejoin="round"
           style={style} className={className}>
        {path}
      </svg>
    )
  }
}

export const IconSearch = Ic(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>)
export const IconPlus = Ic(<><path d="M12 5v14M5 12h14"/></>)
export const IconStar = ({ size = 16, sw = 1.6, style, className, filled }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size}
       fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
       style={style} className={className}>
    <path d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.86L12 17.1 6.75 19.7l1-5.86L3.5 9.66l5.9-.86z"/>
  </svg>
)
export const IconClock = Ic(<><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/></>)
export const IconLayers = Ic(<><path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="m3.5 12.5 8.5 4.2 8.5-4.2"/></>)
export const IconFolder = Ic(<><path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2.2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/></>)
export const IconFolderOpen = Ic(<><path d="M3.5 8.2A1.4 1.4 0 0 1 5 6.8h3.6l1.8 2h8.2c.9 0 1.5.9 1.2 1.7l-2 6.1a1.5 1.5 0 0 1-1.4 1H4.6a1.2 1.2 0 0 1-1.1-1.6z"/></>)
export const IconBookmark = Ic(<><path d="M6.5 4.5h11a1 1 0 0 1 1 1v14l-6.5-4-6.5 4v-14a1 1 0 0 1 1-1z"/></>)
export const IconTag = Ic(<><path d="M4 11.5V5.5a1.5 1.5 0 0 1 1.5-1.5h6l8 8a1.5 1.5 0 0 1 0 2.1l-5.9 5.9a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/></>)
export const IconChevron = Ic(<><path d="m9 6 6 6-6 6"/></>)
export const IconChevronDown = Ic(<><path d="m6 9 6 6 6-6"/></>)
export const IconDots = Ic(<><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></>)
export const IconEdit = Ic(<><path d="M4 20h4l10-10a2 2 0 0 0-3-3L5 17z"/><path d="m13.5 6.5 3 3"/></>)
export const IconTrash = Ic(<><path d="M5 7h14M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7m1 0-.6 11a1.5 1.5 0 0 1-1.5 1.4H9.6A1.5 1.5 0 0 1 8.1 18L7.5 7"/></>)
export const IconImport = Ic(<><path d="M12 3.5v10m0 0 3.5-3.5M12 13.5 8.5 10"/><path d="M5 15.5v2A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-2"/></>)
export const IconExternal = Ic(<><path d="M14 5h5v5"/><path d="M19 5l-8 8"/><path d="M18 13.5v4A1.5 1.5 0 0 1 16.5 19h-9A1.5 1.5 0 0 1 6 17.5v-9A1.5 1.5 0 0 1 7.5 7h4"/></>)
export const IconGrip = Ic(<><circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none"/></>)
export const IconSort = Ic(<><path d="M7 4v16m0 0 3-3M7 20l-3-3"/><path d="M14 8h6M14 12h4M14 16h2"/></>)
export const IconCheck = Ic(<><path d="m5 12.5 4.5 4.5L19 7"/></>)
export const IconX = Ic(<><path d="M6 6l12 12M18 6 6 18"/></>)
export const IconGoogle = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path fill="#4285F4" d="M22.5 12.2c0-.74-.07-1.46-.2-2.15H12v4.07h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.08-1.91 3.27-4.73 3.27-7.98z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.18v2.84A11 11 0 0 0 12 23z"/>
    <path fill="#FBBC05" d="M5.83 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86z"/>
    <path fill="#EA4335" d="M12 4.75c1.62 0 3.07.56 4.21 1.65l3.14-3.14A10.9 10.9 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.65 2.84C6.7 6.7 9.13 4.75 12 4.75z"/>
  </svg>
)
export const IconList = Ic(<><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.1" fill="currentColor" stroke="none"/></>)
export const IconPhoto = Ic(<><path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5z"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="m4.5 17 4-4 3 2.5 2-2 4 3.5"/></>)
