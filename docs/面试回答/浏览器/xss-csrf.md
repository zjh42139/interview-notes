---
title: XSS / CSRF 面试回答
description: 面试中如何回答 XSS 和 CSRF——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - XSS
  - CSRF
  - Web安全
  - 面试回答
---

# XSS / CSRF 面试回答

## Q1: XSS 是什么？怎么防？

### 30 秒版本

"XSS 是跨站脚本攻击——攻击者把恶意脚本注入到页面里执行。三种类型：反射型（URL 参数直接拼进 HTML）、存储型（恶意代码存数据库里被所有用户看到）、DOM 型（JS 从不可信来源取数据写进 DOM）。防御四层：输出转义、HttpOnly Cookie、CSP 白名单、输入校验。"

### 2 分钟版本

"先区分三种 XSS 的攻击路径：

**反射型**——攻击在请求里。用户点击恶意链接→URL 里的脚本反射到页面上立即执行。常见入口：搜索框、错误提示把参数原样输出到页面。

**存储型（最危险）**——攻击在数据库里。攻击者提交的恶意代码被存到服务器→其他用户访问时页面嵌入了这段代码→在所有受害者浏览器里执行。常见入口：评论区、用户资料、私信。

**DOM 型**——攻击全在客户端。JS 从 URL hash、referrer、postMessage 取了不可信数据→直接写进 DOM。浏览器没发请求到服务器，攻击完全不经过服务端。

**四层防御**：1) 输出转义——HTML 正文用 `&lt;` `&gt;`、属性值用 `&quot;`、script 块用 `\x3C`。多语境转义——不能一个转义函数覆盖所有场景。2) HttpOnly Cookie——Token 设为 HttpOnly，浏览器不让 JS 读。即使 XSS 了，攻击者拿不到用户身份。3) CSP——`Content-Security-Policy` HTTP 头，白名单控制资源加载。XSS 即使注入成功，攻击者的脚本不在白名单里→不执行。4) 输入校验——前后端双重校验，富文本用 DOMPurify 白名单过滤。

**和 CSRF 的本质区别**：XSS 是在受害者页面里执行恶意代码（代码注入），CSRF 是利用受害者已登录身份发伪造请求（身份盗用）。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "innerHTML 和 textContent 哪个安全" | textContent 始终当纯文本，天然安全。innerHTML 直接插 HTML——是 XSS 入口 |
| "CSP 的 nonce 机制" | 每次请求生成随机 nonce 值，合法 script 标签带上相同 nonce——CSP 只放行带正确 nonce 的脚本。攻击者猜不到 nonce |
| "DOM 型 XSS 后端怎么防" | 防不了——DOM 型完全不经过服务端。只能在客户端的 JS 层面做输入校验和输出转义 |

## 别踩的坑

1. **"XSS 是后端问题"** —— 三种 XSS 中 DOM 型完全不经过服务端，纯粹是前端自己的问题
2. **只用 innerHTML 转义不够** —— 多语境转义——HTML 正文、属性值、URL 参数、CSS 值、script 块各需要不同的转义规则。一个 `escapeHTML` 函数不能保护所有场景
3. **CSP 能替代输出转义** —— 不能。CSP 是防御纵深——它假设 XSS 可能已经在某处发生了，限制攻击面。但不可替代正确的输出转义

## 相关阅读

- [XSS / CSRF 知识文档](../../浏览器/安全/xss.md)
- [CSRF](../../浏览器/安全/csrf.md)
- [CSP](../../浏览器/安全/csp.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）
