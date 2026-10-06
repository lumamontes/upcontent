import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { i18nLoader } from '@astrojs/starlight/loaders'
import { glob } from 'astro/loaders'
import type { Loader, LoaderContext } from 'astro/loaders'
import { getBlocklist, isBlocked, toRelativeDocPath, toTitleCase } from './lib/content-blocklist'
import { hasRootIndex } from './lib/homepage'
import { MARKDOWN_EXTENSION, stripMarkdownExtension } from './lib/markdown'
import { getPortalConfig } from './lib/portal-config'

export { getBlocklist, isBlocked, toRelativeDocPath }

// Campos de domínio específicos deste portal, além do schema padrão do
// Starlight (title, description, sidebar, etc). Mantido isolado do
// docsSchema() do Starlight pra ser testável sem precisar de um
// SchemaContext (o título obrigatório do Starlight é resolvido pelo loader,
// não pelo schema — ver resolveTitle()).
export const domainFieldsSchema = z.object({
  canonical: z.string().refine(value => {
    try {
      const url = new URL(value)
      return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password
    } catch {
      return false
    }
  }, 'canonical must be an absolute HTTP(S) URL').optional(),
  image: z.string().optional(),
  noindex: z.boolean().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  created: z.string().or(z.date().transform(d => d.toISOString().split('T')[0])).optional(),
  updated: z.string().or(z.date().transform(d => d.toISOString().split('T')[0])).optional(),
  teams: z.array(z.string()).optional(),
  impacted_teams: z.array(z.string()).optional(),
  domains: z.array(z.string()).optional(),
  repos: z.array(z.string()).optional(),
  areas: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  aliases: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
})

// Resolve o título obrigatório do Starlight ANTES da validação do schema:
// usa content.titleField do .upcontent/config.json se presente no frontmatter,
// senão deriva do nome do arquivo em Title Case (prefixo numérico removido).
// Muda `data` in-place — é chamado de dentro do generateId/parseData do
// loader, no ponto em que o frontmatter ainda não foi validado.
export function resolveTitle(relativeFilePath: string, data: Record<string, unknown>): void {
  if (typeof data.title === 'string' && data.title.trim().length > 0) return

  const titleField = getPortalConfig().content?.titleField ?? 'title'
  if (titleField !== 'title') {
    const custom = data[titleField]
    if (typeof custom === 'string' && custom.trim().length > 0) {
      data.title = custom
      return
    }
  }

  const filename = relativeFilePath.split('/').pop() ?? relativeFilePath
  const withoutExt = filename.replace(MARKDOWN_EXTENSION, '')
  data.title = toTitleCase(withoutExt)
}

export function toCollectionId(relativeFilePath: string, homepage: 'index' | 'readme' = 'readme'): string {
  const normalized = stripMarkdownExtension(relativeFilePath.split(path.sep).join('/')).toLowerCase()
  if (normalized === homepage) return 'index'
  if (normalized === 'readme') return 'readme'
  return normalized.endsWith('/index') ? normalized.slice(0, -'/index'.length) : normalized
}

function toCaseInsensitiveGlob(value: string): string {
  return value.replace(/[A-Za-z]/g, character => `[${character.toLowerCase()}${character.toUpperCase()}]`)
}

// Carrega Markdown com glob(): injeta o fallback de título antes da validação
// e aplica a blocklist como exclusões de glob antes do parse dos documentos.
function portalDocsLoader(): Loader {
  return {
    name: 'portal-docs-loader',
    async load(context: LoaderContext) {
      const docsBasePath = fileURLToPath(new URL('src/content/docs/', context.config.root))
      const homepage = hasRootIndex(docsBasePath) ? 'index' : 'readme'
      const patterns = [
        '**/[^_]*.{markdown,mdown,mkdn,mkd,mdwn,md,mdx}',
        ...(homepage === 'index' ? ['![rR][eE][aA][dD][mM][eE].{markdown,mdown,mkdn,mkd,mdwn,md,mdx}'] : []),
        ...getBlocklist().map(blocked => `!${toCaseInsensitiveGlob(blocked)}${blocked.endsWith('/') ? '**' : ''}`),
      ]
      const wrappedContext: LoaderContext = {
        ...context,
        parseData: async (props) => {
          if (props.filePath) {
            const relative = path.relative(docsBasePath, props.filePath).split(path.sep).join('/')
            resolveTitle(relative, props.data)
          }
          return context.parseData(props)
        },
      }
      await glob({ base: docsBasePath, pattern: patterns, generateId: ({ entry }) => toCollectionId(entry, homepage) }).load(wrappedContext)
    },
  }
}

export const collections = {
  docs: defineCollection({
        loader: portalDocsLoader(),
    schema: docsSchema({ extend: domainFieldsSchema }),
  }),
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema(),
  }),
}
