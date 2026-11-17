import { createSeedStore } from '@/admin/seed'
import type {
  AdminStore,
  BaseEntity,
  CollectionKey,
  ContactMessage,
} from '@/admin/types'
import { createId, nowIso } from '@/admin/utils'

const STORAGE_KEY = 'intereor-admin-store'

function readStore(): AdminStore {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    const seed = createSeedStore()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    const parsed = JSON.parse(raw) as AdminStore
    let modified = false

    if (!Array.isArray(parsed.notes)) {
      parsed.notes = createSeedStore().notes || []
      modified = true
    }

    if (!Array.isArray(parsed.invoices)) {
      parsed.invoices = createSeedStore().invoices || []
      modified = true
    }

    // Migration: ensure verified Bengaluru work locations are synced into existing store and purge old unverified demo projects
    if (parsed.projects && Array.isArray(parsed.projects)) {
      const seed = createSeedStore()
      const seedTitles = new Set(seed.projects.map((p) => p.title.toLowerCase()))

      // Cleanse non-Bengaluru / demo projects from older stored state
      const initialCount = parsed.projects.length
      parsed.projects = parsed.projects.filter((p) => seedTitles.has(p.title.toLowerCase()))
      if (parsed.projects.length !== initialCount) {
        modified = true
      }

      // Check if any verified project from seed is missing in current store
      for (const seedProject of seed.projects) {
        const exists = parsed.projects.some((p) => p.title.toLowerCase() === seedProject.title.toLowerCase())
        if (!exists) {
          parsed.projects.push(seedProject)
          modified = true
        }
      }

      parsed.projects = parsed.projects.map((proj) => {
        // Upgrade Prestige Park Square to verified completed photography if pointing to old placeholder
        if (
          proj.title.toLowerCase().includes('prestige park square') &&
          (!proj.image || proj.image.endsWith('.svg') || proj.image.includes('placeholder'))
        ) {
          proj.image = '/images/after-living-room.jpg'
          if (!proj.images || proj.images.length === 0 || proj.images[0]?.endsWith('.svg')) {
            proj.images = ['/images/after-living-room.jpg', '/placeholders/prestige-park-square.svg']
          }
          modified = true
        }

        if (!proj.beforeImage) {
          const match = seed.projects.find((p) => p.title === proj.title)
          if (match?.beforeImage) {
            modified = true
            return {
              ...proj,
              beforeImage: match.beforeImage,
              afterImage: proj.afterImage || match.afterImage || proj.image,
              isTransformation: proj.isTransformation ?? true,
            }
          }
        }
        return proj
      })
      if (modified) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }
    }
    return parsed
  } catch {
    const seed = createSeedStore()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

function writeStore(store: AdminStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export async function fetchCollection<K extends CollectionKey>(
  key: K,
): Promise<AdminStore[K]> {
  const collection = readStore()[key]
  if (key === 'projects' && Array.isArray(collection)) {
    return [...collection].sort(
      (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
    ) as AdminStore[K]
  }
  return collection
}

export async function createItem<K extends CollectionKey>(
  key: K,
  data: Omit<AdminStore[K][number], keyof BaseEntity>,
): Promise<AdminStore[K][number]> {
  const store = readStore()
  const timestamp = nowIso()
  const item = {
    ...data,
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  } as AdminStore[K][number]

  const collection = [...store[key], item] as AdminStore[K]
  writeStore({ ...store, [key]: collection })

  return item
}

export async function updateItem<K extends CollectionKey>(
  key: K,
  id: string,
  data: Partial<Omit<AdminStore[K][number], keyof BaseEntity>>,
): Promise<AdminStore[K][number]> {
  const store = readStore()
  const index = store[key].findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error(`Item not found in ${key}`)
  }

  const current = store[key][index]!
  const updated = {
    ...current,
    ...data,
    updatedAt: nowIso(),
  } as AdminStore[K][number]

  const collection = [...store[key]] as AdminStore[K]
  collection[index] = updated
  writeStore({ ...store, [key]: collection })

  return updated
}

export async function deleteItem<K extends CollectionKey>(
  key: K,
  id: string,
): Promise<void> {
  const store = readStore()
  const collection = store[key].filter((item) => item.id !== id) as AdminStore[K]
  writeStore({ ...store, [key]: collection })
}

export async function addContactMessage(
  data: Omit<ContactMessage, keyof BaseEntity | 'read'>,
): Promise<ContactMessage> {
  return createItem('messages', { ...data, read: false })
}

export async function markMessageRead(
  id: string,
  read = true,
): Promise<ContactMessage> {
  return updateItem('messages', id, { read })
}

export async function deleteMessage(id: string): Promise<void> {
  return deleteItem('messages', id)
}

export async function getDashboardStats() {
  const store = readStore()

  return {
    projects: store.projects.length,
    gallery: store.gallery.length,
    services: store.services.length,
    testimonials: store.testimonials.length,
    faqs: store.faqs.length,
    messages: store.messages.length,
    unreadMessages: store.messages.filter((message) => !message.read).length,
  }
}
