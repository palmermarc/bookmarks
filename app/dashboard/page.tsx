'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import IconSelectorModal from '@/app/components/IconSelectorModal'
import IconRenderer from '@/app/components/IconRenderer'
import { Item } from '@/lib/definitions';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBookmarkItem(props: { 
  item: Item, 
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onReorder: () => void,
  isEditing: boolean,
  editedName: string,
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onNameBlur: () => void,
  onNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
  reorderMode: boolean,
}) {
  const { item, onEdit, onDelete, onReorder, isEditing, editedName, onNameChange, onNameBlur, onNameKeyDown, reorderMode } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndListeners = reorderMode ? listeners : {};

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...dndListeners} 
        className={`p-2 rounded cursor-pointer flex justify-between items-center`}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuPosition({ top: e.clientY, left: e.clientX });
          setIsMenuOpen(true);
        }}>
      {isEditing ? (
        <input 
          type="text" 
          value={editedName} 
          onChange={onNameChange}
          onBlur={onNameBlur}
          onKeyDown={onNameKeyDown}
          className="bg-gray-700 text-white w-full"
          autoFocus
        />
      ) : (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <IconRenderer icon={item.icon} className="w-4 h-4 text-white" />
          <span>{item.name}</span>
        </a>
      )}
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setMenuPosition(null); setIsMenuOpen(!isMenuOpen); }} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        {isMenuOpen && (
          <BookmarkMenu 
            bookmark={item} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onReorder={onReorder}
            onClose={() => {
              setIsMenuOpen(false);
              setMenuPosition(null);
            }}
            position={menuPosition}
          />
        )}
      </div>
    </li>
  );
}

