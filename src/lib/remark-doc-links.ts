import { visit } from 'unist-util-visit'
import { resolveMarkdownLink } from './portal-routes'

interface LinkNode {
  type: 'link'
  url: string
}

export interface DocumentLinkOptions {
  contentRoot: string
  basePath?: string
}

export function remarkDocumentLinks(options: DocumentLinkOptions) {
  return (tree: any, file: { path?: string }) => {
    if (!file.path) return
    visit(tree, 'link', (node: LinkNode) => {
      node.url = resolveMarkdownLink(node.url, file.path!, options.contentRoot, options.basePath)
    })
  }
}
