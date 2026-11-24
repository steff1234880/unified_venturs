import {
  faqs,
  galleryImages,
  projects,
  services,
  testimonials,
} from '@/components/sections/data/home.data'

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
    notes: [],
    invoices: [],
  }
}
