import { useState, type FormEvent } from 'react'
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

import { ImageUpload } from '@/admin/components/ImageUpload'
import { CollectionStatus } from '@/admin/components/CollectionStatus'
import { DataTable } from '@/admin/components/DataTable'
import { Modal } from '@/admin/components/Modal'
import { ConfirmDialog, PageHeader } from '@/admin/components/PageHeader'
import { useAdminCollection } from '@/admin/hooks/useAdminData'
import type { AdminService } from '@/admin/types'
import { Button, FormField, Input, Textarea } from '@/components/ui'

const emptyForm = { title: '', tagline: '', description: '', image: '' }

export function AdminServicesPage() {
  const { items, loading, error, create, update, remove } = useAdminCollection('services')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminService | null>(null)
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
      setFormError(err instanceof Error ? err.message : 'Failed to save service.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage service offerings."
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
            Add Service
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
              key: 'title',
              header: 'Service',
              render: (item) => (
                <div className="flex items-center gap-3">
                  <img src={item.image} alt="" className="size-12 rounded-md object-cover" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-caption text-muted-foreground">{item.tagline}</p>
                  </div>
                </div>
              ),
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
                      setForm({
                        title: item.title,
                        tagline: item.tagline,
                        description: item.description,
                        image: item.image,
                      })
                      setFormError(null)
                      setOpen(true)
                    }}
                    className="size-11 inline-flex items-center justify-center rounded-md text-teak-600 hover:bg-ivory-100 ds-focus-ring"
                    aria-label={`Edit ${item.title}`}
                  >
                    <HiOutlinePencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="size-11 inline-flex items-center justify-center rounded-md text-destructive hover:bg-ivory-100 ds-focus-ring"
                    aria-label={`Delete ${item.title}`}
                  >
                    <HiOutlineTrash className="size-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField id="service-title" label="Title" required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </FormField>
          <FormField id="service-tagline" label="Tagline">
            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </FormField>
          <FormField id="service-description" label="Description" required>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </FormField>
          <ImageUpload
            id="service-image"
            label="Service Image"
            folder="services"
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            required
          />
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
        title="Delete service"
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
