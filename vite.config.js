import { defineConfig } from 'vite';
import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';

// Keep local asset folders as the source of truth in development and builds.
export default defineConfig({
  publicDir: false,
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  plugins: [{name:'copy-local-game-data', async closeBundle() {
    for (const folder of ['assets','config','data']) {
      await cp(resolve(folder),resolve('dist',folder),{recursive:true});
    }
  }}],
  build: {outDir:'dist', assetsDir:'app-bundle'},
});
