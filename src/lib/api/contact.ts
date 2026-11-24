import { isLocalAdminMode } from '@/admin/auth/mode'
import { addContactMessage } from '@/admin/storage'
import { assertSupabaseConfigured, supabase } from '@/lib/supabase'
import { apiUrl } from '@/lib/api-url'

export type ContactSubmission = {
  firstName: string
  lastName: string
  email: string
  phone: string
  projectType: string
  message: string
}

export async function submitContactMessage(data: ContactSubmission) {
  // Try real database backend API first
  try {
    const res = await fetch(apiUrl('/api/contact'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      // Also update local store if in local admin mode for instant cache parity
      if (isLocalAdminMode()) {
        void addContactMessage(data).catch(() => {})
      }
      return
    }

    const json = await res.json().catch(() => ({}))
    if (res.status === 400 && json?.error) {
      throw new Error(json.error)
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('recently received')) {
      throw err
    }
    // If backend endpoint is unavailable, fallback to configured Supabase or local storage
  }

  if (isLocalAdminMode()) {
    await addContactMessage(data)
    return
  }

  assertSupabaseConfigured()

  const { error } = await supabase.from('contact_messages').insert({
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    project_type: data.projectType,
    message: data.message,
    read: false,
  })

  if (error) {
    throw new Error(error.message)
  }
}

