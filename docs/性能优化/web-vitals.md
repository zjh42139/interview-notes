---
title: Web Vitals
description: Web Vitals 核心性能指标：LCP、INP、CLS 的测量与优化
category: 性能优化
type: api-reference
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Web Vitals
  - LCP
  - FID
  - CLS
  - INP
---

# Web Vitals

> ⭐⭐⭐⭐⭐｜难度：高级

**Google 定义的核心性能指标，是整个性能优化体系的靶心。** 面试时面试官真正想听的不是你背出了 LCP/INP/CLS 三个缩写，而是你知道每个指标衡量什么、怎么测量、怎么优化，以及 Chrome 为什么用 INP 取代 FID。

## 一句话总结

**Web Vitals 是 Google 定义的核心性能指标：LCP（加载速度）、INP（交互响应）、CLS（视觉稳定性），三者共同衡量用户真实体验。**

## 核心机制

### LCP -- 最大内容绘制

LCP（Largest Contentful Paint）衡量页面**主要内容**何时对用户可见，目标 **<= 2.5s**。它不是页面完全加载的时间，而是**用户认为"这页有内容了"的那一刻**。通常 LCP 元素是首屏大图、Hero 文字、视频封面。

```ts
// LCP 要素：衡量的是"最大可见元素"的渲染时机
// 分级标准
// 好（Good）   <= 2.5s
// 需优化（NI）  2.5s ~ 4.0s
// 差（Poor）    > 4.0s
```

LCP 的子阶段：TTFB（首字节时间）-> 资源加载延迟 -> 资源加载时间 -> 元素渲染延迟。优化 LCP 需要逐个阶段拆解，而不是笼统地说"加载慢"。

### INP -- 交互到下次绘制

INP（Interaction to Next Paint）替代了旧的 FID（First Input Delay），衡量**整个页面生命周期**内的交互延迟，目标 **<= 200ms**。FID 只看首次交互，INP 记录所有交互延迟——Google 的算法是每 50 次交互忽略 1 个离群值后取最大值（约相当于第 98 百分位），反映真实的最差用户体验。

```ts
// INP 的三段组成
// INP = input delay + processing time + presentation delay
//
// input delay:      用户点击到事件回调开始执行（主线程被其他任务占用）
// processing time:  事件回调执行耗时
// presentation delay: 回调执行完到浏览器渲染出下一帧
```

INP 优于 FID 的关键：一个页面首次点击可能很快，但后续滚动、点击越来越卡，FID 捕捉不到，INP 能。

### CLS -- 累计布局偏移

CLS（Cumulative Layout Shift）衡量**视觉稳定性**，目标 **<= 0.1**。造成 CLS 的典型场景：动态插入广告、图片未设宽高、Web 字体加载后文本跳动、Cookie 横幅弹出。

```ts
// CLS = impact fraction × distance fraction
// impact fraction: 受影响区域占视口的比例
// distance fraction: 元素移动距离占视口的比例
//
// 例如：一个占视口 50% 的图片向下移动了视口高度的 25%
// CLS = 0.5 × 0.25 = 0.125 （已超标）
```

CLS 最阴险的地方：页面加载后 1 秒内的布局偏移最影响用户体验，用户刚准备点击，元素跑了。

### TTFB 和 FCP -- 辅助指标

```ts
// TTFB (Time to First Byte)：首字节时间，DNS + TCP + TLS + 服务器处理
// 目标 <= 800ms
//
// FCP (First Contentful Paint)：首次内容绘制，第一个 DOM 渲染
// 目标 <= 1.8s
```

```mermaid
graph LR
    A[用户导航] --> B[TTFB<br/>首字节]
    B --> C[FCP<br/>首次内容]
    C --> D[LCP<br/>最大内容]
    D --> E[TTI<br/>可交互]
    E --> F[INP<br/>交互延迟]
```

## 深度拓展

### 如何测量 Web Vitals

```ts
// 方式一：web-vitals 库（Google 官方）
import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals"

onLCP(console.log)   // Largest Contentful Paint
onINP(console.log)   // Interaction to Next Paint
onCLS(console.log)   // Cumulative Layout Shift

// 方式二：PerformanceObserver 手动测量 LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1] // LCP 会更新
  console.log("LCP:", lastEntry.startTime)
}).observe({ type: "largest-contentful-paint", buffered: true })
```

