(() => {
  'use strict';
  const room = document.getElementById('workout-room');
  if (!room || !window.WorkoutState) return;
  const assets = 'assets/workout-room-v1/';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let saved;
  try { saved = JSON.parse(localStorage.getItem(WorkoutState.storageKey)); } catch {}
  const model = (window.Roomwave ? window.Roomwave.createModel('workout', WorkoutState.create, saved) : WorkoutState.create(saved));
  const icons = {
    pushups: '<circle cx="17" cy="17" r="4"/><path d="m19 25 20 5 10 9m-30-14-6 11H7m17-10-1 14h-8"/>',
    squats: '<circle cx="31" cy="10" r="4"/><path d="m28 19-7 13 15 6-5 11h12M26 23l15 2 10-4M22 32l-8 13h12"/>',
    weights: '<path d="M8 21v18m7-24v30m7-15h16m3-15v30m7-24v18"/>',
    yoga: '<circle cx="28" cy="10" r="4"/><path d="M28 19v14m0-12L18 35 8 38m20-17 10 14 10 3M28 33 12 46h32Z"/>'
  };
  const icon = name => `<svg viewBox="0 0 56 56" aria-hidden="true">${icons[name]}</svg>`;
  room.innerHTML = `
    <div class="workout-ambient" aria-hidden="true"></div>
    <div class="workout-shell" data-exercise="idle">
      <div class="workout-backdrop" aria-hidden="true"></div>
      <header class="workout-header">
        <div class="workout-profile">${icon('weights')}<div class="room-heading"><strong class="room-host-name">Brooke</strong><small class="room-type">Fitness</small></div><span class="workout-live">LIVE</span></div>
        <button class="workout-sound" type="button" aria-label="Unmute Fitness sounds" aria-pressed="false"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button>
      </header>
      <div class="workout-rep-card" aria-label="Exercise progress"><span class="workout-counter-label">Curls</span><strong><span class="workout-reps">0</span><small> / <span class="workout-target">10</span></small></strong><span class="workout-cue">Choose an exercise</span><span class="workout-pose-name" hidden></span>
        <div class="workout-energy" role="meter" aria-label="Energy" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" aria-valuetext="100% energy"><span aria-hidden="true">⚡ Energy</span><span class="workout-energy-track" aria-hidden="true"><i></i></span></div>
      </div>
      <div class="workout-scene" role="img" aria-label="A woman ready to exercise in a sunny home gym">
        <div class="workout-shadow" aria-hidden="true"></div>
        <img class="workout-sprite" src="${assets}weights-0.webp" alt="" draggable="false">
        <div class="workout-celebration" aria-hidden="true"><span>✦</span><span>♥</span><span>✧</span></div>
      </div>
      <div class="workout-bottom">
        <p class="workout-speech" role="status" aria-live="polite">Let’s get moving!</p>
        <section class="workout-exercises" aria-labelledby="workout-exercise-title">
          <div class="workout-exercise-heading"><h2 id="workout-exercise-title">Choose an exercise</h2><span class="workout-set-count">0 sets</span></div>
          <div class="workout-actions">${Object.entries(WorkoutState.exercises).map(([key,value]) => `<button type="button" data-workout-action="${key}" aria-pressed="false">${icon(key)}<b>${value.label}</b></button>`).join('')}</div>
          <div class="workout-progress" aria-hidden="true"><i></i></div>
        </section>
      </div>
      <div class="workout-art-status" role="status" hidden><span>Getting the gym ready…</span><button type="button" hidden>Retry artwork</button></div>
    </div>`;
  const $ = selector => room.querySelector(selector);
  const shell = $('.workout-shell'), sprite = $('.workout-sprite'), speech = $('.workout-speech');
  const controls = [...room.querySelectorAll('[data-workout-action]')];
  const poseVersion = pose => WorkoutState.reactionPoses.find(item => item.pose === pose)?.version || WorkoutState.yogaPoses.find(item => item.pose === pose)?.version || 1;
  const poseUrl = pose => `assets/workout-room-v${poseVersion(pose)}/${pose}.webp${assetSuffix}`;
  let enabled = false, reset = false, ready = false, loading = false, loadAttempt = 0;
  let raf = 0, lastTime = 0, lastSave = 0, lastPose = '', lastText = '', lastAction = '', lastReps = -1;
  let lastEnergy = -1;
  let sound = false, audioContext, audioEpoch = 0;
  const nodes = new Set();
  const loadedArtwork = new Map();
  let assetSuffix = '';
  const fitControls = () => shell.style.setProperty('--workout-controls-height', `${Math.ceil($('.workout-bottom').getBoundingClientRect().height)}px`);
  const controlsObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(fitControls) : null;
  controlsObserver?.observe($('.workout-bottom'));
  fitControls();
  try { sound = localStorage.getItem('roomwave-workout-sound-v1') === 'on'; } catch {}
  function save() { if(!reset&&!window.Roomwave?.together)try { localStorage.setItem(WorkoutState.storageKey, JSON.stringify(model.state)); } catch {} }
  function silence() { audioEpoch++; for (const node of nodes) try { node.stop(); } catch {} nodes.clear(); }
  function chime(complete = false) {
    if (!sound || !enabled || reset) return;
    const epoch = audioEpoch;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ||= new Audio();
      audioContext.resume().then(() => {
        if (epoch !== audioEpoch || !sound || !enabled || reset) return;
        for (const [index, frequency] of (complete ? [523,659,784] : [440]).entries()) {
          const oscillator = audioContext.createOscillator(), volume = audioContext.createGain();
          const at = audioContext.currentTime + index * .12;
          oscillator.type = 'sine'; oscillator.frequency.value = frequency;
          volume.gain.setValueAtTime(0, at); volume.gain.linearRampToValueAtTime(.04, at + .012); volume.gain.exponentialRampToValueAtTime(.001, at + .18);
          oscillator.connect(volume); volume.connect(audioContext.destination); oscillator.start(at); oscillator.stop(at + .2);
          nodes.add(oscillator); oscillator.onended = () => { nodes.delete(oscillator); oscillator.disconnect(); volume.disconnect(); };
        }
      }).catch(() => {});
    } catch {}
  }
  function updateSound() {
    const button = $('.workout-sound');
    button.setAttribute('aria-pressed', String(sound)); button.setAttribute('aria-label', `${sound ? 'Mute' : 'Unmute'} all audio`); button.title = 'For you in every room';
    button.querySelector('use').setAttribute('href', sound ? '#icon-sound' : '#icon-muted');
  }
  window.UserAudio?.subscribe(value => { sound = value; updateSound(); if (!sound) silence(); });
  $('.workout-sound').addEventListener('click', () => {
    if (window.UserAudio) { window.UserAudio.toggle(); return; }
    if (!enabled) return;
    sound = !sound; updateSound(); if (sound) chime(); else silence();
    try { localStorage.setItem('roomwave-workout-sound-v1', sound ? 'on' : 'off'); } catch {}
  });
  function render() {
    const frame = model.frame, state = model.state;
    // Reduced motion retains a static representative pose while progress and completion continue.
    const pose = reducedMotion.matches && frame.action && frame.action !== 'yoga'
      ? (frame.resting ? frame.reactionPose : `${frame.action}-0`) : frame.pose;
    if (pose !== lastPose) { sprite.src = poseUrl(pose); lastPose = pose; }
    if (frame.text !== lastText) { speech.textContent = frame.text; lastText = frame.text; }
    if (frame.action !== lastAction) {
      shell.dataset.exercise = frame.action || 'idle'; lastAction = frame.action;
      for (const control of controls) control.setAttribute('aria-pressed', String(control.dataset.workoutAction === frame.action));
    }
    shell.dataset.poseExercise = frame.pose.split('-')[0];
    shell.dataset.floorPose = String(Boolean(frame.floor));
    shell.dataset.energyRange = frame.energyRange;
    shell.dataset.resting = String(frame.resting);
    const energy = Math.round(frame.energy);
    if (energy !== lastEnergy) {
      const meter = $('.workout-energy');
      meter.setAttribute('aria-valuenow', String(energy));
      meter.setAttribute('aria-valuetext', `${energy}% energy`);
      $('.workout-energy-track i').style.transform = `scaleX(${frame.energy / 100})`;
      lastEnergy = energy;
    }
    const poseName = $('.workout-pose-name');
    poseName.hidden = !frame.poseName;
    if (poseName.textContent !== frame.poseName) poseName.textContent = frame.poseName;
    if (frame.repetitions !== lastReps) { $('.workout-reps').textContent = frame.repetitions; lastReps = frame.repetitions; }
    $('.workout-counter-label').textContent = frame.label; $('.workout-target').textContent = frame.target; $('.workout-cue').textContent = frame.cue;
    $('.workout-progress i').style.transform = `scaleX(${frame.progress})`;
    $('.workout-set-count').textContent = `${state.sets} ${state.sets === 1 ? 'set' : 'sets'}`;
    shell.classList.toggle('workout-complete', frame.completed);
    $('.workout-scene').setAttribute('aria-label', frame.action ? `Workout: ${WorkoutState.exercises[frame.action].label}. ${frame.repetitions} of ${frame.target} ${frame.action === 'yoga' ? 'breaths' : 'repetitions'} completed.${frame.poseName ? ` ${frame.poseName}.` : ''}${frame.resting ? ' Catching her breath before continuing.' : ''}` : 'A woman ready to exercise in a sunny home gym');
    for (const control of controls) control.disabled = !enabled || !ready || (window.Roomwave?.together && (!Roomwave.connected('workout') || Boolean(frame.action)));
  }
  function tick(time) {
    if (!enabled || reset) return;
    // Loading time must not count toward an automatic exercise or recovery.
    const event = ready ? model.tick(lastTime ? Math.min(1000, time - lastTime) : 0) : null;
    lastTime = time; render();
    if (event) { chime(event === 'complete'); save(); }
    if (time - lastSave > 5000) { save(); lastSave = time; }
    raf = requestAnimationFrame(tick);
  }
  function setActivity() {
    const next = !reset && !document.hidden && window.LiveRooms?.activeRoom === 'workout';
    if (next === enabled) return;
    enabled = next; model.setActive(next); lastTime = 0;
    shell.classList.toggle('is-paused', !next);
    cancelAnimationFrame(raf); raf = 0;
    if (next) { if (!ready) loadArtwork(); raf = requestAnimationFrame(tick); }
    else { silence(); save(); }
    render();
  }
  function start(exercise) {
    if (!enabled || !ready || reset) return false;
    const started = model.start(exercise);
    if (started) { chime(); render(); save(); }
    return started;
  }
  for (const control of controls) control.addEventListener('click', () => start(control.dataset.workoutAction));
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => { img.onload = img.onerror = null; reject(new Error('Artwork timeout')); }, 12000);
      img.onload = () => { clearTimeout(timer); resolve(img); };
      img.onerror = () => { clearTimeout(timer); reject(new Error('Artwork unavailable')); };
      img.src = url;
    });
  }
  async function loadArtwork() {
    if (loading || ready || reset) return;
    loading = true; const attempt = ++loadAttempt;
    const status = $('.workout-art-status'), retry = status.querySelector('button');
    status.hidden = false; retry.hidden = true; status.querySelector('span').textContent = 'Getting the gym ready…';
    try {
      const names = ['gym', ...['pushups','squats','weights'].flatMap(name => [0,1,2,3].map(index => `${name}-${index}`)), ...WorkoutState.yogaPoses.map(pose => pose.pose), ...WorkoutState.reactionPoses.map(pose => pose.pose)];
      const suffix = attempt > 1 ? `?retry=${attempt}` : '';
      const images = await Promise.all(names.map(name => loadImage(`assets/workout-room-v${poseVersion(name)}/${name}.webp${suffix}`)));
      if (reset || attempt !== loadAttempt) return;
      images.forEach((img, index) => loadedArtwork.set(names[index], img));
      assetSuffix = suffix; lastPose = '';
      $('.workout-backdrop').style.backgroundImage = `url("${assets}gym.webp${suffix}")`;
      $('.workout-ambient').style.backgroundImage = `linear-gradient(#19243a55,#111c33aa),url("${assets}gym.webp${suffix}")`;
      ready = true; lastTime = 0; status.hidden = true;
    } catch {
      if (reset || attempt !== loadAttempt) return;
      status.querySelector('span').textContent = 'The gym artwork couldn’t load.'; retry.hidden = false;
    } finally { if (attempt === loadAttempt) loading = false; render(); }
  }
  $('.workout-art-status button').addEventListener('click', loadArtwork);
  window.addEventListener('live-room-change', setActivity);
  document.addEventListener('visibilitychange', setActivity);
  window.addEventListener('pagehide', () => { save(); enabled = false; model.setActive(false); shell.classList.add('is-paused'); cancelAnimationFrame(raf); silence(); });
  window.addEventListener('pageshow', setActivity);
  window.addEventListener('stream:resetting', () => {
    reset = true; enabled = false; model.setActive(false); loadAttempt++;
    shell.classList.add('is-paused'); cancelAnimationFrame(raf); silence(); render();
  });
  reducedMotion.addEventListener?.('change', render);
  window.WorkoutRoom = Object.freeze({
    get state() { return model.state; }, get action() { return model.action; }, get frame() { return model.frame; },
    get active() { return enabled; }, get ready() { return ready; }
  });
  shell.classList.add('is-paused'); updateSound(); render(); setActivity();
})();
