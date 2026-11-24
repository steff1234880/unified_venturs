import { createSeedStore } from '@/admin/seed'
import type {
  AdminCraftsmanshipItem,
  AdminGalleryItem,
  AdminInvoice,
  AdminNote,
  AdminProject,
  AdminStore,
  BaseEntity,
  CollectionKey,
  ContactMessage,
} from '@/admin/types'
import { createId, nowIso } from '@/admin/utils'
import { apiUrl } from '@/lib/api-url'

const STORAGE_KEY = 'intereor-admin-store'

export const ADMIN_STORE_UPDATED_EVENT = 'intereor:admin-store-updated'

const ALL_COLLECTIONS: CollectionKey[] = [
  'projects',
  'gallery',
  'craftsmanship',
  'services',
  'testimonials',
  'faqs',
  'messages',
  'notes',
  'invoices',
]

/**
 * Safely saves data into localStorage, stripping any accidental large data: URLs
 * or catching quota errors gracefully without crashing the app.
 */
function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(key, value)
    return true
  } catch (err: any) {
    console.warn('[Storage] Quota exceeded or failed setItem for key:', key, err?.message)
    try {
      const parsed = JSON.parse(value)
      if (parsed.projects && Array.isArray(parsed.projects)) {
        parsed.projects = parsed.projects.map((p: any) => ({
          ...p,
          image: p.image?.startsWith('data:') ? '/images/after-living-room.jpg' : p.image,
          beforeImage: p.beforeImage?.startsWith('data:') ? '/images/before-living-room.jpg' : p.beforeImage,
          afterImage: p.afterImage?.startsWith('data:') ? '/images/after-living-room.jpg' : p.afterImage,
          images: Array.isArray(p.images)
            ? p.images.map((img: string) => (img?.startsWith('data:') ? '/images/after-living-room.jpg' : img))
            : p.images,
        }))
      }
      if (parsed.gallery && Array.isArray(parsed.gallery)) {
        parsed.gallery = parsed.gallery.map((g: any) => ({
          ...g,
          src: g.src?.startsWith('data:') ? '/images/after-living-room.jpg' : g.src,
        }))
      }
      localStorage.setItem(key, JSON.stringify(parsed))
      return true
    } catch {
      return false
    }
  }
}

function readStore(): AdminStore {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null

  if (!raw) {
    const seed = createSeedStore()
    if (typeof window !== 'undefined') {
      safeSetLocalStorage(STORAGE_KEY, JSON.stringify(seed))
    }
    return seed
  }

  try {
    const parsed = JSON.parse(raw) as AdminStore
    let modified = false
    const seed = createSeedStore()

    // Ensure all collections exist as arrays to prevent undefined errors
    for (const key of ALL_COLLECTIONS) {
      if (!Array.isArray(parsed[key])) {
        parsed[key] = (seed[key] || []) as any
        modified = true
      }
    }

    if (parsed.projects && Array.isArray(parsed.projects)) {
      parsed.projects = parsed.projects.map((proj) => {
        let dirty = false
        let img = proj.image
        if (img?.startsWith('data:')) {
          img = '/images/after-living-room.jpg'
          dirty = true
        }

        let images = proj.images
        if (Array.isArray(images)) {
          const sanitizedImages = images.map((i) => (i?.startsWith('data:') ? '/images/after-living-room.jpg' : i))
          if (JSON.stringify(sanitizedImages) !== JSON.stringify(images)) {
            images = sanitizedImages
            dirty = true
          }
        }

        if (dirty) {
          modified = true
          return { ...proj, image: img, images }
        }
        return proj
      })

      for (const seedProject of seed.projects) {
        const exists = parsed.projects.some(
          (p) => p.title.toLowerCase() === seedProject.title.toLowerCase() || p.id === seedProject.id,
        )
        if (!exists) {
          parsed.projects.push(seedProject)
          modified = true
        }
      }
    }

    if (parsed.gallery && Array.isArray(parsed.gallery)) {
      parsed.gallery = parsed.gallery.map((g) => {
        if (g.src?.startsWith('data:')) {
          modified = true
          return { ...g, src: '/images/after-living-room.jpg' }
        }
        return g
      })
    }

    if (modified) {
      safeSetLocalStorage(STORAGE_KEY, JSON.stringify(parsed))
    }

    return parsed
  } catch {
    const seed = createSeedStore()
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

function writeStore(store: AdminStore) {
  if (typeof window !== 'undefined') {
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new CustomEvent(ADMIN_STORE_UPDATED_EVENT))
  }
}

let hasMigratedLocalMessages = false
let hasMigratedLocalProjects = false
let hasMigratedLocalGallery = false
let hasMigratedLocalCraftsmanship = false
let hasMigratedLocalNotes = false
let hasMigratedLocalInvoices = false

async function syncWithBackendNotes(): Promise<AdminNote[] | null> {
  try {
    const res = await fetch(apiUrl('/api/notes'))
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.success || !Array.isArray(json?.notes)) return null
    const backendNotes = json.notes as AdminNote[]

    if (!hasMigratedLocalNotes) {
      hasMigratedLocalNotes = true
      const store = readStore()
      const backendIds = new Set(backendNotes.map((n) => n.id))

      if (Array.isArray(store.notes)) {
        for (const localNote of store.notes) {
          if (!backendIds.has(localNote.id)) {
            void fetch(apiUrl('/api/notes'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localNote),
            }).catch(() => {})
          }
        }
      }
    }

    return backendNotes
  } catch {
    return null
  }
}

