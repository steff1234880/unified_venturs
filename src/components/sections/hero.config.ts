/** Replace with your own assets in /public/media/ */
const heroImageId = 'photo-1618221195710-dd6b41faaea6'

export const heroMedia = {
  image: `https://images.unsplash.com/${heroImageId}?auto=format&fit=crop&w=1920&q=80`,
  imageSrcSet: `https://images.unsplash.com/${heroImageId}?auto=format&fit=crop&w=960&q=80 960w, https://images.unsplash.com/${heroImageId}?auto=format&fit=crop&w=1440&q=80 1440w, https://images.unsplash.com/${heroImageId}?auto=format&fit=crop&w=1920&q=80 1920w`,
  imageSizes: '100vw',
  imageAlt: 'Luxury Indian interior with warm lighting and bespoke furnishings',
  video: undefined as string | undefined,
  poster: `https://images.unsplash.com/${heroImageId}?auto=format&fit=crop&w=1920&q=80`,
} as const

export const heroContent = {
  overline: 'Luxury Indian Interiors',
  title: ['Where Heritage', 'Meets', 'Modern Living'],
  subtitle:
    'Bespoke spaces shaped by master artisans — blending timeless craft with contemporary elegance across Bengaluru\'s finest residences.',
  aside: '',
  primaryCta: { label: 'Explore Collection', href: '/projects' },
  secondaryCta: { label: 'Book Consultation', href: '/#contact' },
} as const

