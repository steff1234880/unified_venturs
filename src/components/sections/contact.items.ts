import {
  HiOutlineLocationMarker,
  HiOutlineMail,
} from 'react-icons/hi'
import type { IconType } from 'react-icons'

import { buildWhatsAppUrl } from '@/config/whatsapp'
import { formatPhoneDisplay, getContactDetailsFromSettings } from '@/lib/site-settings'
import type { SiteSettings } from '@/types/site-settings'

export type ContactPersonItem = {
  id: string
  name: string
  phone: string
  phoneDisplay: string
  phoneHref: string
  whatsappHref: string
}

export type ContactInfoItem = {
  icon: IconType
  label: string
  value: string
  href: string
  external?: boolean
}

export function buildHomeContactPersons(settings: SiteSettings): ContactPersonItem[] {
  const { contactPersons } = getContactDetailsFromSettings(settings)

  return contactPersons.map((person) => {
    const digits = person.phone.replace(/\D/g, '')
    const fullDigits = digits.length === 10 ? `91${digits}` : digits
    return {
      id: person.id,
      name: person.name,
      phone: person.phone,
      phoneDisplay: formatPhoneDisplay(person.phone),
      phoneHref: `tel:${digits}`,
      whatsappHref: buildWhatsAppUrl(fullDigits, `Hello ${person.name}, I would like to enquire about your interior design services.`),
    }
  })
}

export function buildHomeContactItems(settings: SiteSettings): ContactInfoItem[] {
  const contact = getContactDetailsFromSettings(settings)

  return [
    {
      icon: HiOutlineMail,
      label: 'Email',
      value: contact.email,
      href: contact.mailtoHref,
    },
    {
      icon: HiOutlineLocationMarker,
      label: 'Atelier',
      value: contact.atelier,
      href: contact.mapsHref,
      external: true,
    },
  ]
}
