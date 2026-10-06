import { readdirSync, statSync } from 'node:fs'
import { isBlocked, resolveLabel } from './content-blocklist'
import { hasRootIndex } from './homepage'
import { getPortalConfig } from './portal-config'

const MARKDOWN_EXTENSION = /\.(?:markdown|mdown|mkdn|mkd|mdwn|md|mdx)$/i

// Diretórios de topo que existem só como agrupamento estrutural do
// repositório de conteúdo, sem valor de navegação — seus filhos diretos
// são promovidos pra sidebar de topo em vez de aparecerem aninhados um
// nível a mais (ex: "domains/historico" vira grupo "Historico" direto,
// não "domains" > "historico").
const FLATTEN_TOP_LEVEL_DIRS = new Set(['domains', 'shared'])

interface SidebarGroup {
  label: string
  items: SidebarEntry[]
}

interface SidebarLink {
  slug: string
  label?: string
}

type SidebarEntry = SidebarGroup | SidebarLink

function isSidebarGroup(entry: SidebarEntry): entry is SidebarGroup {
  return 'items' in entry
}

function labelOf(entry: SidebarEntry): string {
  return isSidebarGroup(entry) ? entry.label : entry.slug
}

function sortEntries(entries: SidebarEntry[]): SidebarEntry[] {
  return [...entries].sort((a, b) => labelOf(a).localeCompare(labelOf(b), 'pt-BR'))
}

function toSidebarSlug(relativePath: string, homepage: 'index' | 'readme'): string {
  const slug = relativePath.replace(MARKDOWN_EXTENSION, '').toLowerCase()
  if (slug === homepage) return 'index'
  if (slug === 'readme') return 'readme'
  return slug.endsWith('/index') ? slug.slice(0, -'/index'.length) : slug
}

function sidebarFileEntry(relativePath: string, homepage: 'index' | 'readme'): SidebarLink {
  const slug = toSidebarSlug(relativePath, homepage)
  return slug === 'readme' ? { slug, label: resolveLabel('readme') } : { slug }
}

// Lista uma pasta ignorando dotfiles/dot-dirs e caminhos bloqueados
// (ver content-blocklist.ts) — relPath é relativo à raiz do content, sem
// barra inicial (ex: "domains/historico").
function listVisible(absDir: string, relPath: string): { name: string; isDir: boolean }[] {
  return readdirSync(absDir)
    .filter(name => !name.startsWith('.'))
    .map(name => {
      const abs = `${absDir}/${name}`
      const isDir = statSync(abs).isDirectory()
      const rel = relPath ? `${relPath}/${name}` : name
      return { name, isDir, rel }
    })
    .filter(({ isDir, rel }) => !isBlocked(isDir ? `${rel}/` : rel))
    .map(({ name, isDir }) => ({ name, isDir }))
}

// Constrói recursivamente o grupo de sidebar de um diretório — cada nível
// (não só o de topo) recebe label em Title Case, porque o autogenerate
// nativo do Starlight usa o nome literal da pasta em todo nível abaixo do
// primeiro e não expõe nenhum jeito de sobrescrever isso via config.
function buildDir(absDir: string, relPath: string, homepage: 'index' | 'readme'): SidebarEntry[] {
  const entries: SidebarEntry[] = []
  for (const { name, isDir } of listVisible(absDir, relPath)) {
    const rel = relPath ? `${relPath}/${name}` : name
    if (isDir) {
      const items = buildDir(`${absDir}/${name}`, rel, homepage)
      if (items.length > 0) entries.push({ label: resolveLabel(name), items })
    } else if (MARKDOWN_EXTENSION.test(name)) {
      // Slug do Starlight = path relativo ao content root, sem extensão,
      // minúsculo (ver ADR/nota em Footer.astro — mesmo mecanismo).
      entries.push(sidebarFileEntry(rel, homepage))
    }
  }
  return sortEntries(entries)
}

// Ponto de entrada: monta a sidebar completa a partir da raiz do content,
// achatando FLATTEN_TOP_LEVEL_DIRS um nível. docsRoot deve ser um path
// absoluto sem barra final; retorna [] se não existir (ex: astro check
// rodando sem o symlink de conteúdo criado).
export function buildSidebar(docsRoot: string): SidebarEntry[] {
  let topLevel: { name: string; isDir: boolean }[]
  try {
    topLevel = listVisible(docsRoot, '')
  } catch {
    return []
  }

  const configuredRoots = getPortalConfig().navigation?.roots
  const homepage = hasRootIndex(docsRoot) ? 'index' : 'readme'
  const visibleTopLevel = configuredRoots
    ? topLevel.filter(({ name }) => configuredRoots.includes(name))
    : topLevel

  const entries: SidebarEntry[] = []
  for (const { name, isDir } of visibleTopLevel) {
    if (isDir && FLATTEN_TOP_LEVEL_DIRS.has(name)) {
      entries.push(...buildDir(`${docsRoot}/${name}`, name, homepage))
    } else if (isDir) {
      const items = buildDir(`${docsRoot}/${name}`, name, homepage)
      if (items.length > 0) entries.push({ label: resolveLabel(name), items })
    } else if (MARKDOWN_EXTENSION.test(name)) {
      entries.push(sidebarFileEntry(name, homepage))
    }
  }

  // A homepage fica fixa em primeiro, com o label configurável "Home" por
  // padrão, sem competir alfabeticamente com as outras páginas.
  const homepageIndex = entries.findIndex(e => !isSidebarGroup(e) && e.slug === 'index')
  const homepageEntry = homepageIndex >= 0 ? entries.splice(homepageIndex, 1)[0] : undefined
  const sorted = sortEntries(entries)
  return homepageEntry ? [{ slug: 'index', label: resolveLabel(homepage, 'Home') }, ...sorted] : sorted
}
