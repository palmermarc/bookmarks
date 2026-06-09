import { Item } from './definitions'

export interface AppCategory {
  id: string
  dbId: number
  name: string
  color: number
  icon?: string
}

export interface AppFolder {
  id: string
  dbId: number
  name: string
  categoryId: string | null
  dbParentId: number | null
  icon?: string
}

export interface AppBookmark {
  id: string
  dbId: number
  title: string
  url: string
  folderId: string | null
  categoryId: string | null
  dbParentId: number | null
  tags: string[]
  fav: boolean
  addedDaysAgo: number
  icon?: string
}

export interface AppTag {
  id: string
  label: string
  hue: number
}

export interface AppData {
  categories: AppCategory[]
  folders: AppFolder[]
  bookmarks: AppBookmark[]
  tags: AppTag[]
}

export type ViewState =
  | { type: 'all' }
  | { type: 'fav' }
  | { type: 'recent' }
  | { type: 'category'; id: string }
  | { type: 'folder'; id: string }
  | { type: 'tag'; id: string }

export type SortOption = 'manual' | 'recent' | 'az' | 'za' | 'domain' | 'fav'
export type ItemKind = 'bookmark' | 'folder' | 'category'

export interface EditDraft {
  kind: ItemKind
  id?: string
  title?: string
  url?: string
  name?: string
  icon?: string
  parent?: string
  tags?: string[]
  fav?: boolean
  categoryId?: string
  color?: number
}

export interface DeleteTarget {
  kind: ItemKind
  id: string
  dbId: number
  name: string
}

export type ModalState =
  | null
  | { kind: 'edit'; draft: EditDraft }
  | { kind: 'import' }
  | { kind: 'confirm'; target: DeleteTarget }

export function adaptItems(items: Item[]): AppData {
  const rawCats = items.filter(i => i.type === 'category')
  const rawFolders = items.filter(i => i.type === 'folder')
  const rawBookmarks = items.filter(i => i.type === 'bookmark')

  const folderIds = new Set(rawFolders.map(f => f.id))

  const categories: AppCategory[] = rawCats.map(c => ({
    id: `c_${c.id}`,
    dbId: c.id,
    name: c.name,
    color: 0,
    icon: c.icon ?? '',
  }))

  const folders: AppFolder[] = rawFolders.map(f => ({
    id: `f_${f.id}`,
    dbId: f.id,
    name: f.name,
    categoryId: f.parent_id !== null ? `c_${f.parent_id}` : null,
    dbParentId: f.parent_id,
    icon: f.icon ?? '',
  }))

  const now = Date.now()
  const bookmarks: AppBookmark[] = rawBookmarks.map(b => {
    const parentIsFolder = b.parent_id !== null && folderIds.has(b.parent_id)
    const addedDaysAgo = b.created_at
      ? Math.floor((now - new Date(b.created_at).getTime()) / 86_400_000)
      : 0
    return {
      id: `b_${b.id}`,
      dbId: b.id,
      title: b.name,
      url: b.url ?? '',
      folderId: parentIsFolder ? `f_${b.parent_id}` : null,
      categoryId: !parentIsFolder && b.parent_id !== null ? `c_${b.parent_id}` : null,
      dbParentId: b.parent_id,
      tags: [],
      fav: b.fav ?? false,
      addedDaysAgo,
      icon: b.icon ?? undefined,
    }
  })

  return { categories, folders, bookmarks, tags: [] }
}

export function resolveParentId(parent: string | undefined, data: AppData): number | null {
  if (!parent) return null
  if (parent.startsWith('c:')) {
    const catId = parent.slice(2)
    return data.categories.find(c => c.id === catId)?.dbId ?? null
  }
  if (parent.startsWith('f:')) {
    const folId = parent.slice(2)
    return data.folders.find(f => f.id === folId)?.dbId ?? null
  }
  return null
}
