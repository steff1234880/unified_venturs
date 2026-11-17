import { type CSSProperties } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

import {
  buildWhatsAppUrl,
  resolveWhatsAppConfig,
  type WhatsAppButtonConfig,
  type WhatsAppPosition,
  type WhatsAppSize,
} from '@/config/whatsapp'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/utils'

const sizeMap: Record<
  WhatsAppSize,
  { button: string; icon: string; label: string; gap: string }
> = {
  sm: {
    button: 'h-11 min-w-11 px-3',
    icon: 'size-5',
    label: 'text-body-sm',
    gap: 'gap-2',
  },
  md: {
    button: 'h-14 min-w-14 px-4',
    icon: 'size-6',
    label: 'text-body-sm',
    gap: 'gap-2.5',
  },
  lg: {
    button: 'h-16 min-w-16 px-5',
    icon: 'size-7',
    label: 'text-body-md',
    gap: 'gap-3',
  },
}

function getPositionStyle(
  position: WhatsAppPosition,
  offsetX: number,
  offsetY: number,
  zIndex: number,
): CSSProperties {
  const style: CSSProperties = {
    position: 'fixed',
    zIndex,
  }

  switch (position) {
    case 'bottom-right':
      style.right = offsetX
      style.bottom = `calc(${offsetY}px + env(safe-area-inset-bottom, 0px))`
      break
    case 'bottom-left':
      style.left = offsetX
      style.bottom = `calc(${offsetY}px + env(safe-area-inset-bottom, 0px))`
      break
    case 'top-right':
      style.right = offsetX
      style.top = `calc(${offsetY}px + env(safe-area-inset-top, 0px))`
      break
    case 'top-left':
      style.left = offsetX
      style.top = `calc(${offsetY}px + env(safe-area-inset-top, 0px))`
      break
  }

  return style
}

export type WhatsAppButtonProps = Partial<WhatsAppButtonConfig> & {
  className?: string
  message?: string
}

export function WhatsAppButton({
  className,
  message,
  ...overrides
}: WhatsAppButtonProps = {}) {
  const config = resolveWhatsAppConfig(overrides)
  const location = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const isHiddenRoute = config.hideOnRoutes.some((route) =>
    location.pathname.startsWith(route),
  )

  const isVisible =
    config.enabled &&
    config.phoneNumber.replace(/\D/g, '').length > 0 &&
    !isHiddenRoute &&
    ((isMobile && config.showOnMobile) || (isDesktop && config.showOnDesktop))

  const href = buildWhatsAppUrl(
    config.phoneNumber,
    message ?? config.defaultMessage,
  )

  const effectiveSize: WhatsAppSize =
    overrides.size ?? (isMobile ? 'sm' : config.size)
  const sizes = sizeMap[effectiveSize]

  const effectiveOffsetX = isMobile ? Math.min(config.offsetX, 16) : config.offsetX
  const effectiveOffsetY = isMobile ? Math.min(config.offsetY, 16) : config.offsetY

  const wrapperStyle = getPositionStyle(
    config.position,
    effectiveOffsetX,
    effectiveOffsetY,
    config.zIndex,
  )

  if (!isVisible) {
    return null
  }

  return (
    <div className={className} style={wrapperStyle}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={config.ariaLabel}
        title={config.showTooltip ? config.tooltip : undefined}
        className={cn(
          'group relative inline-flex items-center justify-center font-medium transition-luxury',
          'ds-focus-ring',
          sizes.button,
          sizes.gap,
          config.showLabel ? 'rounded-full pr-5' : 'rounded-full',
          config.pulse && !prefersReducedMotion && 'animate-whatsapp-pulse',
        )}
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          borderColor: config.borderColor,
          borderWidth: `${config.borderWidth}px`,
          borderStyle: 'solid',
          borderRadius: config.borderRadius,
          boxShadow: config.shadow,
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = config.hoverBackgroundColor
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = config.backgroundColor
        }}
      >
        <FaWhatsapp
          className={cn(sizes.icon, 'shrink-0')}
          style={{ color: config.iconColor }}
          aria-hidden
        />
        {config.showLabel && (
          <span className={cn(sizes.label, 'whitespace-nowrap')}>{config.label}</span>
        )}

        {config.showTooltip && !config.showLabel && (
          <span
            className={cn(
              'pointer-events-none absolute right-full mr-3 hidden rounded-md px-3 py-2',
              'text-caption font-medium whitespace-nowrap opacity-0 shadow-md transition-opacity',
              'group-hover:opacity-100 group-focus-visible:opacity-100 md:block',
              'bg-charcoal-900 text-ivory-50',
            )}
            aria-hidden
          >
            {config.tooltip}
          </span>
        )}
      </a>
    </div>
  )
}
