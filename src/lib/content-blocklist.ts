import { getPortalConfig } from './portal-config'

// Extraído de content.config.ts: precisa ser importável de astro.config.mjs
// (sidebar.ts) e vitest sem depender de 'astro:content', que só resolve
// dentro do pipeline do Astro — content.config.ts importa esse módulo em vez
// de definir a lógica localmente.

// Floor hardcoded: nunca aparecem independentemente do config.json.
// Comparação sempre case-insensitive — arquivos reais podem usar qualquer
// caixa (ex: shared/INDEX.md em vez de shared/index.md).
const FLOOR_EXACT = new Set(['claude.md', 'rules.md', 'shared/index.md'])
const FLOOR_PREFIXES = ['.claude/', '.github/', '.upcontent/', '.upcontent-renderer/']

const DOCS_BASE = 'src/content/docs/'

// entry.filePath de collections com o loader glob()/docsLoader() é relativo
// à raiz do projeto (ex: "src/content/docs/RULES.md") — isBlocked() espera
// o path relativo ao content base (ex: "RULES.md").
export function toRelativeDocPath(filePath: string): string {
  return filePath.startsWith(DOCS_BASE) ? filePath.slice(DOCS_BASE.length) : filePath
}

export function isBlocked(path: string): boolean {
  const normalizedPath = path.toLowerCase()
  if (FLOOR_EXACT.has(normalizedPath)) return true
  if (FLOOR_PREFIXES.some(prefix => normalizedPath.startsWith(prefix.toLowerCase()))) return true
  const cfg = getPortalConfig()
  const exact = cfg.navigation?.blocklist?.exact ?? []
  const prefixes = cfg.navigation?.blocklist?.prefixes ?? []
  if (exact.some(e => normalizedPath === e.toLowerCase())) return true
  return prefixes.some(prefix => normalizedPath.startsWith(prefix.toLowerCase()))
}

export function getBlocklist(): string[] {
  const cfg = getPortalConfig()
  const extraExact = cfg.navigation?.blocklist?.exact ?? []
  const extraPrefixes = cfg.navigation?.blocklist?.prefixes ?? []
  return [...FLOOR_EXACT, ...FLOOR_PREFIXES, ...extraExact, ...extraPrefixes]
}

export function toTitleCase(filenameWithoutExt: string): string {
  const withoutNumericPrefix = filenameWithoutExt.replace(/^\d+[-_]/, '')
  const words = withoutNumericPrefix.split(/[-_\s]+/).filter(Boolean)
  if (words.length === 0) return filenameWithoutExt
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

// Nomes de pasta/arquivo em ASCII (sem acento) não podem ser recuperados
// automaticamente pro português — quem conhece o vocabulário é o
// repositório de conteúdo, via navigation.labelOverrides no .upcontent/config.json.
// Fallback é sempre toTitleCase(name) quando não há override.
export function resolveLabel(name: string): string {
  const override = getPortalConfig().navigation?.labelOverrides?.[name.toLowerCase()]
  return override ?? toTitleCase(name)
}
