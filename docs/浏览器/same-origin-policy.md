---
title: 同源策略
description: 浏览器的同源策略——前端安全的基石，定义了跨域访问的允许与限制
category: 浏览器
type: security
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - 同源策略
  - CORS
  - 跨域
  - postMessage
  - 安全
---

# 同源策略

> &#11088;&#11088;&#11088;&#11088;&#11088;｜难度：中级｜项目：&#9733;&#9733;&#9733;&#9733;

## 一句话总结

**同源策略（Same-Origin Policy）是浏览器的安全基石——它阻止一个源的脚本访问另一个源的 DOM、Cookie/Storage 和 AJAX 响应。所有跨域方案（CORS/postMessage/JSONP/代理）本质上都是在同源策略上开的"合理的洞"。**

## 核心机制

### 什么算"同源"

```
两个 URL 同源 ⇔ 协议 + 域名 + 端口 三者完全相同

https://example.com:443/app/index.html

| URL                                      | 是否同源 | 原因          |
|------------------------------------------|----------|---------------|
| https://example.com/app/other.html       | ✅ 同源   | 协议+域名+端口一致 |
| https://example.com:443/                 | ✅ 同源   | 默认端口 443    |
| http://example.com/app                   | ❌ 不同源 | 协议不同（http）  |
| https://api.example.com/app              | ❌ 不同源 | 子域名不同       |
| https://example.com:8080/app             | ❌ 不同源 | 端口不同         |
| https://example.com.cn/app               | ❌ 不同源 | 完全不同域名     |
```

### 同源策略的三道限制

```
同源策略限制的是"不同源的脚本"对"当前源"的访问：

┌─────────────────────────────────────────────────┐
│ 限制 1：DOM 访问                                  │
│  ┌──────────┐    ┌──────────┐                   │
│  │  a.com   │    │  b.com   │                   │
│  │ iframe   │    │ iframe   │                   │
│  │          │ ✗→ │          │                   │
│  │ a.com    │ ←✗ │ b.com    │                   │
│  │ 读 b 的  │    │ 读 a 的  │                   │
│  │ DOM 失败 │    │ DOM 失败 │                   │
│  └──────────┘    └──────────┘                   │
│  → 跨域 iframe 之间不可相互读取/修改 DOM          │
├─────────────────────────────────────────────────┤
│ 限制 2：Cookie / LocalStorage / IndexedDB        │
│  ┌──────────┐    ┌──────────┐                   │
│  │ a.com 的 │ ✗→ │ a.com 的 │                   │
│  │ 脚本     │    │ Cookie   │                   │
│  │          │    │ Storage  │                   │
│  │ b.com 的 │    │          │                   │
│  │ 脚本     │    │          │                   │
│  └──────────┘    └──────────┘                   │
│  → 同源存储只对同源脚本可见                        │
├─────────────────────────────────────────────────┤
│ 限制 3：AJAX 响应                                │
│  ┌──────────┐         ┌──────────┐              │
│  │ a.com 的 │ fetch → │ b.com 的 │              │
│  │ JS       │ ←✗读   │ API       │              │
│  └──────────┘         └──────────┘              │
│  → 请求发出去了，但浏览器阻止 JS 读取响应           │
│  ⚠️ 关键陷阱：请求"发出去了"，只是浏览器不让读！     │
│     → CSRF 的本质就是利用了这一点                   │
└─────────────────────────────────────────────────┘
```

### 为什么需要同源策略

```
场景：你在浏览器中登录了银行网站 bank.com，
     同时在另一个 Tab 访问了恶意网站 evil.com。

没有同源策略：
  evil.com 的 JS 可以：
  - 读取 bank.com 在另一个 Tab 中的账户余额（跨 Tab DOM 读取）
  - 读取 bank.com 的 Cookie 和 LocalStorage
  - fetch bank.com 的 API 获取用户信息

有同源策略：
  以上操作全部被浏览器阻止——
  evil.com 的脚本只能访问 evil.com 自己的资源。
```

## 深度拓展

### 跨域通信的合法方式

同源策略不是绝对封闭——浏览器提供了几种"官方后门"：

```javascript
// 1. postMessage —— 跨域窗口/DOM 通信的标准方式
// 父页面：
iframe.contentWindow.postMessage(
  { type: 'GREETING', text: 'Hello' },
  'https://child.example.com'  // ← 指定目标源
)
// 子页面：
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://parent.example.com') return  // ← 校验来源
  console.log(e.data.text)
})

// 2. CORS —— 跨域 AJAX 的标准方式
// 服务端设置响应头：
// Access-Control-Allow-Origin: https://a.com
// Access-Control-Allow-Credentials: true
// Access-Control-Allow-Methods: GET, POST, PUT
// 浏览器自动处理预检请求（OPTIONS）

// 3. JSONP —— 利用 <script> 不受同源策略限制的历史方案
// <script src="https://api.example.com/data?callback=handleData"></script>
// 服务端返回：handleData({"name": "张三"})
// ⚠️ 只能 GET、没有错误处理、有 XSS 风险，2026 年不推荐新项目使用

// 4. document.domain —— 降域（已废弃）
// a.news.com 和 b.news.com 都设置：
// document.domain = 'news.com'
// 然后它们就可以互访 DOM
// ⚠️ Chrome 已移除支持，不要在任何场景下使用

// 5. window.name —— 历史奇技淫巧
// iframe 跨域跳转后 window.name 不重置（最大 2MB）
// ⚠️ 仅了解即可，不要在新项目中使用
```

