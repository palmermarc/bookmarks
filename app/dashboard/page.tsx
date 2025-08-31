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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndListeners = reorderMode ? listeners : {};

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...dndListeners} 
        className={`p-2 rounded cursor-pointer flex items-center gap-2`}>
      {isEditing ? (
        <input 
          type="text" 
          value={editedName} 
          onChange={onNameChange}
          onBlur={onNameBlur}
          onKeyDown={onNameKeyDown}
          className="bg-gray-700 text-white flex-1"
          autoFocus
        />
      ) : (
        <>
          <IconRenderer icon={item.icon} className="w-4 h-4 text-white flex-shrink-0" />
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 text-white hover:text-blue-300 transition-colors"
          >
            {item.name}
          </a>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReorder();
              }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Reorder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(item);
              }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(item);
              }}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      )}
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

function SortableFolder(props: {
  item: Item,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onReorder: () => void,
  onClick: (item: Item) => void,
  reorderMode: boolean,
}) {
  const { item, onEdit, onDelete, onReorder, onClick, reorderMode } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndListeners = reorderMode ? listeners : {};

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...dndListeners}
      className="inline-block cursor-pointer relative group"
      style={{
        ...style,
        margin: '10px 20px',
        width: '100px',
      }}
      onClick={(e) => {
        // Prevent click when clicking on action buttons
        if ((e.target as HTMLElement).closest('button')) {
          e.stopPropagation();
          return;
        }
        onClick(item);
      }}
    >
      <div className="flex flex-col items-center text-white">
        <div className="flex justify-center items-center" style={{ width: '75px', height: '75px', marginBottom: '5px' }}>
          <IconRenderer icon={item.icon} className="text-white" style={{ width: '50px', height: '50px' }} />
        </div>
        <div className="text-center text-sm break-words" style={{ width: '100px' }}>
          {item.name}
        </div>
        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReorder();
            }}
            className="text-gray-400 hover:text-white transition-colors"
            title="Reorder"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(item);
            }}
            className="text-gray-400 hover:text-white transition-colors"
            title="Edit"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(item);
            }}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function FolderMenu(props: {
  folder: Item,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onReorder: () => void,
  onClose: () => void,
}) {
  const { folder, onEdit, onDelete, onReorder, onClose } = props;
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
      <a href="#" onClick={(e) => { e.preventDefault(); onEdit(folder); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Edit</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onDelete(folder); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Delete</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onReorder(); onClose(); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Reorder</a>
    </div>
  );
}

function SortableFolderBookmarkItem(props: {
  item: Item,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onCloseFolderModal: () => void,
  reorderMode: boolean,
}) {
  const { item, onEdit, onDelete, onCloseFolderModal, reorderMode } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndListeners = reorderMode ? listeners : {};

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...dndListeners}
      className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center gap-2">
        <IconRenderer icon={item.icon} className="w-5 h-5 text-white flex-shrink-0" />
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 text-white hover:text-blue-300 transition-colors truncate text-sm"
          title={item.name}
        >
          {item.name}
        </a>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => {
              onEdit(item);
              onCloseFolderModal();
            }}
            className="text-gray-400 hover:text-white transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => {
              onDelete(item);
              onCloseFolderModal();
            }}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndListeners = reorderMode ? listeners : {};

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...dndListeners} 
        className={`p-2 rounded cursor-pointer flex items-center gap-2 ${selectedCategory === item.id ? 'bg-gray-700' : ''}`}
        onClick={(e) => {
          // Prevent click when clicking on action buttons
          if ((e.target as HTMLElement).closest('button')) {
            e.stopPropagation();
            return;
          }
          setSelectedCategory(item.id);
        }}>
      {isEditing ? (
        <input 
          type="text" 
          value={editedName} 
          onChange={onNameChange}
          onBlur={onNameBlur}
          onKeyDown={onNameKeyDown}
          className="bg-gray-700 text-white flex-1"
          autoFocus
        />
      ) : (
        <>
          <IconRenderer icon={item.icon} className="w-4 h-4 text-white flex-shrink-0" />
          <span className="flex-1">{item.name}</span>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReorder();
              }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Reorder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      )}
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
  const [editingFolder, setEditingFolder] = useState<Item | null>(null);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<Item | null>(null);
  const [reorderFoldersMode, setReorderFoldersMode] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Item | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [reorderFolderBookmarksMode, setReorderFolderBookmarksMode] = useState(false);

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

  const handleEditFolder = (folder: Item) => {
    setEditingFolder(folder);
    setIsEditFolderModalOpen(true);
  };

  const handleDeleteFolder = (folder: Item) => {
    setDeletingFolder(folder);
    setIsDeleteModalOpen(true);
  };

  const handleFolderClick = (folder: Item) => {
    setSelectedFolder(folder);
    setIsFolderModalOpen(true);
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

  const handleUpdateFolder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingFolder) return;

    try {
      const res = await fetch(`/api/items/${editingFolder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingFolder.name,
          parent_id: editingFolder.parent_id,
          icon: editingFolder.icon,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update folder');
      }

      setIsEditFolderModalOpen(false);
      setEditingFolder(null);
      fetchItems();
    } catch (error) {
      console.error("Error updating folder:", error);
      alert('Failed to update folder. Please check the console for details.');
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

  const confirmDeleteFolder = async () => {
    if (!deletingFolder) return;

    try {
      const res = await fetch(`/api/items/${deletingFolder.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete folder');
      }

      setIsDeleteModalOpen(false);
      setDeletingFolder(null);
      fetchItems();
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert('Failed to delete folder. Please check the console for details.');
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

  const handleFolderDragEnd = async (event: DragEndEvent) => {
    if (!reorderFoldersMode) return;
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = folders.findIndex((item) => item.id === active.id);
      const newIndex = folders.findIndex((item) => item.id === over?.id);
      const newOrder = arrayMove(folders, oldIndex, newIndex);
      setFolders(newOrder);
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

  const handleSaveFolderReorder = async () => {
    try {
      const res = await fetch('/api/items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: folders }),
      });

      if (!res.ok) {
        throw new Error('Failed to reorder folders');
      }
      setReorderFoldersMode(false);
    } catch (error) {
      console.error("Error reordering folders:", error);
      alert('Failed to reorder folders. Please check the console for details.');
      fetchItems();
    }
  };

  const handleFolderBookmarkDragEnd = async (event: DragEndEvent) => {
    if (!reorderFolderBookmarksMode || !selectedFolder) return;
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const folderBookmarks = bookmarks.filter(bookmark => bookmark.parent_id === selectedFolder.id);
    const oldIndex = folderBookmarks.findIndex((item) => item.id === active.id);
    const newIndex = folderBookmarks.findIndex((item) => item.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(folderBookmarks, oldIndex, newIndex);
      const updatedBookmarks = bookmarks.map(bookmark => {
        if (bookmark.parent_id === selectedFolder.id) {
          const newOrderItem = newOrder.find(item => item.id === bookmark.id);
          return newOrderItem || bookmark;
        }
        return bookmark;
      });
      setBookmarks(updatedBookmarks);
    }
  };

  const handleSaveFolderBookmarkReorder = async () => {
    if (!selectedFolder) return;
    
    try {
      const folderBookmarks = bookmarks.filter(bookmark => bookmark.parent_id === selectedFolder.id);
      const res = await fetch('/api/items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: folderBookmarks }),
      });

      if (!res.ok) {
        throw new Error('Failed to reorder folder bookmarks');
      }
      setReorderFolderBookmarksMode(false);
    } catch (error) {
      console.error("Error reordering folder bookmarks:", error);
      alert('Failed to reorder folder bookmarks. Please check the console for details.');
      fetchItems();
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#36453F' }}>
        <header className="fixed top-0 left-0 w-full flex items-center justify-between h-[85px] p-4 z-10" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #E8000A' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2" 
            style={{ 
              backgroundColor: '#E8000A',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
            }}>
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
                  <div 
                    className="mb-6 p-4 text-white font-bold text-xl flex items-center gap-3"
                    style={{ 
                      background: 'linear-gradient(to right, #E8000A 33%, transparent 33%)',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    <IconRenderer 
                      icon={categories.find(cat => cat.id === selectedCategory)?.icon} 
                      className="w-6 h-6 text-white" 
                    />
                    {categories.find(cat => cat.id === selectedCategory)?.name || 'Category'}
                  </div>
                  <div className="mb-4">
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleFolderDragEnd}>
                      <SortableContext items={folders.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        {folders.filter(item => item.parent_id === selectedCategory).map(folder => (
                          <SortableFolder
                            key={folder.id}
                            item={folder}
                            onEdit={handleEditFolder}
                            onDelete={handleDeleteFolder}
                            onReorder={() => setReorderFoldersMode(true)}
                            onClick={handleFolderClick}
                            reorderMode={reorderFoldersMode}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    {reorderFoldersMode && (
                      <button 
                        onClick={handleSaveFolderReorder}
                        className="w-full mt-4 px-4 py-2 text-white rounded-lg transition-colors" 
                        style={{ backgroundColor: '#E8000A' }}>
                        Save Folder Order
                      </button>
                    )}
                  </div>
                  {folders.filter(item => item.parent_id === selectedCategory).length > 0 && 
                   bookmarks.filter(item => item.parent_id === selectedCategory).length > 0 && (
                    <hr className="my-4" />
                  )}
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleBookmarkDragEnd}>
                    <SortableContext items={bookmarks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      {bookmarks.filter(item => item.parent_id === selectedCategory).map(bookmark => (
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
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
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
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
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

        {isEditFolderModalOpen && editingFolder && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
              <h2 className="text-xl font-bold mb-4 text-white">Edit Folder</h2>
              <form onSubmit={handleUpdateFolder}>
                <div className="mb-4">
                  <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    id="folderName"
                    value={editingFolder.name}
                    onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                    required
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="folderCategory" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    id="folderCategory"
                    value={editingFolder.parent_id || ''}
                    onChange={(e) => setEditingFolder({ ...editingFolder, parent_id: Number(e.target.value) })}
                    required
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                    style={{ backgroundColor: '#36453F' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="folderIcon" className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A] flex items-center gap-2"
                    style={{ backgroundColor: '#36453F' }}
                  >
                    {editingFolder.icon ? (
                      <>
                        <IconRenderer icon={editingFolder.icon} className="w-4 h-4 text-white" />
                        <span>{editingFolder.icon}</span>
                      </>
                    ) : (
                      <span>Select Icon</span>
                    )}
                  </button>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditFolderModalOpen(false)}
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

        {isFolderModalOpen && selectedFolder && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="rounded-lg shadow-2xl w-11/12 max-w-[800px] max-h-[80vh] overflow-hidden" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
              <div 
                className="p-4 text-white font-bold text-xl"
                style={{ 
                  background: 'linear-gradient(to right, #E8000A 33%, transparent 33%)',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <IconRenderer 
                      icon={selectedFolder.icon} 
                      className="w-6 h-6 text-white" 
                    />
                    <span>{selectedFolder.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {bookmarks.filter(bookmark => bookmark.parent_id === selectedFolder.id).length > 1 && (
                      <button
                        onClick={() => setReorderFolderBookmarksMode(!reorderFolderBookmarksMode)}
                        className={`text-white hover:text-gray-300 transition-colors ${reorderFolderBookmarksMode ? 'text-[#E8000A]' : ''}`}
                        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                        title={reorderFolderBookmarksMode ? 'Exit Reorder Mode' : 'Reorder Bookmarks'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setIsFolderModalOpen(false)}
                      className="text-white hover:text-gray-300 text-2xl leading-none"
                      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {bookmarks.filter(bookmark => bookmark.parent_id === selectedFolder.id).length > 0 ? (
                  <>
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleFolderBookmarkDragEnd}>
                      <SortableContext items={bookmarks.filter(bookmark => bookmark.parent_id === selectedFolder.id).map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {bookmarks.filter(bookmark => bookmark.parent_id === selectedFolder.id).map(bookmark => (
                            <SortableFolderBookmarkItem
                              key={bookmark.id}
                              item={bookmark}
                              onEdit={handleEditBookmark}
                              onDelete={handleDeleteBookmark}
                              onCloseFolderModal={() => setIsFolderModalOpen(false)}
                              reorderMode={reorderFolderBookmarksMode}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {reorderFolderBookmarksMode && (
                      <div className="flex justify-center mb-4">
                        <button
                          onClick={handleSaveFolderBookmarkReorder}
                          className="px-4 py-2 text-white rounded-lg transition-colors"
                          style={{ backgroundColor: '#E8000A' }}
                        >
                          Save Order
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400 py-8 mb-4">
                    <p>No bookmarks in this folder yet.</p>
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setIsFolderModalOpen(false);
                      setItemType('bookmark');
                      setParentId(selectedFolder.id);
                      setIsModalOpen(true);
                    }}
                    className="py-3 px-4 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    style={{ 
                      backgroundColor: '#E8000A',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                      width: '400px'
                    }}
                  >
                    + Add a Bookmark to this folder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
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
                    onClick={() => {
                      setName('');
                      setItemType('bookmark');
                      setParentId(null);
                      setSelectedIcon('');
                      setUrl('');
                      setIsModalOpen(false);
                    }}
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

        {isDeleteModalOpen && (deletingCategory || deletingBookmark || deletingFolder) && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
              <h2 className="text-xl font-bold mb-4 text-white">Delete {deletingCategory ? 'Category' : deletingFolder ? 'Folder' : 'Bookmark'}</h2>
              <p className="text-white mb-4">Are you sure you want to delete the {deletingCategory ? 'category' : deletingFolder ? 'folder' : 'bookmark'} &quot;{deletingCategory?.name || deletingFolder?.name || deletingBookmark?.name}&quot;? {deletingCategory && 'This will remove all folders and bookmarks within this category.'} {deletingFolder && 'This will remove all bookmarks within this folder.'}</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingCategory(null);
                    setDeletingBookmark(null);
                    setDeletingFolder(null);
                  }}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#36453F' }}>
                  No
                </button>
                <button
                  onClick={deletingCategory ? confirmDeleteCategory : deletingFolder ? confirmDeleteFolder : confirmDeleteBookmark}
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
            } else if (editingFolder) {
              setEditingFolder({ ...editingFolder, icon: icon });
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