function BookmarkMenu(props: { 
  bookmark: Item,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onReorder: () => void,
  onClose: () => void,
  position: { top: number, left: number } | null,
}) {
  const { bookmark, onEdit, onDelete, onReorder, onClose, position } = props;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const style = position
    ? { top: position.top, left: position.left, position: 'fixed' as const }
    : { right: 0, marginTop: '0.5rem', position: 'absolute' as const };

  return (
    <div ref={menuRef} style={style} className={`w-48 bg-gray-800 rounded-md shadow-lg z-20`}>
      <a href="#" onClick={(e) => { e.preventDefault(); onEdit(bookmark); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Edit</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onDelete(bookmark); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Delete</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onReorder(); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Reorder</a>
    </div>
  );
}


function CategoryMenu(props: { 
  category: Item,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onReorder: () => void,
  onClose: () => void,
}) {
  const { category, onEdit, onDelete, onReorder, onClose } = props;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20">
      <a href="#" onClick={(e) => { e.preventDefault(); onEdit(category); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Edit</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onDelete(category); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Delete</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onReorder(); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Reorder</a>
    </div>
  );
}

function SortableItem(props: { 
  item: Item, 
  selectedCategory: number | null, 
  setSelectedCategory: (id: number) => void,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onReorder: () => void,
  isEditing: boolean,
  editedName: string,
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onNameBlur: () => void,
  onNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
  reorderMode: boolean,
}) {
  const { item, selectedCategory, setSelectedCategory, onEdit, onDelete, onReorder, isEditing, editedName, onNameChange, onNameBlur, onNameKeyDown, reorderMode } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndListeners = reorderMode ? listeners : {};

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...dndListeners} 
        className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedCategory === item.id ? 'bg-gray-700' : ''}`}
        onClick={() => setSelectedCategory(item.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedCategory(item.id);
          setIsMenuOpen(true);
        }}>
      {isEditing ? (
        <input 
          type="text" 
          value={editedName} 
          onChange={onNameChange}
          onBlur={onNameBlur}
          onKeyDown={onNameKeyDown}
          className="bg-gray-700 text-white w-full"
          autoFocus
        />
      ) : (
        <div className="flex items-center gap-2">
          <IconRenderer icon={item.icon} className="w-4 h-4 text-white" />
          <span>{item.name}</span>
        </div>
      )}
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        {isMenuOpen && (
          <CategoryMenu 
            category={item} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onReorder={onReorder}
            onClose={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </li>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [itemType, setItemType] = useState<'bookmark' | 'folder' | 'category'>('bookmark');
  const [parentId, setParentId] = useState<number | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Item[]>([]);
  const [folders, setFolders] = useState<Item[]>([]);
  const [bookmarks, setBookmarks] = useState<Item[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Item | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderBookmarksMode, setReorderBookmarksMode] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Item | null>(null);
  const [isEditBookmarkModalOpen, setIsEditBookmarkModalOpen] = useState(false);
  const [deletingBookmark, setDeletingBookmark] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Item | null>(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/items');
    if (res.ok) {
      const data = await res.json();
      const cats = data.filter((item: Item) => item.type === 'category');
      setCategories(cats);
      setFolders(data.filter((item: Item) => item.type === 'folder'));
      setBookmarks(data.filter((item: Item) => item.type === 'bookmark'));
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
    if (status === 'authenticated') {
      fetchItems();
    }
  }, [status, router, fetchItems]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null;
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalParentId = parentId;
    const finalType = itemType;

    try {
      if (itemType === 'folder') {
        if (categories.length === 0) {
          // Create a default category first
          const newCategory = {
            name: 'General',
            icon: 'fa-solid fa-folder',
            type: 'category',
            parent_id: null,
          };
          const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCategory),
          });
          if (!res.ok) throw new Error('Failed to create default category');
          alert('We created a default category named &quot;General&quot;. Please select it and submit again.');
          fetchItems();
          setIsModalOpen(false);
          return;
        }
      }

      const newItem: Partial<Item> = {
        name,
        icon: selectedIcon,
        type: finalType,
        parent_id: finalParentId,
      };

      if (itemType === 'bookmark') {
        newItem.url = url;
      }

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!res.ok) {
        throw new Error('Failed to save item');
      }

      setName('');
      setItemType('bookmark');
      setParentId(null);
      setSelectedIcon('');
      setUrl('');
      setIsModalOpen(false);
      fetchItems();

    } catch (error) {
      console.error("Error saving document:", error);
      alert('Failed to save data. Please check the console for details.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!reorderMode) return;
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over?.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      setCategories(newOrder);
    }
  };

  const handleBookmarkDragEnd = async (event: DragEndEvent) => {
    if (!reorderBookmarksMode) return;
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = bookmarks.findIndex((item) => item.id === active.id);
      const newIndex = bookmarks.findIndex((item) => item.id === over?.id);
      const newOrder = arrayMove(bookmarks, oldIndex, newIndex);
      setBookmarks(newOrder);
    }
  };

  const handleEditCategory = (category: Item) => {
    setEditingCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Item) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleEditBookmark = (bookmark: Item) => {
    setEditingBookmark(bookmark);
    setIsEditBookmarkModalOpen(true);
  };

  const handleDeleteBookmark = (bookmark: Item) => {
    setDeletingBookmark(bookmark);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCategory.name,
          icon: editingCategory.icon,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update category');
      }

      setIsEditCategoryModalOpen(false);
      setEditingCategory(null);
      fetchItems();
    } catch (error) {
      console.error("Error updating category:", error);
      alert('Failed to update category. Please check the console for details.');
    }
  };

  const handleUpdateCategoryName = async () => {
    if (!editingCategoryId) return;

    try {
      const res = await fetch(`/api/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedCategoryName }),
      });

      if (!res.ok) {
        throw new Error('Failed to update category');
      }

      setEditingCategoryId(null);
      fetchItems();
    } catch (error) {
      console.error("Error updating category:", error);
      alert('Failed to update category. Please check the console for details.');
    }
  };

  const handleUpdateBookmark = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBookmark) return;

    try {
      const res = await fetch(`/api/items/${editingBookmark.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingBookmark.name,
          parent_id: editingBookmark.parent_id,
          icon: editingBookmark.icon,
          url: editingBookmark.url,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update bookmark');
      }

      setIsEditBookmarkModalOpen(false);
      setEditingBookmark(null);
      fetchItems();
    } catch (error) {
      console.error("Error updating bookmark:", error);
      alert('Failed to update bookmark. Please check the console for details.');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete category');
      }

      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      fetchItems();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert('Failed to delete category. Please check the console for details.');
    }
  };

  const confirmDeleteBookmark = async () => {
    if (!deletingBookmark) return;

    try {
      const res = await fetch(`/api/items/${deletingBookmark.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete bookmark');
      }

      setIsDeleteModalOpen(false);
      setDeletingBookmark(null);
      fetchItems();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert('Failed to delete bookmark. Please check the console for details.');
    }
  };

  const handleSaveReorder = async () => {
    try {
      const res = await fetch('/api/items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: categories }),
      });

      if (!res.ok) {
        throw new Error('Failed to reorder items');
      }
      setReorderMode(false);
    } catch (error) {
      console.error("Error reordering items:", error);
      alert('Failed to reorder items. Please check the console for details.');
      fetchItems();
    }
  };

  const handleSaveBookmarkReorder = async () => {
    try {
      const res = await fetch('/api/items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: bookmarks }),
      });

      if (!res.ok) {
        throw new Error('Failed to reorder bookmarks');
      }
      setReorderBookmarksMode(false);
    } catch (error) {
      console.error("Error reordering bookmarks:", error);
      alert('Failed to reorder bookmarks. Please check the console for details.');
      fetchItems();
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#36453F' }}>
        <header className="fixed top-0 left-0 w-full flex items-center justify-between h-[85px] p-4 z-10" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #E8000A' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{ backgroundColor: '#E8000A' }}>
            New
          </button>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="User profile"
              width={48}
              height={48}
              className="rounded-full border-2 border-[#E8000A]"
            />
          )}
        </header>
        
        <main className="flex-1 flex mt-[85px]">
          <div className="w-1/5 p-4 border-r border-gray-700">
            <h2 className="text-white text-lg font-bold mb-4">Categories</h2>
            <ul>
              <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {categories.map(category => (
                  <SortableItem 
                    key={category.id} 
                    item={category} 
                    selectedCategory={selectedCategory} 
                    setSelectedCategory={setSelectedCategory}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onReorder={() => setReorderMode(true)}
                    isEditing={editingCategoryId === category.id}
                    editedName={editedCategoryName}
                    onNameChange={(e) => setEditedCategoryName(e.target.value)}
                    onNameBlur={handleUpdateCategoryName}
                    onNameKeyDown={(e) => e.key === 'Enter' && handleUpdateCategoryName()}
                    reorderMode={reorderMode}
                  />
                ))}
              </SortableContext>
            </ul>
            {reorderMode && (
              <button 
                onClick={handleSaveReorder}
                className="w-full mt-4 px-4 py-2 text-white rounded-lg transition-colors" 
                style={{ backgroundColor: '#E8000A' }}>
                Save Order
              </button>
            )}
          </div>
          <div className="w-4/5 p-4">
            <div className="w-full">
              {selectedCategory && (
                <>
                  {folders.filter(item => item.parent_id === selectedCategory).map(folder => (
                    <div key={folder.id} className="text-white p-2 border-b border-gray-700">
                      {folder.name}
                    </div>
                  ))}
                  <hr className="my-4" />
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleBookmarkDragEnd}>
                    <SortableContext items={bookmarks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      {bookmarks.filter(item => {
                        const parentFolder = folders.find(f => f.id === item.parent_id);
                        return item.parent_id === selectedCategory || parentFolder?.parent_id === selectedCategory;
                      }).map(bookmark => (
                        <SortableBookmarkItem
                          key={bookmark.id}
                          item={bookmark}
                          onEdit={handleEditBookmark}
                          onDelete={handleDeleteBookmark}
                          onReorder={() => setReorderBookmarksMode(true)}
                          isEditing={editingBookmark?.id === bookmark.id}
                          editedName={editingBookmark?.name || ''}
                          onNameChange={(e) => setEditingBookmark(b => b && ({ ...b, name: e.target.value }))}
                          onNameBlur={() => {}}
                          onNameKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          reorderMode={reorderBookmarksMode}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  {reorderBookmarksMode && (
                    <button 
                      onClick={handleSaveBookmarkReorder}
                      className="w-full mt-4 px-4 py-2 text-white rounded-lg transition-colors max-2-wxs:w-full" 
                      style={{ backgroundColor: '#E8000A' }}>
                      Save Order
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {isEditBookmarkModalOpen && editingBookmark && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
              <h2 className="text-xl font-bold mb-4 text-white">Edit Bookmark</h2>
              <form onSubmit={handleUpdateBookmark}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={editingBookmark.name}
                    onChange={(e) => setEditingBookmark({ ...editingBookmark, name: e.target.value })}
                    required
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-300 mb-1">Category/Folder</label>
                  <select
                    id="parentId"
                    value={editingBookmark.parent_id || ''}
                    onChange={(e) => setEditingBookmark({ ...editingBookmark, parent_id: Number(e.target.value) })}
                    required
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  >
                    <option value="">Select Parent</option>
                    {[...categories, ...folders].map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.type})</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                  <input
                    type="url"
                    id="url"
                    value={editingBookmark.url || ''}
                    onChange={(e) => setEditingBookmark({ ...editingBookmark, url: e.target.value })}
                    required
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  >
                    {editingBookmark.icon ? editingBookmark.icon : 'Select Icon'}
                  </button>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditBookmarkModalOpen(false)}
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#36453F' }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#E8000A' }}>
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditCategoryModalOpen && editingCategory && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
              <h2 className="text-xl font-bold mb-4 text-white">Edit Category</h2>
              <form onSubmit={handleUpdateCategory}>
                <div className="mb-4">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    id="categoryName"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    required
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="categoryIcon" className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A] flex items-center gap-2"
                    style={{ backgroundColor: '#36453F' }}
                  >
                    {editingCategory.icon ? (
                      <>
                        <IconRenderer icon={editingCategory.icon} className="w-4 h-4 text-white" />
                        <span>{editingCategory.icon}</span>
                      </>
                    ) : (
                      <span>Select Icon</span>
                    )}
                  </button>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditCategoryModalOpen(false)}
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#36453F' }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#E8000A' }}>
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
              <h2 className="text-xl font-bold mb-4 text-white">Create New</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label htmlFor="itemType" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    id="itemType"
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as 'bookmark' | 'folder' | 'category')}
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  >
                    <option value="bookmark">Bookmark</option>
                    <option value="folder">Folder</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  />
                </div>

                {itemType === 'bookmark' && (
                  <div className="mb-4">
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                      style={{ backgroundColor: '#36453F' }}
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  >
                    {selectedIcon ? selectedIcon : 'Select Icon'}
                  </button>
                </div>

                {(itemType === 'bookmark' || itemType === 'folder') && (
                  <div className="mb-4">
                    <label htmlFor="parentId" className="block text-sm font-medium text-gray-300 mb-1">
                      {itemType === 'bookmark' ? 'Category/Folder' : 'Category'}
                    </label>
                    <select
                      id="parentId"
                      value={parentId || ''}
                      onChange={(e) => setParentId(Number(e.target.value))}
                      required
                      className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                      style={{ backgroundColor: '#36453F' }}
                    >
                      <option value="">Select Parent</option>
                      {itemType === 'folder' && categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      {itemType === 'bookmark' && [...categories, ...folders].map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.type})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#36453F' }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#E8000A' }}>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (deletingCategory || deletingBookmark) && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
              <h2 className="text-xl font-bold mb-4 text-white">Delete {deletingCategory ? 'Category' : 'Bookmark'}</h2>
              <p className="text-white mb-4">Are you sure you want to delete the {deletingCategory ? 'category' : 'bookmark'} &quot;{deletingCategory?.name || deletingBookmark?.name}&quot;? {deletingCategory && 'This will remove all folders and bookmarks within this category.'}</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#36453F' }}>
                  No
                </button>
                <button
                  onClick={deletingCategory ? confirmDeleteCategory : confirmDeleteBookmark}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#E8000A' }}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        <IconSelectorModal
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          onSelectIcon={(icon) => {
            if (editingBookmark) {
              setEditingBookmark({ ...editingBookmark, icon: icon });
            } else if (editingCategory) {
              setEditingCategory({ ...editingCategory, icon: icon });
            } else {
              setSelectedIcon(icon);
            }
            setIsIconModalOpen(false);
          }}
        />
      </div>
    </DndContext>
  )
}
