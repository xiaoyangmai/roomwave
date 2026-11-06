<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useElementSize } from '@vueuse/core'
import { AudioOutput } from '../../../airi/packages/audio/src/browser/audio-output'
import { StageConversation } from './conversation'
import type { ConversationSnapshot, PerformanceSignal, StageEmotion } from './conversation'
import { createRehearsal, rehearsalScenarios } from './rehearsal'
import type { RehearsalScenario } from './rehearsal'
import { c010 } from './c010'
import SpineModel from '../../../airi/packages/stage-ui-spine/src/components/scenes/spine/Model.vue'
import { Emotion } from '../../../airi/packages/stage-ui-spine/src/constants/emotions'
import { useSpine } from '../../../airi/packages/stage-ui-spine/src/stores/spine'

const canvas = ref<HTMLCanvasElement>()
const effectsCanvas = ref<HTMLCanvasElement>()
const previewPaused = ref(false)
const stageElement = ref<HTMLDivElement>()
const { width: stageWidth, height: stageHeight } = useElementSize(stageElement, c010.view)
const model = ref<InstanceType<typeof SpineModel>>()
const ready = ref(false)
const error = ref('')
const speaking = ref(false)
const status = ref('加载 c010…')
const actionIssue = ref('')
const actionReady = ref(false)
const foam = ref({ phase: 'idle', amount: 0, time: 0, face: { x: 0, y: 0, scale: 0 }, hand: { x: 0, y: 0, scale: 0 } })
let foamTiming = { notice: 0, contact: 0, cleared: 0, complete: 0 }
const store = useSpine()
store.currentSkin = c010.model.skin
store.currentAnimation = { ...c010.idle }
store.scale = 1
store.position = { x: 0, y: 0 }
store.animationSpeed = 1
const testAudio = shallowRef<Blob>()
const rehearsalScenario = ref<RehearsalScenario>('basic')
const draft = ref('')
const conversationState = ref<ConversationSnapshot>({ active: false, mode: '模型未接入', tts: false, phase: 'idle', turns: [], error: '' })
const phases = { idle: '待机', thinking: '等待回答', responding: '接收回答', speaking: '语音播放中' }
const trace: { time: number, event: string, signal?: PerformanceSignal, decision?: 'apply' | 'keep-current' }[] = []
let audioContext: AudioContext | undefined
let mounted = false

const conversation = new StageConversation({
  changed: state => { conversationState.value = state },
  perform: applyPerformance,
  playAudio: async (audio, signal, onStart) => {
    if (!audioContext || audioContext.state !== 'running') throw new Error('浏览器声音尚未启用，请先点击“播放测试语音”。')
    const output = new AudioOutput(audioContext, audio, audioContext.destination, { onStart })
    const stop = () => { void output.stop({ fadeMs: 0 }) }
    signal.addEventListener('abort', stop, { once: true })
    try { await output.done }
    finally { signal.removeEventListener('abort', stop) }
  },
})
conversation.stop()

function applyPerformance(signal: PerformanceSignal) {
  if (!ready.value) return
  // Read AIRI's real track: a completed reaction must be allowed to play again.
  const currentReaction = model.value!.getPlaybackState()![1]?.animation
  const keepCurrent = (signal.type === 'emotion' && currentReaction === c010.reactions[signal.name])
    || (signal.type === 'clear-emotion' && signal.onlyIf === 'think' && currentReaction !== c010.reactions.think)
  trace.push({ time: performance.now(), event: `演出信号：${signal.type}`, signal, decision: keepCurrent ? 'keep-current' : 'apply' })
  if (keepCurrent) {
    log('保持当前动作，不重新起播')
    return
  }
  switch (signal.type) {
    case 'emotion':
      model.value!.setEmotion(signal.name as Emotion, signal.intensity)
      log(`情绪：${signal.name}`)
      break
    case 'clear-emotion':
      model.value!.clearEmotion()
      break
    case 'reset':
      previewPaused.value = false
      model.value!.clearEmotion()
      clearFoam()
      if (speaking.value) model.value!.setSpeaking(false)
      speaking.value = false
      log('演出结束，恢复待机')
      break
    case 'speaking':
      if (speaking.value === signal.active) return
      speaking.value = signal.active
      model.value!.setSpeaking(signal.active)
      log(signal.active ? '语音播放中' : '语音停止，恢复嘴部')
  }
}

