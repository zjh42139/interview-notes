---
title: rem / vw 移动端适配
description: rem 和 vw 是移动端适配的两种主流方案，rem 相对根元素字号实现等比缩放，vw 直接相对视口宽度，配合 postcss 插件可实现设计稿到代码的自动转换
category: CSS
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
reviewed: null
tags:
  - rem
  - vw
  - 移动端适配
  - 响应式
---

# rem / vw 移动端适配

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

> `rem` 是相对根元素 `<html>` 的 `font-size` 的单位，通过 JS 动态设置根字号实现页面等比缩放；`vw` 直接相对视口宽度（`1vw = 视口宽度的 1%`），纯 CSS 无需 JS 介入。两者的本质区别在于**基准源不同**——rem 的基准是可控的（根字号），vw 的基准是不可控的（视口）。

面试时这样开口："移动端适配的核心问题是——设计师给了一张 375px 的设计稿，页面要在 320px ~ 428px 的各种屏幕上等比还原。rem 方案用 JS 把屏幕宽度映射到根字号，所有尺寸用 rem 表达，达到等比缩放。vw 方案更直接，用 `postcss-px-to-viewport` 编译时把 px 转成 vw，彻底抛弃 JS。目前 vw 方案是新项目的首选。"

## 核心机制

### rem 原理

`rem`（root em）永远相对于 `<html>` 元素的 `font-size`：

```css
html {
  font-size: 16px;   /* 1rem = 16px */
}
.box {
  width: 10rem;       /* 160px */
  font-size: 1.5rem;  /* 24px */
}
```

经典适配思路（flexible.js 模式）：**屏幕宽度变 → 根字号跟着变 → 所有 rem 尺寸联动缩放。**

```js
// flexible.js 核心逻辑
(function flexible() {
  function setRem() {
    // 设计稿 375px，分成 10 份，1rem = 37.5px
    const rootFontSize = document.documentElement.clientWidth / 10;
    document.documentElement.style.fontSize = rootFontSize + 'px';
  }
  setRem();
  window.addEventListener('resize', setRem);
  // 加上 orientationchange 兼容横屏切换
  window.addEventListener('orientationchange', setRem);
})();
```

设计稿上一个 `width: 75px` 的元素 → 75 / 37.5 = 2rem。在任何屏幕上，这个元素永远占屏幕宽度的 2/10 = 20%。

### vw 原理

`vw`（viewport width）直接相对于视口宽度，和 `<html>` 的 `font-size` 没有任何关系：

```css
/* 1vw = 视口宽度的 1% */
.box {
  width: 50vw;    /* 永远占视口宽度的一半 = 375px 屏幕上 = 187.5px */
  height: 30vw;
  font-size: 4vw; /* 字号也跟着视口缩放 */
}

/* vh：视口高度 */
.hero { height: 100vh; }

/* vmin / vmax：取视口宽高中的较小/较大值 */
.square { width: 50vmin; height: 50vmin; } /* 永远正方形 */
```

工程化实践：**`postcss-px-to-viewport` 在编译时自动转换。**

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375,  // 设计稿宽度
      unitPrecision: 5,    // vw 值保留的小数位数
      minPixelValue: 1,    // 小于 1px 的不转换（边框保留 px）
    }
  }
};
```

你写 `width: 100px`，编译后自动变成 `width: 26.66667vw`。开发者用 px 按设计稿写，构建工具处理适配——零心智负担。

### rem vs vw 完整对比

| 对比维度 | rem | vw |
|---------|-----|-----|
| **基准** | `<html>` 的 `font-size`（可控） | 视口宽度（不可直接控制） |
| **JS 依赖** | 需要 JS 初始化根字号 | 纯 CSS，零 JS |
| **缩放控制** | 可通过限制根字号做最大/最小宽度 | 通常配合 `@media` 做极限控制 |
| **兼容性** | IE9+，基本全兼容 | IE 部分支持（vw/vh 有 bug），移动端全兼容 |
| **第三方组件** | 组件内的 px 不会自动转换，需要额外处理 | postcss 统一转换，包括 node_modules |
| **1px 边框** | 可以用 px 保留 | postcss 需配置 `minPixelValue` 排除 |
| **横屏适配** | 根字号基于宽度，横屏下元素会更大 | 同样基于宽度，表现一致 |
| **编辑器体验** | 需要心算 px→rem，或依赖编辑器插件 | 写 px，无感知 |

## 深度拓展

### flexible.js 为什么是 `clientWidth / 10`？

除以 10 是一个工程经验值，让 `1rem` 在 iPhone 6/7/8（375px）上等于 37.5px，数值不大不小，便于开发者口算。你除以 100 也行，1rem = 3.75px，数值太小难用；除以 1 也行，1rem = 375px，数值太大。10 是一个平衡点。实际上阿里早期的 flexible.js 用的是除以 10，后来 flexible.js 2.0 改成了推荐 vw 方案，flexible 自己都"退休"了。

### dpr + viewport + @media 组合方案

`dpr`（Device Pixel Ratio，设备像素比）是另一个维度的问题。rem/vw 解决的是**布局缩放**，dpr 解决的是**清晰度**：

```html
<!-- 根据 dpr 动态设置 viewport 的 initial-scale -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

在 2x 屏幕（iPhone）上一个 CSS px = 2 个物理像素，1px 边框画出来就是 2 个物理像素宽。解决方案见下文 1px 边框问题。

### 1px 边框问题在 Retina 屏上的解决方案

这是移动端面试必问的高频题。根源：**设计师说的 1px 是 1 个物理像素，但 CSS 里的 `1px` 在 2x 屏幕上对应 2 个物理像素，在 3x 屏幕上对应 3 个物理像素。** 所以 CSS 写的 `border: 1px solid #e5e5e5` 在 iPhone 上看起来"太粗了"。

