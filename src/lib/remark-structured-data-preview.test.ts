import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { remarkStructuredDataPreview, tryRenderStructuredData } from './remark-structured-data-preview'

function render(markdown: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkStructuredDataPreview)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(markdown)
    .toString()
}

describe('tryRenderStructuredData', () => {
  it('JSON válido → retorna a árvore renderizada', () => {
    const html = tryRenderStructuredData('json', '{"a": 1}')
    expect(html).toContain('sdp-root')
  })

  it('YAML válido → retorna a árvore renderizada', () => {
    const html = tryRenderStructuredData('yaml', 'a: 1\nb: 2')
    expect(html).toContain('sdp-root')
  })

  it('JSON malformado → retorna null (fallback)', () => {
    expect(tryRenderStructuredData('json', '{ invalido')).toBeNull()
  })

  it('YAML malformado → retorna null (fallback)', () => {
    expect(tryRenderStructuredData('yaml', ':\n  - broken: [')).toBeNull()
  })

  it('linguagem não suportada → retorna null, nunca tenta parsear', () => {
    expect(tryRenderStructuredData('typescript', 'const x = 1')).toBeNull()
  })

  it('bloco vazio → retorna null (nada estrutural pra mostrar)', () => {
    expect(tryRenderStructuredData('yaml', '')).toBeNull()
  })

  it('bloco de uma linha ainda recebe o tratamento (sem threshold de tamanho)', () => {
    expect(tryRenderStructuredData('json', '{"x":1}')).toContain('sdp-root')
  })

  it('CSV válido → retorna a tabela renderizada', () => {
    const html = tryRenderStructuredData('csv', 'nome,idade\nAna,30')
    expect(html).toContain('sdp-csv-table')
  })

  it('CSV com campo entre aspas contendo vírgula é tratado corretamente', () => {
    const html = tryRenderStructuredData('csv', 'nome,cidade\n"Ana, Silva",SP')
    expect(html).toContain('<td>Ana, Silva</td>')
    expect(html).toContain('<td>SP</td>')
  })

  it('CSV vazio → retorna null (fallback)', () => {
    expect(tryRenderStructuredData('csv', '')).toBeNull()
  })

  it('CSV com linhas de tamanho inconsistente → retorna null (fallback)', () => {
    expect(tryRenderStructuredData('csv', 'a,b,c\n1,2')).toBeNull()
  })
})

describe('remarkStructuredDataPreview (integração markdown → HTML)', () => {
  it('bloco ```json válido vira árvore, não bloco de código', () => {
    const html = render('```json\n{"nome": "Ana"}\n```')
    expect(html).toContain('sdp-root')
    expect(html).not.toContain('<code')
  })

  it('bloco ```yaml válido vira árvore', () => {
    const html = render('```yaml\nnome: Ana\nidade: 30\n```')
    expect(html).toContain('sdp-root')
  })

  it('JSON malformado cai no bloco de código normal, sem quebrar o build', () => {
    const html = render('```json\n{ isso não é json }\n```')
    expect(html).not.toContain('sdp-root')
    expect(html).toContain('<code')
  })

  it('outras linguagens (ts, kotlin) não são tocadas pelo plugin', () => {
    const html = render('```ts\nconst x = 1\n```')
    expect(html).not.toContain('sdp-root')
    expect(html).toContain('<code')
  })

  it('bloco ```csv válido vira tabela, não bloco de código', () => {
    const html = render('```csv\nnome,idade\nAna,30\n```')
    expect(html).toContain('sdp-csv-table')
    expect(html).not.toContain('<code')
  })

  it('CSV inconsistente cai no bloco de código normal, sem quebrar o build', () => {
    const html = render('```csv\na,b,c\n1,2\n```')
    expect(html).not.toContain('sdp-csv-table')
    expect(html).toContain('<code')
  })
})
