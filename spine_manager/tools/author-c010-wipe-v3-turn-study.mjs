// c010 performance study: whole-body poses, independent hand articulation and sleeve correctives.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProject } from '../../rigby2d/src/mcp/tools.js';
import { Animation, makeKey, sample } from '../../rigby2d/src/core/animation.js';
import { Pose } from '../../rigby2d/src/core/pose.js';
import { makeBone, makeSlot } from '../../rigby2d/src/core/model.js';
import { identityTransform } from '../../rigby2d/src/core/math.js';
import { zip } from '../../rigby2d/src/editor/zip.js';
import { writeSkeletonJson } from '../../rigby2d/src/core/interop.js';
import { addC010DorsalHand, keyC010DorsalHand } from './c010-dorsal-hand.mjs';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const out = path.join(root, 'spine_manager/artifacts/runs/c010-foam-wipe-v3-turn-study-20261105/authored');
const project = await loadProject(path.join(root, 'spine_manager/source/c010/c010_00.rigby'));
const sleeveBytes=await fs.readFile(path.join(root,'spine_manager/source/c010-foam-wipe-v2/upper-sleeve-wipe.png'));
project.entries.set('images/derived/l_arm_1_wipe.png',new Uint8Array(sleeveBytes));
const d = project.doc, index = name => d.bones.findIndex(b => b.name === name);
const base = new Pose(d); base.apply(d, d.animations.find(a => a.name === 'idle'), 0, 1); base.updateWorld(d);
const rad = Math.PI / 180;
const eye = base.world[index('r_eye')];
const faceLocal = base.world[index('head')].inverse().apply([eye.tx + 4, eye.ty - 10]);
const strap = structuredClone(d.bones[index('ik_arm_r')]); strap.name = 'strap_target_r'; d.bones.push(strap);
d.extra.constraints.find(c => c.data.name === 'string_2').data.source = strap.name;
const dorsal=addC010DorsalHand(project,await fs.readFile(path.join(root,'spine_manager/source/c010-foam-wipe-v3/left-glove-dorsal-contact.png')));
const sideBytes=await fs.readFile(path.join(root,'spine_manager/source/c010-foam-wipe-v3/left-glove-turn-study.png'));
const curledBytes=await fs.readFile(path.join(root,'spine_manager/source/c010-foam-wipe-v3/left-glove-curled-side-study.png'));
const matchedBytes=await fs.readFile(path.join(root,'spine_manager/source/c010-foam-wipe-v3/left-glove-matched-palm-study.png'));
project.entries.set('images/derived/turn_side.png',new Uint8Array(sideBytes));
project.entries.set('images/derived/turn_curled.png',new Uint8Array(curledBytes));
project.entries.set('images/derived/matched_palm.png',new Uint8Array(matchedBytes));
const reference=await loadProject(path.join(root,'spine_manager/artifacts/runs/c010-foam-wipe-v2-20261105/exported/c010_00.foam_wipe.json'));
const rp=new Pose(reference.doc);rp.apply(reference.doc,reference.doc.animations.find(a=>a.name==='idle'),2.57,1);rp.apply(reference.doc,reference.doc.animations.find(a=>a.name==='foam_wipe'),.57,1);rp.updateWorld(reference.doc);
const refBone=reference.doc.bones.findIndex(b=>b.name==='r_hand_1'),inverseHand=rp.world[refBone].inverse();
const refFrame=JSON.parse(await fs.readFile(path.join(root,'spine_manager/artifacts/runs/c010-hand-original-reference-20261105/coordinates.json'),'utf8')).frames.find(f=>f.time===.57);
const uv=[],tri=[],weights=[],cols=24,rows=28;
for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
  const u=col/cols,v=row/rows,cam=refFrame.viewport;
  const world=[cam.cameraCenter.x+(u-.5)*cam.worldWidth,cam.cameraCenter.y+(.5-v)*cam.worldHeight];
  const [x,y]=inverseHand.apply(world);uv.push(u,v);weights.push([{bone:dorsal.handBone,x,y,weight:1}]);
  if(row<rows&&col<cols){const k=row*(cols+1)+col;tri.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}
}
const matched={name:'matched_palm',type:'mesh',image:'derived/matched_palm',width:matchedBytes.readUInt32BE(16),height:matchedBytes.readUInt32BE(20),uvs:uv,triangles:tri,weights,hull:0,edges:[],color:[1,1,1,1]};
for(const skin of d.skins){
  const attachments=d.skinAttachments(dorsal.handSlot,skin.name);
  const side=structuredClone(attachments.find(att=>att.name==='dorsal_contact'));
  side.name='turn_side';side.image='derived/turn_side';side.width=sideBytes.readUInt32BE(16);side.height=sideBytes.readUInt32BE(20);
  attachments.push(side);
  const curled=structuredClone(side);curled.name='turn_curled';curled.image='derived/turn_curled';curled.width=curledBytes.readUInt32BE(16);curled.height=curledBytes.readUInt32BE(20);attachments.push(curled,structuredClone(matched));
}
d.bones.push(makeBone('foam_face_anchor', index('head'), { ...identityTransform(), x: faceLocal[0], y: faceLocal[1] }, 0));
// Compatibility name follows the visible dorsal-hand fingertip control.
d.bones.push(makeBone('foam_palm_anchor', dorsal.indexBone, { ...identityTransform(), x: dorsal.indexTipLocal[0], y: dorsal.indexTipLocal[1] }, 0));
const a = new Animation('foam_wipe', 3.6); d.animations.push(a);
for(const slot of [...dorsal.fingerSlots,dorsal.handSlot]){
  const original=d.slots[slot].attachment;
  a.slotTimelineMut(slot).attachment=[makeKey(0,original,'stepped'),makeKey(.58,slot===dorsal.handSlot?'matched_palm':null,'stepped'),makeKey(.68,slot===dorsal.handSlot?'turn_curled':null,'stepped'),makeKey(.76,slot===dorsal.handSlot?'turn_side':null,'stepped'),makeKey(.8,slot===dorsal.handSlot?'dorsal_contact':null,'stepped'),makeKey(2.55,slot===dorsal.handSlot?'turn_side':null,'stepped'),makeKey(2.65,slot===dorsal.handSlot?'turn_curled':null,'stepped'),makeKey(2.75,slot===dorsal.handSlot?'matched_palm':null,'stepped'),makeKey(2.85,original,'stepped')];
}
for (const name of ['FoamNotice', 'FoamContact', 'FoamCleared', 'FoamComplete'])
  d.events.push({ name, int: 0, float: 0, string: null, audio: null, volume: 1, balance: 0 });
