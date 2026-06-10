import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import * as solidIcons from '@fortawesome/free-solid-svg-icons'
import * as heroIcons from '@heroicons/react/24/outline'
import { Item } from './definitions'
import { faviconUrl, domainOf, hueOf } from './utils'
import { driveFetchBinary } from './drive'

const FOLDER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2.2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/></svg>'
const CATEGORY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="m3.5 12.5 8.5 4.2 8.5-4.2"/></svg>'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function faIconSvg(iconName: string): string | null {
  const def = (solidIcons as unknown as Record<string, IconDefinition>)[iconName]
  if (!def) return null
  const [width, height, , , pathData] = def.icon
  const paths = Array.isArray(pathData) ? pathData : [pathData]
  const pathEls = paths.map(d => `<path fill="currentColor" d="${d}"/>`).join('')
  return `<svg viewBox="0 0 ${width} ${height}">${pathEls}</svg>`
}

function heroIconSvg(iconName: string): string | null {
  type HeroIcon = (props: { className?: string }) => ReturnType<typeof createElement>
  const Comp = (heroIcons as unknown as Record<string, HeroIcon>)[iconName]
  if (!Comp) return null
  return renderToStaticMarkup(createElement(Comp, { className: 'item-ic-svg' }))
}

const dataUriCache = new Map<string, string | null>()

async function fetchAsDataUri(url: string): Promise<string | null> {
  if (dataUriCache.has(url)) return dataUriCache.get(url) ?? null
  let result: string | null = null
  try {
    const r = await fetch(url)
    if (r.ok) {
      const buf = await r.arrayBuffer()
      const contentType = r.headers.get('Content-Type') ?? 'image/png'
      result = `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`
    }
  } catch {
    result = null
  }
  dataUriCache.set(url, result)
  return result
}

async function driveIconDataUri(fileId: string, token: string): Promise<string | null> {
  const cacheKey = `drive:${fileId}`
  if (dataUriCache.has(cacheKey)) return dataUriCache.get(cacheKey) ?? null
  const result = await driveFetchBinary(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, token)
  const dataUri = result ? `data:${result.contentType};base64,${Buffer.from(result.buf).toString('base64')}` : null
  dataUriCache.set(cacheKey, dataUri)
  return dataUri
}

async function resolveIcon(item: Item, token: string): Promise<string> {
  const icon = item.icon

  if (icon?.startsWith('fa-solid')) {
    const svg = faIconSvg(icon.replace('fa-solid fa-', ''))
    if (svg) return `<span class="item-ic">${svg}</span>`
  } else if (icon?.startsWith('hero-outline')) {
    const svg = heroIconSvg(icon.replace('hero-outline-', ''))
    if (svg) return `<span class="item-ic">${svg}</span>`
  } else if (icon?.startsWith('drive-')) {
    const dataUri = await driveIconDataUri(icon.replace('drive-', ''), token)
    if (dataUri) return `<span class="item-ic"><img src="${dataUri}" alt=""/></span>`
  }

  if (item.type === 'bookmark' && item.url) {
    const dataUri = await fetchAsDataUri(faviconUrl(item.url))
    if (dataUri) return `<span class="item-ic"><img src="${dataUri}" alt=""/></span>`
    const dom = domainOf(item.url)
    const hue = hueOf(dom)
    const letter = (dom[0] || '?').toUpperCase()
    return `<span class="item-ic favicon-fallback" style="background:oklch(0.46 0.1 ${hue});color:oklch(0.97 0.02 ${hue})">${escapeHtml(letter)}</span>`
  }

  return `<span class="item-ic">${item.type === 'category' ? CATEGORY_SVG : FOLDER_SVG}</span>`
}

async function bookmarkRow(b: Item, token: string): Promise<string> {
  const icon = await resolveIcon(b, token)
  const url = b.url ?? '#'
  const star = b.fav ? '<span class="star">★</span>' : ''
  return `<a class="bm" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${icon}<span class="bm-text"><span class="bm-title">${escapeHtml(b.name)}</span><span class="bm-url">${escapeHtml(url)}</span></span>${star}</a>`
}

