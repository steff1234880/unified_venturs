import { useSyncExternalStore } from 'react'

import { readScrollPosition, subscribeScrollPosition } from '@/lib/scroll-position'

export function useScrolled(threshold = 48) {
  return useSyncExternalStore(
    subscribeScrollPosition,
    () => readScrollPosition() > threshold,
    () => false,
  )
}
