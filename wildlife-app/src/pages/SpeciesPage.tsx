import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { speciesService } from '../services/speciesService'
import type { ConservationStatus, Species, SpeciesCategory } from '../types'
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
import { generateId } from '../lib/format'

const categories: SpeciesCategory[] = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Insect']
const statuses: ConservationStatus[] = ['Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern', 'Threatened']

type SpeciesFormData = Omit<Species, 'id'>

const emptyForm: SpeciesFormData = {
  commonName: '',
  scientificName: '',
  category: 'Mammal',
  status: 'Endangered',
  populationEstimate: '',
  habitat: 'Tropical Forest',
  image: '',
  description: '',
  bodyLength: '',
  weight: '',
  diet: '',
  regions: [],
}

export default function SpeciesPage() {
  const { data, loading, reload } = useAsyncData(speciesService.getSpecies, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('name')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Species | null>(null)
  const [viewing, setViewing] = useState<Species | null>(null)
  const [deleting, setDeleting] = useState<Species | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((s) => `${s.commonName} ${s.scientificName} ${s.habitat} ${s.regions.join(' ')}`.toLowerCase().includes(q))
    }
    if (category !== 'all') list = list.filter((s) => s.category === category)
    if (status !== 'all') list = list.filter((s) => s.status === status)
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.commonName.localeCompare(b.commonName)
      if (sort === 'status') return a.status.localeCompare(b.status)
      return a.commonName.localeCompare(b.commonName)
    })
  }, [data, search, category, status, sort])

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setStatus('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (species: Species) => {
    setEditing(species)
    setFormOpen(true)
  }

  const handleSubmit = async (form: SpeciesFormData) => {
    setBusy(true)
    if (editing) {
      await speciesService.updateSpecies(editing.id, form)
      toast.success('Species updated successfully')
    } else {
      await speciesService.createSpecies({ ...form, id: generateId('SP-') })
      toast.success('Species added successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await speciesService.deleteSpecies(deleting.id)
    toast.success('Species record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Species"
        subtitle="Manage and monitor wildlife species records."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Species
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, habitat or region…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Category" options={uniqueOptions((data ?? []).map((s) => s.category))} value={category} onChange={setCategory} />
          <FilterBar label="Status" options={uniqueOptions((data ?? []).map((s) => s.status))} value={status} onChange={setStatus} />
          <select aria-label="Sort species" value={sort} onChange={(e) => setSort(e.target.value)} className="input-base w-auto cursor-pointer py-1.5 text-xs font-medium text-ink-700">
            <option value="name">Sort: Name</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cells={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No species found"
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
          className="card"
          columns={['Species ID', 'Image', 'Common Name', 'Scientific Name', 'Category', 'Conservation Status', 'Population Estimate', 'Habitat', '']}
        >
          {filtered.map((species) => (
            <tr key={species.id} className="transition-colors hover:bg-ink-50/70" tabIndex={0}>
              <td className="td font-mono text-xs font-medium text-ink-500">{species.id}</td>
              <td className="td">
                <WildlifeImage src={species.image} alt={species.commonName} className="h-10 w-14 rounded-md border border-ink-200 object-cover" fallbackLabel={species.id} />
              </td>
              <td className="td font-semibold text-ink-900">{species.commonName}</td>
              <td className="td italic text-ink-500">{species.scientificName}</td>
              <td className="td">{species.category}</td>
              <td className="td">
                <StatusBadgeFor value={species.status} />
              </td>
              <td className="td font-mono text-xs">{species.populationEstimate}</td>
              <td className="td">{species.habitat}</td>
              <td className="td">
                <RowActions onView={() => setViewing(species)} onEdit={() => openEdit(species)} onDelete={() => setDeleting(species)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <SpeciesFormModal
        open={formOpen}
        editing={editing}
        busy={busy}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <SpeciesViewModal species={viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete species record"
        message={`Delete ${deleting?.commonName ?? 'this species'}? This action cannot be undone and will remove the species record from the system.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface SpeciesFormModalProps {
  open: boolean
  editing: Species | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: SpeciesFormData) => Promise<void>
}

function SpeciesFormModal({ open, editing, busy, onClose, onSubmit }: SpeciesFormModalProps) {
  const [form, setForm] = useState<SpeciesFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm({ ...rest, regions: [...rest.regions] })
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof SpeciesFormData>(key: K, value: SpeciesFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Species' : 'Add Species'}
      description={editing ? `Updating record ${editing.id}` : 'Create a new wildlife species record'}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Common Name">
            <TextInput required value={form.commonName} onChange={(e) => update('commonName', e.target.value)} placeholder="e.g. Bengal Tiger" />
          </Field>
          <Field label="Scientific Name">
            <TextInput required value={form.scientificName} onChange={(e) => update('scientificName', e.target.value)} placeholder="e.g. Panthera tigris tigris" />
          </Field>
          <Field label="Category">
            <SelectInput value={form.category} onChange={(e) => update('category', e.target.value as SpeciesCategory)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Conservation Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as ConservationStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Population Estimate">
            <TextInput required value={form.populationEstimate} onChange={(e) => update('populationEstimate', e.target.value)} placeholder="e.g. 2,967" />
          </Field>
          <Field label="Primary Habitat">
            <TextInput required value={form.habitat} onChange={(e) => update('habitat', e.target.value)} placeholder="e.g. Tropical Forest" />
          </Field>
          <Field label="Body Length">
            <TextInput value={form.bodyLength} onChange={(e) => update('bodyLength', e.target.value)} placeholder="e.g. 2.4 – 3.1 m" />
          </Field>
          <Field label="Weight">
            <TextInput value={form.weight} onChange={(e) => update('weight', e.target.value)} placeholder="e.g. 140 – 260 kg" />
          </Field>
          <Field label="Diet">
            <TextInput value={form.diet} onChange={(e) => update('diet', e.target.value)} placeholder="e.g. Sambar, chital, wild boar" />
          </Field>
          <Field label="Image URL">
            <TextInput value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://images.unsplash.com/…" />
          </Field>
          <Field label="Regions (comma separated)" hint="Protected areas or regions where the species is found.">
            <TextInput
              value={form.regions.join(', ')}
              onChange={(e) => update('regions', e.target.value.split(',').map((r) => r.trim()).filter(Boolean))}
              placeholder="Periyar, Bandipur, Kanha"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <TextArea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Short conservation description…" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Species'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function SpeciesViewModal({ species, onClose }: { species: Species | null; onClose: () => void }) {
  return (
    <Modal open={species !== null} onClose={onClose} title="Species Details" description={species ? `${species.id} • Registered wildlife species` : ''} wide>
      {species && (
        <div>
          <div className="mb-6 aspect-[16/6] overflow-hidden rounded-xl border border-ink-200">
            <WildlifeImage src={species.image} alt={species.commonName} className="h-full w-full object-cover" fallbackLabel={species.commonName} />
          </div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{species.commonName}</h3>
            <span className="italic text-ink-400">{species.scientificName}</span>
            <StatusBadgeFor value={species.status} />
            <StatusBadgeFor value={species.category} />
          </div>
          <p className="text-sm leading-relaxed text-ink-600">{species.description}</p>
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-3">
            <Detail label="Population Estimate" value={species.populationEstimate} />
            <Detail label="Habitat" value={species.habitat} />
            <Detail label="Body Length" value={species.bodyLength} />
            <Detail label="Weight" value={species.weight} />
            <Detail label="Diet" value={species.diet} />
            <Detail label="Regions" value={species.regions.join(', ')} />
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