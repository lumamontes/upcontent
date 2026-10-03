---
title: Customization
description: Configure the portal from the consumer repository without editing the renderer.
sidebar:
  order: 1
---

Customization belongs to the consumer repository. The renderer stays shared; the consumer decides what the site is called, how it looks, what appears in navigation, and where it is published.

## Choose a path

- [Site identity](site-identity/): title, description, logo, favicon, and repository links.
- [Theme and CSS](theme/): colors, typography, spacing, and dark mode using Starlight tokens.
- [Navigation](navigation/): sidebar roots, labels, and content blocklists.
- [Content behavior](content/): title fields, page metadata, and supported rendered content.
- [JSON configuration](config-json/): the complete `.upcontent/config.json` guide.
- [Environment variables](environment/): build-time values for repository URLs and hosting paths.

The [configuration reference](config-json/) is the source of truth for supported fields. The [capability showcase](../showcase/) demonstrates the result in one page.

## The customization boundary

Consumer-owned files normally live here:

```text
.upcontent/
├── config.json
├── favicon.svg
├── logo.svg
└── theme.css
```

If a customization requires changing `astro.config.mjs`, it is not part of the normal consumer configuration surface.
