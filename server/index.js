import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config()

import * as pgDb from './db-pg.js'
import * as sqliteDb from './db.js'

// Use PostgreSQL when DATABASE_URL is set; otherwise seamlessly use SQLite
const usePostgres = Boolean(process.env.DATABASE_URL)
const db = usePostgres ? pgDb : sqliteDb

console.log(`[Database Engine] Active backend engine: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`)

const app = express()
const PORT = process.env.PORT || 5176
const distDir = path.resolve(process.cwd(), 'dist')
const publicDir = path.resolve(process.cwd(), 'public')
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Ensure subdirectories exist for uploads
for (const sub of ['projects', 'gallery', 'craftsmanship']) {
  const p = path.join(uploadsDir, sub)
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

// CORS & Middleware
app.use(cors())
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Rate limiting map for authentication
const loginAttempts = new Map()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 10

function rateLimitAuth(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()
  const record = loginAttempts.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }

  if (now > record.resetAt) {
    record.count = 1
    record.resetAt = now + RATE_LIMIT_WINDOW_MS
  } else {
    record.count++
  }
  loginAttempts.set(ip, record)

  if (record.count > MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many login attempts. Please wait a moment.' })
  }
  next()
}

// ---------------------------------------------------------------------------
// Production Health Check
// ---------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    let dbStatus = 'ok'
    if (usePostgres) {
      await pgDb.pool.query('SELECT 1')
    }
    res.json({
      status: 'healthy',
      engine: usePostgres ? 'PostgreSQL' : 'SQLite',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
    })
  }
})

// ---------------------------------------------------------------------------
// Authentication Endpoints
// ---------------------------------------------------------------------------
app.post('/api/auth/login', rateLimitAuth, async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }
    const user = await db.authenticateAdmin(email, password)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    res.json({ success: true, user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: err.message || 'Authentication failed.' })
  }
})

app.get('/api/auth/profile', async (req, res) => {
  try {
    const user = await db.getAdminUser()
    if (!user) {
      return res.status(404).json({ error: 'Admin profile not found.' })
    }
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/account', async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body || {}
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to verify identity.' })
    }
    const updated = await db.updateAdminCredentials(currentPassword, newEmail, newPassword)
    res.json({
      success: true,
      message: 'Admin account credentials updated successfully.',
      user: updated,
    })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update admin account.' })
  }
})

// ---------------------------------------------------------------------------
// Dashboard Statistics
// ---------------------------------------------------------------------------
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats()
    res.json({ success: true, stats })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Contact Messages / Enquiries
