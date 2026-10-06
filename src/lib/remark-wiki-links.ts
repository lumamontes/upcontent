import { existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { visit } from 'unist-util-visit'
import { PRODUCT_NAME } from './product-identity'
import { hasRootIndex } from './homepage'
import { MARKDOWN_EXTENSION, MARKDOWN_EXTENSIONS, stripMarkdownExtension } from './markdown'
import { toPortalRoute } from './portal-routes'

interface MdastText {
  type: 'text'
  value: string
}

interface MdastLink {
  type: 'link'
  url: string
  title: null
  children: MdastText[]
}

interface MdastParent {
  type: string
  children: (MdastText | MdastLink | unknown)[]
}

interface WikiLinkOptions {
  contentRoot?: string
  basePath?: string
  failOnBrokenLinks?: boolean
}

function slugifyPath(ref: string): string {
  return ref.toLowerCase().replace(/\s+/g, '-').replace(/[^\w/-]/g, '')
}

function slugifyHeading(heading: string): string {
  return heading.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

function pageRoute(pagePart: string, basePath: string, homepage: 'index' | 'readme'): string {
  const withoutExtension = stripMarkdownExtension(pagePart)
  return toPortalRoute(`${slugifyPath(withoutExtension)}.md`, basePath, homepage)
}

// Constrói a URL a partir da referência crua entre colchetes: [[#heading]] vira
// anchor local; [[page]] vira path; [[page#heading]] combina os dois — path e
// heading são fatiados (slugify) separadamente pra não perder o separador "#".
function buildUrl(ref: string, basePath = '/', homepage: 'index' | 'readme' = 'readme'): string {
  if (ref.startsWith('#')) return '#' + slugifyHeading(ref.slice(1))
  const hashIndex = ref.indexOf('#')
  if (hashIndex >= 0) {
    const pagePart = ref.slice(0, hashIndex)
    const headingPart = ref.slice(hashIndex + 1)
    return `${pageRoute(pagePart, basePath, homepage)}#${slugifyHeading(headingPart)}`
  }
  return pageRoute(ref, basePath, homepage)
}

function pagePartOf(ref: string): string {
  const hashIndex = ref.indexOf('#')
  return (hashIndex >= 0 ? ref.slice(0, hashIndex) : ref).replace(/^\/+/, '')
}

function wikiLinkResolves(ref: string, contentRoot: string): boolean {
  const pagePart = pagePartOf(ref)
  if (!pagePart) return true
  const target = resolve(contentRoot, pagePart)
  if (!target.startsWith(`${resolve(contentRoot)}${sep}`)) return false
  if (/\.[^/]+$/i.test(pagePart) && !MARKDOWN_EXTENSION.test(pagePart)) return false
  const withoutExtension = stripMarkdownExtension(target)
  return MARKDOWN_EXTENSIONS.some(extension => existsSync(`${withoutExtension}${extension}`) || existsSync(resolve(target, `index${extension}`)))
}

// Remark plugin: converts [[page]] / [[#heading]] / [[page#heading]] / [[page|label]]
// Obsidian wiki links pra links markdown normais.
export function remarkWikiLinks(options: WikiLinkOptions = {}) {
  return (tree: MdastParent, file: { path?: string }) => {
    const homepage = options.contentRoot && hasRootIndex(options.contentRoot) ? 'index' : 'readme'
    visit(tree, 'text', (node: MdastText, index: number | undefined, parent: MdastParent | undefined) => {
      if (!node.value.includes('[[')) return
      const parts: (MdastText | MdastLink)[] = []
      const pattern = /\[\[([^\]]+)\]\]/g
      const openingMarkers = node.value.match(/\[\[/g)?.length ?? 0
      const closingMarkers = node.value.match(/\]\]/g)?.length ?? 0
      if (options.failOnBrokenLinks && openingMarkers !== closingMarkers) {
        const source = file.path ? ` in ${file.path}` : ''
        throw new Error(`[${PRODUCT_NAME}] Malformed wiki link${source}`)
      }
      let lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(node.value)) !== null) {
        if (match.index > lastIndex) parts.push({ type: 'text', value: node.value.slice(lastIndex, match.index) })
        const inner = match[1]
        const pipeIdx = inner.indexOf('|')
        const ref = pipeIdx >= 0 ? inner.slice(0, pipeIdx) : inner
        const label = pipeIdx >= 0 ? inner.slice(pipeIdx + 1) : ref.replace(/^#/, '')
        if (options.failOnBrokenLinks && options.contentRoot && !wikiLinkResolves(ref, options.contentRoot)) {
          const source = file.path ? ` in ${file.path}` : ''
          throw new Error(`[${PRODUCT_NAME}] Broken wiki link [[${inner}]]${source}`)
        }
        const url = buildUrl(ref, options.basePath, homepage)
        parts.push({ type: 'link', url, title: null, children: [{ type: 'text', value: label }] })
        lastIndex = match.index + match[0].length
      }
      if (!parts.length) {
        if (options.failOnBrokenLinks && node.value.includes('[[')) {
          const source = file.path ? ` in ${file.path}` : ''
          throw new Error(`[${PRODUCT_NAME}] Malformed wiki link${source}`)
        }
        return
      }
      if (lastIndex < node.value.length) parts.push({ type: 'text', value: node.value.slice(lastIndex) })
      if (parent && index !== undefined) {
        parent.children.splice(index, 1, ...parts)
        return index + parts.length
      }
    })
  }
}
