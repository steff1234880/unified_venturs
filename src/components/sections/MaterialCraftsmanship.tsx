import { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  HiOutlineSparkles,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineEye,
  HiOutlineX,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

import { fetchCollection } from '@/admin/storage'
import type { AdminGalleryItem } from '@/admin/types'
import { Button } from '@/components/ui'
import { useMediaQuery, usePrefersReducedMotion, useScrollLock, useSectionReveal } from '@/hooks'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { gsap } from '@/lib/gsap'

import { SectionHeader, SectionShell } from './shared/SectionHeader'

export type CraftsmanshipPillar = {
  id: string
  discipline: string
  material: string
  title: string
  caption: string
  provenance: string
  finish: string
  image: string
  aspectRatio: string
}

// Curated high-resolution authentic textures & finishes matching the Indian luxury atelier aesthetic
const defaultCraftsmanshipPillars: CraftsmanshipPillar[] = [
  {
    id: 'stone-marble',
    discipline: 'Monumental Masonry',
    material: 'Veined Marble & Laterite',
    title: 'Honed Stone & Monolithic Veining',
    caption:
      'Hand-selected Statuario and indigenous Makrana marbles, bookmatched with zero-tolerance micro-joints.',
    provenance: 'Master Stone Guilds',
    finish: 'Silk-Honed Matte & Fluted Relief',
    image:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85',
    aspectRatio: 'aspect-4/5',
  },
  {
    id: 'timber-joinery',
    discipline: 'Artisanal Joinery',
    material: 'Burmese Teak & Dark Walnut',
    title: 'Warm Grain & Architectural Millwork',
    caption:
      'Seasoned solid hardwoods turned into bespoke fluted wall panels, seamless concealed pivot doors, and heirloom credenzas.',
    provenance: 'Dedicated Joinery Ateliers',
    finish: 'Hand-Rubbed Organic Wax & Natural Oil',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
    aspectRatio: 'aspect-16/10',
  },
  {
    id: 'bespoke-brass',
    discipline: 'Metalwork & Hardware',
    material: 'Aged Brass & Bronze Castings',
    title: 'Antiquated Patinas & Bespoke Accents',
    caption:
      'Custom unlacquered brass hardware, hand-beaten partition screens, and recessed profiles that age gracefully alongside the home.',
    provenance: 'Artisanal Metal Guilds',
    finish: 'Brushed Satin & Living Patina',
    image:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85',
    aspectRatio: 'aspect-4/3',
  },
  {
    id: 'tactile-textiles',
    discipline: 'Textile Architecture',
    material: 'Handloom Linen & Wild Silk',
    title: 'Tactile Weaves & Acoustic Softness',
    caption:
      'Custom woven silks, bouclé wool drapery, and unbleached Belgian linens layered to soften geometric architecture and filter ambient light.',
    provenance: 'Master Weaving Looms',
    finish: 'Raw Organic Weave & Calendered Softness',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    aspectRatio: 'aspect-3/4',
  },
]

// Mobile-only editorial rhythm: varied widths, alignments & proportions
const mobileRevealClass =
  'opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-out [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0'

const mobileVariants = [
  { wrap: 'w-full', aspect: 'aspect-[4/5]', number: 'right-0 -top-7', caption: 'pr-10' },
  { wrap: 'w-[80%] ml-auto', aspect: 'aspect-[3/4]', number: '-left-[22%] top-6', caption: 'text-right' },
  { wrap: 'w-[74%]', aspect: 'aspect-square', number: '-right-[30%] top-10', caption: 'pr-4' },
  { wrap: 'w-full', aspect: 'aspect-[16/11]', number: 'left-0 -top-7', caption: 'pl-8 border-l border-gold-500/50' },
] as const

export function MaterialCraftsmanship() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.12, y: 35 })
  const navigate = useNavigate()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useMediaQuery('(max-width: 639px)')
  const siteSettings = useSiteSettings()

  const [pillars, setPillars] = useState<CraftsmanshipPillar[]>(defaultCraftsmanshipPillars)
  const [activeItem, setActiveItem] = useState<CraftsmanshipPillar | null>(null)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const modalScrollRef = useRef<HTMLDivElement | null>(null)

  const imageCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const featureCardRef = useRef<HTMLDivElement | null>(null)

  const craftSettings = siteSettings?.craftsmanship

  // Sync with Admin craftsmanship collection, falling back to siteSettings or defaultCraftsmanshipPillars
  useEffect(() => {
    let cancelled = false

    const loadCraftsmanship = async () => {
      try {
        const items = await fetchCollection('craftsmanship')
        if (cancelled) return

        if (Array.isArray(items) && items.length > 0) {
          // Filter to published only and sort by order
          const published = items
            .filter((item: any) => item.published !== false)
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))

          if (published.length > 0) {
            setPillars(
              published.map((p: any) => ({
                id: p.id || `pillar_${Math.random().toString(36).slice(2, 7)}`,
                discipline: p.discipline || 'Artisanal Craft',
                material: p.material || 'Material Specimen',
                title: p.title || 'Architectural Detail',
                caption: p.caption || '',
                provenance: p.provenance || 'Master Artisans',
                finish: p.finish || 'Hand-Crafted',
                image: p.image || '/images/after-living-room.jpg',
                aspectRatio: p.aspectRatio || 'aspect-4/3',
              })),
            )
            return
          }
        }
      } catch (err) {
        console.warn('Failed to fetch craftsmanship collection, checking fallback:', err)
      }

      if (craftSettings?.pillars && Array.isArray(craftSettings.pillars) && craftSettings.pillars.length > 0) {
        setPillars(
          craftSettings.pillars.map((p: any) => ({
            id: p.id || `pillar_${Math.random().toString(36).slice(2, 7)}`,
            discipline: p.discipline || 'Artisanal Craft',
            material: p.material || 'Material Specimen',
            title: p.title || 'Architectural Detail',
            caption: p.caption || '',
            provenance: p.provenance || 'Master Artisans',
            finish: p.finish || 'Hand-Crafted',
            image: p.image || '/images/after-living-room.jpg',
            aspectRatio: p.aspectRatio || 'aspect-4/3',
          })),
        )
      }
    }

    loadCraftsmanship()

    return () => {
      cancelled = true
    }
  }, [craftSettings])

  // Prevent background scrolling while inspecting material detail
  useScrollLock(activeItem !== null)

  // Reset scroll and loading state whenever the active inspected item changes
  useEffect(() => {
    if (activeItem) {
      setIsImageLoaded(false)
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0
      }
    }
  }, [activeItem?.id, activeItem?.image])

  const closeInspector = useCallback(() => {
    setActiveItem(null)
  }, [])

  const goToPrevPillar = useCallback(() => {
    if (!activeItem || pillars.length === 0) return
    const currentIndex = pillars.findIndex((p) => p.id === activeItem.id)
    const prevIndex = currentIndex <= 0 ? pillars.length - 1 : currentIndex - 1
    setActiveItem(pillars[prevIndex] ?? null)
  }, [activeItem, pillars])

  const goToNextPillar = useCallback(() => {
    if (!activeItem || pillars.length === 0) return
    const currentIndex = pillars.findIndex((p) => p.id === activeItem.id)
    const nextIndex = currentIndex >= pillars.length - 1 ? 0 : currentIndex + 1
    setActiveItem(pillars[nextIndex] ?? null)
  }, [activeItem, pillars])

  // Integrate with existing admin gallery items if categorized under 'Craft' or 'Details'
  useEffect(() => {
    let cancelled = false

    async function loadAdminMaterials() {
      try {
        const storedGallery = (await fetchCollection('gallery')) as AdminGalleryItem[]
        if (cancelled || !Array.isArray(storedGallery) || storedGallery.length === 0) return

        const craftImages = storedGallery.filter(
          (item) =>
            item.collection?.toLowerCase().includes('craft') ||
            item.collection?.toLowerCase().includes('detail') ||
            item.collection?.toLowerCase().includes('material'),
        )

        if (craftImages.length >= 2) {
          // Enhance default pillars with admin uploaded images if present
          setPillars((prev) =>
            prev.map((pillar, idx) => {
              const matched = craftImages[idx]
              if (matched && matched.src) {
                return {
                  ...pillar,
                  image: matched.src,
                  caption: matched.alt || pillar.caption,
                }
              }
              return pillar
            }),
          )
        }
      } catch {
        // Retain curated default editorial pillars
      }
    }

    void loadAdminMaterials()

    return () => {
      cancelled = true
    }
  }, [])

  // Parallax zoom and scroll-triggered reveals using GSAP
  useLayoutEffect(() => {
    if (prefersReducedMotion) return

    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop subtle magazine parallax offsets
      mm.add('(min-width: 1024px)', () => {
        imageCardRefs.current.forEach((card, index) => {
          if (!card) return
          const img = card.querySelector('img')
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.12, y: -15 },
              {
                scale: 1,
                y: 15,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.2,
                },
              },
            )
          }

          // Gentle staggered vertical rhythm
          const yOffset = (index % 2 === 0 ? 1 : -1) * 20
          gsap.fromTo(
            card,
            { y: yOffset },
            {
              y: -yOffset * 0.8,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )
        })
      })

      // Mobile: lightweight reveal without conflicting scale/opacity locks
      mm.add('(max-width: 1023px)', () => {
        // Ensure all cards are immediately visible as a reliable fallback on mobile
        imageCardRefs.current.forEach((card) => {
          if (!card) return
          gsap.set(card, { opacity: 1, y: 0 })
        })
      })
    }, section)

    return () => ctx.revert()
  }, [prefersReducedMotion, pillars, sectionRef])

  // Handle keyboard navigation (Escape to close, Left/Right arrow keys to cycle specimens)
  useEffect(() => {
    if (!activeItem) return
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeInspector()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevPillar()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNextPillar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem, closeInspector, goToPrevPillar, goToNextPillar])

  const leadPillar = pillars[0]
  const secondaryPillars = pillars.slice(1)

  // Mobile-only: lightweight reveal via IntersectionObserver (no GSAP cost)
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !isMobile) return
    const nodes = Array.from(section.querySelectorAll<HTMLElement>('[data-m-reveal]'))
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [isMobile, prefersReducedMotion, pillars, sectionRef])

  // Mobile viewer swipe navigation
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return
    if (dx < 0) goToNextPillar()
    else goToPrevPillar()
  }
  const activeIndex = activeItem ? pillars.findIndex((p) => p.id === activeItem.id) : -1

  if (craftSettings?.enabled === false) {
    return null
  }

  const overline = craftSettings?.overline || 'Material Integrity'
  const heading = craftSettings?.heading || 'The Art of Craftsmanship'
  const description =
    craftSettings?.description ||
    'Our interiors are defined not merely by visual proportion, but by tactile authenticity — honed marbles, aged metals, hand-planed teak, and museum-grade handloom textiles sourced across the Indian subcontinent.'
  const quote =
    craftSettings?.quote ||
    'Luxury is the honest soul of authentic stone and hand-sculpted grain.'

  return (
    <SectionShell
      id="craftsmanship"
      ref={sectionRef}
      className="bg-ivory-50 text-charcoal-900 sm:bg-charcoal-900 sm:text-ivory-50 relative overflow-hidden py-16 sm:py-24 lg:py-32"
    >
      {/* Ambient architectural lighting glow (tablet & desktop) */}
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-gold-400/5 blur-[120px] hidden sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-20 h-[600px] w-[600px] rounded-full bg-teak-400/5 blur-[140px] hidden sm:block"
        aria-hidden
      />

      {/* ─── MOBILE EDITORIAL LAYOUT (< 640px only) ─── */}
      <div className="sm:hidden relative px-5">
        {/* Opening */}
        <header data-m-reveal className={mobileRevealClass}>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold-700" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold-700">
              {overline}
            </span>
          </div>
          <h2 className="mt-5 font-serif text-[2.6rem] leading-[1.02] tracking-tight text-charcoal-900">
            {heading}
          </h2>
          <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-charcoal-600">
            {description}
          </p>
        </header>

        {/* Asymmetric image story */}
        <div className="mt-12 space-y-14">
          {pillars.map((item, idx) => {
            const v = mobileVariants[idx % mobileVariants.length]!
            const number = String(idx + 1).padStart(2, '0')
            return (
              <figure
                key={item.id}
                data-m-reveal
                className={`${mobileRevealClass} relative ${v.wrap}`}
              >
                <span
                  className={`pointer-events-none absolute font-serif text-[3.25rem] leading-none text-gold-500/50 select-none ${v.number}`}
                  aria-hidden
                >
                  {number}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className={`relative block w-full overflow-hidden rounded-[2px] bg-ivory-200 shadow-[0_18px_40px_-20px_rgba(60,45,30,0.45)] active:scale-[0.99] transition-transform ${v.aspect}`}
                  aria-label={`View ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-ivory-50/85 text-charcoal-800 backdrop-blur-sm">
                    <HiOutlineEye className="size-3.5" />
                  </span>
                </button>
                <figcaption className={`mt-4 ${v.caption}`}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-700">
                    {number} — {item.discipline}
                  </p>
                  <h3 className="mt-1.5 font-serif text-[1.35rem] leading-snug text-charcoal-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-charcoal-500">
                    {item.material}
                  </p>
                </figcaption>
              </figure>
            )
          })}
        </div>

        {/* Closing note */}
        <div data-m-reveal className={`${mobileRevealClass} mt-16 border-t border-gold-500/40 pt-8`}>
          <p className="font-serif italic text-[1.2rem] leading-snug text-charcoal-800">
            “{quote}”
          </p>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-6 inline-flex items-center gap-2 border-b border-gold-700 pb-1 text-[13px] font-medium tracking-wide text-charcoal-900 cursor-pointer"
          >
            Explore Portfolio Residences
            <HiOutlineChevronRight className="size-3.5 text-gold-700" />
          </button>
        </div>
      </div>

      <div className="ds-container relative z-10 hidden sm:block">
        {/* Editorial Section Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/10 pb-8 sm:pb-12">
          <SectionHeader
            dark
            overline={overline}
            title={heading}
            description={description}
          />

          <div data-reveal className="relative z-10 shrink-0 flex items-center gap-3">
            <Button
              variant="outline-ivory"
              className="group gap-2 border-white/20 text-ivory-50 hover:bg-white/10 hover:border-gold-400"
              onClick={() => navigate('/projects')}
            >
              <span>Explore Portfolio Residences</span>
              <HiOutlineChevronRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Button>
          </div>
        </div>

        {/* ─── ASYMMETRICAL MAGAZINE-STYLE EDITORIAL SHOWCASE ─── */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          {/* Top Asymmetrical Spread: 7 Cols Lead Story + 5 Cols Secondary Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* 1. Lead Masterpiece (Statuary / Marble Texture) */}
            {leadPillar && (
              <div
                ref={(el) => {
                  imageCardRefs.current[0] = el
                  featureCardRef.current = el
                }}
                data-reveal
                className="lg:col-span-7 group relative cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-charcoal-950 shadow-2xl transition-all duration-500 hover:border-gold-400/60 active:scale-[0.995]"
                onClick={() => setActiveItem(leadPillar)}
              >
                <div className="relative aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 w-full overflow-hidden">
                  <img
                    src={leadPillar.image}
                    alt={leadPillar.title}
                    width={1200}
                    height={900}
                    decoding="async"
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />

                  {/* Editorial Film Overlay - balanced gradient for text readability without obscuring photo */}
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal-950/85 via-charcoal-950/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-75" />

                  {/* Top Meta Chips */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                    <span className="rounded-xs border border-gold-400/40 bg-charcoal-950/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-gold-400 backdrop-blur-md">
                      {leadPillar.discipline}
                    </span>
                    <span className="hidden sm:inline-flex rounded-xs border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-ivory-100/70 backdrop-blur-md">
                      {leadPillar.provenance}
                    </span>
                  </div>

                  {/* Inspect Icon button */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <span className="size-10 inline-flex items-center justify-center rounded-full border border-white/20 bg-charcoal-950/70 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-gold-400 group-hover:text-charcoal-950 group-hover:scale-105">
                      <HiOutlineEye className="size-4" />
                    </span>
                  </div>

                  {/* Bottom Editorial Caption */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-2">
                    <p className="font-mono text-caption text-gold-400 uppercase tracking-widest">
                      {leadPillar.material}
                    </p>
                    <h3 className="font-display text-heading-lg sm:text-display-sm font-medium text-ivory-50 tracking-tight group-hover:text-gold-200 transition-colors">
                      {leadPillar.title}
                    </h3>
                    <p className="text-body-sm text-ivory-100/80 font-light leading-relaxed max-w-xl line-clamp-2">
                      {leadPillar.caption}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[11px] font-mono text-ivory-200/60 uppercase tracking-wider">
                      <span>Finish: {leadPillar.finish}</span>
                      <span className="text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Examine Surface <HiOutlineChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Side Editorial Manifesto & Second Texture Feature */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              {/* Architectural Craft Philosophy Quote Box */}
              <div
                data-reveal
                className="relative rounded-xl border border-white/10 bg-surface-elevated/10 p-6 sm:p-8 backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-gold-400 font-mono text-overline">
                  <HiOutlineSparkles className="size-3.5" />
                  <span>The Atelier Principle</span>
                </div>
                <blockquote className="mt-3 font-display text-heading-md sm:text-heading-lg font-light text-ivory-100 leading-snug tracking-tight">
                  "Luxury is not superficial ornamentation — it is the honest soul of authentic stone, hand-sculpted grain, and master craftsmanship built to outlive generations."
                </blockquote>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-caption text-ivory-200/60 font-mono">
                  <span>Bengaluru, Karnataka</span>
                  <span className="text-gold-400">100% Bespoke</span>
                </div>
              </div>

              {/* Second Pillar: Artisanal Timber / Woodwork */}
              {secondaryPillars[0] && (() => {
                const item = secondaryPillars[0]
                return (
                  <div
                    ref={(el) => {
                      imageCardRefs.current[1] = el
                    }}
                    data-reveal
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-charcoal-950 shadow-xl transition-all duration-500 hover:border-gold-400/60 active:scale-[0.995]"
                    onClick={() => setActiveItem(item)}
                  >
                    <div className="relative aspect-16/10 w-full overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        width={900}
                        height={560}
                        decoding="async"
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-charcoal-950/80 via-charcoal-950/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-65" />
 
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        <span className="rounded-xs border border-white/20 bg-charcoal-950/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gold-400 backdrop-blur-md">
                          {item.discipline}
                        </span>
                      </div>

                      <div className="absolute bottom-3.5 left-4 right-4 text-white">
                        <p className="font-mono text-[10px] text-gold-400/90 uppercase tracking-wider">
                          {item.material}
                        </p>
                        <h4 className="font-display text-heading-md font-medium text-ivory-50 group-hover:text-gold-200 transition-colors">
                          {item.title}
                        </h4>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-ivory-200/60">
                          <span>{item.finish}</span>
                          <span className="text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View Detail <HiOutlineChevronRight className="size-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Bottom Spread: Split Duo with Distinct Alt Rhythms */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {secondaryPillars.slice(1).map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => {
                  imageCardRefs.current[2 + idx] = el
                }}
                data-reveal
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-charcoal-950 shadow-xl transition-all duration-500 hover:border-gold-400/60 active:scale-[0.995]"
                onClick={() => setActiveItem(item)}
              >
                <div className="relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    width={900}
                    height={500}
                    decoding="async"
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal-950/80 via-charcoal-950/15 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-65" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="rounded-xs border border-white/20 bg-charcoal-950/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-gold-400 backdrop-blur-md">
                      {item.discipline}
                    </span>
                    <span className="rounded-xs border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-ivory-100/70 backdrop-blur-md">
                      {item.provenance}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-1">
                    <p className="font-mono text-caption text-gold-400 uppercase tracking-widest">
                      {item.material}
                    </p>
                    <h4 className="font-display text-heading-md sm:text-heading-lg font-medium text-ivory-50 group-hover:text-gold-200 transition-colors">
                      {item.title}
                    </h4>
                    <p className="line-clamp-2 text-body-xs sm:text-body-sm text-ivory-100/80 font-light leading-relaxed">
                      {item.caption}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-ivory-200/60">
                      <span>Finish: {item.finish}</span>
                      <span className="text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Examine <HiOutlineChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Craft Accreditations Banner */}
          <div
            data-reveal
            className="mt-10 sm:mt-16 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center md:text-left">
              <div>
                <span className="font-display text-heading-lg sm:text-display-sm text-gold-400 font-light">
                  100%
                </span>
                <p className="mt-1 text-caption font-mono uppercase tracking-wider text-ivory-100/70">
                  Ethically Sourced Stone
                </p>
              </div>
              <div>
                <span className="font-display text-heading-lg sm:text-display-sm text-gold-400 font-light">
                  FSC
                </span>
                <p className="mt-1 text-caption font-mono uppercase tracking-wider text-ivory-100/70">
                  Certified Reclaimed Timber
                </p>
              </div>
              <div>
                <span className="font-display text-heading-lg sm:text-display-sm text-gold-400 font-light">
                  40+
                </span>
                <p className="mt-1 text-caption font-mono uppercase tracking-wider text-ivory-100/70">
                  Master Guild Artisans
                </p>
              </div>
              <div>
                <span className="font-display text-heading-lg sm:text-display-sm text-gold-400 font-light">
                  0 mm
                </span>
                <p className="mt-1 text-caption font-mono uppercase tracking-wider text-ivory-100/70">
                  Precision Joint Tolerance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE LIGHT FULLSCREEN VIEWER ─── */}
      {activeItem &&
        isMobile &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`View ${activeItem.title}`}
            className="fixed inset-0 z-50 flex flex-col bg-ivory-50 text-charcoal-900"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
              <span className="font-mono text-[11px] tracking-[0.22em] text-gold-700">
                {String(activeIndex + 1).padStart(2, '0')} / {String(pillars.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={closeInspector}
                className="inline-flex size-11 items-center justify-center rounded-full border border-charcoal-900/15 bg-white text-charcoal-900 active:scale-95"
                aria-label="Close viewer"
              >
                <HiOutlineX className="size-5" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
              <img
                key={activeItem.image}
                src={activeItem.image}
                alt={activeItem.title}
                loading="eager"
                decoding="sync"
                draggable={false}
                className="max-h-full max-w-full rounded-[2px] object-contain shadow-[0_20px_50px_-24px_rgba(60,45,30,0.5)] select-none"
              />
            </div>

            <div className="px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-700">
                {activeItem.discipline}
              </p>
              <h3 className="mt-1.5 font-serif text-[1.4rem] leading-snug">{activeItem.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-charcoal-500 line-clamp-2">
                {activeItem.caption}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevPillar}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-charcoal-900/15 active:scale-95"
                  aria-label="Previous image"
                >
                  <HiOutlineChevronLeft className="size-5" />
                </button>
                <span className="text-[11px] tracking-wide text-charcoal-500">Swipe to explore</span>
                <button
                  type="button"
                  onClick={goToNextPillar}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-charcoal-900/15 active:scale-95"
                  aria-label="Next image"
                >
                  <HiOutlineChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ─── TACTILE DETAIL INSPECTOR MODAL ─── */}
      {activeItem &&
        !isMobile &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detailed study of ${activeItem.title}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-950/95 backdrop-blur-2xl transition-opacity duration-300"
          >
            {/* Backdrop click listener */}
            <div
              className="absolute inset-0 bg-transparent"
              onClick={closeInspector}
              aria-hidden
            />

            {/* Modal Dialog Card */}
            <div
              ref={modalScrollRef}
              className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-xl border border-gold-400/40 bg-charcoal-900 text-ivory-50 shadow-2xl z-10 no-scrollbar focus:outline-none"
              tabIndex={-1}
            >
              {/* Sticky Top Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-charcoal-900/95 px-4 sm:px-7 py-3 sm:py-4 backdrop-blur-md">
                <div className="min-w-0 pr-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gold-400">
                    {activeItem.discipline} • Material Specimen
                  </span>
                  <h3 className="font-display text-heading-md sm:text-heading-lg text-ivory-50 truncate mt-0.5">
                    {activeItem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Prev / Next specimen cycling buttons */}
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      type="button"
                      onClick={goToPrevPillar}
                      className="size-9 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-ivory-100 hover:bg-gold-400 hover:text-charcoal-950 hover:border-gold-400 transition-all active:scale-95"
                      aria-label="Previous craftsmanship specimen (Left arrow)"
                      title="Previous specimen"
                    >
                      <HiOutlineChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextPillar}
                      className="size-9 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-ivory-100 hover:bg-gold-400 hover:text-charcoal-950 hover:border-gold-400 transition-all active:scale-95"
                      aria-label="Next craftsmanship specimen (Right arrow)"
                      title="Next specimen"
                    >
                      <HiOutlineChevronRight className="size-4" />
                    </button>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={closeInspector}
                    className="size-9 sm:size-10 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-ivory-100 hover:bg-gold-400 hover:text-charcoal-950 hover:border-gold-400 transition-all duration-300"
                    aria-label="Close specification modal (Escape)"
                  >
                    <HiOutlineX className="size-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content - positioned immediately at top */}
              <div className="p-4 sm:p-8 space-y-6">
                {/* Full-view texture image with verified loading transition */}
                <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg border border-white/10 bg-charcoal-950 shadow-lg">
                  {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-charcoal-950/80 z-10">
                      <div className="size-8 rounded-full border-2 border-gold-400/20 border-t-gold-400 animate-spin" />
                    </div>
                  )}
                  <img
                    key={activeItem.image}
                    src={activeItem.image}
                    alt={activeItem.title}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setIsImageLoaded(true)}
                    className={`size-full object-cover transition-opacity duration-300 ${
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-white/10 py-5">
                  <div>
                    <span className="text-caption font-mono uppercase tracking-wider text-gold-400/80 block">
                      Material Composition
                    </span>
                    <p className="text-body-sm font-medium text-ivory-100 mt-1">{activeItem.material}</p>
                  </div>
                  <div>
                    <span className="text-caption font-mono uppercase tracking-wider text-gold-400/80 block">
                      Artisan Provenance
                    </span>
                    <p className="text-body-sm font-medium text-ivory-100 mt-1">{activeItem.provenance}</p>
                  </div>
                  <div>
                    <span className="text-caption font-mono uppercase tracking-wider text-gold-400/80 block">
                      Surface Treatment
                    </span>
                    <p className="text-body-sm font-medium text-ivory-100 mt-1">{activeItem.finish}</p>
                  </div>
                </div>

                {/* Architectural Narrative */}
                <div className="space-y-2">
                  <p className="font-mono text-overline text-gold-400">Tactile & Atmospheric Curation</p>
                  <p className="text-body-sm sm:text-body-md text-ivory-100/80 font-light leading-relaxed">
                    {activeItem.caption}
                  </p>
                  <p className="text-body-xs text-ivory-200/60 leading-relaxed pt-2">
                    Every batch of natural stone and timber is inspected personally by our atelier directors to ensure consistency of tone, density, and enduring longevity for refined residences across Bengaluru.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    className="text-ivory-200 hover:text-white"
                    onClick={closeInspector}
                  >
                    Close Specimen
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto gap-2"
                    onClick={() => {
                      closeInspector()
                      navigate('/contact')
                    }}
                  >
                    <span>Inquire for Custom Residence</span>
                    <HiOutlineChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </SectionShell>
  )
}
