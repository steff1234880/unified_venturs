import { useState, type FormEvent } from 'react'
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

import { CollectionStatus } from '@/admin/components/CollectionStatus'
import { DataTable } from '@/admin/components/DataTable'
import { Modal } from '@/admin/components/Modal'
import { ConfirmDialog, PageHeader } from '@/admin/components/PageHeader'
import { useAdminCollection } from '@/admin/hooks/useAdminData'
import type { AdminTestimonial } from '@/admin/types'
import { Button, FormField, Input, Textarea } from '@/components/ui'

const emptyForm = { quote: '', name: '', role: '' }

export function AdminTestimonialsPage() {
  const { items, loading, error, create, update, remove } = useAdminCollection('testimonials')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminTestimonial | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)

    try {
      if (editing) {
        await update(editing.id, form)
      } else {
        await create(form)
      }

      setOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save testimonial.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Manage client testimonials."
        action={
          <Button
            variant="accent"
            onClick={() => {
              setEditing(null)
              setForm(emptyForm)
              setFormError(null)
              setOpen(true)
            }}
          >
            <HiOutlinePlus className="size-4" />
            Add Testimonial
          </Button>
        }
      />

      <CollectionStatus loading={loading} error={error} />

      {!loading && !error && (
        <DataTable
          data={items}
          keyExtractor={(item) => item.id}
          columns={[
            {
              key: 'name',
              header: 'Client',
              render: (item) => (
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-caption text-muted-foreground">{item.role}</p>
                </div>
              ),
            },
            {
              key: 'quote',
              header: 'Quote',
              render: (item) => <p className="line-clamp-2 max-w-xl">{item.quote}</p>,
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'w-32 whitespace-nowrap',
              render: (item) => (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item)
                      setForm({ quote: item.quote, name: item.name, role: item.role })
                      setFormError(null)
                      setOpen(true)
                    }}
                    className="size-11 inline-flex items-center justify-center rounded-md text-teak-600 hover:bg-ivory-100 ds-focus-ring"
                    aria-label={`Edit ${item.name}`}
                  >
                    <HiOutlinePencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="size-11 inline-flex items-center justify-center rounded-md text-destructive hover:bg-ivory-100 ds-focus-ring"
                    aria-label={`Delete ${item.name}`}
                  >
                    <HiOutlineTrash className="size-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Testimonial' : 'Add Testimonial'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField id="testimonial-name" label="Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FormField>
          <FormField id="testimonial-role" label="Location / Role">
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </FormField>
          <FormField id="testimonial-quote" label="Quote" required>
            <Textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={4} required />
          </FormField>
          {formError && (
            <p className="text-body-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent" isLoading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete testimonial"
        message="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId)
          }
          setDeleteId(null)
        }}
      />
    </div>
  )
}
