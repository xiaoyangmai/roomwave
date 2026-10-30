const fs = require('node:fs');
const path = require('node:path');

const managerRoot = path.resolve(__dirname, '..');
const inputPath = path.resolve(process.env.ROOMWAVE_REVIEW_MANIFEST || path.join(managerRoot, 'evidence/c010/review-manifest.json'));
const outputPath = path.resolve(process.env.ROOMWAVE_TRACE_ANALYSIS || path.join(managerRoot, 'evidence/c010/trace-analysis.json'));

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function distance(a, b) {
  if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(b.x) || !Number.isFinite(b.y)) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function nearest(frames, phase) {
  return frames.find((frame) => frame.phase === phase) || frames[Math.floor(frames.length * (phase === 'contact' ? .6 : .2))] || frames[0] || null;
}
function analyzeAction(type, frames) {
  const clean = frames.filter((frame) => frame && frame.type === type);
  const start = clean[0] || null;
  const contact = nearest(clean, 'contact');
  const release = clean[clean.length - 1] || null;
  const handTargetDelta = distance(start?.hand, contact?.hand);
  const handVisualDelta = distance(start?.handVisual, contact?.handVisual);
  const targetVisualGap = distance(contact?.hand, contact?.handVisual);
  const strapDelta = distance(start?.strap, contact?.strap);
  const fanGaps = clean.map((frame) => frame.fanAnchor?.gapPx).filter(Number.isFinite);
  const fanAnchorGap = fanGaps.length ? Math.max(...fanGaps) : null;
  const phases = [...new Set(clean.map((frame) => frame.phase).filter(Boolean))];
  const targetMoved = handTargetDelta === null || handTargetDelta >= 10;
  const visualFollowRatio = handTargetDelta && handVisualDelta !== null ? handVisualDelta / handTargetDelta : null;
  const visibleFollows = visualFollowRatio === null || visualFollowRatio >= .5;
  const strapStable = strapDelta === null || strapDelta <= 8;
  const fanAnchorStable = type !== 'fan_hold' || (fanAnchorGap !== null && fanAnchorGap <= 12);
  const requiresHandContact = type === 'foam_wipe' || type === 'water_splash';
  const interpretation = !requiresHandContact
    ? (type === 'fan_hold' ? (fanAnchorStable ? 'hold_visual_stable' : 'fan_anchor_unstable') : 'reaction_without_hand_contact')
    : !targetMoved ? 'target_did_not_move' : !visibleFollows ? 'target_moves_but_visible_hand_does_not_follow' : !strapStable ? 'hand_motion_leaks_into_strap' : 'provisional_motion_consistent';
  return {
    type,
    sampleCount: clean.length,
    phases,
    startTime: start?.t ?? null,
    contactTime: contact?.t ?? null,
    releaseTime: release?.t ?? null,
    handTargetDeltaPx: handTargetDelta,
    handVisualDeltaPx: handVisualDelta,
    targetVisualGapPx: targetVisualGap,
    strapDeltaPx: strapDelta,
    fanAnchorGapPx: fanAnchorGap,
    visualFollowRatio,
    checks: { targetMoved, visibleFollows, strapStable, fanAnchorStable },
    requiresHandContact,
    interpretation,
  };
}

function main() {
  if (!fs.existsSync(inputPath)) throw new Error(`review manifest is missing: ${inputPath}`);
  const manifest = readJson(inputPath);
  const actionTraces = manifest.productRoom?.actionTraces || {};
  const actions = Object.entries(actionTraces).map(([type, frames]) => analyzeAction(type, frames));
  const blockers = actions.filter((item) => item.requiresHandContact && item.interpretation !== 'provisional_motion_consistent');
  const result = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    room: manifest.productRoom?.route || '/solo/?room=gaming_c010',
    sourceManifest: path.relative(managerRoot, inputPath).replaceAll('\\', '/'),
    status: blockers.length ? 'needs-review' : 'pass',
    actions,
    blockers: blockers.map((item) => ({ type: item.type, interpretation: item.interpretation })),
    method: {
      coordinateSpace: 'canvas CSS pixels',
      contactSelection: 'first sampled contact phase; fixed playback and seed are required',
      thresholds: { targetMovedPx: 10, visibleFollowRatio: .5, strapStablePx: 8, fanAnchorGapPx: 12 },
      labels: ['FACT', 'INFERENCE', 'UNKNOWN'],
    },
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'needs-review' && process.argv.includes('--strict')) process.exitCode = 1;
}

main();
