import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { AtlasAttachmentLoader, SkeletonJson, TextureAtlas } from '@esotericsoftware/spine-core';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toolConfig = JSON.parse(fs.readFileSync(path.join(managerRoot, 'tools', 'spine-tool.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(managerRoot, 'configs', 'c010-model-manifest.json'), 'utf8'));
const migration = JSON.parse(fs.readFileSync(path.join(managerRoot, 'configs', 'c010-version-migration.json'), 'utf8'));
const bridge = process.env.SPINE_BRIDGE
  ? path.resolve(process.env.SPINE_BRIDGE)
  : path.resolve(managerRoot, toolConfig.projectCopy.portableCliBridgeRelative);
const targetProject = process.env.ROOMWAVE_C010_PROJECT
  ? path.resolve(process.env.ROOMWAVE_C010_PROJECT)
  : path.resolve(managerRoot, 'source', 'nikke_4.3.26', 'derived', 'c010_roomwave_4.3.26', 'c010_roomwave_4.3.26.spine');
const runStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const runRoot = process.env.ROOMWAVE_ARTIFACT_ROOT
  ? path.resolve(process.env.ROOMWAVE_ARTIFACT_ROOT)
  : path.join(managerRoot, 'artifacts', 'bridge-exports', `c010-${runStamp}`);
const exportDirectory = path.join(runRoot, 'evidence', 'portable-cli-export');
const evidencePath = path.join(managerRoot, 'evidence', 'c010', 'portable-cli-export.json');

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const fail = (message, details = {}) => {
  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    model: 'c010_00',
    status: 'failed',
    bridge,
    targetProject,
    exportDirectory,
    message,
    ...details,
  };
  writeJson(evidencePath, evidence);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
};

if (migration.status !== 'exported-4.3.26-runtime-round-trip-pass') {
  fail('The 4.3.26 migration is not the active baseline.', { migrationStatus: migration.status });
}
if (!fs.existsSync(bridge)) fail('Portable CLI bridge is missing.');
if (!fs.existsSync(targetProject)) fail('The editable c010 4.3.26 project is missing.');

fs.rmSync(exportDirectory, { recursive: true, force: true });
fs.mkdirSync(exportDirectory, { recursive: true });

const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
const exportArgs = [
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', bridge,
  '-i', targetProject, '-o', exportDirectory, '-e', 'json+pack',
];
const exportRun = spawnSync(powershell, exportArgs, {
  cwd: managerRoot, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024,
});
if (exportRun.error || exportRun.status !== 0) {
  fail('Portable CLI export failed.', {
    exportExitCode: exportRun.status,
    exportStdout: String(exportRun.stdout || '').slice(-4000),
    exportStderr: String(exportRun.stderr || '').slice(-4000),
  });
}

const jsonFiles = fs.readdirSync(exportDirectory).filter((name) => name.toLowerCase().endsWith('.json'));
const atlasFiles = fs.readdirSync(exportDirectory).filter((name) => name.toLowerCase().endsWith('.atlas'));
if (jsonFiles.length !== 1 || atlasFiles.length !== 1) {
  fail('Export did not produce exactly one JSON skeleton and one atlas.', { jsonFiles, atlasFiles });
}

const jsonFile = path.join(exportDirectory, jsonFiles[0]);
const atlasFile = path.join(exportDirectory, atlasFiles[0]);
let json;
let skeletonData;
let atlas;
try {
  json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  atlas = new TextureAtlas(fs.readFileSync(atlasFile, 'utf8'));
  skeletonData = new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);
} catch (error) {
  fail('Runtime readback could not parse the exported JSON and atlas.', { error: String(error.stack || error) });
}

const atlasPages = atlas.pages.map((page) => page.name);
const missingPages = atlasPages.filter((page) => !fs.existsSync(path.join(exportDirectory, page)));
if (missingPages.length) fail('The exported atlas references missing texture pages.', { atlasPages, missingPages });

const expected = manifest.counts || {};
const readback = {
  skeletonSpine: skeletonData.version,
  bones: skeletonData.bones.length,
  slots: skeletonData.slots.length,
  skins: skeletonData.skins.length,
  animations: skeletonData.animations.length,
  events: skeletonData.events.length,
  ik: skeletonData.constraints.filter((constraint) => constraint.constructor.name === 'IkConstraintData').length,
  transform: skeletonData.constraints.filter((constraint) => constraint.constructor.name === 'TransformConstraintData').length,
  atlasPages: atlas.pages.length,
  atlasRegions: atlas.regions.length,
};
const expectedReadback = {
  skeletonSpine: '4.3.26',
  bones: expected.bones,
  slots: expected.slots,
  skins: expected.skins,
  animations: expected.animations,
  events: expected.events,
  ik: expected.ik,
  transform: expected.transform,
  atlasPages: Object.keys(manifest.files || {}).filter((file) => file.toLowerCase().endsWith('.png')).length,
};
const comparison = {
  skeletonSpine: readback.skeletonSpine === '4.3.26',
  bones: readback.bones === expectedReadback.bones,
  slots: readback.slots === expectedReadback.slots,
  skins: expectedReadback.skins === undefined || readback.skins === expectedReadback.skins,
  animations: expectedReadback.animations === undefined || readback.animations === expectedReadback.animations,
  events: expectedReadback.events === undefined || readback.events === expectedReadback.events,
  ik: expectedReadback.ik === undefined || readback.ik === expectedReadback.ik,
  transform: expectedReadback.transform === undefined || readback.transform === expectedReadback.transform,
  atlasPages: readback.atlasPages === expectedReadback.atlasPages,
  atlasRegions: readback.atlasRegions > 0,
};
if (Object.values(comparison).some((value) => value === false)) {
  fail('Exported data parsed, but did not match the c010 4.3.26 manifest.', { readback, expected: expectedReadback, comparison });
}

const files = Object.fromEntries(fs.readdirSync(exportDirectory).map((name) => {
  const file = path.join(exportDirectory, name);
  return [name, { bytes: fs.statSync(file).size, sha256: hash(file) }];
}));
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  model: 'c010_00',
  status: 'portable-cli-export-runtime-readback-pass',
  baseline: { editor: '4.3.26', runtime: manifest.runtime || 'spine-canvas-4.3.13' },
  bridge,
  targetProject,
  exportDirectory,
  exportCommand: 'run-spine-portable-cli.ps1 -i <target.spine> -o <run evidence>/portable-cli-export -e json+pack',
  exportProcessExitCode: exportRun.status,
  readbackCommand: 'SkeletonJson + TextureAtlas from @esotericsoftware/spine-core 4.3.13',
  readback,
  expected: expectedReadback,
  comparison,
  atlasPages,
  files,
  directCliPolicy: 'forbidden; app/Spine.com is never invoked by this stage',
  sourceUnmodified: true,
};
writeJson(evidencePath, evidence);
console.log(JSON.stringify(evidence, null, 2));
