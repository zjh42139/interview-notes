---
title: 浏览器存储方案 面试回答
description: 面试中如何回答 Cookie / localStorage / sessionStorage / IndexedDB 的区别和选型
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 浏览器
  - Cookie
  - localStorage
  - sessionStorage
  - IndexedDB
  - 面试回答
---

# 浏览器存储方案 面试回答

> 必考对比题。面试官不要你背容量，要你"根据场景选方案"。

## Q1: Cookie / localStorage / sessionStorage / IndexedDB 有什么区别？

### 30 秒版本

"四个维度对比——容量（Cookie 4KB / Storage 5MB / IndexedDB 无限）、生命周期（Cookie 可设过期 / localStorage 永久 / sessionStorage 标签页关闭即删）、是否随请求发送（只有 Cookie 自动带）、API 复杂度（Cookie 操作字符串 / Storage 简单 KV / IndexedDB 异步事务）。选型：存 Token 用 Cookie+HttpOnly、存用户偏好用 localStorage、存表单草稿用 sessionStorage、存大量结构化数据用 IndexedDB。"

### 2 分钟版本

| 特性 | Cookie | localStorage | sessionStorage | IndexedDB |
|------|--------|-------------|----------------|-----------|
| 容量 | ~4KB | ~5MB | ~5MB | 数百MB+ |
| 生命周期 | 可设过期 | 永久 | 标签页关闭 | 永久 |
| 随请求发送 | ✅ 自动带 | ❌ | ❌ | ❌ |
| 跨标签页 | 可读 | 可读 | 不可读 | 可读 |
| API | 字符串操作 | 简单 KV | 简单 KV | 异步事务 |
| 同源策略 | 可设 domain/path | 同源 | 同源+同标签 | 同源 |

**选型决策**：

- **Token / 登录态** → Cookie + HttpOnly + Secure + SameSite。只有 Cookie 能自动带在每次请求里，HttpOnly 防 JS 窃取
- **用户偏好**（主题、语言）→ localStorage。小数据、长期保存、不需要每次都发给服务器
- **表单草稿** → sessionStorage。标签页关了就清——不残留
- **大量数据**（缓存列表、离线数据）→ IndexedDB。支持索引查询、事务、异步不阻塞主线程

**安全组合**：Cookie 存 Token 时三道防线——HttpOnly（防 XSS 读）、Secure（防 HTTP 明文传输）、SameSite: Strict/Lax（防 CSRF 跨站携带）。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "为什么 Token 不存 localStorage" | localStorage 可以被任意 JS 读到——XSS 攻击直接拿走 Token。Cookie+HttpOnly JS 读不到 |
| "localStorage 满了怎么办" | 超过 5MB 抛 QuotaExceededError。用 try/catch 检测，满了清旧数据或降级存到 IndexedDB |
| "sessionStorage 能在多个标签页间共享吗" | 不能。复制标签页会复制 sessionStorage，但新打开的标签页是独立的 |

## 别踩的坑

1. **Token 存 localStorage** —— 方便但不安全。XSS 一条 `localStorage.getItem('token')` 就拿走了。
2. **Cookie 容量溢出** —— 4KB 很小，存 JWT 尽量精简（去掉不必要的 claim）。超了浏览器静默丢弃。
3. **sessionStorage 当跨页通信用** —— 配合 storage 事件可实现同源跨标签页通信——但能且只能用 localStorage。

## 相关阅读

- [Token 存储安全](./token-storage.md)
- [XSS / CSRF](./xss-csrf.md)

## 更新记录

- 2026-07-15：新建（四存储方案对比表 + 选型决策树 + Token 安全组合）
