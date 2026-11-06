(() => {
  'use strict';

  const room = document.getElementById('karaoke-room');
  if (!room || !window.RoomMusic || !window.RoomMusicCatalog) return;
  const tracks = Array.isArray(window.RoomMusicCatalog.karaoke) ? window.RoomMusicCatalog.karaoke : [];
  const storageKey = 'roomwave-karaoke-v1';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const assets = '/assets/karaoke-room-v1/';
  const singerAssets = '/assets/karaoke-june-v2/';
  const poses = ['idle', 'soft', 'open', 'heart'];

  room.innerHTML = `<div class="karaoke-ambient" aria-hidden="true"></div><div class="karaoke-shell is-paused">
    <img class="karaoke-background" alt="" draggable="false" aria-hidden="true">
    <div class="karaoke-vignette" aria-hidden="true"></div>
    <header class="karaoke-header"><div class="karaoke-profile"><span class="karaoke-avatar" aria-hidden="true">♫</span><div class="room-heading"><strong class="room-host-name">June</strong><span class="room-type">Karaoke</span></div><b class="karaoke-live">LIVE</b></div><button type="button" class="karaoke-sound" aria-label="Turn music on" aria-pressed="false"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button></header>
    <div class="karaoke-stage" role="img" aria-label="June at the microphone in her cozy acoustic lounge"><div class="karaoke-singer" data-pose="idle">${poses.map(pose => `<img class="karaoke-pose karaoke-pose-${pose}" alt="" draggable="false" aria-hidden="true"${pose !== 'idle' ? ' hidden' : ''}>`).join('')}</div></div>
    <div class="karaoke-effects" aria-hidden="true">${Array.from({ length: 12 }, () => '<span class="karaoke-particle" hidden></span>').join('')}</div>
    <div class="karaoke-bottom">
      <p class="karaoke-speech" role="status" aria-live="polite">Stay a while. I’m glad you’re here.</p>
      <section class="karaoke-listening" aria-label="Listen to June">
        <div class="karaoke-song-row"><span class="karaoke-song-name" role="status" aria-live="polite"></span><button type="button" class="karaoke-skip" aria-label="Skip song">Skip</button></div>
        <span class="karaoke-music-status sr-only" role="status" aria-live="polite">Sound is off</span>
      </section>
      <div class="karaoke-audience" role="group" aria-label="Cheer for June"><button type="button" class="karaoke-applaud"><span aria-hidden="true">👏</span><b>Applaud</b><small class="karaoke-applause-count">0</small></button><button type="button" class="karaoke-glow"><span class="karaoke-glow-icon" aria-hidden="true">✦</span><b>Glow sticks</b></button></div>
    </div>
    <div class="karaoke-art-status" role="status" hidden><span>Getting the room ready…</span><button type="button" hidden>Retry artwork</button></div>
  </div>`;

  const $ = selector => room.querySelector(selector);
  const shell = $('.karaoke-shell'), singer = $('.karaoke-singer'), speech = $('.karaoke-speech');
  const songName = $('.karaoke-song-name'), skip = $('.karaoke-skip'), sound = $('.karaoke-sound');
  const applaud = $('.karaoke-applaud'), glow = $('.karaoke-glow');
  const particleNodes = [...room.querySelectorAll('.karaoke-particle')];
  const poseNodes = new Map(poses.map(pose => [pose, $(`.karaoke-pose-${pose}`)]));
  const particles = [], loads = new Set();
  const bottom = $('.karaoke-bottom');
  function fitControls() {
    const frame = shell.getBoundingClientRect(), controls = bottom.getBoundingClientRect();
    // Hidden rooms report zero dimensions. Preserve the last measured clearance.
    if (frame.height <= 0 || controls.height <= 0) return;
    shell.style.setProperty('--karaoke-bottom-height', `${Math.ceil(frame.bottom - controls.top) + 8}px`);
  }
  const controlsObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(fitControls) : null;
  controlsObserver?.observe(bottom);
  controlsObserver?.observe(shell);
  fitControls();
  let applause = 0;
  try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (Number.isSafeInteger(saved?.applause) && saved.applause >= 0) applause = Math.min(saved.applause, 999999); } catch {}
  let active = false, pageVisible = true, reset = false, ready = false, loading = false, loadRun = 0;
  let raf = 0, lastTime = null, clock = 0, pose = 'idle', poseAt = 0, energy = 0;
  let reactionUntil = 0, heartUntil = 0, lastTrack = null;
  let currentTrackId = tracks[0]?.id || null;

  function selected() { return !reset && pageVisible && !document.hidden && window.LiveRooms?.activeRoom === 'karaoke'; }
  function snapshot() { return window.RoomMusic.getSnapshot(); }
  function currentTrack(state) {
    return (state.room === 'karaoke' && tracks.find(track => track.id === state.track?.id))
      || tracks.find(track => track.id === currentTrackId) || tracks[0];
  }
  function performing(state) { if(window.Roomwave?.together)return active&&Roomwave.connected('karaoke'); return active && state.room === 'karaoke' && state.playing && state.enabled && Number.isFinite(state.volume) && state.volume > 0; }
  function singing(state) { return performing(state) && window.KaraokeVocals?.isSinging(state.track, state.currentTime) === true; }
  function save() { if (!reset&&!window.Roomwave?.together) try { localStorage.setItem(storageKey, JSON.stringify({ applause })); } catch {} }

  function setPose(next) {
    if (pose === next) return;
    pose = next; poseAt = clock; singer.dataset.pose = next;
    for (const [name, node] of poseNodes) node.hidden = name !== next;
  }

  function renderControls(state = snapshot()) {
    const here = state.room === 'karaoke';
    const current = currentTrack(state);
    const title = current?.title || 'Songs are on their way';
    if (songName.textContent !== title) songName.textContent = title;
    if (current) {
      currentTrackId = current.id;
      if (here && lastTrack !== current.id) { lastTrack = current.id; energy = 0; setPose('idle'); }
    }
    sound.setAttribute('aria-pressed', String(Boolean(state.enabled)));
    sound.setAttribute('aria-label', here && ['blocked', 'error'].includes(state.status) ? 'Retry audio' : state.enabled ? 'Mute all audio' : 'Unmute all audio');
    sound.title = 'For you in every room';
    sound.querySelector('use').setAttribute('href', state.enabled ? '#icon-sound' : '#icon-muted');
    const status = !tracks.length ? 'Songs are on their way' : !state.enabled ? 'Sound is off' : !here ? 'A little music, a little company' : state.status === 'error' ? 'This song couldn’t load. Skip to another song.' : state.status === 'blocked' ? 'Tap the sound button to listen' : state.playing ? 'Music is playing' : 'Getting the next song ready…';
    const statusNode = $('.karaoke-music-status');
    if (statusNode.textContent !== status) statusNode.textContent = status;
    const available = selected() && tracks.length > 0;
    skip.disabled = !available; sound.disabled = !available;
    applaud.disabled = glow.disabled = !active;
    $('.karaoke-applause-count').textContent = applause.toLocaleString('en-US');
    applaud.setAttribute('aria-label', `Applaud June. ${applause.toLocaleString('en-US')} applause sent.`);
    shell.dataset.singing = String(singing(state));
  }

  function renderParticles() {
    for (let index = 0; index < particleNodes.length; index++) {
      const node = particleNodes[index], particle = particles[index];
      node.hidden = !particle;
      if (!particle) continue;
      const progress = Math.min(1, (clock - particle.at) / particle.duration);
      node.textContent = particle.kind === 'glow' ? '✦' : '♡';
      node.dataset.kind = particle.kind;
      node.style.left = `${particle.x}%`;
      node.style.opacity = String(Math.max(0, Math.sin(progress * Math.PI) * .9));
      node.style.transform = `translate(${Math.sin(progress * Math.PI) * particle.drift}px, ${-progress * particle.rise}px) rotate(${particle.tilt * progress}deg)`;
    }
  }

  function cheer(kind, shared = false) {
    if (!active || reset) return false;
    if(window.Roomwave?.together&&!shared)return Roomwave.send('karaoke','cheer',[kind]);
    if (kind === 'applaud'&&!shared) { applause = Math.min(999999, applause + 1); save(); }
    speech.textContent = kind === 'applaud' ? 'Aw, thank you. That means a lot.' : 'Look at those lights! This one’s for you.';
    reactionUntil = clock + 3800; heartUntil = clock + 1500;
    if (!reduced.matches) {
      for (let index = 0; index < 6; index++) {
        if (particles.length >= particleNodes.length) particles.shift();
        particles.push({ kind, at: clock, duration: 1800 + index * 90, x: 16 + index * 13.5, drift: (index % 2 ? 1 : -1) * (12 + index * 4), rise: 90 + index * 9, tilt: index % 2 ? 16 : -16 });
      }
      setPose(singing(snapshot()) ? 'heart' : 'idle');
    }
    renderParticles(); renderControls(); schedule(); return true;
  }

  function updateMouth(state, delta = 0) {
    // The offline vocal regions decide whether she sings. Mixed-track energy
    // only varies mouth size inside those regions, never during instruments.
    if (!singing(state)) { energy = 0; setPose('idle'); }
    else if (reduced.matches) setPose('soft');
    else if (clock < heartUntil) setPose('heart');
    else {
      const level = Math.max(0, Math.min(1, Number(state.level) || 0));
      energy += (level - energy) * (1 - Math.exp(-delta / (level > energy ? 80 : 130)));
      const next = energy > (pose === 'open' ? .20 : .30) ? 'open' : 'soft';
      // Enter a vocal phrase immediately; hold only changes in mouth size.
      if (pose === 'idle' || clock - poseAt >= 130) setPose(next);
    }
  }

  function tick(time) {
    raf = 0;
    if (!active) return;
    const delta = lastTime === null ? 0 : Math.min(100, Math.max(0, time - lastTime));
    lastTime = time; clock += delta;
    const state = snapshot();
    if (reactionUntil && clock >= reactionUntil) { reactionUntil = 0; speech.textContent = 'Stay a while. I’m glad you’re here.'; }
    for (let index = particles.length - 1; index >= 0; index--) if (clock - particles[index].at >= particles[index].duration) particles.splice(index, 1);
    renderControls(state); updateMouth(state, delta); renderParticles(); schedule();
  }

  function schedule() {
    if (!active || raf) return;
    const state = snapshot();
    // Even reduced motion must check media time to close between phrases.
    if (performing(state) || reactionUntil > clock || particles.length) raf = requestAnimationFrame(tick);
    else lastTime = null;
  }

  function syncActive() {
    const chosen = selected();
    if (chosen && !ready && !loading && !loadRun) loadArtwork();
    const next = chosen && ready;
    if (next !== active) {
      active = next; lastTime = null;
      if (!active) { cancelAnimationFrame(raf); raf = 0; energy = 0; setPose('idle'); }
    }
    shell.classList.toggle('is-paused', !active);
    const state = snapshot();
    renderControls(state); updateMouth(state); schedule();
  }

  function loadImage(name, run) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const pending = { cancel: () => finish(new Error('Canceled')) };
      let settled = false;
      function finish(error) {
        if (settled) return; settled = true; clearTimeout(timeout); loads.delete(pending); image.onload = image.onerror = null;
        if (error) reject(error); else resolve([name, image.src]);
      }
      const timeout = setTimeout(() => finish(new Error('Artwork timed out')), 12000);
      loads.add(pending); image.onload = () => finish(); image.onerror = () => finish(new Error('Artwork unavailable'));
      image.src = `${name.startsWith('june-') ? singerAssets : assets}${name}.lossless.webp${run > 1 ? `?retry=${run}` : ''}`;
      if (image.complete && image.naturalWidth) finish();
    });
  }

  async function loadArtwork() {
    if (loading || reset) return;
    loading = true; const run = ++loadRun;
    const status = $('.karaoke-art-status'), retry = status.querySelector('button');
    status.hidden = false; retry.hidden = true; status.querySelector('span').textContent = 'Getting the room ready…';
    try {
      const loaded = await Promise.all(['room', ...poses.map(name => `june-${name}`)].map(name => loadImage(name, run)));
      if (reset || run !== loadRun) return;
      const urls = new Map(loaded);
      $('.karaoke-background').src = urls.get('room');
      for (const [name, node] of poseNodes) node.src = urls.get(`june-${name}`);
      ready = true; status.hidden = true; syncActive();
    } catch {
      if (reset || run !== loadRun) return;
      status.querySelector('span').textContent = 'The room artwork couldn’t load.'; retry.hidden = false;
    } finally { if (run === loadRun) loading = false; }
  }

  skip.addEventListener('click', () => {
    if (!selected() || !tracks.length) return;
    if(window.Roomwave?.together){Roomwave.send('karaoke','skip',[]);return;}
    const current = currentTrack(snapshot());
    const index = tracks.findIndex(track => track.id === current?.id);
    window.RoomMusic.selectTrack('karaoke', tracks[(index + 1) % tracks.length].id);
  });
  sound.addEventListener('click', () => { if (selected()) { const state = snapshot(); window.RoomMusic.setEnabled(['blocked', 'error'].includes(state.status) ? true : !state.enabled); } });
  applaud.addEventListener('click', () => cheer('applaud'));
  glow.addEventListener('click', () => cheer('glow'));
  $('.karaoke-art-status button').addEventListener('click', loadArtwork);
  window.addEventListener('room-music-state', () => {
    if (reset) return;
    const state = snapshot();
    renderControls(state); updateMouth(state); schedule();
  });
  window.addEventListener('live-room-change', syncActive);
  document.addEventListener('visibilitychange', syncActive);
  window.addEventListener('pagehide', () => { pageVisible = false; syncActive(); save(); });
  window.addEventListener('pageshow', () => { pageVisible = true; syncActive(); });
  window.addEventListener('stream:resetting', () => {
    reset = true; reactionUntil = heartUntil = 0; particles.length = 0;
    for (const pending of [...loads]) pending.cancel();
    renderParticles(); syncActive();
  });
  reduced.addEventListener?.('change', () => {
    particles.length = 0; heartUntil = 0; renderParticles();
    syncActive();
  });
  const sharedCheers={applaud:0,glow:0};
  window.KaraokeRoom = Object.freeze({
    applySharedFrame(frame){
      applause=frame.applause;
      const cheers=frame.cheers||(frame.cheer?{[frame.cheer.kind]:frame.cheer}:{});
      for(const kind of ['applaud','glow']){
        const event=cheers[kind];
        if(event&&event.id>sharedCheers[kind]){
          sharedCheers[kind]=event.id;
          if(frame.clock-event.at<1800)cheer(kind,true);
        }
      }
      renderControls();schedule();
    },
    get active() { return active; }, get ready() { return ready; },
    get state() { return Object.freeze({ applause }); },
    get frame() { return Object.freeze({ clock, pose, energy, particleCount: particles.length, reactionUntil }); }
  });
  renderControls(); syncActive();
})();
