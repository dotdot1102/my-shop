import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 주소(https://dotdot1102.github.io/my-shop/)에 맞춘 기본 경로
  base: '/my-shop/',
  plugins: [react()],
})
