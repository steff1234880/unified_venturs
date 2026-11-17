import { useState, type FormEvent } from 'react'
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

import { ImageUpload } from '@/admin/components/ImageUpload'
import { CollectionStatus } from '@/admin/components/CollectionStatus'
import { DataTable } from '@/admin/components/DataTable'
import { Modal } from '@/admin/components/Modal'
import { ConfirmDialog, PageHeader } from '@/admin/components/PageHeader'
import { useAdminCollection } from '@/admin/hooks/useAdminData'
import type { AdminGalleryItem } from '@/admin/types'
import { Button, Checkbox, FormField, Input } from '@/components/ui'

const emptyForm = { src: '', alt: '', collection: 'General', tall: false }

export function AdminGalleryPage() {
  const { items, loading, error, create, update, remove } = useAdminCollection('gallery')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminGalleryItem | null>(null)
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
      setFormError(err instanceof Error ? err.message : 'Failed to save image.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Manage gallery images and collections."
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
            Add Image
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
              key: 'image',
              header: 'Preview',
              render: (item) => (
                <img src={item.src} alt="" className="size-14 rounded-md object-cover" />
              ),
            },
            { key: 'alt', header: 'Alt Text', render: (item) => item.alt },
            { key: 'collection', header: 'Collection', render: (item) => item.collection },
            { key: 'tall', header: 'Tall', render: (item) => (item.tall ? 'Yes' : 'No') },
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
                        src: item.src,
                        alt: item.alt,
                        collection: item.collection,
                        tall: item.tall,
                      })
                      setFormError(null)
                      setOpen(true)
                    }}
                    className="size-11 inline-flex items-center justify-center rounded-md text-teak-600 hover:bg-ivory-100 ds-focus-ring"
                    aria-label={`Edit ${item.alt || 'image'}`}
                  >
                    <HiOutlinePencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="size-11 inline-flex items-center justify-center rounded-md text-destructive hover:bg-ivory-100 ds-focus-ring"
                    aria-label={`Delete ${item.alt || 'image'}`}
                  >
                    <HiOutlineTrash className="size-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Image' : 'Add Image'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            id="gallery-src"
            label="Gallery Image"
            folder="gallery"
            value={form.src}
            onChange={(src) => setForm({ ...form, src })}
            required
          />
          <FormField id="gallery-alt" label="Alt Text" required>
            <Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} required />
          </FormField>
          <FormField id="gallery-collection" label="Collection">
            <Input value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} />
          </FormField>
          <Checkbox
            label="Tall layout"
            checked={form.tall}
            onChange={(e) => setForm({ ...form, tall: e.target.checked })}
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
        title="Delete image"
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
