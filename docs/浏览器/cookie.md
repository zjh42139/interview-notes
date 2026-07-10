---
title: Cookie 深度解析
description: Cookie 的全部属性（Domain/Path/Expires/HttpOnly/Secure/SameSite）、安全最佳实践和现代认证方案中的角色
category: 浏览器
type: security
score: 82
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - Cookie
  - SameSite
  - HttpOnly
  - Secure
  - 认证
---

# Cookie 深度解析

> &#11088;&#11088;&#11088;&#11088;&#11088;｜难度：中级｜项目：&#9733;&#9733;&#9733;&#9733;

## 一句话总结

**Cookie 是唯一能在 HTTP 请求中自动携带的存储方式——`HttpOnly` 防 XSS 偷取、`Secure` 防中间人劫持、`SameSite` 防 CSRF 伪造、`Domain/Path` 控制作用范围。这四个属性组合决定了你的认证方案是固若金汤还是一击即溃。**

## 核心机制

### Cookie 的六大属性

```http
Set-Cookie: sessionId=aB3xZ9; Domain=.example.com; Path=/; Expires=Tue, 19 Jan 2038 03:14:07 GMT; HttpOnly; Secure; SameSite=Lax
```

| 属性 | 含义 | 默认值（不设置时） | 安全影响 |
|------|------|-------------------|----------|
| **Domain** | Cookie 在哪些域名下发送 | 当前域名（不包含子域名） | 设 `.example.com` → 所有子域共享。设得越宽越危险 |
| **Path** | Cookie 在哪些路径下发送 | 当前路径 | `/` → 全站；`/admin` → 只有 admin 路径。**不是安全边界** |
| **Expires / Max-Age** | 过期时间 | 会话结束即删（Session Cookie） | Max-Age 优先级 > Expires。会话 Cookie 浏览器关闭不一定删除（Chrome `恢复标签页` 保留了会话 Cookie） |
| **HttpOnly** | JS 能否访问 `document.cookie` | `false`（JS 可读） | `true` → **防御 XSS 偷 Cookie**，JS 无法读取 |
| **Secure** | 是否只在 HTTPS 下发送 | `false`（HTTP 也发送） | `true` → 防御中间人攻击嗅探 Cookie |
| **SameSite** | 跨站请求是否携带 | 2026 年前 `None`，现在浏览器默认 `Lax` | `Strict`/`Lax` → **防御 CSRF** |

### SameSite —— 最重要的新增属性

```
SameSite 的三种值：

Strict（最严）
  ┌──────────────────────────────────────┐
  │ 任何跨站请求都不携带 Cookie            │
  │ 从外部链接点击跳转到你的网站 → 不带 Cookie │
  │ → 用户看起来像"未登录"状态              │
  │ 适用：银行、支付等安全要求极高的场景     │
  └──────────────────────────────────────┘

Lax（浏览器默认，平衡安全与体验）
  ┌──────────────────────────────────────┐
  │ 跨站时只在"顶级导航 GET 请求"携带       │
  │ 什么是顶级导航？                       │
  │   ✅ <a href="..."> 点击跳转 → 带 Cookie │
  │   ✅ window.location = "..." → 带 Cookie│
  │   ❌ <img src="..."> → 不带            │
  │   ❌ <form method="POST"> → 不带       │
  │   ❌ iframe 中的请求 → 不带             │
  │   ❌ fetch / XHR → 不带                │
  │ 适用：绝大多数 Web 应用                 │
  └──────────────────────────────────────┘

None（允许跨站携带，必须配合 Secure）
  ┌──────────────────────────────────────┐
  │ 所有请求都携带 Cookie                  │
  │ 必须同时设置 Secure（仅 HTTPS）         │
  │ 适用：第三方嵌入组件、跨域认证          │
  └──────────────────────────────────────┘
```

### Cookie 的安全限制

```javascript
// 1. 数量限制：每个域名最多 ~180 个 Cookie
// 2. 大小限制：每个 Cookie 最大 4KB（含属性）
// 3. 同站 vs 同源：
//    - 同源（Same-Origin）：协议 + 域名 + 端口 完全相同
//    - 同站（Same-Site）：eTLD+1 相同（a.example.com 和 b.example.com 是同站）
//    SameSite Cookie 使用"同站"而非"同源"——子域名之间算同站
```

## 深度拓展

### 前端四种存储方案对比

| 维度 | Cookie | LocalStorage | SessionStorage | IndexedDB |
|------|--------|-------------|----------------|-----------|
| 容量 | ~4KB | ~5MB | ~5MB | 无上限（用户磁盘） |
| 生命周期 | 可设过期时间 / 会话 | 永久（除非手动删） | 标签页关闭即删 | 永久 |
| 作用域 | Domain + Path | 同源 | 同源 + 标签页 | 同源 |
| 自动携带到请求 | ✅ 是（唯一） | ❌ 否 | ❌ 否 | ❌ 否 |
| JS 可访问 | 取决于 HttpOnly | ✅ 是 | ✅ 是 | ✅ 是 |
| 存储类型 | 纯文本 | 纯文本 | 纯文本 | 结构化数据 |
| 安全 | 最灵活也最危险 | XSS 可读 | XSS 可读 | XSS 可读 |

