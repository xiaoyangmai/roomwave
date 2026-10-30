import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readdir, stat, mkdir, writeFile, readFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultInput = path.join(
  repoRoot,
  'source',
  'nikke_4.3.26',
  'derived',
  'c010_roomwave_4.3.26',
);
const runRoot = path.join(repoRoot, 'runs');

function usage() {
  console.log(`Usage:
  node tools/run-spine-studio.mjs intake [--input <directory>] [--run-id <id>]
  node tools/run-spine-studio.mjs forensics --run-id <id>
  node tools/run-spine-studio.mjs semantic-contract --run-id <id>
  node tools/run-spine-studio.mjs rig-plan --run-id <id>
  node tools/run-spine-studio.mjs derived-mutation --run-id <id>
  node tools/run-spine-studio.mjs mutation-execution --run-id <id>
  node tools/run-spine-studio.mjs structural-gate --run-id <id>
  node tools/run-spine-studio.mjs motion-build --run-id <id>
  node tools/run-spine-studio.mjs visual-gate --run-id <id>
  node tools/run-spine-studio.mjs adversarial-gate --run-id <id>
  node tools/run-spine-studio.mjs promote --run-id <id>
  node tools/run-spine-studio.mjs status`);
}

function parseArgs(argv) {
  const args = { stage: argv[0] ?? 'help' };
  for (let index = 1; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--input') args.input = argv[++index];
    else if (value === '--run-id') args.runId = argv[++index];
    else if (value === '--help' || value === '-h') args.stage = 'help';
    else throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function isoStamp(date = new Date()) {
  return date.toISOString().replace(/[-:.]/g, '').replace('T', '-').replace('Z', '');
}

function relativePosix(filePath, rootPath) {
  return path.relative(rootPath, filePath).split(path.sep).join('/');
}

async function collectFiles(rootPath) {
  const result = [];
  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) result.push(absolute);
    }
  }
  await visit(rootPath);
  return result;
}

async function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(await readFile(filePath));
  return hash.digest('hex');
}

function classify(extension) {
  const ext = extension.toLowerCase();
  if (ext === '.spine') return 'spine-source';
  if (ext === '.json') return 'json';
  if (ext === '.skel') return 'binary-skeleton';
  if (ext === '.atlas') return 'atlas';
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return 'image';
  if (['.psd', '.psb', '.kra', '.clip'].includes(ext)) return 'raw-art-source';
  return 'other';
}

