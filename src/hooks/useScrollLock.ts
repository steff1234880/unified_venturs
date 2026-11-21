import { useEffect } from 'react'
import { useLenis } from './useLenis'

export function useScrollLock(locked: boolean) {
  const lenis = useLenis()

  useEffect(() => {
    if (!locked) {
      return
    }

    // Stop Lenis virtual scroll interceptor while modal/drawer is open
    if (lenis) {
      lenis.stop()
    }

    const html = document.documentElement
    const body = document.body
    const originalBodyOverflow = body.style.overflow
    const originalHtmlOverflow = html.style.overflow

    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'

    return () => {
      body.style.overflow = originalBodyOverflow
      html.style.overflow = originalHtmlOverflow
      if (lenis) {
        lenis.start()
      }
    }
  }, [locked, lenis])
}
