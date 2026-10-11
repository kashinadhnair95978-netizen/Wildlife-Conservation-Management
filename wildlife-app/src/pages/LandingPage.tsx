import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Binoculars,
  Check,
  FileText,
  HeartHandshake,
  Layers,
  Leaf,
  LifeBuoy,
  MapPinned,
  PawPrint,
  ShieldCheck,
  Siren,
  Sprout,
  Stethoscope,
} from 'lucide-react'
import { IMAGES } from '../config/images'
import { dashboardService } from '../services/dashboardService'
import { useAsyncData } from '../hooks/useAsyncData'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggle } from '../components/ThemeToggle'
import { TeamCard } from '../components/TeamCard'

const features = [
  {
    icon: Sprout,
    title: 'Species Registry',
    description: 'A living catalogue of every monitored species, from flagship predators to endemic birds.',
  },
  {
    icon: PawPrint,
    title: 'Animal Tracking',
    description: 'Individual profiles with populations, health status and movement histories per reserve.',
  },
  {
    icon: Binoculars,
    title: 'Sighting Records',
    description: 'Log and verify field sightings with timestamps, locations and observer attribution.',
  },
  {
    icon: Siren,
    title: 'Incidents & Threats',
    description: 'Report poaching, fire and conflict incidents with severity escalation and follow-up states.',
  },
  {
    icon: LifeBuoy,
    title: 'Rescue Operations',
    description: 'Coordinate rescue missions end-to-end, from distress call to rehabilitation and release.',
  },
  {
    icon: MapPinned,
    title: 'Protected Areas',
    description: 'Map parks, sanctuaries and their boundaries with coverage across six states.',
  },
  {
    icon: Stethoscope,
    title: 'Animal Health',
    description: 'Track examinations, treatments and vitals so every animal receives the care it needs.',
  },
  {
    icon: FileText,
    title: 'Reports & Analytics',
    description: 'Trends, population curves and activity breakdowns rendered in an instant.',
  },
  {
    icon: ShieldCheck,
    title: 'Ranger Workforce',
    description: 'Manage patrol assignments and ranger teams that protect the front line.',
  },
]

const teamMembers = [
  { name: 'Kashinadh Nair', rollNo: 'AM.SC.U4CSE25127', role: 'Team Member' },
  { name: 'Harishankar J', rollNo: 'AM.SC.U4CSE25122', role: 'Team Member' },
  { name: 'Sreegovind E J', rollNo: 'AM.SC.U4CSE25152', role: 'Team Member' },
  { name: 'Mohammad Rahan', rollNo: 'AM.SC.U4CSE25161', role: 'Team Member' },
]

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Showcase', href: '#showcase' },
  { label: 'Team', href: '#team' },
]

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

function useCountUp(target: number, start: boolean, duration = 1300): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])

  return value
}

function Stat({ value, label, active }: { value: number; label: string; active: boolean }) {
  const count = useCountUp(value, active)
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center sm:py-12">
      <span className="text-4xl font-semibold tracking-tight text-ink-950 tabular-nums dark:text-white sm:text-5xl">
        {count.toLocaleString()}
        <span className="text-ink-400 dark:text-ink-500">+</span>
      </span>
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
        {label}
      </span>
    </div>
  )
}

function ShowcaseRow({
  eyebrow,
  title,
  copy,
  image,
  alt,
  points,
  reversed = false,
}: {
  eyebrow: string
  title: string
  copy: string
  image: string
  alt: string
  points: string[]
  reversed?: boolean
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={reversed ? 'lg:order-2' : ''}>
        <div className="group relative overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card dark:border-ink-800 dark:bg-ink-900 dark:shadow-none">
          <img
            src={image}
            alt={alt}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/30 to-transparent" aria-hidden="true" />
        </div>
      </Reveal>
      <Reveal delay={120} className={reversed ? 'lg:order-1' : ''}>
        <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-ink-400 dark:text-ink-500">
          {eyebrow}
        </p>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-4xl">
          {title}
        </h3>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-600 dark:text-ink-300">{copy}</p>
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-[15px] text-ink-700 dark:text-ink-200">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-950 text-white dark:bg-white dark:text-ink-950">
                <Check size={11} strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  )
}