const CSS = `
:root {
  --bg: oklch(0.12 0.01 60);
  --surface: oklch(0.16 0.012 60);
  --surface-2: oklch(0.19 0.012 60);
  --text: oklch(0.93 0.01 60);
  --text-2: oklch(0.78 0.01 60);
  --text-4: oklch(0.45 0.01 60);
  --border-soft: oklch(0.22 0.01 60);
  --accent: oklch(0.585 0.238 29);
  --star: oklch(0.82 0.13 85);
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg); color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page { max-width: 760px; margin: 0 auto; padding: 32px 20px 80px; }
.page-head { margin-bottom: 28px; }
.page-head h1 { font-size: 22px; margin: 0 0 4px; }
.meta { color: var(--text-4); font-size: 13px; margin: 0; }
.category { margin-bottom: 28px; }
.category h2 {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 600; margin: 0 0 10px;
  padding-bottom: 8px; border-bottom: 1px solid var(--border-soft);
}
.category h2 .item-ic { width: 20px; height: 20px; }
.category h2 .name { color: var(--accent); }
.folder {
  margin: 8px 0; border: 1px solid var(--border-soft); border-radius: 10px;
  background: var(--surface); overflow: hidden;
}
.folder summary {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  cursor: pointer; font-size: 13.5px; font-weight: 500; list-style: none;
}
.folder summary::-webkit-details-marker { display: none; }
.folder summary .count {
  margin-left: auto; font-size: 11px; color: var(--text-4);
  background: var(--surface-2); padding: 1px 8px; border-radius: 999px;
}
.bm-list { display: flex; flex-direction: column; }
.folder .bm-list { border-top: 1px solid var(--border-soft); }
.bm {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  text-decoration: none; color: var(--text); font-size: 13px;
  border-bottom: 1px solid var(--border-soft);
}
.bm:last-child { border-bottom: none; }
.bm:hover { background: var(--surface-2); }
.bm-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.bm-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bm-url { font-size: 11px; color: var(--text-4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.star { color: var(--star); flex-shrink: 0; }
.item-ic {
  width: 18px; height: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--text-2);
}
.item-ic svg, .item-ic img { width: 100%; height: 100%; object-fit: contain; }
.item-ic.favicon-fallback { border-radius: 5px; font-size: 10px; font-weight: 700; }
.empty { color: var(--text-4); font-size: 13px; padding: 12px; }
`

export async function generateBackupHtml(items: Item[], token: string): Promise<string> {
  const categories = items.filter(i => i.type === 'category').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const folders = items.filter(i => i.type === 'folder')
  const bookmarks = items.filter(i => i.type === 'bookmark')

  const sections = await Promise.all(categories.map(async cat => {
    const catFolders = folders
      .filter(f => f.parent_id === cat.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const directBookmarks = bookmarks
      .filter(b => b.parent_id === cat.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const folderBlocks = await Promise.all(catFolders.map(async folder => {
      const folderBookmarks = bookmarks
        .filter(b => b.parent_id === folder.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const icon = await resolveIcon(folder, token)
      const rows = folderBookmarks.length
        ? (await Promise.all(folderBookmarks.map(b => bookmarkRow(b, token)))).join('')
        : '<div class="empty">Empty folder</div>'
      return `<details class="folder" open><summary>${icon}<span class="name">${escapeHtml(folder.name)}</span><span class="count">${folderBookmarks.length}</span></summary><div class="bm-list">${rows}</div></details>`
    }))

    const directRows = directBookmarks.length
      ? (await Promise.all(directBookmarks.map(b => bookmarkRow(b, token)))).join('')
      : ''
    const catIcon = await resolveIcon(cat, token)

    return `<section class="category"><h2>${catIcon}<span class="name">${escapeHtml(cat.name)}</span></h2>${directRows ? `<div class="bm-list">${directRows}</div>` : ''}${folderBlocks.join('')}</section>`
  }))

  const json = JSON.stringify(items).replace(/</g, '\\u003c')
  const generated = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bookmarks Backup</title>
<style>${CSS}</style>
</head>
<body>
<div class="page">
<header class="page-head">
<h1>Bookmarks Backup</h1>
<p class="meta">Generated ${escapeHtml(generated)} — ${items.length} items, fully self-contained</p>
</header>
<main>${sections.join('') || '<p class="empty">No bookmarks yet.</p>'}</main>
</div>
<script type="application/json" id="bookmarks-data">${json}</script>
</body>
</html>`
}
