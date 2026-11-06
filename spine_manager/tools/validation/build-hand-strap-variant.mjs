import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const outputRoot = path.join(repoRoot, 'resources/characters/c010_00');
const modelRoot = path.join(outputRoot, 'model');
const sourcePath = path.join(repoRoot, 'spine_manager/source/c010/c010_00.json');
const variantPath = path.join(modelRoot, 'c010_00.hand-strap-isolated.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const variant = JSON.parse(JSON.stringify(source));
const handTarget = variant.bones.find(bone => bone.name === 'ik_arm_r');
if (!handTarget) throw new Error('Cannot build variant: ik_arm_r is missing.');
if (fs.existsSync(variantPath) && process.env.FORCE !== '1') throw new Error('Cannot build variant: output already exists. Use FORCE=1 to rebuild.');
variant.bones.push({
  name: 'strap_target_r',
  parent: handTarget.parent,
  x: handTarget.x,
  y: handTarget.y,
  rotation: handTarget.rotation,
});
const constraints = Array.isArray(variant.constraints) ? variant.constraints : Object.values(variant.constraints || {});
const strapConstraint = constraints.find(constraint => constraint.name === 'string_2');
if (!strapConstraint) throw new Error('Cannot build variant: string_2 transform constraint is missing.');
if (strapConstraint.type !== 'transform') throw new Error(`Cannot build variant: string_2 is ${strapConstraint.type}, not transform.`);
if (strapConstraint.source !== 'ik_arm_r') throw new Error(`Cannot build variant: unexpected string_2 source ${strapConstraint.source}.`);
strapConstraint.source = 'strap_target_r';
fs.writeFileSync(variantPath, `${JSON.stringify(variant, null, 2)}\n`);

const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = {
  schemaVersion: 1,
  kind: 'runtime-model-variant',
  id: 'c010-hand-strap-isolated',
  source: 'c010_00.json',
  variant: 'c010_00.hand-strap-isolated.json',
  sourceSha256: sha256(sourcePath),
  variantSha256: sha256(variantPath),
  spineExport: source.skeleton?.spine || null,
  runtimeBaseline: 'spine-canvas-4.3.13',
  changes: [
    { type: 'add-bone', name: 'strap_target_r', parent: handTarget.parent, copiedPoseFrom: 'ik_arm_r' },
    { type: 'retarget-transform-constraint', constraint: 'string_2', from: 'ik_arm_r', to: 'strap_target_r' },
  ],
  sourceUnmodified: true,
  status: 'candidate',
  releaseNote: 'This isolates the strap target for runtime validation. It is not a replacement for an editable Spine source export.'
};
fs.writeFileSync(path.join(modelRoot, 'c010_00.hand-strap-isolated.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
const bindingPath = path.join(repoRoot, 'spine_manager/source/c010/semantic-binding.json');
if (fs.existsSync(bindingPath)) {
  const binding = JSON.parse(fs.readFileSync(bindingPath, 'utf8'));
  binding.schemaVersion = 3;
  binding.source = {
    ...binding.source,
    root: 'model/c010_00.hand-strap-isolated.json',
    originalExport: 'spine_manager/source/c010/c010_00.json',
    runtimeVariant: 'c010_00.hand-strap-isolated',
    runtimeBaseline: 'spine-canvas-4.3.13',
  };
  binding.semantics.roles.strapControlTarget = {
    candidates: ['strap_target_r'],
    resolved: 'strap_target_r',
    status: 'available',
    needsVisualConfirmation: false,
  };
  binding.semantics.roles.strapVisual = {
    candidates: ['string_2'],
    resolved: 'string_2',
    status: 'available',
    needsVisualConfirmation: false,
  };
  binding.semantics.note += ' The product candidate uses c010_00.hand-strap-isolated.json, where strapControlTarget is independent from handTarget.';
  fs.writeFileSync(path.join(outputRoot, 'semantic-binding-runtime.json'), `${JSON.stringify(binding, null, 2)}\n`);
}
console.log(JSON.stringify(manifest, null, 2));