export default function LandingPage() {
  const { theme } = useTheme()
  const { data: stats } = useAsyncData(dashboardService.getStats, [])
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800 transition-colors duration-300 dark:bg-ink-950 dark:text-ink-200">
      <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/70 backdrop-blur-xl dark:border-ink-800/70 dark:bg-ink-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Wildlife Conservation Home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-300 bg-ink-950 text-white dark:border-ink-700 dark:bg-white dark:text-ink-950">
              <PawPrint size={16} strokeWidth={2} />
            </span>
            <span className="font-sans text-[15px] font-semibold tracking-tight text-ink-950 dark:text-white">
              Wildlife<span className="text-ink-400 dark:text-ink-500">.Conservation</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Landing navigation">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 md:ml-0">
            <ThemeToggle />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-ink-950 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-ink-700 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-200"
            >
              Open Console
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle at 15% 20%, #000 0, transparent 28%), radial-gradient(circle at 85% 15%, #000 0, transparent 30%), radial-gradient(circle at 50% 80%, #000 0, transparent 35%)',
            }}
          />
          <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-16 text-center sm:px-8 sm:pt-28 sm:pb-20">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-300 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200">
                <Leaf size={13} />
                DBMS Project · Group B15
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-tighter text-ink-950 dark:text-white sm:text-7xl">
                One platform.
                <br />
                <span className="bg-gradient-to-r from-ink-950 via-ink-500 to-ink-950 bg-clip-text text-transparent dark:from-white dark:via-ink-400 dark:to-white">
                  Every wild thing.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">
                Species, habitats, sightings and threats — monitored, recorded and protected in one
                Black&amp;nbsp;&&amp;nbsp;White console built for conservation teams.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-7 py-3.5 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-ink-700 hover:shadow-lift dark:bg-white dark:text-ink-950 dark:hover:bg-ink-200 sm:w-auto"
                >
                  Open the Console
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink-300 bg-white px-7 py-3.5 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-ink-950 hover:text-ink-950 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:hover:border-ink-300 sm:w-auto"
                >
                  Explore the Features
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={400} className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24">
            <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-900 dark:border-ink-800 dark:bg-ink-900">
              <img
                src={theme === 'dark' ? IMAGES.heroAlt : IMAGES.hero}
                alt="Wild elephants in a misty reserve"
                className="aspect-[16/8] w-full object-cover transition-all duration-500 sm:aspect-[16/7]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-ink-950/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md sm:bottom-6 sm:left-6">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white" aria-hidden="true" />
                12 protected areas · live monitoring
              </div>
            </div>
          </Reveal>
        </section>

        <section ref={statsRef} className="border-y border-ink-200 bg-white transition-colors duration-300 dark:border-ink-800 dark:bg-ink-925">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-ink-200 px-5 dark:divide-ink-800 sm:px-8 lg:grid-cols-4">
            <Stat value={stats?.totalSpecies ?? 86} label="Monitored Species" active={statsVisible} />
            <Stat value={stats?.totalAnimals ?? 1248} label="Tracked Animals" active={statsVisible} />
            <Stat value={stats?.protectedAreas ?? 12} label="Protected Areas" active={statsVisible} />
            <Stat value={stats?.activeSightings ?? 342} label="Active Sightings" active={statsVisible} />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-ink-400 dark:text-ink-500">
                The Platform
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-5xl">
                Everything conservation needs. Nothing it doesn&rsquo;t.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-600 dark:text-ink-300">
                A focused toolset for the field, the office and the research station.
              </p>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 90}>
                <div className="group h-full rounded-2xl border border-ink-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ink-950 hover:shadow-lift dark:border-ink-800 dark:bg-ink-900 dark:shadow-none dark:hover:border-ink-400">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-300 bg-ink-950 text-white transition-transform duration-300 group-hover:scale-110 dark:border-ink-700 dark:bg-white dark:text-ink-950">
                    <feature.icon size={19} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="showcase" className="scroll-mt-20 border-t border-ink-200 bg-white transition-colors duration-300 dark:border-ink-800 dark:bg-ink-925">
          <div className="mx-auto max-w-7xl space-y-24 px-5 py-20 sm:px-8 sm:py-28">
            <ShowcaseRow
              eyebrow="Registry & Sightings"
              title="Track every species, one profile at a time."
              copy="From flagship predators to endemic birds, every species and animal gets a living profile — population, sightings, health and history."
              image={IMAGES.species.tiger}
              alt="A tiger in natural habitat"
              points={['Individual animal profiles per reserve', 'Field sighting logs with verification states', 'Population trends powered by real records']}
            />
            <ShowcaseRow
              reversed
              eyebrow="Habitats & Protected Areas"
              title="See the landscape change in real time."
              copy="Boundaries, habitats and protected areas stay mapped and current, so teams always know what is where and who protects it."
              image={IMAGES.habitat.forest}
              alt="A misty protected forest"
              points={['Protected areas across six states', 'Habitat classification for every region', 'Incident and threat escalation with severity ranks']}
            />
            <ShowcaseRow
              eyebrow="Response & Health"
              title="From distress call to release, handled end to end."
              copy="Rescue operations, animal health and ranger patrols coordinate in a single queue — so nothing falls through the cracks."
              image={IMAGES.rescue}
              alt="Animal rescue operation in progress"
              points={['Rescue missions with clear statuses', 'Health records, treatments and vitals', 'Ranger patrol and workforce assignments']}
            />
          </div>
        </section>

        <section className="border-y border-ink-200 bg-white transition-colors duration-300 dark:border-ink-800 dark:bg-ink-925">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="flex items-end justify-between gap-6">
              <div>
                <Reveal>
                  <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-ink-400 dark:text-ink-500">
                    Built by B15
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-4xl">
                    The team behind the wild.
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={100} className="hidden sm:flex">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-300 bg-ink-50 px-4 py-2 text-xs font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200">
                  <Layers size={13} />
                  Database Systems · Group B15
                </span>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((member) => (
                  <TeamCard key={member.rollNo} {...member} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-ink-950 text-white transition-colors duration-300 dark:bg-ink-900">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0, transparent 30%), radial-gradient(circle at 80% 70%, #fff 0, transparent 35%)',
            }}
          />
          <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
                <HeartHandshake size={13} />
                Conservation, digitized
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Begin protecting what matters.
              </h2>
            </Reveal>
            <Reveal delay={220}>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
                Step into the console and see the whole ecosystem at a glance — ready for the field, the office and the future.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-ink-950 transition-all hover:-translate-y-0.5 hover:bg-ink-200 sm:w-auto"
                >
                  Open the Console
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/10 sm:w-auto"
                >
                  Revisit Features
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200 bg-white transition-colors duration-300 dark:border-ink-800 dark:bg-ink-925">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:px-8">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold tracking-tight text-ink-950 dark:text-white">
              <PawPrint size={15} strokeWidth={2} />
              Wildlife Conservation Management System
            </p>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
              A Database System for Wildlife Conservation
            </p>
          </div>
          <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
            DBMS Project
            <span className="inline-block h-1 w-1 rounded-full bg-ink-300 dark:bg-ink-600" aria-hidden="true" />
            Group B15
          </p>
        </div>
      </footer>
    </div>
  )
}