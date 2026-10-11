import { useState } from 'react'
import { ChevronDown, CircleHelp, Mail, Phone, Database, Layers, FileText } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

const faqs = [
  {
    q: 'How do I record a wildlife sighting?',
    a: 'Open the Sightings module and choose Record Sighting. Fill in species, location, date-time, ranger and observed count, then submit. The record appears immediately in the sightings table.',
  },
  {
    q: 'How does reporting an incident work?',
    a: 'Use the Incidents module and click Report Incident. Provide the incident type, location, severity and description. Incidents start with an Open status and can move to Investigating and Resolved.',
  },
  {
    q: 'Where is the data stored right now?',
    a: 'The interface currently works on centralized mock data through a service layer. No backend is connected yet; the same service functions will later call your API and database.',
  },
  {
    q: 'Can I export reports?',
    a: 'Yes. The Reports module lets you view, generate and export each report. Exports download the live database records for that report as a CSV file.',
  },
  {
    q: 'How do the charts update?',
    a: 'Charts on the dashboard read from the same service functions as the tables. When the backend is connected, the data source can be swapped without touching the chart components.',
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ink-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-ink-900">{question}</span>
        <ChevronDown size={16} className={`shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-ink-600">{answer}</p>}
    </div>
  )
}

const guides = [
  { icon: Database, title: 'Data Architecture', description: 'Pages call service functions; services currently return mock data.', detail: 'src/services/' },
  { icon: Layers, title: 'Modules', description: 'Species, animals, habitats, sightings, incidents, threats and more.', detail: '14 modules' },
  { icon: FileText, title: 'Reports & Analytics', description: 'Live dashboard charts plus generated and CSV-exportable reports.', detail: 'src/pages/ReportsPage.tsx' },
]

export default function HelpPage() {
  return (
    <div>
      <PageHeader title="Help" subtitle="Guides and answers for working with the conservation management system." />

      <div className="mb-6 grid gap-8 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h3 className="font-display text-[15px] font-semibold text-ink-900">Frequently Asked Questions</h3>
          <div className="mt-2 divide-y divide-ink-100">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="card flex items-start gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-ink-600">
              <CircleHelp size={20} strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink-900">Forest Dept. Help Desk</h3>
              <p className="mt-1 text-sm text-ink-500">Operational support is available during field hours.</p>
              <div className="mt-3 space-y-1.5 text-sm text-ink-700">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-ink-400" />
                  help@forest.gov.in
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-ink-400" />
                  +91 471 232 1000
                </p>
              </div>
            </div>
          </div>

          {guides.map((guide) => (
            <div key={guide.title} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-ink-600">
                  <guide.icon size={16} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-sm font-semibold text-ink-900">{guide.title}</h3>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-500">{guide.description}</p>
              <span className="mt-2 inline-block rounded border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-[10px] font-medium text-ink-500">
                {guide.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}