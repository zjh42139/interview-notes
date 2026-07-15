---
title: "认证 / 授权安全（JWT / OAuth）"
description: JWT 安全最佳实践、OAuth 2.0 授权码流程+PKCE、refresh token rotation、session fixation 防御
category: 安全
type: mechanism
score: 85
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - JWT
  - OAuth
  - 认证安全
---

# 认证 / 授权安全（JWT / OAuth）

> ⭐⭐⭐⭐｜难度：中高级｜登录方案的安全边界

## 一句话总结

**JWT 不是银弹——签名防篡改但 payload 是明文。安全使用：短过期 access token + refresh token、HTTPS-only 传输、HttpOnly Cookie 防 XSS、refresh token rotation 防泄露。OAuth 2.0 授权码+PKCE 替代隐式流程——不在 URL 中暴露 token。**

## 核心机制

### JWT 安全实践

```javascript
// ❌ 不安全：长期 token 存 localStorage——XSS 一条代码拿走
localStorage.setItem('token', jwt);

// ✅ 安全：短过期 token + HttpOnly Cookie
// access token: 15min 过期，放在 HttpOnly Cookie 中（JS 不可读）
// refresh token: 7 天过期，用于获取新 access token

// refresh token rotation：每次刷新返回新 refresh token——旧的失效
// 如果旧 refresh token 被偷——攻击者和合法用户同时用——服务端检测到旧 token 被重用
// → 立即失效所有 token——强制重新登录
```

**JWT 三大安全风险**：
- Payload 未加密（Base64 编码≠加密）——不要放敏感数据
- 无法强制失效——签发的 token 过期前一直有效（除非加黑名单）
- `alg: none` 攻击——用 HS256 公钥签名 JWT——必须验证 alg 字段

### OAuth 2.0 + PKCE

```javascript
// ❌ 隐式流程（Implicit Grant）：token 在 URL hash 中返回
// redirect_uri#access_token=xxx —— 不推荐，token 暴露在浏览器历史

// ✅ 授权码 + PKCE（Proof Key for Code Exchange）
// 1. 客户端生成 code_verifier + code_challenge
// 2. 用户授权后返回 authorization code（一次性，不能单独用）
// 3. 客户端用 code + code_verifier 换 access token
// token 不出现在 URL 中——PKCE 防授权码拦截
```

### session + cookie 安全

```
session fixation：攻击者先获取一个 session ID → 诱导用户用这个 ID 登录
→ 攻击者用同一个 session ID 冒充用户
防御：登录成功后 regenerate session ID —— 旧 ID 失效
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "JWT 有什么安全问题" | 追问"payload 加密了吗"——Base64 不是加密 |
| "token 过期了怎么处理" | 追问 refresh token rotation |

## 相关阅读

- [Token 存储安全](./token-storage.md)
- [XSS](./xss.md)

## 更新记录

- 2026-07-16：新建——JWT安全实践+OAuth PKCE+session fixation
