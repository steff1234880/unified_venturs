import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/utils'

const variantStyles = {
  primary:
    'bg-primary text-primary-foreground border border-transparent shadow-xs hover:bg-[#1A1A1A] hover:border-charcoal-700 active:bg-black',
  secondary:
    'bg-surface-elevated text-charcoal-900 border border-border shadow-xs hover:border-gold-400 hover:bg-ivory-50 active:bg-ivory-100',
  accent:
    'bg-accent text-accent-foreground border border-gold-400/80 shadow-xs hover:bg-gold-300 hover:border-gold-500 active:bg-gold-500',
  outline:
    'border border-border-strong bg-transparent text-charcoal-900 hover:border-charcoal-900 hover:bg-charcoal-900/5 active:bg-charcoal-900/10',
  ivory:
    'bg-[#FAF9F6] text-charcoal-900 border border-[#FAF9F6] shadow-xs hover:bg-white hover:text-black hover:border-white hover:shadow-sm active:bg-ivory-100',
  'outline-ivory':
    'border border-[#FAF9F6]/45 bg-transparent text-[#FAF9F6] hover:border-[#FAF9F6] hover:bg-[#FAF9F6]/10 hover:text-white active:bg-[#FAF9F6]/20',
  ghost:
    'bg-transparent text-foreground hover:bg-ivory-100 hover:text-charcoal-900 active:bg-ivory-200',
  link: 'bg-transparent p-0 h-auto text-charcoal-900 underline-offset-4 hover:text-gold-600 hover:underline',
} as const

const sizeStyles = {
  sm: 'h-9 gap-2 px-4 text-caption tracking-wider uppercase font-medium',
  md: 'h-11 gap-2.5 px-6 text-body-sm tracking-wide font-medium',
  lg: 'h-11 sm:h-12 gap-2.5 px-6 sm:px-7 text-body-sm sm:text-body-md tracking-wide font-medium',
  icon: 'size-11 p-0',
} as const

export type ButtonVariant = keyof typeof variantStyles
export type ButtonSize = keyof typeof sizeStyles

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      isLoading = false,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center font-body font-medium tracking-wide',
          'rounded-sm sm:rounded-md transition-all duration-300 ease-out ds-focus-ring',
          'active:scale-[0.985] cursor-pointer select-none',
          'disabled:pointer-events-none disabled:opacity-50',
          variant !== 'link' && sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
