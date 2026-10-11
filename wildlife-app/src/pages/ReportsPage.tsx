import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, Eye, FileDown, FileText, LifeBuoy, RefreshCw, SearchX, TreePine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { dashboardService } from '../services/dashboardService'
import type { ReportMeta } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'
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

export default function ReportsPage() {
  const { data, loading, reload } = useAsyncData(dashboardService.getReports, [])
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState<ReportMeta | null>(null)
  const [lastGenerated, setLastGenerated] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    const list = data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((r) => `${r.title} ${r.description}`.toLowerCase().includes(q))
  }, [data, search])

  const handleGenerate = (report: ReportMeta) => {
    setLastGenerated((prev) => ({ ...prev, [report.id]: 'Just now' }))
    toast.success(`${report.title} generated successfully`)
  }

  const handleExport = (report: ReportMeta) => {
    downloadTextFile(
      `${report.title.replace(/\s+/g, '-').toLowerCase()}.txt`,
      [
        `${report.title.toUpperCase()}`,
        '='.repeat(report.title.length),
        'Wildlife Conservation Management System • DBMS Project • Group B15',
        `Generated: ${formatDate(new Date().toISOString().slice(0, 10))}`,
        '',
        'This is a frontend placeholder export. Once the backend is connected,',
        'this report will be produced from the database in a structured format.',
      ].join('\n'),
    )
    toast.info(`${report.title} exported`)
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
      ) : filtered.length === 0 ? (
        <EmptyState title="No reports found" description="Try changing your search." icon={SearchX} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => {
            const Icon = icons[report.icon] ?? FileText
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
                  Last generated: {lastGenerated[report.id] ?? formatDate(report.lastGenerated)}
                </p>
                <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                  <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => setViewing(report)}>
                    <Eye size={13} />
                    View
                  </button>
                  <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => handleGenerate(report)}>
                    <RefreshCw size={13} />
                    Generate
                  </button>
                  <button type="button" className="btn-outline flex-1 py-1.5 text-xs" onClick={() => handleExport(report)}>
                    <Download size={13} />
                    Export
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ReportViewModal report={viewing} onClose={() => setViewing(null)} onGenerate={(report) => handleGenerate(report)} />
    </div>
  )
}

function ReportViewModal({
  report,
  onClose,
  onGenerate,
}: {
  report: ReportMeta | null
  onClose: () => void
  onGenerate: (report: ReportMeta) => void
}) {
  const [generatedAt, setGeneratedAt] = useState('')
  useEffect(() => {
    if (report) {
      setGeneratedAt(formatDate(new Date().toISOString().slice(0, 10)))
    }
  }, [report])

  if (!report) return null

  return (
    <Modal open={report !== null} onClose={onClose} title={report.title} description={`Report preview • ${report.id}`} wide>
      <div className="rounded-xl border border-ink-200 bg-ink-50 p-6">
        <div className="flex items-center justify-between border-b border-ink-200 pb-4">
          <p className="label-caps">Wildlife Conservation Management System</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">Generated {generatedAt}</span>
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-ink-950">{report.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{report.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['Records', '1,248'], ['Protected Areas', '12'], ['Reserves Active', '9'], ['Data Sources', '14']].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-ink-200 bg-white p-3">
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-400">{k}</p>
              <p className="mt-1 font-display text-xl font-semibold text-ink-950">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-ink-200 bg-white p-4">
          <p className="label-caps">Executive Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            This report consolidates current conservation records for review. The frontend preview shows the intended layout;
            actual values will be computed from the connected relational database when the backend is integrated.
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn-outline" onClick={() => onGenerate(report)}>
          <RefreshCw size={14} />
          Regenerate
        </button>
        <button type="button" className="btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}