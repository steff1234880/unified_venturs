import { motion } from 'framer-motion'
import {
  HiOutlineColorSwatch,
  HiOutlineCube,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from 'react-icons/hi'

import { useSectionReveal } from '@/hooks'
import { cn } from '@/utils'

import { whyChooseUs } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

const icons = [
  HiOutlineSparkles,
  HiOutlineColorSwatch,
  HiOutlineCube,
  HiOutlineShieldCheck,
] as const

export function WhyChooseUs() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.15 })

  return (
    <SectionShell id="why-us" ref={sectionRef}>
      <div className="ds-container">
        <SectionHeader
          overline="The Unified Ventures Difference"
          title="Why Choose Us"
          description="We don't simply design interiors — we compose living environments rooted in bespoke artistry and global sophistication."
          align="center"
        />

        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {whyChooseUs.map((item, index) => {
            const Icon = icons[index] ?? HiOutlineSparkles

            return (
              <motion.div
                key={item.title}
                data-reveal
                className="h-full"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className={cn(
                    'group relative flex h-full flex-col items-start text-left rounded-md sm:rounded-lg',
                    'border border-border/80 bg-surface-elevated/95 p-5 sm:p-6',
                    'shadow-xs hover:border-gold-400 hover:shadow-sm active:scale-[0.985]',
                    'transition-all duration-300',
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={cn(
                        'flex size-10 sm:size-11 items-center justify-center rounded-sm sm:rounded-md',
                        'border border-border bg-ivory-100/70 shadow-xs',
                        'transition-all duration-300 group-hover:border-gold-400 group-hover:bg-gold-50/80',
                      )}
                    >
                      <Icon
                        className="size-5 text-charcoal-900 transition-colors duration-300 group-hover:text-charcoal-950"
                        aria-hidden
                      />
                    </div>
                    <span className="font-mono text-[11px] font-medium tracking-widest text-charcoal-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-heading-md text-charcoal-900 transition-colors">
                    {item.title}
                  </h3>
                  <div
                    className="my-2.5 h-px w-6 bg-gold-400 transition-all duration-300 group-hover:w-10"
                    aria-hidden
                  />
                  <p className="text-body-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </SectionShell>
  )
}
