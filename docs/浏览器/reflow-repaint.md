---
title: 重绘 / 回流
description: 回流（reflow）和重绘（repaint）是浏览器渲染性能的核心概念，理解触发条件并利用 will-change、transform 等手段优化可显著提升页面性能
category: 浏览器
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - 重绘
  - 回流
  - 性能优化
  - will-change
---

# 重绘 / 回流

> 面试官问"为什么我的页面卡"，90% 的答案都藏在回流和重绘里。这一篇把原理和实战都聊透。

## 一句话总结

**回流（Reflow）是浏览器重新计算元素几何属性（位置、尺寸）的过程，重绘（Repaint）是重新绘制像素的过程；回流一定触发重绘，重绘不一定触发回流。两者都是主线程操作，频繁触发会导致页面掉帧。**

---

## 核心机制

### 什么是回流（Reflow）

当元素的**几何属性**发生变化（宽高、位置、内外边距、边框宽度、字体大小等），浏览器需要重新计算该元素及受影响元素的布局。回流的代价很高——一个元素回流可能导致整个页面或一大片子树重新布局。

**触发回流的常见操作**（记住"一切改变布局的操作都是回流触发器"）：

- 修改尺寸：`width`、`height`、`padding`、`margin`、`border`
- 修改位置：`top`、`left`、`right`、`bottom`、`position`
- 修改文字：`font-size`、`font-weight`、`font-family`、`text-align`、`line-height`
- 修改布局：`display`、`float`、`overflow`、`flex`相关属性
- 改变窗口：`resize` 事件
- **读取布局信息**：`offsetTop`、`offsetLeft`、`scrollTop`、`getComputedStyle()`、`getBoundingClientRect()`

最后一条特别重要——**读取布局属性本身不触发回流，但如果在修改样式后立即读取，会触发"强制同步布局"**。

### 什么是重绘（Repaint）

当元素的**视觉外观**变化但不影响布局时，只触发重绘：

- `color`、`background`、`background-color`
- `visibility`（注意：`display` 触发回流，`visibility` 只触发重绘）
- `outline`、`box-shadow`（部分情况）
- `border-radius`、`border-color`

重绘的代价低于回流，但也不是免费的。大面积重绘（尤其是包含 `box-shadow`、`filter` 等昂贵属性）仍然可能导致明显卡顿。

### 浏览器优化策略

浏览器很聪明，不会你改一行 style 就立刻回流一次。它会：

1. **批处理**：将一系列回流/重绘操作放入队列，在下一次渲染帧中**批量执行**
2. **跳过无效操作**：如果你把 `width` 从 100px 改成 200px 又改回 100px，浏览器会识别出来并跳过
3. **`requestAnimationFrame`**：将视觉更新集中在帧开始前执行，避免丢帧

### Layout Thrashing（布局抖动）

当你**在循环中交替读写布局属性**时，浏览器被迫在每次读取前清空回流队列——这就是"强制同步布局"（Forced Synchronous Layout），俗称 Layout Thrashing：

```javascript
// ❌ 典型的 Layout Thrashing —— 千万别这样写
for (let i = 0; i < items.length; i++) {
  items[i].style.width = i + 'px';           // 写（入队）
  const height = items[i].offsetHeight;      // 读（强制清空队列！）
}
// 正确做法：先批量读，再批量写
const heights = items.map(item => item.offsetHeight);  // 批量读
items.forEach((item, i) => item.style.width = heights[i] + 'px'); // 批量写
```

**核心法则**：读写分离。把所有读操作放在一起，所有写操作放在一起，中间不要穿插。

---

## 深度拓展

### 追问1：will-change 怎么用才合理

`will-change` 的作用是**提前告诉浏览器"这个元素即将发生变化"**，浏览器会提前创建独立图层、预分配 GPU 资源。

**正确用法**：在变化发生前设置，变化结束后移除。

```css
/* 在 hover 前提前设置 */
.element { will-change: transform; }
/* 或者用 JS 在动画前动态设置、动画后移除 */
el.addEventListener('mouseenter', () => { el.style.willChange = 'transform'; });
el.addEventListener('animationend', () => { el.style.willChange = 'auto'; });
```

**滥用后果**：每个独立图层都有 GPU 内存开销。如果你给 500 个列表项都加 `will-change: transform`，显存直接爆炸。**只在即将发生变化的元素上、在变化前后使用，用完即删**。

### 追问2：contain 属性限制回流范围

CSS `contain` 属性告诉浏览器"这个元素的子树是独立的，元素内部的变化不影响外部布局"。这样内部回流只限于该元素子树，不会波及整个页面。

