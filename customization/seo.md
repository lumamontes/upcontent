---
title: Search engine visibility
description: Configure discoverability, metadata, canonical URLs, robots, and sitemaps for a portal.
sidebar:
  order: 3
---

Upcontent treats search-engine discoverability as an explicit site-level policy. SEO is disabled by default so a new portal is not indexed accidentally.

## Enable discoverability

Set `seo.enabled` to `true` and provide the canonical site URL:

```json
{
  "site": {
    "title": "Engineering Docs",
    "description": "Documentation for the engineering team.",
    "url": "https://docs.example.com"
  },
  "seo": {
    "enabled": true
  }
}
```

The `site.url` value must be an absolute HTTP(S) URL. `SITE_URL` can provide the URL at build time and takes precedence for the Astro site configuration.

When SEO is enabled, Upcontent generates indexable page metadata, canonical URLs, structured data, `robots.txt`, and a sitemap. The sitemap is published at `sitemap-index.xml`.

## Keep a portal unlisted

Omit `seo.enabled` or set it to `false` when the portal should be publicly accessible but not discoverable. Upcontent then emits:

- `noindex, nofollow` page directives.
- `Disallow: /` in `robots.txt`.
- No indexable sitemap URLs.

This is an unlisted portal, not a private portal. It does not prevent visitors from accessing pages. Use access-controlled hosting when the content must be private.

## Exclude individual pages

An enabled portal can exclude individual pages with page frontmatter:

```yaml
---
title: Internal migration notes
noindex: true
---
```

The page remains available at its normal route, but it is emitted with `noindex, nofollow` and is omitted from the sitemap.

## Page metadata

Use these optional frontmatter fields when a page needs metadata different from the site defaults:

```yaml
---
title: Consumer repository setup
canonical: https://docs.example.com/getting-started/consumer-repository/
image: https://docs.example.com/social-cards/consumer-repository.png
---
```

- `title` controls the page title and generated heading metadata.
- `description` supplies search and social description metadata.
- `canonical` overrides the generated canonical URL and `og:url`. It must be an absolute HTTP(S) URL.
- `image` overrides the site-level social image for that page.
- `noindex` excludes the page from indexing and the sitemap.

## Social previews

Set a default social preview image in the site configuration:

```json
{
  "site": {
    "socialImage": "https://docs.example.com/social-card.png",
    "locale": "en-US"
  }
}
```

Page-level `image` takes precedence over `site.socialImage`. Relative image paths resolve from the content repository and are converted to absolute URLs when a canonical site URL is available.

## Deployment paths

Set `BASE_PATH` when the portal is served below the domain root:

```sh
BASE_PATH=/engineering-docs SITE_URL=https://example.com pnpm exec astro build
```

Generated canonical URLs, sitemap entries, robots output, and internal links include the configured base path. Set `SITE_URL` or `site.url` when the host supports canonical URLs and sitemap generation.

## Validate SEO output

Before publishing, verify:

```sh
pnpm check
make build CONTENT_PATH=/path/to/your-consumer-repo
```

Inspect `dist/robots.txt`, `dist/sitemap-index.xml`, and a representative page in `dist/` to confirm that the SEO policy matches the intended portal visibility.
