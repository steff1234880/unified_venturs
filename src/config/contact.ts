import { env } from '@/config/env'

export const contactInfo = {
  email: `hello@${env.appName}.com`,
  phone: '+91 88 6772 5353',
  phoneHref: 'tel:+918867725353',
  atelier:
    'Building No./Flat No. 1&2, Site 1, Khata 164P, Kommasandra Road, Sarjapura, Bengaluru Urban, Karnataka 562125, India.',
  mapsQuery:
    'Building No./Flat No. 1&2, Site 1, Khata 164P, Kommasandra Road, Sarjapura, Bengaluru Urban, Karnataka 562125, India.',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=Building+No.%2FFlat+No.+1%262%2C+Site+1%2C+Khata+164P%2C+Kommasandra+Road%2C+Sarjapura%2C+Bengaluru+Urban%2C+Karnataka+562125%2C+India.',
} as const

export function getMailtoHref(email: string = contactInfo.email) {
  return `mailto:${email}`
}

export function getTelHref(phone: string) {
  return `tel:${phone.replace(/\D/g, '')}`
}

export function getMapsHref(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
