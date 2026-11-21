import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

import { createApiMiddleware } from './server/api-middleware.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createApiMiddleware())
    },
  }
}

export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    const appUrl = process.env.VITE_APP_URL

    if (!appUrl || appUrl.includes('localhost')) {
      console.warn(
        '[intereor] Set VITE_APP_URL to your production domain before deploying.',
      )
    }
  }

  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5176,
      strictPort: true,
      allowedHosts: [
        'necessarily-adequate-partnership-comprehensive.trycloudflare.com',
        '.trycloudflare.com',
      ],
    },
    preview: {
      host: '0.0.0.0',
      port: 5176,
      strictPort: true,
      allowedHosts: [
        'necessarily-adequate-partnership-comprehensive.trycloudflare.com',
        '.trycloudflare.com',
      ],
    },
    build: {
      target: 'es2020',
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined
            }

            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/react/')
            ) {
              return 'vendor-react'
            }

            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }

            if (id.includes('gsap')) {
              return 'vendor-gsap'
            }

            if (id.includes('swiper')) {
              return 'vendor-swiper'
            }

            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }

            if (id.includes('lenis')) {
              return 'vendor-lenis'
            }

            if (id.includes('react-icons')) {
              return 'vendor-icons'
            }

            return 'vendor'
          },
        },
      },
    },
  }
})
