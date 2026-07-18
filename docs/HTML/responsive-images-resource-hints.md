---
title: "响应式图片 / Resource Hints"
description: srcset/picture 响应式图片、preload/prefetch/preconnect/dns-prefetch 资源提示
category: HTML
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 响应式图片
  - srcset
  - preload
  - prefetch
---

# 响应式图片 / Resource Hints

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

**`srcset` 让浏览器根据屏幕分辨率选择最佳图片尺寸——省流量。`<picture>` 实现艺术方向切换——不同断点显示不同裁剪的图片。Resource Hints 四种 `<link>` 告诉浏览器"现在/未来需要什么资源"——preload 首屏关键、prefetch 下一页、preconnect 第三方域名、dns-prefetch 轻量解析。**

## 核心机制

### 响应式图片

```html
<!-- srcset：根据宽度选择不同尺寸 -->
<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
     sizes="(max-width: 600px) 100vw, 50vw"
     alt="照片">

<!-- picture：艺术方向——不同断点用不同比例 -->
<picture>
  <source media="(min-width: 800px)" srcset="hero-desktop.jpg">
  <source media="(min-width: 400px)" srcset="hero-tablet.jpg">
  <img src="hero-mobile.jpg" alt="Hero">
</picture>
```

### Resource Hints

```html
<!-- preload：当前页面现在就需要的资源（字体、关键CSS、Hero图） -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/js/hero.js" as="script">

<!-- prefetch：下一个页面可能需要的资源——空闲时下载 -->
<link rel="prefetch" href="/js/dashboard.js">

<!-- preconnect：提前建立到第三方源的完整连接（DNS+TCP+TLS） -->
<link rel="preconnect" href="https://api.example.com">

<!-- dns-prefetch：只做 DNS 解析——比 preconnect 轻量 -->
<link rel="dns-prefetch" href="https://cdn.example.com">
```

**preload 注意事项**：必须加 `as` 属性、字体必须 `crossorigin`、少量关键资源用——preload 太多互相抢占带宽反而更慢。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "不同屏幕怎么加载不同图片" | 追问 srcset vs picture |
| "preload 和 prefetch 区别" | 追问 preload 当前页高优先级、prefetch 未来页低优先级 |

## 相关阅读

- [图片优化](../性能优化/image-optimization.md)
- [首屏优化](../性能优化/first-screen.md)

## 更新记录

- 2026-07-16：新建——响应式图片+四种资源提示
