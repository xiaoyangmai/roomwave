/* A local bot-played platformer. Streamer wallets are never modified here. */
(() => {
  'use strict';
  const storageKey = 'roomwave-gaming-v1';
  const actions = Object.freeze({ boost: 4500, banana: 3800, water: 3400, bubbles: 5800, fan: 4200 });
  const checkpoints = [60, 700, 1395, 2070], goalX = 2460;
  const initial = { focus: 78, mood: 82, score: 0, races: 0, distance: 60, platformVersion: 1, checkpoint: 0, coins: [] };
  const clamp = value => Math.max(0, Math.min(100, value));
  const unit = value => Math.max(0, Math.min(1, value));
  function sanitize(saved) {
    const state = { ...initial, coins: [] };
    if (!saved || typeof saved !== 'object') return state;
    for (const key of ['focus', 'mood']) if (Number.isFinite(saved[key])) state[key] = clamp(saved[key]);
    if (Number.isSafeInteger(saved.score) && saved.score >= 0) state.score = Math.min(1e9, saved.score);
    // Old race distance is not a safe platform position. Keep earned points and wellbeing.
    if (saved.platformVersion !== 1) return state;
    if (Number.isSafeInteger(saved.races) && saved.races >= 0) state.races = Math.min(1e9, saved.races);
    if (Number.isInteger(saved.checkpoint) && saved.checkpoint >= 0 && saved.checkpoint < checkpoints.length) state.checkpoint = saved.checkpoint;
    state.distance = checkpoints[state.checkpoint];
    if (Array.isArray(saved.coins)) state.coins = [...new Set(saved.coins.filter(id => Number.isInteger(id) && id >= 0 && id < 64))].sort((a, b) => a - b);
    return state;
  }
  function makeCourse(stage) {
    const platforms = [
      [0, 420, 520, 140], [605, 420, 370, 140], [1055, 420, 420, 140], [1560, 420, 380, 140], [2025, 420, 560, 140],
      [260, 342, 150, 25], [735, 334, 125, 25], [1190, 334, 140, 25], [1695, 334, 130, 25], [2150, 336, 125, 25]
    ].map(([x, y, w, h], id) => ({ id, x, y, w, h }));
    const coins = [];
    const add = (x, y) => coins.push({ id: coins.length, kind: 'coin', x, y, r: 10 });
    for (const [x, y] of [[100, 364], [153, 303], [207, 336], [645, 379], [1100, 374], [1610, 372], [2076, 374], [2320, 355], [2390, 382]]) add(x, y);
    for (const platform of platforms.slice(5)) for (const offset of [25, 65, 105]) if (offset < platform.w - 8) add(platform.x + offset, platform.y - 27);
    for (const [edge, end] of [[520, 605], [975, 1055], [1475, 1560], [1940, 2025]]) {
      add(edge - 10, 323); add((edge + end) / 2, 294); add(end + 8, 351);
    }
    const hazards = [140, 680, 1130, 1640, 2420].map((x, id) => ({ id: `hazard-${id}`, kind: (id + stage) % 2 ? 'slime' : 'banana', x, y: 420, w: 28, h: 24 }));
    return { platforms, coins, hazards };
  }
  function create(saved) {
    const state = sanitize(saved);
    let active = false, current = null, elapsed = 0, clock = 0, accumulator = 0, celebration = 0, finished = false;
    // Effect timers refresh independently; bubbles also keep their own clinging particles.
    const runningEffects = new Map();
    let stage = state.races + 1, course = makeCourse(stage), player, support = 0, coyote = 0, nextDecision = 0;
    let wetness = 0, bubbleCoverage = 0, recovering = 0, invincible = 0, deaths = 0, giftId = 0, coinFlash = 0, lastCoin = null;
    let bubbleParticles = [], nextBubbleId = 0;
    let botIntent = 'Let’s find the flag!', collected = new Set(state.coins), collectedCoins = 0, jumps = 0;
    const addScore = amount => { state.score = Math.min(1e9, state.score + amount); };
    function respawn() {
      player = { x: checkpoints[state.checkpoint], y: 420, w: 30, h: 54, vx: 0, vy: 0, grounded: true };
      support = course.platforms.find(platform => platform.y === 420 && player.x > platform.x && player.x < platform.x + platform.w)?.id ?? 0;
      coyote = 80; nextDecision = clock; state.distance = player.x;
    }
    respawn();
    function canStart(action) { return active && Object.hasOwn(actions, action); }
    function jump() {
      if (!(player.grounded || coyote > 0)) return false;
      player.vy = runningEffects.has('boost') ? -600 : -560; player.grounded = false; coyote = 0; support = null; jumps++;
      return true;
    }
    function decide() {
      nextDecision = clock + 60 + bubbleCoverage * 145 + wetness * 35;
      if (!player.grounded) return;
      const right = player.x + player.w / 2, platform = course.platforms.find(value => value.id === support);
      const danger = course.hazards.find(item => item.x + item.w / 2 > right && item.x - right < 27 + player.vx * .2 && item.y - item.h < player.y + 4 && item.y > player.y - player.h);
      if (danger) { botIntent = 'Jumping over a hazard'; jump(); return; }
      if (platform) {
        const edge = platform.x + platform.w;
        const below = course.platforms.some(value => value.id !== platform.id && value.y >= platform.y && value.x <= edge + 24 && value.x + value.w > edge + 24);
        if (!below && edge - right < 20 + player.vx * .11) { botIntent = 'Jumping across the gap'; jump(); return; }
      }
      const higher = course.platforms.find(value => value.y < player.y - 25 && value.y >= player.y - 105 && value.x > player.x && value.x - right < 40);
      if (higher) { botIntent = 'Up onto the coin platform'; jump(); return; }
      botIntent = bubbleCoverage > .55 ? 'Finding a path through the bubbles' : wetness > .55 ? 'Careful… my hands are wet!' : 'Running toward the flag';
    }
    function fail(events) {
      if (recovering || finished) return;
      deaths++; recovering = 850; player.vx = 0; player.vy = 0; botIntent = 'Back to the checkpoint';
      state.focus = clamp(state.focus - 4); events.push('collision');
    }
    function effects(delta, events) {
      const fan = runningEffects.has('fan');
      wetness = unit(wetness - delta * (fan ? .00032 : .0000125));
      // Distraction settles before every stuck bubble pops, keeping the bot playable.
      bubbleCoverage = unit(bubbleCoverage - delta * (fan ? .00062 : .00003) + (runningEffects.get('bubbles') < 4200 ? delta * .00024 : 0));
      for (const particle of bubbleParticles) {
        particle.age += delta;
        particle.remaining = Math.max(0, particle.remaining - delta * (fan ? 30 : 1));
      }
      bubbleParticles = bubbleParticles.filter(particle => particle.remaining > 0);
      state.focus = clamp(state.focus + delta * (fan ? .0015 : -.000018));
      for (const [action, age] of runningEffects) {
        if (age + delta >= actions[action]) {
          if (action === 'water') state.focus = clamp(state.focus + 7);
          runningEffects.delete(action); events.push('complete');
        } else {
          runningEffects.set(action, age + delta);
        }
      }
      current = [...runningEffects.keys()].at(-1) || null;
      elapsed = runningEffects.get(current) || 0;
    }
    function step(delta, events) {
      clock += delta; effects(delta, events); coinFlash = Math.max(0, coinFlash - delta); invincible = Math.max(0, invincible - delta);
      if (finished) {
        celebration = Math.max(0, celebration - delta);
        if (!celebration) { finished = false; stage = state.races + 1; course = makeCourse(stage); collected = new Set(); state.coins = []; respawn(); }
        return;
      }
      if (recovering) {
        recovering = Math.max(0, recovering - delta);
        if (!recovering) { respawn(); invincible = 2000; }
        return;
      }
      const seconds = delta / 1000;
      const runSpeed = (runningEffects.has('boost') ? 238 : 165) * (1 - bubbleCoverage * .16 - wetness * .06);
      const acceleration = 900 * (1 - wetness * .45);
      player.vx += Math.max(-acceleration * seconds, Math.min(acceleration * seconds, runSpeed - player.vx));
      if (clock >= nextDecision) decide();
      const oldY = player.y;
      player.x += player.vx * seconds; player.vy += 1250 * seconds; player.y += player.vy * seconds;
      const previousGround = player.grounded; player.grounded = false;
      if (player.vy >= 0) {
        const landings = course.platforms.filter(platform => oldY <= platform.y + .01 && player.y >= platform.y && player.x + player.w / 2 > platform.x + 1 && player.x - player.w / 2 < platform.x + platform.w - 1).sort((a, b) => a.y - b.y);
        if (landings.length) { player.y = landings[0].y; player.vy = 0; player.grounded = true; support = landings[0].id; coyote = 80; }
      }
      if (!player.grounded) { coyote = Math.max(0, coyote - delta); if (previousGround) coyote = 80; }
      for (const coin of course.coins) {
        if (collected.has(coin.id)) continue;
        if (Math.abs(player.x - coin.x) < player.w / 2 + coin.r && coin.y + coin.r > player.y - player.h && coin.y - coin.r < player.y) {
          collected.add(coin.id); state.coins = [...collected].sort((a, b) => a - b); addScore(10); collectedCoins++; coinFlash = 500; lastCoin = { x: coin.x, y: coin.y }; events.push('coin');
        }
      }
      if (!invincible) for (const hazard of course.hazards) {
        if (Math.abs(player.x - hazard.x) < (player.w + hazard.w) / 2 - 4 && player.y > hazard.y - hazard.h + 3 && player.y - player.h < hazard.y) {
          if (hazard.gift) course.hazards = course.hazards.filter(value => value !== hazard);
          fail(events); break;
        }
      }
      if (player.y > 560) fail(events);
      if (player.grounded && !recovering) for (let index = state.checkpoint + 1; index < checkpoints.length; index++) {
        if (player.x >= checkpoints[index] && player.y === 420) { state.checkpoint = index; events.push('checkpoint'); }
      }
      state.distance = player.x;
      if (player.x >= goalX && player.grounded && !recovering) {
        finished = true; celebration = 2500; player.vx = 0; addScore(150); state.races = Math.min(1e9, state.races + 1);
        state.checkpoint = 0; state.distance = checkpoints[0]; state.coins = []; events.push('finish');
      }
    }
    return {
      get state() { return { ...state, coins: [...state.coins] }; },
      get active() { return active; }, get action() { return current; },
      setActive(value) { active = Boolean(value); }, canStart,
      start(action) {
        if (!canStart(action)) return false;
        runningEffects.delete(action); runningEffects.set(action, 0);
        current = action; elapsed = 0;
        const changes = { boost: [3, 5], banana: [-11, 3], water: [-5, 5], bubbles: [-16, 9], fan: [18, 4] };
        state.focus = clamp(state.focus + changes[action][0]); state.mood = clamp(state.mood + changes[action][1]);
        // Each gift adds a finite splash; one refreshed spray cannot soak her by itself.
        if (action === 'water') wetness = unit(wetness + .24);
        if (action === 'bubbles') {
          for (let index = 0; index < 12; index++) {
            const id = nextBubbleId++, lifetime = 90000 + id * 7919 % 30001;
            bubbleParticles.push({ id, age: -index * 55, remaining: lifetime, lifetime });
          }
          // Recycle only the oldest bubbles at very high density, keeping rendering bounded.
          if (bubbleParticles.length > 240) bubbleParticles.splice(0, bubbleParticles.length - 240);
          bubbleCoverage = unit(bubbleCoverage + .12);
        }
        if (action === 'banana') {
          const ahead = player.x + 78, ground = course.platforms.filter(value => ahead > value.x && ahead < value.x + value.w && value.y >= player.y - 10).sort((a, b) => a.y - b.y)[0];
          if (ground) {
            // A burst in one spot refreshes that peel rather than stacking an impassable pile.
            const nearby = course.hazards.find(value => value.gift && value.y === ground.y && Math.abs(value.x - ahead) < 42);
            if (nearby) nearby.x = ahead;
            else {
              const gifts = course.hazards.filter(value => value.gift);
              if (gifts.length >= 6) course.hazards = course.hazards.filter(value => value !== gifts[0]);
              course.hazards.push({ id: `gift-${giftId++}`, kind: 'banana', x: ahead, y: ground.y, w: 27, h: 18, gift: true });
            }
          }
        }
        return true;
      },
      tick(delta) {
        const events = [];
        if (!active || !Number.isFinite(delta) || delta <= 0) return events;
        accumulator += Math.min(delta, 100);
        while (accumulator >= 10 - 1e-8) { step(10, events); accumulator = Math.max(0, accumulator - 10); }
        return events;
      },
      get frame() {
        let pose = 'gamer', text = 'Let’s get those coins and reach the flag!';
        if (celebration) { pose = 'gamer-cheer'; text = 'Made it! On to the next stage!'; }
        if (current === 'boost') { pose = 'gamer-cheer'; text = 'Super jumps, here we go!'; }
        if (current === 'banana') { pose = 'gamer-pout'; text = 'A banana on the platform?!'; }
        if (current === 'water') {
          pose = 'gamer-pout';
          text = wetness >= .85 ? 'Okay, I’m completely soaked!' : wetness >= .45 ? 'My shirt’s getting wetter!' : 'Ah! You splashed me!';
        }
        if (current === 'bubbles' || bubbleCoverage > .48) { pose = 'gamer-pout'; text = bubbleParticles.length >= 48 ? 'More bubbles?! They’re all over my room!' : 'These bubbles are sticking to me!'; }
        if (!current && wetness > .35 && bubbleCoverage < .48) text = 'Still soggy… watch that jump!';
        if (current === 'fan') { pose = 'gamer-cheer'; text = 'Drying off. Much better!'; }
        if (recovering && !current) { pose = 'gamer-pout'; text = 'Oops! Back to the checkpoint.'; }
        return {
          action: current, effects: Object.fromEntries(runningEffects), elapsed, clock, pose, text, celebration, stage, progress: unit((player.x - 60) / (goalX - 60)),
          player: { ...player }, platforms: course.platforms.map(value => ({ ...value })),
          items: [...course.coins.map(coin => ({ ...coin, active: !collected.has(coin.id) })), ...course.hazards.map(hazard => ({ ...hazard, active: true }))],
          checkpoints: checkpoints.map((x, index) => ({ x, y: 420, reached: index <= state.checkpoint })), goal: { x: goalX, y: 420 },
          cameraX: Math.max(0, player.x - 160), worldDistance: player.x, steering: player.vx / 238, jumping: !player.grounded && !recovering,
          speed: player.vx / 165, botIntent: recovering ? 'Back to the checkpoint' : botIntent, wetness, bubbleCoverage,
          bubbleParticles: bubbleParticles.map(particle => ({ ...particle })),
          recovering, invincible, deaths, jumps, coinFlash, lastCoin: lastCoin && { ...lastCoin }, collectedCoins
        };
      }
    };
  }
  globalThis.GamingState = Object.freeze({ create, sanitize, storageKey, actions });
})();
