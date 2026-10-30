import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(managerRoot, 'tools', 'spine-tool.json'), 'utf8'));
const policy = config.cliPolicy || {};
const sourceRoot = path.join(managerRoot, 'tools');
const extensions = new Set(['.js', '.mjs', '.cjs', '.ps1', '.cmd', '.bat']);
const excluded = new Set(['check-cli-policy.mjs', 'run-spine-portable-cli.ps1']);
const violations = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (extensions.has(path.extname(entry.name).toLowerCase()) && !excluded.has(entry.name)) {
      const text = fs.readFileSync(file, 'utf8');
      const patterns = [
        /exec(File|Sync)\s*\([^\n]*\bprojectCli\b/i,
        /exec(File|Sync)\s*\([^\n]*Spine\.com/i,
        /spawn(Sync)?\s*\([^\n]*Spine\.com/i,
        /Start-Process[^\n]*Spine\.com/i,
        /(?:^|[;&|])\s*(?:&\s*)?[^\n]*Spine\.com\s+--(?:help|update|export|input|output)/i,
      ];
      for (const pattern of patterns) {
        if (!pattern.test(text)) continue;
        const line = text.slice(0, text.search(pattern)).split(/\r?\n/).length;
        violations.push({ file: path.relative(managerRoot, file).replaceAll('\\', '/'), line, pattern: String(pattern) });
      }
    }
  }
}

if (policy.forbidDirectCliInvocation !== true) {
  console.error(JSON.stringify({ status: 'fail', reason: 'cliPolicy.forbidDirectCliInvocation is not true' }, null, 2));
  process.exit(1);
}
walk(sourceRoot);
const result = {
  schemaVersion: 1,
  status: violations.length ? 'fail' : 'pass',
  policy: 'direct-Spine.com-invocation-forbidden',
  facade: policy.facadeRelative || null,
  scannedRoot: path.relative(managerRoot, sourceRoot).replaceAll('\\', '/'),
  violations,
};
console.log(JSON.stringify(result, null, 2));
if (violations.length) process.exit(1);
