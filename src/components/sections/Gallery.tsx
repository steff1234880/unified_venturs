import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { fetchCollection } from '@/admin/storage'
import type { AdminGalleryItem } from '@/admin/types'
import { useSectionReveal } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils'

import { galleryImages as defaultGalleryImages } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

export function Gallery() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.08, y: 60 })
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])
  const [images, setImages] = useState<Array<{ src: string; alt: string; tall?: boolean }>>([
    ...defaultGalleryImages,
  ])

  useEffect(() => {
    let cancelled = false
    async function loadGallery() {
      try {
        const stored = (await fetchCollection('gallery')) as AdminGalleryItem[]
        if (cancelled || !Array.isArray(stored) || stored.length === 0) return
        setImages(
          stored.map((item) => ({
            src: item.src,
            alt: item.alt,
            tall: Boolean(item.tall),
          })),
        )
      } catch {
        // Retain default images
      }
    }
    void loadGallery()
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    const section = sectionRef.current

    if (!section) {
      return
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        itemsRef.current.forEach((item) => {
          if (!item) {
            return
          }

          gsap.fromTo(
            item.querySelector('img'),
            { scale: 1.15 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )
        })
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [sectionRef])

  return (
    <SectionShell id="gallery" ref={sectionRef}>
      <div className="ds-container">
        <SectionHeader
          overline="Visual Journal"
          title="Gallery"
          description="Glimpses into the textures, tones, and craftsmanship that define every architectural space."
          align="center"
        />

        <div className="mt-10 sm:mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              data-reveal
              ref={(el) => {
                itemsRef.current[index] = el
              }}
              className={cn(
                'group relative overflow-hidden rounded-md sm:rounded-lg border border-border/80 bg-charcoal-900 shadow-xs active:scale-[0.985] transition-all duration-300',
                image.tall ? 'row-span-2' : 'aspect-square',
                index === 0 && 'col-span-2 aspect-21/9 md:col-span-1 md:aspect-auto md:row-span-2',
              )}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={900}
                height={image.tall ? 1200 : 900}
                decoding="async"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-charcoal-950/0 transition-colors duration-500 group-hover:bg-charcoal-950/20" />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-charcoal-950/85 via-charcoal-950/25 to-transparent p-3 sm:p-4 sm:translate-y-full transition-transform duration-500 sm:group-hover:translate-y-0">
                <p className="text-[11px] sm:text-caption font-medium tracking-wide text-ivory-50 line-clamp-1">
                  {image.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
