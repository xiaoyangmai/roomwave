import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runId = `c010-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
const artifactRoot = path.join(managerRoot, 'artifacts', 'runs', runId);
fs.mkdirSync(artifactRoot, { recursive: true });

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const stages = [
  ['forensic', 'manifest:c010'],
  ['source-availability', 'source:check-c010'],
  ['cli-policy', 'cli:policy'],
  ['editor-availability', 'editor:check-c010'],
  ['cli-roundtrip', 'cli:roundtrip:c010'],
  ['texture-source', 'assets:extract-c010'],
  ['texture-gates', 'texture:self-test'],
  ['structure', 'validate'],
  ['constraint-proof', 'proof:hand-strap'],
  ['hand-reachability', 'proof:hand-reachability'],
  ['runtime-isolation', 'proof:runtime-isolation'],
  ['startup-smoke', 'startup:smoke'],
  ['runtime-smoke', 'smoke:runtime'],
  ['visual-evidence', 'capture:review'],
  ['trace-analysis', 'trace:analyze'],
];

const results = [];
const dependencyStage = ['dependencies', 'deps:ensure'];
const pipelineEnv = {
  ...process.env,
  ROOMWAVE_PIPELINE_RUN_ID: runId,
  ROOMWAVE_ARTIFACT_ROOT: artifactRoot,
};

function readJson(relativePath, fallback = null) {
  const file = path.join(managerRoot, relativePath);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function fileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/**
 * Freeze the evidence produced by this run into the run directory.  The
 * capture scripts intentionally keep a convenient latest copy under
 * evidence/c010; this function makes a self-contained, auditable snapshot so
 * a later run cannot silently change the files that support this run.
 */
function packageEvidence({ pipelineStatus, validationStatus, visualReview, stageResults = results }) {
  const evidenceRoot = path.join(artifactRoot, 'evidence');
  const keyframesRoot = path.join(evidenceRoot, 'keyframes');
  const roleRoot = path.join(evidenceRoot, 'role-review');
  const independentRoot = path.join(evidenceRoot, 'independent-review');
  fs.mkdirSync(keyframesRoot, { recursive: true });
  fs.mkdirSync(roleRoot, { recursive: true });
  fs.mkdirSync(independentRoot, { recursive: true });

  const actionSpec = readJson('configs/room-action-matrix.json', { schemaVersion: 1, room: 'gaming_c010', actions: [] });
  const modelManifest = readJson('configs/c010-model-manifest.json', { model: 'c010_00' });
  const dependencyCheck = readJson('artifacts/dependency-check.json', null);
  const visualCaptured = stageResults.some((item) => item.stage === 'visual-evidence' && item.status === 'pass');
  const traceCaptured = stageResults.some((item) => item.stage === 'trace-analysis' && item.status === 'pass');
  const reviewManifest = visualCaptured ? readJson('evidence/c010/review-manifest.json', null) : null;
  const traceAnalysis = traceCaptured
    ? readJson('evidence/c010/trace-analysis.json', { status: 'missing', reason: 'trace analysis was not generated in this run' })
    : { status: 'missing', reason: 'visual evidence or trace analysis did not complete in this run' };
  const migrationConfig = readJson('configs/c010-version-migration.json', null);
  const activeTarget = migrationConfig?.status === 'exported-4.3.26-runtime-round-trip-pass';
  const sourceManifest = readJson(activeTarget ? 'source/nikke_4.3.26/source-manifest.json' : 'source/nikke_4.0.47/source-manifest.json', null);

  const globalEvidenceRoot = path.join(managerRoot, 'evidence', 'c010');
  const portableCliExportSource = path.join(globalEvidenceRoot, 'portable-cli-export.json');
  if (fs.existsSync(portableCliExportSource)) {
    fs.copyFileSync(portableCliExportSource, path.join(evidenceRoot, 'portable-cli-export.json'));
  }
  const copiedFrames = [];
  if (visualCaptured && fs.existsSync(globalEvidenceRoot)) {
    for (const entry of fs.readdirSync(globalEvidenceRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.png')) continue;
      const source = path.join(globalEvidenceRoot, entry.name);
      const target = path.join(keyframesRoot, entry.name);
      fs.copyFileSync(source, target);
      copiedFrames.push(`keyframes/${entry.name}`);
    }
  }
  const globalIndependentRoot = path.join(globalEvidenceRoot, 'independent-review');
  const copiedIndependent = [];
  if (visualCaptured && fs.existsSync(globalIndependentRoot)) {
    for (const entry of fs.readdirSync(globalIndependentRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) continue;
      const source = path.join(globalIndependentRoot, entry.name);
      const target = path.join(independentRoot, entry.name);
      fs.copyFileSync(source, target);
      copiedIndependent.push(`independent-review/${entry.name}`);
    }
  }
  const browserConsoleSource = path.join(globalEvidenceRoot, 'browser-console.jsonl');
  if (visualCaptured && fs.existsSync(browserConsoleSource)) {
    fs.copyFileSync(browserConsoleSource, path.join(evidenceRoot, 'browser-console.jsonl'));
  }

  if (reviewManifest) writeJson(path.join(evidenceRoot, 'review-manifest.json'), reviewManifest);
  else writeJson(path.join(evidenceRoot, 'review-manifest.json'), { status: 'missing', reason: 'visual capture did not complete' });
  writeJson(path.join(evidenceRoot, 'trace-analysis.json'), traceAnalysis);
  writeJson(path.join(evidenceRoot, 'action-spec.json'), actionSpec);
  const sourceManifestEvidence = activeTarget && sourceManifest
    ? { file: sourceManifest.targetProject, editorVersion: sourceManifest.targetEditorVersion, bytes: sourceManifest.targetProjectBytes, sha256: sourceManifest.targetProjectSha256, readOnly: false }
    : sourceManifest?.sourceProject || null;
  writeJson(path.join(evidenceRoot, 'model-runtime.json'), {
    schemaVersion: 1,
    model: modelManifest.model || 'c010_00',
    modelHash: modelManifest.sourceProject?.sha256 || sourceManifest?.sourceProject?.sha256 || null,
    exportVersion: modelManifest.exportedSpine || sourceManifest?.sourceProject?.editorVersion || null,
    runtimeVersion: modelManifest.runtime || null,
    runtimeSha256: modelManifest.runtimeSha256 || null,
    dependencyCheck,
    sourceManifest: sourceManifestEvidence,
    portableCliExport: readJson('evidence/c010/portable-cli-export.json', null),
  });

  const traceFrames = [];
  if (visualCaptured && reviewManifest?.productRoom) {
    for (const frame of reviewManifest.productRoom.trace?.frames || []) {
      traceFrames.push({ source: 'product-room-trace', action: null, frame });
    }
    for (const [action, frames] of Object.entries(reviewManifest.productRoom.actionTraces || {})) {
      for (const frame of frames || []) traceFrames.push({ source: 'action-trace', action, frame });
    }
  }
  const traceLines = traceFrames.map((entry, index) => JSON.stringify({ runId, frame: index, room: 'gaming_c010', source: entry.source, action: entry.action, ...entry.frame }));
  fs.writeFileSync(path.join(evidenceRoot, 'frame-trace.jsonl'), `${traceLines.length ? `${traceLines.join('\n')}\n` : `${JSON.stringify({ runId, status: 'missing', reason: 'product trace was not captured' })}\n`}`, 'utf8');

  const consoleLines = results.map((item) => {
    const logFile = path.join(artifactRoot, item.log);
    const text = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : '';
    const errorCount = (text.match(/(?:^|\n)\s*(?:error|uncaught|exception)\b/gi) || []).length;
    let runtimeSmoke = null;
    if (item.stage === 'runtime-smoke') {
      try {
        const match = text.match(/(\{\s*"schemaVersion"\s*:\s*2[\s\S]*\})\s*$/);
        runtimeSmoke = match ? JSON.parse(match[1]) : null;
      } catch {
        runtimeSmoke = null;
      }
    }
    return JSON.stringify({
      runId,
      stage: item.stage,
      captured: Boolean(runtimeSmoke),
      source: item.log,
      errorCount: runtimeSmoke ? (runtimeSmoke.errors || []).length : errorCount,
      browserErrors: runtimeSmoke?.errors || [],
    });
  });
  fs.writeFileSync(path.join(evidenceRoot, 'console.jsonl'), `${consoleLines.join('\n')}\n`, 'utf8');

  const runtimeSmokeResult = (() => {
    const item = stageResults.find((stage) => stage.stage === 'runtime-smoke');
    if (!item) return null;
    const logFile = path.join(artifactRoot, item.log);
    if (!fs.existsSync(logFile)) return null;
    try {
      const text = fs.readFileSync(logFile, 'utf8');
      const match = text.match(/(\{\s*"schemaVersion"\s*:\s*2[\s\S]*\})\s*$/);
      return match ? JSON.parse(match[1]) : null;
    } catch {
      return null;
    }
  })();
  writeJson(path.join(evidenceRoot, 'runtime-hand-ik.json'), runtimeSmokeResult?.runtimeHandIk
    ? { schemaVersion: 1, runId, ...runtimeSmokeResult.runtimeHandIk }
    : { schemaVersion: 1, runId, status: 'missing', reason: 'runtime smoke did not emit the hand IK fallback proof' });

  writeJson(path.join(evidenceRoot, 'metrics.json'), {
    schemaVersion: 1,
    runId,
    pipelineStatus,
    validationStatus,
    traceStatus: traceAnalysis.status || 'missing',
    traceActions: (traceAnalysis.actions || []).map((action) => ({
      type: action.type,
      targetVisualGapPx: action.targetVisualGapPx,
      visualFollowRatio: action.visualFollowRatio,
      strapDeltaPx: action.strapDeltaPx,
      interpretation: action.interpretation,
    })),
    keyframeCount: copiedFrames.length,
  });

  const roles = ['motion-animator', 'technical-artist', 'art-director', 'product-reviewer', 'adversarial-reviewer'];
  for (const role of roles) {
    writeJson(path.join(roleRoot, `${role}.json`), {
      schemaVersion: 1,
      role,
      runId,
      status: 'not-run',
      decision: 'not-run',
      confidence: 0,
      scores: {},
      findings: [],
      unknown: ['independent visual review has not been run'],
      evidenceScope: 'run evidence only; no generation rationale supplied',
    });
  }
  const roleSources = {
    'motion-animator': 'motion-animator.json',
    'technical-artist': 'technical-artist.json',
    'art-director': 'art-director.json',
    'product-reviewer': 'product-reviewer.json',
    'adversarial-reviewer': 'adversarial-reviewer.json',
  };
  for (const [role, file] of Object.entries(roleSources)) {
    const source = path.join(independentRoot, file);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(roleRoot, file));
  }
  const completedRoles = roles.filter((role) => {
    const file = path.join(roleRoot, `${role}.json`);
    if (!fs.existsSync(file)) return false;
    try { return JSON.parse(fs.readFileSync(file, 'utf8')).decision !== 'not-run'; } catch { return false; }
  });

  writeJson(path.join(evidenceRoot, 'adjudication.json'), {
    schemaVersion: 1,
    runId,
    status: completedRoles.length === roles.length ? 'independent-reviews-present' : 'awaiting-independent-multimodal-review',
    // Keep the adjudication value inside the rubric enum. The explanatory
    // pipeline status remains in `status`; `review` is deliberately not pass.
    decision: 'review',
    gates: { G1: 'tool-reported', G2: 'review-required', G3: 'review-required', G4: 'not-run' },
    unknown: [
      ...(completedRoles.length === roles.length ? [] : [`${roles.length - completedRoles.length} independent role reviews are not present`]),
      'no independent adjudication has been completed',
    ],
  });
  const previousRunsRoot = path.join(managerRoot, 'artifacts', 'runs');
  const previousRuns = fs.existsSync(previousRunsRoot)
    ? fs.readdirSync(previousRunsRoot).filter((name) => name !== runId && fs.existsSync(path.join(previousRunsRoot, name, 'run-summary.json')))
      .map((name) => path.join(previousRunsRoot, name)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    : [];
  const previousRun = previousRuns[0] || null;
  const currentFrameRoot = keyframesRoot;
  const previousFrameRoot = previousRun ? path.join(previousRun, 'evidence', 'keyframes') : null;
  const commonFrames = [];
  const changedFrames = [];
  if (previousFrameRoot && fs.existsSync(previousFrameRoot)) {
    for (const entry of fs.readdirSync(currentFrameRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.png')) continue;
      const previousFile = path.join(previousFrameRoot, entry.name);
      if (!fs.existsSync(previousFile)) continue;
      commonFrames.push(entry.name);
      if (fileHash(path.join(currentFrameRoot, entry.name)) !== fileHash(previousFile)) changedFrames.push(entry.name);
    }
  }
  writeJson(path.join(evidenceRoot, 'regression.json'), {
    schemaVersion: 1,
    runId,
    status: previousRun ? 'compared-to-provisional-previous-run' : 'baseline-not-configured',
    previousRunId: previousRun ? path.basename(previousRun) : null,
    comparison: previousRun ? { commonFrameCount: commonFrames.length, changedFrameCount: changedFrames.length, changedFrames, baselineIsReleaseAccepted: false } : null,
  });

  writeJson(path.join(evidenceRoot, 'run-manifest.json'), {
    schemaVersion: 1,
    runId,
    room: 'gaming_c010',
    route: '/solo/?room=gaming_c010',
    modelHash: modelManifest.sourceProject?.sha256 || sourceManifest?.sourceProject?.sha256 || null,
    exportVersion: modelManifest.exportedSpine || null,
    runtimeVersion: modelManifest.runtime || null,
    viewport: { width: 960, height: 900, deviceScaleFactor: 1 },
    seed: 'runtime-smoke-fixed-seed',
    inputs: actionSpec.actions?.map((action) => action.id) || [],
    pipelineStatus,
    validationStatus,
    visualReview: visualReview || 'awaiting-independent-multimodal-review',
    files: [
      'action-spec.json', 'model-runtime.json', 'portable-cli-export.json', 'review-manifest.json', 'trace-analysis.json', 'runtime-hand-ik.json',
      'frame-trace.jsonl', 'console.jsonl', 'browser-console.jsonl', 'metrics.json', 'adjudication.json', 'regression.json',
      'role-review/motion-animator.json', 'role-review/technical-artist.json',
      'role-review/art-director.json', 'role-review/product-reviewer.json',
      'role-review/adversarial-reviewer.json', ...copiedFrames.map((file) => file.replaceAll('\\', '/')),
      ...copiedIndependent,
      ...(fs.existsSync(path.join(evidenceRoot, 'portable-cli-export'))
        ? fs.readdirSync(path.join(evidenceRoot, 'portable-cli-export')).map((file) => `portable-cli-export/${file}`)
        : []),
    ],
  });

  return path.relative(managerRoot, evidenceRoot).replaceAll('\\', '/');
}

for (const [stage, script] of [dependencyStage]) {
  const startedAt = new Date().toISOString();
  const child = spawnSync(npm, ['run', script], { cwd: managerRoot, encoding: 'utf8', windowsHide: true, shell: process.platform === 'win32', maxBuffer: 16 * 1024 * 1024, env: pipelineEnv });
  const output = `${child.stdout || ''}${child.stderr || ''}${child.error ? `\n${child.error.stack || child.error.message}` : ''}`;
  fs.writeFileSync(path.join(artifactRoot, `${stage}.log`), output, 'utf8');
  const result = { stage, script, startedAt, exitCode: child.status ?? 1, status: child.status === 0 ? 'pass' : 'fail', log: `${stage}.log` };
  results.push(result);
  console.log(JSON.stringify(result));
  if (child.status !== 0) break;
}
if (results.some((item) => item.status !== 'pass')) {
  const evidenceRoot = packageEvidence({ pipelineStatus: 'failed', validationStatus: 'dependency-check-failed', visualReview: 'not-run', stageResults: results });
  const summary = { schemaVersion: 1, runId, generatedAt: new Date().toISOString(), model: 'c010_00', results, pipelineStatus: 'failed', releaseStatus: 'blocked-or-needs-review', validationStatus: 'dependency-check-failed', sourceUnmodified: true, visualReview: 'not-run', evidenceRoot };
  fs.writeFileSync(path.join(artifactRoot, 'run-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ...summary, artifactRoot }, null, 2));
  process.exit(1);
}
for (const [stage, script] of stages) {
  const startedAt = new Date().toISOString();
  const child = spawnSync(npm, ['run', script], { cwd: managerRoot, encoding: 'utf8', windowsHide: true, shell: process.platform === 'win32', maxBuffer: 16 * 1024 * 1024, env: pipelineEnv });
  const output = `${child.stdout || ''}${child.stderr || ''}${child.error ? `\n${child.error.stack || child.error.message}` : ''}`;
  fs.writeFileSync(path.join(artifactRoot, `${stage}.log`), output, 'utf8');
  const result = { stage, script, startedAt, exitCode: child.status ?? 1, status: child.status === 0 ? 'pass' : 'fail', log: `${stage}.log` };
  results.push(result);
  console.log(JSON.stringify(result));
  if (child.status !== 0) break;
}

const validation = fs.existsSync(path.join(managerRoot, 'configs', 'c010-validation-report.json'))
  ? JSON.parse(fs.readFileSync(path.join(managerRoot, 'configs', 'c010-validation-report.json'), 'utf8'))
  : null;
const summary = {
  schemaVersion: 1,
  runId,
  generatedAt: new Date().toISOString(),
  model: 'c010_00',
  results,
  pipelineStatus: results.every((item) => item.status === 'pass') ? 'completed-with-review-gates' : 'failed',
  releaseStatus: validation?.status === 'pass' ? 'eligible-for-release-review' : 'blocked-or-needs-review',
  validationStatus: validation?.status || 'missing',
  sourceUnmodified: true,
  visualReview: 'evidence-captured-independent-review-required',
};
summary.evidenceRoot = packageEvidence({ pipelineStatus: summary.pipelineStatus, validationStatus: summary.validationStatus, visualReview: summary.visualReview, stageResults: results });
fs.writeFileSync(path.join(artifactRoot, 'run-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ ...summary, artifactRoot }, null, 2));
if (summary.pipelineStatus === 'failed') process.exitCode = 1;
