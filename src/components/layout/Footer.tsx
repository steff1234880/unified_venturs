import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineArrowRight } from 'react-icons/hi'

import { SocialLinks } from '@/components/common/SocialLinks'
import { Logo } from '@/components/common'
import { Button, Input } from '@/components/ui'
import { env } from '@/config/env'
import { useSiteSettings } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { createSectionReveal } from '@/lib/scroll-reveal'
import { scrollToHash } from '@/utils'

import { footerLinks } from '@/components/sections/data/home.data'

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const siteSettings = useSiteSettings()
  const locationLines = siteSettings.location
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  useLayoutEffect(() => {
    const footer = footerRef.current

    if (!footer) {
      return
    }

    const ctx = gsap.context(() => {
      createSectionReveal(footer, '[data-reveal]', {
        y: 32,
        stagger: 0.08,
        start: 'top 92%',
      })
    }, footer)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <footer
      ref={footerRef}
      className="border-t border-border bg-charcoal-900 text-ivory-100"
    >
      <div className="ds-container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div data-reveal className="lg:col-span-4">
            <Logo asLink size="lg" variant="light" />
            <p className="mt-6 max-w-sm text-body-sm text-ivory-100/65">
              Award-winning luxury interior design atelier crafting bespoke Indian
              residences with heritage artistry and contemporary elegance.
            </p>

            <SocialLinks
              className="mt-8"
              links={(['instagram', 'pinterest', 'linkedin', 'facebook'] as const).map(
                (platform) => ({
                  platform,
                  label: platform.charAt(0).toUpperCase() + platform.slice(1),
                  href: siteSettings.social[platform].url.trim(),
                  enabled:
                    siteSettings.social[platform].enabled &&
                    siteSettings.social[platform].url.trim().length > 0,
                }),
              )}
            />
          </div>

          <div data-reveal className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-5">
            <div>
              <p className="text-overline text-gold-400">Explore</p>
              <ul className="mt-4 space-y-3">
                {footerLinks.explore.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-body-sm text-ivory-100/70 transition-colors hover:text-gold-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-overline text-gold-400">Company</p>
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-body-sm text-ivory-100/70 transition-colors hover:text-gold-400"
                      onClick={(event) => {
                        if (link.href.startsWith('/#') && scrollToHash(link.href)) {
                          event.preventDefault()
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2">
              <p className="text-overline text-gold-400">Direct Contact</p>
              <div className="mt-4 space-y-2.5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gold-400/80 font-mono">Email</span>
                  <p className="mt-0.5">
                    <a
                      href={`mailto:${siteSettings.email}`}
                      className="text-body-sm text-ivory-100/80 hover:text-gold-400 transition-colors break-all"
                    >
                      {siteSettings.email}
                    </a>
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-gold-400/80 font-mono">Advisors</span>
                  <ul className="mt-2 space-y-2">
                    {(siteSettings.contactPersons || []).map((person) => {
                      const digits = person.phone.replace(/\D/g, '')
                      const fullDigits = digits.length === 10 ? `91${digits}` : digits
                      const waUrl = `https://wa.me/${fullDigits}?text=${encodeURIComponent(`Hello ${person.name}, I would like to enquire about your interior design services.`)}`

                      return (
                        <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-ivory-100/10 pb-1.5 last:border-none">
                          <span className="text-body-xs font-medium text-ivory-100/90">{person.name}</span>
                          <div className="flex items-center gap-2.5 text-body-xs">
                            <a
                              href={`tel:${digits}`}
                              className="text-ivory-100/70 hover:text-gold-400 transition-colors"
                              aria-label={`Call ${person.name} on ${person.phone}`}
                            >
                              {person.phone}
                            </a>
                            <span className="text-ivory-100/30">|</span>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              aria-label={`WhatsApp ${person.name}`}
                            >
                              WhatsApp
                            </a>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {locationLines.length > 0 && (
                  <div className="pt-2 border-t border-ivory-100/10">
                    <span className="text-[10px] uppercase tracking-wider text-gold-400/80 font-mono">Atelier</span>
                    <address className="mt-1 not-italic text-body-xs text-ivory-100/60 leading-relaxed">
                      {locationLines.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </address>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div data-reveal className="lg:col-span-3">
            <p className="text-overline text-gold-400">Newsletter</p>
            <p className="mt-4 text-body-sm text-ivory-100/65">
              Curated design inspiration and atelier updates, delivered monthly.
            </p>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input
                id="footer-newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                aria-label="Email address for newsletter"
                placeholder="Your email"
                className="min-w-0 flex-1 border-ivory-100/20 bg-charcoal-800 text-ivory-50 placeholder:text-ivory-100/40"
              />
              <Button variant="accent" size="icon" type="submit" aria-label="Subscribe" className="shrink-0 size-11">
                <HiOutlineArrowRight className="size-5" aria-hidden />
              </Button>
            </form>
          </div>
        </div>

        <div
          data-reveal
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ivory-100/10 pt-8 sm:flex-row"
        >
          <p className="text-caption text-ivory-100/50">
            &copy; {new Date().getFullYear()} {env.appName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-caption text-ivory-100/50 hover:text-gold-400">
              Privacy Policy
            </a>
            <a href="#" className="text-caption text-ivory-100/50 hover:text-gold-400">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
