---
title: CSP 内容安全策略 面试回答
description: 面试中如何回答 CSP——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - CSP
  - 内容安全策略
  - XSS
  - nonce
  - hash
  - 面试回答
---

# CSP 内容安全策略 面试回答

## Q1: CSP 是什么？怎么配置？

### 30 秒版本

"CSP 是浏览器白名单机制——通过 HTTP 头告诉浏览器只从指定来源加载资源。核心指令 `script-src` 控制 JS 来源、`default-src` 做兜底。两个高级技巧：nonce 给合法内联脚本发通行证，`report-uri` 收集违规报告做监控。CSP 是 XSS 的最后一道防线——假设代码转义某处漏了，CSP 还能拦住恶意脚本的执行。"

### 2 分钟版本

"CSP 解决的核心问题是：浏览器默认信任页面里的所有资源，XSS 注入的 `<script>` 标签会原样执行。CSP 给浏览器一个白名单——只有白名单内的来源才能加载。

**配置方式**：HTTP 头 `Content-Security-Policy` 是标准做法；`<meta>` 标签也行但不支持 `frame-ancestors` 和 `report-uri`。

**关键指令**：`script-src` 是最重要的——控制 JS 从哪加载。`'self'` 只允许同源 JS，这会禁用所有内联脚本和 `onclick` 事件——所以需要 nonce 或 hash 给合法内联脚本发通行证。`default-src` 是所有其他指令的兜底值。`frame-ancestors 'none'` 替代 X-Frame-Options 防点击劫持。

**nonce vs hash**：nonce 是每次请求随机生成的值——`<script nonce="r@nd0m">` 才能执行，攻击者猜不到；hash 是脚本内容的 SHA 哈希——适合静态内联脚本，内容不变 hash 就不变。`strict-dynamic` 让已信任的脚本创建的子脚本也自动通过。

**部署策略**：先用 `Content-Security-Policy-Report-Only` 模式灰度——只上报不拦截，看 1-2 周报告确认没有误伤，再切到强制模式。`report-uri` 收集违规 JSON 报告——可以看到谁在尝试攻击你的站点。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "nonce 和 hash 有什么区别、什么时候用哪个" | nonce 适合服务端渲染的动态页面——每次请求生成新 nonce；hash 适合静态内联脚本（如构建时内联的 CSS）——内容不变 hash 就不变。nonce 更安全但需要服务端配合 |
| "CSP 能完全防止 XSS 吗" | 不能——CSP 阻止脚本执行，但不能阻止 HTML 注入导致的页面篡改、CSS 注入的钓鱼 UI。而且是最后一道防线——前端还是要做输入过滤和输出转义。纵深防御 |
| "CSP 配了之后第三方 SDK（如监控）报错怎么办" | 把 SDK 的域名加进 `script-src` 白名单，或用 `strict-dynamic`——nonce 信任的脚本动态创建的 `<script>` 自动通过。注意 `strict-dynamic` 会让 URL 白名单失效 |

## Q2: CSP 怎么做到"不误伤业务 + 阻止攻击"？

### 30 秒版本

"三步走：先用 Report-Only 模式收集 1-2 周数据——拿到所有合法资源来源的清单；然后加 nonce 给服务端渲染的合法脚本发通行证；最后用 `strict-dynamic` 让第三方 SDK 动态创建的脚本自动继承信任——不用把 SDK 和 SDK 加载的子资源全部列进白名单。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "你们的 CSP 策略现在是什么状态" | 坦诚——大部分项目还没配或只用 Report-Only。面试主要是展现你理解 CSP 的设计意图和部署策略 |
| "CSP 有哪些常见的误配" | `default-src *` 等于没配；`script-src 'unsafe-inline'` 让内联脚本全部通过——CSP 形同虚设；忘了 `frame-ancestors` 和 `form-action`——`default-src` 管不到它们 |

## 别踩的坑

1. **"'unsafe-inline' 是最简单的方案"** —— 确实最简单，但等于没配 CSP。XSS 注入的内联脚本也通过了
2. **CSP 多个策略取交集** —— 如果 HTTP 头和 meta 同时有 CSP，浏览器取最严格（交集）。不是合并，是收紧
3. **`default-src` 不覆盖 `frame-ancestors`/`form-action`/`report-uri`** —— 这几个指令需要独立设置，很容易漏
4. **CSP 配太严→线上功能挂了** —— 这就是为什么推荐先用 Report-Only + 灰度上线

## 相关阅读

- [CSP 内容安全策略 知识文档](../../浏览器/安全/csp.md)
- [XSS 面试回答](./xss-csrf.md)
- [HTTPS 与传输安全](../../浏览器/安全/https-security.md)

## 更新记录

- 2026-07-11：新建（30秒/2分钟/追问预判/易错点 标准格式）
