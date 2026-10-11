interface AvatarProps {
  label: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
}

const palettes = [
  'bg-ink-100 text-ink-700',
  'bg-[#efefef] text-ink-800',
  'bg-[#e6e6e6] text-ink-700',
]

function hashChar(label: string): number {
  const code = label.charCodeAt(0) || 0
  return code % palettes.length
}

export function Avatar({ label, size = 'md', className = '' }: AvatarProps) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-ink-200 font-semibold tracking-wide select-none ${palettes[hashChar(label)]} ${sizes[size]} ${className}`}
    >
      <span
        className="bg-clip-text font-sans"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgba(0,0,0,0.06), transparent 60%), radial-gradient(circle at 70% 75%, rgba(0,0,0,0.10), transparent 55%)',
        }}
      >
        {initials}
      </span>
    </span>
  )
}