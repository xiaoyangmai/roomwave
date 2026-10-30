import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roomwaveRoot = path.resolve(managerRoot, '..');
const modelRoot = path.join(roomwaveRoot, 'src', 'spine-audit', 'c010');
const migrationConfigPath = path.join(managerRoot, 'configs', 'c010-version-migration.json');
const migration = fs.existsSync(migrationConfigPath) ? JSON.parse(fs.readFileSync(migrationConfigPath, 'utf8')) : null;
const targetActive = migration?.status === 'exported-4.3.26-runtime-round-trip-pass';
const sourceVersion = targetActive ? '4.3.26' : '4.0.47';
const sourceRoot = targetActive
  ? path.join(managerRoot, 'source', 'nikke_4.3.26', 'derived', 'c010_roomwave_4.3.26')
  : path.join(managerRoot, 'source', 'nikke_4.0.47', 'c010_00');
const sourceManifestPath = targetActive
  ? path.join(managerRoot, 'source', 'nikke_4.3.26', 'source-manifest.json')
  : path.join(managerRoot, 'source', 'nikke_4.0.47', 'source-manifest.json');
const targetModelRoot = targetActive ? path.join(modelRoot, 'model-4.3.26') : path.join(modelRoot, 'model');
const files = targetActive
  ? ['model-4.3.26/c010_00.json', 'model-4.3.26/c010_00.atlas', 'model-4.3.26/c010_00.png', 'model-4.3.26/c010_00_2.png', 'model-4.3.26/c010_00_3.png', 'model-4.3.26/c010_00_4.png', 'semantic-binding.json', 'audit-report.json']
  : ['model/c010_00.skel', 'model/c010_00.atlas', 'model/c010_00.png', 'model/c010_00_2.png', 'semantic-binding.json', 'audit-report.json'];

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.isAbsolute(file) ? file : path.join(modelRoot, file))).digest('hex');
}

const audit = JSON.parse(fs.readFileSync(path.join(modelRoot, 'audit-report.json'), 'utf8'));
const main = audit.audits.find((item) => item.file === 'c010_00.skel');
if (!main) throw new Error('c010_00.skel audit is missing.');
if (!fs.existsSync(sourceManifestPath)) throw new Error('Source project manifest is missing. Run npm run source:import-c010 first.');
const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
const sourceProjectFile = path.join(sourceRoot, targetActive ? 'c010_roomwave_4.3.26.spine' : 'c010_00.spine');
if (!fs.existsSync(sourceProjectFile)) throw new Error('c010_00.spine is missing from the imported source.');
const runtimeFile = targetActive
  ? path.join(roomwaveRoot, 'src', 'spine-audit', 'c010', 'vendor', 'spine-canvas-4.3.13.min.js')
  : path.join(managerRoot, 'node_modules', '@esotericsoftware', 'spine-canvas', 'dist', 'iife', 'spine-canvas.min.js');
if (!fs.existsSync(runtimeFile)) throw new Error('Pinned Spine Canvas runtime is missing. Run npm install first.');
const manifest = {
  schemaVersion: 1,
  model: 'c010_00',
  generatedAt: new Date().toISOString(),
  source: targetActive ? 'Roomwave/spine_manager/source/nikke_4.3.26/derived/c010_roomwave_4.3.26' : 'Roomwave/spine_manager/source/nikke_4.0.47/c010_00',
  sourceProject: {
    file: targetActive ? 'source/nikke_4.3.26/derived/c010_roomwave_4.3.26/c010_roomwave_4.3.26.spine' : 'source/nikke_4.0.47/c010_00/c010_00.spine',
    editorVersion: sourceManifest.targetEditorVersion || sourceManifest.sourceProject?.editorVersion || sourceVersion,
    sha256: sha256(sourceProjectFile),
    bytes: fs.statSync(sourceProjectFile).size
  },
  exportedSpine: targetActive ? '4.3.26' : main.skeleton?.version || 'unknown',
  runtime: targetActive ? 'spine-canvas-4.3.13' : 'spine-canvas-4.0.31',
  runtimeFile: targetActive ? '../src/spine-audit/c010/vendor/spine-canvas-4.3.13.min.js' : 'node_modules/@esotericsoftware/spine-canvas/dist/iife/spine-canvas.min.js',
  runtimeSha256: sha256(runtimeFile),
  files: Object.fromEntries(files.map((file) => [file, { sha256: sha256(file), bytes: fs.statSync(path.join(modelRoot, file)).size }])),
  counts: main.counts,
  animations: main.animations?.map((item) => item.name) || [],
  status: targetActive ? 'baseline-4.3.26-exported-runtime-round-trip-pass' : 'editable-source-available-runtime-export-pending-rig-mutations',
  migrationTarget: targetActive ? { editorVersion: '4.3.26', runtimePackage: '@esotericsoftware/spine-canvas@4.3.13', status: 'active' } : undefined,
  rollback: { editorVersion: '4.0.47', runtimePackage: '@esotericsoftware/spine-canvas@4.0.31', sourceProject: 'source/nikke_4.0.47/derived/c010_roomwave_4.0.47/c010_roomwave_4.0.47.spine', exportDirectory: '../src/spine-audit/c010/model' }
};
const output = path.join(managerRoot, 'configs', 'c010-model-manifest.json');
fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