function parseStageArgs(argv) {
  const args = { stage: argv[0] ?? 'help' };
  for (let index = 1; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--run-id') args.runId = argv[++index];
    else if (value === '--export') args.exportPath = argv[++index];
    else if (value === '--help' || value === '-h') args.stage = 'help';
    else throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function asConstraintList(constraints) {
  if (!constraints || typeof constraints !== 'object') return [];
  return Object.values(constraints).filter((value) => value && typeof value === 'object');
}

function countSkeletonData(skeleton) {
  const constraints = asConstraintList(skeleton.constraints);
  const attachments = collectAttachmentFacts(skeleton.skins);
  return {
    bones: Array.isArray(skeleton.bones) ? skeleton.bones.length : 0,
    slots: Array.isArray(skeleton.slots) ? skeleton.slots.length : 0,
    skins: Array.isArray(skeleton.skins) ? skeleton.skins.length : 0,
    events: skeleton.events ? Object.keys(skeleton.events).length : 0,
    animations: skeleton.animations ? Object.keys(skeleton.animations).length : 0,
    attachments: attachments.length,
    mesh_attachments: attachments.filter((attachment) => attachment.type === 'mesh' || attachment.type === 'linkedmesh').length,
    constraints: constraints.length,
    ik: constraints.filter((constraint) => constraint.type === 'ik').length,
    transform: constraints.filter((constraint) => constraint.type === 'transform').length,
  };
}

function getConstraintReferences(skeleton) {
  const users = new Map();
  for (const constraint of asConstraintList(skeleton.constraints)) {
    const reference = constraint.type === 'transform'
      ? (constraint.source ?? constraint.target)
      : constraint.target;
    if (!reference) continue;
    const list = users.get(reference) ?? [];
    list.push({ name: constraint.name, type: constraint.type });
    users.set(reference, list);
  }
  return [...users.entries()].map(([target, constraints]) => ({ target, constraints }));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mutateIndependentTargets(input) {
  const skeleton = deepClone(input);
  const bones = Array.isArray(skeleton.bones) ? skeleton.bones : [];
  const oldTarget = bones.find((bone) => bone.name === 'ik_arm_r');
  if (!oldTarget) throw new Error('Cannot mutate: ik_arm_r target bone is missing.');
  if (bones.some((bone) => bone.name === 'hand_target_r' || bone.name === 'strap_target_r')) {
    throw new Error('Cannot mutate: semantic target names already exist in the input skeleton.');
  }

  const handTarget = { ...oldTarget, name: 'hand_target_r' };
  const strapTarget = { ...oldTarget, name: 'strap_target_r', color: '00b8d4ff' };
  const oldIndex = bones.indexOf(oldTarget);
  bones.splice(oldIndex, 1, handTarget, strapTarget);

  const constraints = asConstraintList(skeleton.constraints);
  const constraintChanges = [];
  for (const constraint of constraints) {
    if (constraint.type === 'ik' && constraint.name === 'ik_arm_r') {
      const before = { target: constraint.target, bones: [...(constraint.bones ?? [])] };
      constraint.target = 'hand_target_r';
      constraint.bones = ['r_arm_3', 'l_arm_2'];
      constraintChanges.push({ name: constraint.name, before, after: { target: constraint.target, bones: constraint.bones } });
    }
    if (constraint.type === 'transform' && constraint.name === 'string_2') {
      const before = { source: constraint.source };
      constraint.source = 'strap_target_r';
      constraintChanges.push({ name: constraint.name, before, after: { source: constraint.source } });
    }
  }

  const animationChanges = [];
  for (const [animationName, animation] of Object.entries(skeleton.animations ?? {})) {
    const animationBones = animation?.bones;
    if (!animationBones || !animationBones.ik_arm_r) continue;
    const original = animationBones.ik_arm_r;
    animationBones.hand_target_r = original;
    animationBones.strap_target_r = deepClone(original);
    delete animationBones.ik_arm_r;
    animationChanges.push({
      animation: animationName,
      moved_to: 'hand_target_r',
      duplicated_to: 'strap_target_r',
      timeline_types: Object.keys(original),
    });
  }

  const remainingReferences = [];
  if (bones.some((bone) => bone.name === 'ik_arm_r')) remainingReferences.push('bones[].name');
  for (const constraint of constraints) {
    if (constraint.target === 'ik_arm_r') remainingReferences.push(`constraints.${constraint.name}.target`);
    if (constraint.source === 'ik_arm_r') remainingReferences.push(`constraints.${constraint.name}.source`);
  }
  for (const [animationName, animation] of Object.entries(skeleton.animations ?? {})) {
    if (animation?.bones && Object.prototype.hasOwnProperty.call(animation.bones, 'ik_arm_r')) {
      remainingReferences.push(`animations.${animationName}.bones.ik_arm_r`);
    }
  }

  return {
    skeleton,
    diff: {
      renamed_bone: { from: 'ik_arm_r', to: 'hand_target_r' },
      added_bone: 'strap_target_r',
      constraint_changes: constraintChanges,
      animation_changes: animationChanges,
      remaining_literal_references_to_old_target: remainingReferences,
    },
  };
}

function runPortableCli(bridge, args, cwd) {
  const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
  const result = spawnSync(powershell, [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    bridge,
    ...args,
  ], {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    status: result.status,
    error: result.error ? String(result.error.stack ?? result.error) : null,
    stdout: String(result.stdout ?? '').slice(-8000),
    stderr: String(result.stderr ?? '').slice(-8000),
  };
}

function collectAttachmentFacts(skins) {
  const attachments = [];
  for (const skin of Array.isArray(skins) ? skins : []) {
    const byName = new Map();
    for (const slotAttachments of Object.values(skin.attachments ?? {})) {
      for (const [name, attachment] of Object.entries(slotAttachments ?? {})) byName.set(name, attachment);
    }
    for (const [slot, slotAttachments] of Object.entries(skin.attachments ?? {})) {
      for (const [name, attachment] of Object.entries(slotAttachments ?? {})) {
        const type = attachment?.type ?? (attachment?.uvs ? 'mesh' : 'region');
        const linkedParent = type === 'linkedmesh' ? byName.get(attachment?.source) : null;
        const weighted = type === 'mesh'
          ? Array.isArray(attachment?.vertices) && attachment.vertices.length !== (attachment.uvs?.length ?? 0)
          : type === 'linkedmesh'
            ? Boolean(linkedParent?.vertices && linkedParent.vertices.length !== (linkedParent.uvs?.length ?? 0))
            : false;
        attachments.push({
          skin: skin.name ?? 'unknown',
          slot,
          name,
          type,
          weighted,
          vertex_count: Array.isArray(attachment?.vertices) ? attachment.vertices.length : 0,
        });
      }
    }
  }
  return attachments;
}

function findAncestor(parentByName, childName, possibleAncestor) {
  let current = parentByName[childName];
  while (current) {
    if (current === possibleAncestor) return true;
    current = parentByName[current];
  }
  return false;
}

async function findExportJson(manifestRoot, explicitPath) {
  if (explicitPath) return path.resolve(repoRoot, explicitPath);
  const projectManifestPath = path.join(manifestRoot, 'source', 'nikke_4.3.26', 'derived', 'c010_roomwave_4.3.26', 'derived-project-manifest.json');
  const projectManifest = await readFile(projectManifestPath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (projectManifest?.exportDirectory) {
    const exportDirectory = path.resolve(path.dirname(projectManifestPath), projectManifest.exportDirectory);
    const candidates = (await readdir(exportDirectory).catch(() => [])).filter((file) => file.toLowerCase().endsWith('.json'));
    if (candidates.length > 0) return path.join(exportDirectory, candidates.sort()[0]);
  }
  const fallback = path.resolve(repoRoot, '..', 'src', 'spine-audit', 'c010', 'model-4.3.26', 'c010_00.json');
  return fallback;
}

async function runForensics(args) {
  if (!args.runId) throw new Error('Forensics requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const manifestPath = path.join(runDir, 'source-manifest.json');
  const sourceManifest = await readFile(manifestPath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!sourceManifest) throw new Error(`Run intake manifest not found: ${manifestPath}`);

  const exportPath = await findExportJson(repoRoot, args.exportPath);
  const skeleton = await readFile(exportPath, 'utf8').then((value) => JSON.parse(value)).catch((error) => {
    throw new Error(`Could not read exported skeleton JSON ${exportPath}: ${error.message}`);
  });

  const bones = Array.isArray(skeleton.bones) ? skeleton.bones : [];
  const parentByName = Object.fromEntries(bones.filter((bone) => bone?.name).map((bone) => [bone.name, bone.parent ?? null]));
  const constraints = asConstraintList(skeleton.constraints);
  const constraintTypeCounts = constraints.reduce((accumulator, constraint) => {
    const type = constraint.type ?? 'unknown';
    accumulator[type] = (accumulator[type] ?? 0) + 1;
    return accumulator;
  }, {});
  const targetUsers = new Map();
  for (const constraint of constraints) {
    const reference = constraint.type === 'transform'
      ? (constraint.source ?? constraint.target)
      : constraint.target;
    if (!reference) continue;
    const users = targetUsers.get(reference) ?? [];
    users.push({ name: constraint.name, type: constraint.type, bones: constraint.bones ?? [], reference_kind: constraint.type === 'transform' ? 'source' : 'target' });
    targetUsers.set(reference, users);
  }
  const sharedTargets = [...targetUsers.entries()]
    .filter(([, users]) => users.length > 1)
    .map(([target, users]) => ({ target, users }));
  const constraintWarnings = [];
  for (const shared of sharedTargets) {
    const types = new Set(shared.users.map((user) => user.type));
    if (types.has('ik') && types.has('transform')) {
      constraintWarnings.push({
        issue: 'shared-ik-transform-control',
        reference: shared.target,
        users: shared.users,
      });
    }
  }
  const ikConstraints = constraints.filter((constraint) => constraint.type === 'ik');
  for (const constraint of ikConstraints) {
    const constrainedBones = constraint.bones ?? [];
    if (constrainedBones.length > 2) constraintWarnings.push({ name: constraint.name, issue: 'ik-more-than-two-bones', bones: constrainedBones });
    if (constraint.target && constrainedBones.includes(constraint.target)) constraintWarnings.push({ name: constraint.name, issue: 'target-is-constrained-bone', target: constraint.target });
    if (constraint.target && constrainedBones.some((bone) => findAncestor(parentByName, constraint.target, bone))) {
      constraintWarnings.push({ name: constraint.name, issue: 'target-is-descendant-of-constrained-bone', target: constraint.target, bones: constrainedBones });
    }
  }

  const attachments = collectAttachmentFacts(skeleton.skins);
  const facts = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'forensics',
    created_at: new Date().toISOString(),
    source_manifest: path.relative(repoRoot, manifestPath).split(path.sep).join('/'),
    export_json: exportPath,
    skeleton: skeleton.skeleton ?? {},
    counts: {
      bones: bones.length,
      slots: Array.isArray(skeleton.slots) ? skeleton.slots.length : 0,
      skins: Array.isArray(skeleton.skins) ? skeleton.skins.length : 0,
      events: skeleton.events ? Object.keys(skeleton.events).length : 0,
      animations: skeleton.animations ? Object.keys(skeleton.animations).length : 0,
      attachments: attachments.length,
      mesh_attachments: attachments.filter((attachment) => attachment.type === 'mesh' || attachment.type === 'linkedmesh').length,
      direct_weighted_mesh_attachments: attachments.filter((attachment) => attachment.type === 'mesh' && attachment.weighted).length,
      linkedmesh_attachments: attachments.filter((attachment) => attachment.type === 'linkedmesh').length,
      constraints: constraints.length,
    },
    constraint_type_counts: constraintTypeCounts,
    attachments,
    facts: [
      { id: 'source-spine-present', value: sourceManifest.facts?.find((fact) => fact.id === 'spine-source-present')?.value ?? false, evidence: 'source-manifest.json' },
      { id: 'export-json-readable', value: true, evidence: exportPath },
      { id: 'shared-targets-present', value: sharedTargets.length > 0, evidence: 'constraint-graph.json' },
    ],
    unknowns: [
      'Constraint order semantics require editor/runtime version confirmation.',
      'Visual intent requires golden poses or original art references.',
    ],
  };

  const graph = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'forensics',
    created_at: facts.created_at,
    nodes: bones.map((bone) => ({ name: bone.name, parent: bone.parent ?? null })),
    constraints: constraints.map((constraint, index) => ({
      order: index,
      name: constraint.name,
      type: constraint.type,
      target: constraint.target ?? null,
      reference: constraint.type === 'transform' ? (constraint.source ?? constraint.target ?? null) : (constraint.target ?? null),
      bones: constraint.bones ?? [],
      source: constraint.source ?? null,
    })),
    shared_targets: sharedTargets,
    warnings: constraintWarnings,
  };

  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value));
  state.current_stage = 'forensics';
  state.next_stage = 'semantic-contract';
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'skeleton-facts.json', 'constraint-graph.json'])];

  await writeFile(path.join(runDir, 'skeleton-facts.json'), `${JSON.stringify(facts, null, 2)}\n`, 'utf8');
  await writeFile(path.join(runDir, 'constraint-graph.json'), `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    status: 'passed',
    run_id: args.runId,
    export_json: exportPath,
    counts: facts.counts,
    constraint_type_counts: constraintTypeCounts,
    shared_targets: sharedTargets.map((item) => ({
      target: item.target,
      user_count: item.users.length,
      users: item.users.map((user) => user.name),
    })),
    warnings: constraintWarnings.map((warning) => ({
      issue: warning.issue,
      reference: warning.reference,
      name: warning.name,
      target: warning.target,
    })),
    next_stage: 'semantic-contract',
  }, null, 2));
}

async function runSemanticContract(args) {
  if (!args.runId) throw new Error('Semantic contract requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const factsPath = path.join(runDir, 'skeleton-facts.json');
  const graphPath = path.join(runDir, 'constraint-graph.json');
  const facts = await readFile(factsPath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const graph = await readFile(graphPath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!facts || !graph) throw new Error(`Forensics artifacts are required before semantic contract: ${runDir}`);

  const targets = [
    {
      id: 'hand_target_r',
      intent: 'primary hand contact and reach target',
      min: null,
      default: null,
      max: null,
      range_status: 'needs-calibration-from-golden-poses',
      must_not_control: ['strap_target_r', 'face_target'],
    },
    {
      id: 'strap_target_r',
      intent: 'independent right strap control and secondary follow target',
      min: null,
      default: null,
      max: null,
      range_status: 'needs-calibration-from-golden-poses',
      must_not_control: ['hand_target_r', 'gun_target'],
    },
    {
      id: 'gun_target',
      intent: 'prop grip and gun interaction target',
      min: null,
      default: null,
      max: null,
      range_status: 'needs-prop-contact-reference',
      must_not_control: ['strap_target_r'],
    },
    {
      id: 'face_target',
      intent: 'face and expression semantic target',
      min: null,
      default: null,
      max: null,
      range_status: 'needs-face-reference',
      must_not_control: ['hand_target_r', 'gun_target'],
    },
    {
      id: 'effect_anchor',
      intent: 'semantic anchor for Roomwave effects',
      min: null,
      default: null,
      max: null,
      range_status: 'needs-runtime-anchor-calibration',
      must_not_control: ['hand_target_r', 'strap_target_r'],
    },
  ];

  const contract = {
    schema_version: 1,
    run_id: args.runId,
    model: 'c010_00',
    source_facts: {
      skeleton_facts: 'skeleton-facts.json',
      constraint_graph: 'constraint-graph.json',
    },
    targets,
    isolation_cases: [
      'hand-only',
      'strap-only',
      'gun-only',
      'hand-to-face',
      'maximum-reach',
      'interrupt-and-recover',
    ],
    invariants: [
      'hand-only must not materially move strap attachments',
      'strap-only must not materially move the visible hand',
      'gun-only must preserve the hand-grip relationship',
      'face-only must not alter body or prop control',
      'all targets must be independently addressable in the derived Spine project',
    ],
    current_blockers: graph.warnings ?? [],
    unknowns: [
      'Target min/default/max values require golden-pose calibration.',
      'The source project still uses ik_arm_r as both an IK target and a transform source for string_2.',
    ],
    status: 'ready-for-rig-plan',
  };

  const isolationMatrix = {
    schema_version: 1,
    run_id: args.runId,
    model: 'c010_00',
    cases: contract.isolation_cases.map((id) => ({
      id,
      status: 'not-run',
      expected: contract.invariants.filter((invariant) => invariant.toLowerCase().includes(id.split('-')[0])),
    })),
  };

  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value));
  state.current_stage = 'semantic-contract';
  state.next_stage = 'rig-plan';
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'rig-contract.json', 'isolation-matrix.json'])];

  await writeFile(path.join(runDir, 'rig-contract.json'), `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
  await writeFile(path.join(runDir, 'isolation-matrix.json'), `${JSON.stringify(isolationMatrix, null, 2)}\n`, 'utf8');
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    status: 'passed',
    run_id: args.runId,
    model: contract.model,
    targets: targets.map((target) => target.id),
    isolation_cases: contract.isolation_cases,
    current_blockers: contract.current_blockers.map((item) => item.issue ?? 'unknown'),
    next_stage: 'rig-plan',
  }, null, 2));
}