// ---------------------------------------------------------------------------
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, projectType, message } = req.body || {}
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'First name, last name, email, and message are required.' })
    }
    const saved = await db.insertMessage({
      firstName,
      lastName,
      email,
      phone: phone || '',
      projectType: projectType || '',
      message,
    })
    res.json({ success: true, message: 'Message sent successfully.', data: saved })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.getAllMessages()
    res.json({ success: true, messages })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await db.getAllMessages()
    res.json({ success: true, messages })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    const { read } = req.body || {}
    const updated = await db.updateMessageRead(id, read !== undefined ? read : true)
    if (!updated) return res.status(404).json({ error: 'Message not found.' })
    res.json({ success: true, message: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    const success = await db.deleteMessageById(id)
    if (!success) return res.status(404).json({ error: 'Message not found.' })
    res.json({ success: true, message: 'Message deleted successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Projects (Portfolio Residences & Before/After)
// ---------------------------------------------------------------------------
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.getAllProjects()
    res.json({ success: true, projects })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found.' })
    res.json({ success: true, project })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/projects', async (req, res) => {
  try {
    const saved = await db.insertProject(req.body)
    res.json({ success: true, project: saved })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/projects/:id', async (req, res) => {
  try {
    const updated = await db.updateProjectById(req.params.id, req.body)
    if (!updated) return res.status(404).json({ error: 'Project not found.' })
    res.json({ success: true, project: updated })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const success = await db.deleteProjectById(req.params.id)
    if (!success) return res.status(404).json({ error: 'Project not found.' })
    res.json({ success: true, message: 'Project deleted successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Gallery Items
// ---------------------------------------------------------------------------
app.get('/api/gallery', async (req, res) => {
  try {
    const items = await db.getAllGalleryItems()
    res.json({ success: true, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/gallery/:id', async (req, res) => {
  try {
    const item = await db.getGalleryItemById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Gallery item not found.' })
    res.json({ success: true, item })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/gallery', async (req, res) => {
  try {
    const saved = await db.insertGalleryItem(req.body)
    res.json({ success: true, item: saved })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/gallery/:id', async (req, res) => {
  try {
    const updated = await db.updateGalleryItemById(req.params.id, req.body)
    if (!updated) return res.status(404).json({ error: 'Gallery item not found.' })
    res.json({ success: true, item: updated })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const success = await db.deleteGalleryItemById(req.params.id)
    if (!success) return res.status(404).json({ error: 'Gallery item not found.' })
    res.json({ success: true, message: 'Gallery item deleted successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Art of Craftsmanship
// ---------------------------------------------------------------------------
app.get('/api/craftsmanship', async (req, res) => {
  try {
    const items = await db.getAllCraftsmanshipItems()
    res.json({ success: true, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/craftsmanship/:id', async (req, res) => {
  try {
    const item = await db.getCraftsmanshipItemById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Craftsmanship item not found.' })
    res.json({ success: true, item })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/craftsmanship', async (req, res) => {
  try {
    const saved = await db.insertCraftsmanshipItem(req.body)
    res.json({ success: true, item: saved })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/craftsmanship/:id', async (req, res) => {
  try {
    const updated = await db.updateCraftsmanshipItemById(req.params.id, req.body)
    if (!updated) return res.status(404).json({ error: 'Craftsmanship item not found.' })
    res.json({ success: true, item: updated })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/craftsmanship/:id', async (req, res) => {
  try {
    const success = await db.deleteCraftsmanshipItemById(req.params.id)
    if (!success) return res.status(404).json({ error: 'Craftsmanship item not found.' })
    res.json({ success: true, message: 'Craftsmanship item deleted successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Notes (Notepad Management Module)
// ---------------------------------------------------------------------------
app.get('/api/notes', async (req, res) => {
  try {
    if (db.getAllNotes) {
      const notes = await db.getAllNotes()
      return res.json({ success: true, notes })
    }
    res.json({ success: true, notes: [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/notes', async (req, res) => {
  try {
    if (db.insertNote) {
      const saved = await db.insertNote(req.body)
      return res.json({ success: true, note: saved })
    }
    res.status(501).json({ error: 'Notes not implemented on this engine.' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/notes/:id', async (req, res) => {
  try {
    if (db.updateNoteById) {
      const updated = await db.updateNoteById(req.params.id, req.body)
      if (!updated) return res.status(404).json({ error: 'Note not found.' })
      return res.json({ success: true, note: updated })
    }
    res.status(501).json({ error: 'Notes not implemented on this engine.' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/notes/:id', async (req, res) => {
  try {
    if (db.deleteNoteById) {
      const success = await db.deleteNoteById(req.params.id)
      if (!success) return res.status(404).json({ error: 'Note not found.' })
      return res.json({ success: true, message: 'Note deleted successfully.' })
    }
    res.status(501).json({ error: 'Notes not implemented on this engine.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Invoices (GST Tax Invoice Management Module)
// ---------------------------------------------------------------------------
app.get('/api/invoices', async (req, res) => {
  try {
    if (db.getAllInvoices) {
      const invoices = await db.getAllInvoices()
      return res.json({ success: true, invoices })
    }
    res.json({ success: true, invoices: [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/invoices/:id', async (req, res) => {
  try {
    if (db.getInvoiceById) {
      const invoice = await db.getInvoiceById(req.params.id)
      if (!invoice) return res.status(404).json({ error: 'Invoice not found.' })
      return res.json({ success: true, invoice })
    }
    res.status(501).json({ error: 'Invoices not implemented on this engine.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/invoices', async (req, res) => {
  try {
    if (db.insertInvoice) {
      const saved = await db.insertInvoice(req.body)
      return res.json({ success: true, invoice: saved })
    }
    res.status(501).json({ error: 'Invoices not implemented on this engine.' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/invoices/:id', async (req, res) => {
  try {
    if (db.updateInvoiceById) {
      const updated = await db.updateInvoiceById(req.params.id, req.body)
      if (!updated) return res.status(404).json({ error: 'Invoice not found.' })
      return res.json({ success: true, invoice: updated })
    }
    res.status(501).json({ error: 'Invoices not implemented on this engine.' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    if (db.deleteInvoiceById) {
      const success = await db.deleteInvoiceById(req.params.id)
      if (!success) return res.status(404).json({ error: 'Invoice not found.' })
      return res.json({ success: true, message: 'Invoice deleted successfully.' })
    }
    res.status(501).json({ error: 'Invoices not implemented on this engine.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Website Settings
// ---------------------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const key = req.query.key || 'site_settings'
    const value = await db.getSiteSetting(key)
    res.json({ success: true, key, value })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/settings', async (req, res) => {
  try {
    const { key = 'site_settings', value } = req.body || {}
    const saved = await db.setSiteSetting(key, value)
    res.json({ success: true, key, value: saved })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ---------------------------------------------------------------------------
// Image Upload API (Base64 / Multipart fallback to persistent uploads directory)
// ---------------------------------------------------------------------------
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

app.post('/api/upload', (req, res) => {
  try {
    const { data, filename, contentType, folder = 'projects' } = req.body || {}
    if (!data) {
      return res.status(400).json({ error: 'Image data payload is required.' })
    }

    let buffer
    let ext = '.jpg'

    if (typeof data === 'string' && data.startsWith('data:')) {
      const match = data.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/)
      if (!match) {
        return res.status(400).json({ error: 'Invalid data URL format.' })
      }
      const mime = match[1]
      ext = ALLOWED_MIME_TYPES[mime] || '.jpg'
      buffer = Buffer.from(match[2], 'base64')
    } else if (typeof data === 'string') {
      buffer = Buffer.from(data, 'base64')
      if (contentType && ALLOWED_MIME_TYPES[contentType]) {
        ext = ALLOWED_MIME_TYPES[contentType]
      }
    } else {
      return res.status(400).json({ error: 'Unsupported image data format.' })
    }

    if (buffer.length > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds maximum limit of 25MB.' })
    }

    const safeFolder = ['projects', 'gallery', 'craftsmanship'].includes(folder) ? folder : 'projects'
    const targetDir = path.join(uploadsDir, safeFolder)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    const uniqueName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`
    const filePath = path.join(targetDir, uniqueName)
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${safeFolder}/${uniqueName}`
    console.log(`[Upload] Image stored at: ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`)

    res.json({
      success: true,
      url: publicUrl,
      size: buffer.length,
      filename: uniqueName,
    })
  } catch (err) {
    console.error('[Upload] Error saving image:', err)
    res.status(500).json({ error: 'Failed to process image upload.' })
  }
})

// ---------------------------------------------------------------------------
// Static Files & SPA Fallback
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(uploadsDir))
app.use(express.static(publicDir))
app.use(express.static(distDir))

app.use((req, res) => {
  // SPA Catch-all: send dist/index.html
  const indexPath = path.join(distDir, 'index.html')
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath)
  }
  res.status(404).send('Not Found')
})

// ---------------------------------------------------------------------------
// Server Bootstrap & Lifecycle
// ---------------------------------------------------------------------------
async function startServer() {
  try {
    if (usePostgres) {
      console.log('[PostgreSQL] Connecting to managed database...')
      await pgDb.initPostgresSchema()
      await pgDb.migrateFromLocalStore()
    } else {
      console.log('[SQLite] Running local persistence engine.')
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Unified Ventures] Production server running on http://0.0.0.0:${PORT}`)
    })
  } catch (err) {
    console.error('[Bootstrap Error] Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
