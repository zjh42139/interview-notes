---
title: Token 存储安全 面试回答
description: 面试中如何回答 Token 存储方案——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - Token
  - Cookie
  - LocalStorage
  - HttpOnly
  - SameSite
  - Secure
  - 面试回答
---

# Token 存储安全 面试回答

## Q1: Token 应该存在 Cookie 还是 LocalStorage？

### 30 秒版本

"生产环境推荐 HttpOnly Cookie——三个属性：HttpOnly 防 XSS 读 Token、Secure 确保只在 HTTPS 下传输、SameSite 防 CSRF 带 Token。LocalStorage 的问题是任一 XSS 漏洞就能直接读到 Token——攻击者拿到 Token 就能冒充用户。双 Token 策略：Access Token 短期放内存，Refresh Token 长期放 HttpOnly Cookie。"

### 2 分钟版本

"Token 存储本质是安全性和便利性的权衡。三种方案：

**LocalStorage**：前端存取最方便——`Authorization: Bearer xxx` 直接设置。但致命问题是 XSS 能读到——任意一个第三方脚本有 XSS 漏洞，Token 就泄露了。面试中直接说用 LocalStorage 会减分——没有安全考量。

**HttpOnly Cookie**：JS 完全读不到——XSS 拿不到 Token。Set-Cookie 时设 `HttpOnly; Secure; SameSite=Strict`。缺点：所有请求自动带 Cookie → CSRF 风险 → 靠 SameSite 解决。不能读 JS 所以 Authorization 头用不了 → 后端改读 Cookie。

**双 Token 策略（推荐）**：Access Token 短有效期（15min）存 JS 内存——每次请求带在 Authorization 头；Refresh Token 长有效期存 HttpOnly Cookie——用于无感刷新。Access Token 泄露窗口只有 15 分钟，Refresh Token JS 拿不到——安全性最高。并发 401 时用 `pendingRefreshPromise` 缓存刷新请求——只调一次刷新接口。

**BFF（Backend For Frontend）方案**：Token 完全不存前端——存在 BFF 层的 session 中，前端只维护一个 session cookie。最安全但需要额外中间层。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Access Token 为什么存内存不存 LocalStorage" | 内存变量在页面刷新后自然丢失——配合 Refresh Token 无感刷新；LocalStorage 永久持久——XSS 拿到 Token 后攻击窗口无限长 |
| "SameSite Strict 和 Lax 怎么选" | Strict：跨站请求完全不带 Cookie——最安全但用户体验差（从外部链接点进来没登录态）。Lax：顶级导航 GET 请求带 Cookie——平衡安全和体验，是 Chrome 默认值 |
| "为什么不在所有场景用 HttpOnly Cookie" | Access Token 需要被 JS 读取才能加到请求头——如果后端支持读 Cookie 做鉴权就不需要。但 Authorization 头是跨域通用的标准方案 |

## Q2: Secure 和 HttpOnly 可以只用其中一个吗？

### 30 秒版本

"不建议。Secure 防中间人窃听——Token 只在 HTTPS 下传；HttpOnly 防 XSS 读——JS 拿不到 Token。只用 HttpOnly 不加 Secure → 中间人可能通过 HTTP 窃取 Cookie。只用 Secure 不加 HttpOnly → XSS 能通过 `document.cookie` 读到。两者解决不同的攻击向量，必须组合使用。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Cookie 的 Domain 属性设不对会怎样" | Domain 设成父域名→子域名也能读到 Cookie——扩大了攻击面。应该不设 Domain（默认当前域名），或用最精确的域名 |
| "Refresh Token 过期了用户怎么办" | 清除内存和 Cookie 中所有 Token → 跳转登录页。用户需要重新输入密码。这是安全考量——Refresh Token 不能用永不过期 |

## 别踩的坑

1. **"Cookie 设了 HttpOnly 就安全了"** —— 还要加 Secure（防中间人）和 SameSite（防 CSRF）。三个属性解决三个不同问题
2. **把 CSRF Token 放在 Cookie 里** —— Cookie 会自动发送——攻击者也带着。CSRF Token 必须放在请求头或 body 中
3. **在生产环境用 `SameSite=None` 不加 `Secure`** —— Chrome 会拒绝设置——`SameSite=None` 必须搭配 `Secure`
4. **多子域名共享 Cookie 时 Domain 设太宽** —— `Domain=.example.com` 让所有子域名都能读到——测试环境的 XSS 可能泄露生产 Cookie。按需精确设置 Domain

## 相关阅读

- [Token 存储安全 知识文档](../../浏览器/安全/token-storage.md)
- [登录鉴权 面试回答](../项目/login-auth.md)
- [CSP 面试回答](./csp.md)

## 更新记录

- 2026-07-11：新建（30秒/2分钟/追问预判/易错点 标准格式）
