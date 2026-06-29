import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getItems } from '@/lib/db'
import { Item } from '@/lib/definitions'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildHtml(items: Item[]): string {
  const categories = items.filter(i => i.type === 'category')
  const folders = items.filter(i => i.type === 'folder')
  const bookmarks = items.filter(i => i.type === 'bookmark')

  const lines: string[] = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
  ]

  for (const cat of categories) {
    lines.push(`    <DT><H3>${esc(cat.name)}</H3>`)
    lines.push('    <DL><p>')

    for (const folder of folders.filter(f => f.parent_id === cat.id)) {
      lines.push(`        <DT><H3>${esc(folder.name)}</H3>`)
      lines.push('        <DL><p>')
      for (const bm of bookmarks.filter(b => b.parent_id === folder.id)) {
        lines.push(`            <DT><A HREF="${esc(bm.url ?? '')}">${esc(bm.name)}</A>`)
      }
      lines.push('        </DL><p>')
    }

    for (const bm of bookmarks.filter(b => b.parent_id === cat.id)) {
      lines.push(`        <DT><A HREF="${esc(bm.url ?? '')}">${esc(bm.name)}</A>`)
    }

    lines.push('    </DL><p>')
  }

  for (const folder of folders.filter(f => !f.parent_id)) {
    lines.push(`    <DT><H3>${esc(folder.name)}</H3>`)
    lines.push('    <DL><p>')
    for (const bm of bookmarks.filter(b => b.parent_id === folder.id)) {
      lines.push(`        <DT><A HREF="${esc(bm.url ?? '')}">${esc(bm.name)}</A>`)
    }
    lines.push('    </DL><p>')
  }

  for (const bm of bookmarks.filter(b => !b.parent_id)) {
    lines.push(`    <DT><A HREF="${esc(bm.url ?? '')}">${esc(bm.name)}</A>`)
  }

  lines.push('</DL><p>')
  return lines.join('\n')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).end()

  const items = await getItems(session.user.email)
  const html = buildHtml(items)

  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.html"')
  res.send(html)
}
