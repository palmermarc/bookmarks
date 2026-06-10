const DRIVE_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

/** Thrown when the Drive API rejects a request due to insufficient/stale OAuth scope. */
export class DriveAccessError extends Error {
  constructor(public status: number) {
    super(`Drive API access error: ${status}`)
  }
}

function checkAccess(r: Response) {
  if (r.status === 401 || r.status === 403) throw new DriveAccessError(r.status)
}

export async function driveGet(url: string, token: string) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  checkAccess(r)
  return r.json()
}

export async function driveFetchBinary(url: string, token: string): Promise<{ buf: ArrayBuffer, contentType: string } | null> {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) return null
  const buf = await r.arrayBuffer()
  return { buf, contentType: r.headers.get('Content-Type') ?? 'application/octet-stream' }
}

/** Find a folder by name (optionally within a parent), creating it if it doesn't exist. */
export async function getOrCreateFolder(token: string, name: string, parentId?: string): Promise<string> {
  const q = parentId
    ? `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

  const list = await driveGet(`${DRIVE_BASE}/files?q=${encodeURIComponent(q)}&fields=files(id)`, token)
  const existing = list.files?.[0]?.id
  if (existing) return existing

  const metadata: Record<string, unknown> = { name, mimeType: 'application/vnd.google-apps.folder' }
  if (parentId) metadata.parents = [parentId]

  const r = await fetch(`${DRIVE_BASE}/files?fields=id`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  })
  checkAccess(r)
  const created = await r.json()

  return created.id
}

/** Ensures bookmarks/, bookmarks/icons/ and bookmarks/backup/ exist, creating any that are missing. */
export async function ensureBookmarksFolders(token: string): Promise<{ bookmarksId: string, iconsId: string, backupId: string }> {
  const bookmarksId = await getOrCreateFolder(token, 'bookmarks')
  const iconsId = await getOrCreateFolder(token, 'icons', bookmarksId)
  const backupId = await getOrCreateFolder(token, 'backup', bookmarksId)
  return { bookmarksId, iconsId, backupId }
}

/** Creates or overwrites a file by name within a parent folder. */
export async function uploadFile(token: string, parentId: string, name: string, mimeType: string, content: string): Promise<void> {
  const list = await driveGet(
    `${DRIVE_BASE}/files?q=${encodeURIComponent(`'${parentId}' in parents and name='${name}' and trashed=false`)}&fields=files(id)`,
    token,
  )
  const existingId = list.files?.[0]?.id

  if (existingId) {
    const r = await fetch(`${UPLOAD_BASE}/files/${existingId}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimeType },
      body: content,
    })
    checkAccess(r)
    return
  }

  const boundary = 'bkmk-' + Math.random().toString(36).slice(2)
  const metadata = JSON.stringify({ name, parents: [parentId] })
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`

  const r = await fetch(`${UPLOAD_BASE}/files?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  checkAccess(r)
}
