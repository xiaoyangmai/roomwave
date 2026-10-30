(() => {
  'use strict';
  const room = document.getElementById('gaming-room');
  if (!room || !window.GamingState) return;
  const assetUrl = name => `assets/${name.startsWith('gamer') ? 'gaming-room-v2' : 'gaming-room-v1'}/${name}.webp${loadRun>1 ? `?retry=${loadRun}` : ''}`;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(GamingState.storageKey)); } catch {}
  const model = GamingState.create(saved);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const actionButtons = [['boost','⚡','Boost'],['banana','🍌','Banana'],['water','🔫','Water'],['bubbles','🫧','Bubbles'],['fan','🌀','Fan']];
  room.innerHTML = `
    <div class="gaming-ambient" aria-hidden="true"></div>
    <div class="gaming-shell" data-action="idle">
      <header class="gaming-topline"><div class="gaming-profile"><span aria-hidden="true">🎮</span><div class="room-heading"><strong class="room-host-name">Lassa</strong><small class="room-type">Gaming</small></div><span class="gaming-live-badge">LIVE</span></div><button type="button" class="gaming-sound" aria-label="Unmute Gaming sounds" aria-pressed="false"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button></header>
      <section class="gaming-race" aria-label="Live side-scrolling platform game">
        <canvas class="gaming-canvas" aria-label="A purple cat runs and jumps through a colorful side-scrolling platform world"></canvas>
        <div class="gaming-track-progress" role="progressbar" aria-label="Current stage progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>
      </section>
      <section class="gaming-camera" aria-label="Gamer camera">
        <div class="gaming-camera-scene">
          <img class="gaming-portrait" alt="A navy-haired gamer in purple cat headphones holding her controller" draggable="false">
          <img class="gaming-portrait gaming-portrait-wet" alt="" draggable="false" aria-hidden="true">
          <canvas class="gaming-camera-effects" aria-hidden="true"></canvas>
        </div>
        <div class="gaming-camera-label"><i></i>PLAYER CAM <span class="gaming-inputs" aria-hidden="true"><b>▲</b><b>▶</b></span></div>
      </section>
      <div class="gaming-dialogue"><p class="gaming-speech" role="status" aria-live="polite">Let’s hop into an adventure!</p></div>
      <div class="gaming-controls">
        <div class="gaming-needs" aria-label="Gamer wellbeing">
          <div class="gaming-need"><span aria-hidden="true">🧠</span><label for="gaming-focus">Focus</label><meter id="gaming-focus" min="0" max="100" value="78">78%</meter></div>
          <div class="gaming-need"><span aria-hidden="true">💗</span><label for="gaming-mood">Mood</label><meter id="gaming-mood" min="0" max="100" value="82">82%</meter></div>
        </div>
        <div class="gaming-actions" role="group" aria-label="Send a gaming effect">${actionButtons.map(([id,icon,label])=>`<button type="button" data-gaming-action="${id}" aria-pressed="false" aria-label="${id==='water'?'Spray water':id==='bubbles'?'Send bubbles':id==='fan'?'Turn on fan':id==='banana'?'Drop a banana':'Boost the runner'}"><span aria-hidden="true">${icon}</span><b>${label}</b></button>`).join('')}</div>
      </div>
      <div class="gaming-art-status" role="status"><span>Getting the adventure ready…</span><button type="button" hidden>Retry artwork</button></div>
    </div>`;
  const $ = selector => room.querySelector(selector);
  const canvas = $('.gaming-canvas'), context = canvas.getContext('2d');
  const shell = $('.gaming-shell'), portrait = $('.gaming-portrait'), speech = $('.gaming-speech');
  const camera = $('.gaming-camera'), cameraScene = $('.gaming-camera-scene'), wetPortrait = $('.gaming-portrait-wet');
  const effectsCanvas = $('.gaming-camera-effects'), effectsContext = effectsCanvas.getContext('2d');
  const inputLights = [...room.querySelectorAll('.gaming-inputs b')];
  let cameraWidth=1200, cameraHeight=800;
  const controls = [...room.querySelectorAll('[data-gaming-action]')];
  const progress = $('.gaming-track-progress'), progressFill = progress.querySelector('i');
  let enabled = false, reset = false, raf = 0, lastTime = 0, lastSave = 0, lastPose = '', lastText = '', lastAction = '';
  let width = 1, height = 1, ready = false, loadStarted = false, loading = false, loadRun = 0, audioContext, sound = false, audioEpoch = 0, lastSoundAt = -Infinity;
  const artwork = new Map(), audioNodes = new Set();
  try { sound = localStorage.getItem('roomwave-gaming-sound-v1') === 'on'; } catch {}
  function save() { if (!reset) try { localStorage.setItem(GamingState.storageKey, JSON.stringify(model.state)); } catch {} }
  function silence() { audioEpoch++; lastSoundAt = -Infinity; for (const node of audioNodes) try { node.stop(); } catch {} audioNodes.clear(); }
  function play(action) {
    if (!sound || !enabled || reset) return;
    const epoch = audioEpoch;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ||= new Audio();
      if (audioContext.currentTime - lastSoundAt < .12) return;
      lastSoundAt = audioContext.currentTime;
      audioContext.resume().then(() => {
        if (epoch !== audioEpoch || !enabled || !sound || reset || audioNodes.size >= 20) return;
        const notes = action === 'banana' ? [440,330,220] : action === 'water' ? [880,660,1100] : action === 'bubbles' ? [660,880,990,1320] : action === 'fan' ? [330,440,550] : [440,660,880];
        notes.forEach((frequency,index) => {
          const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(), at = audioContext.currentTime + index * .1;
          oscillator.type = action === 'boost' ? 'triangle' : 'sine';
          oscillator.frequency.setValueAtTime(frequency,at); gain.gain.setValueAtTime(0,at);
          gain.gain.linearRampToValueAtTime(.035,at+.015); gain.gain.exponentialRampToValueAtTime(.001,at+.19);
          oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(at); oscillator.stop(at+.2);
          audioNodes.add(oscillator); oscillator.onended = () => { audioNodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        });
      }).catch(()=>{});
    } catch {}
  }
  function updateSound() {
    const button=$('.gaming-sound'); button.setAttribute('aria-pressed',String(sound));
    button.setAttribute('aria-label',`${sound?'Mute':'Unmute'} Gaming sounds`);
    button.querySelector('use').setAttribute('href',sound?'#icon-sound':'#icon-muted');
  }
  $('.gaming-sound').addEventListener('click',()=>{sound=!sound;updateSound();if(sound)play('fan');else silence();try{localStorage.setItem('roomwave-gaming-sound-v1',sound?'on':'off')}catch{}});
  function resize() {
    const box=canvas.getBoundingClientRect(), ratio=Math.min(window.devicePixelRatio||1,2);
    width=Math.max(1,box.width); height=Math.max(1,box.height);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    context?.setTransform(ratio,0,0,ratio,0,0); draw(model.frame,model.state);
  }
  function resizeCamera() {
    const box=camera.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);
    cameraWidth=Math.max(1,box.width,box.height*1.5);cameraHeight=cameraWidth/1.5;
    cameraScene.style.width=`${cameraWidth}px`;cameraScene.style.height=`${cameraHeight}px`;
    effectsCanvas.width=Math.round(cameraWidth*ratio);effectsCanvas.height=Math.round(cameraHeight*ratio);
    effectsContext?.setTransform(ratio,0,0,ratio,0,0);render();
  }
  function draw(frame,state) {
    window.GamingPlatform?.draw(context,frame,state,{width,height,artwork,reduced:reduced.matches});
  }
  function render() {
    const frame=model.frame,state=model.state,action=frame.action||'idle';
    if(action!==lastAction){shell.dataset.action=action;lastAction=action;}
    if(ready&&frame.pose!==lastPose){portrait.src=assetUrl(frame.pose);wetPortrait.src=assetUrl(`${frame.pose}-wet`);lastPose=frame.pose;}
    wetPortrait.style.opacity=String(frame.wetness||0);
    inputLights[0].classList.toggle('is-on',Boolean(frame.jumping));inputLights[1].classList.toggle('is-on',(frame.steering||0)>.08);
    window.GamingCameraEffects?.draw(effectsContext,frame,{width:cameraWidth,height:cameraHeight,reduced:reduced.matches});
    if(frame.text!==lastText){speech.textContent=frame.text;lastText=frame.text;}
    for(const key of['focus','mood']){$(`#gaming-${key}`).value=state[key];$(`#gaming-${key}`).textContent=`${Math.round(state[key])}%`;}
    progressFill.style.width=`${frame.progress*100}%`;progress.setAttribute('aria-valuenow',String(Math.floor(frame.progress*100)));
    for(const button of controls){const name=button.dataset.gamingAction;button.disabled=!ready||!model.canStart(name);button.setAttribute('aria-pressed',String(Object.hasOwn(frame.effects,name)));}
    draw(frame,state);
  }
  function tick(time) {
    raf=0;if(!enabled)return;
    const events=model.tick(lastTime?time-lastTime:0);lastTime=time;render();
    if(events.includes('finish'))play('boost');
    if(time-lastSave>5000||events.includes('complete')||events.includes('finish')){lastSave=time;save();}
    raf=requestAnimationFrame(tick);
  }
  function syncActive() {
    if(!ready&&!loadStarted&&!reset&&window.LiveRooms?.activeRoom==='gaming')loadArtwork();
    const next=ready&&!reset&&window.LiveRooms?.activeRoom==='gaming'&&!document.hidden;
    shell.classList.toggle('is-paused',!next);
    if(next===enabled){render();return;}
    enabled=next;model.setActive(enabled);lastTime=0;
    if(enabled){resize();raf=requestAnimationFrame(tick);}else{cancelAnimationFrame(raf);raf=0;silence();save();}
    render();
  }
  controls.forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.gamingAction;if(!model.start(action))return;play(action);render();save();}));
  window.addEventListener('live-room-change',syncActive);document.addEventListener('visibilitychange',syncActive);
  window.addEventListener('pagehide',()=>{save();silence();cancelAnimationFrame(raf);enabled=false;model.setActive(false);});
  window.addEventListener('pageshow',syncActive);
  window.addEventListener('stream:resetting',()=>{reset=true;enabled=false;model.setActive(false);cancelAnimationFrame(raf);silence();});
  new ResizeObserver(resize).observe($('.gaming-race'));
  new ResizeObserver(resizeCamera).observe(camera);
  reduced.addEventListener?.('change',render);
  function loadImage(name) {
    return new Promise((resolve,reject)=>{
      const image=new Image();let finished=false;
      const timeout=setTimeout(()=>finish(new Error('Artwork timed out')),12000);
      const finish=error=>{if(finished)return;finished=true;clearTimeout(timeout);image.onload=image.onerror=null;if(error)reject(error);else resolve([name,image]);};
      image.onload=()=>finish();image.onerror=()=>finish(new Error(`Could not load ${name}`));image.src=assetUrl(name);
      if(image.complete&&image.naturalWidth)finish();
    });
  }
  async function loadArtwork(){
    if(loading||reset)return;
    loadStarted=true;loading=true;
    const run=++loadRun,status=$('.gaming-art-status'),retry=status.querySelector('button');
    status.hidden=false;retry.hidden=true;status.querySelector('span').textContent='Getting the adventure ready…';
    try{
      const loaded=await Promise.all(['gamer','gamer-pout','gamer-cheer','gamer-wet','gamer-pout-wet','gamer-cheer-wet'].map(loadImage));
      if(run!==loadRun||reset)return;for(const [name,image]of loaded)artwork.set(name,image);
      ready=true;status.hidden=true;resize();syncActive();
    }catch{if(run!==loadRun||reset)return;status.querySelector('span').textContent='The game artwork couldn’t load. Try again.';retry.hidden=false;}
    finally{if(run===loadRun)loading=false;}
  }
  $('.gaming-art-status button').addEventListener('click',loadArtwork);
  window.GamingRoom=Object.freeze({get state(){return model.state},get frame(){return model.frame},get action(){return model.action},get active(){return enabled},get ready(){return ready}});
  updateSound();render();syncActive();
})();
