import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { items } = req.body;

      for (let i = 0; i < items.length; i++) {
        await sql`
          UPDATE items
          SET sort_order = ${i}
          WHERE id = ${items[i].id}
        `;
      }

      return res.status(200).json({ message: 'Items reordered' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to reorder items' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}