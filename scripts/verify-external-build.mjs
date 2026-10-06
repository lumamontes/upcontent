import { existsSync, readdirSync, readFileSync } from 'node:fs'

const html = readFileSync('dist/index.html', 'utf8')
const required = [
  'External Consumer',
  'https://github.com/example/external-consumer',
  '/upcontent-assets/favicon.svg',
]

for (const value of required) {
  if (!html.includes(value)) throw new Error(`External consumer artifact is missing: ${value}`)
}

if (!existsSync('dist/upcontent-assets/favicon.svg')) throw new Error('External consumer favicon was not copied')
if (!html.includes('alt="External Consumer"')) throw new Error('External consumer logo was not rendered')
if (!html.includes('application/ld+json')) throw new Error('External consumer JSON-LD metadata is missing')
if (!existsSync('dist/robots.txt')) throw new Error('External consumer robots.txt is missing')
if (!existsSync('dist/sitemap-index.xml')) throw new Error('External consumer sitemap is missing')
if (!readFileSync('dist/noindex/index.html', 'utf8').includes('noindex, nofollow')) throw new Error('External consumer noindex page is not marked noindex')
const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8')
if (!sitemap.includes('<loc>https://docs.example.com/</loc>')) throw new Error('External consumer root route is missing from sitemap')
if (sitemap.includes('/noindex/')) throw new Error('External consumer noindex page leaked into sitemap')
if (existsSync('dist/forbidden/index.html')) throw new Error('External consumer blocklist leaked forbidden.md')
if (existsSync('dist/assets/readme')) throw new Error('Golden README assets leaked into external consumer build')
if (existsSync('dist/upcontent-renderer/readme/index.html')) {
  throw new Error('External consumer build leaked renderer checkout content')
}
if (!existsSync('dist/pagefind/pagefind.js')) throw new Error('External consumer Pagefind output is missing')

const cssFiles = readdirSync('dist/_astro').filter(file => file.endsWith('.css'))
const hasConsumerCss = cssFiles.some(file => readFileSync(`dist/_astro/${file}`, 'utf8').includes('#0f766e'))
if (!hasConsumerCss) throw new Error('External consumer CSS was not included')
