import { forwardRef, type HTMLAttributes } from 'react'

import { cn } from '@/utils'

const variantStyles = {
  default:
    'bg-surface-elevated border border-border shadow-xs hover:border-gold-400 hover:shadow-md active:scale-[0.99]',
  elevated:
    'bg-surface-elevated border border-border shadow-xs hover:border-gold-400 hover:shadow-md active:scale-[0.99]',
  bordered:
    'bg-surface-elevated border border-border-strong hover:border-gold-500 active:scale-[0.99]',
  featured:
    'bg-surface-elevated border border-gold-400 shadow-sm relative overflow-hidden active:scale-[0.99]',
  ghost: 'bg-transparent',
} as const

const paddingStyles = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
} as const

export type CardVariant = keyof typeof variantStyles
export type CardPadding = keyof typeof paddingStyles

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  padding?: CardPadding
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'default', padding = 'md', children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md sm:rounded-lg transition-all duration-300 ease-luxury motion-reduce:transition-none motion-reduce:transform-none',
          variantStyles[variant],
          paddingStyles[padding],
          className,
        )}
        {...props}
      >
        {variant === 'featured' && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gold-400"
            aria-hidden
          />
        )}
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 sm:gap-2', className)}
      {...props}
    />
  ),
)

CardHeader.displayName = 'CardHeader'

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-display text-heading-md text-charcoal-900 tracking-tight', className)}
      {...props}
    />
  ),
)

CardTitle.displayName = 'CardTitle'

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
))

CardDescription.displayName = 'CardDescription'

export type CardContentProps = HTMLAttributes<HTMLDivElement>

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-3 sm:pt-4', className)} {...props} />
  ),
)

CardContent.displayName = 'CardContent'

export type CardFooterProps = HTMLAttributes<HTMLDivElement>

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 pt-4 sm:pt-6', className)}
      {...props}
    />
  ),
)

CardFooter.displayName = 'CardFooter'
