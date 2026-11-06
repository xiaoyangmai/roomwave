// Bake an editable performance into Rigby/Spine timelines. No runtime bone overrides.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProject } from '../../rigby2d/src/mcp/tools.js';
import { Animation, makeKey } from '../../rigby2d/src/core/animation.js';
import { Pose } from '../../rigby2d/src/core/pose.js';
import { makeBone } from '../../rigby2d/src/core/model.js';
import { identityTransform } from '../../rigby2d/src/core/math.js';
import { zip } from '../../rigby2d/src/editor/zip.js';
import { writeSkeletonJson } from '../../rigby2d/src/core/interop.js';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const output = path.join(root, 'spine_manager/artifacts/runs/c010-foam-wipe-20261104/authored');
const project = await loadProject(path.join(root, 'spine_manager/source/c010/c010_00.rigby'));
const d = project.doc;
const index = name => d.bones.findIndex(b => b.name === name);
const base = new Pose(d);
base.apply(d, d.animations.find(a => a.name === 'idle'), 0, 1);
base.updateWorld(d);
// Face surface, not the external face_con control. Palm contact is beyond the wrist.
const faceLocal = base.world[index('head')].inverse().apply([45, 1784]);
// Preserve the existing product's independent strap target for the other actions.
const strapTarget = structuredClone(d.bones[index('ik_arm_r')]);
strapTarget.name = 'strap_target_r';
d.bones.push(strapTarget);
d.extra.constraints.find(c => c.data.name === 'string_2').data.source = 'strap_target_r';
d.bones.push(makeBone('foam_face_anchor', index('head'), { ...identityTransform(), x: faceLocal[0], y: faceLocal[1] }, 0));
d.bones.push(makeBone('foam_palm_anchor', index('r_hand_1'), { ...identityTransform(), x: 65 }, 0));
const a = new Animation('foam_wipe', 3.6);
d.animations.push(a);
// The original sleeve weights fold when this arm reaches the face. Keep those
// attachments for the source actions, and give this action rigid sleeve pieces.
// Rebind through the setup world pose so both variants have identical setup art.
const sleeveSetup = new Pose(d);
sleeveSetup.updateWorld(d);
for (const name of ['l_arm_1', 'r_arm_2']) {
  const slot = d.slots.findIndex(s => s.name === name), bone = index(name);
  const inverse = sleeveSetup.world[bone].inverse();
  for (const skin of d.skins) {
    const attachments = d.skinAttachments(slot, skin.name);
    const sleeve = structuredClone(attachments.find(att => att.name === name));
    sleeve.name = `${name}_foam`;
    if (sleeve.type === 'linkedmesh') sleeve.parent = `${name}_foam`;
    else sleeve.weights = sleeve.weights.map(weights => {
      const world = weights.reduce((sum, w) => {
        const point = sleeveSetup.world[w.bone].apply([w.x, w.y]);
        return [sum[0] + point[0] * w.weight, sum[1] + point[1] * w.weight];
      }, [0, 0]);
      const local = inverse.apply(world);
      return [{ bone, x: local[0], y: local[1], weight: 1 }];
    });
    attachments.push(sleeve);
  }
  a.slotTimelineMut(slot).attachment = [makeKey(0, `${name}_foam`, 'stepped'), makeKey(3.6, name, 'stepped')];
}
for (const name of ['FoamNotice', 'FoamContact', 'FoamCleared', 'FoamComplete'])
  d.events.push({ name, int: 0, float: 0, string: null, audio: null, volume: 1, balance: 0 });
a.events = [{ time: .1, name: 'FoamNotice' }, { time: 1.1, name: 'FoamContact' }, { time: 2.15, name: 'FoamCleared' }, { time: 3.6, name: 'FoamComplete' }];
// Keep the upper-arm root under the jacket, bring forearm/hand in front of face/hair.
a.drawOrder = [makeKey(0, null, 'stepped'), makeKey(.52, Array.from({ length: 9 }, (_, j) => ({ slot: 17 + j, offset: 105 })), 'stepped'), makeKey(3.12, null, 'stepped')];

