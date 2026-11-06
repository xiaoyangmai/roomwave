const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright-core');
const JSZip = require('jszip');
const foamReviewTiming = require('./foam-review-timing.cjs');
const foamPalmLineage = require('./foam-review-anchor.cjs');

const out = process.env.ROOMWAVE_AIRI_EVIDENCE_DIR || path.join(os.tmpdir(), 'roomwave-foam-recording');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const zipBytes = fs.readFileSync(process.env.ROOMWAVE_C010_ZIP || path.join(__dirname, '../public/c010.zip'));
  const zip = await JSZip.loadAsync(zipBytes);
  const skeletonFile = Object.keys(zip.files).find(name => name.endsWith('.json'));
  const skeletonBytes = await zip.file(skeletonFile).async('nodebuffer');
  const skeletonSha256 = createHash('sha256').update(skeletonBytes).digest('hex');
  const skeleton = JSON.parse(skeletonBytes.toString('utf8'));
  const timing = foamReviewTiming(skeleton);
  const anchorLineage = foamPalmLineage(skeleton, process.env.ROOMWAVE_EXPECT_FOAM_PALM_ANCESTOR);
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1120 },
    recordVideo: { dir: path.join(out, 'raw'), size: { width: 1280, height: 1120 } } });
  const page = await context.newPage();
  if (process.env.ROOMWAVE_C010_ZIP) await page.route('**/c010.zip', route => route.fulfill({ contentType: 'application/zip', body: zipBytes }));
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const report = { skeletonSha256, timing, anchorLineage, errors };
  try {
    await page.goto('http://127.0.0.1:5180/');
    await page.waitForFunction(() => window.roomwaveStage?.snapshot().actionReady);
    await page.waitForTimeout(2000);
    report.stageBounds = await page.locator('.stage').boundingBox();
    // Label the actual track time in the recording; video PTS includes loading/warm-up.
    await page.evaluate(() => {
      const label = document.createElement('div');
      label.style.cssText = 'position:absolute;bottom:8px;left:8px;padding:3px 6px;background:#16212dcc;color:white;font:14px monospace;z-index:10';
      document.querySelector('.stage').append(label);
      window.foamRecordingSamples = [];
      const sample = () => {
        const state = window.roomwaveStage.snapshot();
        const track = state.tracks[1];
        const time = track?.animation === 'foam_wipe' ? track.time : undefined;
        label.textContent = time === undefined ? (track ? 'mix -> idle' : 'idle') : `foam_wipe ${time.toFixed(3)} s`;
        if (time !== undefined) window.foamRecordingSamples.push({ wallTime: performance.now(), time, duration: track.duration, foam: state.foam });
        requestAnimationFrame(sample);
      };
      sample();
    });
    // No screenshots, canvas readback or parallel tests during this single playback.
    await page.getByRole('button', { name: '擦掉泡沫', exact: true }).click();
    await page.waitForFunction(() => !window.roomwaveStage.snapshot().tracks[1]);
    await page.waitForTimeout(500);
    report.trace = await page.evaluate(() => window.roomwaveStage.snapshot().trace);
    report.samples = await page.evaluate(() => window.foamRecordingSamples);
    report.trackDuration = report.samples[0].duration;
    report.maxActionTimeStep = Math.max(...report.samples.slice(1).map((sample, index) => sample.time - report.samples[index].time));
    report.captureEndWallTime = await page.evaluate(() => performance.now());
    const video = page.video();
    await context.close();
    report.video = path.join(out, 'foam-wipe-page.webm');
    await video.saveAs(report.video);
    const probe = JSON.parse(execFileSync(process.env.FFPROBE_PATH || 'ffprobe', ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'format=duration:frame=pts_time', '-of', 'json', report.video], { encoding: 'utf8' }));
    const times = probe.frames.map(frame => Number(frame.pts_time));
    report.duration = Number(probe.format.duration);
    report.frameCount = times.length;
    report.maxFrameGap = Math.max(...times.slice(1).map((time, index) => time - times[index]));
    const actionWallDuration = (report.samples.at(-1).wallTime - report.samples[0].wallTime) / 1000;
    assert.ok(report.samples.length > 1 && report.maxActionTimeStep < 0.1
      && report.samples[0].time <= timing.notice + report.maxActionTimeStep
      && report.samples.at(-1).time >= report.trackDuration - report.maxActionTimeStep,
    'Recording did not sample the complete action.');
    assert.ok(report.duration >= actionWallDuration && report.frameCount > 1 && report.maxFrameGap < 0.1,
      'Recording lost frames.');
    assert.deepEqual(report.trace.filter(item => /^Foam(Notice|Contact|Cleared|Complete)@/.test(item.event))
      .map(item => item.event.split('@')[0]), ['FoamNotice', 'FoamContact', 'FoamCleared', 'FoamComplete']);
    assert.deepEqual(errors, []);
    report.status = 'pass';
  } catch (error) {
    report.status = 'fail'; report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'recording-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: report.status, failure: report.failure, out }));
  }
})();
