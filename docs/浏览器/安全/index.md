---
title: 安全 知识地图
description: Web 安全面试知识体系——XSS、CSRF、CSP、HTTPS、Clickjacking、Token 存储、依赖安全
category: 安全
difficulty: null
frequency: null
status: draft
created: 2026-07-05
updated: 2026-07-11
reviewed: null
tags:
  - 安全
---

# 安全 知识地图

```mermaid
mindmap
  root((Web 安全))
    XSS
      反射型
      存储型
      DOM 型
      四层防御
    CSRF
      SameSite Cookie
      CSRF Token
      Origin / Referer 校验
    CSP
      nonce
      hash
      strict-dynamic
      frame-ancestors
      report-uri
    点击劫持
      X-Frame-Options
      frame-ancestors
      iframe sandbox
      X-Content-Type-Options
    HTTPS 传输安全
      HSTS
      证书链验证
      Mixed Content
      TLS 握手
    Token 存储安全
      HttpOnly
      Secure
      SameSite
      双 Token 策略
    前端依赖安全
      SRI
      npm audit
      原型污染
      lockfile
```

## 推荐学习顺序

1. ⭐⭐⭐⭐⭐ [XSS](./xss.md) —— 跨站脚本攻击的三种类型和四层防御
2. ⭐⭐⭐⭐⭐ [CSRF](./csrf.md) —— 跨站请求伪造的原理和 SameSite 防御
3. ⭐⭐⭐⭐ [CSP 内容安全策略](./csp.md) —— 白名单机制 + nonce/hash + 违规报告
4. ⭐⭐⭐⭐⭐ [Token 存储安全](./token-storage.md) —— HttpOnly / Secure / SameSite + 双 Token 策略
5. ⭐⭐⭐⭐ [点击劫持与 iframe 安全](./clickjacking.md) —— X-Frame-Options / frame-ancestors / sandbox
6. ⭐⭐⭐⭐ [HTTPS 与传输安全](./https-security.md) —— HSTS / 证书链 / Mixed Content / TLS 握手
7. ⭐⭐⭐ [前端依赖安全](./supply-chain-security.md) —— SRI / npm audit / 原型污染

## 知识点索引

| 知识点 | 频率 | 难度 | 状态 |
|--------|------|------|------|
| [XSS](./xss.md) | ⭐⭐⭐⭐⭐ | 中级 | reviewed |
| [CSRF](./csrf.md) | ⭐⭐⭐⭐⭐ | 中级 | reviewed |
| [CSP 内容安全策略](./csp.md) | ⭐⭐⭐⭐ | 中级 | reviewed |
| [Token 存储安全](./token-storage.md) | ⭐⭐⭐⭐⭐ | 中级 | reviewed |
| [点击劫持 / iframe 安全](./clickjacking.md) | ⭐⭐⭐⭐ | 中级 | draft |
| [HTTPS 与传输安全](./https-security.md) | ⭐⭐⭐⭐ | 中级 | draft |
| [前端依赖安全](./supply-chain-security.md) | ⭐⭐⭐ | 中级 | draft |

## 相关模块

- [同源策略](../same-origin-policy.md) —— 浏览器安全模型的基础，跨域和 iframe 隔离的根源
- [Cookie 深度解析](../cookie.md) —— HttpOnly / Secure / SameSite 的完整机制
- [HTTP / HTTPS](../../网络/http-https.md) —— 网络层的 HTTPS 协议详解
- [面试题库：安全](../../面试题库/安全.md) —— 8 道安全高频真题

## 更新记录

- 2026-07-11：重写——扩展 mindmap 从 4 节点到 7 模块，+3 新知识文件（clickjacking / https-security / supply-chain-security）
- 2026-07-05：初始创建
