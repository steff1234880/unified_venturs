import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'

import { Label } from '@/components/ui/Label'
import { cn } from '@/utils'

export type FormFieldProps = {
  id: string
  label?: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

export function FormField({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const child = Children.only(children)

  const isDomElement = typeof child === 'object' && child !== null && typeof (child as ReactElement).type === 'string'

  const control = isValidElement(child)
    ? cloneElement(child as ReactElement<Record<string, unknown>>, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        ...(isDomElement ? {} : { hasError: error ? true : undefined }),
      })
    : child

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}

      {control}

      {hint && !error && (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-caption text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