function onModelLoaded() {
  // Validate the loaded asset once, before accepting local input.
  const animations = model.value!.listAnimations()
  const required = [c010.idle.name, ...Object.values(c010.reactions), c010.speech.start, c010.speech.end]
  const missing = required.filter(name => !animations.includes(name))
  const missingSkin = !model.value!.listSkins().includes(c010.model.skin)
  if (missing.length || missingSkin) {
    error.value = `c010 配置与素材不匹配：${[missing.length ? `缺少动画 ${missing.join('、')}` : '', missingSkin ? `缺少 skin ${c010.model.skin}` : ''].filter(Boolean).join('；')}`
    log('素材检查未通过，演出未启用')
    return
  }
  ready.value = true
  const action = model.value!.getAnimationDetails(c010.foam.animation)
  const missingEvents = c010.foam.events.filter(name => !action?.events.some(event => event.name === name))
  const missingAnchors = [c010.foam.faceAnchor, c010.foam.handAnchor].filter(name => !model.value!.getBoneScreenPosition(name))
  if (!action || missingEvents.length || missingAnchors.length) {
    actionIssue.value = `擦脸素材未就绪：${[!action ? `缺少动画 ${c010.foam.animation}` : '', missingEvents.length ? `缺少事件 ${missingEvents.join('、')}` : '', missingAnchors.length ? `缺少锚点 ${missingAnchors.join('、')}` : ''].filter(Boolean).join('；')}`
  }
  else {
    const events = Object.fromEntries(action.events.map(event => [event.name, event.time]))
    foamTiming = { notice: events.FoamNotice, contact: events.FoamContact, cleared: events.FoamCleared, complete: events.FoamComplete }
    actionReady.value = true
  }
  conversation.start()
  log('待机')
}

async function enableAudio() {
  if (!audioContext) audioContext = new AudioContext()
  await audioContext.resume()
}

function pause() {
  conversation.stop()
  log('互动已暂停，人物保持待机')
}

function resume() {
  conversation.start()
  log('已恢复互动，等待新输入')
}

function log(event: string) {
  trace.push({ time: performance.now(), event })
  status.value = event
}

function setEmotion(emotion: StageEmotion) {
  previewPaused.value = false
  applyPerformance({ type: 'emotion', name: emotion, intensity: 1 })
}

function clearFoam() {
  foam.value = { ...foam.value, phase: 'idle', amount: 0, time: 0 }
  effectsCanvas.value?.getContext('2d')!.clearRect(0, 0, stageWidth.value, stageHeight.value)
}

function wipeFoam() {
  if (!actionReady.value || !conversationState.value.active) return
  conversation.interrupt()
  model.value!.playAction(c010.foam.animation)
  log('泡沫沾到脸上，开始擦拭')
}

function onActionEvent(name: string, time: number) {
  trace.push({ time: performance.now(), event: `${name}@${time.toFixed(3)}` })
  if (name === 'FoamComplete') log('擦脸完成，恢复待机')
}

function renderFoam() {
  if (!ready.value || !effectsCanvas.value) return
  const context = effectsCanvas.value.getContext('2d')!
  context.clearRect(0, 0, effectsCanvas.value.width, effectsCanvas.value.height)
  const track = model.value!.getPlaybackState()![1]
  if (!actionReady.value || track?.animation !== c010.foam.animation) {
    if (foam.value.phase !== 'idle') clearFoam()
    return
  }
  const time = track.time
  const amount = time < foamTiming.notice || time >= foamTiming.cleared ? 0
    : time < foamTiming.contact ? Math.min(1, (time - foamTiming.notice) / 0.2)
      : 1 - (time - foamTiming.contact) / (foamTiming.cleared - foamTiming.contact)
  const face = model.value!.getBoneScreenPosition(c010.foam.faceAnchor)!
  const hand = model.value!.getBoneScreenPosition(c010.foam.handAnchor)!
  foam.value = { time, amount, face, hand, phase: time < foamTiming.contact ? 'notice' : time < foamTiming.cleared ? 'contact' : time < foamTiming.complete ? 'recover' : 'complete' }
  const radius = 48.75 * face.scale
  context.globalAlpha = amount
  for (const [x, y, size] of [[-0.5, 0.05, 0.4], [-0.25, -0.3, 0.45], [0.1, -0.25, 0.5], [0.4, 0.08, 0.4], [0.05, 0.3, 0.45], [-0.3, 0.3, 0.34]]) {
    context.beginPath()
    context.arc(face.x + x * radius, face.y + y * radius, size * radius, 0, Math.PI * 2)
    context.fillStyle = '#f2fcff'
    context.fill()
    context.strokeStyle = '#b9dce8'
    context.lineWidth = Math.max(0.7, face.scale * 2)
    context.stroke()
  }
  context.globalAlpha = 1
  if (time >= foamTiming.contact) {
    context.globalCompositeOperation = 'destination-out'
    context.beginPath()
    // The contact marker follows a curled knuckle, not the entire palm.
    context.arc(hand.x, hand.y, 14 * hand.scale, 0, Math.PI * 2)
    context.fill()
    context.globalCompositeOperation = 'source-over'
  }
}

