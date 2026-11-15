import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = (() => {
  const raw = process.env.VITE_BASE_PATH?.trim().replace(/^\/+|\/+$/g, '')
  return raw ? `/${raw}/` : '/'
})()

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        clientsClaim: true,
        skipWaiting: false,
      },
      includeAssets: [
        'favicon.ico',
        'icons/icon.svg',
        'icons/icon-32.png',
        'icons/icon-180.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-512.png',
      ],
      manifest: {
        name: 'MVP PWA Starter',
        short_name: 'MVP Starter',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
