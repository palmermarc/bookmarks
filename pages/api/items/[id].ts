import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setFav } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { fav } = req.body;
      await setFav(Number(id), Boolean(fav), session.user.email);
      return res.status(200).json({ message: 'Updated' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update item' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, parent_id, icon, url } = req.body;

      await sql`
        UPDATE items
        SET name = ${name}, parent_id = ${parent_id}, icon = ${icon}, url = ${url}
        WHERE id = ${Number(id)} AND user_id = ${session.user.email}
      `;

      return res.status(200).json({ message: 'Item updated' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update item' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await sql`
        DELETE FROM items
        WHERE id = ${Number(id)} AND user_id = ${session.user.email}
      `;

      return res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete item' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
