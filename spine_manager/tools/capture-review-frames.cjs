const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.resolve(__dirname, '../../src/spine-audit/c010/tooling/node_modules/playwright-core'));

const evidenceRoot = path.resolve(__dirname, '../evidence/c010');
const modelManifestPath = path.resolve(__dirname, '../configs/c010-model-manifest.json');
const sourceManifestPath = path.resolve(__dirname, '../source/nikke_4.3.26/source-manifest.json');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 900 }, deviceScaleFactor: 1 });
  const browserConsole = [];
  page.on('console', (message) => browserConsole.push({ type: message.type(), text: message.text(), location: message.location() }));
  page.on('pageerror', (error) => browserConsole.push({ type: 'pageerror', text: error?.stack || error?.message || String(error) }));
  await page.goto('http://127.0.0.1:4173/spine/c010/?debug=0', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForFunction(() => Boolean(window.RoomwaveSpineC010?.loaded), null, { timeout: 12000 });
  const frames = [];
  async function capture(name, action, waitMs) {
    if (waitMs) await page.waitForTimeout(waitMs);
    const file = path.join(evidenceRoot, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    frames.push({ name, action, file: path.relative(path.resolve(__dirname, '..'), file).replaceAll('\\', '/') });
  }
  async function waitForPhase(type, phase) {
    await page.waitForFunction(({ expectedType, expectedPhase }) => {
      const adapter = window.RoomwaveSpineC010;
      const sample = adapter?.trace?.[adapter.trace.length - 1];
      return sample?.type === expectedType && sample?.phase === expectedPhase;
    }, { expectedType: type, expectedPhase: phase }, { timeout: 12000 });
  }
  await capture('idle-clean', null, 250);
  await page.locator('#foamButton').click();
  await waitForPhase('foam_wipe', 'notice');
  await capture('foam-notice-clean', 'foam_wipe');
  await waitForPhase('foam_wipe', 'contact');
  await capture('foam-contact-clean', 'foam_wipe');
  await page.locator('#waterButton').click();
  await waitForPhase('water_splash', 'contact');
  await capture('water-contact-clean', 'water_splash');
  await page.goto('http://127.0.0.1:4173/spine/c010/?debug=1', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForFunction(() => Boolean(window.RoomwaveSpineC010?.loaded), null, { timeout: 12000 });
  await capture('idle-debug', null, 250);
  await page.locator('#foamButton').click();
  await waitForPhase('foam_wipe', 'contact');
  await capture('foam-contact-debug', 'foam_wipe');
  await page.locator('#waterButton').click();
  await waitForPhase('water_splash', 'contact');
  await capture('water-contact-debug', 'water_splash');
  const trace = await page.evaluate(() => window.RoomwaveSpineC010.captureTrace());

  // The audit page proves the model in isolation. The product room gets its
  // own clean/debug frames so the same evidence packet also proves the actual
  // Gaming integration and its five public interactions.
  await page.goto('http://127.0.0.1:4173/solo/?room=gaming_c010', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForFunction(() => Boolean(window.GamingC010Room?.loaded) && document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden, null, { timeout: 12000 });
  const productFrames = [];
  const productActionTraces = {};
  async function captureProduct(name, action, waitMs = 250) {
    if (waitMs) await page.waitForTimeout(waitMs);
    // Keep the pointer away from the gift dock so hover styling cannot be
    // mistaken for a lingering active effect in review frames.
    await page.mouse.move(8, 8);
    const file = path.join(evidenceRoot, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    productFrames.push({ name, action, room: 'gaming-c010', file: path.relative(path.resolve(__dirname, '..'), file).replaceAll('\\', '/') });
  }
  async function waitForProductPhase(type, phase, timeout = 12000) {
    await page.waitForFunction(({ expectedType, expectedPhase }) => {
      const trace = window.GamingC010Room?.trace || [];
      return trace.some((sample) => sample?.type === expectedType && sample?.phase === expectedPhase);
    }, { expectedType: type, expectedPhase: phase }, { timeout });
  }
  async function resetProduct() {
    await page.evaluate(() => window.GamingC010Room?.resetToIdle?.());
    await page.waitForTimeout(120);
  }
  async function captureProductReaction({ gift, type, phase, frameName, traceName = type, waitMs = 250 }) {
    await resetProduct();
    await page.locator(`[data-c010-gift="${gift}"]`).click();
    await waitForProductPhase(type, phase);
    await captureProduct(frameName, type, waitMs);
    productActionTraces[traceName] = await page.evaluate((expectedType) => (window.GamingC010Room?.trace || []).filter((frame) => frame?.type === expectedType), type);
  }
  async function captureProductReactionWithRelease({ gift, type, frameName }) {
    await resetProduct();
    await page.locator(`[data-c010-gift="${gift}"]`).click();
    await waitForProductPhase(type, 'reach');
    await captureProduct(frameName, type, 0);
    await waitForProductPhase(type, 'recover');
    await captureProduct(`${frameName.replace('-clean', '')}-release-clean`, `${type}_release`, 0);
    productActionTraces[type] = await page.evaluate((expectedType) => (window.GamingC010Room?.trace || []).filter((frame) => frame?.type === expectedType), type);
  }
  await captureProduct('gaming-c010-idle-clean', null);
  await page.setViewportSize({ width: 420, height: 760 });
  await resetProduct();
  await captureProduct('gaming-c010-narrow-idle-clean', 'narrow_idle', 120);
  await page.locator('[data-c010-gift="water"]').click();
  await waitForProductPhase('water_splash', 'contact');
  await captureProduct('gaming-c010-narrow-water-contact-clean', 'narrow_water_splash', 0);
  await waitForProductPhase('water_splash', 'recover');
  await captureProduct('gaming-c010-narrow-water-release-clean', 'narrow_water_splash_release', 0);
  await resetProduct();
  await captureProduct('gaming-c010-narrow-water-idle-clean', 'narrow_idle_after_water', 120);
  await resetProduct();
  await page.setViewportSize({ width: 960, height: 900 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.locator('[data-c010-gift="fan"]').click();
  await waitForProductPhase('fan_hold', 'reach');
  await captureProduct('gaming-c010-lowfps-fan-reach-clean', 'lowfps_fan_hold', 0);
  await waitForProductPhase('fan_hold', 'recover', 30000);
  await captureProduct('gaming-c010-lowfps-fan-release-clean', 'lowfps_fan_hold_release', 0);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await resetProduct();
  await captureProduct('gaming-c010-lowfps-fan-idle-clean', 'lowfps_idle_after_fan', 120);
  await resetProduct();
  await captureProductReactionWithRelease({ gift: 'star', type: 'delight', frameName: 'gaming-c010-star-reaction-clean' });
  await captureProductReactionWithRelease({ gift: 'banana', type: 'banana', frameName: 'gaming-c010-banana-reaction-clean' });
  await captureProductReactionWithRelease({ gift: 'fan', type: 'fan_hold', frameName: 'gaming-c010-fan-hold-clean' });
  await resetProduct();
  await page.locator('[data-c010-gift="foam"]').click();
  await waitForProductPhase('foam_wipe', 'notice');
  await captureProduct('gaming-c010-foam-notice-clean', 'foam_wipe');
  await waitForProductPhase('foam_wipe', 'contact');
  await captureProduct('gaming-c010-foam-contact-clean', 'foam_wipe');
  await waitForProductPhase('foam_wipe', 'recover');
  await captureProduct('gaming-c010-foam-release-clean', 'foam_wipe_release', 0);
  productActionTraces.foam_wipe = await page.evaluate(() => (window.GamingC010Room?.trace || []).filter((frame) => frame?.type === 'foam_wipe'));
  await resetProduct();
  await page.locator('[data-c010-gift="water"]').click();
  await waitForProductPhase('water_splash', 'contact');
  await captureProduct('gaming-c010-water-contact-clean', 'water_splash', 0);
  productActionTraces.water_splash = await page.evaluate(() => (window.GamingC010Room?.trace || []).filter((frame) => frame?.type === 'water_splash'));
  await resetProduct();
  const interruptSequenceId = `interrupt-${Date.now()}`;
  const interruptStartedAt = Date.now();
  const interruptEvents = [];
  await page.locator('[data-c010-gift="foam"]').click();
  interruptEvents.push({ action: 'foam_wipe', atMs: Date.now() - interruptStartedAt });
  await waitForProductPhase('foam_wipe', 'notice');
  await page.waitForTimeout(140);
  await page.locator('[data-c010-gift="water"]').click();
  interruptEvents.push({ action: 'water_splash', atMs: Date.now() - interruptStartedAt });
  await waitForProductPhase('water_splash', 'notice');
  await captureProduct('gaming-c010-interrupt-water-clean', 'interrupt_to_water', 120);
  const interruptTrace = await page.evaluate((sequenceId) => (window.GamingC010Room?.trace || []).map((frame) => ({ ...frame, sequenceId, sourceElapsedReset: frame.t })), interruptSequenceId);
  await page.evaluate(() => window.GamingC010Room?.resetToIdle?.());
  interruptEvents.push({ action: 'idle', atMs: Date.now() - interruptStartedAt });
  await page.waitForTimeout(120);
  const recoveredTrace = await page.evaluate((sequenceId) => (window.GamingC010Room?.trace || []).map((frame) => ({ ...frame, sequenceId, recovery: true })), interruptSequenceId);
  await captureProduct('gaming-c010-recovered-idle-clean', 'interrupt_to_idle', 0);
  await page.locator('.gaming-c010-debug').click();
  await page.locator('[data-c010-gift="water"]').click();
  await waitForProductPhase('water_splash', 'contact');
  await captureProduct('gaming-c010-water-contact-debug', 'water_splash', 0);
  const productTrace = await page.evaluate(() => ({ model: 'c010_00', room: 'gaming-c010', frames: window.GamingC010Room?.trace || [] }));
  const provisionalReview = path.join(evidenceRoot, 'codex-vision-review.json');
  const modelManifest = fs.existsSync(modelManifestPath) ? JSON.parse(fs.readFileSync(modelManifestPath, 'utf8')) : null;
  const sourceManifest = fs.existsSync(sourceManifestPath) ? JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8')) : null;
  const sourceProject = modelManifest?.sourceProject || (sourceManifest?.targetProject ? {
    file: sourceManifest.targetProject,
    editorVersion: sourceManifest.targetEditorVersion,
    sha256: sourceManifest.targetProjectSha256,
    bytes: sourceManifest.targetProjectBytes,
  } : sourceManifest?.sourceProject || null);
  const manifest = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    model: 'c010_00',
    sourceProject,
    editorVersion: sourceProject?.editorVersion || null,
    sourceUrl: page.url(),
    frames,
    trace,
    productRoom: {
      route: '/solo/?room=gaming_c010',
      frames: productFrames,
      trace: productTrace,
      actionTraces: productActionTraces,
      interruptRecovery: { sequenceId: interruptSequenceId, events: interruptEvents, trace: interruptTrace, recoveredTrace, expected: ['foam_wipe', 'water_splash', 'idle'], clock: 'monotonic wall-clock events plus per-action elapsed time' },
      runtimeVariants: { narrowViewport: { width: 420, height: 760 }, lowFpsCpuThrottleRate: 4 },
      actionCount: 5,
      compatibilityAlias: '/solo/?spine=c010'
    },
    reviewStatus: 'awaiting-independent-multimodal-review',
    reviewProtocol: { cleanFrames: true, debugFrames: true, separateVisualAndControlRead: true },
    reviewArtifacts: {
      provisionalMultimodal: fs.existsSync(provisionalReview) ? 'evidence/c010/codex-vision-review.json' : null,
      independentRequired: true
    }
  };
  fs.writeFileSync(path.join(evidenceRoot, 'review-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(evidenceRoot, 'browser-console.jsonl'), `${browserConsole.map((entry) => JSON.stringify(entry)).join('\n')}${browserConsole.length ? '\n' : ''}`);
  await browser.close();
  console.log(JSON.stringify({ status: 'pass', manifest: path.join(evidenceRoot, 'review-manifest.json'), frames: frames.map((frame) => frame.file) }, null, 2));
})().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });

