import assert from 'node:assert/strict';
import { AnchorSampler } from '../src/canvas/anchor-sampler.js';

const bones = {
  handTarget: { appliedPose: { worldX: 10, worldY: 20 } },
  strap_target_r: { appliedPose: { worldX: -4, worldY: 8 } },
  string_2: { appliedPose: { worldX: -2, worldY: 6 } },
};
const sampler = new AnchorSampler({
  skeleton: { findBone: (name) => bones[name] || null },
  binding: { semantics: { roles: { handTarget: { resolved: 'handTarget' } } } },
  width: 200,
  height: 100,
  camera: { scale: 2, cx: 0, cy: 0 },
  fit: { offsetX: 3, offsetY: 4 },
});

assert.deepEqual(sampler.getAnchor('handTarget'), {
  x: 123,
  y: 54,
  worldX: 10,
  worldY: 20,
  bone: 'handTarget',
});
assert.equal(sampler.getAnchor('strapControlTarget').bone, 'strap_target_r');
assert.equal(sampler.getAnchor('strapVisual').bone, 'string_2');
assert.equal(sampler.getAnchor('missing'), null);

console.log('anchor-sampler: pass');
