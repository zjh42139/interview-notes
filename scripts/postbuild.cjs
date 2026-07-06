// Post-build: inject Mermaid CDN + render script into all HTML files
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, '..', 'docs', '.vitepress', 'dist')
const MERMAID_SCRIPT = `
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
(function(){
  function render(){
    document.querySelectorAll('div.language-mermaid:not([data-mermaid-done])').forEach(function(block, i){
      block.setAttribute('data-mermaid-done', '1')
      var code = block.querySelector('code')
      if (!code) return
      var content = code.textContent || ''
      mermaid.render('mm-' + Date.now() + '-' + i, content).then(function(r){
        var div = document.createElement('div')
        div.className = 'mermaid-svg'
        div.innerHTML = r.svg
        block.replaceWith(div)
      }).catch(function(){})
    })
  }
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })
  render()
  new MutationObserver(render).observe(document.body, { childList: true, subtree: true })
})()
</script>`

function walkDir(dir, cb) {
  fs.readdirSync(dir).forEach(function (name) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walkDir(full, cb)
    else if (stat.isFile() && name.endsWith('.html')) cb(full)
  })
}

if (!fs.existsSync(DIST)) {
  console.log('dist not found, skipping postbuild')
  process.exit(0)
}

let count = 0
walkDir(DIST, function (file) {
  let html = fs.readFileSync(file, 'utf8')
  if (html.includes('mermaid.min.js')) return
  html = html.replace('</head>', MERMAID_SCRIPT + '\n</head>')
  fs.writeFileSync(file, html)
  count++
})

console.log('[postbuild] Injected mermaid into ' + count + ' HTML files')
