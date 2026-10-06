import { existsSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { hasRootIndex } from './homepage'

const MARKDOWN_EXTENSION = /\.(?:markdown|mdown|mkdn|mkd|mdwn|md|mdx)$/i

function splitHref(href: string): { path: string; suffix: string } {
  const match = href.match(/^([^?#]*)([?#].*)?$/)
  return { path: match?.[1] ?? href, suffix: match?.[2] ?? '' }
}

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') return ''
  return `/${basePath.replace(/^\/+|\/+$/g, '')}`
}

function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)
}

function documentPath(path: string): string | undefined {
  if (MARKDOWN_EXTENSION.test(path)) {
    return existsSync(path) ? path : undefined
  }
  for (const extension of ['.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.md', '.mdx']) {
    if (existsSync(`${path}${extension}`)) return `${path}${extension}`
    if (path.endsWith('/') && existsSync(`${path}index${extension}`)) return `${path}index${extension}`
  }
  return undefined
}

export function toPortalRoute(path: string, basePath = '/', homepage: 'index' | 'readme' = 'readme'): string {
  const withoutExtension = path.replace(MARKDOWN_EXTENSION, '')
  const normalizedPath = withoutExtension.toLowerCase()
  const route = normalizedPath === homepage
    ? ''
    : normalizedPath === 'readme'
      ? 'readme'
    : normalizedPath.endsWith('/index')
      ? normalizedPath.slice(0, -'/index'.length)
      : normalizedPath
  const prefix = normalizeBasePath(basePath)
  return `${prefix}/${route.replace(/^\/+|\/+$/g, '')}/`.replace(/\/\/$/, '/')
}

export function resolveMarkdownLink(
  href: string,
  sourcePath: string,
  contentRoot: string,
  basePath = '/',
): string {
  if (!href || href.startsWith('#') || isExternalHref(href)) return href

  const { path, suffix } = splitHref(href)
  const candidate = resolve(path.startsWith('/') ? contentRoot : dirname(sourcePath), path)
  const candidatePath = path.endsWith('/') ? `${candidate}${sep}` : candidate
  const root = resolve(contentRoot)
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return href

  const markdownPath = documentPath(candidatePath)
  if (!markdownPath) return href
  const relativePath = relative(root, markdownPath).split(sep).join('/')
  const homepage = hasRootIndex(contentRoot) ? 'index' : 'readme'
  return `${toPortalRoute(relativePath, basePath, homepage)}${suffix}`
}