async function syncWithBackendInvoices(): Promise<AdminInvoice[] | null> {
  try {
    const res = await fetch(apiUrl('/api/invoices'))
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.success || !Array.isArray(json?.invoices)) return null
    const backendInvoices = json.invoices as AdminInvoice[]

    if (!hasMigratedLocalInvoices) {
      hasMigratedLocalInvoices = true
      const store = readStore()
      const backendNumbers = new Set(backendInvoices.map((inv) => inv.invoiceNumber))

      if (Array.isArray(store.invoices)) {
        for (const localInv of store.invoices) {
          if (!backendNumbers.has(localInv.invoiceNumber)) {
            void fetch(apiUrl('/api/invoices'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localInv),
            }).catch(() => {})
          }
        }
      }
    }

    return backendInvoices
  } catch {
    return null
  }
}

async function syncWithBackendCraftsmanship(): Promise<AdminCraftsmanshipItem[] | null> {
  try {
    const res = await fetch(apiUrl('/api/craftsmanship'))
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.success || !Array.isArray(json?.items)) return null
    const backendItems = json.items as AdminCraftsmanshipItem[]

    if (!hasMigratedLocalCraftsmanship) {
      hasMigratedLocalCraftsmanship = true
      const store = readStore()
      const backendIds = new Set(backendItems.map((c) => c.id))

      if (Array.isArray(store.craftsmanship)) {
        for (const localItem of store.craftsmanship) {
          if (!backendIds.has(localItem.id)) {
            void fetch(apiUrl('/api/craftsmanship'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localItem),
            }).catch(() => {})
          }
        }
      }
    }

    return backendItems
  } catch {
    return null
  }
}

async function syncWithBackendMessages(): Promise<ContactMessage[] | null> {
  try {
    const res = await fetch(apiUrl('/api/admin/messages'))
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.success || !Array.isArray(json?.messages)) return null
    const backendMessages = json.messages as ContactMessage[]

    if (!hasMigratedLocalMessages) {
      hasMigratedLocalMessages = true
      const store = readStore()
      const existingDbEmailsAndMsgs = new Set(
        backendMessages.map((m) => `${m.email.toLowerCase()}|${m.message.trim()}`),
      )

      for (const localMsg of store.messages) {
        const key = `${localMsg.email.toLowerCase()}|${localMsg.message.trim()}`
        if (!existingDbEmailsAndMsgs.has(key)) {
          void fetch(apiUrl('/api/contact'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localMsg),
          }).catch(() => {})
        }
      }
    }

    return backendMessages
  } catch {
    return null
  }
}

