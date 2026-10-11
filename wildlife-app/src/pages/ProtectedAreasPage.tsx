import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { protectedAreaService } from '../services/protectedAreaService'
import type { ProtectedArea, ProtectedAreaType } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, uniqueOptions } from '../components/FilterBar'
import { StatusBadgeFor } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { TableSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { RowActions } from '../components/RowActions'
import { DataTable } from '../components/DataTable'
import { MapVisual } from '../components/MapVisual'
import { WildlifeImage } from '../components/WildlifeImage'
import { Field, FormActions, SelectInput, TextInput } from '../components/Field'
import { generateId } from '../lib/format'

const types: ProtectedAreaType[] = ['National Park', 'Wildlife Sanctuary', 'Tiger Reserve', 'Biosphere Reserve']

type ProtectedAreaFormData = Omit<ProtectedArea, 'id'>

const emptyForm: ProtectedAreaFormData = {
  name: '',
  location: '',
  areaSize: '',
  type: 'National Park',
  rangerCount: 0,
  speciesCount: 0,
  status: 'Active',
  established: '',
  image: '',
}

const pointCoords: Record<string, { x: number; y: number }> = {
  'PA-001': { x: 205, y: 300 },
  'PA-002': { x: 255, y: 235 },
  'PA-003': { x: 215, y: 255 },
  'PA-004': { x: 190, y: 280 },
  'PA-005': { x: 205, y: 330 },
  'PA-006': { x: 270, y: 215 },
  'PA-007': { x: 242, y: 210 },
  'PA-008': { x: 235, y: 290 },
  'PA-009': { x: 195, y: 360 },
}

export default function ProtectedAreasPage() {
  const { data, loading, error, reload } = useAsyncData(protectedAreaService.getProtectedAreas, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProtectedArea | null>(null)
  const [viewing, setViewing] = useState<ProtectedArea | null>(null)
  const [deleting, setDeleting] = useState<ProtectedArea | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((a) => `${a.name} ${a.location} ${a.type}`.toLowerCase().includes(q))
    if (type !== 'all') list = list.filter((a) => a.type === type)
    if (status !== 'all') list = list.filter((a) => a.status === status)
    return list
  }, [data, search, type, status])

  const clearFilters = () => {
    setSearch('')
    setType('all')
    setStatus('all')
  }

  const mapPoints = useMemo(
    () =>
      (data ?? [])
        .filter((a) => pointCoords[a.id])
        .map((a) => ({ id: a.id, label: a.name.split(' ')[0], x: pointCoords[a.id].x, y: pointCoords[a.id].y })),
    [data],
  )

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (form: ProtectedAreaFormData) => {
    setBusy(true)
    try {
      if (editing) {
        await protectedAreaService.updateProtectedArea(editing.id, form)
        toast.success('Protected area updated successfully')
      } else {
        await protectedAreaService.createProtectedArea({ ...form, id: generateId('PA-') })
        toast.success('Protected area added successfully')
      }
      setFormOpen(false)
      void reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save protected area')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await protectedAreaService.deleteProtectedArea(deleting.id)
      toast.success('Protected area deleted successfully')
      setDeleting(null)
      void reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete protected area')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Protected Areas"
        subtitle="Statutory reserves under the conservation management network."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Area
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search reserves by name or location…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Type" options={uniqueOptions(types)} value={type} onChange={setType} />
          <FilterBar label="Status" options={uniqueOptions(['Active', 'Under Review', 'Restricted'])} value={status} onChange={setStatus} />
        </div>
      </div>

      <div className="mb-6">
        <MapVisual points={mapPoints} activeId={viewing?.id} className="aspect-[3/2] max-h-[420px] sm:aspect-auto" />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cells={7} />
      ) : error ? (
        <ErrorState title="Could not load protected areas" message={error} onRetry={() => void reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No protected areas found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <DataTable columns={['ID', 'Protected Area', 'Location', 'Area Size', 'Type', 'Established', 'Rangers', 'Species', 'Status', '']}>
          {filtered.map((area) => (
            <tr key={area.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{area.id}</td>
              <td className="td">
                <div className="flex items-center gap-3">
                  <WildlifeImage src={area.image} alt={area.name} className="h-10 w-14 rounded-md border border-ink-200 object-cover" fallbackLabel={area.id} />
                  <span className="font-semibold text-ink-900">{area.name}</span>
                </div>
              </td>
              <td className="td">{area.location}</td>
              <td className="td font-mono text-xs">{area.areaSize}</td>
              <td className="td">{area.type}</td>
              <td className="td">{area.established}</td>
              <td className="td">{area.rangerCount}</td>
              <td className="td">{area.speciesCount}</td>
              <td className="td">
                <StatusBadgeFor value={area.status} />
              </td>
              <td className="td">
                <RowActions onView={() => setViewing(area)} onEdit={() => { setEditing(area); setFormOpen(true) }} onDelete={() => setDeleting(area)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ProtectedAreaFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <ProtectedAreaViewModal area={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete protected area"
        message={`Delete ${deleting?.name ?? 'this protected area'}? This will permanently remove the record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface ProtectedAreaFormModalProps {
  open: boolean
  editing: ProtectedArea | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: ProtectedAreaFormData) => Promise<void>
}

function ProtectedAreaFormModal({ open, editing, busy, onClose, onSubmit }: ProtectedAreaFormModalProps) {
  const [form, setForm] = useState<ProtectedAreaFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof ProtectedAreaFormData>(key: K, value: ProtectedAreaFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Protected Area' : 'Add Protected Area'} description={editing ? `Updating ${editing.id}` : 'Register a new protected area'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name">
            <TextInput required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Periyar Tiger Reserve" />
          </Field>
          <Field label="Location">
            <TextInput required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Idukki, Kerala" />
          </Field>
          <Field label="Area Size">
            <TextInput required value={form.areaSize} onChange={(e) => update('areaSize', e.target.value)} placeholder="e.g. 925 km²" />
          </Field>
          <Field label="Type">
            <SelectInput value={form.type} onChange={(e) => update('type', e.target.value as ProtectedAreaType)}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Ranger Count">
            <TextInput type="number" min={0} value={form.rangerCount} onChange={(e) => update('rangerCount', Number(e.target.value))} />
          </Field>
          <Field label="Species Count">
            <TextInput type="number" min={0} value={form.speciesCount} onChange={(e) => update('speciesCount', Number(e.target.value))} />
          </Field>
          <Field label="Established">
            <TextInput value={form.established} onChange={(e) => update('established', e.target.value)} placeholder="e.g. 1978" />
          </Field>
          <Field label="Image URL">
            <TextInput value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://images.unsplash.com/…" />
          </Field>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Area'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function ProtectedAreaViewModal({ area, onClose }: { area: ProtectedArea | null; onClose: () => void }) {
  return (
    <Modal open={area !== null} onClose={onClose} title="Protected Area Details" description={area ? `${area.id} • ${area.type}` : ''} wide>
      {area && (
        <div>
          <div className="mb-6 aspect-[16/6] overflow-hidden rounded-xl border border-ink-200">
            <WildlifeImage src={area.image} alt={area.name} className="h-full w-full object-cover" fallbackLabel={area.id} />
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{area.name}</h3>
            <StatusBadgeFor value={area.status} />
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Detail label="Location" value={area.location} />
            <Detail label="Area Size" value={area.areaSize} />
            <Detail label="Type" value={area.type} />
            <Detail label="Established" value={area.established} />
            <Detail label="Rangers" value={String(area.rangerCount)} />
            <Detail label="Species" value={String(area.speciesCount)} />
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