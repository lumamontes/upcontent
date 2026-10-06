import { existsSync, readFileSync } from 'node:fs'

const htmlPath = existsSync('dist/readme/index.html') ? 'dist/readme/index.html' : 'dist/index.html'
const html = readFileSync(htmlPath, 'utf8')
const requiredAssets = ['assets/readme/portal-home.png', 'assets/readme/portal-showcase.png']

for (const asset of requiredAssets) {
  if (!existsSync(`dist/${asset}`)) throw new Error(`Golden build is missing: dist/${asset}`)
  if (existsSync('dist/readme/index.html') && !existsSync(`dist/readme/${asset}`)) {
    throw new Error(`Golden build is missing README route asset: dist/readme/${asset}`)
  }
  if (!html.includes(asset)) throw new Error(`Golden build does not reference: ${asset}`)
}
