import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadProject } from '../../rigby2d/src/mcp/tools.js';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const runId = 'c010-foam-wipe-v2-20261105';
const runRoot = path.join(root, 'spine_manager/artifacts/runs', runId);
const rigby = path.join(runRoot, 'authored/c010_00.foam_wipe.rigby');
const exported = path.join(runRoot, 'exported/c010_00.foam_wipe.json');
const stageOnly = process.argv[2] === '--stage-only';
if (process.argv[2] === '--help') {
  console.log('Usage: node tools/run-foam-wipe.mjs [--stage-only]');
  process.exit(0);
}
if (process.argv.length > 3 || (process.argv[2] && !stageOnly)) throw new Error('Use no arguments to author/export/stage, or --stage-only to stage an existing export.');

if (!stageOnly) {
  for (const args of [
    ['spine_manager/tools/author-c010-foam-wipe-v2.mjs', '--save-project'],
    ['spine_manager/tools/export-rigby-json.mjs', rigby, exported],
  ]) {
    const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true });
    if (result.status !== 0) throw new Error(`Production step failed: ${args[0]}`);
  }
}

const relative = file => path.relative(root, file).replaceAll('\\', '/');
const exportReport = JSON.parse(await fs.readFile(exported.replace(/\.json$/, '.export-report.json'), 'utf8'));
if (exportReport.status !== 'pass') throw new Error('The complete JSON export has not passed.');
for (const file of [rigby, exported, exported.replace(/\.json$/, '.atlas'), exported.replace(/\.json$/, '.png')]) {
  const sha = crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
  if (exportReport.files[relative(file)].sha256 !== sha) throw new Error(`Export changed after validation: ${relative(file)}`);
}
const project = await loadProject(exported);
const action = project.doc.animations.find(animation => animation.name === 'foam_wipe');
if (!action || action.duration !== 3.6) throw new Error('Expected the authored 3.6-second foam_wipe clip.');
for (const [name, time] of [['FoamNotice', 0.1], ['FoamContact', 1.1], ['FoamCleared', 2.15], ['FoamComplete', 3.6]]) {
  if (action.events.find(event => event.name === name)?.time !== time) throw new Error(`Expected authored event ${name} at ${time} seconds.`);
}
for (const name of ['foam_face_anchor', 'foam_palm_anchor', 'strap_target_r']) {
  if (!project.doc.bones.some(bone => bone.name === name)) throw new Error(`Required authored/compatibility bone missing: ${name}`);
}

