(() => {
  'use strict';
  const room=document.getElementById('baking-room');
  if(!room||!window.BakingState)return;
  let saved;try{saved=JSON.parse(localStorage.getItem(BakingState.storageKey))}catch{}
  const model=(window.Roomwave ? window.Roomwave.createModel('baking', BakingState.create, saved) : BakingState.create(saved)),artwork=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const actionIds=[...new Set(['finish',...Object.keys(BakingState.actions),'menu:fill','menu:layer','menu:icing','back','newCake'])];
  room.innerHTML=`<div class="baking-ambient" aria-hidden="true"></div><div class="baking-shell">
    <div class="baking-stage"><div class="baking-scene"><img class="baking-kitchen" alt="A cozy sunlit kitchen with a cake stand ready for your creation" draggable="false"><canvas class="baking-decoration" role="img" aria-label="Your cake and baker"></canvas><button type="button" class="baking-work-surface" aria-label="Decorate the cake. Use arrow keys to aim, then Enter to place." aria-describedby="baking-decor-hint" hidden></button></div></div>
    <header class="baking-header"><div class="baking-profile"><span aria-hidden="true">🍰</span><div class="room-heading"><strong class="room-host-name">Hazel</strong><small class="room-type">Baking</small></div><b>LIVE</b></div><button type="button" class="baking-sound" aria-label="Unmute Baking sounds" aria-pressed="false"><svg class="ui-icon" aria-hidden="true"><use href="#icon-muted"/></svg></button></header>
    <div class="baking-bottom"><p class="baking-speech" role="status" aria-live="polite">Let’s make your cake together!</p><section class="baking-gifts" aria-labelledby="baking-gifts-title">
      <div class="baking-tray-heading"><div class="baking-tray-title"><h2 id="baking-gifts-title">Choose your sponge</h2><p class="baking-cake-count" hidden></p><p id="baking-decor-hint" class="baking-decor-hint" hidden>Choose a topping, then tap the cake.</p></div><button type="button" class="baking-finish" hidden><span class="baking-finish-caption">Finish cake</span><span aria-hidden="true"> ↗</span></button><div class="baking-tray-navigation"><button type="button" class="baking-tray-prev" aria-label="Previous choices" aria-controls="baking-gift-tray">‹</button><button type="button" class="baking-tray-next" aria-label="More choices" aria-controls="baking-gift-tray">›</button></div></div>
      <div class="baking-actions" id="baking-gift-tray" role="group" aria-label="Choose what the baker does next" tabindex="0">${actionIds.map(id=>`<button type="button" data-baking-action="${id}" aria-pressed="false" hidden disabled><span aria-hidden="true"></span><b></b></button>`).join('')}<button type="button" class="baking-place" hidden><span aria-hidden="true">＋</span><b>Place for me</b></button></div>
      <div class="baking-decoration-tools" hidden><div class="baking-arrangements" role="group" aria-label="Try an arrangement, then make it your own"><span>Try a look</span><button type="button" class="baking-arrangement-berry">Berry garden</button><button type="button" class="baking-arrangement-party">Birthday</button><button type="button" class="baking-arrangement-chocolate">Choc cherry</button></div><div class="baking-edit-row"><p class="baking-decor-feedback" role="status" aria-live="polite"></p><button type="button" class="baking-undo">↶ Undo</button><button type="button" class="baking-clear">Clear</button></div></div>
    </section></div><div class="baking-art-status" role="status" hidden><span>Getting the kitchen ready…</span><button type="button" hidden>Retry artwork</button></div></div>`;
  const $=selector=>room.querySelector(selector),shell=$('.baking-shell'),stage=$('.baking-stage'),scene=$('.baking-scene'),kitchen=$('.baking-kitchen'),canvas=$('.baking-decoration');
  const controls=[...room.querySelectorAll('[data-baking-action]')],speech=$('.baking-speech'),title=$('#baking-gifts-title');
  const tray=$('.baking-actions'),trayPrev=$('.baking-tray-prev'),trayNext=$('.baking-tray-next');
  const count=$('.baking-cake-count'),trayNavigation=$('.baking-tray-navigation'),bottom=$('.baking-bottom'),header=$('.baking-header');
  const surface=$('.baking-work-surface'),finish=$('.baking-finish'),place=$('.baking-place'),undo=$('.baking-undo'),clear=$('.baking-clear'),decorTools=$('.baking-decoration-tools'),hint=$('.baking-decor-hint'),feedback=$('.baking-decor-feedback');
  const arrangements=['berry','party','chocolate'].map(name=>({name,button:$(`.baking-arrangement-${name}`)}));
  const controlViews=controls.map(button=>({button,label:button.querySelector('b'),icon:button.querySelector('span'),shownIcon:null}));
  let ready=false,loading=false,reset=false,enabled=false,pageSuspended=false,raf=0,lastTime=0,lastSave=0,loadRun=0,sound=false,audioContext,audioEpoch=0,renderer;
  let artWidth=1024,artHeight=1536,sceneWidth=1,sceneHeight=1,cakeScale=1,choiceKey='',presentationKey='';
  let selectedTool='strawberry',aim={x:0,y:0},preview=null,pulse=null,gesture=null,decorMessage='Your cake, your rules.';
  const audioNodes=new Set();
  try{sound=localStorage.getItem('roomwave-baking-sound-v1')==='on'}catch{}
  const assetUrl=(path,run=loadRun)=>`${path}${run>1?`${path.includes('?')?'&':'?'}retry=${run}`:''}`;
  const save=()=>{if(!reset&&!window.Roomwave?.together)try{localStorage.setItem(BakingState.storageKey,JSON.stringify(model.state))}catch{}};
  function silence(){audioEpoch++;for(const node of audioNodes)try{node.stop()}catch{}audioNodes.clear()}
  function play(action){
    if(!sound||!enabled)return;
    const epoch=audioEpoch;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();
      audioContext.resume().then(()=>{if(epoch!==audioEpoch||!sound||!enabled||reset)return;const notes=action==='cake'?[523,659,784]:[659,784];
        notes.forEach((frequency,index)=>{const node=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime+index*.12;
          node.type='sine';node.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035,at+.02);gain.gain.exponentialRampToValueAtTime(.001,at+.25);node.connect(gain);gain.connect(audioContext.destination);node.start(at);node.stop(at+.27);audioNodes.add(node);node.onended=()=>{audioNodes.delete(node);node.disconnect();gain.disconnect()};});}).catch(()=>{});
    }catch{}
  }
  function updateSound(){const button=$('.baking-sound');button.setAttribute('aria-pressed',String(sound));button.setAttribute('aria-label',`${sound?'Mute':'Unmute'} all audio`);button.title='For you in every room';button.querySelector('use').setAttribute('href',sound?'#icon-sound':'#icon-muted')}
  window.UserAudio?.subscribe(value=>{sound=value;updateSound();if(!sound)silence();});
  $('.baking-sound').addEventListener('click',()=>{if(window.UserAudio){window.UserAudio.toggle();return;}model.noteInteraction();sound=!sound;updateSound();render();if(sound)play('choice');else silence();try{localStorage.setItem('roomwave-baking-sound-v1',sound?'on':'off')}catch{}});
  function frameScene(){
    const box=stage.getBoundingClientRect(),wide=shell.clientWidth>shell.clientHeight;
    let scale=(wide?Math.min:Math.max)(box.width/artWidth,box.height/artHeight),center=box.height/2;
    if(!wide){
      const trayTop=bottom.getBoundingClientRect().top-box.top-8,faceFloor=header.getBoundingClientRect().bottom-box.top+12;
      // In the painted camera the cake ends at y1148 and the baker's face is
      // around y330. Keep both between the header and the whole dialogue dock.
      const cakeBottom=1148/1536,faceTop=330/1536,currentHeight=artHeight*scale;
      if(Number.isFinite(trayTop)&&Number.isFinite(faceFloor)&&trayTop>faceFloor&&center+(cakeBottom-.5)*currentHeight>trayTop){
        scale=Math.min(scale,(trayTop-faceFloor)/((cakeBottom-faceTop)*artHeight));
        center=trayTop-(cakeBottom-.5)*artHeight*scale;
      }
    }
    sceneWidth=Math.max(1,artWidth*scale);sceneHeight=Math.max(1,artHeight*scale);
    cakeScale=model.frame.stage==='decorate'?Math.max(1,Math.min(2,box.width*.72/(462*sceneWidth/1024))):1;
    scene.style.width=`${sceneWidth}px`;scene.style.height=`${sceneHeight}px`;scene.style.top=`${center}px`;
    // Keep one undistorted kitchen across the whole frame. The baker and cake
    // retain their hand/food registration while the larger wallpaper crop places
    // its painted stand under the cake instead of exposing a smaller image box.
    const cakeBase=1090/1536,standY=center+(cakeBase-.5)*sceneHeight;
    // When the dialogue dock lifts the cake, the wallpaper needs enough
    // overscan to lift its stand as well, while still filling the whole scene.
    const wallpaperScale=Math.max(box.width/artWidth,box.height/artHeight,(shell.clientWidth-box.width/2)/(artWidth/2),(box.height-standY)/(artHeight*(1-cakeBase))),wallpaperWidth=artWidth*wallpaperScale,wallpaperHeight=artHeight*wallpaperScale;
    const wallpaperTop=Math.max(box.height-wallpaperHeight,Math.min(0,standY-cakeBase*wallpaperHeight));
    shell.style.backgroundSize=`${wallpaperWidth}px ${wallpaperHeight}px`;
    shell.style.backgroundPosition=`${(box.width-wallpaperWidth)/2}px ${wallpaperTop}px`;
    const ratio=Math.min(devicePixelRatio||1,2);
    renderer?.resize(sceneWidth,sceneHeight,ratio,{
      x:(sceneWidth-wallpaperWidth)/2,y:wallpaperTop-center+sceneHeight/2,width:wallpaperWidth,height:wallpaperHeight
    });
  }
  function resize(){frameScene();render();syncTray()}
  function syncTray(){
    const end=Math.max(0,tray.scrollWidth-tray.clientWidth),left=Math.max(0,tray.scrollLeft);
    trayPrev.disabled=left<=1;trayNext.disabled=left>=end-1;
    trayNavigation.hidden=model.frame.stage==='decorate'||end<=1;
  }
  function scrollTray(direction){model.noteInteraction();render();tray.scrollBy({left:direction*tray.clientWidth*.8,behavior:reduced.matches?'instant':'smooth'})}
  function revealChoice(button){
    const start=button.offsetLeft,end=start+button.offsetWidth,left=tray.scrollLeft;
    if(start<left)tray.scrollTo({left:start,behavior:'instant'});else if(end>left+tray.clientWidth)tray.scrollTo({left:end-tray.clientWidth,behavior:'instant'});
  }
  trayPrev.addEventListener('click',()=>scrollTray(-1));trayNext.addEventListener('click',()=>scrollTray(1));
  tray.addEventListener('scroll',syncTray,{passive:true});
  tray.addEventListener('focusin',event=>{const button=event.target.closest?.('[data-baking-action]');if(button&&!button.hidden)revealChoice(button)});
  tray.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();model.noteInteraction();render();
    const choices=controls.filter(button=>!button.hidden&&!button.disabled).sort((a,b)=>Number(a.style.order)-Number(b.style.order)),current=event.target.closest?.('[data-baking-action]'),index=choices.indexOf(current);
    if(!choices.length){if(event.key==='Home'||event.key==='End')tray.scrollTo({left:event.key==='Home'?0:tray.scrollWidth,behavior:'instant'});else scrollTray(event.key==='ArrowLeft'?-1:1);return;}
    const target=event.key==='Home'?0:event.key==='End'?choices.length-1:index<0?(event.key==='ArrowLeft'?choices.length-1:0):Math.max(0,Math.min(choices.length-1,index+(event.key==='ArrowLeft'?-1:1)));
    choices[target].focus({preventScroll:true});revealChoice(choices[target]);
  });
  function describeCake(frame){
    const gestures={apron:'Hazel wipes her hands on her apron.',spoon:'Hazel tastes a little leftover icing from a spoon.',strawberry:'Hazel takes a bite of a strawberry.'};
    const gesture=gestures[frame.ambientAction],suffix=gesture?` ${gesture}`:'';
    if(!frame.layers.length)return `The baker is waiting beside your empty cake stand.${suffix}`;
    const layers=frame.layers.map(layer=>`${layer.flavor} sponge${layer.filling?` with ${layer.filling} filling`:''}`).join(', ');
    const toppings=BakingState.ingredients.filter(name=>frame.decorations[name]>0).map(name=>`${frame.decorations[name]} ${name}`).join(', ');
    return `${frame.completed?'Your finished cake':'Your cake'}: ${layers}.${frame.frosting?` ${frame.frosting==='naked'?'Exposed layers':`${frame.frosting} icing`}.`:''}${toppings?` Decorations: ${toppings}.`:''}${frame.busy?` ${frame.text}`:''}${suffix}`;
  }
  function updateChoiceIcon(view,choice){
    const [kind,name]=choice.id.split(':');
    const key=['sponge','filling','icing'].includes(kind)?`${kind}-${name}`:kind==='decor'?name:null;
    const image=key?artwork.get(key):null,shown=image||choice.icon||'♡';
    if(view.shownIcon===shown)return;
    view.shownIcon=shown;
    if(image){
      // Use the decoded image from our completed artwork load; the renderer can
      // draw this same element while it also appears as the button thumbnail.
      image.alt='';image.draggable=false;view.icon.replaceChildren(image);
    }else view.icon.textContent=shown;
  }
  function render(){
    const frame=model.frame;
    // Animation time changes every frame, but the buttons and accessible copy
    // only change when a choice begins, settles, or the room pauses/resumes.
    const decorating=frame.stage==='decorate';
    const key=[ready,enabled,frame.stage,frame.action,frame.ambientAction,frame.cakes,frame.count,frame.layers.length,frame.frosting,frame.completed,frame.text,selectedTool,decorMessage,frame.canUndo,cakeScale].join('|');
    if(key!==presentationKey){
    presentationKey=key;shell.dataset.action=frame.action||'idle';shell.dataset.step=frame.stage;shell.dataset.ambient=frame.ambientAction||'';
    if(speech.textContent!==frame.text)speech.textContent=frame.text;
    if(title.textContent!==frame.title)title.textContent=frame.title;
    count.hidden=decorating||!frame.cakes;count.textContent=frame.cakes?`${frame.cakes} ${frame.cakes===1?'cake':'cakes'} made together`:'';
    hint.hidden=!decorating;decorTools.hidden=!decorating;finish.hidden=!decorating;place.hidden=!decorating;surface.hidden=!decorating;
    const editable=ready&&enabled&&decorating&&!frame.busy;
    finish.disabled=!ready||!enabled||!model.canStart('finish');
    $('.baking-finish-caption').textContent=frame.action==='finish'?'Presenting…':'Finish cake';
    undo.disabled=!editable||!frame.canUndo;clear.disabled=!editable||!frame.count;
    place.disabled=!editable||!model.canPlaceDecoration(selectedTool);surface.disabled=place.disabled;
    arrangements.forEach(({button})=>{button.disabled=!editable});
    hint.textContent=['cream','sprinkles'].includes(selectedTool)?'Tap or drag on the cake to decorate.':selectedTool==='chocolate'?'Tap the cake to add a chocolate drip.':'Choose a topping, then tap the cake.';
    feedback.textContent=decorMessage;
    if(decorating){
      const geo=BakingCakeRenderer.surface(frame.layers,cakeScale);
      surface.style.left=`${(geo.cx-geo.rx)/1024*100}%`;surface.style.top=`${geo.cy/1536*100}%`;
      surface.style.width=`${geo.rx*2/1024*100}%`;surface.style.height=`${geo.ry*2/1536*100}%`;
    }
    const available=new Map(frame.choices.map((choice,index)=>[choice.id,{...choice,index}]));
    const nextChoices=frame.choices.map(choice=>choice.id).join('|'),changed=nextChoices!==choiceKey;
    for(const view of controlViews){
      const button=view.button;
      const id=button.dataset.bakingAction,choice=available.get(id),tool=id.startsWith('decor:');button.hidden=!choice||(decorating&&id==='finish');button.disabled=!ready||!enabled||!choice||(decorating&&tool?frame.busy||!model.canPlaceDecoration(id.slice(6)):!model.canStart(id));
      button.setAttribute('aria-pressed',String(decorating&&tool?selectedTool===id.slice(6):frame.action===id));
      if(choice){button.style.order=String(choice.index);view.label.textContent=choice.label;updateChoiceIcon(view,choice);button.setAttribute('aria-label',decorating&&tool?`${choice.label}. Select topping.`:choice.detail?`${choice.label}. ${choice.detail}`:choice.label)}
    }
    tray.setAttribute('aria-busy',String(frame.busy));tray.setAttribute('aria-label',frame.title);
    if(changed){choiceKey=nextChoices;tray.scrollTo({left:0,behavior:'instant'});if([...controls,finish,place,surface].includes(document.activeElement)&&document.activeElement.hidden){const next=controls.find(button=>!button.hidden&&!button.disabled);(next||tray).focus({preventScroll:true})}syncTray();frameScene()}
    canvas.setAttribute('aria-label',describeCake(frame));
    }
    if(ready)renderer?.draw({...frame,cakeScale,reducedMotion:reduced.matches,decorationEditing:decorating&&!frame.busy,decorationPreview:decorating&&!frame.busy?preview:null,decorationPulse:pulse&&frame.clock-pulse.at<450?{...pulse,progress:(frame.clock-pulse.at)/450}:null});
  }
  function endGesture(){
    const pointer=gesture?.id;gesture=null;model.endDecorationGesture();
    if(pointer!==undefined&&surface.hasPointerCapture?.(pointer))surface.releasePointerCapture(pointer);
  }
  function act(action){
    if(!ready||!enabled)return;endGesture();if(!model.start(action))return;
    preview=null;pulse=null;if(action==='newCake'){silence();decorMessage='Your cake, your rules.';selectedTool='strawberry'}else if(model.frame.busy)play(action);render();save();
  }
  function canDecorate(){return ready&&enabled&&model.frame.stage==='decorate'&&!model.frame.busy}
  function selectedLabel(){return controls.find(button=>button.dataset.bakingAction===`decor:${selectedTool}`)?.querySelector('b').textContent||selectedTool}
  function placeAt(point,quiet=false){
    if(!canDecorate()||!model.placeDecoration(selectedTool,point.x,point.y))return false;
    aim={...point};pulse={...point,at:model.frame.clock};
    decorMessage=model.canPlaceDecoration(selectedTool)?`${selectedLabel()} ${window.Roomwave?.together?'sent':'placed'}. Keep creating!`:window.Roomwave?.together?'Room for this topping is full. Try another.':'Room for this topping is full. Try another or Undo.';
    if(!model.canPlaceDecoration(selectedTool)){endGesture();preview=null}
    if(!quiet)play('choice');render();save();return true;
  }
  controls.forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.bakingAction;
    if(action.startsWith('decor:')){
      if(!canDecorate()||!model.canPlaceDecoration(action.slice(6)))return;
      model.noteInteraction();endGesture();selectedTool=action.slice(6);preview=null;decorMessage=`${selectedLabel()} ready. Tap the cake or Place for me.`;render();
    }else act(action);
  }));
  finish.addEventListener('click',()=>act('finish'));
  place.addEventListener('click',()=>{
    endGesture();const n=model.frame.count,angle=n*2.3999632297,r=n?Math.sqrt((n%12+1)/14)*.84:0;
    placeAt({x:Math.cos(angle)*r,y:Math.sin(angle)*r});
  });
  function editDecoration(method,message){if(!canDecorate())return;endGesture();if(!method())return;preview=null;pulse=null;decorMessage=message;render();save()}
  undo.addEventListener('click',()=>editDecoration(()=>model.undoDecoration(),'Last touch undone. Try something new.'));
  clear.addEventListener('click',()=>editDecoration(()=>model.clearDecorations(),'A fresh canvas. Undo brings it all back.'));
  arrangements.forEach(({name,button})=>button.addEventListener('click',()=>editDecoration(()=>model.applyArrangement(name),'A little inspiration. Add your own finishing touches!')));
  const onCake=point=>{const length=Math.hypot(point.x,point.y),scale=length>.98?.98/length:1;return {x:point.x*scale,y:point.y*scale}};
  function pointerPoint(event){const box=surface.getBoundingClientRect();return onCake({x:(event.clientX-box.left)/box.width*2-1,y:(event.clientY-box.top)/box.height*2-1})}
  surface.addEventListener('pointerdown',event=>{
    if(!canDecorate()||gesture||event.isPrimary===false||(event.button!==undefined&&event.button!==0))return;
    event.preventDefault();const point=pointerPoint(event);model.beginDecorationGesture();gesture={id:event.pointerId,last:point};surface.setPointerCapture?.(event.pointerId);
    preview={key:selectedTool,...point};placeAt(point);
  });
  surface.addEventListener('pointermove',event=>{
    if(!canDecorate()||(gesture&&gesture.id!==event.pointerId))return;
    model.noteInteraction();
    const box=surface.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.left+box.width||event.clientY<box.top||event.clientY>box.top+box.height){preview=null;return}
    const point=pointerPoint(event);preview={key:selectedTool,...point};
    if(gesture&&['cream','sprinkles'].includes(selectedTool)&&Math.hypot(point.x-gesture.last.x,(point.y-gesture.last.y)*.55)>.19){gesture.last=point;placeAt(point,true)}
  });
  function releaseGesture(event){if(gesture&&event.pointerId===gesture.id){endGesture();preview=null;render();save()}}
  for(const type of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(type,releaseGesture);
  surface.addEventListener('pointerleave',()=>{if(!gesture){preview=null;render()}});
  surface.addEventListener('focus',()=>{if(canDecorate()){model.noteInteraction();preview={key:selectedTool,...aim};render()}});
  surface.addEventListener('blur',()=>{preview=null;render()});
  surface.addEventListener('click',event=>{if(event.detail===0&&canDecorate())placeAt(aim)});
  surface.addEventListener('keydown',event=>{
    if(!canDecorate()||event.altKey||event.ctrlKey||event.metaKey)return;
    const directions={ArrowLeft:[-.16,0],ArrowRight:[.16,0],ArrowUp:[0,-.16],ArrowDown:[0,.16]};
    if(directions[event.key]){event.preventDefault();model.noteInteraction();const [x,y]=directions[event.key];aim=onCake({x:aim.x+x,y:aim.y+y});preview={key:selectedTool,...aim};render()}
    else if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat){endGesture();placeAt(aim)}}
  });
  function tick(time){raf=0;if(!enabled)return;const events=model.tick(lastTime?time-lastTime:0);lastTime=time;render();if(events.includes('cake'))play('cake');if(events.includes('complete')||time-lastSave>5000){save();lastSave=time}raf=requestAnimationFrame(tick)}
  function syncActive(){
    const selected=!reset&&!pageSuspended&&window.LiveRooms?.activeRoom==='baking'&&!document.hidden;
    if(selected&&!ready&&!loading&&!loadRun)loadArtwork();
    const next=selected&&ready;shell.classList.toggle('is-paused',!next);
    if(next===enabled){render();return}if(!next){endGesture();preview=null;pulse=null}enabled=next;model.setActive(next);lastTime=0;
    if(next){resize();raf=requestAnimationFrame(tick)}else{cancelAnimationFrame(raf);raf=0;silence();save()}render();
  }
  function loadImage(name,path,run){return new Promise((resolve,reject)=>{const image=new Image();let settled=false;const finish=error=>{if(settled)return;settled=true;clearTimeout(timeout);image.onload=image.onerror=null;if(error)reject(error);else resolve([name,image])};const timeout=setTimeout(()=>finish(new Error('Artwork timed out')),12000);image.onload=()=>finish();image.onerror=()=>finish(new Error('Artwork unavailable'));image.src=assetUrl(path,run);if(image.complete&&image.naturalWidth)finish()})}
  async function loadArtwork(){
    if(loading||reset)return;loading=true;const run=++loadRun,status=$('.baking-art-status'),retry=status.querySelector('button');status.hidden=false;retry.hidden=true;status.querySelector('span').textContent='Getting the kitchen ready…';
    try{
      if(!window.BakingArt?.assets||!window.BakingCakeRenderer)throw new Error('Cake artwork unavailable');
      const assets=await Promise.all(Object.entries(BakingArt.assets).map(([name,path])=>loadImage(name,path,run)));
      if(reset||run!==loadRun)return;
      assets.forEach(([name,image])=>artwork.set(name,image));
      artWidth=artwork.get('kitchen').naturalWidth;artHeight=artwork.get('kitchen').naturalHeight;kitchen.src=assetUrl(BakingArt.assets.kitchen,run);
      renderer ||= BakingCakeRenderer.create({canvas,scene,artwork,drawCounter:false});ready=true;status.hidden=true;resize();syncActive();
    }catch{if(reset||run!==loadRun)return;status.querySelector('span').textContent='The kitchen artwork couldn’t load.';retry.hidden=false}
    finally{if(run===loadRun)loading=false}
  }
  $('.baking-art-status button').addEventListener('click',loadArtwork);
  window.addEventListener('live-room-change',syncActive);document.addEventListener('visibilitychange',syncActive);
  window.addEventListener('pageshow',()=>{pageSuspended=false;syncActive()});
  window.addEventListener('pagehide',()=>{pageSuspended=true;syncActive();save()});
  window.addEventListener('stream:resetting',()=>{reset=true;endGesture();preview=null;pulse=null;ready=false;enabled=false;loadRun++;model.setActive(false);model.cancelPending();cancelAnimationFrame(raf);raf=0;silence();renderer?.destroy?.();render()});
  new ResizeObserver(resize).observe(stage);new ResizeObserver(resize).observe(bottom);new ResizeObserver(syncTray).observe(tray);reduced.addEventListener?.('change',render);
  window.BakingRoom=Object.freeze({get state(){return model.state},get frame(){return model.frame},get active(){return enabled},get ready(){return ready}});
  updateSound();render();syncActive();
})();
