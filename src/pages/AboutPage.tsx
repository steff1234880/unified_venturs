import { useLayoutEffect, useRef } from 'react'

import { stats } from '@/components/sections/data/home.data'
import { useSectionReveal } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { animateCounter } from '@/lib/scroll-reveal'
import { cn } from '@/utils'

import {
  aboutStory,
  milestones,
  values,
} from './data/about.data'

export function AboutPage() {
  const pageRef = useSectionReveal<HTMLElement>({ stagger: 0.1 })
  const timelineRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const timeline = timelineRef.current

    if (!timeline) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        timeline.querySelectorAll('[data-milestone]'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timeline,
            start: 'top 80%',
          },
        },
      )
    }, timeline)

    return () => {
      ctx.revert()
    }
  }, [])

  useLayoutEffect(() => {
    const page = pageRef.current

    if (!page) {
      return
    }

    const ctx = gsap.context(() => {
      page.querySelectorAll('[data-counter]').forEach((el) => {
        const element = el as HTMLElement
        animateCounter(
          element,
          Number(element.dataset.value ?? 0),
          element.dataset.suffix ?? '',
        )
      })
    }, page)

    return () => {
      ctx.revert()
    }
  }, [pageRef])

  return (
    <main ref={pageRef} className="bg-background">
      {/* Typographic banner — not fullscreen */}
      <header className="border-b border-border bg-charcoal-900 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="ds-container">
          <div data-reveal className="max-w-4xl">
            <p className="text-overline text-gold-400">Our Story</p>
            <h1 className="mt-4 font-display text-display-lg text-ivory-50 md:text-display-xl">
              About Unified Ventures
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-ivory-100/75">
              {aboutStory.headline}
            </p>
          </div>
        </div>
      </header>

      {/* Editorial split — sticky image */}
      <section className="ds-section">
        <div className="ds-container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div data-reveal-image className="overflow-hidden rounded-md sm:rounded-lg border border-border">
                <img
                  src={aboutStory.image}
                  alt="Unified Ventures atelier interior"
                  loading="lazy"
                  decoding="async"
                  className="aspect-4/3 sm:aspect-4/5 w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
            <div data-reveal-text className="overflow-hidden">
              <p data-reveal-text-inner className="text-body-lg text-charcoal-800">
                {aboutStory.intro}
              </p>
            </div>
              {aboutStory.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  data-reveal
                  className="text-body-md text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}

              <blockquote
                data-reveal
                className="border-l-2 border-gold-400 py-2 pl-6"
              >
                <p className="font-display text-display-sm text-charcoal-900 italic">
                  &ldquo;{aboutStory.quote.text}&rdquo;
                </p>
                <cite className="mt-3 block text-caption text-muted-foreground not-italic">
                  — {aboutStory.quote.author}
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal milestones */}
      <section className="border-y border-border bg-surface py-12 sm:py-16 md:py-20">
        <div className="ds-container">
          <div ref={timelineRef} className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-8 sm:gap-12 md:gap-20">
              {milestones.map((item) => (
                <div key={item.year} data-milestone className="w-40 sm:w-48">
                  <p className="font-display text-display-sm text-gold-600">
                    {item.year}
                  </p>
                  <p className="mt-2 text-body-sm text-charcoal-800">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento values grid */}
      <section className="ds-section">
        <div className="ds-container">
          <h2 data-reveal className="text-display-md text-charcoal-900">
            What We Stand For
          </h2>
          <div className="mt-8 sm:mt-12 grid gap-4 sm:grid-cols-2">
            {values.map((value, index) => (
              <div
                key={value.title}
                data-reveal
                className={cn(
                  'group rounded-md sm:rounded-lg border p-5 sm:p-7 md:p-8 shadow-xs transition-all duration-300 active:scale-[0.99]',
                  index === 0
                    ? 'border-charcoal-800 bg-charcoal-900 text-white sm:row-span-2 shadow-sm'
                    : 'border-border/80 bg-surface-elevated/95 hover:border-gold-400 hover:shadow-xs',
                )}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      'text-[10px] sm:text-overline tracking-widest uppercase font-medium',
                      index === 0 ? 'text-gold-400' : 'text-gold-600',
                    )}
                  >
                    Principle 0{index + 1}
                  </p>
                  <span
                    className={cn(
                      'font-mono text-[11px] tracking-wider',
                      index === 0 ? 'text-gold-400/50' : 'text-muted-foreground/60',
                    )}
                  >
                    0{index + 1}
                  </span>
                </div>

                <h3
                  className={cn(
                    'mt-3 font-display text-heading-lg sm:text-display-sm tracking-tight',
                    index === 0 ? 'text-ivory-50' : 'text-charcoal-900 group-hover:text-gold-700 transition-colors',
                  )}
                >
                  {value.title}
                </h3>
                <div
                  className={cn(
                    'my-3 h-px w-8 transition-all duration-300 group-hover:w-12',
                    index === 0 ? 'bg-gold-400/50' : 'bg-gold-400/40',
                  )}
                  aria-hidden
                />
                <p
                  className={cn(
                    'text-body-sm sm:text-body-md leading-relaxed',
                    index === 0 ? 'text-ivory-100/80' : 'text-muted-foreground',
                  )}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline stats strip */}
      <section className="border-t border-border py-14">
        <div className="ds-container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} data-reveal>
                <p
                  data-counter
                  data-value={stat.value}
                  data-suffix={stat.suffix}
                  className="font-display text-display-md text-charcoal-900"
                >
                  0{stat.suffix}
                </p>
                <p className="mt-1 text-caption text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