三种解决方案，按推荐程度排序：

```css
/* 方案1：伪元素 + transform: scale() — 最通用，兼容性最好 */
.hairline {
  position: relative;
}
.hairline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);        /* 2x 屏缩到 0.5 */
  transform-origin: 0 0;
}

/* 3x 屏需要缩到 0.333 */
@media (-webkit-min-device-pixel-ratio: 3) {
  .hairline::after {
    transform: scaleY(0.333);
  }
}

/* 方案2：0.5px 直接写（iOS 8+ 支持；Android 表现不一致，见下文） */
.hairline {
  border-bottom: 0.5px solid #e5e5e5;
}

/* 方案3：viewport 的 initial-scale 根据 dpr 动态调整
   配合 flexible.js 的老方案，现代项目不推荐 */
```

方案1是最稳的，能精确控制缩放比例，兼容所有屏幕。方案2最简洁但 Android 上表现不一致（部分机型渲染为 1px、部分不显示，因厂商而异），不可依赖。Element Plus 的移动端 H5 项目用的就是方案1。

### 追问：vw 方案的极限情况怎么处理？

在超大屏幕（iPad Pro 横屏，视口 1366px）上，用 vw 的字号会变得巨大，体验很差。解决方案是给一个最大宽度兜底：

```css
.container {
  width: 100%;
  max-width: 750px;  /* 按设计稿最大宽度兜底 */
  margin: 0 auto;    /* 居中 */
}

/* 或者用 clamp() 限制字号 */
h1 {
  font-size: clamp(16px, 5vw, 32px);
}
```

配合 `postcss-px-to-viewport` 的 `maxViewportWidth` 配置，超出设定宽度后就不再等比放大。

## 项目实战

### 移动端 H5 活动页的完整适配配置

我们一个 H5 活动页项目的配置：

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore-vw'],  // 特定类名不转换
      minPixelValue: 1,                    // 1px 边框保留
      mediaQuery: true,                    // 媒体查询里的 px 也转换
      exclude: [/node_modules\/some-legacy-lib/], // 排除不需要转换的第三方库
    },
  },
};
```

开发者只按 375px 设计稿写 px，提交代码后 CI 自动编译成 vw。

```css
/* 源码 */
.banner { width: 345px; height: 200px; margin: 15px; }
.title { font-size: 18px; }
.divider { border-bottom: 1px solid #eee; }  /* minPixelValue: 1 保留不转 */

/* 编译后 */
.banner { width: 92vw; height: 53.33333vw; margin: 4vw; }
.title { font-size: 4.8vw; }
.divider { border-bottom: 1px solid #eee; }
```

### 后台管理系统 rem 适配的遗留场景

部分老项目还在用 rem + flexible.js，这里给一个兜底处理：

```js
// 限制根字号范围，避免极端情况
function setRem() {
  const maxWidth = 750; // 按设计稿最大宽度
  const clientWidth = Math.min(document.documentElement.clientWidth, maxWidth);
  document.documentElement.style.fontSize = clientWidth / 10 + 'px';
}
```

限制 `maxWidth` 之后，PC 端打开 H5 页面不会因为 rem 无限放大而丑陋。

## 易错点

- ❌ **混淆 rem 和 em**：`rem` 相对于根元素 `<html>`，`em` 相对于**当前元素的** `font-size`。`em` 有嵌套叠加问题（父元素 1.5em × 子元素 1.2em = 越算越大），移动端适配只用 `rem`。
- ❌ **rem 方案忘了设置 `<html>` 的 `font-size`**：默认浏览器根字号是 16px，没调的话所有 rem 按 1:16 计算，设计稿尺寸完全对不上。
- ❌ **vw 方案在微信小程序里不完全兼容**：部分小程序 WebView 对 `vw` 支持有 bug，需要用 `postcss-px-to-rpx` 转换，或做降级处理。
- ❌ **`100vw` 包含滚动条宽度**：Windows 滚动条宽 17px，`width: 100vw` 会触发横向滚动条。✅ 用 `width: 100%`。注意 `100dvw` 等动态视口单位**同样包含滚动条宽度**——它解决的是移动端地址栏伸缩问题，解决不了滚动条溢出。
- ❌ **border 1px 被 `postcss-px-to-viewport` 转成 vw**：在某些低端安卓上，`0.5px` 变成 `0.13333vw`，计算误差导致边框消失。✅ 配置 `minPixelValue: 1` 或 `selectorBlackList` 保留 border 的 px。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "rem 和 em 有什么区别" | 追问 rem 相对根元素、em 相对父元素——嵌套时 em 会累积 |
| "移动端适配怎么做" | 追问 rem + flexible.js vs vw 方案的优劣 |
| "vw 和 % 有什么区别" | 追问 vw 相对视口、% 相对包含块——一个有滚动条影响一个没有 |

## 相关阅读

- [MDN: rem](https://developer.mozilla.org/en-US/docs/Web/CSS/length#rem)
- [MDN: vw / vh](https://developer.mozilla.org/en-US/docs/Web/CSS/length#vw)
- [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport)
- [使用 flexible 实现手淘 H5 页面的终端适配](https://github.com/amfe/article/issues/17)
- [响应式设计](./responsive.md)
- [CSS 变量与主题切换](./css-variables.md)
- [1px 边框问题的 DOM 操作视角](../浏览器/reflow-repaint.md)

## 更新记录

- 2026-07-18：一致性审计——0.5px 在 Android 的表现统一为「表现不一致，不可依赖」口径（与 mobile-1px.md 对齐）
- 2026-07-18：事实审计——修正"100dvw 可解决滚动条溢出"的错误说法（dvw 同样包含滚动条宽度）
- 2026-07：Phase 2 填充（面试笔记版）
