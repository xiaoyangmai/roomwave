/* All Fortune Room writing lives here. Edit a title, meaning or fortune without a service. */
(() => {
  'use strict';
  const storageKey = 'roomwave-fortune-v1';
  const cards = Object.freeze([
    { id: 'cat', title: 'The Cat', meaning: 'Rest without guilt.', fortunes: [
      'Something can wait until tomorrow. You already know what it is.',
      'Rest may bring a clarity that effort has not. Give yourself a quiet afternoon.',
      'You do not have to earn every little comfort. Find the softest place to land.',
      'An answer may come when your thoughts have had time to settle.'
    ] },
    { id: 'lantern', title: 'The Lantern', meaning: 'One small step.', fortunes: [
      'You don’t need to see the whole path to take the next step.',
      'A little progress still counts when nobody is watching. Even the lantern began with a spark.',
      'Start with the part you understand. The way ahead may become clearer as you go.',
      'A small decision may reveal more than a long search for certainty.'
    ] },
    { id: 'door', title: 'The Open Door', meaning: 'Welcome a possibility.', fortunes: [
      'An invitation may arrive quietly. Leave a little room for yes.',
      'Something unfamiliar may turn out to feel like home. You can take a peek before deciding.',
      'A small change of plans may have a pleasant surprise tucked inside it.',
      'You may be closer to a new beginning than you realize. Notice what draws your attention.'
    ] },
    { id: 'teacup', title: 'The Teacup', meaning: 'Comfort in small things.', fortunes: [
      'Your next lovely moment may be very ordinary. Try not to rush past it.',
      'A familiar song and a warm drink may do more than another serious plan.',
      'Someone would enjoy an unhurried moment with you. A second cup is a lovely invitation.',
      'Something familiar may hold the comfort you have been looking for.'
    ] },
    { id: 'fox', title: 'The Fox', meaning: 'Look twice.', fortunes: [
      'The clever answer may be simpler than the impressive one.',
      'A detail you nearly missed may save you a great deal of fuss. Have one more look.',
      'A change of direction may bring you closer to what matters. Trust what you have learned.',
      'Look for what remains simple when the distractions fall away.'
    ] },
    { id: 'thread', title: 'The Tangled Thread', meaning: 'Begin with one knot.', fortunes: [
      'You’ve been trying to solve everything at once. Pick one little piece.',
      'A patient question may loosen what another firm tug will not.',
      'You do not need a perfect plan today. A clear place to begin will do.',
      'A little distance may reveal where the tangle began. Return to it with patience.'
    ] },
    { id: 'star', title: 'The Shooting Star', meaning: 'Give a wish a chance.', fortunes: [
      'That idea you keep returning to? Perhaps it deserves a small beginning.',
      'A beginning does not have to be certain to be worth making.',
      'Tell one kind person about your little dream. It may feel less far away afterward.',
      'Make a little space for the wish you rarely speak aloud. It may be ready to take shape.'
    ] },
    { id: 'plate', title: 'The Empty Plate', meaning: 'Something is missing.', fortunes: [
      'The spirits have spoken. Apparently, you need a snack.',
      'A need you have set aside may be asking for your attention. Take a moment to listen.',
      'Notice what restores you. There may be room for more of it in your days.',
      'You have been giving a great deal. Leave a little something on the plate for yourself.'
    ] },
    { id: 'mirror', title: 'The Mirror', meaning: 'Notice your progress.', fortunes: [
      'You’re overlooking something you’ve already done well.',
      'An earlier version of you would be rather impressed by something you now do without thinking.',
      'The kind words you offer someone else might fit you, too. Try them on.',
      'Look gently at who you are becoming. Some changes are easiest to see in hindsight.'
    ] },
    { id: 'key', title: 'The Curious Key', meaning: 'Try another approach.', fortunes: [
      'Before you push harder, check whether the door says pull.',
      'A different question may open more than a louder answer. Try the curious one.',
      'An answer may be hidden in something you already know. Return to it with fresh eyes.',
      'A conversation may reveal an opening you had not noticed on your own.'
    ] }
  ].map(card => Object.freeze({ ...card, fortunes: Object.freeze(card.fortunes), fortune: card.fortunes[0] })));
  const cardById = new Map(cards.map(card => [card.id, card]));
  const actions = Object.freeze({ card: 700, crystal: 2500, tea: 2200, surprise: 1800 });
  const revealDuration = 650;
  const readingHold = 4000;
  const ambientTea = Object.freeze({ delay: 8000, variation: 8000, duration: 2600 });
  const readings = {
    crystal: [
      { symbol: 'moon', title: 'A Quiet Beginning', text: 'I see an unfinished project… It would like your attention.' },
      { symbol: 'heart', title: 'A Small Kindness', text: 'A small kindness will matter more than you expect.' },
      { symbol: 'cat', title: 'A Lasting Connection', text: 'Someone may be remembering a kindness you have forgotten. Small moments can leave a lasting trace.' },
      { symbol: 'teacup', title: 'Beneath the Surface', text: 'A quiet moment may help you recognize a feeling you have been carrying for some time.' },
      { symbol: 'key', title: 'A New Angle', text: 'A stubborn little puzzle may soften when you ask a different question.' },
      { symbol: 'star', title: 'A Little Wish', text: 'An idea you keep returning to may hold something worth exploring. Give it a small beginning.' },
      { symbol: 'moon', title: 'Room to Rest', text: 'I see a quieter evening. You are allowed to enjoy it before everything is finished.' },
      { symbol: 'heart', title: 'A Familiar Voice', text: 'An ordinary conversation may leave you feeling more understood than you expected.' },
      { symbol: 'cat', title: 'A Familiar Presence', text: 'I see the comfort of familiar company. You may not need many words to feel understood.' },
      { symbol: 'teacup', title: 'An Unhurried Moment', text: 'An unhurried moment may become the part of the day you remember most clearly.' },
      { symbol: 'key', title: 'A Quiet Invitation', text: 'A small opportunity may arrive without much ceremony. Curiosity will help you notice.' },
      { symbol: 'star', title: 'Imperfect Magic', text: 'Your next attempt need not be brilliant. The stars are very fond of beginnings.' },
      { symbol: 'moon', title: 'A Gentle Detour', text: 'A change of scenery may help a busy thought settle. Let your attention wander for a while.' },
      { symbol: 'heart', title: 'Words to Keep', text: 'Someone may remember a kind thing you said long after you have forgotten saying it.' },
      { symbol: 'cat', title: 'An Instinct to Trust', text: 'A feeling you cannot quite explain may deserve a closer look. Give yourself time to understand it.' },
      { symbol: 'teacup', title: 'Cloudy With Tea', text: 'The future is cloudy. One moment… No, that’s my tea.' },
      { symbol: 'key', title: 'Something Rediscovered', text: 'An old interest is waiting patiently for you. It has kept your place.' },
      { symbol: 'star', title: 'A Small Delight', text: 'Something unexpectedly lovely may interrupt your plans. Leave it a little room.' }
    ],
    tea: [
      { title: 'The Paper Boat', text: 'A change of scenery may untangle a busy thought. Even the other end of the garden counts.' },
      { title: 'The Kind Heart', text: 'Someone may remember a kindness you thought was too small to matter.' },
      { title: 'The Traveling Teapot', text: 'Your next favorite conversation may begin in an unexpected place. Take your curiosity with you.' },
      { title: 'The Little Ladder', text: 'One small step may make tomorrow feel easier. Begin with what is within reach.' },
      { title: 'The Waiting Bird', text: 'A message may give you something lovely to look forward to. Save a little space in your plans.' },
      { title: 'The Open Window', text: 'A fresh idea may arrive when you change your usual routine. Try a different seat.' },
      { title: 'The Lopsided Heart', text: 'A slightly clumsy gesture may turn out to be the sweetest one. Sincerity rarely arrives perfectly wrapped.' },
      { title: 'The Tea Circle', text: 'An old tradition may hold a new meaning for you. Notice what you would like to carry forward.' },
      { title: 'The Tiny Umbrella', text: 'An imperfect afternoon may still contain a moment of peace. Leave yourself time to notice it.' }
    ],
    surprise: [
      { title: 'The Quiet Visitor', text: 'An unexpected encounter may bring a sense of belonging. Stay open to a familiar feeling in a new place.', surprise: 'catpaw' },
      { title: 'Spilled Starlight', text: 'Something worth celebrating may be taking shape quietly. Notice what is beginning to grow.', surprise: 'sparkles' },
      { title: 'The Moonlit Messenger', text: 'Something easily overlooked may draw your attention. Follow that feeling for a moment.', surprise: 'moth' },
      { title: 'A Gentle Companion', text: 'You may find encouragement in an unexpected place. Let yourself receive it.', surprise: 'catpaw' },
      { title: 'An Untidy Constellation', text: 'Your plans may get a little rearranged. There could be a prettier pattern hiding in the mess.', surprise: 'sparkles' },
      { title: 'The Velvet Visitor', text: 'Someone quiet may have the most interesting thing to say. Give them a moment to land.', surprise: 'moth' },
      { title: 'What Is Unseen', text: 'Part of the picture is still hidden. You can leave room for what you do not yet know.', surprise: 'catpaw' },
      { title: 'The Shared Wish', text: 'A wish may feel closer when you share it with someone you trust.', surprise: 'sparkles' },
      { title: 'A Light Nearby', text: 'Something beautiful may be waiting in a familiar place. Look with a little more attention.', surprise: 'moth' }
    ]
  };
  Object.values(readings).forEach(bank => { bank.forEach(Object.freeze); Object.freeze(bank); });
  Object.freeze(readings);
  const variantCounts = Object.freeze(Object.fromEntries([
    ...cards.map(card => [`card:${card.id}`, card.fortunes.length]),
    ...Object.entries(readings).map(([kind, bank]) => [kind, bank.length])
  ]));
  const resultKey = result => result.kind === 'card' ? `card:${result.cardId}` : result.kind;
  const clamp = (value, max) => Math.max(0, Math.min(max, value));
  function resultFor(kind, variant = 0, cardId) {
    if (kind === 'card') {
      const card = cardById.get(cardId);
      return card && Number.isInteger(variant) && variant >= 0 && variant < card.fortunes.length
        ? { kind, title: card.title, meaning: card.meaning, text: card.fortunes[variant], cardId, variant } : null;
    }
    if (!Object.hasOwn(readings, kind) || !Number.isInteger(variant) || variant < 0 || variant >= readings[kind].length) return null;
    return { kind, ...readings[kind][variant], variant };
  }
  // Keep the previous chosen identity out of all three slots, not merely its old slot.
  function deal(counter, lastCardId, previous = []) {
    let seed = (Math.imul(counter + 1, 0x9e3779b1) ^ 0xa341316c) >>> 0;
    const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
    const ids = cards.filter(card => card.id !== lastCardId).map(card => card.id);
    for (let index = ids.length - 1; index > 0; index--) {
      const next = Math.floor(random() * (index + 1)); [ids[index], ids[next]] = [ids[next], ids[index]];
    }
    const hand = ids.slice(0, 3);
    return hand.every((id, index) => id === previous[index]) ? [hand[1], hand[2], hand[0]] : hand;
  }
  function sanitize(saved) {
    const state = { dealCounter: 0, dealtIds: deal(0), selectedIndex: -1, lastResult: null, lastCardId: null, activity: null, readingVariants: {} };
    if (!saved || typeof saved !== 'object') return state;
    if (Number.isSafeInteger(saved.dealCounter) && saved.dealCounter >= 0) state.dealCounter = saved.dealCounter % 1e9;
    if (cardById.has(saved.lastCardId)) state.lastCardId = saved.lastCardId;
    if (saved.readingVariants && typeof saved.readingVariants === 'object') {
      for (const [key, count] of Object.entries(variantCounts)) {
        const variant = saved.readingVariants[key];
        if (Number.isInteger(variant) && variant >= 0 && variant < count) state.readingVariants[key] = variant;
      }
    }
    if (saved.lastResult && typeof saved.lastResult === 'object') {
      const { kind, cardId } = saved.lastResult;
      // Earlier saves did not have a variant index. Rebuild every displayed string locally.
      const variant = saved.lastResult.variant === undefined
        ? kind === 'surprise' ? readings.surprise.findIndex(reading => reading.surprise === saved.lastResult.surprise) : 0
        : saved.lastResult.variant;
      state.lastResult = resultFor(kind, variant, cardId);
      if (state.lastResult) {
        state.readingVariants[resultKey(state.lastResult)] = state.lastResult.variant;
        state.activity = state.lastResult.kind;
        if (kind === 'card') state.lastCardId = cardId;
      }
    }
    const validHand = Array.isArray(saved.dealtIds) && saved.dealtIds.length === 3
      && new Set(saved.dealtIds).size === 3 && saved.dealtIds.every(id => cardById.has(id));
    state.dealtIds = validHand ? [...saved.dealtIds] : deal(state.dealCounter, state.lastCardId);
    if (state.lastResult?.kind === 'card') {
      let index = state.dealtIds.indexOf(state.lastResult.cardId);
      if (index < 0) { state.dealtIds[0] = state.lastResult.cardId; index = 0; }
      state.selectedIndex = index;
    } else if (!state.lastResult && saved.activity === 'card') {
      state.activity = 'card';
      if (state.dealtIds.includes(state.lastCardId)) state.dealtIds = deal(state.dealCounter, state.lastCardId);
    }
    return state;
  }
  function create(saved, { random = Math.random } = {}) {
    const state = sanitize(saved);
    let active = false, activity = state.activity, current = null, elapsed = 0, clock = 0;
    let pendingIndex = -1, pendingResult = null, pendingDeal = null, pendingCounter = 0;
    // Reading history survives putting the props away; these pose timers do not.
    let resting = !activity || Boolean(state.lastResult), holdElapsed = 0;
    const nextTeaDelay = () => ambientTea.delay + Math.floor(random() * ambientTea.variation);
    let idleElapsed = 0, sipElapsed = 0, sipping = false, sipDelay = nextTeaDelay();
    const snapshot = () => ({ ...state, dealtIds: [...state.dealtIds], readingVariants: { ...state.readingVariants }, lastResult: state.lastResult && { ...state.lastResult } });
    const nextVariant = key => ((state.readingVariants[key] ?? -1) + 1) % variantCounts[key];
    const canStart = action => active && Object.hasOwn(actions, action)
      && !(current && activity === action)
      && !(action === 'card' && activity === 'card' && !current && state.selectedIndex === -1);
    const canChoose = index => active && activity === 'card' && !current && state.selectedIndex === -1
      && Number.isInteger(index) && index >= 0 && index < 3;
    function start(action) {
      if (!canStart(action)) return false;
      clearAmbient();
      resting = false; holdElapsed = 0;
      // A new activity replaces the old pending action immediately; nothing is queued.
      activity = action; current = action; elapsed = 0; pendingIndex = -1; pendingDeal = null; pendingResult = null;
      if (action === 'card') {
        pendingCounter = (state.dealCounter + 1) % 1e9;
        pendingDeal = deal(pendingCounter, state.lastCardId, state.dealtIds);
      } else pendingResult = resultFor(action, nextVariant(action));
      return true;
    }
    function choose(index) {
      if (!canChoose(index)) return false;
      clearAmbient();
      resting = false; holdElapsed = 0;
      const cardId = state.dealtIds[index];
      current = 'reveal'; elapsed = 0; pendingIndex = index;
      pendingResult = resultFor('card', nextVariant(`card:${cardId}`), cardId);
      return true;
    }
    function clearPending() {
      current = null; elapsed = 0; pendingIndex = -1; pendingResult = null; pendingDeal = null; pendingCounter = 0;
    }
    function clearAmbient() { idleElapsed = 0; sipElapsed = 0; sipping = false; sipDelay = nextTeaDelay(); }
    function cancelPending() {
      clearPending(); clearAmbient(); activity = state.activity;
      resting = !activity || Boolean(state.lastResult); holdElapsed = 0;
    }
    function tick(delta) {
      const events = [];
      if (!active || !Number.isFinite(delta) || delta <= 0) return events;
      // A suspended browser frame cannot jump directly through a reveal.
      delta = Math.min(delta, 100); clock += delta;
      if (!current) {
        if (!resting) {
          // Leave an unchosen spread available until the visitor picks a card.
          if (state.lastResult?.kind === activity) {
            holdElapsed += delta;
            if (holdElapsed >= readingHold) { resting = true; idleElapsed = 0; }
          }
        } else if (sipping) {
          sipElapsed += delta;
          if (sipElapsed >= ambientTea.duration) clearAmbient();
        } else {
          idleElapsed += delta;
          if (idleElapsed >= sipDelay) { sipping = true; sipElapsed = 0; }
        }
        return events;
      }
      elapsed += delta;
      if (elapsed < (current === 'reveal' ? revealDuration : actions[current])) return events;
      state.activity = activity;
      if (current === 'card') {
        state.dealCounter = pendingCounter; state.dealtIds = [...pendingDeal]; state.selectedIndex = -1; state.lastResult = null;
        events.push('dealt');
      } else {
        state.lastResult = { ...pendingResult };
        state.readingVariants[resultKey(pendingResult)] = pendingResult.variant;
        state.selectedIndex = current === 'reveal' ? pendingIndex : -1;
        if (current === 'reveal') state.lastCardId = pendingResult.cardId;
        events.push('reading');
      }
      clearPending(); events.push('complete');
      return events;
    }
    return {
      checkpoint() { return globalThis.RoomwaveCodec.encode({ checkpointVersion: 1, state,active,activity,current,elapsed,clock,pendingIndex,pendingResult,pendingDeal,pendingCounter,resting,holdElapsed,idleElapsed,sipElapsed,sipping,sipDelay }); },
      restore(checkpoint) {
        const data = globalThis.RoomwaveCodec.decode(checkpoint);
        if (data?.checkpointVersion !== 1) throw new Error('Incompatible room checkpoint');
        Object.assign(state, data.state);
        ({active,activity,current,elapsed,clock,pendingIndex,pendingResult,pendingDeal,pendingCounter,resting,holdElapsed,idleElapsed,sipElapsed,sipping,sipDelay} = data);
        
      },
      get state() { return snapshot(); }, get active() { return active; }, get action() { return current; },
      setActive(value) { active = Boolean(value); }, canStart, canChoose, start, choose, tick, cancelPending,
      get frame() {
        const duration = current === 'reveal' ? revealDuration : current ? actions[current] : 0;
        const actionProgress = duration ? clamp(elapsed / duration, 1) : 0;
        const dealing = current === 'card', selecting = current === 'reveal';
        const selectedIndex = activity !== 'card' || dealing ? -1 : selecting ? pendingIndex : state.selectedIndex;
        const revealed = selectedIndex >= 0 && (!selecting || elapsed >= revealDuration / 2);
        const visibleResult = !current && state.lastResult?.kind === activity ? state.lastResult : null;
        const hand = dealing ? pendingDeal : state.dealtIds;
        let text = visibleResult?.text || (activity === 'card' ? 'Three little mysteries. Choose the card that calls to you.' : 'Come sit a moment. What shall we wonder about?');
        if (dealing) text = 'A fresh little mystery for you…';
        else if (selecting) text = 'Let’s see what your card has to say…';
        else if (current === 'crystal') text = 'The crystal is gathering a little starlight…';
        else if (current === 'tea') text = 'A warm cup, a quiet moment. Let’s read the leaves…';
        else if (current === 'surprise') text = 'Something curious is stirring…';
        return {
          clock, activity, action: current, elapsed, duration, actionProgress, selectedIndex, revealed, resting, ambientTea: sipping,
          canChoose: canChoose(0),
          cards: hand.map((id, index) => {
            const card = cardById.get(id);
            const variant = selecting && id === pendingResult?.cardId ? pendingResult.variant : state.readingVariants[`card:${id}`] ?? 0;
            return { id, title: card.title, meaning: card.meaning, fortune: card.fortunes[variant], revealed: revealed && index === selectedIndex };
          }),
          result: visibleResult && { ...visibleResult }, text,
          crystalGlow: activity === 'crystal' && !resting ? current ? .25 + .65 * actionProgress : .8 : .16,
          steam: activity === 'tea' ? current ? Math.min(1, elapsed / 600) : .24 : 0,
          sparkles: current === 'surprise' && pendingResult?.surprise === 'sparkles' ? actionProgress : selecting && revealed ? .8 * (1 - actionProgress) : current === 'crystal' ? actionProgress * .65 : 0,
          surprise: activity === 'surprise' ? pendingResult?.surprise || visibleResult?.surprise : null
        };
      }
    };
  }
  globalThis.FortuneState = Object.freeze({ storageKey, create, sanitize, actions, revealDuration, readingHold, ambientTea, cards, readings });
})();
