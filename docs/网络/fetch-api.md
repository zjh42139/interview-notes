---
title: Fetch API 深度解析
description: fetch() 的完整用法——Request/Response 对象、AbortController 中断、Stream 读取、超时实现、错误处理陷阱、与 axios 的全面对比
category: 网络
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - fetch
  - XHR
  - AbortController
  - Stream
  - axios
---

# Fetch API 深度解析

> ⭐⭐⭐⭐｜难度：中级｜项目：★★★★

## 一句话总结

**`fetch()` 是 XHR 的现代替代，基于 Promise 设计，但有几个致命陷阱：默认不带 cookie、不 reject 非 200 响应、不支持超时、不能监听上传进度。这些差异是面试高频考点——面试官通常会问"fetch 和 axios 的区别"，你从这四个陷阱切入，然后说"axios 在 fetch 基础上解决了这些问题"。**

## fetch vs XHR

```javascript
// XHR（旧）——回调地狱
const xhr = new XMLHttpRequest()
xhr.open('GET', '/api/data')
xhr.onload = () => JSON.parse(xhr.responseText)
xhr.onerror = () => console.error('网络错误')
xhr.send()

// fetch（新）——Promise 链
fetch('/api/data')
  .then(res => res.json())
  .catch(err => console.error('网络错误或 JSON 解析失败'))
```

## fetch 的四个陷阱

### 陷阱 1：不 reject 非 200

```javascript
// ❌ 常见错误——以为 catch 能捕获 404/500
fetch('/api/not-found')
  .then(res => res.json())   // 404 时 res.json() 可能成功（返回 HTML 错误页）
  .catch(err => console.log('这只捕获网络断连，不捕获 404'))

// ✅ 正确做法——手动检查 ok
fetch('/api/data')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
```

**为什么这样设计？** fetch 把 HTTP 响应视为成功——"服务器给了你一个响应"就是成功。状态码的含义由你判断，fetch 不替你做决定。这和 XHR 的思维不同——XHR 的 `onload` 在任何 HTTP 响应时都触发。

### 陷阱 2：默认不带 cookie

```javascript
// ❌ 跨域请求默认不带 cookie
fetch('https://api.example.com/user')

// ✅ 需要显式设置
fetch('https://api.example.com/user', {
  credentials: 'include'      // 始终带 cookie
  // credentials: 'same-origin'  // 同域才带（默认）
  // credentials: 'omit'         // 永远不带
})
```

### 陷阱 3：不支持超时

```javascript
// ❌ fetch 没有 timeout 参数
// ✅ 用 AbortController + setTimeout 实现
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

// 使用
try {
  const res = await fetchWithTimeout('/api/data', {}, 3000)
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('请求超时或被取消')
  }
}
```

### 陷阱 4：不能监听上传进度

fetch 不支持 `onprogress` 回调。如果需要上传进度条，要么用 XHR，要么用 `fetch` + `ReadableStream`（但上传进度仍然需要构造流——复杂度高）。

## AbortController——取消请求

```javascript
const controller = new AbortController()

fetch('/api/search?q=abc', { signal: controller.signal })

// 1 秒后取消——用户输入了新关键词，旧请求结果已无用
setTimeout(() => controller.abort(), 1000)
```

**实际项目场景**：搜索框输入防抖 + AbortController。用户连续输入 "a" → "ab" → "abc"，每一次新输入都 abort 上一次未完成的请求。防止后发的请求先返回，先发的请求后返回——显示错误的搜索结果。

```javascript
let controller = null

input.addEventListener('input', async (e) => {
  controller?.abort()  // 取消上一次请求
  controller = new AbortController()

  try {
    const res = await fetch(`/api/search?q=${e.target.value}`, {
      signal: controller.signal
    })
    // 更新搜索结果
  } catch (err) {
    if (err.name !== 'AbortError') {
      // 真正的网络错误
    }
  }
})
```

## Stream 读取——处理大响应

```javascript
// 流式读取——适合处理大文件下载、实时数据
const response = await fetch('/api/large-data')
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  console.log(decoder.decode(value, { stream: true }))
}
```

这是 XHR 做不到的——XHR 必须等全部数据到达才能处理。

## fetch vs axios 全面对比

| 维度 | fetch | axios |
|------|-------|-------|
| **基础** | 浏览器原生 API | 第三方库（18KB gzip） |
| **返回值** | Promise\<Response\>，需手动 `.json()` | 自动 JSON 解析，直接拿到 data |
| **错误处理** | 只 reject 网络错误——404/500 算成功 | 非 2xx 自动 reject |
| **超时** | 不支持（需 AbortController + setTimeout） | `{ timeout: 5000 }` 一行解决 |
| **请求/响应拦截器** | 无（需手动封装） | `axios.interceptors.request/response.use()` |
| **取消请求** | AbortController（现代） | AbortController（v0.22+）或 CancelToken（旧） |
| **上传/下载进度** | 不支持上传进度 | `onUploadProgress` / `onDownloadProgress` |
| **Cookie** | 跨域默认不带 | 跨域默认不带（与 fetch 相同） |
| **CSRF 保护** | 无 | 自动设置 `X-XSRF-TOKEN` 头 |
| **Node.js** | v18+ 原生支持 | 全版本支持 |

**面试总结一句话**："axios 在 fetch 基础上做了两件事：一是更友好的 API（自动 JSON 解析+非 2xx reject），二是企业级功能（拦截器+超时+进度+取消）。原生 fetch 适合简单请求和不依赖第三方库的场景，axios 适合需要拦截器链和统一错误处理的项目。"

## 项目实战

### 后台管理系统的 fetch 封装

```javascript
// 基于 fetch 的轻量封装——避免了 axios 的依赖
class HttpClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL
  }

  async request(url, options = {}) {
    const controller = new AbortController()
    const timeout = options.timeout || 10000
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(`${this.baseURL}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      })

      if (!res.ok) {
        // 统一错误处理
        if (res.status === 401) {
          // 跳转登录
        }
        throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      }

      return await res.json()
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  get(url, options) { return this.request(url, { ...options, method: 'GET' }) }
  post(url, body, options) {
    return this.request(url, { ...options, method: 'POST', body: JSON.stringify(body) })
  }
}
```

## 易错点

1. **`res.json()` 只能用一次** —— Response body 是 Stream，读取即消费。同一个 response 调两次 `.json()` 第二次会报错 "body already read"
2. **`.catch` 捕获不到 404** —— 这是 fetch 最大的新人陷阱。无数人在面试里翻车。一定要检查 `res.ok` 或 `res.status`
3. **忘记 `credentials` 导致登录状态丢失** —— 同域请求自动带 cookie 没问题。但一旦涉及跨域（API 在另一个子域名），cookie 默认不带。排查半天发现是没设 `credentials: 'include'`
4. **AbortController 兼容性** —— IE 不支持。但 2026 年了，不是问题

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "fetch 和 axios 有什么区别" | 追问具体细节——超时、拦截器、错误处理三个点展开 |
| "fetch 怎么取消请求" | 追问 AbortController 的原理——signal 是事件还是 Promise |
| "fetch 请求超时怎么处理" | 追问 AbortController + setTimeout 的竞争条件 |
| "为什么 fetch 不 reject 404" | 追问设计理念——fetch 把 HTTP 响应视为成功，状态码由你判断 |

## 相关阅读

- [HTTP / HTTPS](./http-https.md)
- [CORS](./cors.md)
- [Axios 封装](../项目实战/基础设施/axios-encapsulation.md)

## 更新记录

- 2026-07-10：新建（fetch 四个陷阱 + AbortController + Stream + axios 对比 + 封装实践）
