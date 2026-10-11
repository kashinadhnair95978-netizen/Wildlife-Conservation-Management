import { useState } from 'react'
import { PawPrint } from 'lucide-react'

interface WildlifeImageProps {
  src: string
  alt: string
  className?: string
  fallbackLabel?: string
}

export function WildlifeImage({ src, alt, className = '', fallbackLabel }: WildlifeImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-ink-900 text-ink-300 ${className}`}
        role="img"
        aria-label={alt}
      >
        <PawPrint size={28} strokeWidth={1.25} />
        {fallbackLabel && (
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
            {fallbackLabel}
          </span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}