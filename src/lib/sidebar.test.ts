import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('node:fs', () => ({
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

import * as fs from 'node:fs'
import { buildSidebar } from './sidebar'
import { _resetPortalConfigCache } from './portal-config'

interface Tree {
  [name: string]: Tree | null
}

// Monta um FS falso em memória: null = arquivo, objeto = diretório.
function mountFs(root: string, tree: Tree) {
  function lookup(path: string): Tree | null | undefined {
    if (path === root) return tree
    const rel = path.slice(root.length + 1)
    let node: Tree | null = tree
    for (const part of rel.split('/')) {
      if (node === null || typeof node !== 'object') return undefined
      const next: Tree | null | undefined = node[part]
      if (next === undefined) return undefined
      node = next
    }
    return node
  }

  vi.mocked(fs.readdirSync).mockImplementation((path: unknown) => {
    const node = lookup(String(path))
    if (!node || typeof node !== 'object') return [] as never
    return Object.keys(node) as never
  })

  vi.mocked(fs.statSync).mockImplementation((path: unknown) => {
    const node = lookup(String(path))
    return { isDirectory: () => node !== null && typeof node === 'object' } as never
  })
}

const ROOT = '/content'

beforeEach(() => {
  _resetPortalConfigCache()
  vi.mocked(fs.existsSync).mockReturnValue(false)
})

describe('buildSidebar', () => {
  it('achata domains/ e shared/ um nível, promovendo os filhos pro topo', () => {
    mountFs(ROOT, {
      domains: { historico: { 'prd.md': null }, licencas: { 'issues.md': null } },
      shared: { docs: { 'guide.md': null } },
    })
    const sidebar = buildSidebar(ROOT) as { label: string }[]
    expect(sidebar.map(e => e.label)).toEqual(['Docs', 'Historico', 'Licencas'])
  })

  it('aplica Title Case em todo nível, não só no topo', () => {
    mountFs(ROOT, { domains: { licencas: { 'consistencia-licencas': { 'plan.md': null } } } })
    const sidebar = buildSidebar(ROOT) as { label: string; items: { label: string }[] }[]
    expect(sidebar[0].label).toBe('Licencas')
    expect(sidebar[0].items[0].label).toBe('Consistencia Licencas')
  })

  it('gera slug em minúsculo sem extensão pra arquivos', () => {
    mountFs(ROOT, { domains: { historico: { 'PRD.md': null } } })
    const sidebar = buildSidebar(ROOT) as { label: string; items: { slug: string }[] }[]
    expect(sidebar[0].items[0]).toEqual({ slug: 'domains/historico/prd' })
  })

  it('usa o slug da pasta para páginas index', () => {
    mountFs(ROOT, { customization: { 'index.md': null, 'config-json.md': null } })
    const sidebar = buildSidebar(ROOT) as { label: string; items: { slug: string }[] }[]

    expect(sidebar[0].items.map(item => item.slug)).toEqual(['customization', 'customization/config-json'])
  })

  it('limita a navegação às raízes configuradas pelo consumer repo', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ navigation: { roots: ['docs'] } }))
    mountFs(ROOT, { docs: { guide: { 'index.md': null } }, internal: { 'notes.md': null } })

    const sidebar = buildSidebar(ROOT) as { label: string }[]

    expect(sidebar.map(entry => entry.label)).toEqual(['Docs'])
  })

  it('ignora dotfiles e dot-directories', () => {
    mountFs(ROOT, { '.claude': { 'x.md': null }, domains: { historico: { 'a.md': null } } })
    const sidebar = buildSidebar(ROOT) as { label: string }[]
    expect(sidebar).toEqual([{ label: 'Historico', items: [{ slug: 'domains/historico/a' }] }])
  })

  it('ignora arquivos bloqueados (floor hardcoded)', () => {
    mountFs(ROOT, { 'CLAUDE.md': null, 'README.md': null })
    const sidebar = buildSidebar(ROOT)
    expect(sidebar).toEqual([{ slug: 'index', label: 'Home' }])
  })

  it('fixa o README em primeiro, relabelado como Home, na frente de tudo', () => {
    mountFs(ROOT, { 'README.md': null, domains: { historico: { 'a.md': null } } })
    const sidebar = buildSidebar(ROOT) as { label: string }[]
    expect(sidebar[0]).toEqual({ slug: 'index', label: 'Home' })
    expect(sidebar[1].label).toBe('Historico')
  })

  it('permite sobrescrever o label do README', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ navigation: { labelOverrides: { readme: 'Docs' } } }),
    )
    mountFs(ROOT, { 'README.md': null, domains: { historico: { 'a.md': null } } })
    const sidebar = buildSidebar(ROOT) as { label: string }[]
    expect(sidebar[0]).toEqual({ slug: 'index', label: 'Docs' })
  })

  it('aplica labelOverrides do .upcontent/config.json em cima do Title Case', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ navigation: { labelOverrides: { historico: 'Histórico' } } }),
    )
    mountFs(ROOT, { domains: { historico: { 'a.md': null }, licencas: { 'b.md': null } } })
    const sidebar = buildSidebar(ROOT) as { label: string }[]
    expect(sidebar.map(e => e.label)).toEqual(['Histórico', 'Licencas'])
  })

  it('não inclui diretório que fica vazio após filtragem', () => {
    mountFs(ROOT, { domains: { historico: {} } })
    expect(buildSidebar(ROOT)).toEqual([])
  })

  it('retorna [] quando o content root não existe', () => {
    vi.mocked(fs.readdirSync).mockImplementation(() => {
      throw new Error('ENOENT')
    })
    expect(buildSidebar('/nao-existe')).toEqual([])
  })

  it('respeita blocklist configurável via .upcontent/config.json', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ navigation: { blocklist: { prefixes: ['docs/'] } } }),
    )
    mountFs(ROOT, { docs: { 'x.md': null }, domains: { historico: { 'a.md': null } } })
    const sidebar = buildSidebar(ROOT) as { label: string }[]
    expect(sidebar.map(e => e.label)).toEqual(['Historico'])
  })
})
