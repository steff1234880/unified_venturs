import { env } from '@/config/env'

const getEnv = (key: keyof ImportMetaEnv, fallback = '') => {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export type WhatsAppPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'

export type WhatsAppSize = 'sm' | 'md' | 'lg'

export type WhatsAppButtonConfig = {
  /** E.164 digits only, e.g. 919876543210 */
  phoneNumber: string
  defaultMessage: string
  enabled: boolean
  position: WhatsAppPosition
  offsetX: number
  offsetY: number
  size: WhatsAppSize
  showLabel: boolean
  label: string
  tooltip: string
  showTooltip: boolean
  pulse: boolean
  showOnMobile: boolean
  showOnDesktop: boolean
  zIndex: number
  backgroundColor: string
  hoverBackgroundColor: string
  iconColor: string
  textColor: string
  borderColor: string
  borderWidth: number
  borderRadius: string
  shadow: string
  ariaLabel: string
  hideOnRoutes: string[]
}

export const whatsappConfig: WhatsAppButtonConfig = {
  phoneNumber: getEnv('VITE_WHATSAPP_PHONE', '9192248901200'),
  defaultMessage: getEnv(
    'VITE_WHATSAPP_MESSAGE',
    `Hello ${env.appName}, I would like to enquire about your interior design services.`,
  ),
  enabled: getEnv('VITE_WHATSAPP_ENABLED', 'true') !== 'false',
  position: 'bottom-right',
  offsetX: 24,
  offsetY: 24,
  size: 'md',
  showLabel: false,
  label: 'Chat on WhatsApp',
  tooltip: 'Message us on WhatsApp',
  showTooltip: true,
  pulse: true,
  showOnMobile: true,
  showOnDesktop: true,
  zIndex: 40,
  backgroundColor: '#25D366',
  hoverBackgroundColor: '#1EBE57',
  iconColor: '#ffffff',
  textColor: '#ffffff',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: '9999px',
  shadow: '0 8px 28px rgba(37, 211, 102, 0.35)',
  ariaLabel: 'Chat with us on WhatsApp',
  hideOnRoutes: ['/admin'],
}

export function buildWhatsAppUrl(phoneNumber: string, message?: string) {
  const digits = phoneNumber.replace(/\D/g, '')
  const base = `https://wa.me/${digits}`

  if (!message?.trim()) {
    return base
  }

  return `${base}?text=${encodeURIComponent(message.trim())}`
}

export function resolveWhatsAppConfig(
  overrides?: Partial<WhatsAppButtonConfig>,
): WhatsAppButtonConfig {
  return { ...whatsappConfig, ...overrides }
}
