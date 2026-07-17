---
title: CSRF
description: CSRF 跨站请求伪造的攻击原理、防御方案与项目实践
category: 安全
type: security
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - CSRF
  - SameSite
  - Token
  - 跨站请求伪造
---

# CSRF

> ⭐⭐⭐⭐⭐｜难度：中级

**CSRF（跨站请求伪造）利用用户已登录的身份，在用户不知情的情况下伪造跨站请求，核心防御是 SameSite Cookie + CSRF Token + Referer 校验三道防线。**

## 一句话总结

**CSRF 利用用户已登录状态伪造请求，攻击者诱导用户访问恶意页面后自动向目标站点发起请求，浏览器自动携带 Cookie 导致操作被认证。核心防御是 SameSite Cookie + CSRF Token + Referer 校验。**

## 核心机制

### 攻击流程

```ts
// CSRF 攻击链路（以银行转账为例）：
// 1. 用户登录 bank.com → 浏览器保存 Cookie: session=abc123
// 2. 用户未登出时访问 evil.com（或被钓鱼邮件引导）
// 3. evil.com 自动提交 form 到 bank.com/transfer：
//    <form action="https://bank.com/transfer" method="POST">
//      <input name="to" value="attacker" />
//      <input name="amount" value="10000" />
//    </form>
//    <script>document.forms[0].submit()</script>
// 4. 浏览器发起跨站请求，自动携带 bank.com 的 Cookie
// 5. bank.com 看到有效 Cookie → 以为是用户本人操作 → 转账成功

// 核心问题：浏览器 Cookie 机制不区分"用户主动发起的请求"和"恶意页面伪造的请求"
```

### GET vs POST vs Ajax 型 CSRF

```ts
// GET 型：<img src="https://bank.com/transfer?to=attacker&amount=10000" />
// 浏览器加载 img 自动 GET + 带 Cookie → 若 GET 有副作用即中招
// 教训：GET 必须幂等、无副作用（RESTful 原则本身就是安全原则）

// POST 型：最常见，form.submit() 自动提交
// form 不受同源策略限制：可跨域、自动带 Cookie、但不能自定义 Header

// Ajax 型：受同源策略限制，跨域 Ajax 响应会被浏览器拦截
// 若 CORS 配置不当（如把请求的 Origin 原样反射进 Access-Control-Allow-Origin
// 且开启 credentials——注意 `*` + credentials 会被浏览器直接拒绝）或 JSONP 场景，也可能成功
```

### 防御方案对比

```ts
// ============ 方案 1：SameSite Cookie（浏览器机制，最本质）============
// Strict：跨站完全不发 Cookie（最安全，但从邮件点链接也显示未登录）
// Lax：仅"顶层导航 GET"时发 Cookie（Chrome 默认，平衡安全与体验）
//   - 允许：<a>点击、<form method="GET">
//   - 阻止：<img>、<iframe>、Ajax、<form method="POST">
// None：跨站也发，必须配 Secure（不防 CSRF）

// ============ 方案 2：CSRF Token（最可靠，服务端校验）============
// 原理：攻击者无法读取目标站点响应，获取不到 Token
// Token 放自定义 Header（X-CSRF-Token）→ 跨站 form 无法自定义 Header → 无法伪造
// 关键：服务端不能只校验 Cookie 里自动带来的 Token——它会随攻击请求自动携带
// 要么 Token 走服务端 Session + 页面注入（本方案），要么比对 Cookie 与 Header（方案 4）

// ============ 方案 3：Referer / Origin 校验 ============
// Referer: bank.com → 同源可信 ✅   Referer: evil.com → 拒绝 ❌
// Origin 更可靠：跨站请求和 POST 请求都会携带，JS 无法修改，
// 也不像 Referer 那样容易被 Referrer-Policy 裁剪或省略
// 两者同时为空应拒绝 —— 正常浏览器请求至少有一个不为空

// ============ 方案 4：双重 Cookie 验证 ============
// Cookie 存 Token（会被携带）+ JS 从 Cookie 读 Token 复制到 Header
// 服务端比对 Cookie token === Header token
// 原理：攻击者页面 JS 无法读 bank.com 的 Cookie（同源策略）
// → 可以带 Cookie 中的 Token，但无法把它复制到 Header
```

## 深度拓展

### 追问点 1：SameSite 三种模式深入