async function speak() {
  await enableAudio()
  conversation.playTestAudio(testAudio.value!)
}

function interrupt() {
  conversation.interrupt()
  log('已中断，恢复待机')
}

function submit() {
  const input = draft.value.trim()
  if (!input) return
  draft.value = ''
  void conversation.submit(input)
}

onMounted(() => {
  mounted = true
  fetch('/speech.wav').then(response => {
    if (!response.ok) throw new Error(`测试语音加载失败：${response.status}`)
    return response.blob()
  }).then(blob => { testAudio.value = blob })
    .catch(cause => { error.value = cause.message })
  window.addEventListener('pagehide', dispose)
  Object.assign(window, { roomwaveStage: {
    snapshot: () => ({ profile: c010, ready: ready.value, speaking: speaking.value, conversation: conversationState.value,
      audioContextState: audioContext?.state ?? 'not-created',
      tracks: model.value?.getPlaybackState(), actionReady: actionReady.value, actionIssue: actionIssue.value,
      foam: foam.value, previewPaused: previewPaused.value, trace }),
    setEmotion, speak, interrupt, pause, resume, conversation, wipeFoam,
    seekFoam: (seconds: number) => {
      if (!actionReady.value || !conversationState.value.active) return
      wipeFoam()
      previewPaused.value = true
      model.value!.seekAction(seconds)
      renderFoam()
    },
    resumePreview: () => { previewPaused.value = false },
  } })
})
function dispose() {
  if (!mounted) return
  mounted = false
  window.removeEventListener('pagehide', dispose)
  conversation.stop()
  void audioContext?.close().catch(cause => { error.value = cause.message })
  ready.value = false
}
onBeforeUnmount(dispose)
</script>

