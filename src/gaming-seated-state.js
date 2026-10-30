/* The seated room is a separate, local bot-played platformer save. */
(() => {
  'use strict';
  const storageKey = 'roomwave-gaming-seated-v1';
  const actions = Object.freeze({ star: 4000, banana: 3800, water: 3400, foam: 4200, fan: 3200 });
  const effectCapDuration = action => action === 'star' ? actions.star : action === 'fan' ? 6000 : 9000;
  const checkpoints = [60, 2070], goalX = 4375;
  const initial = { score: 0, races: 0, distance: 60, platformVersion: 2, checkpoint: 0, coins: [] };
  const unit = value => Math.max(0, Math.min(1, value));
  const foamAnchors = ['hair', 'headphone-left', 'headphone-right', 'shoulder-left', 'shoulder-right', 'shirt', 'skirt', 'hand-left', 'hand-right'];
  function sanitize(saved) {
    const state = { ...initial, coins: [] };
    if (!saved || typeof saved !== 'object') return state;
    if (Number.isSafeInteger(saved.score) && saved.score >= 0) state.score = Math.min(1e9, saved.score);
    if (Number.isSafeInteger(saved.races) && saved.races >= 0) state.races = Math.min(1e9, saved.races);
    // Keep earned progress while mapping older saves onto the remaining safe flag.
    // The original 36 coin IDs retain their positions in the extended course.
    if (![1, 2].includes(saved.platformVersion)) return state;
    if (saved.platformVersion === 1) state.checkpoint = saved.checkpoint === 3 ? 1 : 0;
    else if (Number.isInteger(saved.checkpoint) && saved.checkpoint >= 0 && saved.checkpoint < checkpoints.length) state.checkpoint = saved.checkpoint;
    state.distance = checkpoints[state.checkpoint];
    const coinLimit = saved.platformVersion === 1 ? 36 : 64;
    if (Array.isArray(saved.coins)) state.coins = [...new Set(saved.coins.filter(id => Number.isInteger(id) && id >= 0 && id < coinLimit))].sort((a, b) => a - b);
    return state;
  }
  function makeCourse(stage) {
    const ground = [
      [0, 420, 520, 140], [605, 420, 370, 140], [1055, 420, 420, 140], [1560, 420, 380, 140], [2025, 420, 620, 140],
      [2750, 420, 370, 140], [3200, 420, 420, 140], [3705, 420, 380, 140], [4170, 420, 560, 140]
    ];
    const ledges = [
      [260, 342, 150, 25], [735, 334, 125, 25], [1190, 334, 140, 25], [1695, 334, 130, 25], [2150, 336, 125, 25],
      [2880, 334, 115, 25], [3335, 334, 120, 25], [3840, 334, 110, 25], [4200, 340, 110, 25]
    ];
    const platforms = [...ground, ...ledges].map(([x, y, w, h], id) => ({ id, x, y, w, h }));
    const coins = [];
    const add = (x, y) => coins.push({ id: coins.length, kind: 'coin', x, y, r: 10 });
    const ledgeCoins = entries => { for (const [x, y, w] of entries) for (const offset of [25, 65, 105]) if (offset < w - 8) add(x + offset, y - 27); };
    const gapCoins = entries => { for (const [edge, end] of entries) { add(edge - 10, 323); add((edge + end) / 2, 294); add(end + 8, 351); } };
    // Preserve these IDs and coordinates so a migrated save cannot collect them twice.
    for (const [x, y] of [[100, 364], [153, 303], [207, 336], [645, 379], [1100, 374], [1610, 372], [2076, 374], [2320, 355], [2390, 382]]) add(x, y);
    ledgeCoins(ledges.slice(0, 5));
    gapCoins([[520, 605], [975, 1055], [1475, 1560], [1940, 2025]]);
    ledgeCoins(ledges.slice(5));
    gapCoins([[2645, 2750], [3120, 3200], [3620, 3705], [4085, 4170]]);
    for (const [x, y] of [[2790, 374], [3245, 374], [3755, 374], [4370, 374]]) add(x, y);
    const hazards = [140, 680, 1150, 1640, 2420, 2910, 3275, 3785].map((x, id) => ({ id: `hazard-${id}`, kind: (id + stage) % 2 ? 'slime' : 'banana', x, y: 420, w: 28, h: 24 }));
    return { platforms, coins, hazards };
  }
  const dialogue = {
    fan: ['Hey! One hand is doing all the work!', 'Skirt, stay put… I can still make this jump!', 'You picked the exact wrong moment for a breeze!'],
    missed: ['One more jump—whoa, that breeze!', 'Oh! Wait, my skirt!', 'Ah, I forgot about the fan!'],
    late: ['Ah! Wait—got it! Eyes on the game…', 'Oh! That gust caught me off guard!', 'Okay, caught it! Now, where was that jump?'],
    foam: ['Now my sleeve is all fluffy!', 'I can keep playing through this!', 'How did it get on my skirt too?'],
    foamDense: ['I’m disappearing into all this foam!', 'Where did my chair go? Still playing!', 'You’ve turned my camera into a foam cloud!'],
    face: ['A little help? There’s foam in my bangs!', 'One second… I can’t see that side!', 'Wiping with one hand, jumping with the other!'],
    wetFace: ['Wet bangs and foam… one quick wipe!', 'One hand for the foam, one for this jump!', 'Wiping my eye… my hands are slippery!'],
    smear: ['Oh no, I just put it on my cheek!', 'That was supposed to wipe it OFF!', 'Now it’s on my cheek too… still playing!'],
    recover: ['Both hands back. Let’s get those coins!', 'Okay, I’ve got the controller again!', 'There we go. Back to my game!'],
    refocus: ['Okay, back to those coins!', 'Eyes on the next platform!', 'There we go. Back to my game!']
  };
  const onsetDuration = reaction => reaction.kind === 'foam' ? 800 : reaction.late ? 500 : 260;
  function create(saved, { random = Math.random } = {}) {
    const state = sanitize(saved);
    let active = false, current = null, elapsed = 0, clock = 0, accumulator = 0, celebration = 0, finished = false;
    // Rendering reads snapshots; all randomness and timing live in fixed simulation steps.
    const roll = () => { const value = random(); return Number.isFinite(value) ? unit(value) : .5; };
    const runningEffects = new Map();
    const effectCaps = new Map(), effectStrength = new Map(), pendingReactions = new Map();
    let stage = state.races + 1, course = makeCourse(stage), player, support = 0, coyote = 0, nextDecision = 0;
    let wetness = 0, recovering = 0, invincible = 0, deaths = 0, giftId = 0, coinFlash = 0, lastCoin = null, viewWidth = 800;
    let foamParticles = [], nextFoamId = 0, nextFoamBlowAt = 0, reaction = null, respiteUntil = 0, pendingJump = null, delayedInputs = 0, missedInputs = 0;
    let foamAmount = 0, foamFill = 0;
    const foamDeposits = Object.fromEntries(foamAnchors.map(anchor => [anchor, { amount: 0, fill: 0, lastImpactAt: -Infinity, pending: new Map() }]));
    let botIntent = 'Let’s find the flag!', collected = new Set(state.coins), collectedCoins = 0, jumps = 0;
    const addScore = amount => { state.score = Math.min(1e9, state.score + amount); };
    const cameraX = () => Math.max(0, player.x - 160);
    function fallingBananas(delta, events) {
      const seconds = delta / 1000;
      for (const banana of course.hazards) {
        // A landed gift lasts almost a full run, but cannot make a gap impassable forever.
        if (banana.gift && !banana.falling && !banana.spent && clock - banana.landedAt >= 24000) { banana.spent = true; banana.remaining = 400; }
        if (banana.spent) banana.remaining -= delta;
        if (!banana.falling) continue;
        banana.x = cameraX() + viewWidth / 2;
        const previousY = banana.y;
        banana.age += delta; banana.vy += 420 * seconds; banana.y += banana.vy * seconds;
        const platform = course.platforms.filter(value => previousY <= value.y && banana.y >= value.y && banana.x > value.x && banana.x < value.x + value.w).sort((a, b) => a.y - b.y)[0];
        if (platform) {
          banana.y = platform.y; banana.vy = 0; banana.falling = false; banana.landedAt = clock;
          events.push('banana-land');
        }
      }
      course.hazards = course.hazards.filter(value => value.falling ? value.y <= 560 : !value.spent || value.remaining > 0);
    }
    function respawn() {
      player = { x: checkpoints[state.checkpoint], y: 420, w: 30, h: 54, vx: 0, vy: 0, grounded: true };
      support = course.platforms.find(platform => platform.y === 420 && player.x > platform.x && player.x < platform.x + platform.w)?.id ?? 0;
      coyote = 80; nextDecision = clock; pendingJump = null; state.distance = player.x;
    }
    respawn();
    function canStart(action) { return active && Object.hasOwn(actions, action); }
    function resetToIdle() {
      runningEffects.clear();
      effectCaps.clear();
      effectStrength.clear();
      pendingReactions.clear();
      reaction = null;
      current = null;
      elapsed = 0;
      wetness = 0;
      foamAmount = 0;
      foamFill = 0;
      foamParticles = [];
      for (const deposit of Object.values(foamDeposits)) {
        deposit.amount = 0;
        deposit.fill = 0;
        deposit.pending.clear();
      }
    }
    function jump() {
      if (!(player.grounded || coyote > 0)) return false;
      player.vy = -560; player.grounded = false; coyote = 0; support = null; jumps++;
      return true;
    }
    function handsOnController() {
      return reaction?.phase === 'reaction' && (reaction.kind === 'fan' || wiping()) ? 1 : 2;
    }
    function wiping() {
      return Boolean(reaction?.kind === 'foam' && reaction.faceHit && reaction.phase === 'reaction');
    }
    function foamAttention() {
      return Boolean(reaction?.kind === 'foam' && reaction.phase === 'reaction' && !wiping());
    }
    function reactionPose(value = reaction) {
      if (!value) return 'idle';
      if (value.kind === 'foam' && !value.faceHit) return 'foam-notice';
      if (value.phase === 'recovery') return 'recover';
      if (value.kind === 'fan') {
        if (value.phase === 'onset') return value.late ? 'fan-missed' : 'fan-onset';
        return value.late && clock - value.phaseAt < 500 ? 'fan-late' : 'fan-hold';
      }
      return value.phase === 'onset' ? 'foam-onset' : 'foam-wipe';
    }
    function beginRecovery(events) {
      if (!reaction || reaction.phase === 'recovery') return;
      reaction.returnPose = reactionPose();
      reaction.phase = 'recovery'; reaction.phaseAt = clock; reaction.endsAt = clock + 500;
      respiteUntil = Math.max(respiteUntil, clock + 1700);
      events.push('reaction-recovery');
    }
    function beginReaction(kind) {
      const requested = pendingReactions.get(kind), late = kind === 'fan' && roll() < .20;
      const faceHit = kind === 'foam' && Boolean(requested?.faceHit), smear = faceHit && Boolean(requested?.smear);
      reaction = { kind, phase: 'onset', started: clock, phaseAt: clock, endsAt: clock + (kind === 'fan' ? actions.fan : 2600), late, faceHit, smear, smeared: false, nextWipeAt: clock + 1500, variant: Math.min(2, Math.floor(roll() * 3)) };
      pendingReactions.delete(kind);
    }
    function updateReaction(events) {
      if (reaction) {
        if (reaction.phase === 'onset' && clock - reaction.phaseAt >= onsetDuration(reaction)) {
          reaction.phase = 'reaction'; reaction.phaseAt = clock; events.push('reaction');
        }
        if (reaction.kind === 'foam' && reaction.pendingFaceAt && clock >= reaction.pendingFaceAt) {
          reaction.faceHit = true; reaction.smear ||= reaction.pendingSmear; reaction.pendingFaceAt = null;
          // A new face hit changes the illustrated action only after its clump arrives.
          reaction.nextWipeAt = Math.max(reaction.nextWipeAt, clock + 500);
        }
        if (reaction.kind === 'foam' && reaction.faceHit && reaction.phase === 'reaction' && clock >= reaction.nextWipeAt) {
          reaction.nextWipeAt = clock + 800;
          const isFaceClump = particle => particle.anchor === 'bangs' && particle.age >= 650 && !particle.detached;
          // Matching water materials preserve her clothes while only the face is wiped.
          const before = foamParticles.length;
          foamParticles = foamParticles.filter(particle => !isFaceClump(particle));
          if (foamParticles.length < before && reaction.smear && !reaction.smeared) { addFoamParticle('cheek', true); reaction.smeared = true; }
        }
        if (reaction.phase !== 'recovery' && (clock >= reaction.endsAt || (reaction.kind === 'fan' && !runningEffects.has('fan')))) beginRecovery(events);
        if (reaction.phase === 'recovery' && clock >= reaction.endsAt) { reaction = null; events.push('reaction-complete'); }
      }
      if (!reaction && clock >= respiteUntil && !recovering) {
        for (const [kind, requested] of pendingReactions) {
          if (clock - requested.at > 9500 || (kind === 'fan' && !runningEffects.has('fan'))) { pendingReactions.delete(kind); continue; }
          if (kind === 'foam' && !foamParticles.some(particle => !particle.detached)) { pendingReactions.delete(kind); continue; }
          beginReaction(kind); break;
        }
      }
    }
    function requestJump(intent) {
      botIntent = intent;
      if (handsOnController() === 1) {
        const intensity = effectStrength.get(reaction.kind) || .45;
        // Missing an input is a chance, never a gift-triggered collision or forced loss.
        if (roll() < .055 + intensity * .065) { missedInputs++; botIntent = 'Oops, a thumb missed the jump button!'; return; }
        if (roll() < .72) {
          pendingJump = { at: clock + 30 + roll() * 65, intent };
          delayedInputs++; botIntent = reaction.kind === 'fan' ? 'Holding my skirt… jump, jump!' : 'Wiping my bangs… just a second!'; return;
        }
      } else if (foamAttention() && roll() < .3) {
        pendingJump = { at: clock + 20 + roll() * 25, intent };
        delayedInputs++; botIntent = 'So much foam… eyes back on the jump!'; return;
      }
      jump();
    }
    function addFoamParticle(anchor, smear = false) {
      const id = nextFoamId++, lifetime = 11000 + id * 7919 % 9001;
      const particle = { id, anchor, x: ((id * 37 % 101) / 100 - .5) * .06, y: ((id * 61 % 101) / 100 - .5) * .05,
        scale: anchor === 'bangs' ? 1.4 : smear ? .65 : .55 + (id * 13 % 9) / 10,
        age: smear ? 650 : anchor === 'bangs' ? 0 : -(id % 9) * 35, remaining: lifetime, lifetime, smear, detached: false,
        ...(anchor === 'bangs' ? { dissolveAt: clock + 1500 } : {}) };
      foamParticles.push(particle);
      if (foamParticles.length > 96) foamParticles.splice(0, foamParticles.length - 96);
      return particle;
    }
    function queueFoamDeposit(anchor, particle) {
      const deposit = foamDeposits[anchor];
      // Match the visible clump's flight and stagger. Fixed-step arrival buckets
      // merge simultaneous gifts, with at most 94 cohorts per anchor and one
      // full layer of pending foam even if thousands of gifts arrive together.
      const arrivesAt = clock + Math.ceil((650 - particle.age) / 10) * 10;
      const pendingAmount = [...deposit.pending.values()].reduce((sum, amount) => sum + amount, 0);
      const added = Math.min(.085, Math.max(0, 1 - pendingAmount));
      if (added > 0) deposit.pending.set(arrivesAt, (deposit.pending.get(arrivesAt) || 0) + added);
    }
    function decide() {
      nextDecision = clock + (handsOnController() === 1 ? 100 : foamAttention() ? 85 : 70) + roll() * 25 + wetness * 20;
      if (!player.grounded || pendingJump) return;
      const right = player.x + player.w / 2, platform = course.platforms.find(value => value.id === support);
      const starPower = runningEffects.has('star');
      const danger = !starPower && course.hazards.find(item => !item.falling && !item.spent && item.x + item.w / 2 > right && item.x - right < 27 + player.vx * .2 && item.y - item.h < player.y + 4 && item.y > player.y - player.h);
      if (danger) { requestJump('Jumping over a hazard'); return; }
      if (platform) {
        const edge = platform.x + platform.w;
        const below = course.platforms.some(value => value.id !== platform.id && value.y >= platform.y && value.x <= edge + 24 && value.x + value.w > edge + 24);
        const nextGround = course.platforms.filter(value => value.y >= platform.y && value.x > edge).sort((a, b) => a.x - b.x)[0];
        const takeoffWindow = nextGround && nextGround.x - edge > 90 ? 14 + player.vx * .04 : 20 + player.vx * .11;
        if (!below && edge - right < takeoffWindow) {
          // Wet running speed changes the landing point.
          // If the usual takeoff descends onto a hazard beyond the gap, wait for
          // a later safe takeoff while the runner still has platform support.
          const launchSpeed = 560;
          const landingX = player.x + player.vx * launchSpeed * 2 / 1250;
          const landingHazard = !starPower && course.hazards.filter(item => !item.falling && !item.spent && item.x > edge && item.y === platform.y && Math.abs(item.x - landingX) < 50).sort((a, b) => b.x - a.x)[0];
          if (landingHazard) {
            const dangerY = landingHazard.y - landingHazard.h + 3;
            const descendingAt = (launchSpeed + Math.sqrt(launchSpeed * launchSpeed + 2500 * (dangerY - player.y))) / 1250;
            const safeTakeoff = landingHazard.x + (player.w + landingHazard.w) / 2 + 4 - player.vx * descendingAt;
            if (safeTakeoff <= edge + 2 && player.x < safeTakeoff) { botIntent = 'Timing a safe landing past the hazard'; return; }
          }
          requestJump('Jumping across the gap'); return;
        }
      }
      // Optional coin detours are skipped while a landed peel occupies the ledge;
      // jumping up into its underside would collide before avoidance can react.
      const higher = course.platforms.find(value => value.y < player.y - 25 && value.y >= player.y - 105 && value.x > player.x && value.x - right < 40 &&
        (starPower || !course.hazards.some(hazard => !hazard.falling && !hazard.spent && hazard.y === value.y && hazard.x > value.x && hazard.x < value.x + value.w)));
      if (higher) { requestJump('Up onto the coin platform'); return; }
      botIntent = starPower ? 'Star Power! Running through hazards!' : handsOnController() === 1 ? 'Keeping the game going with one hand' : wetness > .55 ? 'Careful… my hands are wet!' : 'Running toward the flag';
    }
    function fail(events) {
      if (recovering || finished) return;
      deaths++; recovering = 850; player.vx = 0; player.vy = 0; botIntent = 'Back to the checkpoint';
      // Star Power protects against hazards, but a fall still loses the power-up.
      if (runningEffects.delete('star')) {
        effectCaps.delete('star'); effectStrength.delete('star');
        current = [...runningEffects.keys()].at(-1) || null; elapsed = runningEffects.get(current) || 0;
      }
      pendingJump = null; beginRecovery(events); respiteUntil = Math.max(respiteUntil, clock + 3000); events.push('collision');
    }
    function effects(delta, events) {
      const fan = runningEffects.has('fan'), water = runningEffects.has('water');
      wetness = unit(wetness - delta * (fan ? .0000625 : .0000125));
      // Foam grows from the places it actually lands. Dense coverage belongs
      // to those same anchors instead of a separate rising camera-wide bank.
      foamAmount = 0; foamFill = 0;
      for (const deposit of Object.values(foamDeposits)) {
        for (const [arrivesAt, amount] of deposit.pending) {
          if (clock < arrivesAt) continue;
          deposit.amount = unit(deposit.amount + amount); deposit.lastImpactAt = clock;
          deposit.pending.delete(arrivesAt);
        }
        // Water rinses even fresh foam during the spray. Incoming clumps still
        // land at their normal times, then join the layer being washed away.
        const foamDrain = (water ? .00045 : 0) + (fan ? .0001 : clock - deposit.lastImpactAt > 4000 ? .000025 : 0);
        deposit.amount = unit(deposit.amount - delta * foamDrain);
        const difference = deposit.amount - deposit.fill;
        deposit.fill = unit(deposit.fill + Math.max(-delta * foamDrain, Math.min(delta * .00035, difference)));
        if (Math.abs(deposit.fill - deposit.amount) < 1e-8) deposit.fill = deposit.amount;
        foamAmount += deposit.amount / foamAnchors.length;
        foamFill += deposit.fill / foamAnchors.length;
      }
      foamAmount = unit(foamAmount); foamFill = unit(foamFill);
      for (const particle of foamParticles) {
        particle.age += delta;
        const rinse = water && !particle.detached && particle.age >= 650;
        particle.remaining = Math.max(0, particle.remaining - delta * (rinse ? 12 : 1));
        if (particle.detached) {
          particle.driftAge += delta;
          const progress = unit(particle.driftAge / particle.driftDuration);
          particle.driftX = progress * .40;
          particle.driftY = -.13 * progress + .19 * progress * progress;
        }
      }
      foamParticles = foamParticles.filter(particle => particle.remaining > 0 && (!particle.detached || particle.driftAge < particle.driftDuration));
      if (fan && clock >= nextFoamBlowAt) {
        const particle = foamParticles.find(value => !value.detached && value.age >= 650);
        if (particle) {
          Object.assign(particle, { detached: true, detachedPose: reactionPose(), driftAge: 0, driftDuration: 1400, driftX: 0, driftY: 0 });
          nextFoamBlowAt = clock + 280;
        }
      }
      if (water && foamAmount === 0 && foamFill === 0 && !foamParticles.some(particle => !particle.detached) && !Object.values(foamDeposits).some(deposit => deposit.pending.size)) {
        pendingReactions.delete('foam');
        // Finish a wipe normally when the last bubbles have been rinsed off.
        // A simultaneous fan keeps its own reaction and recovery timing.
        if (reaction?.kind === 'foam') { reaction.pendingFaceAt = null; beginRecovery(events); }
      }
      for (const [action, age] of runningEffects) {
        if (age + delta >= actions[action] || clock >= effectCaps.get(action)) {
          runningEffects.delete(action); effectCaps.delete(action); effectStrength.delete(action); events.push('complete');
        } else {
          runningEffects.set(action, age + delta);
        }
      }
      current = [...runningEffects.keys()].at(-1) || null;
      elapsed = runningEffects.get(current) || 0;
      updateReaction(events);
    }
    function step(delta, events) {
      clock += delta; effects(delta, events); coinFlash = Math.max(0, coinFlash - delta); invincible = Math.max(0, invincible - delta);
      if (finished) {
        celebration = Math.max(0, celebration - delta);
        if (!celebration) { finished = false; stage = state.races + 1; course = makeCourse(stage); collected = new Set(); state.coins = []; respawn(); }
        fallingBananas(delta, events);
        return;
      }
      if (recovering) {
        recovering = Math.max(0, recovering - delta);
        if (!recovering) { respawn(); invincible = 2000; }
        fallingBananas(delta, events);
        return;
      }
      const seconds = delta / 1000;
      const starPower = runningEffects.has('star');
      const runSpeed = (starPower ? 238 : 165) * (1 - wetness * .06);
      const acceleration = 900 * (1 - wetness * .45);
      player.vx += Math.max(-acceleration * seconds, Math.min(acceleration * seconds, runSpeed - player.vx));
      if (pendingJump && clock >= pendingJump.at) { botIntent = pendingJump.intent; pendingJump = null; jump(); }
      if (clock >= nextDecision) decide();
      const oldY = player.y;
      player.x += player.vx * seconds; player.vy += 1250 * seconds; player.y += player.vy * seconds;
      const previousGround = player.grounded; player.grounded = false;
      if (player.vy >= 0) {
        const landings = course.platforms.filter(platform => oldY <= platform.y + .01 && player.y >= platform.y && player.x + player.w / 2 > platform.x + 1 && player.x - player.w / 2 < platform.x + platform.w - 1).sort((a, b) => a.y - b.y);
        if (landings.length) { player.y = landings[0].y; player.vy = 0; player.grounded = true; support = landings[0].id; coyote = 80; }
      }
      if (!player.grounded) { coyote = Math.max(0, coyote - delta); if (previousGround) coyote = 80; }
      fallingBananas(delta, events);
      for (const coin of course.coins) {
        if (collected.has(coin.id)) continue;
        if (Math.abs(player.x - coin.x) < player.w / 2 + coin.r && coin.y + coin.r > player.y - player.h && coin.y - coin.r < player.y) {
          collected.add(coin.id); state.coins = [...collected].sort((a, b) => a - b); addScore(10); collectedCoins++; coinFlash = 500; lastCoin = { x: coin.x, y: coin.y }; events.push('coin');
        }
      }
      if (starPower || !invincible) for (const hazard of course.hazards) {
        if (!hazard.falling && !hazard.spent && Math.abs(player.x - hazard.x) < (player.w + hazard.w) / 2 - 4 && player.y > hazard.y - hazard.h + 3 && player.y - player.h < hazard.y) {
          if (starPower) {
            course.hazards = course.hazards.filter(value => value !== hazard);
            events.push('star-hit'); continue;
          }
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
      checkpoint() { return globalThis.RoomwaveCodec.encode({ checkpointVersion: 1, state,active,current,elapsed,clock,accumulator,celebration,finished,stage,course,player,support,coyote,nextDecision,wetness,recovering,invincible,deaths,giftId,coinFlash,lastCoin,viewWidth,foamParticles,nextFoamId,nextFoamBlowAt,reaction,respiteUntil,pendingJump,delayedInputs,missedInputs,foamAmount,foamFill,botIntent,collected,collectedCoins,jumps,runningEffects,effectCaps,effectStrength,pendingReactions,foamDeposits }); },
      restore(checkpoint) {
        const data = globalThis.RoomwaveCodec.decode(checkpoint);
        if (data?.checkpointVersion !== 1) throw new Error('Incompatible room checkpoint');
        Object.assign(state, data.state);
        ({active,current,elapsed,clock,accumulator,celebration,finished,stage,course,player,support,coyote,nextDecision,wetness,recovering,invincible,deaths,giftId,coinFlash,lastCoin,viewWidth,foamParticles,nextFoamId,nextFoamBlowAt,reaction,respiteUntil,pendingJump,delayedInputs,missedInputs,foamAmount,foamFill,botIntent,collected,collectedCoins,jumps} = data);
        runningEffects.clear(); for(const [key,value] of data.runningEffects) runningEffects.set(key,value);
        effectCaps.clear(); for(const [key,value] of data.effectCaps) effectCaps.set(key,value);
        effectStrength.clear(); for(const [key,value] of data.effectStrength) effectStrength.set(key,value);
        pendingReactions.clear(); for(const [key,value] of data.pendingReactions) pendingReactions.set(key,value);
        Object.assign(foamDeposits,data.foamDeposits);
      },
      get state() { return { ...state, coins: [...state.coins] }; },
      get active() { return active; }, get action() { return current; },
      setActive(value) { active = Boolean(value); }, canStart, resetToIdle,
      setViewport(width, height) {
        const next = width / (height / 500);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || !Number.isFinite(next)) return false;
        viewWidth = next;
        for (const banana of course.hazards) if (banana.falling) banana.x = cameraX() + viewWidth / 2;
        return true;
      },
      start(action) {
        if (!canStart(action)) return false;
        // A fresh star renews the full temporary power-up without stacking time.
        if (action === 'star' || !runningEffects.has(action)) effectCaps.set(action, clock + effectCapDuration(action));
        runningEffects.delete(action); runningEffects.set(action, 0);
        effectStrength.set(action, Math.min(1, (effectStrength.get(action) || .32) + .18));
        current = action; elapsed = 0;
        // Gifts affect actions and the actual bot; no visible wellbeing meters are needed.
        if (action === 'water') wetness = unit(wetness + .24);
        let faceHit = false, smear = false;
        if (action === 'foam') {
          faceHit = roll() < .14; smear = faceHit && roll() < .16;
          for (const anchor of foamAnchors) queueFoamDeposit(anchor, addFoamParticle(anchor));
          if (faceHit) addFoamParticle('bangs');
        }
        if (action === 'fan' || action === 'foam') {
          // A two-handed foam notice cannot hide the fan's actual skirt-holding action.
          if (action === 'fan' && reaction?.kind === 'foam' && reaction.phase !== 'recovery' && !wiping()) reaction = null;
          if (reaction?.kind === action && reaction.phase !== 'recovery') {
            // Repeats can extend this reaction, but never postpone recovery indefinitely.
            reaction.endsAt = Math.min(reaction.started + (action === 'fan' ? 4700 : 5700), reaction.endsAt + 500);
            if (faceHit) {
              if (reaction.faceHit) reaction.smear ||= smear;
              else { reaction.pendingFaceAt ||= clock + 800; reaction.pendingSmear ||= smear; }
            }
          } else {
            const pending = pendingReactions.get(action);
            if (pending) { pending.faceHit ||= faceHit; pending.smear ||= smear; }
            else pendingReactions.set(action, { at: clock, faceHit, smear });
            if (!reaction && clock >= respiteUntil && !recovering) beginReaction(action);
          }
        }
        if (action === 'banana') {
          // Every gift gets its own drop. Peels leave through ordinary collisions,
          // falls or their active-time lifetime, never because another was sent.
          course.hazards.push({ id: `gift-${giftId++}`, kind: 'banana', x: cameraX() + viewWidth / 2, y: 160, vy: 0, age: 0, w: 27, h: 18, gift: true, falling: true });
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
        let pose = 'idle', expression = 'focused', text = 'Let’s get those coins and reach the flag!', reactionFrame = null;
        if (celebration) { expression = 'delighted'; text = 'Made it! On to the next stage!'; }
        if (current === 'star') { expression = 'excited'; text = 'Star Power! Nothing can bump me now!'; }
        if (current === 'banana') { expression = 'surprised'; text = course.hazards.some(hazard => hazard.falling) ? 'Watch out, falling banana!' : 'A banana on the platform?!'; }
        if (current === 'water') {
          const fresh = (runningEffects.get('water') || 0) < 650;
          expression = fresh ? 'startled' : wetness > .6 ? 'pouting' : 'focused';
          if (fresh) pose = 'water-flinch';
          text = wetness > .6 ? 'My hands are slippery! Careful…' : 'Ah! You splashed me!';
        }
        if (reaction) {
          const phaseDuration = reaction.phase === 'onset' ? onsetDuration(reaction) : reaction.endsAt - reaction.phaseAt;
          const returnPose = reaction.returnPose || reactionPose();
          reactionFrame = { kind: reaction.kind, phase: reaction.phase, progress: unit((clock - reaction.phaseAt) / phaseDuration), late: reaction.late, smear: reaction.smear && reaction.smeared,
            faceHit: reaction.faceHit, wiping: wiping(), foamTarget: reaction.kind === 'foam' ? reaction.faceHit ? 'face' : 'clothes' : null,
            returnPose, variant: reaction.variant, respite: clock < respiteUntil };
          if (reaction.phase === 'recovery') {
            pose = reactionPose(); expression = 'relieved'; text = dialogue[reaction.kind === 'foam' ? 'refocus' : 'recover'][reaction.variant];
          } else if (reaction.kind === 'fan') {
            pose = reactionPose();
            expression = pose === 'fan-missed' ? 'surprised' : pose === 'fan-late' ? 'surprised-embarrassed' : 'determined';
            text = dialogue[pose === 'fan-missed' ? 'missed' : reaction.late ? 'late' : 'fan'][reaction.variant];
          } else {
            pose = reactionPose(); expression = reaction.smear && reaction.smeared ? 'sheepish' : reaction.faceHit ? 'squinting' : 'playfully-annoyed';
            text = dialogue[reaction.smear && reaction.smeared ? 'smear' : reaction.faceHit ? wetness > 0 ? 'wetFace' : 'face' : foamFill > .55 ? 'foamDense' : 'foam'][reaction.variant];
          }
        }
        if (recovering && !reaction) { expression = 'sheepish'; text = 'Oops! Back to the checkpoint.'; }
        const fanCap = effectCapDuration('fan'), fanAge = clock - ((effectCaps.get('fan') || fanCap) - fanCap);
        const fanRemaining = Math.min(actions.fan - (runningEffects.get('fan') || 0), (effectCaps.get('fan') || 0) - clock);
        const fanIntensity = runningEffects.has('fan') ? (effectStrength.get('fan') || .5) * unit(fanAge / 400) * unit(fanRemaining / 600) : 0;
        const starPower = runningEffects.has('star'), starRemaining = starPower ? Math.max(0, actions.star - runningEffects.get('star')) : 0;
        return {
          action: current, effects: Object.fromEntries(runningEffects), elapsed, clock, pose, text, celebration, stage, progress: unit((player.x - 60) / (goalX - 60)),
          expression, reaction: reactionFrame, handsOnController: handsOnController(), respite: clock < respiteUntil,
          fanIntensity, foamFill, foamAmount,
          foamDeposits: Object.fromEntries(Object.entries(foamDeposits).map(([anchor, deposit]) => [anchor, deposit.fill])),
          foamPending: Object.values(foamDeposits).reduce((sum, deposit) => sum + deposit.pending.size, 0),
          foamCoverage: unit(foamParticles.filter(particle => !particle.detached).length / 54), foamParticles: foamParticles.map(particle => ({ ...particle })),
          inputLatency: pendingJump ? Math.max(0, pendingJump.at - clock) : handsOnController() === 1 ? 85 : foamAttention() ? 70 : 60,
          delayedInputs, missedInputs,
          player: { ...player }, platforms: course.platforms.map(value => ({ ...value })),
          items: [...course.coins.map(coin => ({ ...coin, active: !collected.has(coin.id) })), ...course.hazards.map(hazard => ({ ...hazard, active: true }))],
          checkpoints: checkpoints.map((x, index) => ({ x, y: 420, reached: index <= state.checkpoint })), goal: { x: goalX, y: 420 },
          cameraX: cameraX(), viewWidth, worldDistance: player.x, steering: player.vx / 238, jumping: !player.grounded && !recovering,
          speed: player.vx / 165, botIntent: recovering ? 'Back to the checkpoint' : botIntent, wetness,
          recovering, invincible, starPower, starRemaining, deaths, jumps, coinFlash, lastCoin: lastCoin && { ...lastCoin }, collectedCoins
        };
      }
    };
  }
  globalThis.GamingSeatedState = Object.freeze({ create, sanitize, storageKey, actions });
})();
