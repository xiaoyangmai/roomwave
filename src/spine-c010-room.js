(() => {
  'use strict';

  const room = document.getElementById('spine-c010-room');
  if (!room) return;

  room.innerHTML = `
    <div class="spine-room-shell" data-action="idle">
      <header class="spine-room-header">
        <div class="spine-room-brand"><span aria-hidden="true">✦</span><div class="spine-room-brand-copy"><strong>c010 · Spine Lab</strong><small>Roomwave milestone room</small></div></div>
        <span class="spine-room-badge">4.3.26 editable baseline</span>
      </header>
      <section class="spine-room-stage" aria-label="c010 Spine character showcase">
        <canvas class="spine-room-canvas" aria-label="c010 Spine character"></canvas>
        <p class="spine-room-note"><strong>语义动作试作</strong><br>同一个模型在独立房间里接受泡沫、水和风扇动作测试。</p>
        <button type="button" class="spine-room-debug" aria-pressed="false">显示证据标记</button>
        <div class="spine-room-status" role="status"><strong>正在加载 c010 Spine…</strong><small>准备 4.3.13 运行时</small><button type="button" hidden>重试加载</button></div>
      </section>
      <section class="spine-room-controls" aria-label="c010 语义动作控制">
        <div class="spine-room-control-heading"><strong>动作试作台</strong><span class="spine-room-phase">idle · 等待输入</span></div>
        <div class="spine-room-actions" role="group" aria-label="语义动作">
          <button type="button" data-spine-action="foam_wipe"><span aria-hidden="true">☁</span>泡沫擦拭</button>
          <button type="button" data-spine-action="water_splash"><span aria-hidden="true">💧</span>喷水</button>
          <button type="button" data-spine-action="fan_hold"><span aria-hidden="true">🌀</span>风扇</button>
          <button type="button" data-spine-action="idle"><span aria-hidden="true">◌</span>回到 idle</button>
        </div>
        <div class="spine-room-animations" aria-label="Spine 原始动画"></div>
      </section>
    </div>`;

  const $ = (selector) => room.querySelector(selector);
  const shell = $('.spine-room-shell');
  const canvas = $('.spine-room-canvas');
  const stage = $('.spine-room-stage');
  const status = $('.spine-room-status');
  const statusTitle = status.querySelector('strong');
  const statusDetail = status.querySelector('small');
  const retry = status.querySelector('button');
  const phase = $('.spine-room-phase');
  const debugButton = $('.spine-room-debug');
  const animationTray = $('.spine-room-animations');
  const actionButtons = [...room.querySelectorAll('[data-spine-action]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let adapter = null;
  let loading = false;
  let loaded = false;
  let enabled = false;
  let loadRun = 0;
  let raf = 0;
  let lastTime = 0;
  let lastPhase = '';

  function manifest() {
    return {
      model: 'c010_00',
      format: 'json',
      skeleton: '/spine-audit/c010/model-4.3.26/c010_00.json',
      atlas: '/spine-audit/c010/model-4.3.26/c010_00.atlas',
      texture: '/spine-audit/c010/model-4.3.26/c010_00.png',
      textures: ['/spine-audit/c010/model-4.3.26/c010_00.png', '/spine-audit/c010/model-4.3.26/c010_00_2.png', '/spine-audit/c010/model-4.3.26/c010_00_3.png', '/spine-audit/c010/model-4.3.26/c010_00_4.png'],
      skin: '00',
      binding: '/spine-audit/c010/semantic-binding.json',
      audit: '/spine-audit/c010/audit-report.json',
      patch: '/config/c010-runtime-patch.json',
      fit: { scaleMultiplier: 1.15, offsetY: -24 },
    };
  }

  function setStatus(title, detail, showRetry = false) {
    statusTitle.textContent = title;
    statusDetail.textContent = detail;
    retry.hidden = !showRetry;
    status.hidden = false;
  }

  function resize() {
    if (!adapter) return;
    // The adapter initializes a canvas at 1x1 before the room has laid out.
    // Clear that provisional inline size before measuring the CSS-sized stage.
    canvas.style.removeProperty('width');
    canvas.style.removeProperty('height');
    const box = stage.getBoundingClientRect();
    adapter.resize(Math.max(1, box.width), Math.max(1, box.height), window.devicePixelRatio || 1);
  }

  function setPhase(value) {
    const text = value === 'idle' ? 'idle · 等待输入' : `${value} · 运行中`;
    if (text === lastPhase) return;
    lastPhase = text;
    phase.textContent = text;
    shell.dataset.action = value;
  }

  function buildAnimationTray() {
    animationTray.replaceChildren();
    for (const animation of adapter?.data?.animations || []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = animation.name;
      button.dataset.animation = animation.name;
      button.setAttribute('aria-pressed', String(animation.name === adapter.animation));
      button.addEventListener('click', () => {
        if (!adapter.setAnimation(animation.name, true)) return;
        [...animationTray.children].forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        setPhase(`animation:${animation.name}`);
      });
      animationTray.append(button);
    }
  }

  function renderTrace(sample) {
    const current = sample?.phase || (adapter?.generated ? 'notice' : 'idle');
    setPhase(current);
  }

  function tick(now) {
    raf = 0;
    if (!enabled || !adapter?.loaded) return;
    const delta = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    adapter.update(Math.min(.05, Math.max(0, delta)));
    raf = requestAnimationFrame(tick);
  }

  function syncActive() {
    const next = loaded && window.LiveRooms?.activeRoom === 'spine-c010' && !document.hidden;
    if (next === enabled) return;
    enabled = next;
    lastTime = 0;
    if (enabled) {
      resize();
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  async function load() {
    if (loading || loaded) return;
    loading = true;
    const run = ++loadRun;
    setStatus('正在加载 c010 Spine…', '准备 4.3.13 运行时');
    try {
      const runtime = await import('/runtime/roomwave-spine.js');
      await runtime.loadScript('/spine-audit/c010/vendor/spine-canvas-4.3.13.min.js');
      if (run !== loadRun) return;
      adapter = new runtime.SpineCharacterAdapter({ canvas, manifest: manifest(), debug: false, onTrace: renderTrace });
      await adapter.load();
      loaded = true;
      buildAnimationTray();
      resize();
      status.hidden = true;
      syncActive();
    } catch (error) {
      if (run !== loadRun) return;
      console.error(error);
      setStatus('c010 Spine 加载失败', error?.message || '请检查本地服务和模型文件。', true);
    } finally {
      if (run === loadRun) loading = false;
    }
  }

  actionButtons.forEach((button) => button.addEventListener('click', () => {
    if (!adapter?.loaded) return;
    const action = button.dataset.spineAction;
    if (action === 'idle') {
      adapter.resetToIdle();
      setPhase('idle');
      return;
    }
    adapter.playSemantic({ type: action, intensity: action === 'foam_wipe' ? .85 : .9, seed: 17 });
    setPhase(action);
  }));

  debugButton.addEventListener('click', () => {
    if (!adapter) return;
    adapter.debug = !adapter.debug;
    debugButton.setAttribute('aria-pressed', String(adapter.debug));
    debugButton.textContent = adapter.debug ? '隐藏证据标记' : '显示证据标记';
  });
  retry.addEventListener('click', () => { loaded = false; adapter = null; load(); });
  window.addEventListener('live-room-change', () => { syncActive(); if (window.LiveRooms?.activeRoom === 'spine-c010') load(); });
  document.addEventListener('visibilitychange', syncActive);
  window.addEventListener('pageshow', () => { syncActive(); if (window.LiveRooms?.activeRoom === 'spine-c010') load(); });
  window.addEventListener('pagehide', () => { enabled = false; cancelAnimationFrame(raf); });
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize, { passive: true });
  reduced.addEventListener?.('change', resize);
  window.SpineC010Room = Object.freeze({ get adapter() { return adapter; }, get loaded() { return loaded; }, get active() { return enabled; } });

  if (window.LiveRooms?.activeRoom === 'spine-c010') load();
})();
