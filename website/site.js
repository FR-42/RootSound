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
  const stage = guide.querySelector('.guide-stage');
  const heading = guide.querySelector('#guide-title');
  const summary = guide.querySelector('#guide-summary');
  const count = guide.querySelector('.guide-count');
  const motion = guide.querySelector('.guide-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lessons = [], current = 0, requested = 0, generation = 0;
  let stopped = reduced.matches, inView = true, drag = null;
  const animations = new Set();
  const source = (lesson, animate) => `guides/${lesson.id}.${animate ? 'webp' : 'jpg'}?v=${lesson.version}`;
  const moving = () => !stopped && inView && !document.hidden;
  const describeMotion = () => {
    motion.setAttribute('aria-pressed', String(stopped));
    motion.setAttribute('aria-label', stopped ? '播放动图' : '停止动图');
    motion.title = stopped ? '播放动图' : '停止动图';
    motion.querySelector('path').setAttribute('d', stopped ? 'm7 4 9 6-9 6Z' : 'M7 5v10M13 5v10');
  };
  const buttons = [];
  function refreshMotion() {
    if (!lessons.length) return;
    const image = stage.querySelector('.guide-page:not(.guide-leaving) img') || stage.querySelector('img');
    const next = source(lessons[current], moving());
    if (image && image.getAttribute('src') !== next) image.src = next;
  }
  async function select(index, direction = index >= requested ? 1 : -1, initial = false) {
    if (!lessons.length) return;
    requested = (index + lessons.length) % lessons.length;
    const target = requested, ticket = ++generation, lesson = lessons[target];
    const image = new Image(1920, 1080);
    image.className = 'guide-image'; image.alt = lesson.alt;
    image.src = source(lesson, moving());
    try { await image.decode(); } catch {
      image.src = source(lesson, false);
      try { await image.decode(); } catch { return; }
    }
    if (ticket !== generation) return;
    // Keep only the visible page and its outgoing sheet, even during rapid flips.
    for (const animation of animations) animation.cancel();
    animations.clear();
    stage.querySelectorAll('.guide-leaving').forEach(page => page.remove());
    let previous = stage.firstElementChild;
    if (previous?.tagName === 'IMG') {
      const wrapper = document.createElement('div'); wrapper.className = 'guide-page';
      previous.replaceWith(wrapper); wrapper.append(previous); previous = wrapper;
    }
    const page = document.createElement('div'); page.className = 'guide-page'; page.append(image); stage.append(page);
    current = target;
    heading.textContent = lesson.title; summary.textContent = lesson.description;
    count.textContent = `${target + 1} / ${lessons.length}`;
    buttons.forEach((button, i) => button.setAttribute('aria-current', i === target ? 'true' : 'false'));
    if (previous && !initial && !reduced.matches) {
      previous.classList.add('guide-leaving'); previous.setAttribute('aria-hidden', 'true');
      previous.style.transformOrigin = direction > 0 ? 'left center' : 'right center';
      page.style.transformOrigin = direction > 0 ? 'right center' : 'left center';
      const options = { duration: 420, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'both' };
      const leave = previous.animate([{ transform: 'translateX(0) rotateY(0)', opacity: 1 }, { transform: `translateX(${-direction * 9}%) rotateY(${-direction * 16}deg)`, opacity: 0 }], options);
      const enter = page.animate([{ transform: `translateX(${direction * 6}%) rotateY(${direction * 10}deg)`, opacity: 0 }, { transform: 'translateX(0) rotateY(0)', opacity: 1 }], options);
      animations.add(leave); animations.add(enter);
      await Promise.allSettled([leave.finished, enter.finished]);
      animations.delete(leave); animations.delete(enter);
      previous.remove();
      if (ticket === generation) { leave.cancel(); enter.cancel(); }
    } else previous?.remove();
  }
  guide.querySelector('.guide-back').addEventListener('click', () => void select(requested - 1, -1));
  guide.querySelector('.guide-next').addEventListener('click', () => void select(requested + 1, 1));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const rect = guide.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight) return;
    event.preventDefault();
    void select(requested + (event.key === 'ArrowRight' ? 1 : -1), event.key === 'ArrowRight' ? 1 : -1);
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y; drag = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) void select(requested + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { drag = null; });
  motion.addEventListener('click', () => { stopped = !stopped; describeMotion(); refreshMotion(); });
  reduced.addEventListener('change', () => { stopped = reduced.matches; describeMotion(); refreshMotion(); });
  document.addEventListener('visibilitychange', refreshMotion);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; refreshMotion(); }).observe(guide);
  describeMotion();
  void (async () => {
    try {
      const response = await fetch('guides/lessons.json?v=5');
      if (!response.ok) throw new Error('Guide unavailable');
      lessons = await response.json();
      for (const [index, lesson] of lessons.entries()) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'guide-dot'; button.setAttribute('aria-label', lesson.title);
        button.addEventListener('click', () => void select(index));
        guide.querySelector('.guide-dots').append(button); buttons.push(button);
      }
      await select(0, 1, true);
    } catch { summary.textContent = '演示暂时无法加载，请刷新重试。'; }
  })();
})();
