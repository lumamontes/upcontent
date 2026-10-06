import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveMarkdownLink } from './portal-routes'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function fixture(files: string[]) {
  const root = mkdtempSync(join(tmpdir(), 'upcontent-routes-'))
  roots.push(root)
  for (const file of files) {
    mkdirSync(dirname(join(root, file)), { recursive: true })
    writeFileSync(join(root, file), '')
  }
  return root
}

describe('resolveMarkdownLink', () => {
  it('resolves a README link relative to the content root', () => {
    const root = fixture(['README.md', 'acervos/resource.md'])
    expect(resolveMarkdownLink('acervos/resource.md', join(root, 'README.md'), root)).toBe('/acervos/resource/')
  })

  it('resolves nested links relative to the source document', () => {
    const root = fixture(['guides/topic/current.md', 'guides/shared.md'])
    expect(resolveMarkdownLink('../shared.md', join(root, 'guides/topic/current.md'), root)).toBe('/guides/shared/')
  })

  it('normalizes index documents to their directory route', () => {
    const root = fixture(['guides/current.md', 'guides/index.md'])
    expect(resolveMarkdownLink('index.md#Overview', join(root, 'guides/current.md'), root)).toBe('/guides/#Overview')
  })

  it('normalizes route casing to match content collection ids', () => {
    const root = fixture(['README.md', 'Guides/Getting-Started.md'])
    expect(resolveMarkdownLink('Guides/Getting-Started.md', join(root, 'README.md'), root)).toBe('/guides/getting-started/')
  })

  it('maps README links to the portal root and preserves anchors', () => {
    const root = fixture(['README.md'])
    expect(resolveMarkdownLink('README.md#start', join(root, 'README.md'), root)).toBe('/#start')
    expect(resolveMarkdownLink('README#start', join(root, 'README.md'), root)).toBe('/#start')
  })

  it('uses root index.md as the homepage when README.md is also present', () => {
    const root = fixture(['README.md', 'index.md'])
    expect(resolveMarkdownLink('index.md', join(root, 'README.md'), root)).toBe('/')
    expect(resolveMarkdownLink('README.md', join(root, 'index.md'), root)).toBe('/readme/')
  })

  it('prefixes generated routes with the configured base path', () => {
    const root = fixture(['README.md', 'guide.md'])
    expect(resolveMarkdownLink('guide.md', join(root, 'README.md'), root, '/recursos/')).toBe('/recursos/guide/')
  })

  it('leaves external and non-document links unchanged', () => {
    const root = fixture(['README.md', 'image.png'])
    const source = join(root, 'README.md')
    expect(resolveMarkdownLink('https://example.com/guide.md', source, root)).toBe('https://example.com/guide.md')
    expect(resolveMarkdownLink('image.png', source, root)).toBe('image.png')
    expect(resolveMarkdownLink('#section', source, root)).toBe('#section')
  })
})
