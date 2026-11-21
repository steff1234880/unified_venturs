import { useState, type FormEvent } from 'react'
import {
  HiArrowDown,
  HiArrowUp,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi'

import { ImageUpload } from '@/admin/components/ImageUpload'
import { CollectionStatus } from '@/admin/components/CollectionStatus'
import { ConfirmDialog } from '@/admin/components/PageHeader'
import { DataTable } from '@/admin/components/DataTable'
import { Modal } from '@/admin/components/Modal'
import { PageHeader } from '@/admin/components/PageHeader'
import { useAdminCollection } from '@/admin/hooks/useAdminData'
import type { AdminProject } from '@/admin/types'
import { Button, Checkbox, FormField, Input } from '@/components/ui'
import { getProjectImagePlaceholder } from '@/utils/project-placeholder'
import { cn } from '@/utils'

const emptyForm = {
  title: '',
  location: '',
  category: '',
  year: new Date().getFullYear().toString(),
  area: '',
  image: '',
  description: '',
  images: [] as string[],
  published: true,
  featured: false,
  order: 0,
  beforeImage: '',
  afterImage: '',
  isTransformation: false,
}

export function AdminProjectsPage() {
  const { items, loading, error, create, update, remove } = useAdminCollection('projects')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProject | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [newImageUrl, setNewImageUrl] = useState('')
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
    setNewImageUrl('')
    setFormError(null)
    setOpen(true)
  }

  const openEdit = (project: AdminProject) => {
    setEditing(project)
    const existingImages =
      Array.isArray(project.images) && project.images.length > 0
        ? project.images
        : project.image
          ? [project.image]
          : []

    setForm({
      title: project.title,
      location: project.location,
      category: project.category,
      year: project.year,
      area: project.area,
      image: project.image,
      description: project.description ?? '',
      images: existingImages,
      published: project.published !== false,
      featured: project.featured,
      order: project.order ?? 0,
      beforeImage: project.beforeImage ?? '',
      afterImage: project.afterImage ?? project.image ?? '',
      isTransformation: project.isTransformation ?? Boolean(project.beforeImage),
    })
    setNewImageUrl('')
    setFormError(null)
    setOpen(true)
  }

  const handleAddImage = (url: string) => {
    if (!url || !url.trim()) return
    const trimmed = url.trim()
    if (!form.images.includes(trimmed)) {
      const nextImages = [...form.images, trimmed]
      setForm((prev) => ({
        ...prev,
        images: nextImages,
        image: prev.image ? prev.image : trimmed,
      }))
    }
    setNewImageUrl('')
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const nextImages = form.images.filter((_, idx) => idx !== indexToRemove)
    let nextCover = form.image
    if (form.image === form.images[indexToRemove]) {
      nextCover = nextImages[0] || ''
    }
    setForm((prev) => ({
      ...prev,
      images: nextImages,
      image: nextCover,
    }))
  }

  const handleSetPrimaryCover = (imgUrl: string) => {
    setForm((prev) => ({
      ...prev,
      image: imgUrl,
    }))
  }

  const handleReorder = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return

    const currentItem = sortedItems[currentIndex]
    const targetItem = sortedItems[targetIndex]
    if (!currentItem || !targetItem) return

    const currentOrder = currentItem.order ?? currentIndex
    const targetOrder = targetItem.order ?? targetIndex

    const newCurrentOrder = currentOrder === targetOrder ? targetIndex : targetOrder
    const newTargetOrder = currentOrder === targetOrder ? currentIndex : currentOrder

    try {
      await update(currentItem.id, { order: newCurrentOrder })
      await update(targetItem.id, { order: newTargetOrder })
    } catch (err) {
      console.error('Failed to reorder projects', err)
    }
  }

  const handleTogglePublished = async (project: AdminProject) => {
    const isCurrentlyPublished = project.published !== false
    try {
      await update(project.id, { published: !isCurrentlyPublished })
    } catch (err) {
      console.error('Failed to toggle published status', err)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)

    const finalImages = form.images.length > 0 ? form.images : (form.image ? [form.image] : [])
    // Projects without an uploaded photo are allowed; default to authentic photo
    const finalCover = form.image || finalImages[0] || getProjectImagePlaceholder(form.title)
    const finalizedImages = finalImages.length > 0 ? finalImages : [finalCover]

    const payload = {
      ...form,
      image: finalCover,
      images: finalizedImages,
    }

    try {
      if (editing) {
        await update(editing.id, payload)
      } else {
        await create(payload)
      }

      setOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage bespoke residence projects, multiple gallery photos, display order, and publication status."
        action={
          <Button variant="accent" onClick={openCreate}>
            <HiOutlinePlus className="size-4" aria-hidden />
            Add Project
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
              key: 'order',
              header: 'Order',
              className: 'w-20 whitespace-nowrap text-center',
              render: (item) => {
                const index = sortedItems.findIndex((p) => p.id === item.id)
                return (
                  <div className="inline-flex items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground w-5 text-right">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleReorder(index, 'up')}
                        className="size-7 inline-flex items-center justify-center rounded hover:bg-ivory-100 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-700 ds-focus-ring"
                        title="Move Up"
                        aria-label="Move project up in order"
                      >
                        <HiArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === sortedItems.length - 1}
                        onClick={() => handleReorder(index, 'down')}
                        className="size-7 inline-flex items-center justify-center rounded hover:bg-ivory-100 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-700 ds-focus-ring"
                        title="Move Down"
                        aria-label="Move project down in order"
                      >
                        <HiArrowDown className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              },
            },
            {
              key: 'title',
              header: 'Project',
              render: (item) => {
                const photosCount = Array.isArray(item.images) && item.images.length > 0 ? item.images.length : 1
                const imgSrc = item.image || getProjectImagePlaceholder(item.title)
                return (
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted">
                      <img
                        src={imgSrc}
                        alt=""
                        className="size-full object-cover"
                        onError={(e) => {
                          const fallback = getProjectImagePlaceholder(item.title)
                          if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                            ;(e.currentTarget as HTMLImageElement).src = fallback
                          }
                        }}
                      />
                      {photosCount > 1 && (
                        <span className="absolute bottom-0 right-0 rounded-tl bg-charcoal-900/85 px-1 py-0.5 text-[9px] font-semibold text-ivory-100">
                          {photosCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-caption text-muted-foreground truncate">{item.location}</p>
                    </div>
                  </div>
                )
              },
            },
            { key: 'category', header: 'Category', render: (item) => item.category },
            { key: 'year', header: 'Year', render: (item) => item.year || '—' },
            {
              key: 'status',
              header: 'Status',
              className: 'w-28 whitespace-nowrap',
              render: (item) => {
                const isPublished = item.published !== false
                return (
                  <button
                    type="button"
                    onClick={() => handleTogglePublished(item)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ds-focus-ring',
                      isPublished
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80',
                    )}
                    title={isPublished ? 'Click to unpublish' : 'Click to publish'}
                  >
                    {isPublished ? (
                      <>
                        <HiOutlineEye className="size-3.5" />
                        Published
                      </>
                    ) : (
                      <>
                        <HiOutlineEyeOff className="size-3.5" />
                        Draft
                      </>
                    )}
                  </button>
                )
              },
            },
            {
              key: 'transformation',
              header: 'Transformation',
              className: 'w-32 whitespace-nowrap',
              render: (item) => {
                const hasTransformation = Boolean(item.isTransformation && item.beforeImage && (item.afterImage || item.image))
                return hasTransformation ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 border border-gold-300 px-2.5 py-0.5 text-[11px] font-medium text-gold-700">
                    <span className="size-1.5 rounded-full bg-gold-500" />
                    Before & After
                  </span>
                ) : (
                  <span className="text-caption text-muted-foreground">—</span>
                )
              },
            },
            {
              key: 'featured',
              header: 'Featured',
              render: (item) => (item.featured ? 'Yes' : '—'),
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'w-32 whitespace-nowrap',
              render: (item) => (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Project' : 'Add Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
          <FormField id="project-title" label="Project Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Prestige Park Square"
              required
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="project-location" label="Location" required>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Bengaluru, Karnataka"
                required
              />
            </FormField>
            <FormField id="project-category" label="Category" required>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Heritage Villa, Penthouse"
                required
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="project-year" label="Year">
              <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </FormField>
            <FormField id="project-area" label="Area">
              <Input
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="e.g. 12,000 sq ft"
              />
            </FormField>
            <FormField id="project-order" label="Display Order">
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
              />
            </FormField>
          </div>

          <FormField id="project-description" label="Editorial Description">
            <textarea
              id="project-description"
              rows={3}
              className="ds-input min-h-[85px] w-full rounded-md border border-border bg-background px-3 py-2 text-body-sm shadow-xs transition-colors focus:border-gold-500 focus:outline-hidden"
              placeholder="Describe the architecture, materiality, spatial story, and artisan craftsmanship..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>

          {/* Primary / Cover Image */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <ImageUpload
              id="project-primary-image"
              label="Primary Cover Photo (Optional - defaults to curated residence photo)"
              folder="projects"
              value={form.image}
              onChange={(imgUrl) => {
                setForm((prev) => ({
                  ...prev,
                  image: imgUrl,
                  images: prev.images.includes(imgUrl) ? prev.images : [imgUrl, ...prev.images],
                }))
              }}
              required={false}
            />

            {/* Multiple Project Photos Gallery */}
            <div className="pt-2 border-t border-border/60">
              <label className="block text-body-sm font-medium text-foreground mb-1.5">
                Project Photo Gallery ({form.images.length} photos)
              </label>
              <p className="text-caption text-muted-foreground mb-3">
                Upload multiple photos to showcase different angles and details of the project.
              </p>

              {/* Photos grid */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                  {form.images.map((imgUrl, idx) => {
                    const isCover = imgUrl === form.image
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'group relative aspect-4/3 rounded-md overflow-hidden border bg-muted',
                          isCover ? 'ring-2 ring-gold-500 border-gold-500' : 'border-border',
                        )}
                      >
                        <img src={imgUrl} alt="" className="size-full object-cover" />
                        {isCover && (
                          <span className="absolute top-1 left-1 rounded bg-gold-500 px-1.5 py-0.5 text-[9px] font-semibold text-charcoal-900 shadow-xs">
                            Cover
                          </span>
                        )}
                        <div className="absolute inset-0 bg-charcoal-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryCover(imgUrl)}
                              className="rounded bg-ivory-50 px-1.5 py-1 text-[10px] font-medium text-charcoal-900 hover:bg-gold-100"
                              title="Set as primary cover"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="size-6 rounded-full bg-destructive/90 text-ivory-50 inline-flex items-center justify-center hover:bg-destructive"
                            title="Remove photo"
                            aria-label="Remove photo"
                          >
                            <HiOutlineX className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add another photo row */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Paste additional image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddImage(newImageUrl)}
                    disabled={!newImageUrl.trim()}
                    className="shrink-0"
                  >
                    Add URL
                  </Button>
                </div>
                <div className="pt-1">
                  <ImageUpload
                    id="project-additional-upload"
                    label="Or Upload Another Photo File"
                    folder="projects"
                    value=""
                    onChange={(uploadedUrl) => handleAddImage(uploadedUrl)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Before & After Interactive Transformation */}
          <div className="rounded-lg border border-gold-300/80 bg-gold-50/30 p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-body-sm font-semibold text-charcoal-900 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-gold-500" />
                  Before & After Interactive Comparison
                </h4>
                <p className="text-caption text-muted-foreground mt-0.5">
                  Display this project in the Home page Before & After interactive slider.
                </p>
              </div>
              <Checkbox
                label="Enable Transformation Slider"
                checked={form.isTransformation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isTransformation: e.target.checked,
                    // If enabled and afterImage is empty, default to current cover
                    afterImage: form.afterImage || form.image,
                  })
                }
              />
            </div>

            {form.isTransformation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gold-200/80">
                <div className="space-y-2">
                  <FormField id="project-before-image" label="Before Photo (Original / Under Construction)">
                    <Input
                      placeholder="https://... or upload below"
                      value={form.beforeImage}
                      onChange={(e) => setForm({ ...form, beforeImage: e.target.value })}
                    />
                  </FormField>
                  <ImageUpload
                    id="project-before-upload"
                    label="Upload Before Photo File"
                    folder="transformations"
                    value={form.beforeImage}
                    onChange={(url) => setForm((prev) => ({ ...prev, beforeImage: url }))}
                  />
                </div>

                <div className="space-y-2">
                  <FormField id="project-after-image" label="After Photo (Completed Luxury Interior)">
                    <Input
                      placeholder="Leave empty to use Primary Cover Photo"
                      value={form.afterImage}
                      onChange={(e) => setForm({ ...form, afterImage: e.target.value })}
                    />
                  </FormField>
                  <ImageUpload
                    id="project-after-upload"
                    label="Upload After Photo File"
                    folder="transformations"
                    value={form.afterImage || form.image}
                    onChange={(url) => setForm((prev) => ({ ...prev, afterImage: url }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-3 pt-2">
            <Checkbox
              label="Published (Visible on Home Page)"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <Checkbox
              label="Featured project"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
          </div>

          {formError && (
            <p className="text-body-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" isLoading={saving}>
              {editing ? 'Save Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete project"
        message="This action cannot be undone. The project will be removed from the website."
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

