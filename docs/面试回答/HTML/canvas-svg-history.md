---
title: Canvas vs SVG / History API 面试回答
description: 面试中如何回答 Canvas vs SVG 对比、History API pushState/replaceState
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - HTML
  - Canvas
  - SVG
  - History API
  - 面试回答
---

# Canvas vs SVG / History API 面试回答

> 覆盖 Q10 Canvas/SVG + Q12 History API——图形技术和路由历史两道综合题。

## Q1: Canvas 和 SVG 有什么区别？

### 30 秒版本

"Canvas 位图无 DOM 节点——大量对象性能好但不支持事件。SVG 矢量图每个图形是 DOM 可绑定事件——缩放清晰但 1000+ 节点会卡。选型：上千对象用 Canvas，几十个可交互对象用 SVG。Canvas 需处理 Retina（×dpr），SVG 天生清晰。"

### 2 分钟版本

"本质区别：Canvas 是画布——JS 在像素层面绘制，没有 DOM 树。SVG 是文档——每个图形是一个 DOM 元素，浏览器管理渲染。

事件差异直接决定了使用场景：Canvas 无 DOM——点击事件需数学判断（点在矩形/圆形/路径内）或依赖上层库（ECharts/Fabric.js/Konva.js）。SVG 每个图形独立 DOM——直接 addEventListener 绑定 click/hover，像操作 DOM 一样操作图形。

性能差异：Canvas 大量对象更优——只在画布上存像素，不创建 DOM 节点，内存恒定。SVG DOM 节点增多性能指数恶化——1000+ 节点交互卡顿。缩放差异：Canvas 模糊——Retina 屏需 `canvas.width = el.clientWidth * devicePixelRatio` 再 scale。SVG 矢量——任意缩放始终清晰。

选型口诀：数据可视化（几千个点）→ Canvas + ECharts；小型可交互图形（几十个图标）→ SVG；游戏/动画 → Canvas。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Canvas 为什么模糊" | 没有处理 devicePixelRatio——需 ×dpr 放大 canvas 像素再 CSS 缩小。SVG 矢量化不依赖 dpr |
| "SVG 能做动画吗" | 可以——SMIL 动画或 CSS animation。Canvas 动画需要 JS 逐帧绘制 requestAnimationFrame |
| "大量对象用 Canvas 还是 SVG" | Canvas——不创建 DOM 节点。SVG 节点多到 1000+ 会卡 |

## Q2: History API 的 pushState 和 replaceState 有什么区别？

### 30 秒版本

"pushState 新增历史记录——不触发 popstate，可前进后退。replaceState 替换当前记录——不可回退。popstate 只在前进/后退时触发——pushState 和 replaceState 本身不触发。hash 和 history 模式底层都是这两个 API。"

### 2 分钟版本

"vue-router 的两大模式底层都是 History API。

pushState(state, title, url)：新增一条历史记录——浏览器后退按钮回到上一个 url。三参数：state 可通过 history.state 读取（刷新页面后仍保留）、title 基本被忽略、url 同源限制。

replaceState：替换当前历史记录——不能回到被替换的 url。场景：修正 URL 参数但不产生新记录。

popstate 事件：前进/后退时触发——pushState/replaceState 本身不触发 popstate。这是很多人混淆的点：点击 router-link 不会触发 popstate，浏览器前进后退才会。

hash 模式：`#` 后内容不发送到服务端——刷新不 404。底层依赖 hashchange 事件。history 模式：URL 干净 SEO 好——但刷新需要 Nginx `try_files $uri $uri/ /index.html` 兜底。history.state 持久化刷新页面数据不丢。

加分项：scrollRestoration 手动控制返回时的滚动行为。vue-router scrollBehavior 就是基于 history.scrollRestoration 的封装。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "pushState 和 replaceState 的区别" | pushState 新增记录可回退；replaceState 替换记录不可回退。popstate 在手点前进后退时才触发 |
| "hash 和 history 模式怎么选" | hash 兼容不需服务器配置后天管好用；history URL 美观 SEO 好需 Nginx 兜底 |
| "history.state 刷新后还保留吗" | 保留——正常刷新不受影响。硬刷新(Ctrl+Shift+R)行为因浏览器而异 |

## 别踩的坑

1. **pushState 后手动改地址栏** —— pushState 不会触发 popstate。router.push 内部处理了这个差异
2. **history 模式部署忘了 Nginx 配置** —— 刷新 404 是最常见的 SPA 部署问题。解决方案就一行 try_files
3. **Canvas 不处理 Retina** —— `canvas.width = el.clientWidth` 在 Retina 屏像素密度不够——模糊。必须 ×dpr

## 相关阅读

- [Canvas vs SVG](../../HTML/canvas-svg.md)
- [History API](../../HTML/history-api.md)
- [Vue Router history vs hash](../../VueRouter/history-vs-hash.md)

## 更新记录

- 2026-07-16：新建——Q10 + Q12 图形技术与路由历史
