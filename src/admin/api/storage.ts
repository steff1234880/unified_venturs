import {
  mapContactMessage,
  mapFaq,
  mapGalleryItem,
  mapProject,
  mapService,
  mapTestimonial,
} from '@/admin/api/mappers'
import type {
  AdminStore,
  BaseEntity,
  CollectionKey,
  ContactMessage,
} from '@/admin/types'
import { assertSupabaseConfigured, supabase } from '@/lib/supabase'

function handleError(error: { message: string } | null, action: string) {
  if (error) {
    throw new Error(`${action}: ${error.message}`)
  }
}

function requireRow<T>(row: T | null, action: string): T {
  if (!row) {
    throw new Error(`${action}: No data returned.`)
  }

  return row
}

export async function fetchCollection<K extends CollectionKey>(
  key: K,
): Promise<AdminStore[K]> {
  assertSupabaseConfigured()

  switch (key) {
    case 'projects': {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      handleError(error, 'Failed to load projects')
      return (data ?? []).map(mapProject) as AdminStore[K]
    }
    case 'gallery': {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })
      handleError(error, 'Failed to load gallery')
      return (data ?? []).map(mapGalleryItem) as AdminStore[K]
    }
    case 'services': {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
      handleError(error, 'Failed to load services')
      return (data ?? []).map(mapService) as AdminStore[K]
    }
    case 'testimonials': {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
      handleError(error, 'Failed to load testimonials')
      return (data ?? []).map(mapTestimonial) as AdminStore[K]
    }
    case 'faqs': {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false })
      handleError(error, 'Failed to load faqs')
      return (data ?? []).map(mapFaq) as AdminStore[K]
    }
    case 'messages': {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      handleError(error, 'Failed to load messages')
      return (data ?? []).map(mapContactMessage) as AdminStore[K]
    }
    default:
      return [] as AdminStore[K]
  }
}

export async function createItem<K extends CollectionKey>(
  key: K,
  data: Omit<AdminStore[K][number], keyof BaseEntity>,
): Promise<AdminStore[K][number]> {
  assertSupabaseConfigured()

  switch (key) {
    case 'projects': {
      const item = data as Omit<AdminStore['projects'][number], keyof BaseEntity>
      const { data: row, error } = await supabase
        .from('projects')
        .insert({
          title: item.title,
          location: item.location,
          category: item.category,
          year: item.year,
          area: item.area,
          image: item.image,
          featured: item.featured,
          description: item.description ?? '',
          images: item.images ?? (item.image ? [item.image] : []),
          published: item.published !== false,
          order: typeof item.order === 'number' ? item.order : 0,
          before_image: item.beforeImage ?? null,
          after_image: item.afterImage ?? null,
          is_transformation: Boolean(item.isTransformation),
        })
        .select('*')
        .single()
      handleError(error, 'Failed to create project')
      return mapProject(requireRow(row, 'Failed to create project')) as AdminStore[K][number]
    }
    case 'gallery': {
      const item = data as Omit<AdminStore['gallery'][number], keyof BaseEntity>
      const { data: row, error } = await supabase
        .from('gallery_items')
        .insert({
          src: item.src,
          alt: item.alt,
          collection: item.collection,
          tall: item.tall,
        })
        .select('*')
        .single()
      handleError(error, 'Failed to create gallery item')
      return mapGalleryItem(requireRow(row, 'Failed to create gallery item')) as AdminStore[K][number]
    }
    case 'services': {
      const item = data as Omit<AdminStore['services'][number], keyof BaseEntity>
      const { data: row, error } = await supabase
        .from('services')
        .insert({
          title: item.title,
          tagline: item.tagline,
          description: item.description,
          image: item.image,
        })
        .select('*')
        .single()
      handleError(error, 'Failed to create service')
      return mapService(requireRow(row, 'Failed to create service')) as AdminStore[K][number]
    }
    case 'testimonials': {
      const item = data as Omit<AdminStore['testimonials'][number], keyof BaseEntity>
      const { data: row, error } = await supabase
        .from('testimonials')
        .insert({
          quote: item.quote,
          name: item.name,
          role: item.role,
        })
        .select('*')
        .single()
      handleError(error, 'Failed to create testimonial')
      return mapTestimonial(requireRow(row, 'Failed to create testimonial')) as AdminStore[K][number]
    }
    case 'faqs': {
      const item = data as Omit<AdminStore['faqs'][number], keyof BaseEntity>
      const { data: row, error } = await supabase
        .from('faqs')
        .insert({
          question: item.question,
          answer: item.answer,
        })
        .select('*')
        .single()
      handleError(error, 'Failed to create faq')
      return mapFaq(requireRow(row, 'Failed to create faq')) as AdminStore[K][number]
    }
    case 'messages': {
      const item = data as Omit<AdminStore['messages'][number], keyof BaseEntity>
      const { data: row, error } = await supabase
        .from('contact_messages')
        .insert({
          first_name: item.firstName,
          last_name: item.lastName,
          email: item.email,
          phone: item.phone,
          project_type: item.projectType,
          message: item.message,
          read: item.read,
        })
        .select('*')
        .single()
      handleError(error, 'Failed to create message')
      return mapContactMessage(requireRow(row, 'Failed to create message')) as AdminStore[K][number]
    }
    default:
      throw new Error(`Unknown collection: ${key}`)
  }
}

