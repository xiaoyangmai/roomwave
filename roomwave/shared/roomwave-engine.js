(() => {
  'use strict';
  const rooms = ['gaming-seated', 'stream', 'baking', 'workout', 'fortune', 'karaoke'];
  const apis = { 'gaming-seated': 'GamingSeatedState', workout: 'WorkoutState', stream: 'MiaLillyState', baking: 'BakingState', fortune: 'FortuneState' };
  const tracks = globalThis.RoomMusicCatalog.karaoke;
  const legacyTracks = ['come-on-in','i-almost-called-you-v1','i-almost-called-you-v2','no-plans-today-v1','no-plans-today-v2','your-recipe-v1','your-recipe-v2'];
  function create(room, checkpoint, seed = 2463534242) {
    if (!rooms.includes(room)) throw new Error('Unknown room');
    let time = checkpoint?.time || 0, remainder = checkpoint?.remainder || 0, rng = seed >>> 0;
    let epoch = checkpoint?.epoch || 0;
    let giftSequence=checkpoint?.giftSequence||0;
    let giftEvents=structuredClone(checkpoint?.giftEvents||[]);
    const appearance=room==='stream'?structuredClone(checkpoint?.appearance||{revision:0,equipped:{lily:'weekend',mia:'weekend'},room:'balcony',pending:null}):null;
    const random = () => { rng = (rng + 0x6D2B79F5) >>> 0; let t = Math.imul(rng ^ rng >>> 15, 1 | rng); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const karaoke = room === 'karaoke' ? structuredClone(checkpoint?.karaoke || { index: 0, elapsed: 0, applause: 0, cheer: null, sequence: 0, skipAt: -10000 }) : null;
    if(karaoke){
      // Persist identity rather than playlist position so removing or adding a
      // recording cannot silently switch an existing shared performance.
      const previousId=karaoke.trackId || (checkpoint ? legacyTracks[karaoke.index] : tracks[0].id);
      const index=tracks.findIndex(track=>track.id===previousId);
      const changed=index<0 || karaoke.index!==index;
      karaoke.index=index<0?0:index;
      karaoke.trackId=tracks[karaoke.index].id;
      if(index<0 || !Number.isFinite(karaoke.elapsed) || karaoke.elapsed<0 || karaoke.elapsed>=tracks[karaoke.index].duration*1000)karaoke.elapsed=0;
      if(checkpoint&&changed){epoch++;karaoke.skipAt=-10000;}
      karaoke.glows ??= 0;
      karaoke.cheers ??= karaoke.cheer ? {[karaoke.cheer.kind]:karaoke.cheer} : {};
    }
    const model = karaoke ? null : globalThis[apis[room]].create(undefined, { random, now: () => time });
    if (checkpoint) {
      if (checkpoint.version !== 1 || checkpoint.room !== room) throw new Error('Incompatible room');
      if (model) model.restore(checkpoint.model);
      rng = checkpoint.rng >>> 0;
    }
    model?.setActive(true);
    if (!checkpoint && room === 'gaming-seated') model.setViewport(800, 500);
    function applyAppearance(){
      if(!appearance?.pending)return;
      Object.assign(appearance.equipped,appearance.pending.equipped);
      if(appearance.pending.room)appearance.room=appearance.pending.room;
      appearance.pending=null;appearance.revision++;
    }
    function advance(delta) {
      const events = [];
      if (!Number.isFinite(delta) || delta < 0) return events;
      remainder += Math.min(delta, 10000);
      while (remainder >= 10) {
        remainder -= 10; time += 10;
        if (karaoke) {
          karaoke.elapsed += 10;
          if (karaoke.elapsed >= tracks[karaoke.index].duration*1000) { karaoke.elapsed -= tracks[karaoke.index].duration*1000; karaoke.index = (karaoke.index + 1) % tracks.length; karaoke.trackId=tracks[karaoke.index].id; epoch++; }
        } else {
          const before = room==='stream' ? model.state.current : null;
          const event = model.tick(10);
          if(room==='stream'&&event.some(item=>item.type==='complete'))applyAppearance();
          if(room==='gaming-seated'&&event.includes('finish'))epoch++;
          if(room==='stream'&&before?.gift==='sunglasses'&&!model.state.current)epoch++;
          if (Array.isArray(event)) events.push(...event); else if (event) events.push(event);
        }
      }
      if(room==='stream')giftEvents=giftEvents.filter(event=>time-event.at<5000);
      return events;
    }
    function command(method, args = [], expectedEpoch = epoch) {
      const roomCheer=room==='karaoke'&&['cheer','cheers'].includes(method);
      const roomAppearance=room==='stream'&&['outfit','background'].includes(method);
      if (!Array.isArray(args) || args.length > 3 || (!roomCheer&&!roomAppearance&&expectedEpoch !== epoch)) return { accepted: false, reason: 'The room moved on. Try again.' };
      let accepted = false;
      const [a, b, c] = args;
      if (room === 'karaoke') {
        if(method==='track'&&typeof a==='number')return {accepted:false,reason:'The song list changed. Refresh to choose a song.'};
        const single=method==='cheer'&&args.length===1&&['applaud','glow'].includes(a);
        const batch=method==='cheers'&&args.length===2&&args.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000)&&a+b>0;
        if (single || batch) {
          const counts=single?[a==='applaud'?1:0,a==='glow'?1:0]:args;
          for(const [index,kind] of ['applaud','glow'].entries()){
            const count=counts[index];if(!count)continue;
            karaoke[kind==='applaud'?'applause':'glows']+=count;
            karaoke.sequence+=count;
            karaoke.cheer={kind,at:time,id:karaoke.sequence};
            karaoke.cheers[kind]=karaoke.cheer;
          }
          accepted = true;
        } else if (['skip', 'track'].includes(method) && time - karaoke.skipAt >= 1800 && (method === 'skip' ? args.length === 0 : args.length === 1 && typeof a==='string' && tracks.some(track=>track.id===a))) {
          karaoke.index = method === 'skip' ? (karaoke.index + 1) % tracks.length : tracks.findIndex(track=>track.id===a);
          karaoke.trackId=tracks[karaoke.index].id;
          karaoke.elapsed = 0; karaoke.skipAt = time; epoch++; accepted = true;
        }
      } else if (room === 'stream') {
        // Ownership and catalog validation happen in the room route before
        // these appearance intents enter the deterministic shared simulation.
        if(method==='outfit'&&args.length===2&&['lily','mia'].includes(a)&&typeof b==='string'&&b.length<=32){
          appearance.pending??={equipped:{}};appearance.pending.equipped[a]=b;accepted=true;
          if(!model.state.current)applyAppearance();
        }else if(method==='background'&&args.length===1&&['balcony','bedroom','cafe','beach','halloween'].includes(a)){
          appearance.pending??={equipped:{}};appearance.pending.room=a;accepted=true;
          if(!model.state.current)applyAppearance();
        }else if (method === 'send' && args.length === 2 && Object.hasOwn(MiaLillyState.gifts, a) && ['either', 'mia', 'lilly'].includes(b)) {
          const state = model.state;
          const queue = state.pending.reduce((total, batch) => total + batch.count, 0);
          const current = state.current;
          // Rescue gifts change the current score immediately, so a pending
          // reaction queue must not block them or impose a glasses score cap.
          const immediate = current?.phase === 'rescue' && current.elapsed < 10000;
          const merged = current?.phase === 'reaction' && current.gift === a && !queue && (b === 'either' || b === current.recipient);
          if (!current || immediate || merged || queue < 12) {
            model.selectTarget(b); accepted = Boolean(model.send(a));
            // Publish arrivals separately from character poses: merged, queued
            // and rescue gifts must each be visible to every viewer once.
            for(const event of model.takeEvents())if(accepted&&event.type==='gift'){
              giftEvents.push({id:++giftSequence,at:time,gift:event.gift,recipient:event.recipient});
            }
            giftEvents=giftEvents.slice(-128);
          }
        }
      } else if (method === 'start' && args.length === 1 && typeof a === 'string') {
        const api = globalThis[apis[room]];
        const valid = room === 'workout' ? Object.hasOwn(api.exercises, a) : room === 'baking' ? Object.hasOwn(api.actions, a) || ['menu:fill', 'menu:layer', 'menu:icing', 'back', 'newCake'].includes(a) : Object.hasOwn(api.actions, a);
        // An accepted short action finishes before a competing exercise/reading starts.
        if (valid && (!['workout', 'fortune'].includes(room) || !model.action)) {
          accepted = Boolean(model.start(a));
          if (accepted && room === 'baking' && a === 'newCake') epoch++;
          if (accepted && room === 'fortune' && a === 'card') epoch++;
        }
      } else if (room === 'fortune' && method === 'choose' && args.length === 1 && Number.isInteger(a) && a >= 0 && a < 3) {
        accepted = Boolean(model.choose(a));
      } else if (room === 'baking' && method === 'placeDecoration' && args.length === 3 && typeof a === 'string' && Number.isFinite(b) && Number.isFinite(c) && Math.abs(b) <= 2 && Math.abs(c) <= 2) {
        accepted = Boolean(model.placeDecoration(a, b, c));
      }
      return { accepted, reason: accepted ? null : 'Busy with an action. Try again in a moment.' };
    }
    return {
      advance, command, model,
      get epoch() { return epoch; }, get time() { return time; },
      get frame() { return karaoke ? { ...structuredClone(karaoke), clock: time, epoch } : room==='stream'?{...model.frame,clock:time,giftSequence,giftEvents:structuredClone(giftEvents),appearance:structuredClone(appearance)}:model.frame; },
      checkpoint() { return { version: 1, room, time, remainder, rng, epoch, ...(room==='stream'?{giftSequence,giftEvents:structuredClone(giftEvents),appearance:structuredClone(appearance)}:{}), ...(karaoke ? { karaoke: structuredClone(karaoke) } : { model: model.checkpoint() }) }; },
    };
  }
  globalThis.RoomwaveEngine = Object.freeze({ rooms, create });
})();
