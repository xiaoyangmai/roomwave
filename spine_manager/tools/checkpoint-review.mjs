import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loopConfigPath = path.join(managerRoot, 'configs', 'goal-loop.json');
const config = JSON.parse(fs.readFileSync(loopConfigPath, 'utf8'));

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function resolveRequired(relative) {
  if (relative.includes('*')) return null;
  return path.join(managerRoot, relative);
}

function latestRun() {
  const root = path.join(managerRoot, 'artifacts', 'runs');
  if (!fs.existsSync(root)) return null;
  const candidates = fs.readdirSync(root).map((name) => path.join(root, name, 'run-summary.json')).filter(fs.existsSync);
  candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!candidates.length) return null;
  const file = candidates[0];
  return { file: path.relative(managerRoot, file).replaceAll('\\', '/'), data: JSON.parse(fs.readFileSync(file, 'utf8')) };
}

function previousCheckpoint(turn) {
  const previousTurn = turn - config.reviewProtocol.reviewEveryTurns;
  if (previousTurn < config.reviewProtocol.reviewEveryTurns) return null;
  const file = path.join(
    managerRoot,
    config.reviewProtocol.checkpointDirectory,
    `turn-${String(previousTurn).padStart(3, '0')}.json`,
  );
  if (!fs.existsSync(file)) return null;
  return { file, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
}

function main() {
  const turn = Number(arg('turn'));
  if (!Number.isInteger(turn) || turn < 1 || turn % config.reviewProtocol.reviewEveryTurns !== 0) {
    throw new Error(`Checkpoint requires a positive turn divisible by ${config.reviewProtocol.reviewEveryTurns}.`);
  }

  const readDocs = [];
  const missing = [];
  for (const relative of config.reviewProtocol.mustReadBeforeCheckpoint) {
    const file = resolveRequired(relative);
    if (!file || !fs.existsSync(file)) {
      missing.push(relative);
      continue;
    }
    const text = fs.readFileSync(file, 'utf8');
    readDocs.push({ file: relative, bytes: Buffer.byteLength(text), sha256: sha256(file) });
  }
  if (missing.length) throw new Error(`Checkpoint cannot pass; missing plan files: ${missing.join(', ')}`);

  const inspected = [];
  const missingEvidence = [];
  for (const relative of config.reviewProtocol.mustInspectBeforeCheckpoint.filter((item) => !item.includes('*'))) {
    const file = path.join(managerRoot, relative);
    if (!fs.existsSync(file)) { inspected.push({ file: relative, status: 'missing' }); missingEvidence.push(relative); }
    else inspected.push({ file: relative, status: 'read', bytes: fs.statSync(file).size, sha256: sha256(file) });
  }
  const run = latestRun();
  const previous = previousCheckpoint(turn);
  const latestRunTime = run?.data?.generatedAt ? Date.parse(run.data.generatedAt) : NaN;
  const previousCheckpointTime = previous?.data?.reviewedAt ? Date.parse(previous.data.reviewedAt) : NaN;
  const staleRun = Boolean(
    run && previous && Number.isFinite(latestRunTime) && Number.isFinite(previousCheckpointTime)
      && latestRunTime <= previousCheckpointTime,
  );
  const validationPath = path.join(managerRoot, 'configs', 'c010-validation-report.json');
  const validation = fs.existsSync(validationPath) ? JSON.parse(fs.readFileSync(validationPath, 'utf8')) : null;
  const editor = validation?.pipeline?.editorAvailability || null;
  const warnings = validation?.warnings || [];
  const nextPriority = editor?.status === 'migration-editor-available-but-version-mismatch'
    ? 'keep-4.0.47 as baseline and add a controlled export path before mutation'
    : warnings.some((item) => item.includes('hand') || item.includes('strap'))
      ? 'replace the one-bone hand IK and isolate the strap target'
      : warnings.length ? 'resolve the highest-priority warning with one minimal experiment' : 'run the release gates and independent visual review';
  const releaseAllowed = validation?.status === 'pass' && !warnings.length && run?.data?.releaseStatus === 'eligible-for-release-review';
  const gatesClosed = !validation || validation.status !== 'pass' || !run || run.data.releaseStatus !== 'eligible-for-release-review';
  const checkpoint = {
    schemaVersion: 1,
    goalId: config.goalId,
    turn,
    reviewedAt: new Date().toISOString(),
    planFilesRead: readDocs,
    evidenceInspected: inspected,
    latestRun: run,
    validation: validation ? { status: validation.status, warnings, issues: validation.issues || [] } : null,
    currentState: releaseAllowed ? 'release-ready' : validation?.pipeline?.runtimePatch?.releaseStatus === 'provisional-runtime-only' ? 'runtime-usable' : 'mutation-ready-pending',
    mutationAllowed: editor?.status === 'editor-or-cli-available' && editor?.availableForRequiredVersion === true,
    releaseAllowed,
    gatesClosed,
    nextPriority,
    failClosed: missing.length > 0 || missingEvidence.length > 0 || !validation || !run || staleRun,
    missingEvidence,
    previousCheckpoint: previous ? { file: path.relative(managerRoot, previous.file).replaceAll('\\', '/'), reviewedAt: previous.data.reviewedAt } : null,
    evidenceFreshForCheckpoint: !staleRun,
    sourceOfTruth: 'read-files-and-latest-run-evidence'
  };
  const outDir = path.join(managerRoot, config.reviewProtocol.checkpointDirectory);
  fs.mkdirSync(outDir, { recursive: true });
  const output = path.join(outDir, `turn-${String(turn).padStart(3, '0')}.json`);
  fs.writeFileSync(output, `${JSON.stringify(checkpoint, null, 2)}\n`);
  console.log(JSON.stringify({ status: checkpoint.failClosed ? 'blocked-missing-evidence' : gatesClosed ? 'reviewed-gates-closed' : 'pass', output: path.relative(managerRoot, output).replaceAll('\\', '/'), nextPriority, currentState: checkpoint.currentState, gatesClosed }, null, 2));
  if (checkpoint.failClosed) process.exitCode = 1;
}

main();
