import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type TouchEvent } from 'react'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'

import { useSectionReveal, useSiteSettings } from '@/hooks'
import { DEFAULT_BEFORE_AFTER } from '@/lib/site-settings'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils'

import { SectionHeader, SectionShell } from './shared/SectionHeader'

export function BeforeAfter() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.1, y: 50 })
  const siteSettings = useSiteSettings()

  const [sliderPosition, setSliderPosition] = useState(50) // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const sliderLineRef = useRef<HTMLDivElement | null>(null)

  const overline = siteSettings.beforeAfterOverline || DEFAULT_BEFORE_AFTER.overline
  const heading = siteSettings.beforeAfterHeading || DEFAULT_BEFORE_AFTER.heading
  const description = siteSettings.beforeAfterDescription || DEFAULT_BEFORE_AFTER.description
  const beforeImage = siteSettings.beforeAfterBeforeImage || DEFAULT_BEFORE_AFTER.beforeImage
  const afterImage = siteSettings.beforeAfterAfterImage || DEFAULT_BEFORE_AFTER.afterImage

  // Update slider position based on clientX
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
    setHasInteracted(true)
  }, [])

  // Mouse handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    updatePosition(e.clientX)
  }

  // Global mousemove / mouseup while dragging
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      updatePosition(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, updatePosition])

  // Touch handlers (native touch-friendly for mobile/tablet)
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (touch) {
      setIsDragging(true)
      updatePosition(touch.clientX)
    }
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (touch) {
      updatePosition(touch.clientX)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Keyboard accessibility
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setSliderPosition((prev) => Math.max(0, prev - 5))
      setHasInteracted(true)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setSliderPosition((prev) => Math.min(100, prev + 5))
      setHasInteracted(true)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setSliderPosition(0)
      setHasInteracted(true)
    } else if (e.key === 'End') {
      e.preventDefault()
      setSliderPosition(100)
      setHasInteracted(true)
    }
  }

  // Entrance reveal motion when user scrolls into view (respects reduced motion)
  useEffect(() => {
    if (hasInteracted || !containerRef.current) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    const el = containerRef.current
    const proxy = { pos: 50 }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        proxy,
        { pos: 60 },
        {
          pos: 40,
          duration: 2,
          ease: 'power2.inOut',
          repeat: 1,
          yoyo: true,
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
            once: true,
          },
          onUpdate() {
            setSliderPosition(proxy.pos)
          },
          onComplete() {
            setSliderPosition(50)
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [hasInteracted])

  return (
    <SectionShell id="transformations" ref={sectionRef} className="bg-surface relative">
      <div className="ds-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <SectionHeader
            overline={overline}
            title={heading}
            description={description}
            className="text-center"
          />
        </div>

        {/* Single Before & After Showcase */}
        <div className="mt-10 sm:mt-12 max-w-5xl mx-auto">
          <div
            data-reveal
            className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-charcoal-950 shadow-2xl select-none group"
          >
            <div
              ref={containerRef}
              className="relative aspect-4/3 sm:aspect-16/10 lg:aspect-16/9 w-full min-h-[320px] sm:min-h-[480px] cursor-ew-resize overflow-hidden touch-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="slider"
              tabIndex={0}
              aria-label={`Interactive Before and After slider comparison`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderPosition)}
              aria-valuetext={`${Math.round(sliderPosition)}% reveals Before, ${100 - Math.round(sliderPosition)}% reveals After`}
              onKeyDown={handleKeyDown}
            >
              {/* 1. AFTER IMAGE (Base Layer - 100% full width, luxury completed state) */}
              <div className="absolute inset-0 size-full pointer-events-none">
                <img
                  src={afterImage}
                  alt="Completed Luxury Interior (After)"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
                {/* Subtle vignette for depth */}
                <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(10,10,10,0.3)_100%]" />
              </div>

              {/* 2. BEFORE IMAGE (Clipped Layer - exact identical perspective & camera angle) */}
              <div
                className="absolute inset-0 size-full overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                  WebkitClipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                }}
              >
                <img
                  src={beforeImage}
                  alt="Original Architectural State (Before)"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
                {/* Authentic raw contrast overlay */}
                <div className="absolute inset-0 bg-charcoal-950/15" />
              </div>

              {/* SLIDER LINE & DRAGGABLE HANDLE */}
              <div
                ref={sliderLineRef}
                className="absolute inset-y-0 z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Vertical hairline in luxury gold */}
                <div className="absolute top-0 bottom-0 -left-px w-0.5 bg-gradient-to-b from-gold-300 via-gold-400 to-gold-300 shadow-[0_0_12px_rgba(214,201,183,0.85)]" />

                {/* Centered Circular Handle */}
                <div
                  className={cn(
                    'absolute top-1/2 -left-6 -translate-y-1/2 size-12 rounded-full',
                    'bg-charcoal-900/90 backdrop-blur-md border border-gold-400/80 shadow-2xl',
                    'flex items-center justify-center text-gold-300',
                    'transition-transform duration-150',
                    isDragging ? 'scale-110 shadow-gold' : 'group-hover:scale-105',
                  )}
                  aria-hidden
                >
                  <HiOutlineSwitchHorizontal className="size-5 transition-transform" />
                  {/* Concentric subtle gold halo */}
                  <div className="absolute -inset-1 rounded-full border border-gold-400/30 animate-pulse-soft pointer-events-none" />
                </div>
              </div>

              {/* PILL BADGES FOR BEFORE & AFTER */}
              {/* BEFORE BADGE (Left Top) */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-charcoal-950/85 px-3 py-1 text-[11px] sm:text-caption uppercase tracking-wider font-medium text-ivory-100 shadow-md backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-stone-400" />
                  Before
                </span>
              </div>

              {/* AFTER BADGE (Right Top) */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/50 bg-charcoal-950/85 px-3 py-1 text-[11px] sm:text-caption uppercase tracking-wider font-medium text-gold-400 shadow-md backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-gold-400" />
                  After
                </span>
              </div>

              {/* HELPER HINT AT BOTTOM CENTER */}
              <div
                className={cn(
                  'absolute bottom-4 inset-x-0 mx-auto w-fit z-10 pointer-events-none transition-opacity duration-500',
                  hasInteracted ? 'opacity-0' : 'opacity-90 sm:opacity-100',
                )}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-charcoal-950/85 border border-white/10 px-3.5 py-1 text-[11px] text-ivory-100/90 backdrop-blur-md shadow-sm">
                  <HiOutlineSwitchHorizontal className="size-3.5 text-gold-400 animate-pulse" />
                  Drag slider or use arrow keys
                </span>
              </div>
            </div>

            {/* Editorial Metamorphosis Footer Bar */}
            <div className="border-t border-ivory-100/10 bg-charcoal-900 px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-gold-400" />
                <span className="font-display text-heading-sm sm:text-heading-md text-ivory-50 font-medium">
                  Identical Angle Architectural Comparison
                </span>
              </div>
              <p className="text-caption sm:text-body-sm text-ivory-100/70">
                1:1 camera alignment showing bare construction vs completed bespoke luxury finish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
