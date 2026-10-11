import { Eye, Pencil, Trash2 } from 'lucide-react'

interface RowActionsProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function RowActions({ onView, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={onView} aria-label="View record" title="View" className="icon-btn">
        <Eye size={16} />
      </button>
      <button type="button" onClick={onEdit} aria-label="Edit record" title="Edit" className="icon-btn">
        <Pencil size={15} />
      </button>
      <button type="button" onClick={onDelete} aria-label="Delete record" title="Delete" className="icon-btn hover:border-status-red/20 hover:bg-status-red/5 hover:text-status-red">
        <Trash2 size={15} />
      </button>
    </div>
  )
}