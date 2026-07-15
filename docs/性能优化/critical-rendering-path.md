---
title: 关键渲染路径
description: 浏览器关键渲染路径（Critical Rendering Path）——HTML→CSSOM→Render Tree 的阻塞关系、CSS/JS 加载对首屏的影响
category: 性能优化
type: mechanism
score: 80
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 关键渲染路径
  - 首屏
  - 阻塞渲染
---

# 关键渲染路径（Critical Rendering Path）

> ⭐⭐⭐⭐｜难度：中级｜首屏优化的理论基础

## 一句话总结

**关键渲染路径 = 浏览器从收到 HTML 到首次像素上屏的步骤链——HTML 解析构建 DOM、CSS 解析构建 CSSOM、两者合并为 Render Tree、布局+绘制+合成。CSS 阻塞渲染但不阻塞 DOM 解析、JS 阻塞 DOM 解析——理解这条链才知道怎么优化首屏。**

## 核心机制

### 六个步骤

```
① 收到 HTML → ② 解析 HTML 构建 DOM
   → ③ 遇到 CSS → 解析 CSS 构建 CSSOM（阻塞渲染！）
   → ④ 遇到 JS → 下载+执行（阻塞 DOM 解析！）
   → ⑤ DOM + CSSOM → Render Tree
   → ⑥ Layout → Paint → Composite → 上屏
```

### CSS 的阻塞行为

- **CSS 不阻塞 DOM 解析**：HTML 继续解析，DOM 继续构建
- **CSS 阻塞渲染**：Render Tree 需要 CSSOM——CSSOM 不完整则无法渲染
- **CSS 阻塞后续 JS**：JS 可能查询样式（`getComputedStyle`）——CSSOM 必须完整

**优化关键**：把首屏需要的关键 CSS 内联到 `&lt;head>` 中——浏览器不需要等待外部 CSS 文件就能渲染首屏。非关键 CSS 用 `media="print"` 延迟加载。

### JS 的阻塞行为

```html
<!-- 普通 script：下载+执行期间阻塞 DOM 解析 -->
<script src="app.js"></script>

<!-- defer：异步下载，DOM 解析完后、DOMContentLoaded 前按顺序执行 -->
<script src="app.js" defer></script>

<!-- async：异步下载，下载完立即执行——不保证顺序 -->
<script src="analytics.js" async></script>
```

| | 下载 | 执行 | DOM 解析 | 执行顺序 |
|---|:---:|------|------|------|
| 普通 | 阻塞 | 阻塞 | 阻塞 | 按文档顺序 |
| defer | 并行 | DOM 解析后 | 不阻塞 | 按文档顺序 |
| async | 并行 | 下载完即执行 | 可能阻塞 | 不保证 |

**选型**：关键 JS 用 defer——不阻塞解析但保证顺序。独立工具（统计/埋点）用 async——不阻塞、不需要顺序。普通 script 放在 `&lt;body>` 底部——减少对首屏 DOM 构建的阻塞。

## 深度拓展

### Critical CSS 提取

```html
<head>
  <!-- 关键 CSS 内联——首屏立即渲染 -->
  <style>/* 折叠线以上的所有样式 */</style>
  <!-- 非关键 CSS 延迟加载 -->
  <link rel="preload" href="full.css" as="style" onload="this.rel='stylesheet'">
</head>
```

工具：`critical`（提取折叠线以上的 CSS）、`purgecss`（删除未使用的 CSS）。

### 渲染阻塞资源检测

Chrome DevTools → Performance → 录制 → 看"加载"阶段：`Parse HTML` 被什么阻塞了——外部 CSS、同步 JS。Lighthouse 直接列出"Render-blocking resources"。

## 易错点

❌ **CSS 阻塞 DOM 解析** —— 不阻塞。CSS 和 HTML 并行解析。CSS 阻塞的是渲染和后续 JS 执行——DOM 照样建。

❌ **所有 JS 都用 async** —— async 的不确定执行顺序可能导致依赖问题。`app.js` 依赖 `vendor.js` 时用 defer 保证顺序。

❌ **defer 的 JS 在 DOMContentLoaded 之前执行** —— 面试经常搞混：defer 是 DOM 解析后、DCL 之前；async 执行时可能在任何阶段。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "CSS 会阻塞什么" | 追问阻塞渲染但不阻塞 DOM 解析 |
| "defer 和 async 有什么区别" | 追问执行时机——defer 在 DCL 前、async 不确定 |
| "首屏为什么慢" | 追问关键渲染路径的阻塞资源 |

## 相关阅读

- [首屏优化](./first-screen.md)
- [浏览器渲染流程](../浏览器/render-process.md)

## 更新记录

- 2026-07-16：新建——六步骤+CSS/JS阻塞行为+defer/async+Critical CSS
