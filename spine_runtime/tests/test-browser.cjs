const { chromium } = require('playwright-core');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const JSZip = require('jszip');
const out = process.env.ROOMWAVE_AIRI_EVIDENCE_DIR || path.join(os.tmpdir(), 'roomwave-stage-qa');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1120 } });
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => requests.push(request.url()));
  // Tap the actual local audio gain, without adding a production debug audio output.
  await page.addInitScript(() => {
    const NativeContext = window.AudioContext;
    window.audioContexts = [];
    window.AudioContext = class extends NativeContext {
      constructor(...args) {
        super(...args);
        window.audioContexts.push(this);
        this.meter = this.createAnalyser();
      }
      createGain() { const gain = super.createGain(); gain.connect(this.meter); return gain; }
    };
  });
  const report = { errors, scenarios: {} };
  async function idle() {
    await page.waitForFunction(() => {
      const s = window.roomwaveStage.snapshot();
      return !s.speaking && s.tracks[0]?.animation === 'idle' && !s.tracks[1] && !s.tracks[2];
    });
  }
  async function submit(text) {
    await page.getByLabel('发送文字').fill(text);
    await page.getByRole('button', { name: '发送', exact: true }).click();
  }
  async function scene(id) {
    await page.getByLabel('演练场景', { exact: true }).selectOption(id);
    await page.getByRole('button', { name: '开启本机脚本演练', exact: true }).click();
  }
  try {
    await page.goto('http://127.0.0.1:5180/');
    await page.waitForFunction(() => window.roomwaveStage?.snapshot().ready);
    assert.match(await page.title(), /AIRI c010/);
    assert.equal(await page.locator('vite-error-overlay').count(), 0);
    assert.equal(await page.getByRole('button', { name: '开始推流', exact: true }).count(), 0);
    assert.equal(await page.locator('a[href*="viewer"]').count(), 0);
    assert.equal(await page.evaluate(() => typeof window.MediaMTXWebRTCPublisher), 'undefined');
    report.initial = await page.evaluate(() => window.roomwaveStage.snapshot());
    assert.equal(report.initial.conversation.active, true);
    await submit('尚未配置模型');
    await page.getByRole('alert').filter({ hasText: '尚未接入' }).waitFor();
    await scene('basic');
    await submit('测试逐字与中断');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.animation === 'think');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().conversation.turns[0]?.reply.length > 12);
    await page.getByRole('button', { name: '中断并回待机', exact: true }).click();
    await idle();
    const partial = await page.evaluate(() => window.roomwaveStage.snapshot().conversation.turns[0]);
    assert.equal(partial.status, 'interrupted');
    await submit('中断后的新回答');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().conversation.turns[1]?.status === 'completed');
    assert.deepEqual(await page.evaluate(() => window.roomwaveStage.snapshot().conversation.turns[0]), partial);
    await idle();
    report.textAndInterrupt = 'pass';

    await page.evaluate(() => {
      window.recordingStream = document.querySelector('canvas').captureStream(30);
      window.recorded = [];
      window.recorder = new MediaRecorder(window.recordingStream, { mimeType: 'video/webm;codecs=vp8' });
      window.recorder.ondataavailable = event => window.recorded.push(event.data);
      window.recorder.start();
    });
    for (const id of ['repeat', 'switch', 'finish', 'neutral']) {
      await scene(id);
      await submit(`验证 ${id}`);
      await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.animation === 'delight');
      await page.waitForFunction(() => window.roomwaveStage.snapshot().conversation.turns[0]?.status === 'completed');
      const state = await page.evaluate(() => window.roomwaveStage.snapshot());
      const signals = state.trace.filter(row => row.signal?.turnId === state.conversation.turns[0].id);
      assert.equal(state.conversation.phase, 'idle');
      assert.equal(state.conversation.tts, false);
      assert.equal(state.speaking, false);
      assert.ok(!state.conversation.turns[0].reply.includes('<|'));
      if (id === 'repeat') {
        assert.deepEqual(signals.filter(row => row.signal.name === 'happy').map(row => row.decision), ['apply', 'keep-current', 'keep-current']);
        assert.ok(state.tracks[1].time > 0.65);
      } else if (id === 'switch') {
        assert.equal(state.tracks[1].animation, 'angry');
        await page.waitForFunction(() => {
          const track = window.roomwaveStage.snapshot().tracks[1];
          return track?.animation === 'angry' && track.time > 2.9;
        });
      } else if (id === 'finish') {
        assert.equal(state.tracks[1].animation, 'delight');
        await page.screenshot({ path: `${out}/stage-natural-finish.png`, fullPage: true });
      } else {
        assert.ok(!state.tracks[1]);
        assert.ok(state.conversation.turns[0].reply.endsWith('恢复反应不会中断对话。'));
      }
      await idle();
      report.scenarios[id] = { signals, atTextEnd: state.tracks, returnedToIdle: true };
    }
    await page.getByRole('button', { name: '开心', exact: true }).click();
    await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.time > 0.6);
    const before = await page.evaluate(() => window.roomwaveStage.snapshot().tracks[1].time);
    await page.getByRole('button', { name: '开心', exact: true }).click();
    const after = await page.evaluate(() => window.roomwaveStage.snapshot().tracks[1].time);
    assert.ok(after >= before);
    report.manualRepeat = { before, after };
    await page.getByRole('button', { name: '中断并回待机', exact: true }).click();
    await idle();

    await page.evaluate(async () => {
      const { createRehearsal } = await import('/src/stage/rehearsal.ts');
      const pending = new Promise(resolve => { window.releasePlainReply = resolve; });
      window.roomwaveStage.conversation.configure({ ...createRehearsal('basic'), stream: async (_model, _provider, _messages, options) => {
        await pending;
        await options.onStreamEvent({ type: 'text-delta', text: '这是一段没有情绪标记的普通文字。' });
        await options.onStreamEvent({ type: 'finish' });
      } });
    });
    await submit('先思考，再手动开心');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.animation === 'think');
    await page.getByRole('button', { name: '开心', exact: true }).click();
    await page.evaluate(() => window.releasePlainReply());
    await page.waitForFunction(() => window.roomwaveStage.snapshot().conversation.turns[0]?.status === 'completed');
    assert.equal(await page.evaluate(() => window.roomwaveStage.snapshot().tracks[1].animation), 'delight');
    report.manualSurvivesFirstText = true;
    await scene('switch');
    await submit('即将被替换');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.animation === 'delight');
    await submit('替换上一轮');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().tracks[1]?.animation === 'think');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().conversation.turns[1]?.status === 'completed');
    const replaced = await page.evaluate(() => window.roomwaveStage.snapshot());
    assert.equal(replaced.conversation.turns[0].status, 'interrupted');
    assert.ok(!replaced.trace.some(row => row.signal?.turnId === replaced.conversation.turns[0].id && row.signal.name === 'angry'));
    await idle();
    report.newTurn = replaced.conversation.turns;
    const recording = await page.evaluate(() => new Promise(resolve => {
      window.recorder.onstop = async () => {
        const bytes = new Uint8Array(await new Blob(window.recorded).arrayBuffer());
        let data = ''; for (let i = 0; i < bytes.length; i += 8192) data += String.fromCharCode(...bytes.subarray(i, i + 8192));
        window.recordingStream.getTracks().forEach(track => track.stop());
        resolve(btoa(data));
      }; window.recorder.stop();
    }));
    assert.ok(recording.length > 1000);
    fs.writeFileSync(`${out}/c010-local-behavior.webm`, Buffer.from(recording, 'base64'));

    await scene('basic');
    await submit('生成期间暂停');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().conversation.turns[0]?.reply.length > 12);
    await page.getByRole('button', { name: '暂停互动', exact: true }).click();
    await idle();
    const paused = await page.evaluate(() => window.roomwaveStage.snapshot().conversation);
    assert.equal(paused.active, false);
    assert.equal(paused.turns[0].status, 'interrupted');
    assert.equal(await page.getByRole('button', { name: '发送', exact: true }).isEnabled(), false);
    assert.equal(await page.getByRole('button', { name: '开心', exact: true }).isEnabled(), false);
    await page.waitForTimeout(500);
    assert.deepEqual(await page.evaluate(() => window.roomwaveStage.snapshot().conversation.turns), paused.turns);
    await page.getByRole('button', { name: '恢复互动', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.roomwaveStage.snapshot().conversation.turns), paused.turns);
    await submit('恢复后的新一轮');
    await page.waitForFunction(() => window.roomwaveStage.snapshot().conversation.turns[1]?.status === 'completed');
    await idle();
    report.pauseResume = 'pass: cancel generation, retain partial reply and history, accept next turn';

    await page.getByRole('button', { name: '播放测试语音', exact: true }).click();
    await page.waitForFunction(() => window.roomwaveStage.snapshot().speaking);
    await page.waitForFunction(() => {
      const samples = new Float32Array(1024); window.audioContexts[0].meter.getFloatTimeDomainData(samples);
      return samples.some(value => Math.abs(value) > 0.001);
    });
    report.audioEnergyDetected = true;
    await page.getByRole('button', { name: '开心', exact: true }).click();
    await page.waitForFunction(() => {
      const s = window.roomwaveStage.snapshot(); return s.tracks[1]?.animation === 'delight' && s.tracks[2]?.animation === 'talk_start';
    });
    await page.screenshot({ path: `${out}/stage-speaking.png`, fullPage: true });
    await idle();
    report.audioCompleted = true;
    await page.getByRole('button', { name: '播放测试语音', exact: true }).click();
    await page.waitForFunction(() => window.roomwaveStage.snapshot().speaking);
    await page.getByRole('button', { name: '暂停互动', exact: true }).click();
    await idle();
    await page.waitForFunction(() => {
      const samples = new Float32Array(1024); window.audioContexts[0].meter.getFloatTimeDomainData(samples);
      return samples.every(value => Math.abs(value) < 0.00001);
    });
    assert.equal(await page.evaluate(() => window.roomwaveStage.snapshot().audioContextState), 'running');
    await page.getByRole('button', { name: '恢复互动', exact: true }).click();
    report.audioPaused = true;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.querySelector('canvas').width < 390);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `${out}/stage-mobile.png`, fullPage: true });
    await page.setViewportSize({ width: 1280, height: 1120 });
    await page.waitForFunction(() => document.querySelector('canvas').width > 900);
    await page.screenshot({ path: `${out}/stage-desktop.png`, fullPage: true });
    await page.reload();
    await page.waitForFunction(() => window.roomwaveStage?.snapshot().ready);
    assert.equal(await page.evaluate(() => window.roomwaveStage.snapshot().conversation.turns.length), 0);
    await page.getByRole('button', { name: '播放测试语音', exact: true }).click();
    await page.waitForFunction(() => window.roomwaveStage.snapshot().speaking);
    await page.evaluate(() => document.querySelector('#app').__vue_app__.unmount());
    await page.waitForFunction(() => {
      const s = window.roomwaveStage.snapshot(); return !s.ready && !s.speaking && !s.conversation.active && s.audioContextState === 'closed';
    });
    report.unmounted = await page.evaluate(() => window.roomwaveStage.snapshot());

    const zip = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, '../public/c010.zip')));
    const skeletonFile = Object.keys(zip.files).find(name => name.endsWith('.json'));
    const skeleton = JSON.parse(await zip.file(skeletonFile).async('string'));
    skeleton.animations.delight_extra = skeleton.animations.delight;
    delete skeleton.animations.delight;
    zip.file(skeletonFile, JSON.stringify(skeleton));
    const invalidZip = await zip.generateAsync({ type: 'nodebuffer' });
    await page.route('**/c010.zip', route => route.fulfill({ contentType: 'application/zip', body: invalidZip }));
    await page.reload();
    await page.getByRole('alert').filter({ hasText: '缺少动画 delight' }).waitFor();
    assert.equal(await page.getByRole('button', { name: '恢复互动', exact: true }).isEnabled(), false);
    assert.equal(await page.getByRole('button', { name: '开心', exact: true }).isEnabled(), false);
    report.profileValidation = 'pass';
    report.requestOrigins = [...new Set(requests.filter(url => url.startsWith('http')).map(url => new URL(url).origin))];
    assert.deepEqual(report.requestOrigins, ['http://127.0.0.1:5180']);
    assert.ok(!requests.some(url => url.includes('/api/airi-stage/')));
    assert.equal(errors.length, 0);
    report.status = 'pass';
  } catch (error) {
    report.status = 'fail'; report.failure = error.stack;
    report.stage = await page.evaluate(() => ({ body: document.body.innerText, state: window.roomwaveStage?.snapshot() }));
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(`${out}/stage-report.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: report.status, errors, failure: report.failure, report: `${out}/stage-report.json` }));
    await browser.close();
  }
})();
