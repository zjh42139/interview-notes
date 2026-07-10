---
title: HTML 面试题库
description: HTML 高频面试真题，含难度分级和参考答案索引
category: 面试题库
type: interview
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-09
updated: 2026-07-09
reviewed: null
tags:
  - HTML
  - 面试题
  - 真题
---

---
# HTML 面试题库

> 20 道高频 HTML 面试题，按频率排序。每道题标注难度和参考答案索引。

## HTML5 语义化（6 题）

### 1. HTML5 新增了哪些语义化标签？和 div 有什么区别？

**频率**：&#11088;&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- 列出 `<header>` `<nav>` `<main>` `<article>` `<section>` `<aside>` `<footer>` 等标签
- 说清 `<article>` vs `<section>` vs `<div>` 的区别（独立性、是否有标题、是否有语义）
- 强调三个价值层面：SEO 权重、可访问性（读屏器快捷跳转）、代码可读性
- 提 `<dialog>` 原生弹窗（`showModal` + `::backdrop` + `form method="dialog"`）

**参考**：[HTML5 语义化](../HTML/html5-semantic.md)

---

### 2. DOCTYPE 是干什么的？不写会怎样？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- DOCTYPE 不是 HTML 标签，是声明，触发标准模式渲染
- 不写或写错 → 怪异模式（Quirks Mode），盒模型变为 IE5 行为（`width` 含 `padding` + `border`）
- HTML4 的 DOCTYPE 依赖 DTD（SGML），HTML5 简化为 `<!DOCTYPE html>`
- `<!DOCTYPE html>` 必须是文档第一行（前面不能有空行、BOM）

**参考**：[DOCTYPE / Meta](../HTML/doctype-meta.md)

---

### 3. meta viewport 是干什么的？怎么写？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- `width=device-width` 让布局视口 = 设备宽度（理想视口）
- 没有 viewport meta 时，手机浏览器默认 980px 布局宽度 → 缩小塞进屏幕 → 字特别小
- 三个视口：布局视口、视觉视口、理想视口
- `user-scalable=no` 违反 WCAG 无障碍标准，不推荐
- `maximum-scale=1.0` 禁缩放会降低可访问性

**参考**：[DOCTYPE / Meta](../HTML/doctype-meta.md)

---

### 4. HTML5 新增了哪些表单特性？

**频率**：&#11088;&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- 新增 input 类型（email/url/number/range/date/time/color/search/tel）
- 新增属性（required/pattern/placeholder/autocomplete/novalidate/inputmode）
- 约束验证 API（checkValidity/reportValidity/setCustomValidity/ValidityState）
- CSS 校验伪类（`:valid`/`:invalid`/`:required`/`:optional`/`:in-range`/`:out-of-range`/`:user-invalid`）
- `<datalist>` 自动补全、`<output>`/`<progress>`/`<meter>`

**参考**：[HTML5 表单](../HTML/form-validation.md)

---

### 5. em 和 i、strong 和 b 有什么区别？

**频率**：&#11088;&#11088;&#11088;

**答题要点**：
- `<em>` = 语义强调（读屏器改变语调），`<i>` = 纯视觉斜体
- `<strong>` = 语义重要/紧急，`<b>` = 纯视觉加粗
- 面试亮点：SEO 会给 `<em>` `<strong>` 更高权重

**参考**：[HTML5 语义化](../HTML/html5-semantic.md)

---


## 加载与性能（4 题）

### 7. script 标签的 defer 和 async 有什么区别？

**频率**：&#11088;&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- defer：异步下载、DOMContentLoaded 前按顺序执行、保证执行顺序
- async：异步下载、下载完立即执行、不保证顺序
- 普通：阻塞 HTML 解析、立即下载并执行
- `type="module"` 默认行为等同于 defer
- 实际选择：Sentry/Aegis 用 async、主应用用 defer/module

**参考**：[defer / async](../HTML/script-defer-async.md)

---


### 9. 图片懒加载怎么实现？有哪些方式？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- `loading="lazy"`（Chrome 77+，零代码）
- IntersectionObserver（~20 行，`rootMargin: '200px'` 提前加载）
- scroll + getBoundingClientRect（不推荐，性能差）
- 首屏图用 `fetchpriority="high"`，不应懒加载
- 响应式图片 `srcset` + `sizes` 配合懒加载
- 提 LQIP（低质量占位图方案）加分

**参考**：[图片懒加载](../HTML/lazy-loading.md)

---

### 10. preload / prefetch / preconnect / dns-prefetch 是什么？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- `preload`：当前页面一定需要，立即高优先级加载
- `prefetch`：下个页面可能需要，空闲时低优先级加载
- `preconnect`：提前建立连接（DNS + TCP + TLS）
- `dns-prefetch`：只做 DNS 解析（轻量）
- 同一资源同时用 preload 和 prefetch 会导致**加载两次**

