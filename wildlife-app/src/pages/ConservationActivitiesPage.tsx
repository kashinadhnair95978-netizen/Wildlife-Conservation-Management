import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { conservationActivityService } from '../services/conservationActivityService'
import type { ActivityStatus, ActivityType, ConservationActivity } from '../types'
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
import { Field, FormActions, SelectInput, TextInput } from '../components/Field'
import { formatDate, generateId } from '../lib/format'

const activityTypes: ActivityType[] = ['Habitat Restoration', 'Anti-Poaching Patrol', 'Species Monitoring', 'Tree Plantation', 'Community Awareness', 'Wildlife Rescue', 'Breeding Program']
const activityStatuses: ActivityStatus[] = ['Active', 'Completed', 'Planned', 'On Hold']

type ActivityFormData = Omit<ConservationActivity, 'id'>

const emptyForm: ActivityFormData = {
  name: '',
  type: 'Habitat Restoration',
  area: '',
  responsible: '',
  startDate: '',
  endDate: '',
  progress: 0,
  status: 'Planned',
  budget: '',
}

function ProgressBar({ value, status }: { value: number; status: ActivityStatus }) {
  const color =
    status === 'Completed' ? 'bg-status-emerald' : status === 'On Hold' ? 'bg-status-amber' : status === 'Planned' ? 'bg-ink-300' : 'bg-ink-900'
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-150" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-xs font-medium text-ink-600">{value}%</span>
    </div>
  )
}

export default function ConservationActivitiesPage() {
  const { data, loading, reload } = useAsyncData(conservationActivityService.getActivities, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ConservationActivity | null>(null)
  const [viewing, setViewing] = useState<ConservationActivity | null>(null)
  const [deleting, setDeleting] = useState<ConservationActivity | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((a) => `${a.name} ${a.area} ${a.responsible} ${a.type}`.toLowerCase().includes(q))
    if (type !== 'all') list = list.filter((a) => a.type === type)
    if (status !== 'all') list = list.filter((a) => a.status === status)
    return list
  }, [data, search, type, status])

  const clearFilters = () => {
    setSearch('')
    setType('all')
    setStatus('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (form: ActivityFormData) => {
    setBusy(true)
    if (editing) {
      await conservationActivityService.updateActivity(editing.id, form)
      toast.success('Conservation activity updated successfully')
    } else {
      await conservationActivityService.createActivity({ ...form, id: generateId('AC-') })
      toast.success('Conservation activity added successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await conservationActivityService.deleteActivity(deleting.id)
    toast.success('Activity record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Conservation Activities"
        subtitle="Plan, execute and monitor conservation programs across reserves."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Activity
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search activities by name, area…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Type" options={uniqueOptions(activityTypes)} value={type} onChange={setType} />
          <FilterBar label="Status" options={uniqueOptions(activityStatuses)} value={status} onChange={setStatus} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cells={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No activities found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <DataTable columns={['ID', 'Activity Name', 'Type', 'Area', 'Responsible', 'Start Date', 'End Date', 'Progress', 'Status', 'Budget', '']}>
          {filtered.map((activity) => (
            <tr key={activity.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{activity.id}</td>
              <td className="td font-semibold text-ink-900">{activity.name}</td>
              <td className="td">{activity.type}</td>
              <td className="td">{activity.area}</td>
              <td className="td">{activity.responsible}</td>
              <td className="td font-mono text-xs">{formatDate(activity.startDate)}</td>
              <td className="td font-mono text-xs">{formatDate(activity.endDate)}</td>
              <td className="td">
                <ProgressBar value={activity.progress} status={activity.status} />
              </td>
              <td className="td">
                <StatusBadgeFor value={activity.status} />
              </td>
              <td className="td font-mono text-xs">{activity.budget}</td>
              <td className="td">
                <RowActions onView={() => setViewing(activity)} onEdit={() => { setEditing(activity); setFormOpen(true) }} onDelete={() => setDeleting(activity)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ActivityFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <ActivityViewModal activity={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete conservation activity"
        message={`Delete ${deleting?.name ?? 'this activity'}? This will permanently remove the activity record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface ActivityFormModalProps {
  open: boolean
  editing: ConservationActivity | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: ActivityFormData) => Promise<void>
}

function ActivityFormModal({ open, editing, busy, onClose, onSubmit }: ActivityFormModalProps) {
  const [form, setForm] = useState<ActivityFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof ActivityFormData>(key: K, value: ActivityFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Activity' : 'Add Conservation Activity'} description={editing ? `Updating ${editing.id}` : 'Create a new conservation program'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Activity Name">
            <TextInput required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Periyar Habitat Restoration" />
          </Field>
          <Field label="Type">
            <SelectInput value={form.type} onChange={(e) => update('type', e.target.value as ActivityType)}>
              {activityTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Area">
            <TextInput required value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="e.g. Periyar West Buffer" />
          </Field>
          <Field label="Responsible Ranger / Researcher">
            <TextInput required value={form.responsible} onChange={(e) => update('responsible', e.target.value)} placeholder="e.g. Raja Pillai" />
          </Field>
          <Field label="Start Date">
            <TextInput type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
          </Field>
          <Field label="End Date">
            <TextInput type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
          </Field>
          <Field label="Progress (%)">
            <TextInput type="number" min={0} max={100} value={form.progress} onChange={(e) => update('progress', Number(e.target.value))} />
          </Field>
          <Field label="Budget">
            <TextInput value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="e.g. ₹24,00,000" />
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as ActivityStatus)}>
              {activityStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Activity'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function ActivityViewModal({ activity, onClose }: { activity: ConservationActivity | null; onClose: () => void }) {
  return (
    <Modal open={activity !== null} onClose={onClose} title="Activity Details" description={activity ? `${activity.id} • Conservation program` : ''}>
      {activity && (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{activity.name}</h3>
            <StatusBadgeFor value={activity.status} />
          </div>
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">Progress</span>
              <span className="font-mono text-xs font-semibold text-ink-800">{activity.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-150">
              <div className={`h-full rounded-full ${activity.status === 'Completed' ? 'bg-status-emerald' : 'bg-ink-900'}`} style={{ width: `${activity.progress}%` }} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Type" value={activity.type} />
            <Detail label="Area" value={activity.area} />
            <Detail label="Responsible" value={activity.responsible} />
            <Detail label="Budget" value={activity.budget} />
            <Detail label="Start Date" value={formatDate(activity.startDate)} />
            <Detail label="End Date" value={formatDate(activity.endDate)} />
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