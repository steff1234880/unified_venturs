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
    images: ['/images/after-living-room.jpg', '/placeholders/prestige-park-square.svg'],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage: '/images/after-living-room.jpg',
    isTransformation: true,
  },
  'Kolte Patil i-Towers': {
    description:
      'Turnkey residence completed in Kolte Patil i-Towers, Bengaluru. Contemporary urban interiors elevated with refined materials and ambient illumination.',
    images: ['/placeholders/kolte-patil-i-towers.svg'],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage: '/images/after-living-room.jpg',
    isTransformation: true,
  },
  'Brigade Cornerstone Utopia': {
    description:
      'Curated interior transformation in Brigade Cornerstone Utopia, Bengaluru. Tactile artisanal finishes dialogue with contemporary spatial flow.',
    images: ['/placeholders/brigade-cornerstone-utopia.svg'],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage: '/images/after-living-room.jpg',
    isTransformation: true,
  },
  'Bren Zahara': {
    description:
      'Bespoke residential interior in Bren Zahara, Bengaluru. Handcrafted wall panelling, bespoke hardware, and quiet understated elegance.',
    images: ['/placeholders/bren-zahara.svg'],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage: '/images/after-living-room.jpg',
    isTransformation: true,
  },
  'Alpine Viva': {
    description:
      'Sophisticated interior craftsmanship executed for residence in Alpine Viva, Bengaluru. Warm natural woods, silk-honed stone, and tranquil palette.',
    images: ['/placeholders/alpine-viva.svg'],
    area: 'Bengaluru',
    year: '2024',
    beforeImage: '/images/before-living-room.jpg',
    afterImage: '/images/after-living-room.jpg',
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