<template>
  <main>
    <header><div><small>ROOMWAVE / AIRI</small><h1>c010 演出验证</h1></div><span :class="{ live: ready }">{{ ready ? '角色已加载' : '准备中' }}</span></header>
    <div ref="stageElement" class="stage">
      <canvas ref="canvas" :width="stageWidth" :height="stageHeight" />
      <canvas ref="effectsCanvas" class="effects" :width="stageWidth" :height="stageHeight" aria-hidden="true" />
      <SpineModel v-if="canvas" ref="model" :canvas="canvas" :width="stageWidth" :height="stageHeight"
        :model-src="c010.model.url" :emotion-animations="c010.reactions" :speech-animations="c010.speech" :max-fps="c010.view.maxFps"
        :default-mix-duration="c010.mixSeconds" :background-url="c010.view.backgroundUrl"
        :paused="previewPaused" @rendered="renderFoam" @action-event="onActionEvent"
        @model-loaded="onModelLoaded" @error="error = $event.message" />
    </div>
    <p role="status">{{ status }} <strong v-if="speaking">● 正在说话</strong></p>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="controls">
      <button :disabled="!conversationState.active" @click="setEmotion('think')">思考</button>
      <button :disabled="!conversationState.active" @click="setEmotion('happy')">开心</button>
      <button :disabled="!conversationState.active" @click="setEmotion('angry')">生气</button>
      <button :disabled="!conversationState.active || !actionReady" @click="wipeFoam">擦掉泡沫</button>
      <button :disabled="!conversationState.active || !testAudio || speaking" @click="speak().catch(e => error = e.message)">播放测试语音</button>
      <button :disabled="!ready" @click="interrupt">中断并回待机</button>
    </div>
    <p v-if="actionIssue" class="note" role="status">{{ actionIssue }}</p>
    <div class="controls lifecycle">
      <button :disabled="!ready || !conversationState.active" @click="pause">暂停互动</button>
      <button :disabled="!ready || conversationState.active" @click="resume">恢复互动</button>
      <span>{{ conversationState.active ? '本地演出 · 可互动' : '互动已暂停' }}</span>
    </div>
    <section class="chat">
      <h2>对话联调</h2>
      <p id="conversation-status">{{ conversationState.mode }} · {{ conversationState.active ? phases[conversationState.phase] : '互动已暂停' }} · {{ conversationState.tts ? 'TTS 已配置' : 'TTS 未接入，只显示文字' }}</p>
      <label for="rehearsal-scenario">演练场景</label>
      <select id="rehearsal-scenario" v-model="rehearsalScenario">
        <option v-for="(scenario, id) in rehearsalScenarios" :key="id" :value="id">{{ scenario.label }}</option>
      </select>
      <p class="note">{{ rehearsalScenarios[rehearsalScenario].description }} 选择后点击“开启本机脚本演练”，会清空当前会话；再发送任意文字触发。</p>
      <div class="controls">
        <button :disabled="!ready" @click="conversation.configure(createRehearsal(rehearsalScenario))">开启本机脚本演练</button>
        <button @click="conversation.configure()">退出演练</button>
      </div>
      <ol class="messages">
        <li v-for="turn in conversationState.turns" :key="turn.id">
          <p>观众：{{ turn.input }}</p><p>角色：{{ turn.reply || '等待回答…' }}</p>
          <small>{{ { running: '进行中', completed: '完成', interrupted: '已中断', failed: '失败' }[turn.status] }}</small>
        </li>
      </ol>
      <form @submit.prevent="submit"><label for="message">发送文字</label><div class="message-row"><input id="message" v-model="draft" maxlength="2000" autocomplete="off"><button :disabled="!conversationState.active || !draft.trim()">发送</button></div></form>
      <p v-if="conversationState.error" role="alert">{{ conversationState.error }}</p>
    </section>
    <p class="note">脚本演练不调用 AI，也不合成语音。固定测试语音独立用于检查本地播放、嘴部动作与中断。</p>
  </main>
</template>

<style>
* { box-sizing: border-box; }
body { margin: 0; background: #12151b; color: #e9edf5; font: 15px/1.5 system-ui, sans-serif; }
main { max-width: 1024px; margin: auto; padding: 24px; }
header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
small, .note { color: #9ca8be; }
h1 { margin: 4px 0 0; font-size: 24px; }
.stage { position: relative; border: 1px solid #303847; border-radius: 16px; overflow: hidden; background: #222b36; aspect-ratio: 4/3; }
canvas { display: block; width: 100%; height: 100%; }
.effects { position: absolute; inset: 0; pointer-events: none; }
.controls { display: flex; gap: 10px; flex-wrap: wrap; }
.lifecycle { margin-top: 16px; align-items: center; }
button { background: #293349; color: #f3f5fa; border: 1px solid #46536b; padding: 10px 16px; border-radius: 8px; cursor: pointer; font: inherit; }
button:hover { background: #3c4e6a; }
button:disabled { opacity: .4; cursor: default; }
.live, strong { color: #88dfb6; }
.chat { margin-top: 24px; padding-top: 16px; border-top: 1px solid #303847; }
h2 { font-size: 18px; }
.messages { max-height: 280px; overflow-y: auto; padding-left: 24px; overflow-wrap: anywhere; }
.messages p { margin: 6px 0; white-space: pre-wrap; }
.message-row { display: flex; gap: 10px; margin-top: 8px; }
input { flex: 1; min-width: 0; background: #1c2432; color: #e9edf5; padding: 10px; border: 1px solid #46536b; border-radius: 8px; font: inherit; }
select { max-width: 100%; margin: 8px 0; padding: 10px; background: #1c2432; color: #e9edf5; border: 1px solid #46536b; border-radius: 8px; font: inherit; }
[role=alert] { color: #ffa6a6; }
@media (max-width: 600px) { main { padding: 14px; } h1 { font-size: 20px; } }
</style>