async function runRigPlan(args) {
  if (!args.runId) throw new Error('Rig plan requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const sourceManifest = await readFile(path.join(runDir, 'source-manifest.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const contract = await readFile(path.join(runDir, 'rig-contract.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const graph = await readFile(path.join(runDir, 'constraint-graph.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!sourceManifest || !contract || !graph) throw new Error(`Intake, forensics, and semantic contract artifacts are required before rig planning: ${runDir}`);

  const sourceFile = sourceManifest.files.find((file) => file.kind === 'spine-source');
  const plan = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'rig-plan',
    status: 'draft',
    source: {
      path: sourceFile?.absolute_path ?? null,
      sha256: sourceFile?.sha256 ?? null,
      mutate_policy: 'derived-copy-only',
    },
    objective: 'Permanently separate hand and strap control while preserving the existing c010 animation and attachment inventory.',
    preconditions: [
      'source hash matches source-manifest.json',
      'a derived project copy is created before any editor or JSON mutation',
      'Spine editor/runtime version matrix is recorded',
      'current runtime isolation fallback remains marked provisional',
    ],
    operations: [
      {
        id: 'snapshot-derived-project',
        type: 'snapshot',
        action: 'copy-source-to-derived-run-directory',
        reversible: true,
      },
      {
        id: 'create-hand-target',
        type: 'control-bone',
        action: 'create',
        name: 'hand_target_r',
        parent_strategy: 'select-existing-arm-control-root-from-editor-structure',
        reversible: true,
      },
      {
        id: 'create-strap-target',
        type: 'control-bone',
        action: 'create',
        name: 'strap_target_r',
        parent_strategy: 'select-existing-body-control-root-from-editor-structure',
        reversible: true,
      },
      {
        id: 'replace-hand-ik',
        type: 'ik-constraint',
        action: 'replace-or-reconfigure',
        current_constraint: 'ik_arm_r',
        candidate_chains: [
          ['r_arm_3', 'l_arm_2'],
        ],
        rejected_candidates: [
          {
            chain: ['r_arm_1', 'l_arm_2'],
            reason: 'l_arm_2 is an immediate child of r_arm_3, not r_arm_1; selecting this chain would skip the actual elbow parent.',
          },
        ],
        target: 'hand_target_r',
        selection_rule: 'choose-chain-that-preserves-setup-pose-and-minimizes-hand-landmark-error',
        reversible: true,
      },
      {
        id: 'rebind-strap-transform',
        type: 'transform-constraint',
        action: 'rebind-source',
        constraint: 'string_2',
        from: 'ik_arm_r',
        to: 'strap_target_r',
        reversible: true,
      },
    ],
    expected_invariants: [
      'ik_arm_r is no longer a shared hand-and-strap control reference',
      'hand_target_r and strap_target_r are independent',
      'existing animation names remain present',
      'existing skin and attachment counts remain unchanged except for explicit control additions',
      'export and runtime readback succeed',
    ],
    required_follow_up: contract.isolation_cases,
    blockers: graph.warnings ?? [],
    rollback: 'restore-derived-snapshot-and-keep-current-production-baseline',
  };

  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value));
  state.current_stage = 'rig-plan';
  state.next_stage = 'derived-mutation';
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'plan.json'])];
  await writeFile(path.join(runDir, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    status: plan.status,
    run_id: args.runId,
    objective: plan.objective,
    operation_count: plan.operations.length,
    candidate_hand_chains: plan.operations.find((operation) => operation.id === 'replace-hand-ik').candidate_chains,
    blocker_count: plan.blockers.length,
    next_stage: 'derived-mutation',
    note: 'No Spine source was modified; this is a reversible plan artifact.',
  }, null, 2));
}

