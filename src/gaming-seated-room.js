(() => {
  'use strict';
  const room=document.getElementById('gaming-seated-room');
  if(!room||!window.GamingSeatedState||!window.GamingSeatedSprites)return;
  const storageKey=GamingSeatedState.storageKey,soundKey='roomwave-gaming-seated-sound-v1';
  const variant=GamingSeatedSprites.defaultVariant;
  let saved;try{saved=JSON.parse(localStorage.getItem(storageKey));}catch{}
  const model=(window.Roomwave ? window.Roomwave.createModel('gaming-seated', GamingSeatedState.create, saved) : GamingSeatedState.create(saved)),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const foamIcon='<svg viewBox="0 0 42 36" fill="none" aria-hidden="true"><path d="M6 27c-6-3-2-12 4-11-2-8 10-13 13-5 6-6 14 0 12 6 8 2 6 13-1 14H11Z" fill="#e3eafa"/><g fill="#fff"><circle cx="10" cy="23" r="6"/><circle cx="17" cy="16" r="7"/><circle cx="26" cy="19" r="7"/><circle cx="32" cy="24" r="6"/><circle cx="21" cy="25" r="7"/></g><g fill="#e2e9f5"><circle cx="13" cy="28" r="2"/><circle cx="26" cy="28" r="2"/><circle cx="30" cy="16" r="1.4"/></g></svg>';
  const gifts=[['star','⭐','Star',`Give the runner ${GamingSeatedState.actions.star/1000} seconds of invincibility`],['banana','🍌','Banana','Drop a banana'],['water','🔫','Water','Spray water and wash off foam'],['foam',foamIcon,'Foam','Send fluffy foam'],['fan','🌀','Fan','Turn on the fan']];
  room.innerHTML=`<div class="seated-shell">
    <header class="seated-header"><div class="seated-title"><span aria-hidden="true">🎮</span><div class="seated-title-copy room-heading"><strong class="room-host-name">Lassa</strong><small class="room-type">Gaming</small></div><span class="seated-live-badge">LIVE</span></div><button type="button" class="seated-sound" aria-label="Unmute Gaming sounds" aria-pressed="false"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button></header>
    <section class="seated-game" aria-label="Live platform game"><canvas class="seated-game-canvas" aria-label="The gamer’s purple cat runs and jumps across grassy platforms"></canvas>
      <div class="seated-progress" role="progressbar" aria-label="Current stage progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>
    </section>
    <section class="seated-camera" aria-label="Gamer camera"><canvas class="seated-camera-canvas" role="img" aria-label="A navy-haired gamer sits in a purple chair with her controller"></canvas><div class="seated-cam-label"><i></i>PLAYER CAM <span class="seated-inputs" aria-hidden="true"><b>▲</b><b>▶</b></span></div></section>
    <div class="seated-controls"><div class="seated-gifts" role="group" aria-label="Send a gaming gift">${gifts.map(([id,icon,label,description])=>`<button type="button" data-seated-gift="${id}" aria-label="${description}" title="${description}" aria-pressed="false"><span aria-hidden="true">${icon}</span><b>${label}</b></button>`).join('')}</div></div>
    <div class="seated-status" role="status"><span>Getting Gaming ready…</span><button type="button" hidden>Retry artwork</button></div>
  </div>`;
  const $=selector=>room.querySelector(selector),shell=$('.seated-shell');
  const gameCanvas=$('.seated-game-canvas'),gameContext=gameCanvas.getContext('2d'),cameraCanvas=$('.seated-camera-canvas'),cameraContext=cameraCanvas.getContext('2d');
  const controls=[...room.querySelectorAll('[data-seated-gift]')],lights=[...room.querySelectorAll('.seated-inputs b')];
  const progress=$('.seated-progress'),progressFill=progress.querySelector('i'),artwork=new Map();
  let enabled=false,reset=false,ready=false,loading=false,loadStarted=false,loadRun=0,raf=0,lastTime=0,lastSave=0;
  let width=1,height=1,cameraWidth=1,cameraHeight=1,backgroundFrame=null,lastPose='idle',poseFrom='idle',poseAt=0,lastAlt='';
  let sound=false,audioContext,audioEpoch=0,lastSoundAt=-Infinity;const audioNodes=new Set();
  try{sound=localStorage.getItem(soundKey)==='on';}catch{}
  const url=name=>`${GamingSeatedSprites.assetUrls[name]}${loadRun>1?`?retry=${loadRun}`:''}`;
  function save(){if(!reset&&!window.Roomwave?.together)try{localStorage.setItem(storageKey,JSON.stringify(model.state));}catch{}}
  function silence(){audioEpoch++;lastSoundAt=-Infinity;for(const node of audioNodes)try{node.stop();}catch{}audioNodes.clear();}
  function play(action){
    if(!sound||!enabled||reset)return;const epoch=audioEpoch;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||=new Audio();if(audioContext.currentTime-lastSoundAt<.12)return;lastSoundAt=audioContext.currentTime;
      audioContext.resume().then(()=>{if(epoch!==audioEpoch||!enabled||!sound||reset||audioNodes.size>=16)return;
        const notes=action==='star'?[523.25,659.25,783.99,1046.5,1318.51]:action==='star-hit'?[1046.5,1318.51,1567.98]:action==='banana'?[440,300,220]:action==='foam'?[760,920,1120]:action==='fan'?[280,360,420]:[440,660,880];
        notes.slice(0,16-audioNodes.size).forEach((frequency,i)=>{const node=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime+i*.09;node.type=action.startsWith('star')?'triangle':'sine';node.frequency.setValueAtTime(frequency,at);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.025,at+.015);gain.gain.exponentialRampToValueAtTime(.001,at+.16);node.connect(gain);gain.connect(audioContext.destination);node.start(at);node.stop(at+.18);audioNodes.add(node);node.onended=()=>{audioNodes.delete(node);node.disconnect();gain.disconnect();};});
      }).catch(()=>{});
    }catch{}
  }
  function updateSound(){const button=$('.seated-sound');button.setAttribute('aria-pressed',String(sound));button.setAttribute('aria-label',`${sound?'Mute':'Unmute'} all audio`);button.title='For you in every room';button.querySelector('use').setAttribute('href',sound?'#icon-sound':'#icon-muted');}
  window.UserAudio?.subscribe(value=>{sound=value;updateSound();if(!sound)silence();});
  $('.seated-sound').addEventListener('click',()=>{if(window.UserAudio){window.UserAudio.toggle();return;}sound=!sound;updateSound();if(sound)play('star');else silence();try{localStorage.setItem(soundKey,sound?'on':'off');}catch{}});
  function draw(frame,state){window.GamingPlatform?.draw(gameContext,frame,state,{width,height,reduced:reduced.matches});}
  function poseName(frame){return GamingSeatedSprites.select(frame,{reduced:reduced.matches});}
  function render(){
    const frame=model.frame,state=model.state,pose=poseName(frame);
    if(pose!==lastPose){poseFrom=lastPose;lastPose=pose;poseAt=frame.clock;}
    const windFrame=poseFrom.startsWith('fan-hold')&&lastPose.startsWith('fan-hold');
    const blend={from:poseFrom,to:lastPose,mix:reduced.matches?1:Math.min(1,(frame.clock-poseAt)/(windFrame?85:150))};
    shell.dataset.action=frame.action||'idle';shell.dataset.pose=frame.pose;shell.dataset.hands=String(frame.handsOnController);shell.dataset.poseReady=String(blend.mix>=1);shell.dataset.foamLevel=frame.foamFill>=.98?'full':frame.foamFill>.55?'deep':frame.foamFill>0?'light':'clear';
    window.GamingSeatedEffects?.draw(cameraContext,frame,{width:cameraWidth,height:cameraHeight,artwork,reduced:reduced.matches,blend,drawBackground:false,backgroundFrame});
    const alt=frame.foamFill>=.98?'Fluffy white foam fills the streamer scene; the game and gift buttons stay clear.':frame.foamFill>.55?'Foam thickens around her hair, shoulders, clothes and hands as she keeps playing.':frame.pose==='fan-missed'?`She notices the gust late; her skirt briefly flutters above her ${GamingSeatedSprites.variants[variant].description} safety shorts.`:frame.pose==='foam-notice'?(frame.reaction?.faceHit?'Foam partly covers her bangs; she keeps both hands on the controller.':'Foam clings to her hair and clothes while she keeps both hands on the controller.'):frame.handsOnController===1?(frame.reaction?.kind==='foam'?'She wipes a little foam from her bangs while playing with one hand.':'She presses her skirt down while playing with one hand.'):'She plays with both hands on her controller.';
    if(alt!==lastAlt){cameraCanvas.setAttribute('aria-label',alt);lastAlt=alt;}
    lights[0].classList.toggle('is-on',Boolean(frame.jumping));lights[1].classList.toggle('is-on',frame.steering>.08&&(frame.handsOnController===2||Math.floor(frame.clock/160)%3!==0));
    progressFill.style.width=`${frame.progress*100}%`;progress.setAttribute('aria-valuenow',String(Math.floor(frame.progress*100)));
    for(const button of controls){const gift=button.dataset.seatedGift;button.disabled=!ready||!model.canStart(gift);button.setAttribute('aria-pressed',String(Object.hasOwn(frame.effects,gift)));}
    draw(frame,state);
  }
  function resize(){const ratio=Math.min(window.devicePixelRatio||1,2),box=gameCanvas.getBoundingClientRect(),cam=cameraCanvas.getBoundingClientRect(),roomBox=shell.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);cameraWidth=Math.max(1,cam.width);cameraHeight=Math.max(1,cam.height);backgroundFrame={width:roomBox.width,height:roomBox.height,x:roomBox.left-cam.left,y:roomBox.top-cam.top};model.setViewport(width,height);gameCanvas.width=Math.round(width*ratio);gameCanvas.height=Math.round(height*ratio);cameraCanvas.width=Math.round(cameraWidth*ratio);cameraCanvas.height=Math.round(cameraHeight*ratio);gameContext?.setTransform(ratio,0,0,ratio,0,0);cameraContext?.setTransform(ratio,0,0,ratio,0,0);render();}
  function tick(time){raf=0;if(!enabled)return;const delta=lastTime?time-lastTime:0;const events=model.tick(delta);lastTime=time;render();if(events.includes('finish'))play('star');else if(events.includes('star-hit'))play('star-hit');if(time-lastSave>5000||events.includes('complete')||events.includes('finish')){lastSave=time;save();}raf=requestAnimationFrame(tick);}
  function syncActive(){
    if(!ready&&!loadStarted&&!reset&&window.LiveRooms?.activeRoom==='gaming-seated')loadArtwork();
    const next=ready&&!reset&&window.LiveRooms?.activeRoom==='gaming-seated'&&!document.hidden;
    shell.classList.toggle('is-paused',!next);
    if(next===enabled){render();return;}
    enabled=next;model.setActive(enabled);lastTime=0;
    if(enabled){resize();raf=requestAnimationFrame(tick);}else{cancelAnimationFrame(raf);raf=0;silence();save();}
    render();
  }
  controls.forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.seatedGift;if(!model.start(action))return;play(action);render();save();}));
  window.addEventListener('live-room-change',syncActive);document.addEventListener('visibilitychange',syncActive);
  window.addEventListener('pagehide',()=>{save();silence();cancelAnimationFrame(raf);enabled=false;model.setActive(false);});window.addEventListener('pageshow',syncActive);
  window.addEventListener('stream:resetting',()=>{reset=true;enabled=false;model.setActive(false);cancelAnimationFrame(raf);silence();});
  new ResizeObserver(resize).observe($('.seated-game'));new ResizeObserver(resize).observe($('.seated-camera'));reduced.addEventListener?.('change',render);
  function loadImage(name){return new Promise((resolve,reject)=>{const image=new Image();let finished=false;const timeout=setTimeout(()=>finish(new Error('Artwork timed out')),12000);const finish=error=>{if(finished)return;finished=true;clearTimeout(timeout);image.onload=image.onerror=null;if(error)reject(error);else resolve([name,image]);};image.onload=()=>finish();image.onerror=()=>finish(new Error(`Could not load ${name}`));image.src=url(name);if(image.complete&&image.naturalWidth)finish();});}
  async function loadArtwork(){
    if(loading||reset)return;loadStarted=true;loading=true;const run=++loadRun,status=$('.seated-status'),retry=status.querySelector('button');status.hidden=false;retry.hidden=true;status.querySelector('span').textContent='Getting Gaming ready…';
    try{const loaded=await Promise.all(GamingSeatedSprites.roomAssets.map(loadImage));if(run!==loadRun||reset)return;for(const [name,image]of loaded)artwork.set(name,image);ready=true;status.hidden=true;resize();syncActive();}
    catch{if(run!==loadRun||reset)return;status.querySelector('span').textContent='Gaming artwork couldn’t load. Try again.';retry.hidden=false;}
    finally{if(run===loadRun)loading=false;}
  }
  $('.seated-status button').addEventListener('click',loadArtwork);
  window.GamingSeatedRoom=Object.freeze({get state(){return model.state;},get frame(){return model.frame;},get action(){return model.action;},get active(){return enabled;},get ready(){return ready;},get variant(){return variant;}});
  updateSound();render();syncActive();
})();
