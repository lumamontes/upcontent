import { existsSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'

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
  if (extname(path).toLowerCase() === '.md' || extname(path).toLowerCase() === '.mdx') {
    return existsSync(path) ? path : undefined
  }
  if (existsSync(`${path}.md`)) return `${path}.md`
  if (existsSync(`${path}.mdx`)) return `${path}.mdx`
  if (path.endsWith('/') && existsSync(`${path}index.md`)) return `${path}index.md`
  if (path.endsWith('/') && existsSync(`${path}index.mdx`)) return `${path}index.mdx`
  return undefined
}

export function toPortalRoute(path: string, basePath = '/'): string {
  const withoutExtension = path.replace(/\.mdx?$/i, '')
  const normalizedPath = withoutExtension.toLowerCase()
  const route = normalizedPath === 'readme'
    ? ''
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
  return `${toPortalRoute(relativePath, basePath)}${suffix}`
}