async function prepareDerivedCopy(args) {
  if (!args.runId) throw new Error('Derived preparation requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const sourceManifest = await readFile(path.join(runDir, 'source-manifest.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const plan = await readFile(path.join(runDir, 'plan.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!sourceManifest || !plan) throw new Error(`Source manifest and plan are required before derived preparation: ${runDir}`);
  const sourceRoot = sourceManifest.input_root;
  const derivedRoot = path.join(runDir, 'derived-source');
  await cp(sourceRoot, derivedRoot, { recursive: true, errorOnExist: true });
  const planHash = createHash('sha256').update(JSON.stringify(plan)).digest('hex');
  const derivedManifest = {
    schema_version: 1,
    run_id: args.runId,
    source_root: sourceRoot,
    derived_root: derivedRoot,
    source_manifest: 'source-manifest.json',
    plan: 'plan.json',
    plan_sha256: planHash,
    mutation_status: 'prepared-no-source-modification',
    next_executor: 'spine-editor-or-validated-json-roundtrip',
    rollback: 'delete-derived-source-and-keep-production-baseline',
    created_at: new Date().toISOString(),
  };
  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value));
  state.current_stage = 'derived-mutation';
  state.next_stage = 'mutation-execution';
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'derived-manifest.json'])];
  await writeFile(path.join(runDir, 'derived-manifest.json'), `${JSON.stringify(derivedManifest, null, 2)}\n`, 'utf8');
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    status: 'prepared',
    run_id: args.runId,
    derived_root: derivedRoot,
    mutation_status: derivedManifest.mutation_status,
    next_executor: derivedManifest.next_executor,
    next_stage: 'mutation-execution',
  }, null, 2));
}

