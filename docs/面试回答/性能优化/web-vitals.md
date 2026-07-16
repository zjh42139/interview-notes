---
title: Web Vitals 面试回答
description: 面试中如何回答 Web Vitals 核心指标——LCP/FID/INP/CLS 的定义、阈值和优化方向
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 性能优化
  - Web Vitals
  - LCP
  - CLS
  - 面试回答
---

# Web Vitals 面试回答

> Google 推的核心性能指标。面试官不要你背阈值，要你说清楚"每个指标衡量什么体验维度"。

## Q1: Web Vitals 核心指标有哪些？

### 30 秒版本

"Google 定义了三个核心指标——LCP（加载体验，最大内容渲染时间<2.5s）、INP（交互体验，交互延迟<200ms，FID 的替代）、CLS（视觉稳定性，布局偏移<0.1）。LCP: 用户看到主要内容的时间；INP: 用户操作后页面响应的时间；CLS: 页面跳动程度。"

### 2 分钟版本

| 指标 | 衡量什么 | 好/需改进/差 | 优化方向 |
|------|---------|:---:|------|
| **LCP** | 加载——最大可见元素渲染完成 | <2.5s / <4s / >4s | CDN/压缩/SSR/减少阻塞资源 |
| **INP** | 交互——用户操作到页面响应 | <200ms / <500ms | 拆分长任务/Web Worker/requestIdleCallback |
| **CLS** | 视觉稳定——布局偏移累计 | <0.1 / <0.25 | 图片设宽高/骨架屏占位/字体预加载 |

**LCP（Largest Contentful Paint）**：页面主要内容可见的时间。影响因子：服务器响应慢、渲染阻塞（CSS）、资源加载慢。优化——关键 CSS 内联、HTML 流式传输、图片用 preload。

**INP（Interaction to Next Paint）**：FID 的升级版。FID 只看第一次交互，INP 看整页生命周期中最差的一次交互延迟。本质是主线程被长任务阻塞——优化——拆分长任务（50ms 内）、移计算到 Web Worker。

**CLS（Cumulative Layout Shift）**：页面加载过程中内容的视觉漂移。最常见原因——图片无宽高、广告/iframe 后插入、FOIT（字体加载时文字消失）。解决——图片/视频/iframe 预留空间、字体用 font-display:swap 保留文字占位。

**面试关键的加分句**："Web Vitals 不是让你背数字——它是让你用数据替代感觉。Lighthouse 的分数不是绩效，用户真实体验才是。""

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "LCP 的元素是固定的吗" | 不——随页面加载而变。最初可能是标题文字，图片加载后可能变为 hero 图片。LCP 取最终那个最大元素 |
| "INP 和 FID 什么关系" | FID 只看第一次交互延迟，INP 看整页最差的交互。2024年3月 INP 正式替代 FID 成为 Core Web Vital |
| "CLS 怎么测量" | PerformanceObserver 监听 layout-shift entry——`entry.value` 就是这次偏移的分数。累计所有无用户交互触发的偏移 |

## 别踩的坑

1. **Lighthouse 分数不是万能的** —— Lab 数据受网络/设备影响。真实用户数据（RUM）通过 web-vitals 库采集更准确。
2. **CLS 不是所有动画都算** —— 用户交互触发的布局变化不算 CLS（如点击展开菜单）。只算非交互触发的意外偏移。

## 相关阅读

- [首屏优化](./first-screen.md)
- [缓存策略体系](../性能优化/caching-strategy.md)

## 更新记录

- 2026-07-15：新建（三大核心指标 + INP 替代 FID + 优化方向表）
