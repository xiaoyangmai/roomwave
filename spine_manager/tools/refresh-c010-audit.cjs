const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const managerRoot = path.resolve(__dirname, '..');
const roomwaveRoot = path.resolve(managerRoot, '..');
const sourceRoot = path.join(managerRoot, 'source', 'nikke_4.0.47', 'c010_00');
const toolDir = path.join(roomwaveRoot, 'src', 'spine-audit', 'c010', 'tooling');
const auditTool = path.join(toolDir, 'audit-model.cjs');
const outputRoot = path.join(roomwaveRoot, 'src', 'spine-audit', 'c010-refresh');
const destinationRoot = path.join(roomwaveRoot, 'src', 'spine-audit', 'c010');

if (fs.existsSync(outputRoot)) fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
const child = spawnSync(process.execPath, [auditTool], {
  cwd: toolDir,
  env: { ...process.env, SOURCE_ROOT: sourceRoot, OUTPUT_ROOT: outputRoot },
  encoding: 'utf8',
  windowsHide: true,
  maxBuffer: 16 * 1024 * 1024
});
if (child.status !== 0) {
  console.error(child.stdout || '', child.stderr || '');
  process.exit(child.status || 1);
}

const bindingPath = path.join(outputRoot, 'semantic-binding.json');
const binding = JSON.parse(fs.readFileSync(bindingPath, 'utf8'));
binding.semantics.roles.handVisual = {
  candidates: ['l_hand_1', 'l_b_hand_07', 'l_b_hand_03'],
  resolved: 'l_hand_1',
  status: 'available',
  needsVisualConfirmation: true,
  note: '可见手部锚点；与 handTarget 分开记录'
};
fs.writeFileSync(bindingPath, `${JSON.stringify(binding, null, 2)}\n`);
const modelRoot = path.join(destinationRoot, 'model');
fs.mkdirSync(modelRoot, { recursive: true });
for (const name of ['c010_00.skel', 'c010_00.atlas', 'c010_00.png', 'c010_00_2.png']) {
  const source = path.join(sourceRoot, name);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(modelRoot, name));
}
for (const name of ['audit-report.json', 'semantic-binding.json', 'MODEL-AUDIT.md']) {
  fs.copyFileSync(path.join(outputRoot, name), path.join(destinationRoot, name));
}
let report = fs.readFileSync(path.join(destinationRoot, 'MODEL-AUDIT.md'), 'utf8');
report = report.replace('当前原始目录没有 `.spine` 工程和 JSON，只有导出的 `.skel/.atlas/.png`。因此本轮可以做运行时审计和动作试作，但不能直接回写原始 Spine 编辑工程。', '当前源目录已包含 `c010_00.spine`（Spine 4.0.47）以及对应的分层 PNG 和运行时导出物。现在可以建立派生编辑工程并回写控制层；正式发布仍需在编辑器中新增两段式手部 IK、独立背带目标并重新导出。');
fs.writeFileSync(path.join(destinationRoot, 'MODEL-AUDIT.md'), report);
fs.rmSync(outputRoot, { recursive: true, force: true });
console.log(JSON.stringify({ status: 'pass', sourceRoot, destinationRoot, audit: child.stdout.trim() }, null, 2));

