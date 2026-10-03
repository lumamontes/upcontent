import { describe, it, expect, vi } from 'vitest'
import { renderMermaidDiagram, type MermaidLib } from './mermaid-render'

describe('renderMermaidDiagram', () => {
  it('código válido → retorna o SVG renderizado', async () => {
    const mermaid: MermaidLib = {
      render: vi.fn().mockResolvedValue({ svg: '<svg>diagrama</svg>' }),
    }
    const result = await renderMermaidDiagram(mermaid, 'flowchart TD\nA-->B')
    expect(result).toEqual({ status: 'ok', svg: '<svg>diagrama</svg>' })
  })

  it('código inválido → retorna a fonte original + mensagem de erro, sem lançar', async () => {
    const mermaid: MermaidLib = {
      render: vi.fn().mockRejectedValue(new Error('Parse error on line 1')),
    }
    const source = 'isso não é mermaid válido'
    const result = await renderMermaidDiagram(mermaid, source)
    expect(result).toEqual({ status: 'error', source, message: 'Parse error on line 1' })
  })

  it('erro que não é instância de Error também vira mensagem string, sem lançar', async () => {
    const mermaid: MermaidLib = {
      render: vi.fn().mockRejectedValue('algo deu errado'),
    }
    const result = await renderMermaidDiagram(mermaid, 'fonte')
    expect(result).toEqual({ status: 'error', source: 'fonte', message: 'algo deu errado' })
  })

  it('cada chamada usa um id único (evita colisão entre diagramas na mesma página)', async () => {
    const ids: string[] = []
    const mermaid: MermaidLib = {
      render: vi.fn().mockImplementation(async (id: string) => {
        ids.push(id)
        return { svg: '<svg/>' }
      }),
    }
    await renderMermaidDiagram(mermaid, 'a')
    await renderMermaidDiagram(mermaid, 'b')
    expect(ids[0]).not.toBe(ids[1])
  })
})
