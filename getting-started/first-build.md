---
title: Your first build
description: Run Upcontent locally and understand what it generates.
sidebar:
  order: 1
---

This guide takes you from a cloned Upcontent repository to a local documentation portal. If you have not cloned it yet:

```sh
git clone https://github.com/lumamontes/upcontent.git
cd upcontent
```

## What you need

- Node.js supported by the repository toolchain
- pnpm
- A documentation repository containing Markdown or MDX files

Install dependencies from the portal repository:

```sh
pnpm install
```

## Start the portal locally

Point `CONTENT_PATH` at the documentation repository you want to preview:

```sh
make dev CONTENT_PATH=.
```

Open the local URL printed by Astro. Changes to content and consumer configuration are reflected by the development server.

## Build the static site

Build the same consumer without a development server:

```sh
make build CONTENT_PATH=.
```

The generated site is written to `dist/`. It contains HTML, assets, and the Pagefind search index. Preview the generated output with:

```sh
pnpm exec astro preview
```

## Explore the example

Start with these pages:

- [Capability showcase](../../showcase/) shows rendering, content, customization, and workflows in one place.
- [Authoring content](../../guides/authoring-content/) explains the writing conventions used here.
- [Validate your site](../../guides/validate-your-site/) is the repeatable acceptance checklist.

## Use another consumer repository

The portal can render content from a different directory without copying it into this repository:

```sh
make dev CONTENT_PATH=/path/to/my-consumer-repo
```

The consumer repository owns its Markdown, `.upcontent/config.json`, assets, and custom CSS. The portal repository owns the renderer and validation pipeline.

:::tip[The important boundary]
Treat `CONTENT_PATH` as the product boundary. If a change only works when files are added to the portal implementation, it is not yet a consumer customization.
:::

## Next steps

1. Read [Set up a consumer repository](../consumer-repository/).
2. Add or review the consumer configuration in `.upcontent/config.json`.
3. Follow [Authoring content](../../guides/authoring-content/) before adding new pages.
4. Run [Validate your site](../../guides/validate-your-site/).
