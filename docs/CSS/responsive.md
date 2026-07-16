---
title: 响应式
description: 响应式设计通过媒体查询、弹性布局、容器查询等技术使页面适配不同屏幕尺寸，是移动端优先的核心实践
category: CSS
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 响应式
  - media-query
  - 移动端
---

# 响应式

> 响应式不是"做一套移动端的样式"，而是让同一套代码在不同屏幕上都好用。媒体查询是基础，但真正让页面"流动"起来的是弹性布局和相对单位。

## 一句话总结

> 响应式设计让页面自适应不同屏幕尺寸，核心手段是媒体查询 + 弹性布局 + 相对单位，现代方案还要加上容器查询和 CSS 数学函数。

## 核心机制

面试官问响应式，我一般按三层来回答：断点策略、弹性单位、容器查询。

### 第一层：媒体查询断点策略

两种思路——移动优先和桌面优先，区别在 `min-width` 还是 `max-width`：

```css
/* 移动优先（推荐）：从小往大写 */
/* 基础样式就是移动端，min-width 往大了覆盖 */
.card {
  grid-template-columns: 1fr;           /* 手机：单列 */
}
@media (min-width: 768px) {
  .card { grid-template-columns: 1fr 1fr; } /* 平板：双列 */
}
@media (min-width: 1200px) {
  .card { grid-template-columns: repeat(4, 1fr); } /* 桌面：四列 */
}

/* 桌面优先：从大往小写，用 max-width */
/* 适合以桌面端为主的内部管理系统 */
```

我们 Element Plus 后台管理系统用的是**桌面优先 + 移动兜底**的混合策略。因为后台系统用户 90% 在 PC 端，基础样式按 1440px 设计，1280px 以下开始折叠侧边栏，768px 以下做移动适配。断点值参考了 Element Plus 自身的响应式断点：xs(<768), sm, md, lg, xl(>1920)。

### 第二层：相对单位和数学函数

这是让页面真正"流动"起来的核心：

```css
/* rem：相对根元素的 font-size */
html { font-size: 16px; }
.box { width: 10rem; } /* = 160px，改变根字号所有 rem 联动缩放 */

/* vw/vh：相对视口 */
.hero { height: 100vh; }          /* 全屏高度 */
.sidebar { width: clamp(200px, 20vw, 300px); } /* 200~300px 之间，按 20vw 弹性 */

/* clamp()/min()/max()：无需媒体查询的响应式 */
h1 { font-size: clamp(1.5rem, 4vw, 3rem); } /* 字号随视口缩放但有上下限 */
.container { width: min(100% - 2rem, 1200px); } /* 取较小值，天然防止溢出 */
```

`clamp()` 是我在项目里最常用的，比如卡片间距：`gap: clamp(12px, 2vw, 24px)`，大屏间距宽敞、小屏紧凑，一行 CSS 搞定，不需要写 media query。面试官听到这个一般会点头——说明你不只会背 `@media`，还跟进了现代 CSS。

### 第三层：容器查询（Container Query）

这是媒体查询的"进化版"。媒体查询看的是**视口**大小，容器查询看的是**父容器**大小：

```css
.card-wrapper {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;  /* 容器够宽时切换为横向布局 */
  }
}
```

为什么重要？同一个 card 组件，放在侧边栏（窄容器）和放在主内容区（宽容器），用媒体查询区分不了，必须用容器查询。这就是"组件级响应式"。我们后台项目的 Dashboard 页面已经在部分卡片组件上试用了容器查询，配合 CSS nesting 写起来非常干净。

## 深度拓展

### 追问：Retina 屏下 1px 边框变粗怎么解决？

设计稿上 1px 的线，在 2x/3x 屏幕上显示出来像 2px/3px——因为 1 个 CSS px 对应了多个物理像素。三种方案：

```css
/* 方案1：伪元素 + transform: scaleY(0.5) — 最通用，兼容性最好 */
.hairline::after {
  content: ''; position: absolute; left: 0; bottom: 0;
  width: 100%; height: 1px; background: #e5e5e5;
  transform: scaleY(0.5); transform-origin: 0 0;
}
/* 方案2：0.5px 直接写（iOS 8+ 支持） */
.hairline { border-bottom: 0.5px solid #e5e5e5; }
/* 方案3：box-shadow 模拟 */
.hairline { box-shadow: 0 0.5px 0 0 #e5e5e5; }
```

