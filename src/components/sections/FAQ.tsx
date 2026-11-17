import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { HiOutlineChevronDown } from 'react-icons/hi'

import { useSectionReveal } from '@/hooks'
import { cn } from '@/utils'

import { faqs } from './data/home.data'
import { SectionHeader, SectionShell } from './shared/SectionHeader'

export function FAQ() {
  const sectionRef = useSectionReveal<HTMLElement>({ stagger: 0.1 })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <SectionShell id="faq" ref={sectionRef}>
      <div className="ds-container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeader
            overline="Questions"
            title="Frequently Asked"
            description="Everything you need to know before beginning your design journey with us."
          />

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              const panelId = `faq-panel-${index}`
              const buttonId = `faq-button-${index}`

              return (
                <div
                  key={faq.question}
                  data-reveal
                  className="overflow-hidden rounded-md sm:rounded-lg border border-border/80 bg-surface-elevated/95 shadow-xs transition-colors hover:border-gold-400"
                >
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left transition-colors hover:bg-ivory-50 active:bg-ivory-100/60 ds-focus-ring"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="font-display text-body-md sm:text-heading-sm text-charcoal-900 font-medium tracking-tight">
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-xs border border-border bg-ivory-100/70 text-charcoal-800 transition-all duration-300',
                        isOpen && 'rotate-180 bg-charcoal-900 text-white border-charcoal-900',
                      )}
                      aria-hidden
                    >
                      <HiOutlineChevronDown className="size-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="border-t border-border/60 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4 text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
