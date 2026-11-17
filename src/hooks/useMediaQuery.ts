import { useSyncExternalStore } from 'react'

const mediaQueryLists = new Map<string, MediaQueryList>()
const listeners = new Map<string, Set<() => void>>()

function getMediaQueryList(query: string) {
  if (!mediaQueryLists.has(query)) {
    const list = window.matchMedia(query)
    mediaQueryLists.set(query, list)

    const notify = () => {
      listeners.get(query)?.forEach((listener) => listener())
    }

    list.addEventListener('change', notify)
  }

  return mediaQueryLists.get(query)!
}

function subscribe(query: string, onStoreChange: () => void) {
  const queryListeners = listeners.get(query) ?? new Set()
  queryListeners.add(onStoreChange)
  listeners.set(query, queryListeners)

  return () => {
    queryListeners.delete(onStoreChange)

    if (queryListeners.size === 0) {
      listeners.delete(query)
    }
  }
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getMediaQueryList(query).matches,
    () => false,
  )
}
