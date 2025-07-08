import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Jika Anda men-deploy ke root domain (misal: https://app.com), hapus atau komentari baris `base` di bawah.
  // Jika Anda men-deploy ke sub-direktori (misal: https://app.com/my-app/),
  // atur `base` sesuai nama sub-direktori Anda.
  base: '/my-app/',
})