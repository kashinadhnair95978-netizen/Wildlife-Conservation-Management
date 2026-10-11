import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Binoculars,
  CircleHelp,
  FilePlus2,
  FileText,
  HeartPulse,
  Layers,
  LifeBuoy,
  MapPinned,
  PawPrint,
  Plus,
  Sprout,
  Siren,
} from 'lucide-react'
import { useAsyncData } from '../hooks/useAsyncData'
import { dashboardService } from '../services/dashboardService'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/ChartCard'
import { MonoTooltip, chartPalette } from '../components/chartTheme'
import { TeamCard } from '../components/TeamCard'
import { WildlifeImage } from '../components/WildlifeImage'
import { StatCardSkeleton } from '../components/LoadingSkeleton'
import { IMAGES } from '../config/images'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type QuickAction = { key: string; label: string; icon: typeof Sprout; path: string }

const quickActions: QuickAction[] = [
  { key: 'sighting', label: 'Record Sighting', icon: Binoculars, path: '/sightings' },
  { key: 'incident', label: 'Report Incident', icon: Siren, path: '/incidents' },
  { key: 'animal', label: 'Add Animal', icon: PawPrint, path: '/animals' },
  { key: 'species', label: 'Add Species', icon: Sprout, path: '/species' },
  { key: 'activity', label: 'Add Conservation Activity', icon: FilePlus2, path: '/conservation-activities' },
  { key: 'rescue', label: 'Add Rescue Operation', icon: LifeBuoy, path: '/rescue-operations' },
]

const feedIcons: Record<string, typeof Sprout> = {
  sighting: Binoculars,
  incident: Siren,
  health: HeartPulse,
  activity: Activity,
  rescue: LifeBuoy,
}

const team = [
  { name: 'Kashinadh Nair', rollNo: 'AM.SC.U4CSE25127', role: 'Team Member' },
  { name: 'Harishankar J', rollNo: 'AM.SC.U4CSE25122', role: 'Team Member' },
  { name: 'Sreegovind E J', rollNo: 'AM.SC.U4CSE25152', role: 'Team Member' },
  { name: 'Mohammad Rahan', rollNo: 'AM.SC.U4CSE25161', role: 'Team Member' },
]

const statConfig = [
  { key: 'totalSpecies', label: 'Total Species', icon: Sprout, supporting: 'Monitored species', trend: '+8.4%' },
  { key: 'totalAnimals', label: 'Total Animals', icon: PawPrint, supporting: 'Across 9 reserves', trend: '+4.1%' },
  { key: 'activeSightings', label: 'Active Sightings', icon: Binoculars, supporting: 'Last 30 days', trend: '+12.3%' },
  { key: 'protectedAreas', label: 'Protected Areas', icon: MapPinned, supporting: 'Covering 6 states', trend: '2 new' },
  { key: 'openIncidents', label: 'Open Incidents', icon: Siren, supporting: 'Down from 31 last month', trend: '−6.2%', trendUp: false },
  { key: 'conservationActivities', label: 'Conservation Activities', icon: Layers, supporting: 'Ongoing programs', trend: '+2.0%' },
] as const

