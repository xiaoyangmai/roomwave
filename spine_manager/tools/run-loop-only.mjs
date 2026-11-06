import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Rigby2DMcpClient } from './rigby2d-mcp-client.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const managerRoot = path.join(repoRoot, 'spine_manager');
const defaultSourceDir = path.join(repoRoot, 'spine_manager', 'source', 'c010');
const defaultBindingPath = path.join(repoRoot, 'spine_manager', 'source', 'c010', 'semantic-binding.json');

function parseArgs(argv) {
  const result = { loopAnimations: ['idle'] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--run-id') result.runId = argv[++index];
    else if (arg === '--source-dir') result.sourceDir = argv[++index];
    else if (arg === '--binding') result.bindingPath = argv[++index];
    else if (arg === '--loop-animation') result.loopAnimations.push(argv[++index]);
    else if (arg === '--skip-runtime') result.skipRuntime = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node tools/run-loop-only.mjs [--run-id ID] [--source-dir DIR] [--binding FILE] [--loop-animation NAME] [--skip-runtime]');
      process.exit(0);
    } else throw new Error('Unknown argument: ' + arg);
  }
  result.loopAnimations = [...new Set(result.loopAnimations.filter(Boolean))];
  return result;
}

function nowId() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function posix(value) {
  return value.replaceAll(path.sep, '/');
}

async function ensureDir(directory) {
  await fsp.mkdir(directory, { recursive: true });
}

async function writeJson(file, value) {
  await ensureDir(path.dirname(file));
  await fsp.writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function sha256File(file) {
  const hash = crypto.createHash('sha256');
  hash.update(await fsp.readFile(file));
  return hash.digest('hex');
}

async function fileRecord(file, relative) {
  const stat = await fsp.stat(file);
  return { sha256: await sha256File(file), bytes: stat.size, path: posix(relative) };
}

async function copyFiles(sourceDir, destinationDir, names) {
  await ensureDir(destinationDir);
  for (const name of names) {
    const source = path.join(sourceDir, name);
    const destination = path.join(destinationDir, name);
    await ensureDir(path.dirname(destination));
    await fsp.copyFile(source, destination);
  }
}

function animationEntries(inspect, skeleton) {
  if (Array.isArray(inspect?.animations)) {
    return inspect.animations.map((item) => typeof item === 'string' ? { name: item } : item);
  }
  return Object.entries(skeleton.animations || {}).map(([name]) => ({ name }));
}

function animationName(item) {
  return item.name || item.animation || item.id;
}

function animationDuration(item, described) {
  const value = Number(item.duration ?? described?.duration);
  return Number.isFinite(value) && value > 0 ? value : 0.033333333;
}

function semanticFor(name) {
  if (name === 'idle') return 'idle';
  return 'custom_loop';
}

function roleAnchor(roles, role) {
  const entry = roles?.[role] || null;
  if (!entry || !entry.resolved) return { status: 'missing', mode: 'unavailable' };
  return {
    status: entry.status === 'missing' ? 'missing' : entry.needsVisualConfirmation ? 'needsVisualConfirmation' : 'available',
    mode: 'bone',
    source: entry.resolved,
  };
}

function assertPackInvariants(pack) {
  const required = ['schemaVersion', 'packType', 'packId', 'characterId', 'status', 'format', 'skeleton', 'atlas', 'textures', 'binding', 'audit', 'capabilities', 'validation', 'rollback'];
  for (const field of required) if (pack[field] === undefined) throw new Error('Character Pack is missing required field: ' + field);
  if (pack.packType !== 'character' || pack.format !== 'json' || pack.patch !== null) throw new Error('Loop-only Character Pack format invariant failed.');
  if (pack.capabilities.tier !== 'loop-only' || pack.capabilities.motion.supportsTargetDrivenMotion || pack.capabilities.motion.supportsPhaseActions || pack.capabilities.motion.supportsArbitraryLayerMix) throw new Error('Loop-only motion invariant failed.');
  const animationIds = new Set(pack.animations.map((item) => item.id));
  const defaults = pack.animations.filter((item) => item.default);
  if (defaults.length !== 1 || defaults[0].semantic !== 'idle') throw new Error('Loop-only Pack must have exactly one idle default loop.');
  if (pack.animations.some((item) => item.loop !== true || item.phaseModel !== 'loop')) throw new Error('Loop-only animation invariant failed.');
  if (pack.capabilities.loops.some((item) => !animationIds.has(item.animationId))) throw new Error('Loop capability references an unknown animation.');
}

function packUrl(base, repoRelative) {
  return base + '/' + posix(repoRelative).split('/').map(encodeURIComponent).join('/');
}

function serveFile(root, requestPath, response) {
  const clean = decodeURIComponent(requestPath.split('?')[0]).replace(/^\/+/, '');
  const target = path.resolve(root, clean);
  if (target !== root && !target.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end('forbidden');
    return;
  }
  if (clean === '') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html><body><canvas id="character" width="800" height="800"></canvas></body></html>');
    return;
  }
  fsp.readFile(target).then((data) => {
    const ext = path.extname(target).toLowerCase();
    const type = ext === '.js' || ext === '.mjs' ? 'application/javascript' : ext === '.json' || ext === '.atlas' ? 'application/json' : ext === '.png' ? 'image/png' : 'application/octet-stream';
    response.writeHead(200, { 'content-type': type });
    response.end(data);
  }).catch(() => {
    response.writeHead(404);
    response.end('not found');
  });
}

