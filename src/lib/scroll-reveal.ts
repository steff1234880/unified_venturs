import { gsap } from '@/lib/gsap'

export type RevealOptions = {
  y?: number
  stagger?: number
  start?: string
  duration?: number
}

function isReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function createSectionReveal(
  section: HTMLElement,
  selector = '[data-reveal]',
  options: RevealOptions = {},
) {
  const {
    y = 48,
    stagger = 0.12,
    start = 'top 82%',
    duration = 0.85,
  } = options

  const targets = section.querySelectorAll<HTMLElement>(selector)

  if (targets.length === 0) {
    return
  }

  if (isReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0 })
    return
  }

  gsap.set(targets, { opacity: 0, y })

  return gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start,
      toggleActions: 'play none none none',
    },
  })
}

export function createScrollReveal(
  root: ParentNode,
  selector = '[data-reveal]',
  options: RevealOptions = {},
) {
  const { y = 48, start = 'top 82%', duration = 0.85 } = options

  const targets = root.querySelectorAll<HTMLElement>(selector)

  targets.forEach((target) => {
    if (target.closest('[data-reveal-scope]')) {
      return
    }

    if (isReducedMotion()) {
      gsap.set(target, { opacity: 1, y: 0 })
      return
    }

    gsap.set(target, { opacity: 0, y })

    gsap.to(target, {
      opacity: 1,
      y: 0,
      duration,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: target,
        start,
        toggleActions: 'play none none none',
      },
    })
  })
}

export function createImageReveal(root: ParentNode) {
  const wrappers = root.querySelectorAll<HTMLElement>('[data-reveal-image]')

  wrappers.forEach((wrapper) => {
    const image = wrapper.querySelector('img, video')

    if (!image) {
      return
    }

    gsap.set(wrapper, { clipPath: 'inset(0 0 100% 0)' })
    gsap.set(image, { scale: 1.12 })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    timeline
      .to(wrapper, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.1,
        ease: 'power3.inOut',
      })
      .to(image, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0)
  })
}

export function createTextReveal(root: ParentNode) {
  const blocks = root.querySelectorAll<HTMLElement>('[data-reveal-text]')

  blocks.forEach((block) => {
    const inner = block.querySelector<HTMLElement>('[data-reveal-text-inner]')

    if (!inner) {
      return
    }

    gsap.set(inner, { yPercent: 110, opacity: 0 })

    gsap.to(inner, {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: block,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
  })
}

export function initPageReveals(root: ParentNode = document) {
  createScrollReveal(root)
  createImageReveal(root)
  createTextReveal(root)
}

export function animateCounter(
  element: HTMLElement,
  value: number,
  suffix = '',
) {
  if (isReducedMotion()) {
    element.textContent = `${value}${suffix}`
    return
  }

  const counter = { val: 0 }

  return gsap.to(counter, {
    val: value,
    duration: 2.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    onUpdate: () => {
      element.textContent = `${Math.round(counter.val)}${suffix}`
    },
  })
}

export function animateLineDraw(element: HTMLElement, section: HTMLElement) {
  if (isReducedMotion()) {
    gsap.set(element, { scaleX: 1, transformOrigin: 'left center' })
    return
  }

  gsap.set(element, { scaleX: 0, transformOrigin: 'left center' })

  return gsap.to(element, {
    scaleX: 1,
    duration: 1.2,
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  })
}
