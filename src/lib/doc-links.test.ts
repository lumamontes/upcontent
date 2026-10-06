import { describe, it, expect } from 'vitest'
import { buildGitHubUrl, resolveRelated } from './doc-links'

describe('buildGitHubUrl', () => {
  it('retorna undefined quando repoUrl não definido', () => {
    expect(buildGitHubUrl(undefined, 'domains/foo/bar.md', 'view')).toBeUndefined()
  })

  it('retorna link view quando repoUrl definido', () => {
    const url = buildGitHubUrl('https://github.com/org/repo', 'domains/foo/bar.md', 'view')
    expect(url).toBe('https://github.com/org/repo/blob/main/domains/foo/bar.md')
  })

  it('retorna link edit quando repoUrl definido', () => {
    const url = buildGitHubUrl('https://github.com/org/repo', 'domains/foo/bar.md', 'edit')
    expect(url).toBe('https://github.com/org/repo/edit/main/domains/foo/bar.md')
  })

  it('não adiciona .md duplo quando entryId já termina em .md', () => {
    const url = buildGitHubUrl('https://github.com/org/repo', 'domains/foo/bar.md', 'view')
    expect(url).not.toContain('.md.md')
  })
})

describe('resolveRelated', () => {
  const allDocs = [
    { id: 'domains/foo/prd.md', data: { title: 'Foo PRD' } },
    { id: 'shared/glossary.md', data: { title: 'Glossário' } },
    { id: 'domains/bar/trd.md', data: {} },
  ]

  it('retorna lista vazia quando related é undefined', () => {
    expect(resolveRelated(undefined, allDocs as any)).toEqual([])
  })

  it('retorna lista vazia quando related é array vazio', () => {
    expect(resolveRelated([], allDocs as any)).toEqual([])
  })

  it('resolve entry com .md normalizado', () => {
    const result = resolveRelated(['domains/foo/prd'], allDocs as any)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Foo PRD')
    expect(result[0].slug).toBe('domains/foo/prd')
  })

  it('resolve entry referenciado com extensão .md', () => {
    const result = resolveRelated(['shared/glossary.md'], allDocs as any)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Glossário')
  })

  it('ignora referências que não existem na coleção', () => {
    const result = resolveRelated(['domains/nao-existe'], allDocs as any)
    expect(result).toHaveLength(0)
  })

  it('usa o id como título fallback quando title ausente', () => {
    const result = resolveRelated(['domains/bar/trd'], allDocs as any)
    expect(result[0].title).toBe('domains/bar/trd')
  })

  it('resolve extensões alternativas e as rotas distintas de index e README', () => {
    const docs = [
      { id: 'index', data: { title: 'Home' } },
      { id: 'readme', data: { title: 'README' } },
      { id: 'guides/legacy', data: { title: 'Legacy' } },
    ]

    expect(resolveRelated(['index.md', 'README.markdown', 'guides/legacy.mdx'], docs as any)).toEqual([
      { slug: '', title: 'Home' },
      { slug: 'readme/', title: 'README' },
      { slug: 'guides/legacy', title: 'Legacy' },
    ])
  })
})
