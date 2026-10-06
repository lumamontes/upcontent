---
title: Deployment
description: Publish the generated static portal to GitHub Pages or another static host.
sidebar:
  order: 1
---

Upcontent produces static files. The deployment job only needs to build the content and upload `dist/` to a host that serves HTML, CSS, JavaScript, and assets.

## Choose a path

- [GitHub Pages](github-pages/): use the included workflow and repository settings.
- [Other static hosts](static-hosts/): publish `dist/` to Netlify, Vercel, S3, or another file host.
- [Release the npm package](npm/): publish versioned package releases through GitHub Actions.
- [Environment variables](../customization/environment/): set the URL and base path for the host.

## Before publishing

```sh
pnpm test
pnpm check
make build CONTENT_PATH=/path/to/your-consumer-repo
```

Then confirm that `dist/` contains the generated pages and Pagefind assets.