- **web-vitals 库**：封装了最佳实践，自动处理 LCP 候选元素变更、页面后台切换等边界情况
- **Lighthouse**：实验室数据，模拟慢网络和低性能设备，适合本地调试
- **CrUX（Chrome 用户体验报告）**：真实用户数据，29 天窗口期，能反映线上真实表现

### 优化 LCP 的四个方向

```ts
// 1. 预加载关键资源 — 让浏览器尽早发现
<link rel="preload" as="image" href="hero.webp" />
<link rel="preload" as="font" crossorigin href="font.woff2" />

// 2. SSR/SSG — 减少客户端渲染时间
// Next.js: getServerSideProps / getStaticProps
// Nuxt.js: useAsyncData / useFetch

// 3. CDN — 减少地理延迟，TTFB 从 500ms 降到 50ms

// 4. 图片优化 — WebP/AVIF + 响应式尺寸
<img src="hero.webp" srcset="hero@2x.webp 2x" width="800" height="400" />
```

### 优化 INP 的三个手段

```ts
// 1. 拆分长任务 — 将超过 50ms 的任务拆成小块
// scheduler.postTask（Chrome 94+）
scheduler.postTask(() => heavyWorkPart1(), { priority: "user-blocking" })
scheduler.postTask(() => heavyWorkPart2(), { priority: "background" })

// 2. Web Worker — 计算密集型任务移到后台线程
const worker = new Worker("/heavy-calc.worker.js")
worker.postMessage(data)
worker.onmessage = (e) => updateUI(e.data)

// 3. React 18 Concurrent Rendering — 可中断渲染
// 使用 useTransition 标记低优先级更新
const [isPending, startTransition] = useTransition()
startTransition(() => setFilteredList(heavyFilter(rawList, keyword)))
```

## 项目实战

### 1. 接入 web-vitals 监控上报

```ts
import { onLCP, onINP, onCLS } from "web-vitals"

function sendToAnalytics(metric: Metric) {
  // 采样率 10%，避免全量上报消耗带宽
  if (Math.random() > 0.1) return
  navigator.sendBeacon("/api/vitals", JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // "good" | "needs-improvement" | "poor"
    page: location.pathname,
  }))
}

onLCP(sendToAnalytics)
onINP(sendToAnalytics)
onCLS(sendToAnalytics)
```

### 2. 骨架屏减少 CLS

```ts
// 页面加载时显示骨架屏占位，图片加载完成后替换
// 骨架屏和真实内容占同样的高度，避免 DOM 变化引起 CLS
<div v-if="loading" class="skeleton-card" style="height: 200px" />
<img v-else :src="banner" width="800" height="200" />
```

### 3. 图片宽高预设避免 CLS

```ts
// 所有 <img> 标签设置 width/height，浏览器提前预留空间
<img src="avatar.png" width="40" height="40" alt="头像" />

// CSS 统一重置防止宽高被覆盖
img {
  max-width: 100%;
  height: auto; // 配合 width/height 属性，浏览器自动计算 aspect-ratio
}
```

## 易错点

1. **只看 Lighthouse 分数不看 CrUX** -- Lighthouse 是实验室环境（固定网络/CPU），CrUX 是真实用户数据，线上用户设备可能差得多
2. **过度优化 LCP 到 1s 以下** -- 对 B 端后台系统，2.5s 内就足够；花一个月把 LCP 从 2.1s 优化到 1.8s 的 ROI 不如修两个 bug
3. **忽略 CLS** -- 页面加载后 1 秒内的布局偏移最影响用户体验，用户刚准备点击按钮，按钮跑了
4. **FID 和 INP 混淆** -- FID 只测首次交互，INP 测全生命周期；Chrome 已用 INP 替代 FID 作为 Core Web Vital
5. **不上报或全量上报** -- 不上报等于不知道用户真实体验，全量上报消耗大量带宽；建议采样率 10%

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Web Vitals 核心指标有哪些" | 追问 LCP/FID/CLS/INP 各自衡量什么、业界良好阈值 |
| "CLS 怎么优化" | 追问给图片/iframe/广告预留尺寸——避免布局偏移 |
| "怎么采集 Web Vitals 数据" | 追问 PerformanceObserver + web-vitals 库 + sendBeacon 上报 |

## 相关阅读

- [首屏优化](./first-screen.md)
- [打包优化](./bundle-optimization.md)
- [图片优化](./image-optimization.md)
- [浏览器渲染流程](../浏览器/render-process.md)
- [性能优化知识地图](./index.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（四核心指标 + 测量方式 + INP 替代 FID + 项目实战）
