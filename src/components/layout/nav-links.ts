export type NavLinkItem = {
  label: string
  href: string
}

export const navLinks: NavLinkItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
]

export const ctaLink = {
  label: 'Book Consultation',
  href: '/contact',
} as const
