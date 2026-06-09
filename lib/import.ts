export interface ImportItem {
  id: string
  name: string
  type: string
  parent_id: string | null
  icon: string
  url?: string
}

export interface ParsedImport {
  folders: ImportItem[]
  bookmarks: ImportItem[]
}

export function parseBookmarkHtml(html: string): ParsedImport {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const folders: ImportItem[] = []
  const bookmarks: ImportItem[] = []

  const processElement = (element: Element, parentId: string | null = null) => {
    const h3 = element.querySelector(':scope > H3')
    if (h3) {
      const folderId = `folder-${Math.random().toString(36).substr(2, 9)}`
      folders.push({
        id: folderId,
        name: h3.textContent?.trim() || 'Unnamed Folder',
        type: 'folder',
        parent_id: parentId,
        icon: 'fa-solid fa-folder',
      })
      const childDl = element.querySelector(':scope > DL')
      if (childDl) {
        childDl.querySelectorAll(':scope > DT').forEach(childDt => processElement(childDt, folderId))
      }
      return
    }

    const a = element.querySelector(':scope > A') as HTMLAnchorElement
    if (a && a.href) {
      bookmarks.push({
        id: `bookmark-${Math.random().toString(36).substr(2, 9)}`,
        name: a.textContent?.trim() || 'Unnamed Bookmark',
        url: a.href,
        type: 'bookmark',
        parent_id: parentId,
        icon: 'fa-solid fa-bookmark',
      })
    }
  }

  doc.querySelectorAll('DT').forEach(dt => {
    if (dt.parentElement?.tagName === 'DL') {
      let isTopLevel = true
      let parent: Element | null = dt.parentElement
      while (parent) {
        if (parent.tagName === 'DT' && parent.querySelector('H3')) { isTopLevel = false; break }
        parent = parent.parentElement
      }
      if (isTopLevel) processElement(dt, null)
    }
  })

  const rootBookmarks = doc.querySelectorAll('DL > DT > A')
  rootBookmarks.forEach(a => {
    const dt = a.parentElement
    if (dt && !dt.querySelector('H3')) {
      bookmarks.push({
        id: `bookmark-${Math.random().toString(36).substr(2, 9)}`,
        name: a.textContent?.trim() || 'Unnamed Bookmark',
        url: a.getAttribute('href') || '',
        type: 'bookmark',
        parent_id: null,
        icon: 'fa-solid fa-bookmark',
      })
    }
  })

  return { folders, bookmarks }
}

export async function executeImport(
  parsed: ParsedImport,
  categoryDbId: number,
  onProgress: (msg: string) => void
): Promise<void> {
  const folderIdMap = new Map<string, number>()

  if (parsed.folders.length > 0) {
    onProgress(`Creating ${parsed.folders.length} folders…`)
    const results = await Promise.all(
      parsed.folders.map(async (folder) => {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: folder.name,
            type: 'folder',
            icon: folder.icon,
            parent_id: categoryDbId,
          }),
        })
        if (res.ok) {
          const created = await res.json()
          return { originalId: folder.id, newId: created.id as number }
        }
        return null
      })
    )
    results.forEach(r => { if (r) folderIdMap.set(r.originalId, r.newId) })
  }

  const chunkSize = 20
  const chunks: ImportItem[][] = []
  for (let i = 0; i < parsed.bookmarks.length; i += chunkSize) {
    chunks.push(parsed.bookmarks.slice(i, i + chunkSize))
  }

  for (let i = 0; i < chunks.length; i++) {
    onProgress(`Importing bookmarks ${i * chunkSize + 1}–${Math.min((i + 1) * chunkSize, parsed.bookmarks.length)} of ${parsed.bookmarks.length}…`)
    await Promise.all(
      chunks[i].map(bm => {
        const parentId = bm.parent_id ? (folderIdMap.get(bm.parent_id) ?? categoryDbId) : categoryDbId
        return fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: bm.name,
            url: bm.url,
            type: 'bookmark',
            icon: bm.icon,
            parent_id: parentId,
          }),
        })
      })
    )
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 100))
  }
}
