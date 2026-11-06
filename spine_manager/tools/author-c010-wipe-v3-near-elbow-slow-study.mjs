// Isolated blocking variant: lower, closer elbow to shorten the projected forearm.
import fs from 'node:fs/promises';
const source = await fs.readFile(new URL('./author-c010-wipe-v3-arm-medium-study.mjs', import.meta.url), 'utf8');
const variant = source
  .replaceAll('c010-foam-wipe-v3-arm-medium-study-20261105', 'c010-foam-wipe-v3-near-elbow-slow-study-20261105')
  .replace('const elbowContact=[face.tx+230,face.ty-300];', 'const elbowContact=[face.tx+145,face.ty-360];')
  .replace('[[0,base.world[fore][i?\'ty\':\'tx\']],[.25,base.world[fore][i?\'ty\':\'tx\']],[.42,[225,1340][i]],[.5,[250,1350][i]],[.6,[285,1375][i]],[.7,[315,1405][i]],[.8,[330,1440][i]],[.98,[340,1480][i]],[1.1,elbowContact[i]],[2.32,elbowContact[i]],[2.55,[330,1460][i]],[2.85,[315,1400][i]],[3.15,[245,1350][i]],[3.6,base.world[fore][i?\'ty\':\'tx\']]]', '[[0,base.world[fore][i?\'ty\':\'tx\']],[.25,base.world[fore][i?\'ty\':\'tx\']],[.42,[235,1320][i]],[.5,[270,1330][i]],[.6,[315,1350][i]],[.7,[355,1365][i]],[.8,[325,1390][i]],[.98,[260,1425][i]],[1.1,elbowContact[i]],[2.32,elbowContact[i]],[2.55,[260,1425][i]],[2.85,[350,1360][i]],[3.15,[255,1330][i]],[3.6,base.world[fore][i?\'ty\':\'tx\']]]');
const retimed = variant.replace('const error=d.validate();', `
// Stretch the approach only; contact and recovery retain their durations.
const warp = time => time <= 1.1 ? time * 1.5 : time + .55;
for (const timeline of a.bones) for (const keys of Object.values(timeline)) if (Array.isArray(keys)) for (const key of keys) key.time=warp(key.time);
for (const timeline of a.slots) for (const keys of Object.values(timeline)) if (Array.isArray(keys)) for (const key of keys) key.time=warp(key.time);
for (const timeline of a.deform) for (const key of timeline.keys) key.time=warp(key.time);
for (const key of a.drawOrder) key.time=warp(key.time);
for (const event of a.events) event.time=warp(event.time);
a.duration=warp(a.duration);
const error=d.validate();`);
const study = new URL('./.c010-near-elbow-slow-generated.mjs', import.meta.url);
await fs.writeFile(study, retimed);
try { await import(study); } finally { await fs.unlink(study); }
