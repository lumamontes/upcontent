---
title: Release the npm package
description: Publish versioned Upcontent releases through GitHub Actions and npm Trusted Publishing.
sidebar:
  order: 3
---

Upcontent publishes the `upcontent` package from version tags. Ordinary pushes to `main` run validation and deploy the documentation portal, but do not publish to npm.

## Configure npm once

On the [upcontent npm package](https://www.npmjs.com/package/upcontent), add a GitHub Actions Trusted Publisher with:

- Organization or user: `lumamontes`
- Repository: `upcontent`
- Workflow filename: `publish.yml`
- Allow direct `npm publish`

Trusted Publishing uses short-lived GitHub OIDC credentials. No npm token is stored in GitHub Actions.

## Release a version

Choose the next semantic version, update `package.json`, and commit the change:

```sh
npm version patch --no-git-tag-version
git add package.json
git commit -m "release: v$(node -p "require('./package.json').version")"
```

Create and push the matching tag:

```sh
VERSION=$(node -p "require('./package.json').version")
git tag "v$VERSION"
git push origin main --follow-tags
```

The publish workflow verifies that the tag and package version match, runs the full validation contract, inspects the package contents, and publishes the package with npm provenance.
