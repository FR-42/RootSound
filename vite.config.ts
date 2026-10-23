import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      // Native builds and local test profiles contain live, locked files.
      // Only source changes should invalidate the browser preview.
      ignored: ['**/.cache/**', '**/.test-output/**', '**/desktop/**/bin/**', '**/desktop/**/obj/**', '**/legacy/**'],
    },
  },
  build: {
    // Keep the input processor on the trusted local origin in the desktop host.
    assetsInlineLimit: (filePath) => filePath.endsWith('capture-worklet.js') ? false : undefined,
    rollupOptions: {
      input: 'index.html',
    },
  },
});