我们项目 Element Plus 的表格分割线在 iOS 上看起来偏粗，最终用方案1解决。

### 追问：viewport 配置和移动端 300ms 点击延迟

`<meta name="viewport" content="width=device-width, initial-scale=1.0">` 三件事：页面宽度=设备宽度（不写 iOS 默认 980px 会缩成团）、1:1 初始缩放。300ms 延迟是浏览器等双击缩放的历史问题，加上 `width=device-width` 现代浏览器就自动禁用了，或加 `touch-action: manipulation` 明确告知不需要双击。FastClick 已淘汰。

### 追问：响应式图片怎么做？

```html
<!-- srcset + sizes：浏览器根据屏幕密度和宽度自动选图 -->
<img src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 50vw" alt="产品图" />
<!-- picture 元素用于艺术方向切换（不同裁切比例） -->
```

## 项目实战

### 后台管理系统侧边栏折叠 + 内容区自适应

这是最经典的场景。侧边栏展开时 220px，折叠时 64px，内容区自动填充剩余空间：

```css
.app-layout {
  display: flex;
}
.sidebar {
  width: 220px;
  transition: width 0.3s;
}
.sidebar.collapsed {
  width: 64px;
}
.main-content {
  flex: 1;
  min-width: 0; /* 防止内容溢出，很关键！ */
}
```

不用 `calc(100% - 220px)`，用 flex 布局更简洁。侧边栏用 Vue3 响应式变量控制 `collapsed` class，配合 `el-menu` 的 `collapse` prop，整个交互非常顺滑。

### 表格在移动端的横向滚动

后台管理系统的数据表格在小屏幕上不能缩小列宽（数据会折行难看），正确做法是包裹一层 `overflow-x: auto`：

```css
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
}
```

Element Plus 的 `el-table` 自带这个能力，但我们项目有些自定义表格需要自己处理。要点是给每一列设 `min-width` 而不是 `width`，这样在小屏幕上不会强制等比缩小。

### Dashboard 卡片响应式列数

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
```

一行 CSS，列数自动适配：容器宽 > 280*N 时就是 N 列，不够就自动折行。比写一堆 `@media` 优雅太多。面试时亮出 `auto-fill` + `minmax` 的组合，比只会写固定断点的人高一个层次。

## 易错点

- ❌ **`width: 100vw` 没考虑滚动条宽度**：Windows 滚动条占 17px，`100vw` 包含滚动条宽度，导致横向溢出。✅ 用 `width: 100%` 或 `100dvw`（动态视口单位），或者 `overflow-x: hidden` 兜底。
- ❌ **只用 px 做所有尺寸**：在不同屏幕上体验割裂。✅ 布局用百分比/flex/grid，字号用 rem/clamp，间距用相对单位，只在边框等场景用 px。
- ❌ **媒体查询断点照抄 Bootstrap（576/768/992/1200）而不看实际内容**：断点应该由"内容在哪里开始不好看"决定，不是死记框架值。✅ 拉窄浏览器窗口，找到内容折行/挤压的点，那就是你的断点。
- ❌ **移动端没设 viewport meta**：PC 上做好的页面在手机上缩小到看不清。✅ `<meta name="viewport" content="width=device-width, initial-scale=1.0">` 必须写在 `<head>` 里。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "响应式布局怎么实现" | 追问媒体查询 + Flexbox + Grid 的组合方案 |
| "移动优先和桌面优先有什么区别" | 追问 min-width（移动优先）vs max-width（桌面优先）的写法差异 |
| "container query 是什么" | 追问基于容器尺寸而非视口尺寸的响应式——组件级的自适应 |

## 相关阅读

- [MDN: Responsive design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [MDN: Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries)
- [MDN: CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [MDN: clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [CSS 居中布局的各种方案](./center-layout.md)
- [Flexbox 弹性布局](./flexbox.md)

## 更新记录

- 2026-07：Phase 2 填充（面试笔记版）
