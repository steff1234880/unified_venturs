export type BaseEntity = {
  id: string
  createdAt: string
  updatedAt: string
}

export type AdminProject = BaseEntity & {
  title: string
  location: string
  category: string
  year: string
  area: string
  image: string
  featured: boolean
  description?: string
  images?: string[]
  published?: boolean
  order?: number
  beforeImage?: string
  afterImage?: string
  isTransformation?: boolean
}

export type AdminGalleryItem = BaseEntity & {
  src: string
  alt: string
  collection: string
  tall: boolean
}

export type AdminService = BaseEntity & {
  title: string
  tagline: string
  description: string
  image: string
}

export type AdminTestimonial = BaseEntity & {
  quote: string
  name: string
  role: string
}

export type AdminFaq = BaseEntity & {
  question: string
  answer: string
}

export type ContactMessage = BaseEntity & {
  firstName: string
  lastName: string
  email: string
  phone: string
  projectType: string
  message: string
  read: boolean
}

export type NoteCategory = 'work' | 'personal'

export type AdminNote = BaseEntity & {
  title: string
  clientName: string
  projectName: string
  subject?: string
  date: string
  content: string
  category: NoteCategory
  pinned?: boolean
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled'

export type InvoiceItem = {
  id: string
  description: string
  sacHsn: string // SAC for interior services (typically 998391)
  quantity: number
  unit: string
  rate: number
  taxableAmount: number
  gstRate: number // e.g., 18 for 18%
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalAmount: number
}

export type AdminInvoice = BaseEntity & {
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  status: InvoiceStatus
  // Client details
  clientName: string
  clientCompany?: string
  clientEmail?: string
  clientPhone?: string
  clientAddress: string
  clientGstin?: string
  clientState: string
  clientStateCode: string
  // Place of supply
  placeOfSupply: string
  placeOfSupplyStateCode: string
  isInterState: boolean // If true, IGST applies; else CGST + SGST
  // Project reference
  projectName?: string
  poNumber?: string
  // Items & totals
  items: InvoiceItem[]
  taxableSubtotal: number
  totalCgst: number
  totalSgst: number
  totalIgst: number
  grandTotal: number
  roundOff?: number
  amountInWords?: string
  notes?: string
  bankDetails?: {
    bankName: string
    accountName: string
    accountNumber: string
    ifscCode: string
    branch: string
    upiId?: string
  }
}

export type AdminSession = {
  token: string
  email: string
  expiresAt: number
}

export type AdminCraftsmanshipItem = BaseEntity & {
  discipline: string
  material: string
  title: string
  caption: string
  provenance: string
  finish: string
  image: string
  order?: number
  published?: boolean
  aspectRatio?: string
}

export type AdminStore = {
  projects: AdminProject[]
  gallery: AdminGalleryItem[]
  craftsmanship: AdminCraftsmanshipItem[]
  services: AdminService[]
  testimonials: AdminTestimonial[]
  faqs: AdminFaq[]
  messages: ContactMessage[]
  notes: AdminNote[]
  invoices: AdminInvoice[]
}

export type CollectionKey = keyof AdminStore
