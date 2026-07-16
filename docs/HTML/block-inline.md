---
title: 块级 / 行内元素
description: HTML 元素的分类：块级、行内、行内块和替换元素，以及它们的关键差异
category: HTML
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - HTML
  - 块级元素
  - 行内元素
  - 替换元素
  - CSS
---

# 块级 / 行内元素

> 一句话总结：块级元素独占一行、可设宽高；行内元素不换行、宽高由内容决定；行内块兼具两者特性；替换元素的内容由外部资源决定。

## 核心机制

### 三种核心分类

| 特性 | 块级 (block) | 行内 (inline) | 行内块 (inline-block) |
|------|-------------|--------------|---------------------|
| 是否独占一行 | 是 | 否 | 否 |
| 可设 width/height | 是 | **否** | 是 |
| 可设 margin/padding | 四周 | **只有水平方向** | 四周 |
| 默认宽度 | 父容器 100% | 内容宽度 | 内容宽度 |
| 常见元素 | `div, p, h1, ul, li, section` | `span, a, strong, em, label` | `button, input, select, img` |

### 为什么行内元素不能设置宽高

行内元素的布局模型是"沿着文本基线流式排列"，宽高由**内容的大小**决定，CSS 的 `width`/`height` 不参与行内格式化上下文。这就是为什么 `<span style="width: 200px">` 不生效。

### 替换元素

**替换元素**是一类特殊的行内元素：它的内容由**外部资源**决定，CSS 可以控制宽高。

```html
<img src="photo.jpg" />   → 内容由图片文件决定
<input type="text" />      → 内容由用户输入决定
<video src="movie.mp4" />  → 内容由视频文件决定
<iframe src="..." />       → 内容由嵌入的页面决定
<canvas />                 → 内容由 JS 绘制决定
```

替换元素的特殊行为：
- **可以设置宽高**（虽然默认 `display: inline`）
- 有自己的内在尺寸（intrinsic size）：`<img>` 有原始像素尺寸
- `object-fit` 和 `object-position` 属性**只对替换元素有效**

## 深度拓展

### display 属性如何改变元素行为

| display 值 | 是否换行 | 可设宽高 | margin 方向 |
|------------|----------|----------|-------------|
| `block` | 是 | 是 | 四周 |
| `inline` | 否 | 否 | 水平 |
| `inline-block` | 否 | 是 | 四周 |
| `none` | 脱离文档流 | — | — |
| `table` / `flex` / `grid` | 是 | 是（容器） | 四周 |

### inline-block 的空白间隙问题

```html
<!-- 两个 inline-block 之间有 4px 左右的间隙 -->
<div>
  <span style="display:inline-block;width:100px">A</span>
  <span style="display:inline-block;width:100px">B</span>
</div>
```

**原因**：HTML 中标签之间的换行和空格被解析为一个空格字符，inline-block 元素的基线对齐产生了可见间隙。

**4 种解决方案**：

```css
/* 方案1：父元素 font-size: 0（需要子元素恢复） */
.parent { font-size: 0; }
.child { font-size: 16px; }

/* 方案2：Flexbox（推荐） */
.parent { display: flex; }

/* 方案3：HTML 标签紧挨 */
/* <span>A</span><span>B</span> */

/* 方案4：注释消除空格 */
/* <span>A</span><!--
 --><span>B</span> */
```

### 行内元素的 vertical-align 问题

行内元素的默认对齐是 **baseline（基线对齐）**。不同字号的文字混排、文字与图片混排时，对齐位置很"玄学"：

```css
/* 图片底部有 3-4px 空隙的原因 */
img {
  vertical-align: middle; /* 或 top/bottom，修复底部空隙 */
  display: block;         /* 或直接设为块级 */
}
```

## 易错点

### 1. inline 元素的 padding-top/bottom 和 border-top/bottom

虽然 `padding-top`、`padding-bottom`、`border-top`、`border-bottom` 在行内元素上会**渲染**（背景色可见），但**不占据实际空间**——它们会覆盖上下行而不撑开父元素高度。

### 2. a 标签不能嵌套 a 标签

`<a>` 在 HTML5 中属于 phrasing content（行内级），但具有 transparent 内容模型——根据父元素决定自己能包含什么内容，因此在特定条件下可以包裹块级元素。但 `<a>` 嵌套 `<a>` 仍被 HTML 规范明确禁止，会被浏览器强制拆开。

### 3. p 标签不能嵌套 div

`<p>` 是"段落"元素，内部只能包含 phrasing content（行内元素）。如果 `<p>` 里放了 `<div>`，浏览器会自动在 `<div>` 前闭合 `<p>`，导致 DOM 结构与预期不符。

### 4. button 的默认 type

`<button>` 在大多数浏览器中默认 `type="submit"`——如果不显式指定 `type="button"`，放在表单里点击会触发表单提交。

## 面试信号

这道题如果只回答"块级独占一行、行内不独占一行"连初级都算不上。面试官想听到的是：

> "块级和行内的本质区别不在于是否换行，而在于布局模型的差异。行内元素的宽高由内容决定，CSS 的 width/height 失效。有一个特殊类别是**替换元素**——img、input、video——它们虽然是 inline 但可以设宽高，因为有由外部资源决定的 intrinsic size。还有一个坑是 inline-block 之间会因为 HTML 源码中的换行产生空隙，本质是 baseline 对齐留下的空格字符。"

如果还能提到 inline 元素的 padding-top 虽然显示但不占空间，以及 p 不能嵌套 div 的规范限制，评分会明显提高。

## 相关阅读

- [盒模型](../CSS/box-model.md)
- [BFC](../CSS/bfc.md)
- [居中方案](../CSS/center-layout.md)
- [HTML5 语义化](./html5-semantic.md)
