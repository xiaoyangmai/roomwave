import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => vite.close());
const { StageConversation } = await vite.ssrLoadModule('/src/stage/conversation.ts');
const provider = { generation: model => ({ protocol: 'chat-completions', config: { model, baseURL: 'https://example.invalid/' } }) };

async function until(predicate) {
  for (let i = 0; i < 200; i++) {
    if (predicate()) return;
    await delay(10);
  }
  assert.fail('Expected conversation transition did not occur');
}

function harness(synthesize, playAudio = async (_audio, _signal, start) => start()) {
  const calls = [];
  const states = [];
  const speaking = [];
  const signals = [];
  const runtime = new StageConversation({ changed: state => states.push(state), perform: signal => {
    signals.push(signal);
    if (signal.type === 'speaking') speaking.push(signal.active);
    else if (signal.type === 'reset') speaking.push(false);
  }, playAudio });
  runtime.configure({ label: 'test fixture', model: 'test', provider, stream: (_model, _provider, conversation, options) => {
    const completion = Promise.withResolvers();
    calls.push({ conversation, options, completion });
    return completion.promise;
  } }, synthesize);
  return { runtime, calls, states, speaking, signals };
}

async function reply(call, text) {
  await call.options.onStreamEvent({ type: 'text-delta', text });
  await call.options.onStreamEvent({ type: 'finish' });
  call.completion.resolve();
}

test('no model is explicit; text-only response uses AIRI history without speaking', async () => {
  const absent = new StageConversation({ changed: () => {}, perform: () => {}, playAudio: async () => assert.fail('no audio expected') });
  await absent.submit('你好');
  assert.match(absent.state.error, /尚未接入/);
  assert.equal(absent.state.turns.length, 0);
  const h = harness();
  const first = h.runtime.submit('第一问');
  await until(() => h.calls.length === 1);
  await reply(h.calls[0], '第一轮回答，可以显示完整文字。');
  await first;
  await until(() => h.runtime.state.turns[0].status === 'completed');
  const second = h.runtime.submit('第二问');
  await until(() => h.calls.length === 2);
  assert.ok(JSON.stringify(h.calls[1].conversation).includes('第一轮回答'));
  await reply(h.calls[1], '第二轮回答。');
  await second;
  await until(() => h.runtime.state.phase === 'idle');
  assert.equal(h.speaking.includes(true), false);
});

test('interrupt releases generation and discards late tokens from the old provider', async () => {
  const h = harness();
  const first = h.runtime.submit('旧问题');
  await until(() => h.calls.length === 1);
  await h.calls[0].options.onStreamEvent({ type: 'text-delta', text: '旧回答已有一些文字，之后会被用户打断。' });
  await until(() => h.runtime.state.turns[0].reply.length > 0);
  h.runtime.interrupt();
  const visible = h.runtime.state.turns[0].reply;
  const second = h.runtime.submit('新问题');
  await until(() => h.calls.length === 2);
  assert.equal(h.calls[0].options.abortSignal.aborted, true);
  await reply(h.calls[1], '这是新回答。');
  await second;
  const signalsBeforeLateOutput = h.signals.length;
  await reply(h.calls[0], '<|ACT {"emotion":"angry"}|>不应出现的迟到内容。');
  await first;
  await until(() => h.runtime.state.turns[1].status === 'completed');
  assert.equal(h.runtime.state.turns[0].status, 'interrupted');
  assert.equal(h.runtime.state.turns[0].reply, visible);
  assert.equal(h.runtime.state.turns[1].reply, '这是新回答。');
  assert.equal(h.signals.length, signalsBeforeLateOutput);
});

