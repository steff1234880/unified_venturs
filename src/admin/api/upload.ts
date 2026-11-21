import { isLocalAdminMode } from '@/admin/auth/mode'
import { assertSupabaseConfigured, supabase } from '@/lib/supabase'

const BUCKET = 'media'
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB limit
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

/**
 * Upload an image file to persistent storage.
 * If backend server API is available, sends to /api/upload to write to persistent /public/uploads/ directory.
 * If Supabase is configured, uploads to Supabase Storage.
 * Never leaks raw base64 data into localStorage.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPEG, PNG, WebP, GIF, or SVG image.')
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image must be smaller than 20 MB.')
  }

  // 1. Try uploading to backend API (/api/upload)
  try {
    const dataUrl = await readFileAsDataUrl(file)
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: dataUrl,
        filename: file.name,
        contentType: file.type,
        folder,
      }),
    })

    if (response.ok) {
      const resJson = await response.json()
      if (resJson?.success && resJson?.url) {
        return resJson.url
      }
    }
  } catch (backendErr) {
    console.warn('Backend upload failed or offline, checking Supabase fallback:', backendErr)
  }

  // 2. Fallback to Supabase Storage if configured
  if (!isLocalAdminMode()) {
    assertSupabaseConfigured()

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${folder}/${crypto.randomUUID()}.${extension}`

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

  // 3. Fallback when totally disconnected from backend server:
  // Use a Blob Object URL in memory rather than storing massive base64 in localStorage
  return URL.createObjectURL(file)
}

export async function deleteImage(url: string): Promise<void> {
  if (isLocalAdminMode() || url.startsWith('data:') || url.startsWith('/uploads/') || url.startsWith('blob:')) {
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
  const index = url.indexOf(marker)

  if (index === -1) {
    return null
  }

  return url.slice(index + marker.length)
}
