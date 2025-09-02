'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
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
  dragDropMode?: boolean,
  categories?: Item[],
}) {
  const { item, onEdit, onDelete, onReorder, isEditing, editedName, onNameChange, onNameBlur, onNameKeyDown, reorderMode, dragDropMode = false, categories = [] } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if this bookmark can be dragged (only if it has a category as parent)
  const isBookmarkInCategory = categories.some(cat => cat.id === item.parent_id);
  const canDrag = dragDropMode && isBookmarkInCategory;
  
  const dndListeners = (reorderMode || canDrag) ? listeners : {};

  return (
    <li ref={setNodeRef} 
        style={canDrag ? { ...style, borderColor: '#E8000A' } : style} 
        {...attributes} {...dndListeners} 
        className={`p-2 rounded flex items-center gap-2 ${
          canDrag ? 'cursor-grab border-2 border-dashed bg-yellow-50 bg-opacity-10' : 
          reorderMode ? 'cursor-move' : 
          'cursor-pointer'
        }`}>
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
          <IconRenderer icon={item.icon} className={`w-4 h-4 flex-shrink-0 ${
            canDrag ? 'text-gray-900' : 'text-white'
          }`} style={canDrag ? { filter: 'drop-shadow(1px 1px 1px #E8000A)' } : {}} />
          {reorderMode || (dragDropMode && canDrag) ? (
            <span 
              className="flex-1 text-gray-900 cursor-move font-semibold"
              title={item.name}
              style={{ textShadow: '1px 1px 1px #E8000A' }}
            >
              {item.name}
            </span>
          ) : (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 text-white hover:text-blue-300 transition-colors"
            >
              {item.name}
            </a>
          )}
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReorder();
              }}
              className={`transition-colors ${
                canDrag ? 'text-gray-900 hover:text-gray-700' : 'text-gray-400 hover:text-white'
              }`}
              style={canDrag ? { filter: 'drop-shadow(1px 1px 1px #E8000A)' } : {}}
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
              className={`transition-colors ${
                canDrag ? 'text-gray-900 hover:text-gray-700' : 'text-gray-400 hover:text-white'
              }`}
              style={canDrag ? { filter: 'drop-shadow(1px 1px 1px #E8000A)' } : {}}
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
              className={`transition-colors ${
                canDrag ? 'text-gray-900 hover:text-gray-700' : 'text-gray-400 hover:text-red-400'
              }`}
              style={canDrag ? { filter: 'drop-shadow(1px 1px 1px #E8000A)' } : {}}
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






