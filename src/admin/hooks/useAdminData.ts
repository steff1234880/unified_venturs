import { useCallback, useEffect, useState } from 'react'

import { ADMIN_STORE_UPDATED_EVENT } from '@/admin/api/local-storage'
import {
  createItem,
  deleteItem,
  fetchCollection,
  getDashboardStats,
  updateItem,
} from '@/admin/storage'
import type { AdminStore, BaseEntity, CollectionKey } from '@/admin/types'

export function useAdminCollection<K extends CollectionKey>(key: K) {
  const [items, setItems] = useState<AdminStore[K]>([] as AdminStore[K])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const data = await fetchCollection(key)
      setItems(data as AdminStore[K])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const data = await fetchCollection(key)

        if (!cancelled) {
          setItems(data as AdminStore[K])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    const onStoreUpdate = () => {
      void load()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(ADMIN_STORE_UPDATED_EVENT, onStoreUpdate)
      window.addEventListener('storage', onStoreUpdate)
    }

    return () => {
      cancelled = true
      if (typeof window !== 'undefined') {
        window.removeEventListener(ADMIN_STORE_UPDATED_EVENT, onStoreUpdate)
        window.removeEventListener('storage', onStoreUpdate)
      }
    }
  }, [key])

  const create = useCallback(
    async (data: Omit<AdminStore[K][number], keyof BaseEntity>) => {
      const item = await createItem(key, data)
      await refresh()
      return item
    },
    [key, refresh],
  )

  const update = useCallback(
    async (
      id: string,
      data: Partial<Omit<AdminStore[K][number], keyof BaseEntity>>,
    ) => {
      const item = await updateItem(key, id, data)
      await refresh()
      return item
    },
    [key, refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteItem(key, id)
      await refresh()
    },
    [key, refresh],
  )

  return { items, loading, error, create, update, remove, refresh }
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    projects: 0,
    gallery: 0,
    services: 0,
    testimonials: 0,
    faqs: 0,
    messages: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch {
      setStats({
        projects: 0,
        gallery: 0,
        services: 0,
        testimonials: 0,
        faqs: 0,
        messages: 0,
        unreadMessages: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const data = await getDashboardStats()

        if (!cancelled) {
          setStats(data)
        }
      } catch {
        if (!cancelled) {
          setStats({
            projects: 0,
            gallery: 0,
            services: 0,
            testimonials: 0,
            faqs: 0,
            messages: 0,
            unreadMessages: 0,
          })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    const onStoreUpdate = () => {
      void load()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(ADMIN_STORE_UPDATED_EVENT, onStoreUpdate)
      window.addEventListener('storage', onStoreUpdate)
    }

    return () => {
      cancelled = true
      if (typeof window !== 'undefined') {
        window.removeEventListener(ADMIN_STORE_UPDATED_EVENT, onStoreUpdate)
        window.removeEventListener('storage', onStoreUpdate)
      }
    }
  }, [])

  return { ...stats, loading, refresh }
}
