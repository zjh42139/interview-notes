---
title: 浏览器缓存 面试回答
description: 面试中如何回答浏览器缓存——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - 浏览器缓存
  - 强缓存
  - 协商缓存
  - Cache-Control
  - ETag
---

# 浏览器缓存 面试回答

## Q1: 强缓存和协商缓存有什么区别？

### 30 秒版本

"强缓存——浏览器不请求服务器，直接从本地拿（200 from disk cache），由 Cache-Control 控制。协商缓存——浏览器带条件头发请求给服务器，服务器说'没变'（304）用本地，'变了'（200）下载新的，由 ETag/Last-Modified 控制。"

### 2 分钟版本

"缓存分为两步决策——先问强缓存能不能直接用，不能就走协商缓存。

**强缓存——不发请求**。控制头：`Cache-Control: max-age=3600`（相对时间/当前标准）、`Expires`（绝对时间/已淘汰）。命中返回 200 from disk/memory cache。Cache-Control 优先级高于 Expires。

**协商缓存——发请求但不一定下载**。两个条件头：`If-None-Match` 对应 ETag（内容级精确）、`If-Modified-Since` 对应 Last-Modified（秒级精确）。服务器对比→没变返回 304 空响应体→变了返回 200 + 新文件。ETag 比 Last-Modified 更精确——同一秒内两次修改 Last-Modified 检测不到。

**项目策略**：
- HTML → `no-cache` 每次验证。保证发版后用户立刻拿到新 HTML，防止引用已删除的旧 JS/CSS
- JS/CSS（带 hash）→ `max-age=31536000, immutable`。hash 变了就是新 URL，旧缓存自然淘汰
- 图片/字体 → `max-age=86400` + ETag。短期强缓存 + 协商兜底
- API GET → 不缓存或 `max-age=10` 短缓存"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "ETag 和 Last-Modified 优先级" | ETag 更高——内容级别比较。两者都存在时 ETag 优先匹配 |
| "为什么 HTML 设 no-cache" | HTML 是入口——发版后 JS/CSS hash 变了但旧 HTML 还在缓存→引用旧资源→404→白屏 |
| "from disk cache 和 from memory cache 区别" | memory 内存/速度最快/容量小/页关闭即释；disk 磁盘/持久化/容量大。浏览器自动决定 |

## 别踩的坑

1. **"no-cache 是不缓存"** —— 最常见误解。`no-cache` 是缓存但每次验证。不缓存的是 `no-store`
2. **HTML 强缓存导致白屏** —— 前端事故 top 3。HTML 必须每次验证
3. **"缓存就是后端的事"** —— 前端可通过 HTTP 头、Service Worker、Memory Cache 精细控制

## 相关阅读

- [浏览器缓存 知识文档](../../浏览器/cache.md)
- [缓存策略体系](../../性能优化/caching-strategy.md)
- [HTTP / HTTPS 面试回答](../网络/http-https.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）
