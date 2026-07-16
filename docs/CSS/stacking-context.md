---
title: 层叠上下文
description: 层叠上下文控制元素在 z 轴上的显示顺序，理解其形成条件和层叠规则有助于解决 z-index 失效等常见问题
category: CSS
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 层叠上下文
  - z-index
  - 渲染
---

# 层叠上下文

> 面试官问"z-index 为什么不生效"，90% 的答案都是——它的父级创建了一个层叠上下文，把 z-index 的作用范围锁死了。理解了层叠上下文，z-index 就不再是玄学。

## 一句话总结

> 层叠上下文是 HTML 元素在 z 轴上的"作用域"，z-index 只在同一个层叠上下文内比较，不同上下文之间的元素按上下文层叠顺序排列。

## 核心机制

### 什么会创建层叠上下文？

注意，不仅仅是 `position` + `z-index`。以下条件都会触发，而且很多是"隐形"的：

```css
/* 经典方式：定位 + z-index（z-index 不为 auto） */
.modal {
  position: fixed;
  z-index: 1000;
}

/* 容易被忽略的方式——这些都会创建！*/
.ghost {
  opacity: 0.5;        /* opacity < 1 */
}
.slide {
  transform: scale(0.9); /* transform 不是 none */
}
.blur {
  filter: blur(5px);    /* filter 不是 none */
}
.optimize {
  will-change: transform; /* will-change */
}
.grid-child {
  /* 父元素是 flex/grid 容器 + 子元素 z-index 不为 auto */
  /* 父元素是 grid/flex，子元素 z-index 不为 auto 时 */
}
```

最坑的是 `opacity < 1` 和 `transform`——这两个在动画里太常见了，很多人写了 `z-index: 9999` 发现没用，因为外层有个 `opacity: 0.99` 的容器把层叠上下文隔离了。

### 层叠顺序（7 阶层）

面试如果能背出这 7 层，直接加分。从下到上：

1. 根元素的 background 和 border（最底层）
2. **负 z-index** 的定位元素（position 不为 static）
3. 普通块级元素（按 DOM 顺序）
4. 浮动元素（float）
5. 普通行内元素
6. `z-index: auto` 或 `z-index: 0` 的定位元素（按 DOM 顺序，后出现的在上）
7. **正 z-index** 的定位元素（最上层）

记住关键结论：**z-index 只影响定位元素**（position 不为 static），给一个 `position: static` 的元素设 z-index 完全无效。还有，z-index 只在**同一层叠上下文内**比较——两个不同上下文里的元素，各自内部的 z-index 互不影响。

### 层叠上下文的"嵌套隔离"

这是最容易理解但最容易被忽略的一点。一旦 A 创建了层叠上下文，A 内部所有元素的 z-index 只在 A 内部有效。就算你把 A 内部的子元素 z-index 设成一个亿，A 本身（以及 A 的兄弟）看不到这个值。

打个比方：层叠上下文像一个房间，z-index 是房间里的座位号。你可以是 1 号房间里的 1 排 1 座，但 2 号房间的人跟你比不了座位号——人家只看房间号。

## 深度拓展

### 追问：为什么 opacity < 1 会创建层叠上下文？

这跟浏览器的**合成层（compositing layer）**机制有关。当 `opacity < 1` 时，浏览器需要把这个元素及其子元素渲染到一个独立的合成层上，然后再和页面其他部分做 alpha 混合。这个独立的合成层天然就是一个层叠上下文。

同理，`transform`、`filter`、`will-change` 这些属性都会触发 GPU 加速和合成层 promotion，所以附带创建了层叠上下文。这本身是浏览器的性能优化——把动画元素提升到独立合成层，不用每次都重绘整个页面。但副作用就是 z-index 被"锁住"了。

面试时能提到"合成层 promotion"，说明你对浏览器渲染原理也有了解，这是一个很强的加分点。

### 追问：will-change 的层叠影响和最佳实践

`will-change: transform` 提前告诉浏览器"这个元素会动"，浏览器提前把它提升到合成层。好处是动画启动时不用等待层创建，流畅度更好。但有两个坑：

1. 层叠上下文被创建，可能影响 z-index
2. 合成层占 GPU 显存，**不要给所有元素加 `will-change`**

正确用法是**在动画开始前加上，结束就移除**：

```js
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform'
})
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto'
})
```

### 追问：Dialog 在 body 末尾，怎么保证它在最顶层？

Element Plus 的 `el-dialog`、`el-drawer` 这些组件渲染时默认 append 到 `body` 末尾。理论上 DOM 越后层级越高，但如果有祖先元素创建了层叠上下文，还是可能被遮挡。解决方案：

