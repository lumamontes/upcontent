---
title: Site identity
description: Give a consumer portal its own name, assets, and repository links.
sidebar:
  order: 2
---

The consumer controls the visible identity of the published portal.

## Configuration

```json
{
  "site": {
    "title": "Engineering Docs",
    "description": "Documentation for the engineering team.",
    "url": "https://docs.example.com",
    "logo": {
      "src": ".upcontent/logo.svg",
      "alt": "Engineering Docs",
      "replacesTitle": false
    },
    "favicon": ".upcontent/favicon.svg"
  },
  "repo": {
    "url": "https://github.com/acme/engineering-docs"
  }
}
```

## Logo behavior

Use a compact logo mark when the header should display the site title beside it. Set `replacesTitle` to `true` when the logo already contains the full wordmark.

Always provide useful alternative text when the logo communicates identity. Use an empty `alt` when the adjacent visible site title already provides the accessible name.

Relative asset paths resolve from the consumer repository. Logo and favicon assets are copied into the static output during the build.

## Repository links

`repo.url` powers links that let readers view or edit the source document on GitHub. Set it to the repository containing the content, not the repository containing the shared portal renderer.

If the content repository is private, confirm that the links are appropriate for the readers who will receive the published site.
