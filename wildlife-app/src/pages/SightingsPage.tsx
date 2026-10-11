import { useEffect, useMemo, useState } from 'react'
import { Binoculars, FileDown, Plus, SearchX } from 'lucide-react'
import { sightingService } from '../services/sightingService'
import { speciesService } from '../services/speciesService'
import { protectedAreaService } from '../services/protectedAreaService'
import type { Sighting, SightingStatus, Species } from '../types'
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
import { downloadTextFile, formatDate, generateId } from '../lib/format'

const statuses: SightingStatus[] = ['Verified', 'Pending', 'Under Review']

type SightingFormData = Omit<Sighting, 'id'>

const emptyForm: SightingFormData = {
  speciesId: 'SP-001',
  location: '',
  protectedAreaId: 'PA-001',
  habitat: 'Tropical Forest',
  date: '',
  time: '',
  ranger: 'Raja Pillai',
  count: 1,
  behavior: '',
  status: 'Pending',
  notes: '',
}

export default function SightingsPage() {
  const { data, loading, reload } = useAsyncData(sightingService.getSightings, [])
  const { data: speciesList } = useAsyncData(speciesService.getSpecies, [])
  const { data: areas } = useAsyncData(protectedAreaService.getProtectedAreas, [])
  const toast = useToast()

  const speciesById = useMemo(() => {
    const map: Record<string, Species> = {}
    ;(speciesList ?? []).forEach((s) => (map[s.id] = s))
    return map
  }, [speciesList])

  const speciesName = (id: string) => speciesById[id]?.commonName ?? id
  const areaName = (id: string) => (areas ?? []).find((a) => a.id === id)?.name ?? id

  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Sighting | null>(null)
  const [viewing, setViewing] = useState<Sighting | null>(null)
  const [deleting, setDeleting] = useState<Sighting | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((s) => `${s.id} ${s.location} ${speciesName(s.speciesId)} ${s.ranger} ${s.behavior}`.toLowerCase().includes(q))
    }
    if (speciesFilter !== 'all') list = list.filter((s) => s.speciesId === speciesFilter)
    if (locationFilter !== 'all') list = list.filter((s) => s.location === locationFilter)
    if (statusFilter !== 'all') list = list.filter((s) => s.status === statusFilter)
    if (dateFilter) list = list.filter((s) => s.date === dateFilter)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [data, search, speciesFilter, locationFilter, statusFilter, dateFilter])

  const clearFilters = () => {
    setSearch('')
    setSpeciesFilter('all')
    setLocationFilter('all')
    setStatusFilter('all')
    setDateFilter('')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleExport = async () => {
    const csv = await sightingService.exportCsv()
    downloadTextFile('sightings-report.csv', csv, 'text/csv')
    toast.info('Sighting report exported as CSV')
  }

  const handleSubmit = async (form: SightingFormData) => {
    setBusy(true)
    if (editing) {
      await sightingService.updateSighting(editing.id, form)
      toast.success('Sighting updated successfully')
    } else {
      await sightingService.createSighting({ ...form, id: generateId('SG-') })
      toast.success('Sighting recorded successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await sightingService.deleteSighting(deleting.id)
    toast.success('Sighting record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Wildlife Sightings"
        subtitle="Record and monitor wildlife observations across protected areas."
        actions={
          <>
            <button type="button" className="btn-outline" onClick={handleExport}>
              <FileDown size={15} />
              Export Report
            </button>
            <button type="button" className="btn-primary" onClick={openAdd}>
              <Plus size={15} />
              Record Sighting
            </button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 lg:grid-cols-12">
        <SearchBar value={search} onChange={setSearch} placeholder="Search sightings…" className="lg:col-span-4" />
        <div className="flex flex-wrap items-center gap-3 lg:col-span-8">
          <FilterBar label="Species" options={(speciesList ?? []).map((s) => ({ label: s.commonName, value: s.id }))} value={speciesFilter} onChange={setSpeciesFilter} />
          <FilterBar label="Location" options={uniqueOptions((data ?? []).map((s) => s.location))} value={locationFilter} onChange={setLocationFilter} />
          <FilterBar label="Status" options={uniqueOptions(statuses)} value={statusFilter} onChange={setStatusFilter} />
          <input
            type="date"
            aria-label="Filter by date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-base w-auto cursor-pointer py-1.5 text-xs font-medium text-ink-700"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cells={9} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No sightings found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <div className="flex gap-2">
              <button type="button" className="btn-outline" onClick={clearFilters}>
                Clear Filters
              </button>
              <button type="button" className="btn-primary" onClick={openAdd}>
                <Binoculars size={15} />
                Record Sighting
              </button>
            </div>
          }
        />
      ) : (
        <DataTable columns={['ID', 'Species', 'Location', 'Date', 'Time', 'Ranger', 'Count', 'Behavior', 'Status', '']}>
          {filtered.map((sighting) => (
            <tr key={sighting.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{sighting.id}</td>
              <td className="td font-semibold text-ink-900">{speciesName(sighting.speciesId)}</td>
              <td className="td">{sighting.location}</td>
              <td className="td font-mono text-xs">{formatDate(sighting.date)}</td>
              <td className="td font-mono text-xs">{sighting.time}</td>
              <td className="td">{sighting.ranger}</td>
              <td className="td font-mono text-xs font-semibold">{sighting.count}</td>
              <td className="td max-w-[220px] truncate text-ink-600">{sighting.behavior}</td>
              <td className="td">
                <StatusBadgeFor value={sighting.status} />
              </td>
              <td className="td">
                <RowActions onView={() => setViewing(sighting)} onEdit={() => { setEditing(sighting); setFormOpen(true) }} onDelete={() => setDeleting(sighting)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <SightingFormModal
        open={formOpen}
        editing={editing}
        speciesOptions={(speciesList ?? []).map((s) => ({ label: s.commonName, value: s.id }))}
        areaOptions={(areas ?? []).map((a) => ({ label: a.name, value: a.id }))}
        busy={busy}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <SightingViewModal sighting={viewing} speciesName={speciesName} areaName={areaName} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete sighting"
        message={`Delete ${deleting?.id ?? 'this sighting'}? This will permanently remove the observation record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface SightingFormModalProps {
  open: boolean
  editing: Sighting | null
  speciesOptions: { label: string; value: string }[]
  areaOptions: { label: string; value: string }[]
  busy: boolean
  onClose: () => void
  onSubmit: (form: SightingFormData) => Promise<void>
}

function SightingFormModal({ open, editing, speciesOptions, areaOptions, busy, onClose, onSubmit }: SightingFormModalProps) {
  const [form, setForm] = useState<SightingFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof SightingFormData>(key: K, value: SightingFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Sighting' : 'Record Sighting'}
      description={editing ? `Updating ${editing.id}` : 'Log a wildlife observation from the field'}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Species">
            <SelectInput required value={form.speciesId} onChange={(e) => update('speciesId', e.target.value)}>
              {speciesOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Location">
            <TextInput required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Periyar Lake Shore" />
          </Field>
          <Field label="Date">
            <TextInput type="date" required value={form.date} onChange={(e) => update('date', e.target.value)} />
          </Field>
          <Field label="Time">
            <TextInput type="time" required value={form.time} onChange={(e) => update('time', e.target.value)} />
          </Field>
          <Field label="Protected Area">
            <SelectInput value={form.protectedAreaId} onChange={(e) => update('protectedAreaId', e.target.value)}>
              {areaOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Habitat">
            <TextInput required value={form.habitat} onChange={(e) => update('habitat', e.target.value)} placeholder="e.g. Tropical Forest" />
          </Field>
          <Field label="Number Observed">
            <TextInput type="number" min={0} value={form.count} onChange={(e) => update('count', Number(e.target.value))} />
          </Field>
          <Field label="Ranger">
            <TextInput required value={form.ranger} onChange={(e) => update('ranger', e.target.value)} placeholder="e.g. Raja Pillai" />
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as SightingStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div />
          <Field label="Behavior">
            <TextArea value={form.behavior} onChange={(e) => update('behavior', e.target.value)} placeholder="e.g. Foraging along the shoreline at dawn" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} placeholder="Additional field notes…" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Record Sighting'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function SightingViewModal({
  sighting,
  speciesName,
  areaName,
  onClose,
}: {
  sighting: Sighting | null
  speciesName: (id: string) => string
  areaName: (id: string) => string
  onClose: () => void
}) {
  return (
    <Modal open={sighting !== null} onClose={onClose} title="Sighting Details" description={sighting ? `${sighting.id} • Field observation` : ''}>
      {sighting && (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{speciesName(sighting.speciesId)}</h3>
            <StatusBadgeFor value={sighting.status} />
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Date" value={formatDate(sighting.date)} />
            <Detail label="Time" value={sighting.time} />
            <Detail label="Location" value={sighting.location} />
            <Detail label="Protected Area" value={areaName(sighting.protectedAreaId)} />
            <Detail label="Habitat" value={sighting.habitat} />
            <Detail label="Number Observed" value={String(sighting.count)} />
            <Detail label="Ranger" value={sighting.ranger} />
          </dl>
          {sighting.behavior && (
            <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-4">
              <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">Behavior</dt>
              <dd className="mt-1 text-sm text-ink-700">{sighting.behavior}</dd>
            </div>
          )}
          {sighting.notes && (
            <p className="mt-4 text-sm italic text-ink-500">{sighting.notes}</p>
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