import { JSON_SCHEMA, load as loadYaml } from 'js-yaml'
import Papa from 'papaparse'
import { visit } from 'unist-util-visit'
import { renderCsvTable, renderStructuredDataTree } from './structured-data-tree'

interface MdastCode {
  type: 'code'
  lang?: string | null
  value: string
}

interface MdastParent {
  type: string
  children: unknown[]
}

const SUPPORTED_LANGS = new Set(['json', 'yaml', 'yml', 'csv'])

// CSV vazio, com colunas inconsistentes entre linhas, ou que o papaparse não
// consegue parsear cai no tratamento padrão de código (retorna null) — sem
// threshold de tamanho, mas exige uma estrutura tabular coerente.
function tryRenderCsv(source: string): string | null {
  const { data, errors } = Papa.parse<string[]>(source.trim(), { skipEmptyLines: true })
  if (errors.length > 0 || data.length === 0) return null

  const width = data[0].length
  if (width === 0 || data.some(row => row.length !== width)) return null

  return renderCsvTable(data)
}

// Tenta parsear e renderizar a árvore — retorna null quando o conteúdo não é
// válido no formato (ou a linguagem não é suportada), sinalizando pro
// caller manter o bloco de código como está (fallback pro highlighting normal).
export function tryRenderStructuredData(lang: string | null | undefined, source: string): string | null {
  const normalizedLang = lang?.toLowerCase()
  if (!normalizedLang || !SUPPORTED_LANGS.has(normalizedLang)) return null

  if (normalizedLang === 'csv') return tryRenderCsv(source)

  try {
    // JSON_SCHEMA: restringe a tipos equivalentes a JSON (sem !!timestamp virando
    // Date, sem tags YAML exóticas) — js-yaml v4 já não expõe nenhum tipo
    // inseguro (removido da lib), isso é só previsibilidade, não segurança.
    const parsed = normalizedLang === 'json' ? JSON.parse(source) : loadYaml(source, { schema: JSON_SCHEMA })
    if (parsed === undefined) return null // bloco vazio ou só comentários (YAML) — nada estrutural pra mostrar
    return renderStructuredDataTree(parsed, source)
  } catch {
    return null
  }
}

// Remark plugin: converte ```json / ```yaml em árvore estática (<details>
// aninhado), no mesmo esquema que remarkMermaid usa pra ```mermaid — troca
// o nó 'code' por um nó 'html' ANTES do remark-rehype/Expressive Code
// processarem o bloco, então eles nunca veem o bloco original.
export function remarkStructuredDataPreview() {
  return (tree: MdastParent) => {
    visit(tree, 'code', (node: MdastCode, index: number | undefined, parent: MdastParent | undefined) => {
      const html = tryRenderStructuredData(node.lang, node.value)
      if (html === null || !parent || index === undefined) return
      parent.children.splice(index, 1, { type: 'html', value: html })
      return index + 1
    })
  }
}
