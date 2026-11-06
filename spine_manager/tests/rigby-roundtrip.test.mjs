import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Workspace, createTools, loadProject } from '../../rigby2d/src/mcp/tools.js';
import { save } from '../../rigby2d/src/mcp/edits.js';
import { Animation, sample } from '../../rigby2d/src/core/animation.js';
import { readSkeletonJson, writeSkeletonJson } from '../../rigby2d/src/core/interop.js';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const source = path.join(root, 'spine_manager/source/c010/c010_00.rigby');
const output = path.join(root, 'spine_manager/artifacts/runs/c010-foam-wipe-20261104/export-checks/terminal-curve-fixture.rigby');

test('c010 source round-trips before adding any action', async () => {
  const tools = createTools(await Workspace.open([root]));
  const result = await tools.find((tool) => tool.name === 'validate_project').handler({ path: source });
  assert.equal(result.valid, true);
  assert.equal(result.checks.jsonRoundTrip, 'ok');
});

test('terminal easing is ignored without changing exported interpolation or final value', async () => {
  const before = await fs.readFile(source);
  const project = await loadProject(source);
  const animation = new Animation('roundtrip_curve_fixture', 2);
  const bone = project.doc.boneIndex('head');
  const keys = animation.boneTimelineMut(bone).rotate;
  keys.push(
    { time: 0, value: -5, curve: { bezier: [0.25, 0.1, 0.25, 1] } },
    { time: 1, value: 12, curve: { bezier: [0.42, 0, 0.58, 1] } },
    { time: 2, value: 3, curve: { bezier: [0, 0, 0.58, 1] } },
  );
  project.doc.animations.push(animation);
  await fs.mkdir(path.dirname(output), { recursive: true });
  const workspace = await Workspace.open([root]);
  await save(workspace, project, { output, overwrite: true });
  const result = await createTools(workspace).find((tool) => tool.name === 'validate_project').handler({ path: output });
  assert.equal(result.checks.jsonRoundTrip, 'ok');
  const { json } = writeSkeletonJson(project.doc, { version: '4.3' });
  const back = readSkeletonJson(JSON.parse(JSON.stringify(json)), 'readback').skeleton;
  const exportedKeys = back.animations.find((item) => item.name === animation.name).boneTimeline(bone).rotate;
  for (let frame = 0; frame <= 100; frame++) {
    const time = frame / 50;
    assert.ok(Math.abs(sample(keys, time) - sample(exportedKeys, time)) < 0.001, `interpolation differs at ${time}`);
  }
  assert.equal(exportedKeys.at(-1).value, 3);
  assert.deepEqual(await fs.readFile(source), before);
});
