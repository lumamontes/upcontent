import { existsSync, readFileSync } from 'node:fs'

const html = readFileSync('dist/index.html', 'utf8')
const requiredAssets = [
  'dist/assets/readme/portal-home.png',
  'dist/assets/readme/portal-showcase.png',
]

for (const asset of requiredAssets) {
  if (!existsSync(asset)) throw new Error(`Golden build is missing: ${asset}`)
}

for (const asset of ['assets/readme/portal-home.png', 'assets/readme/portal-showcase.png']) {
  if (!html.includes(asset)) throw new Error(`Golden build does not reference: ${asset}`)
}
