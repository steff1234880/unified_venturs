import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '@/utils'

const sizeStyles = {
  sm: 'h-9 px-3 text-body-sm',
  md: 'h-11 px-4 text-body-md',
  lg: 'h-12 px-5 text-body-lg',
} as const

export type SelectSize = keyof typeof sizeStyles

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  selectSize?: SelectSize
  hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      selectSize = 'md',
      hasError,
      disabled,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          className={cn(
            'w-full appearance-none rounded-md border bg-white pr-10',
            'font-body !text-charcoal-900 transition-luxury ds-focus-ring',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ivory-100',
            hasError
              ? 'border-destructive focus-visible:outline-destructive'
              : 'border-border hover:border-border-strong focus-visible:border-gold-400',
            sizeStyles[selectSize],
            className,
          )}
          style={{ color: 'var(--color-charcoal-900)', WebkitTextFillColor: 'var(--color-charcoal-900)', ...style }}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-charcoal-600"
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    )
  },
)

Select.displayName = 'Select'
