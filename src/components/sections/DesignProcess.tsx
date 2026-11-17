import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { useSectionReveal } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { animateLineDraw } from '@/lib/scroll-reveal'

import { processSteps } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

export function DesignProcess() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.18, y: 40 })
  const lineRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const line = lineRef.current

    if (!section || !line) {
      return
    }

    const ctx = gsap.context(() => {
      animateLineDraw(line, section)
    }, section)

    return () => {
      ctx.revert()
    }
  }, [sectionRef])

  const scrollRaf = useRef<number | null>(null)

  const handleScroll = useCallback(() => {
    if (scrollRaf.current !== null) return
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null
      const el = carouselRef.current
      if (!el || el.clientWidth === 0) return
      const index = Math.round(el.scrollLeft / el.clientWidth)
      if (index >= 0 && index < processSteps.length && index !== activeIndex) {
        setActiveIndex(index)
      }
    })
  }, [activeIndex])

  const scrollToSlide = useCallback((index: number) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: 'smooth',
    })
    setActiveIndex(index)
  }, [])

  return (
    <SectionShell id="process" ref={sectionRef} dark>
      <div className="ds-container relative">
        <SectionHeader
          overline="Our Method"
          title="The Design Process"
          description="A refined five-stage journey from first conversation to the moment you step into your transformed home."
          align="center"
          dark
        />

        {/* Desktop view (lg and above): original layout and design unchanged */}
        <div className="relative mt-12 sm:mt-16 hidden lg:block">
          <div
            ref={lineRef}
            className="absolute left-0 right-0 top-8 h-px origin-left bg-gold-400/30"
            aria-hidden
          />

          <ol className="grid lg:grid-cols-5 lg:gap-6">
            {processSteps.map((step) => (
              <li key={step.step} data-reveal className="relative text-left">
                <div className="flex size-16 items-center justify-center rounded-full border border-gold-400/30 bg-charcoal-800 font-display text-display-sm text-gold-400">
                  {step.step}
                </div>
                <h3 className="mt-6 text-heading-md text-ivory-50">{step.title}</h3>
                <p className="mt-3 text-body-sm text-ivory-100/65">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile & Tablet view (under lg): smooth CSS-based swipeable carousel */}
        <div data-reveal className="relative mt-10 sm:mt-14 lg:hidden">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="no-scrollbar flex w-full touch-pan-x snap-x snap-mandatory overflow-x-auto scroll-smooth py-2"
          >
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="w-full min-w-full shrink-0 snap-center snap-always px-1 sm:px-3"
              >
                <div className="relative flex min-h-[290px] flex-col items-center justify-between rounded-md sm:rounded-lg border border-gold-400/20 bg-charcoal-800 p-5 sm:p-8 text-center shadow-md">
                  {/* Step Stage Pill & Counter */}
                  <div className="mb-3 flex w-full items-center justify-between text-xs">
                    <span className="rounded border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-gold-400 uppercase">
                      Stage {step.step}
                    </span>
                    <span className="font-mono text-[11px] text-ivory-100/50">
                      {step.step} / {String(processSteps.length).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Circular Step Badge */}
                  <div className="my-1.5 flex size-14 sm:size-16 items-center justify-center rounded-full border border-gold-400/40 bg-charcoal-900">
                    <span className="font-display text-display-sm text-gold-400">
                      {step.step}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 flex flex-1 flex-col items-center justify-center">
                    <h3 className="font-display text-heading-md sm:text-heading-lg text-ivory-50 tracking-tight font-medium">
                      {step.title}
                    </h3>
                    <div
                      className="my-2 h-px w-8 bg-gold-400/50"
                      aria-hidden
                    />
                    <p className="max-w-xs text-body-sm text-ivory-100/75 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Pagination Dots */}
          <div className="mt-7 flex items-center justify-center">
            <div className="flex min-w-16 items-center justify-center gap-2">
              {processSteps.map((step, idx) => (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => scrollToSlide(idx)}
                  className={`transition-all duration-300 cursor-pointer ds-focus-ring ${
                    idx === activeIndex
                      ? 'h-2.5 w-7 rounded-full bg-gold-400'
                      : 'size-2.5 rounded-full bg-gold-400/35 hover:bg-gold-400/60'
                  }`}
                  aria-label={`Go to step ${step.step}`}
                  aria-current={idx === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
