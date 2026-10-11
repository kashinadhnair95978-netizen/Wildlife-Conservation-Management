import { useMemo, useState } from 'react'
import { BarChart3, Download, Eye, FileDown, FileText, LifeBuoy, RefreshCw, SearchX, TreePine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { reportService, type ReportColumn } from '../services/reportService'
import type { ReportMeta } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { Modal } from '../components/Modal'
import { downloadTextFile, formatDate } from '../lib/format'

const icons: Record<ReportMeta['icon'], LucideIcon> = {
  population: BarChart3,
  species: FileText,
  sighting: Eye,
  incident: FileDown,
  threat: BarChart3,
  habitat: TreePine,
  rescue: LifeBuoy,
  activity: FileText,
}

interface GeneratedReport {
  content: string
  recordCount: number
  generatedAt: string
}

function cellText(value: unknown): string {
  if (Array.isArray(value)) return value.join('; ')
  if (value === undefined || value === null || value === '') return ''
  return String(value)
}

function csvCell(value: unknown): string {
  const text = cellText(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function buildCsv(columns: ReportColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(',')
  const body = rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(','))
  return [header, ...body].join('\r\n')
}

function buildReportText(report: ReportMeta, columns: ReportColumn[], rows: Record<string, unknown>[]): string {
  const divider = columns.map(() => '---').join(' | ')
  return [
    report.title.toUpperCase(),
    '='.repeat(report.title.length),
    report.description,
    '',
    'Wildlife Conservation Management System — DBMS Project — Group B15',
    `Generated: ${new Date().toLocaleString()}`,
    `Records: ${rows.length}`,
    '',
    columns.map((c) => c.label).join(' | '),
    divider,
    ...rows.map((row) => columns.map((c) => cellText(row[c.key]) || '—').join(' | ')),
  ].join('\n')
}

function slug(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

export default function ReportsPage() {
  const { data, loading, error, reload } = useAsyncData(reportService.getReports, [])
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState<ReportMeta | null>(null)
  const [generated, setGenerated] = useState<Record<string, GeneratedReport>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const list = data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((r) => `${r.title} ${r.description}`.toLowerCase().includes(q))
  }, [data, search])

  const handleGenerate = async (report: ReportMeta) => {
    setBusy(report.id)
    try {
      const { source, rows } = await reportService.getReportData(report)
      setGenerated((prev) => ({
        ...prev,
        [report.id]: {
          content: buildReportText(report, source.columns, rows),
          recordCount: rows.length,
          generatedAt: new Date().toISOString(),
        },
      }))
      toast.success(`${report.title} generated from live data (${rows.length} records)`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not generate ${report.title}.`)
    } finally {
      setBusy(null)
    }
  }

  const handleExport = async (report: ReportMeta) => {
    setBusy(report.id)
    try {
      const { source, rows } = await reportService.getReportData(report)
      downloadTextFile(`${slug(report.title)}.csv`, buildCsv(source.columns, rows), 'text/csv')
      toast.success(`${report.title} exported (${rows.length} records)`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not export ${report.title}.`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and export conservation analytics across the management network."
        actions={
          <button type="button" className="btn-outline" onClick={() => void reload()}>
            <RefreshCw size={15} />
            Refresh
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search reports…" className="lg:w-72" />
      </div>

      {loading ? (
        <CardSkeleton count={8} aspect="aspect-[auto]" />
      ) : error ? (
        <ErrorState title="Could not load reports" message={error} onRetry={() => void reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No reports found" description="Try changing your search." icon={SearchX} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => {
            const Icon = icons[report.icon] ?? FileText
            const isBusy = busy === report.id
            return (
              <article key={report.id} className="card group flex flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-ink-700">
                    <Icon size={19} strokeWidth={1.6} />
                  </span>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">{report.id}</span>
                </div>
                <h3 className="mt-4 font-display text-[15px] font-semibold text-ink-950">{report.title}</h3>
                <p className="line-clamp-2 mt-1.5 flex-1 text-xs leading-relaxed text-ink-500">{report.description}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
                  Last generated: {generated[report.id] ? 'Just now' : formatDate(report.lastGenerated)}
                </p>
                <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                  <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => setViewing(report)}>
                    <Eye size={13} />
                    View
                  </button>
                  <button
                    type="button"
                    className="btn-outline flex-1 py-1.5 text-xs"
                    onClick={() => void handleGenerate(report)}
                    disabled={isBusy}
                  >
                    <RefreshCw size={13} />
                    {isBusy ? 'Working…' : 'Generate'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline flex-1 py-1.5 text-xs"
                    onClick={() => void handleExport(report)}
                    disabled={isBusy}
                  >
                    <Download size={13} />
                    Export
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ReportViewModal
        report={viewing}
        generated={viewing ? generated[viewing.id] : undefined}
        busy={viewing ? busy === viewing.id : false}
        onClose={() => setViewing(null)}
        onGenerate={(report) => void handleGenerate(report)}
      />
    </div>
  )
}

function ReportViewModal({
  report,
  generated,
  busy,
  onClose,
  onGenerate,
}: {
  report: ReportMeta | null
  generated: GeneratedReport | undefined
  busy: boolean
  onClose: () => void
  onGenerate: (report: ReportMeta) => void
}) {
  const { data, loading, error, reload } = useAsyncData(
    () => (report ? reportService.getReportData(report) : Promise.resolve(null)),
    [report?.id],
  )

  if (!report) return null

  const columns = data?.source.columns ?? []
  const rows = data?.rows ?? []

  return (
    <Modal open={report !== null} onClose={onClose} title={report.title} description={`Report preview • ${report.id}`} wide>
      <div className="rounded-xl border border-ink-200 bg-ink-50 p-6">
        <div className="flex items-center justify-between border-b border-ink-200 pb-4">
          <p className="label-caps">Wildlife Conservation Management System</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
            {generated ? `Generated ${formatDate(generated.generatedAt.slice(0, 10))}` : `Source • ${data?.source.resource ?? '—'}`}
          </span>
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-ink-950">{report.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{report.description}</p>

        {generated ? (
          <div className="mt-4 rounded-lg border border-ink-200 bg-white p-4">
            <p className="label-caps">Generated report • {generated.recordCount} records</p>
            <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-ink-700">{generated.content}</pre>
          </div>
        ) : loading ? (
          <p className="mt-4 text-sm text-ink-500">Loading live data…</p>
        ) : error ? (
          <div className="mt-4">
            <p className="text-sm text-status-red">{error}</p>
            <button type="button" className="btn-outline mt-3" onClick={() => void reload()}>
              Retry
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-ink-200 bg-white p-4">
            <p className="label-caps">Live preview • {rows.length} records</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-[11px] text-ink-600">
                <thead>
                  <tr className="border-b border-ink-200">
                    {columns.map((c) => (
                      <th key={c.key} className="whitespace-nowrap px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-400">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 12).map((row, i) => (
                    <tr key={i} className="border-b border-ink-100 last:border-0">
                      {columns.map((c) => (
                        <td key={c.key} className="whitespace-nowrap px-2 py-1.5">
                          {cellText(row[c.key]) || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 12 && (
              <p className="mt-2 text-[11px] text-ink-400">Showing 12 of {rows.length} records. Export for the full dataset.</p>
            )}
          </div>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn-outline" onClick={() => onGenerate(report)} disabled={busy}>
          <RefreshCw size={14} />
          {busy ? 'Generating…' : 'Regenerate'}
        </button>
        <button type="button" className="btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}
