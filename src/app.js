'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionScale = reducedMotion ? 0.18 : 1;

  // Room time stops while watching another room. Keep accepted gifts, their remaining
  // animation time, and rescue deadlines together instead of completing unseen.
  function createRoomClock() {
    const timers = new Map(), pausedAnimations = new Set();
    let active = (window.LiveRooms?.activeRoom ?? 'stream') === 'stream';
    let pausedAt = active ? 0 : performance.now(), pausedDuration = 0, nextTimer = 0;
    const now = () => (active ? performance.now() : pausedAt) - pausedDuration;
    function arm(id, timer) {
      if (!active) return;
      timer.nativeId = window.setTimeout(() => {
        if (!active || timers.get(id) !== timer) return;
        timers.delete(id);
        timer.callback();
      }, Math.max(0, timer.at - now()));
    }
    function pauseAnimation(animation) {
      if (animation.playState !== 'running' && !animation.pending) return;
      animation.pause();
      pausedAnimations.add(animation);
    }
    return {
      now,
      get active() { return active; },
      setTimeout(callback, wait = 0) {
        const id = ++nextTimer, timer = { callback, at: now() + Math.max(0, wait), nativeId: 0 };
        timers.set(id, timer);
        arm(id, timer);
        return id;
      },
      clearTimeout(id) {
        const timer = timers.get(id);
        if (!timer) return;
        window.clearTimeout(timer.nativeId);
        timers.delete(id);
      },
      track(animation) { if (!active) pauseAnimation(animation); },
      untrack(animation) { pausedAnimations.delete(animation); },
      setActive(value) {
        if (active === value) return;
        if (!value) {
          pausedAt = performance.now();
          active = false;
          timers.forEach(timer => window.clearTimeout(timer.nativeId));
          document.querySelector('#stage-camera')?.getAnimations?.({ subtree: true }).forEach(pauseAnimation);
        } else {
          pausedDuration += performance.now() - pausedAt;
          active = true;
          timers.forEach((timer, id) => arm(id, timer));
          pausedAnimations.forEach(animation => { if (animation.playState === 'paused') animation.play(); });
          pausedAnimations.clear();
        }
      }
    };
  }
  window.streamRoomClock = createRoomClock();
  window.addEventListener('live-room-change', event => window.streamRoomClock.setActive(event.detail.room === 'stream'));

  const stage = $('#stage-camera');
  const svg = $('.stage-svg');
  const effectsLayer = $('#effects-layer');
  const likeEffects = $('#like-effects');
  const rescueSystem = $('#rescue-system');
  const rescueTime = $('#rescue-time');
  const rescueScore = $('#rescue-score');
  const rescueMessage = $('#rescue-message');
  const reactionLabel = $('#reaction-label');
  const srStatus = $('#sr-status');
  const likeCount = $('#like-count');
  const giftLedger = $('#gift-ledger');
  const spendTotal = $('#spend-total');
  const giftStatus = $('#gift-status');
  const giftButtons = $$('#gift-buttons button');
  const rescueGiftConfig = Object.freeze({
    rose: { points: 1, cost: 1 },
    heart: { points: 100, cost: 100 },
    sunglasses: { points: -200, cost: 200 },
    corgi: { points: 300, cost: 300 },
    gg: { points: -1, cost: 1 }
  });
  const giftIds = Object.freeze(['rose', 'heart', 'sunglasses', 'corgi', 'gg']);
  const giftLabels = Object.freeze({
    rose: 'Rose',
    heart: 'Heart',
    sunglasses: 'Sunglasses',
    corgi: 'Mini Dance',
    gg: 'GG'
  });
  const giftLedgerStorageKey = 'roomwave-fake-gift-ledger-v1';
  const particleGlyphs = Object.freeze({
    rose: ['🌹'],
    heart: ['❤️'],
    sunglasses: ['😎'],
    corgi: ['🐶'],
    gg: ['GG']
  });
  const chineseAngryLines = Object.freeze([
    'SB?! 又来?! 😡',
    '傻逼?! 还加?!',
    '靠！又来?!'
  ]);
  const pickAngryLine = (englishLines, chineseLines = chineseAngryLines) => (
    Math.random() < 0.18 ? pick(chineseLines) : pick(englishLines)
  );
  const svgNamespace = 'http://www.w3.org/2000/svg';
  function createRoomLayout(frame) {
    const listeners = new Map();
    const query = matches => ({ matches, addEventListener(type, callback) {
      if (type === 'change') {
        if (!listeners.has(this)) listeners.set(this, new Set());
        listeners.get(this).add(callback);
      }
    } });
    const portrait = query(true), shallowLandscape = query(false);
    function refresh() {
      const { width, height } = frame.getBoundingClientRect();
      // Inactive rooms can be hidden. Keep their last usable layout until shown.
      if (width <= 0 || height <= 0) return;
      const next = [width <= height, width > height && height <= 600];
      const changed = [portrait, shallowLandscape].filter((layout, index) => {
        const changed = layout.matches !== next[index];
        layout.matches = next[index];
        return changed;
      });
      changed.forEach(layout => listeners.get(layout)?.forEach(callback => callback({ matches: layout.matches })));
    }
    refresh();
    new ResizeObserver(refresh).observe(frame);
    return { portrait, shallowLandscape };
  }
  // The desktop player is also portrait: cast and camera follow the room frame,
  // not the browser window around it.
  window.streamRoomLayout = createRoomLayout($('.app-shell'));
  const mobileLayout = window.streamRoomLayout.portrait;
  const shallowLandscape = window.streamRoomLayout.shallowLandscape;

  function syncRescueFraming() {
    const target = svg.querySelector('.rescue-closeup.full-pose-character');
    const kneeling = Boolean(target);
    const matrix=target&&svg.getScreenCTM?.();
    if(matrix&&matrix.a>0&&matrix.d>0&&Math.abs(matrix.b)<1e-6&&Math.abs(matrix.c)<1e-6){
      const box=stage.getBoundingClientRect();
      let left=box.left+18,right=box.right-18,top=box.top+12,bottom=box.bottom-18;
      if(mobileLayout.matches){
        // Dialogue has its own row below this camera, so only the countdown
        // occupies the top of the rescue scene.
        top=Math.max(box.top+126,rescueSystem.getBoundingClientRect().bottom+16);
      }else{
        // Landscape has an unobstructed center lane between the top controls
        // and between the countdown and speech cards at the bottom.
        left=Math.max(left,$('.host-profile').getBoundingClientRect().right+12,rescueSystem.getBoundingClientRect().right+12);
        right=Math.min(right,$('#visits-pill').getBoundingClientRect().left-12,$('.rescue-speaker')?.getBoundingClientRect().left-12||right);
      }
      const layout=window.characterSprites?.uprightRescueLayout({root:target},mobileLayout.matches,{
        left:(left-matrix.e)/matrix.a,right:(right-matrix.e)/matrix.a,
        top:(top-matrix.f)/matrix.d,bottom:(bottom-matrix.f)/matrix.d
      });
      if(layout){
        stage.style.setProperty('--rescue-focus-scale',String(layout.scale));
        stage.style.setProperty('--rescue-focus-y',`${layout.offsetY}px`);
        return;
      }
    }
    let zoom = 1.55;
    let offsetY = kneeling ? -26 : 230;
    if (mobileLayout.matches) {
      // Fit the complete pose below the countdown, with clear space at the feet.
      const [,viewTop,viewWidth,viewHeight]=svg.getAttribute('viewBox').split(' ').map(Number);
      const unit = Math.min(stage.clientWidth / viewWidth, stage.clientHeight / viewHeight);
      if (unit > 0) {
        const letterboxTop = stage.clientHeight - viewHeight * unit;
        const cameraTop=stage.getBoundingClientRect().top;
        const clearTop=Math.max(126,rescueSystem.getBoundingClientRect().bottom-cameraTop+16);
        const top = viewTop + (clearTop - letterboxTop) / unit;
        const bottom = 460 - 18 / unit;
        // Includes the enlarged 1.4 portrait framing.
        zoom = Math.min(kneeling ? 1.4 : 1.12, Math.max(.15, (bottom - top) / (kneeling ? 372 : 490)));
        offsetY = bottom - 290 - 120 * zoom;
      }
    }
    stage.style.setProperty('--rescue-focus-scale', String(zoom));
    stage.style.setProperty('--rescue-focus-y', `${offsetY}px`);
  }

  function syncStageViewport() {
    if (mobileLayout.matches) {
      // The header is the only overlay above the cast; speech has a bottom row.
      const height=Math.max(570,stage.clientHeight*580/Math.max(120,stage.clientHeight-78));
      svg.setAttribute('viewBox', `200 ${470-height} 400 ${height}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    } else if (shallowLandscape.matches) {
      // Keep a little sky above the tallest haircut on sideways phones.
      svg.setAttribute('viewBox', '0 40 800 440');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    } else {
      svg.setAttribute('viewBox', '0 0 800 520');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
    syncRescueFraming();
  }

  let stablePenaltyViewport=null;
  function penaltyViewport() {
    const matrix=svg.getScreenCTM?.();
    if(!matrix||matrix.a<=0||matrix.d<=0)return null;
    // A camera shake must not also become a zoom or change contact placement.
    if(Math.abs(matrix.b)>1e-6||Math.abs(matrix.c)>1e-6)return stablePenaltyViewport;
    const box=stage.getBoundingClientRect();
    const padding=mobileLayout.matches?8:18;
    const hudBottom=rescueSystem.getBoundingClientRect().bottom;
    let left=box.left+padding,right=box.right-padding;
    let top=Math.max(box.top+(mobileLayout.matches?126:80),hudBottom+12);
    if(shallowLandscape.matches){
      // On a sideways phone, use the tall center lane between the header's
      // controls. The counter and dialogue sit in the left-hand margin.
      left=$('.host-profile').getBoundingClientRect().right+12;
      right=$('#visits-pill').getBoundingClientRect().left-12;
      top=box.top+8;
    }
    stablePenaltyViewport={
      left:(left-matrix.e)/matrix.a,
      right:(Math.max(left+1,right)-matrix.e)/matrix.a,
      top:(top-matrix.f)/matrix.d,
      bottom:(Math.max(top+1,box.bottom-padding)-matrix.f)/matrix.d
    };
    return stablePenaltyViewport;
  }

  syncStageViewport();
  mobileLayout.addEventListener('change', syncStageViewport);
  shallowLandscape.addEventListener('change', syncStageViewport);

  const stagePositions = (visibleIds = ['lily', 'mia']) => ({
    lily: 300, stella: 300, mia: 500,
    ...Object.fromEntries(visibleIds.map((id, index) => [id, mobileLayout.matches ? 300 + index * 200 : 260 + index * 280]))
  });
  const cast = Object.freeze({
    lily: { name: 'Lilly', baseX: stagePositions().lily, crownY: -63 },
    stella: { name: 'Stella', baseX: stagePositions().stella, crownY: -53 },
    mia: { name: 'Mia', baseX: stagePositions().mia, crownY: -43 }
  });

  Object.keys(cast).forEach((id) => window.installCharacterSprite($(`#${id}`), id));

  const makeCharacter = (id) => {
    const root = $(`#${id}`);
    root.setAttribute('transform',`translate(${cast[id].baseX} 160)`);
    root.dataset.stageX=String(cast[id].baseX);
    // Keep the skirt above the legs in every pose, without changing their rig.
    const upperBody = $('.hip-bender', root);
    if (!root.classList.contains('illustrated-character')) {
      $$('.upper-leg', root).forEach((leg) => upperBody.before(leg));
    }
    const framing = document.createElementNS(svgNamespace, 'g');
    framing.setAttribute('class', 'cast-framing');
    const mover = $('.mover', root);
    mover.before(framing);
    framing.append(mover);
    return {
      id,
      ...cast[id],
      root,
      positioner: $('.positioner', root),
      mover: $('.mover', root),
      rig: $('.rig', root),
      hipBender: $('.hip-bender', root),
      headGroup: $('.head-group', root),
      torso: $('.torso', root),
      armLeft: $('.upper-arm.left', root),
      armRight: $('.upper-arm.right', root),
      forearmLeft: $('.lower-arm.left', root),
      forearmRight: $('.lower-arm.right', root),
      legLeft: $('.upper-leg.left', root),
      legRight: $('.upper-leg.right', root),
      shinLeft: $('.lower-leg.left', root),
      shinRight: $('.lower-leg.right', root),
      duckCrown: $('.duck-crown', root),
      bubble: $(`#bubble-${id}`),
      sunglassesTimer: 0,
      fakeCryTimer: 0
    };
  };

  const characters = {
    lily: makeCharacter('lily'),
    stella: makeCharacter('stella'),
    mia: makeCharacter('mia')
  };

  const characterList = Object.values(characters);
  const defaultCastIds = ['lily', 'mia'];
  let visibleCastIds = [...defaultCastIds], requestedCastIds = [...defaultCastIds];
  let ownedCharacterIds = new Set(defaultCastIds);
  let nextGiftCharacter = 0;
  // Start each visit on Any; a named recipient stays selected until changed.
  let selectedRecipientId = 'lily';
  let takeTurns = true;
  const heartPose = 'mix';
  let heartPoseIndex = 0;
  function activeCharacters() {
    return visibleCastIds.map(id => characters[id]);
  }
  function castChangePending() {
    return requestedCastIds.some((id, index) => id !== visibleCastIds[index]);
  }
  function notifyCast() {
    window.dispatchEvent?.(new CustomEvent('stream:cast', { detail: {
      characterIds: [...visibleCastIds], requestedCharacterIds: [...requestedCastIds], pending: castChangePending()
    } }));
  }
  function applyPendingCast() {
    if (!castChangePending() || controller.phase !== 'idle' || controller.pendingCount || controller.rescue) return false;
    // A saved swap waits for every already accepted gift to finish with its
    // original pair. Offstage characters never replace a queued recipient.
    window.streamLife?.interrupt();
    visibleCastIds = [...requestedCastIds];
    return true;
  }
  function setActiveCast(ids, ownership = {}) {
    if (Array.isArray(ownership.characters)) {
      ownedCharacterIds = new Set([...defaultCastIds, ...ownership.characters.filter(item => item?.owned === true && Object.hasOwn(characters, item.id)).map(item => item.id)]);
    }
    if (!Array.isArray(ids) || ids.length !== 2 || ids[0] === ids[1] || ids.some(id => !Object.hasOwn(characters, id) || !ownedCharacterIds.has(id))) return false;
    const changed = ids.some((id, index) => id !== requestedCastIds[index]);
    requestedCastIds = [...ids];
    if (applyPendingCast()) syncVisibleCast();
    else if (changed) notifyCast();
    return true;
  }
  function syncVisibleCast() {
    const visible = activeCharacters();
    const positions = stagePositions(visible.map(character => character.id));
    const previousCast = stage.dataset.visibleCharacters;
    stage.dataset.visibleCharacters = visible.map(character => character.id).join(',');
    characterList.forEach(character => {
      const shown = visible.includes(character);
      character.root.classList.toggle('is-offstage', !shown);
      character.root.setAttribute('aria-hidden', String(!shown));
      character.root.hidden = !shown;
      character.bubble.hidden = !shown;
      if (shown) {
        character.root.removeAttribute('hidden');
        character.bubble.removeAttribute('hidden');
      } else {
        character.root.setAttribute('hidden', '');
        character.bubble.setAttribute('hidden', '');
        character.bubble.classList.remove('show');
        character.bubble.setAttribute('aria-hidden', 'true');
      }
      $('.name-tag', character.root).setAttribute('tabindex', shown ? '0' : '-1');
      character.baseX = positions[character.id];
      character.root.setAttribute('transform', `translate(${character.baseX} 160)`);
      character.root.dataset.stageX = String(character.baseX);
      const shadow = $(`[data-shadow-for="${character.id}"]`);
      shadow?.setAttribute('cx', String(character.baseX));
      shadow?.classList.toggle('is-offstage', !shown);
      if (shown) shadow?.removeAttribute('hidden'); else shadow?.setAttribute('hidden', '');
    });
    if (!visible.some(character => character.id === selectedRecipientId)) selectedRecipientId = visible[0].id;
    nextGiftCharacter %= visible.length;
    const names = visible.map(character => character.name), title = $('#stream-room .host-stack > b');
    if (title) title.textContent = names.join(' & ');
    $('#stream-room')?.setAttribute('aria-label', 'Hangout live room');
    svg.setAttribute('aria-label', `Adult anime streamers ${names.join(' and ')}. Select a name to send her gifts.`);
    characterList.forEach(character => window.characterSprites.refreshLayout?.(character));
    renderRecipientSelection();
    if (previousCast !== stage.dataset.visibleCharacters) notifyCast();
  }
  function renderRecipientSelection() {
    const helping=controller.activeRescueTarget;
    const recipient=helping||characters[selectedRecipientId];
    characterList.forEach(character=>{
      const tag=$('.name-tag',character.root);
      const selected=!takeTurns&&selectedRecipientId===character.id;
      tag.setAttribute('aria-pressed',String(selected));
      tag.setAttribute('aria-disabled',String(Boolean(helping)));
      character.root.classList.toggle('gift-selected',selected);
    });
    const label=helping?`Helping ${recipient.name}`:takeTurns?'To: Any':`To: ${recipient.name}`;
    $('#target-status').textContent=label;
    $('#recipient-label').textContent=label;
    const toggle=$('#take-turns');
    toggle.setAttribute('aria-disabled',String(Boolean(helping)));
    toggle.setAttribute('tabindex',helping?'-1':'0');
    toggle.setAttribute('aria-pressed',String(takeTurns));
    stage.dataset.recipientSelection=takeTurns?'any':selectedRecipientId;
    stage.dataset.giftRecipient=recipient.id;
  }
  function selectRecipient(id) {
    if (window.streamRoomClock?.active===false||!activeCharacters().some(character=>character.id===id)||controller.activeRescueTarget) return false;
    selectedRecipientId=id;
    takeTurns=false;
    renderRecipientSelection();return true;
  }
  function setTakeTurns(enabled) {
    if (window.streamRoomClock?.active===false||typeof enabled!=='boolean'||controller.activeRescueTarget) return false;
    takeTurns=enabled;
    renderRecipientSelection();return true;
  }
  function chooseGiftCharacter() {
    const visible = activeCharacters();
    const next = characters[controller.targetId] || visible[nextGiftCharacter];
    nextGiftCharacter = (visible.indexOf(next) + 1) % visible.length;
    return next;
  }
  const nextCharacter = (target) => {
    const visible = activeCharacters();
    return visible[(visible.indexOf(target) + 1) % visible.length];
  };
  // The other selected host stays the rescue helper for the entire interaction.
  const choosePenaltyHelper = (target) => nextCharacter(target);

  function idleExpression(character) {
    return window.characterMood?.idleExpression(character.id) || (character.id === 'mia' ? 'embarrassed' : 'happy');
  }

  function placeSpeech(character) {
    if (!activeCharacters().includes(character)) return;
    const dialogue=$('#stream-dialogue');
    const cast=activeCharacters().slice().sort((a,b)=>a.baseX-b.baseX);
    const focused=stage.classList.contains('rescue-mode');
    dialogue.dataset.focused=String(focused);
    dialogue.style.setProperty('--speech-columns',String(cast.length));
    cast.forEach((item,index)=>{
      item.bubble.style.gridColumn=focused?'1 / -1':String(index+1);
    });
  }
  const speechObserver = new ResizeObserver(() => {
    syncStageViewport();
    controller.refreshPenaltyLayout?.();
    characterList.forEach(placeSpeech);
  });
  speechObserver.observe(stage);

  function flashSunglasses(duration = 1000, shared = false) {
    const clock=shared?window:(window.streamRoomClock||window);
    characterList.forEach((character) => {
      clock.clearTimeout(character.sunglassesTimer);
      character.root.classList.add('wearing-sunglasses');
      character.sunglassesTimer = clock.setTimeout(() => {
        character.root.classList.remove('wearing-sunglasses');
        character.sunglassesTimer = 0;
      }, duration);
    });
  }

  function clearFakeCry(character) {
    (window.streamRoomClock || window).clearTimeout(character.fakeCryTimer);
    character.fakeCryTimer = 0;
    character.root.classList.remove('fake-crying');
  }

  function fakeCry(round, duration = 1550) {
    const character = round.target;
    clearFakeCry(character);
    setExpression(character, 'crying');
    character.root.classList.add('fake-crying');
    character.fakeCryTimer = (window.streamRoomClock || window).setTimeout(() => {
      character.root.classList.remove('fake-crying');
      character.fakeCryTimer = 0;
      if (controller.rescue === round && round.accepting && round.balance < 0 && character.root.classList.contains('expr-crying')) {
        setExpression(character, 'worried');
      }
    }, duration);
  }

  function delay(ms) {
    return new Promise((resolve) => (window.streamRoomClock || window).setTimeout(resolve, Math.max(40, ms * motionScale)));
  }

  function clockDelay(ms) {
    return new Promise((resolve) => (window.streamRoomClock || window).setTimeout(resolve, Math.max(25, ms)));
  }

  function setExpression(character, expression) {
    [...character.root.classList]
      .filter((className) => className.startsWith('expr-'))
      .forEach((className) => character.root.classList.remove(className));
    character.root.classList.add(`expr-${expression}`);
    window.characterSprites.expression(character, expression);
  }

  function say(character, text, hideOthers = false, voiceEvent = null, silent = false) {
    if (!activeCharacters().includes(character)) return;
    if(voiceEvent)text=window.characterVoices?.selectText(character.id,voiceEvent,text)||text;
    if (hideOthers) {
      characterList.forEach((item) => {
        item.bubble.classList.remove('show');
        item.bubble.setAttribute('aria-hidden', 'true');
      });
    }
    character.bubble.textContent = text;
    character.bubble.setAttribute('aria-hidden', 'false');
    character.bubble.classList.add('show');
    placeSpeech(character);
    srStatus.textContent = `${character.name}: ${text}`;
    if(!silent)window.characterVoices?.speak(character.id,text,voiceEvent);
  }

  function hideSpeech() {
    characterList.forEach((character) => {
      character.bubble.classList.remove('show');
      character.bubble.setAttribute('aria-hidden', 'true');
    });
  }

  function formatBalance(value) {
    if (value === 0) return '0';
    return `${value > 0 ? '+' : '−'}${Math.abs(value)}`;
  }

  function formatLikes(value) {
    if (value < 1000) return String(value);
    const compact = (value / 1000).toFixed(value < 10000 ? 1 : 0).replace(/\.0$/, '');
    return `${compact}K`;
  }

  function getPenaltyUnits(balance) {
    return Math.ceil(Math.max(0, -balance) / 200);
  }

  function renderDucks(character, count) {
    if (Number(character.duckCrown.dataset.count || 0) === count) return;
    character.duckCrown.replaceChildren();
    character.duckCrown.dataset.count = String(count);
    const visibleCount = Math.min(5, count);
    const crownY = character.crownY;
    for (let index = 0; index < visibleCount; index += 1) {
      const duck = document.createElementNS(svgNamespace, 'text');
      duck.setAttribute('x', String((index - (visibleCount - 1) / 2) * 20));
      duck.setAttribute('y', String(crownY - (index % 2 ? 2 : 0)));
      duck.setAttribute('text-anchor', 'middle');
      duck.textContent = '🐤';
      character.duckCrown.append(duck);
    }
    if (count > visibleCount) {
      const overflow = document.createElementNS(svgNamespace, 'text');
      overflow.setAttribute('class', 'duck-overflow');
      overflow.setAttribute('x', '56');
      overflow.setAttribute('y', String(crownY - 3));
      overflow.textContent = `+${count - visibleCount}`;
      character.duckCrown.append(overflow);
    }
  }

  function showRescueSystem(time, balance, message, state = '', pulse = true) {
    rescueTime.textContent = time;
    rescueTime.setAttribute('data-unit',typeof time==='number'?(state==='locked'?' left':'s'):'');
    rescueTime.setAttribute('aria-label',typeof time==='number'?`${time} ${state==='locked'?'left':`second${time===1?'':'s'} remaining`}`:String(time));
    rescueScore.textContent = formatBalance(balance);
    rescueMessage.textContent = message;
    rescueSystem.setAttribute('aria-hidden', 'false');
    rescueSystem.classList.toggle('safe', state === 'safe');
    rescueSystem.classList.toggle('locked', state === 'locked');
    rescueSystem.classList.toggle('urgent', !state && Number(time) <= 3);
    rescueSystem.classList.add('show');
    if (pulse) {
      rescueSystem.classList.remove('tick');
      void rescueSystem.offsetWidth;
      rescueSystem.classList.add('tick');
    }
  }

  function hideRescueSystem() {
    rescueSystem.classList.remove('show', 'tick', 'safe', 'locked', 'urgent');
    rescueSystem.setAttribute('aria-hidden', 'true');
  }

  function spawnParticles(kind, count, target = null, shared = false) {
    const clock=shared?window:(window.streamRoomClock||window);
    const glyphs = particleGlyphs[kind] || particleGlyphs.heart;
    const base = target ? (target.baseX - 130) / 540 * 100 : 50;

    for (let index = 0; index < count; index += 1) {
      clock.setTimeout(() => {
        if(shared&&(document.hidden||window.LiveRooms?.activeRoom!=='stream'))return;
        const particle = document.createElement('span');
        const duration = randomInt(1350, 2300) * motionScale;
        particle.className = 'particle';
        if(shared)particle.dataset.sharedGift=kind;
        particle.textContent = pick(glyphs);
        particle.style.left = `${Math.max(5, Math.min(95, base + randomInt(-18, 18)))}%`;
        particle.style.setProperty('--drift', `${randomInt(-90, 90)}px`);
        particle.style.setProperty('--duration', `${Math.max(300, duration)}ms`);
        particle.style.animationDelay = `${randomInt(0, 180)}ms`;
        if (effectsLayer.childElementCount >= 120) effectsLayer.firstElementChild?.remove();
        effectsLayer.append(particle);
        particle.addEventListener('animationend', () => particle.remove(), { once: true });
        clock.setTimeout(() => particle.remove(), Math.max(700, duration + 500));
      }, index * Math.max(25, 70 * motionScale));
    }
  }

  function impact(text = 'SMACK!', {shared=false,age=0,key=''} = {}) {
    const burst = document.createElement('div');
    burst.className = 'impact';
    burst.textContent = text;
    if(shared){burst.dataset.sharedImpact=key;burst.style.animationDelay=`-${age}ms`;}
    effectsLayer.append(burst);
    if(!shared||!reducedMotion&&age<170){
      stage.classList.remove('shake');
      if(shared)stage.style.animationDelay=`-${age}ms`;
      void stage.offsetWidth;
      stage.classList.add('shake');
    }
    burst.addEventListener('animationend', () => burst.remove(), { once: true });
    (shared?window:window.streamRoomClock || window).setTimeout(() => {
      burst.remove();
      if(!shared||!effectsLayer.querySelector('[data-shared-impact]')){
        stage.classList.remove('shake');
        if(shared)stage.style.removeProperty('animation-delay');
      }
    }, shared?Math.max(0,(reducedMotion?180:520)-age):Math.max(180, 520 * motionScale));
  }

  let likes = 0;

  function addLikeAt(clientX, clientY) {
    if (window.streamRoomClock?.active===false) return;
    const rect = stage.getBoundingClientRect();
    const x = Number.isFinite(clientX) ? clientX - rect.left : rect.width / 2;
    const y = Number.isFinite(clientY) ? clientY - rect.top : rect.height / 2;
    likes += 1;
    likeCount.textContent = formatLikes(likes);
    likeCount.parentElement.setAttribute('aria-label', `Send a like. ${likes.toLocaleString()} like${likes === 1 ? '' : 's'}`);

    const heart = document.createElement('span');
    heart.className = 'tap-heart';
    heart.textContent = pick(['❤️', '💗', '💕']);
    heart.style.left = `${Math.max(8, Math.min(rect.width - 8, x))}px`;
    heart.style.top = `${Math.max(8, Math.min(rect.height - 8, y))}px`;
    heart.style.setProperty('--tap-drift', `${randomInt(-28, 28)}px`);
    heart.style.setProperty('--tap-rotate', `${randomInt(-18, 18)}deg`);
    if (likeEffects.childElementCount >= 80) likeEffects.firstElementChild?.remove();
    likeEffects.append(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
    (window.streamRoomClock || window).setTimeout(() => heart.remove(), reducedMotion ? 600 : 1250);
  }

  function loadGiftLedger() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(giftLedgerStorageKey) || '{}');
      return {
        spent: Number.isFinite(saved.spent) && saved.spent >= 0 ? Math.floor(saved.spent) : 0,
        gifts: Number.isFinite(saved.gifts) && saved.gifts >= 0 ? Math.floor(saved.gifts) : 0
      };
    } catch {
      return { spent: 0, gifts: 0 };
    }
  }

  function saveGiftLedger(spent, gifts) {
    try {
      window.localStorage.setItem(giftLedgerStorageKey, JSON.stringify({ spent, gifts }));
    } catch {
      // The in-page ledger still works when private browsing blocks storage.
    }
  }

  class ReactionController {
    constructor() {
      this.busy = false;
      this.phase = 'idle';
      this.rescue = null;
      this.animations = new Set();
      this.touched = new Set();
      this.lastGift = null;
      this.activeGift = null;
      this.pendingGifts = [];
      this.bubbleTimer = 0;
      const savedLedger = loadGiftLedger();
      this.totalSpent = savedLedger.spent;
      this.giftsSent = savedLedger.gifts;
      this.handlers = {
        rose: () => this.rose(),
        heart: () => this.heart(),
        corgi: () => this.corgi(),
        gg: () => this.gg(),
        sunglasses: (count) => this.sunglasses(count)
      };
      giftButtons.forEach((button) => {
        button.dataset.defaultLabel = button.getAttribute('aria-label') || '';
      });
      this.renderLedger();
    }

    get activeRescueTarget() {
      // The round owns incoming gifts as soon as its close-up starts. The
      // countdown itself still gets its full ten seconds after that animation.
      return this.rescue&&(this.phase==='transition'||this.rescue.accepting)
        ? this.rescue.target : null;
    }

    get pendingCount() {
      return this.pendingGifts.reduce((total, batch) => total + batch.count, 0);
    }

    renderLedger() {
      const queued = this.pendingCount;
      spendTotal.textContent = this.totalSpent.toLocaleString();
      giftStatus.textContent = queued
        ? `${queued} QUEUED`
        : `${this.giftsSent.toLocaleString()} GIFT${this.giftsSent === 1 ? '' : 'S'}`;
      giftLedger.classList.toggle('has-queue', queued > 0);
      giftLedger.setAttribute(
        'aria-label',
        `${this.giftsSent.toLocaleString()} gift${this.giftsSent === 1 ? '' : 's'} sent; ${this.totalSpent.toLocaleString()} total gift coins${queued ? `; ${queued} queued` : ''}`
      );
    }

    recordGift(gift, recipient = null) {
      const cost = rescueGiftConfig[gift]?.cost || 0;
      this.totalSpent += cost;
      this.giftsSent += 1;
      saveGiftLedger(this.totalSpent, this.giftsSent);
      // Count accepted gifts once, including merged/queued gifts and rescues.
      window.characterMood?.recordGift(gift,recipient);
      window.wardrobe?.recordGift(gift,recipient);
      this.renderLedger();
      giftLedger.classList.remove('bump');
      void giftLedger.offsetWidth;
      giftLedger.classList.add('bump');
      (window.streamRoomClock || window).setTimeout(() => giftLedger.classList.remove('bump'), 320);
    }

    queueGift(gift, count = 1, recipientId = null) {
      const lastBatch = this.pendingGifts[this.pendingGifts.length - 1];
      if (lastBatch?.gift === gift && lastBatch.recipientId === recipientId) {
        lastBatch.count += count;
      } else {
        this.pendingGifts.push({ gift, count, recipientId });
      }
      this.renderLedger();
      return true;
    }

    send(gift) {
      if(window.Roomwave?.together)return Roomwave.send('stream','send',[gift,takeTurns?'either':selectedRecipientId==='lily'?'lilly':selectedRecipientId]);
      if (window.streamRoomClock?.active===false||!this.handlers[gift]||window.wardrobe?.resetting||window.wardrobe?.ready===false) return false;
      window.streamLife?.interrupt();
      const rescueTarget=this.activeRescueTarget;
      const merge=this.phase==='reaction'&&this.activeGift===gift&&this.pendingGifts.length===0&&(takeTurns||this.activeRecipientId===selectedRecipientId);
      const lastBatch=this.pendingGifts[this.pendingGifts.length-1];
      // A glasses burst waiting behind an ordinary reaction is one upcoming
      // round too. Explicit choices and gifts after a round closes still queue.
      const continuesGlasses=!this.rescue&&gift==='sunglasses'&&lastBatch?.gift===gift&&Boolean(lastBatch.recipientId)&&(takeTurns||lastBatch.recipientId===selectedRecipientId);
      const recipientId=rescueTarget?.id||(merge?this.activeRecipientId:continuesGlasses?lastBatch.recipientId:selectedRecipientId);
      if(takeTurns&&!merge&&!rescueTarget&&!continuesGlasses){
        selectedRecipientId=nextCharacter(characters[recipientId]).id;
      }
      renderRecipientSelection();
      this.recordGift(gift,recipientId);
      window.cameraMoment?.onGift?.(gift);
      spawnParticles(gift, 1, rescueTarget);

      if (this.phase === 'rescue') {
        if (gift === 'sunglasses') flashSunglasses();
        if (this.applyRescueGift(gift)) return true;
        return this.queueGift(gift,1,recipientId);
      }

      if (this.phase === 'idle') {
        void this.run(gift, 1, recipientId);
        if (gift === 'sunglasses') flashSunglasses();
        return true;
      }

      if (gift === 'sunglasses') flashSunglasses();

      if (merge) {
        return true;
      }

      return this.queueGift(gift,1,recipientId);
    }

    drainQueue() {
      if (window.streamRoomClock?.active===false||window.wardrobe?.resetting||this.phase !== 'idle' || !this.pendingGifts.length) return false;
      const batch = this.pendingGifts.shift();
      // Combine repeat performances only before the next rescue round. Gifts
      // after Sunglasses retain their order because each can change its score.
      if (batch.gift !== 'sunglasses') {
        for (let index = 0; index < this.pendingGifts.length;) {
          const pending = this.pendingGifts[index];
          if (pending.gift === 'sunglasses') break;
          if (pending.gift === batch.gift && pending.recipientId === batch.recipientId) {
            batch.count += pending.count;
            this.pendingGifts.splice(index, 1);
          } else {
            index += 1;
          }
        }
      }
      this.renderLedger();
      void this.run(batch.gift, batch.count, batch.recipientId);
      return true;
    }

    flushPendingToRescue() {
      const round = this.rescue;
      if (!round?.accepting || !this.pendingGifts.length) return;
      const batches = this.pendingGifts.splice(0);
      this.renderLedger();

      batches.forEach(({ gift, count, recipientId }) => {
        if (recipientId && recipientId !== round.target.id) {
          this.queueGift(gift, count, recipientId);
          return;
        }
        for (let index = 0; index < count; index += 1) {
          if (this.phase !== 'rescue' || !round.accepting || !this.applyRescueGift(gift)) {
            this.queueGift(gift, count - index, recipientId);
            break;
          }
        }
      });
    }

    restoreGiftMetadata() {
      giftButtons.forEach((button) => {
        button.setAttribute('aria-label', button.dataset.defaultLabel);
      });
    }

    lock(locked) {
      this.busy = locked;
      renderRecipientSelection();
      this.restoreGiftMetadata();
      giftButtons.forEach((button) => {
        button.disabled = false;
        button.setAttribute('aria-disabled', 'false');
      });
      $('#gift-buttons').setAttribute('aria-busy', 'false');
      $('#gift-buttons').dataset.charactersBusy = String(locked);
    }

    openRescueControls(round) {
      this.busy = true;
      this.phase = 'rescue';
      renderRecipientSelection();
      giftButtons.forEach((button) => {
        const gift = button.dataset.gift;
        const config = rescueGiftConfig[gift];
        const enabled = Boolean(config);
        button.disabled = false;
        button.setAttribute('aria-disabled', 'false');
        if (enabled) {
          const { points } = config;
          const action = points > 0
            ? `adds ${points} point${points === 1 ? '' : 's'}`
            : `subtracts ${Math.abs(points)} point${points === -1 ? '' : 's'}`;
          button.setAttribute('aria-label', `Send ${giftLabels[gift]} for ${round.target.name}, ${action}`);
        }
      });
      $('#gift-buttons').setAttribute('aria-busy', 'false');
    }

    label(text, active = true) {
      reactionLabel.textContent = text;
      reactionLabel.classList.toggle('active', active);
    }

    queueSpeechHide(wait = 2400) {
      (window.streamRoomClock || window).clearTimeout(this.bubbleTimer);
      this.bubbleTimer = (window.streamRoomClock || window).setTimeout(() => {
        if (!this.busy) hideSpeech();
      }, wait);
    }

    async animate(element, frames, options = {}) {
      if (!element) return;
      if (element.closest('.full-pose-character') && !element.classList.contains('positioner')) {
        // Painted bodies stay intact. The sprite renderer supplies held poses;
        // preserve controller timing without bending or stretching the artwork.
        await clockDelay(Math.max(80, (options.duration || 500) * motionScale));
        return;
      }
      const illustrated = element.closest('.illustrated-character');
      if (illustrated) {
        frames = frames.map((frame) => {
          if (!frame.transform) return frame;
          let transform = frame.transform.replace('scale(1.24)', 'scale(1)');
          if (element.classList.contains('torso')) {
            transform = transform.replace(/skewX\([^)]*\)/g, '').replace(/rotate\((-?[\d.]+)deg\)/g, (_, angle) => `rotate(${Number(angle) * .35}deg)`);
          }
          if (element.classList.contains('head-group')) {
            transform = transform.replace('translateY(14px)', 'translateY(3px)');
          }
          return { ...frame, transform };
        });
        if (element.classList.contains('head-group')) {
          void this.animate($('.back-hair', illustrated), frames, options);
        }
      }
      const {
        duration = 500,
        easing = 'ease-in-out',
        iterations = 1,
        direction = 'normal',
        persist = false,
        delay: animationDelay = 0
      } = options;

      const animation = element.animate(frames, {
        duration: Math.max(80, duration * motionScale),
        delay: animationDelay * motionScale,
        easing,
        iterations,
        direction,
        fill: 'both'
      });

      this.animations.add(animation);
      window.streamRoomClock?.track(animation);
      try {
        await animation.finished;
      } catch {
        return;
      } finally {
        this.animations.delete(animation);
        window.streamRoomClock?.untrack(animation);
      }

      if (persist) {
        const finalFrame = frames[frames.length - 1];
        Object.entries(finalFrame).forEach(([property, value]) => {
          if (property !== 'offset' && property !== 'easing' && property !== 'composite') {
            element.style[property] = value;
          }
        });
        this.touched.add(element);
      }
      animation.cancel();
    }

    setStyle(element, styles) {
      Object.assign(element.style, styles);
      this.touched.add(element);
    }

    cancelAnimations() {
      this.animations.forEach((animation) => animation.cancel());
      this.animations.clear();
    }

    resetScene(upsetRecipientId = null) {
      this.refreshPenaltyLayout=null;
      this.cancelAnimations();
      this.touched.forEach((element) => element.removeAttribute('style'));
      $$('.positioner, .mover, .rig, .hip-bender, .head-group, .back-hair, .torso, .upper-arm, .lower-arm, .upper-leg, .lower-leg', svg)
        .forEach((element) => element.removeAttribute('style'));
      this.touched.clear();
      characterList.forEach((character) => {
        window.characterSprites.reset(character);
        clearFakeCry(character);
        character.root.classList.remove('rescue-closeup');
        character.bubble.classList.remove('rescue-speaker');
        setExpression(character, character.id===upsetRecipientId?'angry':idleExpression(character));
        renderDucks(character, 0);
      });
      this.rescue?.resolveSafe?.('cancelled');
      this.rescue = null;
      renderRecipientSelection();
      svg.append(...characterList.map((character) => character.root));
      hideSpeech();
      hideRescueSystem();
      $$('.impact', effectsLayer).forEach((effect) => effect.remove());
      stage.classList.remove('shake', 'rescue-mode', 'closeup-mode', 'penalty-mode');
      stage.removeAttribute('data-rescue-target');
      delete stage.dataset.interactionActors;
      syncRescueFraming();
      document.body.classList.remove('rescue-open');
      this.restoreGiftMetadata();
    }

    async run(gift, batchCount = 1, recipientId = null) {
      if (window.streamRoomClock?.active===false||!this.handlers[gift]) return false;
      if (this.phase !== 'idle') return false;
      window.streamLife?.interrupt();
      (window.streamRoomClock || window).clearTimeout(this.bubbleTimer);
      this.resetScene();
      this.targetId=characters[recipientId]?recipientId:activeCharacters()[nextGiftCharacter].id;
      this.phase = 'reaction';
      this.lock(true);
      this.lastGift = gift;
      this.activeGift = gift;
      this.activeRecipientId=this.targetId;
      syncVisibleCast();
      document.body.classList.add('idle-paused');

      try {
        await this.handlers[gift](batchCount);
      } catch (error) {
        console.error('Gift reaction failed', error);
        this.label('Back in a moment…');
        await delay(250);
      } finally {
        // Finishing GG restores the pose, while the recipient stays upset.
        this.resetScene(gift === 'gg' ? this.activeRecipientId : null);
        this.phase = 'idle';
        this.activeGift = null;
        applyPendingCast();
        syncVisibleCast();
        document.body.classList.remove('idle-paused');
        this.lock(false);
        if (this.pendingGifts.length) {
          this.label('');
          window.queueMicrotask(() => this.drainQueue());
        } else {
          this.label('', false);
          if (activeCharacters().some(character => character.id === this.activeRecipientId)) window.streamLife?.afterGift(gift,this.activeRecipientId);
          if (gift === 'gg' && activeCharacters().some(character => character.id === this.activeRecipientId)) {
            say(characters[this.activeRecipientId], window.characterMood?.angryLine?.(this.activeRecipientId) || pick(['I’m still mad. 😤', 'That was not funny.', 'No more GG. 😒']), true);
            this.queueSpeechHide();
          }
          else if (!window.streamLife && gift !== 'corgi' && activeCharacters().some(character => character.id === this.activeRecipientId)) {
            const idleCharacter = characters[this.activeRecipientId] || chooseGiftCharacter();
            const upset = ['angry','upset'].includes(window.characterMood?.get(idleCharacter.id)?.band);
            say(idleCharacter, upset ? window.characterMood?.angryLine?.(idleCharacter.id) || 'You’re the worst.' : pick(['More gifts? 👀', 'What should we do next?', 'Hi everyone! ✨']), true, upset ? null : 'idle');
            this.queueSpeechHide();
          }
        }
      }
      return true;
    }

    async rose() {
      const character = chooseGiftCharacter();
      const arm = Math.random() > .5 ? character.armLeft : character.armRight;
      const forearm = arm === character.armLeft ? character.forearmLeft : character.forearmRight;
      const sign = arm === character.armLeft ? 1 : -1;
      this.label('Rose');
      setExpression(character, 'embarrassed');
      window.characterSprites.startWave(character);
      say(character, pick(['Thank you!! ❤️', 'Awww!', 'Love you!', 'Thank youuu!']), true, 'rose');
      if (!character.root.classList.contains('full-pose-character')) {
        this.setStyle(arm, { transform: 'rotate(' + sign * 105 + 'deg)' });
        this.setStyle(forearm, { transform: 'rotate(' + -sign * 25 + 'deg)' });
      }
      await clockDelay(780);
      setExpression(character, 'happy');
      await clockDelay(970);
      this.setStyle(arm, { transform: 'rotate(0deg)' });
      this.setStyle(forearm, { transform: 'rotate(0deg)' });
      window.characterSprites.setPose(character, 'idle');
      await delay(420);
    }

    async heart() {
      const character = chooseGiftCharacter();
      this.label('Heart');
      setExpression(character, 'excited');
      const low=heartPose==='hands'||heartPose==='mix'&&heartPoseIndex++%2===0;
      window.characterSprites.startHeart(character,low);
      say(character, pick(['I love you!! ❤️', 'You’re the best!', 'Love love love!']), true, 'heart');
      if (!character.root.classList.contains('full-pose-character')) {
        this.setStyle(character.armLeft, { transform: 'rotate(105deg)' });
        this.setStyle(character.armRight, { transform: 'rotate(-105deg)' });
        this.setStyle(character.forearmLeft, { transform: 'rotate(102deg)' });
        this.setStyle(character.forearmRight, { transform: 'rotate(-102deg)' });
      }
      await clockDelay(780);
      setExpression(character, 'laughing');
      await clockDelay(1590);
      [character.armLeft, character.armRight, character.forearmLeft, character.forearmRight]
        .forEach((part) => this.setStyle(part, { transform: 'rotate(0deg)' }));
      window.characterSprites.setPose(character, 'idle');
      await delay(300);
    }

    async corgi() {
      hideSpeech();
      const character = chooseGiftCharacter();
      this.label(character.root.dataset.outfit==='yoga'?'YOGA BREAK':'MINI DANCE');
      setExpression(character, 'laughing');

      const celebration = this.miniDance(character);
      await delay(1750);
      setExpression(character, 'excited');
      await celebration;
      await delay(260);
    }

    async miniDance(character) {
      window.characterSprites.startDance(character);
      if (!character.root.classList.contains('full-pose-character')) {
        this.setStyle(character.armLeft, { transform: 'rotate(78deg)' });
        this.setStyle(character.armRight, { transform: 'rotate(-62deg)' });
        this.setStyle(character.shinRight, { transform: 'rotate(35deg)' });
      }
      // Keep the pose still while the dialogue and facial expressions react.
      try {
        await clockDelay(3720);
      } finally {
        window.characterSprites.reset(character);
      }
    }

    async gg() {
      const target = chooseGiftCharacter();
      const line = pickAngryLine([
        'GG?! Seriously?!',
        'Get out! 😡',
        'Who sent THAT?',
        'I don’t like you anymore!',
        'BOOOOO!',
        'Not GG again!!'
      ]);
      this.label('GG?!');
      hideSpeech();
      setExpression(target, 'angry');
      say(target, line, false, 'gg');
      await Promise.all([
        this.animate(target.armRight, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-52deg)' }], { duration: 300, persist: true }),
        this.animate(target.forearmRight, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(8deg)' }], { duration: 300, persist: true }),
        this.animate(target.rig, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)' }], { duration: 300, persist: true })
      ]);
      await delay(2400);

      this.label('');
      await Promise.all([target.armLeft,target.armRight,target.forearmLeft,target.forearmRight,target.rig].map(part =>
        this.animate(part, [{ transform: part.style.transform || 'rotate(0deg)' }, { transform: 'rotate(0deg)' }], { duration: 110, persist: true })
      ));
      await delay(650);
    }

    refreshRescueLayout(round=this.rescue) {
      if(!round)return;
      round.supporters=activeCharacters().filter(character=>character!==round.target).map(character=>round.supporters.find(item=>item.character===character)||{character,transform:'translate(0, 0) scale(1)'});
      round.targetCloseTransform=`translate(${400-round.target.baseX}px, var(--rescue-focus-y)) scale(var(--rescue-focus-scale))`;
      round.supporters.forEach((item,index)=>{
        // Supporters stand on opposite sides instead of overlapping each other.
        const side=index%2===0?(mobileLayout.matches?235:160):(mobileLayout.matches?565:640);
        item.transform=`translate(${side-item.character.baseX}px, -28px) scale(.65)`;
      });
      if(stage.classList.contains('closeup-mode')){
        this.setStyle(round.target.positioner,{transform:round.targetCloseTransform});
        round.supporters.forEach(item=>this.setStyle(item.character.positioner,{transform:item.transform}));
      }
    }

    async enterRescueCloseup(round) {
      this.refreshRescueLayout(round);
      const { target, helper, targetCloseTransform, supporters } = round;
      stage.classList.add('rescue-mode', 'closeup-mode');
      stage.dataset.rescueTarget = target.id;
      document.body.classList.add('rescue-open');
      svg.append(...supporters.map(({ character }) => character.root), target.root);
      target.root.classList.add('rescue-closeup');
      syncRescueFraming();
      target.bubble.classList.add('rescue-speaker');
      setExpression(target, 'worried');
      window.characterSprites.setPose(target, 'plead');
      setExpression(helper, 'surprised');
      renderDucks(target, getPenaltyUnits(round.balance));
      say(target, pick(['Protect me, please! 😳', 'Please send protection!', 'Your gifts can protect me!', 'I need protection!']), true, 'rescue');
      syncRescueFraming();
      this.label(`SUNGLASSES DEBT → ${target.name.toUpperCase()} ${formatBalance(round.balance)}`);

      await Promise.all([
        this.animate(target.positioner, [
          { transform: 'translate(0, 0) scale(1)' },
          { transform: targetCloseTransform }
        ], { duration: 760, persist: true, easing: 'cubic-bezier(.2,.8,.2,1)' }),
        ...supporters.map(({ character, transform }) => this.animate(character.positioner, [
          { transform: 'translate(0, 0) scale(1)' },
          { transform }
        ], { duration: 760, persist: true })),
        this.animate(target.armLeft, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(70deg)' }], { duration: 620, persist: true }),
        this.animate(target.armRight, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-70deg)' }], { duration: 620, persist: true }),
        this.animate(target.forearmLeft, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-78deg)' }], { duration: 620, persist: true }),
        this.animate(target.forearmRight, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(78deg)' }], { duration: 620, persist: true })
      ]);
      this.refreshRescueLayout(round);
    }

    async restoreFromRescueCloseup(round, celebrate = false) {
      const { target, targetCloseTransform, supporters } = round;
      clearFakeCry(target);
      stage.classList.remove('closeup-mode');
      const duration = celebrate ? 880 : 660;
      const targetFrames = celebrate
        ? [
            { transform: targetCloseTransform },
            { transform: 'translate(0, -18px) scale(1.06)', offset: .72 },
            { transform: 'translate(0, 0) scale(1)' }
          ]
        : [
            { transform: targetCloseTransform },
            { transform: 'translate(0, 0) scale(1)' }
          ];

      target.root.classList.remove('rescue-closeup');
      window.characterSprites.setPose(target, celebrate ? 'celebrate' : 'idle');
      await Promise.all([
        this.animate(target.positioner, targetFrames, { duration, persist: true, easing: 'cubic-bezier(.2,.8,.2,1)' }),
        ...supporters.map(({ character, transform }) => this.animate(character.positioner, [
          { transform },
          { transform: 'translate(0, 0) scale(1)' }
        ], { duration, persist: true })),
        this.animate(target.armLeft, [{ transform: 'rotate(70deg)' }, { transform: 'rotate(0deg)' }], { duration: 620, persist: true }),
        this.animate(target.armRight, [{ transform: 'rotate(-70deg)' }, { transform: 'rotate(0deg)' }], { duration: 620, persist: true }),
        this.animate(target.forearmLeft, [{ transform: 'rotate(-78deg)' }, { transform: 'rotate(0deg)' }], { duration: 620, persist: true }),
        this.animate(target.forearmRight, [{ transform: 'rotate(78deg)' }, { transform: 'rotate(0deg)' }], { duration: 620, persist: true })
      ]);
    }

    applyRescueGift(gift) {
      const round = this.rescue;
      const config = rescueGiftConfig[gift];
      if (!round || !round.accepting || !config) return false;
      const { points } = config;

      const now = (window.streamRoomClock || performance).now();
      if (now >= round.deadline) {
        round.accepting = false;
        round.resolveSafe?.('expired');
        return false;
      }

      round.balance += points;
      const penaltyUnits = getPenaltyUnits(round.balance);
      const remainingSeconds = Math.max(0, Math.ceil((round.deadline - now) / 1000));
      const flourish = now - round.lastFlourishAt >= 160;
      if (flourish) round.lastFlourishAt = now;
      round.promptAfter = now + (points > 0 ? 1400 : 1000);
      clearFakeCry(round.target);
      if (round.balance < 0) setExpression(round.target, points > 0 ? 'happy' : 'angry');
      window.characterSprites.updateCountdown(round.target,remainingSeconds,round.balance);
      renderDucks(round.target, penaltyUnits);
      const systemMessage = points < 0
        ? gift === 'sunglasses'
          ? `NO! ${penaltyUnits} DUCK${penaltyUnits === 1 ? '' : 'S'} NOW`
          : 'GG MADE IT WORSE!'
        : penaltyUnits
          ? `${penaltyUnits} DUCK${penaltyUnits === 1 ? '' : 'S'} REMAIN`
          : 'RESCUE COMPLETE';
      showRescueSystem(
        remainingSeconds,
        round.balance,
        systemMessage,
        '',
        flourish
      );
      if (round.balance >= 0) {
        setExpression(round.target, 'excited');
        window.characterSprites.setPose(round.target, 'celebrate');
        say(round.target, 'I’M SAFE!! ❤️', true);
      } else if (points < 0 && flourish) {
        const penaltyLine = gift === 'sunglasses'
          ? pickAngryLine(
              ['ANOTHER DUCK?! 😡', 'Stop adding sunglasses!', 'That means another swat!', 'You made it WORSE!'],
              ['SB?! 又加眼镜?! 😡', '傻逼?! 还加?!', '靠！又一只鸭?!']
            )
          : pickAngryLine(
              ['GG made it WORSE! 😡', 'Minus one?! Seriously?!', 'Stop with the GG!'],
              ['SB?! GG?! 😡', '傻逼?! 又来?!', '靠！还减一?!']
            );
        say(round.target, penaltyLine, true, gift==='sunglasses'?'moreGlasses':'rescueWorse');
      } else if (flourish) {
        const rescueLine = gift === 'corgi'
          ? pick(['MINI DANCE RESCUE! 🐶', 'That dance helped!', '+300! NICE MOVES!'])
          : gift === 'heart'
            ? pick(['That helps!', '+100! Keep going!', `${penaltyUnits} duck${penaltyUnits === 1 ? '' : 's'} left!`])
            : pick(['One point! I’ll take it!', 'Every rose counts!', '+1… keep tapping!']);
        say(round.target, rescueLine, true, 'rescueHelp');
      }
      this.label(`${gift.toUpperCase()} ${formatBalance(points)} → ${round.target.name.toUpperCase()} ${formatBalance(round.balance)}`);

      if (round.balance >= 0) {
        round.accepting = false;
        this.phase = 'resolving';
        this.lock(true);
        round.resolveSafe?.('safe');
      }
      return true;
    }

    async celebrateRescue(round) {
      this.phase = 'resolving';
      round.accepting = false;
      clearFakeCry(round.target);
      this.lock(true);
      renderDucks(round.target, 0);
      showRescueSystem('SAFE!', round.balance, '', 'safe');
      this.label(`${round.target.name.toUpperCase()} IS SAFE!`);
      setExpression(round.target, 'excited');
      window.characterSprites.setPose(round.target, 'celebrate');
      setExpression(round.helper, 'laughing');
      say(round.target, pick(['YOU SAVED ME!! ❤️', 'SAFE!! Thank you!', 'The ducks are GONE!']), true, 'saved');
      window.streamLife?.rememberRescue(round.target.id);

      await clockDelay(500);
      await this.restoreFromRescueCloseup(round, true);
      await Promise.all([
        this.animate(round.target.armLeft, [
          { transform: 'rotate(0deg)' }, { transform: 'rotate(132deg)' }, { transform: 'rotate(0deg)' }
        ], { duration: 920 }),
        this.animate(round.target.armRight, [
          { transform: 'rotate(0deg)' }, { transform: 'rotate(-132deg)' }, { transform: 'rotate(0deg)' }
        ], { duration: 920 }),
        this.animate(round.target.mover, [
          { transform: 'translateY(0)' }, { transform: 'translateY(-22px)' }, { transform: 'translateY(0)' }
        ], { duration: 920 })
      ]);
      await delay(420);
    }

    async playStandingPunishment(actor, receiver, count, frozenBalance) {
      stage.classList.add('penalty-mode');
      stage.dataset.interactionActors=`${actor.id},${receiver.id}`;
      const spectators=()=>activeCharacters().filter(character=>character!==actor&&character!==receiver);
      const pairViewport=()=>{
        const bounds=penaltyViewport();
        if(!bounds||!spectators().length)return bounds;
        // Leave a small visible lane for the third host, clear of the active pair.
        return {...bounds,left:bounds.left+(bounds.right-bounds.left)*.18};
      };
      const spectatorTransform=(character,index)=>`translate(${(mobileLayout.matches?220:95)+index*70-character.baseX}px, -18px) scale(.42)`;
      let layout=window.characterSprites.penaltyLayout(actor,receiver,mobileLayout.matches,pairViewport());
      let positioned=false;
      const refresh=()=>{
        layout=window.characterSprites.penaltyLayout(actor,receiver,mobileLayout.matches,pairViewport());
        if(positioned){
          this.setStyle(actor.positioner,{transform:layout.actorTransform});
          this.setStyle(receiver.positioner,{transform:layout.receiverTransform});
          spectators().forEach((character,index)=>this.setStyle(character.positioner,{transform:spectatorTransform(character,index)}));
        }
      };
      this.refreshPenaltyLayout=refresh;
      const phase=(name,duration)=>{
        refresh();
        window.characterSprites.penaltyPhase(actor,'actor',name,duration,layout.actorFlip);
        window.characterSprites.penaltyPhase(receiver,'receiver',name,duration,layout.receiverFlip);
      };
      const tempo=Math.max(.35,Math.min(1,5/count));
      setExpression(actor,'annoyed');setExpression(receiver,'downcast');
      phase('prepare',680);hideSpeech();svg.append(actor.root,receiver.root);
      await Promise.all([
        this.animate(actor.positioner,[{transform:'translate(0, 0) scale(1)'},{transform:layout.actorTransform}],{duration:680,persist:true}),
        this.animate(receiver.positioner,[{transform:'translate(0, 0) scale(1)'},{transform:layout.receiverTransform}],{duration:680,persist:true}),
        ...spectators().map((character,index)=>this.animate(character.positioner,[{transform:'translate(0, 0) scale(1)'},{transform:spectatorTransform(character,index)}],{duration:680,persist:true}))
      ]);
      positioned=true;refresh();
      await delay(260);
      for(let index=0;index<count;index+=1){
        const remaining=count-index;
        showRescueSystem(remaining,frozenBalance,`${remaining} LEFT`,'locked');
        phase('windup',210*tempo);await delay(210*tempo);
        phase('impact',430*tempo);
        impact(pick(['SMACK!','BAP!','BONK!']));
        const actorSpeaks=Math.random()<.35;
        say(actorSpeaks?actor:receiver,actorSpeaks?'Pow!':'Ow!',true,actorSpeaks?'penaltyActor':'penaltyImpact');
        await delay(430*tempo);
        phase('prepare',140*tempo);renderDucks(receiver,remaining-1);
        await delay(140*tempo);
      }
      renderDucks(receiver,0);showRescueSystem('DONE!',frozenBalance,'','locked');
      say(receiver,pick(['I need a minute.','That was embarrassing.','I’m still mad.','Never again.']),true,'penaltyAfter');
      await clockDelay(650);this.label('PENALTY COMPLETE');phase('recover',720);
      this.refreshPenaltyLayout=null;
      await Promise.all([
        this.animate(actor.positioner,[{transform:layout.actorTransform},{transform:'translate(0, 0) scale(1)'}],{duration:720,persist:true}),
        this.animate(receiver.positioner,[{transform:layout.receiverTransform},{transform:'translate(0, 0) scale(1)'}],{duration:720,persist:true}),
        ...spectators().map((character,index)=>this.animate(character.positioner,[{transform:spectatorTransform(character,index)},{transform:'translate(0, 0) scale(1)'}],{duration:720,persist:true}))
      ]);
      delete stage.dataset.interactionActors;
      window.characterSprites.setPose(actor,'idle');window.characterSprites.setPose(receiver,'idle');
      setExpression(actor,'embarrassed');setExpression(receiver,'sad');await clockDelay(1000);
    }

    async lockPenalty(round) {
      round.accepting = false;
      clearFakeCry(round.target);
      round.frozenBalance = round.balance;
      this.phase = 'punishment';
      this.lock(true);
      const penaltyUnits = Math.max(1, getPenaltyUnits(round.frozenBalance));
      showRescueSystem('TIME!', round.frozenBalance, `${penaltyUnits} DUCK${penaltyUnits === 1 ? '' : 'S'}`, 'locked');
      this.label(`FINAL SCORE ${formatBalance(round.frozenBalance)} → ${penaltyUnits} CARTOON SWAT${penaltyUnits === 1 ? '' : 'S'}`);
      setExpression(round.target, 'surprised');
      window.characterSprites.setPose(round.target, 'surprised');
      setExpression(round.helper, 'annoyed');
      say(round.target, 'Time ran out?! 😳', true);
      await delay(720);
      hideSpeech();
      await this.restoreFromRescueCloseup(round);
      await this.playStandingPunishment(round.helper, round.target, penaltyUnits, round.frozenBalance);
    }

    async sunglasses(batchCount = 1) {
      const target = chooseGiftCharacter();
      const others = activeCharacters().filter((character) => character !== target);
      const helper = choosePenaltyHelper(target);
      const initialUnits = Math.max(1, Math.floor(batchCount));
      const durationSeconds = 10;
      const round = {
        target,
        helper,
        balance: initialUnits * -200,
        deadline: 0,
        accepting: false,
        frozenBalance: null,
        targetCloseTransform: `translate(${400 - target.baseX}px, var(--rescue-focus-y)) scale(var(--rescue-focus-scale))`,
        supporters: others.map((character) => ({ character, transform: 'translate(0, 0) scale(1)' })),
        lastFlourishAt: -Infinity,
        promptAfter: 0,
        fakeCrySecond: pick([7, 4]),
        didFakeCry: false,
        resolveSafe: null,
        safeSignal: null
      };
      round.safeSignal = new Promise((resolve) => {
        round.resolveSafe = (outcome) => {
          resolve(outcome);
        };
      });
      this.rescue = round;
      this.phase = 'transition';
      renderRecipientSelection();

      await this.enterRescueCloseup(round);
      if (this.rescue !== round) return;

      round.deadline = (window.streamRoomClock || performance).now() + durationSeconds * 1000;
      round.promptAfter=(window.streamRoomClock || performance).now()+1000;
      round.accepting = true;
      this.openRescueControls(round);
      window.characterSprites.startCountdown(target,round.balance);
      showRescueSystem(durationSeconds, round.balance, 'SAVE YOUR GIRL!');
      this.label(`RESCUE ${target.name.toUpperCase()} • ${durationSeconds} SECONDS`);
      srStatus.textContent = `${target.name} needs rescue gifts before the hidden host countdown ends.`;
      this.flushPendingToRescue();

      let previousSecond = durationSeconds + 1;
      while (this.rescue === round && round.accepting && round.balance < 0) {
        const remaining = Math.max(0, Math.ceil((round.deadline - (window.streamRoomClock || performance).now()) / 1000));
        if (remaining !== previousSecond) {
          previousSecond = remaining;
          window.characterSprites.updateCountdown(target, remaining,round.balance);
          const ducks = getPenaltyUnits(round.balance);
          const hostMessage = [10, 6, 3].includes(remaining)
            ? 'SAVE YOUR GIRL!'
            : `${ducks} DUCK${ducks === 1 ? '' : 'S'}`;
          showRescueSystem(remaining, round.balance, hostMessage);
          const allowPrompt = (window.streamRoomClock || performance).now() >= round.promptAfter;
          if (allowPrompt && [10, 7, 4].includes(remaining)) {
            if (!round.didFakeCry && remaining <= round.fakeCrySecond) {
              round.didFakeCry = true;
              say(target, pick([
                'Protect me, please! 😭',
                'Please send protection! 😢',
                'I need protection! 😭'
              ]), true, 'rescueUrgent');
              fakeCry(round);
            } else {
              say(target, pick([
                'Protect me, please! 😳',
                'Your gifts can protect me!',
                'Don’t leave me unprotected!',
                'Please—send protection!',
                `${ducks} duck${ducks === 1 ? '' : 's'} left!`
              ]), true, 'rescue');
            }
          } else if (allowPrompt && [8, 5, 2].includes(remaining)) {
            say(helper, pick([
              `PROTECT ${target.name.toUpperCase()}!`,
              `Send ${target.name} some protection!`,
              `Don’t leave ${target.name} unprotected!`,
              'You can still save her!'
            ]), true);
          }
        }
        if (remaining <= 0) break;
        const wait = Math.min(1000, Math.max(25, round.deadline - (window.streamRoomClock || performance).now()));
        const outcome = await Promise.race([
          clockDelay(wait).then(() => 'tick'),
          round.safeSignal
        ]);
        if (outcome === 'safe') break;
      }

      if (this.rescue !== round) return;
      if (round.balance >= 0) {
        await this.celebrateRescue(round);
      } else {
        await this.lockPenalty(round);
      }
    }
  }

  const controller = new ReactionController();
  controller.queueSpeechHide(3200);

  const modelContext = document.modelContext;
  if (modelContext?.registerTool) {
    const webMcpLifecycle = new AbortController();
    const registration = modelContext.registerTool({
      name: 'send_fake_gift',
      title: 'Send a gift',
      description: 'Send a fictional gift. During a rescue round, Rose adds 1, Heart adds 100, Mini Dance adds 300, Sunglasses subtracts 200, and GG subtracts 1.',
      inputSchema: {
        type: 'object',
        properties: {
          gift: {
            type: 'string',
            enum: giftIds
          }
        },
        required: ['gift'],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const gift = input?.gift;
        if (!giftIds.includes(gift)) {
          throw new TypeError('gift must be rose, heart, sunglasses, corgi, or gg');
        }
        const handled = controller.send(gift);
        return {
          gift,
          status: handled ? 'accepted' : 'ignored',
          phase: controller.phase,
          rescueBalance: controller.rescue?.balance ?? null,
          fakeCoinsSpent: controller.totalSpent,
          queued: controller.pendingCount
        };
      }
    }, { signal: webMcpLifecycle.signal });
    Promise.resolve(registration).catch(() => {});
    window.addEventListener('pagehide', () => webMcpLifecycle.abort(), { once: true });
  }

  giftButtons.forEach((button) => {
    button.addEventListener('click', () => {
      controller.send(button.dataset.gift);
    });
  });

  characterList.forEach(character=>{
    const tag=$('.name-tag',character.root);
    tag.setAttribute('role','button');tag.setAttribute('tabindex','0');
    tag.setAttribute('aria-label',`Send gifts to ${character.name}`);
    const select=event=>{
      event.stopPropagation();
      selectRecipient(character.id);
    };
    tag.addEventListener('click',select);
    tag.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();select(event);}
    });
  });
  const selectAny=event=>{
    event.stopPropagation();
    setTakeTurns(true);
  };
  $('#take-turns').addEventListener('click',selectAny);
  $('#take-turns').addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();selectAny(event);}
  });
  syncVisibleCast();
  setExpression(characters.mia,'embarrassed');
  characterList.forEach(character => setExpression(character,idleExpression(character)));
  window.characterMood?.refresh();
  // Returning to an upset save should not greet viewers with a cheerful bubble.
  characterList.forEach(character => {
    if (['angry','upset'].includes(window.characterMood?.get(character.id)?.band)) {
      say(character,window.characterMood?.angryLine?.(character.id)||'You’re the worst.',false,null,true);
    }
  });
  mobileLayout.addEventListener('change',()=>{
    window.streamLife?.interrupt();
    syncVisibleCast();
    // Renderer media listeners may have painted with the previous cast positions.
    // Reframe after every stageX is updated, keeping the active pose and expression.
    characterList.forEach(character=>window.characterSprites.refreshLayout(character));
    controller.refreshPenaltyLayout?.();
    controller.refreshRescueLayout();
  });

  stage.addEventListener('click', (event) => {
    if (event.button !== 0) return;
    const rect = stage.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    addLikeAt(x, y);
  });

  $('#like-button').addEventListener('click', (event) => {
    event.stopPropagation();
    const rect = stage.getBoundingClientRect();
    addLikeAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  let sharedSpeech = '', sharedScene = '';
  let sharedAppearanceRevision = -1;
  const sharedPoses = new Map();
  let sharedGiftSequence = null;
  let sharedImpactAt = -Infinity;
  function renderSharedImpact(frame) {
    const cue=frame.impactCue;
    if(frame.phase!=='punishment'||!cue)return;
    const roundStart=frame.clock-frame.elapsed,at=roundStart+cue.offset,age=frame.elapsed-cue.offset;
    if(at<=sharedImpactAt||age<0)return;
    sharedImpactAt=at;
    if(age>=(reducedMotion?180:430))return;
    impact(['SMACK!','BAP!','BONK!'][cue.index%3],{shared:true,age,key:`${roundStart}:${frame.recipient}:${cue.index}`});
  }
  function renderSharedGiftEvents(frame) {
    // Joining establishes a baseline; it must not replay earlier visitors' gifts.
    if(sharedGiftSequence===null){sharedGiftSequence=frame.giftSequence||0;return;}
    for(const event of frame.giftEvents||[]){
      const age=frame.clock-event.at;
      if(event.id<=sharedGiftSequence||age<0||age>=2500)continue;
      const target=characters[event.recipient==='lilly'?'lily':event.recipient];
      spawnParticles(event.gift,1,target,true);
      if(event.gift==='sunglasses'&&age<1000)flashSunglasses(1000-age,true);
    }
    sharedGiftSequence=Math.max(sharedGiftSequence,frame.giftSequence||0);
  }
  function clearSharedGiftEffects() {
    if(!window.Roomwave?.together)return;
    effectsLayer.querySelectorAll('[data-shared-gift],[data-shared-impact]').forEach(node=>node.remove());
    stage.classList.remove('shake');stage.style.removeProperty('animation-delay');
    characterList.forEach(character=>{
      window.clearTimeout(character.sunglassesTimer);character.sunglassesTimer=0;
      character.root.classList.remove('wearing-sunglasses');
      renderDucks(character,0);
    });
  }
  function applySharedFrame(frame) {
    if(window.Roomwave?.together&&frame.appearance&&frame.appearance.revision!==sharedAppearanceRevision){
      for(const id of ['lily','mia'])window.characterSprites.setOutfit(characters[id],frame.appearance.equipped[id]);
      document.getElementById('stage-camera').dataset.room=frame.appearance.room;
      sharedAppearanceRevision=frame.appearance.revision;sharedPoses.clear();sharedScene='';
    }
    if(!window.Roomwave?.together)return;
    renderSharedGiftEvents(frame);
    renderSharedImpact(frame);
    const spriteId=id=>id==='lilly'?'lily':id;
    const poseMap={neutral:['idle','neutral'],happy:['idle','happy'],angry:['idle','angry'],sad:['idle','sad'],surprised:['idle','surprised'],kneelWorried:['kneeling','worried'],kneelHappy:['kneeling','happy'],kneelAngry:['kneeling','angry'],kneelCry:['kneeling','crying'],celebrate:['heart','happy'],bow:['bow','sad'],gesturePrepare:['gesturePrepare','angry'],gestureExtend:['gestureExtend','angry']};
    const target=characters[spriteId(frame.recipient)];
    const helper=target&&characters[target.id==='mia'?'lily':'mia'];
    characterList.forEach(character=>renderDucks(character,character===target?(frame.rescue?.ducks??frame.rescue?.units??0):0));
    const rescue=Boolean(frame.rescue&&target);
    const closeup=rescue&&(['transition','rescue'].includes(frame.phase)||frame.phase==='resolving'&&frame.elapsed<500||frame.phase==='punishment'&&frame.elapsed<720);
    const penalty=rescue&&frame.phase==='punishment'&&frame.elapsed>=1380;
    const sceneKey=[frame.phase,frame.recipient,closeup,penalty].join(':');
    if(sceneKey!==sharedScene){
      characterList.forEach(c=>{
        c.positioner.style.transform='';
        c.root.classList.toggle('rescue-closeup',closeup&&c===target);
        c.bubble.classList.toggle('rescue-speaker',rescue&&c===target);
      });
      stage.classList.toggle('rescue-mode',rescue);
      stage.classList.toggle('closeup-mode',closeup);
      stage.classList.toggle('penalty-mode',penalty);
      document.body.classList.toggle('rescue-open',rescue);
      if(rescue){stage.dataset.rescueTarget=target.id;svg.append(helper.root,target.root);}
      else {delete stage.dataset.rescueTarget;svg.append(...characterList.map(c=>c.root));}
      if(penalty)stage.dataset.interactionActors=`${helper.id},${target.id}`;
      else delete stage.dataset.interactionActors;
      sharedScene=sceneKey;sharedPoses.clear();
    }
    // Apply the same HUD and framing rules as Solo before measuring the room.
    // This is an absolute render of server time; it starts no local game timers.
    if(frame.rescue){const r=frame.rescue;showRescueSystem(frame.phase==='punishment'?r.units:r.seconds,r.score,r.message,frame.phase==='punishment'?'locked':frame.phase==='resolving'?'safe':'',false)}else hideRescueSystem();
    if(closeup){
      syncRescueFraming();
      target.positioner.style.transform=`translate(${400-target.baseX}px, var(--rescue-focus-y)) scale(var(--rescue-focus-scale))`;
      helper.positioner.style.transform=`translate(${(mobileLayout.matches?235:160)-helper.baseX}px, -28px) scale(.65)`;
    }
    let layout=null;
    if(penalty){layout=window.characterSprites.penaltyLayout(helper,target,mobileLayout.matches,penaltyViewport());helper.positioner.style.transform=layout.actorTransform;target.positioner.style.transform=layout.receiverTransform;}
    for(const id of ['mia','lilly']){
      const c=characters[spriteId(id)],name=frame.poses[id],mapped=closeup&&frame.phase==='punishment'&&c===target?['kneeling','surprised']:poseMap[name]||[name,'happy'];
      const flip=layout?(id===frame.recipient?layout.receiverFlip:layout.actorFlip):false;
      const key=mapped.join(':')+':'+flip;
      if(sharedPoses.get(id)!==key){window.characterSprites.setPose(c,mapped[0],flip);setExpression(c,mapped[1]);sharedPoses.set(id,key);}
      const mood=frame.moods[id],tag=c.root.querySelector('.name-tag');
      tag.dataset.mood=mood.band;tag.querySelector('[data-mood-label]').textContent=c.name+"’s mood: "+mood.label;
      tag.querySelector('[data-mood-fill]').setAttribute('d','M52 32H'+(52+64*mood.value/100).toFixed(2));
      tag.querySelector('[data-mood-face]')?.setAttribute('data-mood',mood.band);
      const mouths={angry:'M-2.7 3Q0 .3 2.7 3',upset:'M-2.7 2.8Q0 1 2.7 2.8',calm:'M-2.6 2.5H2.6',happy:'M-2.8 1.5Q0 4.5 2.8 1.5',delighted:'M-3 1Q0 5 3 1Z'};
      tag.querySelector('[data-mood-mouth]')?.setAttribute('d',mouths[mood.band]);
    }
    const speechKey=JSON.stringify(frame.speech);
    if(speechKey!==sharedSpeech){hideSpeech();if(frame.speech)say(characters[spriteId(frame.speech.speaker)],frame.speech.text,true,null,true);sharedSpeech=speechKey;}
    reactionLabel.textContent=frame.label||'';reactionLabel.hidden=!frame.label;
  }
  window.__stickStream = {
    applySharedFrame: typeof applySharedFrame === 'function' ? applySharedFrame : ()=>{},
    sayQuiet: (id,text,emotion='happy')=>{if(window.streamRoomClock?.active===false||controller.phase!=='idle'||controller.pendingCount||document.hidden)return false;(window.streamRoomClock || window).clearTimeout(controller.bubbleTimer);const character=characters[id];if(!activeCharacters().includes(character))return false;setExpression(character,emotion==='blush'?'embarrassed':emotion);say(character,text,false,null,true);return true;},
    clearQuiet: ()=>{if(controller.phase==='idle'&&!controller.pendingCount){hideSpeech();characterList.forEach(character=>setExpression(character,idleExpression(character)));}},
    refreshMood: ()=>{if(window.streamRoomClock?.active===false||controller.phase!=='idle'||controller.busy||controller.pendingCount)return false;characterList.forEach(character=>setExpression(character,idleExpression(character)));return true;},
    selectRecipient,
    setTakeTurns,
    setActiveCast,
    get requestedCharacterIds() { return [...requestedCastIds]; },
    get castChangePending() { return castChangePending(); },
    get takeTurns() { return takeTurns; },
    get recipient() { return controller.activeRescueTarget?.id || selectedRecipientId; },
    get characterIds() { return characterList.map(character=>character.id); },
    get activeCharacterIds() { return activeCharacters().map(character=>character.id); },
    runFor: (id,gift)=>{if(!activeCharacters().some(character=>character.id===id)||!giftIds.includes(gift)||window.wardrobe?.resetting||window.wardrobe?.ready===false)return false;if(!controller.activeRescueTarget&&!selectRecipient(id))return false;return controller.send(gift);},
    equipOutfit: (id,outfit) => {const character=characters[id];if(!character)return;window.characterSprites.setOutfit(character,outfit);controller.refreshPenaltyLayout?.();controller.refreshRescueLayout();},
    run: (gift) => controller.send(gift),
    get busy() { return controller.busy; },
    get active() { return window.streamRoomClock?.active !== false; },
    get phase() { return controller.phase; },
    get fakeCoinsSpent() { return controller.totalSpent; },
    get giftsSent() { return controller.giftsSent; },
    get queued() { return controller.pendingCount; },
    get rescue() {
      if (!controller.rescue) return null;
      return {
        target: controller.rescue.target.name,
        balance: controller.rescue.balance,
        accepting: controller.rescue.accepting,
        frozenBalance: controller.rescue.frozenBalance
      };
    },
    gifts: giftIds
  };
  if(!window.Roomwave?.together)window.cameraMoment?.startAmbient?.();
  window.addEventListener?.('stream:wardrobe', event => {
    const state = event.detail?.state;
    if (state) setActiveCast(state.activeCast || defaultCastIds, { characters: state.characters || [] });
  });
  if (window.wardrobe?.state) setActiveCast(window.wardrobe.state.activeCast || defaultCastIds, { characters: window.wardrobe.state.characters || [] });
  window.addEventListener?.('stream:mood',()=>{if(!window.Roomwave?.together)window.__stickStream.refreshMood()});
  window.addEventListener?.('live-room-change',event=>{
    if(window.Roomwave?.together&&event.detail.room!=='stream')clearSharedGiftEffects();
    if(event.detail.room!=='stream'||window.Roomwave?.together)return;
    controller.drainQueue();
    window.__stickStream.refreshMood();
  });
  if(window.Roomwave?.together)document.addEventListener('visibilitychange',()=>{if(document.hidden)clearSharedGiftEffects();});
})();
