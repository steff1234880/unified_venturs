import type { ReactNode } from 'react'

import { Button } from '@/components/ui'
import { cn } from '@/utils'

import { Modal } from './Modal'

type PageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        <h1 className="font-display text-display-sm text-charcoal-900">{title}</h1>
        {description && (
          <p className="mt-2 text-body-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

type StatCardProps = {
  label: string
  value: number | string
  hint?: string
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-md sm:rounded-lg border border-border bg-surface-elevated p-5 shadow-xs">
      <p className="text-overline text-gold-600">{label}</p>
      <p className="mt-3 font-display text-display-sm text-charcoal-900">{value}</p>
      {hint && <p className="mt-2 text-caption text-muted-foreground">{hint}</p>}
    </div>
  )
}

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-ivory-50 px-6 py-16 text-center">
      <p className="text-heading-md text-charcoal-900">{title}</p>
      <p className="mt-2 max-w-sm text-body-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-body-md text-muted-foreground">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
