import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { remarkWikiLinks } from './remark-wiki-links'

function render(markdown: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkWikiLinks)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown)
    .toString()
}

function renderStrict(markdown: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkWikiLinks, { contentRoot: process.cwd(), failOnBrokenLinks: true })
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown)
    .toString()
}

describe('remarkWikiLinks', () => {
  it('resolve [[page]] simples pra /page', () => {
    const html = render('Veja [[backend/plan]] pra mais detalhes.')
    expect(html).toContain('href="/backend/plan/"')
    expect(html).toContain('>backend/plan<')
  })

  it('resolve [[page#heading]] combinando path e anchor', () => {
    const html = render('Ver [[DESIGN-licencas#Impact Summary]].')
    expect(html).toContain('href="/design-licencas/#impact-summary"')
  })

  it('resolve [[#heading]] como anchor local, sem path', () => {
    const html = render('Ver [[#Contracts]] abaixo.')
    expect(html).toContain('href="#contracts"')
  })

  it('resolve [[page|label]] usando o label como texto do link', () => {
    const html = render('Veja [[backend/plan|o plano]] aqui.')
    expect(html).toContain('href="/backend/plan/"')
    expect(html).toContain('>o plano<')
  })

  it('normaliza espaços e maiúsculas no path', () => {
    const html = render('Ver [[Meu Documento]].')
    expect(html).toContain('href="/meu-documento/"')
  })

  it('não afeta texto sem wiki links', () => {
    const html = render('Texto normal sem links especiais.')
    expect(html).not.toContain('<a ')
    expect(html).toContain('Texto normal sem links especiais.')
  })

  it('resolve múltiplos wiki links na mesma linha', () => {
    const html = render('Ver [[a]] e também [[b]].')
    expect(html).toContain('href="/a/"')
    expect(html).toContain('href="/b/"')
  })

  // não corrompe rótulos de diagrama Mermaid que usam [[texto]] (sintaxe de subroutine node) —
  // o conteúdo de um bloco de código é um nó 'code' opaco, nunca visitado como 'text'
  it('não transforma [[texto]] dentro de um bloco de código', () => {
    const html = render('```mermaid\nflowchart TD\n  A[["algo<br/>outro"]]\n```')
    expect(html).not.toContain('<a ')
    expect(html).toContain('A[[')
  })

  it('falha quando um wiki link não aponta para um documento', () => {
    expect(() => renderStrict('Veja [[arquivo-que-nao-existe]].')).toThrow('Broken wiki link')
  })

  it('aceita um wiki link que aponta para um documento do consumer', () => {
    expect(renderStrict('Veja [[README]].')).toContain('href="/"')
  })

  it('mantém os formatos suportados sob validação estrita', () => {
    expect(renderStrict('[[#Product]] [[README#Product]] [[README|início]]')).toContain('href="#product"')
    expect(renderStrict('[[#Product]] [[README#Product]] [[README|início]]')).toContain('href="/#product"')
  })

  it('rejeita referências a arquivos que não são documentos', () => {
    expect(() => renderStrict('Veja [[package.json]].')).toThrow('Broken wiki link')
  })

  it('rejeita referências que escapam da raiz do consumer', () => {
    expect(() => renderStrict('Veja [[../package.json]].')).toThrow('Broken wiki link')
  })

  it('falha para uma referência wiki vazia ou sem fechamento', () => {
    expect(() => renderStrict('Veja [[]].')).toThrow('Malformed wiki link')
    expect(() => renderStrict('Veja [[sem fechamento.')).toThrow('Malformed wiki link')
    expect(() => renderStrict('Veja [[README]] e [[sem fechamento.')).toThrow('Malformed wiki link')
  })
})
