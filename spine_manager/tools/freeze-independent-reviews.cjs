const fs = require('node:fs');
const path = require('node:path');

const managerRoot = path.resolve(__dirname, '..');
const runId = process.argv[process.argv.indexOf('--run-id') + 1];
if (!runId) throw new Error('Use --run-id c010-...');

const runRoot = path.join(managerRoot, 'artifacts', 'runs', runId, 'evidence');
const manifestPath = path.join(runRoot, 'run-manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error(`Run evidence is missing: ${manifestPath}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.runId !== runId) throw new Error(`Run manifest mismatch: ${manifest.runId}`);

const globalRoot = path.join(managerRoot, 'evidence', 'c010', 'independent-review');
const independentRoot = path.join(runRoot, 'independent-review');
const roleRoot = path.join(runRoot, 'role-review');
fs.mkdirSync(independentRoot, { recursive: true });
fs.mkdirSync(roleRoot, { recursive: true });
const roles = ['motion-animator', 'technical-artist', 'art-director', 'product-reviewer', 'adversarial-reviewer'];
const allowed = new Set(['pass', 'review', 'fail', 'blocked_visual_uncertainty']);
const results = [];
for (const role of roles) {
  const globalSource = path.join(globalRoot, `${role}.json`);
  const runSource = path.join(independentRoot, `${role}.json`);
  let source = globalSource;
  if (fs.existsSync(runSource)) {
    try {
      const runReview = JSON.parse(fs.readFileSync(runSource, 'utf8'));
      if (runReview.runId === runId) source = runSource;
    } catch { /* fall back to the global candidate */ }
  }
  if (!fs.existsSync(source)) {
    results.push({ role, status: 'missing' });
    continue;
  }
  const review = JSON.parse(fs.readFileSync(source, 'utf8'));
  review.role ||= review.reviewer;
  const decision = review.decision === 'needs_review' ? 'review' : review.decision;
  if (review.runId !== runId) {
    results.push({ role, status: 'stale', reviewRunId: review.runId });
    continue;
  }
  if (!allowed.has(decision)) {
    results.push({ role, status: 'invalid-decision', decision });
    continue;
  }
  if (decision !== review.decision) review.normalization = { originalDecision: review.decision, normalizedDecision: decision };
  review.decision = decision;
  fs.writeFileSync(path.join(independentRoot, `${role}.json`), `${JSON.stringify(review, null, 2)}\n`);
  fs.writeFileSync(path.join(roleRoot, `${role}.json`), `${JSON.stringify(review, null, 2)}\n`);
  results.push({ role, status: 'frozen', decision, confidence: review.confidence ?? null });
}
const complete = results.filter((item) => item.status === 'frozen').length === roles.length;
const frozenReviews = results.filter((item) => item.status === 'frozen').map((item) => JSON.parse(fs.readFileSync(path.join(roleRoot, `${item.role}.json`), 'utf8')));
const lowConfidence = frozenReviews.filter((review) => {
  const confidence = Number(review.confidence);
  return !Number.isFinite(confidence) || confidence < 0.8;
}).map((review) => review.role);
const unresolvedUnknown = frozenReviews.filter((review) => {
  const unknown = review.unknown || review.unknowns;
  return Array.isArray(unknown) && unknown.length > 0;
}).map((review) => review.role || review.reviewer);
const blockedVisual = complete && (lowConfidence.length > 0 || unresolvedUnknown.length > 0 || frozenReviews.some((review) => review.decision === 'blocked_visual_uncertainty'));
const adjudication = {
  schemaVersion: 1,
  runId,
  status: blockedVisual ? 'blocked_visual_uncertainty' : complete ? 'independent-reviews-present' : 'awaiting-independent-multimodal-review',
  decision: blockedVisual ? 'blocked_visual_uncertainty' : 'review',
  gates: { G1: 'tool-reported', G2: complete ? 'review' : 'review-required', G3: complete ? 'review' : 'review-required', G4: blockedVisual ? 'blocked_visual_uncertainty' : complete ? 'review' : 'not-run' },
  roleResults: results,
  lowConfidence,
  unresolvedUnknown,
  unknown: blockedVisual ? ['one or more roles have confidence below 0.8 or unresolved UNKNOWN findings'] : complete ? ['independent role findings contain unresolved review items; no release pass is claimed'] : ['one or more independent role reviews are missing, stale, or invalid'],
  method: 'schema-checked evidence freeze; visual findings remain independent review inputs and are not averaged into a pass',
};
fs.writeFileSync(path.join(runRoot, 'adjudication.json'), `${JSON.stringify(adjudication, null, 2)}\n`);
const summaryPath = path.join(managerRoot, 'artifacts', 'runs', runId, 'run-summary.json');
if (fs.existsSync(summaryPath)) {
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  summary.visualReview = adjudication.status;
  summary.reviewAdjudication = path.relative(managerRoot, path.join(runRoot, 'adjudication.json')).replaceAll('\\', '/');
  summary.releaseStatus = 'blocked-or-needs-review';
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
}
console.log(JSON.stringify({ runId, complete, results, adjudication: path.relative(managerRoot, path.join(runRoot, 'adjudication.json')).replaceAll('\\', '/') }, null, 2));
if (!complete) process.exitCode = 1;
