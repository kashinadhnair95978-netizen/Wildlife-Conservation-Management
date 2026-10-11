export function SkeletonRow({ cells }: { cells: number }) {
  return (
    <div className="flex animate-pulse items-center gap-4 border-b border-ink-100 px-4 py-4">
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className={`h-3.5 rounded-full bg-ink-150 ${i === 0 ? 'w-20' : 'flex-1'}`} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cells = 5 }: { rows?: number; cells?: number }) {
  return (
    <div className="card overflow-hidden" aria-label="Loading table data" role="status">
      <div className="flex animate-pulse items-center gap-4 border-b border-ink-200 bg-ink-50 px-4 py-3">
        {Array.from({ length: cells }).map((_, i) => (
          <div key={i} className={`h-3 rounded-full bg-ink-200 ${i === 0 ? 'w-24' : 'flex-1'}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cells={cells} />
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3, aspect = 'aspect-[4/3]' }: { count?: number; aspect?: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading cards" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
          <div className={`${aspect} bg-ink-150`} />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 rounded-full bg-ink-150" />
            <div className="h-3 w-full rounded-full bg-ink-100" />
            <div className="h-3 w-1/2 rounded-full bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-ink-200 bg-white p-5 shadow-card">
          <div className="h-3 w-1/2 rounded-full bg-ink-150" />
          <div className="mt-3 h-7 w-2/3 rounded-full bg-ink-150" />
          <div className="mt-4 h-3 w-3/4 rounded-full bg-ink-100" />
        </div>
      ))}
    </div>
  )
}