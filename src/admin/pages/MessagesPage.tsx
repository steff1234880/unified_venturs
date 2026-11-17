import { useState } from 'react'
import { HiOutlineEye, HiOutlineMailOpen, HiOutlineTrash } from 'react-icons/hi'

import { CollectionStatus } from '@/admin/components/CollectionStatus'
import { markMessageRead, deleteMessage } from '@/admin/storage'
import { DataTable } from '@/admin/components/DataTable'
import { Modal } from '@/admin/components/Modal'
import { ConfirmDialog, PageHeader } from '@/admin/components/PageHeader'
import { useAdminCollection } from '@/admin/hooks/useAdminData'
import { formatDate } from '@/admin/utils'
import type { ContactMessage } from '@/admin/types'
import { buildWhatsAppUrl } from '@/config/whatsapp'
import { cn } from '@/utils'

function buildReplyMailto(message: ContactMessage) {
  const subject = encodeURIComponent(
    `Re: ${message.projectType || 'Interior design'} enquiry`,
  )
  const body = encodeURIComponent(
    [
      `Hi ${message.firstName},`,
      '',
      'Thank you for your enquiry.',
      '',
      '---',
      `Original message:`,
      message.message,
    ].join('\n'),
  )

  return `mailto:${message.email}?subject=${subject}&body=${body}`
}

function DetailItem({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href?: string
}) {
  return (
    <div>
      <p className="text-overline text-gold-600">{label}</p>
      {href ? (
        <a
          href={href}
          className="mt-1 block text-body-md font-medium text-charcoal-900 underline-offset-2 hover:text-teak-700 hover:underline ds-focus-ring"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 text-body-md font-medium text-charcoal-900">{value}</p>
      )}
    </div>
  )
}

export function AdminMessagesPage() {
  const { items, loading, error, refresh } = useAdminCollection('messages')
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openMessage = async (message: ContactMessage) => {
    setSelected(message)

    if (!message.read) {
      await markMessageRead(message.id, true)
      await refresh()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Messages"
        description="Enquiries submitted from the contact form."
      />

      <CollectionStatus loading={loading} error={error} />

      {!loading && !error && (
        <DataTable
          data={[...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
          keyExtractor={(item) => item.id}
          emptyMessage="No messages received yet."
          columns={[
            {
              key: 'from',
              header: 'From',
              render: (item) => (
                <div>
                  <p className={cn('font-medium text-charcoal-900', !item.read && 'text-teak-700')}>
                    {item.firstName} {item.lastName}
                    {!item.read && (
                      <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-caption text-gold-700">
                        New
                      </span>
                    )}
                  </p>
                  <p className="text-caption text-charcoal-700">{item.email}</p>
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Project',
              render: (item) => (
                <span className="text-charcoal-900">{item.projectType || '—'}</span>
              ),
            },
            {
              key: 'date',
              header: 'Received',
              render: (item) => (
                <span className="text-charcoal-900">{formatDate(item.createdAt)}</span>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'w-40 whitespace-nowrap',
              render: (item) => (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => void openMessage(item)}
                    className="size-11 inline-flex items-center justify-center rounded-md text-teak-600 hover:bg-ivory-100 ds-focus-ring"
                    aria-label="View message"
                  >
                    <HiOutlineEye className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void markMessageRead(item.id, !item.read).then(refresh)}
                    className="size-11 inline-flex items-center justify-center rounded-md text-charcoal-700 hover:bg-ivory-100 ds-focus-ring"
                    aria-label="Toggle read"
                  >
                    <HiOutlineMailOpen className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="size-11 inline-flex items-center justify-center rounded-md text-destructive hover:bg-ivory-100 ds-focus-ring"
                    aria-label="Delete message"
                  >
                    <HiOutlineTrash className="size-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Message Details">
        {selected && (
          <div className="space-y-5 text-charcoal-900">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Name"
                value={`${selected.firstName} ${selected.lastName}`.trim() || '—'}
              />
              <DetailItem label="Received" value={formatDate(selected.createdAt)} />
              <DetailItem
                label="Email"
                value={selected.email || '—'}
                href={selected.email ? `mailto:${selected.email}` : undefined}
              />
              <DetailItem
                label="Phone"
                value={selected.phone || '—'}
                href={
                  selected.phone
                    ? `tel:${selected.phone.replace(/\D/g, '')}`
                    : undefined
                }
              />
            </div>

            <DetailItem label="Project Type" value={selected.projectType || '—'} />

            <div>
              <p className="text-overline text-gold-600">Message</p>
              <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-ivory-50 p-4 text-body-md leading-relaxed text-charcoal-900">
                {selected.message || '—'}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
              {selected.phone && (
                <a
                  href={buildWhatsAppUrl(
                    selected.phone,
                    `Hi ${selected.firstName}, thank you for your enquiry about ${selected.projectType || 'our services'}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border-strong bg-white px-6 text-body-sm font-medium text-charcoal-900 transition-luxury hover:border-gold-400 hover:text-teak-700"
                >
                  Reply via WhatsApp
                </a>
              )}
              <a
                href={buildReplyMailto(selected)}
                className="inline-flex h-11 items-center justify-center rounded-md bg-charcoal-900 px-6 text-body-sm font-medium text-ivory-50 transition-luxury hover:bg-teak-700"
              >
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete message"
        message="This message will be permanently removed."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteMessage(deleteId)
            await refresh()
          }
          setDeleteId(null)
        }}
      />
    </div>
  )
}
