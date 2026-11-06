import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(managerRoot, '..');
const strict = process.argv.includes('--strict');
const registryPath = path.join(repoRoot, 'resources', 'config', 'character-registry.json');
const schemaPath = path.join(managerRoot, 'schemas', 'character-pack-loop-only.schema.json');
const reviewPath = path.join(managerRoot, 'evidence', 'c010-loop-only-review', 'review-manifest.json');
const errors = [];
const warnings = [];
const checks = {};

function readJson(label, file, required = true) {
  if (!fs.existsSync(file)) {
    if (required) errors.push(`${label} missing: ${file}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function check(name, condition, message) {
  checks[name] = condition ? 'pass' : 'fail';
  if (!condition) errors.push(message || name);
}

function warn(name, condition, message) {
  checks[name] = condition ? 'pass' : 'warning';
  if (!condition) warnings.push(message || name);
}

const registry = readJson('character registry', registryPath);
readJson('loop-only schema', schemaPath);
const entries = Array.isArray(registry?.characters) ? registry.characters : [];
check('registry', Boolean(registry) && entries.length > 0, 'character registry has no entries');

for (const entry of entries) {
  const prefix = `character:${entry.id}`;
  const manifestPath = path.resolve(repoRoot, 'resources', entry.manifest.replace(/^\/character-packs\//, 'characters/'));
  const pack = readJson(`${prefix} pack`, manifestPath);
  check(`${prefix}:manifest`, Boolean(pack), `${prefix} manifest is missing`);
  if (!pack) continue;

  check(`${prefix}:identity`, pack.characterId === entry.id && pack.packType === 'character', `${prefix} identity is inconsistent`);
  check(`${prefix}:version`, pack.packVersion === entry.packVersion, `${prefix} registry and pack versions differ`);
  const skeleton = readJson(`${prefix} skeleton`, path.join(path.dirname(manifestPath), pack.skeleton));
  check(`${prefix}:animations`, Boolean(skeleton) && pack.animations.every((animation) => Object.hasOwn(skeleton.animations, animation.sourceName)), `${prefix} declares an animation absent from the loaded skeleton`);
  const tier = pack.capabilities?.tier;
  check(`${prefix}:format`, pack.format === 'json', `${prefix} must use JSON format`);
  check(`${prefix}:tier`, ['loop-only', 'semantic-action-candidate', 'semantic-action-ready'].includes(tier), `${prefix} has an unknown capability tier: ${tier || '(missing)'}`);
  check(`${prefix}:default-loop`, pack.animations?.filter((item) => item.default && item.semantic === 'idle').length === 1, `${prefix} must have exactly one idle default loop`);
  if (tier === 'loop-only') {
    check(`${prefix}:loop-only-patch`, pack.patch === null, `${prefix} loop-only pack must not depend on a runtime patch`);
    check(`${prefix}:all-loops`, Array.isArray(pack.animations) && pack.animations.every((item) => item.loop === true && item.phaseModel === 'loop'), `${prefix} contains a non-loop animation`);
  } else {
    check(`${prefix}:action-candidate`, Array.isArray(pack.animations) && (pack.recipes || pack.capabilities?.recipes), `${prefix} action tier has no action recipes`);
    warn(`${prefix}:runtime-patch`, pack.patch === null, `${prefix} action candidate still uses a runtime patch`);
  }

  for (const field of ['skeleton', 'atlas', 'binding', 'audit']) {
    check(`${prefix}:${field}`, Boolean(pack[field]) && fs.existsSync(path.join(path.dirname(manifestPath), pack[field])), `${prefix} ${field} file is missing`);
  }
  for (const texture of pack.textures || []) check(`${prefix}:texture:${texture}`, fs.existsSync(path.join(path.dirname(manifestPath), texture)), `${prefix} texture is missing: ${texture}`);

  warn(`${prefix}:license`, pack.provenance?.license?.status === 'confirmed', `${prefix} license is not confirmed`);
  warn(`${prefix}:release`, entry.releaseStatus === 'release', `${prefix} remains blocked from release`);
  warn(`${prefix}:anchors`, !Object.values(pack.anchors || {}).some((item) => item.status === 'needsVisualConfirmation'), `${prefix} still has anchors needing visual confirmation`);
  warn(`${prefix}:unsupported`, (pack.capabilities?.unsupportedActions || []).length === 0, `${prefix} still has unsupported actions`);
}

const review = readJson('visual review manifest', reviewPath, false);
if (review) {
  check('visual-review', review.status === 'pass', 'visual review manifest is not marked pass');
  check('visual-review-source', review.sourceUnmodified === true, 'visual review does not confirm source exports are unchanged');
}

const result = {
  validator: 'roomwave-resource-production',
  status: errors.length ? 'fail' : (strict && warnings.length ? 'blocked' : 'pass'),
  releaseStatus: warnings.length ? 'blocked' : 'release',
  strict,
  checks,
  errors,
  warnings,
  registry: path.relative(repoRoot, registryPath).replaceAll('\\', '/'),
};
console.log(JSON.stringify(result, null, 2));
if (errors.length || (strict && warnings.length)) process.exitCode = 1;
