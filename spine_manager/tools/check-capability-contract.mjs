import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractPath = path.join(managerRoot, 'configs', 'spine-4.3-capability-contract.json');
const schemaPath = path.join(managerRoot, 'schemas', 'spine-4.3-capability-contract.schema.json');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const requiredCapabilityIds = [
  'bones',
  'slots_draw_order',
  'skins',
  'meshes',
  'weights',
  'constraints',
  'animations',
  'events',
  'atlas_assets',
  'validation',
];
const supportLevels = new Set(['full', 'partial', 'read_only', 'not_supported', 'unknown']);
const surfaces = ['native_project', 'exported_skeleton', 'runtime', 'portable_cli', 'local_mcp'];
const operations = ['inspect', 'mutate', 'export_roundtrip', 'pose_validate'];
const errors = [];

function requireValue(value, label) {
  if (value === undefined || value === null || value === '') errors.push(`${label} is missing`);
}

requireValue(contract.schema_version, 'schema_version');
if (contract.schema_version !== 1) errors.push(`schema_version must be 1, got ${contract.schema_version}`);
if (contract.contract_id !== schema.properties.contract_id.const) errors.push(`contract_id must be ${schema.properties.contract_id.const}`);
if (contract.version_boundary?.editor !== '4.3.26') errors.push('editor boundary must be 4.3.26');
if (contract.version_boundary?.export !== '4.3.26') errors.push('export boundary must be 4.3.26');
if (contract.version_boundary?.runtime !== '4.3.13') errors.push('runtime boundary must be 4.3.13');
for (const key of ['full', 'partial', 'read_only', 'not_supported', 'unknown']) requireValue(contract.support_levels?.[key], `support_levels.${key}`);
for (const surface of surfaces) requireValue(contract.surfaces?.[surface], `surfaces.${surface}`);

for (const [serverId, binding] of Object.entries(contract.surfaces?.local_mcp?.bindings ?? {})) {
  const evidence = binding?.evidence;
  if (typeof evidence === 'string' && evidence.startsWith('runs/')) {
    const evidencePath = path.join(managerRoot, ...evidence.split('/'));
    if (!fs.existsSync(evidencePath)) errors.push(`local_mcp.${serverId} evidence is missing: ${evidence}`);
  }
}

const capabilities = Array.isArray(contract.capabilities) ? contract.capabilities : [];
const byId = new Map();
for (const capability of capabilities) {
  if (byId.has(capability.id)) errors.push(`duplicate capability id: ${capability.id}`);
  byId.set(capability.id, capability);
  for (const operation of operations) {
    const support = capability.support?.[operation];
    if (!support) {
      errors.push(`${capability.id}.${operation} is missing`);
      continue;
    }
    for (const surface of surfaces) {
      if (!supportLevels.has(support[surface])) errors.push(`${capability.id}.${operation}.${surface} has invalid support level ${support[surface]}`);
    }
  }
  if (!Array.isArray(capability.invariants) || capability.invariants.length === 0) errors.push(`${capability.id} has no invariants`);
  if (!Array.isArray(capability.evidence) || capability.evidence.length === 0) errors.push(`${capability.id} has no evidence sources`);
}
for (const id of requiredCapabilityIds) if (!byId.has(id)) errors.push(`required capability is missing: ${id}`);

const gates = Array.isArray(contract.validation_gates) ? contract.validation_gates : [];
if (gates.length < 8) errors.push('validation_gates must contain at least 8 gates');
for (const gate of gates) {
  if (!gate.id || typeof gate.hard !== 'boolean' || !Array.isArray(gate.checks) || gate.checks.length === 0) errors.push(`invalid validation gate: ${gate.id || '(unnamed)'}`);
}
requireValue(contract.unknown_policy, 'unknown_policy');
requireValue(contract.mutation_policy, 'mutation_policy');

const result = {
  status: errors.length ? 'fail' : 'pass',
  contract: path.relative(managerRoot, contractPath).replaceAll('\\', '/'),
  schema: path.relative(managerRoot, schemaPath).replaceAll('\\', '/'),
  version_boundary: contract.version_boundary,
  capability_count: capabilities.length,
  capability_ids: capabilities.map((capability) => capability.id),
  validation_gate_count: gates.length,
  unknown_policy: contract.unknown_policy,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
