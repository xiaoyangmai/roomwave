const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'configs', 'dependencies.json'), 'utf8'));
const evidence = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  installs: [],
  checks: [],
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 4 * 1024 * 1024,
  });
  return {
    command: [command, ...args].join(' '),
    status: result.status == null ? 1 : result.status,
    output: `${result.stdout || ''}${result.stderr || ''}`.slice(-20000),
    error: result.error ? String(result.error.message || result.error) : null,
  };
}

function nodeCheck() {
  let version = null;
  try {
    const packagePath = require.resolve(`${config.node.package}/package.json`);
    version = JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
  } catch {}
  evidence.checks.push({ type: 'node', package: config.node.package, required: config.node.version, found: version });
  if (version === config.node.version) return true;
  const result = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
    'install', '--no-audit', '--no-fund', `${config.node.package}@${config.node.version}`,
  ]);
  evidence.installs.push({ type: 'node', ...result });
  try {
    const packagePath = require.resolve(`${config.node.package}/package.json`);
    version = JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
  } catch {}
  evidence.checks[evidence.checks.length - 1].afterInstall = version;
  return version === config.node.version && result.status === 0;
}

function pythonCommand() {
  const candidates = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
  for (const candidate of candidates) {
    const probe = run(candidate, ['-c', 'import sys; print(sys.executable)']);
    if (probe.status === 0) return candidate;
  }
  return null;
}

function pythonCheck() {
  const command = pythonCommand();
  if (!command) {
    evidence.checks.push({ type: 'python', package: config.python.package, status: 'python-not-found' });
    return false;
  }
  const probe = run(command, ['-c', 'import PIL; print(PIL.__version__)']);
  const found = probe.status === 0 ? probe.output.trim().split(/\s+/).pop() : null;
  const major = found ? Number(found.split('.')[0]) : NaN;
  evidence.checks.push({ type: 'python', executable: command, package: config.python.package, minimum: config.python.minimumVersion, found });
  if (found && Number.isFinite(major) && major >= 10 && major < config.python.maximumMajorExclusive) return true;
  const result = run(command, ['-m', 'pip', 'install', '--user', 'Pillow>=10,<13']);
  evidence.installs.push({ type: 'python', ...result });
  const after = run(command, ['-c', 'import PIL; print(PIL.__version__)']);
  const afterVersion = after.status === 0 ? after.output.trim().split(/\s+/).pop() : null;
  evidence.checks[evidence.checks.length - 1].afterInstall = afterVersion;
  const afterMajor = afterVersion ? Number(afterVersion.split('.')[0]) : NaN;
  return Boolean(afterVersion && Number.isFinite(afterMajor) && afterMajor >= 10 && afterMajor < config.python.maximumMajorExclusive && result.status === 0);
}

const ok = nodeCheck() && pythonCheck();
evidence.status = ok ? 'pass' : 'blocked-dependency-unavailable';
fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
fs.writeFileSync(path.join(root, config.evidence), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
if (!ok) process.exitCode = 1;
