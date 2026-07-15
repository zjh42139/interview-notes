---
title: 缓存策略 面试回答
description: 面试中如何回答前端缓存策略——HTTP 缓存/CDN/Service Worker/Memory Cache 四层体系
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 性能优化
  - 缓存
  - 面试回答
---

# 缓存策略 面试回答

> 性能优化的核心题。面试官要的不是"强缓存和协商缓存"，而是"你项目里怎么分场景配缓存的"。

## Q1: 你项目里怎么做缓存的？

### 30 秒版本

"四层缓存体系——HTTP 缓存控制发不发请求、CDN 缩短物理距离、Service Worker 给离线兜底、Memory/Disk Cache 浏览器自己管。按资源类型分配策略：HTML 用 no-cache 协商（保证最新）、带 hash 的 JS/CSS 永久强缓存、API 不缓存、图片短期缓存。"

### 2 分钟版本

**按资源类型的缓存策略**——这是面试要讲的核心：

| 资源类型 | 策略 | 配置 | 原因 |
|---------|------|------|------|
| HTML 入口 | no-cache 协商 | `Cache-Control: no-cache` | 必须拿到最新版本——但允许 304 缓存。no-store 连 304 都放弃了 |
| JS/CSS（hash） | 永久强缓存 | `max-age=31536000, immutable` | 文件名变了就是新资源，旧缓存永不使用 |
| 图片/字体 | 长期强缓存 | `max-age=2592000`（30天） | 低频变资源——30 天够长，改了就换文件名 |
| API 响应 | 不缓存 | `no-store` | 数据实时性要求高——缓存了看到旧数据是 bug |

**为什么 HTML 用 no-cache 而不是 no-store？** no-store 每次都重新下载整个 HTML。no-cache 允许 304 响应——响应体为空只有几百字节的头部，比重新下载几十 KB 的 HTML 快得多。304 是优化，no-store 是放弃优化。

**CDN 层**：带 hash 的静态资源部署到 CDN——北京用户访问北京节点（~5ms vs 回源 ~30ms）。配合文件名 hash——内容变了文件名就变，CDN 缓存自动失效。

**Service Worker**：只在 PWA/离线需求时用。Cache First 策略缓存静态资源——先取缓存再发请求。Network First 策略缓存 API——先请求网络，失败回退缓存（离线可读旧数据）。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "文件名 hash 怎么实现" | Webpack/Vite 的 `[contenthash:8]`——输出文件名包含文件内容的 hash。改了内容 hash 变→文件名变→浏览器请求新文件 |
| "怎么保证 CDN 缓存和源站一致" | 文件名 hash 是最可靠的方式。不能 hash 的资源发版时用 CDN 刷新/预热 |
| "Service Worker 适合后台管理系统吗" | 一般不适合——后台系统数据实时性高、没有离线需求、SW 增加调试复杂度。PWA/内容型站点才需要 |

## 别踩的坑

1. **HTML 缓存太久** —— 用户看到旧 HTML→加载旧 JS→页面炸了。HTML 永远 no-cache。
2. **所有资源都强缓存** —— API 数据缓存导致用户看到旧数据。只有静态资源适合强缓存。
3. **没配 immutable** —— `immutable` 告诉浏览器"没过期之前绝对不变"——浏览器跳过条件验证请求。配合 hash 文件名使用。

## 相关阅读

- [HTTP 缓存](../../网络/http-cache.md)
- [缓存策略体系](../../性能优化/caching-strategy.md)
- [浏览器缓存](../浏览器/cache.md)

## 更新记录

- 2026-07-15：新建（四层体系 + 按资源分配策略表 + 为什么 no-cache 不是 no-store）
