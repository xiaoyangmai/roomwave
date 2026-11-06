(() => {
  'use strict';

  const room = document.getElementById('gaming-c010-room');
  if (!room || !window.GamingSeatedState || !window.GamingPlatform) return;

  const foamIcon = '<svg viewBox="0 0 42 36" fill="none" aria-hidden="true"><path d="M6 27c-6-3-2-12 4-11-2-8 10-13 13-5 6-6 14 0 12 6 8 2 6 13-1 14H11Z" fill="#e3eafa"/><g fill="#fff"><circle cx="10" cy="23" r="6"/><circle cx="17" cy="16" r="7"/><circle cx="26" cy="19" r="7"/><circle cx="32" cy="24" r="6"/><circle cx="21" cy="25" r="7"/></g></svg>';
  const gifts = [
    ['star', '⭐', 'Star', 'Give the c010 streamer a bright reaction', 'delight', 1.05],
    ['banana', '🍌', 'Banana', 'Send a playful banana reaction', 'banana', 1.1],
    ['water', '🔫', 'Water', 'Spray water toward the streamer', 'water_splash', 1.25],
    ['foam', foamIcon, 'Foam', 'Send fluffy foam for a wipe reaction', 'foam_wipe', 3.6],
    ['fan', '🌀', 'Fan', 'Hold the fan toward the streamer', 'fan_hold', 2.1],
  ];

  room.innerHTML = `<div class="gaming-c010-shell">
    <header class="gaming-c010-header">
      <div class="gaming-c010-title"><span aria-hidden="true">🎮</span><div class="room-heading"><strong class="room-host-name">c010</strong><small class="room-type">Gaming</small></div><span class="gaming-c010-live">LIVE</span></div>
      <button type="button" class="gaming-c010-sound" aria-label="Mute c010 audio" aria-pressed="true"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button>
    </header>
    <section class="gaming-c010-game" aria-label="Live platform game"><canvas class="gaming-c010-game-canvas" aria-label="The purple cat runs and jumps across grassy platforms"></canvas><div class="gaming-c010-progress" role="progressbar" aria-label="Current stage progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></section>
    <section class="gaming-c010-camera" aria-label="c010 streamer camera">
      <canvas class="gaming-c010-spine-canvas" role="img" aria-label="c010 Spine character reacts in the Gaming room"></canvas>
      <p class="gaming-c010-speech" aria-live="polite">准备开始游戏。</p>
      <span class="gaming-c010-fan-prop" aria-hidden="true" hidden>🌀</span>
      <span class="gaming-c010-water-prop" aria-hidden="true" hidden>💦</span>
      <span class="gaming-c010-reaction-prop" aria-hidden="true" hidden></span>
      <div class="gaming-c010-cam-label"><i></i>PLAYER CAM <span class="gaming-c010-inputs" aria-hidden="true"><b>▲</b><b>▶</b></span></div>
      <button type="button" class="gaming-c010-debug" aria-pressed="false">证据标记</button>
      <div class="gaming-c010-status" role="status"><strong>正在加载 c010…</strong><small>导出 4.3.26 · 运行时 4.3.13</small><button type="button" hidden>重试</button></div>
    </section>
    <div class="gaming-c010-controls"><div class="gaming-c010-gifts" role="group" aria-label="Send a gaming reaction">${gifts.map(([id, icon, label, description]) => `<button type="button" data-c010-gift="${id}" aria-label="${description}" title="${description}" aria-pressed="false"><span aria-hidden="true">${icon}</span><b>${label}</b></button>`).join('')}</div></div>
  </div>`;

  const $ = (selector) => room.querySelector(selector);
  const shell = $('.gaming-c010-shell');
  const gameCanvas = $('.gaming-c010-game-canvas');
  const gameContext = gameCanvas.getContext('2d');
  const camera = $('.gaming-c010-camera');
  const spineCanvas = $('.gaming-c010-spine-canvas');
  const progress = $('.gaming-c010-progress');
  const progressFill = progress.querySelector('i');
  const speech = $('.gaming-c010-speech');
  const fanProp = $('.gaming-c010-fan-prop');
  const waterProp = $('.gaming-c010-water-prop');
  const reactionProp = $('.gaming-c010-reaction-prop');
  const status = $('.gaming-c010-status');
  const statusTitle = status.querySelector('strong');
  const statusDetail = status.querySelector('small');
  const retry = status.querySelector('button');
  const debugButton = $('.gaming-c010-debug');
  const controls = [...room.querySelectorAll('[data-c010-gift]')];
  const inputs = [...room.querySelectorAll('.gaming-c010-inputs b')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'roomwave-gaming-c010-v1';
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  const model = window.Roomwave?.createModel('gaming-c010', GamingSeatedState.create, saved) || GamingSeatedState.create(saved);
  let adapter = null;
  let characterPack = null;
  let loading = false;
  let loaded = false;
  let enabled = false;
  let loadRun = 0;
  let raf = 0;
  let lastTime = 0;
  let lastPhase = 'idle';
  let gameWidth = 1;
  let gameHeight = 1;
  let trace = [];
  let semanticAction = null;
  let sound = false;
  let audioContext = null;
  let lastSoundAt = -Infinity;
  const fanVisualOffset = Object.freeze({ x: 15, y: 2 });

  function setStatus(title, detail, showRetry = false) {
    statusTitle.textContent = title;
    statusDetail.textContent = detail;
    retry.hidden = !showRetry;
    status.hidden = false;
  }

  function save() {
    if (!window.Roomwave?.together) {
      try { localStorage.setItem(storageKey, JSON.stringify(model.state)); } catch {}
    }
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const gameBox = gameCanvas.getBoundingClientRect();
    // The adapter initializes a canvas at 1x1 before the room has laid out.
    // Clear that provisional inline size before measuring the CSS-sized camera.
    spineCanvas.style.removeProperty('width');
    spineCanvas.style.removeProperty('height');
    const spineBox = spineCanvas.getBoundingClientRect();
    gameWidth = Math.max(1, gameBox.width);
    gameHeight = Math.max(1, gameBox.height);
    model.setViewport(gameWidth, gameHeight);
    gameCanvas.width = Math.round(gameWidth * ratio);
    gameCanvas.height = Math.round(gameHeight * ratio);
    gameContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    adapter?.resize(Math.max(1, spineBox.width), Math.max(1, spineBox.height), ratio);
    render();
  }

  function semanticFor(id) { return gifts.find(([gift]) => gift === id)?.[4] || id; }
  function durationFor(id) { return gifts.find(([gift]) => gift === id)?.[5] || 1.25; }
  function labelFor(id) { return gifts.find(([gift]) => gift === id)?.[2] || id; }

  function playSound(gift) {
    if (!sound || !enabled) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio || performance.now() - lastSoundAt < 120) return;
    lastSoundAt = performance.now();
    try {
      audioContext ||= new Audio();
      const notes = gift === 'star' ? [523.25, 659.25, 783.99] : gift === 'banana' ? [440, 330, 220] : gift === 'fan' ? [280, 360] : gift === 'water' ? [440, 660, 880] : [760, 920, 1120];
      audioContext.resume().then(() => notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const at = audioContext.currentTime + index * .07;
        oscillator.type = gift === 'star' ? 'triangle' : 'sine';
        oscillator.frequency.setValueAtTime(frequency, at);
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(.025, at + .015);
        gain.gain.exponentialRampToValueAtTime(.001, at + .16);
        oscillator.connect(gain); gain.connect(audioContext.destination);
        oscillator.start(at); oscillator.stop(at + .18);
      })).catch(() => {});
    } catch {}
  }

  function renderSpeech(action, phase = 'idle') {
    const id = action || 'idle';
    const text = id === 'foam' || id === 'foam_wipe'
      ? (phase === 'contact' ? '正在擦掉泡沫…' : phase === 'recover' ? '泡沫擦掉了，正在收手。' : '她正在处理泡沫…')
      : id === 'water' || id === 'water_splash'
        ? (phase === 'recover' ? '水雾散了。' : '喷水互动！')
        : id === 'fan' || id === 'fan_hold'
          ? (phase === 'recover' ? '风停了，继续游戏。' : '风来了～')
        : id === 'banana'
            ? '收到香蕉！'
            : id === 'star' || id === 'delight'
              ? '谢谢星星！'
              : '准备开始游戏。';
    speech.textContent = text;
  }

  function render() {
    const frame = model.frame;
    const state = model.state;
    const pose = window.GamingSeatedSprites?.select ? window.GamingSeatedSprites.select(frame, { reduced: reduced.matches }) : null;
    shell.dataset.action = frame.action || 'idle';
    shell.dataset.pose = frame.pose || pose || 'idle';
    camera.dataset.action = semanticAction || lastPhase;
    camera.dataset.phase = lastPhase;
    fanProp.hidden = semanticAction !== 'fan_hold';
    waterProp.hidden = semanticAction !== 'water_splash';
    reactionProp.hidden = semanticAction !== 'delight' && semanticAction !== 'banana';
    reactionProp.textContent = semanticAction === 'delight' ? '⭐' : semanticAction === 'banana' ? '🍌' : '';
    if (semanticAction === 'fan_hold' && adapter?.loaded) {
      const hand = adapter.getAnchor('handVisual');
      if (hand) {
        // Keep the fan head close to the visible hand. The previous +45px
        // center offset made it read as a chest overlay in the c010 pose.
        fanProp.style.left = `${hand.x + fanVisualOffset.x - 27}px`;
        fanProp.style.top = `${hand.y + fanVisualOffset.y - 27}px`;
      }
    }
    if (semanticAction === 'water_splash' && adapter?.loaded) {
      const hand = adapter.getAnchor('handVisual');
      if (hand) {
        waterProp.style.left = `${hand.x + 28}px`;
        waterProp.style.top = `${hand.y - 30}px`;
      }
    }
    progressFill.style.width = `${(frame.progress || 0) * 100}%`;
    progress.setAttribute('aria-valuenow', String(Math.floor((frame.progress || 0) * 100)));
    inputs[0]?.classList.toggle('is-on', Boolean(frame.jumping));
    inputs[1]?.classList.toggle('is-on', frame.steering > .08 && (frame.handsOnController === 2 || Math.floor(frame.clock / 160) % 3 !== 0));
    for (const button of controls) {
      const gift = button.dataset.c010Gift;
      button.disabled = !loaded || !model.canStart(gift);
      const pressed = gift === 'foam' && adapter?.foamAction
        ? adapter.generated?.type === 'foam_wipe' && !adapter.generated.interrupted
        : frame.effects && Object.hasOwn(frame.effects, gift) && !(gift === 'foam' && Object.hasOwn(frame.effects, 'water'));
      button.setAttribute('aria-pressed', String(Boolean(pressed)));
    }
    if (window.GamingPlatform) GamingPlatform.draw(gameContext, frame, state, { width: gameWidth, height: gameHeight, reduced: reduced.matches });
    renderSpeech(semanticAction, lastPhase);
  }

  function captureVisualAnchors() {
    const sample = trace[trace.length - 1];
    if (!sample || !adapter?.loaded) return;
    const hand = adapter.getAnchor('handVisual');
    if (!hand) return;
    const cameraRect = camera.getBoundingClientRect();
    const fanRect = fanProp.hidden ? null : fanProp.getBoundingClientRect();
    const fanCenter = fanRect
      ? { x: fanRect.left - cameraRect.left + fanRect.width / 2, y: fanRect.top - cameraRect.top + fanRect.height / 2 }
      : null;
    sample.fanAnchor = {
      expected: { x: hand.x + fanVisualOffset.x, y: hand.y + fanVisualOffset.y },
      actual: fanCenter,
      gapPx: fanCenter ? Math.hypot(fanCenter.x - hand.x - fanVisualOffset.x, fanCenter.y - hand.y - fanVisualOffset.y) : null,
      offset: { ...fanVisualOffset },
    };
  }

  function tick(time) {
    raf = 0;
    if (!enabled) return;
    const delta = lastTime ? time - lastTime : 0;
    lastTime = time;
    const events = model.tick(delta);
    const result = adapter?.update(Math.min(.05, Math.max(0, delta / 1000)));
    if (result?.phase) lastPhase = result.phase;
    if (result?.type) semanticAction = result.type;
    else if (result?.phase === 'idle') semanticAction = null;
    if (result) trace = adapter.captureTrace().frames;
    render();
    captureVisualAnchors();
    if (events.includes('complete') || events.includes('finish')) save();
    raf = requestAnimationFrame(tick);
  }

  function syncActive() {
    const next = loaded && window.LiveRooms?.activeRoom === 'gaming-c010' && !document.hidden;
    if (next === enabled) { render(); return; }
    enabled = next;
    model.setActive(enabled);
    lastTime = 0;
    if (enabled) { resize(); raf = requestAnimationFrame(tick); }
    else { cancelAnimationFrame(raf); raf = 0; save(); }
    render();
  }

  async function load() {
    if (loading || loaded) return;
    loading = true;
    const run = ++loadRun;
    setStatus('正在加载 c010…', '准备 Spine 4.3.13 运行时');
    try {
      const runtime = await import('/runtime/roomwave-spine.js');
      const registry = await import('/runtime/character-pack-loader.js');
      characterPack = await registry.loadCharacterPack('c010_00');
      await runtime.loadScript('/runtime/vendor/spine-canvas-4.3.13.min.js');
      if (run !== loadRun) return;
      adapter = new runtime.SpineCharacterAdapter({
        canvas: spineCanvas,
        manifest: { ...characterPack, fit: { scaleMultiplier: 1.5, offsetY: -18, ...(characterPack.fit || {}) } },
        debug: false,
        onTrace: (sample) => { if (sample?.phase) lastPhase = sample.phase; },
      });
      await adapter.load();
      loaded = true;
      status.hidden = true;
      resize();
      syncActive();
    } catch (error) {
      if (run !== loadRun) return;
      console.error(error);
      setStatus('c010 加载失败', error?.message || '请检查本地模型和运行时文件。', true);
    } finally {
      if (run === loadRun) loading = false;
    }
  }

  controls.forEach((button) => button.addEventListener('click', () => {
    const gift = button.dataset.c010Gift;
    if (!adapter?.loaded || !model.start(gift)) return;
    lastPhase = 'notice';
    semanticAction = semanticFor(gift);
    const semantic = semanticFor(gift);
    const recipe = characterPack?.recipes?.[semantic] || characterPack?.actionRecipes?.[semantic] || null;
    adapter.playSemantic({ type: semantic, recipe, duration: durationFor(gift), intensity: gift === 'foam' ? .85 : .9, seed: 17 });
    playSound(gift);
    renderSpeech(gift, lastPhase);
    render();
    save();
  }));

  $('.gaming-c010-sound').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const muted = button.getAttribute('aria-pressed') === 'true';
    sound = muted;
    button.setAttribute('aria-pressed', String(!sound));
    button.setAttribute('aria-label', muted ? 'Unmute c010 audio' : 'Mute c010 audio');
    button.querySelector('use')?.setAttribute('href', sound ? '#icon-sound' : '#icon-muted');
    if (sound) playSound('star');
  });
  debugButton.addEventListener('click', () => {
    if (!adapter) return;
    adapter.debug = !adapter.debug;
    debugButton.setAttribute('aria-pressed', String(adapter.debug));
    debugButton.textContent = adapter.debug ? '隐藏证据' : '证据标记';
  });
  retry.addEventListener('click', () => { loaded = false; adapter = null; load(); });
  window.addEventListener('live-room-change', () => { syncActive(); if (window.LiveRooms?.activeRoom === 'gaming-c010') load(); });
  document.addEventListener('visibilitychange', syncActive);
  window.addEventListener('pageshow', () => { syncActive(); if (window.LiveRooms?.activeRoom === 'gaming-c010') load(); });
  window.addEventListener('pagehide', () => { enabled = false; cancelAnimationFrame(raf); });
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(shell);
  else window.addEventListener('resize', resize, { passive: true });
  reduced.addEventListener?.('change', render);
  window.GamingC010Room = Object.freeze({
    get adapter() { return adapter; },
    get characterPack() { return characterPack; },
    get loaded() { return loaded; },
    get active() { return enabled; },
    get soundEnabled() { return sound; },
    get trace() { return trace.slice(); },
    setDebug(value) { if (adapter) adapter.debug = Boolean(value); },
    interruptToIdle(reason = 'manual') {
      if (!adapter?.loaded) return false;
      const interrupted = adapter.interruptToIdle({ reason });
      if (interrupted) {
        lastPhase = 'recover';
        renderSpeech(semanticAction, lastPhase);
        render();
        save();
      }
      return interrupted;
    },
    resetToIdle() {
      if (!adapter?.loaded) return false;
      model.resetToIdle?.();
      adapter.resetToIdle();
      trace = [];
      lastPhase = 'idle';
      semanticAction = null;
      renderSpeech(null, 'idle');
      render();
      save();
      return true;
    },
  });
  render();
  if (window.LiveRooms?.activeRoom === 'gaming-c010') load();
})();
