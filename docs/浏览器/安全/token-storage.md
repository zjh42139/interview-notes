---
title: Token 存储安全
description: Token 存储方案安全性对比、双 Token 策略与项目落地实践
category: 安全
type: security
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Token
  - Cookie
  - HttpOnly
  - SameSite
  - LocalStorage
---

# Token 存储安全
> 📘 **深度阅读**：[浏览器/$(case "$(basename "$f" .md)" in xss|csrf) echo "xss-csrf";; csp) echo "browser-security";; token-storage) echo "cookie";; esac).md](../$(case "$(basename "$f" .md)" in xss|csrf) echo "xss-csrf";; csp) echo "browser-security";; token-storage) echo "cookie";; esac).md) —— 本文为面试清单视角，浏览器模块为完整技术原理。

> ⭐⭐⭐⭐｜难度：中级｜项目：★★★

**Token 存储方案的选择直接决定整个认证体系的安全性，推荐 accessToken（短期，内存）+ refreshToken（长期，HttpOnly Cookie）的双层策略，在安全性和用户体验之间取得最优平衡。**

## 一句话总结

**Token 存储方案选择直接影响安全性，推荐 accessToken 内存 + refreshToken HttpOnly Cookie 的双层策略，前者防 XSS，后者防 CSRF，两者互补。**

## 核心机制

### 四种存储方式安全性对比

```ts
// ┌──────────────┬──────────┬───────────┬──────────┬─────────┐
// │   存储方式     │ XSS 可读  │ CSRF 携带  │ 刷新丢失  │  容量   │
// ├──────────────┼──────────┼───────────┼──────────┼─────────┤
// │ LocalStorage  │    是    │    否     │   否     │  5MB   │
// │ SessionStorage│    是    │    否     │标签页隔离  │  5MB   │
// │ Cookie(HttpOnly)│  否    │    是     │   否     │  4KB   │
// │ 内存(JS变量)   │    否    │    否     │   是     │ 无限制  │
// └──────────────┴──────────┴───────────┴──────────┴─────────┘

// 结论：
// LocalStorage：XSS 可窃取 → 不推荐存 accessToken
// SessionStorage：同上 + 多标签页不同步
// Cookie(HttpOnly)：HttpOnly 防 XSS 读取，但自动携带需 SameSite 防 CSRF
//   适合存 refreshToken + SameSite=Strict
// 内存(JS变量)：XSS 读不到闭包变量，不自动发送防 CSRF
//   刷新丢失需配合 refreshToken 恢复，最适合存 accessToken
```

### 双 Token 策略详解

```ts
// =============== 双 Token 架构 ===============
// accessToken：短期（15min-1h），内存（Pinia Store），用途：API 鉴权
// refreshToken：长期（7-30d），HttpOnly Secure SameSite=Strict Cookie，用途：仅刷新 accessToken

// 四个安全点环环相扣：
// 1. accessToken 短期 → 泄露后攻击窗口只有 15 分钟
// 2. accessToken 在内存 → XSS 无法读取闭包变量
// 3. refreshToken HttpOnly → JS 无法读取 document.cookie
// 4. refreshToken SameSite=Strict → 跨站请求不携带 → 防 CSRF

// Token 生命周期：
// 登录 → 后端返回 accessToken + 设置 refreshToken Cookie
// 正常请求 → Header: Authorization: Bearer <accessToken>
// 401 → 用 Cookie 中 refreshToken 调 /refresh → 更新内存 accessToken → 重试
// refreshToken 也过期 → 跳转登录页
// 关键：refreshToken 职责单一（仅 /refresh），减少暴露面
```

## 深度拓展

### 追问点 1：为什么 JWT 适合内存存储

```ts
// JWT 无状态，服务端不需查数据库/Redis，直接验签即可
// payload: { "sub":"user-123", "role":"admin", "exp":1680005400 }

// 适合内存的原因：
// 1. 无状态验证 → 水平扩展友好
// 2. payload 可前端直接解析获取角色/权限 → 无需额外 /me 接口
//    const payload = JSON.parse(atob(token.split(".")[1]))
// 3. 内存丢失不可怕 → refreshToken 换新 accessToken 即可
// 注意：JWT 无法主动撤销（服务端不存储），所以 accessToken 必须短时效
```

### 追问点 2：OAuth 2.0 与 PKCE

```ts
// PKCE 防授权码拦截（SPA/移动端必用）：
// 1. 客户端生成 code_verifier（随机 32B Base64URL）
//    const verifier = base64URLEncode(crypto.randomBytes(32))
// 2. code_challenge = SHA256(verifier) 的 Base64URL
//    const challenge = base64URLEncode(sha256(verifier))
// 3. 授权请求携带 challenge → 用户授权 → 服务端返回 auth_code
// 4. Token 请求携带 auth_code + verifier → 服务端验哈希 → 发放 Token
// 原理：攻击者截获 auth_code 但没有 verifier，无法换取 Token

// 移动端安全存储：iOS Keychain / Android Keystore（系统级硬件加密）
```

### 追问点 3：BFF 模式

