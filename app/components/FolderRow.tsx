import { AppFolder } from '@/lib/adapter'
import { IconFolder, IconEdit, IconTrash, IconChevron } from './icons'

interface FolderRowProps {
  folder: AppFolder
  count: number
  onOpen: (folder: AppFolder) => void
  onEdit: (folder: AppFolder) => void
  onDelete: (folder: AppFolder) => void
}

export default function FolderRow({ folder, count, onOpen, onEdit, onDelete }: FolderRowProps) {
  return (
    <div className="folder-row" onClick={() => onOpen(folder)}>
      <span className="folder-ic"><IconFolder size={17} /></span>
      <span className="folder-name">{folder.name}</span>
      <span className="folder-count">{count} {count === 1 ? 'bookmark' : 'bookmarks'}</span>
      <span className="row-actions">
        <button className="icon-btn" title="Rename" onClick={(e) => { e.stopPropagation(); onEdit(folder) }}>
          <IconEdit size={15} />
        </button>
        <button className="icon-btn" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(folder) }}>
          <IconTrash size={15} />
        </button>
      </span>
      <span className="folder-go"><IconChevron size={15} /></span>
    </div>
  )
}
