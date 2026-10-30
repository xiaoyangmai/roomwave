import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(managerRoot, 'configs', 'goal-loop.json'), 'utf8'));
const ledgerPath = path.join(managerRoot, config.reviewProtocol.ledger);

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

function latestRunId() {
  const root = path.join(managerRoot, 'artifacts', 'runs');
  if (!fs.existsSync(root)) return null;
  const files = fs.readdirSync(root).map((name) => path.join(root, name, 'run-summary.json')).filter(fs.existsSync);
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!files.length) return null;
  return JSON.parse(fs.readFileSync(files[0], 'utf8')).runId || null;
}

function main() {
  const turn = Number(arg('turn'));
  if (!Number.isInteger(turn) || turn < 1) throw new Error('Use --turn N with a positive integer.');
  const rows = fs.existsSync(ledgerPath) ? fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)) : [];
  const expected = rows.length ? rows[rows.length - 1].turn + 1 : 1;
  if (turn !== expected) throw new Error(`Goal turn ledger expects turn ${expected}, received ${turn}.`);

  let checkpoint = null;
  if (turn % config.reviewProtocol.reviewEveryTurns === 0) {
    const script = path.join(managerRoot, 'tools', 'checkpoint-review.mjs');
    const result = spawnSync(process.execPath, [script, '--turn', String(turn)], { cwd: managerRoot, encoding: 'utf8' });
    if (result.status !== 0) {
      process.stdout.write(result.stdout || '');
      process.stderr.write(result.stderr || '');
      throw new Error(`Turn ${turn} cannot start because its required checkpoint failed.`);
    }
    checkpoint = `artifacts/goal-loop/checkpoints/turn-${String(turn).padStart(3, '0')}.json`;
  }
  const row = {
    schemaVersion: 1,
    goalId: config.goalId,
    turn,
    recordedAt: new Date().toISOString(),
    runId: arg('run-id') || latestRunId(),
    summary: arg('summary') || null,
    priority: arg('priority') || null,
    checkpoint,
    checkpointRequired: turn % config.reviewProtocol.reviewEveryTurns === 0
  };
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.appendFileSync(ledgerPath, `${JSON.stringify(row)}\n`);
  console.log(JSON.stringify({ status: 'pass', row }, null, 2));
}

main();
