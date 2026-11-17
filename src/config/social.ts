import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
} from 'react-icons/fa'
import type { IconType } from 'react-icons'

const getEnv = (key: keyof ImportMetaEnv, fallback = '') => {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export type SocialPlatform = 'instagram' | 'pinterest' | 'linkedin' | 'facebook'

export type SocialLinkItem = {
  platform: SocialPlatform
  label: string
  href: string
  enabled: boolean
}

export type SocialLinksConfig = {
  links: SocialLinkItem[]
  size: 'sm' | 'md' | 'lg'
  gap: number
  iconColor: string
  hoverIconColor: string
  borderColor: string
  hoverBorderColor: string
  backgroundColor: string
  hoverBackgroundColor: string
  borderRadius: string
  openInNewTab: boolean
}

export const socialIconMap: Record<SocialPlatform, IconType> = {
  instagram: FaInstagram,
  pinterest: FaPinterestP,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
}

export const socialLinksConfig: SocialLinksConfig = {
  links: [
    {
      platform: 'instagram',
      label: 'Instagram',
      href: getEnv('VITE_SOCIAL_INSTAGRAM_URL', 'https://instagram.com/intereor'),
      enabled: getEnv('VITE_SOCIAL_INSTAGRAM_ENABLED', 'true') !== 'false',
    },
    {
      platform: 'pinterest',
      label: 'Pinterest',
      href: getEnv('VITE_SOCIAL_PINTEREST_URL', 'https://pinterest.com/intereor'),
      enabled: getEnv('VITE_SOCIAL_PINTEREST_ENABLED', 'true') !== 'false',
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      href: getEnv('VITE_SOCIAL_LINKEDIN_URL', 'https://linkedin.com/company/intereor'),
      enabled: getEnv('VITE_SOCIAL_LINKEDIN_ENABLED', 'true') !== 'false',
    },
    {
      platform: 'facebook',
      label: 'Facebook',
      href: getEnv('VITE_SOCIAL_FACEBOOK_URL', 'https://facebook.com/intereor'),
      enabled: getEnv('VITE_SOCIAL_FACEBOOK_ENABLED', 'true') !== 'false',
    },
  ],
  size: 'md',
  gap: 12,
  iconColor: 'rgba(250, 249, 246, 0.7)',
  hoverIconColor: '#D6C9B7',
  borderColor: 'rgba(250, 249, 246, 0.15)',
  hoverBorderColor: '#D6C9B7',
  backgroundColor: 'transparent',
  hoverBackgroundColor: 'rgba(250, 249, 246, 0.05)',
  borderRadius: '0.25rem',
  openInNewTab: true,
}

export function resolveSocialConfig(
  overrides?: Partial<SocialLinksConfig> & {
    links?: Array<Partial<SocialLinkItem> & { platform: SocialPlatform }>
  },
): SocialLinksConfig {
  if (!overrides) {
    return socialLinksConfig
  }

  const { links: linkOverrides, ...styleOverrides } = overrides

  const links = linkOverrides
    ? socialLinksConfig.links.map((link) => {
        const override = linkOverrides.find((item) => item.platform === link.platform)
        return override ? { ...link, ...override } : link
      })
    : socialLinksConfig.links

  return {
    ...socialLinksConfig,
    ...styleOverrides,
    links,
  }
}

export function getActiveSocialLinks(config: SocialLinksConfig) {
  return config.links.filter(
    (link) => link.enabled && link.href.trim().length > 0 && link.href !== '#',
  )
}
