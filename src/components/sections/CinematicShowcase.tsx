import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  HiOutlineArrowRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineX,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

import { fetchCollection } from '@/admin/storage'
import type { AdminProject } from '@/admin/types'
import { Button } from '@/components/ui'
import { usePrefersReducedMotion, useScrollLock, useSectionReveal } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils'

import { projects as fallbackProjects } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

type ShowcaseItem = {
  id?: string
  title: string
  location: string
  category: string
  image: string
  images?: string[]
  description?: string
  year?: string
  area?: string
}

const initialProjects: ShowcaseItem[] = fallbackProjects.map((p) => ({
  title: p.title,
  location: p.location,
  category: p.category,
  image: p.image,
  images: [p.image],
  description: 'transformationStory' in p ? (p.transformationStory as string) : '',
  year: '2024',
  area: '4,500 sq ft',
}))

export function CinematicShowcase() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.1, y: 35 })
  const navigate = useNavigate()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [projectsList, setProjectsList] = useState<ShowcaseItem[]>(initialProjects)
  const [activeViewerProject, setActiveViewerProject] = useState<ShowcaseItem | null>(null)
  const [viewerPhotoIndex, setViewerPhotoIndex] = useState(0)

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])
  const heroImageContainerRef = useRef<HTMLDivElement | null>(null)

  // Touch tracking for mobile swipe inside fullscreen lightbox
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchDeltaXRef = useRef<number>(0)

  // Prevent background scrolling while modal/lightbox is open
  useScrollLock(activeViewerProject !== null)

  // Fetch real projects from Admin Storage
  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      try {
        const stored = (await fetchCollection('projects')) as AdminProject[]
        if (cancelled) return

        if (Array.isArray(stored) && stored.length > 0) {
          const published = stored
            .filter((p) => p.published !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

          if (published.length > 0) {
            setProjectsList(
              published.map((p) => ({
                id: p.id,
                title: p.title,
                location: p.location,
                category: p.category,
                image: p.image,
                images: p.images && p.images.length > 0 ? p.images : [p.image],
                description: p.description || '',
                year: p.year,
                area: p.area,
              })),
            )
          }
        }
      } catch {
        // Keep fallback data
      }
    }

    void loadProjects()

    return () => {
      cancelled = true
    }
  }, [])

  // Smooth scroll-triggered reveal animations with GSAP
  useLayoutEffect(() => {
    if (prefersReducedMotion) return

    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Subtle editorial parallax on desktop
      mm.add('(min-width: 1024px)', () => {
        // Hero image gentle parallax zoom out
        if (heroImageContainerRef.current) {
          const heroImg = heroImageContainerRef.current.querySelector('img')
          if (heroImg) {
            gsap.fromTo(
              heroImg,
              { scale: 1.12, y: -20 },
              {
                scale: 1,
                y: 15,
                ease: 'none',
                scrollTrigger: {
                  trigger: heroImageContainerRef.current,
                  start: 'top 85%',
                  end: 'bottom 15%',
                  scrub: 1,
                },
              },
            )
          }
        }

        // Secondary cards subtle floating parallax
        itemsRef.current.forEach((item, index) => {
          if (!item) return
          const img = item.querySelector('img')
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.1 },
              {
                scale: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: item,
                  start: 'top 90%',
                  end: 'bottom 10%',
                  scrub: 1.2,
                },
              },
            )
          }

          // Gentle staggered entry
          gsap.from(item, {
            y: 35 + (index % 2) * 15,
            opacity: 0.85,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            },
          })
        })
      })

      // Mobile: lightweight reveal without heavy scale scrubbing
      mm.add('(max-width: 1023px)', () => {
        itemsRef.current.forEach((item) => {
          if (!item) return
          gsap.from(item, {
            y: 20,
            opacity: 0.9,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
            },
          })
        })
      })
    }, section)

    return () => ctx.revert()
  }, [prefersReducedMotion, projectsList, sectionRef])

  const openViewer = useCallback((project: ShowcaseItem) => {
    setActiveViewerProject(project)
    setViewerPhotoIndex(0)
  }, [])

  const closeViewer = useCallback(() => {
    setActiveViewerProject(null)
  }, [])

  const goToPrev = useCallback(() => {
    if (!activeViewerProject || projectsList.length === 0) return
    const currentIndex = projectsList.findIndex(
      (p) => (p.id && p.id === activeViewerProject.id) || p.title === activeViewerProject.title,
    )
    const prevIndex = currentIndex <= 0 ? projectsList.length - 1 : currentIndex - 1
    const target = projectsList[prevIndex]
    if (target) {
      setActiveViewerProject(target)
      setViewerPhotoIndex(0)
    }
  }, [activeViewerProject, projectsList])

  const goToNext = useCallback(() => {
    if (!activeViewerProject || projectsList.length === 0) return
    const currentIndex = projectsList.findIndex(
      (p) => (p.id && p.id === activeViewerProject.id) || p.title === activeViewerProject.title,
    )
    const nextIndex = currentIndex >= projectsList.length - 1 ? 0 : currentIndex + 1
    const target = projectsList[nextIndex]
    if (target) {
      setActiveViewerProject(target)
      setViewerPhotoIndex(0)
    }
  }, [activeViewerProject, projectsList])

  // Desktop keyboard controls
  useEffect(() => {
    if (!activeViewerProject) return

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeViewer()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeViewerProject, closeViewer, goToNext, goToPrev])

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const firstTouch = e.touches[0]
    if (e.touches.length !== 1 || !firstTouch) return
    touchStartXRef.current = firstTouch.clientX
    touchStartYRef.current = firstTouch.clientY
    touchDeltaXRef.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const firstTouch = e.touches[0]
    if (touchStartXRef.current === null || e.touches.length !== 1 || !firstTouch) return
    const currentX = firstTouch.clientX
    touchDeltaXRef.current = currentX - touchStartXRef.current
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const deltaX = touchDeltaXRef.current
    const changedTouch = e.changedTouches[0]
    const deltaY =
      touchStartYRef.current !== null && e.changedTouches.length === 1 && changedTouch
        ? Math.abs(changedTouch.clientY - touchStartYRef.current)
        : 0

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > deltaY) {
      if (deltaX < 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
    touchDeltaXRef.current = 0
  }

  // Editorial project distribution: 1 primary hero + 3 editorial companion features
  const showcaseProjects = projectsList.slice(0, 4)
  const heroProject = showcaseProjects[0] || initialProjects[0]
  const companionProjects = showcaseProjects.slice(1, 4)

  const activeViewerIndex = activeViewerProject
    ? projectsList.findIndex(
        (p) => (p.id && p.id === activeViewerProject.id) || p.title === activeViewerProject.title,
      )
    : 0

  const currentDisplayImage = activeViewerProject
    ? activeViewerProject.images && activeViewerProject.images[viewerPhotoIndex]
      ? activeViewerProject.images[viewerPhotoIndex]
      : activeViewerProject.image
    : ''

  return (
    <SectionShell id="cinematic-showcase" ref={sectionRef} className="bg-surface relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Subtle luxury ambient lighting */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-full max-w-7xl rounded-full bg-linear-to-b from-gold-400/5 to-transparent blur-3xl"
        aria-hidden
      />

      <div className="ds-container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-border/80 pb-8 sm:pb-12">
          <SectionHeader
            overline="Cinematic Gallery"
            title="Curated Architectural Living"
            description="An editorial immersion into distinguished private residences, custom craftsmanship, and enduring architectural tranquility."
          />

          <div data-reveal className="relative z-10 shrink-0">
            <Button
              variant="outline"
              className="group gap-2 border-border/80 hover:border-gold-400"
              onClick={() => navigate('/projects')}
            >
              <span>Explore All Projects</span>
              <HiOutlineArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Button>
          </div>
        </div>

        {/* ─── EDITORIAL CINEMATIC SHOWCASE GRID ─── */}
        <div className="mt-10 sm:mt-14 space-y-8 sm:space-y-12">
          {/* 1. CINEMATIC HERO BANNER (Full Width Editorial Highlight) */}
          {heroProject && (
            <div
              ref={heroImageContainerRef}
              data-reveal
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/80 bg-charcoal-900 shadow-xl transition-all duration-500 hover:border-gold-400/60 hover:shadow-2xl active:scale-[0.995]"
              onClick={() => openViewer(heroProject)}
            >
              <div className="relative aspect-16/10 sm:aspect-21/9 w-full overflow-hidden">
                <img
                  src={heroProject.image}
                  alt={heroProject.title}
                  width={1600}
                  height={750}
                  decoding="async"
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />

                {/* Subtle dark cinematic gradient for crystal clear text readability */}
                <div className="absolute inset-0 bg-linear-to-t from-charcoal-950/90 via-charcoal-950/35 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                  <span className="rounded-xs border border-white/20 bg-charcoal-950/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold-400 backdrop-blur-md">
                    Featured Masterpiece
                  </span>
                  <span className="hidden sm:inline-flex rounded-xs border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ivory-100/80 backdrop-blur-md">
                    {heroProject.category}
                  </span>
                </div>

                {/* Quick Expand Button on Hover */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <span className="size-10 sm:size-11 inline-flex items-center justify-center rounded-full border border-white/20 bg-charcoal-950/70 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-gold-400 group-hover:text-charcoal-950 group-hover:scale-105">
                    <HiOutlineEye className="size-5" />
                  </span>
                </div>

                {/* Bottom Architectural Story Overlay */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="max-w-2xl space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-2 text-gold-400 font-mono text-caption uppercase tracking-wider">
                        <HiOutlineLocationMarker className="size-3.5" />
                        <span>{heroProject.location}</span>
                        {heroProject.year && (
                          <>
                            <span className="text-white/30">•</span>
                            <span>{heroProject.year}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-heading-lg sm:text-display-sm font-normal tracking-tight text-ivory-50 group-hover:text-gold-200 transition-colors">
                        {heroProject.title}
                      </h3>
                      {heroProject.description && (
                        <p className="line-clamp-2 text-body-sm text-ivory-100/80 font-light leading-relaxed max-w-xl">
                          {heroProject.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-caption font-mono uppercase tracking-widest text-gold-400 sm:pb-1">
                      <span>View Residence</span>
                      <HiOutlineArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. EDITORIAL COMPANION TRILOGY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {companionProjects.map((project, idx) => (
              <div
                key={project.id || project.title}
                ref={(el) => {
                  itemsRef.current[idx] = el
                }}
                data-reveal
                className="group relative cursor-pointer flex flex-col overflow-hidden rounded-xl border border-border/80 bg-surface-elevated/90 shadow-md transition-all duration-500 hover:border-gold-400/60 hover:shadow-xl active:scale-[0.99]"
                onClick={() => openViewer(project)}
              >
                {/* Image Container with 4:3 Ratio */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-charcoal-900">
                  <img
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={600}
                    decoding="async"
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Category Pill */}
                  <span className="absolute top-3.5 left-3.5 rounded-xs border border-white/20 bg-charcoal-950/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gold-400 backdrop-blur-md">
                    {project.category}
                  </span>

                  <span className="absolute top-3.5 right-3.5 size-8 inline-flex items-center justify-center rounded-full border border-white/20 bg-charcoal-950/70 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-gold-400 group-hover:text-charcoal-950">
                    <HiOutlineEye className="size-4" />
                  </span>
                </div>

                {/* Card Editorial Information */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-1.5 text-caption font-mono text-muted-foreground">
                      <HiOutlineLocationMarker className="size-3 text-gold-500" />
                      <span>{project.location}</span>
                    </p>
                    <h4 className="font-display text-heading-md font-medium text-charcoal-900 group-hover:text-gold-700 transition-colors">
                      {project.title}
                    </h4>
                    {project.description && (
                      <p className="line-clamp-2 text-body-xs text-charcoal-600 font-light leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/80 flex items-center justify-between text-caption font-medium text-charcoal-800">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      {project.area || 'Bespoke Scale'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-gold-600 font-mono tracking-wide group-hover:text-gold-700">
                      Explore <HiOutlineArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PREMIUM FULLSCREEN CINEMATIC LIGHTBOX VIEWER ─── */}
      {activeViewerProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Cinematic viewer for ${activeViewerProject.title}`}
          className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-charcoal-950/95 backdrop-blur-2xl animate-fade-in transition-all duration-300 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Bar */}
          <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 bg-charcoal-950/70 backdrop-blur-md">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-4">
              <span className="inline-flex items-center gap-1.5 rounded-xs border border-gold-400/40 bg-gold-400/10 px-2.5 py-1 text-[10px] uppercase font-mono tracking-widest text-gold-400 shrink-0">
                <HiOutlineSparkles className="size-3" />
                {activeViewerProject.category}
              </span>
              <div className="min-w-0 truncate">
                <h2 className="font-display text-body-base sm:text-heading-md text-ivory-50 truncate">
                  {activeViewerProject.title}
                </h2>
                <p className="text-caption text-ivory-200/60 flex items-center gap-1 truncate">
                  <HiOutlineLocationMarker className="size-3 text-gold-400 shrink-0" />
                  {activeViewerProject.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Counter */}
              <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-[11px] tracking-widest text-ivory-200/80">
                <span className="text-gold-400 font-bold">{activeViewerIndex + 1}</span>
                <span className="mx-1 text-white/30">/</span>
                <span>{projectsList.length}</span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeViewer}
                className="group size-10 sm:size-11 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-ivory-100 hover:bg-gold-400 hover:text-charcoal-950 hover:border-gold-400 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-400"
                aria-label="Close viewer (Escape)"
              >
                <HiOutlineX className="size-5 transition-transform group-hover:rotate-90 duration-300" />
              </button>
            </div>
          </header>

          {/* Center Stage: Fitted Fullscreen Image */}
          <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 min-h-0 overflow-hidden">
            {/* Prev Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToPrev()
              }}
              className="absolute left-2 sm:left-6 z-30 group size-11 sm:size-14 inline-flex items-center justify-center rounded-full border border-white/20 bg-charcoal-900/80 text-ivory-100 hover:bg-gold-400 hover:text-charcoal-950 hover:border-gold-400 shadow-2xl transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-gold-400 backdrop-blur-md"
              aria-label="Previous project (Left arrow)"
            >
              <HiOutlineChevronLeft className="size-6 transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-2 sm:right-6 z-30 group size-11 sm:size-14 inline-flex items-center justify-center rounded-full border border-white/20 bg-charcoal-900/80 text-ivory-100 hover:bg-gold-400 hover:text-charcoal-950 hover:border-gold-400 shadow-2xl transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-gold-400 backdrop-blur-md"
              aria-label="Next project (Right arrow)"
            >
              <HiOutlineChevronRight className="size-6 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* High-Resolution Fitted Image without cropping or distortion */}
            <div className="relative max-h-full max-w-full flex items-center justify-center animate-fade-in duration-300">
              <img
                key={currentDisplayImage}
                src={currentDisplayImage}
                alt={`${activeViewerProject.title} - Fullscreen View`}
                className="max-h-[66vh] sm:max-h-[72vh] lg:max-h-[76vh] max-w-[92vw] sm:max-w-[85vw] lg:max-w-[80vw] object-contain rounded-lg border border-white/10 shadow-2xl transition-transform duration-300 select-none pointer-events-auto"
                draggable={false}
              />
            </div>
          </div>

          {/* Footer Controls & Narrative */}
          <footer className="relative z-20 border-t border-white/10 bg-charcoal-950/80 px-4 sm:px-8 py-3 sm:py-4 backdrop-blur-md">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Photo thumbnails if project has multiple images */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar py-0.5">
                {activeViewerProject.images && activeViewerProject.images.length > 1 ? (
                  <>
                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-gold-400/90 mr-1 shrink-0">
                      Vignettes:
                    </span>
                    {activeViewerProject.images.map((img, idx) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setViewerPhotoIndex(idx)}
                        className={cn(
                          'relative h-10 sm:h-12 w-14 sm:w-16 shrink-0 overflow-hidden rounded border transition-all duration-200',
                          viewerPhotoIndex === idx
                            ? 'border-gold-400 ring-2 ring-gold-400/50 scale-105 opacity-100'
                            : 'border-white/20 opacity-60 hover:opacity-90',
                        )}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <img src={img} alt="" className="size-full object-cover" />
                      </button>
                    ))}
                  </>
                ) : (
                  <p className="text-caption text-ivory-200/70 hidden sm:block max-w-xl truncate">
                    {activeViewerProject.description ||
                      'A bespoke spatial interior composition celebrating refined craftsmanship and contemporary harmony.'}
                  </p>
                )}
              </div>

              {/* Mobile Counter + Swipe Cue */}
              <div className="flex sm:hidden items-center justify-between w-full text-caption text-ivory-200/70">
                <span className="text-[11px] font-mono text-gold-400">
                  Project {activeViewerIndex + 1} of {projectsList.length}
                </span>
                <span className="text-[11px] tracking-wide text-white/50">
                  Swipe left / right to browse
                </span>
              </div>

              {/* Action */}
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-white/20 text-ivory-100 hover:bg-white/10 hover:border-gold-400"
                  onClick={() => {
                    closeViewer()
                    navigate('/projects')
                  }}
                >
                  <span>Explore Project</span>
                  <HiOutlineArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </SectionShell>
  )
}
