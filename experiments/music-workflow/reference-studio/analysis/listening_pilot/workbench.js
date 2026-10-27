/* Offline, shared-clock comparison. Slow buffers are rendered beforehand;
   browser playbackRate always remains one so changing speed cannot change pitch. */
"use strict";

class ListeningTransport {
  constructor(context, load, tracks, focusDuration, changed = () => {}) {
    this.context = context; this.load = load; this.tracks = tracks;
    this.focusDuration = focusDuration; this.changed = changed;
    this.track = "selected"; this.speed = 0.6; this.focus = true;
    this.loop = true; this.current = 0; this.playing = false;
    this.pending = false; this.version = 0; this.node = null;
  }
  get end() { return Math.min(this.tracks[this.track].duration,
    this.focus ? this.focusDuration : Infinity); }
  position() { return Math.min(this.end, Math.max(0, this.playing
    ? this.startPosition + (this.context.currentTime - this.startClock) * this.speed
    : this.current)); }
  halt() {
    this.current = this.position(); this.version++;
    this.playing = false; this.pending = false;
    if (this.node) {
      this.node.onended = null;
      try { this.node.stop(); } catch (_) { /* Already ended. */ }
      this.node.disconnect(); this.node = null;
    }
    this.changed();
  }
  async play() {
    this.halt(); if (this.current >= this.end - 0.000001) this.current = 0;
    const token = ++this.version; this.pending = true; this.changed();
    try {
      const buffer = await this.load(this.track, this.speed);
      await this.context.resume();
      if (token !== this.version) return;
      const node = this.context.createBufferSource(); node.buffer = buffer;
      node.playbackRate.value = 1; node.connect(this.context.destination);
      this.startPosition = this.current; this.startClock = this.context.currentTime;
      this.node = node; this.playing = true; this.pending = false;
      node.onended = () => {
        if (token !== this.version) return;
        node.disconnect(); this.node = null; this.playing = false;
        this.current = this.end;
        if (this.loop) { this.current = 0; void this.play().catch(this.onError); }
        else this.changed();
      };
      node.start(0, this.current / this.speed, (this.end - this.current) / this.speed);
      this.changed();
    } catch (error) {
      if (token === this.version) { this.halt(); this.onError?.(error); }
      throw error;
    }
  }
  async configure(options) {
    const resume = this.playing || this.pending; this.halt();
    if (options.track !== undefined) this.track = options.track;
    if (options.speed !== undefined) this.speed = options.speed;
    if (options.focus !== undefined) this.focus = options.focus;
    if (this.tracks[this.track].candidate) this.focus = true;
    if (this.current >= this.end) this.current = 0;
    this.changed(); if (resume) await this.play();
  }
  async seek(seconds) {
    const resume = this.playing || this.pending; this.halt();
    this.current = Math.max(0, Math.min(this.end, seconds)); this.changed();
    if (resume) await this.play();
  }
}

if (typeof module !== "undefined") module.exports = { ListeningTransport };

