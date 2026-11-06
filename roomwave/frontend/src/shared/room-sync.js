(() => {
  'use strict';
  const together = /^\/together\/?$/.test(location.pathname) || new URLSearchParams(location.search).get('mode') === 'together';
  document.documentElement.dataset.roomwaveMode = together ? 'together' : 'solo';
  if (together) {
    const showcase = document.getElementById('gaming-c010-room');
    showcase.dataset.liveRoomRotation = 'excluded';
    showcase.hidden = true;
  }
  const connection = crypto.randomUUID(), entries = new Map();
  const submitted = new WeakSet();
  let current = null, localRoom = null, timer = 0, busy = false, pageActive = true, requestGeneration = 0;
  let toastTimer = 0, chrome, status, people, serverOffset = 0;
  const entry = room => { if (!entries.has(room)) entries.set(room, { engine: RoomwaveEngine.create(room), revision: -1, received: 0, projected: 0, queue: [], people: 0 }); return entries.get(room); };
  const connected = room => together && room === current && entry(room).received > 0 && performance.now()-entry(room).received < 3500;
  function notice(message) {
    const node = document.getElementById('roomwave-notice'); if (!node) return;
    node.textContent = message; node.hidden = false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.hidden=true,2400);
  }
  function updateChrome() {
    if (!status) return;
    const online = current && connected(current);
    status.textContent = together ? localRoom ? 'LOCAL SHOWCASE' : online ? 'LIVE TOGETHER' : 'CONNECTING…' : 'SOLO';
    chrome.dataset.connected = String(!together || Boolean(localRoom) || online);
    people.textContent = together && localRoom ? 'This room runs locally' : together && online ? `${entry(current).people} in room` : together ? 'Joining room' : 'Your own rooms';
    if (together && current) document.getElementById(`${current}-room`)?.setAttribute('aria-busy',String(!online));
  }
  function send(room, method, args = []) {
    if (!connected(room)) { notice('Connecting to the room…'); return false; }
    const state = entry(room);
    const cheer=room==='karaoke'&&method==='cheer'&&args.length===1&&['applaud','glow'].includes(args[0]);
    if(cheer){
      // Only merge unsent taps. A submitted payload must stay identical on retry
      // so its receipt can never count a burst twice or discard later taps.
      const index=args[0]==='applaud'?0:1,last=state.queue.at(-1);
      if(last?.method==='cheers'&&!submitted.has(last)&&last.args[index]<1000)last.args[index]++;
      else state.queue.push({id:crypto.randomUUID(),method:'cheers',args:index===0?[1,0]:[0,1],epoch:state.engine.epoch,issuedAt:Date.now()+serverOffset});
    }else{
      if (state.queue.length >= 4) { notice('One moment…'); return false; }
      state.queue.push({ id: crypto.randomUUID(), method, args, epoch: state.engine.epoch, issuedAt: Date.now()+serverOffset });
    }
    clearTimeout(timer); if (!busy) void poll();
    return true;
  }
  function project(room) {
    const state = entry(room);
    if (!state.received || room !== current) return [];
    const target = Math.min(600, Math.max(0, performance.now()-state.received));
    const events = state.engine.advance(Math.max(0, target-state.projected)); state.projected=target;
    return events;
  }
  async function poll() {
    if (busy || !pageActive || document.hidden || !current) return;
    busy = true; const room = current, state = entry(room), generation = requestGeneration;
    const command = state.queue[0];
    if(command)submitted.add(command);
    const controller = new AbortController(); const timeout=setTimeout(()=>controller.abort(),7000);const sent=performance.now();let retryAfter=0;
    try {
      const response = await fetch('/api/rooms', { method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({room,connection,...(command?{command}:{})}),signal:controller.signal });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429)retryAfter=Math.max(80,data.retryAfter||80);
        if ([400,409].includes(response.status) && command) { state.queue.shift(); notice('That action expired. Try again.'); }
        throw new Error(data.error || 'Room unavailable');
      }
      if (command && state.queue[0]?.id === command.id) { state.queue.shift(); if (!data.outcome?.accepted && room===current) notice(data.outcome?.reason || 'Try again in a moment.'); }
      const latency=Math.min(500,(performance.now()-sent)/2);serverOffset=data.serverNow-Date.now()+latency;
      if (data.revision >= state.revision) {
        state.engine=RoomwaveEngine.create(room,data.checkpoint);state.engine.advance((data.snapshotAge||0)+latency); state.revision=data.revision; state.received=performance.now(); state.projected=0; state.people=data.people;
        window.dispatchEvent(new CustomEvent('roomwave-state',{detail:{room,revision:data.revision}}));
      }
      if(command)window.dispatchEvent(new CustomEvent('roomwave-command',{detail:{room,command,outcome:data.outcome}}));
    } catch { /* Keep the last frame; short projections stop while reconnecting. */ }
    finally {
      clearTimeout(timeout); busy=false; updateChrome();
      if (current&&pageActive&&!document.hidden) timer=setTimeout(poll,retryAfter|| (generation!==requestGeneration||entry(current).queue.length?80:300));
    }
  }
  function leave(room) {
    if (!room) return;
    entry(room).queue.length=0;
    navigator.sendBeacon('/api/rooms', new Blob([JSON.stringify({room,connection,leave:true})],{type:'application/json'}));
  }
  function syncRoom() {
    if (!together) return;
    const candidate = pageActive&&!document.hidden ? window.LiveRooms?.activeRoom || document.body.dataset.liveRoom : null;
    // Some rooms are local showcases (for example the c010 Spine milestone)
    // and intentionally have no shared simulation endpoint. Leave the
    // together-room connection idle while those panels are on screen.
    const next = RoomwaveEngine.rooms.includes(candidate) ? candidate : null;
    if (!next) {
      if (current) leave(current);
      current = null;
      localRoom = candidate;
      requestGeneration++;
      clearTimeout(timer);
      updateChrome();
      return;
    }
    if (next===current && !localRoom) return;
    localRoom = null;
    const old=current; current=next; requestGeneration++; leave(old); clearTimeout(timer);
    if (current) { entry(current).received=0; if(!busy) void poll(); }
    updateChrome();
  }
  function createModel(room, soloFactory, saved) {
    if (!together || !RoomwaveEngine.rooms.includes(room)) return soloFactory(saved);
    const state=entry(room);
    return new Proxy({}, { get(_, key) {
      const model=state.engine.model;
      if (key==='tick') return () => {project(room); return room==='workout' ? null : [];};
      if (['setActive','setViewport','cancelPending','clearPending','noteInteraction','beginDecorationGesture','endDecorationGesture'].includes(key)) return ()=>{};
      if (['undoDecoration','clearDecorations','applyArrangement'].includes(key)) return ()=>false;
      if (['start','choose','placeDecoration'].includes(key)) return (...args)=>send(room,key,args);
      if (['canStart','canChoose','canPlaceDecoration'].includes(key)) return (...args)=>connected(room)&&model[key](...args)&&(!(room==='fortune'&&key==='canStart')||!model.action);
      if (key==='frame' && room==='baking') {
        const view={...model.frame,canUndo:false};
        if(view.stage==='decorate'&&!view.busy)view.text=view.count>=view.maximum?'Our cake is full. Ready to show everyone?':'Pick a topping, then tap the cake. Everyone can add a little something.';
        return view;
      }
      const value=model[key]; return typeof value==='function'?value.bind(model):value;
    }});
  }
  function frame(room) { project(room); return entry(room).engine.frame; }
  window.Roomwave = Object.freeze({ together, createModel, send, connected, frame, notice,
    snapshot(room) { const state=entry(room); return {revision:state.revision,people:state.people,checkpoint:state.engine.checkpoint()}; } });
  document.addEventListener('DOMContentLoaded',()=>{
    chrome=document.createElement('header'); chrome.className='roomwave-bar';
    chrome.innerHTML=`<a class="roomwave-brand" href="/" aria-label="Roomwave solo home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14V10M8 18V6M13 21V3M18 17V7M23 13V11"/></svg><b>Roomwave</b></a><div class="roomwave-presence"><strong></strong><span></span></div><a class="roomwave-mode" href="${together?'/solo':'/together'}">${together?'Solo ↗':'Play together ↗'}</a>`;
    document.body.append(chrome);status=chrome.querySelector('.roomwave-presence strong');people=chrome.querySelector('.roomwave-presence span');
    const toast=document.createElement('p');toast.id='roomwave-notice';toast.hidden=true;toast.setAttribute('role','status');document.body.append(toast);
    if(together){
      for(const selector of ['#visits-pill','.baking-undo','.baking-clear','.baking-arrangements']) document.querySelectorAll(selector).forEach(node=>node.hidden=true);
      document.querySelectorAll('[data-gift]').forEach(node=>node.setAttribute('aria-label',`Send ${node.querySelector('b')?.textContent||node.dataset.gift} to the shared room`));
      function renderSharedStream(){
        if(current==='stream'&&entry('stream').received)window.__stickStream?.applySharedFrame(frame('stream'));
        requestAnimationFrame(renderSharedStream);
      }
      requestAnimationFrame(renderSharedStream);
      window.addEventListener('roomwave-state',event=>{
        if(event.detail.room==='karaoke'){
          const state=frame('karaoke');window.RoomMusic?.setSharedPlayback(state);window.KaraokeRoom?.applySharedFrame(state);
        }
      });
    }
    updateChrome();syncRoom();
    // Optional WebMCP: all actions still pass through the authoritative room API.
    if(document.modelContext?.registerTool){
      try{
        const navigableRooms=[...RoomwaveEngine.rooms,'gaming-c010'];
        document.modelContext.registerTool({name:'visit_roomwave_room',description:'Visit a Roomwave live room or the local c010 showcase.',inputSchema:{type:'object',properties:{room:{type:'string',enum:navigableRooms}},required:['room']},execute:async({room})=>{if(!navigableRooms.includes(room))throw new Error('Unknown room');window.LiveRooms.goTo(room,{behavior:'instant'});return {content:[{type:'text',text:`Opened ${room}.`}]};}});
      }catch{}
    }
  });
  window.addEventListener('live-room-change',syncRoom);
  document.addEventListener('visibilitychange',syncRoom);
  window.addEventListener('pagehide',()=>{pageActive=false;syncRoom()});
  window.addEventListener('pageshow',()=>{pageActive=true;syncRoom()});
  window.addEventListener('online',()=>{clearTimeout(timer);void poll()});
})();
