import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { resolve } from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      'astro:content': resolve(__dirname, 'src/content/__mocks__/astro-content.ts'),
      'astro/loaders': resolve(__dirname, 'src/content/__mocks__/astro-loaders.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/content/docs/**'],
  },
})
