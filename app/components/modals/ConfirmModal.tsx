import { IconTrash } from '../icons'
import Overlay from '../Overlay'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmModal({ title, message, confirmLabel, onClose, onConfirm }: ConfirmModalProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="modal-body" style={{ paddingTop: 24 }}>
        <div className="confirm-icon"><IconTrash size={20} /></div>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-msg">{message}</p>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel ?? 'Delete'}</button>
      </div>
    </Overlay>
  )
}