function SortableFolder(props: {
  item: Item,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onReorder: () => void,
  onClick: (item: Item) => void,
  reorderMode: boolean,
  dragDropMode?: boolean,
}) {
  const { item, onEdit, onDelete, onReorder, onClick, reorderMode, dragDropMode = false } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // In drag drop mode, folders shouldn't be draggable but can be drop targets
  const dndListeners = (reorderMode && !dragDropMode) ? listeners : {};

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...dndListeners}
      className={`inline-block relative group ${
        dragDropMode ? 'cursor-pointer border-2 border-dashed border-green-400 bg-green-50 bg-opacity-10 rounded-lg p-2' : 
        reorderMode ? 'cursor-move' : 
        'cursor-pointer'
      }`}
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
        <div className={`text-center text-sm break-words ${dragDropMode ? 'text-gray-900 font-semibold' : 'text-white'}`} style={{ width: '100px', ...(dragDropMode && { textShadow: '1px 1px 1px #E8000A' }) }}>
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
        {reorderMode ? (
          <span 
            className="flex-1 text-white truncate text-sm cursor-move"
            title={item.name}
          >
            {item.name}
          </span>
        ) : (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 text-white hover:text-blue-300 transition-colors truncate text-sm"
            title={item.name}
          >
            {item.name}
          </a>
        )}
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importHtml, setImportHtml] = useState('');
  const [importCategory, setImportCategory] = useState<number | null>(null);
  const [parsedImportData, setParsedImportData] = useState<{ folders: ImportItem[], bookmarks: ImportItem[] } | null>(null);
  const [dragDropMode, setDragDropMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  interface ImportItem {
    id: string;
    name: string;
    type: string;
    parent_id: string | null;
    icon: string;
    url?: string;
  }

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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isEditBookmarkModalOpen) setIsEditBookmarkModalOpen(false);
        if (isEditCategoryModalOpen) setIsEditCategoryModalOpen(false);
        if (isEditFolderModalOpen) setIsEditFolderModalOpen(false);
        if (isFolderModalOpen) setIsFolderModalOpen(false);
        if (isDeleteModalOpen) setIsDeleteModalOpen(false);
        if (isIconModalOpen) setIsIconModalOpen(false);
        if (isImportModalOpen) setIsImportModalOpen(false);
        if (dragDropMode) setDragDropMode(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen, isEditBookmarkModalOpen, isEditCategoryModalOpen, isEditFolderModalOpen, isFolderModalOpen, isDeleteModalOpen, isIconModalOpen, isImportModalOpen, dragDropMode]);

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
    // Handle drag drop mode for moving bookmarks to folders
    if (dragDropMode) {
      await handleDragDropModeEnd(event);
      return;
    }

    // Handle category reordering
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
    // Handle drag drop mode for moving bookmarks to folders
    if (dragDropMode) {
      await handleDragDropModeEnd(event);
      return;
    }

    if (!reorderBookmarksMode || !selectedCategory) return;
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find the old and new indices in the full bookmarks array
    const oldIndex = bookmarks.findIndex((item) => item.id === active.id);
    const newIndex = bookmarks.findIndex((item) => item.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      // Use arrayMove on the full bookmarks array
      const newBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
      setBookmarks(newBookmarks);
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
    if (!selectedCategory) return;
    
    try {
      const categoryBookmarks = bookmarks.filter(bookmark => bookmark.parent_id === selectedCategory);
      const res = await fetch('/api/items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: categoryBookmarks }),
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

    // Get only the bookmarks in this folder
    const folderBookmarks = bookmarks.filter(bookmark => bookmark.parent_id === selectedFolder.id);
    const oldIndex = folderBookmarks.findIndex((item) => item.id === active.id);
    const newIndex = folderBookmarks.findIndex((item) => item.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      // Reorder the folder bookmarks
      const reorderedFolderBookmarks = arrayMove(folderBookmarks, oldIndex, newIndex);
      
      // Simple replacement: keep non-folder bookmarks and add reordered folder bookmarks
      const nonFolderBookmarks = bookmarks.filter(bookmark => bookmark.parent_id !== selectedFolder.id);
      const updatedBookmarks = [...nonFolderBookmarks, ...reorderedFolderBookmarks];
      
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

  const handleDragDropModeEnd = async (event: DragEndEvent) => {
    if (!dragDropMode) return;
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Check if we're dropping a bookmark onto a folder
    const draggedBookmark = bookmarks.find(b => b.id === active.id);
    const targetFolder = folders.find(f => f.id === over.id);
    
    if (draggedBookmark && targetFolder) {
      // Only allow moving bookmarks that currently have a category as parent (not already in a folder)
      const isBookmarkInCategory = categories.some(cat => cat.id === draggedBookmark.parent_id);
      
      if (isBookmarkInCategory) {
        try {
          const res = await fetch(`/api/items/${draggedBookmark.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...draggedBookmark,
              parent_id: targetFolder.id,
            }),
          });

          if (res.ok) {
            // Update local state
            setBookmarks(bookmarks.map(bookmark => 
              bookmark.id === draggedBookmark.id 
                ? { ...bookmark, parent_id: targetFolder.id }
                : bookmark
            ));
          } else {
            console.error('Failed to update bookmark parent');
          }
        } catch (error) {
          console.error('Error moving bookmark to folder:', error);
        }
      }
    }
  };

  const parseBookmarkHtml = (html: string): { folders: ImportItem[], bookmarks: ImportItem[] } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const folders: ImportItem[] = [];
    const bookmarks: ImportItem[] = [];

    const processElement = (element: Element, parentId: string | null = null) => {
      // Check if this is a folder (has H3 element)
      const h3 = element.querySelector(':scope > H3');
      if (h3) {
        const folderId = `folder-${Math.random().toString(36).substr(2, 9)}`;
        folders.push({
          id: folderId,
          name: h3.textContent?.trim() || 'Unnamed Folder',
          type: 'folder',
          parent_id: parentId,
          icon: 'fa-solid fa-folder',
        });

        // Process all child elements in this folder
        const childDl = element.querySelector(':scope > DL');
        if (childDl) {
          const childDts = childDl.querySelectorAll(':scope > DT');
          childDts.forEach(childDt => processElement(childDt, folderId));
        }
        return;
      }

      // Check if this is a bookmark (has A element)  
      const a = element.querySelector(':scope > A') as HTMLAnchorElement;
      if (a && a.href) {
        bookmarks.push({
          id: `bookmark-${Math.random().toString(36).substr(2, 9)}`,
          name: a.textContent?.trim() || 'Unnamed Bookmark',
          url: a.href,
          type: 'bookmark',
          parent_id: parentId,
          icon: 'fa-solid fa-bookmark',
        });
      }
    };

    // Find all top-level DT elements and process them
    const allDts = doc.querySelectorAll('DT');
    allDts.forEach(dt => {
      // Only process DTs that are direct children of DL elements
      if (dt.parentElement?.tagName === 'DL') {
        // Check if this DT is a top-level one (not nested inside another folder structure we've already processed)
        let isTopLevel = true;
        let parent: Element | null = dt.parentElement;
        
        while (parent) {
          if (parent.tagName === 'DT' && parent.querySelector('H3')) {
            isTopLevel = false;
            break;
          }
          parent = parent.parentElement;
        }
        
        if (isTopLevel) {
          processElement(dt, null);
        }
      }
    });

    // Also process any standalone bookmarks that might be at the root level
    const rootBookmarks = doc.querySelectorAll('DL > DT > A');
    rootBookmarks.forEach(a => {
      const dt = a.parentElement;
      if (dt && !dt.querySelector('H3')) {
        // This is a bookmark not inside a folder
        bookmarks.push({
          id: `bookmark-${Math.random().toString(36).substr(2, 9)}`,
          name: a.textContent?.trim() || 'Unnamed Bookmark',
          url: a.getAttribute('href') || '',
          type: 'bookmark',
          parent_id: null,
          icon: 'fa-solid fa-bookmark',
        });
      }
    });

    return { folders, bookmarks };
  };

  const handleImportHtmlChange = (value: string) => {
    setImportHtml(value);
    if (value.trim()) {
      try {
        const parsed = parseBookmarkHtml(value);
        setParsedImportData(parsed);
      } catch (error) {
        console.error('Error parsing bookmark HTML:', error);
        setParsedImportData(null);
      }
    } else {
      setParsedImportData(null);
    }
  };

  const handleImportBookmarks = async () => {
    if (!parsedImportData || !importCategory) return;

    setIsImporting(true);
    setImportProgress('Starting import...');

    try {
      const folderIdMap = new Map<string, number>();

      // Update folder logic: folders with parent folders should be moved to category level
      const processedFolders = parsedImportData.folders.map(folder => ({
        ...folder,
        // If a folder has a parent folder, move it to the category level instead
        parent_id: folder.parent_id ? null : folder.parent_id
      }));

      // Batch create folders with Promise.all for parallel processing
      if (processedFolders.length > 0) {
        setImportProgress(`Creating ${processedFolders.length} folders...`);
      }
      
      const folderPromises = processedFolders.map(async (folder) => {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: folder.name,
            type: 'folder',
            icon: folder.icon,
            parent_id: importCategory, // All folders go directly under the category
          }),
        });

        if (res.ok) {
          const newFolder = await res.json();
          return { originalId: folder.id, newId: newFolder.id };
        }
        return null;
      });

      // Wait for all folders to be created
      const folderResults = await Promise.all(folderPromises);
      
      // Build folder ID mapping
      folderResults.forEach(result => {
        if (result) {
          folderIdMap.set(result.originalId, result.newId);
        }
      });

      // Batch create bookmarks with Promise.all in smaller chunks to avoid overwhelming the server
      const chunkSize = 20; // Process 20 bookmarks at a time
      const bookmarkChunks = [];
      
      for (let i = 0; i < parsedImportData.bookmarks.length; i += chunkSize) {
        bookmarkChunks.push(parsedImportData.bookmarks.slice(i, i + chunkSize));
      }

      for (let i = 0; i < bookmarkChunks.length; i++) {
        const chunk = bookmarkChunks[i];
        setImportProgress(`Importing bookmarks: ${(i * chunkSize) + 1}-${Math.min((i + 1) * chunkSize, parsedImportData.bookmarks.length)} of ${parsedImportData.bookmarks.length}`);
        
        const bookmarkPromises = chunk.map(async (bookmark) => {
          const parentId = bookmark.parent_id ? folderIdMap.get(bookmark.parent_id) : importCategory;

          return fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: bookmark.name,
              url: bookmark.url,
              type: 'bookmark',
              icon: bookmark.icon,
              parent_id: parentId || importCategory,
            }),
          });
        });

        // Wait for this chunk to complete before processing the next
        await Promise.all(bookmarkPromises);
        
        // Small delay between chunks to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportProgress('Completing import...');
      
      // Reset form and refresh items
      setIsImportModalOpen(false);
      setImportHtml('');
      setImportCategory(null);
      setParsedImportData(null);
      setIsImporting(false);
      setImportProgress('');
      fetchItems();
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      setImportProgress('Import failed!');
      setIsImporting(false);
      alert('Failed to import bookmarks. Please check the console for details.');
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#36453F' }}>
        <header className="fixed top-0 left-0 w-full flex items-center justify-between h-[85px] p-4 z-10" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #E8000A' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2" 
              style={{ 
                backgroundColor: '#E8000A',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2" 
              style={{ 
                backgroundColor: '#E8000A',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import
            </button>
          </div>
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
                    className="mb-6 p-4 text-white font-bold text-xl flex items-center justify-between"
                    style={{ 
                      background: 'linear-gradient(to right, #E8000A 33%, transparent 33%)',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <IconRenderer 
                        icon={categories.find(cat => cat.id === selectedCategory)?.icon} 
                        className="w-6 h-6 text-white" 
                      />
                      {categories.find(cat => cat.id === selectedCategory)?.name || 'Category'}
                    </div>
                    {!reorderBookmarksMode && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setItemType('bookmark');
                            setParentId(selectedCategory);
                            setIsModalOpen(true);
                          }}
                          className="px-4 py-2 text-white rounded-lg transition-colors hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                          style={{ 
                            backgroundColor: '#E8000A',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                            maxWidth: '200px'
                          }}>
                          + Add New
                        </button>
                        <button 
                          onClick={() => setDragDropMode(!dragDropMode)}
                          className={`px-4 py-2 text-white rounded-lg transition-colors hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                            dragDropMode ? 'ring-2 ring-white ring-opacity-50' : ''
                          }`}
                          style={{ 
                            backgroundColor: dragDropMode ? '#36453F' : '#E8000A',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                            maxWidth: '200px'
                          }}>
                          {dragDropMode ? '✓ Drag Mode' : '↔ Drag Mode'}
                        </button>
                      </div>
                    )}
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
                            dragDropMode={dragDropMode}
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
                      <div className={`grid gap-3 ${reorderBookmarksMode ? 'grid-cols-1' : 'grid-cols-5'}`}>
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
                            dragDropMode={dragDropMode}
                            categories={categories}
                          />
                        ))}
                      </div>
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
          <div 
            className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50"
            onClick={() => setIsEditBookmarkModalOpen(false)}
          >
            <div 
              className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" 
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}
              onClick={(e) => e.stopPropagation()}
            >
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
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50"
            onClick={() => setIsEditCategoryModalOpen(false)}
          >
            <div 
              className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" 
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}
              onClick={(e) => e.stopPropagation()}
            >
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
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50"
            onClick={() => setIsEditFolderModalOpen(false)}
          >
            <div 
              className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" 
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}
              onClick={(e) => e.stopPropagation()}
            >
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
          <div 
            className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50"
            onClick={() => setIsFolderModalOpen(false)}
          >
            <div 
              className="rounded-lg shadow-2xl w-11/12 max-w-[800px] max-h-[80vh] overflow-hidden" 
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}
              onClick={(e) => e.stopPropagation()}
            >
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
                        <div className={`grid gap-3 mb-4 ${reorderFolderBookmarksMode ? 'grid-cols-1' : 'grid-cols-3'}`}>
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
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" 
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}
              onClick={(e) => e.stopPropagation()}
            >
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
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <div 
              className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" 
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}
              onClick={(e) => e.stopPropagation()}
            >
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

        {isImportModalOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50"
            onClick={() => setIsImportModalOpen(false)}
          >
            <div 
              className="p-8 rounded-lg shadow-2xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto" 
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-white">Import Chrome Bookmarks</h2>
              
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">How to Export from Chrome:</h3>
                <ol className="text-gray-300 text-sm space-y-2">
                  <li>1. Open Chrome and click the three dots menu (⋮) in the top right</li>
                  <li>2. Go to <strong>Bookmarks</strong> → <strong>Bookmark manager</strong></li>
                  <li>3. Click the three dots menu in the Bookmark manager</li>
                  <li>4. Select <strong>Export bookmarks</strong></li>
                  <li>5. Save the HTML file to your computer</li>
                  <li>6. Open the saved HTML file in a text editor and copy the contents</li>
                </ol>
              </div>

              <div className="mb-4">
                <label htmlFor="importHtml" className="block text-sm font-medium text-gray-300 mb-2">
                  Paste Chrome Bookmark HTML:
                </label>
                <textarea
                  id="importHtml"
                  value={importHtml}
                  onChange={(e) => handleImportHtmlChange(e.target.value)}
                  className="w-full h-40 p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A] text-xs font-mono"
                  style={{ backgroundColor: '#36453F' }}
                  placeholder="Paste the contents of your exported Chrome bookmark HTML file here..."
                />
              </div>

              <div className="mb-4">
                <label htmlFor="importCategorySelect" className="block text-sm font-medium text-gray-300 mb-2">
                  Import to Category:
                </label>
                <select
                  id="importCategorySelect"
                  value={importCategory || ''}
                  onChange={(e) => setImportCategory(Number(e.target.value))}
                  className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
                  style={{ backgroundColor: '#36453F' }}
                >
                  <option value="">Select a category...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {parsedImportData && (
                <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Preview:</h3>
                  <p className="text-gray-300 text-sm">
                    Found <strong>{parsedImportData.folders.length}</strong> folders and{' '}
                    <strong>{parsedImportData.bookmarks.length}</strong> bookmarks
                  </p>
                </div>
              )}

              {isImporting && (
                <div className="mb-4 p-4 bg-blue-800 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Importing...</h3>
                  <p className="text-blue-200 text-sm">{importProgress}</p>
                  <div className="w-full bg-blue-900 rounded-full h-2 mt-2">
                    <div className="bg-blue-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    if (!isImporting) {
                      setIsImportModalOpen(false);
                      setImportHtml('');
                      setImportCategory(null);
                      setParsedImportData(null);
                      setImportProgress('');
                    }
                  }}
                  disabled={isImporting}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    isImporting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ backgroundColor: '#36453F' }}>
                  Cancel
                </button>
                {parsedImportData && importCategory && !isImporting && (
                  <button
                    onClick={handleImportBookmarks}
                    className="px-6 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#E8000A' }}>
                    Import {parsedImportData.folders.length} Folders and {parsedImportData.bookmarks.length} Bookmarks
                  </button>
                )}
                {isImporting && (
                  <button
                    disabled
                    className="px-6 py-2 text-gray-400 rounded-lg cursor-not-allowed"
                    style={{ backgroundColor: '#555' }}>
                    Importing...
                  </button>
                )}
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
