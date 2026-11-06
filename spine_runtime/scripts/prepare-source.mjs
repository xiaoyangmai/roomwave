import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(here, '..');
const checkout = path.join(root, 'airi');
const revision = '9e7917d9c660f4e8e05d3c04a5f71fe316c39b49';
const patch = path.join(here, 'patches/airi.patch');
if (!existsSync(path.join(checkout, '.git'))) {
  mkdirSync(checkout, { recursive: true });
  execFileSync('git', ['init', checkout], { stdio: 'inherit' });
  execFileSync('git', ['-C', checkout, 'remote', 'add', 'origin', 'https://github.com/moeru-ai/airi.git']);
  execFileSync('git', ['-C', checkout, 'fetch', '--depth=1', 'origin', revision], { stdio: 'inherit' });
  execFileSync('git', ['-C', checkout, 'checkout', '--detach', 'FETCH_HEAD'], { stdio: 'inherit' });
}
if (execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== revision)
  throw new Error('AIRI checkout differs from the pinned source. Keep it and use a separate checkout.');

const applied = spawnSync('git', ['-C', checkout, 'apply', '--reverse', '--check', patch]);
if (applied.status !== 0) {
  execFileSync('git', ['-C', checkout, 'apply', '--check', patch], { stdio: 'inherit' });
  execFileSync('git', ['-C', checkout, 'apply', patch], { stdio: 'inherit' });
}
if (!existsSync(path.join(checkout, 'node_modules')))
  symlinkSync(path.join(here, 'node_modules'), path.join(checkout, 'node_modules'), 'junction');

const packRoot = path.resolve(process.env.ROOMWAVE_C010_PACK || path.join(root, 'resources/characters/c010_00'));
const pack = JSON.parse(readFileSync(path.join(packRoot, 'character-pack.json'), 'utf8'));
const zip = new JSZip();
// A single model pair avoids AIRI's ZIP variant discovery selecting the original rig.
zip.file('c010_00.json', readFileSync(path.join(packRoot, pack.skeleton)));
zip.file('c010_00.atlas', readFileSync(path.join(packRoot, pack.atlas)));
for (const texture of pack.textures)
  zip.file(path.basename(texture), readFileSync(path.join(packRoot, texture)));
mkdirSync(path.join(here, 'public'), { recursive: true });
writeFileSync(path.join(here, 'public/c010.zip'), await zip.generateAsync({ type: 'nodebuffer' }));
if (process.platform === 'win32' && !existsSync(path.join(here, 'public/speech.wav')))
  execFileSync('powershell.exe', ['-NoProfile', '-File', path.join(here, 'scripts/create-test-audio.ps1')], { stdio: 'inherit' });

console.log(`AIRI ${revision.slice(0, 7)} ready. c010 ZIP contains one skeleton, one atlas and ${pack.textures.length} textures.`);
