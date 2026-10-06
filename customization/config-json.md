---
title: JSON configuration reference
description: Complete reference for the consumer-owned .upcontent/config.json file.
sidebar:
  order: 6
---

The `.upcontent/config.json` file is optional. An omitted field uses the portal or Starlight default.

## Start with the minimum

You only need a title and repository link to get started. Add a logo and custom CSS when you are ready to make the portal yours:

```json
{
  "site": {
    "title": "Engineering Docs",
    "description": "Documentation for the engineering team."
  },
  "repo": {
    "url": "https://github.com/acme/engineering-docs"
  }
}
```

Relative asset paths resolve from the consumer repository. Absolute URLs are also supported for externally hosted assets.

## Complete example

The optional fields below cover navigation, Starlight presentation, and content conventions. You can add them one group at a time.

<details>
<summary>Show the complete configuration</summary>

```json
{
  "site": {
    "title": "Engineering Docs",
    "description": "Documentation for the engineering team.",
    "url": "https://docs.example.com",
    "socialImage": "https://docs.example.com/social-card.png",
    "locale": "en-US",
    "logo": {
      "src": ".upcontent/logo.svg",
      "alt": "Engineering Docs",
      "replacesTitle": false
    },
    "favicon": ".upcontent/favicon.svg"
  },
  "seo": {
    "enabled": true
  },
  "repo": {
    "url": "https://github.com/acme/engineering-docs"
  },
  "theme": {
    "customCss": [".upcontent/theme.css"]
  },
  "starlight": {
    "social": [
      { "icon": "github", "label": "GitHub", "href": "https://github.com/acme/engineering-docs" }
    ],
    "tableOfContents": { "minHeadingLevel": 2, "maxHeadingLevel": 3 },
    "lastUpdated": true,
    "pagination": true,
    "expressiveCode": {
      "styleOverrides": { "borderRadius": "0.6rem" }
    }
  },
  "navigation": {
    "roots": ["README.md", "guides"],
    "labelOverrides": { "api": "API reference" },
    "blocklist": {
      "exact": ["notes.md"],
      "prefixes": ["drafts/"]
    }
  },
  "content": {
    "titleField": "title"
  }
}
```

</details>

## Field groups

| Group | Controls |
| --- | --- |
| `site` | Name, description, URL, social image, locale, logo, and favicon. |
| `seo` | Explicitly enables search-engine discoverability. Defaults to disabled. |
| `repo` | Source repository links. |
| `theme` | Consumer-owned local CSS. |
| `starlight` | Safe layout, social, table of contents, pagination, and code options. |
| `navigation` | Sidebar roots, labels, and blocklists. |
| `content` | Frontmatter title field selection. |

Invalid curated values are ignored or fall back safely. Heading levels must be integers from 1 through 6, and the minimum cannot exceed the maximum.

SEO is opt-in. With `seo.enabled` omitted or set to `false`, the portal emits `noindex, nofollow` and `robots.txt` disallows crawling. This does not protect the site: use access-controlled hosting for a private portal.
