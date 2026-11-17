import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { gsap, ScrollTrigger } from '@/lib/gsap'
import { initPageReveals } from '@/lib/scroll-reveal'

type UseGlobalRevealsOptions = {
  enabled?: boolean
}

export function useGlobalReveals({ enabled = true }: UseGlobalRevealsOptions = {}) {
  const location = useLocation()

  useLayoutEffect(() => {
    if (!enabled) {
      return
    }

    const root = document.getElementById('page-content')

    if (!root) {
      return
    }

    const ctx = gsap.context(() => {
      initPageReveals(root)
      ScrollTrigger.refresh()
    }, root)

    return () => {
      ctx.revert()
    }
  }, [location.pathname, enabled])
}
