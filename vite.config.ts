import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Bibliothèques stables dans des fichiers séparés : un visiteur qui revient ne retélécharge que le code modifié.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          realtime: ['socket.io-client'],
        },
      },
    },
  },
})
