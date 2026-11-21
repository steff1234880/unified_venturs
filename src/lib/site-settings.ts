import { brand } from '@/config/brand'
import { contactInfo, getMailtoHref, getMapsHref, getTelHref } from '@/config/contact'
import { socialLinksConfig, type SocialPlatform } from '@/config/social'
import type { SiteSettings, SocialSettings } from '@/types/site-settings'

export const SITE_SETTINGS_STORAGE_KEY = 'intereor-site-settings'
export const SITE_SETTINGS_UPDATED_EVENT = 'intereor-site-settings-updated'

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'instagram',
  'facebook',
]

const SOCIAL_HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ['instagram.com'],
  facebook: ['facebook.com', 'fb.com', 'fb.me'],
}

function getDefaultSocial(): SocialSettings {
  const result = {} as SocialSettings

  for (const platform of SOCIAL_PLATFORMS) {
    const link = socialLinksConfig.links.find((item) => item.platform === platform)
    result[platform] = { url: link?.href ?? '', enabled: link?.enabled ?? true }
  }

  return result
}

/** Returns an error message, or null when the URL is empty or valid. */
export function validateSocialUrl(platform: SocialPlatform, value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  let url: URL

  try {
    url = new URL(trimmed)
  } catch {
    return 'Enter a full URL starting with https://'
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return 'URL must start with http:// or https://'
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const allowed = SOCIAL_HOSTS[platform]

  if (!allowed.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    return `URL must be a ${platform} link (${allowed[0]})`
  }

  return null
}

function mergeSocial(
  base: SocialSettings,
  incoming?: Partial<Record<SocialPlatform, Partial<SocialSettings[SocialPlatform]>>>,
): SocialSettings {
  const merged = {} as SocialSettings

  for (const platform of SOCIAL_PLATFORMS) {
    merged[platform] = { ...base[platform], ...(incoming?.[platform] ?? {}) }
  }

  return merged
}

let defaultSettings: SiteSettings | null = null
let cachedSnapshot: SiteSettings | null = null
let cachedStorageValue: string | null | undefined

export const DEFAULT_CONTACT_PERSONS = [
  { id: '1', name: 'Ajayraj', phone: '8867725353' },
  { id: '2', name: 'Abhi P. Vijayan', phone: '8867725757' },
  { id: '3', name: 'Akhilraj', phone: '8867725858' },
]

export const DEFAULT_BEFORE_AFTER = {
  overline: 'Spatial Metamorphosis',
  heading: 'Before & After Revelations',
  description:
    'Witness the bespoke evolution of bare architectural shells into transcendent residential sanctuaries.',
  beforeImage: '/images/before-living-room.jpg',
  afterImage: '/images/after-living-room.jpg',
}

export const DEFAULT_CRAFTSMANSHIP = {
  enabled: true,
  overline: 'Material Integrity',
  heading: 'The Art of Craftsmanship',
  description:
    'Our interiors are defined not merely by visual proportion, but by tactile authenticity — honed marbles, aged metals, hand-planed teak, and museum-grade handloom textiles sourced across the Indian subcontinent.',
  quote: 'Luxury is the honest soul of authentic stone and hand-sculpted grain.',
  pillars: [
    {
      id: 'stone-marble',
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
    },
    {
      id: 'timber-joinery',
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
    },
    {
      id: 'bespoke-brass',
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
    },
    {
      id: 'tactile-textiles',
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
    },
  ],
}

function getDefaultSiteSettings(): SiteSettings {
  if (!defaultSettings) {
    defaultSettings = {
      email: 'support.unifiedventures@gmail.com',
      whatsappPhone: '8867725353',
      contactPersons: DEFAULT_CONTACT_PERSONS,
      instagramUrl: getDefaultSocial().instagram.url,
      social: getDefaultSocial(),
      location: contactInfo.atelier,
      logoUrl: '',
      logoLightUrl: '',
      beforeAfterOverline: DEFAULT_BEFORE_AFTER.overline,
      beforeAfterHeading: DEFAULT_BEFORE_AFTER.heading,
      beforeAfterDescription: DEFAULT_BEFORE_AFTER.description,
      beforeAfterBeforeImage: DEFAULT_BEFORE_AFTER.beforeImage,
      beforeAfterAfterImage: DEFAULT_BEFORE_AFTER.afterImage,
      craftsmanship: DEFAULT_CRAFTSMANSHIP,
      updatedAt: 'default',
    }
  }

  return defaultSettings
}

function parseSiteSettings(raw: string | null): SiteSettings {
  if (!raw) {
    return getDefaultSiteSettings()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SiteSettings>
    const defaults = getDefaultSiteSettings()

    const social = mergeSocial(defaults.social, parsed.social)

    // Migrate settings saved before multi-platform support.
    if (!parsed.social && typeof parsed.instagramUrl === 'string') {
      social.instagram = { ...social.instagram, url: parsed.instagramUrl }
    }

    const contactPersons =
      Array.isArray(parsed.contactPersons) && parsed.contactPersons.length > 0
        ? parsed.contactPersons.map((person, idx) => ({
            id: person.id || String(idx + 1),
            name: String(person.name || '').trim(),
            phone: String(person.phone || '').trim(),
          }))
        : defaults.contactPersons

    const location =
      typeof parsed.location === 'string' &&
      parsed.location.trim() &&
      !parsed.location.includes('Mumbai') &&
      parsed.location.includes('562125') &&
      parsed.location.includes('Bengaluru Urban') &&
      parsed.location.includes('India') &&
      parsed.location.includes('Building No./Flat No.')
        ? parsed.location.trim()
        : defaults.location

    return {
      ...defaults,
      ...parsed,
      location,
      email: parsed.email?.trim() || defaults.email,
      contactPersons,
      social,
      craftsmanship: {
        ...defaults.craftsmanship!,
        ...(parsed.craftsmanship || {}),
        pillars:
          Array.isArray(parsed.craftsmanship?.pillars) && parsed.craftsmanship.pillars.length > 0
            ? parsed.craftsmanship.pillars
            : defaults.craftsmanship!.pillars,
      },
      instagramUrl: social.instagram.url,
      whatsappPhone: normalizeWhatsAppPhone(
        parsed.whatsappPhone ?? defaults.whatsappPhone,
      ),
      logoUrl: typeof parsed.logoUrl === 'string' ? parsed.logoUrl.trim() : (defaults.logoUrl ?? ''),
      logoLightUrl: typeof parsed.logoLightUrl === 'string' ? parsed.logoLightUrl.trim() : (defaults.logoLightUrl ?? ''),
      beforeAfterOverline:
        typeof parsed.beforeAfterOverline === 'string'
          ? parsed.beforeAfterOverline.trim()
          : defaults.beforeAfterOverline,
      beforeAfterHeading:
        typeof parsed.beforeAfterHeading === 'string'
          ? parsed.beforeAfterHeading.trim()
          : defaults.beforeAfterHeading,
      beforeAfterDescription:
        typeof parsed.beforeAfterDescription === 'string'
          ? parsed.beforeAfterDescription.trim()
          : defaults.beforeAfterDescription,
      beforeAfterBeforeImage:
        typeof parsed.beforeAfterBeforeImage === 'string' && parsed.beforeAfterBeforeImage.trim()
          ? parsed.beforeAfterBeforeImage.trim()
          : defaults.beforeAfterBeforeImage,
      beforeAfterAfterImage:
        typeof parsed.beforeAfterAfterImage === 'string' && parsed.beforeAfterAfterImage.trim()
          ? parsed.beforeAfterAfterImage.trim()
          : defaults.beforeAfterAfterImage,
    }
  } catch {
    return getDefaultSiteSettings()
  }
}

function invalidateSiteSettingsCache() {
  cachedSnapshot = null
  cachedStorageValue = undefined
}

export function normalizeWhatsAppPhone(value: string) {
  return value.replace(/\D/g, '')
}

export function formatPhoneDisplay(digits: string) {
  const normalized = normalizeWhatsAppPhone(digits)

  if (normalized.length === 12 && normalized.startsWith('91')) {
    return `+91 ${normalized.slice(2, 4)} ${normalized.slice(4, 8)} ${normalized.slice(8)}`
  }

  if (normalized.length === 10) {
    return `+91 ${normalized.slice(0, 2)} ${normalized.slice(2, 6)} ${normalized.slice(6)}`
  }

  return normalized.length > 0 ? `+${normalized}` : ''
}

export function getSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') {
    return getDefaultSiteSettings()
  }

  const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)

  if (cachedSnapshot && cachedStorageValue === raw) {
    return cachedSnapshot
  }

  cachedStorageValue = raw
  cachedSnapshot = parseSiteSettings(raw)

  return cachedSnapshot
}

