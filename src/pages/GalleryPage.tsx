import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { fetchCollection } from '@/admin/storage'
import type { AdminGalleryItem } from '@/admin/types'
import { useSectionReveal } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils'

import { galleryCollections as defaultCollections } from './data/gallery.data'

export function GalleryPage() {
  const pageRef = useSectionReveal<HTMLElement>({ stagger: 0.06 })
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const pinSectionRef = useRef<HTMLElement>(null)
  const [adminItems, setAdminItems] = useState<AdminGalleryItem[]>([])

  useEffect(() => {
    let cancelled = false
    async function loadAdminGallery() {
      try {
        const stored = (await fetchCollection('gallery')) as AdminGalleryItem[]
        if (cancelled || !Array.isArray(stored) || stored.length === 0) return
        setAdminItems(stored)
      } catch {
        // Fallback to default collections
      }
    }
    void loadAdminGallery()
    return () => {
      cancelled = true
    }
  }, [])

  const collections = useMemo(() => {
    if (adminItems.length === 0) return defaultCollections

    // Group admin gallery items by collection name
    const grouped = new Map<string, Array<{ src: string; alt: string }>>()
    for (const item of adminItems) {
      const colName = item.collection || 'Living Spaces'
      if (!grouped.has(colName)) {
        grouped.set(colName, [])
      }
      grouped.get(colName)!.push({ src: item.src, alt: item.alt })
    }

    const result = Array.from(grouped.entries()).map(([name, images]) => ({
      name,
      images,
    }))

    return result.length > 0 ? result : defaultCollections
  }, [adminItems])

  useLayoutEffect(() => {
    const section = pinSectionRef.current
    const track = scrollTrackRef.current

    if (!section || !track) {
      return
    }

    const ctx = gsap.context(() => {
      const getScrollDistance = () => Math.max(0, track.scrollWidth - window.innerWidth)

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <main ref={pageRef} className="bg-charcoal-900">
      {/* Cinematic intro — centered, minimal */}
      <header className="flex min-h-[45vh] sm:min-h-[50vh] flex-col items-center justify-center px-6 pt-24 sm:pt-28 pb-10 text-center">
        <p data-reveal className="text-overline text-gold-400">
          Visual Archive
        </p>
        <h1
          data-reveal
          className="mt-4 max-w-3xl font-display text-display-lg text-ivory-50 md:text-display-xl"
        >
          A study in texture, light &amp; craft
        </h1>
        <p data-reveal className="mt-4 sm:mt-6 max-w-lg text-body-md text-ivory-100/60">
          Scroll to journey through our curated collection of interiors, details,
          and material moments.
        </p>
      </header>

      {/* Pinned horizontal scroll gallery */}
      <section
        ref={pinSectionRef}
        className="relative h-dvh overflow-hidden"
        aria-label="Horizontal gallery"
      >
        <div
          ref={scrollTrackRef}
          className="flex h-full items-center gap-4 px-4 sm:gap-6 sm:px-6 md:gap-8 md:px-12"
        >
          {collections.flatMap((collection) =>
            collection.images.map((image, idx) => (
              <figure
                key={`${image.src}-${idx}`}
                data-reveal
                className="group relative h-[56vh] max-h-[500px] w-[85vw] sm:w-[70vw] md:w-[55vw] lg:h-[70vh] lg:w-[45vw] shrink-0 overflow-hidden rounded-md sm:rounded-lg border border-white/15 bg-charcoal-950 shadow-sm active:scale-[0.99] transition-all"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-charcoal-950/90 via-charcoal-950/30 to-transparent p-4 sm:p-6">
                  <p className="text-[10px] sm:text-overline tracking-widest uppercase font-medium text-gold-400">
                    {collection.name}
                  </p>
                  <p className="mt-1 font-display text-body-md sm:text-heading-sm text-ivory-50">
                    {image.alt}
                  </p>
                </figcaption>
              </figure>
            )),
          )}
        </div>
      </section>

      {/* Collection grids — stacked full-bleed rows */}
      {collections.map((collection, collectionIndex) => (
        <section
          key={collection.name}
          className={cn(
            'border-t border-ivory-100/10 py-16 sm:py-20 md:py-28',
            collectionIndex % 2 === 0 ? 'bg-charcoal-900' : 'bg-teak-900',
          )}
        >
          <div className="ds-container">
            <h2 data-reveal className="font-display text-heading-xl sm:text-display-sm text-ivory-50">
              {collection.name}
            </h2>
            <div className="mt-6 sm:mt-10 grid gap-3 sm:gap-4 md:grid-cols-3">
              {collection.images.map((image, index) => (
                <div
                  key={image.src}
                  data-reveal
                  className={cn(
                    'overflow-hidden rounded-md sm:rounded-lg border border-white/15 bg-charcoal-950 shadow-xs active:scale-[0.99] transition-all',
                    index === 0 && 'md:col-span-2 md:row-span-2',
                  )}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    decoding="async"
                    className={cn(
                      'w-full object-cover transition-transform duration-700 hover:scale-[1.03]',
                      index === 0 ? 'aspect-16/10 md:h-full' : 'aspect-square',
                    )}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  )
}