a.events = [{ time: .1, name: 'FoamNotice' }, { time: 1.1, name: 'FoamContact' }, { time: 2.15, name: 'FoamCleared' }, { time: 3.6, name: 'FoamComplete' }];
const setupPose=new Pose(d);setupPose.updateWorld(d);
const sleeveMeshes=[];
const clamp=x=>Math.max(0,Math.min(1,x));
for (const name of ['l_arm_1', 'r_arm_2']) {
  const slot = d.slots.findIndex(s => s.name === name);
  for (const skin of d.skins) {
    const attachments = d.skinAttachments(slot, skin.name);
    const att = structuredClone(attachments.find(x => x.name === name));
    att.name += '_wipe_v2';
    if(name==='l_arm_1')att.image='derived/l_arm_1_wipe';
    if (att.type === 'linkedmesh') att.parent += '_wipe_v2';
    else {
      const bone=index(name),parent=d.bones[bone].parent;
      if(name==='l_arm_1'){
        att.width=sleeveBytes.readUInt32BE(16);att.height=sleeveBytes.readUInt32BE(20);
        att.weights=[];att.uvs=[];att.triangles=[];att.edges=[];att.hull=0;
        for(let row=0;row<=8;row++)for(let col=0;col<=4;col++){
          const u=col/4,v=row/8;
          att.uvs.push(u,v);att.weights.push([{bone,x:-30+v*335,y:55-u*130,weight:1}]);
          if(row<8&&col<4){const k=row*5+col;att.triangles.push(k,k+5,k+1,k+1,k+5,k+6);}
        }
      }
      const points=setupPose.worldVertices(d,slot,att);
      const canonical=att.weights.map((_,i)=>setupPose.world[bone].inverse().apply(points.slice(i*2,i*2+2)));
      att.weights=canonical.map(([x,y],i)=>{
        const blend=name==='l_arm_1'?clamp((105-x)/130)*.55:clamp((45-x)/90);
        return [[parent,blend],[bone,1-blend]].filter(([,w])=>w>0).map(([b,w])=>{
          const local=setupPose.world[b].inverse().apply(points.slice(i*2,i*2+2));
          return {bone:b,x:local[0],y:local[1],weight:w};
        });
      });
      sleeveMeshes.push({slot,att,bone,parent,canonical});
    }
    attachments.push(att);
  }
  a.slotTimelineMut(slot).attachment = [makeKey(0, `${name}_wipe_v2`, 'stepped'), makeKey(3.6, name, 'stepped')];
}
// Bring the front sleeve into view once the arm is raised; inspect both switches.
const frontSlot=d.slots.length;
const front=makeSlot('l_arm_1_front_v3',index('l_arm_1'),null);
d.slots.push(front);
for(const skin of d.skins)skin.slots.push({slot:frontSlot,attachments:[structuredClone(d.skinAttachments(16,skin.name).find(a=>a.name==='l_arm_1_wipe_v2'))]});
a.slotTimelineMut(frontSlot).attachment=[makeKey(0,null,'stepped'),makeKey(.78,'l_arm_1_wipe_v2','stepped'),makeKey(2.75,null,'stepped')];
const moving=[frontSlot,...Array.from({length:9},(_,j)=>17+j)];
const order=d.slots.map((_,i)=>i).filter(i=>!moving.includes(i));
order.splice(order.indexOf(57),0,frontSlot);
order.splice(order.indexOf(124),0,...Array.from({length:9},(_,j)=>17+j));
const offsets=d.slots.flatMap((_,slot)=>order.indexOf(slot)===slot?[]:[{slot,offset:order.indexOf(slot)-slot}]);
a.drawOrder=[makeKey(0,offsets,'stepped'),makeKey(3.6,null,'stepped')];

