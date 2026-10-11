import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Binoculars, MapPinned, PawPrint, Search, ShieldCheck, Siren, Sprout, Trees } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { speciesService } from '../services/speciesService'
import { animalService } from '../services/animalService'
import { habitatService } from '../services/habitatService'
import { protectedAreaService } from '../services/protectedAreaService'
import { sightingService } from '../services/sightingService'
import { incidentService } from '../services/incidentService'
import { rangerService } from '../services/rangerService'
import { useDebounce } from '../hooks/useDebounce'
import { Avatar } from '../components/Avatar'

interface SearchResult {
  page: string
  title: string
  subtitle: string
  icon: LucideIcon
  kind: string
}

const iconFor = {
  species: Sprout,
  animals: PawPrint,
  habitats: Trees,
  areas: MapPinned,
  sightings: Binoculars,
  incidents: Siren,
  rangers: ShieldCheck,
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const debounced = useDebounce(query, 200)

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const q = debounced.trim().toLowerCase()
    if (!q) {
      setResults([])
      return
    }
    let cancelled = false
    const run = async () => {
      const [species, animals, habitats, areas, sightings, incidents, rangers] = await Promise.all([
        speciesService.getSpecies(),
        animalService.getAnimals(),
        habitatService.getHabitats(),
        protectedAreaService.getProtectedAreas(),
        sightingService.getSightings(),
        incidentService.getIncidents(),
        rangerService.getRangers(),
      ])
      if (cancelled) return
      const out: SearchResult[] = []
      species.forEach((s) => {
        if (`${s.commonName} ${s.scientificName}`.toLowerCase().includes(q)) {
          out.push({ page: '/species', title: s.commonName, subtitle: s.scientificName, icon: iconFor.species, kind: 'Species' })
        }
      })
      animals.forEach((a) => {
        if (`${a.name} ${a.id}`.toLowerCase().includes(q)) {
          out.push({ page: '/animals', title: a.name, subtitle: `${a.id} • ${a.speciesId}`, icon: iconFor.animals, kind: 'Animal' })
        }
      })
      habitats.forEach((h) => {
        if (`${h.name} ${h.location}`.toLowerCase().includes(q)) {
          out.push({ page: '/habitats', title: h.name, subtitle: h.location, icon: iconFor.habitats, kind: 'Habitat' })
        }
      })
      areas.forEach((a) => {
        if (`${a.name} ${a.location}`.toLowerCase().includes(q)) {
          out.push({ page: '/protected-areas', title: a.name, subtitle: a.location, icon: iconFor.areas, kind: 'Protected Area' })
        }
      })
      sightings.forEach((s) => {
        if (`${s.id} ${s.location}`.toLowerCase().includes(q)) {
          out.push({ page: '/sightings', title: `${s.id} — ${s.location}`, subtitle: s.date, icon: iconFor.sightings, kind: 'Sighting' })
        }
      })
      incidents.forEach((i) => {
        if (`${i.id} ${i.type} ${i.location}`.toLowerCase().includes(q)) {
          out.push({ page: '/incidents', title: `${i.id} — ${i.type}`, subtitle: i.location, icon: iconFor.incidents, kind: 'Incident' })
        }
      })
      rangers.forEach((r) => {
        if (`${r.name} ${r.assignedArea}`.toLowerCase().includes(q)) {
          out.push({ page: '/rangers', title: r.name, subtitle: r.assignedArea, icon: iconFor.rangers, kind: 'Ranger' })
        }
      })
      setResults(out)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [debounced, open])

  if (!open) return null

  const go = (result: SearchResult) => {
    onClose()
    navigate(result.page)
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Global search">
      <div className="animate-overlay-in absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="animate-fade-up relative w-full max-w-xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-modal">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5">
          <Search size={18} className="shrink-0 text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search species, animals, habitats, sightings…"
            aria-label="Search query"
            className="w-full bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
          />
          <kbd className="hidden rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-mono text-[9px] font-medium text-ink-400 sm:inline">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto scrollbar-thin">
          {debounced.trim() ? (
            results.length > 0 ? (
              <ul className="p-2">
                {results.slice(0, 24).map((result, i) => (
                  <li key={`${result.kind}-${i}`}>
                    <button
                      type="button"
                      onClick={() => go(result)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-ink-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-ink-600">
                        <result.icon size={16} strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{result.title}</span>
                        <span className="block truncate text-xs text-ink-400">{result.subtitle}</span>
                      </span>
                      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-ink-400">{result.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <Search size={22} className="text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-800">No results for “{debounced}”</p>
                <p className="mt-1 text-xs text-ink-400">Try a species, animal, location or incident type.</p>
              </div>
            )
          ) : (
            <div className="flex items-center gap-3 px-5 py-4 text-sm text-ink-500">
              <Avatar label="KC" size="sm" className="opacity-60" />
              <span>Search across species, animals, habitats, protected areas, sightings, incidents and rangers.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}