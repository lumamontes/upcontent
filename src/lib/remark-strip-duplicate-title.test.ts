import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { remarkStripDuplicateTitle, stripDuplicateTitle } from './remark-strip-duplicate-title'

describe('stripDuplicateTitle', () => {
  it('remove o primeiro H1 quando o texto bate com o title', () => {
    const tree = {
      children: [
        { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Meu Título' }] },
        { type: 'paragraph', children: [{ type: 'text', value: 'corpo' }] },
      ],
    }
    const removed = stripDuplicateTitle(tree, 'Meu Título')
    expect(removed).toBe(true)
    expect(tree.children).toHaveLength(1)
    expect(tree.children[0].type).toBe('paragraph')
  })

  it('mantém o H1 quando o texto é diferente do title', () => {
    const tree = {
      children: [{ type: 'heading', depth: 1, children: [{ type: 'text', value: 'Outro título' }] }],
    }
    const removed = stripDuplicateTitle(tree, 'Meu Título')
    expect(removed).toBe(false)
    expect(tree.children).toHaveLength(1)
  })

  it('não remove H2 ou heading que não seja o primeiro nó', () => {
    const tree = {
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'intro' }] },
        { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Meu Título' }] },
      ],
    }
    expect(stripDuplicateTitle(tree, 'Meu Título')).toBe(false)
    expect(tree.children).toHaveLength(2)
  })

  it('sem title, não faz nada', () => {
    const tree = {
      children: [{ type: 'heading', depth: 1, children: [{ type: 'text', value: 'Meu Título' }] }],
    }
    expect(stripDuplicateTitle(tree, undefined)).toBe(false)
    expect(tree.children).toHaveLength(1)
  })
})

function render(markdown: string, title: string | undefined): string {
  const file = { value: markdown, data: { astro: { frontmatter: { title } } } }
  return unified()
    .use(remarkParse)
    .use(remarkStripDuplicateTitle)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(file)
    .toString()
}

describe('remarkStripDuplicateTitle (integração markdown → HTML)', () => {
  it('remove o H1 duplicado, mantém o resto do corpo', () => {
    const html = render('# Guia X\n\nConteúdo real.', 'Guia X')
    expect(html).not.toContain('<h1>')
    expect(html).toContain('Conteúdo real.')
  })

  it('sem duplicação, o H1 permanece intacto', () => {
    const html = render('# Guia X\n\nConteúdo real.', 'Outro Título')
    expect(html).toContain('<h1>Guia X</h1>')
  })
})
