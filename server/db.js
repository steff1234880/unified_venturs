import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

const dataDir = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'intereor.db')
export const db = new DatabaseSync(dbPath)

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    project_type TEXT DEFAULT '',
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    year TEXT DEFAULT '2024',
    area TEXT DEFAULT '—',
    image TEXT NOT NULL,
    description TEXT DEFAULT '',
    images TEXT DEFAULT '[]',
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    before_image TEXT DEFAULT '',
    after_image TEXT DEFAULT '',
    is_transformation INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id TEXT PRIMARY KEY,
    src TEXT NOT NULL,
    alt TEXT NOT NULL,
    collection TEXT DEFAULT 'General',
    tall INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS craftsmanship_items (
    id TEXT PRIMARY KEY,
    discipline TEXT NOT NULL,
    material TEXT NOT NULL,
    title TEXT NOT NULL,
    caption TEXT NOT NULL,
    provenance TEXT DEFAULT '',
    finish TEXT DEFAULT '',
    image TEXT NOT NULL,
    aspect_ratio TEXT DEFAULT 'aspect-4/3',
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_settings_kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
  CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
  CREATE INDEX IF NOT EXISTS idx_gallery_items_sort ON gallery_items(sort_order, created_at);
  CREATE INDEX IF NOT EXISTS idx_craftsmanship_sort ON craftsmanship_items(sort_order, created_at);
`)

// Seed initial default residences if projects table is empty
const defaultSeedProjects = [
  {
    id: 'proj_prestige_park_square',
    title: 'Prestige Park Square',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residence',
    year: '2024',
    area: 'Bengaluru',
    image: '/images/after-living-room.jpg',
    description:
      'Completed bespoke residence in Prestige Park Square, Bengaluru. Features custom architectural joinery, organic stone textures, and tailored modern luxury.',
    images: [
      '/images/after-living-room.jpg',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    ],
    published: 1,
    sort_order: 0,
    featured: 1,
    before_image: '/images/before-living-room.jpg',
    after_image: '/images/after-living-room.jpg',
    is_transformation: 1,
  },
  {
    id: 'proj_kolte_patil_i_towers',
    title: 'Kolte Patil i-Towers',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residence',
    year: '2024',
    area: 'Bengaluru',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    description:
      'Turnkey residence completed in Kolte Patil i-Towers, Bengaluru. Contemporary urban interiors elevated with refined materials and ambient illumination.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
    ],
    published: 1,
    sort_order: 1,
    featured: 0,
    before_image: '/images/before-living-room.jpg',
    after_image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    is_transformation: 1,
  },
  {
    id: 'proj_brigade_cornerstone_utopia',
    title: 'Brigade Cornerstone Utopia',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residence',
    year: '2024',
    area: 'Bengaluru',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    description:
      'Curated interior transformation in Brigade Cornerstone Utopia, Bengaluru. Tactile artisanal finishes dialogue with contemporary spatial flow.',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    ],
    published: 1,
    sort_order: 2,
    featured: 0,
    before_image: '/images/before-living-room.jpg',
    after_image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    is_transformation: 1,
  },
  {
    id: 'proj_bren_zahara',
    title: 'Bren Zahara',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residence',
    year: '2024',
    area: 'Bengaluru',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description:
      'Bespoke residential interior in Bren Zahara, Bengaluru. Handcrafted wall panelling, bespoke hardware, and quiet understated elegance.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    ],
    published: 1,
    sort_order: 3,
    featured: 0,
    before_image: '/images/before-living-room.jpg',
    after_image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    is_transformation: 1,
  },
  {
    id: 'proj_alpine_viva',
    title: 'Alpine Viva',
    location: 'Bengaluru, Karnataka',
    category: 'Completed Residence',
    year: '2024',
    area: 'Bengaluru',
    image:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
    description:
      'Sophisticated interior craftsmanship executed for residence in Alpine Viva, Bengaluru. Warm natural woods, silk-honed stone, and tranquil palette.',
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
    ],
    published: 1,
    sort_order: 4,
    featured: 0,
    before_image: '/images/before-living-room.jpg',
    after_image:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
    is_transformation: 1,
  },
]

try {
  const count = db.prepare('SELECT count(*) as count FROM projects').get().count
  if (count === 0) {
    const now = new Date().toISOString()
    const insertProj = db.prepare(`
      INSERT INTO projects (
        id, title, location, category, year, area, image, description,
        images, published, sort_order, featured, before_image, after_image,
        is_transformation, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const p of defaultSeedProjects) {
      insertProj.run(
        p.id,
        p.title,
        p.location,
        p.category,
        p.year,
        p.area,
        p.image,
        p.description,
        JSON.stringify(p.images),
        p.published,
        p.sort_order,
        p.featured,
        p.before_image,
        p.after_image,
        p.is_transformation,
        now,
        now,
      )
    }
  }
} catch (e) {
  console.error('Failed to seed default projects', e)
}

