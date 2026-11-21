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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6"
      data-lenis-prevent="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        data-lenis-prevent="true"
        className={cn(
          'relative z-10 flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh]',
          'rounded-lg border border-border bg-white text-charcoal-900 shadow-2xl',
          'overflow-hidden',
          className,
        )}
      >
        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-border bg-white px-5 py-4">
          <h2 id="admin-modal-title" className="text-heading-md font-semibold text-charcoal-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 inline-flex size-10 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-ivory-100 hover:text-charcoal-900 ds-focus-ring cursor-pointer"
            aria-label="Close dialog"
          >
            <HiOutlineX className="size-5" />
          </button>
        </div>

        {/* Dedicated Scrollable Content Container */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6"
          data-lenis-prevent="true"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
