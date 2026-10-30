const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.resolve(__dirname, '../../src/spine-audit/c010/tooling/node_modules/playwright-core'));

const output = path.resolve(__dirname, '../evidence/c010-hand-reachability.json');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 900 } });
  const response = await page.goto('http://127.0.0.1:4173/spine/c010/?debug=0', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForFunction(() => Boolean(window.RoomwaveSpineC010?.loaded), null, { timeout: 12000 });
  const result = await page.evaluate(async () => {
    const adapter = window.RoomwaveSpineC010;
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const anchor = (name) => adapter.getAnchor(name);
    const rest = { target: anchor('handTarget'), visual: anchor('handVisual'), face: anchor('faceTarget') };
    adapter.playSemantic({ type: 'foam_wipe', intensity: 0.85, seed: 17 });
    await new Promise((resolve, reject) => {
      const start = performance.now();
      const tick = () => {
        const sample = adapter.trace[adapter.trace.length - 1];
        if (sample?.type === 'foam_wipe' && sample.phase === 'contact') return resolve();
        if (performance.now() - start > 5000) return reject(new Error('timed out waiting for contact phase'));
        requestAnimationFrame(tick);
      };
      tick();
    });
    const contact = { target: anchor('handTarget'), visual: anchor('handVisual'), face: anchor('faceTarget') };
    return {
      patchStatus: adapter.patchStatus,
      rest,
      contact,
      targetDelta: distance(contact.target, rest.target),
      visualDelta: distance(contact.visual, rest.visual),
      contactTargetToVisual: distance(contact.target, contact.visual),
      contactVisualToFace: distance(contact.visual, contact.face)
    };
  });
  await browser.close();
  const reachable = result.visualDelta > 30 && result.contactTargetToVisual < 80;
  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    preset: 'hand-reachability',
    model: 'c010_00',
    entryStatus: response.status(),
    result,
    interpretation: reachable ? 'hand-reachable' : 'target-moves-but-visible-hand-does-not-follow',
    releaseStatus: reachable ? 'provisional-until-visual-review' : 'blocked-until-editable-two-bone-hand-rig'
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
})().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });

