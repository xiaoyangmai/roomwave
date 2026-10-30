/* Independent room, chair, and native-alpha painted character sprites. No image deformation. */
(() => {
  'use strict';
  const anchors = {
    hair: [.40,.15], 'headphone-left': [.365,.087], 'headphone-right': [.59,.066],
    bangs: [.55,.196], 'shoulder-left': [.31,.366], 'shoulder-right': [.714,.368],
    shirt: [.56,.449], hand: [.62,.557], cheek: [.563,.241]
  };
  const limit = n => Math.max(0,Math.min(1,n));
  const foamSprites = new Map();
  function paintFoam(ctx,x,y,size,seed,alpha) {
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
    // An opaque fluffy core keeps overlapping deposits dense; tiny bubbles soften its edge.
    ctx.fillStyle='#f1f4fa';ctx.beginPath();ctx.ellipse(0,0,size*.82,size*.65,0,0,Math.PI*2);ctx.fill();
    // Dense overlapping micro-bubbles form shaded, opaque foam, not floating rings.
    for(let j=0;j<26;j++) {
      const angle=j*2.399+seed, radius=Math.sqrt(j/26)*size*.71;
      const px=Math.cos(angle)*radius,py=Math.sin(angle)*radius*.64,r=size*(.18+(j*7%11)/90);
      const g=ctx.createRadialGradient(px-r*.3,py-r*.4,r*.05,px,py,r);
      g.addColorStop(0,'#fff');g.addColorStop(.48,'#fffefa');g.addColorStop(.8,'#e3e6f2');g.addColorStop(1,'rgba(209,216,239,.23)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function foam(ctx,x,y,size,seed,alpha) {
    const key=Math.round(seed*100)%8;
    if(!foamSprites.has(key)) {
      const tile=typeof OffscreenCanvas==='function'?new OffscreenCanvas(128,128):document.createElement('canvas');
      tile.width=tile.height=128;
      paintFoam(tile.getContext('2d'),64,64,49,key*.71,1);foamSprites.set(key,tile);
    }
    ctx.save();ctx.globalAlpha=alpha;const side=size*128/49;
    ctx.drawImage(foamSprites.get(key),x-side/2,y-side/2,side,side);ctx.restore();
  }
  const depositAnchors=['hair','headphone-left','headphone-right','shoulder-left','shoulder-right','shirt','skirt','hand-left','hand-right'];
  let foamLayout;
  function smooth(value) { value=limit(value);return value*value*(3-2*value); }
  function depositLayout(width,height,w,h,ox) {
    if(foamLayout?.width===width&&foamLayout?.height===height)return foamLayout;
    const registry=window.GamingSeatedSprites,base=registry.frames.idle.anchors;
    const origins=depositAnchors.map(anchor=>({anchor,x:ox+base[anchor][0]*w,y:base[anchor][1]*h,reach:1}));
    // A bounded field of small clumps, each grown from its nearest actual hit point.
    // The grid only distributes texture: its tiles appear radially, never as a rising plane.
    const step=Math.max(12,Math.min(width,height)*.045,Math.max(width,height)/48),cells=[];
    let id=0;
    for(let row=-2;row<=Math.ceil(height/(step*.78))+2;row++)for(let col=-2;col<=Math.ceil(width/step)+2;col++) {
      const seed=id++;
      const x=(col+(row%2)*.5)*step+((seed*17%13)/12-.5)*step*.09;
      const y=row*step*.78+((seed*29%11)/10-.5)*step*.09;
      let owner=origins[0],distance=Infinity;
      for(const origin of origins){const next=Math.hypot(x-origin.x,y-origin.y);if(next<distance){owner=origin;distance=next;}}
      owner.reach=Math.max(owner.reach,distance);
      cells.push({id:seed,x,y,owner,distance});
    }
    for(const origin of origins)cells.push({id:id++,x:origin.x,y:origin.y,owner:origin,distance:0});
    for(const cell of cells) {
      cell.threshold=.04+.86*Math.pow(cell.distance/cell.owner.reach,.65);
      const faceDistance=Math.hypot((cell.x-ox-w*.48)/(w*.115),(cell.y-h*.255)/(h*.088));
      // Ordinary spray lands around her face. Only a nearly complete coating spreads over it.
      if(faceDistance<1.15)cell.threshold=Math.max(cell.threshold,.77+.12*(1-limit(faceDistance/1.15)));
    }
    return foamLayout={width,height,step,cells,base};
  }
  function deposits(ctx,width,height,w,h,ox,from,pose,mix,levels) {
    if(!levels||!depositAnchors.some(anchor=>levels[anchor]>.001))return;
    const registry=window.GamingSeatedSprites,layout=depositLayout(width,height,w,h,ox);
    const before=(registry.frames[from]||registry.frames.idle).anchors,after=(registry.frames[pose]||registry.frames.idle).anchors;
    const changes={};
    for(const anchor of depositAnchors) {
      const amount=limit(levels[anchor]||0),a=before[anchor]||layout.base[anchor],b=after[anchor]||layout.base[anchor];
      // Small attached patches follow her hands. Once merged into a camera-wide
      // coating, the outer foam is supported by the surrounding foam instead.
      const attached=1-smooth((amount-.65)/.30);
      changes[anchor]={amount,x:(a[0]+(b[0]-a[0])*mix-layout.base[anchor][0])*w*attached,y:(a[1]+(b[1]-a[1])*mix-layout.base[anchor][1])*h*attached};
    }
    for(const cell of layout.cells) {
      const change=changes[cell.owner.anchor],growth=smooth((change.amount-cell.threshold)/.065);
      if(growth<=.001)continue;
      const size=layout.step*(1.13+(cell.id%5)*.018);
      foam(ctx,cell.x-ox+change.x,cell.y+change.y,size,cell.id*.71,growth);
    }
  }
  let characterLayer;
  function paintCharacter(ctx,artwork,pose,from,mix,wetness,w,h) {
    const registry=window.GamingSeatedSprites;
    if(!characterLayer) {
      characterLayer=typeof OffscreenCanvas==='function'?new OffscreenCanvas(810,1080):document.createElement('canvas');
      characterLayer.width=810;characterLayer.height=1080;
    }
    const target=characterLayer.getContext('2d');target.clearRect(0,0,810,1080);
    // Only the brief pose transitions dissolve. Material drawings have slightly
    // different contours, so mixing them leaves a doubled face throughout drying.
    target.globalCompositeOperation='lighter';
    function paint(name,opacity) {
      if(opacity<=0)return;
      const stages=registry.materials[name]||registry.materials.idle,wet=limit(wetness);
      // Keep a single spray visibly damp until it dries completely; repeated
      // sprays select the soaked drawing once most of the water has accumulated.
      const asset=stages.damp&&stages.wet?(wet===0?stages.dry:wet<.725?stages.damp:stages.wet):stages.wet&&wet>=.5?stages.wet:stages.dry;
      const image=artwork.get(asset);if(!image)return;
      const registration=registry.materialFrames[asset]||registry.frames[name]||registry.frames.idle;
      target.globalAlpha=opacity;
      target.drawImage(image,registration.x*810,registration.y*1080,810*registration.scale,1080*registration.scale);
    }
    if(from===pose)paint(pose,1);else{paint(from,1-mix);paint(pose,mix);}
    target.globalAlpha=1;target.globalCompositeOperation='source-over';
    ctx.drawImage(characterLayer,0,0,w,h);
  }
  function draw(ctx,frame,{width,height,artwork,reduced=false,blend=null,drawBackground=true,backgroundFrame=null,skipCharacter=false}={}) {
    if(!ctx||!artwork?.get('background')||!artwork.get('chair')||!artwork.get('idle')||!window.GamingSeatedSprites||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return;
    ctx.clearRect(0,0,width,height);
    const ratio=3/4;
    // Every frame shares this fixed crop, keeping the source sprites' calf ends
    // beyond the camera edge even after their static registration adjustments.
    const h=height/.88,w=h*ratio,ox=(width-w)/2,oy=0;
    // The wallpaper fills the camera independently of the fixed character crop.
    // Uniform cover scaling preserves the illustration without leaving side bars.
    // The live room owns one continuous wallpaper behind the whole interface;
    // standalone previews can still include the original camera background.
    const background=artwork.get('background'),sourceWidth=background.naturalWidth||background.width||810,sourceHeight=background.naturalHeight||background.height||1080;
    const backdropWidth=backgroundFrame?.width||width,backdropHeight=backgroundFrame?.height||height;
    const backgroundScale=Math.max(backdropWidth/sourceWidth,backdropHeight/sourceHeight),bw=sourceWidth*backgroundScale,bh=sourceHeight*backgroundScale;
    const bx=(backgroundFrame?.x||0)+(backdropWidth-bw)/2,by=(backgroundFrame?.y||0)+(backdropHeight-bh)/2;
    if(drawBackground)ctx.drawImage(background,bx,by,bw,bh);
    ctx.save();ctx.translate(ox,oy);ctx.drawImage(artwork.get('chair'),0,0,w,h);
    let pose=blend?.to||'idle',from=blend?.from||'idle',mix=limit(blend?.mix??1);
    // The water reaction changes her face/head angle. A clean pose change avoids
    // double eyes and hair, and keeps attached foam on the displayed drawing.
    if(pose==='water'||from==='water'){pose=from=mix<.5?from:pose;mix=1;}
    if(!skipCharacter) paintCharacter(ctx,artwork,pose,from,mix,frame.wetness||0,w,h);
    const t=reduced?0:frame.clock/1000,fan=frame.fanIntensity||0;
    if(fan>.01) {
      ctx.save();ctx.lineCap='round';
      for(let j=0;j<7;j++) {
        const travel=reduced?.4:(t*.8+j*.19)%1,y=h*(.47+j*.052);
        ctx.strokeStyle=`rgba(184,239,255,${(.30+Math.sin(travel*Math.PI)*.5)*fan})`;ctx.lineWidth=w*.0032;
        ctx.beginPath();ctx.moveTo(w*(-.1+travel*.19),y);ctx.bezierCurveTo(w*.23,y-h*.08,w*.40,y-h*.075,w*(.52+travel*.43),y-h*.04);ctx.stroke();
      }
      // Rotating translucent blade highlights remain inside the illustrated fan.
      ctx.translate(bx-ox+.03*bw,by-oy+.581*bh);ctx.rotate(reduced?0:t*19);ctx.fillStyle=`rgba(212,212,255,${fan*.14})`;
      for(let j=0;j<3;j++){ctx.rotate(Math.PI*2/3);ctx.beginPath();ctx.ellipse(0,-.044*bh,.021*bw,.051*bh,0,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    if(frame.effects?.water!==undefined) {
      ctx.save();ctx.strokeStyle='#b2efffcc';ctx.lineWidth=w*.003;
      // Spray rises from the right-side nozzle to the upper shirt, above her hands.
      for(let i=0;i<12;i++) {
        const u=reduced?(i+.5)/12:(t*1.65+i/12)%1,next=Math.min(1,u+.035);
        const y=at=>h*(.57-at*.195+at*at*.04+(i%3-1)*.003);
        ctx.beginPath();ctx.moveTo(w*(.96-u*.40),y(u));ctx.lineTo(w*(.96-next*.40),y(next));ctx.stroke();
      }ctx.restore();
    }
    if(!skipCharacter) deposits(ctx,width,height,w,h,ox,from,pose,mix,frame.foamDeposits);
    for(const p of skipCharacter?[]:(frame.foamParticles||[])) {
      const registry=window.GamingSeatedSprites;
      const anchorAt=name=>(registry.frames[name]||registry.frames.idle).anchors[p.anchor]||registry.baseAnchors.shirt;
      const a=anchorAt(from),b=anchorAt(pose);
      let ax=a[0]+(b[0]-a[0])*mix,ay=a[1]+(b[1]-a[1])*mix;
      if(p.detached&&p.detachedPose){const d=anchorAt(registry.select({pose:p.detachedPose,expression:'focused',clock:0}));ax=d[0];ay=d[1];}
      const life=limit(p.remaining/2200),arrival=reduced?1:limit(p.age/650),fall=reduced?0:(1-life)*(1-life)*.09;
      const localX=(p.x||0),localY=(p.y||0),flight=1-arrival;
      const drift=limit((p.driftAge||0)/(p.driftDuration||1400));
      const x=(ax+localX+flight*(.97-ax)+(reduced?0:(p.driftX||0)))*w,y=(ay+localY+flight*(.65-ay)+fall+(reduced?0:(p.driftY||0)))*h;
      const size=w*(p.anchor==='bangs'?.035:.025)*(p.scale||1);
      foam(ctx,x,y,size,p.id*.71,Math.min(1,arrival*3)*life*(p.detached?1-drift:1));
      if(!reduced&&!p.detached&&p.age>=0&&p.age<650) {
        // Short white wisps connect each arriving clump to the right-side sprayer.
        for(let trail=1;trail<=2;trail++) {
          const behind=Math.min(1,flight+trail*.085);
          foam(ctx,(ax+localX+behind*(.97-ax))*w,(ay+localY+behind*(.65-ay))*h,size*(.40-trail*.06),p.id*.71+trail,.45*arrival*(1-trail*.22));
        }
      }
    }
    ctx.restore();
    // Every deposit and spray wisp stays in this camera canvas; game and gifts stay clear.
  }
  window.GamingSeatedEffects=Object.freeze({draw,anchors});
})();
