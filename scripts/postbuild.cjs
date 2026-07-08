// Post-build: generate .nojekyll for GitHub Pages
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, '..', 'docs', '.vitepress', 'dist')

if (!fs.existsSync(DIST)) {
  console.log('dist not found, skipping postbuild')
  process.exit(0)
}

// .nojekyll prevents GitHub Pages from ignoring files starting with _ or .
fs.writeFileSync(path.join(DIST, '.nojekyll'), '')

console.log('[postbuild] Generated .nojekyll')
