import { gsap } from '@/lib/gsap'

export function animateScrollIndicator() {
  gsap.to('[data-hero-scroll-line]', {
    y: '100%',
    duration: 1.4,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true,
  })
}
