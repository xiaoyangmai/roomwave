import fs from 'node:fs';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonBinary, FakeTexture } from '@esotericsoftware/spine-core';
const base='C:/Users/mi/Desktop/NIKKE_Spine_10/c010';
const atlas=new TextureAtlas(fs.readFileSync(base+'/c010_00.atlas','utf8')); atlas.pages.forEach(p=>p.setTexture(new FakeTexture({width:p.width,height:p.height})));
const data=new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(fs.readFileSync(base+'/c010_00.skel')));
console.log('BONES'); console.log(data.bones.map((b,i)=>`${i}\t${b.name}\tparent=${b.parent?.name||'-'}\tlen=${b.length}`).join('\n'));
console.log('SLOTS'); console.log(data.slots.map((s,i)=>`${i}\t${s.name}\tbone=${s.bone.name}\tattachment=${s.attachment||'-'}`).join('\n'));
console.log('IK'); console.log(data.ikConstraints.map(c=>({name:c.name,bones:c.bones.map(b=>b.name),target:c.target.name,mix:c.mix,order:c.order}))); 
console.log('TRANSFORM'); console.log(data.transformConstraints.map(c=>({name:c.name,bone:c.bone?.name,bones:c.bones?.map(b=>b.name),target:c.target?.name,order:c.order})).slice(0,120));
console.log('EVENTS'); console.log(data.events.map(e=>({name:e.name,audio:e.audioPath,int:e.intValue,float:e.floatValue,string:e.stringValue})));
for(const skin of data.skins){const entries=skin.getAttachments(); const types={}; let weighted=0,mesh=0,region=0,point=0,bbox=0,path=0,clip=0; for(const e of entries){const t=e.attachment?.constructor?.name||'unknown'; types[t]=(types[t]||0)+1; if(e.attachment?.bones) weighted++; if(t==='MeshAttachment')mesh++; if(t==='RegionAttachment')region; }
console.log('SKIN',skin.name,{entries:entries.length,types,weighted});
}
