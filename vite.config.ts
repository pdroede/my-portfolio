import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vercel serves the app at / — use subpath only for manual/GitHub Pages builds (VITE_BASE_PATH).
const base =
  process.env.VERCEL === '1'
    ? '/'
    : (process.env.VITE_BASE_PATH ?? '/')

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
