(() => {
  'use strict';

  const catalog = window.RoomMusicCatalog;
  if (!catalog || typeof window.Audio !== 'function') return;
  const storageKey = 'roomwave-room-music-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch {}
  let enabled = window.UserAudio?.enabled ?? saved.enabled !== false;
  let volume = typeof saved.volume === 'number' && Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : .35;
  let selections = saved.selections && typeof saved.selections === 'object' && !Array.isArray(saved.selections) ? { ...saved.selections } : {};
  let room = window.LiveRooms?.activeRoom || document.body.dataset.liveRoom || 'stream';
  let pageActive = true, generation = 0, active = null, incoming = null, timer = 0, lastNotification = 0;
  let status = 'off', blocked = false, loopAttempted = false;
  let context = null, analyser = null, samples = null, resumePending = null, resumeRequest = 0;
  let pickerTone = null, pickerSoundRequest = 0;
  const players = [];
  const positions = new Map();
  let sharedPlayback=null;
  const sharedTime=()=>sharedPlayback?sharedPlayback.elapsed/1000+Math.max(0,(performance.now()-sharedPlayback.received)/1000):0;
  const sharedKaraoke=()=>window.Roomwave?.together&&room==='karaoke';
  function setSharedPlayback(frame){
    const track=frame.trackId?catalog.karaoke.find(track=>track.id===frame.trackId):catalog.karaoke[frame.index];if(!track)return;
    // A latency projection can briefly cross the next song boundary. Never
    // reload an older song if the next snapshot projects less far ahead.
    if(sharedPlayback&&(frame.epoch<sharedPlayback.epoch||(frame.epoch===sharedPlayback.epoch&&frame.clock<sharedPlayback.clock)))return;
    const changed=selections.karaoke!==track.id||sharedPlayback?.epoch!==frame.epoch;
    sharedPlayback={...frame,received:performance.now()};
    selections.karaoke=track.id;positions.set(keyFor('karaoke',track),sharedTime());
    if(room==='karaoke'){
      if(changed||(!active&&!['blocked','error'].includes(status))){stop();positions.set(keyFor('karaoke',track),sharedTime());sync();}
      reconcileSharedPlayback();
    }
  }
  function reconcileSharedPlayback(){
    if(!sharedKaraoke()||!sharedPlayback||active?.group!=='karaoke')return;
    const deck=active,audio=deck.audio,now=performance.now(),target=sharedTime(),drift=target-audio.currentTime;
    // Network jitter is not a reason to interrupt a vocal. Let metadata,
    // buffering and any previous seek finish before measuring sustained drift.
    if(!isPlaying(deck)||audio.readyState<3||audio.seeking||Math.abs(drift)<1.5){deck.driftSince=null;return;}
    const direction=Math.sign(drift);
    if(deck.driftSince===null||deck.driftDirection!==direction){deck.driftSince=now;deck.driftDirection=direction;return;}
    if(now-deck.driftSince<2000||now-deck.lastSeekAt<8000)return;
    // Only jump to audio already buffered, avoiding another stalled download.
    const end=endOf(deck);
    if(target<startOf(deck.track)||(end&&target>=end-.25))return;
    let buffered=false;
    for(let i=0;i<audio.buffered.length;i++)if(audio.buffered.start(i)<=target&&audio.buffered.end(i)>=target+.25){buffered=true;break;}
    if(!buffered)return;
    deck.driftSince=null;deck.lastSeekAt=now;deck.resumePosition=target;
    try{audio.currentTime=target}catch{}
  }

  const group = () => room;
  const tracksFor = id => (id === 'karaoke' ? catalog.karaoke : catalog.background?.[id]) || [];
  const defaultTracks = { 'gaming-seated': 'gaming-v2', gaming: 'gaming-v2', workout: 'workout-v2', stream: 'stella-mia-v2', 'mia-lilly': 'stella-mia-v2', dog: 'dog-v2', baking: 'baking-v2', fortune: 'fortune-v2' };
  const selectedFor = id => (id === 'karaoke' ? tracksFor(id).find(track => track.id === selections[id]) : tracksFor(id).find(track => track.id === defaultTracks[id]) || tracksFor(id).find(track => track.version === 2)) || tracksFor(id)[0] || null;
  const soundSelector = '.sound-button,.ml-sound,.dog-sound,.gaming-sound,.seated-sound,.workout-sound,.baking-sound,.fortune-sound,.karaoke-sound';
  const soundFor = id => document.querySelector('[data-live-room-panel="' + id + '"]')?.querySelector(soundSelector);
  let resetMuted = Boolean(window.wardrobe?.resetting);
  function roomEnabled() {
    return !resetMuted && enabled;
  }
  const audible = () => roomEnabled() && pageActive && !document.hidden;
  const isPlaying = deck => Boolean(deck && deck.started && !deck.audio.paused && !deck.audio.ended);
  const isAudible = deck => isPlaying(deck) && (!deck.player.source || context?.state === 'running');
  const keyFor = (id, track) => `${id}:${track.id}`;
  const playbackVolume = id => volume * (id === 'karaoke' ? 1 : .65);
  const startOf = track => Math.max(0, Number(track.trimStart) || 0);
  function endOf(deck) {
    const duration = Number.isFinite(deck.audio.duration) ? deck.audio.duration : Number(deck.track.duration) || 0;
    return deck.track.trimEnd > startOf(deck.track) ? (duration ? Math.min(duration, deck.track.trimEnd) : deck.track.trimEnd) : duration;
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({ enabled, volume, selections })); } catch {}
  }
  function level() {
    if (!audible() || volume === 0 || (!isAudible(active) && !isAudible(incoming))) return 0;
    if (analyser && context.state === 'running') {
      analyser.getByteTimeDomainData(samples);
      let energy = 0;
      for (const sample of samples) energy += ((sample - 128) / 128) ** 2;
      return Math.min(1, Math.sqrt(energy / samples.length) * 5);
    }
    return .3;
  }
  function getSnapshot() {
    const track = selectedFor(group());
    return {
      room, group: group(), track, enabled: roomEnabled(), volume, status,
      playing: audible() && (isAudible(active) || isAudible(incoming)),
      // Follow the recording being heard, rather than a jittery network clock,
      // for the singer's mouth. Muted listeners still see the shared timeline.
      currentTime: active?.audio.readyState>=1 ? active.audio.currentTime : sharedKaraoke()&&sharedPlayback ? sharedTime() : 0,
      duration: active ? endOf(active) : Number(track?.duration) || 0,
      level: level()
    };
  }

  const control = document.createElement('div');
  control.className = 'room-music-control';
  control.innerHTML = `<button class="room-music-open" type="button" aria-label="Choose a song" title="Choose a song" aria-expanded="false" aria-controls="room-music-settings">♫ Songs</button>
    <section id="room-music-settings" class="room-music-settings" aria-label="Choose a song" hidden>
      <div class="room-music-heading"><strong>Choose a song</strong><button class="room-music-close" type="button" aria-label="Close song picker">×</button></div>
      <select id="room-music-track" aria-label="Song"></select>
    </section>`;
  document.body.appendChild(control);
  const openButton = control.querySelector('.room-music-open');
  const panel = control.querySelector('.room-music-settings');
  const select = control.querySelector('#room-music-track');
  let renderedGroup = null;
  function closePanel() { panel.hidden = true; openButton.setAttribute('aria-expanded', 'false'); stopPickerSound(); }
  function stopPickerSound() {
    pickerSoundRequest++;
    if (!pickerTone) return;
    pickerTone.gain.gain.value = 0;
    try { pickerTone.node.stop(); } catch {}
    pickerTone = null;
  }
  function playPickerSound() {
    stopPickerSound();
    const request = pickerSoundRequest;
    const play = () => {
      if (request !== pickerSoundRequest || panel.hidden || !audible() || context?.state !== 'running') return;
      try {
        const node = context.createOscillator(), gain = context.createGain(), at = context.currentTime;
        const tone = { node, gain };
        node.type = 'sine';
        node.frequency.setValueAtTime(880, at);
        node.frequency.exponentialRampToValueAtTime(1174, at + .09);
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(.035, at + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .12);
        node.connect(gain);
        // UI feedback must not drive June's vocal animation.
        gain.connect(context.destination);
        node.onended = () => { node.disconnect(); gain.disconnect(); if (pickerTone === tone) pickerTone = null; };
        pickerTone = tone;
        node.start(at); node.stop(at + .14);
      } catch {}
    };
    if (resumePending) resumePending.then(play);
    else play();
  }
  function dockControl() {
    const roomPanel = document.querySelector('[data-live-room-panel="' + room + '"]');
    const sound = soundFor(room);
    const header = sound?.parentElement;
    control.hidden = room !== 'karaoke' || !header;
    if (control.hidden) { closePanel(); return; }
    // Keep the shortcut in the same header as mute, including during a swipe.
    // Do not reinsert on playback updates: that would disturb keyboard focus.
    if (header && control.parentElement !== header) header.insertBefore(control, sound);
    if (header) {
      const bounds = roomPanel.querySelector('.stage-camera') || roomPanel;
      const available = bounds.getBoundingClientRect().bottom - sound.getBoundingClientRect().bottom - 16;
      panel.style.maxHeight = `${Math.max(80, Math.floor(available))}px`;
    }
  }
  function render() {
    const id = group(), tracks = id === 'karaoke' ? tracksFor(id) : [selectedFor(id)].filter(Boolean);
    dockControl();
    if (renderedGroup !== id) {
      renderedGroup = id;
      select.replaceChildren();
      tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track.id;
        option.textContent = track.title;
        select.appendChild(option);
      });
      closePanel();
    }
    select.value = selectedFor(id)?.id || '';
    select.disabled = !tracks.length;
  }
  function notify() {
    render();
    window.dispatchEvent(new CustomEvent('room-music-state', { detail: getSnapshot() }));
  }
  function connect(player) {
    // Leave direct autoplay audible until the optional analyser can output sound.
    if (!context || context.state !== 'running' || player.source) return;
    try {
      player.source = context.createMediaElementSource(player.audio);
      player.gain = context.createGain();
      player.gain.gain.value = player.audio.volume;
      player.audio.volume = 1;
      player.source.connect(player.gain);
      player.gain.connect(analyser);
    } catch {}
  }
  function setDeckVolume(deck, value) {
    if (deck.player.gain) deck.player.gain.gain.value = value;
    else deck.audio.volume = value;
  }
  function contextChanged() {
    if (context?.state === 'running') {
      for (const player of players) connect(player);
      if (audible() && active) {
        blocked = false;
        if (active.audio.paused && !active.audio.ended) {
          status = 'loading'; play(active, generation);
        } else if (isPlaying(active) || isPlaying(incoming)) status = 'playing';
        schedule();
      }
    } else if (audible() && (active?.player.source || incoming?.player.source)) {
      blocked = true; status = 'blocked';
    }
    notify();
  }
  function resumeContext(fromGesture = false) {
    if (!context || !audible() || !['suspended', 'interrupted'].includes(context.state) || (resumePending && !fromGesture)) return;
    const request = ++resumeRequest;
    try {
      resumePending = Promise.resolve(context.resume()).then(contextChanged, contextChanged).finally(() => {
        if (request === resumeRequest) resumePending = null;
      });
    } catch { contextChanged(); }
  }
  function unlock() {
    // Only create the audio graph inside a user gesture. Direct media playback
    // remains available when Web Audio is unsupported.
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!context && AudioContext) {
        context = new AudioContext();
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        samples = new Uint8Array(analyser.fftSize);
        analyser.connect(context.destination);
        context.addEventListener('statechange', contextChanged);
      }
      if (context?.state === 'running') for (const player of players) connect(player);
      resumeContext(true);
    } catch {}
  }
  function dispose(deck) {
    if (!deck) return;
    deck.stale = true;
    for (const [name, handler] of deck.listeners) deck.audio.removeEventListener(name, handler);
    if (deck.player.owner !== deck) return;
    deck.player.owner = null;
    deck.audio.pause();
    setDeckVolume(deck, 0);
    deck.audio.removeAttribute('src');
    deck.audio.load();
  }
  function remember() {
    if (!active || !Number.isFinite(active.audio.currentTime)) return;
    // A newly created media element may still report zero before metadata or
    // its resume seek arrives. Leaving again must not erase the saved offset.
    const position = active.resumePosition === null ? active.audio.currentTime : Math.max(active.audio.currentTime, active.resumePosition);
    positions.set(keyFor(active.group, active.track), position);
  }
  function stop() {
    generation++;
    remember();
    const previous = active, next = incoming;
    active = null; incoming = null;
    window.clearTimeout(timer); timer = 0;
    dispose(previous); dispose(next);
    loopAttempted = false;
  }
  function valid(deck, token) { return !deck.stale && deck.player.owner === deck && token === generation && audible() && (active === deck || incoming === deck); }
  function playbackFailed(deck, token, error) {
    if (!valid(deck, token)) return;
    if (incoming === deck && active) {
      incoming = null; dispose(deck); setDeckVolume(active, playbackVolume(active.group));
      if (active.audio.ended || active.audio.currentTime >= endOf(active)) restartLoaded();
      return; // The original deck can finish; retry at its next boundary.
    }
    stop();
    blocked = error?.name === 'NotAllowedError';
    status = blocked ? 'blocked' : 'error';
    notify();
  }
  function play(deck, token, fromGesture = false) {
    if (deck.playPending && !fromGesture) return;
    deck.playPending = true;
    const request = ++deck.playRequest;
    let result;
    try { result = deck.audio.play(); } catch (error) { deck.playPending = false; playbackFailed(deck, token, error); return; }
    Promise.resolve(result).then(() => {
      // A slow media promise must never revive a room we have already left.
      // Its element may now belong to that newer room, so do not pause it.
      if (!valid(deck, token)) { if (!deck.player.owner || deck.player.owner === deck) deck.audio.pause(); return; }
      if (request !== deck.playRequest) return;
      deck.playPending = false;
      blocked = Boolean(deck.player.source && context?.state !== 'running');
      status = blocked ? 'blocked' : 'playing';
      schedule(); notify();
    }).catch(error => {
      if (request !== deck.playRequest) return;
      deck.playPending = false;
      playbackFailed(deck, token, error);
    });
  }
  function createDeck(track, id, position, quiet = false) {
    // Safari grants playback permission per element. Keep the two crossfade
    // players and their audio graph when changing rooms or resuming the page.
    let player = players.find(item => !item.owner && item.played) || players.find(item => !item.owner);
    if (!player) {
      player = { audio: new window.Audio(), owner: null, source: null, gain: null, played: false };
      players.push(player);
    }
    const audio = player.audio;
    const deck = { audio, player, track, group: id, started: false, stale: false, fadeStart: null, resumePosition: position, listeners: [], playPending: false, playRequest: 0, lastSeekAt: performance.now(), driftSince: null, driftDirection: 0 };
    player.owner = deck;
    const token = generation;
    audio.preload = 'auto';
    setDeckVolume(deck, quiet ? 0 : playbackVolume(id));
    audio.loop = false;
    const listen = (name, handler) => { deck.listeners.push([name, handler]); audio.addEventListener(name, handler); };
    function confirmResume() {
      if (valid(deck, token) && deck.resumePosition !== null && !audio.seeking && audio.currentTime >= deck.resumePosition - .01) deck.resumePosition = null;
    }
    listen('seeked', confirmResume);
    listen('loadedmetadata', () => {
      if (!valid(deck, token)) return;
      const end = endOf(deck);
      if(window.Roomwave?.together&&id==='karaoke'&&sharedPlayback)position=sharedTime();
      const seek = position >= startOf(track) && (!end || position < end - .1) ? position : startOf(track);
      deck.resumePosition = seek;
      try { audio.currentTime = seek; } catch {}
      notify();
    });
    listen('playing', () => {
      if (!valid(deck, token)) { if (!player.owner || player.owner === deck) audio.pause(); return; }
      confirmResume();
      deck.started = true; player.played = true;
      if (incoming === deck) deck.fadeStart = audio.currentTime;
      blocked = Boolean(player.source && context?.state !== 'running');
      status = blocked ? 'blocked' : 'playing'; schedule(); notify();
    });
    listen('waiting', () => { if (valid(deck, token)) { deck.started = false; deck.driftSince=null; notify(); } });
    listen('pause', () => { deck.started = false; if (valid(deck, token)) { status = 'paused'; notify(); } });
    listen('error', () => playbackFailed(deck, token, audio.error));
    listen('ended', () => {
      deck.started = false;
      if (valid(deck, token) && active === deck) boundary();
    });
    // Refresh cached responses from before the server supported media seeking.
    audio.src = track.src + (track.src.includes('?') ? '&' : '?') + 'resume=1';
    // Shared Karaoke waits for metadata so there is only one initial seek to
    // the current live position, even when downloading the song is slow.
    if(!(window.Roomwave?.together&&id==='karaoke'))try { audio.currentTime = position; } catch {}
    connect(player);
    return deck;
  }
  function schedule() {
    if (!timer && active && audible()) timer = window.setTimeout(tick, 50);
  }
  function promote() {
    if (!incoming) return;
    const old = active;
    active = incoming; incoming = null;
    setDeckVolume(active, playbackVolume(active.group));
    loopAttempted = false;
    dispose(old);
  }
  function restartLoaded() {
    if (!active || !audible()) return;
    // A slow overlap request must not hold a finished track in silence. The
    // original media already has this recording buffered, so reuse it.
    const abandoned = incoming;
    incoming = null;
    dispose(abandoned);
    loopAttempted = false;
    try { active.audio.currentTime = startOf(active.track); } catch {}
    setDeckVolume(active, playbackVolume(active.group));
    status = 'loading';
    play(active, generation);
    schedule();
  }
  function boundary() {
    if (!active || !audible()) return;
    if (active.group === 'karaoke') {
      if(window.Roomwave?.together)return;
      const tracks = tracksFor('karaoke');
      const next = tracks[(tracks.findIndex(track => track.id === active.track.id) + 1) % tracks.length];
      positions.set(keyFor('karaoke', active.track), startOf(active.track));
      // stop() records positions, so reset the finished position after it runs.
      stop();
      if (next) { selections.karaoke = next.id; positions.set(keyFor('karaoke', next), startOf(next)); save(); sync(); }
      return;
    }
    if (incoming && isPlaying(incoming)) promote();
    else restartLoaded();
  }
  function tick() {
    timer = 0;
    if (!active || !audible()) return;
    const end = endOf(active), start = startOf(active.track);
    const fadeLength = Math.min(1.2, Math.max(0, (end - start) / 4));
    if (active.group !== 'karaoke' && end > start && isPlaying(active) && !incoming && !loopAttempted && active.audio.currentTime >= end - fadeLength) {
      loopAttempted = true;
      incoming = createDeck(active.track, active.group, start, true);
      play(incoming, generation);
    }
    if (incoming && isPlaying(incoming)) {
      const elapsed = incoming.audio.currentTime - (incoming.fadeStart ?? startOf(incoming.track));
      const progress = Math.min(1, Math.max(0, elapsed / (fadeLength || 1)));
      setDeckVolume(active, playbackVolume(active.group) * (1 - progress));
      setDeckVolume(incoming, playbackVolume(incoming.group) * progress);
      if (progress >= 1 || active.audio.ended || active.audio.currentTime >= end) promote();
    }
    if (active && endOf(active) > 0 && active.audio.currentTime >= endOf(active)) boundary();
    if (Date.now() - lastNotification > 500) { lastNotification = Date.now(); notify(); }
    schedule();
  }
  function sync({ fromGesture = false } = {}) {
    const id = group(), track = selectedFor(id);
    if (!audible() || !track) {
      stopPickerSound();
      stop(); status = !roomEnabled() ? 'off' : !track ? 'empty' : 'paused'; notify(); return;
    }
    // Do not briefly play a saved or outdated song while joining a shared room.
    if(sharedKaraoke()&&!active&&(!sharedPlayback||window.Roomwave.connected?.('karaoke')===false)){
      stop();status='loading';notify();return;
    }
    resumeContext(fromGesture);
    if (active?.track.id === track.id && active.group === id) {
      if (active.audio.ended) boundary();
      else if (active.audio.paused || (fromGesture && !isPlaying(active))) {
        status = 'loading'; play(active, generation, fromGesture); schedule();
      }
      notify(); return;
    }
    stop(); blocked = false; status = 'loading';
    active = createDeck(track, id, positions.get(keyFor(id, track)) ?? startOf(track));
    play(active, generation);
    schedule(); notify();
  }
  function applyEnabled(value, { gesture = false } = {}) {
    enabled = Boolean(value); blocked = false;
    if (enabled && gesture) {
      if (volume === 0) volume = .35;
      unlock();
    }
    save(); sync({ fromGesture: enabled && gesture });
  }
  function setEnabled(value) {
    if (window.UserAudio) window.UserAudio.setEnabled(value);
    else applyEnabled(value, { gesture: true });
  }
  function setVolume(value) {
    if (!Number.isFinite(Number(value))) return;
    volume = Math.max(0, Math.min(1, Number(value)));
    if (active) setDeckVolume(active, playbackVolume(active.group));
    if (incoming) setDeckVolume(incoming, 0);
    save(); notify();
  }
  function selectTrack(id, trackId) {
    if (id !== 'karaoke') return false;
    if(window.Roomwave?.together&&id==='karaoke')return Roomwave.send('karaoke','track',[trackId]);
    const track = tracksFor(id).find(item => item.id === trackId);
    if (!track) return false;
    selections[id] = track.id;
    save();
    if (id === group()) { if (enabled) unlock(); sync({ fromGesture: enabled }); }
    return true;
  }
  window.RoomMusic = Object.freeze({ getSnapshot, selectTrack, setEnabled, setVolume, setSharedPlayback });
  openButton.addEventListener('click', () => {
    if (!panel.hidden) { closePanel(); return; }
    if (enabled) { unlock(); sync({ fromGesture: true }); }
    panel.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    if (enabled) playPickerSound();
  });
  control.querySelector('.room-music-close').addEventListener('click', () => { closePanel(); openButton.focus(); });
  select.addEventListener('change', () => selectTrack(group(), select.value));
  control.addEventListener('click', event => event.stopPropagation());
  control.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closePanel(); openButton.focus(); } });
  document.addEventListener('pointerdown', event => { if (!control.contains(event.target)) closePanel(); });
  function resumeFromGesture(event) {
    if (event.isTrusted !== true || !audible() || event.target?.closest?.('.room-music-control,#voice-enabled,' + soundSelector)) return;
    if (event.type === 'keydown' && (event.repeat || event.ctrlKey || event.metaKey || event.altKey || ['Shift', 'Control', 'Alt', 'Meta', 'Escape', 'Tab'].includes(event.key))) return;
    // Retry in the gesture itself, before any promise/room animation loses the
    // browser's user activation. A saved explicit mute is never overridden.
    unlock(); sync({ fromGesture: true });
  }
  for (const event of ['click', 'touchend', 'keydown']) document.addEventListener(event, resumeFromGesture, { capture: true, passive: true });
  window.addEventListener('live-room-change', event => { room = event.detail.room; sync(); });
  // Karaoke's header is created by the next script in the document.
  document.addEventListener('DOMContentLoaded', dockControl, { once: true });
  if (typeof ResizeObserver === 'function') {
    const layoutObserver = new ResizeObserver(dockControl);
    for (const selector of ['#live-room-feed', '.stage-camera']) {
      const element = document.querySelector(selector);
      if (element) layoutObserver.observe(element);
    }
  }
  document.addEventListener('visibilitychange', () => sync());
  window.addEventListener('pagehide', () => { pageActive = false; sync(); });
  window.addEventListener('pageshow', () => { pageActive = true; sync(); });
  window.addEventListener('stream:resetting', () => {
    stop(); positions.clear(); selections = {}; enabled = false; resetMuted = true; volume = .35; blocked = false; status = 'off';
    try { localStorage.removeItem(storageKey); } catch {}
    closePanel(); notify();
  });
  if (window.UserAudio) window.UserAudio.subscribe(applyEnabled);
  else sync();
})();
