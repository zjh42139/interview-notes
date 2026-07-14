import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vitepress'
import './custom.css'

// --- Mermaid 按需渲染 ---
function hasMermaidBlocks() {
  return document.querySelectorAll('div.language-mermaid').length > 0
}

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

async function ensureMermaid() {
  if (window.mermaid) return

  // 优先：Vite 打包 mermaid（同源加载，无追踪防护警告）
  // optimizeDeps.exclude 已配，mermaid 不被预构建，避免子模块 504
  try {
    const mod = await import('mermaid')
    window.mermaid = mod.default || mod
    return
  } catch (_) {
    // 开发环境 Vite 加载失败时降级到 CDN
  }

  // 降级：CDN 按需加载
  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default {
  extends: DefaultTheme,
  setup() {
    const router = useRouter()

    // 注：Ctrl+K 搜索快捷键由 VitePress 原生支持

    onMounted(async () => {
      // 只在页面包含 Mermaid 代码块时才加载 Mermaid 库
      if (!hasMermaidBlocks()) return

      await ensureMermaid()
      window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })
      renderAll()

      new MutationObserver(() => {
        nextTick().then(renderAll)
      }).observe(document.body, { childList: true, subtree: true })
    })

    watch(
      () => router.route.path,
      () => {
        nextTick().then(async () => {
          if (hasMermaidBlocks()) {
            await ensureMermaid()
            if (typeof window.mermaid !== 'undefined') {
              window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })
            }
            renderAll()
          }
        })
      }
    )
  },
}
