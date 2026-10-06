import { existsSync } from 'node:fs'

const htmlPath = 'dist/index.html'
const requiredAssets = ['assets/readme/portal-home.png', 'assets/readme/portal-showcase.png']

if (!existsSync(htmlPath)) throw new Error(`Golden build is missing: ${htmlPath}`)

for (const asset of requiredAssets) {
  if (!existsSync(`dist/${asset}`)) throw new Error(`Golden build is missing: dist/${asset}`)
}

if (existsSync('dist/readme/index.html')) throw new Error('Golden build unexpectedly published README as a portal route')
