const { chromium } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const JSZip = require('jszip');
const foamReviewTiming = require('./foam-review-timing.cjs');
const foamPalmLineage = require('./foam-review-anchor.cjs');

const out = process.env.ROOMWAVE_AIRI_EVIDENCE_DIR || path.join(os.tmpdir(), 'roomwave-foam-wipe-qa');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1120 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const zipBytes = fs.readFileSync(process.env.ROOMWAVE_C010_ZIP || path.join(__dirname, '../public/c010.zip'));
  const zip = await JSZip.loadAsync(zipBytes);
  const skeletonFile = Object.keys(zip.files).find(name => name.endsWith('.json'));
  const skeletonBytes = await zip.file(skeletonFile).async('nodebuffer');
  const skeleton = JSON.parse(skeletonBytes.toString('utf8'));
  const timing = foamReviewTiming(skeleton);
  const anchorLineage = foamPalmLineage(skeleton, process.env.ROOMWAVE_EXPECT_FOAM_PALM_ANCESTOR);
  const report = { assetSha256: createHash('sha256').update(zipBytes).digest('hex'),
    skeletonSha256: createHash('sha256').update(skeletonBytes).digest('hex'), timing, anchorLineage, errors, samples: [], checks: {} };
  if (process.env.ROOMWAVE_C010_ZIP) await page.route('**/c010.zip', route => route.fulfill({ contentType: 'application/zip', body: zipBytes }));
  const snapshot = () => page.evaluate(() => window.roomwaveStage.snapshot());
  const wipe = () => page.getByRole('button', { name: '擦掉泡沫', exact: true }).click();
  const reached = time => page.waitForFunction(time => {
    const track = window.roomwaveStage.snapshot().tracks[1];
    return track?.animation === 'foam_wipe' && track.time >= time;
  }, time);
  const idle = () => page.waitForFunction(() => {
    const s = window.roomwaveStage.snapshot();
    return s.tracks[0]?.animation === 'idle' && !s.tracks[1] && !s.tracks[2] && !s.speaking && s.foam.amount === 0;
  });
  try {
    await page.goto('http://127.0.0.1:5180/');
    await page.waitForFunction(() => window.roomwaveStage?.snapshot().ready);
    assert.match(await page.title(), /AIRI c010/);
    assert.equal(await page.locator('vite-error-overlay').count(), 0);
    assert.equal((await snapshot()).actionReady, true, (await snapshot()).actionIssue);
    await page.screenshot({ path: `${out}/idle.png`, fullPage: true });

    await wipe();
    for (const [phase, time] of Object.entries({ beforeContact: timing.beforeContact, contactEarly: timing.contactEarly,
      contactLate: timing.contactLate, afterClear: timing.afterClear })) {
      await reached(time);
      const state = await snapshot();
      report.samples.push({ phase, requestedTime: time, time: state.tracks[1].time, foam: state.foam });
      await page.locator('.stage').screenshot({ path: `${out}/foam-${phase}.png` });
    }
    await idle();
    const complete = await snapshot();
    const authoredEvents = complete.trace.filter(item => /^Foam(Notice|Contact|Cleared|Complete)@/.test(item.event));
    assert.deepEqual(authoredEvents.map(item => item.event.split('@')[0]), ['FoamNotice', 'FoamContact', 'FoamCleared', 'FoamComplete']);
    assert.ok(report.samples[0].foam.amount > 0);
    assert.ok(report.samples[2].foam.amount > report.samples[3].foam.amount);
    assert.equal(report.samples[3].foam.amount, 0);
    report.events = authoredEvents;
    report.checks.completedToIdle = true;
    await page.locator('.stage').screenshot({ path: `${out}/completed-idle.png` });
    await wipe(); await reached(timing.contactEarly);
    const previousTime = (await snapshot()).tracks[1].time;
    await wipe();
    assert.ok((await snapshot()).tracks[1].time < previousTime);
    await idle();
    report.checks.repeatReplacesPrevious = true;

    await wipe(); await reached(timing.contactEarly);
    await page.getByRole('button', { name: '开心', exact: true }).click();
    await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.animation === 'delight' && window.roomwaveStage.snapshot().foam.amount === 0);
    await idle();
    report.checks.emotionReplacesAction = true;

    await wipe(); await reached(timing.contactEarly);
    await page.getByRole('button', { name: '中断并回待机', exact: true }).click();
    assert.equal((await snapshot()).foam.amount, 0);
    await idle();
    report.checks.interruptedToIdle = true;

    await page.getByRole('button', { name: '开启本机脚本演练', exact: true }).click();
    await wipe(); await reached(timing.contactEarly);
    await page.getByLabel('发送文字').fill('中断擦脸，开始新的回答');
    await page.getByRole('button', { name: '发送', exact: true }).click();
    await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.animation === 'think');
    assert.equal((await snapshot()).foam.amount, 0);
    await page.getByRole('button', { name: '中断并回待机', exact: true }).click();
    await idle();
    report.checks.newTurnReplacesAction = true;

    await wipe(); await reached(timing.contactEarly);
    await page.getByRole('button', { name: '暂停互动', exact: true }).click();
    await idle();
    assert.equal(await page.getByRole('button', { name: '擦掉泡沫', exact: true }).isEnabled(), false);
    await page.getByRole('button', { name: '恢复互动', exact: true }).click();
    await wipe(); await idle();
    report.checks.pauseResume = true;

    await page.getByRole('button', { name: '播放测试语音', exact: true }).click();
    await page.waitForFunction(() => window.roomwaveStage.snapshot().speaking);
    await wipe(); await reached(timing.beforeContact);
    assert.equal((await snapshot()).speaking, false);
    await idle();
    report.checks.actionStopsPreviousSpeech = true;

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.querySelector('.stage canvas').width < 390);
    await wipe(); await reached(timing.contactEarly);
    const mobile = await snapshot();
    assert.ok(mobile.foam.face.x > 0 && mobile.foam.face.x < 390);
    assert.ok(mobile.foam.hand.x > 0 && mobile.foam.hand.x < 390);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `${out}/mobile-contact.png`, fullPage: true });
    await idle();
    report.checks.mobile = mobile.foam;

    delete skeleton.animations.foam_wipe;
    zip.file(skeletonFile, JSON.stringify(skeleton));
    const missingAction = await zip.generateAsync({ type: 'nodebuffer' });
    await page.unroute('**/c010.zip');
    await page.route('**/c010.zip', route => route.fulfill({ contentType: 'application/zip', body: missingAction }));
    await page.reload();
    await page.waitForFunction(() => window.roomwaveStage?.snapshot().ready);
    assert.equal((await snapshot()).actionReady, false);
    assert.match((await snapshot()).actionIssue, /缺少动画 foam_wipe/);
    assert.equal(await page.getByRole('button', { name: '擦掉泡沫', exact: true }).isEnabled(), false);
    assert.equal(await page.getByRole('button', { name: '开心', exact: true }).isEnabled(), true);
    report.checks.missingActionExplicit = true;
    assert.equal(errors.length, 0);
    report.status = 'pass';
  }
  catch (error) {
    report.status = 'fail'; report.failure = error.stack;
    report.stage = await snapshot();
    process.exitCode = 1;
  }
  finally {
    fs.writeFileSync(`${out}/foam-wipe-report.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: report.status, errors, failure: report.failure, report: `${out}/foam-wipe-report.json` }));
    await browser.close();
  }
})();
