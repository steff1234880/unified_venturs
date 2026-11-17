import { forwardRef, type ReactNode } from 'react'

import { cn } from '@/utils'

type SectionHeaderProps = {
  overline: string
  title: string
  description?: string
  align?: 'left' | 'center'
  dark?: boolean
  className?: string
}

export function SectionHeader({
  overline,
  title,
  description,
  align = 'left',
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      data-reveal
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <p
        className={cn(
          'text-overline',
          dark ? 'text-gold-400' : 'text-gold-600',
        )}
      >
        {overline}
      </p>
      <h2
        className={cn(
          'mt-2.5 sm:mt-3 text-display-md text-balance md:text-display-lg tracking-tight font-medium',
          dark ? 'text-ivory-50' : 'text-charcoal-900',
        )}
      >
        {title}
      </h2>
      <span
        data-reveal
        className={cn(
          'ornament-line mt-4 sm:mt-5',
          align === 'center' && 'mx-auto',
        )}
        aria-hidden
      />
      {description && (
        <p
          data-reveal
          className={cn(
            'mt-4 sm:mt-5 text-body-md sm:text-body-lg text-pretty leading-relaxed',
            dark ? 'text-ivory-100/75' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}

type SectionShellProps = {
  id?: string
  children: ReactNode
  className?: string
  dark?: boolean
}

export const SectionShell = forwardRef<HTMLElement, SectionShellProps>(
  ({ id, children, className, dark = false }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          'ds-section relative overflow-hidden',
          dark ? 'bg-charcoal-900 text-ivory-50' : 'bg-background',
          className,
        )}
      >
        {children}
      </section>
    )
  },
)

SectionShell.displayName = 'SectionShell'
