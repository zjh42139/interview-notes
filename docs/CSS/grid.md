---
title: Grid
description: CSS Grid（网格布局）是二维布局系统，可以同时控制行和列，适合复杂页面布局，与 Flexbox 互补使用
category: CSS
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - grid
  - 布局
  - 网格
---

# Grid

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

> Grid 是 CSS 原生的**二维网格布局系统**，可以同时控制行和列的尺寸、对齐和间距，适合整体页面布局和需要行列严格对齐的复杂场景。Flex 处理"一条线"，Grid 处理"一个面"。

面试开场："Grid 和 Flex 是互补关系，不是替代关系。后台管理系统的整体页面结构、Dashboard 卡片区、数据报表这些需要行列对齐的场景用 Grid；导航栏、工具栏这些一维排列用 Flex。实际项目中两者经常嵌套使用。"

## 核心机制

### 网格容器和网格项目

```css
.container {
  display: grid;                   /* 或 inline-grid */
  grid-template-columns: 200px 1fr 1fr; /* 3 列：固定 + 弹性 + 弹性 */
  grid-template-rows: auto 1fr auto;    /* 3 行：内容高 + 弹性 + 内容高 */
  gap: 16px;                       /* 行列统一间距 */
  /* 也可以分开：column-gap + row-gap */
}
```

### `fr` 单位

Grid 的灵魂单位。`fr` = fraction（份额），代表**剩余空间中的一份**。

```css
/* 三列等比 */
grid-template-columns: 1fr 1fr 1fr;

/* 中间列占两倍 */
grid-template-columns: 1fr 2fr 1fr;
/* 总共有 4 份，每列分配：1/4, 2/4, 1/4 */

/* 和固定值混合 */
grid-template-columns: 200px 1fr;
/* 第一列 200px，第二列 = 剩余全部 */

/* fr 和 auto 的区别 */
grid-template-columns: 1fr auto;
/* 1fr 占满剩余空间，auto 只占内容宽度且不伸缩 */
```

### `grid-template-areas` 命名区域

最直观的布局方式，直接画 ASCII 图：

```css
/* 经典后台布局：header / sidebar / main */
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 56px 1fr;
  grid-template-areas:
    "header  header"
    "sidebar main";
  height: 100vh;
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; overflow: auto; }
```

区域命名后，响应式改变布局只需要改 `grid-template-areas`，不用动 DOM 顺序。这对后台系统的移动端适配非常有用。

### `auto-fit` vs `auto-fill`

这是高频面试题，也是实际项目中最容易搞混的：

```css
/* auto-fill：有空轨道就填进去（即使没有内容） */
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

/* auto-fit：拉伸已有项目，填满整行 */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
```

**区别**：当一行放不下更多列时（比如容器 800px，每列最小 300px，只能放 2 列），`auto-fill` 会保留第 3 个空轨道（宽度为 0），而 `auto-fit` 会把已有内容拉伸填满整行。

实际项目中 **Dashboard 卡片区用 `auto-fit`**（卡片较少时拉伸美观），**商品列表用 `auto-fill`**（保持卡片等宽）。

## 深度拓展

### 追问：Grid vs Flexbox 怎么选？

| 维度 | Flexbox | Grid |
|---|---|---|
| 布局方向 | 一维（行或列，不是同时） | 二维（行和列同时） |
| DOM 顺序 | 内容顺序 = 视觉顺序 | 可以视觉重排，不影响 DOM |
| 使用场景 | 导航栏、工具栏、表单项、标签列表 | 整体页面结构、Dashboard、复杂表单 |
| 对齐能力 | 单行/单列内对齐 | 整个网格内对齐，行列交叉对齐 |
| 学习曲线 | 平缓 | 稍陡（概念更多） |

**决策口诀**："一行一列用 Flex，多行多列用 Grid；数量动态用 Flex，严格对齐用 Grid。"

### 追问：Subgrid

`subgrid` 是 Grid Level 2 的特性，让子网格继承父网格的轨道定义：

```css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.child {
  display: grid;
  grid-column: span 3;
  grid-template-columns: subgrid; /* 继承父网格的 3 列定义 */
}
```

典型场景：卡片组里每张卡片的 header/body/footer 需要跨卡片对齐，但每张卡片内部又是一个子网格。目前 Chrome/Edge/Firefox 已支持，但 Safari 支持滞后。

