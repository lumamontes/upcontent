import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { getNoindexRoutes } from './seo-sitemap'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('getNoindexRoutes', () => {
  it('maps noindex frontmatter to portal routes', () => {
    const root = mkdtempSync(join(tmpdir(), 'upcontent-seo-'))
    roots.push(root)
    mkdirSync(join(root, 'guides'), { recursive: true })
    writeFileSync(join(root, 'README.md'), '---\nnoindex: true\n---\n')
    writeFileSync(join(root, 'guides', 'internal.md'), '---\nnoindex: true\n---\n')
    writeFileSync(join(root, 'guides', 'legacy.markdown'), '---\nnoindex: true\n---\n')
    writeFileSync(join(root, 'guides', 'Release Notes.md'), '---\nnoindex: true\n---\n')
    writeFileSync(join(root, 'public.md'), '---\nnoindex: false\n---\n')

    expect(getNoindexRoutes(root)).toEqual(new Set(['/', '/guides/internal', '/guides/legacy', '/guides/release%20notes']))
  })
})