```css
.sidebar {
  contain: layout;    /* 内部布局变化不传播到外部 */
}
.list-container {
  contain: strict;    /* layout + paint + size + style 全部隔离 */
}
```

在虚拟列表、侧边栏、弹窗等独立组件上加 `contain`，可以有效限制回流影响范围——**这是 CSS 级别的性能优化，零 JS 开销**。

### 追问3：CSS Triggers —— 哪些属性触发什么阶段

你可以访问 [csstriggers.com](https://csstriggers.com/) 查询每个属性的触发阶段。记住几个关键结论：

| 属性类型 | 举例 | 触发阶段 | 代价 |
|---------|------|---------|------|
| **Layout 属性** | `width`、`height`、`margin`、`padding`、`top`、`left` | Layout → Paint → Composite | 最高 |
| **Paint 属性** | `color`、`background`、`box-shadow` | Paint → Composite | 中等 |
| **Composite-only 属性** | `transform`、`opacity` | Composite only | **最低** |

**面试金句**：如果你想做 60fps 的流畅动画，只应使用 `transform` 和 `opacity`，它们走合成器线程，完全不碰主线程的 Layout 和 Paint。

---

## 项目实战

### 1. 表格批量更新：用 DocumentFragment 减少回流

后台系统中表格数据刷新很频繁。如果逐行 append 新行，每行都触发一次回流。用 `DocumentFragment` 批量插入：

```javascript
// ❌ 逐行插入 —— N 次回流
data.forEach(row => {
  tbody.appendChild(createRow(row));  // 每次都回流
});

// ✅ 用 Fragment 批量插入 —— 1 次回流
const fragment = document.createDocumentFragment();
data.forEach(row => fragment.appendChild(createRow(row)));
tbody.appendChild(fragment);  // 一次性回流
```

在 Vue 中，Vue 3 的虚拟 DOM diff 算法和异步更新队列已经帮我们做了类似的批量优化——但理解原理有助于在原生 JS 场景中写出高性能代码。

### 2. 动画只用 transform + opacity

侧边栏展开/收起动画：

```css
/* ❌ 用 width 做动画 —— 每帧都回流 */
.sidebar { transition: width 0.3s; }

/* ✅ 用 transform —— 只合成，不回流 */
.sidebar { transition: transform 0.3s; }
.sidebar.collapsed { transform: translateX(-240px); }
```

### 3. 循环中避免强制同步布局

写一个表格自动行高计算的场景：

```javascript
// ❌ 强制同步布局
for (const row of rows) {
  row.style.fontSize = '14px';          // 写
  const h = row.getBoundingClientRect().height; // 读 —— 强制回流！
  row.style.lineHeight = h + 'px';      // 写
}

// ✅ 读写分离
const rects = rows.map(row => {
  row.style.fontSize = '14px';          // 先统一写
  return row.getBoundingClientRect();   // 再统一读
});
rows.forEach((row, i) => {
  row.style.lineHeight = rects[i].height + 'px'; // 最后统一写
});
```

### 4. 虚拟列表中的 DOM 回收

当数据量上万条时，不可能全部渲染到 DOM。我们实现的虚拟列表（`<VirtualList>`）只渲染可视区域中的 20 条 DOM 节点，滚动时回收离开视口的节点并复用。这样无论数据多少，DOM 节点数恒定，回流范围可控。

---

## 易错点

- **"重绘一定触发回流"**：说反了。**回流一定触发重绘**，重绘不一定触发回流。改颜色只重绘，改宽度先回流再重绘。
- **"`requestAnimationFrame` 中的操作不会触发回流"**：误解。`rAF` 中的回流操作**仍然会触发回流**，只是浏览器的批处理机制会把本次 rAF 和下一帧之间的操作合并执行。`rAF` 只是把操作排入下一帧，不是让回流消失。
- **"`visibility: hidden` 的变化触发回流"**：不会。`visibility` 不影响布局，只触发重绘。`display: none` 才触发回流。
- **"`transform` 动画不占任何性能"**：`transform` 确实不触发回流重绘，但仍有合成开销（GPU 内存、合成时间）。给 500 个元素同时做 `transform` 动画仍然可能掉帧。

---

## 相关阅读

- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [Google: Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- [CSS Triggers](https://csstriggers.com/)
- [render-process](./render-process) —— 浏览器渲染管线的完整流程
- [性能优化/web-vitals](../性能优化/web-vitals) —— CLS、INP 等核心 Web 指标与回流的关系

---

## 更新记录

- 2026-07-05：完成完整内容，补充 Layout Thrashing 详解、CSS Triggers 分类、项目实战案例（Phase 2）
