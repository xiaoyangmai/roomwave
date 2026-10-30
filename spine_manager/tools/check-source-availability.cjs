const fs = require('node:fs');
const path = require('node:path');

const managerRoot = path.resolve(__dirname, '..');
const sourceRoot = process.env.C010_SOURCE_ROOT || path.resolve(__dirname, '../source/nikke_4.0.47/c010_00');
const output = path.resolve(managerRoot, 'evidence/c010-source-availability.json');
const editableExtensions = new Set(['.spine', '.spineproj']);
const layerExtensions = new Set(['.psd', '.kra', '.ora', '.xcf']);
const runtimeExtensions = new Set(['.skel', '.atlas', '.png', '.gif', '.webm']);

function walk(root) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  const visit = (directory) => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) visit(file);
      else result.push(file);
    }
  };
  visit(root);
  return result;
}

const files = walk(sourceRoot);
const classify = (extensions) => files.filter((file) => extensions.has(path.extname(file).toLowerCase())).map((file) => path.relative(sourceRoot, file).replaceAll('\\', '/'));
const editableProject = classify(editableExtensions);
const sourceLayers = classify(layerExtensions);
const runtimeExports = classify(runtimeExtensions);
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  model: 'c010_00',
  sourceRoot,
  sourceRootExists: fs.existsSync(sourceRoot),
  editableProject,
  sourceLayers,
  runtimeExports,
  status: editableProject.length ? 'editable-source-available' : sourceLayers.length ? 'source-layers-available-no-spine-project' : runtimeExports.length ? 'runtime-exports-only' : 'source-root-missing',
  releaseImpact: editableProject.length ? 'continue-derived-rig-build' : 'blocked-until-editable-spine-project-or-source-layers'
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
