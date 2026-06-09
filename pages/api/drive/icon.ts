import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as { accessToken?: string } | null
  const token = session?.accessToken
  const { id } = req.query
  if (!token || !id || typeof id !== 'string') { res.status(401).end(); return }

  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) { res.status(r.status).end(); return }
  res.setHeader('Content-Type', r.headers.get('Content-Type') ?? 'image/png')
  res.setHeader('Cache-Control', 'private, max-age=3600')
  const buf = await r.arrayBuffer()
  res.end(Buffer.from(buf))
}
