import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items } = await req.json();

    for (let i = 0; i < items.length; i++) {
      await sql`
        UPDATE items
        SET "order" = ${i + 1}
        WHERE id = ${items[i].id}
      `;
    }

    return NextResponse.json({ message: 'Items reordered' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}
