---
title: 虚拟列表 面试回答
description: 面试中如何回答虚拟列表原理——可视区域计算、DOM 复用、动态高度处理
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 性能优化
  - 虚拟列表
  - 面试回答
---

# 虚拟列表 面试回答

> 大数据渲染的标配技术。面试官要的不是"只渲染可见区域"，而是"你怎么算哪些可见、怎么处理动态高度"。

## Q1: 虚拟列表的原理是什么？

### 30 秒版本

"只渲染可视区域的 DOM 节点——根据 scrollTop 和每项高度算出 startIndex 和 endIndex，只渲染范围内的项目。外层容器设总高度撑开滚动条，内层项目用 translateY 偏移到正确位置。核心是三个值——可视区起始索引、结束索引、偏移量。"

### 2 分钟版本

**三步实现**：

1. 计算可见区域：`startIndex = Math.floor(scrollTop / itemHeight)`，`endIndex = startIndex + Math.ceil(containerHeight / itemHeight) + buffer`（加 buffer 避免快速滚动白屏）

2. 只渲染可见项：`visibleData = data.slice(startIndex, endIndex)`。DOM 节点数 = 可视数量（~20个）而不是数据总量（10000个）

3. 定位偏移：外层容器 `height: data.length * itemHeight`（撑开滚动条），内层 `transform: translateY(startIndex * itemHeight)`（将可见项目推到正确位置）

**固定高度版核心代码**：
```javascript
const totalHeight = data.length * itemHeight;
const startIndex = Math.floor(scrollTop / itemHeight);
const visibleData = data.slice(startIndex, startIndex + visibleCount);
// 偏移 = 前 startIndex 项的总高度
const offsetY = startIndex * itemHeight;
```

**动态高度版**：每项高度不固定——需要一个维护每项高度和偏移的数组。用 ResizeObserver 监听每一项的实际高度，更新缓存数组。`getStartIndex(scrollTop)` 用二分查找定位到累积偏移超过 scrollTop 的项。

**面试话术**："虚拟列表是空间换时间——用计算换取 DOM 节点数从 O(n) 降到 O(1)。实际项目中很少手写——用 vue-virtual-scroller 或 react-window。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "快速滚动白屏怎么解决" | 加 buffer——渲染范围两端各多渲染几个节点。比如 visibleCount 是 10，实际渲染 14 个，缓冲滚动延迟 |
| "动态高度怎么处理" | 维护 positions 数组存每项的 top/bottom/height。ResizeObserver 监听 DOM 变化更新缓存。二分查找定位 startIndex |
| "虚拟列表和分页怎么选" | 分页适合搜索/筛选场景——用户跳页看。虚拟列表适合浏览/滚动场景——用户连续往下翻。分页破坏浏览体验、虚拟列表不适合随机跳转 |

## 别踩的坑

1. **忘记撑开滚动条** —— 外层容器高度必须等于数据总量 × 单项高度。否则滚动条长度不对，用户拉不到底。
2. **动态高度没更新缓存** —— 每一项的实际高度变了但 positions 数组还是旧值，后续定位全错。ResizeObserver 是标配。

## 相关阅读

- [虚拟列表](../../性能优化/virtual-list.md)
- [首屏优化](./first-screen.md)

## 更新记录

- 2026-07-15：新建（固定高度三步 + 动态高度 + buffer + 选型对比）
