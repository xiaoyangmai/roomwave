import type { ChatOrchestratorLLMPort, ChatOrchestratorSendOptions } from '../../../airi/packages/core-agent/src/runtime/chat-orchestrator-runtime'
import type { ChatHistoryItem } from '../../../airi/packages/core-agent/src/types/chat'
import type { IntentHandle, TtsRequest } from '../../../airi/packages/pipelines-audio/src/types'

import { createChatOrchestratorRuntime } from '../../../airi/packages/core-agent/src/runtime/chat-orchestrator-runtime'
import { createPlaybackManager } from '../../../airi/packages/pipelines-audio/src/managers/playback-manager'
import { createSpeechPipeline } from '../../../airi/packages/pipelines-audio/src/speech-pipeline'
import { tokenAct } from '../../../airi/packages/pipelines-audio/src/llm-streaming-control/parsers/act'
import { normalizeActPayload } from '../../../airi/packages/pipelines-audio/src/llm-streaming-control/payloads'
import { c010 } from './c010'
import type { StageEmotion } from './c010'

export type { StageEmotion } from './c010'
export type PerformanceSignal =
  | { type: 'emotion', name: StageEmotion, intensity: number, turnId?: string }
  | { type: 'clear-emotion', onlyIf?: 'think', turnId?: string }
  | { type: 'speaking', active: boolean, turnId?: string }
  | { type: 'reset', turnId?: string }

export interface ConversationAdapter {
  label: string
  model: string
  provider: ChatOrchestratorSendOptions['chatProvider']
  stream: ChatOrchestratorLLMPort['stream']
}

// The transport owns authentication and converts its result to browser-decodable audio.
export type Synthesize = (request: TtsRequest, signal: AbortSignal) => Promise<Blob | null>

export interface ConversationTurn {
  id: string
  input: string
  reply: string
  status: 'running' | 'completed' | 'interrupted' | 'failed'
}

export interface ConversationSnapshot {
  active: boolean
  mode: string
  tts: boolean
  phase: 'idle' | 'thinking' | 'responding' | 'speaking'
  turns: ConversationTurn[]
  error: string
}

interface Run {
  turn: ConversationTurn
  intent: IntentHandle
  generated: boolean
  drained: boolean
  thinking: boolean
}

export class StageConversation {
  readonly state: ConversationSnapshot = { active: true, mode: '模型未接入', tts: false, phase: 'idle', turns: [], error: '' }
  private history: ChatHistoryItem[] = []
  private generation = 0
  private adapter?: ConversationAdapter
  private synthesize?: Synthesize
  private current?: Run
  private playingId?: string
  private readonly playback
  private readonly speech
  private readonly chat

  constructor(private readonly host: {
    changed: (state: ConversationSnapshot) => void
    perform: (signal: PerformanceSignal) => void
    playAudio: (audio: Blob, signal: AbortSignal, onStart: () => void) => Promise<void>
  }) {
    this.playback = createPlaybackManager<Blob>({
      play: async (item, signal) => {
        try {
          await host.playAudio(item.audio, signal, () => {
            this.playingId = item.id
            this.state.phase = 'speaking'
            host.perform({ type: 'speaking', active: true, turnId: item.turnId })
            this.emit()
          })
        }
        catch (cause) {
          if (!signal.aborted) {
            this.state.error = `语音播放失败：${(cause as Error).message}`
            this.emit()
          }
        }
        finally {
          // A stopped clip can settle after the next clip has started.
          if (this.playingId === item.id) {
            this.playingId = undefined
            host.perform({ type: 'speaking', active: false, turnId: item.turnId })
            this.state.phase = this.current ? 'responding' : 'idle'
            this.emit()
          }
        }
      },
    })
    this.speech = createSpeechPipeline<Blob>({
      playback: this.playback,
      tts: async (request, signal) => {
        if (!this.synthesize) return null
        try {
          return await this.synthesize(request, signal)
        }
        catch (cause) {
          if (!signal.aborted) {
            this.state.error = `语音生成失败：${(cause as Error).message}`
            this.emit()
          }
          return null
        }
      },
    })
    this.speech.on('onIntentEnd', (intentId) => {
      if (this.current?.intent.intentId !== intentId) return
      this.current.drained = true
      this.finish()
    })
    this.chat = createChatOrchestratorRuntime({
      session: {
        getSessionMessages: () => this.history,
        getSessionGeneration: () => this.generation,
        commitUserMessage: async (_session, message) => {
          this.history.push(message)
          return { status: 'inserted', messageId: message.id }
        },
        commitAssistantMessage: async (_session, message) => { this.history.push(message) },
      },
      context: { ingest: () => {}, snapshot: () => ({}) },
      foregroundStream: { patch: () => {}, reset: () => {} },
      llm: { stream: (...args) => this.adapter!.stream(...args) },
      getActiveSessionId: () => 'roomwave-c010',
      getActiveProvider: () => this.adapter?.label,
      getSystemPrompt: () => '你是 Roomwave 房间中的虚拟人物。用简洁的中文回答观众。',
    })
    this.chat.hooks.onTokenLiteral(async (text, context) => {
      if (this.current?.turn.id !== context.turnId) return
      if (this.current.thinking) {
        this.current.thinking = false
        host.perform({ type: 'clear-emotion', onlyIf: 'think', turnId: context.turnId })
      }
      this.current.turn.reply += text
      this.current.intent.writeLiteral(text)
      if (!this.playingId) this.state.phase = 'responding'
      this.emit()
    })
    const actParser = tokenAct()
    this.chat.hooks.onTokenSpecial(async (special, context) => {
      if (this.current?.turn.id !== context.turnId || !actParser.match(special)) return
      const parsed = actParser.parse(special)
      if (!parsed) return
      const { emotion } = normalizeActPayload(parsed.payload)
      // AIRI validates the payload once; this whitelist selects c010's supported reactions.
      if (!emotion) return
      if (Object.hasOwn(c010.reactions, emotion.name)) {
        this.current.thinking = false
        host.perform({ type: 'emotion', name: emotion.name as StageEmotion, intensity: emotion.intensity, turnId: context.turnId })
      }
      else if (emotion.name === 'neutral') {
        this.current.thinking = false
        host.perform({ type: 'clear-emotion', turnId: context.turnId })
      }
    })
  }

