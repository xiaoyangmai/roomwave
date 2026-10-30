import fs from 'node:fs';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonBinary, FakeTexture, Skeleton } from '@esotericsoftware/spine-core';
const base='C:/Users/mi/Desktop/NIKKE_Spine_10/c010';
const atlas=new TextureAtlas(fs.readFileSync(base+'/c010_00.atlas','utf8')); atlas.pages.forEach(p=>p.setTexture(new FakeTexture({width:p.width,height:p.height})));
const data=new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(fs.readFileSync(base+'/c010_00.skel'))); const sk=new Skeleton(data); sk.updateWorldTransform();
for(const n of ['ik_arm_r','face_con','face4','head','body_2','r_hand_1','l_hand_1','gun']){const b=sk.findBone(n);console.log(n,b?{x:b.x,y:b.y,worldX:b.worldX,worldY:b.worldY,rot:b.rotation,parent:b.data.parent?.name}:null)}
