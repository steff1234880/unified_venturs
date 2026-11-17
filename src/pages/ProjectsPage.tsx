import { useEffect, useMemo, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi'

import { fetchCollection } from '@/admin/storage'
import type { AdminProject } from '@/admin/types'
import { useSectionReveal } from '@/hooks'
import { cn } from '@/utils'
import { getProjectImagePlaceholder } from '@/utils/project-placeholder'

import {
  portfolioProjects as defaultProjects,
  projectCategories,
  type ProjectCategory,
} from './data/projects.data'

type PortfolioItem = {
  title: string
  location: string
  category: ProjectCategory
  year: string
  area: string
  image: string
  featured?: boolean
}

export function ProjectsPage() {
  const pageRef = useSectionReveal<HTMLElement>({ stagger: 0.1 })
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All')
  const [allProjects, setAllProjects] = useState<PortfolioItem[]>([...defaultProjects])
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const handleImageError = (projectTitle: string) => {
    setFailedImages((prev) => ({ ...prev, [projectTitle]: true }))
  }

  // Sync with Admin Panel projects if available
  useEffect(() => {
    let cancelled = false

    async function loadAdminProjects() {
      try {
        const stored = (await fetchCollection('projects')) as AdminProject[]
        if (cancelled || !Array.isArray(stored) || stored.length === 0) return

        const published = stored.filter((p) => p.published !== false)
        if (published.length > 0) {
          setAllProjects(
            published.map((p) => ({
              title: p.title,
              location: p.location || 'Bengaluru, Karnataka',
              category: (p.category as ProjectCategory) || 'Completed Residences',
              year: p.year || '2024',
              area: p.area || 'Bengaluru',
              image: p.image || getProjectImagePlaceholder(p.title),
              featured: Boolean(p.featured),
            })),
          )
        }
      } catch {
        // Retain default portfolio projects
      }
    }

    void loadAdminProjects()

    return () => {
      cancelled = true
    }
  }, [])

  const featured = allProjects.find((project) => project.featured) || allProjects[0]
  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? allProjects.filter((project) => project !== featured)
        : allProjects.filter(
            (project) =>
              project !== featured &&
              (project.category === activeCategory ||
                (activeCategory === 'Work Locations' &&
                  (project.category?.toLowerCase().includes('work') ||
                    project.category?.toLowerCase().includes('residence')))),
          ),
    [activeCategory, allProjects, featured],
  )

  const featuredImageUrl = featured
    ? failedImages[featured.title]
      ? getProjectImagePlaceholder(featured.title)
      : featured.image || getProjectImagePlaceholder(featured.title)
    : ''

  return (
    <main ref={pageRef} className="bg-background">
      {/* Featured split hero */}
      {featured && (
        <header className="grid pt-16 lg:pt-0 min-h-[60dvh] lg:min-h-[70dvh] lg:grid-cols-2">
          <div className="relative aspect-16/10 sm:aspect-16/9 lg:aspect-auto min-h-[260px] sm:min-h-[360px] lg:min-h-full overflow-hidden bg-charcoal-900">
            <img
              src={featuredImageUrl}
              alt={featured.title}
              decoding="async"
              fetchPriority="high"
              onError={() => handleImageError(featured.title)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-charcoal-900/20" />
          </div>
          <div className="flex flex-col justify-center bg-charcoal-900 px-6 py-10 sm:px-8 sm:py-14 md:px-16 lg:py-0">
            <div data-reveal>
              <p className="text-overline text-gold-400">Featured Residence</p>
              <h1 className="mt-3 sm:mt-4 font-display text-display-md sm:text-display-lg md:text-display-xl text-ivory-50">
                {featured.title}
              </h1>
              <p className="mt-3 sm:mt-4 text-body-md sm:text-body-lg text-ivory-100/70">{featured.location}</p>
              <dl className="mt-6 sm:mt-8 flex flex-wrap gap-6 sm:gap-10">
                <div>
                  <dt className="text-caption text-ivory-100/50">Year</dt>
                  <dd className="mt-1 text-body-md text-ivory-50">{featured.year}</dd>
                </div>
                <div>
                  <dt className="text-caption text-ivory-100/50">Location</dt>
                  <dd className="mt-1 text-body-md text-ivory-50">{featured.area}</dd>
                </div>
                <div>
                  <dt className="text-caption text-ivory-100/50">Category</dt>
                  <dd className="mt-1 text-body-md text-ivory-50">{featured.category}</dd>
                </div>
              </dl>
            </div>
          </div>
        </header>
      )}

      {/* Filter + portfolio grid */}
      <section className="ds-section">
        <div className="ds-container">
          <div
            data-reveal
            className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="text-overline text-gold-500">Portfolio & Addresses</p>
              <h2 className="mt-1 font-display text-display-md text-charcoal-900">
                Bengaluru Projects
              </h2>
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible sm:pb-0"
              role="tablist"
              aria-label="Filter projects"
            >
              {projectCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    'shrink-0 whitespace-nowrap min-h-10 rounded-xs sm:rounded-sm px-4 py-2 text-caption font-medium uppercase tracking-wider transition-luxury ds-focus-ring cursor-pointer',
                    activeCategory === category
                      ? 'bg-charcoal-900 text-white'
                      : 'border border-border bg-surface text-charcoal-700 hover:border-gold-400 hover:text-charcoal-900',
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 sm:mt-12 columns-1 gap-4 sm:gap-6 sm:columns-2 lg:columns-3">
            {filtered.map((project, index) => {
              const projectImg = failedImages[project.title]
                ? getProjectImagePlaceholder(project.title)
                : project.image || getProjectImagePlaceholder(project.title)

              return (
                <article
                  key={project.title}
                  data-reveal
                  className={cn(
                    'group mb-4 sm:mb-6 break-inside-avoid overflow-hidden rounded-md sm:rounded-lg',
                    'border border-border/80 bg-charcoal-900 shadow-xs sm:shadow-sm',
                    'hover:border-gold-400/50 hover:shadow-md active:scale-[0.99] transition-all duration-300',
                    index % 3 === 0 && 'sm:mb-8',
                  )}
                >
                  <div className="relative overflow-hidden bg-charcoal-900">
                    <img
                      src={projectImg}
                      alt={project.title}
                      decoding="async"
                      onError={() => handleImageError(project.title)}
                      className={cn(
                        'w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]',
                        'aspect-16/10',
                        index % 2 === 0 ? 'sm:aspect-3/4' : 'sm:aspect-4/3',
                      )}
                      loading="lazy"
                    />
                    {/* Architectural photo protection scrim (subtle for real photos, avoids obscuring SVG placeholders) */}
                    {!projectImg.endsWith('.svg') && (
                      <div className="absolute inset-0 bg-linear-to-t from-charcoal-950/85 via-charcoal-950/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                    )}

                    {/* Category Pill */}
                    <div className="absolute left-3.5 top-3.5 sm:left-5 sm:top-5 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-xs border border-white/20 bg-black/75 px-2.5 py-1 text-[10px] sm:text-overline tracking-widest uppercase font-medium text-gold-400 backdrop-blur-md shadow-xs">
                        <span className="size-1 rounded-full bg-gold-400" aria-hidden />
                        {project.category}
                      </span>
                    </div>

                    {/* Card Content & Readable Typography */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 z-10 bg-linear-to-t from-charcoal-950/95 via-charcoal-950/60 to-transparent sm:bg-none">
                      <h3 className="font-display text-heading-lg sm:text-display-sm text-white tracking-tight font-medium drop-shadow-sm">
                        {project.title}
                      </h3>
                      <p className="mt-0.5 sm:mt-1 text-body-xs sm:text-body-sm text-ivory-100/90 flex items-center gap-1.5 drop-shadow-xs">
                        <span className="size-1 rounded-full bg-gold-400" aria-hidden />
                        {project.location}
                      </p>

                      {/* Meta Specs: Always visible on mobile, smooth hover reveal on desktop */}
                      <div className="mt-3 sm:mt-4 flex items-center gap-2 text-caption text-ivory-100/90 opacity-100 sm:opacity-0 transition-opacity duration-300 sm:group-hover:opacity-100">
                        <span className="rounded-xs bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white/90 border border-white/15">
                          {project.year}
                        </span>
                        <span className="text-gold-400/60">·</span>
                        <span className="text-ivory-100/90">{project.area}</span>
                        <HiOutlineArrowRight
                          className="ml-auto size-4 text-gold-400 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
