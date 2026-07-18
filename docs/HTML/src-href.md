---
title: src / href
description: src 和 href 的本质区别、浏览器解析时的暂停行为差异
category: HTML
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - src
  - href
  - 资源加载
  - 阻塞
---

# src / href

> 一句话总结：`src` 的语义是把外部资源**嵌入**文档（其中 `<script src>` 会暂停解析并执行，`img`/`iframe` 则异步加载），`href` 是与外部资源**建立关联**，不暂停当前文档解析。

## 核心机制

### 本质区别

| 维度 | src | href |
|------|-----|------|
| 英文全称 | source | hypertext reference |
| 语义 | **引入/嵌入**资源 | **关联/链接**资源 |
| 浏览器行为 | 嵌入资源（`<script>` 暂停解析并执行；`<img>`/`<iframe>` 异步加载） | 不暂停解析，建立关联 |
| 典型标签 | `<script src>` `<img src>` `<iframe src>` | `<link href>` `<a href>` |
| 是否替换当前内容 | 是（资源内容嵌入到文档中） | 否（只是指向其他资源） |

### 为什么 script src 会阻塞

```html
<script src="app.js"></script>
```

当浏览器解析到这个标签时：
1. 停止 HTML 解析
2. 下载 `app.js`
3. 执行 `app.js`（JS 执行可能修改 DOM）
4. 恢复 HTML 解析

浏览器必须这样做，因为 JS 可能 `document.write()` 修改后续 HTML——在脚本下载和执行完成前，后面的 HTML 不能被安全解析。

### 为什么 img src 不阻塞

```html
<img src="photo.jpg" />
```

`<img>` 的 src 虽然也是嵌入资源，但它**不阻塞 HTML 解析**——浏览器异步下载图片，继续解析后面的 HTML。图片加载失败不会影响页面结构。

### link href 的行为

```html
<link rel="stylesheet" href="style.css" />
```

CSS 是**渲染阻塞**而非解析阻塞：
- HTML 解析继续（不阻塞）
- 但**渲染被阻塞**，直到 CSS 下载完成——因为浏览器不想显示未样式化的内容（FOUC）

## 深度拓展

### preload / prefetch / preconnect

```html
<!-- preload：提前加载当前页面一定会用的资源 -->
<link rel="preload" href="font.woff2" as="font" crossorigin />

<!-- prefetch：提前加载下一页可能会用的资源 -->
<link rel="prefetch" href="next-page.js" />

<!-- preconnect：提前建立网络连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://api.example.com" />

<!-- dns-prefetch：只做 DNS 解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com" />
```

| 类型 | 时机 | 优先级 | 用途 |
|------|------|--------|------|
| `preload` | 当前页面立即加载 | 高 | 字体、关键CSS、首屏图片 |
| `prefetch` | 空闲时加载 | 低 | 下一页资源 |
| `preconnect` | 立即建立连接 | — | 第三方 API、CDN |
| `dns-prefetch` | 立即 DNS 解析 | — | 轻量连接预判 |

**preload 和 prefetch 不能混用**——同一个资源同时用 preload 和 prefetch 会导致加载两次。

### CSS @import vs link href

```css
/* @import：串行加载，阻塞渲染链 */
@import url('reset.css');
@import url('layout.css');
```

```html
<!-- link：并行加载 -->
<link rel="stylesheet" href="reset.css" />
<link rel="stylesheet" href="layout.css" />
```

`@import` 放在 CSS 文件顶部会导致：下载 style.css → 发现 @import → 再下载 reset.css → 串行。**永远用 `<link>` 而不是 `@import`**。

### script src 的 crossorigin 属性

```html
<script src="https://cdn.example.com/lib.js" crossorigin="anonymous"></script>
```

`crossorigin="anonymous"` 告诉浏览器以 CORS 方式请求脚本（不带 cookie）。为什么需要？因为**没有这个属性，浏览器在错误报告中不会暴露跨域脚本的详细错误信息**——对 Sentry 等错误监控必须加。

## 易错点

### 1. 混淆 preload 和 prefetch

- `preload`：这个页面**现在**就需要，立即加载
- `prefetch`：下个页面**可能**需要，等空闲了再加载

面试中让开发者在代码里 `preload` 导航页的资源是常见错误——preload 会抢占当前页面的带宽。

### 2. link 不要放 body 里

虽然浏览器会解析 `<body>` 中的 `<link>`，但它会导致重绘甚至 FOUC。CSS 应该放在 `<head>` 中。

### 3. script 放 body 底部不是银弹

以前的做法是把 `<script>` 放在 `</body>` 之前，避免阻塞解析。但现代浏览器支持 `defer` 和 `async`，更干净的方案是放在 `<head>` 中用 `defer`——语义更明确，也更早开始下载。

## 面试信号

这道题面试官挖两个坑：

1. "一个页面有两个 CSS 文件，为什么一个加载快一个慢？"——可能用了 `@import` 导致串行加载

2. "Sentry 收不到跨域脚本的错误堆栈怎么办？"——加 `crossorigin="anonymous"`，CDN 配 `Access-Control-Allow-Origin`

能说出 preload/prefetch/preconnect 的区别并给出使用场景，评分到高级。

## 相关阅读

- [defer / async](./script-defer-async.md)
- [浏览器缓存](../浏览器/cache.md)
- [首屏优化](../性能优化/first-screen.md)
