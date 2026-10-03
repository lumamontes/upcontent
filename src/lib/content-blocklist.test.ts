import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

import * as fs from 'node:fs'
import { isBlocked, resolveLabel, toTitleCase } from './content-blocklist'
import { _resetPortalConfigCache } from './portal-config'

beforeEach(() => {
  _resetPortalConfigCache()
  vi.mocked(fs.existsSync).mockReturnValue(false)
})

describe('toTitleCase', () => {
  it('deixa o resto da palavra em minúsculo mesmo quando o nome original é tudo maiúsculo', () => {
    expect(toTitleCase('README')).toBe('Readme')
  })

  it('capitaliza cada palavra separada por hífen', () => {
    expect(toTitleCase('gestao-licencas-acessos')).toBe('Gestao Licencas Acessos')
  })
})

describe('resolveLabel', () => {
  it('usa toTitleCase quando não há override configurado', () => {
    expect(resolveLabel('historico')).toBe('Historico')
  })

  it('usa o override do .upcontent/config.json quando presente (case-insensitive)', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ navigation: { labelOverrides: { historico: 'Histórico' } } }),
    )
    expect(resolveLabel('historico')).toBe('Histórico')
    expect(resolveLabel('Historico')).toBe('Histórico')
  })
})

describe('isBlocked', () => {
  it('protects the renderer checkout from external consumer content', () => {
    expect(isBlocked('.upcontent-renderer/README.md')).toBe(true)
    expect(isBlocked('.UPCONTENT-RENDERER/README.md')).toBe(true)
  })
})
