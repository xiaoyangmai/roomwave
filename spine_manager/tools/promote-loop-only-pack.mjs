import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const managerRoot = path.join(repoRoot, 'spine_manager');
const artifactRoot = path.join(managerRoot, 'artifacts', 'runs');
const productPackRoot = path.join(repoRoot, 'resources', 'characters', 'c010_00');
const registryPath = path.join(repoRoot, 'resources', 'config', 'character-registry.json');

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--run-id') result.runId = argv[++index];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node tools/promote-loop-only-pack.mjs [--run-id RUN_ID]');
      process.exit(0);
    } else throw new Error('Unknown argument: ' + arg);
  }
  return result;
}

async function readJson(file) {
  return JSON.parse(await fsp.readFile(file, 'utf8'));
}

async function latestRunId() {
  const runs = (await fsp.readdir(artifactRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('loop-only-c010-'))
    .map((entry) => entry.name)
    .sort();
  if (!runs.length) throw new Error('No loop-only c010 run was found in spine_manager/artifacts/runs.');
  return runs.at(-1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runId = args.runId || await latestRunId();
  const runRoot = path.join(artifactRoot, runId, 'loop-only', 'c010_00');
  const sourcePackRoot = path.join(runRoot, 'character-pack');
  const sourceManifestPath = path.join(sourcePackRoot, 'character-pack.json');
  if (!fs.existsSync(sourceManifestPath)) throw new Error('Character Pack manifest is missing: ' + sourceManifestPath);

  const pack = await readJson(sourceManifestPath);
  if (pack.characterId !== 'c010_00' || pack.capabilities?.tier !== 'loop-only') {
    throw new Error('Only a c010 loop-only Character Pack can be promoted.');
  }

  await fsp.rm(productPackRoot, { recursive: true, force: true });
  await fsp.mkdir(path.dirname(productPackRoot), { recursive: true });
  await fsp.cp(sourcePackRoot, productPackRoot, { recursive: true });

  const registry = {
    schemaVersion: 1,
    registryId: 'roomwave-character-registry',
    generatedAt: new Date().toISOString(),
    characters: [{
      id: pack.characterId,
      displayName: pack.identity?.displayName || pack.characterId,
      manifest: '/character-packs/c010_00/character-pack.json',
      packVersion: pack.packVersion,
      status: pack.status,
      releaseStatus: 'blocked-until-visual-review-and-license-confirmation',
      capabilities: pack.capabilities,
      sourceRunId: runId,
    }],
  };
  await fsp.writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({
    status: 'promoted-for-product-validation',
    runId,
    manifest: path.relative(repoRoot, path.join(productPackRoot, 'character-pack.json')).replaceAll(path.sep, '/'),
    registry: path.relative(repoRoot, registryPath).replaceAll(path.sep, '/'),
    releaseStatus: registry.characters[0].releaseStatus,
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ status: 'fail', error: error.message, stack: error.stack }, null, 2));
  process.exitCode = 1;
});
