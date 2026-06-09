import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3'

async function driveGet(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as { accessToken?: string } | null
  const token = session?.accessToken
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const bmFolder = await driveGet(
    `${DRIVE_BASE}/files?q=${encodeURIComponent("name='bookmarks' and mimeType='application/vnd.google-apps.folder' and trashed=false")}&fields=files(id)`,
    token,
  )
  const bmId = bmFolder.files?.[0]?.id
  if (!bmId) return res.json({ files: [] })

  const icFolder = await driveGet(
    `${DRIVE_BASE}/files?q=${encodeURIComponent(`'${bmId}' in parents and name='icons' and mimeType='application/vnd.google-apps.folder' and trashed=false`)}&fields=files(id)`,
    token,
  )
  const icId = icFolder.files?.[0]?.id
  if (!icId) return res.json({ files: [] })

  const list = await driveGet(
    `${DRIVE_BASE}/files?q=${encodeURIComponent(`'${icId}' in parents and mimeType contains 'image/' and trashed=false`)}&fields=files(id,name,thumbnailLink)&pageSize=100`,
    token,
  )
  res.json({ files: list.files ?? [] })
}
