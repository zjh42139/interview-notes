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

// --- Ctrl+K 搜索快捷键 ---
function bindSearchShortcut() {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || '')
  const modKey = isMac ? '⌘' : 'Ctrl'

  window.addEventListener('keydown', (e) => {
    // Ctrl+K (Win/Linux) or Cmd+K (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      // VitePress local-search 按钮
      const btn =
        document.querySelector('.DocSearch-Button') ||
        document.querySelector('#local-search button') ||
        document.querySelector('[class*="search"] button')
      if (btn) btn.click()
    }
  })

  // 注入快捷键标识到搜索按钮
  function badge() {
    const btn = document.querySelector('.DocSearch-Button')
    if (!btn || btn.querySelector('.DocSearch-Button-Keys')) return

    const keys = document.createElement('span')
    keys.className = 'DocSearch-Button-Keys'
    keys.innerHTML = `
      <span class="DocSearch-Button-Key">${modKey}</span>
      <span class="DocSearch-Button-Key">K</span>
    `

    // 插入到 placeholder 文字后面
    const ph = btn.querySelector('.DocSearch-Button-Placeholder')
    if (ph) {
      ph.after(keys)
    } else {
      btn.appendChild(keys)
    }
  }

  // 初始注入 + SPA 路由切换后重新注入
  nextTick().then(badge)
  return badge
}

// --- Theme ---
export default {
  extends: DefaultTheme,
  setup() {
    const router = useRouter()
    let badge

    onMounted(() => {
      badge = bindSearchShortcut()

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
      () => {
        nextTick().then(renderAll)
        // 路由切换后重新注入快捷键标识（VitePress 可能重建 DOM）
        nextTick().then(() => badge && badge())
      }
    )
  },
}
