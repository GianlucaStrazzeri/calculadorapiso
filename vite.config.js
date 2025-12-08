import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
    },
  },
  server: {
    // Try to keep a stable dev port for HMR so the browser doesn't attempt
    // to connect to a different one. If 5173 is already in use on your
    // system this will cause Vite to try the next available port — stop
    // other dev servers or change this port to a free one.
    port: 5173,
    strictPort: true,
    hmr: {
      // Ensure HMR uses the same port
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
