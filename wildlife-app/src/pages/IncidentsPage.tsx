import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX, Siren } from 'lucide-react'
import { incidentService } from '../services/incidentService'
import type { Incident, IncidentSeverity, IncidentStatus, IncidentType } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, uniqueOptions } from '../components/FilterBar'
import { DataTable } from '../components/DataTable'
import { RowActions } from '../components/RowActions'
import { StatusBadgeFor } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { TableSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/Field'
import { formatDate, generateId } from '../lib/format'

const incidentTypes: IncidentType[] = ['Poaching', 'Forest Fire', 'Injured Animal', 'Habitat Destruction', 'Human-Wildlife Conflict', 'Illegal Activity', 'Other']
const severities: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical']
const statuses: IncidentStatus[] = ['Open', 'Investigating', 'Resolved']

type IncidentFormData = Omit<Incident, 'id'>

const emptyForm: IncidentFormData = {
  type: 'Poaching',
  location: '',
  date: '',
  time: '',
  reportedBy: '',
  severity: 'Medium',
  status: 'Open',
  description: '',
  notes: '',
}

export default function IncidentsPage() {
  const { data, loading, error, reload } = useAsyncData(incidentService.getIncidents, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Incident | null>(null)
  const [viewing, setViewing] = useState<Incident | null>(null)
  const [deleting, setDeleting] = useState<Incident | null>(null)
  const [busy, setBusy] = useState(false)

  const counts = useMemo(() => {
    const list = data ?? []
    return {
      open: list.filter((i) => i.status === 'Open').length,
      investigating: list.filter((i) => i.status === 'Investigating').length,
      resolved: list.filter((i) => i.status === 'Resolved').length,
      critical: list.filter((i) => i.severity === 'Critical').length,
    }
  }, [data])

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((i) => `${i.id} ${i.type} ${i.location} ${i.reportedBy} ${i.description}`.toLowerCase().includes(q))
    if (type !== 'all') list = list.filter((i) => i.type === type)
    if (severity !== 'all') list = list.filter((i) => i.severity === severity)
    if (status !== 'all') list = list.filter((i) => i.status === status)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [data, search, type, severity, status])

  const clearFilters = () => {
    setSearch('')
    setType('all')
    setSeverity('all')
    setStatus('all')
  }

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (form: IncidentFormData) => {
    setBusy(true)
    try {
      if (editing) {
        await incidentService.updateIncident(editing.id, form)
        toast.success('Incident updated successfully')
      } else {
        await incidentService.createIncident({ ...form, id: generateId('IN-') })
        toast.success('Incident reported successfully')
      }
      setFormOpen(false)
      void reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save incident')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await incidentService.deleteIncident(deleting.id)
      toast.success('Incident record deleted successfully')
      setDeleting(null)
      void reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete incident')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Conservation Incidents"
        subtitle="Track, investigate and resolve operational threats as they are reported."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Report Incident
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Open" value={counts.open} tone="red" />
        <SummaryCard label="Investigating" value={counts.investigating} tone="amber" />
        <SummaryCard label="Resolved" value={counts.resolved} tone="emerald" />
        <SummaryCard label="Critical Severity" value={counts.critical} tone="slate" />
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search incidents by type, location…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Type" options={uniqueOptions(incidentTypes)} value={type} onChange={setType} />
          <FilterBar label="Severity" options={uniqueOptions(severities)} value={severity} onChange={setSeverity} />
          <FilterBar label="Status" options={uniqueOptions(statuses)} value={status} onChange={setStatus} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cells={8} />
      ) : error ? (
        <ErrorState title="Could not load incidents" message={error} onRetry={() => void reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No incidents found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <div className="flex gap-2">
              <button type="button" className="btn-outline" onClick={clearFilters}>
                Clear Filters
              </button>
              <button type="button" className="btn-primary" onClick={openAdd}>
                <Siren size={15} />
                Report Incident
              </button>
            </div>
          }
        />
      ) : (
        <DataTable columns={['ID', 'Type', 'Location', 'Date', 'Time', 'Reported By', 'Severity', 'Status', '']}>
          {filtered.map((incident) => (
            <tr key={incident.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{incident.id}</td>
              <td className="td font-semibold text-ink-900">{incident.type}</td>
              <td className="td">{incident.location}</td>
              <td className="td font-mono text-xs">{formatDate(incident.date)}</td>
              <td className="td font-mono text-xs">{incident.time}</td>
              <td className="td">{incident.reportedBy}</td>
              <td className="td">
                <StatusBadgeFor value={incident.severity} />
              </td>
              <td className="td">
                <StatusBadgeFor value={incident.status} />
              </td>
              <td className="td">
                <RowActions onView={() => setViewing(incident)} onEdit={() => { setEditing(incident); setFormOpen(true) }} onDelete={() => setDeleting(incident)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <IncidentFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <IncidentViewModal incident={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete incident"
        message={`Delete ${deleting?.id ?? 'this incident'}? This will permanently remove the incident record.`}
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'red' | 'amber' | 'emerald' | 'slate' }) {
  const toneMap = {
    red: 'border-status-red/20 bg-status-red/5 text-status-red',
    amber: 'border-status-amber/20 bg-status-amber/5 text-status-amber',
    emerald: 'border-status-emerald/20 bg-status-emerald/5 text-status-emerald',
    slate: 'border-ink-300 bg-ink-50 text-ink-600',
  }
  return (
    <div className={`rounded-xl border p-4 ${toneMap[tone]}`}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

interface IncidentFormModalProps {
  open: boolean
  editing: Incident | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: IncidentFormData) => Promise<void>
}

function IncidentFormModal({ open, editing, busy, onClose, onSubmit }: IncidentFormModalProps) {
  const [form, setForm] = useState<IncidentFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setForm({ ...emptyForm, date: today })
    }
  }, [open, editing])

  const update = <K extends keyof IncidentFormData>(key: K, value: IncidentFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Incident' : 'Report Incident'} description={editing ? `Updating ${editing.id}` : 'File a new conservation incident report'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Incident Type">
            <SelectInput required value={form.type} onChange={(e) => update('type', e.target.value as IncidentType)}>
              {incidentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Location">
            <TextInput required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Periyar West Buffer" />
          </Field>
          <Field label="Date">
            <TextInput type="date" required value={form.date} onChange={(e) => update('date', e.target.value)} />
          </Field>
          <Field label="Time">
            <TextInput type="time" required value={form.time} onChange={(e) => update('time', e.target.value)} />
          </Field>
          <Field label="Severity">
            <SelectInput value={form.severity} onChange={(e) => update('severity', e.target.value as IncidentSeverity)}>
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Reported By">
            <TextInput required value={form.reportedBy} onChange={(e) => update('reportedBy', e.target.value)} placeholder="e.g. Raja Pillai" />
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as IncidentStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div />
          <div className="sm:col-span-2">
            <Field label="Description">
              <TextArea required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Detailed description of the incident…" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} placeholder="Internal follow-up notes…" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Submit Incident'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function IncidentViewModal({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  return (
    <Modal open={incident !== null} onClose={onClose} title="Incident Details" description={incident ? `${incident.id} • Incident report` : ''}>
      {incident && (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{incident.type}</h3>
            <StatusBadgeFor value={incident.severity} />
            <StatusBadgeFor value={incident.status} />
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Date" value={formatDate(incident.date)} />
            <Detail label="Time" value={incident.time} />
            <Detail label="Location" value={incident.location} />
            <Detail label="Reported By" value={incident.reportedBy} />
          </dl>
          <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-4">
            <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">Description</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-700">{incident.description}</dd>
          </div>
          {incident.notes && <p className="mt-4 text-sm italic text-ink-500">{incident.notes}</p>}
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