async function runMutationExecution(args) {
  if (!args.runId) throw new Error('Mutation execution requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const facts = await readFile(path.join(runDir, 'skeleton-facts.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const derivedManifest = await readFile(path.join(runDir, 'derived-manifest.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const plan = await readFile(path.join(runDir, 'plan.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!facts || !derivedManifest || !plan) {
    throw new Error(`Forensics, plan, and derived copy are required before mutation execution: ${runDir}`);
  }
  const derivedRoot = derivedManifest.derived_root;
  const derivedStats = await stat(derivedRoot).catch(() => null);
  if (!derivedStats?.isDirectory()) throw new Error(`Derived source directory is missing: ${derivedRoot}`);

  const sourceSkeleton = await readFile(facts.export_json, 'utf8').then((value) => JSON.parse(value));
  const { skeleton: mutatedSkeleton, diff } = mutateIndependentTargets(sourceSkeleton);
  if (diff.remaining_literal_references_to_old_target.length > 0) {
    throw new Error(`Mutation left references to the old target bone: ${diff.remaining_literal_references_to_old_target.join(', ')}`);
  }

  const candidateBase = path.join(runDir, 'mutation-candidate');
  let candidateRoot = candidateBase;
  if (await stat(candidateRoot).catch(() => null)) {
    let attempt = 2;
    while (await stat(path.join(runDir, `mutation-candidate-attempt-${attempt}`)).catch(() => null)) attempt += 1;
    candidateRoot = path.join(runDir, `mutation-candidate-attempt-${attempt}`);
  }
  await mkdir(candidateRoot, { recursive: false });
  const candidateImages = path.join(candidateRoot, 'images');
  await mkdir(candidateImages, { recursive: true });
  const exportDir = path.dirname(facts.export_json);
  for (const file of await readdir(exportDir)) {
    if (file.toLowerCase().endsWith('.png')) await cp(path.join(exportDir, file), path.join(candidateImages, file));
  }

  const mutationSourcePath = path.join(candidateRoot, 'c010_00.mutation.json');
  const importedProjectPath = path.join(candidateRoot, 'c010_00.mutation.spine');
  const roundtripDir = path.join(candidateRoot, 'roundtrip-export');
  await writeFile(mutationSourcePath, `${JSON.stringify(mutatedSkeleton, null, 2)}\n`, 'utf8');
  await writeFile(path.join(runDir, 'mutation-diff.json'), `${JSON.stringify({
    schema_version: 1,
    run_id: args.runId,
    stage: 'mutation-execution',
    input_json: facts.export_json,
    mutation_source: path.relative(repoRoot, mutationSourcePath).split(path.sep).join('/'),
    diff,
    created_at: new Date().toISOString(),
  }, null, 2)}\n`, 'utf8');

  const bridge = path.resolve(repoRoot, 'tools', 'run-spine-portable-cli.ps1');
  const importRun = runPortableCli(bridge, ['-i', mutationSourcePath, '-o', importedProjectPath, '-r', 'c010_00'], repoRoot);
  const importPassed = importRun.status === 0;
  let exportRun = null;
  let roundtripJsonPath = null;
  let roundtripSkeleton = null;
  if (importPassed) {
    await mkdir(roundtripDir, { recursive: true });
    exportRun = runPortableCli(bridge, ['-i', importedProjectPath, '-o', roundtripDir, '-e', 'json+pack'], repoRoot);
    const jsonFiles = (await readdir(roundtripDir)).filter((file) => file.toLowerCase().endsWith('.json'));
    if (exportRun.status === 0 && jsonFiles.length === 1) {
      roundtripJsonPath = path.join(roundtripDir, jsonFiles[0]);
      roundtripSkeleton = await readFile(roundtripJsonPath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
    }
  }

  const checks = {
    source_unchanged: true,
    portable_import_exit_zero: importPassed,
    portable_export_exit_zero: Boolean(exportRun && exportRun.status === 0),
    roundtrip_json_readable: Boolean(roundtripSkeleton),
  };
  const roundtripCounts = roundtripSkeleton ? countSkeletonData(roundtripSkeleton) : null;
  if (roundtripSkeleton) {
    const expectedCounts = {
      ...facts.counts,
      bones: facts.counts.bones + 1,
      constraints: facts.counts.constraints,
      ik: facts.constraint_type_counts.ik ?? 0,
      transform: facts.constraint_type_counts.transform ?? 0,
    };
    checks.counts_preserved_with_one_control = [
      'bones', 'slots', 'skins', 'events', 'animations', 'attachments', 'mesh_attachments', 'constraints', 'ik', 'transform',
    ].every((key) => roundtripCounts[key] === expectedCounts[key]);

    const bones = Array.isArray(roundtripSkeleton.bones) ? roundtripSkeleton.bones : [];
    const constraints = asConstraintList(roundtripSkeleton.constraints);
    const ik = constraints.find((constraint) => constraint.type === 'ik' && constraint.name === 'ik_arm_r');
    const strap = constraints.find((constraint) => constraint.type === 'transform' && constraint.name === 'string_2');
    const names = new Set(bones.map((bone) => bone.name));
    const references = getConstraintReferences(roundtripSkeleton);
    checks.semantic_targets_present = names.has('hand_target_r') && names.has('strap_target_r') && !names.has('ik_arm_r');
    checks.hand_ik_rebound = Boolean(ik && ik.target === 'hand_target_r' && JSON.stringify(ik.bones) === JSON.stringify(['r_arm_3', 'l_arm_2']));
    checks.strap_transform_rebound = Boolean(strap && strap.source === 'strap_target_r');
    checks.no_shared_ik_transform_target = !references.some((item) => {
      const types = new Set(item.constraints.map((constraint) => constraint.type));
      return types.has('ik') && types.has('transform');
    });
    checks.animation_timelines_migrated = diff.animation_changes.length > 0
      && diff.animation_changes.every((change) => {
        const animation = roundtripSkeleton.animations?.[change.animation];
        return Boolean(animation?.bones?.hand_target_r && animation?.bones?.strap_target_r);
      });
  }

  let runtimeReadback = { status: 'not-run', reason: 'roundtrip JSON was unavailable.' };
  const baselineAtlas = path.join(path.dirname(facts.export_json), `${path.basename(facts.export_json, path.extname(facts.export_json))}.atlas`);
  if (roundtripSkeleton && await stat(baselineAtlas).catch(() => null)) {
    try {
      const { AtlasAttachmentLoader, SkeletonJson, TextureAtlas } = await import('@esotericsoftware/spine-core');
      const atlas = new TextureAtlas(await readFile(baselineAtlas, 'utf8'));
      const skeletonData = new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(roundtripSkeleton);
      runtimeReadback = {
        status: 'passed',
        skeleton_spine: skeletonData.version,
        bones: skeletonData.bones.length,
        slots: skeletonData.slots.length,
        skins: skeletonData.skins.length,
        animations: skeletonData.animations.length,
        events: skeletonData.events.length,
        constraints: skeletonData.constraints.length,
        atlas_pages: atlas.pages.length,
        atlas_regions: atlas.regions.length,
      };
      checks.runtime_readback_passed = true;
    } catch (error) {
      runtimeReadback = { status: 'failed', error: String(error.stack ?? error) };
      checks.runtime_readback_passed = false;
    }
  } else {
    checks.runtime_readback_passed = false;
  }

  const passed = Object.values(checks).every((value) => value === true);
  const report = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'mutation-execution',
    status: passed ? 'passed' : 'blocked',
    policy: 'derived-copy-only; production source untouched',
    bridge,
    derived_root: derivedRoot,
    mutation_source: mutationSourcePath,
    imported_project: importedProjectPath,
    roundtrip_export: roundtripDir,
    roundtrip_json: roundtripJsonPath,
    checks,
    roundtrip_counts: roundtripCounts,
    runtime_readback: runtimeReadback,
    import_process: importRun,
    export_process: exportRun,
    diff,
    created_at: new Date().toISOString(),
  };
  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value));
  state.status = passed ? 'passed' : 'blocked';
  state.current_stage = 'mutation-execution';
  state.next_stage = passed ? 'structural-gate' : null;
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'mutation-diff.json', 'execution-report.json'])];
  await writeFile(path.join(runDir, 'execution-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    status: report.status,
    run_id: args.runId,
    checks,
    roundtrip_counts: roundtripCounts,
    runtime_readback: runtimeReadback,
    next_stage: state.next_stage,
    mutation_source: mutationSourcePath,
    imported_project: importedProjectPath,
    note: passed ? 'Candidate was imported and round-tripped in a derived run directory; no production source was modified.' : 'Candidate was kept as a blocked derived artifact; production source was not modified.',
  }, null, 2));
}

