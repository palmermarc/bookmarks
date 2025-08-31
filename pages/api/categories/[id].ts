import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateCategoryName, deleteCategoryAndChildren } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { name } = req.body;
      const categoryId = parseInt(id as string, 10);
      await updateCategoryName(categoryId, name, session.user.email);
      return res.status(200).json({ message: 'Category updated' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const categoryId = parseInt(id as string, 10);
      await deleteCategoryAndChildren(categoryId, session.user.email);
      return res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}