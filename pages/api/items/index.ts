import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT * FROM items
        ORDER BY sort_order ASC, id ASC
      `;
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, icon, type, parent_id, url } = req.body;

      const result = await sql`
        INSERT INTO items (name, icon, type, parent_id, url)
        VALUES (${name}, ${icon}, ${type}, ${parent_id || null}, ${url || null})
        RETURNING *
      `;

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create item' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}