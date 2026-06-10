import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { driveGet, ensureBookmarksFolders, DriveAccessError } from '@/lib/drive'
import type { NextApiRequest, NextApiResponse } from 'next'

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as { accessToken?: string } | null
  const token = session?.accessToken
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }

  try {
    const { iconsId } = await ensureBookmarksFolders(token)

    const list = await driveGet(
      `${DRIVE_BASE}/files?q=${encodeURIComponent(`'${iconsId}' in parents and mimeType contains 'image/' and trashed=false`)}&fields=files(id,name,thumbnailLink)&pageSize=100`,
      token,
    )
    res.json({ files: list.files ?? [] })
  } catch (err) {
    if (err instanceof DriveAccessError) { res.json({ files: [] }); return }
    throw err
  }
}
