---
title: Other static hosts
description: Publish dist to a static hosting provider of your choice.
sidebar:
  order: 3
---

The output of `make build` is portable. Upload the contents of `dist/` to any host that serves static files.

## Generic flow

```sh
make build CONTENT_PATH=/path/to/your-consumer-repo
upload dist/ to your hosting provider
```

Set `SITE_URL` when the host supports canonical URLs or sitemap generation. Set `BASE_PATH` when the site is served below the domain root.

## Separate portal and content repositories

A CI job can check out both repositories before building:

```text
checkout the portal repository
checkout the consumer repository
make build CONTENT_PATH=/workspace/consumer
upload dist/
```

The consumer checkout provides Markdown, `.upcontent/config.json`, assets, and CSS. The portal checkout provides the renderer and validation pipeline.

## Privacy

A private source repository does not make a public static host private. Use a host with access controls when the published site must be restricted.
