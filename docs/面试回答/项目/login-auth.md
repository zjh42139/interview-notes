---
title: 登录鉴权 面试回答
description: 面试中如何回答登录鉴权方案——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-10
reviewed: null
tags:
  - 登录
  - 鉴权
  - Token
  - JWT
  - 面试回答
---

# 登录鉴权 面试回答

## Q1: 你们项目的登录鉴权方案是怎样的？

### 30 秒版本

"我们用 JWT 双 Token 方案——登录成功后后端返回 Access Token（短期）和 Refresh Token（长期）。Access Token 存 JS 内存，每次请求带在 Authorization 头；Refresh Token 存 HttpOnly Cookie。Access Token 过期后自动用 Refresh Token 无感刷新。用户无感知。"

### 2 分钟版本

"STAR 法则来讲：

**Situation**：Vue3 + TypeScript 后台管理系统，多部门多角色——不同角色看到的页面和操作完全不一样。登录不只是验证身份，还要在登录时完成权限初始化。

**Task**：实现安全的登录鉴权 + Token 管理 + 权限初始化。

**Action**：
1. **登录流程**：用户名密码 → POST 登录接口 → 返回 `{ accessToken, refreshToken, userInfo }`。accessToken 存 JS 变量（内存，刷新丢失），refreshToken 存 HttpOnly Cookie（防 XSS 读不到、自动带后端）。userInfo 含角色+权限标识列表，存 Pinia store。
2. **请求携带 Token**：Axios 请求拦截器自动在 `Authorization: Bearer xxx` 上加 accessToken。响应拦截器捕获 401→调用刷新接口→拿到新 accessToken→重试失败的请求。
3. **并发 401 处理**：多个请求同时返回 401 时，刷新接口只调一次——用 `pendingRefreshPromise` 缓存刷新中的 Promise，其他 401 请求 await 同一个 Promise。刷新成功后批量重试。刷新失败（refreshToken 也过期）→清除 Token→跳转登录页。
4. **权限初始化**：登录成功后调 `getUserInfo` 接口拿权限标识。`router.addRoute` 动态注册有权限的路由。定时器或页面聚焦时检查 token 是否即将过期→提前刷新。

**Result**：用户无感登录，Token 自动刷新。并发 401 只调一次刷新接口。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Access Token 为什么存内存不存 LocalStorage" | LocalStorage 可被 JS 读取——XSS 攻击能直接偷走 Token。内存变量在页面刷新后自然丢失——配合 Refresh Token 重新获取，安全性更高 |
| "Refresh Token 过期了怎么办" | 清除所有 Token 和用户信息→跳转登录页。用户需要重新输入密码 |
| "怎么防止 Token 被盗用" | HttpOnly Cookie 防 XSS 读；SameSite 防 CSRF 带 Token；accessToken 短期（15min）减小被盗后的危害窗口 |

## 别踩的坑

1. **"Token 存 LocalStorage 就够了"** —— 面试中说这句会被追问到挂。LocalStorage 对 XSS 完全不设防。Token 应该存在 HttpOnly Cookie 或内存中
2. **并发 401 不处理** —— 多个 401 同时触发多次刷新请求——后端压力爆炸 + 可能产生竞态。必须缓存刷新 Promise
3. **Token 过期判断只在 401 时做** —— 更好的做法：前端解析 JWT 的 exp 字段，提前 5 分钟主动刷新——减少用户看到 401 的可能

## 相关阅读

- [登录鉴权 知识文档](../../项目实战/认证鉴权/login-auth.md)
- [Token 刷新](../../项目实战/认证鉴权/token-refresh.md)
- [权限系统 面试回答](./permission-rbac.md)

## 更新记录

- 2026-07-10：重构（30秒/2分钟/追问预判/易错点 标准格式）
