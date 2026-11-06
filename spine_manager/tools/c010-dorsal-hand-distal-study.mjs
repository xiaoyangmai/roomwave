// c010 1186x1326 dorsal-contact texture: preserve the original slots and add a pose-specific mesh.
import { makeBone } from '../../rigby2d/src/core/model.js';
import { makeKey } from '../../rigby2d/src/core/animation.js';
import { identityTransform } from '../../rigby2d/src/core/math.js';

export function addC010DorsalHand(project, png) {
  const d=project.doc,handBone=d.bones.findIndex(b=>b.name==='r_hand_1');
  const handSlot=d.slots.findIndex(s=>s.name==='r_hand_1');
  const fingerSlots=['r_finger_5','r_finger_4','r_hand_2','r_finger_3','r_finger_2','r_finger_1'].map(name=>d.slots.findIndex(s=>s.name===name));
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  project.entries.set('images/derived/dorsal_contact.png',new Uint8Array(png));
  // Artwork-pixel to hand-bone-local units, calibrated initially against the v2 contact wrist.
  const map=(px,py)=>{const dx=px-800,dy=1160-py;return [(-700*dx+1030*dy)/1245*.12,(-1030*dx-700*dy)/1245*.12];};
  const indexRoot=map(480,440),otherRoot=map(670,515),tip=map(100,130);
  const indexBone=d.bones.length;d.bones.push(makeBone('dorsal_contact_index',handBone,{...identityTransform(),x:indexRoot[0],y:indexRoot[1]},0));
  const distalRoot=map(300,250), tipBone=d.bones.length;d.bones.push(makeBone('dorsal_contact_index_distal',indexBone,{...identityTransform(),x:distalRoot[0]-indexRoot[0],y:distalRoot[1]-indexRoot[1]},0));
  const otherBone=d.bones.length;d.bones.push(makeBone('dorsal_contact_others',handBone,{...identityTransform(),x:otherRoot[0],y:otherRoot[1]},0));
  const clamp=x=>Math.max(0,Math.min(1,x)),cols=24,rows=28,uvs=[],triangles=[],weights=[];
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
    const u=col/cols,v=row/rows,[x,y]=map(u*width,v*height);
    const wi=clamp((.43-u)/.22)*clamp((.42-v)/.24);
    const wo=clamp((u-.30)/.12)*clamp((.72-u)/.14)*clamp((.42-v)/.24)*.7;
    const total=wi+wo,iw=total>1?wi/total:wi,ow=total>1?wo/total:wo,hw=1-iw-ow;
    const dw=iw*clamp((.31-u)/.10)*clamp((.27-v)/.10);
    weights.push([[handBone,x,y,hw],[indexBone,x-indexRoot[0],y-indexRoot[1],iw-dw],[tipBone,x-distalRoot[0],y-distalRoot[1],dw],[otherBone,x-otherRoot[0],y-otherRoot[1],ow]].filter(a=>a[3]>0).map(([bone,x,y,weight])=>({bone,x,y,weight})));
    uvs.push(u,v);
    if(row<rows&&col<cols){const k=row*(cols+1)+col;triangles.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}
  }
  const att={name:'dorsal_contact',type:'mesh',image:'derived/dorsal_contact',width,height,uvs,triangles,weights,hull:0,edges:[],color:[1,1,1,1]};
  for(const skin of d.skins)d.skinAttachments(handSlot,skin.name).push(structuredClone(att));
  return {handBone,handSlot,fingerSlots,indexBone,otherBone,tipBone,indexTipLocal:[tip[0]-distalRoot[0],tip[1]-distalRoot[1]]};
}

// Attachment switching is discrete: inspect the transition and use alternative views if it pops.
export function keyC010DorsalHand(d, animation, controls, enter, exit) {
  for(const slot of [...controls.fingerSlots,controls.handSlot]){
    const original=d.slots[slot].attachment;
    animation.slotTimelineMut(slot).attachment=[
      makeKey(0,original,'stepped'),
      makeKey(enter,slot===controls.handSlot?'dorsal_contact':null,'stepped'),
      makeKey(exit,original,'stepped'),
    ];
  }
}
