---
title: defer / async
description: Script 标签的三种加载方式：普通、defer、async 的区别和适用场景
category: HTML
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - Script
  - defer
  - async
  - 页面阻塞
  - DOMContentLoaded
---

# defer / async

> 一句话总结：`defer` 保证顺序 + DOM 解析完后执行，`async` 谁先下完谁先执行，普通 script 会阻塞 HTML 解析。

## 核心机制

### 三种加载方式的对比

```html
<!-- 1. 普通 script：阻塞 HTML 解析 -->
<script src="app.js"></script>

<!-- 2. defer：异步下载，DOM 解析完后按顺序执行 -->
<script src="app.js" defer></script>

<!-- 3. async：异步下载，下载完立即执行（不保证顺序） -->
<script src="app.js" async></script>
```

| 特性 | 普通 | defer | async |
|------|------|-------|-------|
| 下载时机 | 立即（阻塞解析） | 立即（不阻塞） | 立即（不阻塞） |
| 执行时机 | 下载后立即执行 | DOMContentLoaded 之前 | 下载完立即执行 |
| 执行顺序 | 文档顺序 | **文档顺序保证** | 谁先下载谁先执行 |
| 对 DOMContentLoaded 的影响 | 阻塞（等待执行完） | 不阻塞下载，执行完才触发 | 可能阻塞也可能不阻塞 |
| 适用场景 | 需要立即生效的脚本 | 依赖 DOM 的库 | 独立第三方脚本 |

### 时间线图解

```
普通 script:
HTML解析 ──▶ ❌暂停──执行脚本──▶ 继续解析 ──▶ DOMContentLoaded

defer:
HTML解析 ────────────────▶ DOM解析完毕 → 执行defer脚本 → DOMContentLoaded
        ╲
         异步下载脚本...

async:
HTML解析 ─────────▶ DOMContentLoaded（可能在async执行前或后）
        ╲
         异步下载 → 下载完立即执行（暂停解析）
```

## 深度拓展

### DOMContentLoaded 的精确时机

`DOMContentLoaded` 在以下条件全部满足时触发：
1. HTML 解析完成
2. 所有 `defer` 脚本已按顺序执行完毕
3. **不等待** `async` 脚本

```javascript
// 验证：defer 一定在 DOMContentLoaded 之前
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded --- defer 脚本已经执行完了');
});
```

### async 的执行乱序问题

```html
<script src="jquery.js" async></script>
<script src="app.js" async></script>
<!-- app.js 依赖 jquery.js ——
     如果 app.js 先下载完，$ 未定义，直接报错！ -->
```

这就是为什么**有依赖关系的脚本不能用 async**。async 只适合无依赖的独立脚本（统计、广告、监控 SDK）。

### type="module" 的行为

```html
<script type="module" src="app.js"></script>
```

`type="module"` 默认行为**等同于 defer**：异步下载、不阻塞解析、DOMContentLoaded 之前按顺序执行。但如果加了 `async`，行为变为 inline async。

### 内联 script 的 defer 和 async

`defer` 和 `async` 对内联脚本 `<script>console.log(1)</script>` **完全无效**——它们只在有 `src` 属性时才生效。

## 项目实战

### 在 Vue3 后台管理系统中的实践

1. **Vite 打包后的 script 默认是 type="module"**，等同于 defer，无需额外配置
2. **第三方 SDK**（如腾讯云 COS SDK、ECharts 5）用 async 加载不阻塞首屏，但需要写加载状态兜底
3. **权限系统初始化脚本**：后管系统在白名单页面需要在 Vue 实例化之前注入用户信息到 `window.__ADMIN_CONFIG__`，这些脚本用 defer 确保 DOM 解析完但 Vue 挂载前执行
4. **监控 SDK**（如 Sentry、Aegis）：用 async 最早加载，放在 head 顶部，不依赖页面其他 JS

```html
<!-- 实际项目中的配置 -->
<head>
  <!-- 监控 SDK：async 最早加载，不阻塞任何东西 -->
  <script src="/monitor.js" async></script>

  <!-- 主应用：Vite 构建产物，type="module" 默认 defer -->
  <script type="module" src="/assets/index-xxx.js"></script>

  <!-- Polyfill：放在 body 底部，用 defer 保证在 app 之前 -->
  <script src="/polyfills.js" defer></script>
</head>
```

## 易错点

### 1. 觉得 defer 就万事大吉

defer 脚本虽然不阻塞 HTML 解析，但多个 defer 脚本是**串行执行**的。一个 defer 脚本执行耗时 500ms，会推迟 DOMContentLoaded 500ms，并且阻塞后续 defer 脚本的执行。如果某个 defer 脚本要执行很久，应该考虑懒加载。

### 2. async 脚本中操作 DOM

async 脚本执行时 DOM 可能还没解析完。如果 async 脚本里 `document.querySelector('#app')` 可能拿到 null。**async 脚本必须做 null check**。

### 3. module 和普通 script 的执行时机混用

```html
<script src="a.js"></script>
<script type="module" src="b.js"></script>
```
b.js 是 defer 行为，**一定在 a.js 之后执行**——因为普通 script 阻塞解析、立即执行，而 module script 等到 DOM 解析完。这个顺序差异可能导致难以排查的 bug。

## 面试信号

这道题面试官问"defer 和 async 有什么区别"，**高分的关键在于说出第三维度——async 执行顺序不可控**。

> "defer 和 async 都是异步下载不阻塞解析。defer 保证脚本在 document 中的顺序执行，在 DOMContentLoaded 之前；async 是谁先下载完谁先执行，执行顺序完全不可控。所以有依赖关系的脚本用 defer，独立的第三方脚本用 async。还有一点——type='module' 的默认行为等同于 defer。"

如果还能提到 DOMContentLoaded 的具体时机，和实际项目中 Aegis/Sentry 用 async、主应用用 module/defer 的选择理由，就直接到高级评价。

## 相关阅读

- [浏览器 渲染流程](../浏览器/render-process.md)
- [首屏优化](../性能优化/first-screen.md)
- [Web Vitals](../性能优化/web-vitals.md)
