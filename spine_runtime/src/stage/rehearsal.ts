import type { ConversationAdapter } from './conversation'

const basicReply = '<|ACT {"emotion":{"name":"happy","intensity":1}}|>【本机演练】这是一条带开心反应的固定脚本回复，用来检查逐字显示、中断与下一轮衔接。TTS 尚未接入，本轮只显示文字。'

// Fixed provider chunks exercise the same AIRI parser as future model output.
// Delays control incoming signals, never animation completion.
export const rehearsalScenarios = {
  basic: {
    label: '基础：逐字回答',
    description: '思考 → 开心 → 逐字回答，可随时中断或发送下一条。',
    chunks: basicReply.match(/.{1,4}/gu)!.map((text, index) => ({ waitMs: index === 0 ? 800 : 100, text })),
  },
  repeat: {
    label: '重复开心：保持当前动作',
    description: '连续发送三次开心信号，人物应只起播一次，结束后回待机。',
    chunks: [
      { waitMs: 700, text: '<|ACT {"emotion":"happy"}|>【重复反应】第一次开心。' },
      { waitMs: 400, text: '<|ACT {"emotion":"happy"}|>第二次保持。' },
      { waitMs: 400, text: '<|ACT {"emotion":"happy"}|>第三次保持，等待动作自然结束。' },
    ],
  },
  switch: {
    label: '开心 → 生气：切换反应',
    description: '先开心，再切生气；观察切换是否平顺，以及生气是否完整结束。',
    chunks: [
      { waitMs: 700, text: '<|ACT {"emotion":"happy"}|>【切换反应】先开心。' },
      { waitMs: 900, text: '<|ACT {"emotion":"angry"}|>现在生气，随后自然回待机。' },
    ],
  },
  finish: {
    label: '文字先结束：动作自然收尾',
    description: '短回答立即结束，开心动作应继续播完。',
    chunks: [{ waitMs: 700, text: '<|ACT {"emotion":"happy"}|>【自然收尾】文字结束了，动作继续。' }],
  },
  neutral: {
    label: '开心 → 恢复：继续回答',
    description: '恢复信号清除开心反应，后续文字仍然正常显示。',
    chunks: [
      { waitMs: 700, text: '<|ACT {"emotion":"happy"}|>【恢复反应】先开心。' },
      { waitMs: 900, text: '<|ACT {"emotion":"neutral"}|>回到待机。' },
      { waitMs: 500, text: '回答仍然继续，恢复反应不会中断对话。' },
    ],
  },
} as const

export type RehearsalScenario = keyof typeof rehearsalScenarios

export function createRehearsal(id: RehearsalScenario): ConversationAdapter {
  const scenario = rehearsalScenarios[id]
  return {
    label: `本机脚本演练（非 AI）· ${scenario.label}`,
    model: 'rehearsal',
    provider: { generation: model => ({ protocol: 'chat-completions', config: { model, baseURL: 'https://example.invalid/' } }) },
    stream: async (_model, _provider, _conversation, options) => {
      for (const chunk of scenario.chunks) {
        await new Promise(resolve => setTimeout(resolve, chunk.waitMs))
        options!.abortSignal!.throwIfAborted()
        await options!.onStreamEvent!({ type: 'text-delta', text: chunk.text })
      }
      await options!.onStreamEvent!({ type: 'finish' })
    },
  }
}
