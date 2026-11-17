import { useEffect, useState } from 'react'

import { useLenis } from '@/hooks'

export function useScrollProgress() {
  const lenis = useLenis()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

      if (scrollHeight <= 0) {
        setProgress(0)
        return
      }

      const scrollY = lenis?.scroll ?? window.scrollY
      setProgress(Math.min(1, Math.max(0, scrollY / scrollHeight)))
    }

    let rafId: number | null = null

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        update()
      })
    }

    update()

    if (lenis) {
      lenis.on('scroll', onScroll)
      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId)
        lenis.off('scroll', onScroll)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [lenis])

  return progress
}
