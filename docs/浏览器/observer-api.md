---
title: Observer API
description: MutationObserver、IntersectionObserver、ResizeObserver、PerformanceObserver 四大浏览器观察者 API 的完整使用指南
category: 浏览器
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - MutationObserver
  - IntersectionObserver
  - ResizeObserver
  - PerformanceObserver
  - Observer
---

# Observer API

> &#11088;&#11088;&#11088;&#11088;｜难度：中级｜项目：&#9733;&#9733;&#9733;&#9733;

## 一句话总结

**浏览器原生提供了四种观察者——MutationObserver（观察 DOM 变化）、IntersectionObserver（观察元素可见性）、ResizeObserver（观察元素尺寸）、PerformanceObserver（观察性能指标）。它们都在微任务时机回调，不阻塞主线程，比传统轮询方案性能高几个数量级。**

## 核心机制

### 四大 Observer 对比

| Observer | 观察目标 | 触发时机 | 经典场景 | 兼容性 |
|----------|----------|----------|----------|--------|
| **MutationObserver** | DOM 节点的属性/子节点/文本变化 | 微任务批量回调 | 水印防篡改、富文本编辑器 DOM 监听 | IE11+ |
| **IntersectionObserver** | 元素与视口（或祖先）的交叉状态 | 帧渲染前 | 懒加载、无限滚动、曝光埋点 | IE 不支持（需 polyfill） |
| **ResizeObserver** | 元素的 content-box/border-box 尺寸 | 帧渲染前 | 响应式组件、容器查询、图表自适应 | Chrome 64+ |
| **PerformanceObserver** | 浏览器性能时间线条目 | 条目产生时 | Web Vitals 采集、长任务监控 | Chrome 52+ |

### MutationObserver

```javascript
// 观察 DOM 变化——取代了 Mutation Events（已废弃）
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    switch (mutation.type) {
      case 'childList':
        // 子节点增删
        mutation.addedNodes.forEach(node => { /* ... */ })
        mutation.removedNodes.forEach(node => { /* ... */ })
        break
      case 'attributes':
        // 属性变化（class/style/data-* 等）
        console.log(`${mutation.attributeName}: ${mutation.oldValue} → ${mutation.target.getAttribute(mutation.attributeName)}`)
        break
      case 'characterData':
        // 文本节点内容变化
        break
    }
  })
})

// 配置要观察什么
observer.observe(targetNode, {
  childList: true,            // 子节点的增加/删除
  subtree: true,              // 观察所有后代节点（不只直接子节点）
  attributes: true,           // 属性的变化
  attributeOldValue: true,    // 记录属性旧值（mutation.oldValue 有效）
  attributeFilter: ['class', 'style'],  // 只观察指定属性
  characterData: true,        // 文本内容变化
  characterDataOldValue: true,
})

// 停止观察
observer.disconnect()

// 典型场景：水印防篡改
const watermarkObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    // 水印元素被删除了 → 立刻恢复
    for (const node of mutation.removedNodes) {
      if (node === watermarkElement) {
        document.body.appendChild(createWatermark())
      }
    }
    // 水印属性被改了 → 立刻恢复
    if (mutation.type === 'attributes' && mutation.target === watermarkElement) {
      restoreWatermarkStyles(mutation.target)
    }
  }
})
```

### IntersectionObserver

```javascript
// 观察元素何时进入/离开视口（或某个祖先容器）
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    // entry.isIntersecting: 元素是否在观察区域内
    // entry.intersectionRatio: 元素可见比例（0~1）
    // entry.target: 被观察的元素

    if (entry.isIntersecting) {
      // 元素进入视口 → 开始加载、开始动画、上报曝光
      loadImage(entry.target)
      reportExposure(entry.target.dataset.trackId)
    } else {
      // 元素离开视口 → 暂停动画、释放资源
      pauseAnimation(entry.target)
    }
  })
}, {
  root: null,           // 观察容器（null = 视口）
  rootMargin: '200px',  // 容器边界扩展（提前 200px 触发"进入"）
  threshold: [0, 0.5, 1],  // 可见比例阈值 0%/50%/100% 分别触发回调
})

// 开始观察
document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img)
})

// 停止观察某个元素
observer.unobserve(el)

// 停止所有观察
observer.disconnect()

// 典型场景：无限滚动
const sentinel = document.getElementById('scroll-sentinel')
const loadMoreObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMoreItems()  // 哨兵元素进入视口 → 加载下一页
  }
})
loadMoreObserver.observe(sentinel)
```

### ResizeObserver

```javascript
// 观察元素尺寸变化——比 window resize + getBoundingClientRect 精确万倍
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect
    // 或更高精度：
    const boxSize = entry.borderBoxSize?.[0]  // border-box 尺寸
    const contentSize = entry.contentBoxSize?.[0]  // content-box 尺寸

    // ECharts 自适应
    if (entry.target.chartInstance) {
      entry.target.chartInstance.resize()
    }
  }
})

// 可以观察多个元素
observer.observe(document.getElementById('chart-container'))
observer.observe(document.getElementById('sidebar'))

// 停止观察
observer.unobserve(element)
observer.disconnect()

// vs window.resize 的差异：
// window.resize → 只在浏览器窗口大小变化时触发，不感知元素的 CSS 尺寸变化
// ResizeObserver → 元素因 CSS（flex、grid、内容变化、类名切换）导致的任何尺寸变化都会通知
```