export async function updateItem<K extends CollectionKey>(
  key: K,
  id: string,
  data: Partial<Omit<AdminStore[K][number], keyof BaseEntity>>,
): Promise<AdminStore[K][number]> {
  assertSupabaseConfigured()

  switch (key) {
    case 'projects': {
      const item = data as Partial<Omit<AdminStore['projects'][number], keyof BaseEntity>>
      const { data: row, error } = await supabase
        .from('projects')
        .update({
          ...(item.title !== undefined && { title: item.title }),
          ...(item.location !== undefined && { location: item.location }),
          ...(item.category !== undefined && { category: item.category }),
          ...(item.year !== undefined && { year: item.year }),
          ...(item.area !== undefined && { area: item.area }),
          ...(item.image !== undefined && { image: item.image }),
          ...(item.featured !== undefined && { featured: item.featured }),
          ...(item.description !== undefined && { description: item.description }),
          ...(item.images !== undefined && { images: item.images }),
          ...(item.published !== undefined && { published: item.published }),
          ...(item.order !== undefined && { order: item.order }),
          ...(item.beforeImage !== undefined && { before_image: item.beforeImage ?? null }),
          ...(item.afterImage !== undefined && { after_image: item.afterImage ?? null }),
          ...(item.isTransformation !== undefined && { is_transformation: item.isTransformation }),
        })
        .eq('id', id)
        .select('*')
        .single()
      handleError(error, 'Failed to update project')
      return mapProject(requireRow(row, 'Failed to update project')) as AdminStore[K][number]
    }
    case 'gallery': {
      const item = data as Partial<Omit<AdminStore['gallery'][number], keyof BaseEntity>>
      const { data: row, error } = await supabase
        .from('gallery_items')
        .update({
          ...(item.src !== undefined && { src: item.src }),
          ...(item.alt !== undefined && { alt: item.alt }),
          ...(item.collection !== undefined && { collection: item.collection }),
          ...(item.tall !== undefined && { tall: item.tall }),
        })
        .eq('id', id)
        .select('*')
        .single()
      handleError(error, 'Failed to update gallery item')
      return mapGalleryItem(requireRow(row, 'Failed to update gallery item')) as AdminStore[K][number]
    }
    case 'services': {
      const item = data as Partial<Omit<AdminStore['services'][number], keyof BaseEntity>>
      const { data: row, error } = await supabase
        .from('services')
        .update({
          ...(item.title !== undefined && { title: item.title }),
          ...(item.tagline !== undefined && { tagline: item.tagline }),
          ...(item.description !== undefined && { description: item.description }),
          ...(item.image !== undefined && { image: item.image }),
        })
        .eq('id', id)
        .select('*')
        .single()
      handleError(error, 'Failed to update service')
      return mapService(requireRow(row, 'Failed to update service')) as AdminStore[K][number]
    }
    case 'testimonials': {
      const item = data as Partial<Omit<AdminStore['testimonials'][number], keyof BaseEntity>>
      const { data: row, error } = await supabase
        .from('testimonials')
        .update({
          ...(item.quote !== undefined && { quote: item.quote }),
          ...(item.name !== undefined && { name: item.name }),
          ...(item.role !== undefined && { role: item.role }),
        })
        .eq('id', id)
        .select('*')
        .single()
      handleError(error, 'Failed to update testimonial')
      return mapTestimonial(requireRow(row, 'Failed to update testimonial')) as AdminStore[K][number]
    }
    case 'faqs': {
      const item = data as Partial<Omit<AdminStore['faqs'][number], keyof BaseEntity>>
      const { data: row, error } = await supabase
        .from('faqs')
        .update({
          ...(item.question !== undefined && { question: item.question }),
          ...(item.answer !== undefined && { answer: item.answer }),
        })
        .eq('id', id)
        .select('*')
        .single()
      handleError(error, 'Failed to update faq')
      return mapFaq(requireRow(row, 'Failed to update faq')) as AdminStore[K][number]
    }
    case 'messages': {
      const item = data as Partial<Omit<AdminStore['messages'][number], keyof BaseEntity>>
      const { data: row, error } = await supabase
        .from('contact_messages')
        .update({
          ...(item.firstName !== undefined && { first_name: item.firstName }),
          ...(item.lastName !== undefined && { last_name: item.lastName }),
          ...(item.email !== undefined && { email: item.email }),
          ...(item.phone !== undefined && { phone: item.phone }),
          ...(item.projectType !== undefined && { project_type: item.projectType }),
          ...(item.message !== undefined && { message: item.message }),
          ...(item.read !== undefined && { read: item.read }),
        })
        .eq('id', id)
        .select('*')
        .single()
      handleError(error, 'Failed to update message')
      return mapContactMessage(requireRow(row, 'Failed to update message')) as AdminStore[K][number]
    }
    default:
      throw new Error(`Unknown collection: ${key}`)
  }
}