export default function Dashboard() {
  const { data: stats, loading: statsLoading } = useAsyncData(dashboardService.getStats, [])
  const { data: sightings } = useAsyncData(dashboardService.getSightingsOverview, [])
  const { data: population } = useAsyncData(dashboardService.getSpeciesPopulation, [])
  const { data: incidents } = useAsyncData(dashboardService.getIncidentCategories, [])
  const { data: activityStatus } = useAsyncData(dashboardService.getActivityStatusBreakdown, [])
  const { data: feed } = useAsyncData(dashboardService.getActivityFeed, [])

  const activityTotal = useMemo(() => activityStatus?.reduce((sum, s) => sum + s.value, 0) ?? 0, [activityStatus])

  return (
    <div className="space-y-10">
      <Hero />
      <section className="space-y-10">
        <section aria-label="Key statistics">
          {statsLoading || !stats ? (
            <StatCardSkeleton count={6} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {statConfig.map((cfg, i) => (
                <StatCard
                  key={cfg.key}
                  label={cfg.label}
                  value={(stats as unknown as Record<string, number>)[cfg.key]}
                  icon={cfg.icon}
                  supporting={cfg.supporting}
                  trend={cfg.trend}
                  trendUp={(cfg as { trendUp?: boolean }).trendUp ?? true}
                  accent={i < 2 ? 'dark' : 'charcoal'}
                />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-2" aria-label="Analytics">
          <ChartCard title="Wildlife Sightings Overview" subtitle="Sightings recorded across protected areas, last 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={sightings ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#ececf0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9b9ba3' }} axisLine={{ stroke: '#ececf0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9b9ba3' }} axisLine={false} tickLine={false} />
                <Tooltip content={<MonoTooltip />} />
                <Line type="monotone" dataKey="sightings" name="Total sightings" stroke="#17171b" strokeWidth={2} dot={{ r: 2.5, fill: '#17171b' }} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="verified" name="Verified" stroke="#9b9ba3" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Species Population" subtitle="Current population estimates for monitored species">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={population ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#ececf0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9b9ba3' }} axisLine={{ stroke: '#ececf0' }} tickLine={false} interval={0} tickFormatter={(value) => (String(value).length > 12 ? String(value).slice(0, 11) + '…' : value)} />
                <YAxis tick={{ fontSize: 11, fill: '#9b9ba3' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                <Tooltip content={<MonoTooltip />} cursor={{ fill: '#f8f8f9' }} />
                <Bar dataKey="population" name="Population estimate" fill="#17171b" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Incident Analysis" subtitle="Incident categories reported in the current year">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={incidents ?? []} dataKey="count" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="#ffffff" strokeWidth={2}>
                  {(incidents ?? []).map((_, i) => (
                    <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<MonoTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
              {(incidents ?? []).map((item, i) => (
                <span key={item.name} className="flex items-center gap-2 text-[11px] text-ink-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[i % chartPalette.length] }} aria-hidden="true" />
                  {item.name}
                  <span className="ml-auto font-mono text-ink-400">{item.count}</span>
                </span>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Conservation Activity Status" subtitle="Distribution of programs across planning phases">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activityStatus ?? []} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#ececf0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9b9ba3' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#3d3d45' }} axisLine={false} tickLine={false} width={84} />
                <Tooltip content={<MonoTooltip />} cursor={{ fill: '#f8f8f9' }} />
                <Bar dataKey="value" name="Programs" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {(activityStatus ?? []).map((_, i) => (
                    <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-400">{activityTotal} programs tracked</p>
          </ChartCard>
        </section>

        <section className="grid gap-5 lg:grid-cols-5" aria-label="Activity and quick actions">
          <ChartCard title="Recent Activity" subtitle="Latest conservation actions across the network" className="lg:col-span-3">
            <ul className="divide-y divide-ink-100">
              {(feed ?? []).slice(0, 6).map((item) => {
                const Icon = feedIcons[item.icon] ?? Activity
                return (
                  <li key={item.id} className="flex items-start gap-3.5 py-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-ink-600">
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink-900">{item.title}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-400">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-[12px] font-medium text-ink-400">{item.timeAgo}</span>
                  </li>
                )
              })}
            </ul>
          </ChartCard>

          <div className="card p-5 lg:col-span-2">
            <h3 className="font-display text-[15px] font-semibold text-ink-900">Quick Actions</h3>
            <p className="mt-0.5 text-xs text-ink-500">Common operations available across modules.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((action) => (
                <li key={action.key}>
                  <Link
                    to={action.path}
                    className="group flex items-center gap-3 rounded-lg border border-ink-200 px-3.5 py-2.5 transition-all hover:border-ink-900 hover:bg-ink-950 hover:text-white"
                  >
                    <action.icon size={16} strokeWidth={1.75} className="text-ink-500 transition-colors group-hover:text-white" />
                    <span className="text-[13px] font-medium">{action.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/reports" className="btn-outline mt-4 w-full">
              <FileText size={15} />
              View Reports
            </Link>
          </div>
        </section>
      </section>

      <TeamSection />
      <MeetSupportSection />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-ink-200 shadow-card">
      <div className="absolute inset-0">
        <WildlifeImage src={IMAGES.hero} alt="Amazon rainforest ecosystem" className="h-full w-full object-cover" fallbackLabel="Sanctuary" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/25" aria-hidden="true" />
      </div>
      <div className="relative flex min-h-[380px] flex-col justify-end px-6 pb-10 pt-16 sm:px-10 sm:pb-12">
        <span className="mb-4 inline-flex w-fit items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-[12px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          DBMS Project • Group B15
        </span>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl">
          Wildlife Conservation
          <span className="block text-ink-200">Management System</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-200 sm:text-[15px]">
          A centralized platform for monitoring wildlife, habitats, threats and conservation activities.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/sightings" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
            Explore Dashboard
            <Plus size={15} className="rotate-45" />
          </Link>
          <Link to="/reports" className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/15">
            <FileText size={15} />
            View Reports
          </Link>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  return (
    <section aria-labelledby="team-heading">
      <div className="mb-6 text-center">
        <p className="label-caps">The Team</p>
        <h2 id="team-heading" className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-950">
          Meet the Team
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">The team behind the Wildlife Conservation Management System</p>
        <span className="mx-auto mt-4 block h-px w-16 bg-ink-800" aria-hidden="true" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <TeamCard key={member.rollNo} name={member.name} rollNo={member.rollNo} role={member.role} />
        ))}
      </div>
    </section>
  )
}

function MeetSupportSection() {
  return (
    <section className="grid gap-5 sm:grid-cols-2" aria-label="Support">
      <div className="card flex items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-ink-600">
          <CircleHelp size={20} strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink-900">Need help navigating?</h3>
          <p className="mt-1 text-sm text-ink-500">Explore the docs or reach the forest department desk for assistance with operations.</p>
        </div>
      </div>
      <div className="card flex items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-ink-600">
          <FileText size={20} strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink-900">Documentation</h3>
          <p className="mt-1 text-sm text-ink-500">The system is organized around a relational data model with service-based data access.</p>
        </div>
      </div>
    </section>
  )
}