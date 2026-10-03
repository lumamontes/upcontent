---
title: Environment variables
description: Configure repository links and hosting paths at build time.
sidebar:
  order: 7
---

The portal is static, but a few values belong to the build environment rather than consumer content.

## Supported variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `CONTENT_PATH` | Filesystem path passed to `make dev` or `make build`. | `./` |
| `REPO_URL` | Overrides the configured source repository URL for generated GitHub links. | `https://github.com/acme/docs` |
| `BASE_PATH` | URL prefix for a project site hosted below the domain root. | `/engineering-docs` |
| `SITE_URL` | Canonical site origin used by Astro integrations such as the sitemap. | `https://docs.example.com` |

## Local development

Pass the content path to Make:

```sh
make dev CONTENT_PATH=.
```

`CONTENT_PATH` is a Make variable, not a value read from `.upcontent/config.json`.

## Static hosting

For GitHub Pages project sites, set a base path and site URL in the deployment workflow:

```yaml
env:
  BASE_PATH: /engineering-docs
  SITE_URL: https://acme.github.io/engineering-docs
```

For a custom domain or a host serving the site at `/`, leave `BASE_PATH` empty and set `SITE_URL` to the canonical origin.

## Precedence

`REPO_URL` takes precedence over `repo.url` for generated source links. `BASE_PATH` and `SITE_URL` are build inputs; they do not change the consumer configuration file.
