import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/utils'

const sizeStyles = {
  sm: 'h-9 px-3 text-body-sm',
  md: 'h-11 px-4 text-body-md',
  lg: 'h-12 px-5 text-body-lg',
} as const

export type InputSize = keyof typeof sizeStyles

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: InputSize
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      inputSize = 'md',
      hasError,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        className={cn(
          'w-full rounded-md border bg-white font-body !text-charcoal-900',
          'placeholder:!text-charcoal-500 transition-luxury ds-focus-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ivory-100',
          hasError
            ? 'border-destructive focus-visible:outline-destructive'
            : 'border-border hover:border-border-strong focus-visible:border-gold-400',
          sizeStyles[inputSize],
          className,
        )}
        style={{ color: 'var(--color-charcoal-900)', WebkitTextFillColor: 'var(--color-charcoal-900)', ...style }}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
