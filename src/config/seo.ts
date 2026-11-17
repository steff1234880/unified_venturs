import { env } from '@/config/env'

export const siteSeo = {
  name: 'Unified Ventures',
  title: 'Luxury Indian Interior Design | Unified Ventures',
  description:
    'Award-winning luxury interior design atelier crafting bespoke Indian residences with heritage artistry and contemporary elegance.',
  locale: 'en_IN',
  twitterCard: 'summary_large_image' as const,
  themeColor: '#FAF9F6',
}

export const pageSeo: Record<
  string,
  { title: string; description: string; noIndex?: boolean }
> = {
  '/': {
    title: 'Luxury Indian Interior Design',
    description: siteSeo.description,
  },
  '/about': {
    title: 'About Our Atelier',
    description:
      'Discover the story, artisans, and philosophy behind our award-winning luxury interior design practice.',
  },
  '/services': {
    title: 'Interior Design Services',
    description:
      'Bespoke interiors, heritage restoration, luxury furnishing, and turnkey execution for discerning homeowners.',
  },
  '/projects': {
    title: 'Portfolio Projects',
    description:
      'Explore our portfolio of luxury residences, penthouses, heritage villas, and bespoke interior transformations in Bengaluru.',
  },
  '/gallery': {
    title: 'Design Gallery',
    description:
      'A curated gallery of materials, spaces, and details from our luxury interior design projects in Bengaluru, Karnataka.',
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Begin your design journey. Share your vision with our concierge team for a bespoke interior consultation.',
  },
  '/admin/login': {
    title: 'Admin Sign In',
    description: 'Secure administration access.',
    noIndex: true,
  },
}

export function getPageSeo(pathname: string) {
  if (pathname.startsWith('/admin')) {
    return {
      title: 'Admin',
      description: 'Secure administration access.',
      noIndex: true,
    }
  }

  return pageSeo[pathname] ?? pageSeo['/']!
}

export function absoluteUrl(path = '/') {
  const base = env.appUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
