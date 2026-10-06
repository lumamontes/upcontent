import { readdirSync } from 'node:fs'

const MARKDOWN_EXTENSION = /\.(?:markdown|mdown|mkdn|mkd|mdwn|md|mdx)$/i

export function hasRootIndex(docsRoot: string): boolean {
  try {
    return readdirSync(docsRoot).some(name => MARKDOWN_EXTENSION.test(name) && name.replace(MARKDOWN_EXTENSION, '').toLowerCase() === 'index')
  } catch {
    return false
  }
}
