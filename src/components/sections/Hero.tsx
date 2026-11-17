import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowRight } from 'react-icons/hi'

import { Button } from '@/components/ui'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { gsap } from '@/lib/gsap'
import { cn, scrollToHash } from '@/utils'

import { animateScrollIndicator } from './hero.animations'
import { heroContent, heroMedia } from './hero.config'
import { ScrollIndicator } from './ScrollIndicator'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const overlineRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const asideRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLSpanElement>(null)
  const navigate = useNavigate()

  const handleCta = (href: string) => {
    if (href.startsWith('/#') || href.startsWith('#')) {
      if (scrollToHash(href)) return
    }
    navigate(href)
  }

  useLayoutEffect(() => {
    const section = sectionRef.current
    const bg = bgRef.current
    const media = mediaRef.current
    const overlay = overlayRef.current
    const content = contentRef.current
    const overline = overlineRef.current
    const title = titleRef.current
    const subtitle = subtitleRef.current
    const aside = asideRef.current
    const cta = ctaRef.current
    const line = lineRef.current

    if (
      !section ||
      !bg ||
      !media ||
      !overlay ||
      !content ||
      !overline ||
      !title ||
      !subtitle ||
      !cta ||
      !line
    ) {
      return
    }

    const titleLines = title.querySelectorAll('[data-hero-line]')
    const scrollIndicator = section.querySelector('[data-hero-scroll]')

    const ctx = gsap.context(() => {
      const entrance = gsap.timeline({
        defaults: { ease: 'power3.out' },
      })

      const animatedElements = [overline, ...titleLines, subtitle, cta, line]
      if (aside) animatedElements.push(aside)

      gsap.set(animatedElements, {
        opacity: 0,
      })
      gsap.set(overline, { y: 32 })
      gsap.set(titleLines, { y: 72 })
      gsap.set(subtitle, { y: 28 })
      if (aside) gsap.set(aside, { y: 28 })
      gsap.set(cta, { y: 24 })
      gsap.set(line, { scaleX: 0 })

      if (scrollIndicator) {
        gsap.set(scrollIndicator, { opacity: 0, y: 12 })
      }

      entrance
        .fromTo(bg, { scale: 1.12 }, { scale: 1, duration: 2.4 }, 0)
        .fromTo(media, { scale: 1.08 }, { scale: 1, duration: 2.4 }, 0)
        .fromTo(
          overlay,
          { opacity: 0.55 },
          { opacity: 1, duration: 1.6 },
          0,
        )
        .to(overline, { opacity: 1, y: 0, duration: 0.7 }, 0.35)
        .to(titleLines, { opacity: 1, y: 0, stagger: 0.12, duration: 0.9 }, 0.55)
        .to(line, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0.75)
        .to(subtitle, { opacity: 1, y: 0, duration: 0.7 }, 1.05)
      
      if (aside && heroContent.aside) {
        entrance.to(aside, { opacity: 1, y: 0, duration: 0.7 }, 1.15)
      }
      
      entrance.to(cta, { opacity: 1, y: 0, duration: 0.6 }, 1.35)

      if (scrollIndicator) {
        entrance.to(scrollIndicator, { opacity: 1, y: 0, duration: 0.5 }, 1.75)
      }

      animateScrollIndicator()

      const mm = gsap.matchMedia()

      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
          .to(media, { yPercent: 18, ease: 'none' }, 0)
          .to(bg, { yPercent: 10, ease: 'none' }, 0)
          .to(content, { yPercent: -8, opacity: 0.15, ease: 'none' }, 0)
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden bg-charcoal-900"
      aria-label="Hero"
    >
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          {heroMedia.video ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={heroMedia.poster}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={heroMedia.video} type="video/mp4" />
            </video>
          ) : null}

          <OptimizedImage
            src={heroMedia.image}
            srcSet={heroMedia.imageSrcSet}
            sizes={heroMedia.imageSizes}
            alt={heroMedia.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
        </div>

        <div
          ref={overlayRef}
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/60"
          aria-hidden
        />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 flex min-h-[100dvh] flex-col justify-end pb-24 sm:pb-24 lg:pb-28 pt-24 sm:pt-32 will-change-transform"
      >
        <div className="ds-container">
          <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <p ref={overlineRef} className="text-overline text-gold-400">
                {heroContent.overline}
              </p>

              <h1
                ref={titleRef}
                className="mt-3 sm:mt-5 max-w-4xl text-display-lg sm:text-display-xl lg:text-display-2xl text-ivory-50 text-balance tracking-tight"
              >
                {heroContent.title.map((line, index) => (
                  <span
                    key={line}
                    data-hero-line
                    className={cn(
                      'block overflow-hidden',
                      index === 1 && 'italic text-gold-300/95',
                    )}
                  >
                    {line}
                  </span>
                ))}
              </h1>

              <span
                ref={lineRef}
                className="ornament-line mt-4 sm:mt-8 origin-left"
                aria-hidden
              />

              <p
                ref={subtitleRef}
                className="mt-4 sm:mt-8 max-w-2xl text-body-md sm:text-body-lg text-ivory-100/85 text-pretty"
              >
                {heroContent.subtitle}
              </p>
            </div>

            {heroContent.aside ? (
              <div className="hidden lg:col-span-4 lg:block">
                <div className="border-l border-ivory-100/20 pl-8">
                  <p
                    ref={asideRef}
                    className="text-body-sm leading-relaxed text-ivory-100/70"
                  >
                    {heroContent.aside}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div
            ref={ctaRef}
            className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <Button
              variant="ivory"
              size="lg"
              className="group w-fit max-w-full"
              onClick={() => handleCta(heroContent.primaryCta.href)}
            >
              <span>{heroContent.primaryCta.label}</span>
              <HiOutlineArrowRight
                className="size-4 text-charcoal-900 transition-transform duration-300 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </Button>
            <Button
              variant="outline-ivory"
              size="lg"
              className="w-fit max-w-full"
              onClick={() => handleCta(heroContent.secondaryCta.href)}
            >
              <span>{heroContent.secondaryCta.label}</span>
            </Button>
          </div>
        </div>
      </div>

      <ScrollIndicator onClick={() => handleCta('/#collections')} />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 sm:h-32 bg-linear-to-t from-background to-transparent"
        aria-hidden
      />
    </section>
  )
}
