import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { threatService } from '../services/threatService'
import type { IncidentSeverity, Threat, ThreatStatus, ThreatTrend, ThreatType } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { FilterBar, uniqueOptions } from '../components/FilterBar'
import { DataTable } from '../components/DataTable'
import { RowActions } from '../components/RowActions'
import { StatusBadge, StatusBadgeFor } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { TableSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/Field'
import { formatDate, generateId } from '../lib/format'

const threatTypes: ThreatType[] = ['Poaching', 'Habitat Loss', 'Human Encroachment', 'Invasive Species', 'Climate Impact', 'Water Scarcity', 'Disease Outbreak', 'Pollution', 'Illegal Logging']
const severities: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical']
const threatStatuses: ThreatStatus[] = ['Active', 'Mitigating', 'Monitored', 'Contained']
const trends: ThreatTrend[] = ['Rising', 'Stable', 'Declining']

type ThreatFormData = Omit<Threat, 'id'>

const emptyForm: ThreatFormData = {
  type: 'Poaching',
  speciesAffected: '',
  location: '',
  severity: 'Medium',
  dateIdentified: '',
  status: 'Active',
  trend: 'Stable',
  description: '',
}

export default function ThreatsPage() {
  const { data, loading, reload } = useAsyncData(threatService.getThreats, [])
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Threat | null>(null)
  const [viewing, setViewing] = useState<Threat | null>(null)
  const [deleting, setDeleting] = useState<Threat | null>(null)
  const [busy, setBusy] = useState(false)

  const summary = useMemo(() => {
    const list = data ?? []
    return {
      active: list.filter((t) => t.status === 'Active').length,
      rising: list.filter((t) => t.trend === 'Rising').length,
      critical: list.filter((t) => t.severity === 'Critical').length,
      total: list.length,
    }
  }, [data])

  const filtered = useMemo(() => {
    let list = data ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((t) => `${t.id} ${t.type} ${t.speciesAffected} ${t.location} ${t.description}`.toLowerCase().includes(q))
    if (type !== 'all') list = list.filter((t) => t.type === type)
    if (severity !== 'all') list = list.filter((t) => t.severity === severity)
    if (status !== 'all') list = list.filter((t) => t.status === status)
    return list
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

  const handleSubmit = async (form: ThreatFormData) => {
    setBusy(true)
    if (editing) {
      await threatService.updateThreat(editing.id, form)
      toast.success('Threat updated successfully')
    } else {
      await threatService.createThreat({ ...form, id: generateId('TH-') })
      toast.success('Threat record added successfully')
    }
    setBusy(false)
    setFormOpen(false)
    void reload()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await threatService.deleteThreat(deleting.id)
    toast.success('Threat record deleted successfully')
    setBusy(false)
    setDeleting(null)
    void reload()
  }

  return (
    <div>
      <PageHeader
        title="Threats"
        subtitle="Monitor ongoing pressures and risks facing protected species."
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={15} />
            Add Threat
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Active Threats" value={summary.active} tone="red" />
        <SummaryCard label="Rising Trend" value={summary.rising} tone="amber" />
        <SummaryCard label="Critical Severity" value={summary.critical} tone="slate" />
        <SummaryCard label="Total Monitored" value={summary.total} tone="emerald" />
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search threats by type or species…" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar label="Type" options={uniqueOptions(threatTypes)} value={type} onChange={setType} />
          <FilterBar label="Severity" options={uniqueOptions(severities)} value={severity} onChange={setSeverity} />
          <FilterBar label="Status" options={uniqueOptions(threatStatuses)} value={status} onChange={setStatus} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cells={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No threats found"
          description="Try changing your search or filters."
          icon={SearchX}
          action={
            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <DataTable columns={['ID', 'Threat Type', 'Species Affected', 'Location', 'Severity', 'Date Identified', 'Trend', 'Status', '']}>
          {filtered.map((threat) => (
            <tr key={threat.id} className="transition-colors hover:bg-ink-50/70">
              <td className="td font-mono text-xs font-medium text-ink-500">{threat.id}</td>
              <td className="td font-semibold text-ink-900">{threat.type}</td>
              <td className="td">{threat.speciesAffected}</td>
              <td className="td">{threat.location}</td>
              <td className="td">
                <StatusBadgeFor value={threat.severity} />
              </td>
              <td className="td font-mono text-xs">{formatDate(threat.dateIdentified)}</td>
              <td className="td">
                <StatusBadgeFor value={threat.trend} />
              </td>
              <td className="td">
                <StatusBadgeFor value={threat.status} />
              </td>
              <td className="td">
                <RowActions onView={() => setViewing(threat)} onEdit={() => { setEditing(threat); setFormOpen(true) }} onDelete={() => setDeleting(threat)} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ThreatFormModal open={formOpen} editing={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <ThreatViewModal threat={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete threat"
        message={`Delete ${deleting?.id ?? 'this threat record'}? This will permanently remove the record.`}
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

interface ThreatFormModalProps {
  open: boolean
  editing: Threat | null
  busy: boolean
  onClose: () => void
  onSubmit: (form: ThreatFormData) => Promise<void>
}

function ThreatFormModal({ open, editing, busy, onClose, onSubmit }: ThreatFormModalProps) {
  const [form, setForm] = useState<ThreatFormData>(emptyForm)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, ...rest } = editing
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [open, editing])

  const update = <K extends keyof ThreatFormData>(key: K, value: ThreatFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Threat' : 'Add Threat'} description={editing ? `Updating ${editing.id}` : 'Register a new monitoring threat'} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Threat Type">
            <SelectInput required value={form.type} onChange={(e) => update('type', e.target.value as ThreatType)}>
              {threatTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Species Affected">
            <TextInput required value={form.speciesAffected} onChange={(e) => update('speciesAffected', e.target.value)} placeholder="e.g. Bengal Tiger" />
          </Field>
          <Field label="Location">
            <TextInput required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Periyar West Buffer" />
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
          <Field label="Date Identified">
            <TextInput type="date" value={form.dateIdentified} onChange={(e) => update('dateIdentified', e.target.value)} />
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(e) => update('status', e.target.value as ThreatStatus)}>
              {threatStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Trend">
            <SelectInput value={form.trend} onChange={(e) => update('trend', e.target.value as ThreatTrend)}>
              {trends.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div />
          <div className="sm:col-span-2">
            <Field label="Description">
              <TextArea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Threat description and context…" />
            </Field>
          </div>
        </div>
        <FormActions>
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Threat'}
          </button>
        </FormActions>
      </form>
    </Modal>
  )
}

function ThreatViewModal({ threat, onClose }: { threat: Threat | null; onClose: () => void }) {
  return (
    <Modal open={threat !== null} onClose={onClose} title="Threat Details" description={threat ? `${threat.id} • Threat monitoring record` : ''}>
      {threat && (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-semibold text-ink-950">{threat.type}</h3>
            <StatusBadge label={threat.severity} tone={threat.severity === 'Critical' ? 'red' : threat.severity === 'High' ? 'red' : threat.severity === 'Medium' ? 'amber' : 'blue'} />
            <StatusBadgeFor value={threat.status} />
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Species Affected" value={threat.speciesAffected} />
            <Detail label="Location" value={threat.location} />
            <Detail label="Date Identified" value={formatDate(threat.dateIdentified)} />
            <Detail label="Trend" value={threat.trend} />
          </dl>
          <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-4">
            <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">Description</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-700">{threat.description}</dd>
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