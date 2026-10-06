import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

import * as fs from 'node:fs'
import { domainFieldsSchema, isBlocked, resolveTitle, toRelativeDocPath } from './content.config'
import { _resetPortalConfigCache } from './lib/portal-config'

beforeEach(() => {
  _resetPortalConfigCache()
  vi.mocked(fs.existsSync).mockReturnValue(false)
})

// domainFieldsSchema cobre só os campos de domínio deste portal — o título
// obrigatório do Starlight é resolvido por resolveTitle() antes da
// validação (ver describe('resolveTitle') abaixo), não faz parte deste schema.
describe('domainFieldsSchema', () => {
  it('aceita frontmatter completamente vazio', () => {
    const result = domainFieldsSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita status outdated', () => {
    const result = domainFieldsSchema.safeParse({ status: 'outdated' })
    expect(result.success).toBe(true)
  })

  it('aceita SEO por página com canonical absoluto e noindex', () => {
    const result = domainFieldsSchema.safeParse({
      canonical: 'https://docs.example.com/guides/seo/',
      image: 'https://docs.example.com/social-card.png',
      noindex: true,
    })

    expect(result.success).toBe(true)
  })

  it('rejeita canonical relativo', () => {
    const result = domainFieldsSchema.safeParse({ canonical: '/guides/seo/' })

    expect(result.success).toBe(false)
  })

  it('rejeita canonical com esquema que não é HTTP(S)', () => {
    const result = domainFieldsSchema.safeParse({ canonical: 'mailto:docs@example.com' })

    expect(result.success).toBe(false)
  })

  it('aceita created/updated como objeto Date (YAML parseia datas automaticamente)', () => {
    const result = domainFieldsSchema.safeParse({
      created: new Date('2026-08-07'),
      updated: new Date('2026-08-07'),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.created).toBe('2026-08-07')
      expect(result.data.updated).toBe('2026-08-07')
    }
  })

  it('aceita todos os campos de domínio preenchidos', () => {
    const result = domainFieldsSchema.safeParse({
      type: 'architecture',
      status: 'active',
      created: '2026-08-07',
      updated: '2026-08-07',
      teams: ['my-team'],
      impacted_teams: [],
      domains: [],
      repos: ['my-frontend-repo'],
      areas: [],
      tags: ['sdd/prd'],
      aliases: [],
      related: [],
    })
    expect(result.success).toBe(true)
  })
})

describe('resolveTitle', () => {
  it('mantém o title do frontmatter quando presente', () => {
    const data: Record<string, unknown> = { title: 'Meu Título' }
    resolveTitle('docs/algo.md', data)
    expect(data.title).toBe('Meu Título')
  })

  it('deriva do filename em Title Case quando title ausente', () => {
    const data: Record<string, unknown> = {}
    resolveTitle('domains/trd-backend.md', data)
    expect(data.title).toBe('Trd Backend')
  })

  it('remove prefixo numérico do filename antes de converter', () => {
    const data: Record<string, unknown> = {}
    resolveTitle('docs/adr/0001-self-hosted.md', data)
    expect(data.title).toBe('Self Hosted')
  })

  it('usa apenas o nome do arquivo, ignorando o diretório', () => {
    const data: Record<string, unknown> = {}
    resolveTitle('domains/licencas/gestao-acessos.md', data)
    expect(data.title).toBe('Gestao Acessos')
  })

  it('usa o campo configurado em content.titleField quando presente', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ content: { titleField: 'heading' } })
    )
    const data: Record<string, unknown> = { heading: 'Título Alternativo' }
    resolveTitle('domains/algo.md', data)
    expect(data.title).toBe('Título Alternativo')
  })

  it('cai no fallback de filename quando content.titleField está configurado mas ausente no frontmatter', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ content: { titleField: 'heading' } })
    )
    const data: Record<string, unknown> = {}
    resolveTitle('domains/algo-especifico.md', data)
    expect(data.title).toBe('Algo Especifico')
  })
})

describe('isBlocked', () => {
  it('bloqueia CLAUDE.md (case-insensitive)', () => {
    expect(isBlocked('CLAUDE.md')).toBe(true)
    expect(isBlocked('claude.md')).toBe(true)
  })

  it('bloqueia RULES.md (case-insensitive)', () => {
    expect(isBlocked('RULES.md')).toBe(true)
    expect(isBlocked('rules.md')).toBe(true)
  })

  it('bloqueia qualquer arquivo dentro de .claude/', () => {
    expect(isBlocked('.claude/settings.json')).toBe(true)
  })

  it('bloqueia qualquer arquivo dentro de .github/', () => {
    expect(isBlocked('.github/workflows/ci.yml')).toBe(true)
  })

  it('bloqueia qualquer arquivo dentro de .upcontent/', () => {
    expect(isBlocked('.upcontent/config.json')).toBe(true)
    expect(isBlocked('.upcontent/assets/logo.svg')).toBe(true)
  })

  // adversarial: arquivo com nome parecido mas que NÃO deve ser bloqueado
  it('não bloqueia domains/README.md', () => {
    expect(isBlocked('domains/README.md')).toBe(false)
  })

  it('bloqueia shared/INDEX.md (case-insensitive — arquivo real usa maiúsculo)', () => {
    expect(isBlocked('shared/INDEX.md')).toBe(true)
  })

  it('não bloqueia docs/prd/prd.md', () => {
    expect(isBlocked('docs/prd/prd.md')).toBe(false)
  })

  // adversarial: arquivo com prefixo ".cl" que NÃO é ".claude/"
  it('não bloqueia um arquivo hipotético .clue/something.md', () => {
    expect(isBlocked('.clue/something.md')).toBe(false)
  })
})

describe('toRelativeDocPath', () => {
  // o loader glob() do Astro gera entry.filePath relativo à raiz do projeto
  // (ex: "src/content/docs/RULES.md"), não relativo ao content base — isBlocked()
  // espera o path relativo ao content base (ex: "RULES.md")
  it('remove o prefixo src/content/docs/', () => {
    expect(toRelativeDocPath('src/content/docs/RULES.md')).toBe('RULES.md')
    expect(toRelativeDocPath('src/content/docs/shared/index.md')).toBe('shared/index.md')
  })

  it('mantém o path como está se o prefixo não estiver presente', () => {
    expect(toRelativeDocPath('RULES.md')).toBe('RULES.md')
  })
})
