export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderLeaf(value: string | number | boolean | null): string {
  if (value === null) return '<span class="sdp-null">null</span>'
  if (typeof value === 'string') return `<span class="sdp-string">"${escapeHtml(value)}"</span>`
  if (typeof value === 'boolean') return `<span class="sdp-boolean">${value}</span>`
  return `<span class="sdp-number">${value}</span>`
}

function renderEntry(key: string, value: unknown): string {
  return `<div class="sdp-entry"><span class="sdp-key">${escapeHtml(key)}</span><span class="sdp-colon">:</span> ${renderNode(value, false)}</div>`
}

// Recursivo: o nó raiz fica aberto para dar contexto imediato; objetos e arrays
// aninhados começam fechados para manter documentos grandes escaneáveis.
export function renderNode(value: unknown, open = true): string {
  if (value === null || typeof value !== 'object') {
    return renderLeaf(value as string | number | boolean | null)
  }

  if (Array.isArray(value)) {
    const summary = value.length === 0 ? '[]' : `[ ${value.length} ${value.length === 1 ? 'item' : 'items'} ]`
    const children = value.map((item, index) => renderEntry(String(index), item)).join('')
    return `<details class="sdp-node"${open ? ' open' : ''}><summary>${summary}</summary><div class="sdp-children">${children}</div></details>`
  }

  const entries = Object.entries(value as Record<string, unknown>)
  const summary = entries.length === 0
    ? '{}'
    : `{ ${entries.map(([key]) => escapeHtml(key)).join(', ')} }`
  const children = entries.map(([key, val]) => renderEntry(key, val)).join('')
  return `<details class="sdp-node"${open ? ' open' : ''}><summary>${summary}</summary><div class="sdp-children">${children}</div></details>`
}

export function renderStructuredDataTree(value: unknown, source = JSON.stringify(value, null, 2) ?? ''): string {
  const encodedSource = encodeURIComponent(source)
  return `<div class="sdp-root"><div class="sdp-toolbar"><button class="sdp-copy" type="button" aria-label="Copy structured data" data-sdp-copy="${encodedSource}"><span class="sdp-copy-label" aria-live="polite">Copy</span></button></div>${renderNode(value)}</div>`
}

// Tabela HTML semântica pra blocos ```csv — reaproveita o mesmo escapeHtml
// da árvore JSON/YAML, mas a saída é <table>, não <details>.
export function renderCsvTable(rows: string[][]): string {
  const [header, ...body] = rows
  const theadRow = `<tr>${header.map(cell => `<th>${escapeHtml(cell)}</th>`).join('')}</tr>`
  const tbodyRows = body
    .map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('')
  return `<table class="sdp-csv-table"><thead>${theadRow}</thead><tbody>${tbodyRows}</tbody></table>`
}