### 追问：Grid + `@container` 容器查询

Grid 和容器查询是天作之合。比如 sidebar 宽度变化时，不需要整个页面回退，只查询 sidebar 容器自身的宽度来调整内部网格：

```css
.sidebar {
  container-type: inline-size;
  display: grid;
  grid-template-columns: 1fr;
}

@container (min-width: 300px) {
  .sidebar {
    grid-template-columns: 50px 1fr; /* 宽度够时显示图标 + 文字 */
  }
}
```

### 追问：Grid 性能注意事项

Grid 重排的影响范围比 Flex 大。因为 Grid 的行列是相互关联的——某一列的行高变化可能影响整行。建议：
- 复杂网格避免频繁更改行列定义
- 动画场景优先选择 `transform` 或 `opacity`（不走 layout）
- 大量数据渲染时，考虑分页或虚拟滚动，减少网格项目的数量

## 项目实战

### Dashboard 卡片网格

后台 Dashboard 最常见：统计卡片自动适配：

```vue
<template>
  <div class="dashboard-grid">
    <el-card v-for="stat in stats" :key="stat.title" class="stat-card">
      <template #header>{{ stat.title }}</template>
      <div class="stat-value">{{ stat.value }}</div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  /* 最小 280px，最大 1fr，自动填充 */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
/* 4K 屏幕上，把 gap 和列数调优 */
@media (min-width: 1920px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}
</style>
```

### 经典后台管理页面布局

```css
.admin-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 56px 1fr;
  grid-template-areas:
    "sidebar  header"
    "sidebar  main";
  height: 100vh;
  transition: grid-template-columns 0.3s; /* sidebar 折叠动画 */
}

/* 收起 sidebar */
.admin-layout.collapsed {
  grid-template-columns: 64px 1fr;
}
```

结合 Vue3 的响应式：

```typescript
const isCollapsed = ref(false)
// 模板中 :class="{ collapsed: isCollapsed }"
// Grid 的 transition 让折叠有丝滑动画
```

### 表单多列布局

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列 */
  gap: 0 24px;
}
/* 跨列的表单项 */
.form-grid .full-width {
  grid-column: 1 / -1; /* 从第 1 条线到倒数第 1 条线 */
}
```

### 数据统计面板

```css
.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stats-panel .highlight {
  /* 重点指标占 2 列 + 2 行 */
  grid-column: span 2;
  grid-row: span 2;
}
```

## 易错点

- ❌ **Grid 能替代 Flexbox** → 错！它们是互补关系，不是替代。Flex 做一维布局更简单直观，没有杀鸡用牛刀的必要。
- ❌ **`auto-fit` 和 `auto-fill` 一样** → 错。`auto-fit` 拉伸内容占满行，`auto-fill` 保留空轨道。Dashboard 卡片用 `auto-fit`，商品列表用 `auto-fill`。
- ❌ **Grid 的 `gap` 和旧的 `grid-gap` 是不同东西** → `grid-gap` 已被废弃，统一使用 `gap`（Grid 和 Flexbox 都是 `gap`）。
- ❌ **`1fr` 和 `auto` 一样** → 错。`1fr` 占剩余空间，`auto` 只占内容宽度且不参与 fr 分配。
- ❌ **Grid 项目内 `float` 有效** → 错。Grid 项目也在网格格式化上下文中，`float` 不生效。
- ❌ **`repeat(3, 1fr)` 和 `1fr 1fr 1fr` 完全一样** → 效果一样，但 `repeat()` 可以配合 `auto-fit`/`auto-fill`、`minmax()` 写出更灵活的声明。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Grid 和 Flexbox 有什么区别" | 追问二维布局 vs 一维布局——Grid 同时控制行和列 |
| "grid-template-areas 怎么用" | 追问命名区域的可视化布局——最直观的 Grid 写法 |
| "fr 单位是什么" | 追问 fr 按比例分配剩余空间、和百分比的区别 |

## 相关阅读

- [MDN: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [CSS-Tricks: A Complete Guide to CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [W3C: CSS Grid Layout Module Level 2 (subgrid)](https://www.w3.org/TR/css-grid-2/)
- [flexbox](./flexbox.md)
- [center-layout](./center-layout.md)
- [响应式布局](./responsive.md)
