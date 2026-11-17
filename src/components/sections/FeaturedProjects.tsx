import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

import { fetchCollection } from '@/admin/storage'
import type { AdminProject } from '@/admin/types'
import { Button } from '@/components/ui'
import { useSectionReveal } from '@/hooks'
import { gsap } from '@/lib/gsap'
import { A11y, Navigation, Pagination } from '@/lib/swiper'
import { Swiper, SwiperSlide } from '@/lib/swiper'
import { cn } from '@/utils'

import { projects as defaultProjects } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

type FeaturedProjectItem = {
  title: string
  location: string
  category: string
  image: string
  beforeImage?: string
  afterImage?: string
  transformationStory?: string
}

export function FeaturedProjects() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.1 })
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const navigate = useNavigate()
  const [projectList, setProjectList] = useState<FeaturedProjectItem[]>([...defaultProjects])

  // Sync with Admin Panel projects if available
  useEffect(() => {
    let cancelled = false

    async function loadAdminProjects() {
      try {
        const stored = (await fetchCollection('projects')) as AdminProject[]
        if (cancelled || !Array.isArray(stored) || stored.length === 0) return

        const published = stored.filter((p) => p.published !== false)
        if (published.length > 0) {
          setProjectList(
            published.map((p) => ({
              title: p.title,
              location: p.location,
              category: p.category,
              image: p.image || '/placeholders/prestige-park-square.svg',
              beforeImage: p.beforeImage || '/images/before-living-room.jpg',
              afterImage: p.afterImage || p.image || '/images/after-living-room.jpg',
              transformationStory: p.description || '',
            })),
          )
        }
      } catch {
        // Retain curated default projects
      }
    }

    void loadAdminProjects()

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
        imageRefs.current.forEach((image) => {
          if (!image) {
            return
          }

          gsap.fromTo(
            image.querySelector('img'),
            { scale: 1.08 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: image,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
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
    <SectionShell id="projects" ref={sectionRef} className="bg-surface">
      <div className="ds-container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            overline="Portfolio & Work Locations"
            title="Our Projects"
            description="A selection of completed residences and distinguished addresses where bespoke craft meets contemporary refinement."
          />
          <div data-reveal className="relative z-10 shrink-0">
            <Button
              variant="outline"
              className="group"
              onClick={() => navigate('/projects')}
            >
              View All Projects
              <HiOutlineArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Button>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            observer
            observeParents
            resizeObserver
            watchOverflow
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 24 },
              1280: { slidesPerView: 2, spaceBetween: 32 },
              1536: { slidesPerView: 3, spaceBetween: 32 },
            }}
            className={cn(
              'featured-projects-swiper pb-12',
              '[&_.swiper-slide]:h-auto',
              '[&_.swiper-pagination-bullet]:bg-gold-400',
              '[&_.swiper-pagination-bullet-active]:bg-gold-500',
              '[&_.swiper-button-prev]:hidden lg:[&_.swiper-button-prev]:flex [&_.swiper-button-prev]:text-charcoal-800',
              '[&_.swiper-button-next]:hidden lg:[&_.swiper-button-next]:flex [&_.swiper-button-next]:text-charcoal-800',
            )}
          >
            {projectList.map((project, index) => (
              <SwiperSlide key={project.title} className="!h-auto">
                <article
                  onClick={() => navigate('/projects')}
                  className="group h-full w-full cursor-pointer focus:outline-none"
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate('/projects')
                    }
                  }}
                  aria-label={`View ${project.title} in ${project.location}`}
                >
                  <div className="relative aspect-16/10 overflow-hidden rounded-md sm:rounded-lg border border-border/80 bg-charcoal-900 shadow-xs sm:shadow-sm active:scale-[0.99] transition-all duration-300">
                    <div
                      ref={(el) => {
                        imageRefs.current[index] = el
                      }}
                      className="absolute inset-0"
                    >
                      <img
                        src={project.image}
                        alt={project.title}
                        width={1200}
                        height={750}
                        decoding="async"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    {/* Architectural scrim: protects photography clarity while guaranteeing text legibility */}
                    <div className="absolute inset-0 bg-linear-to-t from-charcoal-950/90 via-charcoal-950/25 to-transparent transition-opacity duration-500 group-hover:from-charcoal-950/95" />

                    {/* Top Category Badge */}
                    <div className="absolute left-3.5 top-3.5 sm:left-6 sm:top-6 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-xs border border-white/20 bg-black/75 px-2.5 py-1 text-[10px] sm:text-overline tracking-widest uppercase font-medium text-gold-400 shadow-xs backdrop-blur-md">
                        <span className="size-1 rounded-full bg-gold-400" aria-hidden />
                        {project.category}
                      </span>
                    </div>

                    {/* Architectural Action Affordance */}
                    <div
                      className={cn(
                        'absolute right-3.5 top-3.5 sm:right-6 sm:top-6 z-10 flex size-8 sm:size-10 items-center justify-center rounded-sm sm:rounded-md',
                        'border border-white/20 bg-black/65 text-white shadow-xs backdrop-blur-md',
                        'transition-all duration-300 group-hover:bg-gold-500 group-hover:text-charcoal-950 group-hover:border-gold-500',
                      )}
                      aria-hidden
                    >
                      <HiOutlineArrowRight className="size-3.5 sm:size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>

                    {/* Card Lower Deck: Project Title & Location */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 z-10">
                      <h3 className="font-display text-heading-lg sm:text-display-sm text-white font-medium tracking-tight">
                        {project.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-caption sm:text-body-sm text-ivory-100/75">
                        <span className="size-1 rounded-full bg-gold-400" aria-hidden />
                        <span>{project.location}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </SectionShell>
  )
}
