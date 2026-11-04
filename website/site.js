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
  const guide = document.querySelector('#guide');
  if (!guide) return;
  const video = guide.querySelector('video');
  let started = false;
  async function loadGuide() {
    if (started || !guide.open) return;
    started = true;
    try {
      const response = await fetch('guides/lessons.json?v=2');
      if (!response.ok) throw new Error('Guide unavailable');
      const lessons = await response.json();
      const tabs = guide.querySelector('.guide-tabs');
      const buttons = lessons.map((lesson, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'guide-tab'; button.setAttribute('role', 'tab');
        button.id = 'guide-tab-' + lesson.id; button.setAttribute('aria-controls', 'guide-panel');
        button.textContent = `${index + 1}. ${lesson.title}`;
        button.addEventListener('click', () => select(index));
        button.addEventListener('keydown', event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? lessons.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + lessons.length) % lessons.length;
          buttons[next].focus(); select(next);
        });
        tabs.append(button); return button;
      });
      function select(index) {
        const lesson = lessons[index]; video.pause();
        const version = lesson.version || 1;
        video.src = `guides/${lesson.id}.mp4?v=${version}`; video.poster = `guides/${lesson.id}.jpg?v=${version}`; video.load();
        guide.querySelector('#guide-summary').textContent = lesson.summary;
        guide.querySelector('#guide-panel').setAttribute('aria-labelledby', buttons[index].id);
        guide.querySelector('.guide-gif').href = `guides/${lesson.id}.gif?v=${version}`;
        guide.querySelector('.guide-gif').download = `简乐-${lesson.title}.gif`;
        const steps = guide.querySelector('.guide-transcript ol'); steps.replaceChildren();
        for (const text of lesson.steps) { const li = document.createElement('li'); li.textContent = text; steps.append(li); }
        buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; });
      }
      select(0);
    } catch {
      started = false; guide.querySelector('#guide-summary').textContent = '演示暂时无法加载，可以下载完整视频观看。';
    }
  }
  guide.addEventListener('toggle', () => { if (guide.open) void loadGuide(); else video.pause(); });
  const openFromLink = () => { if (location.hash === '#guide') { guide.open = true; void loadGuide(); } };
  window.addEventListener('hashchange', openFromLink); openFromLink();
  video.addEventListener('play', () => {
    document.querySelector('.music-editor')?.contentWindow?.postMessage({ type: 'jianle:pause-for-guide' }, location.origin);
  });
  window.addEventListener('message', event => {
    if (event.origin === location.origin && event.source === document.querySelector('.music-editor')?.contentWindow
        && event.data?.type === 'jianle:editor-playing') video.pause();
  });
})();
