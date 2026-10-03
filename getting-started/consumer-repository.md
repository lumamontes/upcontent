---
title: Set up a consumer repository
description: Prepare a documentation repository to be rendered by Upcontent.
sidebar:
  order: 2
---

A consumer repository is the source of truth for a published portal. It contains the documentation and the `.upcontent/` directory that describes the consumer's identity and presentation.

Upcontent itself is also a GitHub repository. This project uses the same consumer contract described here: the repository root is the golden consumer, while `src/` contains the renderer.

## This site as an example

The repository behind this site keeps the renderer and its golden consumer together:

```text
upcontent/
├── .upcontent/
│   ├── config.json
│   ├── favicon.svg
│   ├── logo.svg
│   └── portal.css
├── README.md
├── getting-started/
├── guides/
├── customization/
├── deployment/
├── SHOWCASE.mdx
├── package.json
└── .github/workflows/
```

The public pages are Markdown or MDX files in the repository root. The renderer implementation lives separately under `src/`; it is not part of the published sidebar. A separate consumer repository only needs its own documentation and `.upcontent/` directory.

This site's actual `.upcontent/config.json` uses the same fields available to consumers:

```json
{
  "site": {
    "title": "Upcontent",
    "description": "Create a beautiful, customizable Starlight portal from your documentation repository.",
    "url": "https://lumamontes.github.io/upcontent",
    "logo": {
      "src": ".upcontent/logo.svg",
      "alt": "",
      "replacesTitle": false
    },
    "favicon": ".upcontent/favicon.svg"
  },
  "repo": {
    "url": "https://github.com/lumamontes/upcontent"
  },
  "theme": {
    "customCss": [".upcontent/portal.css"]
  },
  "starlight": {
    "lastUpdated": true,
    "pagination": true
  }
}
```

The filename is `.upcontent/config.json`; `portal.json` is not part of the current contract.

## Recommended structure

```text
my-consumer-repo/
├── .upcontent/
│   ├── config.json
│   ├── favicon.svg
│   ├── logo.svg
│   └── theme.css
├── getting-started/
│   └── first-page.md
├── guides/
│   └── operating-the-system.md
└── README.md
```

The structure is a recommendation, not a requirement. Existing repositories can keep their current folders and use `navigation.roots` and `navigation.labelOverrides` to shape the sidebar.

## Add the Upcontent configuration

Create `.upcontent/config.json`:

```json
{
  "site": {
    "title": "Engineering Docs",
    "description": "Documentation for the engineering team.",
    "logo": {
      "src": ".upcontent/logo.svg",
      "alt": "Engineering Docs"
    },
    "favicon": ".upcontent/favicon.svg"
  },
  "repo": {
    "url": "https://github.com/acme/engineering-docs"
  },
  "theme": {
    "customCss": [".upcontent/theme.css"]
  }
}
```

Relative asset paths resolve from the consumer repository. Absolute URLs are also supported for externally hosted assets.

See the [capability showcase](../../showcase/) and [configuration reference](../../customization/config-json/) for the supported options.

## Bootstrap with the CLI

From the consumer repository root:

```sh
pnpm dlx upcontent init
```

This creates the `.upcontent/` directory and a GitHub Pages workflow. The command preserves existing files and asks you to use `--force` before replacing generated files.

Preview the repository locally before publishing:

```sh
pnpm dlx upcontent dev
```

## Choose the content root

Use the consumer repository itself:

```sh
make dev CONTENT_PATH=/path/to/my-consumer-repo
```

For separate portal and content repositories, check out both repositories in the workflow and pass the content checkout as `CONTENT_PATH`.

## Keep internal material private from navigation

The portal always excludes its protected internal paths. Add consumer-specific paths with `navigation.blocklist`:

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

Blocklisted files are excluded before content parsing. They do not become pages or sidebar links.

:::caution
Blocklisting is a build-time content boundary, not an access-control system. Do not publish secrets or rely on a public static host to protect a private document.
:::
