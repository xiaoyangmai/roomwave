/* Painted cake components are composited in the same camera as the baker. */
(() => {
  'use strict';
  const W=1024,H=1536,CX=512,BASE=1090,CAKE_W=462,RY=52,LAYER=54,FILL=13;
  const cakeScale=value=>Number.isFinite(value)?Math.max(1,Math.min(2,value)):1;
  const clamp=value=>Math.max(0,Math.min(1,value));
  const smooth=value=>{const t=clamp(value);return t*t*(3-2*t)};
  const random=index=>{const n=Math.sin(index*127.1+311.7)*43758.5453;return n-Math.floor(n)};
  const registration={
    'baker-idle':{x:51,y:22,scale:.9},'baker-place':{x:105,y:69,scale:.78},
    'baker-spread':{x:60,y:31,scale:.89},'baker-pipe':{x:136,y:-1,scale:.74},'baker-present':{x:102,y:27,scale:.8}
  };
  const ambientPoses=Object.freeze({apron:'baker-idle-apron',spoon:'baker-idle-spoon',strawberry:'baker-idle-strawberry'});
  // Forearms and palms rest in front of the worktop; the apron stays behind it.
  // These masks use the existing pose pixels, without moving any hand or tool.
  const handMasks={
    'baker-idle':[[0,750,351,750,350,870,336,919,288,960,295,1024,266,1115,0,1115],[700,750,1024,750,1024,1120,780,1120,738,1001,705,900]],
    'baker-place':[[0,770,348,770,342,878,312,944,293,985,346,1045,345,1120,0,1120],[708,770,1024,770,1024,1130,677,1130,705,1030,740,983]],
    'baker-present':[[0,770,363,770,360,900,335,1017,307,1157,0,1157],[726,770,1024,770,1024,1210,770,1210,745,1024]],
    'baker-pipe':[[160,906,299,929,353,966,363,900,444,906,468,1090,593,1168,776,1174,784,1084,884,1084,879,1211,841,1280,641,1278,532,1210,504,1379,466,1377,432,1242,362,1147,240,1197,173,1164]]
  };
  function geometry(layers){
    let cy=BASE;const parts=[];
    for(const layer of layers){
      cy-=LAYER;parts.push({kind:'sponge',key:layer.flavor,cy});
      if(layer.filling){cy-=FILL;parts.push({kind:'filling',key:layer.filling,cy});}
    }
    return {parts,cy,height:BASE-cy};
  }
  // Pointer coordinates and painted toppings share this exact cake-top ellipse.
  function surface(layers,scale=1){
    const factor=cakeScale(scale),anchor=BASE+RY;
    return {cx:CX,cy:anchor+(geometry(layers).cy-anchor)*factor,rx:(CAKE_W/2-22)*factor,ry:(RY-8)*factor};
  }
  function create({canvas,artwork,drawCounter=true}){
    const ctx=canvas.getContext('2d');let width=1,height=1,ratio=1,counter={x:0,y:0,width:W,height:H};
    const get=key=>artwork.get(key);
    function resize(w,h,dpr=1,wallpaper){
      width=Math.max(1,w);height=Math.max(1,h);ratio=Math.min(2,Math.max(1,dpr));canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
      counter=wallpaper?{x:wallpaper.x*W/width,y:wallpaper.y*H/height,width:wallpaper.width*W/width,height:wallpaper.height*H/height}:{x:0,y:0,width:W,height:H};
    }
    function clipAtCounter(below=false){
      const x=value=>counter.x+value*counter.width/W,y=value=>counter.y+value*counter.height/H;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.lineTo(W,y(980));
      ctx.lineTo(x(1024),y(980));ctx.lineTo(x(870),y(1003));ctx.lineTo(x(741),y(1018));ctx.lineTo(x(675),y(1021));
      ctx.bezierCurveTo(x(563),y(998),x(433),y(996),x(327),y(1021));
      ctx.lineTo(x(191),y(1029));ctx.lineTo(x(0),y(994));ctx.lineTo(0,y(994));ctx.closePath();
      if(below)ctx.rect(0,0,W,H);ctx.clip(below?'evenodd':'nonzero');
    }
    function clipHands(key,x,y,scale){
      const masks=handMasks[key];if(!masks)return false;
      ctx.beginPath();
      for(const points of masks){ctx.moveTo(x+points[0]*scale,y+points[1]*scale);for(let i=2;i<points.length;i+=2)ctx.lineTo(x+points[i]*scale,y+points[i+1]*scale);ctx.closePath();}
      ctx.clip();return true;
    }
    function sprite(key,x,y,w,h,alpha=1){
      const img=get(key);if(!img||alpha<=0)return;
      ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(img,x,y,w,h);ctx.restore();
    }
    function food(key,x,cy,depth,alpha=1){
      const img=get(key);if(!img||alpha<=0)return;
      const pad=key==='sponge-vanilla'?8:12;
      ctx.save();ctx.globalAlpha=alpha;
      ctx.drawImage(img,pad,pad,Math.max(1,(img.naturalWidth||img.width)-2*pad),Math.max(1,(img.naturalHeight||img.height)-2*pad),x-CAKE_W/2,cy-RY,CAKE_W,RY*2+depth);
      ctx.restore();
    }
    function bodyWithApron(img,x,y,scale,sourceWidth,sourceHeight,hem){
      const split=sourceHeight-hem,topHeight=split*scale;
      ctx.drawImage(img,0,0,sourceWidth,split,x,y,sourceWidth*scale,topHeight);
      // Only the lower apron extends behind the counter when she stands back
      // to reach a tall cake; face, arms and tools keep their proportions.
      ctx.drawImage(img,0,split,sourceWidth,hem,x,y+topHeight,sourceWidth*scale,Math.max(hem*scale,1001-y-topHeight));
    }
    function baker(key,frame,alpha=1,hands=false){
      const img=get(key);if(!img||alpha<=0)return;
      // Idle gestures keep their hands above the counter. Their apron must not
      // be redrawn in the foreground with the existing working-hand masks.
      if(hands&&!handMasks[key])return;
      if(key==='baker-spread-low'){if(!hands)spreadPose(frame,alpha,false);return;}
      if(key==='baker-pipe'){
        const geo=geometry(frame.layers),scale=.82-(Math.max(1,frame.layers.length)-1)*.08;
        const x=490-515*scale,y=geo.cy-20-1305*scale;
        ctx.save();ctx.globalAlpha=alpha;if(hands)clipHands(key,x,y,scale);bodyWithApron(img,x,y,scale,W,H,180);ctx.restore();return;
      }
      const reg=registration[key]||registration['baker-idle'];
      const working=key==='baker-place'||key==='baker-spread';
      const lean=working&&!frame.reducedMotion?Math.sin((frame.actionProgress||0)*Math.PI)*7:0;
      ctx.save();ctx.globalAlpha=alpha;if(hands)clipHands(key,reg.x,reg.y+lean,reg.scale);ctx.drawImage(img,reg.x,reg.y+lean,W*reg.scale,H*reg.scale);ctx.restore();
    }
    function spreadPose(frame,alpha,foreground){
      const img=get(foreground?'baker-spread-arm':'baker-spread-low');if(!img)return;
      const geo=geometry(frame.layers),scale=.88-(Math.max(1,frame.layers.length)-1)*.06;
      const stroke=frame.reducedMotion?0:Math.sin(frame.actionProgress*Math.PI*2)*8;
      const surface=geo.cy-(frame.action?.startsWith('filling:')?FILL:0);
      const x=475-600*scale+stroke,y=surface+20-1161*scale;
      ctx.save();ctx.globalAlpha=alpha;
      if(foreground){
        ctx.beginPath();ctx.ellipse(CX,geo.cy,CAKE_W/2+5,RY+5,0,0,Math.PI*2);
        ctx.rect(CX-CAKE_W/2-5,geo.cy,CAKE_W+10,geo.height+RY+6);ctx.clip();
      }
      ctx.translate(x,y);ctx.scale(scale,scale);
      if(foreground){
        // Register the separately painted arm to its full-body pose. Only the
        // forearm/hand/tool passes in front of the cake, never apron pixels.
        ctx.drawImage(img,10,300,1254*.74,1254*.74);
      }else {
        const split=1190;
        ctx.drawImage(img,0,0,1254,split,0,0,1254,split);
        ctx.drawImage(img,0,split,1254,64,0,split,1254,Math.max(64,(1001-y)/scale-split));
      }
      ctx.restore();
    }
    function frosting(key,geo,progress=1){
      if(key==='naked')return;
      const img=get('icing-'+key);if(!img)return;
      const pad=12,sw=(img.naturalWidth||img.width)-24,sh=(img.naturalHeight||img.height)-24;
      const top={white:276,pink:418,chocolate:374}[key]||sh*.45;
      const bottom=Math.min(sh-top-1,top/2),middle=sh-top-bottom;
      const x=CX-CAKE_W/2-4,y=geo.cy-RY-4,dw=CAKE_W+8;
      const dh=geo.height+RY*2+8,cap=RY*2+4,base=RY+2,body=Math.max(1,dh-cap-base);
      ctx.save();ctx.beginPath();ctx.rect(x-1,y-1,(dw+2)*clamp(progress),dh+2);ctx.clip();
      ctx.drawImage(img,pad,pad,sw,top,x,y,dw,cap);
      ctx.drawImage(img,pad,pad+top,sw,middle,x,y+cap,dw,body);
      ctx.drawImage(img,pad,pad+top+middle,sw,bottom,x,y+cap+body,dw,base);ctx.restore();
    }
    function decorations(frame,geo){
      const [kind,key]=(frame.action||'').split(':'),placing=kind==='decor';
      const enter=frame.reducedMotion?1:smooth(((frame.actionProgress||0)-.12)/.70);
      const settled=frame.decorations||{},decor={...settled};if(placing)decor[key]=(decor[key]||0)+1;
      const top={cx:CX,cy:geo.cy,rx:CAKE_W/2-22,ry:RY-8};
      const count=value=>Number.isSafeInteger(value)?Math.max(0,Math.min(48,value)):0;
      const types=['strawberry','blueberry','cherry','kiwi','cream','macaron','candle'];
      const point=placement=>{
        if(!placement||!Number.isFinite(placement.x)||!Number.isFinite(placement.y))return null;
        const radius=Math.max(1,Math.hypot(placement.x,placement.y));
        return {x:top.cx+placement.x/radius*top.rx,y:top.cy+placement.y/radius*top.ry};
      };
      const generated=(name,serving)=>{
        if(typeof globalThis.BakingState?.decorationPosition==='function')return {key:name,...globalThis.BakingState.decorationPosition(name,serving)};
        const slot=Math.max(0,types.indexOf(name))+serving*types.length,angle=slot*2.3999632297,ring=Math.min(.82,Math.sqrt((slot+.5)/21)*.8);
        return {key:name,x:Math.cos(angle)*ring,y:Math.sin(angle)*ring};
      };
      if(decor.chocolate){
        const fill=clamp((placing&&key==='chocolate'?count(settled.chocolate)+enter:count(decor.chocolate))/3);
        ctx.save();ctx.beginPath();ctx.rect(CX-CAKE_W/2-5,geo.cy-7,(CAKE_W+10)*fill,180);ctx.clip();
        sprite('chocolate',CX-CAKE_W/2,geo.cy-4,CAKE_W,CAKE_W*343/1024);ctx.restore();
      }
      if(frame.decorationEditing){
        ctx.save();ctx.globalAlpha=.58;ctx.strokeStyle='#fff8e6';ctx.lineWidth=2;ctx.setLineDash([7,8]);
        ctx.beginPath();ctx.ellipse(top.cx,top.cy,top.rx,top.ry,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      const pieces=[],scatters=[];
      function add(placement,slot,local=1,alpha=1){
        const coordinates=point(placement);if(!coordinates||local<=0)return;
        const item={name:placement.key,...coordinates,local,alpha,slot};
        if(placement.key==='sprinkles')scatters.push(item);
        else if(types.includes(placement.key))pieces.push(item);
      }
      if(Array.isArray(frame.placements)){
        frame.placements.forEach((placement,index)=>add(placement,index));
        if(placing&&key!=='chocolate')add(generated(key,count(settled[key])),frame.placements.length,enter);
      }else {
        // Counts from an older room can still be painted without changing its save.
        for(const name of types)for(let serving=0;serving<count(decor[name]);serving++)add(generated(name,serving),types.indexOf(name)+serving*types.length,placing&&key===name&&serving>=count(settled[name])?enter:1);
        for(let serving=0;serving<count(decor.sprinkles);serving++){
          // Preserve the broad sparkle coverage on cakes saved before placement.
          for(let i=0;i<28;i++){
            const slot=serving*28+i,angle=random(slot*5+13)*Math.PI*2,r=Math.sqrt(random(slot*7+19))*.87;
            scatters.push({name:'sprinkles',x:CX+Math.cos(angle)*top.rx*r,y:geo.cy+Math.sin(angle)*top.ry*r,slot,local:placing&&key==='sprinkles'&&serving>=count(settled.sprinkles)?enter:1,alpha:1,single:true});
          }
        }
      }
      if(frame.decorationEditing&&frame.decorationPreview)add(frame.decorationPreview,frame.placements?.length||0,1,.45);
      for(const {x,y,local,alpha,slot,single} of scatters){
        if(local<=0)continue;
        ctx.save();ctx.beginPath();ctx.ellipse(top.cx,top.cy,top.rx+8,top.ry+3,0,0,Math.PI*2);ctx.clip();
        for(let i=0;i<(single?1:10);i++){
          const seed=slot*29+i,angle=random(seed*5+13)*Math.PI*2,r=Math.sqrt(random(seed*7+19));
          ctx.save();ctx.globalAlpha=local*alpha;ctx.translate(x+(single?0:Math.cos(angle)*27*r)+(1-local)*15,y+(single?0:Math.sin(angle)*8*r)-(1-local)*55);ctx.rotate(random(seed+60)*Math.PI);
          ctx.fillStyle=['#fa7099','#f0c336','#73bde7','#a68ce0','#6cc3a1','#fff0d0'][seed%6];ctx.beginPath();ctx.roundRect(-3.5,-1.4,7,2.8,1.4);ctx.fill();ctx.restore();
        }
        ctx.restore();
      }
      const pulse=frame.decorationPulse,pulsePoint=point(pulse);
      if(frame.decorationEditing&&!frame.reducedMotion&&pulsePoint&&Number.isFinite(pulse.progress)){
        const progress=clamp(pulse.progress);ctx.save();ctx.globalAlpha=(1-progress)*.65;ctx.strokeStyle='#fff8e6';ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(pulsePoint.x,pulsePoint.y,16+progress*18,5+progress*6,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      pieces.sort((a,b)=>a.y-b.y);
      for(const {name,x,y,local,alpha,slot} of pieces){
        const img=get(name);if(!img||local<=0)continue;
        const candle=name==='candle',w=candle?15:({strawberry:64,blueberry:55,cherry:62,kiwi:68,cream:46,macaron:64}[name]);
        const h=candle?113:w,anchor=candle?.985:name==='strawberry'?.83:.875;
        const startX=475,startY=Math.min(geo.cy-55,940);
        const px=x+(startX-x)*(1-local),py=y+(startY-y)*(1-local);
        ctx.save();ctx.globalAlpha=local*alpha;ctx.translate(px,py);ctx.rotate(candle?0:(slot%3-1)*.055);ctx.drawImage(img,-w/2,-h*anchor,w,h);ctx.restore();
      }
    }
    function draw(frame){
      if(!ctx)return;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);ctx.save();ctx.scale(width/W,height/H);
      const [kind,key]=(frame.action||'').split(':'),p=frame.actionProgress||0;
      const ambient=!frame.action&&Object.hasOwn(ambientPoses,frame.ambientAction)?ambientPoses[frame.ambientAction]:null;
      const base=ambient&&frame.completed?'baker-present':'baker-idle';
      const pose=ambient||(frame.completed||frame.action==='finish'||frame.action==='icing:naked'?'baker-present':kind==='sponge'?'baker-place':kind==='filling'||kind==='icing'?'baker-spread-low':kind==='decor'&&!frame.decorationEditing?(key==='cream'||key==='chocolate'||key==='sprinkles'?'baker-pipe':'baker-place'):'baker-idle');
      const idleProgress=frame.ambientProgress||0;
      const blend=ambient?(frame.reducedMotion?1:Math.min(smooth(idleProgress/.12),smooth((1-idleProgress)/.15))):frame.reducedMotion||!frame.action||frame.action==='finish'||frame.decorationEditing&&kind==='decor'?1:Math.min(smooth(p/.13),smooth((1-p)/.12));
      ctx.save();
      if(!drawCounter)clipAtCounter();
      baker(base,frame,1-blend);baker(pose,frame,blend);
      ctx.restore();
      if(!drawCounter){ctx.save();clipAtCounter(true);baker(base,frame,1-blend,true);baker(pose,frame,blend,true);ctx.restore();}
      // The original counter and stand cover the apron below her waist.
      const room=get('kitchen');if(drawCounter&&room)ctx.drawImage(room,0,1000,W,H-1000,0,1000,W,H-1000);
      const geo=geometry(frame.layers);
      // Enlarge the editable cake around its contact with the stand. The baker
      // and counter stay registered to their original kitchen camera.
      const scale=cakeScale(frame.cakeScale);ctx.save();
      if(scale!==1){ctx.translate(CX,BASE+RY);ctx.scale(scale,scale);ctx.translate(-CX,-(BASE+RY));}
      if(frame.layers.length){ctx.save();ctx.fillStyle='#61432228';ctx.beginPath();ctx.ellipse(CX,BASE+4,CAKE_W/2+7,RY+4,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      for(const part of geo.parts)food(part.kind+'-'+part.key,CX,part.cy,part.kind==='sponge'?LAYER:FILL);
      if(kind==='sponge'){
        const t=frame.reducedMotion?1:smooth((p-.14)/.67),cy=geo.cy-LAYER;
        food('sponge-'+key,CX+(1-t)*32,cy-(1-t)*95,LAYER,Math.min(1,t*5));
      }
      if(kind==='filling'){
        const t=frame.reducedMotion?1:smooth((p-.10)/.76);
        ctx.save();ctx.beginPath();ctx.rect(CX-CAKE_W/2-1,geo.cy-RY-FILL-1,(CAKE_W+2)*t,RY*2+FILL+4);ctx.clip();food('filling-'+key,CX,geo.cy-FILL,FILL);ctx.restore();
      }
      if(frame.frosting)frosting(frame.frosting,geo);
      else if(kind==='icing')frosting(key,geo,frame.reducedMotion?1:smooth((p-.10)/.75));
      if(frame.frosting)decorations(frame,geo);
      ctx.restore();
      if(kind==='filling'||kind==='icing'&&key!=='naked')spreadPose(frame,blend,true);
      ctx.restore();
    }
    return Object.freeze({resize,draw});
  }
  globalThis.BakingCakeRenderer=Object.freeze({create,geometry,surface});
})();

