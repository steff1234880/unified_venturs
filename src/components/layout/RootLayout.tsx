import { ScrollRestoration } from 'react-router-dom'

import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import { PageMeta } from '@/components/seo/PageMeta'
import { useSiteSettings } from '@/hooks'
import { MotionProvider, PageTransition } from '@/motion'
import { LenisProvider } from '@/providers/LenisProvider'

import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { SkipLink } from './SkipLink'

export function RootLayout() {
  const siteSettings = useSiteSettings()

  return (
    <LenisProvider>
      <MotionProvider>
        <PageMeta />
        <ScrollRestoration />
        <SkipLink />
        <Navbar />
        <PageTransition />
        <Footer />
        <WhatsAppButton phoneNumber={siteSettings.whatsappPhone} />
      </MotionProvider>
    </LenisProvider>
  )
}
