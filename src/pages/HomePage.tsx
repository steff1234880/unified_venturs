import {
  BeforeAfter,
  Contact,
  DesignProcess,
  FAQ,
  FeaturedProjects,
  Gallery,
  Hero,
  MaterialCraftsmanship,
  Services,
  Stats,
  Testimonials,
  WhyChooseUs,
} from '@/components/sections'
import { JsonLd } from '@/components/seo/PageMeta'
import { absoluteUrl, siteSeo } from '@/config/seo'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'InteriorDesigner',
  name: 'Unified Ventures',
  description: siteSeo.description,
  url: absoluteUrl('/'),
  areaServed: 'IN',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1&2, Site 1, Khata 164P, Kommasandra, Sarjapura',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '562125',
    addressCountry: 'India',
  },
}

export function HomePage() {
  return (
    <main>
      <JsonLd data={organizationSchema} />
      <Hero />
      <Stats />
      <Services />
      <FeaturedProjects />
      <MaterialCraftsmanship />
      <BeforeAfter />
      <WhyChooseUs />
      <DesignProcess />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Contact />
    </main>
  )
}