/**
 * Centrally resolves logo sources for all variants (default and light).
 * Automatically falls back to the default brand logos if the saved custom logo is missing or unavailable.
 */
export function getLogoSources(settings?: Partial<SiteSettings> | null) {
  const customMain = settings?.logoUrl?.trim() || null
  const customLight = settings?.logoLightUrl?.trim() || null

  return {
    defaultSrc: customMain || brand.logoSrc,
    lightSrc: customLight || customMain || brand.logoLightSrc,
    defaultFallback: brand.logoSrc,
    lightFallback: brand.logoLightSrc,
    hasCustomLogo: Boolean(customMain || customLight),
    customMain,
    customLight,
  }
}

export function saveSiteSettings(
  partial: Partial<Omit<SiteSettings, 'updatedAt'>>,
): SiteSettings {
  const current = getSiteSettings()
  const social = mergeSocial(current.social, partial.social)

  for (const platform of SOCIAL_PLATFORMS) {
    const message = validateSocialUrl(platform, social[platform].url)

    if (message) {
      throw new Error(`${platform}: ${message}`)
    }

    social[platform] = { ...social[platform], url: social[platform].url.trim() }
  }

  const next: SiteSettings = {
    ...current,
    ...partial,
    social,
    instagramUrl: social.instagram.url,
    whatsappPhone: partial.whatsappPhone
      ? normalizeWhatsAppPhone(partial.whatsappPhone)
      : current.whatsappPhone,
    logoUrl: partial.logoUrl !== undefined ? partial.logoUrl.trim() : (current.logoUrl ?? ''),
    logoLightUrl: partial.logoLightUrl !== undefined ? partial.logoLightUrl.trim() : (current.logoLightUrl ?? ''),
    beforeAfterOverline:
      partial.beforeAfterOverline !== undefined
        ? partial.beforeAfterOverline.trim()
        : (current.beforeAfterOverline ?? DEFAULT_BEFORE_AFTER.overline),
    beforeAfterHeading:
      partial.beforeAfterHeading !== undefined
        ? partial.beforeAfterHeading.trim()
        : (current.beforeAfterHeading ?? DEFAULT_BEFORE_AFTER.heading),
    beforeAfterDescription:
      partial.beforeAfterDescription !== undefined
        ? partial.beforeAfterDescription.trim()
        : (current.beforeAfterDescription ?? DEFAULT_BEFORE_AFTER.description),
    beforeAfterBeforeImage:
      partial.beforeAfterBeforeImage !== undefined
        ? partial.beforeAfterBeforeImage.trim()
        : (current.beforeAfterBeforeImage ?? DEFAULT_BEFORE_AFTER.beforeImage),
    beforeAfterAfterImage:
      partial.beforeAfterAfterImage !== undefined
        ? partial.beforeAfterAfterImage.trim()
        : (current.beforeAfterAfterImage ?? DEFAULT_BEFORE_AFTER.afterImage),
    contactPersons:
      partial.contactPersons !== undefined
        ? partial.contactPersons.map((person, idx) => ({
            id: person.id || String(idx + 1),
            name: person.name.trim(),
            phone: person.phone.trim(),
          }))
        : current.contactPersons,
    updatedAt: new Date().toISOString(),
  }

  const serialized = JSON.stringify(next)

  localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, serialized)
  cachedStorageValue = serialized
  cachedSnapshot = next
  window.dispatchEvent(new CustomEvent(SITE_SETTINGS_UPDATED_EVENT))

  return next
}

export function subscribeSiteSettings(listener: () => void) {
  const onUpdate = (event: Event) => {
    if (event.type === 'storage') {
      const storageEvent = event as StorageEvent

      if (storageEvent.key && storageEvent.key !== SITE_SETTINGS_STORAGE_KEY) {
        return
      }
    }

    invalidateSiteSettingsCache()
    listener()
  }

  window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, onUpdate)
  window.addEventListener('storage', onUpdate)

  return () => {
    window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, onUpdate)
    window.removeEventListener('storage', onUpdate)
  }
}

export function getContactDetailsFromSettings(settings: SiteSettings) {
  const phoneDisplay = formatPhoneDisplay(settings.whatsappPhone)

  return {
    email: settings.email,
    phone: phoneDisplay,
    phoneHref: getTelHref(settings.whatsappPhone),
    contactPersons: settings.contactPersons ?? DEFAULT_CONTACT_PERSONS,
    atelier: settings.location,
    mapsHref: getMapsHref(settings.location),
    mailtoHref: getMailtoHref(settings.email),
    whatsappPhone: settings.whatsappPhone,
    instagramUrl: settings.instagramUrl,
  }
}
