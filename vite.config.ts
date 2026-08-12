import { crx } from '@crxjs/vite-plugin';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

import manifest from './public/manifest.json';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [crx({ manifest })],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Chrome MV3 rejects Vite's <link rel="modulepreload"> for shared chunks
    // ("cross-world extension resource mismatch"). Scripts still load via import.
    modulePreload: false,
  },
});
