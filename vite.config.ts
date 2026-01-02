
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
      external: [
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
