import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, disabled, rows = 4, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        className={cn(
          'w-full resize-y rounded-md border bg-white px-4 py-3',
          'font-body text-body-md !text-charcoal-900',
          'placeholder:!text-charcoal-500 transition-luxury ds-focus-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ivory-100',
          hasError
            ? 'border-destructive focus-visible:outline-destructive'
            : 'border-border hover:border-border-strong focus-visible:border-gold-400',
          className,
        )}
        style={{ color: 'var(--color-charcoal-900)', WebkitTextFillColor: 'var(--color-charcoal-900)', ...style }}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
