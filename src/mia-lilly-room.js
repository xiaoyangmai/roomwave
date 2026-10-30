(() => {
  'use strict';
  const room = document.getElementById('mia-lilly-room'), stateAPI = window.MiaLillyState;
  if (!room || !stateAPI) return;
  const { ids, names, gifts, poses, storageKey } = stateAPI;
  const soundKey = 'roomwave-mia-lilly-sound-v1';
  let saved, sound = false;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); sound = localStorage.getItem(soundKey) === 'on'; } catch {}
  const model = stateAPI.create(saved);
  // Match the native gift images used in the Stella & Mia room.
  const giftCrops = { rose: [119, 114, 295, 334], heart: [569, 149, 375, 245], sunglasses: [71, 647, 397, 196], corgi: [610, 576, 332, 344], gg: [80, 1094, 386, 259] };
  function giftArt(id, placement) {
    const crop = giftCrops[id], [x, y, width, height] = crop, clipId = `ml-gift-${placement}-${id}`;
    return `<svg class="ml-gift-icon" viewBox="${crop.join(' ')}" width="32" height="32" preserveAspectRatio="xMidYMid meet" overflow="hidden" aria-hidden="true" focusable="false"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><image href="/assets/hud-v1/gifts.lossless.webp" x="0" y="0" width="1024" height="1536" clip-path="url(#${clipId})"/></svg>`;
  }
  room.innerHTML = `<div class="ml-ambient" aria-hidden="true"></div><div class="ml-shell">
    <header class="ml-header"><div class="ml-profile"><span aria-hidden="true">♡</span><div class="room-heading"><strong class="room-host-name">Mia &amp; Lilly</strong><small class="room-type">Lounge Room</small></div><b>LIVE</b></div><button type="button" class="ml-sound" aria-label="Unmute Mia &amp; Lilly sounds" aria-pressed="false"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button></header>
    <div class="ml-stage"><div class="ml-cast">${ids.map(id => `<div class="ml-character" data-character="${id}"><div class="ml-sprite"><img alt="${names[id]}" width="512" height="896" draggable="false"></div><div class="ml-mood"><div class="ml-mood-heading"><strong>${names[id]}</strong><span data-mood-label>Calm</span></div><div class="ml-mood-meter" role="meter" aria-label="${names[id]}’s mood" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><i data-mood-fill></i></div></div></div>`).join('')}</div><span class="ml-effect" aria-hidden="true"></span></div>
    <div class="ml-feedback"><p class="ml-reaction-status" role="status"></p><div class="ml-rescue" hidden><span class="ml-rescue-time"></span><strong class="ml-rescue-score"></strong><span class="ml-rescue-message"></span></div></div>
    <div class="ml-dialogue" aria-live="polite" aria-atomic="true">${ids.map(id => `<p class="ml-speech" data-speaker="${id}" aria-label="${names[id]} says" aria-hidden="true"></p>`).join('')}</div>
    <div class="ml-bottom"><section class="ml-controls" aria-labelledby="ml-gifts-title"><div class="ml-tray-heading"><h2 id="ml-gifts-title">Gifts</h2><span class="ml-queue" hidden></span></div><fieldset class="ml-target-selector"><legend>Send a gift to</legend>${['either', ...ids].map(id => `<button type="button" data-ml-target="${id}" aria-pressed="${id === 'either'}">${id === 'either' ? 'Either' : names[id]}</button>`).join('')}</fieldset><div class="ml-gifts" role="group" aria-label="Choose a free gift">${Object.entries(gifts).map(([id, gift]) => `<button type="button" data-ml-gift="${id}" aria-label="Send ${gift.label}" disabled>${giftArt(id, 'button')}<b>${gift.label}</b><small hidden></small></button>`).join('')}</div><p class="ml-target-help" hidden></p></section></div>
    <div class="ml-art-status" role="status" hidden><span>Getting Mia &amp; Lilly ready…</span><button type="button" hidden>Retry artwork</button></div></div>`;
  const $ = selector => room.querySelector(selector);
  const shell = $('.ml-shell'), status = $('.ml-art-status'), artMessage = status.querySelector('span'), retry = status.querySelector('button');
  const characters = Object.fromEntries(ids.map(id => [id, {
    root: $(`[data-character="${id}"]`), image: $(`[data-character="${id}"] img`), bubble: $(`[data-speaker="${id}"]`),
    meter: $(`[data-character="${id}"] .ml-mood-meter`), fill: $(`[data-character="${id}"] [data-mood-fill]`), label: $(`[data-character="${id}"] [data-mood-label]`)
  }]));
  const giftButtons = [...room.querySelectorAll('[data-ml-gift]')], targets = [...room.querySelectorAll('[data-ml-target]')];
  const artwork = new Map(), audioNodes = new Set(), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let ready = false, loading = false, enabled = false, suspended = false, loadRun = 0, raf = 0, lastTime = 0, lastSave = 0;
  let context = null, audioEpoch = 0, voice = null, nextVoiceAt = 0, spoken = '', effectUntil = 0, missingAssets = [];
  const text = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  const attribute = (node, key, value) => { if (node.getAttribute(key) !== String(value)) node.setAttribute(key, String(value)); };
  const asset = (id, pose) => {
    const entry = window.MiaLillyArt?.characters?.[id]?.poses?.[pose];
    return typeof entry === 'string' ? entry : entry?.url || `assets/mia-lilly-v1/${id}-${pose}.lossless.webp`;
  };
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(model.state)); } catch {} };
  function silence() {
    audioEpoch++;
    if (voice) { voice.pause(); voice.removeAttribute('src'); voice.load(); voice = null; }
    for (const node of audioNodes) try { node.stop(); } catch {}
    audioNodes.clear();
  }
  function soundEffect(gift) {
    if (!sound || !enabled) return;
    const epoch = audioEpoch;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      context ||= new AudioContext();
      context.resume().then(() => {
        if (epoch !== audioEpoch || !sound || !enabled) return;
        const frequencies = gift === 'gg' ? [220, 165] : gift === 'sunglasses' ? [330, 262] : gift === 'corgi' ? [523, 659, 784] : [659, 784];
        frequencies.forEach((frequency, index) => {
          const oscillator = context.createOscillator(), gain = context.createGain(), at = context.currentTime + index * .11;
          oscillator.type = 'sine'; oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.03, at + .015); gain.gain.exponentialRampToValueAtTime(.001, at + .23);
          oscillator.connect(gain); gain.connect(context.destination); oscillator.start(at); oscillator.stop(at + .25);
          audioNodes.add(oscillator); oscillator.onended = () => { audioNodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        });
      }).catch(() => {});
    } catch {}
  }
  // Reuse Mia's recordings as audio assets only; the original voice controller and
  // its preferences remain private to the original room. Lilly uses gift sounds.
  function speak(line) {
    if (!line || line.speaker !== 'mia' || !sound || !enabled || voice || Date.now() < nextVoiceAt) return;
    const exact = (window.voiceData?.mia || []).find(clip => clip.text === line.text);
    if (!exact || typeof Audio !== 'function') return;
    const audio = new Audio(`audio/mia/${exact.file}`), epoch = audioEpoch;
    audio.volume = Math.min(.8, .72 * (exact.gain || 1)); voice = audio; nextVoiceAt = Date.now() + 5500;
    const finish = () => { if (voice === audio) voice = null; audio.removeAttribute('src'); audio.load(); };
    audio.addEventListener('ended', finish, { once: true }); audio.addEventListener('error', finish, { once: true });
    audio.play().then(() => { if (epoch !== audioEpoch || !enabled || !sound) { audio.pause(); finish(); } }).catch(finish);
  }
  function updateSound() {
    const button = $('.ml-sound');
    attribute(button, 'aria-pressed', sound); attribute(button, 'aria-label', `${sound ? 'Mute' : 'Unmute'} Mia & Lilly sounds`);
    attribute(button.querySelector('use'), 'href', sound ? '#icon-sound' : '#icon-muted');
  }
  $('.ml-sound').addEventListener('click', () => {
    sound = !sound; updateSound();
    if (sound) soundEffect('rose'); else silence();
    try { localStorage.setItem(soundKey, sound ? 'on' : 'off'); } catch {}
  });
  function showEvents(events) {
    for (const event of events) {
      if (event.type === 'gift') {
        soundEffect(event.gift); const effect = $('.ml-effect'); effect.innerHTML = giftArt(event.gift, 'effect');
        effect.dataset.character = event.recipient; effectUntil = performance.now() + (reduced.matches ? 450 : 850);
        effect.classList.remove('show'); void effect.offsetWidth; effect.classList.add('show');
      }
      if (event.type === 'saved') soundEffect('corgi');
    }
  }
  function render() {
    const frame = model.frame;
    shell.dataset.phase = frame.phase; shell.dataset.recipient = frame.recipient || '';
    shell.dataset.rescueTarget = frame.poses[frame.recipient]?.startsWith('kneel') ? frame.recipient : '';
    shell.classList.toggle('is-impact', frame.impact && !reduced.matches);
    for (const id of ids) {
      const view = characters[id], pose = frame.poses[id], key = `${id}:${pose}`, mood = frame.moods[id];
      view.root.dataset.pose = pose; view.root.dataset.mood = mood.band;
      view.root.classList.toggle('is-selected', frame.selectedTarget === id);
      const loaded = artwork.get(key);
      if (loaded && view.image.dataset.pose !== pose) { view.image.src = loaded.src; view.image.dataset.pose = pose; view.image.alt = `${names[id]}, ${pose.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()}`; }
      attribute(view.meter, 'aria-valuenow', Math.round(mood.value)); attribute(view.meter, 'aria-valuetext', mood.label);
      view.fill.style.width = `${mood.value.toFixed(2)}%`; text(view.label, mood.label);
      const speaking = frame.speech?.speaker === id;
      view.bubble.classList.toggle('show', speaking); view.bubble.classList.toggle('is-visible', speaking); attribute(view.bubble, 'aria-hidden', !speaking);
      text(view.bubble, speaking ? frame.speech.text : '');
    }
    const speechKey = frame.speech ? `${frame.speech.speaker}:${frame.speech.text}` : '';
    if (speechKey !== spoken && enabled) { spoken = speechKey; speak(frame.speech); }
    text($('.ml-reaction-status'), frame.label);
    const rescue = $('.ml-rescue'); rescue.hidden = !frame.rescue;
    if (frame.rescue) {
      rescue.dataset.state = frame.rescue.state;
      const time = frame.phase === 'resolving' ? 'Safe!' : frame.phase === 'punishment' ? 'Time!' : `${frame.rescue.seconds}s`;
      text($('.ml-rescue-time'), time);
      text($('.ml-rescue-score'), `${frame.rescue.score > 0 ? '+' : ''}${frame.rescue.score} pts`);
      text($('.ml-rescue-message'), frame.rescue.message);
      attribute(rescue, 'aria-label', `${frame.rescue.message} ${time} Rescue score ${frame.rescue.score} points.`);
    }
    const queue = $('.ml-queue'); queue.hidden = !frame.queue; text(queue, frame.queue ? `${frame.queue} queued` : '');
    for (const button of targets) { attribute(button, 'aria-pressed', frame.selectedTarget === button.dataset.mlTarget); button.disabled = !enabled || frame.targetLocked; }
    const targetHelp = $('.ml-target-help'); targetHelp.hidden = !frame.targetLocked;
    text(targetHelp, frame.targetLocked ? `Helping ${names[frame.recipient]} · Target locked` : '');
    for (const button of giftButtons) {
      button.disabled = !enabled;
      const gift = gifts[button.dataset.mlGift], hint = button.querySelector('small');
      hint.hidden = !frame.targetLocked; text(hint, frame.targetLocked ? `${gift.points > 0 ? '+' : ''}${gift.points} pts` : '');
      const target = frame.targetLocked ? names[frame.recipient] : frame.selectedTarget === 'either' ? 'either character' : names[frame.selectedTarget];
      attribute(button, 'aria-label', `Send ${gift.label} to ${target}${frame.targetLocked ? `, ${gift.points > 0 ? 'adds' : 'subtracts'} ${Math.abs(gift.points)} rescue points` : ''}`);
    }
    if (performance.now() >= effectUntil) $('.ml-effect').classList.remove('show');
  }
  function sendGift(gift) {
    if (!enabled || !model.send(gift)) return false;
    showEvents(model.takeEvents()); render(); save(); return true;
  }
  function setTarget(id) { if (!enabled || !model.selectTarget(id)) return false; render(); save(); return true; }
  giftButtons.forEach(button => button.addEventListener('click', () => sendGift(button.dataset.mlGift)));
  targets.forEach(button => button.addEventListener('click', () => setTarget(button.dataset.mlTarget)));
  function tick(time) {
    raf = 0; if (!enabled) return;
    showEvents(model.tick(lastTime ? time - lastTime : 0)); lastTime = time; render();
    if (time - lastSave > 1000) { save(); lastSave = time; }
    raf = requestAnimationFrame(tick);
  }
  function syncActive() {
    const selected = !suspended && !document.hidden && window.LiveRooms?.activeRoom === 'mia-lilly';
    if (selected && !ready && !loading && !loadRun) loadArtwork();
    const next = selected && ready;
    shell.classList.toggle('is-paused', !next);
    if (next === enabled) { render(); return; }
    enabled = next; model.setActive(next); lastTime = 0;
    if (next) { spoken = ''; raf = requestAnimationFrame(tick); }
    else { cancelAnimationFrame(raf); raf = 0; silence(); save(); }
    render();
  }
  function loadImage(id, pose, run) {
    return new Promise((resolve, reject) => {
      const image = new Image(), path = asset(id, pose); let settled = false;
      const finish = error => { if (settled) return; settled = true; clearTimeout(timeout); image.onload = image.onerror = null; error ? reject({ id, pose, path }) : resolve({ id, pose, image }); };
      const timeout = setTimeout(() => finish(true), 15000);
      image.onload = () => image.naturalWidth > 0 ? finish(false) : finish(true); image.onerror = () => finish(true);
      image.src = `${path}${run > 1 ? `${path.includes('?') ? '&' : '?'}retry=${run}` : ''}`;
      if (image.complete && image.naturalWidth) finish(false);
    });
  }
  async function loadArtwork() {
    if (loading) return;
    loading = true; const run = ++loadRun; status.hidden = false; retry.hidden = true; text(artMessage, 'Getting Mia & Lilly ready…');
    const results = await Promise.allSettled(ids.flatMap(id => poses.map(pose => loadImage(id, pose, run))));
    if (run !== loadRun) return;
    missingAssets = [];
    for (const result of results) {
      if (result.status === 'fulfilled') { const { id, pose, image } = result.value; artwork.set(`${id}:${pose}`, image); }
      else missingAssets.push(result.reason.path);
    }
    loading = false; ready = missingAssets.length === 0;
    if (ready) status.hidden = true;
    else { text(artMessage, `${missingAssets.length} character image${missingAssets.length === 1 ? '' : 's'} couldn’t load.`); retry.hidden = false; }
    syncActive();
  }
  retry.addEventListener('click', loadArtwork);
  window.addEventListener('live-room-change', syncActive); document.addEventListener('visibilitychange', syncActive);
  window.addEventListener('pagehide', () => { suspended = true; syncActive(); save(); });
  window.addEventListener('pageshow', () => { suspended = false; syncActive(); });
  window.MiaLillyRoom = Object.freeze({ sendGift, setTarget, get state() { return model.state; }, get frame() { return model.frame; }, get ready() { return ready; }, get active() { return enabled; }, get sound() { return sound; }, get audioPlaying() { return Boolean(voice && !voice.paused) || audioNodes.size > 0; }, get missingAssets() { return [...missingAssets]; } });
  updateSound(); render(); syncActive();
})();
