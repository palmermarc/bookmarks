import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).end()

  const { url } = req.query
  if (!url || typeof url !== 'string') return res.json({ title: null })

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bookmarks/1.0)' },
    })
    clearTimeout(timer)

    if (!response.ok) return res.json({ title: null })
    const html = await response.text()
    const match = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)
    if (!match) return res.json({ title: null })

    const title = match[1]
      .trim()
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')

    res.json({ title: title || null })
  } catch {
    res.json({ title: null })
  }
}