```ts
// Lax 定义："顶层导航 GET"带 Cookie
// "顶层导航" = 浏览器地址栏变化，页面级跳转（非 iframe/ajax/img）
// <a href="bank.com"> → 放行（顶层导航 GET）
// <img src="bank.com/api"> → 阻止（不是顶层导航）
// <form method="POST"> → 阻止（不是 GET）
// fetch("bank.com/api") → 阻止（不是顶层导航）
// 对不支持 SameSite 的老浏览器（IE），需回退 CSRF Token
```

### 追问点 2：为什么 CSRF Token 不能放 Cookie

```ts
// Cookie 的自动携带是双刃剑：方便用户，也方便攻击者
// 若 Token 在 Cookie：Cookie: csrf_token=xyz; session=abc
//   攻击者 form 提交 → 浏览器自动带 csrf_token=xyz → 服务端以为合法 → 失效
// 正确：Token 在自定义 Header（X-CSRF-Token: xyz）
//   跨站 form 无法加自定义 Header → 攻击者无法伪造 → 真正"不可伪造"
```

### 追问点 3：SSR 场景下 CSRF Token 传递

```ts
// SSR 首次加载时，Token 必须通过 HTML 注入
// 方式 A（推荐）：<meta name="csrf-token" content="<%= token %>">
// 方式 B：<script>window.__CSRF_TOKEN__ = "<%= token %>"</script>

import axios from "axios"

let csrfToken: string | null = null

export function getCsrfToken(): string | null {
  if (csrfToken) return csrfToken
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
  if (meta) csrfToken = meta.content
  return csrfToken
}

const api = axios.create({ baseURL: "/api" })
api.interceptors.request.use((config) => {
  const token = getCsrfToken()
  if (token && ["post", "put", "patch", "delete"].includes(config.method!)) {
    config.headers["X-CSRF-Token"] = token
  }
  return config
})
```

## 项目实战

### 1. 后端 CSRF 中间件（Express）

```ts
import { Request, Response, NextFunction } from "express"

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next()

  const origin = req.headers.origin || req.headers.referer
  if (origin && !isAllowedOrigin(origin as string)) {
    return res.status(403).json({ error: "Invalid origin" })
  }

  const headerToken = req.headers["x-csrf-token"] as string
  const cookieToken = req.cookies?.["csrf-token"]
  if (!headerToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: "CSRF token invalid" })
  }

  next()
}
```

### 2. SPA 敏感操作双重确认

```ts
// 转账、修改密码：CSRF Token + 二次密码确认
async function handleTransfer(formData: TransferForm) {
  if (!confirmPassword) {
    ElMessage.warning("请输入密码确认操作")
    return
  }
  await api.post("/transfer", { ...formData, confirmPassword })
  ElMessage.success("转账成功")
}
```

## 易错点

1. **GET 请求不用防 CSRF** —— 有副作用的 GET 接口（`/api/delete?id=1`）必须防御。遵循 RESTful 原则让 GET 幂等本身就是安全措施。
2. **"登录接口不需要防 CSRF"** —— 不完全对。"登录 CSRF"真实存在：攻击者用自己的凭据伪造登录请求，让受害者在不知情中登录攻击者的账号，之后受害者输入的隐私、绑定的银行卡都落入攻击者账户。严格的系统连登录表单也带 CSRF Token。
3. **SameSite=Lax 就万事大吉** —— 旧浏览器（IE）不支持，同站点内跨子域 CSRF 不一定拦住，且 Lax 放行的跨站 GET 顶层导航仍会带 Cookie（所以 GET 绝不能有副作用），仍需 Token 兜底。
4. **Origin 和 Referer 同时为空就放行** —— 应拒绝。正常浏览器至少有一个不为空，两者为空更可能是伪造请求。
5. **"CSRF Token 存哪都一样"** —— 一旦存在 XSS，任何 JS 可读的 Token（LocalStorage / 内存 / 非 HttpOnly Cookie）都能被读取——XSS 面前 CSRF 防御全部失效。这正是"先防 XSS、CSRF Token 只防跨站伪造"的纵深分工。

## 相关阅读

- [XSS](./xss.md)
- [Token 存储安全](./token-storage.md)
- [项目实战/认证鉴权/login-auth](../../项目实战/认证鉴权/login-auth.md)
- [安全 知识地图](./index.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（攻击流程 + 四种防御对比 + SameSite 深入 + SSR Token 传递 + 中间件实战）