async function runStructuralGate(args) {
  if (!args.runId) throw new Error('Structural gate requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const execution = await readFile(path.join(runDir, 'execution-report.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const contract = await readFile(path.join(runDir, 'rig-contract.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!execution || !contract) throw new Error(`Execution report and semantic contract are required before structural gate: ${runDir}`);
  const checks = {
    mutation_execution_passed: execution.status === 'passed',
    all_execution_checks_passed: Object.values(execution.checks ?? {}).every((value) => value === true),
    isolation_cases_declared: Array.isArray(contract.isolation_cases) && contract.isolation_cases.length >= 5,
    no_production_mutation_policy: execution.policy === 'derived-copy-only; production source untouched',
  };
  const passed = Object.values(checks).every((value) => value === true);
  const report = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'structural-gate',
    status: passed ? 'passed' : 'blocked',
    checks,
    evidence: ['execution-report.json', 'mutation-diff.json', 'rig-contract.json'],
    next_required: passed ? ['motion-build', 'visual-gate', 'adversarial-gate'] : ['repair-mutation-or-replan'],
    created_at: new Date().toISOString(),
  };
  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value));
  state.status = passed ? 'passed' : 'blocked';
  state.current_stage = 'structural-gate';
  state.next_stage = passed ? 'motion-build' : null;
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'structural-report.json'])];
  await writeFile(path.join(runDir, 'structural-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: report.status, run_id: args.runId, checks, next_stage: state.next_stage }, null, 2));
}

function maxTimelineTime(value, key = null) {
  if (Array.isArray(value)) return value.reduce((max, item) => Math.max(max, maxTimelineTime(item)), 0);
  if (!value || typeof value !== 'object') return 0;
  let max = 0;
  for (const [childKey, childValue] of Object.entries(value)) {
    if (childKey === 'time' && typeof childValue === 'number' && Number.isFinite(childValue)) max = Math.max(max, childValue);
    max = Math.max(max, maxTimelineTime(childValue, childKey));
  }
  return max;
}

function summarizeAnimations(skeleton) {
  return Object.entries(skeleton.animations ?? {}).map(([name, animation]) => ({
    name,
    duration: Number(maxTimelineTime(animation).toFixed(4)),
    bone_targets: Object.keys(animation?.bones ?? {}),
    slot_targets: Object.keys(animation?.slots ?? {}),
    constraint_targets: Object.keys(animation?.ik ?? {}).concat(Object.keys(animation?.transform ?? {})),
    timeline_types: [...new Set([
      ...Object.values(animation?.bones ?? {}).flatMap((timelines) => Object.keys(timelines ?? {})),
      ...Object.values(animation?.slots ?? {}).flatMap((timelines) => Object.keys(timelines ?? {})),
    ])].sort(),
  }));
}

function motionCaseSpec(id, sourceJson, targets, animations) {
  const action = id === 'hand-only' ? 'hand_target_r' : id === 'strap-only' ? 'strap_target_r' : id === 'gun-only' ? 'gun_target' : id === 'hand-to-face' ? 'hand_target_r + face_target' : id;
  const expectedStill = id === 'hand-only'
    ? ['strap_target_r', 'gun_target']
    : id === 'strap-only'
      ? ['hand_target_r', 'gun_target']
      : id === 'gun-only'
        ? ['strap_target_r']
        : id === 'hand-to-face'
          ? ['strap_target_r', 'gun_target']
          : [];
  return {
    schema_version: 1,
    case_id: id,
    status: 'not-run',
    source_json: sourceJson,
    source_animations: animations.map((item) => item.name),
    control_input: action,
    semantic_targets: targets,
    phases: ['prepare', 'contact', 'hold', 'release', 'recover'],
    expected_moving_targets: id === 'interrupt-and-recover' ? ['active_target', 'idle_pose'] : [action],
    expected_still_targets: expectedStill,
    required_evidence: ['fixed-input replay', 'frame trace', 'contact metric', 'return-to-idle sample'],
    failure_labels: ['wrong_hand_side', 'shared_target', 'unreachable_contact', 'temporal_jump', 'runtime_regression'],
    note: 'Specification only. No candidate mutation or visual pass is claimed at motion-build.',
  };
}

async function runMotionBuild(args) {
  if (!args.runId) throw new Error('Motion build requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const structural = await readFile(path.join(runDir, 'structural-report.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const contract = await readFile(path.join(runDir, 'rig-contract.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const execution = await readFile(path.join(runDir, 'execution-report.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!state || !structural || !contract || !execution) throw new Error(`Structural gate artifacts are required before motion-build: ${runDir}`);
  if (structural.status !== 'passed' || execution.status !== 'passed') throw new Error(`Motion-build is blocked by structural evidence: ${runDir}`);

  const sourceJson = execution.roundtrip_json;
  const skeleton = await readFile(sourceJson, 'utf8').then((value) => JSON.parse(value)).catch((error) => {
    throw new Error(`Could not read mutation roundtrip JSON ${sourceJson}: ${error.message}`);
  });
  const animations = summarizeAnimations(skeleton);
  const targets = contract.targets.map((target) => target.id);
  const cases = contract.isolation_cases;
  const motionSpec = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'motion-build',
    status: 'ready-for-replay',
    source_json: sourceJson,
    source_spine: skeleton.skeleton?.spine ?? null,
    semantic_targets: targets,
    action_patterns: ['prepare', 'contact', 'hold', 'release', 'recover'],
    existing_animations: animations,
    isolation_cases: cases,
    expert_rules: {
      contact_must_be_readable: true,
      preserve_existing_animation_names: true,
      do_not_move_unrelated_targets: true,
      interrupt_must_return_to_idle: true,
      unknown_blocks_visual_gate: true,
    },
    unknowns: [
      'Contact coordinates and range limits require golden poses or fixed runtime anchors.',
      'No visual replay was run in this stage.',
      'The generated candidates are specifications, not promoted animation data.',
    ],
  };

  const candidateBase = path.join(runDir, 'motion-candidates');
  let candidateRoot = candidateBase;
  if (await stat(candidateRoot).catch(() => null)) {
    let attempt = 2;
    while (await stat(path.join(runDir, `motion-candidates-attempt-${attempt}`)).catch(() => null)) attempt += 1;
    candidateRoot = path.join(runDir, `motion-candidates-attempt-${attempt}`);
  }
  await mkdir(candidateRoot, { recursive: false });
  const relativeSource = path.relative(repoRoot, sourceJson).split(path.sep).join('/');
  for (const caseId of cases) {
    await writeFile(path.join(candidateRoot, `${caseId}.json`), `${JSON.stringify(motionCaseSpec(caseId, relativeSource, targets, animations), null, 2)}\n`, 'utf8');
  }

  const report = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'motion-build',
    status: 'passed',
    source_json: sourceJson,
    candidate_root: candidateRoot,
    checks: {
      structural_gate_passed: structural.status === 'passed',
      source_roundtrip_readable: true,
      semantic_targets_declared: targets.length >= 5,
      derived_control_targets_present: ['hand_target_r', 'strap_target_r'].every((target) => Array.isArray(skeleton.bones) && skeleton.bones.some((bone) => bone.name === target)),
      existing_animations_summarized: animations.length > 0,
      isolation_cases_defined: cases.length >= 5,
      contact_phases_defined: true,
      motion_candidates_written: true,
      candidate_does_not_mutate_source: true,
    },
    next_stage: 'visual-gate',
    unknowns: ['gun_target, face_target, and effect_anchor still require runtime or golden-pose binding evidence.'],
    created_at: new Date().toISOString(),
  };
  await writeFile(path.join(runDir, 'motion-spec.json'), `${JSON.stringify(motionSpec, null, 2)}\n`, 'utf8');
  await writeFile(path.join(runDir, 'motion-build.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  state.status = 'passed';
  state.current_stage = 'motion-build';
  state.next_stage = 'visual-gate';
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'motion-spec.json', 'motion-build.json', path.relative(runDir, candidateRoot).split(path.sep).join('/')])];
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: report.status, run_id: args.runId, checks: report.checks, animation_count: animations.length, candidate_root: candidateRoot, next_stage: report.next_stage }, null, 2));
}

