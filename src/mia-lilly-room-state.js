(() => {
  'use strict';
  // This room owns its entire progress model. It never reads the original cast's save.
  const storageKey = 'roomwave-mia-lilly-v1';
  const ids = Object.freeze(['mia', 'lilly']);
  const names = Object.freeze({ mia: 'Mia', lilly: 'Lilly' });
  const gifts = Object.freeze({
    rose: Object.freeze({ label: 'Rose', icon: '🌹', points: 1, duration: 2170 }),
    heart: Object.freeze({ label: 'Heart', icon: '❤️', points: 100, duration: 2670 }),
    sunglasses: Object.freeze({ label: 'Glasses', icon: '😎', points: -200, duration: 760 }),
    corgi: Object.freeze({ label: 'Mini Dance', icon: '🐶', points: 300, duration: 3980 }),
    gg: Object.freeze({ label: 'GG', icon: 'GG', points: -1, duration: 3460 })
  });
  const poses = Object.freeze(['neutral', 'happy', 'angry', 'sad', 'surprised', 'wave', 'heart', 'heartLow', 'dance1', 'dance2', 'kneelWorried', 'kneelHappy', 'kneelAngry', 'kneelCry', 'celebrate', 'gesturePrepare', 'gestureExtend', 'bow']);
  const phases = ['reaction', 'transition', 'rescue', 'resolving', 'punishment'];
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const other = id => id === 'mia' ? 'lilly' : 'mia';
  const good = gift => ['rose', 'heart', 'corgi'].includes(gift);
  const unitsFor = score => Math.ceil(Math.max(0, -score) / 200);
  const integer = (value, fallback, low = 0, high = 1e6) => Number.isFinite(value) ? clamp(Math.floor(value), low, high) : fallback;
  const initial = now => ({ version: 1, selectedTarget: 'either', nextTarget: 'mia', heartStep: 0, danceStep: 0, moods: Object.fromEntries(ids.map(id => [id, { value: 50, updatedAt: now }])), current: null, pending: [] });
  function moodAt(entry, now = Date.now()) {
    const value = 50 + (entry.value - 50) * Math.pow(.5, Math.max(0, now - entry.updatedAt) / 300000);
    const band = value < 25 ? 'angry' : value < 45 ? 'upset' : value <= 55 ? 'calm' : value < 80 ? 'happy' : 'delighted';
    return { value, band, label: band[0].toUpperCase() + band.slice(1), pose: band === 'angry' ? 'angry' : band === 'upset' ? 'sad' : ['happy', 'delighted'].includes(band) ? 'happy' : 'neutral' };
  }
  function sanitize(saved, now = Date.now()) {
    const state = initial(now);
    if (!saved || saved.version !== 1) return state;
    if (['either', ...ids].includes(saved.selectedTarget)) state.selectedTarget = saved.selectedTarget;
    if (ids.includes(saved.nextTarget)) state.nextTarget = saved.nextTarget;
    state.heartStep = integer(saved.heartStep, 0, 0, 1);
    state.danceStep = integer(saved.danceStep, 0, 0, 1);
    for (const id of ids) {
      const entry = saved.moods?.[id];
      if (Number.isFinite(entry?.value) && Number.isFinite(entry?.updatedAt) && entry.updatedAt >= 0) state.moods[id] = { value: clamp(entry.value, 0, 100), updatedAt: Math.min(now, entry.updatedAt) };
    }
    if (Array.isArray(saved.pending)) state.pending = saved.pending.slice(0, 500).filter(batch => batch && own(gifts, batch.gift) && ids.includes(batch.recipient)).map(batch => ({ gift: batch.gift, recipient: batch.recipient, count: integer(batch.count, 1, 1, 10000) }));
    const current = saved.current;
    if (current && own(gifts, current.gift) && ids.includes(current.recipient) && phases.includes(current.phase) && (current.gift === 'sunglasses' ? current.phase !== 'reaction' : current.phase === 'reaction')) {
      state.current = {
        gift: current.gift, recipient: current.recipient, phase: current.phase,
        elapsed: integer(current.elapsed, 0), count: integer(current.count, 1, 1, 10000),
        score: integer(current.score, -200, -2e6, 300), units: integer(current.units, 1, 1, 10000),
        variation: integer(current.variation, 0, 0, 1),
        feedback: own(gifts, current.feedback) ? current.feedback : null,
        feedbackUntil: integer(current.feedbackUntil, 0)
      };
    }
    return state;
  }
  function create(saved, options = {}) {
    const now = options.now || Date.now;
    const state = sanitize(saved, now());
    let active = false, message = null, messageTime = 0, idleTime = 0, idleIndex = 0, events = [];
    const snapshot = () => JSON.parse(JSON.stringify(state));
    const emit = (type, detail = {}) => events.push({ type, ...detail });
    const rescued = () => state.current && ['transition', 'rescue'].includes(state.current.phase);
    function selectTarget(id) {
      if (!active || rescued() || !['either', ...ids].includes(id)) return false;
      state.selectedTarget = id; return true;
    }
    function begin(batch) {
      const variation = batch.gift === 'heart' ? state.heartStep : batch.gift === 'corgi' ? state.danceStep : 0;
      if (batch.gift === 'heart') state.heartStep = 1 - state.heartStep;
      if (batch.gift === 'corgi') state.danceStep = 1 - state.danceStep;
      state.current = { ...batch, phase: batch.gift === 'sunglasses' ? 'transition' : 'reaction', elapsed: 0, score: -200 * batch.count, units: batch.count, variation, feedback: null, feedbackUntil: 0 };
      message = null; messageTime = 0; idleTime = 0;
      emit('reaction', { gift: batch.gift, recipient: batch.recipient });
    }
    function enqueue(gift, recipient, count = 1) {
      const last = state.pending.at(-1);
      if (last?.gift === gift && last.recipient === recipient) last.count += count;
      else state.pending.push({ gift, recipient, count });
    }
    function applyRescue(gift) {
      const current = state.current;
      if (current?.phase !== 'rescue' || current.elapsed >= 10000) return false;
      current.score += gifts[gift].points;
      current.feedback = gift; current.feedbackUntil = current.elapsed + (good(gift) ? 1300 : 1000);
      emit('rescue-gift', { gift, recipient: current.recipient });
      if (current.score >= 0) {
        current.phase = 'resolving'; current.elapsed = 0;
        emit('saved', { recipient: current.recipient });
      }
      return true;
    }
    function send(gift) {
      if (!active || !own(gifts, gift)) return false;
      const current = state.current, either = state.selectedTarget === 'either', last = state.pending.at(-1);
      const merge = current?.phase === 'reaction' && current.gift === gift && !state.pending.length && (either || state.selectedTarget === current.recipient);
      const continuesGlasses = current?.gift !== 'sunglasses' && gift === 'sunglasses' && last?.gift === gift && (either || last.recipient === state.selectedTarget);
      const recipient = rescued() ? current.recipient : merge ? current.recipient : continuesGlasses ? last.recipient : either ? state.nextTarget : state.selectedTarget;
      if (either && !merge && !rescued() && !continuesGlasses) state.nextTarget = other(recipient);
      const mood = moodAt(state.moods[recipient], now());
      state.moods[recipient] = { value: mood.value * .8 + (good(gift) ? 100 : 0) * .2, updatedAt: now() };
      emit('gift', { gift, recipient });
      if (applyRescue(gift)) return true;
      if (!current) begin({ gift, recipient, count: 1 });
      else if (!merge) enqueue(gift, recipient);
      return true;
    }
    function next() {
      if (!state.pending.length) return;
      const batch = state.pending.shift();
      if (batch.gift !== 'sunglasses') {
        for (let index = 0; index < state.pending.length;) {
          const pending = state.pending[index];
          if (pending.gift === 'sunglasses') break;
          if (pending.gift === batch.gift && pending.recipient === batch.recipient) { batch.count += pending.count; state.pending.splice(index, 1); }
          else index++;
        }
      }
      begin(batch);
    }
    function finish() {
      const current = state.current, mood = moodAt(state.moods[current.recipient], now());
      const text = ['angry', 'upset'].includes(mood.band) ? current.recipient === 'mia' ? 'I need a little quiet after that…' : 'I’m still mad. That was not funny.' : mood.band === 'delighted' ? current.recipient === 'mia' ? 'You’re making me blush. Happy now?' : 'You always know how to make me smile!' : current.gift === 'corgi' ? current.recipient === 'mia' ? 'I counted the steps. Then the steps escaped.' : 'That deserves an imaginary disco ball!' : current.recipient === 'mia' ? 'Thank you. That was really sweet.' : 'What should we do next?';
      message = { speaker: current.recipient, text, event: null }; messageTime = 3400;
      state.current = null; emit('complete', { gift: current.gift, recipient: current.recipient }); next();
    }
    const tempoFor = units => Math.max(.35, Math.min(1, 5 / units));
    const penaltyDuration = current => 4690 + current.units * 780 * tempoFor(current.units);
    function tick(delta) {
      if (!active || !Number.isFinite(delta) || delta <= 0) return [];
      delta = Math.min(delta, 100);
      if (!state.current && state.pending.length) next();
      const current = state.current;
      if (current) {
        current.elapsed += delta;
        if (current.phase === 'reaction' && current.elapsed >= gifts[current.gift].duration) finish();
        else if (current.phase === 'transition' && current.elapsed >= 760) {
          current.phase = 'rescue'; current.elapsed = 0; emit('rescue-start', { recipient: current.recipient });
          const batches = state.pending.splice(0);
          for (const batch of batches) {
            if (batch.recipient !== current.recipient) { enqueue(batch.gift, batch.recipient, batch.count); continue; }
            for (let index = 0; index < batch.count; index++) if (!applyRescue(batch.gift)) { enqueue(batch.gift, batch.recipient, batch.count - index); break; }
          }
        } else if (current.phase === 'rescue' && current.elapsed >= 10000) {
          current.phase = 'punishment'; current.elapsed = 0; current.units = Math.max(1, unitsFor(current.score)); emit('timeout', { recipient: current.recipient });
        } else if (current.phase === 'resolving' && current.elapsed >= 2720 || current.phase === 'punishment' && current.elapsed >= penaltyDuration(current)) finish();
      } else {
        messageTime = Math.max(0, messageTime - delta); if (!messageTime) message = null;
        idleTime += delta;
        if (!message && idleTime >= 16000) {
          idleTime = 0;
          const speaker = ids[idleIndex++ % ids.length], mood = moodAt(state.moods[speaker], now());
          message = { speaker, event: null, text: ['angry', 'upset'].includes(mood.band) ? speaker === 'mia' ? 'A rose might help…' : 'I could use something sweet.' : speaker === 'mia' ? 'It’s nice having you here. Even when I’m quiet.' : 'Mia, I think it’s time for another little dance!' }; messageTime = 3400;
        }
      }
      const result = events; events = []; return result;
    }
    function frame() {
      const current = state.current, moods = Object.fromEntries(ids.map(id => [id, moodAt(state.moods[id], now())]));
      const result = { phase: current?.phase || 'idle', gift: current?.gift || null, recipient: current?.recipient || null, elapsed: current?.elapsed || 0, selectedTarget: state.selectedTarget, targetLocked: Boolean(rescued()), queue: state.pending.reduce((sum, batch) => sum + batch.count, 0), moods, poses: Object.fromEntries(ids.map(id => [id, moods[id].pose])), speech: message, rescue: null, label: '', impact: false };
      if (!current) return result;
      const { recipient, gift, elapsed, phase } = current, helper = other(recipient);
      const say = (text, event, speaker = recipient) => { result.speech = { speaker, text, event }; };
      if (phase === 'reaction') {
        result.label = gifts[gift].label;
        if (gift === 'rose') { result.poses[recipient] = elapsed < 1750 ? 'wave' : 'happy'; say(recipient === 'mia' ? 'Love you!' : 'A rose! You know how to make me smile!', 'rose'); }
        if (gift === 'heart') { result.poses[recipient] = elapsed < 2370 ? current.variation ? 'heart' : 'heartLow' : 'happy'; say(recipient === 'mia' ? 'I love you!' : 'One heart, two very happy hosts!', 'heart'); }
        if (gift === 'corgi') { result.poses[recipient] = (Math.floor(elapsed / 930) + current.variation) % 2 ? 'dance2' : 'dance1'; say(recipient === 'mia' ? 'Just a little dance… don’t laugh!' : 'Come on, Mia! Watch these moves!', 'dance'); }
        if (gift === 'gg') { result.poses[recipient] = 'angry'; say('GG?! Seriously?!', 'gg'); }
        return result;
      }
      const seconds = phase === 'transition' ? 10 : phase === 'rescue' ? Math.max(0, Math.ceil((10000 - elapsed) / 1000)) : 0;
      result.rescue = { seconds, score: current.score, units: unitsFor(current.score), ducks: unitsFor(current.score), message: `Help ${names[recipient]}!`, state: phase };
      result.label = `Rescue ${names[recipient]}`;
      result.poses[helper] = 'surprised';
      result.poses[recipient] = 'kneelWorried';
      if (phase === 'transition') { say('Please protect me!', 'rescue'); return result; }
      if (phase === 'rescue') {
        if (current.score < -1000 || [7, 4].includes(seconds)) result.poses[recipient] = 'kneelCry';
        if (current.feedback && elapsed < current.feedbackUntil) {
          const positive = good(current.feedback); result.poses[recipient] = positive ? 'kneelHappy' : 'kneelAngry';
          say(positive ? current.feedback === 'corgi' ? 'That dance helped!' : current.feedback === 'heart' ? 'That helps! Keep going!' : 'Every rose counts!' : current.feedback === 'gg' ? 'GG made it worse!' : 'Stop adding sunglasses!', positive ? 'rescueHelp' : 'rescueWorse');
        } else if ([8, 5, 2].includes(seconds)) say(`Send ${names[recipient]} some protection!`, null, helper);
        else say(seconds <= 4 ? 'Please save me!' : 'Please protect me!', seconds <= 4 ? 'rescueUrgent' : 'rescue');
      } else if (phase === 'resolving') {
        result.poses[recipient] = elapsed < 500 ? 'kneelHappy' : 'celebrate'; result.poses[helper] = 'happy';
        result.rescue.message = `${names[recipient]} is safe!`; result.label = 'Rescue complete'; say(recipient === 'mia' ? 'Love you!' : 'You saved me! Thank you!', 'saved');
      } else if (phase === 'punishment') {
        const beat = 780 * tempoFor(current.units), danceStart = 2320, completed = clamp(Math.floor((elapsed - danceStart) / beat), 0, current.units);
        const inAction = elapsed >= danceStart && completed < current.units;
        const beatTime = (elapsed - danceStart) % beat;
        result.impact = inAction && beatTime >= 210 * tempoFor(current.units) && beatTime < 640 * tempoFor(current.units);
        // Keep the latest strike cue through the recovery beat so a late frame
        // can show the remaining burst without replaying older strikes.
        const strike = Math.min(current.units - 1, Math.floor((elapsed - danceStart - 210 * tempoFor(current.units)) / beat));
        if(strike>=0)result.impactCue = { index: strike, offset: danceStart + strike * beat + 210 * tempoFor(current.units) };
        result.poses[recipient] = elapsed < 1380 ? 'surprised' : elapsed < danceStart + current.units * beat + 650 ? 'bow' : 'sad';
        result.poses[helper] = elapsed < 1380 ? 'angry' : elapsed < danceStart + current.units * beat ? result.impact ? 'gestureExtend' : 'gesturePrepare' : 'neutral';
        result.rescue.units = Math.max(0, current.units - completed);
        // Solo removes a duck after the impact, before the final recovery beat.
        const ducksCleared = clamp(Math.floor((elapsed - danceStart + 140 * tempoFor(current.units)) / beat), 0, current.units);
        result.rescue.ducks = current.units - ducksCleared;
        result.rescue.message = result.rescue.units ? `${result.rescue.units} cartoon swat${result.rescue.units === 1 ? '' : 's'} left` : 'All done';
        result.label = 'Time ran out!';
        say(elapsed < 1380 ? 'Time ran out?!' : result.impact ? 'Ow!' : completed >= current.units ? 'I need a minute. That was embarrassing.' : 'Oh no…', result.impact ? 'penaltyImpact' : null);
      }
      return result;
    }
    return { checkpoint() { return globalThis.RoomwaveCodec.encode({ checkpointVersion: 1, state,active,message,messageTime,idleTime,idleIndex,events }); },
      restore(checkpoint) {
        const data = globalThis.RoomwaveCodec.decode(checkpoint);
        if (data?.checkpointVersion !== 1) throw new Error('Incompatible room checkpoint');
        Object.assign(state, data.state);
        ({active,message,messageTime,idleTime,idleIndex,events} = data);
        
      },
      get state() { return snapshot(); }, get frame() { return frame(); }, get active() { return active; }, setActive(value) { active = Boolean(value); }, selectTarget, send, tick, takeEvents() { const result = events; events = []; return result; } };
  }
  globalThis.MiaLillyState = Object.freeze({ storageKey, ids, names, gifts, poses, sanitize, moodAt, create });
})();
