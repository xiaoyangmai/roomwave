/* Independent painted character sprites, registered over separate scene layers. */
(() => {
  'use strict';
  const poses=['idle','idle-cheer','idle-pout','water','recover','fan-hold-a','fan-hold-b','fan-hold-c','fan-catch','fan-missed-shorts','fan-missed-shorts-alt','fan-missed-shorts-gamer','foam-brush','foam-wipe'];
  const baseAnchors={hair:[.40,.13],'headphone-left':[.365,.070],'headphone-right':[.59,.055],bangs:[.425,.198],'shoulder-left':[.327,.35],'shoulder-right':[.711,.35],shirt:[.56,.449],skirt:[.57,.66],'hand-left':[.424,.548],'hand-right':[.62,.557],hand:[.62,.557],cheek:[.44,.245]};
  const anchorsFor=pose=>({...baseAnchors,...(pose.startsWith('fan-hold')||pose==='fan-catch'?{'hand-right':[.617,.667],hand:[.617,.667]}:pose==='foam-wipe'?{'hand-left':[.364,.182],'shoulder-left':[.32,.34]}:pose==='foam-brush'?{'hand-left':[.686,.327],'shoulder-right':[.70,.34]}:{})});
  const frames=Object.fromEntries(poses.map(name=>{const registration=window.GamingSeatedRegistration?.[name]||{};return[name,Object.freeze({name,x:0,y:0,scale:1,...registration,anchors:{...anchorsFor(name),...(registration.anchors||{})}})];}));
  const variants=Object.freeze({shorts:Object.freeze({pose:'fan-missed-shorts',label:'Lilac',description:'lilac'})});
  const defaultVariant='shorts';
  function select(frame,{reduced=false}={}) {
    if(frame.pose==='fan-missed')return variants[defaultVariant].pose;
    if(frame.pose==='fan-late')return 'fan-catch';
    if(frame.pose==='fan-hold')return `fan-hold-${['a','b','c','b'][reduced?0:Math.floor(frame.clock/310)%4]}`;
    if(frame.pose==='foam-notice'||frame.pose==='foam-brush')return 'idle-pout';
    if(frame.pose==='foam-wipe'||frame.pose==='recover')return frame.pose;
    if(frame.pose==='fan-onset'||frame.pose==='foam-onset')return 'idle';
    if(frame.expression==='delighted'||frame.expression==='excited')return 'idle-cheer';
    if(frame.expression==='startled')return 'water';
    if(['sheepish','surprised','pouting','playfully-annoyed'].includes(frame.expression))return 'idle-pout';
    return 'idle';
  }
  const wetPoses=Object.freeze([...poses]);
  // Gamer shorts retain their approved damp drawing at the full-wet stage.
  const materials=Object.freeze(Object.fromEntries(poses.map(pose=>[pose,Object.freeze({dry:pose,damp:`${pose}-damp`,wet:`${pose}-${pose==='fan-missed-shorts-gamer'?'damp':'wet'}`})])));
  const materialNotes=Object.freeze({'fan-missed-shorts-gamer':'Gamer shorts retain their damp illustration at full wetness.'});
  const assets=Object.freeze(['background','chair',...new Set(Object.values(materials).flatMap(Object.values))]);
  const archivedShortsAssets=new Set(['fan-missed-shorts-alt','fan-missed-shorts-gamer'].flatMap(pose=>Object.values(materials[pose])));
  const roomAssets=Object.freeze(assets.filter(name=>!archivedShortsAssets.has(name)));
  const originalWet=new Set(['idle']);
  const nextAssets=new Set(['fan-missed-shorts-gamer',...poses.filter(pose=>pose!=='idle').map(pose=>`${pose}-damp`),...poses.filter(pose=>!originalWet.has(pose)&&pose!=='fan-missed-shorts-gamer').map(pose=>`${pose}-wet`)]);
  const assetUrls=Object.freeze(Object.fromEntries(assets.map(name=>[name,`assets/gaming-seated-${nextAssets.has(name)?'v3':'v2'}/${name}.webp`])));
  const materialFrames=Object.freeze(Object.fromEntries(Object.entries(materials).flatMap(([pose,stages])=>Object.values(stages).map(name=>[name,Object.freeze({...frames[pose],...(window.GamingSeatedRegistration?.[name]||{}),name})]))));
  window.GamingSeatedSprites=Object.freeze({poses:Object.freeze(poses),wetPoses,frames:Object.freeze(frames),materialFrames,materials,materialNotes,assets,roomAssets,assetUrls,variants,defaultVariant,select,baseAnchors:Object.freeze(baseAnchors),width:810,height:1080});
})();
