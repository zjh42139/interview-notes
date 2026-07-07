import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vitepress'
import './custom.css'

// --- Mermaid rendering ---
function renderAll() {
  if (typeof window.mermaid === 'undefined') return
  const blocks = document.querySelectorAll(
    'div.language-mermaid:not([data-mr])'
  )
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    b.setAttribute('data-mr', '1')
    const code = b.querySelector('code')
    if (!code) continue
    const id = 'mm-' + Date.now() + '-' + i
    try {
      window.mermaid
        .render(id, code.textContent || '')
        .then((r) => {
          const d = document.createElement('div')
          d.className = 'mermaid-svg'
          d.innerHTML = r.svg
          b.replaceWith(d)
        })
        .catch((err) => {
          console.error('Mermaid render error:', err)
          b.removeAttribute('data-mr')
        })
    } catch (err) {
      console.error('Mermaid render error:', err)
      b.removeAttribute('data-mr')
    }
  }
}

function loadMermaid(cb) {
  if (window.mermaid) return cb()
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
  script.onload = () => cb()
  script.onerror = () => console.error('Failed to load mermaid from CDN')
  document.head.appendChild(script)
}

export default {
  extends: DefaultTheme,
  setup() {
    const router = useRouter()

    // 注：Ctrl+K 搜索快捷键由 VitePress 原生支持，无需额外代码

    onMounted(() => {
      loadMermaid(() => {
        window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })
        renderAll()
        new MutationObserver(() => {
          nextTick().then(renderAll)
        }).observe(document.body, { childList: true, subtree: true })
      })
    })

    watch(
      () => router.route.path,
      () => nextTick().then(renderAll)
    )
  },
}
