import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { createApiMiddleware } from './api-middleware.js'

const PORT = process.env.PORT || 5176
const distDir = path.resolve(process.cwd(), 'dist')
const publicDir = path.resolve(process.cwd(), 'public')
const apiHandler = createApiMiddleware()

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const server = http.createServer((req, res) => {
  apiHandler(req, res, () => {
    // Static file serving fallback for production SPA
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    let filePath = path.join(distDir, url.pathname)

    // Fallback to public directory if file not found in dist
    if (!fs.existsSync(filePath) && fs.existsSync(path.join(publicDir, url.pathname))) {
      filePath = path.join(publicDir, url.pathname)
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html')
    }

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404
      return res.end('Not found')
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    res.statusCode = 200
    res.setHeader('Content-Type', contentType)
    fs.createReadStream(filePath).pipe(res)
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Unified Ventures] Server running on http://0.0.0.0:${PORT}`)
})

