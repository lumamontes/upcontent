import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { load as parseYaml } from 'js-yaml'

export function getNoindexRoutes(docsRoot: string): Set<string> {
  const routes = new Set<string>()

  function visitDirectory(directory: string): void {
    for (const name of readdirSync(directory)) {
      if (name.startsWith('.')) continue
      const filePath = join(directory, name)
      if (statSync(filePath).isDirectory()) {
        visitDirectory(filePath)
        continue
      }
      if (!/\.mdx?$/i.test(name)) continue

      const source = readFileSync(filePath, 'utf8')
      const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s|$)/)?.[1]
      if (!frontmatter) continue

      let data: unknown
      try {
        data = parseYaml(frontmatter)
      } catch {
        continue
      }
      if (!data || typeof data !== 'object' || Array.isArray(data) || (data as Record<string, unknown>).noindex !== true) {
        continue
      }

      const docPath = relative(docsRoot, filePath).replace(/\\/g, '/')
      const route = docPath.replace(/\.mdx?$/i, '').replace(/\/index$/i, '').toLowerCase()
      routes.add(route === 'readme' ? '/' : `/${route}`)
    }
  }

  try {
    visitDirectory(docsRoot)
  } catch {
    return routes
  }
  return routes
}
