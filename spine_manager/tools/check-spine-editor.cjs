const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const managerRoot = path.resolve(__dirname, '..');
const output = path.join(managerRoot, 'evidence', 'c010-editor-availability.json');
const toolConfigPath = path.join(managerRoot, 'tools', 'spine-tool.json');
const migrationConfigPath = path.join(managerRoot, 'configs', 'c010-version-migration.json');
const migrationProbePath = path.join(managerRoot, 'evidence', 'c010-migration-4.3.26-cli-probe.json');
const migrationSavePath = path.join(managerRoot, 'evidence', 'c010-migration-4.3.26-save.json');
const candidates = ['Spine.exe', 'spine.exe', 'spine-cli.exe', 'spine-cli'];
const found = [];
let toolConfig = null;
if (fs.existsSync(toolConfigPath)) toolConfig = JSON.parse(fs.readFileSync(toolConfigPath, 'utf8'));
const migrationConfig = fs.existsSync(migrationConfigPath) ? JSON.parse(fs.readFileSync(migrationConfigPath, 'utf8')) : null;
const migrationProbe = fs.existsSync(migrationProbePath) ? JSON.parse(fs.readFileSync(migrationProbePath, 'utf8')) : null;
const migrationSave = fs.existsSync(migrationSavePath) ? JSON.parse(fs.readFileSync(migrationSavePath, 'utf8')) : null;

const projectLauncher = toolConfig?.projectCopy?.launcherRelative
  ? path.resolve(managerRoot, toolConfig.projectCopy.launcherRelative)
  : null;
const projectCli = toolConfig?.projectCopy?.cliRelative
  ? path.resolve(managerRoot, toolConfig.projectCopy.cliRelative)
  : null;
const projectCliBridge = toolConfig?.projectCopy?.portableCliBridgeRelative
  ? path.resolve(managerRoot, toolConfig.projectCopy.portableCliBridgeRelative)
  : null;
const directCliPolicy = toolConfig?.cliPolicy?.forbidDirectCliInvocation === true;
const projectCopyPresent = Boolean(projectLauncher && fs.existsSync(projectLauncher));
const directCliPresent = Boolean(projectCli && fs.existsSync(projectCli));
let cli = {
  present: Boolean(projectCliBridge && fs.existsSync(projectCliBridge)),
  facade: projectCliBridge,
  directExecutable: projectCli,
  directInvocation: 'forbidden',
  policyEnforced: directCliPolicy,
  activated: false,
  help: false,
  output: null,
};
if (cli.present) {
  try {
    const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
    const result = execFileSync(powershell, [
      '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', projectCliBridge, '-CheckActivated',
    ], { cwd: managerRoot, encoding: 'utf8', windowsHide: true, timeout: 30000 });
    const check = JSON.parse(result.trim());
    cli = {
      ...cli,
      activated: check.logActivated === true && check.processExitCode === 0,
      help: check.logActivated === true && check.processExitCode === 0,
      output: check,
    };
  } catch (error) {
    cli = { ...cli, output: String(error.message || error).slice(0, 1200) };
  }
}
if (projectCopyPresent) {
  found.push({
    command: path.basename(projectLauncher),
    file: projectLauncher,
    source: 'project-copy',
    version: toolConfig.projectCopy.expectedVersion,
  });
}

const allowExternalDiscovery = toolConfig?.discovery?.allowExternal !== false;
if (allowExternalDiscovery) {
  for (const command of candidates) {
    try {
      const result = execFileSync('where.exe', [command], { encoding: 'utf8', windowsHide: true }).trim();
      if (result) found.push(...result.split(/\r?\n/).map((file) => ({ command, file, source: 'system-discovery' })));
    } catch {}
  }
  for (const root of ['C:\\Program Files', 'C:\\Program Files (x86)', process.env.LOCALAPPDATA].filter(Boolean)) {
    if (!fs.existsSync(root)) continue;
    for (const name of candidates) {
      const direct = path.join(root, name);
      if (fs.existsSync(direct)) found.push({ command: name, file: direct, source: 'system-discovery' });
    }
  }
}
const unique = [...new Map(found.map((item) => [`${item.command}|${item.file}`, item])).values()];
const requiredEditorVersion = migrationConfig?.targetEditor || '4.0.47';
const preferredVersion = toolConfig?.projectCopy?.expectedVersion || null;
const projectCandidate = unique.find((item) => item.source === 'project-copy');
const availableForRequiredVersion = unique.some((item) => item.source === 'project-copy' && item.version === requiredEditorVersion);
let status = unique.length ? 'editor-or-cli-available' : 'editor-or-cli-unavailable';
let mutationImpact = unique.length ? 'editable-rig-mutation-can-start' : 'derived-project-ready-editor-mutation-pending';
if (projectCandidate && projectCandidate.version !== requiredEditorVersion) {
  status = 'migration-editor-available-but-version-mismatch';
  mutationImpact = 'migration-only-derived-copy';
}
if (toolConfig?.discovery?.allowExternal === false && !projectCopyPresent) {
  status = 'project-copy-missing';
  mutationImpact = 'derived-project-ready-project-local-editor-pending';
}
if (migrationProbe?.status === 'blocked-activation-required' && projectCandidate) {
  status = 'editor-present-activation-pending';
  mutationImpact = 'migration-save-export-pending-activation';
}
if (migrationSave?.status === 'saved-in-4.3.26-awaiting-export' || migrationSave?.status?.includes('exported-round-trip-pass') || migrationSave?.status === 'exported-4.3.26-runtime-round-trip-pass') {
  status = 'editor-present-save-export-verified';
  mutationImpact = migrationSave.status.includes('exported-round-trip-pass') || migrationSave.status === 'exported-4.3.26-runtime-round-trip-pass' ? 'migration-save-export-round-trip-verified' : 'migration-save-verified-export-pending';
}
if (projectCandidate && !cli.activated) {
  status = 'editor-present-activation-pending';
  mutationImpact = 'portable-cli-bridge-activation-pending';
}
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  model: 'c010_00',
  requiredEditorVersion,
  preferredProjectToolVersion: preferredVersion,
  projectCopy: {
    launcher: projectLauncher,
    cli: projectCli,
    cliBridge: projectCliBridge,
    directCliPresent,
    directCliInvocation: 'forbidden',
    present: projectCopyPresent,
    sourcePath: toolConfig?.sourcePath || null,
    expectedVersion: preferredVersion,
  },
  found: unique,
  cli,
  status,
  availableForRequiredVersion,
  mutationImpact,
};
if (!directCliPolicy || !cli.activated) {
  evidence.status = !directCliPolicy ? 'direct-cli-policy-missing' : 'editor-present-activation-pending';
  evidence.mutationImpact = !directCliPolicy ? 'pipeline-blocked-policy-missing' : 'portable-cli-bridge-activation-pending';
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
if (!directCliPolicy || !cli.activated) process.exitCode = 1;