test('late TTS from an interrupted turn cannot start after the next reply', async () => {
  const pending = [];
  const played = [];
  const h = harness((request, signal) => {
    const audio = Promise.withResolvers();
    pending.push({ request, signal, audio });
    return audio.promise;
  }, async (audio, _signal, start) => { played.push(await audio.text()); start(); });
  const first = h.runtime.submit('旧问题');
  await until(() => h.calls.length === 1);
  await reply(h.calls[0], '旧声音。'); await first;
  await until(() => pending.length === 1);
  const second = h.runtime.submit('新问题');
  await until(() => h.calls.length === 2);
  await reply(h.calls[1], '新声音。'); await second;
  await until(() => pending.length === 2);
  assert.equal(pending[0].signal.aborted, true);
  pending[1].audio.resolve(new Blob(['new']));
  await until(() => played.length === 1);
  pending[0].audio.resolve(new Blob(['old']));
  await delay(50);
  assert.deepEqual(played, ['new']);
  assert.equal(h.runtime.state.turns[0].status, 'interrupted');
  assert.equal(h.runtime.state.turns[1].status, 'completed');
});

test('new input stops active audio and the next reply can complete', async () => {
  let firstAudioSignal;
  let playCount = 0;
  const h = harness(async request => new Blob([request.text]), async (_audio, signal, start) => {
    playCount++;
    start();
    if (playCount === 1) {
      firstAudioSignal = signal;
      await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
    }
  });
  const first = h.runtime.submit('播放第一轮');
  await until(() => h.calls.length === 1);
  await reply(h.calls[0], '第一轮声音。'); await first;
  await until(() => h.runtime.state.phase === 'speaking');
  const second = h.runtime.submit('切换到第二轮');
  await until(() => h.calls.length === 2);
  assert.equal(firstAudioSignal.aborted, true);
  await reply(h.calls[1], '第二轮声音。'); await second;
  await until(() => h.runtime.state.turns[1].status === 'completed');
  assert.equal(playCount, 2);
  assert.equal(h.runtime.state.phase, 'idle');
});

test('out-of-order TTS results still play in sentence order', async () => {
  const pending = [];
  const played = [];
  const h = harness(request => {
    const audio = Promise.withResolvers(); pending.push({ request, audio }); return audio.promise;
  }, async (audio, _signal, start) => { played.push(await audio.text()); start(); });
  const send = h.runtime.submit('两句话');
  await until(() => h.calls.length === 1);
  await reply(h.calls[0], '第一句话先播放。第二句话后播放。'); await send;
  await until(() => pending.length === 2);
  pending[1].audio.resolve(new Blob(['second']));
  await delay(30);
  assert.equal(played.length, 0);
  pending[0].audio.resolve(new Blob(['first']));
  await until(() => h.runtime.state.turns[0].status === 'completed');
  assert.deepEqual(played, ['first', 'second']);
});

test('provider failures are visible and do not prevent the next turn', async () => {
  const h = harness();
  const first = h.runtime.submit('失败问题');
  await until(() => h.calls.length === 1);
  h.calls[0].completion.reject(new Error('fixture service failed'));
  await first;
  assert.equal(h.runtime.state.turns[0].status, 'failed');
  assert.match(h.runtime.state.error, /fixture service failed/);
  const second = h.runtime.submit('恢复问题');
  await until(() => h.calls.length === 2);
  await reply(h.calls[1], '恢复后的回答。'); await second;
  await until(() => h.runtime.state.turns[1].status === 'completed');
  assert.equal(h.runtime.state.error, '');
});

test('changing adapter starts a fresh session without the cancelled old reply', async () => {
  const h = harness();
  const old = h.runtime.submit('旧会话');
  await until(() => h.calls.length === 1);
  await h.calls[0].options.onStreamEvent({ type: 'text-delta', text: '旧会话已经显示的部分回答。' });
  await until(() => h.runtime.state.turns[0].reply.length > 0);
  let nextConversation;
  h.runtime.configure({ label: 'next fixture', model: 'test', provider, stream: async (_m, _p, conversation, options) => {
    nextConversation = conversation;
    await options.onStreamEvent({ type: 'text-delta', text: '全新会话的回答。' });
    await options.onStreamEvent({ type: 'finish' });
  } });
  await h.runtime.submit('新会话');
  await reply(h.calls[0], '旧会话迟到内容。'); await old;
  await until(() => h.runtime.state.turns[0].status === 'completed');
  assert.equal(h.runtime.state.turns.length, 1);
  assert.equal(JSON.stringify(nextConversation).includes('旧会话'), false);
});

