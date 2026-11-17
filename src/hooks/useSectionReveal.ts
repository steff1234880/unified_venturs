import { useLayoutEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { createSectionReveal } from '@/lib/scroll-reveal'

type UseSectionRevealOptions = {
  selector?: string
  y?: number
  stagger?: number
  start?: string
  duration?: number
}

export function useSectionReveal<T extends HTMLElement = HTMLElement>(
  options: UseSectionRevealOptions = {},
) {
  const ref = useRef<T>(null)
  const {
    selector = '[data-reveal]',
    y = 48,
    stagger = 0.12,
    start = 'top 82%',
    duration = 0.85,
  } = options

  useLayoutEffect(() => {
    const section = ref.current

    if (!section) {
      return
    }

    section.setAttribute('data-reveal-scope', 'true')

    const ctx = gsap.context(() => {
      createSectionReveal(section, selector, { y, stagger, start, duration })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [selector, y, stagger, start, duration])

  return ref
}
