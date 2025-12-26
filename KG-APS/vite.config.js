import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Your Flask backend running on port 5001
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // Use false for HTTP, true if your backend uses HTTPS
      },
    },
  },
})
