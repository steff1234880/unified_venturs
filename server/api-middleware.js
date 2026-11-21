import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import {
  insertMessage,
  getAllMessages,
  updateMessageRead,
  deleteMessageById,
  getStats,
  getAllProjects,
  getProjectById,
  insertProject,
  updateProjectById,
  deleteProjectById,
  getAllGalleryItems,
  getGalleryItemById,
  insertGalleryItem,
  updateGalleryItemById,
  deleteGalleryItemById,
  getAllCraftsmanshipItems,
  getCraftsmanshipItemById,
  insertCraftsmanshipItem,
  updateCraftsmanshipItemById,
  deleteCraftsmanshipItemById,
  getSiteSetting,
  setSiteSetting,
  getAdminUser,
  authenticateAdmin,
  updateAdminCredentials,
} from './db.js'

const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// 25MB max body guard for image uploads
const MAX_PAYLOAD_SIZE = 25 * 1024 * 1024

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > MAX_PAYLOAD_SIZE) {
        req.destroy()
        reject(new Error('Payload too large. Maximum size is 25MB.'))
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(new Error('Invalid JSON format'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.end(JSON.stringify(data))
}

const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

export function createApiMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const pathname = url.pathname

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return res.end()
    }

    if (!pathname.startsWith('/api/')) {
      return next()
    }

    // --- Image Upload API ---
    // POST /api/upload -> Accepts base64 image or data URL, writes to /public/uploads/, returns persistent relative URL
    if (pathname === '/api/upload' && req.method === 'POST') {
      try {
        const body = await parseBody(req)
        const { data, filename, contentType, folder = 'projects' } = body

        if (!data || typeof data !== 'string') {
          return sendJson(res, 400, { error: 'Missing image data.' })
        }

        let mimeType = contentType || 'image/jpeg'
        let base64Content = data

        if (data.startsWith('data:')) {
          const match = data.match(/^data:([^;]+);base64,(.+)$/)
          if (match) {
            mimeType = match[1]
            base64Content = match[2]
          }
        }

        const ext = ALLOWED_MIME_TYPES[mimeType] || path.extname(filename || '').toLowerCase() || '.jpg'
        if (!ALLOWED_MIME_TYPES[mimeType] && !['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
          return sendJson(res, 400, { error: 'Unsupported image format. Allowed: JPEG, PNG, WebP, GIF, SVG.' })
        }

        const buffer = Buffer.from(base64Content, 'base64')
        if (buffer.length > 20 * 1024 * 1024) {
          return sendJson(res, 400, { error: 'Image file too large. Maximum size is 20MB.' })
        }

        const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general'
        const targetDir = path.join(uploadsDir, cleanFolder)
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true })
        }

        const uniqueName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`
        const filePath = path.join(targetDir, uniqueName)
        fs.writeFileSync(filePath, buffer)

        const publicUrl = `/uploads/${cleanFolder}/${uniqueName}`

        return sendJson(res, 201, {
          success: true,
          url: publicUrl,
          size: buffer.length,
          name: uniqueName,
        })
      } catch (err) {
        return sendJson(res, 500, { error: err.message || 'Image upload failed.' })
      }
    }

    // --- Projects API ---
    if (pathname === '/api/projects' && req.method === 'GET') {
      try {
        const projects = getAllProjects()
        return sendJson(res, 200, { success: true, projects })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname.startsWith('/api/projects/') && req.method === 'GET') {
      const id = pathname.replace('/api/projects/', '').trim()
      try {
        const project = getProjectById(id)
        if (!project) return sendJson(res, 404, { error: 'Project not found' })
        return sendJson(res, 200, { success: true, project })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname === '/api/projects' && req.method === 'POST') {
      try {
        const body = await parseBody(req)
        const project = insertProject(body)
        return sendJson(res, 201, { success: true, project })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to create project.' })
      }
    }

    if (pathname.startsWith('/api/projects/') && (req.method === 'PUT' || req.method === 'PATCH')) {
      const id = pathname.replace('/api/projects/', '').trim()
      try {
        const body = await parseBody(req)
        const project = updateProjectById(id, body)
        return sendJson(res, 200, { success: true, project })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to update project.' })
      }
    }

    if (pathname.startsWith('/api/projects/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/projects/', '').trim()
      try {
        deleteProjectById(id)
        return sendJson(res, 200, { success: true, message: 'Project deleted' })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to delete project.' })
      }
    }

    // --- Gallery API ---
    if (pathname === '/api/gallery' && req.method === 'GET') {
      try {
        const gallery = getAllGalleryItems()
        return sendJson(res, 200, { success: true, gallery })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname === '/api/gallery' && req.method === 'POST') {
      try {
        const body = await parseBody(req)
        const item = insertGalleryItem(body)
        return sendJson(res, 201, { success: true, item })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to add gallery item.' })
      }
    }

    if (pathname.startsWith('/api/gallery/') && (req.method === 'PUT' || req.method === 'PATCH')) {
      const id = pathname.replace('/api/gallery/', '').trim()
      try {
        const body = await parseBody(req)
        const item = updateGalleryItemById(id, body)
        return sendJson(res, 200, { success: true, item })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to update gallery item.' })
      }
    }

    if (pathname.startsWith('/api/gallery/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/gallery/', '').trim()
      try {
        deleteGalleryItemById(id)
        return sendJson(res, 200, { success: true, message: 'Gallery item deleted' })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to delete gallery item.' })
      }
    }

    // --- Craftsmanship Items API ---
    if (pathname === '/api/craftsmanship' && req.method === 'GET') {
      try {
        const items = getAllCraftsmanshipItems()
        return sendJson(res, 200, { success: true, items })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname === '/api/craftsmanship' && req.method === 'POST') {
      try {
        const body = await parseBody(req)
        const item = insertCraftsmanshipItem(body)
        return sendJson(res, 201, { success: true, item })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to add craftsmanship item.' })
      }
    }

    if (pathname.startsWith('/api/craftsmanship/') && (req.method === 'PUT' || req.method === 'PATCH')) {
      const id = pathname.replace('/api/craftsmanship/', '').trim()
      try {
        const body = await parseBody(req)
        const item = updateCraftsmanshipItemById(id, body)
        return sendJson(res, 200, { success: true, item })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to update craftsmanship item.' })
      }
    }

    if (pathname.startsWith('/api/craftsmanship/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/craftsmanship/', '').trim()
      try {
        deleteCraftsmanshipItemById(id)
        return sendJson(res, 200, { success: true, message: 'Craftsmanship item deleted' })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to delete craftsmanship item.' })
      }
    }

    // --- Craftsmanship / Settings API ---
    if (pathname === '/api/settings/craftsmanship' && req.method === 'GET') {
      try {
        const data = getSiteSetting('craftsmanship')
        return sendJson(res, 200, { success: true, craftsmanship: data })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname === '/api/settings/craftsmanship' && req.method === 'POST') {
      try {
        const body = await parseBody(req)
        const saved = setSiteSetting('craftsmanship', body)
        return sendJson(res, 200, { success: true, craftsmanship: saved })
      } catch (err) {
        return sendJson(res, 400, { error: err.message })
      }
    }

    // --- Contact & Messages API ---
    if (pathname === '/api/contact' && req.method === 'POST') {
      try {
        const body = await parseBody(req)
        const message = insertMessage(body)
        return sendJson(res, 201, { success: true, message })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Submission failed' })
      }
    }

    if (pathname === '/api/admin/messages' && req.method === 'GET') {
      try {
        const messages = getAllMessages()
        return sendJson(res, 200, { success: true, messages })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname.startsWith('/api/admin/messages/') && req.method === 'PATCH') {
      const id = pathname.replace('/api/admin/messages/', '').trim()
      try {
        const body = await parseBody(req)
        const updated = updateMessageRead(id, body.read !== false)
        return sendJson(res, 200, { success: true, message: updated })
      } catch (err) {
        return sendJson(res, 400, { error: err.message })
      }
    }

    if (pathname.startsWith('/api/admin/messages/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/admin/messages/', '').trim()
      try {
        deleteMessageById(id)
        return sendJson(res, 200, { success: true })
      } catch (err) {
        return sendJson(res, 400, { error: err.message })
      }
    }

    if (pathname === '/api/admin/stats' && req.method === 'GET') {
      try {
        const stats = getStats()
        return sendJson(res, 200, { success: true, stats })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    // --- Admin Auth & Account Settings API ---
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      try {
        const body = await parseBody(req)
        const { email, password } = body
        if (!email || !password) {
          return sendJson(res, 400, { error: 'Email and password are required.' })
        }
        const user = authenticateAdmin(email, password)
        if (!user) {
          return sendJson(res, 401, { error: 'Invalid email or password.' })
        }
        return sendJson(res, 200, { success: true, user })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname === '/api/auth/profile' && req.method === 'GET') {
      try {
        const user = getAdminUser()
        return sendJson(res, 200, { success: true, user })
      } catch (err) {
        return sendJson(res, 500, { error: err.message })
      }
    }

    if (pathname === '/api/admin/account' && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'POST')) {
      try {
        const body = await parseBody(req)
        const { currentPassword, newEmail, newPassword } = body
        if (!currentPassword) {
          return sendJson(res, 400, { error: 'Current password is required to verify identity.' })
        }
        const updated = updateAdminCredentials({ currentPassword, newEmail, newPassword })
        return sendJson(res, 200, { success: true, user: updated, message: 'Admin account credentials updated successfully.' })
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to update credentials.' })
      }
    }

    return next()
  }
}
