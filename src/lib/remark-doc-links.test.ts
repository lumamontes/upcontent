import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { remarkDocumentLinks } from './remark-doc-links'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function render(markdown: string, source: string, root: string, basePath?: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkDocumentLinks, { contentRoot: root, basePath })
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync({ value: markdown, path: source })
    .toString()
}

function fixture(files: string[]) {
  const root = mkdtempSync(join(tmpdir(), 'upcontent-markdown-links-'))
  roots.push(root)
  for (const file of files) {
    mkdirSync(dirname(join(root, file)), { recursive: true })
    writeFileSync(join(root, file), '')
  }
  return root
}

describe('remarkDocumentLinks', () => {
  it('converts relative Markdown links using the source file path', () => {
    const root = fixture(['README.md', 'acervos/resource.md'])
    const html = render('[Resource](acervos/resource.md)', join(root, 'README.md'), root)
    expect(html).toContain('href="/acervos/resource/"')
  })

  it('preserves external links and applies the base path to document routes', () => {
    const root = fixture(['README.md', 'guide.md'])
    const html = render('[Guide](guide.md) [External](https://example.com/guide.md)', join(root, 'README.md'), root, '/recursos/')
    expect(html).toContain('href="/recursos/guide/"')
    expect(html).toContain('href="https://example.com/guide.md"')
  })
})
