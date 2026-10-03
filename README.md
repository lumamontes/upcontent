---
heading: Upcontent
description: Turn a documentation repository into a fast, searchable, customizable static portal.
---

Upcontent turns a Markdown repository into a documentation site that is ready to share.

It is for software teams that already have documentation, but need a better way to publish it: clear navigation, search, useful rendering for technical content, consumer-owned branding, and a repeatable static build.

## The short version

Upcontent gives a documentation repository:

- A responsive [Starlight](https://starlight.astro.build/) portal with navigation, search, themes, and table of contents
- A `.upcontent/config.json` file for identity, navigation, rendering, and content boundaries
- Custom CSS for the consumer's own brand
- Rendered callouts, Mermaid diagrams, JSON, YAML, CSV, and wiki links
- A static `dist/` directory that can be deployed to GitHub Pages or any static host
- Build checks that catch broken wiki links and excluded content before publication

The source repository remains the source of truth. Upcontent does not require a database, a companion server, or a new authoring system.

## Is this the right tool?

Upcontent is a good fit when:

- Your documentation already lives in Markdown or MDX.
- Your team wants to keep writing in Git.
- You want the portal to be owned and deployed by the documentation repository.
- You need more than raw Markdown, but do not need a dynamic application.
- You want branding and navigation without maintaining a custom docs frontend.

It is not the right fit when your site needs runtime authentication, server-rendered personalization, or review comments inside the published portal.

## Get started

### Publish an existing documentation repository

If your Markdown already lives in a GitHub repository, run the bootstrap command from that repository's root:

```sh
pnpm dlx upcontent init
pnpm dlx upcontent dev
```

The first command creates `.upcontent/` and a GitHub Pages workflow. The second starts a local portal using the repository you are already in. You do not need to clone the Upcontent renderer into your documentation repository.

See [Set up a consumer repository](getting-started/consumer-repository/) for the generated structure and configuration.

### Explore this repository locally

Clone this repository, then start the included golden consumer. This path is for exploring Upcontent itself:

```sh
git clone https://github.com/lumamontes/upcontent.git
cd upcontent
pnpm install
make dev CONTENT_PATH=.
```

Then open the local URL printed by Astro. The [capability showcase](showcase/) is the fastest way to see the complete rendering and customization surface.

The generated consumer configuration looks like this:

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

Follow [Set up a consumer repository](getting-started/consumer-repository/) for the complete setup, then use [Customization](customization/) to shape the portal.

## See the full path

- [First build](getting-started/first-build/): run the portal locally and generate static output.
- [Consumer repository](getting-started/consumer-repository/): prepare content, assets, and configuration.
- [Customization](customization/): configure identity, theme, navigation, content, JSON, and environment variables.
- [Authoring content](guides/authoring-content/): write pages that are clear and easy to scan.
- [Deployment](deployment/): publish the generated files to GitHub Pages or another static host.
- [Capability showcase](showcase/): inspect all supported content and rendering features in one page.

## Build for production

```sh
make build CONTENT_PATH=/path/to/your-consumer-repo
```

The generated site is written to `dist/` and includes the Pagefind search index.

Before publishing, run:

```sh
pnpm test
pnpm check
make build CONTENT_PATH=.
make check-external
```

## Built on Astro and Starlight

Upcontent uses the official [Astro](https://astro.build/) framework and [Starlight](https://starlight.astro.build/) documentation theme as its rendering foundation. Upcontent adds the consumer-repository contract, content integrity checks, configuration surface, and deployment workflow around them.
