import {
  faqs,
  galleryImages,
  projects,
  services,
  testimonials,
} from '@/components/sections/data/home.data'

import { UNIFIED_VENTURES_GST } from '@/config/gst'
import { numberToIndianWords } from './utils/invoice'
import type { AdminStore } from './types'
import { createId, nowIso } from './utils'

const projectDetails: Record<
  string,
  {
    description: string
    images: string[]
    area: string
    year: string
    beforeImage?: string
    afterImage?: string
    isTransformation?: boolean
  }
> = {
  'Prestige Park Square': {
    description:
      'Completed bespoke residence in Prestige Park Square, Bengaluru. Features custom architectural joinery, organic stone textures, and tailored modern luxury.',
    images: [
      '/images/after-living-room.jpg',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    ],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage: '/images/after-living-room.jpg',
    isTransformation: true,
  },
  'Kolte Patil i-Towers': {
    description:
      'Turnkey residence completed in Kolte Patil i-Towers, Bengaluru. Contemporary urban interiors elevated with refined materials and ambient illumination.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
    ],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    isTransformation: true,
  },
  'Brigade Cornerstone Utopia': {
    description:
      'Curated interior transformation in Brigade Cornerstone Utopia, Bengaluru. Tactile artisanal finishes dialogue with contemporary spatial flow.',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    ],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    isTransformation: true,
  },
  'Bren Zahara': {
    description:
      'Bespoke residential interior in Bren Zahara, Bengaluru. Handcrafted wall panelling, bespoke hardware, and quiet understated elegance.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    ],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    isTransformation: true,
  },
  'Alpine Viva': {
    description:
      'Sophisticated interior craftsmanship executed for residence in Alpine Viva, Bengaluru. Warm natural woods, silk-honed stone, and tranquil palette.',
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
    isTransformation: true,
  },
}