  configure(adapter?: ConversationAdapter, synthesize?: Synthesize) {
    this.interrupt()
    this.generation++
    this.adapter = adapter
    this.synthesize = synthesize
    this.history = []
    this.state.turns = []
    this.state.mode = adapter?.label ?? '模型未接入'
    this.state.tts = !!synthesize
    this.state.error = ''
    this.emit()
  }

  async submit(input: string) {
    if (!this.state.active) return
    if (!this.adapter) {
      this.state.error = '模型服务尚未接入。可在演出端开启“本机脚本演练”检查流程。'
      this.emit()
      return
    }
    this.interrupt()
    const turn: ConversationTurn = { id: crypto.randomUUID(), input, reply: '', status: 'running' }
    const run: Run = {
      turn, generated: false, drained: false, thinking: true,
      intent: this.speech.openIntent({ turnId: turn.id, intentId: turn.id, behavior: 'replace' }),
    }
    this.current = run
    this.state.turns.push(turn)
    this.state.phase = 'thinking'
    this.state.error = ''
    this.host.perform({ type: 'emotion', name: 'think', intensity: 1, turnId: turn.id })
    this.emit()
    try {
      await this.chat.ingest(input, {
        model: this.adapter.model, chatProvider: this.adapter.provider,
        providerId: this.adapter.label, messageId: turn.id,
      })
      if (this.current !== run) return
      run.generated = true
      run.intent.end()
      this.finish()
    }
    catch (cause) {
      if (this.current !== run) return
      run.intent.cancel('generation failed')
      turn.status = 'failed'
      this.current = undefined
      this.state.phase = 'idle'
      this.state.error = `回答失败：${(cause as Error).message}`
      this.host.perform({ type: 'reset', turnId: turn.id })
      this.emit()
    }
  }

  interrupt() {
    const turnId = this.current?.turn.id
    this.chat.cancelPendingSends('roomwave-c010')
    this.speech.stopAll('interrupted')
    if (this.current) this.current.turn.status = 'interrupted'
    this.current = undefined
    this.playingId = undefined
    this.host.perform({ type: 'reset', turnId })
    this.state.phase = 'idle'
    this.emit()
  }

  // The same playback exit is used for the existing fixed-audio probe.
  playTestAudio(audio: Blob) {
    if (!this.state.active) return
    this.interrupt()
    const id = crypto.randomUUID()
    this.playback.schedule({ id, intentId: id, streamId: id, segmentId: id,
      sequence: 0, priority: 0, text: '固定测试语音', special: null, audio, createdAt: Date.now() })
  }

  stop() {
    this.state.active = false
    this.interrupt()
  }

  start() {
    this.state.active = true
    this.emit()
  }

  private finish() {
    if (!this.current?.generated || !this.current.drained) return
    if (this.current.thinking) this.host.perform({ type: 'clear-emotion', onlyIf: 'think', turnId: this.current.turn.id })
    this.current.turn.status = 'completed'
    this.current = undefined
    this.state.phase = 'idle'
    this.emit()
  }

  private emit() {
    this.host.changed(structuredClone(this.state))
  }
}
