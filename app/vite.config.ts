import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/v3': {
        target: 'https://app.theopenacademy.org/api',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://app.theopenacademy.org/api',
        changeOrigin: true,
        secure: true,
      },
      '/guest': {
        target: 'https://app.theopenacademy.org/api',
        changeOrigin: true,
        secure: true,
      },
      '/media': {
        target: 'https://app.theopenacademy.org',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