async function syncWithBackendProjects(): Promise<AdminProject[] | null> {
  try {
    const res = await fetch(apiUrl('/api/projects'))
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.success || !Array.isArray(json?.projects)) return null
    const backendProjects = json.projects as AdminProject[]

    if (!hasMigratedLocalProjects) {
      hasMigratedLocalProjects = true
      const store = readStore()
      const backendIds = new Set(backendProjects.map((p) => p.id))
      const backendTitles = new Set(backendProjects.map((p) => p.title.toLowerCase().trim()))

      for (const localProj of store.projects) {
        if (!backendIds.has(localProj.id) && !backendTitles.has(localProj.title.toLowerCase().trim())) {
          void fetch(apiUrl('/api/projects'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localProj),
          }).catch(() => {})
        }
      }
    }

    return backendProjects
  } catch {
    return null
  }
}

async function syncWithBackendGallery(): Promise<AdminGalleryItem[] | null> {
  try {
    const res = await fetch(apiUrl('/api/gallery'))
    if (!res.ok) return null
    const json = await res.json()
    const galleryItems = Array.isArray(json?.items) ? json.items : (Array.isArray(json?.gallery) ? json.gallery : null)
    if (!json?.success || !galleryItems) return null
    const backendGallery = galleryItems as AdminGalleryItem[]

    if (!hasMigratedLocalGallery) {
      hasMigratedLocalGallery = true
      const store = readStore()
      const backendIds = new Set(backendGallery.map((g) => g.id))

      for (const localGal of store.gallery) {
        if (!backendIds.has(localGal.id)) {
          void fetch(apiUrl('/api/gallery'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localGal),
          }).catch(() => {})
        }
      }
    }

    return backendGallery
  } catch {
    return null
  }
}

