import {
  getActiveSocialLinks,
  resolveSocialConfig,
  socialIconMap,
  type SocialLinkItem,
  type SocialLinksConfig,
} from '@/config/social'
import { cn } from '@/utils'

const sizeMap = {
  sm: { button: 'size-9', icon: 'size-3.5' },
  md: { button: 'size-10', icon: 'size-4' },
  lg: { button: 'size-12', icon: 'size-5' },
} as const

export type SocialLinksProps = Partial<SocialLinksConfig> & {
  className?: string
  links?: Array<Partial<SocialLinkItem> & { platform: SocialLinkItem['platform'] }>
}

export function SocialLinks({ className, links, ...overrides }: SocialLinksProps = {}) {
  const config = resolveSocialConfig({ ...overrides, links })
  const activeLinks = getActiveSocialLinks(config)
  const sizes = sizeMap[config.size]

  if (activeLinks.length === 0) {
    return null
  }

  return (
    <div
      className={cn('flex flex-wrap items-center', className)}
      style={{ gap: config.gap }}
      role="list"
      aria-label="Social media links"
    >
      {activeLinks.map((link) => {
        const Icon = socialIconMap[link.platform]

        return (
          <a
            key={link.platform}
            href={link.href}
            target={config.openInNewTab ? '_blank' : undefined}
            rel={config.openInNewTab ? 'noopener noreferrer' : undefined}
            aria-label={link.label}
            role="listitem"
            className={cn(
              'inline-flex items-center justify-center border transition-luxury ds-focus-ring',
              sizes.button,
            )}
            style={{
              color: config.iconColor,
              borderColor: config.borderColor,
              backgroundColor: config.backgroundColor,
              borderRadius: config.borderRadius,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = config.hoverIconColor
              event.currentTarget.style.borderColor = config.hoverBorderColor
              event.currentTarget.style.backgroundColor = config.hoverBackgroundColor
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = config.iconColor
              event.currentTarget.style.borderColor = config.borderColor
              event.currentTarget.style.backgroundColor = config.backgroundColor
            }}
          >
            <Icon className={sizes.icon} aria-hidden />
          </a>
        )
      })}
    </div>
  )
}
