import fs from 'node:fs';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonBinary, FakeTexture } from '@esotericsoftware/spine-core';
const base='C:/Users/mi/Desktop/NIKKE_Spine_10/c010';
const atlas=new TextureAtlas(fs.readFileSync(base+'/c010_00.atlas','utf8')); atlas.pages.forEach(p=>p.setTexture(new FakeTexture({width:p.width,height:p.height})));
const data=new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(fs.readFileSync(base+'/c010_00.skel')));
console.log('IK'); for(const c of data.ikConstraints) console.log(JSON.stringify({name:c.name,bones:c.bones.map(b=>b.name),target:c.target.name,mix:c.mix,order:c.order,bendPositive:c.bendPositive}));
console.log('TRANS'); for(const c of data.transformConstraints) console.log(JSON.stringify({name:c.name,bone:c.bone?.name,bones:c.bones?.map(b=>b.name),target:c.target?.name,mixRotate:c.mixRotate,mixX:c.mixX,mixY:c.mixY,order:c.order}));
console.log('SLOTS'); for(const s of data.slots) console.log(JSON.stringify({index:s.index,name:s.name,bone:s.boneData?.name,attachment:s.attachmentName}));