**参考**：[src / href](../HTML/src-href.md)

---

## 元素与事件（5 题）

### 11. 块级元素和行内元素有什么区别？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- 块级：独占一行、可设宽高、默认宽度 100%
- 行内：不换行、宽高由内容决定、width/height 无效
- 行内块：不换行 + 可设宽高
- 替换元素（img/input/video）：行内但可设宽高，有 intrinsic size
- inline-block 间隙问题（HTML 源码换行 → 空格字符 → baseline 对齐）

**参考**：[块级 / 行内元素](../HTML/block-inline.md)

---

### 12. Canvas 和 SVG 有什么区别？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- 本质：Canvas 位图 vs SVG 矢量图
- 事件：Canvas 无 DOM（需数学判断点击位置）vs SVG 每个图形可绑定事件
- 性能：Canvas 大量对象更优 vs SVG DOM 节点多在 1000+ 时卡
- 缩放：Canvas 模糊（Retina 需 ×dpr）vs SVG 始终清晰
- 选型：上千个对象用 Canvas，几十个可交互对象用 SVG

**参考**：[Canvas vs SVG](../HTML/canvas-svg.md)

---

### 13. iframe 有什么优缺点？如何使用 postMessage 通信？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- 优点：天然隔离（独立 window/document/JS 环境）、稳定可靠
- 缺点：阻塞父页面 onload、通信成本高、SEO 差
- postMessage 三要素：发送方指定 targetOrigin、接收方校验 origin、校验数据结构
- sandbox 安全沙箱：按需开放权限
- 提微前端的 iframe 方案（wujie）加分

**参考**：[iframe](../HTML/iframe.md)

---



## 路由与架构（3 题）

### 16. History API 的 pushState 和 replaceState 有什么区别？hash 和 history 模式有什么区别？

**频率**：&#11088;&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- `pushState` 新增历史记录，`replaceState` 替换当前记录
- `popstate` 在前进/后退时触发，`pushState`/`replaceState` 本身不触发
- Hash URL `#` 后内容不发送到服务端，刷新不 404
- History 模式 URL 干净 SEO 好，但刷新需 Nginx `try_files` 配置 fallback
- 提 `history.state` 持久化 + `scrollRestoration` 加分

**参考**：[History API](../HTML/history-api.md)

---

### 17. Web Worker 是什么？有哪些类型？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- 后台线程运行 JS，不阻塞主线程 UI
- 不能操作 DOM、不能访问 window/localStorage
- 三种 Worker：Dedicated（单页面）、Shared（同源多页面共享）、Service Worker（PWA 离线）
- Transferable 零拷贝传输大数据
- 实用场景：Excel 导出、大 JSON 解析、图片压缩

**参考**：[Web Worker](../HTML/web-worker.md)

---

### 18. Web Components 是什么？和 Vue/React 组件有什么区别？

**频率**：&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- 三大标准：Custom Elements、Shadow DOM、HTML Template
- Shadow DOM 实现样式隔离，CSS 变量可穿透
- vs 框架组件：原生零依赖、天然跨框架、但无响应式系统
- 适用场景：跨框架共享的基础 UI 组件、设计系统
- 微前端中的角色：wujie/micro-app 底层依赖

**参考**：[Web Components](../HTML/web-components.md)

---

### 19. CSR / SSR / SSG / ISR 分别是什么？怎么选？

**频率**：&#11088;&#11088;&#11088;&#11088;&#11088;

**答题要点**：
- CSR：空壳 HTML + JS 渲染 → SEO 差、首屏慢，适合后台管理
- SSR：服务端生成完整 HTML → SEO 好、服务器压力大，适合电商
- SSG：构建时预渲染 → 性能极致、成本低，适合博客/文档站
- Hydration：SSR HTML → 客户端绑定事件、激活响应式
- 选型：toB 后台用 CSR，toC 内容站用 SSG，电商用 SSR

**参考**：[SEO / SSR](../HTML/seo-ssr.md)

---


| 模块 | 题目数 | 覆盖文件 |
|------|--------|----------|
| HTML5 语义化 | 6 | html5-semantic, doctype-meta, form-validation |
| 加载与性能 | 4 | script-defer-async, src-href, lazy-loading |
| 元素与事件 | 5 | block-inline, canvas-svg, iframe, a-tag |
| 路由与架构 | 3 | history-api, web-worker, web-components, seo-ssr |
| HTML 编码 | 2 | html-entities |

**频率分布**：&#11088;&#11088;&#11088;&#11088;&#11088; ×7｜&#11088;&#11088;&#11088;&#11088; ×8｜&#11088;&#11088;&#11088; ×4｜&#11088;&#11088; ×1
