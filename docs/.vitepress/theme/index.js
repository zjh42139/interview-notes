import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vitepress'

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
        .catch(() => b.removeAttribute('data-mr'))
    } catch (_) {
      b.removeAttribute('data-mr')
    }
  }
}

export default {
  extends: DefaultTheme,
  setup() {
    const router = useRouter()

    onMounted(async () => {
      // Dev: load mermaid via Vite dynamic import
      // Build: postbuild CDN already set window.mermaid, skip the import
      if (!window.mermaid) {
        try {
          const mod = await import('mermaid')
          window.mermaid = mod.default
        } catch (_) {
          return
        }
      }

      window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })
      renderAll()

      new MutationObserver(() => {
        nextTick().then(renderAll)
      }).observe(document.body, { childList: true, subtree: true })
    })

    watch(
      () => router.route.path,
      () => nextTick().then(renderAll)
    )
  },
}
