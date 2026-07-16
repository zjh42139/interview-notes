---
title: Web Worker
description: Dedicated Worker / Shared Worker / Service Worker 的区别，以及如何用 Worker 解决主线程阻塞问题
category: HTML
type: api-reference
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-09
updated: 2026-07-09
reviewed: null
tags:
  - Web Worker
  - Service Worker
  - 多线程
  - 性能优化
  - OffscreenCanvas
---

# Web Worker

> &#11088;&#11088;&#11088;&#11088;｜难度：高级｜项目：&#9733;&#9733;&#9733;

## 一句话总结

**Web Worker 让 JS 在后台线程运行——不阻塞主线程 UI、不共享变量、只能用 postMessage 通信。它解决的核心问题是"计算密集任务卡住页面"（如 10 万条数据的排序、图片处理）。**

## 核心机制

### 为什么需要 Worker

JavaScript 是单线程语言，主线程既要渲染 UI、响应用户交互，又要执行业务逻辑。当一段 JS 执行超过 50ms，用户就会感知到页面卡顿：

```javascript
// ❌ 主线程中做 CPU 密集运算 → 页面冻结 3 秒
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
console.log(fibonacci(45)) // 主线程卡死，点击、滚动全部无响应
```

```javascript
// ✅ 把运算交给 Worker → 主线程不受影响
const worker = new Worker('fib-worker.js')
worker.postMessage(45)
worker.onmessage = (e) => {
  console.log('结果：', e.data) // 页面依然流畅
}
```

### 三种 Worker 对比

| 类型 | 作用域 | 生命周期 | 共享性 | 典型用途 |
|------|--------|----------|--------|----------|
| **Dedicated Worker** | 单个页面 | 页面关闭 → Worker 销毁 | 只有创建它的页面可用 | 计算密集任务、大 JSON 解析 |
| **Shared Worker** | 同源的所有页面 | 最后一个引用页面关闭 → Worker 销毁 | 同源多页面共享 | 多 Tab 共享 WebSocket 连接 |
| **Service Worker** | 同源的所有页面 | 浏览器管理（独立于页面） | 同源多页面共享 + **离线也运行** | PWA 离线缓存、推送通知、网络代理 |

### Dedicated Worker 完整示例

```javascript
// ===== main.js（主线程）=====
const worker = new Worker('worker.js')

// 发送数据给 Worker（数据会被结构化克隆，不共享引用）
worker.postMessage({ type: 'SORT', payload: largeArray })

// 接收 Worker 返回的结果
worker.onmessage = (e) => {
  console.log('排序完成：', e.data)
}

// 错误处理
worker.onerror = (err) => {
  console.error('Worker 错误：', err.message, '行号：', err.lineno)
}

// 手动终止 Worker
worker.terminate()

// ===== worker.js（Worker 线程）=====
self.onmessage = (e) => {
  const { type, payload } = e.data

  if (type === 'SORT') {
    const sorted = payload.sort((a, b) => a - b)
    self.postMessage(sorted)   // 把结果发回主线程
  }
}

// Worker 内也可以 import 其他脚本
importScripts('utils.js', 'math-helper.js')
// 注：importScripts 是同步的（阻塞 Worker 线程），现代更推荐 ES Module 写法
```

### ES Module Worker（现代写法）

```javascript
// 主线程
const worker = new Worker('worker.js', { type: 'module' })

// worker.js
import { sortLargeArray } from './sort-utils.js'

self.onmessage = async (e) => {
  const result = await sortLargeArray(e.data)
  self.postMessage(result)
}
```

### 数据传输：结构化克隆 vs Transferable

```javascript
// 方式 1：结构化克隆（默认）—— 复制数据
worker.postMessage(largeData)
// 10MB 的数据 → 复制出 10MB → 原数据依然可用
// 适合：小数据、需要保留原数据的情况

// 方式 2：Transferable —— 转移所有权（零拷贝）
const buffer = new ArrayBuffer(1024 * 1024 * 50) // 50MB
worker.postMessage(buffer, [buffer])
// buffer 的所有权转移到 Worker，主线程 buffer.byteLength === 0
// 适合：大块数据的单向传递
// ⚠️ 转移后原线程无法再访问该数据

// Transferable 支持的类型：
// ArrayBuffer, MessagePort, ImageBitmap, OffscreenCanvas
```

## 深度拓展

### Worker 的限制（面试高频）

Worker 中**不能**做的事：

| 限制 | 原因 | 替代方案 |
|------|------|----------|
| 不能操作 DOM | 没有 window/document 对象 | 计算完把结果发回主线程，主线程更新 DOM |
| 不能访问 localStorage/sessionStorage | Worker 全局作用域没有这些 API | 用 IndexedDB（Worker 可用），或 postMessage 让主线程读写 |
| 不能使用 `alert`/`confirm` | 没有 UI 能力 | postMessage 通知主线程弹窗 |
| 不能访问 `window.parent`/`window.top` | 没有窗口树 | — |
| — | — | — |

