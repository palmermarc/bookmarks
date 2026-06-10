import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getItems } from '@/lib/db'
import { ensureBookmarksFolders, uploadFile, DriveAccessError } from '@/lib/drive'
import { generateBackupHtml } from '@/lib/backupHtml'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const session = await getServerSession(req, res, authOptions) as { accessToken?: string; user?: { email?: string | null } } | null
  const token = session?.accessToken
  const userId = session?.user?.email
  if (!token || !userId) { res.status(401).json({ error: 'Unauthorized' }); return }

  try {
    const items = await getItems(userId)
    const { backupId } = await ensureBookmarksFolders(token)
    const html = await generateBackupHtml(items, token)
    await uploadFile(token, backupId, 'bookmarks.html', 'text/html', html)
    res.json({ ok: true })
  } catch (err) {
    if (err instanceof DriveAccessError) { res.status(403).json({ error: 'drive_access_denied' }); return }
    console.error('Backup failed', err)
    res.status(500).json({ error: 'backup_failed' })
  }
}
