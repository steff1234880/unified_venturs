import 'swiper/css'
import 'swiper/css/pagination'

import { motion } from 'framer-motion'
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'

import { useSectionReveal } from '@/hooks'
import { A11y, Navigation, Pagination } from '@/lib/swiper'
import { Swiper, SwiperSlide } from '@/lib/swiper'

import { testimonials } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function QuoteIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="size-10 text-gold-400/70 md:size-12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10.5 30.5c0-8 4.2-14.1 12.5-17.5l1.7 2.9c-4.4 2.3-6.7 5.4-7 9.1h5.3V37H10.5v-6.5Zm18.5 0c0-8 4.2-14.1 12.5-17.5l1.7 2.9c-4.4 2.3-6.7 5.4-7 9.1h5.3V37H29v-6.5Z" />
    </svg>
  )
}

const controlClass =
  'testimonials-nav inline-flex size-10 sm:size-11 items-center justify-center rounded-xs sm:rounded-sm border border-border bg-surface text-charcoal-800 shadow-xs transition-luxury ds-focus-ring hover:bg-gold-400 hover:text-charcoal-950 hover:border-gold-400 disabled:pointer-events-none disabled:opacity-40'

export function Testimonials() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.12 })

  return (
    <SectionShell id="testimonials" ref={sectionRef} className="bg-surface">
      <div className="ds-container">
        <SectionHeader
          overline="Client Stories"
          title="Testimonials"
          description="The trust of discerning homeowners across Bengaluru is our greatest accolade."
          align="center"
        />

        <motion.div data-reveal className="mt-12 md:mt-16">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 24 },
              1280: { slidesPerView: 3, spaceBetween: 32 },
            }}
            navigation={{
              prevEl: '.testimonials-prev',
              nextEl: '.testimonials-next',
            }}
            pagination={{
              el: '.testimonials-pagination',
              clickable: true,
            }}
            a11y={{
              prevSlideMessage: 'Previous testimonial',
              nextSlideMessage: 'Next testimonial',
              paginationBulletMessage: 'Go to testimonial {{index}}',
            }}
            className="!px-1 !py-3"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.name} className="!h-auto">
                <figure className="relative flex h-full flex-col rounded-md sm:rounded-lg border border-border/80 bg-surface-elevated/95 p-5 sm:p-7 md:p-8 shadow-xs hover:border-gold-400 hover:shadow-sm active:scale-[0.99] transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <QuoteIcon />
                    <div className="flex items-center gap-0.5 text-gold-500" aria-label="5 star client review">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <svg key={i} className="size-3.5 fill-current" viewBox="0 0 20 20" aria-hidden>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <blockquote className="mt-3.5 sm:mt-5 flex-1 font-body text-body-md sm:text-body-lg leading-relaxed text-charcoal-800 italic">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>

                  <div
                    className="my-4 sm:my-5 h-px w-8 bg-gold-400"
                    aria-hidden
                  />

                  <figcaption className="flex items-center gap-3 sm:gap-4">
                    <span
                      className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xs sm:rounded-sm border border-border bg-ivory-100/70 font-display text-body-sm font-medium text-charcoal-900 shadow-xs"
                      aria-hidden
                    >
                      {getInitials(item.name)}
                    </span>
                    <span className="min-w-0">
                      <cite className="block text-body-sm font-semibold not-italic text-charcoal-900">
                        {item.name}
                      </cite>
                      <span className="mt-0.5 block text-caption text-muted-foreground">
                        {item.role}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              className={`testimonials-prev ${controlClass}`}
              aria-label="Previous testimonial"
            >
              <HiOutlineChevronLeft className="size-5" aria-hidden />
            </button>
            <div className="testimonials-pagination flex min-w-16 items-center justify-center gap-2 [&_.swiper-pagination-bullet]:m-0 [&_.swiper-pagination-bullet]:size-2 [&_.swiper-pagination-bullet]:bg-charcoal-300 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet-active]:w-6 [&_.swiper-pagination-bullet-active]:rounded-full [&_.swiper-pagination-bullet-active]:bg-charcoal-900 [&_.swiper-pagination-bullet]:transition-all" />
            <button
              type="button"
              className={`testimonials-next ${controlClass}`}
              aria-label="Next testimonial"
            >
              <HiOutlineChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  )
}
