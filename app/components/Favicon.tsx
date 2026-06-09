'use client'
import { useState } from 'react'
import { domainOf, faviconUrl, hueOf } from '@/lib/utils'

interface FaviconProps {
  url: string
  size?: number
}

export default function Favicon({ url, size = 18 }: FaviconProps) {
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState(false)
  const dom = domainOf(url)
  const h = hueOf(dom)
  const dim = size + 8

  return (
    <span className="favicon-tile" style={{
      width: dim, height: dim,
      background: `oklch(0.46 0.1 ${h})`,
      color: `oklch(0.97 0.02 ${h})`,
    }}>
      <span className="favicon-letter">{dom[0]?.toUpperCase() || '•'}</span>
      {!err && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={faviconUrl(url)}
          width={size}
          height={size}
          alt=""
          loading="lazy"
          className={'favicon-img' + (loaded ? ' in' : '')}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement
            if (img.naturalWidth > 1) setLoaded(true)
            else setErr(true)
          }}
          onError={() => setErr(true)}
        />
      )}
    </span>
  )
}
