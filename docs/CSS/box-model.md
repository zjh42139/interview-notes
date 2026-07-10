---
title: 盒模型
description: CSS 盒模型是布局的基石，理解 content-box 和 border-box 的区别及其对元素尺寸计算的影响
category: CSS
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 盒模型
  - content-box
  - border-box
---

# 盒模型

> 盒模型决定元素的尺寸计算方式：`content-box` 的 width 只包含内容区，`border-box` 的 width 包含到边框为止。面试时这一句话就能让面试官知道你是真的用过，不是背书的。

## 一句话总结

> 盒模型就是浏览器把每个元素看成一个矩形盒子，由 content、padding、border、margin 四层组成，`box-sizing` 决定 `width`/`height` 在哪一层"卡住"。

## 核心机制

面试常问的就是两种盒模型的区别。我直接用一个例子说清楚：

```css
/* content-box（浏览器默认） */
.box {
  width: 200px;
  padding: 20px;
  border: 10px solid #333;
  /* 实际占用宽度 = 200 + 20*2 + 10*2 = 260px */
}

/* border-box */
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 10px solid #333;
  /* 实际占用宽度 = 200px（内容区被压缩到 200-20*2-10*2 = 140px） */
}
```

关键理解点有三个：

**第一，width 的计算范围不同。** `content-box` 下 width = 内容区宽度，padding 和 border 是"外加"的，所以最终元素会比你设的 width 更宽。`border-box` 下 width = content + padding + border 的总和，内容区会被自动压缩。这就是为什么很多人写了 `width: 100%` 结果溢出——因为默认 content-box 下 padding 把盒子撑大了。

**第二，margin 永远在 width 之外。** 不管哪种盒模型，margin 都不计入 width。面试官问你盒模型几层，回答四层就行——从外到内：margin > border > padding > content。

**第三，box-sizing 可以继承，但一般不用。** 我们团队的做法是在 reset 里全局设置：

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

为什么推荐全局 `border-box`？很简单：你设 `width: 200px`，它就真的是 200px，不用心算 padding + border。特别是在做栅格系统、百分比布局的时候，`content-box` 会让列宽计算变成灾难——50% + 50% 不等于 100%，因为 padding 会把两列撑开。

## 深度拓展

### 追问：替换元素的盒模型有什么特殊行为？

`input`、`textarea`、`img` 这些替换元素，浏览器对它们的盒模型有"原生尺寸"的概念。比如 `<input type="text">` 浏览器会给它一个默认的宽高，这个默认尺寸在不同浏览器、不同操作系统上不一样。更坑的是：

```css
/* input 默认就是 border-box（大多数浏览器） */
input {
  width: 200px;
  padding: 10px;
  /* 实际内容区宽度 = 200 - 10*2 - 默认border宽度 */
}
```

但 `textarea` 和 `select` 在 Firefox 里默认用 `content-box`，所以你用 CSS reset 统一成 `border-box` 特别重要。我在 Element Plus 管理后台遇到过一个问题：自定义的表单控件在 Chrome 和 Firefox 下高度不一致，排查到最后就是 `textarea` 的盒模型默认值不同。

### 追问：margin 塌陷（margin collapse）是怎么回事？

只发生在**块级元素**的**垂直方向**。父元素和第一个/最后一个子元素的 margin-top/bottom 会"合并"，取较大值而不是相加。三种常见场景：

1. **父子塌陷**：父元素没有 border/padding/overflow 隔离时，子元素的 margin-top 会"穿透"到父元素外面
2. **兄弟塌陷**：上下两个兄弟元素，上面的 margin-bottom 和下面的 margin-top 会合并
3. **空元素塌陷**：一个没有内容、没有高度的块元素，它的 margin-top 和 margin-bottom 会自己合并

解决方案：
- 父元素加 `overflow: hidden`（触发 BFC）
- 父元素加 `border-top` 或 `padding-top`（哪怕 1px）
- 用 `padding` 代替 `margin`（在父子间距场景）
- Flex/Grid 容器的子元素不会发生 margin 塌陷

### 追问：逻辑属性是什么？和盒模型有什么关系？

逻辑属性用 `inline`/`block` 代替 `left`/`right`/`top`/`bottom`，是面向国际化（RTL 语言如阿拉伯语）的设计。比如：

```css
.card {
  /* 物理属性 */
  margin-left: 20px;
  padding-right: 16px;

  /* 逻辑属性（推荐） */
  margin-inline-start: 20px;
  padding-inline-end: 16px;
}
```

在 LTR 语言下 `inline-start` = `left`，RTL 下自动变成 `right`，不需要额外写方向适配。我们后台管理系统虽然主要是中文用户，但用了 Element Plus 的布局组件后，内部其实就是逻辑属性驱动，为以后国际化留了后路。面试能提到逻辑属性，说明你对 CSS 标准的演进有跟进。

## 项目实战

### Element Plus 表单输入框宽度计算

后台管理系统的表单页面，Input 组件默认 `width: 100%` 时，在有 padding 的 `el-form-item` 里不会溢出——因为 Element Plus 全局用了 `border-box`。但如果你自己给 `el-input__inner` 加 padding 扩大点击区域，就要注意计算：

```css
/* 安全的做法：border-box 下随便加 padding */
.el-input__inner {
  box-sizing: border-box;
  width: 100%;
  padding: 0 30px; /* 内容区自动压缩，不会溢出 */
}
```

反过来，如果你在一个 `content-box` 继承的第三方组件里设 `width: 100%` + `padding: 20px`，结果一定是横向滚动条。定位这种问题时，DevTools 的 Computed 面板能看到元素最终盒模型，一眼就能确认。

### 表格列宽设计

我们项目的表格组件，固定列宽用绝对 px（如操作列 120px），自适应列用百分比。在 `border-box` 下，`width: 25%` 的四列一定等宽且不溢出。如果哪天脑子一抽把某列设了 `content-box`，那四列的总和就会超过 100%，出现诡异的滚动条——这种 bug 排查起来很费时间，所以全局 `border-box` 是一劳永逸的做法。

## 易错点

- ❌ **以为 `width: 100%` 就是父容器的 100%**：content-box 下 padding/border 会额外撑开，导致溢出。✅ 要么用 `border-box`，要么 `width: auto` 让浏览器自动计算。
- ❌ **用 margin 做父子间距遇到塌陷**：子元素设 `margin-top: 50px` 想和父元素顶部留间距，结果父元素跟着往下移。✅ 给父元素设 `padding-top`，或触发 BFC。
- ❌ **inline 元素的宽高不生效**：对 `span` 设 `width: 200px` 没反应，然后怀疑盒模型有问题。✅ inline 元素不接受 width/height，换成 `inline-block` 或 `block`。
- ❌ **忘记 `box-sizing` 不影响 margin**：设了 `border-box` 就以为 `width` 包含了 margin，做间距计算时出错。✅ margin 永远在盒模型最外层，不影响 width。

## 相关阅读

- [MDN: The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)
- [MDN: box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)
- [MDN: Mastering margin collapsing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)
- [CSS Logical Properties and Values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)
- [BFC 和 margin 塌陷的关系](./bfc.md)
- [响应式布局中的盒模型选择](./responsive.md)

## 更新记录

- 2026-07：Phase 2 填充（面试笔记版）
