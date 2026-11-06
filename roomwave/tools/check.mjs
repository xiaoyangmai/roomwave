import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repository = path.dirname(root);
const scripts = ['frontend', 'backend', 'shared'].flatMap(directory =>
  readdirSync(path.join(root, directory), { recursive: true })
    .filter(file => /\.(?:cjs|js)$/.test(file))
    .map(file => path.join(root, directory, file)));
for (const script of scripts) execFileSync(process.execPath, ['--check', script], { stdio: 'pipe' });

const html = readFileSync(path.join(root, 'frontend/index.html'), 'utf8');
const references = [...html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)]
  .map(match => match[1]).filter(url => /\.(?:js|css|svg|webp)$/.test(url));
for (const url of references) {
  const file = url.startsWith('/shared/') ? path.join(root, url.slice(1))
    : url.startsWith('/assets/') ? path.join(repository, 'resources', url.slice(1))
      : path.join(root, 'frontend', url.slice(1));
  assert.ok(existsSync(file), `Missing page dependency: ${url}`);
}
console.log(`Checked ${scripts.length} scripts and ${references.length} page dependencies.`);