const productRoot = path.join(root, 'resources/characters/c010_00');
const packRoot = path.join(runRoot, 'pack');
const pack = JSON.parse(await fs.readFile(path.join(productRoot, 'character-pack.json'), 'utf8'));
const previousVersion = pack.packVersion;
const binding = JSON.parse(await fs.readFile(path.join(productRoot, pack.binding), 'utf8'));
await fs.mkdir(path.join(packRoot, 'model'), { recursive: true });
for (const extension of ['json', 'atlas', 'png']) {
  await fs.copyFile(exported.replace(/\.json$/, `.${extension}`), path.join(packRoot, `model/c010_00.foam_wipe.${extension}`));
}
pack.packVersion = '0.4.0';
pack.status = 'candidate';
pack.sourceType = 'rigby2d-authored-runtime-export';
pack.editable = true;
pack.skeleton = 'model/c010_00.foam_wipe.json';
pack.atlas = 'model/c010_00.foam_wipe.atlas';
pack.textures = ['model/c010_00.foam_wipe.png'];
pack.binding = 'semantic-binding.json';
pack.audit = 'audit-report.json';
pack.runtime.exportVersion = project.doc.header.version;
pack.animations = [
  ...pack.animations.filter(animation => animation.id !== 'foam_wipe'),
  { id: 'foam_wipe', sourceName: 'foam_wipe', semantic: 'foam_wipe', duration: action.duration, loop: false, phaseModel: 'semantic-action', default: false, interrupt: { mode: 'crossfade-to-idle', mixSeconds: 0.2 } },
];
pack.animationInventory = project.doc.animations.map(animation => ({
  ...(pack.animationInventory.find(item => item.id === animation.name) || {}),
  id: animation.name, sourceName: animation.name, duration: animation.duration,
  ...(animation.name === 'foam_wipe' ? { semantic: 'foam_wipe', sourceLoopFlag: false, loopIntent: 'single-shot' } : {}),
}));
pack.capabilities.actionMode = 'authored-animation';
pack.capabilities.motion.mode = 'authored-foam-with-legacy-actions';
pack.recipes.foam_wipe = {
  id: 'foam_wipe@0.3.0', type: 'foam_wipe', duration: action.duration, timebase: 'seconds', interruptible: true,
  phases: [{ id: 'notice', from: 0, to: 0.3 }, { id: 'reach', from: 0.3, to: 1.1 }, { id: 'contact', from: 1.1, to: 2.15 }, { id: 'recover', from: 2.15, to: 3.6 }],
  events: action.events.map(({ name, time }) => ({ name, time })),
  recovery: { recipe: 'idle_base', maxDuration: 0.6 },
  writeSet: { bones: action.bones.map(timeline => project.doc.bones[timeline.bone].name) },
  source: { type: 'authored-animation', animation: 'foam_wipe', project: relative(rigby) },
};
for (const [role, bone] of Object.entries({ foamFace: 'foam_face_anchor', foamPalm: 'foam_palm_anchor', foamAnchor: 'foam_face_anchor' })) {
  pack.anchors[role] = { status: 'needsVisualConfirmation', mode: 'bone', source: bone };
  binding.semantics.roles[role] = { candidates: [bone], resolved: bone, status: 'available', needsVisualConfirmation: true };
}
binding.source.root = pack.skeleton;
binding.source.atlas = pack.atlas;
binding.source.originalExport = 'spine_manager/source/c010/c010_00.json';
binding.source.runtimeVariant = 'c010-authored-foam-wipe-v2';
binding.source.auditFiles = ['audit-report.json'];
binding.semantics.note = 'Foam v2 uses an authored clip with a curled-index contact anchor (foamPalm keeps its integration name), eyelid deformation and flexible sleeves. Existing hand, gun and strap roles remain for the legacy water/fan path; unconfirmed roles keep their review status.';
binding.semantics.actionChannels.foam = { renderer: 'runtime overlay', anchors: ['foamFace', 'foamPalm'] };
delete binding.prototype;
pack.runtimeVariant = { id: 'c010-authored-foam-wipe-v2', sourceModel: 'spine_manager/source/c010/c010_00.json', variantModel: pack.skeleton, sourceUnmodified: true };
pack.production = { profile: 'authored-spine-animation', runId, sourceProject: 'spine_manager/source/c010/c010_00.rigby', derivedProject: relative(rigby), derivedJson: relative(exported), sourcePack: 'resources/characters/c010_00' };
pack.production.materialSources = ['spine_manager/source/c010-foam-wipe-v2/texture-provenance.json'];
pack.validation = { overall: 'candidate', runId, checks: { structure: 'pass', images: 'pass', jsonRoundTrip: 'pass', actionSource: 'pass', runtimeLoad: 'pending', loopPlayback: 'pending', fit: 'pending', anchors: 'pending', visual: 'pending', actionTrace: 'pending', interruptRecover: 'pending' } };
pack.evidence = { actionSource: relative(rigby), export: relative(exported.replace(/\.json$/, '.export-report.json')), runtimeTrace: relative(path.join(runRoot, 'runtime/foam-wipe-runtime-report.json')), visualReview: relative(path.join(runRoot, 'visual/review-manifest.json')) };
pack.blockers = ['source license remains unconfirmed', 'authored action runtime and visual review must use this model hash', 'water/fan remain unsupported and retain the legacy runtime path'];
pack.rollback = { replaces: `character.c010_00@${previousVersion}`, rollbackTo: relative(path.join(runRoot, 'rollback/c010_00')), rollbackAllowed: true };
await fs.writeFile(path.join(packRoot, pack.binding), JSON.stringify(binding, null, 2) + '\n');
await fs.writeFile(path.join(packRoot, pack.audit), JSON.stringify(exportReport, null, 2) + '\n');
pack.integrity = { sourceHash: `sha256:${exportReport.files[relative(rigby)].sha256}`, files: {} };
for (const name of [pack.skeleton, pack.atlas, ...pack.textures, pack.binding, pack.audit]) {
  const bytes = await fs.readFile(path.join(packRoot, name));
  pack.integrity.files[name] = { sha256: crypto.createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, path: name };
}
await fs.writeFile(path.join(packRoot, 'character-pack.json'), JSON.stringify(pack, null, 2) + '\n');
await fs.writeFile(path.join(packRoot, 'production-manifest.json'), JSON.stringify({ schemaVersion: 1, runId, profile: 'authored-spine-animation', status: 'pending-runtime-and-visual', action: { animation: 'foam_wipe', duration: action.duration, source: relative(rigby) }, pack: 'pack/character-pack.json', exportReport: pack.evidence.export, skeletonSha256: pack.integrity.files[pack.skeleton].sha256, runtime: { status: 'pending', evidence: 'runtime/foam-wipe-runtime-report.json' }, visual: { status: 'pending', evidence: 'visual/review-manifest.json' } }, null, 2) + '\n');
console.log(JSON.stringify({ status: 'staged', runId, pack: relative(path.join(packRoot, 'character-pack.json')), packVersion: pack.packVersion, animation: 'foam_wipe', duration: action.duration }, null, 2));
