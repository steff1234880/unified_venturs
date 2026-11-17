import { motion } from 'framer-motion'
import { HiOutlineArrowRight } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

import { Card, CardDescription, CardTitle } from '@/components/ui'
import { useSectionReveal } from '@/hooks'
import { cn } from '@/utils'

import { services } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

export function Services() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.14 })
  const navigate = useNavigate()

  return (
    <SectionShell id="services" ref={sectionRef}>
      <div className="ds-container">
        <SectionHeader
          overline="Our Expertise"
          title="Curated Services for Distinguished Living"
          description="From concept to completion, every service is tailored to reflect your taste, heritage, and way of life."
        />

        <div className="mt-8 sm:mt-12 lg:mt-14 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              data-reveal
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full min-w-0"
            >
              <Card
                variant="elevated"
                padding="none"
                onClick={() => navigate('/services')}
                className={cn(
                  'group h-full w-full min-w-0 flex flex-col justify-between overflow-hidden cursor-pointer',
                  'border border-border bg-surface-elevated',
                  'hover:border-gold-400 hover:shadow-md',
                  'active:scale-[0.99] transition-all duration-300',
                )}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate('/services')
                  }
                }}
                aria-label={`View details for ${service.title}`}
              >
                <div className="min-w-0">
                  <div className="relative aspect-16/10 sm:aspect-4/3 w-full overflow-hidden bg-charcoal-900">
                    <img
                      src={service.image}
                      alt={service.title}
                      width={800}
                      height={600}
                      decoding="async"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-75" />
                    <div className="absolute left-3.5 top-3.5 sm:left-4 sm:top-4 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-xs border border-white/20 bg-black/70 px-2.5 py-0.5 text-[10px] font-mono tracking-widest text-gold-400 shadow-xs backdrop-blur-md uppercase">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 min-w-0">
                    <p className="text-[10px] sm:text-overline tracking-widest uppercase font-medium text-gold-600">
                      Discipline {String(index + 1).padStart(2, '0')}
                    </p>
                    <CardTitle className="mt-1 text-heading-md font-display text-charcoal-900 group-hover:text-gold-700 transition-colors break-words">
                      {service.title}
                    </CardTitle>
                    <div
                      className="my-2.5 sm:my-3 h-px w-6 bg-gold-400 transition-all duration-300 group-hover:w-10"
                      aria-hidden
                    />
                    <CardDescription className="text-body-sm text-muted-foreground leading-relaxed break-words">
                      {service.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6 pt-0">
                  <div className="pt-3 border-t border-border flex items-center justify-between min-h-11 text-caption font-medium text-charcoal-800 transition-colors group-hover:text-gold-700">
                    <span>Explore Discipline</span>
                    <HiOutlineArrowRight
                      className="size-3.5 shrink-0 text-gold-500 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

