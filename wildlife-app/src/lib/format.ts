const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${monthNames[Number(m) - 1]} ${y}`
}

export function generateId(prefix: string): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${n}`
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function timeAgo(dateIso: string): string {
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) return 'recently'
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  return `${months} months ago`
}

export function speciesLabel(id: string, lookup: Record<string, string>): string {
  return lookup[id] ?? id
}