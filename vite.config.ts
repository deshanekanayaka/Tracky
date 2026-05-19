import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        // Prevent code splitting for background and content scripts
        manualChunks: (id) => {
          if (id.includes('src/background')) return 'background'
          if (id.includes('src/content')) return 'content'
          if (id.includes('src/utils/sheetsApi')) return 'background'
          if (id.includes('src/utils/storage') && !id.includes('popup')) return 'background'
        },
      },
    },
  },
})