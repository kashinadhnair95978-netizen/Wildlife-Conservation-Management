import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { animalService } from '../services/animalService'
import { speciesService } from '../services/speciesService'
import type { Animal, Gender, HealthStatus, Species, TrackingStatus } from '../types'
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
import { Field, FormActions, SelectInput, TextInput } from '../components/Field'
import { formatDate, generateId } from '../lib/format'

const genders: Gender[] = ['Male', 'Female', 'Unknown']
const healthStatuses: HealthStatus[] = ['Healthy', 'Under Observation', 'Injured', 'Recovering', 'Critical']
const trackingStatuses: TrackingStatus[] = ['Tracked', 'Untracked']

type AnimalFormData = Omit<Animal, 'id'>

const emptyForm: AnimalFormData = {
  speciesId: 'SP-001',
  name: '',
  gender: 'Unknown',
  ageYears: 1,
  dateOfBirth: '',
  habitat: 'Tropical Forest',
  healthStatus: 'Healthy',
  currentLocation: '',
  trackingStatus: 'Tracked',
  image: '',
}

export default function AnimalsPage() {
  const { data: animals, loading, reload } = useAsyncData(animalService.getAnimals, [])
  const { data: speciesList } = useAsyncData(speciesService.getSpecies, [])
  const toast = useToast()

  const speciesById = useMemo(() => {
    const map: Record<string, Species> = {}
    ;(speciesList ?? []).forEach((s) => (map[s.id] = s))
    return map
  }, [speciesList])

  const speciesName = (id: string) => speciesById[id]?.commonName ?? id

  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Animal | null>(null)
  const [viewing, setViewing] = useState<Animal | null>(null)
  const [deleting, setDeleting] = useState<Animal | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = animals ?? []
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((a) => `${a.name} ${a.id} ${speciesName(a.speciesId)} ${a.currentLocation} ${a.habitat}`.toLowerCase().includes(q))
    }
    if (speciesFilter !== 'all') list = list.filter((a) => a.speciesId === speciesFilter)
    if (healthFilter !== 'all') list = list.filter((a) => a.healthStatus === healthFilter)
    return list
  }, [animals, search, speciesFilter, healthFilter])

  const clearFilters = () => {
    setSearch('')
    setSpeciesFilter('all')
    setHealthFilter('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (animal: Animal) => {
    setEditing(animal)
    setFormOpen(true)
  }

  const handleSubmit = async (form: AnimalFormData) => {
    setBusy(true)
    if (editing && typeof editing.id === 'string') {
      await animalService.updateAnimal(editing.id, form)
      toast.success('Animal record updated successfully')
    } else {
      await animalService.createAnimal({ ...form, id: generateId('AN-') })
      toast.success('Animal added successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await animalService.deleteAnimal(deleting.id)
    toast.success('Animal record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Animals"
        subtitle="Manage individual animals under monitoring and care."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Animal
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, tag, location…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Species" options={(speciesList ?? []).map((s) => ({ label: s.commonName, value: s.id }))} value={speciesFilter} onChange={setSpeciesFilter} />
          <FilterBar label="Health" options={uniqueOptions(healthStatuses)} value={healthFilter} onChange={setHealthFilter} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cells={9} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No animals found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <DataTable
          columns={['Animal ID', 'Thumbnail', 'Name / Tag', 'Species', 'Gender', 'Age', 'Date of Birth', 'Habitat', 'Health Status', 'Current Location', 'Tracking', '']}
        >
          {filtered.map((animal) => (
            <tr key={animal.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{animal.id}</td>
              <td className="td">
                <WildlifeImage src={animal.image} alt={animal.name} className="h-10 w-14 rounded-md border border-ink-200 object-cover" fallbackLabel={animal.id} />
              </td>
              <td className="td font-semibold text-ink-900">{animal.name}</td>
              <td className="td">{speciesName(animal.speciesId)}</td>
              <td className="td">{animal.gender}</td>
              <td className="td">{animal.ageYears} yrs</td>
              <td className="td font-mono text-xs">{formatDate(animal.dateOfBirth)}</td>
              <td className="td">{animal.habitat}</td>
              <td className="td">
                <StatusBadgeFor value={animal.healthStatus} />
              </td>
              <td className="td">{animal.currentLocation}</td>
              <td className="td">
                <StatusBadgeFor value={animal.trackingStatus} />
              </td>
              <td className="td">
                <RowActions onView={() => setViewing(animal)} onEdit={() => openEdit(animal)} onDelete={() => setDeleting(animal)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <AnimalFormModal
        open={formOpen}
        editing={editing}
        speciesOptions={(speciesList ?? []).map((s) => ({ label: s.commonName, value: s.id }))}
        busy={busy}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <AnimalViewModal animal={viewing} speciesName={speciesName} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete animal record"
        message={`Delete ${deleting ? `${deleting.name} (${deleting.id})` : 'this animal'}? This will permanently remove the record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface AnimalFormModalProps {
  open: boolean
  editing: Animal | null
  speciesOptions: { label: string; value: string }[]
  busy: boolean
  onClose: () => void
  onSubmit: (form: AnimalFormData) => Promise<void>
}

function AnimalFormModal({ open, editing, speciesOptions, busy, onClose, onSubmit }: AnimalFormModalProps) {
  const [form, setForm] = useState<AnimalFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing?.id && editing.speciesId) {
      const { id: _id, ...rest } = editing
      setForm({ ...rest })
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof AnimalFormData>(key: K, value: AnimalFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing?.id ? 'Edit Animal' : 'Add Animal'} description={editing?.id ? `Updating record ${editing.id}` : 'Register a new animal under monitoring'} wide>
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
          <Field label="Name / Tag">
            <TextInput required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Rajah" />
          </Field>
          <Field label="Gender">
            <SelectInput value={form.gender} onChange={(e) => update('gender', e.target.value as Gender)}>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Age (years)">
            <TextInput type="number" min={0} value={form.ageYears} onChange={(e) => update('ageYears', Number(e.target.value))} />
          </Field>
          <Field label="Date of Birth">
            <TextInput type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
          </Field>
          <Field label="Health Status">
            <SelectInput value={form.healthStatus} onChange={(e) => update('healthStatus', e.target.value as HealthStatus)}>
              {healthStatuses.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Habitat">
            <TextInput required value={form.habitat} onChange={(e) => update('habitat', e.target.value)} placeholder="e.g. Tropical Forest" />
          </Field>
          <Field label="Current Location">
            <TextInput required value={form.currentLocation} onChange={(e) => update('currentLocation', e.target.value)} placeholder="e.g. Periyar Core Zone" />
          </Field>
          <Field label="Tracking Status">
            <SelectInput value={form.trackingStatus} onChange={(e) => update('trackingStatus', e.target.value as TrackingStatus)}>
              {trackingStatuses.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
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
            {busy ? 'Saving…' : editing?.id ? 'Save Changes' : 'Add Animal'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function AnimalViewModal({ animal, speciesName, onClose }: { animal: Animal | null; speciesName: (id: string) => string; onClose: () => void }) {
  return (
    <Modal open={animal !== null} onClose={onClose} title="Animal Details" description={animal ? `${animal.id} • Registered animal` : ''} wide>
      {animal && (
        <div>
          <div className="mb-6 aspect-[16/5] overflow-hidden rounded-xl border border-ink-200">
            <WildlifeImage src={animal.image} alt={animal.name} className="h-full w-full object-cover" fallbackLabel={animal.id} />
          </div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{animal.name}</h3>
            <span className="font-mono text-xs text-ink-400">{animal.id}</span>
            <StatusBadgeFor value={animal.healthStatus} />
            <StatusBadgeFor value={animal.trackingStatus} />
          </div>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
            <Detail label="Species" value={speciesName(animal.speciesId)} />
            <Detail label="Gender" value={animal.gender} />
            <Detail label="Age" value={`${animal.ageYears} years`} />
            <Detail label="Date of Birth" value={formatDate(animal.dateOfBirth)} />
            <Detail label="Habitat" value={animal.habitat} />
            <Detail label="Current Location" value={animal.currentLocation} />
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