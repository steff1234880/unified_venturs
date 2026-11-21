import { useState, type FormEvent } from 'react'
import {
  HiArrowDown,
  HiArrowUp,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'react-icons/hi'

import { ImageUpload } from '@/admin/components/ImageUpload'
import { CollectionStatus } from '@/admin/components/CollectionStatus'
import { ConfirmDialog, PageHeader } from '@/admin/components/PageHeader'
import { DataTable } from '@/admin/components/DataTable'
import { Modal } from '@/admin/components/Modal'
import { useAdminCollection } from '@/admin/hooks/useAdminData'
import type { AdminCraftsmanshipItem } from '@/admin/types'
import { Button, Checkbox, FormField, Input, Textarea } from '@/components/ui'
import { cn } from '@/utils'

const emptyForm = {
  discipline: '',
  material: '',
  title: '',
  caption: '',
  provenance: '',
  finish: '',
  image: '',
  aspectRatio: 'aspect-4/3',
  published: true,
  order: 0,
}

export function AdminCraftsmanshipPage() {
  const { items, loading, error, create, update, remove } = useAdminCollection('craftsmanship')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCraftsmanshipItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Sort items by order (ascending)
  const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      order: sortedItems.length,
    })
    setFormError(null)
    setOpen(true)
  }

  const openEdit = (item: AdminCraftsmanshipItem) => {
    setEditing(item)
    setForm({
      discipline: item.discipline ?? '',
      material: item.material ?? '',
      title: item.title ?? '',
      caption: item.caption ?? '',
      provenance: item.provenance ?? '',
      finish: item.finish ?? '',
      image: item.image ?? '',
      aspectRatio: item.aspectRatio ?? 'aspect-4/3',
      published: item.published ?? true,
      order: item.order ?? 0,
    })
    setFormError(null)
    setOpen(true)
  }

  const handleTogglePublish = async (item: AdminCraftsmanshipItem) => {
    try {
      await update(item.id, { published: !item.published })
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return

    const currentItem = sortedItems[index]
    const targetItem = sortedItems[targetIndex]
    if (!currentItem || !targetItem) return

    const currentOrder = currentItem.order ?? index
    const targetOrder = targetItem.order ?? targetIndex

    try {
      await Promise.all([
        update(currentItem.id, { order: targetOrder }),
        update(targetItem.id, { order: currentOrder }),
      ])
    } catch (err) {
      console.error('Failed to reorder craftsmanship items:', err)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)

    if (!form.title.trim()) {
      setFormError('Title is required.')
      setSaving(false)
      return
    }

    if (!form.image.trim()) {
      setFormError('Please upload or provide an image URL.')
      setSaving(false)
      return
    }

    try {
      if (editing) {
        await update(editing.id, form)
      } else {
        await create(form)
      }
      setOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save craftsmanship item.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await remove(deleteId)
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete craftsmanship item:', err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Art of Craftsmanship"
        description="Manage the artisanal pillars, tactile finishes, materials, and workshop imagery displayed in the Craftsmanship section."
        action={
          <Button variant="accent" onClick={openCreate}>
            <HiOutlinePlus className="size-4" />
            Add Specimen
          </Button>
        }
      />

      <CollectionStatus loading={loading} error={error} />

      {!loading && !error && (
        <DataTable
          data={sortedItems}
          keyExtractor={(item) => item.id}
          columns={[
            {
              key: 'image',
              header: 'Specimen',
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.onerror = null
                          target.src = '/images/after-living-room.jpg'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-charcoal-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 max-w-[240px]">
                    <p className="truncate text-body-sm font-semibold text-charcoal-900">{item.title}</p>
                    <p className="truncate text-caption font-medium text-gold-700">{item.discipline}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'material',
              header: 'Material & Finish',
              render: (item) => (
                <div className="text-body-sm">
                  <p className="font-semibold text-charcoal-900">{item.material || '—'}</p>
                  <p className="text-caption text-charcoal-600">{item.finish || '—'}</p>
                </div>
              ),
            },
            {
              key: 'provenance',
              header: 'Provenance',
              render: (item) => (
                <span className="text-body-sm font-medium text-charcoal-700">
                  {item.provenance || '—'}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              className: 'w-28 whitespace-nowrap',
              render: (item) => {
                const isPublished = item.published !== false
                return (
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ds-focus-ring',
                      isPublished
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-muted text-charcoal-600 border border-border hover:bg-muted/80',
                    )}
                    title={isPublished ? 'Click to unpublish' : 'Click to publish'}
                  >
                    {isPublished ? (
                      <>
                        <HiOutlineEye className="size-3.5 text-emerald-700" />
                        Published
                      </>
                    ) : (
                      <>
                        <HiOutlineEyeOff className="size-3.5 text-charcoal-500" />
                        Hidden
                      </>
                    )}
                  </button>
                )
              },
            },
            {
              key: 'order',
              header: 'Order',
              className: 'w-20 whitespace-nowrap text-center',
              render: (item) => {
                const index = sortedItems.findIndex((p) => p.id === item.id)
                return (
                  <div className="inline-flex items-center gap-1">
                    <span className="w-5 text-right font-mono text-xs font-medium text-charcoal-700">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveOrder(index, 'up')}
                        className="inline-flex size-7 items-center justify-center rounded text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 disabled:opacity-25 disabled:hover:bg-transparent ds-focus-ring"
                        title="Move Up"
                        aria-label="Move item up in order"
                      >
                        <HiArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === sortedItems.length - 1}
                        onClick={() => handleMoveOrder(index, 'down')}
                        className="inline-flex size-7 items-center justify-center rounded text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 disabled:opacity-25 disabled:hover:bg-transparent ds-focus-ring"
                        title="Move Down"
                        aria-label="Move item down in order"
                      >
                        <HiArrowDown className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              },
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'w-24 whitespace-nowrap',
              render: (item) => (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="inline-flex size-9 items-center justify-center rounded-md text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 ds-focus-ring"
                    aria-label={`Edit ${item.title}`}
                    title="Edit Specimen"
                  >
                    <HiOutlinePencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="inline-flex size-9 items-center justify-center rounded-md text-destructive hover:bg-red-50 hover:text-red-700 ds-focus-ring"
                    aria-label={`Delete ${item.title}`}
                    title="Delete Specimen"
                  >
                    <HiOutlineTrash className="size-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Craftsmanship Item' : 'New Craftsmanship Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
          {formError && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-caption font-medium text-red-800">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <ImageUpload
              id="craftsmanship-image"
              label="Specimen Photograph"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="craftsmanship"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="craft-title" label="Item Title" required>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Honed Stone & Monolithic Veining"
                  required
                />
              </FormField>

              <FormField id="craft-discipline" label="Discipline / Guild" required>
                <Input
                  value={form.discipline}
                  onChange={(e) => setForm({ ...form, discipline: e.target.value })}
                  placeholder="e.g. Monumental Masonry"
                  required
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="craft-material" label="Material & Substrate">
                <Input
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  placeholder="e.g. Veined Marble & Laterite"
                />
              </FormField>

              <FormField id="craft-finish" label="Finish & Texture">
                <Input
                  value={form.finish}
                  onChange={(e) => setForm({ ...form, finish: e.target.value })}
                  placeholder="e.g. Silk-Honed Matte & Fluted Relief"
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="craft-provenance" label="Provenance / Source">
                <Input
                  value={form.provenance}
                  onChange={(e) => setForm({ ...form, provenance: e.target.value })}
                  placeholder="e.g. Master Stone Guilds"
                />
              </FormField>

              <FormField id="craft-aspect-ratio" label="Aspect Ratio / Orientation">
                <select
                  id="craft-aspect-ratio"
                  value={form.aspectRatio}
                  onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-body-sm font-medium text-charcoal-900 shadow-xs transition-colors focus:border-gold-500 focus:outline-none"
                >
                  <option value="aspect-4/5">Portrait (4:5)</option>
                  <option value="aspect-3/4">Tall Portrait (3:4)</option>
                  <option value="aspect-square">Square (1:1)</option>
                  <option value="aspect-4/3">Classic Landscape (4:3)</option>
                  <option value="aspect-16/10">Wide Landscape (16:10)</option>
                </select>
              </FormField>
            </div>

            <FormField id="craft-caption" label="Editorial Caption / Description">
              <Textarea
                id="craft-caption"
                rows={3}
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                placeholder="Describe the artisan technique, architectural context, or craftsmanship details..."
              />
            </FormField>

            <div className="rounded-md border border-border bg-ivory-50/80 p-3.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  id="craft-published"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                <span className="text-body-sm font-semibold text-charcoal-900">Published on website</span>
              </label>
              <p className="mt-1 pl-6 text-caption text-charcoal-600">
                Make this craftsmanship specimen visible on the Art of Craftsmanship section.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Specimen'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Craftsmanship Specimen"
        message="Are you sure you want to delete this craftsmanship item? This action will remove it from the database and the public website."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
