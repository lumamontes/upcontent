import type { CollectionEntry } from 'astro:content'

export function buildGitHubUrl(
  repoUrl: string | undefined,
  entryId: string,
  mode: 'view' | 'edit',
): string | undefined {
  if (!repoUrl) return undefined
  const action = mode === 'edit' ? 'edit' : 'blob'
  return `${repoUrl}/${action}/main/${entryId}`
}

export interface RelatedDoc {
  slug: string
  title: string
}

export function resolveRelated(
  related: string[] | undefined,
  allDocs: CollectionEntry<'docs'>[],
): RelatedDoc[] {
  if (!related || related.length === 0) return []
  return related.flatMap(ref => {
    const normalized = ref.endsWith('.md') ? ref : `${ref}.md`
    const entry = allDocs.find(d => d.id === normalized)
    if (!entry) return []
    const slug = normalized.replace(/\.md$/, '')
    const title = (entry.data as Record<string, unknown>).title as string | undefined ?? slug
    return [{ slug, title }]
  })
}
