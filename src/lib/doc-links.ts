import type { CollectionEntry } from 'astro:content'
import { stripMarkdownExtension } from './markdown'

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
    const normalized = stripMarkdownExtension(ref).toLowerCase()
    const entry = allDocs.find(d => stripMarkdownExtension(d.id).toLowerCase() === normalized)
    if (!entry) return []
    const entryId = stripMarkdownExtension(entry.id).toLowerCase()
    const slug = entryId === 'index' ? '' : entryId === 'readme' ? 'readme/' : entryId
    const title = (entry.data as Record<string, unknown>).title as string | undefined ?? slug
    return [{ slug, title }]
  })
}
