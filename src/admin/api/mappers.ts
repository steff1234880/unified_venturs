import type { Database } from '@/lib/supabase.types'
import type {
  AdminFaq,
  AdminGalleryItem,
  AdminProject,
  AdminService,
  AdminTestimonial,
  ContactMessage,
} from '@/admin/types'

type DbProject = Database['public']['Tables']['projects']['Row']
type DbGalleryItem = Database['public']['Tables']['gallery_items']['Row']
type DbService = Database['public']['Tables']['services']['Row']
type DbTestimonial = Database['public']['Tables']['testimonials']['Row']
type DbFaq = Database['public']['Tables']['faqs']['Row']
type DbContactMessage = Database['public']['Tables']['contact_messages']['Row']

export function mapProject(row: DbProject): AdminProject {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    category: row.category,
    year: row.year,
    area: row.area,
    image: row.image,
    featured: row.featured,
    description: row.description ?? '',
    images:
      Array.isArray(row.images) && row.images.length > 0
        ? row.images
        : row.image
          ? [row.image]
          : [],
    published: row.published !== false,
    order: typeof row.order === 'number' ? row.order : 0,
    beforeImage: row.before_image ?? undefined,
    afterImage: row.after_image ?? undefined,
    isTransformation: Boolean(row.is_transformation),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapGalleryItem(row: DbGalleryItem): AdminGalleryItem {
  return {
    id: row.id,
    src: row.src,
    alt: row.alt,
    collection: row.collection,
    tall: row.tall,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapService(row: DbService): AdminService {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    image: row.image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapTestimonial(row: DbTestimonial): AdminTestimonial {
  return {
    id: row.id,
    quote: row.quote,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapFaq(row: DbFaq): AdminFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapContactMessage(row: DbContactMessage): ContactMessage {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    projectType: row.project_type,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const TABLE_MAP = {
  projects: 'projects',
  gallery: 'gallery_items',
  services: 'services',
  testimonials: 'testimonials',
  faqs: 'faqs',
  messages: 'contact_messages',
  notes: 'notes',
  invoices: 'invoices',
} as const
