import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { animalHealthService } from '../services/animalHealthService'
import type { AnimalHealth, HealthCondition } from '../types'
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
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/Field'
import { formatDate, generateId } from '../lib/format'

const conditions: HealthCondition[] = ['Healthy', 'Under Treatment', 'Recovering', 'Critical', 'Under Observation']

type HealthFormData = Omit<AnimalHealth, 'id'>

const emptyForm: HealthFormData = {
  animalId: '',
  species: '',
  examinationDate: '',
  veterinarian: '',
  condition: 'Healthy',
  treatment: '',
  medication: '',
  followUpDate: '',
  notes: '',
}

export default function AnimalHealthPage() {
  const { data, loading, reload } = useAsyncData(animalHealthService.getHealthRecords, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [condition, setCondition] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AnimalHealth | null>(null)
  const [viewing, setViewing] = useState<AnimalHealth | null>(null)
  const [deleting, setDeleting] = useState<AnimalHealth | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((h) => `${h.animalId} ${h.species} ${h.veterinarian} ${h.treatment} ${h.medication}`.toLowerCase().includes(q))
    if (condition !== 'all') list = list.filter((h) => h.condition === condition)
    return [...list].sort((a, b) => b.examinationDate.localeCompare(a.examinationDate))
  }, [data, search, condition])

  const clearFilters = () => {
    setSearch('')
    setCondition('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (form: HealthFormData) => {
    setBusy(true)
    if (editing) {
      await animalHealthService.updateHealthRecord(editing.id, form)
      toast.success('Health record updated successfully')
    } else {
      await animalHealthService.createHealthRecord({ ...form, id: generateId('HT-') })
      toast.success('Health record added successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await animalHealthService.deleteHealthRecord(deleting.id)
    toast.success('Health record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Animal Health"
        subtitle="Veterinary examination and treatment records for monitored animals."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Health Record
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by animal, veterinarian, treatment…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Condition" options={uniqueOptions(conditions)} value={condition} onChange={setCondition} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cells={10} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No health records found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <DataTable columns={['Record ID', 'Animal ID', 'Species', 'Examination Date', 'Veterinarian', 'Condition', 'Treatment', 'Medication', 'Follow-up', '']}>
          {filtered.map((record) => (
            <tr key={record.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{record.id}</td>
              <td className="td font-mono text-xs">{record.animalId}</td>
              <td className="td font-semibold text-ink-900">{record.species}</td>
              <td className="td font-mono text-xs">{formatDate(record.examinationDate)}</td>
              <td className="td">{record.veterinarian}</td>
              <td className="td">
                <StatusBadgeFor value={record.condition} />
              </td>
              <td className="td max-w-[200px] truncate">{record.treatment}</td>
              <td className="td max-w-[180px] truncate text-ink-600">{record.medication}</td>
              <td className="td font-mono text-xs">{formatDate(record.followUpDate)}</td>
              <td className="td">
                <RowActions onView={() => setViewing(record)} onEdit={() => { setEditing(record); setFormOpen(true) }} onDelete={() => setDeleting(record)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <HealthFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <HealthViewModal record={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete health record"
        message={`Delete ${deleting?.id ?? 'this health record'}? This will permanently remove the veterinary record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface HealthFormModalProps {
  open: boolean
  editing: AnimalHealth | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: HealthFormData) => Promise<void>
}

function HealthFormModal({ open, editing, busy, onClose, onSubmit }: HealthFormModalProps) {
  const [form, setForm] = useState<HealthFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof HealthFormData>(key: K, value: HealthFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Health Record' : 'Add Health Record'} description={editing ? `Updating ${editing.id}` : 'Create a new veterinary examination record'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Animal ID">
            <TextInput required value={form.animalId} onChange={(e) => update('animalId', e.target.value)} placeholder="e.g. AN-1016" />
          </Field>
          <Field label="Species">
            <TextInput required value={form.species} onChange={(e) => update('species', e.target.value)} placeholder="e.g. Nilgiri Tahr" />
          </Field>
          <Field label="Examination Date">
            <TextInput type="date" required value={form.examinationDate} onChange={(e) => update('examinationDate', e.target.value)} />
          </Field>
          <Field label="Veterinarian">
            <TextInput required value={form.veterinarian} onChange={(e) => update('veterinarian', e.target.value)} placeholder="e.g. Dr. Vivek Nair" />
          </Field>
          <Field label="Condition">
            <SelectInput value={form.condition} onChange={(e) => update('condition', e.target.value as HealthCondition)}>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Follow-up Date">
            <TextInput type="date" value={form.followUpDate} onChange={(e) => update('followUpDate', e.target.value)} />
          </Field>
          <Field label="Treatment">
            <TextInput value={form.treatment} onChange={(e) => update('treatment', e.target.value)} placeholder="e.g. Snare wound debridement" />
          </Field>
          <Field label="Medication">
            <TextInput value={form.medication} onChange={(e) => update('medication', e.target.value)} placeholder="e.g. Amoxicillin" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Clinical notes…" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Health Record'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function HealthViewModal({ record, onClose }: { record: AnimalHealth | null; onClose: () => void }) {
  return (
    <Modal open={record !== null} onClose={onClose} title="Health Record" description={record ? `${record.id} • Veterinary record` : ''} wide>
      {record && (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{record.species}</h3>
            <span className="font-mono text-xs text-ink-400">{record.animalId}</span>
            <StatusBadgeFor value={record.condition} />
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Examination Date" value={formatDate(record.examinationDate)} />
            <Detail label="Veterinarian" value={record.veterinarian} />
            <Detail label="Treatment" value={record.treatment} />
            <Detail label="Medication" value={record.medication} />
            <Detail label="Follow-up Date" value={formatDate(record.followUpDate)} />
          </dl>
          {record.notes && (
            <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-4">
              <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">Clinical Notes</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-700">{record.notes}</dd>
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