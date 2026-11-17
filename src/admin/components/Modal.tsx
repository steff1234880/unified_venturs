import type { ReactNode } from 'react'
import { HiOutlineX } from 'react-icons/hi'

import { useScrollLock } from '@/hooks'
import { cn } from '@/utils'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useScrollLock(open)

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={cn(
          'relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-md sm:rounded-lg',
          'border border-border bg-white text-charcoal-900 shadow-xl',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h2 id="admin-modal-title" className="text-heading-md text-charcoal-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 inline-flex size-11 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-ivory-100 hover:text-charcoal-900 ds-focus-ring"
            aria-label="Close"
          >
            <HiOutlineX className="size-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
