import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface PortalConfigNavigation {
  roots?: string[]
  blocklist?: {
    exact?: string[]
    prefixes?: string[]
  }
  // Sobrescreve o label derivado automaticamente (Title Case, sem acentos)
  // pro nome de pasta/arquivo indicado — chave em minúsculo, sem extensão
  // (ex: "historico" -> "Histórico"). Sem isso não há como recuperar
  // acentuação a partir de um nome de arquivo ASCII.
  labelOverrides?: Record<string, string>
}

export interface PortalConfigLogo {
  src: string
  alt?: string
  replacesTitle?: boolean
}

export interface PortalConfigSite {
  title?: string
  description?: string
  url?: string
  logo?: PortalConfigLogo
  favicon?: string
}

export interface PortalConfigTheme {
  customCss?: string[]
}

export interface PortalConfigStarlight {
  social?: { icon: string; label: string; href: string }[]
  tableOfContents?: false | { minHeadingLevel?: number; maxHeadingLevel?: number }
  lastUpdated?: boolean
  pagination?: boolean
  expressiveCode?: false | { styleOverrides?: Record<string, string> }
}

export interface PortalConfig {
  site?: PortalConfigSite
  repo?: { url?: string }
  theme?: PortalConfigTheme
  starlight?: PortalConfigStarlight
  navigation?: PortalConfigNavigation
  content?: { titleField?: string }
}

const CONFIG_PATH = join(process.cwd(), 'src/content/docs/.upcontent/config.json')

let _cache: PortalConfig | null = null

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const values = value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  return values.length > 0 ? values : []
}

function asStringRecord(value: unknown): Record<string, string> | undefined {
  const record = asRecord(value)
  const entries: [string, string][] = []
  for (const [key, item] of Object.entries(record)) {
    if (typeof item === 'string') entries.push([key, item])
  }
  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function asSocialLinks(value: unknown): PortalConfigStarlight['social'] {
  if (!Array.isArray(value)) return undefined
  const links = value.flatMap(item => {
    const link = asRecord(item)
    const icon = asString(link.icon)
    const label = asString(link.label)
    const href = asString(link.href)
    return icon && label && href ? [{ icon, label, href }] : []
  })
  return links.length > 0 ? links : []
}

function asHeadingLevel(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6 ? value : undefined
}

function asTableOfContents(value: unknown): PortalConfigStarlight['tableOfContents'] {
  if (value === false) return false
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined

  const raw = asRecord(value)
  const minHeadingLevel = asHeadingLevel(raw.minHeadingLevel)
  const maxHeadingLevel = asHeadingLevel(raw.maxHeadingLevel)
  if (minHeadingLevel !== undefined && maxHeadingLevel !== undefined && minHeadingLevel > maxHeadingLevel) {
    return undefined
  }
  return { minHeadingLevel, maxHeadingLevel }
}

function normalizeConfig(value: unknown): PortalConfig {
  const raw = asRecord(value)
  const rawSite = asRecord(raw.site)
  const rawLogo = asRecord(rawSite.logo)
  const rawRepo = asRecord(raw.repo)
  const rawTheme = asRecord(raw.theme)
  const rawStarlight = asRecord(raw.starlight)
  const rawExpressiveCode = rawStarlight.expressiveCode
  const rawExpressive = asRecord(rawExpressiveCode)
  const rawNavigation = asRecord(raw.navigation)
  const rawBlocklist = asRecord(rawNavigation.blocklist)
  const rawContent = asRecord(raw.content)

  const logoSrc = asString(rawLogo.src)
  const logo = logoSrc
    ? { src: logoSrc, alt: asString(rawLogo.alt), replacesTitle: rawLogo.replacesTitle === true }
    : undefined

  return {
    site: {
      title: asString(rawSite.title),
      description: asString(rawSite.description),
      url: asString(rawSite.url),
      logo,
      favicon: asString(rawSite.favicon),
    },
    repo: { url: asString(rawRepo.url) },
    theme: { customCss: asStringArray(rawTheme.customCss) },
    starlight: {
      social: asSocialLinks(rawStarlight.social),
      tableOfContents: asTableOfContents(rawStarlight.tableOfContents),
      lastUpdated: typeof rawStarlight.lastUpdated === 'boolean' ? rawStarlight.lastUpdated : undefined,
      pagination: typeof rawStarlight.pagination === 'boolean' ? rawStarlight.pagination : undefined,
      expressiveCode: rawExpressiveCode === false
        ? false
        : rawExpressiveCode && typeof rawExpressiveCode === 'object'
          ? { styleOverrides: asStringRecord(rawExpressive.styleOverrides) }
          : undefined,
    },
    navigation: {
      roots: asStringArray(rawNavigation.roots),
      blocklist: {
        exact: asStringArray(rawBlocklist.exact),
        prefixes: asStringArray(rawBlocklist.prefixes),
      },
      labelOverrides: asStringRecord(rawNavigation.labelOverrides),
    },
    content: { titleField: asString(rawContent.titleField) },
  }
}

export function getPortalConfig(): PortalConfig {
  if (_cache !== null) return _cache
  if (!existsSync(CONFIG_PATH)) {
    _cache = {}
    return _cache
  }
  try {
    _cache = normalizeConfig(JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')))
  } catch {
    _cache = {}
  }
  return _cache
}

// Exposed for testing — resets the singleton cache
export function _resetPortalConfigCache(): void {
  _cache = null
}
