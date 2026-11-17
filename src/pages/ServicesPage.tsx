import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowRight } from 'react-icons/hi'

import { Button } from '@/components/ui'
import { useSectionReveal } from '@/hooks'
import { cn } from '@/utils'

import { serviceDetails } from './data/services.data'

export function ServicesPage() {
  const pageRef = useSectionReveal<HTMLElement>({ stagger: 0.08 })
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<string>(serviceDetails[0]?.id ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('[data-service-section]')

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target.id) {
          setActiveId(visible.target.id)
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    sections.forEach((section) => observerRef.current?.observe(section))

    return () => observerRef.current?.disconnect()
  }, [])

  const scrollToService = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main ref={pageRef} className="bg-background">
      {/* Minimal title bar — light, not cinematic */}
      <header className="border-b border-border pt-28 pb-10 md:pt-32">
        <div className="ds-container">
          <nav data-reveal className="text-caption text-muted-foreground">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-teak-600"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <span className="text-charcoal-800">Services</span>
          </nav>
          <h1
            data-reveal
            className="mt-6 font-display text-display-lg text-charcoal-900"
          >
            Our Services
          </h1>
          <p data-reveal className="mt-4 max-w-xl text-body-lg text-muted-foreground">
            Four distinct disciplines, one uncompromising standard of excellence.
          </p>
        </div>
      </header>

      {/* Sticky sidebar + scrolling panels */}
      <div className="ds-container w-full min-w-0 overflow-x-hidden">
        <div className="grid gap-10 py-10 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:gap-16 lg:py-20 min-w-0">
          <aside className="lg:col-span-3 min-w-0">
            <nav
              data-reveal
              className="sticky top-20 sm:top-24 lg:top-28 z-20 flex flex-row gap-2 overflow-x-auto no-scrollbar bg-background/95 py-2.5 backdrop-blur-md lg:flex-col lg:gap-1 lg:overflow-visible lg:bg-transparent lg:py-0 lg:backdrop-blur-none -mx-4 px-4 sm:mx-0 sm:px-0"
              aria-label="Service navigation"
            >
              {serviceDetails.map((service, index) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => scrollToService(service.id)}
                  className={cn(
                    'shrink-0 whitespace-nowrap min-h-11 rounded-md px-3.5 sm:px-4 py-2 sm:py-3 text-left transition-luxury ds-focus-ring',
                    'lg:w-full',
                    activeId === service.id
                      ? 'bg-charcoal-900 text-ivory-50 shadow-xs'
                      : 'text-charcoal-700 hover:bg-surface border border-border/60 lg:border-none',
                  )}
                >
                  <span className="text-caption text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-0.5 sm:mt-1 block text-body-sm font-medium">
                    {service.title}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="space-y-8 sm:space-y-12 md:space-y-24 lg:col-span-9 lg:space-y-40 min-w-0">
            {serviceDetails.map((service, index) => (
              <article
                key={service.id}
                id={service.id}
                data-service-section
                data-reveal
                className={cn(
                  'w-full min-w-0 p-4 sm:p-6 md:p-0 rounded-md md:rounded-none border md:border-none border-border bg-surface-elevated md:bg-transparent shadow-xs md:shadow-none',
                  'grid gap-6 md:gap-12 transition-all duration-300',
                  index % 2 === 0
                    ? 'md:grid-cols-5'
                    : 'md:grid-cols-5 md:[&>*:first-child]:order-2',
                )}
              >
                <div className="w-full min-w-0 md:col-span-2">
                  <div className="relative w-full overflow-hidden rounded-md sm:rounded-lg border border-border bg-charcoal-900 shadow-xs">
                    <img
                      src={service.image}
                      alt={service.title}
                      decoding="async"
                      className="aspect-16/10 sm:aspect-4/5 w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3 md:hidden">
                      <span className="inline-flex items-center gap-1.5 rounded-xs border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-mono tracking-widest text-gold-400 backdrop-blur-md shadow-xs uppercase">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center w-full min-w-0 md:col-span-3">
                  <p className="text-[10px] sm:text-overline tracking-widest uppercase font-medium text-gold-600 break-words">
                    {service.tagline}
                  </p>
                  <h2 className="mt-2 sm:mt-3 font-display text-heading-xl sm:text-display-sm text-charcoal-900 break-words">
                    {service.title}
                  </h2>
                  <p className="mt-2.5 sm:mt-4 text-body-sm sm:text-body-md text-muted-foreground leading-relaxed break-words">
                    {service.description}
                  </p>

                  <ul className="mt-5 sm:mt-8 grid gap-2 sm:grid-cols-2 min-w-0">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-surface/50 px-3 py-2 text-body-xs sm:text-body-sm text-charcoal-800 md:border-none md:bg-transparent md:px-0 md:py-0 min-w-0 break-words"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* CTA band */}
      <section data-reveal className="bg-charcoal-900 py-16 md:py-20">
        <div className="ds-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-overline text-gold-400">Ready to begin?</p>
            <p className="mt-2 font-display text-display-sm text-ivory-50">
              Let&apos;s discuss your project
            </p>
          </div>
          <Button
            variant="ivory"
            size="lg"
            className="group w-fit max-w-full sm:w-auto"
            onClick={() => navigate('/contact')}
          >
            <span>Book Consultation</span>
            <HiOutlineArrowRight
              className="size-4 text-charcoal-900 transition-transform duration-300 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </Button>
        </div>
      </section>
    </main>
  )
}