// Seed initial default gallery items if table is empty
const defaultSeedGallery = [
  {
    id: 'gal_1',
    src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    alt: 'Grand living room with carved teak panels',
    collection: 'Living Spaces',
    tall: 1,
  },
  {
    id: 'gal_2',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    alt: 'Minimal luxury bedroom suite',
    collection: 'Bedrooms & Suites',
    tall: 0,
  },
  {
    id: 'gal_3',
    src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
    alt: 'Dining space with brass accents',
    collection: 'Living Spaces',
    tall: 0,
  },
  {
    id: 'gal_4',
    src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
    alt: 'Contemporary Indian kitchen & island',
    collection: 'Living Spaces',
    tall: 1,
  },
  {
    id: 'gal_5',
    src: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80',
    alt: 'Marble bathroom suite',
    collection: 'Bedrooms & Suites',
    tall: 0,
  },
  {
    id: 'gal_6',
    src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80',
    alt: 'Study with heritage bookshelf',
    collection: 'Bedrooms & Suites',
    tall: 0,
  },
  {
    id: 'gal_7',
    src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    alt: 'Carved wood architectural detail',
    collection: 'Details & Craft',
    tall: 0,
  },
  {
    id: 'gal_8',
    src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cd7e?auto=format&fit=crop&w=1000&q=80',
    alt: 'Bespoke aged brass hardware',
    collection: 'Details & Craft',
    tall: 0,
  },
  {
    id: 'gal_9',
    src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
    alt: 'Hand-bookmatched marble inlay',
    collection: 'Details & Craft',
    tall: 0,
  },
]

