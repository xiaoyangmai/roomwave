(() => {
  'use strict';
  const room=document.getElementById('fortune-room');
  if(!room||!window.FortuneState)return;
  let saved;try{saved=JSON.parse(localStorage.getItem(FortuneState.storageKey))}catch{}
  const model=(window.Roomwave ? window.Roomwave.createModel('fortune', FortuneState.create, saved) : FortuneState.create(saved)),artwork=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const actions=[['card','✧','Cards','Choose a card reading'],['crystal','☾','Crystal ball','Gaze into the crystal ball']];
  const compass='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="32"/><circle cx="50" cy="50" r="38"/><path d="M50 5 57 40 82 18 60 43 95 50 60 57 82 82 57 60 50 95 43 60 18 82 40 57 5 50 40 43 18 18 43 40Z"/><circle cx="50" cy="50" r="6"/></svg>';
  const symbols={
    moon:'<path d="M68 17A34 34 0 1 0 83 70 31 31 0 0 1 68 17Z"/><path d="m76 30 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z"/>',
    key:'<circle cx="37" cy="35" r="17"/><path d="m49 48 32 32m-12-12 9-9m-19-1 9-9"/>',
    heart:'<path d="M50 81 19 50C-1 27 30 8 50 31 70 8 101 27 81 50Z"/>',
    cat:'<path d="m25 38-3-22 23 13h10l23-13-3 22c23 43-73 43-50 0Z"/><path d="M34 48h1m30 0h1M47 59h6m-3 0v6M11 53l20 3m38 0 20-3M13 67l18-5m38 0 18 5"/>',
    teacup:'<path d="M19 43h52v13c0 27-52 27-52 0Zm53 3h8c17 0 12 22-9 20M12 82h69M32 31c-10-10 10-13 0-23m21 23c-10-10 10-13 0-23"/>',
    star:'<path d="m50 9 12 28 31 3-24 21 7 31-26-16-26 16 7-31L7 40l31-3Z"/>'
  };
  room.innerHTML=`<div class="fortune-ambient" aria-hidden="true"></div><div class="fortune-shell">
    <div class="fortune-stage"><div class="fortune-scene"><img class="fortune-parlor" alt="A candlelit parlor, purple velvet, gold stars, and a sleeping cat" draggable="false"><img class="fortune-character" alt="The fortune teller smiles and welcomes you" draggable="false"><img class="fortune-table" alt="" aria-hidden="true" draggable="false">
      <div class="fortune-ball" aria-hidden="true"><img class="fortune-crystal" alt="" draggable="false"><canvas class="fortune-ball-effects"></canvas><div class="fortune-vision"></div></div>
      <img class="fortune-crystal-base" alt="" aria-hidden="true" draggable="false">
      <img class="fortune-cup" alt="" aria-hidden="true" draggable="false"><canvas class="fortune-effects" aria-hidden="true"></canvas>
    </div></div>
    <header class="fortune-header"><div class="fortune-profile"><span aria-hidden="true">✧</span><div class="room-heading"><strong class="room-host-name">Luna</strong><small class="room-type">Fortunes</small></div><b class="fortune-live">LIVE</b></div><button type="button" class="fortune-sound" aria-label="Unmute Fortunes sounds" aria-pressed="false"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button></header>
    <div class="fortune-spread" role="group" aria-label="Pick one of three fortune cards" aria-hidden="true">${['left','middle','right'].map((place,index)=>`<button type="button" class="fortune-card" data-fortune-card="${index}" aria-label="Pick the ${place} card"><span class="fortune-card-inner"><span class="fortune-card-back" aria-hidden="true"><i>✦</i>${compass}<i>☾</i></span><span class="fortune-card-front" aria-hidden="true"><img alt="" draggable="false"></span></span></button>`).join('')}</div>
    <div class="fortune-bottom">
      <div class="fortune-reading" role="status" aria-live="polite" aria-atomic="true"><strong class="fortune-reading-title">A little mystery awaits</strong><p class="fortune-speech">Come in, get comfortable. Shall we see what finds you?</p></div>
      <div class="fortune-gifts" role="group" aria-label="Choose a fortune experience">${actions.map(([id,icon,label,aria])=>`<button type="button" data-fortune-action="${id}" aria-label="${aria}" aria-pressed="false"><span aria-hidden="true" class="fortune-gift-icon fortune-gift-${id}">${id==='card'?compass:icon}</span><b>${label}</b></button>`).join('')}</div>
    </div><div class="fortune-art-status" role="status" hidden><span>Lighting the candles…</span><button type="button" hidden>Retry artwork</button></div>
  </div>`;
  const $=selector=>room.querySelector(selector),shell=$('.fortune-shell'),stage=$('.fortune-stage'),scene=$('.fortune-scene'),parlor=$('.fortune-parlor'),character=$('.fortune-character'),table=$('.fortune-table'),crystal=$('.fortune-crystal'),cup=$('.fortune-cup'),canvas=$('.fortune-effects'),ctx=canvas.getContext('2d');
  const ball=$('.fortune-ball'),crystalBase=$('.fortune-crystal-base'),ballCanvas=$('.fortune-ball-effects'),ballCtx=ballCanvas.getContext('2d'),vision=$('.fortune-vision'),spread=$('.fortune-spread'),bottom=$('.fortune-bottom');
  const controls=[...room.querySelectorAll('[data-fortune-action]')],cards=[...room.querySelectorAll('[data-fortune-card]')],reading=$('.fortune-reading'),speech=$('.fortune-speech'),title=$('.fortune-reading-title');
  let ready=false,loading=false,reset=false,enabled=false,raf=0,lastTime=0,lastSave=0,loadRun=0,sound=false,audioContext,audioEpoch=0,lastPose='',lastSymbol='';
  let artWidth=1024,artHeight=1536,sceneWidth=1,sceneHeight=1,dockHeight=0;
  const audioNodes=new Set();
  try{sound=localStorage.getItem('roomwave-fortune-sound-v1')==='on'}catch{}
  const assetUrl=name=>`assets/${name==='crystal'?'fortune-room-readings/crystal-clear':['cat','lantern','door','teacup','fox','thread','star','plate','mirror','key'].includes(name)?`fortune-room-readings/${name}`:`fortune-room-v2/${name==='character-crystal'?'character-crystal-centered':name}`}.webp${loadRun>1?`?retry=${loadRun}`:''}`;
  const save=()=>{if(!reset&&!window.Roomwave?.together)try{localStorage.setItem(FortuneState.storageKey,JSON.stringify(model.state))}catch{}};
  function silence(){audioEpoch++;for(const node of audioNodes)try{node.stop()}catch{}audioNodes.clear()}
  function play(action){
    if(!sound||!enabled)return;
    const epoch=audioEpoch;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();
      audioContext.resume().then(()=>{if(epoch!==audioEpoch||!sound||!enabled||reset)return;
        const notes=action==='tea'?[392,523]:action==='surprise'?[659,784,523]:action==='complete'?[523,659,784]:[440,659,880];
        notes.forEach((frequency,index)=>{const node=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime+index*.14;
          node.type='sine';node.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.027,at+.02);gain.gain.exponentialRampToValueAtTime(.001,at+.4);node.connect(gain);gain.connect(audioContext.destination);node.start(at);node.stop(at+.42);audioNodes.add(node);node.onended=()=>{audioNodes.delete(node);node.disconnect();gain.disconnect()};});
      }).catch(()=>{});
    }catch{}
  }
  function updateSound(){const button=$('.fortune-sound');button.setAttribute('aria-pressed',String(sound));button.setAttribute('aria-label',`${sound?'Mute':'Unmute'} all audio`);button.title='For you in every room';button.querySelector('use').setAttribute('href',sound?'#icon-sound':'#icon-muted')}
  window.UserAudio?.subscribe(value=>{sound=value;updateSound();if(!sound)silence();});
  $('.fortune-sound').addEventListener('click',()=>{if(window.UserAudio){window.UserAudio.toggle();return;}sound=!sound;updateSound();if(sound)play('crystal');else silence();try{localStorage.setItem('roomwave-fortune-sound-v1',sound?'on':'off')}catch{}});
  function resize(){
    const box=stage.getBoundingClientRect(),wide=shell.clientWidth>shell.clientHeight;
    const scale=(wide?Math.min:Math.max)(box.width/artWidth,box.height/artHeight);sceneWidth=Math.max(1,artWidth*scale);sceneHeight=Math.max(1,artHeight*scale);
    scene.style.width=`${sceneWidth}px`;scene.style.height=`${sceneHeight}px`;
    const ratio=Math.min(devicePixelRatio||1,2);
    for(const [surface,context] of [[canvas,ctx],[ballCanvas,ballCtx]]){surface.width=Math.round(sceneWidth*ratio);surface.height=Math.round(sceneHeight*ratio);context?.setTransform(ratio,0,0,ratio,0,0)}
    render();
  }
  function resizeDock(){const height=bottom.getBoundingClientRect().height;if(height>0&&height!==dockHeight){dockHeight=height;shell.style.setProperty('--fortune-dock-height',`${height}px`)}}
  // All poses share one fixed rectangle. The crystal pose paints the centered
  // glass and hands together; its magic remains a separate overlay.
  const actorLayout={x:40,y:136,w:944,h:944,cell:512};
  function place(element,box){element.style.left=`${box.x/1024*100}%`;element.style.top=`${box.y/1536*100}%`;element.style.width=`${box.w/1024*100}%`;element.style.height=`${box.h/1536*100}%`}
  function placeLayers(){place(character,actorLayout);place(crystal,{x:0,y:0,w:1024,h:1536});place(cup,{x:0,y:0,w:1024,h:1536})}
  const poseAlts={idle:'The fortune teller smiles and welcomes you',shuffle:'The fortune teller looks down and shuffles her deck',reveal:'The fortune teller raises your chosen card with a smile',crystal:'The fortune teller concentrates on the crystal ball',tea:'The fortune teller lifts her cup for a sip of tea',surprise:'The fortune teller reacts with delighted surprise'};
  function updateCharacter(frame){
    const motion=window.FortuneMotion.frame(frame,{reduced:reduced.matches});
    if(ready&&motion.pose!==lastPose){
      character.src=assetUrl(`character-${motion.pose}`);character.alt=poseAlts[motion.pose];
      // The empty holder has a painted interior; slicing the seated ball cannot
      // reveal a natural opening when Luna lifts the glass into her hands.
      const lifted=motion.pose==='crystal';
      crystalBase.src=assetUrl(lifted?'crystal-stand-empty':'crystal');
      crystalBase.dataset.empty=String(lifted);lastPose=motion.pose;
    }
    character.dataset.pose=motion.pose;cup.hidden=motion.pose==='tea';return motion;
  }
  function star(context,x,y,r,alpha){context.save();context.globalAlpha=alpha;context.translate(x,y);context.fillStyle='#fff1bd';context.beginPath();context.moveTo(0,-r);context.quadraticCurveTo(r*.15,-r*.15,r,0);context.quadraticCurveTo(r*.15,r*.15,0,r);context.quadraticCurveTo(-r*.15,r*.15,-r,0);context.quadraticCurveTo(-r*.15,-r*.15,0,-r);context.fill();context.restore()}
  function drawBall(frame){
    if(!ballCtx)return;const context=ballCtx;context.clearRect(0,0,sceneWidth,sceneHeight);
    if(!ready||frame.activity!=='crystal'||frame.resting)return;
    const clock=reduced.matches?1200:frame.clock,ox=738,oy=934,r=80;
    context.save();context.scale(sceneWidth/artWidth,sceneHeight/artHeight);
    // Every mist stroke and star is clipped inside the painted glass boundary.
    context.beginPath();context.arc(ox,oy,r,0,Math.PI*2);context.clip();
    const glow=context.createRadialGradient(ox,oy,3,ox,oy,r);glow.addColorStop(0,'#eccdff70');glow.addColorStop(.65,'#af7be540');glow.addColorStop(1,'#9574d000');context.fillStyle=glow;context.fillRect(ox-r,oy-r,r*2,r*2);
    context.save();context.translate(ox,oy);context.rotate(clock*.00018);
    for(let i=0;i<5;i++){context.beginPath();context.strokeStyle=`rgba(221,193,255,${.09+i*.018})`;context.lineWidth=10+i*2;context.ellipse(Math.sin(clock*.0003+i)*14,Math.cos(clock*.00025+i)*12,29+i*11,10+i*5,i*.64,0,Math.PI*1.75);context.stroke()}
    context.restore();
    for(let i=0;i<13;i++){const angle=i*2.4+clock*.00012,radius=22+(i%4)*14;star(context,ox+Math.cos(angle)*radius,oy+Math.sin(angle)*radius,2+i%3, .35+.25*Math.sin(clock*.0008+i))}
    context.restore();
  }
  function draw(frame,motion){
    drawBall(frame);if(!ctx)return;ctx.clearRect(0,0,sceneWidth,sceneHeight);if(!ready)return;
    ctx.save();ctx.scale(sceneWidth/artWidth,sceneHeight/artHeight);
    if(motion.showHeldCard&&artwork.get(motion.cardId)){
      ctx.save();ctx.translate(actorLayout.x+120*actorLayout.w/512,actorLayout.y+170*actorLayout.h/512);ctx.scale(actorLayout.w/512,actorLayout.h/512);
      ctx.fillStyle='#17213d';ctx.fillRect(0,0,45,60);ctx.drawImage(artwork.get(motion.cardId),2,9,41,41);ctx.restore();
    }
    const clock=reduced.matches?1200:frame.clock;
    if(motion.pose==='tea'){
      ctx.strokeStyle='rgba(255,239,224,.38)';ctx.lineWidth=5;ctx.lineCap='round';
      for(let i=0;i<3;i++){const x=(motion.pose==='tea'?actorLayout.x+268*actorLayout.w/512:230)+(i-1)*15,y=motion.pose==='tea'?actorLayout.y+213*actorLayout.h/512:1060,w=Math.sin(clock*.002+i)*12;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+22+w,y-30,x-22-w,y-53,x+w,y-94);ctx.stroke()}
    }
    if(frame.action==='surprise')for(let i=0;i<16;i++){const phase=(clock*.00025+i*.137)%1;star(ctx,artWidth*(.18+(i*37%67)/100),artHeight*(.75-phase*.25),4+(i%4)*3,Math.sin(phase*Math.PI)*.7)}
    ctx.restore();
  }
  function render(){
    const frame=model.frame,motion=updateCharacter(frame),isCard=frame.activity==='card'&&!frame.resting,hasResult=Boolean(frame.result&&!frame.action);
    const readingVisible=!hasResult||!frame.resting;
    reading.dataset.visible=String(readingVisible);reading.setAttribute('aria-hidden',String(!readingVisible));
    shell.dataset.action=frame.action||'idle';shell.dataset.activity=frame.activity||'idle';
    ball.dataset.centered=String(motion.pose==='crystal');
    const text=frame.text||frame.result?.text||'Come in, get comfortable. Shall we see what finds you?';if(speech.textContent!==text)speech.textContent=text;
    const heading=hasResult?frame.result.title:frame.action==='card'?'A new reading':frame.action==='reveal'?'Your card is revealing itself':frame.activity==='card'?'Which one calls to you?':frame.activity==='crystal'?'Let the mist settle…':frame.activity==='tea'?'A quiet cup together':frame.activity==='surprise'?'An unexpected glimpse':'A little mystery awaits';
    if(title.textContent!==heading)title.textContent=heading;
    spread.dataset.visible=String(isCard);spread.dataset.selected=String(frame.selectedIndex);spread.dataset.dealing=String(frame.action==='card');spread.setAttribute('aria-hidden',String(!isCard));
    const symbol=frame.activity==='crystal'&&!frame.resting&&hasResult?frame.result.symbol||'star':'';
    if(symbol!==lastSymbol){vision.innerHTML=symbol?`<svg viewBox="0 0 100 100" aria-hidden="true">${symbols[symbol]||symbols.star}</svg>`:'';lastSymbol=symbol}vision.dataset.visible=String(Boolean(symbol));
    for(const button of controls){const action=button.dataset.fortuneAction;button.disabled=!ready||!model.canStart(action);button.setAttribute('aria-pressed',String(frame.activity===action))}
    cards.forEach((button,index)=>{
      const card=frame.cards[index],face=button.querySelector('img');
      if(ready&&card&&face.dataset.card!==card.id){face.src=assetUrl(card.id);face.dataset.card=card.id}
      button.disabled=!ready||!model.canChoose(index);button.dataset.revealed=String(Boolean(card?.revealed));button.dataset.chosen=String(frame.selectedIndex===index);
      button.setAttribute('aria-label',card?.revealed?`${card.title}. ${card.meaning}`:`Pick the ${['left','middle','right'][index]} card`);
    });draw(frame,motion);
  }
  function act(action){if(!ready||!model.start(action))return;silence();play(action);render();save()}
  controls.forEach(button=>button.addEventListener('click',()=>act(button.dataset.fortuneAction)));
  cards.forEach((button,index)=>button.addEventListener('click',()=>{if(!ready||!model.choose(index))return;silence();play('card');render();save()}));
  function tick(time){raf=0;if(!enabled)return;const events=model.tick(lastTime?time-lastTime:0);lastTime=time;render();if(events.includes('reading')){silence();play('complete')}if(events.includes('complete')||events.includes('reading')||time-lastSave>5000){save();lastSave=time}raf=requestAnimationFrame(tick)}
  function syncActive(){
    const selected=!reset&&window.LiveRooms?.activeRoom==='fortune'&&!document.hidden;
    if(selected&&!ready&&!loading&&!loadRun)loadArtwork();const next=selected&&ready;shell.classList.toggle('is-paused',!next);
    if(next===enabled){render();return}enabled=next;model.setActive(next);lastTime=0;
    if(next){resize();raf=requestAnimationFrame(tick)}else{cancelAnimationFrame(raf);raf=0;silence();save()}render();
  }
  function loadImage(name){return new Promise((resolve,reject)=>{const image=new Image();let settled=false;const finish=error=>{if(settled)return;settled=true;clearTimeout(timeout);image.onload=image.onerror=null;if(error)reject(error);else resolve([name,image])};const timeout=setTimeout(()=>finish(new Error('Artwork timed out')),12000);image.onload=()=>finish();image.onerror=()=>finish(new Error('Artwork unavailable'));image.src=assetUrl(name);if(image.complete&&image.naturalWidth)finish()})}
  async function loadArtwork(){
    if(loading||reset)return;loading=true;const run=++loadRun,status=$('.fortune-art-status'),retry=status.querySelector('button');status.hidden=false;retry.hidden=true;status.querySelector('span').textContent='Lighting the candles…';
    try{const assets=await Promise.all(['background','character-idle','character-shuffle','character-reveal','character-crystal','character-tea','character-surprise','crystal','crystal-stand-empty','cup','cat','lantern','door','teacup','fox','thread','star','plate','mirror','key'].map(loadImage));if(reset||run!==loadRun)return;assets.forEach(([name,image])=>artwork.set(name,image));artWidth=artwork.get('background').naturalWidth;artHeight=artwork.get('background').naturalHeight;parlor.src=table.src=assetUrl('background');crystal.src=crystalBase.src=assetUrl('crystal');cup.src=assetUrl('cup');placeLayers();lastPose='';ready=true;status.hidden=true;resize();syncActive()}
    catch{if(reset||run!==loadRun)return;status.querySelector('span').textContent='The fortune artwork couldn’t load.';retry.hidden=false}finally{if(run===loadRun)loading=false}
  }
  $('.fortune-art-status button').addEventListener('click',loadArtwork);
  window.addEventListener('live-room-change',syncActive);document.addEventListener('visibilitychange',syncActive);window.addEventListener('pageshow',syncActive);
  window.addEventListener('pagehide',()=>{save();silence();cancelAnimationFrame(raf);enabled=false;model.setActive(false)});
  window.addEventListener('stream:resetting',()=>{reset=true;enabled=false;model.setActive(false);model.cancelPending();cancelAnimationFrame(raf);silence();render()});
  new ResizeObserver(resize).observe(stage);new ResizeObserver(resizeDock).observe(bottom);resizeDock();reduced.addEventListener?.('change',render);
  window.FortuneRoom=Object.freeze({get state(){return model.state},get frame(){return model.frame},get active(){return enabled},get ready(){return ready}});
  updateSound();render();syncActive();
})();
