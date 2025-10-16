import { defineConfig } from 'vite';

export default defineConfig({
  base: '/final_ass/',
  server: {
    port: 3000,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  build: {
    outdir: 'docs',
    assetsDir: 'assets'
  } 

});