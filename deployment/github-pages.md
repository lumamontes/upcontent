---
title: GitHub Pages
description: Publish a consumer repository through the reference GitHub Actions workflow.
sidebar:
  order: 2
---

The reusable Upcontent workflow builds the consumer repository and uploads `dist/` to GitHub Pages. Run `pnpm dlx upcontent init` in the consumer repository to generate the caller workflow.

## Enable Pages

1. Open the repository's **Settings > Pages**.
2. Set the source to **GitHub Actions**.
3. Confirm the workflow has `contents: read`, `pages: write`, and `id-token: write` permissions.
4. Push to `main` or run the deployment workflow manually.

## Configure the site URL

A project site normally needs a base path:

```yaml
env:
  BASE_PATH: /engineering-docs
  SITE_URL: https://acme.github.io/engineering-docs
```

A custom domain normally uses an empty base path:

```yaml
env:
  BASE_PATH: ''
  SITE_URL: https://docs.acme.com
```

Read [Environment variables](../customization/environment/) before changing these values.

## Verify the published site

After deployment, open the published URL and check:

- The header logo and favicon load.
- Internal links include the correct base path.
- Search returns results.
- Light and dark themes work.
- Mermaid, callouts, and structured previews render.
- The browser console has no required-asset errors.
