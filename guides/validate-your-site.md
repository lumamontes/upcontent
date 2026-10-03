---
title: Validate your site
description: Check content, configuration, generated output, and browser behavior before publishing.
sidebar:
  order: 2
---

Use this checklist before opening a pull request or publishing a consumer repository.

## Run the build contract

```sh
pnpm test
pnpm check
make build CONTENT_PATH=.
make check-external
git diff --check
```

The tests cover content loading, title fallback, navigation, blocklists, wiki links, callouts, Mermaid transformation, and structured previews. The external build confirms that a separate consumer repository works too.

## Check the browser

Start the portal locally:

```sh
make dev CONTENT_PATH=.
```

Open the pages listed in the [capability showcase](../showcase/) and check:

- The logo appears once and the site name is clear.
- The sidebar groups are understandable and the active page is easy to find.
- Search, internal links, and the table of contents work.
- Light and dark themes remain readable.
- Callouts, Mermaid, JSON, YAML, and CSV examples render correctly.
- The layout works at desktop and mobile widths.
- The browser console has no required-asset errors.

## Check content boundaries

The build should not publish:

- `.upcontent/` files
- Protected repository internals
- Consumer blocklisted paths
- Documents with malformed or traversal wiki links

When a change affects blocklists or navigation roots, verify both the generated route list and the sidebar. Hiding a link is not enough; excluded content must be absent before parsing.

## Record the result

If a check fails, record the source page, route, and browser or build output in the relevant engineering ticket. Do not mark a documentation change complete based only on a successful local page load.
