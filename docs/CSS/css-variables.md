---
title: CSS 变量
description: CSS 自定义属性（CSS Variables）是原生 CSS 的变量系统，支持运行时动态修改、级联继承和作用域控制，是实现主题切换和暗黑模式的核心技术
category: CSS
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - CSS变量
  - 自定义属性
  - 主题切换
  - 暗黑模式
---

# CSS 变量

> ⭐⭐⭐⭐｜难度：中级｜项目：★★★★★

## 一句话总结

> CSS 变量（Custom Properties）是运行在浏览器里的原生变量系统，声明用 `--name`，调用用 `var(--name, fallback)`，它和 Less/Sass 变量的本质区别在于——CSS 变量是**运行时动态的**，可以被 JS 修改，可以响应媒体查询，可以实现不重新编译的主题切换。

面试时这样开口："CSS 变量的核心价值是动态性。Less/Sass 变量在编译时就写死了，改一个主题色需要重新打包。CSS 变量存在 DOM 上，JS 改一行就能全局换肤，这个特性让它在组件库和后台管理系统的主题定制里是首选方案。"

## 核心机制

### 声明和使用

```css
/* 声明：两条横线开头 */
:root {
  --main-color: #409eff;
  --border-radius: 4px;
  --spacing-unit: 8px;
}

/* 使用：var() 函数 */
.button {
  background: var(--main-color);                    /* 直接使用 */
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 2);           /* 参与 calc 计算 */
}

/* var() 第二个参数是默认值 -- 当变量未定义时生效 */
.label {
  color: var(--text-color, #333);                   /* --text-color 未定义时用 #333 */
}
```

### 作用域

CSS 变量的作用域和普通 CSS 属性一样遵循**级联继承**规则：

```css
:root {
  --text-size: 14px;        /* 全局作用域 */
}

.card {
  --text-size: 16px;        /* 局部覆盖，仅 .card 内部生效 */
  font-size: var(--text-size); /* 16px */
}

.card .title {
  font-size: var(--text-size); /* 16px — 继承了父元素的值 */
}

/* 响应式变量：在媒体查询中重新定义 */
:root {
  --column-count: 4;
}
@media (max-width: 768px) {
  :root {
    --column-count: 1;       /* 移动端变成单列 */
  }
}
```

这意味着你不需要为每个响应式断点写重复的布局代码——只需改变变量值，所有引用该变量的地方自动联动。

### JS 操作：运行时动态修改

这是 CSS 变量甩开预处理器变量的核心能力：

```js
// 读取
const color = getComputedStyle(document.documentElement)
  .getPropertyValue('--main-color');  // "#409eff"

// 写入
document.documentElement.style.setProperty('--main-color', '#f56c6c');

// 删除
document.documentElement.style.removeProperty('--main-color');
```

就这三行代码，配合一套变量体系，就可以实现用户点击按钮即时切换整个系统的主题色。

### 和 Less/Sass 变量的本质区别

| 特性 | CSS 变量 | Less/Sass 变量 |
|------|----------|---------------|
| 处理时机 | 运行时（浏览器解析） | 编译时（构建工具） |
| JS 可修改 | 是 | 否（编译后就没了） |
| 作用域 | DOM 级联继承 | 词法作用域（代码块） |
| 响应媒体查询 | 原生支持 | 不支持（需要编译时生成不同 CSS） |
| 默认值机制 | `var(--x, fallback)` | Sass `$x !default` |
| 预编译 | 需要时可用 PostCSS 做降级 | — |

一句话总结区别：**Less/Sass 变量是写给开发者看的，编译完就没了；CSS 变量是写给浏览器看的，一直活在页面上。**

## 深度拓展

### 主题切换完整方案

这是 CSS 变量最常见的面试场景——描述一个不闪屏、不重新编译、用户可定制的主题切换系统：

```css
/* 定义两套变量 */
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
  --border-color: #e5e5e5;
}

[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --text-primary: #e0e0e0;
  --border-color: #2a2a3e;
}
```

```js
// 切换主题：一行代码
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);  // 持久化
}

// 初始化：页面加载时从 localStorage 恢复，避免 FOUC（闪烁）
(function() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();
// 这段脚本必须同步执行，放在 <head> 里，不能异步，否则页面先渲染默认主题再切换，就是"闪烁"。
```

关键细节：**初始化脚本要在 `<head>` 里同步执行**，在 DOM 渲染之前就把 `data-theme` 设好。如果把这段逻辑放在 Vue/React 的 `useEffect` / `onMounted` 里，用户会看到一个短暂的"闪白/闪黑"——这就是 FOUC（Flash of Unstyled Content）。