test('split AIRI ACT markers drive only supported reactions and stay out of the reply', async () => {
  const h = harness();
  const send = h.runtime.submit('表达开心');
  await until(() => h.calls.length === 1);
  const text = '<|ACT {"emotion":{"name":"happy","intensity":0.7}}|>开心地回答。<|ACT {"emotion":"sad","motion":"idle","expression":"x"}|><|ACT invalid|><|ACT {"motion":"angry"}|>';
  for (const chunk of text.match(/.{1,3}/gu)) await h.calls[0].options.onStreamEvent({ type: 'text-delta', text: chunk });
  await reply(h.calls[0], '继续显示普通文字。'); await send;
  await until(() => h.runtime.state.turns[0].status === 'completed');
  const reactions = h.signals.filter(signal => signal.type === 'emotion');
  assert.deepEqual(reactions.map(signal => signal.name), ['think', 'happy']);
  assert.equal(reactions[1].intensity, 0.7);
  assert.equal(reactions[1].turnId, h.runtime.state.turns[0].id);
  assert.equal(h.runtime.state.turns[0].reply, '开心地回答。继续显示普通文字。');
  assert.equal(h.signals.some(signal => signal.type === 'clear-emotion'), false, 'first literal must not erase the explicit reaction');
  h.runtime.interrupt();
  assert.equal(h.signals.at(-1).type, 'reset');
});

test('first literal and empty replies clear only the default think reaction', async () => {
  const h = harness();
  const first = h.runtime.submit('没有显式情绪的回答');
  await until(() => h.calls.length === 1);
  await reply(h.calls[0], '开始显示文字。');
  await first;
  const second = h.runtime.submit('空回答');
  await until(() => h.calls.length === 2);
  await reply(h.calls[1], '');
  await second;
  await until(() => h.runtime.state.turns[1].status === 'completed');
  const clears = h.signals.filter(signal => signal.type === 'clear-emotion');
  assert.equal(clears.length, 2);
  assert.ok(clears.every(signal => signal.onlyIf === 'think'));
  assert.notEqual(clears[0].turnId, clears[1].turnId);
});

test('neutral clears the reaction without ending the current reply', async () => {
  const h = harness();
  const send = h.runtime.submit('恢复表情');
  await until(() => h.calls.length === 1);
  await reply(h.calls[0], '<|ACT {"emotion":"angry"}|>表达反应。<|ACT {"emotion":"neutral"}|>恢复后继续回答。'); await send;
  await until(() => h.runtime.state.turns[0].status === 'completed');
  assert.deepEqual(h.signals.slice(1).map(signal => signal.type === 'emotion' ? signal.name : signal.type), ['reset', 'think', 'angry', 'clear-emotion']);
  assert.equal(h.signals.at(-1).onlyIf, undefined, 'explicit neutral clears whichever reaction is current');
  assert.equal(h.runtime.state.turns[0].reply, '表达反应。恢复后继续回答。');
});

test('stop ends current audio, rejects new turns, and start preserves mode and history', async () => {
  let playingSignal;
  const h = harness(async request => new Blob([request.text]), async (_audio, signal, start) => {
    playingSignal = signal; start();
    await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
  });
  const first = h.runtime.submit('播放并停止');
  await until(() => h.calls.length === 1);
  await reply(h.calls[0], '正在播放声音。'); await first;
  await until(() => h.runtime.state.phase === 'speaking');
  h.runtime.stop();
  assert.equal(playingSignal.aborted, true);
  assert.equal(h.runtime.state.active, false);
  assert.equal(h.runtime.state.phase, 'idle');
  assert.equal(h.runtime.state.turns[0].status, 'interrupted');
  await h.runtime.submit('停播后不接收');
  assert.equal(h.runtime.state.turns.length, 1);
  h.runtime.start();
  assert.equal(h.runtime.state.mode, 'test fixture');
  assert.equal(h.runtime.state.turns.length, 1);
  const next = h.runtime.submit('重启后的问题');
  await until(() => h.calls.length === 2);
  assert.ok(JSON.stringify(h.calls[1].conversation).includes('播放并停止'));
  await reply(h.calls[1], ''); await next;
  await until(() => h.runtime.state.turns[1].status === 'completed');
});
