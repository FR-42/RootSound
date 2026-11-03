import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [{ name: 'current-public-entry', transformIndexHtml: { order: 'pre', handler: html => html.replace('/src/workstation/app/browser.ts', '/src/workstation/app/release.ts') } }],
  build: { outDir: '.cache/release-ui', emptyOutDir: true, sourcemap: false,
    assetsInlineLimit: file => file.endsWith('capture-worklet.js') ? false : undefined,
    rollupOptions: { input: 'index.html', plugins: [{ name: 'release-scope-audit', generateBundle() {
      const modules = [...this.getModuleIds()].filter(id => this.getModuleInfo(id)?.isIncluded).map(id => path.relative(process.cwd(), id).replaceAll('\\', '/'));
      if (!modules.some(id => id.endsWith('app/release.ts'))) return;
      const forbidden = /(?:ui-rendering\/(?:song-workspace|co-creation-workspace|sampling-workspace|synth-workspace|catalog-workspace)|melody-recognition\/|app\/browser\.ts)/;
      const found = modules.filter(id => forbidden.test(id)); if (found.length) this.error('Inactive modules in public release: ' + found.join(', '));
      this.emitFile({ type: 'asset', fileName: 'release-scope.json', source: JSON.stringify({ onlyCurrentEntry: true, modules }, null, 2) });
    } }] },
  },
});
