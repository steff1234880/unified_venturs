let scrollY = 0
const listeners = new Set<() => void>()
let isListening = false
let rafId: number | null = null

function notify() {
  listeners.forEach((listener) => listener())
}

export function setScrollPosition(next: number) {
  const normalized = Math.max(0, next)

  if (scrollY === normalized) {
    return
  }

  scrollY = normalized
  notify()
}

export function readScrollPosition() {
  if (typeof window === 'undefined') {
    return 0
  }

  return scrollY || window.scrollY
}

function onWindowScroll() {
  if (rafId !== null) return

  rafId = requestAnimationFrame(() => {
    rafId = null
    setScrollPosition(window.scrollY)
  })
}

export function subscribeScrollPosition(listener: () => void) {
  listeners.add(listener)

  if (!isListening && typeof window !== 'undefined') {
    isListening = true
    window.addEventListener('scroll', onWindowScroll, { passive: true })
    setScrollPosition(window.scrollY)
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && isListening && typeof window !== 'undefined') {
      isListening = false
      window.removeEventListener('scroll', onWindowScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }
  }
}
