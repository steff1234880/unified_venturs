import { useRef, useState, type ChangeEvent } from 'react'
import { HiOutlinePhotograph, HiOutlineUpload } from 'react-icons/hi'

import { uploadImage } from '@/admin/api/upload'
import { FormField, Input } from '@/components/ui'
import { cn } from '@/utils'

type ImageUploadProps = {
  id: string
  label?: string
  value: string
  onChange: (url: string) => void
  folder: string
  required?: boolean
  className?: string
  hint?: string
  previewFit?: 'cover' | 'contain'
  previewBackground?: string
}

export function ImageUpload({
  id,
  label = 'Image',
  value,
  onChange,
  folder,
  required,
  className,
  hint,
  previewFit = 'cover',
  previewBackground,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setUploading(true)
    setError(null)

    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <FormField id={id} label={label} required={required} hint={hint}>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Image URL or upload a file"
            required={required}
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border-strong px-4 text-body-sm font-medium text-foreground transition-luxury hover:border-gold-400 hover:text-teak-700 disabled:opacity-50 ds-focus-ring"
          >
            <HiOutlineUpload className="size-4" aria-hidden />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      </FormField>

      {error && (
        <p className="text-body-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {value ? (
        <div
          className={cn(
            'overflow-hidden rounded-lg border border-border flex items-center justify-center',
            previewFit === 'contain' ? 'h-24 p-3' : 'aspect-video',
            previewBackground || 'bg-ivory-100/30',
          )}
        >
          <img
            src={value}
            alt="Preview"
            className={cn(
              'w-full',
              previewFit === 'contain' ? 'h-full object-contain' : 'aspect-video object-cover',
            )}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-lg border border-dashed border-border bg-ivory-100/50 text-muted-foreground',
            previewFit === 'contain' ? 'h-24 p-3' : 'aspect-video',
          )}
        >
          <div className="text-center">
            <HiOutlinePhotograph className="mx-auto size-6 opacity-50" aria-hidden />
            <p className="mt-1 text-caption">No image selected</p>
          </div>
        </div>
      )}
    </div>
  )
}
