import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const upstream = fileURLToPath(new URL('../airi/', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'pinia', '@vueuse/core'],
    alias: [
      { find: '@proj-airi/stage-shared/composables', replacement: `${upstream}/packages/stage-shared/src/composables/use-local-storage-manual-reset/index.ts` },
      { find: '@proj-airi/stage-shared', replacement: `${upstream}/packages/stage-shared/src/cover-fit.ts` },
      { find: '@proj-airi/stream-kit', replacement: `${upstream}/packages/stream-kit/src/index.ts` },
      { find: '@proj-airi/pipelines-audio', replacement: `${upstream}/packages/pipelines-audio/src/index.ts` },
      { find: '@proj-airi/provider-inference', replacement: `${upstream}/packages/provider-inference/src/types.ts` },
      { find: '@proj-airi/server-shared/types', replacement: `${upstream}/packages/server-shared/src/types/index.ts` },
      { find: '@proj-airi/plugin-protocol/types', replacement: `${upstream}/packages/plugin-protocol/src/types/index.ts` },
    ],
  },
  server: {
    fs: { allow: [fileURLToPath(new URL('../', import.meta.url))] },
  },
})
