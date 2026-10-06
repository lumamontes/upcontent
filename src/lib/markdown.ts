export const MARKDOWN_EXTENSIONS = ['.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.md', '.mdx'] as const
export const MARKDOWN_EXTENSION = /\.(?:markdown|mdown|mkdn|mkd|mdwn|md|mdx)$/i

export function stripMarkdownExtension(path: string): string {
  return path.replace(MARKDOWN_EXTENSION, '')
}
