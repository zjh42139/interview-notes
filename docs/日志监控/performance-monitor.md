---
title: 性能监控
description: Core Web Vitals、PerformanceObserver、sendBeacon 上报
category: 日志监控
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 性能监控
  - Web Vitals
  - PerformanceObserver
---

# 性能监控

## ✅ 核心机制

### 1. 核心指标：Core Web Vitals

Google 定义的核心指标，直接影响搜索排名和用户体验：

| 指标 | 全称 | 含义 | 良好阈值 |
|------|------|------|----------|
| **LCP** | Largest Contentful Paint | 最大内容绘制时间 | ≤ 2.5s |
| **INP** | Interaction to Next Paint | 交互响应延迟（替代 FID） | ≤ 200ms |
| **CLS** | Cumulative Layout Shift | 累计布局偏移 | ≤ 0.1 |
| **FCP** | First Contentful Paint | 首次内容绘制 | ≤ 1.8s |
| **TTFB** | Time to First Byte | 首字节时间 | ≤ 800ms |
| **TBT** | Total Blocking Time | 总阻塞时间 | ≤ 200ms |

### 2. 采集方式

**方式一：`web-vitals` 库（推荐）**

Google 官方库，一行代码搞定各指标采集：

```js
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(metric => report('LCP', metric.value));
onINP(metric => report('INP', metric.value));
onCLS(metric => report('CLS', metric.value));
```

**方式二：`PerformanceObserver` 原生 API（理解原理用）**

```js
// 监听 LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  console.log('LCP:', entries[entries.length - 1].startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// 监听 CLS（累加所有布局偏移）
let clsValue = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) clsValue += entry.value;
  }
}).observe({ type: 'layout-shift', buffered: true });

// 监听 Long Task（超过 50ms 的任务）
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn(`Long Task: ${entry.duration}ms`);
  }
}).observe({ type: 'longtask', buffered: true });
```

`buffered: true` 确保 Observer 能获取注册前已产生的 PerformanceEntry。

### 3. Performance API：页面加载时间线

```js
const [entry] = performance.getEntriesByType('navigation');
console.log({
  DNS:  entry.domainLookupEnd - entry.domainLookupStart,
  TCP:  entry.connectEnd - entry.connectStart,
  TTFB: entry.responseStart - entry.requestStart,
  DOM:  entry.domContentLoadedEventEnd - entry.responseEnd,
  总耗时: entry.loadEventEnd - entry.fetchStart,
});
```

## ⭐ 深度拓展

### 4. 自定义打点：`performance.mark()` + `measure()`

```js
performance.mark('api-start');
// ... 异步操作 ...
performance.mark('api-end');
performance.measure('api-duration', 'api-start', 'api-end');

const { duration } = performance.getEntriesByName('api-duration')[0];
console.log(`耗时: ${duration}ms`);

// 清理避免内存泄漏
performance.clearMarks('api-start');
performance.clearMarks('api-end');
performance.clearMeasures('api-duration');
```

常用场景：首屏渲染耗时、接口响应时间、组件渲染耗时。

### 5. 数据上报：`navigator.sendBeacon()`

页面卸载时浏览器可能取消 `fetch` 请求导致数据丢失。`sendBeacon` 专为此场景设计，保证即使页面卸载请求也会发送完成。

```js
function reportMetric(name, value) {
  const data = JSON.stringify({ name, value, pageUrl: location.href, timestamp: Date.now() });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', new Blob([data], { type: 'application/json' }));
  } else {
    fetch('/api/metrics', { method: 'POST', body: data, keepalive: true });
  }
}
```

CLS 需特别处理：它在页面生命周期内持续更新，应在 `visibilitychange` 时上报最终累加值。

## ⭕ 项目实战

### 监控上报架构

```
[PerformanceObserver / web-vitals]  →  采集指标
        ↓
[采样过滤]  →  按比例采样 + 去重
        ↓
[批量队列]  →  攒够 N 条或每隔 M 秒发送
        ↓
[ sendBeacon ]  →  可靠上报
        ↓
[监控平台]  →  可视化 + 告警
```

### 易错点

| 易错点 | 正确做法 |
|--------|----------|
| CLS 提前上报 | 在 `visibilitychange` 或页面卸载时上报最终累加值 |
| LCP 取旧值 | 监听 LCP 直到用户交互（点击/滚动）才取最终值 |
| `sendBeacon` 大数据 | Blob 限制约 64KB，超出需拆分或降级 |
| 忘记 `clearMarks` | SPA 长期运行会积累大量 Mark，需定期清理 |

### 面试信号

> **"知道 LCP/CLS/INP 是什么 + 怎么用 PerformanceObserver 采集"**

回答框架：

1. 核心三指标 LCP / INP / CLS 的含义和阈值
2. 采集：`web-vitals` 库封装 + `PerformanceObserver` 原理
3. 辅助指标 TTFB / FCP / Long Task
4. 上报用 `sendBeacon` 保证可靠性
5. 自定义打点用 `performance.mark()` + `measure()`

能画出上方的架构流程图，说明具备独立搭建性能监控体系的能力。
