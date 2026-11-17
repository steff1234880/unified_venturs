import { motion, useScroll, useSpring } from 'framer-motion'

import { usePrefersReducedMotion } from '@/hooks'

export function ScrollProgress() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001,
  })

  if (prefersReducedMotion) {
    return null
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-gold-400 via-gold-500 to-teak-600"
      style={{ scaleX }}
      aria-hidden
    />
  )
}