const fingers = { r_hand_3: -4, r_hand_2: 4, r_finger_1: -18, r_finger_2: 4, r_finger_3: -8, r_finger_4: -6, r_finger_5: -3, r_finger_6: -9, r_finger_7: -7, r_finger_8: -10, r_finger_9: -8, r_finger_10: -4, r_finger_11: -13, r_finger_12: -10 };
const controlled = ['body_1', 'body_2', 'body_con', 'shoulder_l', 'neck_1', 'head', 'l_brow', 'r_brow', 'l_arm_1', 'r_arm_2', 'r_hand_1', ...Object.keys(fingers)];
const p = new Pose(d);
const radians = Math.PI / 180;
const smooth = t => t * t * (3 - 2 * t);
function valueAt(keys, t) {
  const n = keys.findIndex(k => k[0] >= t);
  if (n <= 0) return keys[n < 0 ? keys.length - 1 : 0][1];
  const v = smooth((t - keys[n - 1][0]) / (keys[n][0] - keys[n - 1][0]));
  return keys[n - 1][1] + (keys[n][1] - keys[n - 1][1]) * v;
}
const initialPalm = base.world[index('r_hand_1')].apply([65, 0]);
const initialAngle = Math.atan2(base.world[index('r_hand_1')].b, base.world[index('r_hand_1')].a) / radians;
const samples = [];
const times = [...Array.from({ length: 109 }, (_, frame) => frame / 30), 2.15, 3.15].sort((x, y) => x - y);
for (const t of times) {
  p.reset(d);
  p.apply(d, d.animations.find(x => x.name === 'idle'), 0, 1);
  const reach = valueAt([[0, 0], [.3, 0], [1.1, 1], [2.15, 1], [3.15, 0], [3.6, 0]], t);
  const open = valueAt([[0, 0], [.4, 0], [.98, 1], [2.3, 1], [3.25, 0], [3.6, 0]], t);
  p.local[index('body_1')].rotation += valueAt([[0, 0], [.3, -1.2], [1.1, 1], [2.1, 1.3], [3.25, -.4], [3.6, 0]], t);
  p.local[index('head')].rotation += valueAt([[0, 0], [.28, -2], [.65, 3], [1.1, 5], [1.45, 6.5], [1.7, 4.5], [2.05, 6], [2.5, 2], [3.3, -1], [3.6, 0]], t);
  // A small version of the source worry brow pose; eye meshes keep their own blink.
  const notice = valueAt([[0, 0], [.28, 1], [.65, 1], [1.1, 0], [3.6, 0]], t);
  p.local[index('l_brow')].rotation += 4 * notice;
  p.local[index('r_brow')].rotation -= 4 * notice;
  p.local[index('l_brow')].x += 3 * notice;
  p.local[index('r_brow')].x += 3 * notice;
  for (const [name, angle] of Object.entries(fingers))
    p.local[index(name)].rotation += (angle - p.local[index(name)].rotation) * open;
  p.updateWorld(d);
  const face = p.world[index('foam_face_anchor')];
  const wipeX = valueAt([[0, 0], [1.1, 0], [1.43, -34], [1.69, 3], [2.02, -30], [2.15, -26], [2.4, 18], [3.6, 0]], t);
  const wipeY = valueAt([[0, 0], [1.1, 0], [1.43, -12], [1.69, 3], [2.02, -15], [2.4, -35], [3.6, 0]], t);
  const target = [initialPalm[0] + (face.tx + wipeX - initialPalm[0]) * reach,
    initialPalm[1] + (face.ty + wipeY - initialPalm[1]) * reach];
  const angle = initialAngle + (165 - initialAngle) * reach;
  const wrist = [target[0] - 65 * Math.cos(angle * radians), target[1] - 65 * Math.sin(angle * radians)];
  const upper = index('l_arm_1'), fore = index('r_arm_2'), hand = index('r_hand_1');
  const origin = p.world[upper];
  const v1 = [p.local[fore].x * p.local[upper].scale_x, p.local[fore].y];
  const v2 = [p.local[hand].x, p.local[hand].y];
  const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
  const dx = wrist[0] - origin.tx, dy = wrist[1] - origin.ty;
  const distance = Math.hypot(dx, dy);
  const first = Math.atan2(dy, dx) - Math.acos(Math.max(-1, Math.min(1, (l1*l1 + distance*distance - l2*l2)/(2*l1*distance))));
  const parent = p.world[d.bones[upper].parent];
  p.local[upper].rotation = (first - Math.atan2(v1[1], v1[0]) - Math.atan2(parent.b, parent.a)) / radians;
  p.updateWorld(d);
  const elbow = p.world[fore];
  p.local[fore].rotation = (Math.atan2(wrist[1] - elbow.ty, wrist[0] - elbow.tx) - Math.atan2(v2[1], v2[0]) - Math.atan2(p.world[upper].b, p.world[upper].a)) / radians;
  p.updateWorld(d);
  p.local[hand].rotation = angle - Math.atan2(p.world[fore].b, p.world[fore].a) / radians;
  p.updateWorld(d);
  for (const name of controlled) {
    const i = index(name), setup = d.bones[i].setup, local = p.local[i], tl = a.boneTimelineMut(i);
    let rotation = local.rotation - setup.rotation;
    const previous = tl.rotate.at(-1)?.value;
    if (previous !== undefined) { while (rotation - previous > 180) rotation -= 360; while (rotation - previous < -180) rotation += 360; }
    tl.rotate.push(makeKey(t, rotation));
    tl.translate.push(makeKey(t, [local.x - setup.x, local.y - setup.y]));
    tl.scale.push(makeKey(t, [local.scale_x / setup.scale_x, local.scale_y / setup.scale_y]));
  }
  samples.push({ time: t, ...(t >= 1.1 && t <= 2.15 ? { target } : {}) });
}
// Only contact needs the geometric solve. Crossing the shoulder on a straight
// wrist path makes that solve spin, so approach and return use shortest joint arcs.
const rotationDeltas = {};
for (const name of ['l_arm_1', 'r_arm_2', 'r_hand_1']) {
  const i = index(name), keys = a.boneTimelineMut(i).rotate;
  const baseline = base.local[i].rotation - d.bones[i].setup.rotation;
  const first = keys.find(k => k.time === 1.1).value;
  let firstShort = first;
  while (firstShort - baseline > 180) firstShort -= 360;
  while (firstShort - baseline < -180) firstShort += 360;
  const offset = firstShort - first;
  const lastShort = keys.find(k => k.time === 2.15).value + offset;
  for (const key of keys) {
    if (key.time < 1.1) key.value = baseline + (firstShort - baseline) * smooth(Math.max(0, (key.time - .3) / .8));
    else if (key.time <= 2.15) key.value += offset;
    else key.value = lastShort + (baseline - lastShort) * smooth(Math.min(1, (key.time - 2.15) / 1));
  }
  const frames = keys.filter(k => Math.abs(k.time * 30 - Math.round(k.time * 30)) < 1e-6);
  const changes = frames.slice(1).map((key, frame) => ({ time: key.time, degrees: key.value - frames[frame].value }));
  rotationDeltas[name] = changes.reduce((largest, change) => Math.abs(change.degrees) > Math.abs(largest.degrees) ? change : largest);
}
for (const sample of samples) {
  p.reset(d);
  p.apply(d, d.animations.find(x => x.name === 'idle'), 0, 1);
  p.apply(d, a, sample.time, 1);
  p.updateWorld(d);
  sample.palm = [p.world[index('foam_palm_anchor')].tx, p.world[index('foam_palm_anchor')].ty];
  if (sample.target) sample.contactError = Math.hypot(sample.palm[0] - sample.target[0], sample.palm[1] - sample.target[1]);
}
const maxContactError = Math.max(...samples.filter(s => s.target).map(s => s.contactError));
// Constant channels need only their endpoint keys; rotations retain the sampled hand path.
for (const tl of a.bones) for (const channel of ['rotate', 'translate', 'scale']) {
  const keys = tl[channel];
  if (keys.every(k => JSON.stringify(k.value) === JSON.stringify(keys[0].value))) tl[channel] = [keys[0], keys.at(-1)];
}
d.validate();
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, 'c010_00.foam_wipe.rigby'), zip([{ path: 'project.json', bytes: new TextEncoder().encode(d.toJson()) }, ...[...project.entries].filter(([name]) => name !== 'project.json').map(([name, bytes]) => ({ path: name, bytes }))]));
await fs.writeFile(path.join(output, 'c010_00.foam_wipe.json'), JSON.stringify(writeSkeletonJson(d, { version: '4.3' }).json));
await fs.writeFile(path.join(output, 'authoring-samples.json'), JSON.stringify({ duration: a.duration, faceLocal, contactInterval: [1.1, 2.15], maxContactError, maxRotationDegreesPerFrameAt30Fps: rotationDeltas, samples }, null, 2));
console.log(JSON.stringify({ output, animations: d.animations.length, maxContactError, maxRotationDegreesPerFrameAt30Fps: rotationDeltas }));
