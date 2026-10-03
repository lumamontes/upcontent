import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock node:fs before importing the module under test
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

import * as fs from 'node:fs'

describe('getPortalConfig', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  it('retorna config vazia quando config.json não existe', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    const { getPortalConfig } = await import('./portal-config')
    const config = getPortalConfig()
    expect(config).toEqual({})
  })

  it('retorna config parseada quando config.json existe e é válido', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
       JSON.stringify({
        site: {
          title: 'Meu Portal',
          description: 'Documentação do time',
          url: 'https://docs.example.com',
          logo: { src: '/logo.svg', alt: 'Meu Portal', replacesTitle: true },
          favicon: '/favicon.svg',
        },
         repo: { url: 'https://github.com/org/repo' },
         theme: { customCss: ['.upcontent/theme.css'] },
         starlight: {
           social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/org/repo' }],
           tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
           lastUpdated: true,
           pagination: false,
           expressiveCode: { styleOverrides: { borderRadius: '8px' } },
         },
         navigation: { roots: ['domains', 'shared'] },
      })
    )
    const { getPortalConfig } = await import('./portal-config')
    const config = getPortalConfig()
    expect(config.site?.title).toBe('Meu Portal')
    expect(config.site?.description).toBe('Documentação do time')
    expect(config.site?.url).toBe('https://docs.example.com')
    expect(config.site?.logo?.src).toBe('/logo.svg')
    expect(config.site?.favicon).toBe('/favicon.svg')
    expect(config.repo?.url).toBe('https://github.com/org/repo')
     expect(config.theme?.customCss).toEqual(['.upcontent/theme.css'])
    expect(config.starlight?.social?.[0].icon).toBe('github')
    expect(config.starlight?.tableOfContents).toEqual({ minHeadingLevel: 2, maxHeadingLevel: 3 })
    expect(config.starlight?.lastUpdated).toBe(true)
    expect(config.starlight?.pagination).toBe(false)
    expect(config.starlight?.expressiveCode).toEqual({ styleOverrides: { borderRadius: '8px' } })
    expect(config.navigation?.roots).toEqual(['domains', 'shared'])
  })

  it('retorna config vazia quando config.json é JSON inválido', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json }')
    const { getPortalConfig } = await import('./portal-config')
    const config = getPortalConfig()
    expect(config).toEqual({})
  })

  it('normaliza tipos inválidos sem quebrar a configuração do portal', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ site: 'invalid', theme: { customCss: 'invalid' }, navigation: { roots: [1, 'docs'] } }),
    )
    const { getPortalConfig } = await import('./portal-config')

    const config = getPortalConfig()

    expect(config.site?.title).toBeUndefined()
    expect(config.theme?.customCss).toBeUndefined()
    expect(config.navigation?.roots).toEqual(['docs'])
  })

  it('navigation.roots com valor customizado sobrepõe default', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ navigation: { roots: ['domains'] } })
    )
    const { getPortalConfig } = await import('./portal-config')
    const config = getPortalConfig()
    expect(config.navigation?.roots).toEqual(['domains'])
  })

  it('navigation.blocklist extra é retornado quando definido', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        navigation: {
          blocklist: { exact: ['rules.md'], prefixes: ['docs/'] },
        },
      })
    )
    const { getPortalConfig } = await import('./portal-config')
    const config = getPortalConfig()
    expect(config.navigation?.blocklist?.exact).toContain('rules.md')
    expect(config.navigation?.blocklist?.prefixes).toContain('docs/')
  })

  it('descarta tipos inválidos nas opções curadas do Starlight', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        starlight: {
          social: [{ icon: 'github' }, { icon: 'github', label: 'GitHub', href: 'https://github.com' }],
          tableOfContents: { minHeadingLevel: '2', maxHeadingLevel: 7 },
          lastUpdated: 'yes',
          pagination: 1,
          expressiveCode: { styleOverrides: { borderRadius: 8, padding: '1rem' } },
        },
      }),
    )
    const { getPortalConfig } = await import('./portal-config')
    const config = getPortalConfig()

    expect(config.starlight?.social).toEqual([{ icon: 'github', label: 'GitHub', href: 'https://github.com' }])
    expect(config.starlight?.tableOfContents).toEqual({ minHeadingLevel: undefined, maxHeadingLevel: undefined })
    expect(config.starlight?.lastUpdated).toBeUndefined()
    expect(config.starlight?.pagination).toBeUndefined()
    expect(config.starlight?.expressiveCode).toEqual({ styleOverrides: { padding: '1rem' } })
  })

  it('descarta um intervalo inválido do sumário', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ starlight: { tableOfContents: { minHeadingLevel: 4, maxHeadingLevel: 2 } } }),
    )

    const { getPortalConfig } = await import('./portal-config')
    expect(getPortalConfig().starlight?.tableOfContents).toBeUndefined()
  })
})
