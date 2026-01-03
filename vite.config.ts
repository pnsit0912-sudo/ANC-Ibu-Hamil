
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Menghapus minify: 'terser' karena esbuild adalah default yang lebih cepat dan sudah terintegrasi
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: './index.html',
      }
    },
  },
  server: {
    port: 3000,
  }
});
