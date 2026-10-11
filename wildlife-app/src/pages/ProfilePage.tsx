import { Avatar } from '../components/Avatar'
import { PageHeader } from '../components/PageHeader'
import { WildlifeImage } from '../components/WildlifeImage'
import { IMAGES } from '../config/images'
import { formatDate } from '../lib/format'

const linkedModules = [
  { label: 'Sightings Verified', value: '142' },
  { label: 'Incidents Logged', value: '38' },
  { label: 'Rescues Coordinated', value: '11' },
  { label: 'Patrol Hours', value: '1,240' },
]

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="User Profile" subtitle="Manage your personal account details and system preferences." />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar label="Kashinadh Nair" size="lg" />
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-950">Kashinadh Nair</h2>
            <p className="mt-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-400">Forest Officer</p>
            <span className="mt-3 inline-flex items-center rounded-full border border-ink-200 bg-ink-50 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-600">
              AM.SC.U4CSE25127
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-ink-100 pt-6">
            {linkedModules.map((m) => (
              <div key={m.label} className="rounded-lg border border-ink-200 bg-ink-50 p-3 text-center">
                <p className="font-display text-xl font-semibold text-ink-950">{m.value}</p>
                <p className="mt-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-ink-400">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="card p-6">
            <h3 className="font-display text-[15px] font-semibold text-ink-900">Account</h3>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Detail label="Full Name" value="Kashinadh Nair" />
              <Detail label="Role" value="Forest Officer / System Administrator" />
              <Detail label="Email" value="kashinadh.nair@forest.gov.in" />
              <Detail label="Phone" value="+91 98470 00000" />
              <Detail label="Organization" value="Kerala Forests &amp; Wildlife Department" />
              <Detail label="Member Since" value={formatDate('2025-06-01')} />
            </dl>
          </div>

          <div className="card overflow-hidden">
            <div className="relative h-40">
              <WildlifeImage src={IMAGES.patrol} alt="Forest patrol working with a herd in a reserve" className="h-full w-full object-cover" fallbackLabel="Fieldwork" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" aria-hidden="true" />
              <p className="absolute bottom-3 left-4 font-display text-sm font-semibold text-white">Fieldwork Focus</p>
            </div>
            <div className="p-6">
              <h3 className="font-display text-[15px] font-semibold text-ink-900">Current Assignments</h3>
              <ul className="mt-3 space-y-3">
                {[
                  { title: 'Periyar Habitat Restoration', meta: 'Active • progress 64%' },
                  { title: 'Night Patrol Intensification', meta: 'Active • progress 22%' },
                  { title: 'Village Awareness Drive', meta: 'Active • progress 45%' },
                ].map((a) => (
                  <li key={a.title} className="flex items-center justify-between rounded-lg border border-ink-200 px-4 py-3">
                    <span className="text-sm font-medium text-ink-800">{a.title}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">{a.meta}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink-800">{value}</dd>
    </div>
  )
}