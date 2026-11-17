import { useLayoutEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { animateCounter, createSectionReveal } from '@/lib/scroll-reveal'

import { stats } from './data/home.data'

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current

    if (!section) {
      return
    }

    const ctx = gsap.context(() => {
      createSectionReveal(section, '[data-reveal]', {
        y: 32,
        stagger: 0.15,
      })

      section.querySelectorAll('[data-counter]').forEach((el) => {
        const element = el as HTMLElement
        const value = Number(element.dataset.value ?? 0)
        const suffix = element.dataset.suffix ?? ''
        animateCounter(element, value, suffix)
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative border-y border-border bg-surface py-12 sm:py-16 md:py-20"
      aria-label="Statistics"
    >
      <div className="ds-container">
        <div className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} data-reveal className="text-center md:text-left">
              <p
                data-counter
                data-value={stat.value}
                data-suffix={stat.suffix}
                className="font-display text-display-md text-charcoal-900 md:text-display-lg font-medium tracking-tight"
              >
                0{stat.suffix}
              </p>
              <p className="mt-1.5 text-caption tracking-wider uppercase font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
