import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve('web'), base: './', publicDir: false,
  build: { outDir: path.resolve('.cache/website/play'), emptyOutDir: true, sourcemap: false },
});
