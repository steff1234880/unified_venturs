import { isLocalAdminMode } from '@/admin/auth/mode'
import { assertSupabaseConfigured, supabase } from '@/lib/supabase'

const BUCKET = 'media'
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Failed to read image file.'))
    }

    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file: File, _folder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPEG, PNG, WebP, or GIF image.')
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image must be smaller than 5 MB.')
  }

  if (isLocalAdminMode()) {
    return readFileAsDataUrl(file)
  }

  assertSupabaseConfigured()

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${_folder}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return data.publicUrl
}

export async function deleteImage(url: string): Promise<void> {
  if (isLocalAdminMode() || url.startsWith('data:')) {
    return
  }

  assertSupabaseConfigured()

  const path = extractStoragePath(url)

  if (!path) {
    return
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

function extractStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`

  if (!url.includes(marker)) {
    return null
  }

  return url.split(marker)[1] ?? null
}
