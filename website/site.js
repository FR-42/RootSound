// Keep the existing direct links when the public release API is unavailable.
(() => {
  'use strict';
  async function refreshDownloads() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch('https://api.github.com/repos/FR-42/RootSound/releases?per_page=5', {
        signal: controller.signal,
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) return;
      const patterns = {
        windows: /^RootSound-Windows-x64-.*\.zip$/,
        mac: /^RootSound-macOS-arm64-.*\.zip$/,
      };
      const releases = await response.json();
      const release = releases.find(item => !item.draft && Object.values(patterns).every(pattern =>
        item.assets?.some(asset => pattern.test(asset.name))));
      if (!release) return;
      for (const [platform, pattern] of Object.entries(patterns)) {
        const asset = release.assets.find(item => pattern.test(item.name));
        const url = new URL(asset.browser_download_url);
        if (url.protocol === 'https:' && url.hostname === 'github.com' &&
            url.pathname.startsWith('/FR-42/RootSound/releases/')) {
          document.querySelector(`[data-platform="${platform}"]`).href = url.href;
          document.querySelector(`[data-size="${platform}"]`).textContent = `约 ${Math.round(asset.size / 1e6)} MB`;
        }
      }
    } catch {
      // The links in HTML work without JavaScript or a successful API request.
    } finally {
      clearTimeout(timeout);
    }
  }
  void refreshDownloads();
})();
