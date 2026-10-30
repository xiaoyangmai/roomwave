const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.resolve(__dirname, '../../src/spine-audit/c010/tooling/node_modules/playwright-core'));

const output = path.resolve(__dirname, '../evidence/c010-hand-only-string-off.json');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 900 } });
  const response = await page.goto('http://127.0.0.1:4173/spine/c010/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForFunction(() => Boolean(window.RoomwaveSpineC010?.loaded), null, { timeout: 12000 });
  const result = await page.evaluate(() => {
    const adapter = window.RoomwaveSpineC010;
    const hand = adapter.skeleton.findBone('ik_arm_r');
    const strap = adapter.skeleton.findBone('string_2');
    const constraint = adapter.skeleton.transformConstraints.find((item) => item.data.name === 'string_2');
    const rest = { x: hand.worldX, y: hand.worldY };
    const target = { x: rest.x + 90, y: rest.y + 30 };
    const sample = () => ({ hand: { x: hand.worldX, y: hand.worldY }, strap: { x: strap.worldX, y: strap.worldY } });
    const move = () => { adapter.setTarget('ik_arm_r', target.x, target.y); adapter.skeleton.updateWorldTransform(); return sample(); };
    const delta = (before, after) => ({ hand: Math.hypot(after.hand.x - before.hand.x, after.hand.y - before.hand.y), strap: Math.hypot(after.strap.x - before.strap.x, after.strap.y - before.strap.y) });
    constraint.mixRotate = 1; constraint.mixX = 1; constraint.mixY = 1;
    const activeBefore = sample(); const activeAfter = move(); const activeDelta = delta(activeBefore, activeAfter);
    adapter.setTarget('ik_arm_r', rest.x, rest.y); adapter.skeleton.updateWorldTransform();
    constraint.mixRotate = 0; constraint.mixX = 0; constraint.mixY = 0;
    const isolatedBefore = sample(); const isolatedAfter = move(); const isolatedDelta = delta(isolatedBefore, isolatedAfter);
    constraint.mixRotate = 1; constraint.mixX = 1; constraint.mixY = 1;
    adapter.setTarget('ik_arm_r', rest.x, rest.y); adapter.skeleton.updateWorldTransform();
    return { rest, target, activeDelta, isolatedDelta, constraint: { name: constraint.data.name, target: constraint.target.data.name, controlledBone: strap.data.name } };
  });
  await browser.close();
  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    preset: 'hand-only-string-off',
    model: 'c010_00',
    entryStatus: response.status(),
    method: 'same hand target displacement with string_2 transform mixes 1 versus 0',
    result,
    interpretation: result.activeDelta.strap > 1 && result.isolatedDelta.strap < result.activeDelta.strap * 0.25 ? 'shared-target-confirmed' : 'needs-investigation',
    releaseStatus: 'blocked-until-independent-strap-target'
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
})().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });

