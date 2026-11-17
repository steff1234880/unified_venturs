import { submitContactMessage } from '@/lib/api/contact'

export type ContactFormData = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  projectType?: string
  message: string
}

export async function submitContactForm(data: ContactFormData) {
  await submitContactMessage({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() ?? '',
    projectType: data.projectType?.trim() ?? '',
    message: data.message.trim(),
  })
}
