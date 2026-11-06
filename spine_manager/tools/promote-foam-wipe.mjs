import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const runId = 'c010-foam-wipe-v2-20261105';
const runRoot = path.join(root, 'spine_manager/artifacts/runs', runId);
const packRoot = path.join(runRoot, 'pack');
const productRoot = path.join(root, 'resources/characters/c010_00');
const rollbackRoot = path.join(runRoot, 'rollback/c010_00');
const registryPath = path.join(root, 'resources/config/character-registry.json');
const checkOnly = process.argv[2] === '--check';
if (process.argv[2] === '--help') {
  console.log('Usage: node tools/promote-foam-wipe.mjs [--check]');
  process.exit(0);
}
if (process.argv.length > 3 || (process.argv[2] && !checkOnly)) throw new Error('Use --check to validate the release candidate without writing.');
const [pack, runtime, visual, registry, index, exportReport] = await Promise.all([
  path.join(packRoot, 'character-pack.json'),
  path.join(runRoot, 'runtime/foam-wipe-runtime-report.json'),
  path.join(runRoot, 'visual/review-manifest.json'),
  registryPath,
  path.join(root, 'resources/index.json'),
  path.join(runRoot, 'exported/c010_00.foam_wipe.export-report.json'),
].map(async file => JSON.parse(await fs.readFile(file, 'utf8'))));
if (index.characterRegistry !== 'config/character-registry.json') throw new Error('Resource index points at a different character registry.');
if (pack.production.runId !== runId || pack.recipes.foam_wipe.source.type !== 'authored-animation') throw new Error('Expected this batch of the authored foam_wipe pack.');
if (exportReport.status !== 'pass' || runtime.status !== 'pass' || visual.status !== 'pass') throw new Error('Export, authored runtime and visual checks must all pass.');
const skeletonHash = pack.integrity.files[pack.skeleton].sha256;
if (runtime.skeletonSha256 !== skeletonHash || visual.skeletonSha256 !== skeletonHash) throw new Error('Runtime/visual evidence must match the exact staged skeleton hash.');
for (const [name, record] of Object.entries(pack.integrity.files)) {
  const bytes = await fs.readFile(path.join(packRoot, name));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== record.sha256) throw new Error(`Staged file changed after validation: ${name}`);
}
const skeleton = JSON.parse(await fs.readFile(path.join(packRoot, pack.skeleton), 'utf8'));
if (!skeleton.animations.foam_wipe) throw new Error('The staged skeleton does not contain foam_wipe.');
const entry = registry.characters.find(item => item.id === pack.characterId);
if (!entry) throw new Error('c010_00 is missing from the resource registry.');
if (checkOnly) {
  console.log(JSON.stringify({ status: 'ready', runId, packVersion: pack.packVersion, skeletonSha256: skeletonHash, releaseStatus: 'candidate-license-pending' }, null, 2));
  process.exit(0);
}

pack.status = 'candidate';
Object.assign(pack.validation.checks, { runtimeLoad: 'pass', loopPlayback: 'pass', fit: 'pass', anchors: 'pass', visual: 'pass', actionTrace: 'pass', interruptRecover: 'pass' });
pack.blockers = pack.blockers.filter(blocker => blocker !== 'authored action runtime and visual review must use this model hash');
const binding = JSON.parse(await fs.readFile(path.join(packRoot, pack.binding), 'utf8'));
for (const role of ['foamFace', 'foamPalm', 'foamAnchor']) {
  pack.anchors[role].status = 'available';
  binding.semantics.roles[role].needsVisualConfirmation = false;
}
const bindingBytes = Buffer.from(JSON.stringify(binding, null, 2) + '\n');
await fs.writeFile(path.join(packRoot, pack.binding), bindingBytes);
pack.integrity.files[pack.binding] = { sha256: crypto.createHash('sha256').update(bindingBytes).digest('hex'), bytes: bindingBytes.length, path: pack.binding };
await fs.writeFile(path.join(packRoot, 'character-pack.json'), JSON.stringify(pack, null, 2) + '\n');
const productionPath = path.join(packRoot, 'production-manifest.json');
const production = JSON.parse(await fs.readFile(productionPath, 'utf8'));
production.status = 'candidate-validated';
production.runtime.status = 'pass';
production.visual.status = 'pass';
await fs.writeFile(productionPath, JSON.stringify(production, null, 2) + '\n');

// Preserve the complete previous local package as the rollback copy.
if (![productRoot, rollbackRoot].every(target => target.startsWith(root + path.sep))) throw new Error('Package paths must stay inside the repository.');
await fs.mkdir(path.dirname(rollbackRoot), { recursive: true });
await fs.rename(productRoot, rollbackRoot);
await fs.cp(packRoot, productRoot, { recursive: true });
entry.packVersion = pack.packVersion;
entry.status = pack.status;
entry.capabilities = pack.capabilities;
entry.sourceRunId = runId;
entry.releaseStatus = 'blocked-until-license-confirmation-and-anchor-confirmation';
entry.evidence = pack.evidence;
registry.generatedAt = new Date().toISOString();
await fs.writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(JSON.stringify({ status: 'promoted', runId, packVersion: pack.packVersion, skeletonSha256: skeletonHash, rollback: path.relative(root, rollbackRoot), releaseStatus: entry.releaseStatus }, null, 2));
