import fs from 'node:fs';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonBinary, FakeTexture, Skeleton } from '@esotericsoftware/spine-core';
const base='C:/Users/mi/Desktop/NIKKE_Spine_10/c010';
const atlas=new TextureAtlas(fs.readFileSync(base+'/c010_00.atlas','utf8')); atlas.pages.forEach(p=>p.setTexture(new FakeTexture({width:p.width,height:p.height})));
const data=new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(fs.readFileSync(base+'/c010_00.skel')));
const sk=new Skeleton(data); sk.updateWorldTransform();
const wanted=['root','center','body_1','body_2','neck_1','head','shoulder_l','shoulder_r','l_arm_1','r_arm_1','l_arm_2','r_arm_2','l_hand_1','r_hand_1','f_hair_1','face_top','l_leg','r_foot','main_string','r_hair_3','l_hair_4_1'];
for(const name of wanted){const b=sk.findBone(name); if(b) console.log(name, JSON.stringify({x:b.worldX,y:b.worldY,rot:b.worldRotation,len:b.data.length,parent:b.data.parent?.name||null}));}
