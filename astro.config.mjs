import { fileURLToPath } from 'node:url'
import { cpSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { basename, resolve, sep } from 'node:path'
import { unified } from '@astrojs/markdown-remark'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { visit } from 'unist-util-visit'
import { rehypeCallouts } from './src/lib/rehype-callouts.ts'
import { remarkStripDuplicateTitle } from './src/lib/remark-strip-duplicate-title.ts'
import { remarkStructuredDataPreview } from './src/lib/remark-structured-data-preview.ts'
import { remarkWikiLinks } from './src/lib/remark-wiki-links.ts'
import { getPortalConfig } from './src/lib/portal-config.ts'
import { buildSidebar } from './src/lib/sidebar.ts'
import { PRODUCT_NAME, PRODUCT_TAGLINE } from './src/lib/product-identity.ts'

const docsRoot = fileURLToPath(new URL('./src/content/docs', import.meta.url))
const portalConfig = getPortalConfig()

function resolvePortalAsset(assetPath) {
  if (!assetPath || assetPath.startsWith('http')) return assetPath
  if (assetPath.startsWith('/')) return assetPath

  const source = resolve(docsRoot, assetPath)
  if (!source.startsWith(`${resolve(docsRoot)}${sep}`) || !existsSync(source) || !statSync(source).isFile()) {
    console.warn(`[${PRODUCT_NAME}] Portal asset not found: ${source}`)
    return undefined
  }

  const targetDir = resolve(process.cwd(), 'public/upcontent-assets')
  mkdirSync(targetDir, { recursive: true })
  const targetName = basename(source)
  cpSync(source, resolve(targetDir, targetName))
  return `/upcontent-assets/${targetName}`
}

function resolvePortalLogo(logo) {
  if (!logo) return undefined
  if (logo.src.startsWith('http') || logo.src.startsWith('/')) return logo
  const source = resolve(docsRoot, logo.src)
  if (!source.startsWith(`${resolve(docsRoot)}${sep}`) || !existsSync(source) || !statSync(source).isFile()) {
    console.warn(`[${PRODUCT_NAME}] Portal logo not found: ${source}`)
    return undefined
  }
  const targetDir = resolve(process.cwd(), 'src/assets')
  mkdirSync(targetDir, { recursive: true })
  const target = resolve(targetDir, 'consumer-logo.svg')
  cpSync(source, target)
  return { ...logo, src: './src/assets/consumer-logo.svg' }
}

const consumerCss = (portalConfig.theme?.customCss ?? [])
  .map(cssPath => resolve(docsRoot, cssPath))
  .filter(cssPath => {
    if (existsSync(cssPath)) return true
    console.warn(`[${PRODUCT_NAME}] Custom CSS file not found: ${cssPath}`)
    return false
  })

const customCss = ['./src/styles/callouts.css', './src/styles/structured-data-preview.css', ...consumerCss]
const starlightOptions = portalConfig.starlight ?? {}

// Remark plugin: converts ```mermaid blocks to <div class="mermaid"> BEFORE Shiki runs
function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid') return
      // <br/> inside a div becomes a DOM element before Mermaid parses the text, breaking the parser
      const safe = node.value.replace(/<br\s*\/?>/gi, ' ')
      parent.children.splice(index, 1, {
        type: 'html',
        value: `<div class="mermaid">${safe}</div>`,
      })
      return index + 1
    })
  }
}

// Rehype plugin: strip .md suffix from internal hrefs so links resolve correctly
function rehypeStripMdLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return
      const href = node.properties?.href
      if (typeof href !== 'string') return
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) return
      if (href.endsWith('.md')) node.properties.href = href.slice(0, -3)
    })
  }
}

export default defineConfig({
  output: 'static',
  site: portalConfig.seo?.enabled === true
    ? process.env.SITE_URL || portalConfig.site?.url || undefined
    : undefined,
  base: process.env.BASE_PATH || undefined,
  integrations: [
    starlight({
      title: portalConfig.site?.title ?? PRODUCT_NAME,
      description: portalConfig.site?.description ?? PRODUCT_TAGLINE,
      logo: resolvePortalLogo(portalConfig.site?.logo),
      favicon: resolvePortalAsset(portalConfig.site?.favicon),
      components: {
        Head: './src/overrides/Head.astro',
        Footer: './src/overrides/Footer.astro',
      },
      customCss,
      social: starlightOptions.social,
      tableOfContents: starlightOptions.tableOfContents,
      lastUpdated: starlightOptions.lastUpdated,
      pagination: starlightOptions.pagination,
      expressiveCode: starlightOptions.expressiveCode,
      sidebar: buildSidebar(docsRoot),
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkStripDuplicateTitle,
        [remarkWikiLinks, { contentRoot: docsRoot, failOnBrokenLinks: true }],
        remarkMermaid,
        remarkStructuredDataPreview,
      ],
      rehypePlugins: [rehypeCallouts, rehypeStripMdLinks],
    }),
  },
})
