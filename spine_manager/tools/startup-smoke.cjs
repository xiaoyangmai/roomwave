const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const net = require('node:net');
const { spawn } = require('node:child_process');

const roomwaveRoot = path.resolve(__dirname, '..', '..');

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

function get(port, route) {
  return new Promise((resolve, reject) => {
    const request = http.get({ host: '127.0.0.1', port, path: route }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    request.setTimeout(2000, () => request.destroy(new Error('request timeout')));
    request.on('error', reject);
  });
}

async function waitForServer(port, child) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < 10000) {
    if (child.exitCode !== null) throw new Error(`Roomwave server exited early with code ${child.exitCode}. ${lastError || ''}`);
    try { return await get(port, '/solo/?spine=c010'); } catch (error) { lastError = error.message; await new Promise((resolve) => setTimeout(resolve, 150)); }
  }
  throw new Error(`Roomwave server did not become ready: ${lastError || 'unknown error'}`);
}

(async () => {
  const port = await reservePort();
  const output = [];
  const child = spawn(process.execPath, ['server.cjs'], { cwd: roomwaveRoot, env: { ...process.env, PORT: String(port) }, windowsHide: true });
  child.stdout.on('data', (chunk) => output.push(String(chunk)));
  child.stderr.on('data', (chunk) => output.push(String(chunk)));
  try {
    const solo = await waitForServer(port, child);
    const soloDefault = await get(port, '/solo/');
    const c010 = await get(port, '/spine/c010/');
    const audit = await get(port, '/spine-audit/c010/');
    const errors = [];
    if (solo.status !== 200) errors.push(`solo status ${solo.status}`);
    if (soloDefault.status !== 200) errors.push(`solo default status ${soloDefault.status}`);
    if (c010.status !== 200) errors.push(`spine c010 status ${c010.status}`);
    if (audit.status !== 200) errors.push(`audit status ${audit.status}`);
    if (!solo.body.includes('Roomwave')) errors.push('solo response does not contain Roomwave marker');
    for (const marker of ['id="spine-c010-room"', 'id="gaming-c010-room"', 'id="gaming-room"', 'gaming-c010-room.js', 'spine-c010-room.js']) {
      if (!solo.body.includes(marker)) errors.push(`solo response missing ${marker}`);
    }
    if (errors.length) throw new Error(errors.join('; '));
    console.log(JSON.stringify({ status: 'pass', port, childPid: child.pid, routes: { soloSpine: solo.status, soloDefault: soloDefault.status, c010: c010.status, audit: audit.status }, roomMarkers: ['spine-c010-room', 'gaming-c010-room', 'gaming-room', 'gaming-c010-room.js', 'spine-c010-room.js'], serverLog: output.join('').slice(0, 1000) }, null, 2));
  } finally {
    if (child.exitCode === null) child.kill();
  }
})().catch((error) => { console.error(JSON.stringify({ status: 'fail', error: error.message }, null, 2)); process.exitCode = 1; });
