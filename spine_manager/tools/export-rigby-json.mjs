import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Workspace, createTools, loadProject } from '../../rigby2d/src/mcp/tools.js';
import { writeSkeletonJson } from '../../rigby2d/src/core/interop.js';
import { atlasFilter, parseAtlas, writeAtlas } from '../../rigby2d/src/core/atlas.js';
import { usedImages } from '../../rigby2d/src/editor/io.js';
import { pack } from '../../rigby2d/src/editor/pack.js';
import { decodePng, encodePng } from '../../rigby2d/src/mcp/png.js';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
if (process.argv.length !== 4) throw new Error('Usage: node tools/export-rigby-json.mjs INPUT.rigby OUTPUT.json');
const input = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
const artifactsRoot = path.join(repoRoot, 'spine_manager', 'artifacts');
if (path.extname(input) !== '.rigby' || path.extname(output) !== '.json') throw new Error('Expected .rigby input and .json output.');
if (!output.startsWith(artifactsRoot + path.sep)) throw new Error('Export output must stay in spine_manager/artifacts.');

const project = await loadProject(input);
const structureError = project.doc.validate();
if (structureError) throw new Error(structureError);
const images = new Map(usedImages(project.doc).map((name) => {
  const bytes = project.entries.get(`images/${name}.png`);
  if (!bytes) throw new Error(`Work file image missing: ${name}`);
  return [name, decodePng(bytes)];
}));
const { width, height, regions } = pack([...images].map(([name, image]) => ({ name, width: image.width, height: image.height })));
const pixels = new Uint8Array(width * height * 4);
for (const region of regions) {
  const image = images.get(region.name);
  for (let y = 0; y < image.height; y++) {
    pixels.set(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4), ((region.y + y) * width + region.x) * 4);
  }
}
const pngPath = output.replace(/\.json$/, '.png');
const atlasPath = output.replace(/\.json$/, '.atlas');
const { json, warnings } = writeSkeletonJson(project.doc, { version: '4.3' });
const atlas = writeAtlas([{
  name: path.basename(pngPath), width, height, filter: atlasFilter(project.doc.textureFilter),
  regions: regions.map((region) => ({ ...region, rotate: 0, index: -1 })),
}]);
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(json, null, 2) + '\n');
await fs.writeFile(atlasPath, atlas);
await fs.writeFile(pngPath, encodePng({ width, height, data: pixels }));

// Read the real output back: verify every packed pixel, not just image names in the atlas.
const decodedPage = decodePng(new Uint8Array(await fs.readFile(pngPath)));
const savedAtlas = parseAtlas(await fs.readFile(atlasPath, 'utf8'));
for (const region of savedAtlas.pages[0].regions) {
  const image = images.get(region.name);
  for (let y = 0; y < image.height; y++) {
    const saved = decodedPage.data.subarray(((region.y + y) * decodedPage.width + region.x) * 4, ((region.y + y) * decodedPage.width + region.x + image.width) * 4);
    if (!Buffer.from(saved).equals(Buffer.from(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4)))) throw new Error(`Packed pixels differ: ${region.name}`);
  }
}
const tools = createTools(await Workspace.open([repoRoot]));
const validate = tools.find((tool) => tool.name === 'validate_project').handler;
const sourceValidation = await validate({ path: input });
const exportValidation = await validate({ path: output });
const passed = sourceValidation.valid && sourceValidation.checks.jsonRoundTrip === 'ok'
  && exportValidation.valid && exportValidation.checks.images === 'ok' && exportValidation.checks.jsonRoundTrip === 'ok';
const files = {};
for (const file of [input, output, atlasPath, pngPath]) {
  const bytes = await fs.readFile(file);
  files[path.relative(repoRoot, file).replaceAll('\\', '/')] = { bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
}
const report = {
  status: passed ? 'pass' : 'fail', generatedAt: new Date().toISOString(),
  scope: 'JSON, atlas, texture completeness and readback; animation quality requires runtime and visual review',
  input: path.relative(repoRoot, input).replaceAll('\\', '/'),
  output: path.relative(repoRoot, output).replaceAll('\\', '/'),
  textures: { pages: 1, width, height, images: images.size, rgbaPixelsUnchanged: true, premultipliedAlpha: false },
  sourceValidation, exportValidation, exportWarnings: warnings, files,
};
const reportPath = output.replace(/\.json$/, '.export-report.json');
await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, output: report.output, textures: report.textures, checks: exportValidation.checks, report: path.relative(repoRoot, reportPath) }, null, 2));
if (!passed) process.exitCode = 1;
