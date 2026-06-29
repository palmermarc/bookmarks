import { IconTrash } from '../icons'
import Overlay from '../Overlay'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => void
  onArchive?: () => void
}

export default function ConfirmModal({ title, message, confirmLabel, onClose, onConfirm, onArchive }: ConfirmModalProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="modal-body" style={{ paddingTop: 24 }}>
        <div className="confirm-icon"><IconTrash size={20} /></div>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-msg">{message}</p>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        {onArchive && (
          <button className="btn" onClick={onArchive}>Archive</button>
        )}
        <button className="btn btn-danger" onClick={onConfirm}>
          {onArchive ? 'Delete forever' : (confirmLabel ?? 'Delete')}
        </button>
      </div>
    </Overlay>
  )
}
