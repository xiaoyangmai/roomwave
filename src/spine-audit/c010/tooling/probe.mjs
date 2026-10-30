import fs from 'node:fs';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonBinary } from '@esotericsoftware/spine-core';
const base='C:/Users/mi/Desktop/NIKKE_Spine_10/c010';
const atlasText=fs.readFileSync(base+'/c010_00.atlas','utf8');
const atlas=new TextureAtlas(atlasText);
console.log('regions',atlas.regions.length, 'pages',atlas.pages.length);
const loader=new AtlasAttachmentLoader(atlas);
const binary=new SkeletonBinary(loader); binary.scale=1;
const data=binary.readSkeletonData(new Uint8Array(fs.readFileSync(base+'/c010_00.skel')));
console.log({version:data.version,name:data.name,bones:data.bones.length,slots:data.slots.length,skins:data.skins.length,events:data.events.length,animations:data.animations.length,ik:data.ikConstraints.length,transform:data.transformConstraints.length,path:data.pathConstraints.length,bounds:[data.x,data.y,data.width,data.height]});
console.log('bones',data.bones.map(b=>b.name).slice(0,30));
console.log('animations',data.animations.map(a=>[a.name,a.duration]));
console.log('skins',data.skins.map(s=>s.name));
for(const skin of data.skins){console.log('skin',skin.name,'attachments',skin.getAttachments().length,'bones',skin.bones?.length||0,'constraints',skin.constraints?.length||0)}