// Each series is an acting decision, in seconds and degrees relative to the source idle.
const curves = {
  body_1: [[0,0],[.3,-.6],[.8,-1.8],[1.35,-2.5],[2.05,-2.1],[2.55,-1],[3.2,.25],[3.6,0]],
  body_2: [[0,0],[.45,0],[1,-1.2],[1.6,-1.6],[2.2,-1.3],[2.8,.3],[3.6,0]],
  shoulder_l: [[0,0],[.25,0],[.7,3],[1.05,6],[1.6,5.2],[2.2,4.5],[2.65,1.5],[3.15,-.5],[3.6,0]],
  neck_1: [[0,0],[.38,-1],[.85,-2.2],[1.4,-2.8],[1.9,-2.2],[2.5,-1],[3.3,.3],[3.6,0]],
  head: [[0,0],[.25,-2],[.6,-4],[1.1,-6],[1.45,-6.8],[1.8,-5.4],[2.15,-6],[2.5,-3],[3.1,.5],[3.6,0]],
  l_brow: [[0,0],[.25,3.5],[.7,2],[1.1,1],[2.1,1.5],[2.7,0],[3.6,0]],
  r_brow: [[0,0],[.2,-4],[.8,-3],[1.2,-2],[1.7,-3],[2.25,-1],[2.7,0],[3.6,0]],
  r_hair_1_1: [[0,0],[.4,1],[1,2.2],[1.5,.8],[2.2,1.4],[2.7,-1.5],[3.2,.5],[3.6,0]],
  r_hair_1_2: [[0,0],[.55,.4],[1.15,2.8],[1.65,.7],[2.35,1.6],[2.9,-1.8],[3.35,.4],[3.6,0]],
  r_hair_1_3: [[0,0],[.65,0],[1.3,3.2],[1.85,.5],[2.5,1.3],[3.05,-2.1],[3.4,.4],[3.6,0]],
  necktie_2: [[0,0],[.5,0],[1.15,-1.3],[1.6,-.3],[2.2,-.8],[2.8,.9],[3.3,-.3],[3.6,0]],
  necktie_3: [[0,0],[.6,0],[1.3,-2],[1.8,-.4],[2.4,-1],[3,1.1],[3.4,-.2],[3.6,0]],
};
const ease = { bezier: [.32, 0, .65, 1] };
const at = (keys, time) => sample(keys.map(([t,v])=>makeKey(t,v,ease)),time);
// Shortened projected arm lengths move the elbow outside the torso without rotating the whole chain as a rigid piece.
const upperProjection=t=>at([[0,1],[.42,1],[.6,.84],[.8,.6],[2.32,.6],[2.55,.7],[2.85,.9],[3.15,1],[3.6,1]],t);
const foreProjection=t=>at([[0,1],[.6,1],[.8,.94],[2.32,.94],[2.85,1],[3.6,1]],t);
// Absolute local hand poses. Fingers keep distinct curvature through contact and release.
const handPoses = {
  r_hand_3: [-4,-6,-2,-5], r_hand_2: [6,4,8,5],
  r_finger_1: [-6,-2,-10,-4], r_finger_2: [-75,-80,-70,-77],
  r_finger_3: [-30,-36,-26,-33], r_finger_4: [-46,-54,-41,-49], r_finger_5: [-32,-38,-28,-35],
  r_finger_6: [-56,-62,-51,-59], r_finger_7: [-70,-76,-66,-73],
  r_finger_8: [-61,-66,-57,-63], r_finger_9: [-68,-74,-65,-71], r_finger_10: [-29,-33,-26,-31],
  r_finger_11: [-64,-69,-61,-66], r_finger_12: [-81,-87,-77,-83],
};
const controlled = [...Object.keys(curves), 'l_arm_1', 'r_arm_2', 'r_hand_1', ...Object.keys(handPoses)];
for(const name of controlled)if(index(name)<0)throw new Error(`Missing authored control: ${name}`);
const poses = [], p = new Pose(d);
const contactAngle = Number(process.env.C010_CONTACT_ANGLE || 110);
const authoredTimes = [0,.1,.25,.42,.5,.58,.64,.7,.78,.8,.98,1.1,1.28,1.48,1.7,1.9,2.08,2.15,2.32,2.55,2.64,2.7,2.78,2.85,3.15,3.4,3.6];
const fingerMotion={
  [dorsal.indexBone]:[[0,0],[.8,0],[1.1,3],[1.48,-3],[1.7,4],[2.08,-2],[2.32,1],[2.55,0],[3.6,0]],
  [dorsal.otherBone]:[[0,0],[.8,0],[1.1,-2],[1.48,3],[1.7,-2],[2.08,2],[2.32,0],[2.55,0],[3.6,0]],
};
for(const [bone,keys] of Object.entries(fingerMotion))a.boneTimelineMut(Number(bone)).rotate=keys.map(([t,v])=>makeKey(t,v,ease));
const baseAngle = Math.atan2(base.world[index('r_hand_1')].b,base.world[index('r_hand_1')].a)/rad;
for (const t of authoredTimes) {
  p.reset(d); p.apply(d,d.animations.find(x=>x.name==='idle'),0,1);
  for(const [bone,keys] of Object.entries(fingerMotion))p.local[Number(bone)].rotation=at(keys,t);
  for (const [name,keys] of Object.entries(curves)) p.local[index(name)].rotation += at(keys,t);
  for(const axis of ['x','y']){
    p.local[index('r_arm_2')][axis] *= upperProjection(t);
    p.local[index('r_hand_1')][axis] *= foreProjection(t);
  }
  // Keep hand volume throughout the attachment study; no near-zero scale or transparency.
  for (const [name,values] of Object.entries(handPoses)) {
    const resting=base.local[index(name)].rotation;
    p.local[index(name)].rotation=at([[0,resting],[.35,resting],[.95,values[0]],[1.28,values[1]],[1.7,values[2]],[2.08,values[3]],[2.32,values[0]],[2.8,resting-3],[3.4,resting],[3.6,resting]],t);
  }
  p.updateWorld(d);
  const upper=index('l_arm_1'), fore=index('r_arm_2'), hand=index('r_hand_1');
  // Contact and nearby poses are solved from the curled knuckle and authored wrist direction.
  const palmAngle=at([[0,baseAngle],[.25,baseAngle-4],[.6,10],[.8,contactAngle-6],[.98,contactAngle-6],[1.1,contactAngle],[1.48,contactAngle+8],[1.7,contactAngle-5],[2.08,contactAngle+5],[2.32,contactAngle-12],[2.55,45],[2.85,-15],[3.15,baseAngle-5],[3.6,baseAngle]],t);
  p.local[hand].rotation=palmAngle-Math.atan2(p.world[fore].b,p.world[fore].a)/rad;
  p.updateWorld(d);
  const contact=p.world[index('foam_palm_anchor')], face=p.world[index('foam_face_anchor')];
  const localTip=[contact.tx-p.world[hand].tx,contact.ty-p.world[hand].ty];
  const dx=at([[0,0],[.98,16],[1.1,3],[1.48,-23],[1.7,5],[2.08,-20],[2.15,-22],[2.32,-4],[2.55,25],[3.6,0]],t);
  const dy=at([[0,0],[.98,-18],[1.1,-2],[1.48,-12],[1.7,-2],[2.08,-16],[2.15,-18],[2.32,-35],[2.55,-80],[3.6,0]],t);
  const wrist=[face.tx+dx-localTip[0],face.ty+dy-localTip[1]];
  const origin=p.world[upper], v1=[p.local[fore].x,p.local[fore].y], v2=[p.local[hand].x,p.local[hand].y];
  const l1=Math.hypot(...v1),l2=Math.hypot(...v2),vx=wrist[0]-origin.tx,vy=wrist[1]-origin.ty,dist=Math.hypot(vx,vy);
  const theta=Math.atan2(vy,vx)+Math.acos(Math.max(-1,Math.min(1,(l1*l1+dist*dist-l2*l2)/(2*l1*dist))));
  const parent=p.world[d.bones[upper].parent];
  let upperAngle=(theta-Math.atan2(v1[1],v1[0])-Math.atan2(parent.b,parent.a))/rad;
  while(upperAngle>0)upperAngle-=360;
  // Designed approach and release poses keep the elbow low rather than swinging it outwards.
  if(t<.8)upperAngle=at([[0,base.local[upper].rotation],[.25,base.local[upper].rotation-3],[.6,-83],[.8,upperAngle]],t);
  if(t>2.32)upperAngle=at([[2.32,upperAngle],[2.55,-70],[2.85,-73],[3.15,-73],[3.6,base.local[upper].rotation]],t);
  p.local[upper].rotation=upperAngle; p.updateWorld(d);
  const elbow=p.world[fore];
  let foreAngle=(Math.atan2(wrist[1]-elbow.ty,wrist[0]-elbow.tx)-Math.atan2(v2[1],v2[0])-Math.atan2(p.world[upper].b,p.world[upper].a))/rad;
  while(foreAngle>180)foreAngle-=360;
  while(foreAngle< -180)foreAngle+=360;
  if(t<.8)foreAngle=at([[0,base.local[fore].rotation],[.25,base.local[fore].rotation-3],[.6,-72],[.8,foreAngle]],t);
  if(t>2.32)foreAngle=at([[2.32,foreAngle],[2.55,-138],[2.85,-78],[3.15,-12],[3.6,base.local[fore].rotation]],t);
  p.local[fore].rotation=foreAngle; p.updateWorld(d);
  let wristRotation=palmAngle-Math.atan2(p.world[fore].b,p.world[fore].a)/rad;
  while(wristRotation>180)wristRotation-=360;
  while(wristRotation< -180)wristRotation+=360;
  if(t<.8)wristRotation=at([[0,base.local[hand].rotation],[.25,-6],[.6,-18],[.8,wristRotation]],t);
  if(t>2.32)wristRotation=at([[2.32,wristRotation],[2.55,15],[2.85,-12],[3.15,-8],[3.6,base.local[hand].rotation]],t);
  p.local[hand].rotation=wristRotation; p.updateWorld(d);
  for(const name of controlled){
    const i=index(name),tl=a.boneTimelineMut(i),local=p.local[i],setup=d.bones[i].setup;
    let value=local.rotation-setup.rotation;
    const prev=tl.rotate.at(-1)?.value;
    if(prev!==undefined){while(value-prev>180)value-=360;while(value-prev< -180)value+=360;}
    tl.rotate.push(makeKey(t,value,ease));
    tl.translate.push(makeKey(t,[local.x-setup.x,local.y-setup.y],ease));
    tl.scale.push(makeKey(t,[local.scale_x/setup.scale_x,local.scale_y/setup.scale_y],ease));
  }
  poses.push({time:t,elbow:[p.world[fore].tx,p.world[fore].ty],wrist:[p.world[hand].tx,p.world[hand].ty],tip:[p.world[index('foam_palm_anchor')].tx,p.world[index('foam_palm_anchor')].ty],face:[face.tx,face.ty]});
}
// Match velocities across pose keys; only actual extrema and deliberate holds stop.
for(const tl of a.bones){
  const keys=tl.rotate;
  const slopes=keys.slice(1).map((k,i)=>(k.value-keys[i].value)/(k.time-keys[i].time));
  const tangent=keys.map((_,i)=>{
    if(i===0||i===keys.length-1)return 0;
    if(slopes[i-1]*slopes[i]<=0)return 0;
    return 2*slopes[i-1]*slopes[i]/(slopes[i-1]+slopes[i]);
  });
  for(let i=0;i<keys.length-1;i++){
    const delta=keys[i+1].value-keys[i].value,h=keys[i+1].time-keys[i].time;
    keys[i].curve=delta===0?'linear':{bezier:[1/3,tangent[i]*h/(3*delta),2/3,1-tangent[i+1]*h/(3*delta)]};
  }
}
// Pose-space sleeve corrections preserve elbow volume while the seam retains two-bone weights.
for(const {slot,att,bone,parent,canonical} of sleeveMeshes){
  const keys=[];
  for(const time of [...new Set([...Array.from({length:109},(_,i)=>i/30),...authoredTimes])].sort((a,b)=>a-b)){
    p.reset(d);p.apply(d,d.animations.find(x=>x.name==='idle'),0,1);p.apply(d,a,time,1);p.updateWorld(d);
    const flex=clamp(Math.abs(p.local[index('r_arm_2')].rotation-base.local[index('r_arm_2')].rotation)/170);
    const settle=at([[0,0],[.8,1],[1.1,-.4],[1.45,.35],[1.8,-.25],[2.15,.3],[2.5,-.7],[2.85,.6],[3.2,-.2],[3.6,0]],time);
    const world=p.world[bone],parentWorld=p.world[parent],deltas=[];
    for(let i=0;i<canonical.length;i++){
      const [x,y]=canonical[i];
      let target;
      if(att.name.startsWith('r_arm_2')){
        const w=att.weights[i].find(w=>w.bone===parent)?.weight||0;
        const theta=Math.atan2(world.b,world.a)-w*(p.local[bone].rotation-d.bones[bone].setup.rotation)*rad*.2;
        const localX=x*foreProjection(time)+flex*clamp((100-x)/140)*6;
        const localY=y*(1-flex*.16*clamp((100-x)/120))+settle*2.5*Math.sin(Math.PI*clamp(x/260));
        target=[world.tx+Math.cos(theta)*localX-Math.sin(theta)*localY,world.ty+Math.sin(theta)*localX+Math.cos(theta)*localY];
      }else{
        const elbow=clamp((x-210)/95);
        const localX=x*upperProjection(time)-flex*elbow*22,localY=y*(1+flex*.1*elbow)+settle*2*Math.sin(Math.PI*clamp(x/300));
        const rigid=world.apply([localX,localY]);
        const w=att.weights[i].find(w=>w.bone===parent);
        const parentPoint=w?parentWorld.apply([w.x,w.y]):rigid;
        const mix=w?.weight||0;
        target=[rigid[0]*(1-mix)+parentPoint[0]*mix,rigid[1]*(1-mix)+parentPoint[1]*mix];
      }
      for(const weight of att.weights[i]){
        const local=p.world[weight.bone].inverse().apply(target);
        deltas.push(local[0]-weight.x,local[1]-weight.y);
      }
    }
    keys.push(makeKey(time,{offset:0,vertices:deltas}));
  }
  a.deform.push({skin:'00',slot,attachment:att.name,keys});
  if(att.name==='l_arm_1_wipe_v2')a.deform.push({skin:'00',slot:frontSlot,attachment:att.name,keys:structuredClone(keys)});
}
// Adapt the character's existing blink artwork to contact, rather than flattening the face.
const blink=new Pose(d);blink.apply(d,d.animations.find(x=>x.name==='idle'),1.8,1);
for(const timeline of d.animations.find(x=>x.name==='idle').deform){
  const slotName=d.slots[timeline.slot].name;
  if(!/^[lr]_eye/.test(slotName))continue;
  const vertices=blink.deform.get(`${timeline.slot}/${timeline.attachment}`);
  if(!vertices?.some(v=>Math.abs(v)>.001))continue;
  const right=slotName.startsWith('r_');
  const amount=right?[[0,0],[.65,0],[.98,.8],[1.1,1],[1.48,1],[1.7,.86],[2.08,1],[2.32,.8],[2.6,0],[3.6,0]]:[[0,0],[.75,0],[1.1,.32],[1.7,.22],[2.2,.3],[2.6,0],[3.6,0]];
  a.deform.push({skin:timeline.skin,slot:timeline.slot,attachment:timeline.attachment,keys:amount.map(([t,v])=>makeKey(t,{offset:0,vertices:Array.from(vertices,x=>x*v)},ease))});
}
for(const tl of a.bones)for(const channel of ['rotate','translate','scale']){
  const keys=tl[channel];
  if(keys.length && keys.every(k=>JSON.stringify(k.value)===JSON.stringify(keys[0].value)))tl[channel]=[keys[0],keys.at(-1)];
}
const error=d.validate();if(error)throw new Error(error);
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,'c010_00.foam_wipe.json'),JSON.stringify(writeSkeletonJson(d,{version:'4.3'}).json));
await fs.writeFile(path.join(out,'authoring-poses.json'),JSON.stringify({contactAngle,poses},null,2));
if(process.argv.includes('--save-project'))await fs.writeFile(path.join(out,'c010_00.foam_wipe.rigby'),zip([{path:'project.json',bytes:new TextEncoder().encode(d.toJson())},...[...project.entries].filter(([name])=>name!=='project.json').map(([name,bytes])=>({path:name,bytes}))]));
console.log(JSON.stringify({out,contactAngle,keys:authoredTimes.length}));

