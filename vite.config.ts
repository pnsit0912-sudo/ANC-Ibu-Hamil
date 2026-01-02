
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
      // Beritahu Rollup untuk tidak mencoba membundel pustaka ini karena sudah ada di importmap index.html
      external: [
        '@google/genai',
        'react',
        'react-dom',
        'lucide-react',
        'react-qr-code',
        'leaflet'
      ],
    },
  },
  server: {
    port: 3000,
  }
});