export async function fetchCollection<K extends CollectionKey>(
  key: K,
): Promise<AdminStore[K]> {
  if (key === 'messages') {
    const backendMsgs = await syncWithBackendMessages()
    if (backendMsgs) {
      return backendMsgs as AdminStore[K]
    }
  }

  if (key === 'projects') {
    const backendProjects = await syncWithBackendProjects()
    if (backendProjects && backendProjects.length > 0) {
      const store = readStore()
      store.projects = backendProjects
      writeStore(store)
      return [...backendProjects].sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
      ) as AdminStore[K]
    }
  }

  if (key === 'gallery') {
    const backendGallery = await syncWithBackendGallery()
    if (backendGallery && backendGallery.length > 0) {
      const store = readStore()
      store.gallery = backendGallery
      writeStore(store)
      return [...backendGallery].sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
      ) as AdminStore[K]
    }
  }

  if (key === 'craftsmanship') {
    const backendCraft = await syncWithBackendCraftsmanship()
    if (backendCraft && backendCraft.length > 0) {
      const store = readStore()
      store.craftsmanship = backendCraft
      writeStore(store)
      return [...backendCraft].sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
      ) as AdminStore[K]
    }
  }

  if (key === 'notes') {
    const backendNotes = await syncWithBackendNotes()
    if (backendNotes && backendNotes.length > 0) {
      const store = readStore()
      store.notes = backendNotes
      writeStore(store)
      return backendNotes as AdminStore[K]
    }
  }

  if (key === 'invoices') {
    const backendInvoices = await syncWithBackendInvoices()
    if (backendInvoices && backendInvoices.length > 0) {
      const store = readStore()
      store.invoices = backendInvoices
      writeStore(store)
      return backendInvoices as AdminStore[K]
    }
  }

  const store = readStore()
  const collection = Array.isArray(store[key]) ? store[key] : ([] as unknown as AdminStore[K])
  if (key === 'projects' && Array.isArray(collection)) {
    return [...collection].sort(
      (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
    ) as AdminStore[K]
  }
  if (key === 'gallery' && Array.isArray(collection)) {
    return [...collection].sort(
      (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
    ) as AdminStore[K]
  }
  if (key === 'craftsmanship' && Array.isArray(collection)) {
    return [...collection].sort(
      (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
    ) as AdminStore[K]
  }
  return collection as AdminStore[K]
}

export async function createItem<K extends CollectionKey>(
  key: K,
  data: Omit<AdminStore[K][number], keyof BaseEntity>,
): Promise<AdminStore[K][number]> {
  if (key === 'projects') {
    try {
      const res = await fetch(apiUrl('/api/projects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.project) {
          const createdProj = json.project as AdminStore[K][number]
          const store = readStore()
          store.projects = [...(store.projects || []), createdProj as AdminProject]
          writeStore(store)
          return createdProj
        }
      }
    } catch (apiErr) {
      console.warn('[Projects] Backend API save failed, falling back to local store:', apiErr)
    }
  }

  if (key === 'gallery') {
    try {
      const res = await fetch(apiUrl('/api/gallery'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.item) {
          const createdGal = json.item as AdminStore[K][number]
          const store = readStore()
          store.gallery = [...(store.gallery || []), createdGal as AdminGalleryItem]
          writeStore(store)
          return createdGal
        }
      }
    } catch (apiErr) {
      console.warn('[Gallery] Backend API save failed, falling back to local store:', apiErr)
    }
  }

  if (key === 'craftsmanship') {
    try {
      const res = await fetch(apiUrl('/api/craftsmanship'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.item) {
          const createdCraft = json.item as AdminStore[K][number]
          const store = readStore()
          store.craftsmanship = [...(store.craftsmanship || []), createdCraft as AdminCraftsmanshipItem]
          writeStore(store)
          return createdCraft
        }
      }
    } catch (apiErr) {
      console.warn('[Craftsmanship] Backend API save failed, falling back to local store:', apiErr)
    }
  }

  if (key === 'notes') {
    try {
      const res = await fetch(apiUrl('/api/notes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.note) {
          const createdNote = json.note as AdminStore[K][number]
          const store = readStore()
          store.notes = [...(store.notes || []), createdNote as AdminNote]
          writeStore(store)
          return createdNote
        }
      }
    } catch (apiErr) {
      console.warn('[Notes] Backend API save failed, falling back to local store:', apiErr)
    }
  }

  if (key === 'invoices') {
    try {
      const res = await fetch(apiUrl('/api/invoices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.invoice) {
          const createdInvoice = json.invoice as AdminStore[K][number]
          const store = readStore()
          store.invoices = [...(store.invoices || []), createdInvoice as AdminInvoice]
          writeStore(store)
          return createdInvoice
        }
      }
    } catch (apiErr) {
      console.warn('[Invoices] Backend API save failed, falling back to local store:', apiErr)
    }
  }

  const store = readStore()
  const timestamp = nowIso()
  const item = {
    ...data,
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  } as AdminStore[K][number]

  const existing = Array.isArray(store[key]) ? store[key] : []
  const collection = [...existing, item] as AdminStore[K]
  writeStore({ ...store, [key]: collection })

  return item
}

export async function updateItem<K extends CollectionKey>(
  key: K,
  id: string,
  data: Partial<Omit<AdminStore[K][number], keyof BaseEntity>>,
): Promise<AdminStore[K][number]> {
  if (key === 'projects') {
    try {
      const res = await fetch(apiUrl(`/api/projects/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.project) {
          const updatedProj = json.project as AdminStore[K][number]
          const store = readStore()
          const index = (store.projects || []).findIndex((p) => p.id === id)
          if (index !== -1) {
            store.projects[index] = updatedProj as AdminProject
            writeStore(store)
          }
          return updatedProj
        }
      }
    } catch (apiErr) {
      console.warn('[Projects] Backend API update failed, updating local store:', apiErr)
    }
  }

  if (key === 'gallery') {
    try {
      const res = await fetch(apiUrl(`/api/gallery/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.item) {
          const updatedGal = json.item as AdminStore[K][number]
          const store = readStore()
          const index = (store.gallery || []).findIndex((g) => g.id === id)
          if (index !== -1) {
            store.gallery[index] = updatedGal as AdminGalleryItem
            writeStore(store)
          }
          return updatedGal
        }
      }
    } catch (apiErr) {
      console.warn('[Gallery] Backend API update failed, updating local store:', apiErr)
    }
  }

  if (key === 'craftsmanship') {
    try {
      const res = await fetch(apiUrl(`/api/craftsmanship/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.item) {
          const updatedCraft = json.item as AdminStore[K][number]
          const store = readStore()
          const index = (store.craftsmanship || []).findIndex((c) => c.id === id)
          if (index !== -1) {
            store.craftsmanship[index] = updatedCraft as AdminCraftsmanshipItem
            writeStore(store)
          }
          return updatedCraft
        }
      }
    } catch (apiErr) {
      console.warn('[Craftsmanship] Backend API update failed, updating local store:', apiErr)
    }
  }

  if (key === 'notes') {
    try {
      const res = await fetch(apiUrl(`/api/notes/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.note) {
          const updatedNote = json.note as AdminStore[K][number]
          const store = readStore()
          const index = (store.notes || []).findIndex((n) => n.id === id)
          if (index !== -1) {
            store.notes[index] = updatedNote as AdminNote
            writeStore(store)
          }
          return updatedNote
        }
      }
    } catch (apiErr) {
      console.warn('[Notes] Backend API update failed, updating local store:', apiErr)
    }
  }

  if (key === 'invoices') {
    try {
      const res = await fetch(apiUrl(`/api/invoices/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.invoice) {
          const updatedInvoice = json.invoice as AdminStore[K][number]
          const store = readStore()
          const index = (store.invoices || []).findIndex((inv) => inv.id === id)
          if (index !== -1) {
            store.invoices[index] = updatedInvoice as AdminInvoice
            writeStore(store)
          }
          return updatedInvoice
        }
      }
    } catch (apiErr) {
      console.warn('[Invoices] Backend API update failed, updating local store:', apiErr)
    }
  }

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
  if (key === 'projects') {
    try {
      await fetch(apiUrl(`/api/projects/${id}`), { method: 'DELETE' })
    } catch (apiErr) {
      console.warn('[Projects] Backend API delete failed:', apiErr)
    }
  }

  if (key === 'gallery') {
    try {
      await fetch(apiUrl(`/api/gallery/${id}`), { method: 'DELETE' })
    } catch (apiErr) {
      console.warn('[Gallery] Backend API delete failed:', apiErr)
    }
  }

  if (key === 'craftsmanship') {
    try {
      await fetch(apiUrl(`/api/craftsmanship/${id}`), { method: 'DELETE' })
    } catch (apiErr) {
      console.warn('[Craftsmanship] Backend API delete failed:', apiErr)
    }
  }

  if (key === 'notes') {
    try {
      await fetch(apiUrl(`/api/notes/${id}`), { method: 'DELETE' })
    } catch (apiErr) {
      console.warn('[Notes] Backend API delete failed:', apiErr)
    }
  }

  if (key === 'invoices') {
    try {
      await fetch(apiUrl(`/api/invoices/${id}`), { method: 'DELETE' })
    } catch (apiErr) {
      console.warn('[Invoices] Backend API delete failed:', apiErr)
    }
  }

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
  void fetch(apiUrl(`/api/admin/messages/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read }),
  }).catch(() => {})

  return updateItem('messages', id, { read })
}

export async function deleteMessage(id: string): Promise<void> {
  void fetch(apiUrl(`/api/admin/messages/${id}`), {
    method: 'DELETE',
  }).catch(() => {})

  return deleteItem('messages', id)
}

export async function getDashboardStats() {
  const store = readStore()

  let messagesCount = store.messages.length
  let unreadCount = store.messages.filter((message) => !message.read).length
  let projectsCount = store.projects.length
  let galleryCount = store.gallery.length

  try {
    const res = await fetch(apiUrl('/api/admin/stats'))
    if (res.ok) {
      const data = await res.json()
      if (data?.success && data?.stats) {
        messagesCount = data.stats.messages
        unreadCount = data.stats.unreadMessages
        if (typeof data.stats.projects === 'number') {
          projectsCount = data.stats.projects
        }
        if (typeof data.stats.gallery === 'number') {
          galleryCount = data.stats.gallery
        }
      }
    }
  } catch {
    // fallback to store
  }

  return {
    projects: projectsCount,
    gallery: galleryCount,
    services: store.services.length,
    testimonials: store.testimonials.length,
    faqs: store.faqs.length,
    messages: messagesCount,
    notes: (store.notes || []).length,
    invoices: (store.invoices || []).length,
    unreadMessages: unreadCount,
  }
}
