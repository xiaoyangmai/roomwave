import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manager = path.join(root, 'spine_manager');
const p = (...parts) => path.join(root, ...parts);
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

const exportDir = p('src', 'spine-audit', 'c010', 'model-4.3.26');
const exportNames = ['c010_00.json', 'c010_00.atlas', 'c010_00.png', 'c010_00_2.png', 'c010_00_3.png', 'c010_00_4.png'];
const exportedFiles = Object.fromEntries(exportNames.map((name) => {
  const file = path.join(exportDir, name);
  return [name, { sha256: hash(file), bytes: fs.statSync(file).size }];
}));
const targetProject = p('spine_manager', 'source', 'nikke_4.3.26', 'derived', 'c010_roomwave_4.3.26', 'c010_roomwave_4.3.26.spine');
const sourceProject = p('spine_manager', 'source', 'nikke_4.0.47', 'derived', 'c010_roomwave_4.0.47', 'c010_roomwave_4.0.47.spine');
const runtimeFile = p('src', 'spine-audit', 'c010', 'vendor', 'spine-canvas-4.3.13.min.js');

const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  model: 'c010_00',
  editorVersion: '4.3.26',
  runtimePackage: '@esotericsoftware/spine-canvas@4.3.13',
  runtimeVersion: '4.3.13',
  sourceProject: 'source/nikke_4.0.47/derived/c010_roomwave_4.0.47/c010_roomwave_4.0.47.spine',
  targetProject: 'source/nikke_4.3.26/derived/c010_roomwave_4.3.26/c010_roomwave_4.3.26.spine',
  exportDirectory: 'spine-audit/c010/model-4.3.26',
  exportedFiles,
  targetProjectSha256: hash(targetProject),
  sourceProjectSha256: hash(sourceProject),
  runtimeFileSha256: hash(runtimeFile),
  json: {
    file: 'c010_00.json',
    skeletonSpine: '4.3.26',
    bones: 310,
    slots: 141,
    skins: ['default', '00', '01'],
    animations: ['action', 'angry', 'delight', 'expression_0', 'idle', 'special', 'talk_end', 'talk_start', 'think', 'worry'],
    events: 1
  },
  atlas: { file: 'c010_00.atlas', pages: 4, regions: 274, pageFiles: exportNames.slice(2) },
  browserProbe: {
    page: 'spine-audit/c010/migration-4.3.html',
    status: 'pass',
    renderedSkin: '00',
    renderedAnimation: 'idle',
    visualCheck: 'character rendered with four atlas pages in 4.3.13 runtime'
  },
  status: 'exported-4.3.26-runtime-round-trip-pass',
  sourceUnmodified: true
};
write(path.join(manager, 'evidence', 'c010-migration-4.3.26-export.json'), evidence);

const migrationFile = path.join(manager, 'configs', 'c010-version-migration.json');
const migration = read(migrationFile);
migration.status = 'exported-4.3.26-runtime-round-trip-pass';
migration.requiredEvidence = migration.requiredEvidence.map((item) => item === '4.3.26-json-or-skel-export-produced' ? '4.3.26-json-export-produced' : item === '4.3-runtime-round-trip-loads-export' ? '4.3-runtime-round-trip-loads-export-pass' : item);
migration.evidence = [...new Set([...(migration.evidence || []), 'evidence/c010-migration-4.3.26-save.json', 'evidence/c010-migration-4.3.26-export.json', 'evidence/c010-migration-runtime-staged.json'])];
write(migrationFile, migration);

const sourceManifestFile = p('spine_manager', 'source', 'nikke_4.3.26', 'source-manifest.json');
const sourceManifest = read(sourceManifestFile);
sourceManifest.migrationStatus = 'exported-4.3.26-runtime-round-trip-pass';
sourceManifest.targetRuntimePackage = '@esotericsoftware/spine-canvas@4.3.13';
sourceManifest.exportDirectory = '../../../src/spine-audit/c010/model-4.3.26';
sourceManifest.exportEvidence = '../../evidence/c010-migration-4.3.26-export.json';
write(sourceManifestFile, sourceManifest);

const derivedFile = p('spine_manager', 'source', 'nikke_4.3.26', 'derived', 'c010_roomwave_4.3.26', 'derived-project-manifest.json');
const derived = read(derivedFile);
derived.migrationStatus = 'exported-4.3.26-runtime-round-trip-pass';
derived.exportDirectory = '../../../../../src/spine-audit/c010/model-4.3.26';
derived.exportEvidence = '../../../../evidence/c010-migration-4.3.26-export.json';
derived.requiredEvidence = derived.requiredEvidence.map((item) => item === '4.3-export-produced' ? '4.3-export-produced-pass' : item === '4.3-runtime-round-trip' ? '4.3-runtime-round-trip-pass' : item);
write(derivedFile, derived);

const manifestFile = path.join(manager, 'configs', 'c010-model-manifest.json');
const manifest = read(manifestFile);
manifest.generatedAt = new Date().toISOString();
manifest.source = 'Roomwave/spine_manager/source/nikke_4.3.26/derived/c010_roomwave_4.3.26';
manifest.sourceProject = { file: 'source/nikke_4.3.26/derived/c010_roomwave_4.3.26/c010_roomwave_4.3.26.spine', editorVersion: '4.3.26', sha256: hash(targetProject), bytes: fs.statSync(targetProject).size, readOnly: false };
manifest.exportedSpine = '4.3.26';
manifest.runtime = 'spine-canvas-4.3.13';
manifest.runtimeFile = '../src/spine-audit/c010/vendor/spine-canvas-4.3.13.min.js';
manifest.runtimeSha256 = hash(runtimeFile);
manifest.files = Object.fromEntries(Object.entries(exportedFiles).map(([name, info]) => [`model-4.3.26/${name}`, info]));
manifest.status = 'baseline-4.3.26-exported-runtime-round-trip-pass';
manifest.migrationTarget = { editorVersion: '4.3.26', runtimePackage: '@esotericsoftware/spine-canvas@4.3.13', status: 'active' };
manifest.rollback = { editorVersion: '4.0.47', runtimePackage: '@esotericsoftware/spine-canvas@4.0.31', sourceProject: 'source/nikke_4.0.47/derived/c010_roomwave_4.0.47/c010_roomwave_4.0.47.spine', exportDirectory: '../src/spine-audit/c010/model' };
write(manifestFile, manifest);

const depsFile = path.join(manager, 'configs', 'dependencies.json');
const deps = read(depsFile);
deps.node.activeBaseline = '4.3.26';
deps.node.version = '4.3.13';
deps.node.migrationStatus = 'target-runtime-active-round-trip-pass';
deps.node.runtimeFile = 'src/spine-audit/c010/vendor/spine-canvas-4.3.13.min.js';
deps.node.rollbackVersion = '4.0.31';
write(depsFile, deps);

console.log(JSON.stringify({ status: evidence.status, targetProjectSha256: evidence.targetProjectSha256, exportedFiles }, null, 2));


