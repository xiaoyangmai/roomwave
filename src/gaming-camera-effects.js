/* All camera particles follow the same paused game clock as the race. */
(() => {
  'use strict';
  const clamp=x=>Math.max(0,Math.min(1,x));
  // Each particle keeps its own landing spot. Refreshing the bubble machine
  // must never send bubbles that already landed back to the nozzle.
  const bubbleSurfaces=[
    [434,49,655,137], // Crown of the hair.
    [54,64,292,343], // Left wall and shelves.
    [728,166,771,279], // Headphones.
    [1007,49,1148,324], // Right wall and shelves.
    [315,400,408,481], // Left sleeve.
    [838,93,892,265], // Chair back.
    [793,376,869,480], // Right sleeve.
    [56,682,199,714], // Side desk beside the bubble machine.
    [451,549,794,596], // Shirt, below the face and neckline.
    [304,552,367,645], // Left arm.
    [890,552,933,681], // Right arm.
    [1081,431,1152,580], // Fan and right side of the room.
    [365,229,392,350], // Outer hair, leaving the eyes and smile clear.
    [136,752,1064,760] // Front edge of the desk.
  ];
  const fraction=value=>value-Math.floor(value);
  function drawClingingBubbles(ctx,particles,reduced) {
    for(const particle of particles){
      if(particle.remaining<=0 || (!reduced&&particle.age<0))continue;
      const id=particle.id,area=bubbleSurfaces[id%bubbleSurfaces.length];
      const radius=10+fraction((id+1)*.61803398875)*23;
      const tx=area[0]+(area[2]-area[0])*fraction((id+1)*.75487766625);
      const ty=area[1]+(area[3]-area[1])*fraction((id+1)*.56984029099);
      const progress=reduced?1:clamp(particle.age/(1250+(id%5)*120));
      const x=100+(tx-100)*progress,y=580+(ty-580)*progress-Math.sin(progress*Math.PI)*95;
      const alpha=.74*clamp(particle.remaining/6000)*(reduced?1:clamp(particle.age/100));
      bubble(ctx,x,y,radius,alpha);
    }
  }
  function bubble(ctx,x,y,r,alpha) {
    if(alpha<=0)return;
    ctx.save();ctx.globalAlpha=alpha;
    const fill=ctx.createRadialGradient(x-r*.3,y-r*.4,r*.05,x,y,r);
    fill.addColorStop(0,'#ffffffa6');fill.addColorStop(.23,'#b8efff08');fill.addColorStop(.76,'#e9caff16');fill.addColorStop(.93,'#91eafa8f');fill.addColorStop(1,'#ffbef7c9');
    ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff7ffc9';ctx.lineWidth=1.3;ctx.stroke();
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.5,r*.09);ctx.beginPath();ctx.arc(x-r*.03,y-r*.03,r*.73,3.85,4.65);ctx.stroke();
    ctx.strokeStyle='#f0a4efaa';ctx.beginPath();ctx.arc(x,y,r*.83,.35,1.6);ctx.stroke();ctx.restore();
  }
  function draw(context,frame,{width,height,reduced=false}) {
    if(!context)return;
    const ctx=context,w=width,h=height,time=frame.clock||0;
    ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(w/1200,h/800);
    const wet=clamp(frame.wetness||0),coverage=clamp(frame.bubbleCoverage||0);
    // Small beads cling to cloth and hair after the jet stops.
    const drops=[[384,441],[816,424],[760,556],[509,542],[680,575],[714,468],[453,359],[742,317],[541,581],[789,484],[475,503],[624,599]];
    for(let i=0;i<drops.length;i++){
      const [x,y]=drops[i],drift=reduced?0:(time/2100+i*.27)%1;
      ctx.save();ctx.globalAlpha=wet*(.45+((i*7)%5)*.1);ctx.translate(x,y+drift*13);ctx.rotate(-.15);
      ctx.fillStyle='#c0f4ff75';ctx.strokeStyle='#eefbffd9';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,2.5,5+i%3,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    }
    const bubbleElapsed=frame.effects?.bubbles ?? (frame.action==='bubbles'?frame.elapsed:null);
    const bubbling=bubbleElapsed!==null;
    if(Array.isArray(frame.bubbleParticles)){
      drawClingingBubbles(ctx,frame.bubbleParticles,reduced);
    }else{
      // Compatibility for older frames without individually tracked bubbles.
      const anchors=[[454,156,23],[705,186,30],[772,312,24],[482,302,17],[350,430,26],[459,550,31],[722,578,23],[819,475,34],[630,515,18]];
      for(let i=0;i<anchors.length;i++){
        const [tx,ty,r]=anchors[i];
        const travel=bubbling?clamp((bubbleElapsed-120-i*140)/1350):1;
        if(bubbling&&travel<=0)continue;
        const p=reduced?1:travel,x=100+(tx-100)*p,y=580+(ty-580)*p-Math.sin(p*Math.PI)*100;
        const alpha=Math.min(.85,coverage*(1.15+(i%3)*.3));
        bubble(ctx,x,y,r,alpha);
      }
      if(bubbling){
        for(let i=0;i<12;i++){
          const p=reduced?(i+.5)/12:((bubbleElapsed/3400+i*.083)%1);
          bubble(ctx,90+p*(240+(i*79)%780)+Math.sin(p*6+i)*22,610-p*(470+(i%3)*80),12+(i*13)%31,.55*Math.sin(Math.PI*p));
        }
      }
    }
    const waterElapsed=frame.effects?.water ?? (frame.action==='water'?frame.elapsed:null);
    const spraying=waterElapsed!==null && waterElapsed<2800;
    if(spraying){
      const fade=clamp(waterElapsed/160)*clamp((2800-waterElapsed)/350);
      const nozzle={x:936,y:636},target={x:637,y:566};
      ctx.save();ctx.globalAlpha=fade;
      // A toy water gun points into the shirt; spray travels from its muzzle.
      ctx.save();ctx.translate(938,636);ctx.rotate(.23);
      ctx.fillStyle='#ef69c7';ctx.strokeStyle='#603467';ctx.lineWidth=3;
      ctx.beginPath();ctx.roundRect(24,12,33,65,8);ctx.fill();ctx.stroke();
      ctx.fillStyle='#31c9ed';ctx.beginPath();ctx.roundRect(-10,-22,115,44,12);ctx.fill();ctx.stroke();
      ctx.fillStyle='#afeef3';ctx.beginPath();ctx.roundRect(40,-40,53,23,10);ctx.fill();ctx.stroke();
      ctx.fillStyle='#f580cd';ctx.fillRect(-16,-13,18,26);ctx.fillStyle='#236eae';ctx.fillRect(-21,-7,7,14);
      ctx.strokeStyle='#dcfbff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(12,-8);ctx.lineTo(55,-8);ctx.stroke();ctx.restore();
      if(waterElapsed>180){
        const jitter=reduced?0:Math.sin(time/34)*5;
        ctx.lineCap='round';ctx.strokeStyle='#6edcfa80';ctx.lineWidth=13;
        ctx.beginPath();ctx.moveTo(nozzle.x,nozzle.y);ctx.quadraticCurveTo(786,582+jitter,target.x,target.y);ctx.stroke();
        ctx.strokeStyle='#e4fbffe6';ctx.lineWidth=3;ctx.stroke();
        for(let i=0;i<18;i++){
          const p=reduced?(i+.5)/18:((time/390+i*.13)%1),spread=(i%7-3)*4;
          const x=nozzle.x+(target.x-nozzle.x)*p,y=nozzle.y+(target.y-nozzle.y)*p+spread*p;
          ctx.fillStyle='#c4f7ffcc';ctx.beginPath();ctx.ellipse(x,y,3+i%3,1.5,Math.PI/9,0,Math.PI*2);ctx.fill();
        }
        for(let i=0;i<10;i++){
          const p=reduced?.5:((time/500+i*.1)%1),angle=i*2.4;
          const x=target.x+Math.cos(angle)*p*80,y=target.y+Math.sin(angle)*p*45+p*p*25;
          ctx.globalAlpha=fade*(1-p);ctx.fillStyle='#bdf4ff';ctx.beginPath();ctx.ellipse(x,y,3,6,angle,0,Math.PI*2);ctx.fill();
        }
      }
      ctx.restore();
    }
    if(frame.effects?.fan!==undefined || frame.action==='fan'){
      ctx.save();ctx.strokeStyle='#d9faffab';ctx.lineWidth=2.5;
      for(let i=0;i<6;i++){
        const p=reduced?.45:(time/1250+i*.16)%1,x=1220-p*1040,y=250+i*57;
        ctx.globalAlpha=Math.sin(p*Math.PI)*.65;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-50,y-18,x-105,y+20,x-160,y);ctx.stroke();
      }ctx.restore();
    }
    ctx.restore();
  }
  globalThis.GamingCameraEffects=Object.freeze({draw});
})();
