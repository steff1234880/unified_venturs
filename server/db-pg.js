import pg from 'pg'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production'

export const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('render.com')
    ? { rejectUnauthorized: false }
    : (isProduction && !connectionString?.includes('localhost') ? { rejectUnauthorized: false } : false),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Hashing helpers matching existing scrypt format (salt:derivedKey)
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
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(keyBuffer, derivedKey)
}

export function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str.trim()
}

/**
 * Initializes the PostgreSQL schema and seeds initial data idempotently.
 */
export async function initPostgresSchema() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. admin_users
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    `)

    // 2. contact_messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(64) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        project_type VARCHAR(100) DEFAULT '',
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
    `)

    // 3. projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        year VARCHAR(20) DEFAULT '2024',
        area VARCHAR(100) DEFAULT '—',
        image TEXT NOT NULL,
        description TEXT DEFAULT '',
        images JSONB DEFAULT '[]'::jsonb,
        published BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        before_image TEXT DEFAULT '',
        after_image TEXT DEFAULT '',
        is_transformation BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
      CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published, sort_order);
      CREATE INDEX IF NOT EXISTS idx_projects_transformation ON projects(is_transformation, published);
    `)

    // 4. gallery_items
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id VARCHAR(64) PRIMARY KEY,
        src TEXT NOT NULL,
        alt VARCHAR(255) NOT NULL,
        collection VARCHAR(100) DEFAULT 'General',
        tall BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_gallery_items_sort ON gallery_items(sort_order, created_at);
      CREATE INDEX IF NOT EXISTS idx_gallery_items_collection ON gallery_items(collection);
    `)

    // 5. craftsmanship_items
    await client.query(`
      CREATE TABLE IF NOT EXISTS craftsmanship_items (
        id VARCHAR(64) PRIMARY KEY,
        discipline VARCHAR(100) NOT NULL,
        material VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        provenance VARCHAR(255) DEFAULT '',
        finish VARCHAR(255) DEFAULT '',
        image TEXT NOT NULL,
        aspect_ratio VARCHAR(50) DEFAULT 'aspect-4/3',
        published BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_craftsmanship_sort ON craftsmanship_items(sort_order, created_at);
      CREATE INDEX IF NOT EXISTS idx_craftsmanship_published ON craftsmanship_items(published);
    `)

    // 6. site_settings_kv
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings_kv (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    // 7. notes (Notepad module)
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) DEFAULT '',
        project_name VARCHAR(255) DEFAULT '',
        subject VARCHAR(255) DEFAULT '',
        date VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'work',
        pinned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned, created_at DESC);
    `)

    // 8. invoices (Invoice Management module)
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(64) PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        invoice_date VARCHAR(20) NOT NULL,
        due_date VARCHAR(20) DEFAULT '',
        status VARCHAR(50) NOT NULL DEFAULT 'issued',
        client_name VARCHAR(255) NOT NULL,
        client_company VARCHAR(255) DEFAULT '',
        client_email VARCHAR(255) DEFAULT '',
        client_phone VARCHAR(50) DEFAULT '',
        client_address TEXT NOT NULL DEFAULT '',
        client_gstin VARCHAR(50) DEFAULT '',
        client_state VARCHAR(100) DEFAULT 'Karnataka',
        client_state_code VARCHAR(10) DEFAULT '29',
        place_of_supply VARCHAR(100) DEFAULT 'Karnataka (29)',
        place_of_supply_state_code VARCHAR(10) DEFAULT '29',
        is_inter_state BOOLEAN NOT NULL DEFAULT FALSE,
        project_name VARCHAR(255) DEFAULT '',
        po_number VARCHAR(100) DEFAULT '',
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        taxable_subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_cgst NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_sgst NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_igst NUMERIC(12, 2) NOT NULL DEFAULT 0,
        grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
        round_off NUMERIC(8, 2) DEFAULT 0,
        amount_in_words TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        bank_details JSONB DEFAULT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
      CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    `)

    await client.query('COMMIT')
    console.log('[PostgreSQL] Database schema initialized successfully.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[PostgreSQL] Error initializing schema:', err)
    throw err
  } finally {
    client.release()
  }
}

/**
 * Migrates data from local SQLite/backup into PostgreSQL if tables are empty.
 */
