import { sql } from '@vercel/postgres';
import { Item } from './definitions';

export async function createItemsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      icon VARCHAR(255),
      type VARCHAR(50) NOT NULL CHECK (type IN ('category', 'folder', 'bookmark')),
      parent_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      url VARCHAR(255),
      "order" INTEGER
    );
  `;
  await sql`
    ALTER TABLE items ADD COLUMN IF NOT EXISTS url VARCHAR(255);
  `;
  await sql`
    ALTER TABLE items ADD COLUMN IF NOT EXISTS "order" INTEGER;
  `;
}

export async function createItem(item: Omit<Item, 'id' | 'created_at'>) {
  const { user_id, name, icon, type, parent_id, url, order } = item;
  // Ensure parent_id is null if it's 0 or undefined
  const parentId = parent_id || null;
  await sql`
    INSERT INTO items (user_id, name, icon, type, parent_id, url, "order")
    VALUES (${user_id}, ${name}, ${icon}, ${type}, ${parentId}, ${url}, ${order})
  `;
}

export async function getItems(userId: string): Promise<Item[]> {
  const { rows } = await sql<Item>`
    SELECT * FROM items WHERE user_id = ${userId} ORDER BY "order"
  `;
  return rows;
}

export async function updateCategory(categoryId: number, name: string, icon: string, userId: string) {
  await sql`
    UPDATE items
    SET name = ${name}, icon = ${icon}
    WHERE id = ${categoryId} AND type = 'category' AND user_id = ${userId}
  `;
}

// Keep backward compatibility
export async function updateCategoryName(categoryId: number, name: string, userId: string) {
  await sql`
    UPDATE items
    SET name = ${name}
    WHERE id = ${categoryId} AND type = 'category' AND user_id = ${userId}
  `;
}

export async function deleteCategoryAndChildren(categoryId: number, userId: string) {
  // First, get all folders in the category
  const folders = await sql`
    SELECT id FROM items WHERE parent_id = ${categoryId} AND type = 'folder' AND user_id = ${userId}
  `;
  const folderIds = folders.rows.map(f => f.id);

  // Delete all bookmarks in those folders
  if (folderIds.length > 0) {
    for (const folderId of folderIds) {
      await sql`
        DELETE FROM items WHERE parent_id = ${folderId} AND type = 'bookmark' AND user_id = ${userId}
      `;
    }
  }

  // Delete all bookmarks directly in the category
  await sql`
    DELETE FROM items WHERE parent_id = ${categoryId} AND type = 'bookmark' AND user_id = ${userId}
  `;

  // Delete all folders in the category
  await sql`
    DELETE FROM items WHERE parent_id = ${categoryId} AND type = 'folder' AND user_id = ${userId}
  `;

  // Finally, delete the category itself
  await sql`
    DELETE FROM items WHERE id = ${categoryId} AND type = 'category' AND user_id = ${userId}
  `;
}
