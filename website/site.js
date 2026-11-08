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
        windows: /^RootSound-Windows-x64-.*-Setup\.exe$/,
        mac: /^RootSound-macOS-arm64-.*\.pkg$/,
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
          const link = document.querySelector(`[data-platform="${platform}"]`);
          link.href = url.href;
          link.hidden = false;
          document.querySelector(`[data-size="${platform}"]`).textContent = `约 ${Math.round(asset.size / 1e6)} MB`;
        }
      }
    } catch {} finally {
      clearTimeout(timeout);
    }
  }
  void refreshDownloads();
  const guideEntry = document.querySelector('.guide-entry');
  const editor = document.querySelector('.music-editor');
  guideEntry.addEventListener('click', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        editor.contentDocument?.URL !== editor.src || editor.contentDocument.readyState !== 'complete') return;
    event.preventDefault();
    editor.scrollIntoView({ block: 'nearest' });
    editor.contentWindow.postMessage({ type: 'jianle:start-guide' }, location.origin);
  });
})();
