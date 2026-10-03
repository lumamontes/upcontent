import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { rehypeCallouts } from './rehype-callouts'

function render(markdown: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCallouts)
    .use(rehypeStringify)
    .processSync(markdown)
    .toString()
}

describe('rehypeCallouts', () => {
  it('converte [!info] sem texto adicional em callout com título default e ícone', () => {
    const html = render('> [!info]')
    expect(html).toContain('class="callout callout-info"')
    expect(html).toContain('callout-title')
    expect(html).toContain('ℹ️')
    expect(html).toContain('Info')
    expect(html).not.toContain('<blockquote>')
  })

  // formato real usado no conteúdo: marcador + texto tudo na mesma linha
  it('converte [!info] com texto na mesma linha (formato usado no conteúdo real)', () => {
    const html = render('> [!info] SDD — Artefato Plano técnico para a camada frontend')
    expect(html).toContain('class="callout callout-info"')
    expect(html).toContain('SDD — Artefato Plano técnico para a camada frontend')
  })

  it('converte [!warning] com título customizado', () => {
    const html = render('> [!warning] Cuidado aqui\n> Detalhes do risco')
    expect(html).toContain('class="callout callout-warning"')
    expect(html).toContain('Cuidado aqui')
    expect(html).toContain('⚠️')
  })

  it('cobre todos os tipos de callout usados no conteúdo', () => {
    const types = ['info', 'note', 'warning', 'danger', 'tip', 'important', 'caution']
    for (const type of types) {
      const html = render(`> [!${type}] Texto`)
      expect(html).toContain(`class="callout callout-${type}"`)
    }
  })

  it('não quebra blockquote comum sem marcador de callout', () => {
    const html = render('> Só uma citação normal, sem marcador')
    expect(html).toContain('<blockquote>')
    expect(html).not.toContain('callout')
  })

  it('callout dentro de uma lista não quebra a renderização', () => {
    const html = render('- item 1\n  > [!tip] dica dentro da lista\n- item 2')
    expect(html).toContain('class="callout callout-tip"')
    expect(html).toContain('item 1')
    expect(html).toContain('item 2')
  })

  it('tipo desconhecido sem texto usa ícone default e title case do tipo', () => {
    const html = render('> [!custom]')
    expect(html).toContain('class="callout callout-custom"')
    expect(html).toContain('Custom')
    expect(html).toContain('ℹ️')
  })
})
