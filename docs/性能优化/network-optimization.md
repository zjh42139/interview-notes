---
title: 网络传输优化
description: 前端网络请求的优化手段全景——资源提示（preload/prefetch/preconnect）、压缩传输、CDN 部署、HTTP2 对传统优化手段的影响
category: 性能优化
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - 网络优化
  - preload
  - prefetch
  - CDN
  - HTTP2
  - 压缩
---

# 网络传输优化

> ⭐⭐⭐⭐｜难度：高级｜项目：★★★★

## 一句话总结

**网络传输优化的核心就两个字——"少"和"早"。少发请求（合并、缓存、压缩），早发请求（preload、preconnect、prefetch）。HTTP/2 让"少发"的一些手段（文件合并、雪碧图）不再必要，但"早发"手段（资源提示）在 HTTP/2 下依然重要。**

## 资源提示（Resource Hints）

浏览器在解析 HTML 时才知道需要加载什么资源——但如果能在解析之前就"提示"浏览器，就能让关键资源更早开始加载。

### 四种提示对比

| 提示 | 语法 | 时机 | 优先级 | 场景 |
|------|------|------|--------|------|
| **preload** | `<link rel="preload" href="..." as="...">` | 当前页面立即加载 | 高 | 关键字体、首屏 hero 图、关键 CSS |
| **prefetch** | `<link rel="prefetch" href="...">` | 空闲时加载 | 低 | 下一个页面可能用到的 JS |
| **preconnect** | `<link rel="preconnect" href="...">` | 提前建立连接 | — | 第三方域名（CDN、API、分析） |
| **dns-prefetch** | `<link rel="dns-prefetch" href="...">` | 提前 DNS 解析 | — | 轻量版 preconnect |

### preload——当前页面关键资源

```html
<!-- 字体是阻塞渲染的——尽早加载 -->
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- 首屏 hero 大图——在 HTML 解析之前就开始下载 -->
<link rel="preload" href="/hero.webp" as="image">

<!-- 关键 CSS——不用等在 CSS 文件里 @import -->
<link rel="preload" href="/critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

**`as` 属性的重要性**：告诉浏览器资源的类型，决定优先级。不加 `as` 或 `as="script"` 不对——字体可能是最高优先级，script 不一定。

### preconnect + dns-prefetch——提前建连

```
正常流程：
  解析 HTML → 发现 cdn.example.com → DNS 查询（20-120ms）
  → TCP 握手 → TLS 握手 → 发请求
  = 浪费了 100-300ms

preconnect 流程：
  <link rel="preconnect" href="https://cdn.example.com">
  → 浏览器在解析到该资源前就已经完成了 DNS+TCP+TLS
  → 请求时直接复用连接 = 节省 100-300ms
```

```html
<!-- CDN 域名：资源量大，值得完整 preconnect -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- 统计/分析域名：只需要 DNS 解析 -->
<link rel="dns-prefetch" href="https://analytics.google.com">
```

**不要对所有第三方域名都 preconnect**——每个 preconnect 打开一个连接，浏览器同域名连接数有限。只对确定会用到的域名 preconnect。

### prefetch——未来页面资源

```html
<!-- 用户大概率会点击"下一页" → 空闲时下载下一页的 JS bundle -->
<link rel="prefetch" href="/page2.chunk.js" as="script">

<!-- Vue Router 懒加载的页面 → webpack 会自动生成 prefetch -->
```

**webpack 的魔法注释**：
```javascript
// webpack 会自动给这个异步 chunk 生成 <link rel="prefetch">
const About = () => import(/* webpackPrefetch: true */ './About.vue')
```

## 压缩传输

### Gzip vs Brotli

| | Gzip | Brotli |
|------|------|--------|
| 压缩率 | 基准 | **比 Gzip 小 20%**（文本类） |
| 速度 | 较快 | 压缩慢，解压与 Gzip 相当 |
| 兼容性 | 所有浏览器 | IE11+（已不是问题） |
| 适用 | 所有文本资源 | 静态资源（可预压缩）、API 响应 |

```nginx
# Nginx 启用 Brotli（需要 brotli 模块）
brotli on;
brotli_comp_level 6;           # 压缩级别（1-11），6 是性价比最佳
brotli_types text/plain text/css application/javascript application/json;
```

**面试要点**：Brotli 对小文件提升不明显（HTTP 头开销 > 压缩收益），对大 JS bundle 效果显著。做预压缩（构建时压缩成 `.br` 文件）比动态压缩更好——不消耗服务器 CPU。

## CDN 部署策略

### origin + CDN 架构

```
                     ┌─ CDN 深圳（命中返回）
