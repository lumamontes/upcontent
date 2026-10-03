---
title: Content behavior
description: Configure page titles, metadata, and the Markdown features available to authors.
sidebar:
  order: 5
---

Upcontent accepts Markdown and MDX files from the consumer repository. Starlight provides the page layout and frontmatter schema; Upcontent adds title fallback, wiki links, callouts, Mermaid, and structured previews.

## Choose a title field

If an existing repository uses a field such as `heading` instead of `title`, configure it once:

```json
{
  "content": {
    "titleField": "heading"
  }
}
```

When the configured field is missing, the portal falls back to the filename. A file named `first-build.md` becomes `First Build`.

## Page metadata

Use frontmatter at the top of a page:

```md
---
heading: Configure a consumer repository
sidebar:
  order: 2
---
```

Use `##` for body sections because the page title is rendered as the top-level heading.

## Supported content features

- Obsidian-style callouts for notes, tips, cautions, and dangers
- Mermaid diagrams with theme-aware rendering and interaction controls
- JSON and YAML data previews
- CSV tables
- `[[wiki links]]` with build-time target validation
- Syntax-highlighted code blocks
- Standard Markdown links, tables, lists, and images

See [Authoring content](../guides/authoring-content/) for writing rules and the [capability showcase](../showcase/) for rendered examples.
