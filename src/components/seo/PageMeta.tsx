import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { absoluteUrl, getPageSeo, siteSeo } from '@/config/seo'

function upsertMeta(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }

  element.href = href
}

export function PageMeta() {
  const { pathname } = useLocation()
  const meta = getPageSeo(pathname)
  const title = `${meta.title} | ${siteSeo.name}`
  const url = absoluteUrl(pathname)
  const image = absoluteUrl('/og-image.jpg')

  useEffect(() => {
    document.title = title
    upsertMeta('name', 'description', meta.description)
    upsertMeta('name', 'robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', siteSeo.name)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:locale', siteSeo.locale)
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:card', siteSeo.twitterCard)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', meta.description)
    upsertMeta('name', 'twitter:image', image)
    upsertLink('canonical', url)
  }, [image, meta.description, meta.noIndex, title, url])

  return null
}

type JsonLdProps = {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
