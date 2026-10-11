import { MapPin, LocateFixed } from 'lucide-react'

export interface MapPoint {
  id: string
  label: string
  x: number
  y: number
}

interface MapVisualProps {
  points: MapPoint[]
  activeId?: string
  className?: string
}

export function MapVisual({ points, activeId, className = '' }: MapVisualProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-ink-200 bg-ink-50 ${className}`}>
      <svg viewBox="0 0 600 420" className="h-full w-full" role="img" aria-label="Schematic map of protected areas">
        <rect width="600" height="420" fill="#f3f3f5" />
        <g stroke="#e2e2e6" strokeWidth="1" fill="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M -40 ${-60 + i * 70} C 120 ${10 + i * 60}, 320 ${-30 + i * 80}, 660 ${80 + i * 55}`} />
          ))}
        </g>
        <g stroke="#d8d8de" strokeWidth="1.5">
          <path d="M 0 330 C 140 310, 200 350, 340 320 C 460 295, 520 330, 600 315" fill="none" opacity="0.6" />
          <path d="M 80 0 C 120 120, 95 220, 180 300" fill="none" opacity="0.55" strokeDasharray="4 5" />
        </g>
        <g className="pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={i * 75 + 30} y1="0" x2={i * 75 + 30} y2="420" stroke="#ececf0" strokeWidth="1" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 70 + 35} x2="600" y2={i * 70 + 35} stroke="#ececf0" strokeWidth="1" />
          ))}
        </g>
        <g stroke="#c3c3ca" strokeWidth="1.5" fill="none" opacity="0.85">
          <circle cx="150" cy="120" r="46" />
          <circle cx="150" cy="120" r="78" />
          <circle cx="430" cy="250" r="52" />
          <circle cx="430" cy="250" r="86" />
          <circle cx="330" cy="90" r="38" />
        </g>
        <g>
          {points.map((point) => (
            <g key={point.id} transform={`translate(${point.x} ${point.y})`}>
              <circle r="16" fill="#ffffff" opacity="0.9" />
              <circle r="8" fill={point.id === activeId ? '#17171b' : '#3d3d45'} />
              <circle r="2.5" fill="#ffffff" />
            </g>
          ))}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/5 to-transparent" aria-hidden="true" />

      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-ink-200 bg-white/90 px-3 py-1.5 backdrop-blur-sm">
        <LocateFixed size={13} className="text-ink-500" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-600">Southern India Reserves</span>
      </div>

      {points.map((point) => (
        <span
          key={point.id}
          className={`pointer-events-none absolute hidden -translate-x-1/2 -translate-y-11 whitespace-nowrap rounded-md border px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em] backdrop-blur-sm lg:block ${
            point.id === activeId ? 'border-ink-900 bg-ink-950 text-white' : 'border-ink-200 bg-white/90 text-ink-600'
          }`}
          style={{ left: `${(point.x / 600) * 100}%`, top: `${(point.y / 420) * 100}%` }}
          aria-hidden="true"
        >
          {point.label}
        </span>
      ))}

      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-ink-200 bg-white/90 px-3 py-1.5 backdrop-blur-sm">
        <MapPin size={13} className="text-ink-500" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-600">
          {points.length} protected areas
        </span>
      </div>
    </div>
  )
}