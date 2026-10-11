import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Mail, Plus, SearchX } from 'lucide-react'
import { researcherService } from '../services/researcherService'
import type { Researcher, ResearcherStatus } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, uniqueOptions } from '../components/FilterBar'
import { Avatar } from '../components/Avatar'
import { StatusBadgeFor } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field, FormActions, SelectInput, TextInput } from '../components/Field'
import { generateId } from '../lib/format'

const researcherStatuses: ResearcherStatus[] = ['Active', 'Inactive']

type ResearcherFormData = Omit<Researcher, 'id'>

const emptyForm: ResearcherFormData = {
  name: '',
  organization: '',
  specialization: '',
  activeProjects: 0,
  contact: '',
  status: 'Active',
  focusAreas: [],
}

export default function ResearchersPage() {
  const { data, loading, error, reload } = useAsyncData(researcherService.getResearchers, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Researcher | null>(null)
  const [viewing, setViewing] = useState<Researcher | null>(null)
  const [deleting, setDeleting] = useState<Researcher | null>(null)
  const [busy, setBusy] = useState(false)

  const activeProjects = useMemo(() => (data ?? []).reduce((sum, r) => sum + r.activeProjects, 0), [data])

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((r) => `${r.name} ${r.organization} ${r.specialization} ${r.focusAreas.join(' ')}`.toLowerCase().includes(q))
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

  const handleSubmit = async (form: ResearcherFormData) => {
    setBusy(true)
    try {
      if (editing) {
        await researcherService.updateResearcher(editing.id, form)
        toast.success('Researcher profile updated successfully')
      } else {
        await researcherService.createResearcher({ ...form, id: generateId('RS-') })
        toast.success('Researcher added successfully')
      }
      setFormOpen(false)
      void reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save researcher')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await researcherService.deleteResearcher(deleting.id)
      toast.success('Researcher profile deleted successfully')
      setDeleting(null)
      void reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete researcher')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Researchers"
        subtitle="Conservation scientists and collaborators attached to the reserves."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Researcher
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, organization, specialization…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Status" options={uniqueOptions(researcherStatuses)} value={status} onChange={setStatus} />
          <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-600">
            <BookOpen size={13} />
            {activeProjects} active research projects
          </span>
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={4} aspect="aspect-[auto]" />
      ) : error ? (
        <ErrorState title="Could not load researchers" message={error} onRetry={() => void reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No researchers found"
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
          {filtered.map((researcher) => (
            <article key={researcher.id} className="group card flex flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start gap-3.5">
                <Avatar label={researcher.name} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[15px] font-semibold text-ink-950">{researcher.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-ink-500">{researcher.organization}</p>
                </div>
                <StatusBadgeFor value={researcher.status} />
              </div>

              <div className="mt-4 border-t border-ink-100 pt-4">
                <p className="text-xs text-ink-600">{researcher.specialization}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {researcher.focusAreas.slice(0, 4).map((area) => (
                    <span key={area} className="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-ink-600">
                      {area}
                    </span>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
                  <Mail size={12} />
                  {researcher.contact}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
                  {researcher.activeProjects} active projects • {researcher.id}
                </p>
              </div>

              <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => setViewing(researcher)}>
                  View
                </button>
                <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => { setEditing(researcher); setFormOpen(true) }}>
                  Edit
                </button>
                <button type="button" className="btn-outline flex-1 border-status-red/20 py-1.5 text-xs text-status-red hover:border-status-red/40 hover:text-status-red" onClick={() => setDeleting(researcher)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ResearcherFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <ResearcherViewModal researcher={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete researcher"
        message={`Remove ${deleting?.name ?? 'this researcher'} and their linked projects from the system?`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

interface ResearcherFormModalProps {
  open: boolean
  editing: Researcher | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: ResearcherFormData) => Promise<void>
}

function ResearcherFormModal({ open, editing, busy, onClose, onSubmit }: ResearcherFormModalProps) {
  const [form, setForm] = useState<ResearcherFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm({ ...rest, focusAreas: [...rest.focusAreas] })
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof ResearcherFormData>(key: K, value: ResearcherFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Researcher' : 'Add Researcher'} description={editing ? `Updating ${editing.id}` : 'Register a new researcher profile'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name">
            <TextInput required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Dr. Anitha Krishnan" />
          </Field>
          <Field label="Organization">
            <TextInput required value={form.organization} onChange={(e) => update('organization', e.target.value)} placeholder="e.g. Kerala Forest Research Institute" />
          </Field>
          <Field label="Specialization">
            <TextInput required value={form.specialization} onChange={(e) => update('specialization', e.target.value)} placeholder="e.g. Carnivore ecology" />
          </Field>
          <Field label="Active Projects">
            <TextInput type="number" min={0} value={form.activeProjects} onChange={(e) => update('activeProjects', Number(e.target.value))} />
          </Field>
          <Field label="Contact">
            <TextInput required value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder="+91 …" />
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as ResearcherStatus)}>
              {researcherStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Focus Areas (comma separated)">
              <TextInput value={form.focusAreas.join(', ')} onChange={(e) => update('focusAreas', e.target.value.split(',').map((a) => a.trim()).filter(Boolean))} placeholder="Tiger telemetry, Prey density, Corridor mapping" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Researcher'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function ResearcherViewModal({ researcher, onClose }: { researcher: Researcher | null; onClose: () => void }) {
  return (
    <Modal open={researcher !== null} onClose={onClose} title="Researcher Profile" description={researcher ? `${researcher.id} • Research affiliation` : ''}>
      {researcher && (
        <div>
          <div className="mb-5 flex items-center gap-4">
            <Avatar label={researcher.name} size="lg" />
            <div>
              <h3 className="font-display text-xl font-semibold text-ink-950">{researcher.name}</h3>
              <StatusBadgeFor value={researcher.status} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Organization" value={researcher.organization} />
            <Detail label="Specialization" value={researcher.specialization} />
            <Detail label="Active Projects" value={String(researcher.activeProjects)} />
            <Detail label="Contact" value={researcher.contact} />
          </dl>
          <div className="mt-5">
            <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">Focus Areas</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {researcher.focusAreas.map((area) => (
                <span key={area} className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-600">
                  {area}
                </span>
              ))}
            </dd>
          </div>
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