### 现代认证方案中的 Cookie 角色

```
方案 A：纯 Token 方案（LocalStorage）
  登录 → 服务端返回 JWT → 前端存在 localStorage
  后续请求 → 前端手动在 Authorization header 加 Bearer token
  优点：简单、跨域友好
  缺点：XSS 可偷 token（localStorage 无 HttpOnly 保护）
  适用：后台管理系统（纯 CSR）

方案 B：双 Token 方案（Cookie + 内存）
  登录 → 服务端返回 accessToken + refreshToken
  accessToken → 存 JS 变量（内存，防 XSS）
  refreshToken → 存 HttpOnly + Secure + SameSite=Strict Cookie（防 XSS + CSRF）
  accessToken 过期 → 用 Cookie 中的 refreshToken 静默刷新
  优点：安全性最佳
  缺点：实现复杂
  适用：需要高安全性的大型应用

方案 C：纯 Cookie 方案（Session + Cookie）
  登录 → 服务端创建 Session → Set-Cookie: sessionId=xxx
  后续请求 → 浏览器自动携带 Cookie
  优点：最简单、HttpOnly 防 XSS
  缺点：CSRF 需要额外防御、跨域困难
  适用：传统后端渲染站点
```

### 第三方 Cookie 的淘汰

```
第三方 Cookie = 跨站场景下嵌入的 Cookie

例子：
  你在 a.com 页面上嵌入的广告 iframe 来自 ad.com
  ad.com 在你的浏览器中设置 Cookie → 这是第三方 Cookie
  ad.com 在 b.com、c.com 页面上也能读到这个 Cookie
  → 广告商可以跟踪你"在哪些网站看过什么"

Chrome 已开始逐步淘汰第三方 Cookie
  → SameSite=None 的 Cookie 需要 Partitoned 属性
  → 跨站跟踪将越来越困难
  → 影响：第三方登录组件、嵌入式支付、客户聊天插件
```

## 项目实战

### 后台管理系统 Cookie 配置清单

```http
# 认证 Cookie（session / refreshToken）
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=604800

# 主题偏好（非敏感，可 JS 读取）
Set-Cookie: theme=dark; Path=/; Max-Age=31536000; SameSite=Lax
# 注：theme 不需要 HttpOnly——前端需要读取它来设置主题

# 语言偏好
Set-Cookie: lang=zh-CN; Path=/; Max-Age=31536000; SameSite=Lax
```

关键原则：**敏感数据 HttpOnly + Secure + SameSite=Strict，非敏感数据可以放宽。**

### 常见 Cookie 安全陷阱

1. **`HttpOnly` 忘记加** —— `document.cookie` 能读出 sessionId，存储型 XSS 直接偷走
2. **`Secure` 忘记加** —— 在公共 WiFi 下 HTTP 请求明文携带 Cookie，中间人嗅探即可复用
3. **`SameSite` 默认 Lax 不能完全防 GET 请求 CSRF** —— `<img src="https://bank.com/transfer?amount=100&to=hacker">` 这种 GET 请求在 Lax 下仍可能携带 Cookie（某些浏览器的行为差异）
4. **Domain 设得太宽** —— `Domain=.com` 会让 Cookie 在所有 .com 域名下发送（浏览器会拒绝这种写法，但 `.example.com` 等宽域名要谨慎）

## 易错点

1. **Cookie 大小包含属性** —— `Set-Cookie: a=1; HttpOnly; Secure; SameSite=Strict; Path=/long/path` 的属性部分也算在 4KB 限额内
2. **`document.cookie` 只能增改，不能删原生的行** —— `document.cookie = 'a=1'` 不会覆盖其他 Cookie，而是在列表末尾追加。删除靠过期时间：`document.cookie = 'a=; Max-Age=0'`
3. **Path 不是安全边界** —— `Path=/admin` 的 Cookie 在同源 iframe 中仍然可见（`document.cookie` 不显示，但 `fetch('/admin/..')` 会携带）
4. **Session Cookie 在浏览器"恢复标签页"时不会清除** —— Chrome 的"继续上次浏览"功能会让会话 Cookie 复活。**不要依赖"用户关闭浏览器就自动退出"作为安全策略**
5. **`SameSite=None` 必须配合 `Secure`** —— 浏览器会忽略没有 Secure 的 SameSite=None Cookie

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Cookie 和 LocalStorage 有什么区别" | 追问 Token 为什么存在 LocalStorage 不安全 |
| "SameSite 有哪些值" | 追问 SameSite=Lax 能不能完全防 CSRF |
| "Cookie 怎么防 XSS" | 追问 HttpOnly + Secure + SameSite 三层配合 |
| "你们项目的 Token 存在哪里" | 追问 accessToken + refreshToken 双 Token 方案 |

## 相关阅读

- [Web Storage](./storage.md)
- [XSS / CSRF](./xss-csrf.md)
- [同源策略](./same-origin-policy.md)
- [浏览器安全机制](./browser-security.md)

## 更新记录

- 2026-07-10：新建（Cookie 六属性全解 + SameSite 三种模式 + 四大存储方案对比 + 三种认证方案 + 第三方 Cookie 淘汰 + 安全配置清单）
