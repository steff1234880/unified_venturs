import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/utils'

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex cursor-pointer items-start gap-3',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <span
            className={cn(
              'size-5 rounded-sm border border-border-strong bg-surface-elevated',
              'transition-luxury peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
              'peer-focus-visible:outline-ring peer-checked:border-primary peer-checked:bg-primary',
              'peer-disabled:cursor-not-allowed',
            )}
            aria-hidden
          />
          <svg
            className="pointer-events-none absolute size-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label && (
          <span className="text-body-sm text-foreground">{label}</span>
        )}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