export function createSeedStore(): AdminStore {
  const timestamp = nowIso()

  return {
    projects: projects.map((project, index) => {
      const details = projectDetails[project.title]
      return {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        title: project.title,
        location: project.location,
        category: project.category,
        year: details?.year ?? '2024',
        area: details?.area ?? '—',
        image: project.image,
        description: details?.description ?? '',
        images: details?.images ?? [project.image],
        published: true,
        order: index,
        featured: index === 0,
        beforeImage: details?.beforeImage,
        afterImage: details?.afterImage ?? project.image,
        isTransformation: details?.isTransformation ?? true,
      }
    }),
    gallery: galleryImages.map((image) => ({
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      src: image.src,
      alt: image.alt,
      collection: 'General',
      tall: image.tall,
    })),
    craftsmanship: [
      {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        discipline: 'Monumental Masonry',
        material: 'Veined Marble & Laterite',
        title: 'Honed Stone & Monolithic Veining',
        caption:
          'Hand-selected Statuario and indigenous Makrana marbles, bookmatched with zero-tolerance micro-joints.',
        provenance: 'Master Stone Guilds',
        finish: 'Silk-Honed Matte & Fluted Relief',
        image:
          'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: 'aspect-4/5',
        order: 0,
        published: true,
      },
      {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        discipline: 'Artisanal Joinery',
        material: 'Burmese Teak & Dark Walnut',
        title: 'Warm Grain & Architectural Millwork',
        caption:
          'Seasoned solid hardwoods turned into bespoke fluted wall panels, seamless concealed pivot doors, and heirloom credenzas.',
        provenance: 'Dedicated Joinery Ateliers',
        finish: 'Hand-Rubbed Organic Wax & Natural Oil',
        image:
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: 'aspect-16/10',
        order: 1,
        published: true,
      },
      {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        discipline: 'Metalwork & Hardware',
        material: 'Aged Brass & Bronze Castings',
        title: 'Antiquated Patinas & Bespoke Accents',
        caption:
          'Custom unlacquered brass hardware, hand-beaten partition screens, and recessed profiles that age gracefully alongside the home.',
        provenance: 'Artisanal Metal Guilds',
        finish: 'Brushed Satin & Living Patina',
        image:
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: 'aspect-4/3',
        order: 2,
        published: true,
      },
      {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        discipline: 'Textile Architecture',
        material: 'Handloom Linen & Wild Silk',
        title: 'Tactile Weaves & Acoustic Softness',
        caption:
          'Custom woven silks, bouclé wool drapery, and unbleached Belgian linens layered to soften geometric architecture and filter ambient light.',
        provenance: 'Master Weaving Looms',
        finish: 'Raw Organic Weave & Calendered Softness',
        image:
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: 'aspect-3/4',
        order: 3,
        published: true,
      },
    ],
    services: services.map((service) => ({
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      title: service.title,
      tagline: service.title,
      description: service.description,
      image: service.image,
    })),
    testimonials: testimonials.map((item) => ({
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      quote: item.quote,
      name: item.name,
      role: item.role,
    })),
    faqs: faqs.map((faq) => ({
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      question: faq.question,
      answer: faq.answer,
    })),
    messages: [],
    notes: [
      {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        title: 'Initial Architectural Brief & Spatial Planning',
        clientName: 'Siddharth & Priya Rao',
        projectName: 'Prestige Park Square Residence',
        subject: 'Living Pavilion & Custom Teak Joinery Specifications',
        date: new Date().toISOString().slice(0, 10),
        category: 'work',
        pinned: true,
        content: `1. Spatial Zoning:
- Maintain unobstructed sightlines from main foyer to balcony pavilion.
- Floor-to-ceiling fluted teak paneling with hidden acoustic dampening.

2. Material Palette:
- Imported Italian Travertine flooring with brushed brass transition strips.
- Custom matte charcoal fixtures and warm architectural cove lighting (2700K).

3. Deliverables Timeline:
- Phase 1: 3D Visualization & Material Swatches approval by end of week.
- Phase 2: On-site joinery fabrication begins following site clearance.`,
      },
    ],
    invoices: [
      {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        invoiceNumber: 'UV/2026-27/001',
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        status: 'issued',
        clientName: 'Siddharth & Priya Rao',
        clientCompany: 'Rao Heritage Living Trust',
        clientEmail: 'siddharth.rao@example.com',
        clientPhone: '+91 98450 12345',
        clientAddress: 'Apartment 1402, Prestige Park Square, Gottigere, Bengaluru, Karnataka 560083',
        clientGstin: '29ABCDE1234F1Z5',
        clientState: 'Karnataka',
        clientStateCode: '29',
        placeOfSupply: 'Karnataka (29)',
        placeOfSupplyStateCode: '29',
        isInterState: false,
        projectName: 'Prestige Park Square Residence',
        poNumber: 'PO-PPS-2026-08',
        items: [
          {
            id: createId(),
            description: 'Comprehensive Interior Architecture, Space Planning & 3D Spatial Visualization',
            sacHsn: '998391',
            quantity: 1,
            unit: 'LS',
            rate: 250000,
            taxableAmount: 250000,
            gstRate: 18,
            cgstAmount: 22500,
            sgstAmount: 22500,
            igstAmount: 0,
            totalAmount: 295000,
          },
          {
            id: createId(),
            description: 'Bespoke Architectural Fluted Teak Paneling & Custom Living Room Joinery Fit-out',
            sacHsn: '995471',
            quantity: 1,
            unit: 'LS',
            rate: 450000,
            taxableAmount: 450000,
            gstRate: 18,
            cgstAmount: 40500,
            sgstAmount: 40500,
            igstAmount: 0,
            totalAmount: 531000,
          },
        ],
        taxableSubtotal: 700000,
        totalCgst: 63000,
        totalSgst: 63000,
        totalIgst: 0,
        grandTotal: 826000,
        roundOff: 0,
        amountInWords: numberToIndianWords(826000),
        notes: 'Payment terms: 50% advance along with confirmed work order, balance payable upon milestone sign-off. Interest @ 18% p.a. will be charged for delayed payments beyond due date.',
        bankDetails: {
          bankName: UNIFIED_VENTURES_GST.bank.bankName,
          accountName: UNIFIED_VENTURES_GST.bank.accountName,
          accountNumber: UNIFIED_VENTURES_GST.bank.accountNumber,
          ifscCode: UNIFIED_VENTURES_GST.bank.ifscCode,
          branch: UNIFIED_VENTURES_GST.bank.branch,
          upiId: UNIFIED_VENTURES_GST.bank.upiId,
        },
      },
    ],
  }
}
