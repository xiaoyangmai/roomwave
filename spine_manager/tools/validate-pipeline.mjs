import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roomwaveRoot = path.resolve(managerRoot, '..');
const auditPath = path.join(roomwaveRoot, 'src', 'spine-audit', 'c010', 'audit-report.json');
const bindingPath = path.join(roomwaveRoot, 'src', 'spine-audit', 'c010', 'semantic-binding.json');
const planPath = path.join(managerRoot, 'configs', 'c010-control-plan.json');
const derivedRigPlanPath = path.join(managerRoot, 'configs', 'c010-derived-rig-plan.json');
const pipelinePath = path.join(managerRoot, 'configs', 'agent-pipeline.json');
const providerPath = path.join(managerRoot, 'configs', 'image-provider.json');
const invariantPath = path.join(managerRoot, 'configs', 'model-invariants.json');
const capabilityContractPath = path.join(managerRoot, 'configs', 'spine-4.3-capability-contract.json');
const calibrationPath = path.join(managerRoot, 'configs', 'calibration.json');
const manifestPath = path.join(managerRoot, 'configs', 'c010-model-manifest.json');
const handStrapEvidencePath = path.join(managerRoot, 'evidence', 'c010-hand-only-string-off.json');
const handReachabilityEvidencePath = path.join(managerRoot, 'evidence', 'c010-hand-reachability.json');
const sourceAvailabilityPath = path.join(managerRoot, 'evidence', 'c010-source-availability.json');
const editorAvailabilityPath = path.join(managerRoot, 'evidence', 'c010-editor-availability.json');
const runtimePatchPath = path.join(roomwaveRoot, 'src', 'config', 'c010-runtime-patch.json');
const migrationPath = path.join(managerRoot, 'configs', 'c010-version-migration.json');
const reviewManifestPath = path.join(managerRoot, 'evidence', 'c010', 'review-manifest.json');
const visualReviewPath = path.join(managerRoot, 'evidence', 'c010', 'codex-vision-review.json');
const traceAnalysisPath = path.join(managerRoot, 'evidence', 'c010', 'trace-analysis.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function hasName(items, name) {
  return Array.isArray(items) && items.some((item) => (typeof item === 'string' ? item : item?.name) === name);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function latestRunAdjudication() {
  const runsRoot = path.join(managerRoot, 'artifacts', 'runs');
  if (!fs.existsSync(runsRoot)) return null;
  const candidates = fs.readdirSync(runsRoot)
    .map((name) => path.join(runsRoot, name))
    .filter((dir) => fs.existsSync(path.join(dir, 'run-summary.json')));
  candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const dir of candidates) {
    const file = path.join(dir, 'evidence', 'adjudication.json');
    if (fs.existsSync(file)) return { file, data: readJson(file) };
  }
  return null;
}