### CORS 的三种场景

```javascript
// 场景 1：简单请求（不触发预检）
// 条件：GET/HEAD/POST + 特定 Content-Type + 无自定义 header
fetch('https://api.example.com/data')
// 浏览器直接发送请求，检查响应头 Access-Control-Allow-Origin
// Origin 在允许列表中 → JS 能读响应
// Origin 不在允许列表中 → JS 报错（但请求已发出！）

// 场景 2：预检请求（OPTIONS）
fetch('https://api.example.com/users', {
  method: 'DELETE',
  headers: { 'X-Custom-Token': 'abc123' }  // 自定义头触发预检
})
// 浏览器先发 OPTIONS 请求问服务器：
// OPTIONS /users
// Access-Control-Request-Method: DELETE
// Access-Control-Request-Headers: x-custom-token
// 服务端响应允许 → 再发真正的 DELETE 请求

// 场景 3：携带凭证（Cookie）
fetch('https://api.example.com/user', {
  credentials: 'include'  // 跨域请求携带 Cookie
})
// 需服务端同时设置：
// Access-Control-Allow-Origin: https://a.com（不能用 *）
// Access-Control-Allow-Credentials: true
```

### 还有哪些不受同源策略限制

| 操作 | 是否受限 | 原因 |
|------|----------|------|
| `<script src="跨域URL">` | ❌ 不受限 | 历史原因，JSONP 的基础 |
| `<img src="跨域URL">` | ❌ 不受限 | 图片无脚本风险，但可用作 CSRF 载体 |
| `<link href="跨域URL">` | ❌ 不受限 | CSS 可跨域加载，字体/图片同理 |
| `<iframe src="跨域URL">` | 能嵌入但不能读 DOM | 嵌入允许，DOM 访问被限制 |
| `fetch` / `XMLHttpRequest` | ✅ 受限 | 核心同源限制，需 CORS |
| `document.cookie` | ✅ 受限 | 只能读写同源 cookie |
| 跨域 iframe 的 `contentWindow` | ✅ 受限 | 抛 DOMException |

## 项目实战

### 后台管理系统中的跨域处理

1. **开发环境**：Vite `server.proxy` 代理——`/api` → `http://localhost:3000`，开发时没有跨域问题
2. **生产环境**：后端配 CORS 白名单（`Access-Control-Allow-Origin: https://admin.mysite.com`）或 Nginx 同域名反向代理（`/api` → 后端内网地址）
3. **第三方 SDK 跨域**：CDN 上的 SDK 文件（如腾讯云 COS SDK）通过 CORS 访问 API——需 CDN 返回 `Access-Control-Allow-Origin` 头
4. **微前端子应用加载**：qiankun 通过 `fetch` 获取子应用的 HTML/JS/CSS——子应用必须返回 CORS 头，否则 `fetch` 被浏览器拦截

## 易错点

1. **"请求发不出去"的理解错误** —— CORS 请求发出去了、服务端也处理了、响应也返回了，只是**浏览器阻止 JS 读取响应**。这是 CSRF 能成功的前提——即使 JS 读不到响应，请求的副作用（转账、删除）已经发生
2. **`Access-Control-Allow-Origin: *` 和 `credentials: 'include'` 不能共存** —— 携带凭证时必须指定具体的 origin，不能用通配符
3. **预检请求（OPTIONS）的缓存** —— `Access-Control-Max-Age` 可以缓存预检结果（秒），避免每次请求都预检。但 Chrome 上限 2 小时
4. **localhost 和 127.0.0.1 不同源** —— 域名部分逐字符比对，`localhost` ≠ `127.0.0.1`
5. **HTTPS 页面不能加载 HTTP 资源** —— 这是混合内容（Mixed Content）限制，比同源策略更严格：HTTPS 页面中的 `<script src="http://...">` 直接被阻止加载

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "什么是同源策略" | 追问哪些标签不受同源策略限制（script/img） |
| "跨域怎么解决" | 追问 CORS 预检请求 OPTIONS 的触发条件 |
| "JSONP 和 CORS 有什么区别" | 追问 JSONP 为什么只能 GET + 安全风险 |
| "CORS 请求发出去了吗" | 追问同源策略只阻止读取响应，不阻止发送请求 |

## 相关阅读

- [XSS / CSRF](./xss-csrf.md)
- [跨域 CORS](../网络/cors.md)
- [iframe](../HTML/iframe.md)
- [浏览器安全机制](./browser-security.md)

## 更新记录

- 2026-07-10：新建（同源定义 + 三道限制 + 跨域方案全景 + CORS 三种场景 + 不受限的标签清单 + 易错点）