### 追问：CSS 变量的性能如何？

大量使用 CSS 变量会影响渲染性能吗？答案是：**有影响但在现代浏览器上可忽略。** 浏览器对 `var()` 的解析做了大量优化，真正需要关注的是两件事：

1. **不要频繁修改会导致大面积回流（reflow）的变量**。改 `--main-color` 只触发重绘（repaint），改 `--layout-width` 会触发回流。高频修改（比如滚动事件里改变量）要节流。
2. **`var()` 的默认值是运行时计算的**，如果你写了 `var(--x, expensive-computation)` 这样的默认值，变量存在时默认值不会被计算，变量不存在时每次用到都会重新计算。不过实际场景里默认值都是简单常量，不会成为瓶颈。

### 追问：为什么是 `--` 开头？

这是 W3C 为了**和现有 CSS 属性语法不冲突**做的设计。标准 CSS 属性没有以 `--` 开头的，所以自定义属性用 `--` 前缀保证语法上不会撞车，解析器也能高效区分。CSS 变量的正式名称是 **CSS Custom Properties**，`--` 前缀使它们和标准属性形成命名空间隔离。

## 项目实战

### 后台管理系统的主题色全局控制

Element Plus 后台的 `styles/variables.css` 典型写法：

```css
:root {
  /* 品牌色 */
  --el-color-primary: #409eff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;

  /* 布局 */
  --sidebar-width: 220px;
  --header-height: 60px;

  /* 字体 */
  --font-size-base: 14px;
  --font-size-large: 16px;
}
```

业务代码中统一使用变量：

```css
.sidebar { width: var(--sidebar-width); }
.page-header { background: var(--el-color-primary); height: var(--header-height); }
```

当 PM 说"把主题色改成红色"，改一行 `--el-color-primary: #f56c6c`，整个系统包括按钮、链接、标签、图表配色全部联动更新——不需要重新编译，也不需要全局搜索替换。

### 组件级别的变量定制

```vue
<template>
  <div class="stat-card" :style="{ '--card-accent': accentColor }">
    <h3>{{ title }}</h3>
    <span class="stat-value">{{ value }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  border-left: 4px solid var(--card-accent, #409eff);
  /* 通过 inline style 传入 --card-accent，不同实例不同颜色 */
}
</style>
```

同一个组件，通过 CSS 变量传入不同 accent 颜色，实现"一套组件，多套表现"——这比用 props 控制 class 拼装优雅得多。

### 暗黑模式适配

```css
/* 利用 @media 自动跟随系统 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a2e;
    --text-primary: #e0e0e0;
  }
}

/* 手动切换覆盖系统设置 */
[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --text-primary: #e0e0e0;
}
```

优先 `@media (prefers-color-scheme: dark)` 跟随系统，`[data-theme]` 优先级更高用来做手动覆盖——用户在页面内切换后存 localStorage，下次访问时用 JS 设 `data-theme`。

## 易错点

- ❌ **`var(--var-name)` 和 `var(--var-name, )` 不一样**：前者变量不存在时属性变 `unset`（等于没写），后者传了空字符串默认值。在 `background: var(--bg, )` 里空默认值和没写回退效果相同，但在 `color: var(--text, )` 里空字符串让颜色失效。
- ❌ **CSS 变量不支持数字类型运算**：`var(--num) + 10px` 不是 `15px`，是无效的。✅ 用 `calc(var(--num) * 1px + 10px)`。
- ❌ **在 `@media` 查询条件里用 `var()`**：`@media (min-width: var(--breakpoint))` 不会生效，媒体查询的条件不支持 CSS 变量。
- ❌ **`var()` 可以嵌套**：`var(--a, var(--b, red))` 是合法的——当 `--a` 未定义时取 `--b`，都没有时取 `red`。但嵌套过深会影响可读性。
- ❌ **忘记 JS 操作的单位**：`el.style.setProperty('--spacing', 20)` 写进去的是字符串 `"20"`，在 `calc(var(--spacing) * 2)` 里无效。✅ 带单位：`el.style.setProperty('--spacing', '20px')`。

## 相关阅读

- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN: var()](https://developer.mozilla.org/en-US/docs/Web/CSS/var)
- [A Complete Guide to Custom Properties](https://css-tricks.com/a-complete-guide-to-custom-properties/)
- [prefers-color-scheme: Hello darkness, my old friend](https://web.dev/prefers-color-scheme/)
- [CSS Modules / Scoped](./css-modules-scoped.md)
- [rem / vw 移动端适配](./rem-vw.md)
- [浏览器渲染流程](../浏览器/render-process.md)

## 更新记录

- 2026-07：Phase 2 填充（面试笔记版）
