import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // 자동으로 브라우저 열기
    proxy: {
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
      }
    }
  }
})

