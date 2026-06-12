import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain } = req.query
  if (!domain || typeof domain !== 'string') { res.status(400).end(); return }

  const r = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`)
  if (!r.ok) { res.status(404).end(); return }

  res.setHeader('Content-Type', r.headers.get('Content-Type') ?? 'image/png')
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000')
  const buf = await r.arrayBuffer()
  res.end(Buffer.from(buf))
}
