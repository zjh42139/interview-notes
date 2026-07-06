// Post-build: inject Mermaid render script into all HTML files
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, '..', 'docs', '.vitepress', 'dist')

// Single inline script: dynamically loads mermaid CDN, then renders all diagrams.
// Using a single script ensures mermaid is loaded BEFORE we try to call mermaid.render().
const MERMAID_SCRIPT = `
<script>
(function(){
  if (window.__mermaidInjected) return
  window.__mermaidInjected = true

  function render() {
    if (typeof mermaid === 'undefined') return
    var blocks = document.querySelectorAll('div.language-mermaid:not([data-mermaid-done])')
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i]
      block.setAttribute('data-mermaid-done', '1')
      var code = block.querySelector('code')
      if (!code) continue
      var id = 'mm-' + Date.now() + '-' + i
      try {
        mermaid.render(id, code.textContent || '').then(function(r) {
          var div = document.createElement('div')
          div.className = 'mermaid-svg'
          div.innerHTML = r.svg
          block.replaceWith(div)
        }).catch(function(e) { console.error('Mermaid render failed:', e) })
      } catch(e) { console.error('Mermaid error:', e) }
    }
  }

  var script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
  script.onload = function() {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })
    render()
    new MutationObserver(function() { render() }).observe(document.body, { childList: true, subtree: true })
  }
  document.head.appendChild(script)
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
  if (html.includes('__mermaidInjected')) return // already injected by head config
  html = html.replace('</head>', MERMAID_SCRIPT + '\n</head>')
  fs.writeFileSync(file, html)
  count++
})

console.log('[postbuild] Injected mermaid into ' + count + ' HTML files')
