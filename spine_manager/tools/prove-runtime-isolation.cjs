const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.resolve(__dirname, '../../src/spine-audit/c010/tooling/node_modules/playwright-core'));

const output = path.resolve(__dirname, '../evidence/c010-runtime-isolation.json');
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
    const rest = { x: hand.worldX, y: hand.worldY };
    const target = { x: rest.x + 90, y: rest.y + 30 };
    const before = { hand: { x: hand.worldX, y: hand.worldY }, strap: { x: strap.worldX, y: strap.worldY } };
    adapter.setTarget('ik_arm_r', target.x, target.y);
    adapter.skeleton.updateWorldTransform();
    const after = { hand: { x: hand.worldX, y: hand.worldY }, strap: { x: strap.worldX, y: strap.worldY } };
    adapter.setTarget('ik_arm_r', rest.x, rest.y);
    adapter.skeleton.updateWorldTransform();
    return {
      patchStatus: adapter.patchStatus,
      handDelta: Math.hypot(after.hand.x - before.hand.x, after.hand.y - before.hand.y),
      strapDelta: Math.hypot(after.strap.x - before.strap.x, after.strap.y - before.strap.y),
      before,
      after
    };
  });
  await browser.close();
  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    preset: 'runtime-isolation-fallback',
    model: 'c010_00',
    entryStatus: response.status(),
    result,
    interpretation: result.patchStatus === 'runtime-isolation-fallback' && result.handDelta > 1 && result.strapDelta < 1 ? 'hand-isolated-at-runtime' : 'needs-investigation',
    releaseStatus: 'provisional-until-editable-spine-export'
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
})().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });

