import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { rescueOperationService } from '../services/rescueOperationService'
import type { AnimalCondition, RescueOperation, RescueOutcome, RescueStatus } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, uniqueOptions } from '../components/FilterBar'
import { DataTable } from '../components/DataTable'
import { RowActions } from '../components/RowActions'
import { StatusBadgeFor } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { TableSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { WildlifeImage } from '../components/WildlifeImage'
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/Field'
import { formatDate, generateId } from '../lib/format'
import { IMAGES } from '../config/images'

const conditions: AnimalCondition[] = ['Stable', 'Critical', 'Fair', 'Good']
const outcomes: RescueOutcome[] = ['Released', 'Under Treatment', 'Under Observation', 'Transferred', 'Deceased']
const rescueStatuses: RescueStatus[] = ['Ongoing', 'Completed']

type RescueFormData = Omit<RescueOperation, 'id'>

const emptyForm: RescueFormData = {
  animalId: '',
  animalName: '',
  species: '',
  location: '',
  rescueDate: '',
  team: [],
  condition: 'Stable',
  outcome: 'Under Observation',
  status: 'Ongoing',
  notes: '',
}

export default function RescueOperationsPage() {
  const { data, loading, reload } = useAsyncData(rescueOperationService.getRescueOperations, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [condition, setCondition] = useState('all')
  const [status, setStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RescueOperation | null>(null)
  const [viewing, setViewing] = useState<RescueOperation | null>(null)
  const [deleting, setDeleting] = useState<RescueOperation | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((r) => `${r.id} ${r.animalName} ${r.species} ${r.location} ${r.animalId}`.toLowerCase().includes(q))
    if (condition !== 'all') list = list.filter((r) => r.condition === condition)
    if (status !== 'all') list = list.filter((r) => r.status === status)
    return [...list].sort((a, b) => b.rescueDate.localeCompare(a.rescueDate))
  }, [data, search, condition, status])

  const clearFilters = () => {
    setSearch('')
    setCondition('all')
    setStatus('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (form: RescueFormData) => {
    setBusy(true)
    if (editing) {
      await rescueOperationService.updateRescueOperation(editing.id, form)
      toast.success('Rescue operation updated successfully')
    } else {
      await rescueOperationService.createRescueOperation({ ...form, id: generateId('RS-') })
      toast.success('Rescue operation recorded successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await rescueOperationService.deleteRescueOperation(deleting.id)
    toast.success('Rescue operation record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Rescue Operations"
        subtitle="Coordinate wildlife rescue, treatment and release interventions."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Rescue Operation
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by animal, species or location…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Condition" options={uniqueOptions(conditions)} value={condition} onChange={setCondition} />
          <FilterBar label="Status" options={uniqueOptions(rescueStatuses)} value={status} onChange={setStatus} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cells={9} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No rescue operations found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <DataTable columns={['ID', 'Animal', 'Species', 'Location', 'Rescue Date', 'Assigned Team', 'Condition', 'Outcome', 'Status', '']}>
          {filtered.map((rescue) => (
            <tr key={rescue.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{rescue.id}</td>
              <td className="td">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-ink-900">{rescue.animalName}</span>
                  <span className="font-mono text-[10px] text-ink-400">{rescue.animalId}</span>
                </div>
              </td>
              <td className="td">{rescue.species}</td>
              <td className="td">{rescue.location}</td>
              <td className="td font-mono text-xs">{formatDate(rescue.rescueDate)}</td>
              <td className="td max-w-[200px] truncate text-ink-600">{rescue.team.join(', ')}</td>
              <td className="td">
                <StatusBadgeFor value={rescue.condition} />
              </td>
              <td className="td">
                <StatusBadgeFor value={rescue.outcome} />
              </td>
              <td className="td">
                <StatusBadgeFor value={rescue.status} />
              </td>
              <td className="td">
                <RowActions onView={() => setViewing(rescue)} onEdit={() => { setEditing(rescue); setFormOpen(true) }} onDelete={() => setDeleting(rescue)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <RescueFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <RescueViewModal rescue={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete rescue operation"
        message={`Delete ${deleting?.id ?? 'this rescue operation'}? This will permanently remove the record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface RescueFormModalProps {
  open: boolean
  editing: RescueOperation | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: RescueFormData) => Promise<void>
}

function RescueFormModal({ open, editing, busy, onClose, onSubmit }: RescueFormModalProps) {
  const [form, setForm] = useState<RescueFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm({ ...rest, team: [...rest.team] })
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof RescueFormData>(key: K, value: RescueFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Rescue Operation' : 'Add Rescue Operation'} description={editing ? `Updating ${editing.id}` : 'Create a rescue operation record'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Animal ID">
            <TextInput required value={form.animalId} onChange={(e) => update('animalId', e.target.value)} placeholder="e.g. AN-1008" />
          </Field>
          <Field label="Animal Name">
            <TextInput required value={form.animalName} onChange={(e) => update('animalName', e.target.value)} placeholder="e.g. Kari" />
          </Field>
          <Field label="Species">
            <TextInput required value={form.species} onChange={(e) => update('species', e.target.value)} placeholder="e.g. Indian Leopard" />
          </Field>
          <Field label="Location">
            <TextInput required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Mudumalai Transit Road" />
          </Field>
          <Field label="Rescue Date">
            <TextInput type="date" required value={form.rescueDate} onChange={(e) => update('rescueDate', e.target.value)} />
          </Field>
          <Field label="Condition">
            <SelectInput value={form.condition} onChange={(e) => update('condition', e.target.value as AnimalCondition)}>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Outcome">
            <SelectInput value={form.outcome} onChange={(e) => update('outcome', e.target.value as RescueOutcome)}>
              {outcomes.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as RescueStatus)}>
              {rescueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Assigned Team (comma separated)">
            <TextInput value={form.team.join(', ')} onChange={(e) => update('team', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="Dr. Anand, Ranger Arjun, Unit R-4" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Rescue details and follow-up plan…" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Rescue Operation'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function RescueViewModal({ rescue, onClose }: { rescue: RescueOperation | null; onClose: () => void }) {
  return (
    <Modal open={rescue !== null} onClose={onClose} title="Rescue Operation Details" description={rescue ? `${rescue.id} • Rescue case` : ''} wide>
      {rescue && (
        <div>
          <div className="mb-6 aspect-[16/6] overflow-hidden rounded-xl border border-ink-200">
            <WildlifeImage src={IMAGES.rescue} alt={`Rescue operation for ${rescue.animalName}`} className="h-full w-full object-cover" fallbackLabel={rescue.id} />
          </div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{rescue.animalName}</h3>
            <span className="font-mono text-xs text-ink-400">{rescue.animalId}</span>
            <StatusBadgeFor value={rescue.condition} />
            <StatusBadgeFor value={rescue.outcome} />
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Species" value={rescue.species} />
            <Detail label="Location" value={rescue.location} />
            <Detail label="Rescue Date" value={formatDate(rescue.rescueDate)} />
            <Detail label="Status" value={rescue.status} />
            <div className="col-span-2">
              <Detail label="Assigned Team" value={rescue.team.join(', ')} />
            </div>
          </dl>
          {rescue.notes && (
            <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-4">
              <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">Case Notes</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-700">{rescue.notes}</dd>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink-800">{value || '—'}</dd>
    </div>
  )
}