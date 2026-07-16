---
title: Performance API
description: performance.now() / PerformanceObserver / Navigation Timing / Resource Timing / Paint Timing 浏览器性能测量 API
category: 浏览器
type: api-reference
score: 78
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - Performance
  - PerformanceObserver
  - Navigation Timing
  - Paint Timing
  - 性能监控
---

# Performance API

> ⭐⭐⭐⭐｜难度：中高级｜性能监控基础设施

**Performance API 是浏览器内置的性能测量工具集——不依赖第三方库，直接获取纳秒级精度的页面加载时间线。面试中 Web Vitals 是"指标"，Performance API 是"怎么拿到这些指标"。**

## 一句话总结

**Performance API 提供四个核心能力：高精度时间戳（`performance.now()`）、页面加载导航时间线（Navigation Timing）、资源加载时间线（Resource Timing）、以及 PerformanceObserver 实时监听性能事件——LCP/FCP/FID/INP 等 Web Vitals 指标底层都依赖它。**

## 核心机制

### 1. performance.now() —— 高精度时间戳

```javascript
// Date.now() 粒度 ~1ms，受系统时间调整影响
// performance.now() 粒度 ~5μs，单调递增（不受系统时间影响）

const start = performance.now()
// ...do something...
const end = performance.now()
console.log(`耗时: ${(end - start).toFixed(2)}ms`)
```

面试亮点：`performance.now()` 是 `DOMHighResTimeStamp`，精度 5 微秒，专门为性能测量设计——`Date.now()` 不能用来精确测性能。

### 2. Navigation Timing —— 页面加载完整时间线

```javascript
const { timing } = performance
// 每个时间点都是 navigationStart 之后的毫秒数
const dns = timing.domainLookupEnd - timing.domainLookupStart
const tcp = timing.connectEnd - timing.connectStart
const ttfb = timing.responseStart - timing.requestStart
const domParse = timing.domContentLoadedEventEnd - timing.domLoading
const totalLoad = timing.loadEventEnd - timing.navigationStart
```

**Navigation Timing v2（PerformanceNavigationTiming）更精确**：

```javascript
const [entry] = performance.getEntriesByType('navigation')
console.log({
  DNS: entry.domainLookupEnd - entry.domainLookupStart,
  TCP: entry.connectEnd - entry.connectStart,
  TLS: entry.connectEnd - entry.secureConnectionStart,
  TTFB: entry.responseStart - entry.requestStart,
  DOM: entry.domContentLoadedEventEnd - entry.domInteractive,
  Load: entry.loadEventEnd - entry.loadEventStart,
})
```

### 3. Resource Timing —— 每个资源的加载时间

```javascript
const entries = performance.getEntriesByType('resource')
for (const e of entries) {
  console.log(`${e.name}: ${(e.responseEnd - e.requestStart).toFixed(0)}ms`)
}
// 每个资源都有 DNS/TCP/TTFB/Download 分段计时
```

### 4. Paint Timing —— 首次绘制时间

```javascript
// FP: First Paint —— 第一个像素出现
// FCP: First Contentful Paint —— 第一个内容（文字/图片）出现
const paintEntries = performance.getEntriesByType('paint')
paintEntries.forEach(e => console.log(`${e.name}: ${e.startTime}`))
// first-paint: 234.5
// first-contentful-paint: 356.2
```

### 5. PerformanceObserver —— 实时监听性能事件

```javascript
// 比 polling getEntriesByType 更高效——事件驱动
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // entryType: 'largest-contentful-paint' | 'layout-shift' | 'longtask' | 'event'
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime)
    }
  }
})
observer.observe({ type: 'largest-contentful-paint', buffered: true })
observer.observe({ type: 'layout-shift', buffered: true })

// 停止监听
observer.disconnect()
```

### 6. Long Task API —— 检测长任务

```javascript
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // entry.duration > 50ms = Long Task
    console.log(`Long Task: ${entry.duration}ms, 来源: ${entry.attribution?.[0]?.name}`)
  }
})
obs.observe({ type: 'longtask' })
```

## 项目实战

### 自建简易性能监控

```typescript
// 采集核心性能指标，上报到分析平台
function collectTiming() {
  const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (!nav) return

  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ttfb: nav.responseStart - nav.requestStart,
    domReady: nav.domContentLoadedEventEnd - nav.fetchStart,
    fullLoad: nav.loadEventEnd - nav.fetchStart,
  }
}

// 配合 web-vitals 库获取 CWV
import { onLCP, onINP, onCLS } from 'web-vitals'
onLCP(metric => sendToAnalytics('LCP', metric.value))
onINP(metric => sendToAnalytics('INP', metric.value))
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "怎么测量页面加载时间" | 追问"Navigation Timing 的各个分段含义" |
| "PerformanceObserver 和 getEntriesByType 的区别" | 追问"为什么 Observer 更好"——事件驱动 vs 轮询 |
| "performance.now 和 Date.now 的区别" | 追问"精度/单调性/用途"——性能测量 vs 业务时间 |

## 相关阅读

- [Web Vitals](../性能优化/web-vitals.md)
- [性能分析工具](../性能优化/performance-devtools.md)
- [浏览器 DevTools](./devtools.md)

## 更新记录

- 2026-07-16：新建——Performance API 四核心 + 实战监控
