import { readdirSync, statSync } from 'node:fs'
import { isBlocked } from './content-blocklist'
import { MARKDOWN_EXTENSION, stripMarkdownExtension } from './markdown'

export function hasRootIndex(docsRoot: string): boolean {
  try {
    return readdirSync(docsRoot).some(name =>
      MARKDOWN_EXTENSION.test(name)
      && statSync(`${docsRoot}/${name}`).isFile()
      && stripMarkdownExtension(name).toLowerCase() === 'index'
      && !isBlocked(name),
    )
  } catch {
    return false
  }
}