async function runRuntimeValidation({ packRoot, packManifest, loops }) {
  const require = createRequire(import.meta.url);
  const { chromium } = require('playwright-core');
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const server = http.createServer((request, response) => serveFile(repoRoot, request.url || '/', response));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  const base = 'http://127.0.0.1:' + port;
  const errors = [];
  const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => errors.push('pageerror: ' + error.message));
  page.on('response', (response) => {
    if (response.status() < 400) return;
    if (response.url().includes('favicon.ico')) return;
    errors.push('http ' + response.status() + ': ' + response.url());
  });
  const browserManifest = { ...packManifest };
  browserManifest.skeleton = packUrl(base, path.relative(repoRoot, path.join(packRoot, packManifest.skeleton)));
  browserManifest.atlas = packUrl(base, path.relative(repoRoot, path.join(packRoot, packManifest.atlas)));
  browserManifest.textures = packManifest.textures.map((item) => packUrl(base, path.relative(repoRoot, path.join(packRoot, item))));
  browserManifest.texture = browserManifest.textures[0];
  browserManifest.binding = packUrl(base, path.relative(repoRoot, path.join(packRoot, packManifest.binding)));
  browserManifest.audit = packUrl(base, path.relative(repoRoot, path.join(packRoot, packManifest.audit)));
  try {
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.addScriptTag({ url: base + '/spine_runtime/src/canvas/vendor/spine-canvas-4.3.13.min.js' });
    const result = await page.evaluate(async ({ manifest, loopList }) => {
      const runtime = await import('/spine_runtime/src/canvas/roomwave-spine.js');
      const canvas = document.querySelector('#character');
      const adapter = new runtime.SpineCharacterAdapter({ canvas, manifest, debug: false });
      await adapter.load();
      adapter.resize(800, 800, 1);
      const sampleAnchors = () => Object.fromEntries(['head', 'faceTarget', 'handVisual', 'handTarget', 'gunTarget'].map((role) => [role, adapter.getAnchor(role)]));
      const loopChecks = [];
      for (const loop of loopList) {
        const started = adapter.setAnimation(loop.sourceName, true);
        for (let frame = 0; frame < 120; frame += 1) adapter.update(1 / 60);
        loopChecks.push({ id: loop.id, sourceName: loop.sourceName, started, traceLength: Array.isArray(adapter.trace) ? adapter.trace.length : 0, anchors: sampleAnchors() });
      }
      adapter.resetToIdle();
      for (let frame = 0; frame < 60; frame += 1) adapter.update(1 / 60);
      const recovered = { animation: adapter.animation, anchors: sampleAnchors(), traceLength: Array.isArray(adapter.trace) ? adapter.trace.length : 0 };
      if (typeof adapter.dispose === 'function') adapter.dispose();
      return { loaded: true, loopChecks, recovered };
    }, { manifest: browserManifest, loopList: loops });
    return { status: errors.length ? 'fail' : 'pass', errors, result, url: base };
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceDir = path.resolve(args.sourceDir || defaultSourceDir);
  const bindingPath = path.resolve(args.bindingPath || defaultBindingPath);
  const runId = args.runId || 'loop-only-c010-' + nowId();
  const runRoot = path.join(managerRoot, 'artifacts', 'runs', runId, 'loop-only', 'c010_00');
  const mcpRoot = path.join(runRoot, 'mcp');
  const packRoot = path.join(runRoot, 'character-pack');
  const packModelRoot = path.join(packRoot, 'model');
  await ensureDir(runRoot);

  const sourceNames = (await fsp.readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(json|skel|atlas|png)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  if (!sourceNames.includes('c010_00.json')) throw new Error('The sample export is missing c010_00.json: ' + sourceDir);

  const sourceFiles = {};
  for (const name of sourceNames) sourceFiles[name] = await fileRecord(path.join(sourceDir, name), name);
  const sourceHash = crypto.createHash('sha256').update(JSON.stringify(sourceFiles)).digest('hex');
  const sourceManifest = {
    schemaVersion: 1,
    runId,
    sourceType: 'runtime-export',
    sourceDir: posix(path.relative(repoRoot, sourceDir)),
    editable: false,
    files: sourceFiles,
    sourceHash: 'sha256:' + sourceHash,
  };
  await writeJson(path.join(runRoot, 'source-manifest.json'), sourceManifest);

  const mcp = new Rigby2DMcpClient({ repoRoot });
  let inspect;
  let validate;
  let rig;
  const animationEvidence = {};
  let pose;
  try {
    await mcp.start();
    const relativeSource = posix(path.relative(repoRoot, path.join(sourceDir, 'c010_00.json')));
    inspect = await mcp.callTool('inspect_project', { path: relativeSource });
    validate = await mcp.callTool('validate_project', { path: relativeSource });
    rig = await mcp.callTool('describe_rig', { path: relativeSource });
    await writeJson(path.join(mcpRoot, 'inspect-project.json'), inspect);
    await writeJson(path.join(mcpRoot, 'validate-project.json'), validate);
    await writeJson(path.join(mcpRoot, 'describe-rig.json'), rig);
    const skeleton = JSON.parse(await fsp.readFile(path.join(sourceDir, 'c010_00.json'), 'utf8'));
    const animations = animationEntries(inspect, skeleton);
    for (const item of animations) {
      const name = animationName(item);
      if (!name) continue;
      animationEvidence[name] = await mcp.callTool('describe_animation', { path: relativeSource, animation: name });
      await writeJson(path.join(mcpRoot, 'animations', name + '.json'), animationEvidence[name]);
    }
    pose = await mcp.callTool('sample_pose', { path: relativeSource, animation: 'idle', time: 0.5, skin: '00' });
    await writeJson(path.join(mcpRoot, 'sample-pose-idle-0.5.json'), pose);

    const exportVersion = inspect.version || skeleton.skeleton?.spine || 'unknown';
    const allAnimations = animations.map((item) => {
      const name = animationName(item);
      return {
        id: name,
        sourceName: name,
        semantic: semanticFor(name),
        duration: animationDuration(item, animationEvidence[name]),
        sourceLoopFlag: item.loop ?? null,
        loopIntent: args.loopAnimations.includes(name) ? 'confirmed' : 'pending',
      };
    });
    const modelManifest = {
      schemaVersion: 1,
      model: 'c010_00',
      sourceType: 'runtime-export',
      source: sourceManifest,
      exportedSpine: exportVersion,
      format: 'json',
      runtimeTarget: 'spine-canvas@4.3.13',
      counts: inspect.counts || null,
      animations: allAnimations,
      rigby2d: { serverVersion: mcp.serverInfo?.version || null, warnings: inspect.warnings || [] },
    };
    await writeJson(path.join(runRoot, 'model-manifest.json'), modelManifest);
    const confirmed = allAnimations.filter((item) => args.loopAnimations.includes(item.sourceName));
    if (!confirmed.length) throw new Error('No requested loop animation was found. Requested: ' + args.loopAnimations.join(', '));
    const loopProfile = {
      schemaVersion: 1,
      profile: 'loop-only',
      status: allAnimations.some((item) => item.loopIntent === 'pending') ? 'partial-confirmation' : 'confirmed',
      defaultLoop: confirmed.find((item) => item.sourceName === 'idle')?.id || confirmed[0].id,
      confirmedLoops: confirmed.map((item) => ({ ...item, phaseModel: 'loop', interrupt: { mode: 'crossfade-to-idle', mixSeconds: 0.2 } })),
      candidateAnimations: allAnimations.filter((item) => item.loopIntent !== 'confirmed').map((item) => ({ ...item, reason: 'loop intent was not present in the export and was not supplied as input metadata' })),
    };
    await writeJson(path.join(runRoot, 'loop-profile.json'), loopProfile);

    const priorBinding = fs.existsSync(bindingPath) ? JSON.parse(await fsp.readFile(bindingPath, 'utf8')) : null;
    const roles = priorBinding?.semantics?.roles || {};
    const binding = {
      schemaVersion: 1,
      model: 'c010_00',
      source: { type: 'runtime-export', file: 'model/c010_00.json', spineVersion: exportVersion, generatedBy: 'rigby2d-mcp' },
      semantics: {
        roles,
        actionChannels: {
          base: { source: 'existing animation', animation: loopProfile.defaultLoop, loop: true },
          loops: loopProfile.confirmedLoops.map((item) => ({ id: item.id, animation: item.sourceName, loop: true })),
        },
      },
      production: { profile: 'loop-only', sourceBinding: priorBinding ? posix(path.relative(repoRoot, bindingPath)) : null, runId },
    };
    await copyFiles(sourceDir, packModelRoot, sourceNames);
    await writeJson(path.join(packRoot, 'semantic-binding.json'), binding);
    const audit = {
      schemaVersion: 1,
      profile: 'loop-only',
      generatedAt: new Date().toISOString(),
      runId,
      source: sourceManifest,
      tool: { name: 'rigby2d-mcp', version: mcp.serverInfo?.version || 'unknown' },
      inspect,
      validate,
      evidence: { describeRig: 'mcp/describe-rig.json', samplePose: 'mcp/sample-pose-idle-0.5.json', animations: 'mcp/animations/' },
      status: validate.valid ? 'pass' : 'blocked',
    };
    await writeJson(path.join(packRoot, 'audit-report.json'), audit);

    const packFiles = [...sourceNames.map((name) => 'model/' + name), 'semantic-binding.json', 'audit-report.json'];
    const integrityFiles = {};
    for (const relative of packFiles) integrityFiles[relative] = await fileRecord(path.join(packRoot, relative), relative);
    const anchors = {};
    for (const role of ['head', 'faceTarget', 'handVisual', 'handTarget', 'gunTarget', 'strapTarget', 'foamAnchor', 'waterAnchor', 'fanAnchor']) {
      anchors[role] = roleAnchor(roles, role === 'gunTarget' ? 'gun' : role);
    }
    const supported = ['play_loop', 'switch_loop', 'crossfade_to_idle'];
    if (Object.values(anchors).some((anchor) => anchor.status === 'available')) supported.push('read_anchor');
    const packAnimations = loopProfile.confirmedLoops.map((item) => ({
      id: item.id,
      sourceName: item.sourceName,
      semantic: item.semantic,
      duration: item.duration,
      loop: true,
      phaseModel: 'loop',
      default: item.id === loopProfile.defaultLoop,
      interrupt: item.interrupt,
    }));
    const packManifest = {
      schemaVersion: 1,
      packType: 'character',
      packId: 'character.c010_00',
      characterId: 'c010_00',
      model: 'c010_00',
      packVersion: '0.1.0',
      status: 'staged',
      sourceType: 'runtime-export',
      editable: false,
      format: 'json',
      skeleton: 'model/c010_00.json',
      atlas: 'model/c010_00.atlas',
      textures: sourceNames.filter((name) => name.toLowerCase().endsWith('.png')).map((name) => 'model/' + name),
      binding: 'semantic-binding.json',
      audit: 'audit-report.json',
      patch: null,
      skin: '00',
      fit: { scaleMultiplier: 1.15, offsetX: 0, offsetY: -24 },
      provenance: { sourceId: 'roomwave/spine_manager/source/c010', sourceKind: 'external-export', license: { status: 'pending', reference: 'SOURCE-NOTICE.md requires independent rights confirmation' } },
      runtime: { engine: 'spine-canvas', runtimeVersion: '4.3.13', exportVersion },
      identity: { displayName: 'C010', tags: ['gaming', 'loop-only'] },
      animations: packAnimations,
      animationInventory: allAnimations,
      capabilities: {
        tier: 'loop-only',
        actionMode: 'authored-loop',
        motion: { mode: 'fixed-authored-loop', supportsTargetDrivenMotion: false, supportsPhaseActions: false, supportsArbitraryLayerMix: false },
        supported,
        loops: packAnimations.map((item) => ({ id: item.id, animationId: item.id, semantic: item.semantic })),
        unsupportedActions: [
          { id: 'foam_wipe', reason: 'requires semantic contact phases' },
          { id: 'water_splash', reason: 'requires a validated prop target' },
          { id: 'fan_hold', reason: 'requires a validated hold phase' },
        ],
      },
      anchors,
      integrity: { sourceHash: sourceManifest.sourceHash, files: integrityFiles },
      validation: { overall: 'pending', runId, checks: { structure: validate.valid ? 'pass' : 'fail', runtimeLoad: 'pending', loopPlayback: 'pending', fit: 'pending', anchors: 'pending', visual: 'pending' } },
      rollback: { replaces: null, rollbackTo: null, rollbackAllowed: true },
    };
    assertPackInvariants(packManifest);
    await writeJson(path.join(packRoot, 'character-pack.json'), packManifest);

    let runtime = { status: 'skipped', reason: 'requested by --skip-runtime' };
    if (!args.skipRuntime) runtime = await runRuntimeValidation({ packRoot, packManifest, loops: packAnimations });
    const runtimePass = runtime.status === 'pass';
    packManifest.status = runtimePass ? 'runtime-usable' : 'blocked';
    packManifest.validation = {
      overall: runtimePass && validate.valid ? 'degraded' : 'blocked',
      runId,
      checks: {
        structure: validate.valid ? 'pass' : 'fail',
        runtimeLoad: runtimePass ? 'pass' : 'fail',
        loopPlayback: runtimePass ? 'pass' : 'fail',
        fit: runtimePass ? 'pass' : 'fail',
        anchors: runtimePass ? 'pending' : 'fail',
        visual: 'pending',
      },
    };
    await writeJson(path.join(runRoot, 'runtime-validation.json'), runtime);
    await writeJson(path.join(packRoot, 'character-pack.json'), packManifest);

    const summary = {
      schemaVersion: 1,
      runId,
      profile: 'loop-only',
      source: sourceManifest,
      mcp: { serverInfo: mcp.serverInfo, toolsUsed: ['inspect_project', 'validate_project', 'describe_rig', 'describe_animation', 'sample_pose'], stderr: mcp.stderr },
      outputs: { modelManifest: 'model-manifest.json', loopProfile: 'loop-profile.json', characterPack: 'character-pack/character-pack.json', runtimeValidation: 'runtime-validation.json' },
      status: runtimePass && validate.valid ? 'runtime-usable' : 'blocked',
      releaseStatus: runtimePass && validate.valid ? 'blocked-until-visual-review' : 'blocked',
      notes: [
        'Only idle was confirmed as a loop input; other exported animations remain candidates.',
        'Rigby2D validate_project reported that binary .skel export is unsupported for this skeleton; JSON is the selected pack format.',
      ],
    };
    await writeJson(path.join(runRoot, 'run-summary.json'), summary);
    console.log(JSON.stringify({ status: summary.status, runId, runRoot, pack: path.join(packRoot, 'character-pack.json'), runtime: runtime.status, mcpVersion: mcp.serverInfo?.version || null }, null, 2));
    if (summary.status === 'blocked') process.exitCode = 1;
  } finally {
    await mcp.close();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ status: 'fail', error: error.message, stack: error.stack }, null, 2));
  process.exitCode = 1;
});
