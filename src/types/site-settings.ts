import type { SocialPlatform } from '@/config/social'

export type SocialSetting = {
  url: string
  enabled: boolean
}

export type SocialSettings = Record<SocialPlatform, SocialSetting>

export type ContactPerson = {
  id: string
  name: string
  phone: string
}

export type SiteSettings = {
  email: string
  whatsappPhone: string
  contactPersons: ContactPerson[]
  /** Kept for backwards compatibility; mirrors social.instagram.url */
  instagramUrl: string
  social: SocialSettings
  location: string
  /** Centrally managed logo URL used across header, mobile header, footer, and loading screen */
  logoUrl?: string
  /** Optional light variant logo URL for dark surfaces (footer, loading screen, dark header) */
  logoLightUrl?: string
  /** Single Before & After Showcase configurations */
  beforeAfterOverline?: string
  beforeAfterHeading?: string
  beforeAfterDescription?: string
  beforeAfterBeforeImage?: string
  beforeAfterAfterImage?: string
  updatedAt: string
}
