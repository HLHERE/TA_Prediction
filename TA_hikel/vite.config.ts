import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  return {
    plugins: [react()],
    // Atur base path ke sub-direktori untuk build produksi,
    // dan ke root ('/') untuk development.
    base: isProduction ? '/my-app/' : '/',
  }
})