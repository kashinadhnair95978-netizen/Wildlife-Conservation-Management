import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { habitatService } from '../services/habitatService'
import type { Habitat, HabitatCondition, HabitatType } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, uniqueOptions } from '../components/FilterBar'
import { StatusBadgeFor } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { WildlifeImage } from '../components/WildlifeImage'
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/Field'
import { formatDate, generateId } from '../lib/format'

const habitatTypes: HabitatType[] = ['Tropical Forest', 'Grassland', 'Wetland', 'Mountain', 'Coastal', 'River Ecosystem']
const conditions: HabitatCondition[] = ['Excellent', 'Good', 'Fair', 'Degraded']

type HabitatFormData = Omit<Habitat, 'id'>

const emptyForm: HabitatFormData = {
  name: '',
  location: '',
  area: '',
  type: 'Tropical Forest',
  condition: 'Good',
  speciesCount: 0,
  lastInspection: '',
  image: '',
  description: '',
}

export default function HabitatsPage() {
  const { data, loading, reload } = useAsyncData(habitatService.getHabitats, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [condition, setCondition] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Habitat | null>(null)
  const [viewing, setViewing] = useState<Habitat | null>(null)
  const [deleting, setDeleting] = useState<Habitat | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((h) => `${h.name} ${h.location} ${h.type} ${h.description}`.toLowerCase().includes(q))
    if (type !== 'all') list = list.filter((h) => h.type === type)
    if (condition !== 'all') list = list.filter((h) => h.condition === condition)
    return list
  }, [data, search, type, condition])

  const clearFilters = () => {
    setSearch('')
    setType('all')
    setCondition('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (form: HabitatFormData) => {
    setBusy(true)
    if (editing) {
      await habitatService.updateHabitat(editing.id, form)
      toast.success('Habitat updated successfully')
    } else {
      await habitatService.createHabitat({ ...form, id: generateId('HB-') })
      toast.success('Habitat added successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await habitatService.deleteHabitat(deleting.id)
    toast.success('Habitat record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Habitats"
        subtitle="Monitor ecosystem health across the conservation network."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Habitat
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search habitats by name, type or location…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Type" options={uniqueOptions(habitatTypes)} value={type} onChange={setType} />
          <FilterBar label="Condition" options={uniqueOptions(conditions)} value={condition} onChange={setCondition} />
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={6} aspect="aspect-[16/10]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No habitats found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((habitat) => (
            <article key={habitat.id} className="group card overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <div className="relative aspect-[16/10] overflow-hidden">
                <WildlifeImage src={habitat.image} alt={habitat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" fallbackLabel={habitat.id} />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3" aria-hidden="true">
                  <span className="rounded-md bg-ink-950/60 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                    {habitat.id}
                  </span>
                  <StatusBadgeFor value={habitat.condition} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-base font-semibold text-ink-950 transition-colors group-hover:text-ink-700">{habitat.name}</h3>
                <p className="mt-1 text-xs text-ink-500">{habitat.location}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-4 text-center">
                  <div>
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-400">Area</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-ink-800">{habitat.area}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-400">Species</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-ink-800">{habitat.speciesCount}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-400">Type</p>
                    <p className="mt-0.5 truncate pt-px text-[11px] font-medium leading-5 text-ink-700">{habitat.type}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">Inspected {formatDate(habitat.lastInspection)}</span>
                </div>
                <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                  <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => setViewing(habitat)}>
                    View
                  </button>
                  <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => { setEditing(habitat); setFormOpen(true) }}>
                    Edit
                  </button>
                  <button type="button" className="btn-outline flex-1 border-status-red/20 py-1.5 text-xs text-status-red hover:border-status-red/40 hover:text-status-red" onClick={() => setDeleting(habitat)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <HabitatFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <HabitatViewModal habitat={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete habitat"
        message={`Delete ${deleting?.name ?? 'this habitat'}? This will permanently remove the habitat record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface HabitatFormModalProps {
  open: boolean
  editing: Habitat | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: HabitatFormData) => Promise<void>
}

function HabitatFormModal({ open, editing, busy, onClose, onSubmit }: HabitatFormModalProps) {
  const [form, setForm] = useState<HabitatFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof HabitatFormData>(key: K, value: HabitatFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Habitat' : 'Add Habitat'} description={editing ? `Updating ${editing.id}` : 'Create a new habitat record'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Habitat Name">
            <TextInput required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Periyar Evergreen Forest" />
          </Field>
          <Field label="Location">
            <TextInput required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Idukki, Kerala" />
          </Field>
          <Field label="Area">
            <TextInput required value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="e.g. 342 km²" />
          </Field>
          <Field label="Habitat Type">
            <SelectInput value={form.type} onChange={(e) => update('type', e.target.value as HabitatType)}>
              {habitatTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Condition">
            <SelectInput value={form.condition} onChange={(e) => update('condition', e.target.value as HabitatCondition)}>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Species Count">
            <TextInput type="number" min={0} value={form.speciesCount} onChange={(e) => update('speciesCount', Number(e.target.value))} />
          </Field>
          <Field label="Last Inspection">
            <TextInput type="date" value={form.lastInspection} onChange={(e) => update('lastInspection', e.target.value)} />
          </Field>
          <Field label="Image URL">
            <TextInput value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://images.unsplash.com/…" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <TextArea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Habitat description…" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Habitat'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function HabitatViewModal({ habitat, onClose }: { habitat: Habitat | null; onClose: () => void }) {
  return (
    <Modal open={habitat !== null} onClose={onClose} title="Habitat Details" description={habitat ? `${habitat.id} • ${habitat.type}` : ''} wide>
      {habitat && (
        <div>
          <div className="mb-6 aspect-[16/6] overflow-hidden rounded-xl border border-ink-200">
            <WildlifeImage src={habitat.image} alt={habitat.name} className="h-full w-full object-cover" fallbackLabel={habitat.id} />
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{habitat.name}</h3>
            <StatusBadgeFor value={habitat.condition} />
          </div>
          <p className="text-sm leading-relaxed text-ink-600">{habitat.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Detail label="Location" value={habitat.location} />
            <Detail label="Area" value={habitat.area} />
            <Detail label="Type" value={habitat.type} />
            <Detail label="Species Count" value={String(habitat.speciesCount)} />
            <Detail label="Last Inspection" value={formatDate(habitat.lastInspection)} />
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