try {
  const gCount = db.prepare('SELECT count(*) as count FROM gallery_items').get().count
  if (gCount === 0) {
    const now = new Date().toISOString()
    const insertGal = db.prepare(`
      INSERT INTO gallery_items (id, src, alt, collection, tall, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    defaultSeedGallery.forEach((item, idx) => {
      insertGal.run(item.id, item.src, item.alt, item.collection, item.tall, idx, now, now)
    })
  }
} catch (e) {
  console.error('Failed to seed default gallery items', e)
}

// Seed initial default craftsmanship items if table is empty
const defaultSeedCraftsmanship = [
  {
    id: 'craft_1',
    discipline: 'Monumental Masonry',
    material: 'Veined Marble & Laterite',
    title: 'Honed Stone & Monolithic Veining',
    caption:
      'Hand-selected Statuario and indigenous Makrana marbles, bookmatched with zero-tolerance micro-joints.',
    provenance: 'Master Stone Guilds',
    finish: 'Silk-Honed Matte & Fluted Relief',
    image:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85',
    aspect_ratio: 'aspect-4/5',
    sort_order: 0,
    published: 1,
  },
  {
    id: 'craft_2',
    discipline: 'Artisanal Joinery',
    material: 'Burmese Teak & Dark Walnut',
    title: 'Warm Grain & Architectural Millwork',
    caption:
      'Seasoned solid hardwoods turned into bespoke fluted wall panels, seamless concealed pivot doors, and heirloom credenzas.',
    provenance: 'Dedicated Joinery Ateliers',
    finish: 'Hand-Rubbed Organic Wax & Natural Oil',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
    aspect_ratio: 'aspect-16/10',
    sort_order: 1,
    published: 1,
  },
  {
    id: 'craft_3',
    discipline: 'Metalwork & Hardware',
    material: 'Aged Brass & Bronze Castings',
    title: 'Antiquated Patinas & Bespoke Accents',
    caption:
      'Custom unlacquered brass hardware, hand-beaten partition screens, and recessed profiles that age gracefully alongside the home.',
    provenance: 'Artisanal Metal Guilds',
    finish: 'Brushed Satin & Living Patina',
    image:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85',
    aspect_ratio: 'aspect-4/3',
    sort_order: 2,
    published: 1,
  },
  {
    id: 'craft_4',
    discipline: 'Textile Architecture',
    material: 'Handloom Linen & Wild Silk',
    title: 'Tactile Weaves & Acoustic Softness',
    caption:
      'Custom woven silks, bouclé wool drapery, and unbleached Belgian linens layered to soften geometric architecture and filter ambient light.',
    provenance: 'Master Weaving Looms',
    finish: 'Raw Organic Weave & Calendered Softness',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    aspect_ratio: 'aspect-3/4',
    sort_order: 3,
    published: 1,
  },
]

try {
  const cCount = db.prepare('SELECT count(*) as count FROM craftsmanship_items').get().count
  if (cCount === 0) {
    const now = new Date().toISOString()
    const insertCraft = db.prepare(`
      INSERT INTO craftsmanship_items (
        id, discipline, material, title, caption, provenance, finish,
        image, aspect_ratio, published, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    defaultSeedCraftsmanship.forEach((item) => {
      insertCraft.run(
        item.id,
        item.discipline,
        item.material,
        item.title,
        item.caption,
        item.provenance,
        item.finish,
        item.image,
        item.aspect_ratio,
        item.published,
        item.sort_order,
        now,
        now,
      )
    })
  }
} catch (e) {
  console.error('Failed to seed default craftsmanship items', e)
}

// Sanitize string helper
export function sanitize(input) {
  if (typeof input !== 'string') return ''
  return input.trim().replace(/[<>]/g, '')
}

// Contact message methods
export function insertMessage(data) {
  const firstName = sanitize(data.firstName)
  const lastName = sanitize(data.lastName)
  const email = sanitize(data.email).toLowerCase()
  const phone = sanitize(data.phone)
  const projectType = sanitize(data.projectType)
  const message = sanitize(data.message)

  if (!firstName || !lastName || !email || !message) {
    throw new Error('Required fields missing: firstName, lastName, email, and message are required.')
  }

  const recentCheck = db.prepare(`
    SELECT id FROM contact_messages 
    WHERE email = ? AND message = ? AND datetime(created_at) >= datetime('now', '-5 minutes')
    LIMIT 1
  `).get(email, message)

  if (recentCheck) {
    throw new Error('A message with this content was recently received. Please wait a few minutes before resubmitting.')
  }

  const id = 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
  const now = new Date().toISOString()

  const insertStmt = db.prepare(`
    INSERT INTO contact_messages (id, first_name, last_name, email, phone, project_type, message, read, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `)

  insertStmt.run(id, firstName, lastName, email, phone, projectType, message, now, now)

  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    projectType,
    message,
    read: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function getAllMessages() {
  const rows = db.prepare(`
    SELECT id, first_name as firstName, last_name as lastName, email, phone, project_type as projectType, message, read, created_at as createdAt, updated_at as updatedAt
    FROM contact_messages
    ORDER BY created_at DESC
  `).all()

  return rows.map((r) => ({
    ...r,
    read: Boolean(r.read),
  }))
}

export function updateMessageRead(id, read) {
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE contact_messages
    SET read = ?, updated_at = ?
    WHERE id = ?
  `).run(read ? 1 : 0, now, id)

  const row = db.prepare(`
    SELECT id, first_name as firstName, last_name as lastName, email, phone, project_type as projectType, message, read, created_at as createdAt, updated_at as updatedAt
    FROM contact_messages
    WHERE id = ?
  `).get(id)

  if (!row) throw new Error('Message not found.')
  return { ...row, read: Boolean(row.read) }
}

export function deleteMessageById(id) {
  db.prepare(`DELETE FROM contact_messages WHERE id = ?`).run(id)
}

// Projects database methods
function mapProjectRow(row) {
  if (!row) return null
  let images = []
  try {
    images = typeof row.images === 'string' ? JSON.parse(row.images) : []
  } catch {
    images = row.image ? [row.image] : []
  }
  if (!Array.isArray(images) || images.length === 0) {
    images = row.image ? [row.image] : []
  }

  return {
    id: row.id,
    title: row.title,
    location: row.location,
    category: row.category,
    year: row.year || '2024',
    area: row.area || '—',
    image: row.image,
    description: row.description || '',
    images,
    published: Boolean(row.published),
    order: typeof row.sort_order === 'number' ? row.sort_order : 0,
    featured: Boolean(row.featured),
    beforeImage: row.before_image || '',
    afterImage: row.after_image || row.image || '',
    isTransformation: Boolean(row.is_transformation),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function getAllProjects() {
  const rows = db.prepare(`
    SELECT * FROM projects
    ORDER BY sort_order ASC, created_at DESC
  `).all()

  return rows.map(mapProjectRow)
}

export function getProjectById(id) {
  const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id)
  return mapProjectRow(row)
}

export function insertProject(data) {
  const title = sanitize(data.title)
  const location = sanitize(data.location)
  const category = sanitize(data.category)
  const year = sanitize(data.year) || '2024'
  const area = sanitize(data.area) || '—'
  const description = typeof data.description === 'string' ? data.description.trim() : ''

  if (!title) throw new Error('Project title is required.')
  if (!location) throw new Error('Project location is required.')
  if (!category) throw new Error('Project category is required.')

  let image = typeof data.image === 'string' ? data.image.trim() : ''
  let images = Array.isArray(data.images) ? data.images.filter(Boolean) : []
  if (!image && images.length > 0) {
    image = images[0]
  }
  if (image && !images.includes(image)) {
    images = [image, ...images]
  }
  if (!image) {
    image = '/images/after-living-room.jpg'
    images = [image]
  }

  const id = data.id || 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
  const now = new Date().toISOString()
  const published = data.published === false ? 0 : 1
  const featured = data.featured ? 1 : 0
  const order = typeof data.order === 'number' ? data.order : 0
  const beforeImage = typeof data.beforeImage === 'string' ? data.beforeImage.trim() : ''
  const afterImage = typeof data.afterImage === 'string' ? data.afterImage.trim() : (image || '')
  const isTransformation = data.isTransformation ? 1 : 0

  const stmt = db.prepare(`
    INSERT INTO projects (
      id, title, location, category, year, area, image, description,
      images, published, sort_order, featured, before_image, after_image,
      is_transformation, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    title,
    location,
    category,
    year,
    area,
    image,
    description,
    JSON.stringify(images),
    published,
    order,
    featured,
    beforeImage,
    afterImage,
    isTransformation,
    now,
    now,
  )

  return getProjectById(id)
}

export function updateProjectById(id, data) {
  const existing = getProjectById(id)
  if (!existing) {
    throw new Error(`Project with ID "${id}" not found.`)
  }

  const title = data.title !== undefined ? sanitize(data.title) : existing.title
  const location = data.location !== undefined ? sanitize(data.location) : existing.location
  const category = data.category !== undefined ? sanitize(data.category) : existing.category
  const year = data.year !== undefined ? sanitize(data.year) : existing.year
  const area = data.area !== undefined ? sanitize(data.area) : existing.area
  const description = data.description !== undefined ? data.description : existing.description

  let image = data.image !== undefined ? (typeof data.image === 'string' ? data.image.trim() : '') : existing.image
  let images = data.images !== undefined ? (Array.isArray(data.images) ? data.images : []) : existing.images
  if (!image && images.length > 0) {
    image = images[0]
  }
  if (!image) {
    image = existing.image || '/images/after-living-room.jpg'
  }

  const published = data.published !== undefined ? (data.published ? 1 : 0) : (existing.published ? 1 : 0)
  const featured = data.featured !== undefined ? (data.featured ? 1 : 0) : (existing.featured ? 1 : 0)
  const order = data.order !== undefined && typeof data.order === 'number' ? data.order : existing.order
  const beforeImage = data.beforeImage !== undefined ? data.beforeImage : existing.beforeImage
  const afterImage = data.afterImage !== undefined ? data.afterImage : existing.afterImage
  const isTransformation = data.isTransformation !== undefined ? (data.isTransformation ? 1 : 0) : (existing.isTransformation ? 1 : 0)
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    UPDATE projects
    SET title = ?, location = ?, category = ?, year = ?, area = ?, image = ?, description = ?,
        images = ?, published = ?, sort_order = ?, featured = ?, before_image = ?, after_image = ?,
        is_transformation = ?, updated_at = ?
    WHERE id = ?
  `)

  stmt.run(
    title,
    location,
    category,
    year,
    area,
    image,
    description,
    JSON.stringify(images),
    published,
    order,
    featured,
    beforeImage,
    afterImage,
    isTransformation,
    now,
    id,
  )

  return getProjectById(id)
}

export function deleteProjectById(id) {
  db.prepare(`DELETE FROM projects WHERE id = ?`).run(id)
}

// Gallery items database methods
function mapGalleryRow(row) {
  if (!row) return null
  return {
    id: row.id,
    src: row.src,
    alt: row.alt,
    collection: row.collection || 'General',
    tall: Boolean(row.tall),
    order: typeof row.sort_order === 'number' ? row.sort_order : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function getAllGalleryItems() {
  const rows = db.prepare(`SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC`).all()
  return rows.map(mapGalleryRow)
}

export function getGalleryItemById(id) {
  const row = db.prepare(`SELECT * FROM gallery_items WHERE id = ?`).get(id)
  return mapGalleryRow(row)
}

export function insertGalleryItem(data) {
  const src = sanitize(data.src)
  const alt = sanitize(data.alt)
  const collection = sanitize(data.collection) || 'General'
  const tall = data.tall ? 1 : 0
  const order = typeof data.order === 'number' ? data.order : 0

  if (!src) throw new Error('Gallery image URL is required.')
  if (!alt) throw new Error('Alt text is required.')

  const id = data.id || 'gal_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO gallery_items (id, src, alt, collection, tall, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, src, alt, collection, tall, order, now, now)

  return getGalleryItemById(id)
}

export function updateGalleryItemById(id, data) {
  const existing = getGalleryItemById(id)
  if (!existing) throw new Error(`Gallery item "${id}" not found.`)

  const src = data.src !== undefined ? sanitize(data.src) : existing.src
  const alt = data.alt !== undefined ? sanitize(data.alt) : existing.alt
  const collection = data.collection !== undefined ? sanitize(data.collection) : existing.collection
  const tall = data.tall !== undefined ? (data.tall ? 1 : 0) : (existing.tall ? 1 : 0)
  const order = data.order !== undefined && typeof data.order === 'number' ? data.order : existing.order
  const now = new Date().toISOString()

  db.prepare(`
    UPDATE gallery_items
    SET src = ?, alt = ?, collection = ?, tall = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(src, alt, collection, tall, order, now, id)

  return getGalleryItemById(id)
}

export function deleteGalleryItemById(id) {
  db.prepare(`DELETE FROM gallery_items WHERE id = ?`).run(id)
}

// Craftsmanship database methods
function mapCraftsmanshipRow(row) {
  if (!row) return null
  return {
    id: row.id,
    discipline: row.discipline,
    material: row.material,
    title: row.title,
    caption: row.caption,
    provenance: row.provenance || '',
    finish: row.finish || '',
    image: row.image,
    aspectRatio: row.aspect_ratio || 'aspect-4/3',
    published: Boolean(row.published),
    order: typeof row.sort_order === 'number' ? row.sort_order : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function getAllCraftsmanshipItems() {
  const rows = db.prepare(`SELECT * FROM craftsmanship_items ORDER BY sort_order ASC, created_at DESC`).all()
  return rows.map(mapCraftsmanshipRow)
}

export function getCraftsmanshipItemById(id) {
  const row = db.prepare(`SELECT * FROM craftsmanship_items WHERE id = ?`).get(id)
  return mapCraftsmanshipRow(row)
}

export function insertCraftsmanshipItem(data) {
  const discipline = sanitize(data.discipline) || 'Artisanal Craft'
  const material = sanitize(data.material) || 'Bespoke Material'
  const title = sanitize(data.title) || 'Architectural Detail'
  const caption = typeof data.caption === 'string' ? data.caption.trim() : ''
  const provenance = sanitize(data.provenance) || 'Master Artisans'
  const finish = sanitize(data.finish) || 'Hand-Crafted'
  const image = typeof data.image === 'string' ? data.image.trim() : '/images/after-living-room.jpg'
  const aspectRatio = data.aspectRatio || 'aspect-4/3'
  const published = data.published === false ? 0 : 1
  const order = typeof data.order === 'number' ? data.order : 0

  if (!title) throw new Error('Title is required.')

  const id = data.id || 'craft_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO craftsmanship_items (
      id, discipline, material, title, caption, provenance, finish,
      image, aspect_ratio, published, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    discipline,
    material,
    title,
    caption,
    provenance,
    finish,
    image,
    aspectRatio,
    published,
    order,
    now,
    now,
  )

  return getCraftsmanshipItemById(id)
}

export function updateCraftsmanshipItemById(id, data) {
  const existing = getCraftsmanshipItemById(id)
  if (!existing) throw new Error(`Craftsmanship item "${id}" not found.`)

  const discipline = data.discipline !== undefined ? sanitize(data.discipline) : existing.discipline
  const material = data.material !== undefined ? sanitize(data.material) : existing.material
  const title = data.title !== undefined ? sanitize(data.title) : existing.title
  const caption = data.caption !== undefined ? (typeof data.caption === 'string' ? data.caption.trim() : '') : existing.caption
  const provenance = data.provenance !== undefined ? sanitize(data.provenance) : existing.provenance
  const finish = data.finish !== undefined ? sanitize(data.finish) : existing.finish
  const image = data.image !== undefined ? (typeof data.image === 'string' ? data.image.trim() : '') : existing.image
  const aspectRatio = data.aspectRatio !== undefined ? data.aspectRatio : existing.aspectRatio
  const published = data.published !== undefined ? (data.published ? 1 : 0) : (existing.published ? 1 : 0)
  const order = data.order !== undefined && typeof data.order === 'number' ? data.order : existing.order
  const now = new Date().toISOString()

  db.prepare(`
    UPDATE craftsmanship_items
    SET discipline = ?, material = ?, title = ?, caption = ?, provenance = ?, finish = ?,
        image = ?, aspect_ratio = ?, published = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    discipline,
    material,
    title,
    caption,
    provenance,
    finish,
    image,
    aspectRatio,
    published,
    order,
    now,
    id,
  )

  return getCraftsmanshipItemById(id)
}

export function deleteCraftsmanshipItemById(id) {
  db.prepare(`DELETE FROM craftsmanship_items WHERE id = ?`).run(id)
}

// Craftsmanship / Site Settings KV store
export function getSiteSetting(key) {
  const row = db.prepare(`SELECT value FROM site_settings_kv WHERE key = ?`).get(key)
  if (!row) return null
  try {
    return JSON.parse(row.value)
  } catch {
    return row.value
  }
}

export function setSiteSetting(key, value) {
  const valStr = typeof value === 'string' ? value : JSON.stringify(value)
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO site_settings_kv (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, valStr, now)
  return getSiteSetting(key)
}

// Password hashing and verification helpers
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false
  }
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) return false
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'))
}

// Ensure initial admin user exists in DB
export function getOrCreateDefaultAdmin(defaultEmail = 'ajay123@gmail.com', defaultPassword = '1234') {
  const existing = db.prepare(`SELECT * FROM admin_users LIMIT 1`).get()
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at,
    }
  }

  const id = 'admin_primary'
  const email = defaultEmail.trim().toLowerCase()
  const passwordHash = hashPassword(defaultPassword)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO admin_users (id, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, email, passwordHash, now, now)

  return { id, email, createdAt: now, updatedAt: now }
}

// Authenticate admin user
export function authenticateAdmin(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase()
  getOrCreateDefaultAdmin()

  const user = db.prepare(`SELECT * FROM admin_users WHERE email = ? LIMIT 1`).get(normalizedEmail)
  if (!user) {
    return null
  }

  const isValid = verifyPassword(password, user.password_hash)
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

// Get admin profile
export function getAdminUser() {
  getOrCreateDefaultAdmin()
  const user = db.prepare(`SELECT id, email, created_at, updated_at FROM admin_users LIMIT 1`).get()
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

// Update admin credentials
export function updateAdminCredentials({ currentPassword, newEmail, newPassword }) {
  getOrCreateDefaultAdmin()
  const user = db.prepare(`SELECT * FROM admin_users LIMIT 1`).get()
  if (!user) {
    throw new Error('Admin account not found.')
  }

  // 1. Verify current password
  const isValid = verifyPassword(currentPassword, user.password_hash)
  if (!isValid) {
    throw new Error('Current password is incorrect.')
  }

  // 2. Prepare new fields
  const now = new Date().toISOString()
  let updatedEmail = user.email
  let updatedHash = user.password_hash

  if (newEmail && typeof newEmail === 'string' && newEmail.trim()) {
    const emailCandidate = newEmail.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailCandidate)) {
      throw new Error('Invalid new email format.')
    }
    updatedEmail = emailCandidate
  }

  if (newPassword && typeof newPassword === 'string' && newPassword.trim()) {
    if (newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters.')
    }
    updatedHash = hashPassword(newPassword)
  }

  db.prepare(`
    UPDATE admin_users
    SET email = ?, password_hash = ?, updated_at = ?
    WHERE id = ?
  `).run(updatedEmail, updatedHash, now, user.id)

  return {
    id: user.id,
    email: updatedEmail,
    updatedAt: now,
  }
}

export function getStats() {
  const totalMsgs = db.prepare(`SELECT count(*) as count FROM contact_messages`).get().count
  const unreadMsgs = db.prepare(`SELECT count(*) as count FROM contact_messages WHERE read = 0`).get().count
  const totalProjects = db.prepare(`SELECT count(*) as count FROM projects`).get().count
  const totalGallery = db.prepare(`SELECT count(*) as count FROM gallery_items`).get().count
  return {
    messages: totalMsgs,
    unreadMessages: unreadMsgs,
    projects: totalProjects,
    gallery: totalGallery,
  }
}
