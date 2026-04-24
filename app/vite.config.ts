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
      // Resolve /media/playlist/ redirect → return CDN URL as plain text
      '/resolve-media': {
        target: 'https://app.theopenacademy.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path: string) => path.replace('/resolve-media', '/media'),
        configure: (proxy: any) => {
          proxy.on('proxyRes', (proxyRes: any, _req: any, res: any) => {
            if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
              res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
              res.end(proxyRes.headers.location);
              proxyRes.destroy();
            }
          });
        },
      },
    },
  },
})
