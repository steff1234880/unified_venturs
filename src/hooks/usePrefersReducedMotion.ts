import { useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onStoreChange)

  return () => {
    query.removeEventListener('change', onStoreChange)
  }
}

function getSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
