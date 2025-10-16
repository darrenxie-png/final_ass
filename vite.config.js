import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});