interface MdastNode {
  type: string
  depth?: number
  value?: string
  children?: MdastNode[]
}

function flattenText(node: MdastNode): string {
  if (typeof node.value === 'string') return node.value
  return (node.children ?? []).map(flattenText).join('')
}

// Pura, testável separadamente do vfile do Astro.
export function stripDuplicateTitle(tree: { children: MdastNode[] }, title: string | undefined): boolean {
  if (!title) return false
  const first = tree.children[0]
  if (!first || first.type !== 'heading' || first.depth !== 1) return false
  if (flattenText(first).trim() !== title.trim()) return false
  tree.children.splice(0, 1)
  return true
}

// Muito conteúdo real tem title no frontmatter E repete o mesmo texto como
// primeiro `# H1` do corpo (hábito de markdown feito pra ser lido standalone,
// fora do Starlight) — o Starlight já renderiza o title do frontmatter no
// topo da página, então esse H1 duplicado só produz o título repetido duas
// vezes. Remove o H1 do corpo só quando o texto bate exatamente com o title.
export function remarkStripDuplicateTitle() {
  // tree/file tipados como `any` — o tipo genérico `Node` do unified não
  // garante `children`, então um parâmetro estreito quebra a resolução de
  // overload do Plugin (mesmo problema não aparece nos outros plugins deste
  // projeto porque eles vivem em astro.config.mjs, sem checagem de tipo).
  return (tree: any, file: any) => {
    const title = file?.data?.astro?.frontmatter?.title
    stripDuplicateTitle(tree, typeof title === 'string' ? title : undefined)
  }
}
