import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3'

interface DriveError { code?: number; message?: string }

async function driveGet(url: string, token: string): Promise<{ files?: { id: string; name: string; thumbnailLink?: string }[], error?: DriveError }> {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  return r.json()
}

function errorMessage(d: { error?: DriveError }): string {
  return `Drive API error ${d.error?.code ?? '?'}: ${d.error?.message ?? 'unknown error'}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as { accessToken?: string } | null
  const token = session?.accessToken
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }

  const bmFolder = await driveGet(
    `${DRIVE_BASE}/files?q=${encodeURIComponent("name='bookmarks' and mimeType='application/vnd.google-apps.folder' and trashed=false")}&fields=files(id)`,
    token,
  )
  if (bmFolder.error) { res.json({ files: [], error: errorMessage(bmFolder) }); return }
  const bmId = bmFolder.files?.[0]?.id
  if (!bmId) { res.json({ files: [] }); return }

  const icFolder = await driveGet(
    `${DRIVE_BASE}/files?q=${encodeURIComponent(`'${bmId}' in parents and name='icons' and mimeType='application/vnd.google-apps.folder' and trashed=false`)}&fields=files(id)`,
    token,
  )
  if (icFolder.error) { res.json({ files: [], error: errorMessage(icFolder) }); return }
  const icId = icFolder.files?.[0]?.id ?? bmId

  const list = await driveGet(
    `${DRIVE_BASE}/files?q=${encodeURIComponent(`'${icId}' in parents and mimeType contains 'image/' and trashed=false`)}&fields=files(id,name,thumbnailLink)&pageSize=100`,
    token,
  )
  if (list.error) { res.json({ files: [], error: errorMessage(list) }); return }
  res.json({ files: list.files ?? [] })
}