export async function deleteItem<K extends CollectionKey>(
  key: K,
  id: string,
): Promise<void> {
  assertSupabaseConfigured()

  const table =
    key === 'gallery'
      ? 'gallery_items'
      : key === 'messages'
        ? 'contact_messages'
        : key

  const { error } = await supabase.from(table).delete().eq('id', id)

  handleError(error, `Failed to delete ${key}`)
}

export async function addContactMessage(
  data: Omit<ContactMessage, keyof BaseEntity | 'read'>,
): Promise<ContactMessage> {
  return createItem('messages', { ...data, read: false })
}

export async function markMessageRead(
  id: string,
  read = true,
): Promise<ContactMessage> {
  return updateItem('messages', id, { read })
}

export async function deleteMessage(id: string): Promise<void> {
  return deleteItem('messages', id)
}

export async function getDashboardStats() {
  const [projects, gallery, services, testimonials, faqs, messages, notes, invoices] =
    await Promise.all([
      fetchCollection('projects'),
      fetchCollection('gallery'),
      fetchCollection('services'),
      fetchCollection('testimonials'),
      fetchCollection('faqs'),
      fetchCollection('messages'),
      fetchCollection('notes').catch(() => []),
      fetchCollection('invoices').catch(() => []),
    ])

  return {
    projects: projects.length,
    gallery: gallery.length,
    services: services.length,
    testimonials: testimonials.length,
    faqs: faqs.length,
    messages: messages.length,
    notes: (notes || []).length,
    invoices: (invoices || []).length,
    unreadMessages: messages.filter((message) => !message.read).length,
  }
}
