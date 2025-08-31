
export interface Item {
  id: number;
  user_id: string;
  name: string;
  icon: string;
  type: 'category' | 'folder' | 'bookmark';
  parent_id: number | null;
  created_at: string;
  url?: string;
  order: number;
}
