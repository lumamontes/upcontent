#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const command = process.argv[2] ?? 'help'
const force = process.argv.includes('--force')
const root = process.cwd()
const rendererRoot = dirname(dirname(fileURLToPath(import.meta.url)))

const config = `{
  "site": {
    "title": "Documentation",
    "description": "Project documentation.",
    "logo": {
      "src": ".upcontent/logo.svg",
      "alt": "Documentation"
    },
    "favicon": ".upcontent/favicon.svg"
  },
  "repo": {
    "url": "https://github.com/ORG/REPOSITORY"
  },
  "theme": {
    "customCss": [".upcontent/theme.css"]
  }
}
`

const theme = `:root {
  --sl-color-accent: #0f766e;
  --sl-color-accent-high: #115e59;
}
`

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <rect width="56" height="56" x="8" y="8" rx="16" fill="#0f766e"/>
  <path d="M20 24h32v8H20zm0 16h24v8H20z" fill="#fff"/>
</svg>
`

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#0f766e"/>
  <path d="M18 20h28v8H18zm0 16h21v8H18z" fill="#fff"/>
</svg>
`

const workflow = `name: Publish documentation

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  publish:
    uses: lumamontes/upcontent/.github/workflows/reusable-pages.yml@main
    permissions:
      contents: read
      pages: write
      id-token: write
`

function init() {
  const files = [
    ['.upcontent/config.json', config],
    ['.upcontent/theme.css', theme],
    ['.upcontent/logo.svg', logo],
    ['.upcontent/favicon.svg', favicon],
    ['.github/workflows/deploy-docs.yml', workflow],
  ]
  const collisions = files.filter(([relativePath]) => existsSync(join(root, relativePath)))
  if (collisions.length > 0 && !force) {
    for (const [relativePath] of collisions) {
      console.error(`Refusing to overwrite ${relativePath}. Use --force to replace generated files.`)
    }
    process.exitCode = 1
    return
  }
  for (const [relativePath, content] of files) {
    const absolutePath = join(root, relativePath)
    mkdirSync(dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, content)
    console.log(`created ${relativePath}`)
  }
  console.log('\nNext steps:')
  console.log('1. Replace ORG/REPOSITORY in .upcontent/config.json.')
  console.log('2. Review the generated identity and theme files.')
  console.log('3. Run `pnpm dlx upcontent dev` to preview locally.')
  console.log('4. Push to main to publish through GitHub Actions.')
}

function run(name, args) {
  const result = spawnSync(name, args, { cwd: rendererRoot, stdio: 'inherit' })
  if (result.error) throw result.error
  return result.status === 0
}

if (command === 'init') init()
else if (command === 'dev') {
  process.exitCode = run('make', ['dev', `CONTENT_PATH=${root}`]) ? 0 : 1
}
else if (command === 'check') {
  const passed = run('make', ['build', `CONTENT_PATH=${root}`])
  process.exitCode = passed ? 0 : 1
}
else {
  console.log('Usage: upcontent <init|dev|check> [--force]')
}
