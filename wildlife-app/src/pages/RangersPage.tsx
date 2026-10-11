import { useEffect, useMemo, useState } from 'react'
import { Phone, Plus, SearchX, ShieldCheck } from 'lucide-react'
import { rangerService } from '../services/rangerService'
import type { Ranger, RangerStatus } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, uniqueOptions } from '../components/FilterBar'
import { Avatar } from '../components/Avatar'
import { StatusBadgeFor } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field, FormActions, SelectInput, TextInput } from '../components/Field'
import { generateId } from '../lib/format'

const rangerStatuses: RangerStatus[] = ['On Field Duty', 'On Patrol', 'On Leave', 'Reserve']

type RangerFormData = Omit<Ranger, 'id'>

const emptyForm: RangerFormData = {
  name: '',
  assignedArea: '',
  contact: '',
  status: 'On Field Duty',
  activeAssignments: 0,
  joinYear: 2026,
  specialization: '',
}

export default function RangersPage() {
  const { data, loading, reload } = useAsyncData(rangerService.getRangers, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Ranger | null>(null)
  const [viewing, setViewing] = useState<Ranger | null>(null)
  const [deleting, setDeleting] = useState<Ranger | null>(null)
  const [busy, setBusy] = useState(false)

  const activeCount = useMemo(() => (data ?? []).filter((r) => r.status.startsWith('On')).length, [data])

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((r) => `${r.name} ${r.assignedArea} ${r.specialization}`.toLowerCase().includes(q))
    if (status !== 'all') list = list.filter((r) => r.status === status)
    return list
  }, [data, search, status])

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (form: RangerFormData) => {
    setBusy(true)
    if (editing) {
      await rangerService.updateRanger(editing.id, form)
      toast.success('Ranger record updated successfully')
    } else {
      await rangerService.createRanger({ ...form, id: generateId('RG-') })
      toast.success('Ranger added successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await rangerService.deleteRanger(deleting.id)
    toast.success('Ranger record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Rangers"
        subtitle="Field personnel assigned to protect and monitor the reserves."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Ranger
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, area or specialization…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Status" options={uniqueOptions(rangerStatuses)} value={status} onChange={setStatus} />
          <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-600">
            <ShieldCheck size={13} />
            {activeCount} rangers on active duty
          </span>
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={6} aspect="aspect-[auto]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No rangers found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((ranger) => (
            <article key={ranger.id} className="group card flex flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start gap-3.5">
                <Avatar label={ranger.name} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[15px] font-semibold text-ink-950">{ranger.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-ink-500">{ranger.assignedArea}</p>
                </div>
                <StatusBadgeFor value={ranger.status} />
              </div>

              <div className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-xs text-ink-600">
                <p className="flex items-center gap-2">
                  <Phone size={13} className="text-ink-400" />
                  {ranger.contact}
                </p>
                <p className="truncate">{ranger.specialization}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
                  Joined {ranger.joinYear} • {ranger.activeAssignments} active assignment{ranger.activeAssignments === 1 ? '' : 's'}
                </p>
              </div>

              <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => setViewing(ranger)}>
                  View
                </button>
                <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => { setEditing(ranger); setFormOpen(true) }}>
                  Edit
                </button>
                <button type="button" className="btn-outline flex-1 border-status-red/20 py-1.5 text-xs text-status-red hover:border-status-red/40 hover:text-status-red" onClick={() => setDeleting(ranger)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <RangerFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <RangerViewModal ranger={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete ranger"
        message={`Remove ${deleting?.name ?? 'this ranger'} from the system? All assignment links will be removed.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface RangerFormModalProps {
  open: boolean
  editing: Ranger | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: RangerFormData) => Promise<void>
}

function RangerFormModal({ open, editing, busy, onClose, onSubmit }: RangerFormModalProps) {
  const [form, setForm] = useState<RangerFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof RangerFormData>(key: K, value: RangerFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Ranger' : 'Add Ranger'} description={editing ? `Updating ${editing.id}` : 'Register a new ranger profile'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name">
            <TextInput required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Raja Pillai" />
          </Field>
          <Field label="Assigned Area">
            <TextInput required value={form.assignedArea} onChange={(e) => update('assignedArea', e.target.value)} placeholder="e.g. Periyar Tiger Reserve – West" />
          </Field>
          <Field label="Contact">
            <TextInput required value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder="+91 …" />
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as RangerStatus)}>
              {rangerStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Active Assignments">
            <TextInput type="number" min={0} value={form.activeAssignments} onChange={(e) => update('activeAssignments', Number(e.target.value))} />
          </Field>
          <Field label="Join Year">
            <TextInput type="number" min={2000} max={2026} value={form.joinYear} onChange={(e) => update('joinYear', Number(e.target.value))} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Specialization">
              <TextInput value={form.specialization} onChange={(e) => update('specialization', e.target.value)} placeholder="e.g. Anti-poaching patrols" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Ranger'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function RangerViewModal({ ranger, onClose }: { ranger: Ranger | null; onClose: () => void }) {
  return (
    <Modal open={ranger !== null} onClose={onClose} title="Ranger Profile" description={ranger ? `${ranger.id} • Ranger record` : ''}>
      {ranger && (
        <div>
          <div className="mb-5 flex items-center gap-4">
            <Avatar label={ranger.name} size="lg" />
            <div>
              <h3 className="font-display text-xl font-semibold text-ink-950">{ranger.name}</h3>
              <StatusBadgeFor value={ranger.status} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Assigned Area" value={ranger.assignedArea} />
            <Detail label="Contact" value={ranger.contact} />
            <Detail label="Specialization" value={ranger.specialization} />
            <Detail label="Join Year" value={String(ranger.joinYear)} />
            <Detail label="Active Assignments" value={String(ranger.activeAssignments)} />
          </dl>
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