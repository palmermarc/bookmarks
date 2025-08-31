import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createItemsTable, createItem, getItems } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const items = await getItems(session.user.email);
      return res.status(200).json(items);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }
  } else if (req.method === 'POST') {
    try {
      await createItemsTable();
      const items = await getItems(session.user.email);
      const itemData = req.body;
      const newItem = { ...itemData, user_id: session.user.email, order: items.length + 1 };
      await createItem(newItem);
      return res.status(201).json({ message: 'Item created' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create item' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}