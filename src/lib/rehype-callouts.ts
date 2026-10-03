import { visit } from 'unist-util-visit'

interface HastText {
  type: 'text'
  value: string
}

interface HastElement {
  type: 'element'
  tagName: string
  properties?: Record<string, unknown>
  children: (HastElement | HastText)[]
}

const ICONS: Record<string, string> = {
  info: 'ℹ️',
  note: '📝',
  warning: '⚠️',
  danger: '🚨',
  tip: '💡',
  important: '❗',
  caution: '⚠️',
}

// Rehype plugin: converts > [!type] Title callouts (formato Obsidian) AFTER remark-to-rehype
export function rehypeCallouts() {
  return (tree: HastElement) => {
    visit(tree, 'element', (node: HastElement) => {
      if (node.tagName !== 'blockquote') return
      const firstP = node.children?.find((c): c is HastElement => c.type === 'element' && c.tagName === 'p')
      if (!firstP) return
      const firstText = firstP.children?.find((c): c is HastText => c.type === 'text')
      if (!firstText) return
      const match = firstText.value.match(/^\[!([\w]+)\](?:\s+(.+))?/)
      if (!match) return

      const type = match[1].toLowerCase()
      const titleText = match[2]?.trim() ?? (type.charAt(0).toUpperCase() + type.slice(1))
      const afterMarker = firstText.value.replace(/^\[![\w]+\][^\n]*\n?/, '').trimStart()

      if (afterMarker) {
        firstText.value = afterMarker
      } else {
        firstP.children = firstP.children.filter(c => c !== firstText)
        if (firstP.children.length === 0) node.children = node.children.filter(c => c !== firstP)
      }

      node.tagName = 'div'
      node.properties = { className: [`callout`, `callout-${type}`] }

      node.children.unshift({
        type: 'element', tagName: 'div',
        properties: { className: ['callout-title'] },
        children: [
          { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: ICONS[type] ?? 'ℹ️' }] },
          { type: 'text', value: ' ' + titleText },
        ],
      })
    })
  }
}
