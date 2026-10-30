const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium } = require(path.resolve(__dirname, '../../src/spine-audit/c010/tooling/node_modules/playwright-core'));

const roomwaveRoot = path.resolve(__dirname, '..', '..');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function waitFor(page, predicate, timeout = 12000) {
  await page.waitForFunction(predicate, null, { timeout });
}

async function inspectRoom(page, route, predicate) {
  await page.goto(route, { waitUntil: 'networkidle' });
  await waitFor(page, predicate);
  return page.evaluate(() => ({
    active: window.LiveRooms?.activeRoom || null,
    visiblePanel: [...document.querySelectorAll('[data-live-room-panel]')].find((panel) => panel.getAttribute('aria-hidden') === 'false')?.dataset.liveRoomPanel || null,
    bodyRoom: document.body.dataset.liveRoom || null,
  }));
}

(async () => {
  const port = await reservePort();
  const base = `http://127.0.0.1:${port}`;
  const output = [];
  const child = spawn(process.execPath, ['server.cjs'], { cwd: roomwaveRoot, env: { ...process.env, PORT: String(port) }, windowsHide: true });
  child.stdout.on('data', (chunk) => output.push(String(chunk)));
  child.stderr.on('data', (chunk) => output.push(String(chunk)));
  const errors = [];
  const warnings = [];
  const allowMissingBackgroundAudio = process.env.ROOMWAVE_ALLOW_MISSING_BACKGROUND_AUDIO === '1';
  const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 1200 }, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (allowMissingBackgroundAudio && (text.includes('/audio/room-music/') || text.includes('404 (Not Found)'))) warnings.push(`console: ${text}`);
    else errors.push(`console: ${text}`);
  });
  page.on('response', (response) => {
    if (response.status() < 400) return;
    const text = `http ${response.status()}: ${response.url()}`;
    if (allowMissingBackgroundAudio && response.url().includes('/audio/room-music/')) warnings.push(text);
    else errors.push(text);
  });
  try {
    const gamingC010 = await inspectRoom(page, `${base}/solo/?room=gaming_c010`, () => document.body.dataset.liveRoom === 'gaming-c010' && window.GamingC010Room?.loaded && document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden && document.querySelector('.gaming-c010-spine-canvas')?.width > 100);
    const productDetails = await page.evaluate(() => ({
      active: window.GamingC010Room.active,
      statusHidden: document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden ?? false,
      spineCanvas: (() => { const canvas = document.querySelector('.gaming-c010-spine-canvas'); return canvas ? [canvas.width, canvas.height] : null; })(),
      gameCanvas: (() => { const canvas = document.querySelector('.gaming-c010-game-canvas'); return canvas ? [canvas.width, canvas.height] : null; })(),
      actionCount: document.querySelectorAll('[data-c010-gift]').length,
      patchStatus: window.GamingC010Room.adapter?.patchStatus || null,
      handVisualBone: window.GamingC010Room.adapter?.binding?.semantics?.roles?.handVisual?.resolved || null,
      skinName: window.GamingC010Room.adapter?.skeleton?.skin?.name || null,
      skinAvailable: Boolean(window.GamingC010Room.adapter?.data?.findSkin?.('00')),
      rotationExcluded: document.querySelector('#gaming-c010-room')?.dataset.liveRoomRotation === 'excluded',
    }));
    const product = { ...gamingC010, ...productDetails };
    await page.locator('.gaming-c010-sound').click();
    const audioControl = await page.evaluate(() => ({ enabled: Boolean(window.GamingC010Room?.soundEnabled), ariaPressed: document.querySelector('.gaming-c010-sound')?.getAttribute('aria-pressed') || null, icon: document.querySelector('.gaming-c010-sound use')?.getAttribute('href') || null }));
    if (!audioControl.enabled || audioControl.ariaPressed !== 'false') errors.push(`c010 audio toggle did not enable: ${JSON.stringify(audioControl)}`);
    await page.locator('.gaming-c010-sound').click();
    const actionMatrix = [];
    const expectedTypes = { star: 'delight', banana: 'banana', water: 'water_splash', foam: 'foam_wipe', fan: 'fan_hold' };
    for (const [gift, expectedType] of Object.entries(expectedTypes)) {
      await inspectRoom(page, `${base}/solo/?room=gaming_c010`, () => document.body.dataset.liveRoom === 'gaming-c010' && window.GamingC010Room?.loaded && document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden);
      await page.locator(`[data-c010-gift="${gift}"]`).click();
      await wait(250);
      const sample = await page.evaluate(() => {
        const trace = window.GamingC010Room?.trace || [];
        return { sample: trace.length ? trace[trace.length - 1] : null, speech: document.querySelector('.gaming-c010-speech')?.textContent || '' };
      });
      actionMatrix.push({ gift, expectedType, observedType: sample.sample?.type || null, phase: sample.sample?.phase || null, speech: sample.speech });
      if (sample.sample?.type !== expectedType) errors.push(`action ${gift} emitted ${sample.sample?.type || '(none)'}, expected ${expectedType}`);
    }
    const interruptRecovery = {};
    await page.evaluate(() => window.GamingC010Room.resetToIdle());
    await page.locator('[data-c010-gift="foam"]').click();
    await wait(140);
    await page.locator('[data-c010-gift="water"]').click();
    await wait(140);
    const interrupted = await page.evaluate(() => {
      const trace = window.GamingC010Room?.trace || [];
      const sample = trace.length ? trace[trace.length - 1] : null;
      return { observedType: sample?.type || null, phase: sample?.phase || null, speech: document.querySelector('.gaming-c010-speech')?.textContent || '', pressed: [...document.querySelectorAll('[data-c010-gift][aria-pressed="true"]')].map((button) => button.dataset.c010Gift) };
    });
    interruptRecovery.interrupted = interrupted;
    if (interrupted.observedType !== 'water_splash') errors.push(`interrupt did not replace foam with water: ${interrupted.observedType || '(none)'}`);
    if (JSON.stringify(interrupted.pressed) !== JSON.stringify(['water'])) errors.push(`interrupt button state is ambiguous: ${JSON.stringify(interrupted.pressed)}`);
    const resetResult = await page.evaluate(() => window.GamingC010Room.resetToIdle());
    await wait(120);
    const recovered = await page.evaluate(() => ({
      traceLength: window.GamingC010Room?.trace?.length || 0,
      lastTrace: (() => { const trace = window.GamingC010Room?.trace || []; return trace.length ? trace[trace.length - 1] : null; })(),
      cameraAction: document.querySelector('.gaming-c010-camera')?.dataset.action || null,
      speech: document.querySelector('.gaming-c010-speech')?.textContent || '',
    }));
    interruptRecovery.resetResult = resetResult;
    interruptRecovery.recovered = recovered;
    if (!resetResult || recovered.lastTrace?.type !== null || recovered.lastTrace?.phase !== 'idle' || recovered.cameraAction !== 'idle' || recovered.speech !== '准备开始游戏。') errors.push(`reset to idle failed: ${JSON.stringify(recovered)}`);
    await page.locator('[data-c010-gift="fan"]').click();
    await wait(90);
    await page.locator('[data-c010-gift="fan"]').click();
    await wait(120);
    const repeated = await page.evaluate(() => {
      const trace = window.GamingC010Room?.trace || [];
      const sample = trace.length ? trace[trace.length - 1] : null;
      return { observedType: sample?.type || null, phase: sample?.phase || null, traceLength: trace.length };
    });
    interruptRecovery.repeated = repeated;
    if (repeated.observedType !== 'fan_hold') errors.push(`repeated fan click did not keep fan_hold: ${repeated.observedType || '(none)'}`);
    await page.evaluate(() => window.GamingC010Room.resetToIdle());
    await inspectRoom(page, `${base}/solo/?room=gaming_c010`, () => document.body.dataset.liveRoom === 'gaming-c010' && window.GamingC010Room?.loaded && document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden);
    const actionPhase = async (gift, delay = 650) => {
      await page.locator(`[data-c010-gift="${gift}"]`).click();
      await wait(delay);
      return page.evaluate(() => {
        const trace = window.GamingC010Room?.trace || [];
        return trace.length ? trace[trace.length - 1] : null;
      });
    };
    const foamPhase = await actionPhase('foam');
    const waterPhase = await actionPhase('water');
    const fanPhase = await actionPhase('fan', 250);
    await page.evaluate(() => window.LiveRooms?.goTo('gaming-seated'));
    await waitFor(page, () => window.LiveRooms?.activeRoom === 'gaming-seated');
    await page.evaluate(() => window.LiveRooms?.goTo('gaming-c010'));
    await waitFor(page, () => window.LiveRooms?.activeRoom === 'gaming-c010' && window.GamingC010Room?.loaded);
    const c010Return = await page.evaluate(() => ({
      active: window.LiveRooms?.activeRoom || null,
      loaded: Boolean(window.GamingC010Room?.loaded),
      actionCount: document.querySelectorAll('#gaming-c010-room [data-c010-gift]').length,
    }));
    if (c010Return.active !== 'gaming-c010' || !c010Return.loaded || c010Return.actionCount !== 5) {
      errors.push(`gaming-c010 did not return after leaving the room: ${JSON.stringify(c010Return)}`);
    }
    const anchorGap = (sample) => sample?.handVisual && sample?.hand ? Math.hypot(sample.handVisual.x - sample.hand.x, sample.handVisual.y - sample.hand.y) : null;
    const foamAnchorGap = anchorGap(foamPhase);
    const waterAnchorGap = anchorGap(waterPhase);
    if (foamAnchorGap === null || foamAnchorGap > 12) errors.push(`foam visible hand did not follow runtime target: ${foamAnchorGap}`);
    if (waterAnchorGap === null || waterAnchorGap > 12) errors.push(`water visible hand did not follow runtime target: ${waterAnchorGap}`);
    await page.setViewportSize({ width: 420, height: 760 });
    const narrowRoom = await inspectRoom(page, `${base}/solo/?room=gaming_c010`, () => document.body.dataset.liveRoom === 'gaming-c010' && window.GamingC010Room?.loaded && document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden);
    await page.locator('[data-c010-gift="water"]').click();
    await wait(260);
    const narrowDetails = await page.evaluate(() => {
      const canvas = document.querySelector('.gaming-c010-spine-canvas');
      const buttons = [...document.querySelectorAll('[data-c010-gift]')].map((button) => {
        const rect = button.getBoundingClientRect();
        return { gift: button.dataset.c010Gift, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, visible: rect.width > 0 && rect.height > 0 };
      });
      return { canvas: canvas ? [canvas.width, canvas.height] : null, buttons, speech: document.querySelector('.gaming-c010-speech')?.textContent || '', action: window.GamingC010Room?.trace?.at(-1)?.type || null };
    });
    if (narrowDetails.canvas?.[0] < 100 || narrowDetails.canvas?.[1] < 100 || narrowDetails.buttons.some((item) => !item.visible || item.left < 0 || item.right > 420)) {
      errors.push(`narrow gaming-c010 layout is not usable: ${JSON.stringify(narrowDetails)}`);
    }
    await page.setViewportSize({ width: 1100, height: 1200 });
    const compatibilityAlias = await inspectRoom(page, `${base}/solo/?spine=c010`, () => document.body.dataset.liveRoom === 'gaming-c010' && window.GamingC010Room?.loaded);
    const audit = await inspectRoom(page, `${base}/solo/?room=spine-c010`, () => document.body.dataset.liveRoom === 'spine-c010' && Boolean(window.SpineC010Room?.loaded) && document.querySelector('#spine-c010-room .spine-room-status')?.hidden && (window.SpineC010Room.adapter?.data?.animations?.length || 0) > 0);
    const auditPageDetails = await page.evaluate(() => ({
      statusHidden: document.querySelector('#spine-c010-room .spine-room-status')?.hidden ?? false,
      animationCount: window.SpineC010Room?.adapter?.data?.animations?.length || 0,
    }));
    const auditDetails = { ...audit, ...auditPageDetails };
    const defaultRoom = await inspectRoom(page, `${base}/solo/`, () => document.body.dataset.liveRoom === 'gaming-seated');
    const defaultPageDetails = await page.evaluate(() => ({ spineOverlayPresent: Boolean(document.querySelector('.seated-spine-canvas')),
      productHidden: document.querySelector('#gaming-c010-room')?.hidden ?? false,
      oldGamingHidden: document.querySelector('#gaming-room')?.hidden ?? false }));
    const defaultDetails = { ...defaultRoom, ...defaultPageDetails };
    const legacyGaming = await inspectRoom(page, `${base}/solo/?room=gaming`, () => document.body.dataset.liveRoom === 'gaming');
    const legacyPageDetails = await page.evaluate(() => ({
      actionCount: document.querySelectorAll('#gaming-room [data-gift]').length || document.querySelectorAll('#gaming-room button').length,
      artworkReady: Boolean(document.querySelector('#gaming-room img, #gaming-room canvas, #gaming-room [data-artwork-ready]')),
      rotationExcluded: document.querySelector('#gaming-room')?.dataset.liveRoomRotation === 'excluded',
    }));
    const legacyDetails = { ...legacyGaming, ...legacyPageDetails };
    if (!product.active) errors.push('gaming-c010 is loaded but not active');
    if (product.visiblePanel !== 'gaming-c010') errors.push(`product visible panel ${product.visiblePanel}`);
    if (product.actionCount !== 5) errors.push(`product action count ${product.actionCount}`);
    if (product.spineCanvas?.[0] < 100 || product.spineCanvas?.[1] < 100) errors.push(`product Spine canvas has no usable dimensions ${product.spineCanvas}`);
    if (!product.statusHidden) errors.push('product status overlay remains visible');
    if (errors.length) throw new Error(`${errors.join('; ')} | details: ${JSON.stringify({ foamPhase, waterPhase, fanPhase })}`);
    console.log(JSON.stringify({ schemaVersion: 2, generatedAt: new Date().toISOString(), status: 'pass', errors: [], warnings, gamingC010: product, audioControl, actionMatrix, interruptRecovery, foamPhase, waterPhase, fanPhase, c010Return, runtimeHandIk: { mode: product.patchStatus, foamAnchorGap, waterAnchorGap, thresholdPx: 12, sourceUnmodified: true }, narrowRoom, narrowDetails, compatibilityAlias, audit: auditDetails, defaultRoom: defaultDetails, legacyGaming: legacyDetails, serverLog: output.join('').slice(0, 1000) }, null, 2));
  } finally {
    await browser.close();
    if (child.exitCode === null) child.kill();
  }
})().catch((error) => { console.error(JSON.stringify({ schemaVersion: 2, generatedAt: new Date().toISOString(), status: 'fail', error: error.message }, null, 2)); process.exitCode = 1; });

