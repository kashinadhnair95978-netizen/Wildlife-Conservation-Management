import type { ReactNode } from 'react'

interface DataTableProps {
  columns: ReactNode[]
  children: ReactNode
  empty?: ReactNode
  className?: string
}

export function DataTable({ columns, children, empty, className = '' }: DataTableProps) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="th">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {empty && (
        <div className="border-t border-ink-100">
          {empty}
        </div>
      )}
    </div>
  )
}