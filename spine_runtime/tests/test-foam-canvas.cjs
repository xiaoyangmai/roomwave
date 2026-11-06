const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright-core');
const foamReviewTiming = require('./foam-review-timing.cjs');
const foamPalmLineage = require('./foam-review-anchor.cjs');

const packRoot = process.env.ROOMWAVE_C010_PACK || path.resolve(__dirname, '../../resources/characters/c010_00');
const out = process.env.ROOMWAVE_AIRI_EVIDENCE_DIR || path.join(os.tmpdir(), 'roomwave-foam-canvas-qa');
fs.mkdirSync(out, { recursive: true });
const pack = JSON.parse(fs.readFileSync(path.join(packRoot, 'character-pack.json'), 'utf8'));
const skeletonBytes = fs.readFileSync(path.join(packRoot, pack.skeleton));
const skeletonSha256 = createHash('sha256').update(skeletonBytes).digest('hex');
const skeleton = JSON.parse(skeletonBytes.toString('utf8'));
const timing = foamReviewTiming(skeleton);
const anchorLineage = foamPalmLineage(skeleton, process.env.ROOMWAVE_EXPECT_FOAM_PALM_ANCESTOR);

(async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  const report = { skeletonSha256, packVersion: pack.packVersion, timing, anchorLineage, checks: {}, errors };
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  if (process.env.ROOMWAVE_C010_PACK) await page.route('**/character-packs/c010_00/**', async route => {
    const relative = new URL(route.request().url()).pathname.split('/character-packs/c010_00/')[1];
    await route.fulfill({ path: path.join(packRoot, relative) });
  });
  const read = () => page.evaluate(() => window.GamingC010Room.adapter.captureTrace());
  const idle = () => page.waitForFunction(() => {
    const adapter = window.GamingC010Room.adapter;
    return !adapter.generated && !adapter.animationState.tracks[1];
  });
  const foamButton = page.locator('[data-c010-gift="foam"]');
  try {
    await page.goto(`${process.env.ROOMWAVE_BASE_URL || 'http://127.0.0.1:4173'}/solo/?room=gaming_c010`);
    await page.waitForFunction(() => window.GamingC010Room?.loaded);
    assert.equal(await page.evaluate(() => window.GamingC010Room.adapter.foamAction.name), 'foam_wipe');
    const visible = await page.evaluate(() => {
      const adapter = window.GamingC010Room.adapter;
      const pixels = adapter.ctx.getImageData(0, 0, adapter.canvas.width, adapter.canvas.height).data;
      let painted = 0;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) painted++;
      const face = adapter.getAnchor('foamFace');
      return { paintedFraction: painted / (pixels.length / 4), face, width: adapter.width, height: adapter.height, bounds: adapter.bounds };
    });
    assert.ok(visible.paintedFraction > 0.02, 'The character canvas is blank.');
    assert.ok(visible.face.x > 0 && visible.face.x < visible.width && visible.face.y > 0 && visible.face.y < visible.height, 'Face is outside the camera.');
    report.checks.characterVisible = visible;
    await foamButton.click();
    await page.waitForFunction(time => window.GamingC010Room.adapter.generated?.entry?.trackTime >= time, timing.contactEarly);
    assert.equal(await foamButton.getAttribute('aria-pressed'), 'true');
    await page.locator('.gaming-c010-camera').screenshot({ path: `${out}/canvas-contact.png` });
    const contact = await read();
    assert.equal(contact.tracks[1].animation, 'foam_wipe');
    assert.ok(contact.frames.some(frame => frame.authored && frame.foam > 0));
    const contactFrame = contact.frames.filter(frame => frame.authored).at(-1);
    assert.equal(contactFrame.foamPalm.bone, 'foam_palm_anchor');
    assert.ok(Number.isFinite(contactFrame.foamPalm.x) && Number.isFinite(contactFrame.foamPalm.y));
    report.checks.contactAnchor = contactFrame.foamPalm;
    assert.equal(await page.evaluate(() => window.GamingC010Room.adapter._ikDebug), undefined);
    await page.waitForFunction(time => window.GamingC010Room.adapter.generated?.entry?.trackTime >= time, timing.afterClear);
    assert.equal((await read()).frames.at(-1).foam, 0);
    await page.locator('.gaming-c010-camera').screenshot({ path: `${out}/canvas-cleared.png` });
    await idle();
    const completed = await read();
    assert.equal(completed.status, 'completed');
    assert.deepEqual(completed.events.filter(event => /^Foam(Notice|Contact|Cleared|Complete)$/.test(event.name))
      .map(event => event.name), ['FoamNotice', 'FoamContact', 'FoamCleared', 'FoamComplete']);
    assert.equal(await foamButton.getAttribute('aria-pressed'), 'false');
    report.completed = completed;
    report.checks.authoredPlaybackAndClear = true;

    await foamButton.click();
    await page.waitForFunction(time => window.GamingC010Room.adapter.generated?.entry?.trackTime >= time, timing.contactEarly);
    const previousTime = (await read()).tracks[1].time;
    await foamButton.click();
    assert.ok((await read()).tracks[1].time < previousTime);
    await page.evaluate(() => window.GamingC010Room.interruptToIdle('browser-test'));
    await idle();
    assert.equal((await read()).status, 'interrupted');
    assert.equal((await read()).frames.at(-1).foam, 0);
    report.checks.repeatedAndInterrupted = true;

    for (const gift of ['water', 'fan']) {
      await page.locator(`[data-c010-gift="${gift}"]`).click();
      await page.waitForFunction(() => window.GamingC010Room.adapter.generated?.elapsed > 0.5);
      assert.equal(await page.evaluate(() => Boolean(window.GamingC010Room.adapter.generated.authored)), false);
      assert.ok(await page.evaluate(() => window.GamingC010Room.adapter._ikDebug));
      await idle();
      assert.equal((await read()).status, 'completed');
      report.checks[gift] = true;
    }
    await foamButton.click();
    await page.waitForFunction(time => window.GamingC010Room.adapter.generated?.entry?.trackTime >= time, timing.contactEarly);
    await page.evaluate(() => window.GamingC010Room.resetToIdle());
    await idle();
    assert.equal((await read()).status, 'idle');
    assert.equal(await foamButton.getAttribute('aria-pressed'), 'false');
    report.checks.resetAfterLegacyActions = true;
    assert.deepEqual(errors, []);
    report.status = 'pass';
  } catch (error) {
    report.status = 'fail'; report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(`${out}/canvas-foam-report.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: report.status, failure: report.failure, errors, out }));
    await browser.close();
  }
})();
