import { cn } from '@/utils'

type ScrollIndicatorProps = {
  label?: string
  onClick?: () => void
  className?: string
}

export function ScrollIndicator({
  label = 'Scroll',
  onClick,
  className,
}: ScrollIndicatorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-hero-scroll
      className={cn(
        'group absolute bottom-4 sm:bottom-8 left-1/2 z-20 hidden sm:flex -translate-x-1/2 flex-col items-center gap-3',
        'text-ivory-100/70 transition-colors hover:text-ivory-50 ds-focus-ring',
        className,
      )}
      aria-label="Scroll to explore"
    >
      <span className="text-overline">{label}</span>
      <span className="relative flex h-14 w-px overflow-hidden bg-ivory-100/20">
        <span
          data-hero-scroll-line
          className="absolute inset-x-0 top-0 h-1/2 w-full bg-linear-to-b from-gold-400 to-transparent"
        />
      </span>
    </button>
  )
}
