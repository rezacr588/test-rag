import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [react(), wasm()],
  server: {
    proxy: {
      '/ingest': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/question': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})