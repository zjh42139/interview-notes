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
  // 生产环境：postbuild 脚本已通过 CDN script 标签注入
  if (window.mermaid) return cb()

  // 开发环境：CDN 动态加载，绕过 Vite 预构建 mermaid 内部
  // 动态 import 的 504 问题（flowDiagram-v2 等子模块 chunk 过期）
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