```css
/* Element Plus 的做法：PopupManager 统一管理 z-index */
.el-dialog {
  /* z-index 由 JS 动态递增管理，从 2000 开始，每次弹窗 +1 */
}
```

我们项目自己做全局弹窗/通知组件时，也用了一个 `zIndex` 单例管理器，每弹一次自增，保证最新的在最上面。这比写死 `z-index: 99999` 可靠得多——万一第三方库弹了个 100000 的呢？

## 项目实战

### Dialog 嵌套时 z-index 管理

后台管理系统中，一个 Dialog 里可能再弹一个 Dialog（比如列表里点"新增"弹子表单）。如果两个 Dialog 的 z-index 一样，新弹的会被旧的遮住。Element Plus 用 `PopupManager` 全局管理：

```js
// Element Plus 内部的简化逻辑
let zIndex = 2000
export function nextZIndex() {
  return zIndex++
}
```

每次打开弹窗/下拉/Popper 都拿一个新的 z-index，关闭时回收（虽然一般不回收）。我们项目也遵循这个模式，全局维护一个基准 z-index，所有浮层组件从它开始递增。

### Dropdown 在表格内部被截断

这是经典 bug：表格列里有个 `el-dropdown`，展开时下拉菜单被表格的 `overflow: hidden`（或 `overflow: auto`）切掉了。原因很简单——下拉菜单在定位祖先的剪裁范围内。

解决方案有两种：

```css
/* 方案1：让下拉菜单脱离当前 DOM 位置，挂到 body 上 */
/* Element Plus 的 Dropdown 支持 teleported prop */
<el-dropdown teleported>
```

```css
/* 方案2：去掉祖先的 overflow: hidden */
/* 但这可能导致表格内容溢出，不推荐 */
```

我们在项目里统一用 `teleported`（Vue3 Teleport 机制），把浮层渲染到 body 下，一劳永逸。但注意 teleported 后下拉菜单脱离了组件的 scoped style，样式可能需要写到全局或 `:deep()` 里。

### Tooltip 层级问题

同一页面里 Table 的 Tooltip、Button 的 Tooltip、图表 Tooltip，如果各自设 z-index，很容易互相遮挡。解决方案依然是 PopupManager 统一管理，所有浮层——Dialog、Drawer、Popover、Tooltip、Dropdown、Select dropdown——走同一个自增 z-index。面试时说出"统一 z-index 管理器"这个设计，比你背 7 阶层叠顺序更让面试官信服。

### 面试信号

当你听到面试官问 **"z-index 设了很大为什么不生效"**，他要的答案就一句话：**找父级是否创建了层叠上下文**。

排查步骤：
1. 在 DevTools Elements 面板，从目标元素往上逐一检查父元素
2. 看有没有 `position: fixed/absolute/sticky` + `z-index`、`opacity < 1`、`transform`、`filter`、`will-change`
3. 找到创建层叠上下文的祖先，那就是 z-index 的作用边界
4. 方案：调整 DOM 结构让目标元素脱离那个上下文，或者提升那个上下文本身的 z-index

## 易错点

- ❌ **给 static 元素设 z-index**：无效。✅ z-index 只对 `position` 不为 `static` 的元素生效。
- ❌ **`z-index: 9999` 还是被遮挡**：检查祖先是否有层叠上下文把作用范围锁死了。✅ 排查父级的 opacity/transform/filter，找到创建上下文的节点。
- ❌ **用负 z-index 把元素藏到背景后面**：负 z-index 的元素会被放在层叠顺序的第 2 层（背景之上、块元素之下），可能导致不可点击。✅ 用 `visibility: hidden` 或 `opacity: 0`，或者用 `pointer-events: none`。
- ❌ **在不同组件里写死 z-index 值（一个写 10，一个写 100，一个写 1000）**：维护噩梦，容易冲突。✅ 统一用 z-index 管理器，或者至少定义 CSS 变量/Sass 变量统一管理层级。

## 相关阅读

- [MDN: The stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
- [MDN: z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index)
- [What No One Told You About Z-Index (Philip Walton)](https://philipwalton.com/articles/what-no-one-told-you-about-z-index/)
- [CSS Triggers — 哪些属性触发合成层](https://csstriggers.com/)
- [BFC 块级格式化上下文](./bfc.md)
- [浏览器渲染流程与合成层](../浏览器/render-process.md)

## 更新记录

- 2026-07：Phase 2 填充（面试笔记版）
