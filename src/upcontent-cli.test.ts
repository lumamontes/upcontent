import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import yaml from 'js-yaml'

const cliPath = fileURLToPath(new URL('../scripts/upcontent-cli.mjs', import.meta.url))

describe('upcontent init', () => {
  it('generates a valid GitHub Actions workflow', () => {
    const root = mkdtempSync(join(tmpdir(), 'upcontent-cli-'))

    try {
      const result = spawnSync(process.execPath, [cliPath, 'init'], { cwd: root, encoding: 'utf8' })
      expect(result.status).toBe(0)

      const workflow = readFileSync(join(root, '.github/workflows/deploy-docs.yml'), 'utf8')
      expect(yaml.load(workflow)).toMatchObject({
        jobs: {
          publish: {
            uses: 'lumamontes/upcontent/.github/workflows/reusable-pages.yml@main',
            permissions: {
              contents: 'read',
              pages: 'write',
              'id-token': 'write',
            },
          },
        },
      })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