```ts
// BFF（Backend For Frontend）：Token 从不出现在浏览器端
// 前端 ← Session Cookie(同源) → BFF 服务 ← accessToken → API 服务器
//
// 优势：
// 1. Token 不在浏览器 → XSS 完全无法窃取任何 Token
// 2. 前端只持有 Session Cookie → 浏览器原生机制足够
// 3. BFF 集中管理 Token 刷新/撤销 → 前端无感知
// 4. BFF 与前端同源 → Cookie SameSite=Strict 不影响体验
//
// 代价：多一层服务（部署/维护成本），适合金融/医疗等高安全场景
//
// BFF 核心逻辑：
// app.use("/api/*", async (req, res) => {
//   const token = await getToken(req.session.userId)
//   const response = await fetch(apiServer + req.path, {
//     headers: { Authorization: `Bearer ${token}` }
//   })
//   res.json(await response.json())
// })
```

## 项目实战

### 1. 完整 Token 管理方案

```ts
// stores/auth.ts —— Pinia Store + Axios 拦截器
import { defineStore } from "pinia"
import axios from "axios"
import { ref } from "vue"

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null)
  let refreshPromise: Promise<string> | null = null  // 并发锁

  async function login(username: string, password: string) {
    const res = await axios.post("/api/login", { username, password })
    accessToken.value = res.data.accessToken
    // refreshToken 由后端 HttpOnly Cookie 设置
  }

  async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) return refreshPromise  // 共享锁
    refreshPromise = (async () => {
      try {
        const res = await axios.post("/api/refresh")
        accessToken.value = res.data.accessToken
        return res.data.accessToken
      } catch {
        accessToken.value = null
        window.location.href = "/login"
        throw new Error("refresh failed")
      } finally {
        refreshPromise = null
      }
    })()
    return refreshPromise
  }

  return { accessToken, login, refreshAccessToken }
})

// Axios 拦截器：自动携带 Token + 401 自动刷新
function setupAxiosInterceptors(auth: ReturnType<typeof useAuthStore>) {
  axios.interceptors.request.use((config) => {
    if (auth.accessToken) config.headers.Authorization = `Bearer ${auth.accessToken}`
    return config
  })

  axios.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status !== 401 || error.config._retry) {
        return Promise.reject(error)
      }
      error.config._retry = true
      const newToken = await auth.refreshAccessToken()
      error.config.headers.Authorization = `Bearer ${newToken}`
      return axios(error.config)
    }
  )
}
```

### 2. 登出清除策略

```ts
async function completeLogout() {
  const auth = useAuthStore()
  auth.accessToken = null            // 1. 清除前端内存
  await axios.post("/api/logout")    // 2. 后端：clearCookie + 黑名单 jti
  localStorage.removeItem("user-info") // 3. 清除本地缓存
  router.push("/login")             // 4. 跳转
}
// 后端 logout 必须做两件事：
// - res.clearCookie("refreshToken", { httpOnly, secure, sameSite: "strict" })
// - 将 accessToken jti 加入 Redis 黑名单，TTL = 剩余有效期
```

### 3. 多 Tab 同步登录状态

```ts
// utils/auth-sync.ts
const channel = new BroadcastChannel("auth-sync")

channel.addEventListener("message", (event) => {
  switch (event.data.type) {
    case "LOGOUT":
      useAuthStore().accessToken = null
      router.push("/login")
      break
    case "TOKEN_REFRESHED":
      useAuthStore().accessToken = event.data.token  // 共享刷新结果
      break
  }
})

export function broadcastLogout() { channel.postMessage({ type: "LOGOUT" }) }
export function broadcastTokenRefreshed(token: string) {
  channel.postMessage({ type: "TOKEN_REFRESHED", token })
}
```

## 易错点

1. **JWT 存 LocalStorage** —— 最常见的 Token 泄露方式。XSS 直接 `localStorage.getItem("token")`。accessToken 应存内存。
2. **只用 accessToken 不用 refreshToken** —— 一旦泄露永久有效（直到过期），无法主动撤销。双 Token 缩小攻击窗口。
3. **refreshToken 也存在 LocalStorage** —— 和 accessToken 一起被 XSS 读取，双 Token 策略形同虚设。refreshToken 必须 HttpOnly Cookie。
4. **401 刷新时没有并发锁** —— 多个并发请求同时 401 → 同时触发多次 /refresh。用 `refreshPromise` 共享同一个刷新 Promise。
5. **登出只清前端状态** —— 后端 refreshToken Cookie 必须清除，accessToken 应加入黑名单（有效期内登出后仍可请求）。

## 相关阅读

- [XSS](./xss.md)
- [CSRF](./csrf.md)
- [项目实战/认证鉴权/login-auth](../../项目实战/认证鉴权/login-auth.md)
- [项目实战/认证鉴权/token-refresh](../../项目实战/认证鉴权/token-refresh.md)
- [安全 知识地图](./index.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（四种存储对比 + 双 Token 策略 + JWT/BFF/PKCE + 完整 Token 管理 + 多 Tab 同步）
