---
title: Navigation
description: Shape the sidebar and keep internal material out of the published portal.
sidebar:
  order: 4
---

The sidebar is generated from the consumer file structure. Use configuration when the default filesystem order is not the right experience for readers.

If the repository has a root `index.md`, it becomes the website homepage and a root `README.md` remains available at `/readme/`. Repositories without `index.md` keep the backwards-compatible behavior where `README.md` is the homepage.

## Select top-level roots

```json
{
  "navigation": {
    "roots": [
      "README.md",
      "getting-started",
      "guides",
      "reference"
    ]
  }
}
```

`roots` limits the files and folders shown at the top level. It does not move files or change their URLs.

## Rename generated labels

```json
{
  "navigation": {
    "labelOverrides": {
      "api": "API reference",
      "runbooks": "Runbooks"
    }
  }
}
```

Keys are matched case-insensitively. Use labels that describe the reader's destination, not the team's internal shorthand.

## Exclude content before parsing

```json
{
  "navigation": {
    "blocklist": {
      "exact": ["notes.md"],
      "prefixes": ["drafts/", "internal/"]
    }
  }
}
```

Blocklisted paths are excluded from the content collection and sidebar before Markdown is parsed. The portal also protects internal paths such as `.upcontent/`, `.github/`, `src/`, and `node_modules/`.

Blocklisting is not access control. Do not put secrets in a repository that will be published to a public host.