async function runVisualGate(args) {
  if (!args.runId) throw new Error('Visual gate requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const motion = await readFile(path.join(runDir, 'motion-build.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const motionSpec = await readFile(path.join(runDir, 'motion-spec.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!state || !motion || !motionSpec) throw new Error(`Motion-build artifacts are required before visual-gate: ${runDir}`);
  const candidateRoot = path.resolve(runDir, motion.candidate_root);
  const expectedCases = motionSpec.isolation_cases ?? [];
  const candidateFiles = await readdir(candidateRoot).catch(() => []);
  const evidenceRoot = path.join(runDir, 'evidence');
  const requiredEvidence = ['run-manifest.json', 'action-spec.json', 'model-runtime.json', 'frame-trace.jsonl', 'metrics.json', 'trace-analysis.json', 'adjudication.json', 'regression.json'];
  const missingEvidence = [];
  for (const file of requiredEvidence) if (!(await stat(path.join(evidenceRoot, file)).catch(() => null))) missingEvidence.push(`evidence/${file}`);
  for (const role of ['motion-animator', 'technical-artist', 'art-director', 'product-reviewer', 'adversarial-reviewer']) {
    if (!(await stat(path.join(evidenceRoot, 'role-review', `${role}.json`)).catch(() => null))) missingEvidence.push(`evidence/role-review/${role}.json`);
  }
  const keyframeRoot = path.join(evidenceRoot, 'keyframes');
  if (!(await stat(keyframeRoot).catch(() => null))) missingEvidence.push('evidence/keyframes/');
  const checks = {
    motion_build_passed: motion.status === 'passed',
    candidate_specs_present: expectedCases.length > 0 && expectedCases.every((id) => candidateFiles.includes(`${id}.json`)),
    same_run_keyframes_present: await stat(keyframeRoot).then(() => true).catch(() => false),
    same_run_trace_and_metrics_present: ['frame-trace.jsonl', 'metrics.json', 'trace-analysis.json'].every((file) => !missingEvidence.includes(`evidence/${file}`)),
    independent_reviews_complete: ['motion-animator', 'technical-artist', 'art-director', 'product-reviewer', 'adversarial-reviewer'].every((role) => !missingEvidence.includes(`evidence/role-review/${role}.json`)),
    adjudication_present: !missingEvidence.includes('evidence/adjudication.json'),
    golden_pose_reference_present: false,
  };
  const passed = Object.values(checks).every(Boolean);
  const verdict = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'visual-gate',
    status: passed ? 'passed' : 'blocked_visual_uncertainty',
    checks,
    missing_evidence: missingEvidence,
    unknowns: passed ? [] : ['No same-run golden-pose or fixed-runtime visual evidence was supplied.', 'Motion candidates remain specifications and have not been replayed.', 'Independent visual reviewers and adjudication are not available for this run.'],
    next_required: passed ? ['adversarial-gate'] : ['capture-same-run-replay', 'freeze-independent-reviews'],
    created_at: new Date().toISOString(),
  };
  await writeFile(path.join(runDir, 'visual-verdict.json'), `${JSON.stringify(verdict, null, 2)}\n`, 'utf8');
  state.status = passed ? 'passed' : 'blocked';
  state.current_stage = 'visual-gate';
  state.next_stage = passed ? 'adversarial-gate' : null;
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'visual-verdict.json'])];
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: verdict.status, run_id: args.runId, checks, missing_evidence: missingEvidence, next_stage: state.next_stage }, null, 2));
}

async function runAdversarialGate(args) {
  if (!args.runId) throw new Error('Adversarial gate requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const structural = await readFile(path.join(runDir, 'structural-report.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const motion = await readFile(path.join(runDir, 'motion-build.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const visual = await readFile(path.join(runDir, 'visual-verdict.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!state || !structural || !motion || !visual) throw new Error(`Structural, motion and visual artifacts are required before adversarial-gate: ${runDir}`);
  const checks = {
    structural_gate_passed: structural.status === 'passed',
    motion_build_passed: motion.status === 'passed',
    visual_gate_passed: visual.status === 'passed',
    isolation_replay_present: false,
    failure_injection_present: false,
    interrupt_recovery_replayed: false,
    source_unchanged_policy: true,
  };
  const passed = Object.values(checks).every(Boolean);
  const verdict = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'adversarial-gate',
    status: passed ? 'passed' : 'blocked',
    checks,
    failure_labels: passed ? [] : ['missing_same_run_visual_evidence', 'isolation_replay_not_run', 'failure_injection_not_run'],
    unknowns: passed ? [] : ['Adversarial replay requires a passed visual gate and same-run traces before it can be meaningful.'],
    next_required: passed ? ['promote'] : ['complete-visual-gate', 'replay-isolation', 'inject-interrupt-and-recovery-failures'],
    created_at: new Date().toISOString(),
  };
  await writeFile(path.join(runDir, 'adversarial-verdict.json'), `${JSON.stringify(verdict, null, 2)}\n`, 'utf8');
  state.status = passed ? 'passed' : 'blocked';
  state.current_stage = 'adversarial-gate';
  state.next_stage = passed ? 'promote' : null;
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'adversarial-verdict.json'])];
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: verdict.status, run_id: args.runId, checks, next_stage: state.next_stage }, null, 2));
}

