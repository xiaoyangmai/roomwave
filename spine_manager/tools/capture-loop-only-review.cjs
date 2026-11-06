const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright-core');

const roomwaveRoot = path.resolve(__dirname, '..', '..');
const evidenceRoot = path.join(roomwaveRoot, 'spine_manager', 'evidence', 'c010-loop-only-review');
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

async function main() {
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const port = await reservePort();
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['roomwave/backend/server.cjs'], {
    cwd: roomwaveRoot,
    env: { ...process.env, PORT: String(port) },
    windowsHide: true,
  });
  const serverLog = [];
  server.stdout.on('data', (chunk) => serverLog.push(String(chunk)));
  server.stderr.on('data', (chunk) => serverLog.push(String(chunk)));
  const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-gpu'] });
  const errors = [];
  const variants = [
    { id: 'desktop-dpr1', width: 1100, height: 1200, dpr: 1 },
    { id: 'narrow-dpr1', width: 420, height: 760, dpr: 1 },
    { id: 'desktop-dpr2', width: 1100, height: 1200, dpr: 2 },
  ];
  const captures = [];
  try {
    for (const variant of variants) {
      const context = await browser.newContext({ viewport: { width: variant.width, height: variant.height }, deviceScaleFactor: variant.dpr });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`);
      });
      page.on('response', (response) => {
        if (response.status() < 400 || response.url().includes('/audio/room-music/')) return;
        pageErrors.push(`http ${response.status()}: ${response.url()}`);
      });
      await page.goto(`${base}/solo/?room=gaming_c010`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.body.dataset.liveRoom === 'gaming-c010' && window.GamingC010Room?.loaded && document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden && document.querySelector('.gaming-c010-spine-canvas')?.width > 100, null, { timeout: 15000 });
      await wait(500);
      const details = await page.evaluate(() => {
        const canvas = document.querySelector('.gaming-c010-spine-canvas');
        const shell = document.querySelector('.gaming-c010-shell');
        const pack = window.GamingC010Room?.characterPack;
        const manifest = window.GamingC010Room?.adapter?.manifest;
        return {
          activeRoom: window.LiveRooms?.activeRoom || null,
          loaded: Boolean(window.GamingC010Room?.loaded),
          statusHidden: document.querySelector('#gaming-c010-room .gaming-c010-status')?.hidden ?? false,
          canvas: canvas ? { width: canvas.width, height: canvas.height, cssWidth: canvas.getBoundingClientRect().width, cssHeight: canvas.getBoundingClientRect().height } : null,
          shell: shell ? { width: shell.getBoundingClientRect().width, height: shell.getBoundingClientRect().height } : null,
          pack: pack ? { characterId: pack.characterId, packVersion: pack.packVersion, status: pack.status, sourceRunId: pack.registry?.entry?.sourceRunId || null, releaseStatus: pack.registry?.entry?.releaseStatus || null, tier: pack.capabilities?.tier || null } : null,
          manifestUrls: manifest ? { skeleton: manifest.skeleton, atlas: manifest.atlas, binding: manifest.binding, audit: manifest.audit } : null,
          traceLength: window.GamingC010Room?.trace?.length || 0,
        };
      });
      const screenshot = path.join(evidenceRoot, `${variant.id}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      captures.push({ ...variant, screenshot: path.relative(roomwaveRoot, screenshot).replaceAll(path.sep, '/'), details, errors: pageErrors });
      errors.push(...pageErrors.map((item) => `${variant.id}: ${item}`));
      await context.close();
    }
    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      profile: 'loop-only-product-review',
      status: errors.length ? 'fail' : 'pass',
      route: '/solo/?room=gaming_c010',
      registry: 'resources/config/character-registry.json',
      captures,
      errors,
      sourceUnmodified: true,
      serverLog: serverLog.join('').slice(0, 1200),
    };
    fs.writeFileSync(path.join(evidenceRoot, 'review-manifest.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify(report, null, 2));
    if (errors.length) process.exitCode = 1;
  } finally {
    await browser.close();
    if (server.exitCode === null) server.kill();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ schemaVersion: 1, status: 'fail', error: error.message }, null, 2));
  process.exitCode = 1;
});