Worker 中**可以**做的事：

- `XMLHttpRequest` / `fetch`（网络请求）
- `setTimeout` / `setInterval`
- `IndexedDB`
- `WebSocket`（Shared Worker 常用：多个 Tab 共享一个 WebSocket）
- `navigator`（有限子集：`navigator.onLine`、`navigator.userAgent`）
- `importScripts()` / ES Module `import`

### Shared Worker：多 Tab 共享

```javascript
// ===== 主线程（Tab A 和 Tab B 都运行同样的代码）=====
const worker = new SharedWorker('shared-worker.js')
worker.port.start()   // SharedWorker 需要显式启动 port
worker.port.postMessage({ type: 'REGISTER', tabId: 'tab-a' })
worker.port.onmessage = (e) => console.log('收到广播：', e.data)

// ===== shared-worker.js =====
const connections = new Set()

self.onconnect = (e) => {
  const port = e.ports[0]
  connections.add(port)

  port.onmessage = (msg) => {
    // 向所有连接的页面广播消息
    connections.forEach((p) => {
      if (p !== port) p.postMessage(msg.data)  // 不发给自己
    })
  }

  port.start()
}

// 经典场景：多个 Tab 共享一个 WebSocket 连接
// 只有一个 Shared Worker 持有 WebSocket，所有 Tab 通过它收发消息
```

### Service Worker：PWA 的核心

```javascript
// ===== 注册（主线程）=====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW 注册成功：', reg.scope))
}

// ===== sw.js（Service Worker）=====
const CACHE_NAME = 'app-v1'

// install：预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/', '/styles.css', '/app.js', '/logo.png'])
    )
  )
})

// activate：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
})

// fetch：拦截网络请求（离线优先策略）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request)
    )
  )
})
```

### OffscreenCanvas：Canvas 在 Worker 中渲染

```javascript
// 主线程
const canvas = document.querySelector('canvas')
const offscreen = canvas.transferControlToOffscreen()
const worker = new Worker('render-worker.js')
worker.postMessage({ canvas: offscreen }, [offscreen])  // Transferable

// render-worker.js
self.onmessage = (e) => {
  const canvas = e.data.canvas
  const ctx = canvas.getContext('2d')
  // 在 Worker 中绘制，不阻塞主线程！
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 100, 100)
  // 绘制结果自动同步到主线程的 canvas 元素
}
```

## 项目实战

### 后台管理系统中的 Worker 场景

1. **Excel 导出**：10000+ 行数据的 CSV/Excel 生成放在 Worker 中，导出完成前主线程 UI 依然可操作
2. **大数据量的搜索/过滤**：用户在搜索框输入 → 主线程把数据发给 Worker → Worker 过滤后返回 → 主线程渲染虚拟列表
3. **图片压缩**：上传前在 Worker 中用 OffscreenCanvas 做裁剪、缩放、压缩，不阻塞上传进度条
4. **WebSocket 多 Tab 管理**：多个 Tab 共享一个 WebSocket 连接（Shared Worker），减少服务器连接数

## 易错点

1. **Worker 中的 `this` 不是 `window`** —— Worker 全局作用域是 `DedicatedWorkerGlobalScope`（简称 `self`），`this === self`
2. **结构化克隆的性能代价** —— 传输 100MB 数据时，结构化克隆本身耗时可能超过计算本身。大块数据用 Transferable
3. **Shared Worker 的 `port.start()` 必须手动调用** —— 区别于 Dedicated Worker
4. **Service Worker 只能用于 HTTPS（或 localhost）** —— HTTP 下 `navigator.serviceWorker` 为 `undefined`
5. **Service Worker 的生命周期独立于页面** —— 即使关闭所有 Tab，SW 依然可以在后台接收推送通知。需要谨慎管理缓存清理

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "JS 是单线程的，怎么做多线程" | 追问 Worker 有什么限制、能不能操作 DOM |
| "大文件上传/导出怎么做" | 追问 Worker 中做数据处理 + Transferable 零拷贝 |
| "多个 Tab 怎么通信" | 追问 Shared Worker vs BroadcastChannel vs localStorage 事件 |
| "PWA 离线怎么做" | 追问 Service Worker 的缓存策略（cache-first / network-first） |

## 相关阅读

- [事件循环 Event Loop](../JavaScript/event-loop.md)
- [防抖 / 节流](../JavaScript/debounce-throttle.md)
- [首屏优化](../性能优化/first-screen.md)
- [canvas-svg](./canvas-svg.md) —— OffscreenCanvas

## 更新记录

- 2026-07-09：新建（三种 Worker 对比 + Dedicated Worker 全解 + Shared Worker + Service Worker + Transferable + OffscreenCanvas + 项目实战）