async function runPromote(args) {
  if (!args.runId) throw new Error('Promote requires --run-id <id>.');
  const runDir = path.join(runRoot, args.runId);
  const statePath = path.join(runDir, 'run-state.json');
  const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const structural = await readFile(path.join(runDir, 'structural-report.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const visual = await readFile(path.join(runDir, 'visual-verdict.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  const adversarial = await readFile(path.join(runDir, 'adversarial-verdict.json'), 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!state || !structural || !visual || !adversarial) throw new Error(`All gate verdicts are required before promote: ${runDir}`);
  const checks = {
    structural_gate_passed: structural.status === 'passed',
    visual_gate_passed: visual.status === 'passed',
    adversarial_gate_passed: adversarial.status === 'passed',
    production_source_untouched: true,
    rollback_manifest_present: false,
  };
  const eligible = Object.values(checks).every(Boolean);
  const manifest = {
    schema_version: 1,
    run_id: args.runId,
    stage: 'promote',
    status: eligible ? 'eligible-for-release-review' : 'blocked-or-needs-review',
    promotion_performed: false,
    checks,
    reason: eligible ? 'All hard gates passed; release review is still a separate explicit step.' : 'Promotion is refused until every hard gate and rollback manifest is present.',
    source_policy: 'production source remains untouched; promotion never copies over the authoritative .spine automatically',
    created_at: new Date().toISOString(),
  };
  await writeFile(path.join(runDir, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  state.status = eligible ? 'passed' : 'blocked';
  state.current_stage = 'promote';
  state.next_stage = null;
  state.updated_at = new Date().toISOString();
  state.artifacts = [...new Set([...(state.artifacts ?? []), 'release-manifest.json'])];
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: manifest.status, run_id: args.runId, checks, promotion_performed: false }, null, 2));
}

async function runIntake(args) {
  const inputPath = path.resolve(repoRoot, args.input ?? defaultInput);
  const inputStats = await stat(inputPath).catch(() => null);
  if (!inputStats?.isDirectory()) throw new Error(`Input directory does not exist: ${inputPath}`);

  const runId = args.runId ?? `intake-${isoStamp()}`;
  const runDir = path.join(runRoot, runId);
  await mkdir(runDir, { recursive: false });

  const files = await collectFiles(inputPath);
  const entries = [];
  for (const filePath of files) {
    const fileStats = await stat(filePath);
    const extension = path.extname(filePath).toLowerCase();
    entries.push({
      path: relativePosix(filePath, inputPath),
      absolute_path: filePath,
      extension,
      kind: classify(extension),
      bytes: fileStats.size,
      sha256: await sha256(filePath),
      modified_at: fileStats.mtime.toISOString(),
    });
  }

  const counts = entries.reduce((accumulator, entry) => {
    accumulator[entry.kind] = (accumulator[entry.kind] ?? 0) + 1;
    return accumulator;
  }, {});

  const createdAt = new Date().toISOString();
  const manifest = {
    schema_version: 1,
    run_id: runId,
    stage: 'intake',
    created_at: createdAt,
    project: 'roomwave-c010',
    input_root: inputPath,
    source_policy: 'read-only-input-derived-artifacts-only',
    counts,
    files: entries,
    facts: [
      {
        id: 'spine-source-present',
        value: entries.some((entry) => entry.kind === 'spine-source'),
        evidence: 'files[].kind',
      },
      {
        id: 'raw-art-source-present',
        value: entries.some((entry) => entry.kind === 'raw-art-source'),
        evidence: 'files[].kind',
      },
    ],
    unknowns: [
      'Spine editor/runtime compatibility requires the version matrix stage.',
      'Art intent and hidden pixels are unknown when no raw PSD/PSB source is present.',
    ],
  };

  const state = {
    schema_version: 1,
    run_id: runId,
    status: 'passed',
    current_stage: 'intake',
    next_stage: 'forensics',
    created_at: createdAt,
    updated_at: new Date().toISOString(),
    artifacts: ['source-manifest.json'],
  };

  await writeFile(path.join(runDir, 'source-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(path.join(runDir, 'run-state.json'), `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    status: 'passed',
    run_id: runId,
    run_dir: runDir,
    input_root: inputPath,
    file_count: entries.length,
    counts,
    next_stage: 'forensics',
  }, null, 2));
}

async function showStatus() {
  await mkdir(runRoot, { recursive: true });
  const entries = await readdir(runRoot, { withFileTypes: true });
  const runs = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => b.name.localeCompare(a.name))) {
    const statePath = path.join(runRoot, entry.name, 'run-state.json');
    const state = await readFile(statePath, 'utf8').then((value) => JSON.parse(value)).catch(() => ({ status: 'unknown' }));
    runs.push({ run_id: entry.name, ...state });
  }
  console.log(JSON.stringify({ run_root: runRoot, runs }, null, 2));
}

try {
  const rawArgs = process.argv.slice(2);
  const args = rawArgs[0] === 'intake' ? parseArgs(rawArgs) : parseStageArgs(rawArgs);
  if (args.stage === 'intake') await runIntake(args);
  else if (args.stage === 'forensics') await runForensics(args);
  else if (args.stage === 'semantic-contract') await runSemanticContract(args);
  else if (args.stage === 'rig-plan') await runRigPlan(args);
  else if (args.stage === 'derived-mutation') await prepareDerivedCopy(args);
  else if (args.stage === 'mutation-execution') await runMutationExecution(args);
  else if (args.stage === 'structural-gate') await runStructuralGate(args);
  else if (args.stage === 'motion-build') await runMotionBuild(args);
  else if (args.stage === 'visual-gate') await runVisualGate(args);
  else if (args.stage === 'adversarial-gate') await runAdversarialGate(args);
  else if (args.stage === 'promote') await runPromote(args);
  else if (args.stage === 'status') await showStatus();
  else usage();
} catch (error) {
  console.error(`[spine-studio] ${error.message}`);
  process.exitCode = 1;
}
