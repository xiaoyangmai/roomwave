import fs from 'node:fs';
import path from 'node:path';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonBinary, FakeTexture } from '@esotericsoftware/spine-core';
const base='C:/Users/mi/Desktop/NIKKE_Spine_10/c010';
const files=[]; function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p); else if(e.name.endsWith('.skel'))files.push(p)}} walk(base);
for(const f of files){const a=f.replace(/\.skel$/i,'.atlas'); try{const atlas=new TextureAtlas(fs.readFileSync(a,'utf8'));atlas.pages.forEach(p=>p.setTexture(new FakeTexture({width:p.width,height:p.height})));const d=new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(fs.readFileSync(f)));console.log(JSON.stringify({file:path.relative(base,f),version:d.version,bones:d.bones.length,slots:d.slots.length,skins:d.skins.length,animations:d.animations.length,ik:d.ikConstraints.length,transform:d.transformConstraints.length,regions:atlas.regions.length}));}catch(err){console.log(JSON.stringify({file:path.relative(base,f),error:String(err)}));}}
