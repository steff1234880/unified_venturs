import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils'

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Reveal({ children, className, ...props }: RevealProps) {
  return (
    <div data-reveal className={className} {...props}>
      {children}
    </div>
  )
}

type RevealImageProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function RevealImage({ children, className, ...props }: RevealImageProps) {
  return (
    <div
      data-reveal-image
      className={cn('overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
}

type RevealTextProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function RevealText({ children, className, ...props }: RevealTextProps) {
  return (
    <div data-reveal-text className={cn('overflow-hidden', className)} {...props}>
      <div data-reveal-text-inner>{children}</div>
    </div>
  )
}
