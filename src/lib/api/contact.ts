import { isLocalAdminMode } from '@/admin/auth/mode'
import { addContactMessage } from '@/admin/storage'
import { assertSupabaseConfigured, supabase } from '@/lib/supabase'

export type ContactSubmission = {
  firstName: string
  lastName: string
  email: string
  phone: string
  projectType: string
  message: string
}

export async function submitContactMessage(data: ContactSubmission) {
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