if (typeof window !== "undefined" && window.LISTENING_DATA) {
  const data = window.LISTENING_DATA, byId = id => document.getElementById(id);
  let context, transport;
  const decoded = new Map(), image = new Image(), fullImage = new Image();
  image.src = data.images.opening; fullImage.src = data.images.full;
  const canvas = byId("timeline"), drawContext = canvas.getContext("2d");
  const descriptions = {
    original: "原曲中的同一段，保留全部声音。",
    selected: "你认可的07。先听中间那一下是否换了音。",
    a: "候选A：这一处以同一音高再次发声。钢琴只用于核对旋律。",
    b: "候选B：这一处换成较高的音。其他音与A保持一致。"
  };
  async function load(track, speed) {
    const key = track + ":" + speed;
    if (!decoded.has(key)) decoded.set(key, (async () => {
      const bytes = Uint8Array.from(atob(data.tracks[track].audio[String(speed)]), c => c.charCodeAt(0));
      return context.decodeAudioData(bytes.buffer);
    })());
    return decoded.get(key);
  }
  function ensureTransport() {
    if (!transport) {
      context = new (window.AudioContext || window.webkitAudioContext)();
      transport = new ListeningTransport(context, load, data.tracks, data.focusDuration, update);
      transport.onError = error => { byId("status").textContent = "暂时无法播放：" + error.message; };
    }
    return transport;
  }
  function update() {
    const t = transport;
    byId("play").textContent = t?.pending ? "准备中…" : t?.playing ? "暂停" : "播放";
    for (const button of document.querySelectorAll("[data-track]")) {
      const selected = button.dataset.track === (t?.track || "selected");
      button.classList.toggle("active", selected); button.setAttribute("aria-pressed", String(selected));
    }
    for (const button of document.querySelectorAll("[data-speed]")) {
      const selected = Number(button.dataset.speed) === (t?.speed || 0.6);
      button.classList.toggle("active", selected); button.setAttribute("aria-pressed", String(selected));
    }
    const focus = t?.focus ?? true;
    byId("focus").checked = focus;
    byId("focus").disabled = Boolean(t && data.tracks[t.track].candidate);
    byId("description").textContent = descriptions[t?.track || "selected"];
    draw();
  }
  function draw() {
    const width = Math.max(320, canvas.clientWidth), height = 330;
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    }
    drawContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    const g = drawContext, focus = transport?.focus ?? true;
    const end = transport?.end || data.focusDuration;
    const x0 = 45, x1 = width - 14, y0 = 10, y1 = height - 35;
    g.fillStyle = "#111820"; g.fillRect(0, 0, width, height);
    const selectedImage = focus ? image : fullImage;
    if (selectedImage.complete && selectedImage.naturalWidth) g.drawImage(selectedImage, x0, y0, x1-x0, y1-y0);
    g.font = "12px system-ui"; g.textAlign = "right";
    for (let midi = 60; midi <= 96; midi += 12) {
      const y = y1 - (midi - 60) / 36 * (y1-y0);
      g.fillStyle = "#b1bac5"; g.fillText("C" + (midi / 12 - 1), x0 - 7, y + 4);
      g.strokeStyle = "#ffffff14"; g.beginPath(); g.moveTo(x0,y); g.lineTo(x1,y); g.stroke();
    }
    const track = transport?.track || "selected", notes = data.tracks[track].notes || [];
    for (const note of notes) {
      const x = x0 + note.StartSeconds / end * (x1-x0);
      const y = y1 - (note.Midi - 60) / 36 * (y1-y0);
      g.fillStyle = track === "a" ? "#88e0bc" : "#eac277";
      g.fillRect(x, y-4, Math.max(2,note.DurationSeconds/end*(x1-x0)), 8);
    }
    g.textAlign = "center"; g.fillStyle = "#b1bac5";
    for (let i = 0; i <= 4; i++) g.fillText((45+end*i/4).toFixed(2), x0+(x1-x0)*i/4, height-10);
    const position = transport?.position() || 0, x = x0 + position/end*(x1-x0);
    g.strokeStyle = "#f08083"; g.lineWidth = 2; g.beginPath(); g.moveTo(x,y0);g.lineTo(x,y1);g.stroke();
    byId("time").textContent = (45+position).toFixed(2) + " 秒";
  }
  const run = action => Promise.resolve().then(action).catch(error => {
    byId("status").textContent = "暂时无法播放：" + error.message;
  });
  byId("play").onclick = () => run(async () => {
    const t = ensureTransport(); if (t.playing || t.pending) t.halt(); else await t.play();
  });
  byId("restart").onclick = () => run(() => ensureTransport().seek(0));
  byId("focus").onchange = () => run(() => ensureTransport().configure({focus:byId("focus").checked}));
  byId("loop").onchange = () => { ensureTransport().loop = byId("loop").checked; };
  for (const button of document.querySelectorAll("[data-track]"))
    button.onclick = () => run(() => ensureTransport().configure({track:button.dataset.track}));
  for (const button of document.querySelectorAll("[data-speed]"))
    button.onclick = () => run(() => ensureTransport().configure({speed:Number(button.dataset.speed)}));
  canvas.onclick = event => run(() => {
    const t = ensureTransport(), rect = canvas.getBoundingClientRect();
    return t.seek((event.clientX-rect.left-45)/(rect.width-59)*t.end);
  });
  canvas.onkeydown = event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); void run(() => { const t = ensureTransport();
        return t.seek(t.position() + (event.key === "ArrowLeft" ? -0.05 : 0.05)); });
    }
  };
  document.onkeydown = event => {
    if (event.code === "Space" && event.target === document.body) { event.preventDefault(); byId("play").click(); }
  };
  window.addEventListener("pagehide", () => transport?.halt());
  image.onload = fullImage.onload = update; window.addEventListener("resize", draw);
  function animate() { if (transport?.playing) draw(); requestAnimationFrame(animate); }
  update(); requestAnimationFrame(animate);
}
