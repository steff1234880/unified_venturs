import { createElement, type HTMLAttributes } from 'react'

import { cn } from '@/utils'

const headingStyles = {
  h1: 'text-display-lg',
  h2: 'text-display-md',
  h3: 'text-display-sm',
  h4: 'text-heading-lg',
  h5: 'text-heading-md',
  h6: 'text-heading-sm',
} as const

export type HeadingLevel = keyof typeof headingStyles

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingLevel
}

export function Heading({ as: Tag = 'h2', className, ...props }: HeadingProps) {
  return createElement(Tag, {
    className: cn(headingStyles[Tag], 'text-charcoal-900', className),
    ...props,
  })
}

const textStyles = {
  lg: 'text-body-lg',
  md: 'text-body-md',
  sm: 'text-body-sm',
  caption: 'text-caption text-muted-foreground',
  overline: 'text-overline text-charcoal-700',
} as const

export type TextVariant = keyof typeof textStyles

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: TextVariant
  as?: 'p' | 'span' | 'div'
}

export function Text({
  as: Tag = 'p',
  variant = 'md',
  className,
  ...props
}: TextProps) {
  return createElement(Tag, {
    className: cn(textStyles[variant], className),
    ...props,
  })
}

export type OverlineProps = HTMLAttributes<HTMLSpanElement>

export function Overline({ className, ...props }: OverlineProps) {
  return (
    <span
      className={cn('text-overline text-gold-600', className)}
      {...props}
    />
  )
}

export type DisplayProps = HTMLAttributes<HTMLHeadingElement> & {
  size?: '2xl' | 'xl' | 'lg' | 'md' | 'sm'
  as?: 'h1' | 'h2' | 'p'
}

const displayStyles = {
  '2xl': 'text-display-2xl',
  xl: 'text-display-xl',
  lg: 'text-display-lg',
  md: 'text-display-md',
  sm: 'text-display-sm',
} as const

export function Display({
  as: Tag = 'h1',
  size = 'lg',
  className,
  ...props
}: DisplayProps) {
  return createElement(Tag, {
    className: cn(displayStyles[size], 'text-charcoal-900', className),
    ...props,
  })
}
