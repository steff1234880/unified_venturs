import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'

import { pageTransition } from '@/lib/animations'
import { usePrefersReducedMotion } from '@/hooks'
import { useGlobalReveals } from '@/motion/hooks/useGlobalReveals'

export function PageTransition() {
  const location = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()

  useGlobalReveals({ enabled: !prefersReducedMotion })

  if (prefersReducedMotion) {
    return (
      <div id="page-content">
        <Outlet />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        id="page-content"
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
