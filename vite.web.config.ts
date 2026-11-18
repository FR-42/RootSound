import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  mode: 'website', root: path.resolve('web'), base: './', publicDir: false,
  build: { outDir: path.resolve('.cache/website/play'), emptyOutDir: true, sourcemap: false },
});