用户（深圳）→ DNS 智能解析
                     └─ CDN 北京（命中返回）

                 缓存未命中 → 回源到源站
```

### 面试要点

1. **文件名 hash 是 CDN 缓存更新的核心手段** —— `app.a1b2c3.js` 改名为 `app.d4e5f6.js`，CDN 视为新文件，自动回源。旧文件等缓存过期自然淘汰
2. **CDN 域名不要和主站相同** —— 避免带上不必要的 Cookie。主站 `example.com`，CDN `cdn.example.com` 或 `static.example.com`
3. **CDN 回源率是核心指标** —— 回源率越低 CDN 的价值越大。一般 95%+ 的请求应该命中 CDN 缓存

## HTTP/2 对传统优化手段的颠覆

HTTP/1.1 时代的很多"最佳实践"在 HTTP/2 下反而有害：

| 传统手段 | HTTP/1.1 的理由 | HTTP/2 下怎么办 |
|----------|----------------|----------------|
| **文件合并**（vendor.js 把所有库打在一起） | 减少 TCP 连接数 | ❌ 合并反而不好——改一行代码整个 vendor.js 缓存失效。HTTP/2 多路复用让多个小文件不成问题 |
| **雪碧图**（CSS Sprite） | 减少图片请求数 | ❌ 不再必要——HTTP/2 并发加载无开销。而且雪碧图维护麻烦、缓存粒度差 |
| **内联 base64** | 减少请求 | ⚠️ 谨慎——base64 体积大 33%，且不能独立缓存。小图标（<2KB）可以 |
| **域名分片**（static1/static2/static3） | 突破浏览器 6 连接限制 | ❌ 反而有害——多一个域名就要多一次 DNS 查询 + TCP 连接 |

**HTTP/2 下应该怎么做**：
- 不用合并文件——每个文件独立缓存，改动不影响其他
- 关键资源用 preload——利用多路复用尽早加载
- 关注"关键请求链"——不是请求数量的问题，是深度的问题（A 加载后才触发 B 加载后才触发 C）

## 项目实战

### 后台管理系统的网络优化清单

1. **CDN 部署静态资源**：构建时生成 hash 文件名 → 上传到 CDN → HTML 中引用 CDN 地址。`webpack_public_path` 或 Vite `base` 配置
2. **API 域名 preconnect**：系统的后端 API 域名在 HTML 的 `<head>` 中 preconnect，节省每个 API 请求的前 100ms
3. **字体文件 preload**：避免字体闪烁（FOUT）——字体是阻塞渲染的
4. **路由懒加载**：每个页面独立 chunk，首屏只加载当前页的 JS。结合 prefetch 预加载用户可能访问的下一页

## 易错点

1. **preload 重复加载** —— `<link rel="preload">` + script 标签同时存在 → 资源下载两次。preload 后一定要被消费（页面里用到同一个 URL），否则浏览器会在 console 警告
2. **HTTP/2 下还在做文件合并** —— 不仅没收益，反而导致缓存粒度太粗、改一行重新下载整个 bundle
3. **所有第三方域名都 preconnect** —— preconnect 会打开连接并保持。对不确定使用的大批量第三方域名做 preconnect 是资源浪费。只对明确会用且请求量大的域名做
4. **Brotli 对已压缩的图片无效** —— JPEG/PNG/WebP 本身就是压缩格式，再用 Brotli 压缩几乎无效甚至变大。Brotli 只对文本类内容有效

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "preload 和 prefetch 有什么区别" | 追问 preload 的 `as` 属性是干什么的——决定优先级 |
| "HTTP/2 下还需要做文件合并吗" | 追问为什么不需要——多路复用 + 独立缓存粒度 |
| "CDN 怎么保证用户拿到最新版本" | 追问文件名 hash + CDN purge 配合 |
| "为什么不在所有地方用 preload" | 追问 preload 占用带宽——过度使用会拖慢真正关键资源的加载 |

## 相关阅读

- [HTTP2 / HTTP3](../网络/http2-http3.md)
- [浏览器缓存](../浏览器/cache.md)
- [缓存策略体系](./caching-strategy.md)
- [打包优化](./bundle-optimization.md)
- [首屏优化](./first-screen.md)

## 更新记录

- 2026-07-10：新建（Resource Hints 四件套 + Gzip/Brotli + CDN 策略 + HTTP/2 颠覆传统优化）
