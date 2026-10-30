'use strict';

// Every frame is one complete painted figure, including its expression.
(() => {
  const instances=new Map();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const portraitMedia=matchMedia('(orientation: portrait)');
  const emotionNames={excited:'happy',laughing:'laugh',embarrassed:'blush',downcast:'sad',annoyed:'angry',hopeful:'neutral'};
  const poseNames={plead:'kneeling',bent:'bow',action01:'gesturePrepare',danceLeft:'dance1',danceRight:'dance2'};
  const attrs=(node,values)=>Object.entries(values).forEach(([key,value])=>node.setAttribute(key,value));
  const stateFor=character=>instances.get(character?.root);
  // Keep decoded sheets alive and share requests between poses and characters.
  // Failed sheets stay failed until an explicit retry or the next online event;
  // frequent expression changes must not create an endless request loop.
  const atlasCache=new Map();
  let retrySequence=0;
  const retryURL=url=>{
    const [base,hash]=url.split('#');
    return `${base}${base.includes('?')?'&':'?'}sprite_retry=${++retrySequence}${hash?`#${hash}`:''}`;
  };
  const notifyLoading=()=>instances.forEach(sprite=>sprite.reportLoading());
  function loadAtlas(url,retry=false) {
    const cached=atlasCache.get(url);
    if(cached&&!(retry&&cached.status==='error'))return cached;
    const entry={status:'loading',image:null,url,attempts:0,promise:null};
    atlasCache.set(url,entry);
    entry.promise=new Promise(resolve=>{
      const attempt=()=>{
        const image=new Image();
        entry.image=image;entry.attempts++;
        entry.url=entry.attempts===1&&!cached?url:retryURL(url);
        let settled=false;
        const finish=error=>{
          if(settled)return;
          settled=true;clearTimeout(timeout);image.onload=null;image.onerror=null;
          if(error&&entry.attempts<3){setTimeout(attempt,entry.attempts*350);return;}
          entry.status=error?'error':'ready';
          resolve(entry);notifyLoading();
        };
        const timeout=setTimeout(()=>finish(true),8000);
        image.onload=()=>{
          if(!image.naturalWidth){finish(true);return;}
          // decode() prevents the first use of a newly downloaded sheet from
          // replacing a visible figure before its pixels can be painted.
          try{Promise.resolve(image.decode?.()).then(()=>finish(false),()=>finish(true));}
          catch{finish(true);}
        };
        image.onerror=()=>finish(true);
        image.src=entry.url;
      };
      attempt();
    });
    notifyLoading();
    return entry;
  }

  class CharacterSprite {
    constructor(root,id) {
      Object.assign(this,{root,id,data:window.outfitSpriteData?.[id]?.weekend||window.duoSpriteData.characters[id],pose:'idle',emotion:'happy',flip:false,countdown:null,danceIndex:id==='mia'?1:0,blinkTimer:0,blinkEnd:0,expressionTimer:0,drawRequest:0});
      root.dataset.outfit=window.outfitSpriteData?.[id]?.weekend?'weekend':'casual';
      const tag=root.querySelector('.name-tag').outerHTML;
      root.classList.add('illustrated-character','full-pose-character');
      root.innerHTML=`<g class="positioner"><g class="mover"><g class="rig"><g class="pose-motion">
        <g class="pose-drawing"><svg class="full-body-art" preserveAspectRatio="xMidYMid meet" overflow="hidden"><defs><clipPath id="${id}-frame-clip" clipPathUnits="userSpaceOnUse"><polygon/></clipPath></defs><image/></svg></g>
        <g class="pose-anchor"><rect class="head" x="-34" y="-55" width="68" height="82" fill="transparent" stroke="none"/>
          <g class="sunglasses-overlay" aria-hidden="true"><path class="pixel-frame" d="M-33-8H33V0H29V9H25V14H9V10H5V2H-5V10H-9V14H-25V9H-29V0H-33Z"/><path class="pixel-rim" d="M-32-8H32M-29 0V8M29 0V8"/><path class="pixel-glint" d="M-25-4H-19V2H-25ZM-19 2H-13V8H-19ZM13-4H19V2H13ZM19 2H25V8H19Z"/></g>
          <g class="kneeling-tears" aria-hidden="true"><path class="tear tear-left" d="M-17 5C-18 9-22 14-22 18A5 5 0 0 0-12 18C-12 14-16 9-17 5Z"/><path class="tear tear-right" d="M17 5C16 9 12 14 12 18A5 5 0 0 0 22 18C22 14 18 9 17 5Z"/></g>
          <g class="duck-crown" aria-hidden="true"></g>
        </g></g>
        <g class="animation-compatibility" visibility="hidden" aria-hidden="true">
          <g class="upper-leg left"><g class="lower-leg left"></g></g><g class="upper-leg right"><g class="lower-leg right"></g></g>
          <g class="hip-bender"><g class="head-group"></g><g class="back-hair"></g><g class="torso"></g>
            <g class="upper-arm left"><g class="lower-arm left"></g></g><g class="upper-arm right"><g class="lower-arm right"></g></g>
          </g>
        </g></g></g>${tag}</g>`;
      this.body=root.querySelector('.full-body-art');
      this.image=this.body.querySelector('image');
      this.frameClip=this.body.querySelector('polygon');
      this.drawing=root.querySelector('.pose-drawing');
      this.head=root.querySelector('.pose-anchor');
    }
    loadingStatus() {
      const sheets=[...new Set(Object.values(this.data.atlases).map(atlas=>atlas.url))];
      const failed=sheets.filter(url=>atlasCache.get(url)?.status==='error').length;
      const loading=sheets.filter(url=>!['ready','error'].includes(atlasCache.get(url)?.status)).length;
      return {character:this.id,status:failed?'error':loading?'loading':'ready',loading,failed};
    }
    reportLoading() {
      const detail=this.loadingStatus(),signature=JSON.stringify(detail);
      this.root.dataset.spriteState=detail.status;
      if(signature===this.loadingSignature)return;
      this.loadingSignature=signature;
      window.dispatchEvent(new CustomEvent('charactersprites:loading',{detail}));
    }
    prewarm() {
      // Only the equipped costume is warmed, not the whole shop catalog.
      Object.values(this.data.atlases).forEach(atlas=>loadAtlas(atlas.url));
      this.reportLoading();
    }
    frameFor(blink=false) {
      const family=this.data.poses[this.pose];
      const expression=this.pose==='kneeling'&&this.countdown?.crying?'crying':blink?'blink':this.emotion;
      const name=family.variants?.[expression]||family.default;
      return {name,frame:this.data.frames[name],expression};
    }
    setOutfit(outfit) {
      const data=outfit==='casual'?window.duoSpriteData.characters[this.id]:window.outfitSpriteData?.[this.id]?.[outfit];
      if(!data)return false;
      this.data=data;if(!data.poses[this.pose])this.pose='idle';this.root.dataset.outfit=outfit;this.draw();this.prewarm();return true;
    }
    draw(blink=false) {
      const {name,frame,expression}=this.frameFor(blink);
      const atlas=this.data.atlases[frame.atlas];
      const request=++this.drawRequest;
      const entry=loadAtlas(atlas.url);
      const paint=()=>{
        if(request!==this.drawRequest||entry.status!=='ready')return;
        this.paintFrame({name,frame,expression,atlas,url:entry.url});
      };
      if(entry.status==='ready')paint();
      else if(entry.status==='loading')entry.promise.then(paint);
      this.reportLoading();
    }
    paintFrame({name,frame,expression,atlas,url}) {
      const [x,y,w,h]=frame.crop;
      const scale=frame.scale;
      const [anchor,ground]=frame.ground;
      const horizontal=(this.flip?-1:1)*(frame.mirror?-1:1);
      let inset=0;
      if((window.streamRoomLayout?.portrait.matches??portraitMedia.matches)&&['idle','dance1','dance2','heart','heartLow','wave','yoga'].includes(this.pose)){
        const base=Number(this.root.dataset.stageX)||({lily:300,stella:300,mia:500}[this.id]||400);
        const framing=1.4;
        const edges=[(x-anchor)*scale*horizontal,(x+w-anchor)*scale*horizontal];
        const minimum=(210-base)/framing-Math.min(...edges);
        const maximum=(590-base)/framing-Math.max(...edges);
        inset=Math.max(minimum,Math.min(0,maximum));
      }
      // Commit the image and its crop together. While loading, the previous
      // complete frame stays visible; late requests cannot restore old poses.
      if(this.image.getAttribute('href')!==url)this.image.setAttribute('href',url);
      attrs(this.image,{width:atlas.width,height:atlas.height});
      // Some native atlases need an irregular crop to exclude a neighboring pose.
      attrs(this.frameClip,{points:frame.clipPolygon?.map(p=>p.join(',')).join(' ')||''});
      attrs(this.image,{'clip-path':frame.clipPolygon?`url(#${this.id}-frame-clip)`:'none'});
      attrs(this.body,{viewBox:frame.crop.join(' '),x:(x-anchor)*scale,y:250-(ground-y)*scale,width:w*scale,height:h*scale});
      this.drawing.setAttribute('transform',`${inset?`translate(${inset} 0) `:''}scale(${horizontal} 1)`);
      const [eyeX,eyeY]=frame.eyesCenter;
      const headScale=frame.faceWidth*scale/62;
      this.head.setAttribute('transform',`translate(${inset+(eyeX-anchor)*scale*horizontal} ${250-(ground-eyeY)*scale}) rotate(${(frame.eyeAngle||0)*horizontal}) scale(${headScale})`);
      Object.assign(this.root.dataset,{pose:this.pose,frame:name,expression,facing:this.flip?'left':'right'});
    }
    scheduleBlink() {
      clearTimeout(this.blinkTimer);clearTimeout(this.blinkEnd);
      // No automatic full-figure blink swaps: they change the silhouette.
    }
    hold(pose,motion=pose,flip=false) {
      clearTimeout(this.blinkEnd);
      this.pose=this.data.poses[pose]?pose:'idle';this.flip=flip;
      this.root.dataset.motion=motion;this.draw();
    }
    clearCountdown(){(window.streamRoomClock?.clearTimeout||clearTimeout)(this.expressionTimer);this.expressionTimer=0;this.countdown=null;}
    setPose(name,flip=false) {
      this.clearCountdown();
      const reaction={sad:'sad',downcast:'sad',angry:'angry',surprised:'surprised',celebrate:'happy'}[name];
      if(reaction)this.emotion=reaction;
      if(this.root.classList.contains('rescue-closeup')&&['plead','celebrate','surprised','angry','sad','downcast'].includes(name))this.hold('kneeling',name,flip);
      else this.hold(poseNames[name]||(name==='celebrate'?'heart':reaction?'idle':name),name,flip);
    }
    expression(name) {
      this.emotion=emotionNames[name]||name;clearTimeout(this.blinkEnd);this.draw();
      if(this.countdown) {
        (window.streamRoomClock?.clearTimeout||clearTimeout)(this.expressionTimer);
        this.expressionTimer=(window.streamRoomClock?.setTimeout||setTimeout)(()=>{
          this.expressionTimer=0;
          if(!this.countdown)return;
          this.emotion='worried';this.draw();
        },name==='crying'?1550:['happy','excited','relieved'].includes(name)?1300:1000);
      }
    }
    startCountdown(balance=0){this.clearCountdown();this.countdown={urgent:false,crying:balance<-1000};this.emotion='worried';this.hold('kneeling','countdown');}
    updateCountdown(remaining,balance){
      if(!this.countdown)return;
      let redraw=false;
      const crying=remaining>0&&(Number.isFinite(balance)?balance<-1000:this.countdown.crying);
      if(crying!==this.countdown.crying){this.countdown.crying=crying;redraw=true;}
      if(!this.countdown.urgent&&remaining<=3){
        this.countdown.urgent=true;
        if(!this.expressionTimer){this.emotion='worried';redraw=true;}
      }
      if(redraw)this.draw();
    }
    penaltyPhase(role,phase,flip) {
      this.clearCountdown();this.emotion=role==='actor'?'angry':phase==='impact'?'surprised':'sad';
      this.hold(role==='actor'?phase==='impact'?'gestureExtend':'gesturePrepare':'bow',`penalty-${role}-${phase}`,flip);
    }
    point(poseName,landmark,flip=false) {
      const frame=this.data.frames[this.data.poses[poseName].default],point=frame[landmark];
      return [(point[0]-frame.ground[0])*frame.scale*(flip?-1:1)*(frame.mirror?-1:1),250-(frame.ground[1]-point[1])*frame.scale];
    }
    reset(){this.clearCountdown();clearTimeout(this.blinkEnd);this.emotion='happy';this.hold('idle');this.scheduleBlink();}
  }
  window.installCharacterSprite=(root,id)=>{
    const sprite=new CharacterSprite(root,id);instances.set(root,sprite);sprite.draw();sprite.prewarm();
  };
  function retryLoading() {
    instances.forEach(sprite=>Object.values(sprite.data.atlases).forEach(atlas=>loadAtlas(atlas.url,true)));
    instances.forEach(sprite=>{sprite.draw();sprite.reportLoading();});
  }
  function uprightRescueLayout(character,portrait,viewport) {
    const state=stateFor(character),family=state?.data.poses.kneeling;
    if(!family||!viewport)return null;
    const idle=state.data.frames[state.data.poses.idle.default];
    const frames=[...new Set([family.default,...Object.values(family.variants||{})])].map(name=>state.data.frames[name]);
    // Existing waiting poses are seated. Some outfits instead use standing
    // reactions, which need their own measured fit rather than the seated zoom.
    if(Math.max(...frames.map(frame=>frame.crop[3]*frame.scale))<idle.crop[3]*idle.scale*.9)return null;
    const bounds={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};
    for(const frame of frames){
      const [x,y,w,h]=frame.crop,[anchor,ground]=frame.ground;
      const xs=[x,x+w].map(value=>(value-anchor)*frame.scale);
      const ys=[y,y+h].map(value=>250+(value-ground)*frame.scale);
      bounds.left=Math.min(bounds.left,...xs);bounds.right=Math.max(bounds.right,...xs);
      bounds.top=Math.min(bounds.top,...ys);bounds.bottom=Math.max(bounds.bottom,...ys);
    }
    const framing=portrait?1.4:1;
    // Include room for the duck crown above the complete painted figure.
    bounds.top-=24;
    const halfWidth=Math.max(Math.abs(bounds.left),Math.abs(bounds.right));
    const scale=Math.min(1.55,(viewport.bottom-viewport.top)/((bounds.bottom-bounds.top)*framing),
      Math.min(400-viewport.left,viewport.right-400)/(halfWidth*framing));
    if(!(scale>0))return null;
    // The two nested scales use different origins: positioner y=130 and
    // portrait cast framing y=250. Keep the lowest pixel on the fitted baseline.
    const offsetY=viewport.bottom-290-scale*(120+(bounds.bottom-250)*framing);
    return {scale,offsetY,bounds,framing};
  }
  function penaltyLayout(actor,receiver,portrait=false,viewport=null) {
    const actorState=stateFor(actor),receiverState=stateFor(receiver);
    const actorOnLeft=actor.baseX<receiver.baseX;
    const actorFlip=!actorOnLeft,receiverFlip=actorOnLeft;
    const palm=actorState.point('gestureExtend','contact',actorFlip);
    const rear=receiverState.point('bow','contact',receiverFlip);
    const framing=portrait?1.4:1;
    const bounds=[Infinity,Infinity,-Infinity,-Infinity];
    for(const [state,poseNames,point,flip]of [[actorState,['gesturePrepare','gestureExtend'],palm,actorFlip],[receiverState,['bow'],rear,receiverFlip]]){
      for(const name of poseNames){
        const f=state.data.frames[state.data.poses[name].default];
        const [x,y,w,h]=f.crop;
        const xs=[x,x+w].map(v=>(v-f.ground[0])*f.scale*(flip?-1:1)*(f.mirror?-1:1)-point[0]);
        const ys=[y,y+h].map(v=>250+(v-f.ground[1])*f.scale-point[1]);
        bounds[0]=Math.min(bounds[0],...xs);bounds[1]=Math.min(bounds[1],...ys);
        bounds[2]=Math.max(bounds[2],...xs);bounds[3]=Math.max(bounds[3],...ys);
      }
    }
    // Fit the complete animation into the visible camera, including the space
    // outside the nominal viewBox when the SVG is letterboxed on short screens.
    const frame=viewport||{left:portrait?200:0,right:portrait?600:800,top:portrait?15:75,bottom:440};
    const scale=Math.min(portrait?1:1.25,(frame.right-frame.left)/((bounds[2]-bounds[0])*framing),(frame.bottom-frame.top)/((bounds[3]-bounds[1])*framing));
    const contact=[(frame.left+frame.right)/2-(bounds[0]+bounds[2])*framing*scale/2,frame.bottom-bounds[3]*framing*scale];
    const transform=(character,point)=>{
      const x=contact[0]-character.baseX-point[0]*framing*scale;
      // The controller's positioner scales around y=130; portrait framing
      // scales around the feet at y=250. Include both origins in placement.
      const y=contact[1]-160-130-scale*(120+(point[1]-250)*framing);
      return `translate(${x}px, ${y}px) scale(${scale})`;
    };
    return {actorTransform:transform(actor,palm),receiverTransform:transform(receiver,rear),contact,scale,framing,actorFlip,receiverFlip};
  }
  window.characterSprites={
    retryLoading,
    refreshLayout:c=>stateFor(c)?.draw(),
    getLoadingStatus:()=>[...instances.values()].map(sprite=>sprite.loadingStatus()),
    setOutfit:(c,outfit)=>stateFor(c)?.setOutfit(outfit),
    setPose:(c,name,flip=false)=>stateFor(c)?.setPose(name,flip),
    expression:(c,name)=>stateFor(c)?.expression(name),reset:c=>stateFor(c)?.reset(),
    startCountdown:(c,balance)=>stateFor(c)?.startCountdown(balance),updateCountdown:(c,n,balance)=>stateFor(c)?.updateCountdown(n,balance),
    penaltyPhase:(c,role,phase,duration,flip=false)=>stateFor(c)?.penaltyPhase(role,phase,flip),
    contactPoint:(c,pose,flip=false)=>stateFor(c)?.point(pose,'contact',flip),
    penaltyLayout,
    uprightRescueLayout,
    startWave(c){const s=stateFor(c);if(s){s.clearCountdown();s.hold('wave');}},
    startHeart(c,low=false){const s=stateFor(c);if(s){s.clearCountdown();s.hold(low?'heartLow':'heart');}},
    startDance(c){const s=stateFor(c);if(s){s.clearCountdown();if(s.data.poses.yoga)s.hold('yoga','yoga');else s.hold(s.danceIndex++%2?'dance2':'dance1','dance');}}
  };
  reducedMotion.addEventListener('change',()=>instances.forEach(s=>{s.draw();s.scheduleBlink();}));
  portraitMedia.addEventListener('change',()=>instances.forEach(s=>s.draw()));
  window.addEventListener('online',retryLoading);
  window.addEventListener('pagehide',()=>instances.forEach(s=>{clearTimeout(s.blinkTimer);clearTimeout(s.blinkEnd);s.clearCountdown();}));
})();
