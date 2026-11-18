import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [{
    name: 'shared-editor-colors', enforce: 'pre',
    transform(code, id) {
      if (id.replaceAll('\\', '/').endsWith('/app/release-colors.css'))
        return code.replaceAll('.has-pointer-roll', '.melody-workspace');
    },
  }],
  mode: 'website', root: path.resolve('web'), base: './', publicDir: false,
  build: { outDir: path.resolve('.cache/website/play'), emptyOutDir: true, sourcemap: false },
});
