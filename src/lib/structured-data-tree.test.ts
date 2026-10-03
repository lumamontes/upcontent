import { describe, it, expect } from 'vitest'
import { renderCsvTable, renderStructuredDataTree } from './structured-data-tree'

describe('renderStructuredDataTree', () => {
  it('renderiza objeto simples como details com entradas', () => {
    const html = renderStructuredDataTree({ name: 'Ana', age: 30 })
    expect(html).toContain('<details class="sdp-node" open>')
    expect(html).toContain('{ name, age }')
    expect(html).toContain('class="sdp-copy"')
    expect(html).toContain('Copy')
    expect(html).toContain('<span class="sdp-key">name</span>')
    expect(html).toContain('<span class="sdp-string">"Ana"</span>')
    expect(html).toContain('<span class="sdp-number">30</span>')
  })

  it('renderiza array com itens indexados', () => {
    const html = renderStructuredDataTree(['a', 'b'])
    expect(html).toContain('[ 2 items ]')
    expect(html).toContain('<span class="sdp-key">0</span>')
    expect(html).toContain('<span class="sdp-key">1</span>')
  })

  it('objeto/array aninhado gera details aninhado', () => {
    const html = renderStructuredDataTree({ user: { name: 'Ana' } })
    const detailsCount = (html.match(/<details/g) ?? []).length
    expect(detailsCount).toBe(2)
    expect(html).toContain('<details class="sdp-node" open><summary>{ user }</summary>')
    expect(html).toContain('<details class="sdp-node"><summary>{ name }</summary>')
  })

  it('valores null e boolean renderizam corretamente', () => {
    const html = renderStructuredDataTree({ active: true, deleted: false, parent: null })
    expect(html).toContain('<span class="sdp-boolean">true</span>')
    expect(html).toContain('<span class="sdp-boolean">false</span>')
    expect(html).toContain('<span class="sdp-null">null</span>')
  })

  it('escapa HTML em strings pra evitar quebra de markup', () => {
    const html = renderStructuredDataTree({ label: '<script>alert(1)</script>' })
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('valor folha único (não objeto/array) renderiza sem details', () => {
    const html = renderStructuredDataTree(42)
    expect(html).not.toContain('<details')
    expect(html).toContain('<span class="sdp-number">42</span>')
  })

  it('objeto vazio renderiza details sem entradas', () => {
    const html = renderStructuredDataTree({})
    expect(html).toContain('{}')
  })

  it('botão de cópia preserva a fonte original', () => {
    const source = '{\n  "name": "Ana"\n}'
    const html = renderStructuredDataTree({ name: 'Ana' }, source)
    expect(html).toContain(`data-sdp-copy="${encodeURIComponent(source)}"`)
  })
})

describe('renderCsvTable', () => {
  it('renderiza cabeçalho como thead e demais linhas como tbody', () => {
    const html = renderCsvTable([['nome', 'idade'], ['Ana', '30']])
    expect(html).toContain('<table class="sdp-csv-table">')
    expect(html).toContain('<thead><tr><th>nome</th><th>idade</th></tr></thead>')
    expect(html).toContain('<tbody><tr><td>Ana</td><td>30</td></tr></tbody>')
  })

  it('escapa HTML nas células pra evitar quebra de markup', () => {
    const html = renderCsvTable([['label'], ['<script>alert(1)</script>']])
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
