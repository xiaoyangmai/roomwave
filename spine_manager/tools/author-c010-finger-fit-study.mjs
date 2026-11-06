// Isolated two-joint hand-pose experiment; no source image or product resource is modified.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProject } from '../../rigby2d/src/mcp/tools.js';
import { Animation, makeKey } from '../../rigby2d/src/core/animation.js';
import { zip } from '../../rigby2d/src/editor/zip.js';
import { addC010DorsalHand } from './c010-dorsal-hand-distal-study.mjs';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const out = path.join(root, 'spine_manager/artifacts/runs/c010-finger-fit-study-20261106/authored');
const project = await loadProject(path.join(root, 'spine_manager/source/c010/c010_00.rigby'));
const hand = addC010DorsalHand(project, await fs.readFile(path.join(root, 'spine_manager/source/c010-foam-wipe-v3/left-glove-dorsal-contact.png')));
const animation = new Animation('finger_probe', 1);
project.doc.animations.push(animation);
for (const slot of [...hand.fingerSlots, hand.handSlot]) {
  animation.slotTimelineMut(slot).attachment = [makeKey(0, slot === hand.handSlot ? 'dorsal_contact' : null, 'stepped')];
}
animation.boneTimelineMut(hand.indexBone).rotate = [makeKey(0, 0), makeKey(1, -14.1)];
animation.boneTimelineMut(hand.tipBone).rotate = [makeKey(0, 0), makeKey(1, 90.1)];
await fs.mkdir(out, { recursive: true });
await fs.writeFile(path.join(out, 'finger-probe.rigby'), zip([
  { path: 'project.json', bytes: new TextEncoder().encode(project.doc.toJson()) },
  ...[...project.entries].filter(([name]) => name !== 'project.json').map(([name, bytes]) => ({ path: name, bytes })),
]));