export async function migrateFromLocalStore() {
  const client = await pool.connect()
  try {
    // 1. Admin Users
    const adminCheck = await client.query('SELECT COUNT(*) FROM admin_users')
    const targetEmail = (process.env.ADMIN_EMAIL || 'ajayunified@gmail.com').trim().toLowerCase()
    const envPassword = process.env.ADMIN_PASSWORD
    const id = 'admin_primary'

    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      let passwordHash
      if (envPassword && envPassword.trim()) {
        passwordHash = hashPassword(envPassword.trim())
      } else {
        // Carry over exact verified existing admin password hash from local store
        passwordHash = '6d8c5bd0603386c2f0eff13edd640c90:9b12ca52efb484574e7e98a0159beeb8babcce5ebddba0b3adddedfa04aaae81bfd5b710799e76f982cfc960c81e658dbe95b9082d3888df603a3e153009121d'
      }

      await client.query(
        'INSERT INTO admin_users (id, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT (id) DO NOTHING',
        [id, targetEmail, passwordHash]
      )
      console.log(`[PostgreSQL Migration] Admin user created (${targetEmail}).`)
    } else if (envPassword && envPassword.trim()) {
      // If an explicit ADMIN_PASSWORD environment variable was configured in Render Dashboard,
      // update the admin password hash so the configured credentials immediately work
      const newHash = hashPassword(envPassword.trim())
      await client.query(
        'UPDATE admin_users SET password_hash = $1, email = $2, updated_at = NOW() WHERE id = $3 OR LOWER(email) = $2',
        [newHash, targetEmail, id]
      )
      console.log(`[PostgreSQL Migration] Admin credentials synchronized from environment for (${targetEmail}).`)
    }

    // 2. Projects
    const projectsCheck = await client.query('SELECT COUNT(*) FROM projects')
    if (parseInt(projectsCheck.rows[0].count, 10) === 0) {
      const defaultProjects = [
        {
          id: 'proj_prestige_park_square',
          title: 'Prestige Park Square',
          location: 'Bengaluru, Karnataka',
          category: 'Completed Residence',
          year: '2024',
          area: 'Bengaluru',
          image: '/images/after-living-room.jpg',
          description: 'Completed bespoke residence in Prestige Park Square, Bengaluru. Features custom architectural joinery, organic stone textures, and tailored modern luxury.',
          images: JSON.stringify([
            '/images/after-living-room.jpg',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
          ]),
          published: true,
          sort_order: 0,
          featured: true,
          before_image: '/images/before-living-room.jpg',
          after_image: '/images/after-living-room.jpg',
          is_transformation: true,
        },
        {
          id: 'proj_kolte_patil_i_towers',
          title: 'Kolte Patil i-Towers',
          location: 'Bengaluru, Karnataka',
          category: 'Completed Residence',
          year: '2024',
          area: 'Bengaluru',
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
          description: 'Turnkey residence completed in Kolte Patil i-Towers, Bengaluru. Contemporary urban interiors elevated with refined materials and ambient illumination.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
          ]),
          published: true,
          sort_order: 1,
          featured: false,
          before_image: '/images/before-living-room.jpg',
          after_image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
          is_transformation: true,
        },
        {
          id: 'proj_brigade_cornerstone_utopia',
          title: 'Brigade Cornerstone Utopia',
          location: 'Bengaluru, Karnataka',
          category: 'Completed Residence',
          year: '2024',
          area: 'Bengaluru',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
          description: 'Curated interior transformation in Brigade Cornerstone Utopia, Bengaluru. Tactile artisanal finishes dialogue with contemporary spatial flow.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
          ]),
          published: true,
          sort_order: 2,
          featured: false,
          before_image: '/images/before-living-room.jpg',
          after_image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
          is_transformation: true,
        },
        {
          id: 'proj_bren_zahara',
          title: 'Bren Zahara',
          location: 'Bengaluru, Karnataka',
          category: 'Completed Residence',
          year: '2024',
          area: 'Bengaluru',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          description: 'Bespoke residential interior in Bren Zahara, Bengaluru. Handcrafted wall panelling, bespoke hardware, and quiet understated elegance.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
          ]),
          published: true,
          sort_order: 3,
          featured: false,
          before_image: '/images/before-living-room.jpg',
          after_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          is_transformation: true,
        },
        {
          id: 'proj_alpine_viva',
          title: 'Alpine Viva',
          location: 'Bengaluru, Karnataka',
          category: 'Completed Residence',
          year: '2024',
          area: 'Bengaluru',
          image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
          description: 'Sophisticated interior craftsmanship executed for residence in Alpine Viva, Bengaluru. Warm natural woods, silk-honed stone, and tranquil palette.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          ]),
          published: true,
          sort_order: 4,
          featured: false,
          before_image: '/images/before-living-room.jpg',
          after_image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
          is_transformation: true,
        },
      ]

      for (const p of defaultProjects) {
        await client.query(`
          INSERT INTO projects (
            id, title, location, category, year, area, image, description,
            images, published, sort_order, featured, before_image, after_image, is_transformation,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [
          p.id, p.title, p.location, p.category, p.year, p.area, p.image, p.description,
          p.images, p.published, p.sort_order, p.featured, p.before_image, p.after_image, p.is_transformation
        ])
      }
      console.log('[PostgreSQL Migration] Seeded default projects.')
    }

    // 3. Gallery Items
    const galleryCheck = await client.query('SELECT COUNT(*) FROM gallery_items')
    if (parseInt(galleryCheck.rows[0].count, 10) === 0) {
      const defaultGallery = [
        { id: 'gal_1', src: '/images/after-living-room.jpg', alt: 'Prestige Park Square bespoke living area', collection: 'Living', tall: false, sort_order: 0 },
        { id: 'gal_2', src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', alt: 'Kolte Patil i-Towers dining space', collection: 'Dining', tall: true, sort_order: 1 },
        { id: 'gal_3', src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', alt: 'Brigade Cornerstone Utopia master suite', collection: 'Bedroom', tall: false, sort_order: 2 },
        { id: 'gal_4', src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', alt: 'Bren Zahara custom wall panelling', collection: 'Details', tall: false, sort_order: 3 },
        { id: 'gal_5', src: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80', alt: 'Alpine Viva architectural lounge', collection: 'Lounge', tall: true, sort_order: 4 },
      ]
      for (const g of defaultGallery) {
        await client.query(`
          INSERT INTO gallery_items (id, src, alt, collection, tall, sort_order, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [g.id, g.src, g.alt, g.collection, g.tall, g.sort_order])
      }
      console.log('[PostgreSQL Migration] Seeded default gallery items.')
    }

    // 4. Craftsmanship Items
    const craftCheck = await client.query('SELECT COUNT(*) FROM craftsmanship_items')
    if (parseInt(craftCheck.rows[0].count, 10) === 0) {
      const defaultCraft = [
        {
          id: 'craft_1',
          discipline: 'Stone & Surface',
          material: 'Italian Travertine',
          title: 'Honed Navona Monolith',
          caption: 'Hand-selected Roman travertine blocks, water-jet cut and hand-honed to a tactile matte finish that deepens with age.',
          provenance: 'Tivoli, Italy',
          finish: 'Silk-honed matte',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          aspect_ratio: 'aspect-4/3',
          published: true,
          sort_order: 0,
        },
        {
          id: 'craft_2',
          discipline: 'Fine Woodwork',
          material: 'Burmese Teak',
          title: 'Fluted Acoustic Joinery',
          caption: 'Quarter-sawn teak ribs configured with hidden sound-absorbing cavities, creating quiet, sculptural wall architecture.',
          provenance: 'Sustainably salvaged, Central Highlands',
          finish: 'Natural oil & beeswax',
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
          aspect_ratio: 'aspect-3/4',
          published: true,
          sort_order: 1,
        },
        {
          id: 'craft_3',
          discipline: 'Metalwork',
          material: 'Aged Patinated Brass',
          title: 'Seamless Portal Surrounds',
          caption: 'Cold-forged unlacquered brass hand-rubbed with liver of sulfur to create living patinas that interact with interior light.',
          provenance: 'Artisanal foundry, Moradabad',
          finish: 'Hand-rubbed living patina',
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
          aspect_ratio: 'aspect-4/3',
          published: true,
          sort_order: 2,
        },
        {
          id: 'craft_4',
          discipline: 'Architectural Glazing',
          material: 'Low-Iron Fluted Glass',
          title: 'Spatial Light Diffusers',
          caption: 'Micro-ribbed acoustic laminate that admits diffused natural illumination while preserving absolute acoustic isolation.',
          provenance: 'Murano, Italy',
          finish: 'Linear reeded texture',
          image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
          aspect_ratio: 'aspect-3/4',
          published: true,
          sort_order: 3,
        },
      ]
      for (const c of defaultCraft) {
        await client.query(`
          INSERT INTO craftsmanship_items (
            id, discipline, material, title, caption, provenance, finish, image, aspect_ratio, published, sort_order, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [c.id, c.discipline, c.material, c.title, c.caption, c.provenance, c.finish, c.image, c.aspect_ratio, c.published, c.sort_order])
      }
      console.log('[PostgreSQL Migration] Seeded default craftsmanship items.')
    }

    // 5. Notes & 6. Invoices: Kept clean with no demo data seeded
  } catch (err) {
    console.error('[PostgreSQL Migration] Migration error:', err)
  } finally {
    client.release()
  }
}

// ---------------------------------------------------------------------------
// Model Operations for API (PostgreSQL implementation)
// ---------------------------------------------------------------------------

// Authentication
export async function getAdminUser() {
  const { rows } = await pool.query('SELECT id, email, created_at, updated_at FROM admin_users LIMIT 1')
  if (!rows[0]) return null
  return {
    id: rows[0].id,
    email: rows[0].email,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
  }
}

export async function authenticateAdmin(email, password) {
  const normalized = email.trim().toLowerCase()
  const { rows } = await pool.query('SELECT * FROM admin_users WHERE LOWER(email) = $1 LIMIT 1', [normalized])
  if (!rows[0]) {
    console.warn(`[Auth Diagnostic] Login attempt failed: No admin user found for email [${normalized}]`)
    return null
  }
  const user = rows[0]
  const isValid = verifyPassword(password, user.password_hash)
  if (!isValid) {
    console.warn(`[Auth Diagnostic] Login attempt failed: Password verification failed for admin [${normalized}]. Hash format valid: ${Boolean(user.password_hash?.includes(':'))}`)
    return null
  }
  console.log(`[Auth Diagnostic] Admin login successful for [${normalized}]`)
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

export async function updateAdminCredentials(currentPassword, newEmail, newPassword) {
  const { rows } = await pool.query('SELECT * FROM admin_users LIMIT 1')
  if (!rows[0]) throw new Error('Admin user not found.')
  const user = rows[0]

  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw new Error('Current password is incorrect.')
  }

  let finalEmail = user.email
  let finalHash = user.password_hash

  if (newEmail && typeof newEmail === 'string' && newEmail.trim()) {
    const norm = newEmail.trim().toLowerCase()
    if (!norm.includes('@') || !norm.includes('.')) {
      throw new Error('Invalid email format.')
    }
    finalEmail = norm
  }

  if (newPassword && typeof newPassword === 'string' && newPassword.trim()) {
    if (newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters.')
    }
    finalHash = hashPassword(newPassword)
  }

  const result = await pool.query(`
    UPDATE admin_users
    SET email = $1, password_hash = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, email, created_at, updated_at
  `, [finalEmail, finalHash, user.id])

  return {
    id: result.rows[0].id,
    email: result.rows[0].email,
    createdAt: result.rows[0].created_at,
    updatedAt: result.rows[0].updated_at,
  }
}

// Contact Messages
export async function insertMessage(msg) {
  const id = msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const result = await pool.query(`
    INSERT INTO contact_messages (id, first_name, last_name, email, phone, project_type, message, read, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *
  `, [id, sanitize(msg.firstName), sanitize(msg.lastName), sanitize(msg.email).toLowerCase(), sanitize(msg.phone), sanitize(msg.projectType), sanitize(msg.message), msg.read || false])
  return formatMessage(result.rows[0])
}

export async function getAllMessages() {
  const { rows } = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC')
  return rows.map(formatMessage)
}

export async function updateMessageRead(id, read) {
  const { rows } = await pool.query(`
    UPDATE contact_messages
    SET read = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [Boolean(read), id])
  if (!rows[0]) return null
  return formatMessage(rows[0])
}

export async function deleteMessageById(id) {
  const result = await pool.query('DELETE FROM contact_messages WHERE id = $1', [id])
  return result.rowCount > 0
}

function formatMessage(r) {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone || '',
    projectType: r.project_type || '',
    message: r.message,
    read: Boolean(r.read),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// Projects
export async function getAllProjects() {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC')
  return rows.map(formatProject)
}

export async function getProjectById(id) {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
  return rows[0] ? formatProject(rows[0]) : null
}

export async function insertProject(p) {
  const id = p.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const images = Array.isArray(p.images) ? JSON.stringify(p.images) : (p.images || '[]')
  const { rows } = await pool.query(`
    INSERT INTO projects (
      id, title, location, category, year, area, image, description, images,
      published, sort_order, featured, before_image, after_image, is_transformation,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
    RETURNING *
  `, [
    id, sanitize(p.title), sanitize(p.location), sanitize(p.category), sanitize(p.year) || '2024',
    sanitize(p.area) || '—', p.image, sanitize(p.description), images,
    p.published !== false, p.order || p.sort_order || 0, Boolean(p.featured),
    p.beforeImage || p.before_image || '', p.afterImage || p.after_image || '',
    Boolean(p.isTransformation || p.is_transformation)
  ])
  return formatProject(rows[0])
}

export async function updateProjectById(id, p) {
  const current = await getProjectById(id)
  if (!current) return null
  const images = Array.isArray(p.images) ? JSON.stringify(p.images) : (p.images !== undefined ? p.images : JSON.stringify(current.images))
  const { rows } = await pool.query(`
    UPDATE projects
    SET title = $1, location = $2, category = $3, year = $4, area = $5, image = $6,
        description = $7, images = $8, published = $9, sort_order = $10, featured = $11,
        before_image = $12, after_image = $13, is_transformation = $14, updated_at = NOW()
    WHERE id = $15
    RETURNING *
  `, [
    p.title !== undefined ? sanitize(p.title) : current.title,
    p.location !== undefined ? sanitize(p.location) : current.location,
    p.category !== undefined ? sanitize(p.category) : current.category,
    p.year !== undefined ? sanitize(p.year) : current.year,
    p.area !== undefined ? sanitize(p.area) : current.area,
    p.image !== undefined ? p.image : current.image,
    p.description !== undefined ? sanitize(p.description) : current.description,
    images,
    p.published !== undefined ? Boolean(p.published) : current.published,
    p.order !== undefined ? Number(p.order) : (p.sort_order !== undefined ? Number(p.sort_order) : current.order),
    p.featured !== undefined ? Boolean(p.featured) : current.featured,
    p.beforeImage !== undefined ? p.beforeImage : (p.before_image !== undefined ? p.before_image : current.beforeImage),
    p.afterImage !== undefined ? p.afterImage : (p.after_image !== undefined ? p.after_image : current.afterImage),
    p.isTransformation !== undefined ? Boolean(p.isTransformation) : (p.is_transformation !== undefined ? Boolean(p.is_transformation) : current.isTransformation),
    id
  ])
  return formatProject(rows[0])
}

export async function deleteProjectById(id) {
  const res = await pool.query('DELETE FROM projects WHERE id = $1', [id])
  return res.rowCount > 0
}

function formatProject(r) {
  let images = []
  try {
    images = typeof r.images === 'string' ? JSON.parse(r.images) : (Array.isArray(r.images) ? r.images : [])
  } catch {
    images = []
  }
  return {
    id: r.id,
    title: r.title,
    location: r.location,
    category: r.category,
    year: r.year,
    area: r.area,
    image: r.image,
    description: r.description || '',
    images,
    published: Boolean(r.published),
    order: r.sort_order || 0,
    featured: Boolean(r.featured),
    beforeImage: r.before_image || '',
    afterImage: r.after_image || '',
    isTransformation: Boolean(r.is_transformation),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// Gallery Items
export async function getAllGalleryItems() {
  const { rows } = await pool.query('SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC')
  return rows.map(formatGallery)
}

export async function getGalleryItemById(id) {
  const { rows } = await pool.query('SELECT * FROM gallery_items WHERE id = $1', [id])
  return rows[0] ? formatGallery(rows[0]) : null
}

export async function insertGalleryItem(g) {
  const id = g.id || `gal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const { rows } = await pool.query(`
    INSERT INTO gallery_items (id, src, alt, collection, tall, sort_order, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *
  `, [id, g.src, sanitize(g.alt), sanitize(g.collection) || 'General', Boolean(g.tall), g.order || g.sort_order || 0])
  return formatGallery(rows[0])
}

export async function updateGalleryItemById(id, g) {
  const current = await getGalleryItemById(id)
  if (!current) return null
  const { rows } = await pool.query(`
    UPDATE gallery_items
    SET src = $1, alt = $2, collection = $3, tall = $4, sort_order = $5, updated_at = NOW()
    WHERE id = $6
    RETURNING *
  `, [
    g.src !== undefined ? g.src : current.src,
    g.alt !== undefined ? sanitize(g.alt) : current.alt,
    g.collection !== undefined ? sanitize(g.collection) : current.collection,
    g.tall !== undefined ? Boolean(g.tall) : current.tall,
    g.order !== undefined ? Number(g.order) : (g.sort_order !== undefined ? Number(g.sort_order) : current.order),
    id
  ])
  return formatGallery(rows[0])
}

export async function deleteGalleryItemById(id) {
  const res = await pool.query('DELETE FROM gallery_items WHERE id = $1', [id])
  return res.rowCount > 0
}

function formatGallery(r) {
  return {
    id: r.id,
    src: r.src,
    alt: r.alt,
    collection: r.collection,
    tall: Boolean(r.tall),
    order: r.sort_order || 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// Craftsmanship Items
export async function getAllCraftsmanshipItems() {
  const { rows } = await pool.query('SELECT * FROM craftsmanship_items ORDER BY sort_order ASC, created_at DESC')
  return rows.map(formatCraft)
}

export async function getCraftsmanshipItemById(id) {
  const { rows } = await pool.query('SELECT * FROM craftsmanship_items WHERE id = $1', [id])
  return rows[0] ? formatCraft(rows[0]) : null
}

export async function insertCraftsmanshipItem(c) {
  const id = c.id || `craft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const { rows } = await pool.query(`
    INSERT INTO craftsmanship_items (
      id, discipline, material, title, caption, provenance, finish, image, aspect_ratio, published, sort_order, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *
  `, [
    id, sanitize(c.discipline), sanitize(c.material), sanitize(c.title), sanitize(c.caption),
    sanitize(c.provenance), sanitize(c.finish), c.image, c.aspectRatio || c.aspect_ratio || 'aspect-4/3',
    c.published !== false, c.order || c.sort_order || 0
  ])
  return formatCraft(rows[0])
}

export async function updateCraftsmanshipItemById(id, c) {
  const current = await getCraftsmanshipItemById(id)
  if (!current) return null
  const { rows } = await pool.query(`
    UPDATE craftsmanship_items
    SET discipline = $1, material = $2, title = $3, caption = $4, provenance = $5,
        finish = $6, image = $7, aspect_ratio = $8, published = $9, sort_order = $10, updated_at = NOW()
    WHERE id = $11
    RETURNING *
  `, [
    c.discipline !== undefined ? sanitize(c.discipline) : current.discipline,
    c.material !== undefined ? sanitize(c.material) : current.material,
    c.title !== undefined ? sanitize(c.title) : current.title,
    c.caption !== undefined ? sanitize(c.caption) : current.caption,
    c.provenance !== undefined ? sanitize(c.provenance) : current.provenance,
    c.finish !== undefined ? sanitize(c.finish) : current.finish,
    c.image !== undefined ? c.image : current.image,
    c.aspectRatio !== undefined ? c.aspectRatio : (c.aspect_ratio !== undefined ? c.aspect_ratio : current.aspectRatio),
    c.published !== undefined ? Boolean(c.published) : current.published,
    c.order !== undefined ? Number(c.order) : (c.sort_order !== undefined ? Number(c.sort_order) : current.order),
    id
  ])
  return formatCraft(rows[0])
}

export async function deleteCraftsmanshipItemById(id) {
  const res = await pool.query('DELETE FROM craftsmanship_items WHERE id = $1', [id])
  return res.rowCount > 0
}

function formatCraft(r) {
  return {
    id: r.id,
    discipline: r.discipline,
    material: r.material,
    title: r.title,
    caption: r.caption,
    provenance: r.provenance || '',
    finish: r.finish || '',
    image: r.image,
    aspectRatio: r.aspect_ratio || 'aspect-4/3',
    published: Boolean(r.published),
    order: r.sort_order || 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// Site Settings
export async function getSiteSetting(key) {
  const { rows } = await pool.query('SELECT value FROM site_settings_kv WHERE key = $1', [key])
  if (!rows[0]) return null
  return rows[0].value
}

export async function setSiteSetting(key, value) {
  const valJson = typeof value === 'string' ? value : JSON.stringify(value)
  const { rows } = await pool.query(`
    INSERT INTO site_settings_kv (key, value, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
    RETURNING value
  `, [key, valJson])
  return rows[0].value
}

// Notes (Notepad module)
export async function getAllNotes() {
  const { rows } = await pool.query('SELECT * FROM notes ORDER BY pinned DESC, created_at DESC')
  return rows.map(formatNote)
}

export async function insertNote(n) {
  const id = n.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const { rows } = await pool.query(`
    INSERT INTO notes (
      id, title, client_name, project_name, subject, date, content, category, pinned, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *
  `, [
    id, sanitize(n.title), sanitize(n.clientName), sanitize(n.projectName),
    sanitize(n.subject), n.date || new Date().toISOString().slice(0, 10),
    n.content || '', n.category || 'work', Boolean(n.pinned)
  ])
  return formatNote(rows[0])
}

export async function updateNoteById(id, n) {
  const { rows } = await pool.query(`
    UPDATE notes
    SET title = COALESCE($1, title),
        client_name = COALESCE($2, client_name),
        project_name = COALESCE($3, project_name),
        subject = COALESCE($4, subject),
        date = COALESCE($5, date),
        content = COALESCE($6, content),
        category = COALESCE($7, category),
        pinned = COALESCE($8, pinned),
        updated_at = NOW()
    WHERE id = $9
    RETURNING *
  `, [
    n.title !== undefined ? sanitize(n.title) : null,
    n.clientName !== undefined ? sanitize(n.clientName) : null,
    n.projectName !== undefined ? sanitize(n.projectName) : null,
    n.subject !== undefined ? sanitize(n.subject) : null,
    n.date !== undefined ? n.date : null,
    n.content !== undefined ? n.content : null,
    n.category !== undefined ? n.category : null,
    n.pinned !== undefined ? Boolean(n.pinned) : null,
    id
  ])
  if (!rows[0]) return null
  return formatNote(rows[0])
}

export async function deleteNoteById(id) {
  const res = await pool.query('DELETE FROM notes WHERE id = $1', [id])
  return res.rowCount > 0
}

function formatNote(r) {
  return {
    id: r.id,
    title: r.title,
    clientName: r.client_name || '',
    projectName: r.project_name || '',
    subject: r.subject || '',
    date: r.date,
    content: r.content,
    category: r.category,
    pinned: Boolean(r.pinned),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// Invoices (Invoice Management module)
export async function getAllInvoices() {
  const { rows } = await pool.query('SELECT * FROM invoices ORDER BY invoice_date DESC, created_at DESC')
  return rows.map(formatInvoice)
}

export async function getInvoiceById(id) {
  const { rows } = await pool.query('SELECT * FROM invoices WHERE id = $1', [id])
  return rows[0] ? formatInvoice(rows[0]) : null
}

export async function insertInvoice(inv) {
  const id = inv.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const items = Array.isArray(inv.items) ? JSON.stringify(inv.items) : (inv.items || '[]')
  const bankDetails = inv.bankDetails ? JSON.stringify(inv.bankDetails) : null
  const { rows } = await pool.query(`
    INSERT INTO invoices (
      id, invoice_number, invoice_date, due_date, status, client_name, client_company,
      client_email, client_phone, client_address, client_gstin, client_state, client_state_code,
      place_of_supply, place_of_supply_state_code, is_inter_state, project_name, po_number,
      items, taxable_subtotal, total_cgst, total_sgst, total_igst, grand_total, round_off,
      amount_in_words, notes, bank_details, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
      $19::jsonb, $20, $21, $22, $23, $24, $25, $26, $27, $28::jsonb, NOW(), NOW()
    ) RETURNING *
  `, [
    id, sanitize(inv.invoiceNumber), inv.invoiceDate, inv.dueDate || '', inv.status || 'issued',
    sanitize(inv.clientName), sanitize(inv.clientCompany), sanitize(inv.clientEmail), sanitize(inv.clientPhone),
    sanitize(inv.clientAddress), sanitize(inv.clientGstin), sanitize(inv.clientState) || 'Karnataka',
    sanitize(inv.clientStateCode) || '29', sanitize(inv.placeOfSupply) || 'Karnataka (29)',
    sanitize(inv.placeOfSupplyStateCode) || '29', Boolean(inv.isInterState), sanitize(inv.projectName),
    sanitize(inv.poNumber), items, inv.taxableSubtotal || 0, inv.totalCgst || 0, inv.totalSgst || 0,
    inv.totalIgst || 0, inv.grandTotal || 0, inv.roundOff || 0, inv.amountInWords || '',
    inv.notes || '', bankDetails
  ])
  return formatInvoice(rows[0])
}

export async function updateInvoiceById(id, inv) {
  const current = await getInvoiceById(id)
  if (!current) return null
  const items = inv.items !== undefined ? (Array.isArray(inv.items) ? JSON.stringify(inv.items) : inv.items) : JSON.stringify(current.items)
  const bankDetails = inv.bankDetails !== undefined ? JSON.stringify(inv.bankDetails) : (current.bankDetails ? JSON.stringify(current.bankDetails) : null)

  const { rows } = await pool.query(`
    UPDATE invoices
    SET invoice_number = COALESCE($1, invoice_number),
        invoice_date = COALESCE($2, invoice_date),
        due_date = COALESCE($3, due_date),
        status = COALESCE($4, status),
        client_name = COALESCE($5, client_name),
        client_company = COALESCE($6, client_company),
        client_email = COALESCE($7, client_email),
        client_phone = COALESCE($8, client_phone),
        client_address = COALESCE($9, client_address),
        client_gstin = COALESCE($10, client_gstin),
        client_state = COALESCE($11, client_state),
        client_state_code = COALESCE($12, client_state_code),
        place_of_supply = COALESCE($13, place_of_supply),
        place_of_supply_state_code = COALESCE($14, place_of_supply_state_code),
        is_inter_state = COALESCE($15, is_inter_state),
        project_name = COALESCE($16, project_name),
        po_number = COALESCE($17, po_number),
        items = $18::jsonb,
        taxable_subtotal = COALESCE($19, taxable_subtotal),
        total_cgst = COALESCE($20, total_cgst),
        total_sgst = COALESCE($21, total_sgst),
        total_igst = COALESCE($22, total_igst),
        grand_total = COALESCE($23, grand_total),
        round_off = COALESCE($24, round_off),
        amount_in_words = COALESCE($25, amount_in_words),
        notes = COALESCE($26, notes),
        bank_details = $27::jsonb,
        updated_at = NOW()
    WHERE id = $28
    RETURNING *
  `, [
    inv.invoiceNumber !== undefined ? sanitize(inv.invoiceNumber) : null,
    inv.invoiceDate !== undefined ? inv.invoiceDate : null,
    inv.dueDate !== undefined ? inv.dueDate : null,
    inv.status !== undefined ? inv.status : null,
    inv.clientName !== undefined ? sanitize(inv.clientName) : null,
    inv.clientCompany !== undefined ? sanitize(inv.clientCompany) : null,
    inv.clientEmail !== undefined ? sanitize(inv.clientEmail) : null,
    inv.clientPhone !== undefined ? sanitize(inv.clientPhone) : null,
    inv.clientAddress !== undefined ? sanitize(inv.clientAddress) : null,
    inv.clientGstin !== undefined ? sanitize(inv.clientGstin) : null,
    inv.clientState !== undefined ? sanitize(inv.clientState) : null,
    inv.clientStateCode !== undefined ? sanitize(inv.clientStateCode) : null,
    inv.placeOfSupply !== undefined ? sanitize(inv.placeOfSupply) : null,
    inv.placeOfSupplyStateCode !== undefined ? sanitize(inv.placeOfSupplyStateCode) : null,
    inv.isInterState !== undefined ? Boolean(inv.isInterState) : null,
    inv.projectName !== undefined ? sanitize(inv.projectName) : null,
    inv.poNumber !== undefined ? sanitize(inv.poNumber) : null,
    items,
    inv.taxableSubtotal !== undefined ? Number(inv.taxableSubtotal) : null,
    inv.totalCgst !== undefined ? Number(inv.totalCgst) : null,
    inv.totalSgst !== undefined ? Number(inv.totalSgst) : null,
    inv.totalIgst !== undefined ? Number(inv.totalIgst) : null,
    inv.grandTotal !== undefined ? Number(inv.grandTotal) : null,
    inv.roundOff !== undefined ? Number(inv.roundOff) : null,
    inv.amountInWords !== undefined ? inv.amountInWords : null,
    inv.notes !== undefined ? inv.notes : null,
    bankDetails,
    id
  ])
  return formatInvoice(rows[0])
}

export async function deleteInvoiceById(id) {
  const res = await pool.query('DELETE FROM invoices WHERE id = $1', [id])
  return res.rowCount > 0
}

function formatInvoice(r) {
  let items = []
  try {
    items = typeof r.items === 'string' ? JSON.parse(r.items) : (Array.isArray(r.items) ? r.items : [])
  } catch {
    items = []
  }
  let bankDetails = undefined
  if (r.bank_details) {
    try {
      bankDetails = typeof r.bank_details === 'string' ? JSON.parse(r.bank_details) : r.bank_details
    } catch {}
  }
  return {
    id: r.id,
    invoiceNumber: r.invoice_number,
    invoiceDate: r.invoice_date,
    dueDate: r.due_date || '',
    status: r.status,
    clientName: r.client_name,
    clientCompany: r.client_company || '',
    clientEmail: r.client_email || '',
    clientPhone: r.client_phone || '',
    clientAddress: r.client_address || '',
    clientGstin: r.client_gstin || '',
    clientState: r.client_state || 'Karnataka',
    clientStateCode: r.client_state_code || '29',
    placeOfSupply: r.place_of_supply || 'Karnataka (29)',
    placeOfSupplyStateCode: r.place_of_supply_state_code || '29',
    isInterState: Boolean(r.is_inter_state),
    projectName: r.project_name || '',
    poNumber: r.po_number || '',
    items,
    taxableSubtotal: Number(r.taxable_subtotal || 0),
    totalCgst: Number(r.total_cgst || 0),
    totalSgst: Number(r.total_sgst || 0),
    totalIgst: Number(r.total_igst || 0),
    grandTotal: Number(r.grand_total || 0),
    roundOff: Number(r.round_off || 0),
    amountInWords: r.amount_in_words || '',
    notes: r.notes || '',
    bankDetails,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// Dashboard statistics
export async function getStats() {
  const [pRes, gRes, cRes, mRes, nRes, iRes] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM projects'),
    pool.query('SELECT COUNT(*) FROM gallery_items'),
    pool.query('SELECT COUNT(*) FROM craftsmanship_items'),
    pool.query('SELECT COUNT(*) FROM contact_messages'),
    pool.query('SELECT COUNT(*) FROM notes'),
    pool.query('SELECT COUNT(*) FROM invoices'),
  ])
  const unreadMsgRes = await pool.query('SELECT COUNT(*) FROM contact_messages WHERE read = FALSE')

  return {
    projects: parseInt(pRes.rows[0].count, 10),
    gallery: parseInt(gRes.rows[0].count, 10),
    craftsmanship: parseInt(cRes.rows[0].count, 10),
    messages: parseInt(mRes.rows[0].count, 10),
    unreadMessages: parseInt(unreadMsgRes.rows[0].count, 10),
    notes: parseInt(nRes.rows[0].count, 10),
    invoices: parseInt(iRes.rows[0].count, 10),
  }
}