function main() {
  const strict = process.argv.includes('--strict');
  const audit = readJson(auditPath);
  const binding = readJson(bindingPath);
  const plan = readJson(planPath);
  const derivedRigPlan = readJson(derivedRigPlanPath);
  const pipeline = readJson(pipelinePath);
  const provider = readJson(providerPath);
  const invariants = readJson(invariantPath);
  const capabilityContract = readJson(capabilityContractPath);
  const calibration = readJson(calibrationPath);
  const manifest = readJson(manifestPath);
  const runtimePatch = readJson(runtimePatchPath);
  const migration = fs.existsSync(migrationPath) ? readJson(migrationPath) : null;
  const reviewManifest = fs.existsSync(reviewManifestPath) ? readJson(reviewManifestPath) : null;
  const visualReview = fs.existsSync(visualReviewPath) ? readJson(visualReviewPath) : null;
  const traceAnalysis = fs.existsSync(traceAnalysisPath) ? readJson(traceAnalysisPath) : null;
  const runAdjudication = latestRunAdjudication();
  const handStrapEvidence = fs.existsSync(handStrapEvidencePath) ? readJson(handStrapEvidencePath) : null;
  const handReachabilityEvidence = fs.existsSync(handReachabilityEvidencePath) ? readJson(handReachabilityEvidencePath) : null;
  const sourceAvailability = fs.existsSync(sourceAvailabilityPath) ? readJson(sourceAvailabilityPath) : null;
  const editorAvailability = fs.existsSync(editorAvailabilityPath) ? readJson(editorAvailabilityPath) : null;
  const mainAudit = audit.audits.find((item) => item.file === 'c010_00.skel');
  if (!mainAudit) throw new Error('Missing c010_00.skel audit.');

  const bones = mainAudit.bones || [];
  const ik = mainAudit.constraints?.ik || [];
  const transform = mainAudit.constraints?.transform || [];
  const slots = mainAudit.slots || [];
  const issues = [];
  const warnings = [];
  const migrationPending = Boolean(migration?.status?.includes('pending'));
  const resolved = binding.semantics?.roles || {};
  const configuredSourceProject = process.env.C010_SPINE_PROJECT ? path.resolve(process.env.C010_SPINE_PROJECT) : null;
  const sourceProjectCheck = {
    configured: Boolean(configuredSourceProject),
    available: false,
    verified: false,
    path: configuredSourceProject,
  };

  if (runtimePatch.model !== plan.model) issues.push(`runtime patch model mismatch: ${runtimePatch.model || '(unset)'}`);
  if (derivedRigPlan.model !== plan.model) issues.push(`derived rig plan model mismatch: ${derivedRigPlan.model || '(unset)'}`);
  if (runtimePatch.mode !== 'runtime-isolation-fallback') warnings.push(`unexpected runtime patch mode: ${runtimePatch.mode || '(unset)'}`);
  const patchedString = runtimePatch.constraints?.string_2;
  if (!patchedString || patchedString.mixRotate !== 0 || patchedString.mixX !== 0 || patchedString.mixY !== 0) issues.push('runtime patch must isolate string_2 with zero transform mixes');

  for (const [relativeFile, expected] of Object.entries(manifest.files || {})) {
    const file = path.join(roomwaveRoot, 'src', 'spine-audit', 'c010', relativeFile);
    if (!fs.existsSync(file)) issues.push(`manifest file is missing: ${relativeFile}`);
    else if (sha256(file) !== expected.sha256) issues.push(`manifest hash mismatch: ${relativeFile}`);
  }
  if (manifest.exportedSpine && plan.versions?.exportedSpine && manifest.exportedSpine !== plan.versions.exportedSpine) {
    if (migrationPending) warnings.push(`c010 migration pending: current export ${manifest.exportedSpine} is still rollback input; target baseline is ${plan.versions.exportedSpine}`);
    else issues.push(`manifest/export plan Spine version mismatch: ${manifest.exportedSpine} vs ${plan.versions.exportedSpine}`);
  }
  if (manifest.runtimeFile && manifest.runtimeSha256) {
    const runtimeFile = path.join(managerRoot, manifest.runtimeFile);
    if (!fs.existsSync(runtimeFile)) issues.push(`manifest runtime file is missing: ${manifest.runtimeFile}`);
    else if (sha256(runtimeFile) !== manifest.runtimeSha256) issues.push(`manifest runtime hash mismatch: ${manifest.runtimeFile}`);
  }
  if (manifest.sourceProject?.file && manifest.sourceProject?.sha256) {
    const repositorySourceProject = path.join(managerRoot, manifest.sourceProject.file);
    const sourceProject = configuredSourceProject || repositorySourceProject;
    if (!fs.existsSync(sourceProject)) {
      if (configuredSourceProject) issues.push(`configured external source project is missing: ${configuredSourceProject}`);
      else warnings.push('external source project is not configured; set C010_SPINE_PROJECT to the editable .spine file');
    } else {
      sourceProjectCheck.available = true;
      sourceProjectCheck.path = sourceProject;
      if (sha256(sourceProject) !== manifest.sourceProject.sha256) {
        issues.push(`manifest source project hash mismatch: ${sourceProject}`);
      } else {
        sourceProjectCheck.verified = true;
      }
    }
  } else warnings.push('manifest does not record an editable source project');

  const stageIds = new Set();
  for (const stage of pipeline.stages || []) {
    if (!stage.id || stageIds.has(stage.id)) issues.push(`agent pipeline has duplicate or missing stage id: ${stage.id || '(unset)'}`);
    stageIds.add(stage.id);
    if (!stage.writes?.includes('<runId>')) issues.push(`agent stage ${stage.id} must write to an isolated run directory`);
    if (!Array.isArray(stage.outputs) || !stage.outputs.length) issues.push(`agent stage ${stage.id} has no declared outputs`);
  }
  if (pipeline.humanInTheLoop !== false) warnings.push('agent pipeline is not configured for fully unattended operation');
  if (!Number.isInteger(pipeline.maxRepairRoundsPerFailure) || pipeline.maxRepairRoundsPerFailure < 1) issues.push('agent pipeline has no valid repair-round limit');
  const requiredProviderCapabilities = ['reference_images', 'masked_edit', 'transparent_output'];
  const providerCapabilities = new Set(provider.primary?.requiredCapabilities || []);
  for (const capability of requiredProviderCapabilities) {
    if (!providerCapabilities.has(capability)) issues.push(`image provider is missing required capability: ${capability}`);
  }
  const hardInvariantCount = (invariants.rules || []).filter((rule) => rule.level === 'hard').length;
  if (!hardInvariantCount) issues.push('model invariants contain no hard rules');
  const requiredSpineCapabilities = ['bones', 'slots_draw_order', 'skins', 'meshes', 'weights', 'constraints', 'animations', 'events', 'atlas_assets', 'validation'];
  const declaredSpineCapabilities = new Set((capabilityContract.capabilities || []).map((capability) => capability.id));
  for (const capability of requiredSpineCapabilities) {
    if (!declaredSpineCapabilities.has(capability)) issues.push(`Spine 4.3 capability contract is missing ${capability}`);
  }
  if (capabilityContract.version_boundary?.editor !== plan.versions?.editor) issues.push(`Spine capability contract editor mismatch: ${capabilityContract.version_boundary?.editor || '(unset)'} vs ${plan.versions?.editor || '(unset)'}`);
  if (capabilityContract.version_boundary?.runtime !== plan.versions?.prototypeRuntime) issues.push(`Spine capability contract runtime mismatch: ${capabilityContract.version_boundary?.runtime || '(unset)'} vs ${plan.versions?.prototypeRuntime || '(unset)'}`);
  if (capabilityContract.unknown_policy?.includes('blocks promotion') !== true) issues.push('Spine capability contract must block promotion on unknown capability evidence');
  if (calibration.status !== 'pending' && !calibration.changeLogRequired) warnings.push('calibration has no required change log');

  for (const [role, value] of Object.entries(resolved)) {
    if (!value?.resolved || value.status === 'missing') continue;
    if (!hasName(bones, value.resolved)) {
      issues.push(`semantic role ${role} resolves to missing bone ${value.resolved}`);
    }
  }

  const handTarget = resolved.handTarget?.resolved;
  const handIk = ik.find((item) => item.target === handTarget || item.name === handTarget);
  const sharedTransform = transform.filter((item) => item.target === handTarget);
  if (!handIk) issues.push(`handTarget ${handTarget || '(unset)'} has no matching IK constraint`);
  if (sharedTransform.length) {
    warnings.push(`handTarget ${handTarget} is also targeted by transform constraints: ${sharedTransform.map((item) => item.name).join(', ')}`);
  }

  const stringConstraint = transform.find((item) => item.name === 'string_2');
  const stringSlot = slots.find((item) => item.name === 'string_3');
  if (stringConstraint?.target === handTarget && stringSlot?.bone === 'string_2') {
    warnings.push('c010 proof required: moving ik_arm_r also drives string_2/string_3 strap chain');
  }
  if (!handStrapEvidence) warnings.push('c010 hand-only-string-off evidence has not been generated');
  else if (handStrapEvidence.interpretation === 'shared-target-confirmed') warnings.push('c010 evidence confirms hand movement also moves the strap; independent strap target required');
  if (!handReachabilityEvidence) warnings.push('c010 hand reachability evidence has not been generated');
  else if (handReachabilityEvidence.interpretation === 'target-moves-but-visible-hand-does-not-follow') warnings.push('c010 hand target moves but the visible hand does not follow; current one-bone IK is not suitable for face contact');
  if (!sourceAvailability) warnings.push('c010 source availability evidence has not been generated');
  else if (sourceAvailability.status !== 'editable-source-available') warnings.push(`c010 editable source is unavailable: ${sourceAvailability.status}`);
  if (!editorAvailability) warnings.push('c010 Spine editor availability evidence has not been generated');
  else if (editorAvailability.status === 'editor-or-cli-unavailable' || editorAvailability.status === 'project-copy-missing') warnings.push('c010 editable project is ready, but the project-local Spine editor/CLI copy is not available; rig mutation is pending');
  else if (editorAvailability.status === 'editor-present-activation-pending') warnings.push(`c010 project-local editor ${migration?.targetEditor || editorAvailability.requiredEditorVersion} is present but activation/save/export is pending`);
  else if (editorAvailability.availableForRequiredVersion === false) warnings.push(`c010 project-local editor ${editorAvailability.preferredProjectToolVersion || '(unknown)'} cannot yet satisfy target baseline ${migration?.targetEditor || editorAvailability.requiredEditorVersion}; activation/save/export is pending`);
  if (!reviewManifest) warnings.push('c010 review manifest is missing');
  else if (!runAdjudication && reviewManifest.reviewStatus !== 'independent-review-passed') warnings.push(`c010 independent visual review is not proven: ${reviewManifest.reviewStatus || '(unset)'}`);
  if (!visualReview) warnings.push('c010 multimodal visual review evidence is missing');
  else if (visualReview.reviewer?.independent !== true || visualReview.decision !== 'pass') warnings.push('c010 visual evidence is provisional or rejected; independent review cannot be treated as pass');
  if (!traceAnalysis) warnings.push('c010 product-room trace analysis is missing');
  else if (traceAnalysis.status !== 'pass') warnings.push(`c010 product-room trace analysis is not clear: ${traceAnalysis.blockers?.map((item) => item.interpretation).join(', ') || traceAnalysis.status}`);
  if (runAdjudication?.data?.status === 'blocked_visual_uncertainty') warnings.push('c010 same-run visual adjudication is blocked_visual_uncertainty; unresolved UNKNOWN or low-confidence role findings remain');

  const report = {
    generatedAt: new Date().toISOString(),
    model: plan.model,
    status: issues.length ? 'fail' : warnings.length ? 'needs-review' : 'pass',
    counts: mainAudit.counts,
    handTarget,
    handVisual: resolved.handVisual?.resolved || null,
    derivedRigPlan: { status: derivedRigPlan.status, handIkType: derivedRigPlan.handIkPlan?.type, candidateChains: derivedRigPlan.handIkPlan?.candidateChains || [] },
    handIk: handIk ? { name: handIk.name, controls: handIk.bones, target: handIk.target, mix: handIk.mix } : null,
    sharedTransformConstraints: sharedTransform.map((item) => ({ name: item.name, target: item.target, mixRotate: item.mixRotate, mixX: item.mixX, mixY: item.mixY })),
    warnings,
    issues,
    nextProofPreset: plan.constraintRisks?.[0]?.proofPreset || 'hand-only',
    pipeline: {
      humanInTheLoop: pipeline.humanInTheLoop,
      stages: pipeline.stages?.map((stage) => stage.id) || [],
      maxRepairRoundsPerFailure: pipeline.maxRepairRoundsPerFailure,
      imageAdapter: provider.primary?.adapter,
      imageAdapterCapabilities: provider.primary?.requiredCapabilities || [],
      hardInvariantCount,
      spineCapabilityContract: {
        id: capabilityContract.contract_id,
        version: capabilityContract.version_boundary,
        capabilityCount: capabilityContract.capabilities?.length || 0,
        validationGateCount: capabilityContract.validation_gates?.length || 0,
        unknownPolicy: capabilityContract.unknown_policy,
      },
      calibrationStatus: calibration.status,
      manifestStatus: manifest.status,
      manifestFileCount: Object.keys(manifest.files || {}).length,
      handStrapProof: handStrapEvidence ? { interpretation: handStrapEvidence.interpretation, activeStrapDelta: handStrapEvidence.result?.activeDelta?.strap, isolatedStrapDelta: handStrapEvidence.result?.isolatedDelta?.strap } : null,
      handReachabilityProof: handReachabilityEvidence ? { interpretation: handReachabilityEvidence.interpretation, targetDelta: handReachabilityEvidence.result?.targetDelta, visualDelta: handReachabilityEvidence.result?.visualDelta, contactTargetToVisual: handReachabilityEvidence.result?.contactTargetToVisual } : null,
      sourceAvailability: sourceAvailability ? { status: sourceAvailability.status, editableProjectCount: sourceAvailability.editableProject?.length || 0, sourceLayerCount: sourceAvailability.sourceLayers?.length || 0, runtimeExportCount: sourceAvailability.runtimeExports?.length || 0 } : null,
      sourceProject: sourceProjectCheck,
      editorAvailability: editorAvailability ? { status: editorAvailability.status, requiredEditorVersion: editorAvailability.requiredEditorVersion } : null,
      visualReview: {
        manifestStatus: reviewManifest?.reviewStatus || null,
        independent: visualReview?.reviewer?.independent === true,
        decision: visualReview?.decision || null,
        confidence: visualReview?.reviewer?.confidence ?? null,
        sameRunAdjudication: runAdjudication?.data?.status || null,
        sameRunAdjudicationFile: runAdjudication ? path.relative(managerRoot, runAdjudication.file).replaceAll('\\', '/') : null,
      },
      traceAnalysis: traceAnalysis ? { status: traceAnalysis.status, actions: traceAnalysis.actions?.map((item) => ({ type: item.type, interpretation: item.interpretation, targetVisualGapPx: item.targetVisualGapPx, visualFollowRatio: item.visualFollowRatio, strapDeltaPx: item.strapDeltaPx })) || [] } : null,
      runtimePatch: { mode: runtimePatch.mode, releaseStatus: runtimePatch.releaseStatus, sourceUnmodified: runtimePatch.sourceUnmodified }
    },
    visualReview: {
      enabled: Boolean(pipeline.stages?.find((stage) => stage.id === 'review')),
      requiresDisagreementGate: true
    }
  };

  const outPath = path.join(managerRoot, 'configs', 'c010-validation-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (strict && (issues.length || warnings.length)) process.exitCode = 1;
}

main();


