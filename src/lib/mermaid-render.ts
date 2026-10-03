// Interface mínima da lib mermaid que este módulo precisa — permite mockar
// em teste sem importar a lib real (que depende de DOM/canvas).
export interface MermaidLib {
  render(id: string, source: string): Promise<{ svg: string }>
}

export type MermaidRenderResult =
  | { status: 'ok'; svg: string }
  | { status: 'error'; source: string; message: string }

let renderCounter = 0

// Função pura de parse/render: nunca lança — sintaxe inválida vira um
// resultado 'error' carregando a fonte original + mensagem, pro caller
// decidir como exibir (em vez de deixar a página em branco).
export async function renderMermaidDiagram(mermaid: MermaidLib, source: string): Promise<MermaidRenderResult> {
  const id = `mermaid-diagram-${renderCounter++}`
  try {
    const { svg } = await mermaid.render(id, source)
    return { status: 'ok', svg }
  } catch (error) {
    return { status: 'error', source, message: error instanceof Error ? error.message : String(error) }
  }
}