**ResizeObserver 的经典问题：无限循环**

```javascript
// ❌ 危险：ResizeObserver 回调中修改被观察元素的尺寸 → 再次触发回调 → 死循环
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    entry.target.style.width = entry.contentRect.width + 10 + 'px'
    // 每次回调都 +10px → 无限触发！
  }
})

// ✅ 安全：不在回调中修改同一元素的布局属性
// 或用 requestAnimationFrame 归并：
let scheduled = false
const observer = new ResizeObserver((entries) => {
  if (!scheduled) {
    scheduled = true
    requestAnimationFrame(() => {
      for (const entry of entries) {
        entry.target.chart.resize()  // rAF 中更新，避免触发新一轮 ResizeObserver
      }
      scheduled = false
    })
  }
})
```

### PerformanceObserver

```javascript
// 观察性能条目——Web Vitals 的底层采集方式
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 根据 entryType 区分条目类型
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        console.log('LCP:', entry.startTime, entry.size, entry.element)
        break
      case 'first-input':
        console.log('FID:', entry.processingStart - entry.startTime)
        break
      case 'layout-shift':
        console.log('CLS:', entry.value, entry.sources)
        break
      case 'longtask':
        console.log('长任务:', entry.duration + 'ms', entry.attribution)
        break
      case 'resource':
        console.log('资源加载:', entry.name, entry.duration)
        break
    }
  }
})

// 观察特定类型的性能条目
observer.observe({ type: 'largest-contentful-paint', buffered: true })
observer.observe({ type: 'first-input', buffered: true })
observer.observe({ type: 'layout-shift', buffered: true })
observer.observe({ type: 'longtask', buffered: true })

// buffered: true → 获取观察前已产生但未处理的条目
// （如 LCP 可能在 observer 注册前就已产生）
```

## 深度拓展

### 为什么 Observer 模式比事件/轮询更高效

```
传统方式（事件/轮询）：
  scroll 事件 → 每次滚动都触发 → 主线程高压 → CPU 飙升
  resize 事件 → 窗口大小变化 → 每一像素都触发 → 卡顿
  DOM 变化 → Mutation Events → 同步触发 → 阻塞执行 → 性能灾难

Observer 模式：
  ✅ 异步微任务触发 → 不会同步阻塞当前操作
  ✅ 批量回调 → 一个微任务中合并多次变化 → 减少回调次数
  ✅ 不阻塞主线程 → 计算在后台进行（如交叉区域的计算）
  ✅ 精准触发 → 只在真正需要通知时才回调（ResizeObserver 只在尺寸真变时触发）
```

## 项目实战

### 后台管理系统中的 Observer 实战

1. **水印防篡改**：MutationObserver 监听水印 DOM 的删除/属性修改，秒级恢复
2. **ECharts 容器自适应**：ResizeObserver 监听图表容器，sidebar 折叠/展开时自动 `resize`
3. **表格可见行懒渲染**：IntersectionObserver 只渲染视口内的行（实现虚拟滚动之外的轻量级懒渲染方案）
4. **页面埋点曝光**：IntersectionObserver `threshold: 0.5`（元素 50% 可见才算曝光），精准上报
5. **Web Vitals 监控**：PerformanceObserver 采集 LCP/FID/CLS/INP，上报到监控平台

## 易错点

1. **MutationObserver 的 `subtree: true` 开销大** —— 整个 DOM 树的增删都会回调，观察范围尽量缩小
2. **IntersectionObserver 的 rootMargin 可以很大** —— 但也意味着"视口上方 1000px 的元素"也算进入，可能导致预加载过多
3. **ResizeObserver 循环限制** —— 浏览器对 ResizeObserver 回调中触发的新尺寸变化有处理上限（Chrome 限制 10 层递归），超过会上报 `ResizeObserver loop limit exceeded` 错误
4. **PerformanceObserver 只能拿到注册后的条目** —— 不设 `buffered: true` 的话，LCP/FID 这些早于 observer 注册产生的条目会丢失
5. **observer.disconnect() 后无法恢复** —— 一旦断开，重新观察需要用 `new` 创建新的 observer 实例

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "无限滚动怎么实现" | 追问 IntersectionObserver 的 rootMargin 怎么设 |
| "图表怎么自适应" | 追问 ResizeObserver vs window.resize 的差异 |
| "水印怎么防篡改" | 追问 MutationObserver 的 batch 机制 |
| "Web Vitals 怎么采集" | 追问 PerformanceObserver 的 entryType 有哪些 |

## 相关阅读

- [图片懒加载](../HTML/lazy-loading.md)
- [重绘 / 回流](./reflow-repaint.md)
- [Web Vitals](../性能优化/web-vitals.md)

## 更新记录

- 2026-07-10：新建（四大 Observer 全解 + 防篡改/懒加载/自适应/性能采集实战 + Observer vs 事件对比 + 易错点）
