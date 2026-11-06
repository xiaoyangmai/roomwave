import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!existsSync(path.join(here, 'public/c010.zip')))
  throw new Error('Run npm --prefix spine_runtime ci, then npm --prefix spine_runtime run prepare:source.');

// Only the local stage runs here. Room services and media publishing belong to Roomwave.
const child = spawn(process.execPath, [path.join(here, 'node_modules/vite/bin/vite.js'),
  '--host', '127.0.0.1', '--port', '5180', '--strictPort'], { cwd: here, stdio: 'inherit', windowsHide: true });
child.on('exit', code => { process.exitCode = code ?? 0; });
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
