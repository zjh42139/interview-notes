---
title: 性能分析工具
description: Chrome DevTools Performance / Lighthouse / Memory / Network / Coverage 面板实战指南，掌握性能问题的定位方法论
category: 性能优化
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - Performance
  - Memory
  - Lighthouse
  - DevTools
  - 性能分析
---

# 性能分析工具

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★★★

**面试官问"怎么定位性能问题"，他要听的不是优化手段，而是你的排查方法论。** 优化谁都会说（压缩、CDN、懒加载），但能从 Chrome DevTools 的火焰图里找到问题根源，才是区分初级和高级的判据。

## 一句话总结

**性能分析的核心不是"怎么优化"，而是"怎么发现"——Chrome DevTools Performance 面板定位运行时瓶颈，Lighthouse 生成量化报告，Memory 面板排查内存泄漏，Coverage 面板找出死代码。四件套构成完整的性能诊断工具体系。**

## 核心机制

### Chrome DevTools Performance 面板 -- 定位运行时瓶颈

Performance 面板是性能分析的"手术刀"。打开 F12 -> Performance 标签 -> 点击录制 -> 操作页面 -> 停止录制，得到完整的性能时间线。

```ts
// Performance 面板核心分析维度：
// 1. FPS 图表（绿色条）：高度代表帧率，红色条 = 掉帧
// 2. CPU 火焰图（Main 线程）：横轴 = 时间，色块 = 函数调用
// 3. 网络瀑布图：请求排队、DNS、连接、TTFB、下载时间
// 4. Frames 截图：逐帧查看页面渲染过程
```

**火焰图分析的关键**：找到标记为红色的 **Long Task（超过 50ms 的 JS 任务）**。长任务是 INP 恶化的根源——主线程被 JS 占满 200ms，用户点击事件排队等 200ms 才开始执行。

```ts
// 实战：后台管理表格页面卡顿排查流程
// 1. Performance 录制点击"查询"按钮到表格渲染完成
// 2. 火焰图中发现某列 render 函数耗时 200ms
// 3. 自底向上看调用栈：renderCell -> formatAmount -> toLocaleString
// 4. 定位：每行都调用了 toLocaleString()，1000 行 = 200ms
// 5. 优化：在接口层就把金额格式化好，前端直接展示
```

**FPS 分析**：当用户反馈"滚动不流畅"，录制滚动过程，FPS 图表中绿色条高度低于 60 说明掉帧。掉帧区域与火焰图中的长任务区域重合——说明是 JS 执行阻塞了渲染。

### Lighthouse -- 量化性能报告

Lighthouse 模拟中端设备（Moto G4 + 3G 网络），产出 5 个维度的评分：

```ts
// Lighthouse 核心指标（0-100 分）
// Performance：LCP / TBT / CLS / SI 综合加权
// Accessibility：ARIA 标签、对比度、焦点顺序
// Best Practices：HTTPS、安全策略、废弃 API
// SEO：meta 标签、结构化数据、可爬取性
// PWA（可选）：Service Worker、离线支持

// 每个指标下方有具体优化建议，例如：
// "Reduce unused JavaScript" → Coverage 面板定位死代码
// "Serve images in next-gen formats" → 改用 WebP/AVIF
// "Avoid large layout shifts" → 图片/广告设宽高
```

**Lighthouse CI**：把 Lighthouse 集成到 CI/CD，每次 PR 自动跑性能评分，低于阈值则阻断合并。对后台管理系统，单页面应用跑 Lighthouse 需要慎重——首屏加载天然比 MPA 慢，设置合理的阈值（如 Performance >= 70）即可。

### Memory 面板 -- 内存泄漏排查

```ts
// 内存泄漏排查标准流程：
// 1. 打开 Memory 面板 -> Heap Snapshot
// 2. 拍 Snapshot #1（页面刚加载完）
// 3. 执行可疑操作（开/关弹窗、切换 Tab、翻页）
// 4. 拍 Snapshot #2
// 5. 再执行一轮同样操作
// 6. 拍 Snapshot #3
// 7. Comparison 视图：Snapshot #3 vs #1，按 Delta（增量）排序
// 8. 关注 @ 开头的构造函数（你的代码）以及 Detached DOM 节点
```

**Detached DOM**：已经从 DOM 树中移除但 JS 变量还引用着的 DOM 节点。典型场景是 `Chart` 实例销毁时 `echarts.dispose()` 没调，或者闭包里缓存了 DOM 引用。筛选 `Detached HTMLDivElement` 一键定位。

**Allocation Timeline**：记录一段时间内的 JS 对象分配情况。蓝色柱状图高度代表每帧分配的内存大小，持续增长的柱子 = 内存泄漏。点击柱子可以看到这一帧具体创建了哪些对象。

### Network 面板 -- 请求级分析

```ts
// 瀑布图（Waterfall）分析：
// 灰色（Queueing）→ 请求排队（浏览器最多 6 个同域并发）
// 透明（Stalled） → TCP 连接等待
// 深绿（DNS Lookup）→ DNS 解析
// 橙色（Initial connection）→ TCP + TLS 握手
// 紫色（Waiting / TTFB）→ 服务器处理时间（后端瓶颈）
// 蓝色（Content Download）→ 下载时间（带宽瓶颈）

// 常见瓶颈：
// TTFB > 500ms → 后端接口慢或服务器物理距离远（上 CDN）
// Queueing 时间长 → 并发连接数不够或域名分片太多
// Content Download 长 → 资源太大（压缩/拆分）
```

### Coverage 面板 -- 找出死代码

```ts
// F12 → Ctrl+Shift+P → "Show Coverage" → 录制页面加载
// 红色/粉色 = 未使用的代码，蓝色 = 已使用的代码
// 关注：JS 总加载 2MB，实际用到的可能只有 300KB
// 原因：引入了整个 lodash，但只用了 debounce
// 解决：lodash-es 按需引入，或 tree-shaking
```

## 深度拓展

### 内存泄漏的三大元凶

| 元凶 | 排查方式 | 典型场景 |
|------|---------|---------|
| 全局变量/闭包 | Heap Snapshot 看闭包内的变量引用 | `window.bigData = xxx`、定时器未清除 |
| Detached DOM | Snapshot 对比，筛选 "Detached" | 弹窗销毁后 JS 变量仍持有 DOM 引用 |
| 事件监听未移除 | Performance Monitor 看 JS heap 趋势 | `addEventListener` 后未 `removeEventListener` |

### Performance Monitor -- 实时监控

```ts
// F12 → ... → More tools → Performance Monitor
// 实时看 JS heap size、DOM Nodes、JS event listeners、Layouts/sec
// Layouts/sec 持续高 → 频繁触发回流（reflow），需排查
```

## 项目实战

### 1. 后台管理系统表格页卡顿排查（完整案例）

```ts
// 问题：1000 条数据的表格，滚动极卡，点击排序要等 2 秒
// Step 1：Performance 录制滚动过程
//   → 火焰图看到 render 函数占 180ms/帧，远超 16.67ms 目标
// Step 2：逐帧分析 Frames
//   → 发现有 3 帧完全空白（Long Task 阻塞了渲染）
// Step 3：检查每个单元格渲染
//   → 发现"操作"列的按钮动态计算权限，每行跑一次 hasPermission()
// Step 4：优化
//   → 权限结果缓存到 Map，批量预计算，渲染时直接读取
//   → 或改用虚拟列表，只渲染可视区域的行
// Step 5：复测，火焰图绿色，render 降到了 8ms
```

### 2. 内存泄漏排查案例

```ts
// 问题：后台管理系统挂久了浏览器越来越卡，甚至崩溃
// Step 1：Memory → Allocation Timeline → 录制 30s
//   → JS heap 从 30MB 一路涨到 200MB，且不回落
// Step 2：Heap Snapshot #1（刚登录）→ #3（操作 10 分钟后）
//   → Comparison 视图，Delta 排序，发现：
//   - 10000+ Detached HTMLDivElement（表格每翻一页就多一批）
//   - 5000+ 闭包引用（定时器 setInterval 未清除）
// Step 3：定位代码
//   → 表格组件在 onUnmounted 中没有清除 ECharts 实例
//   → 实时刷新用了 setInterval，但没有 clearInterval
// Step 4：修复
onUnmounted(() => {
  chartInstance?.dispose()           // 释放 ECharts
  clearInterval(timerId)             // 清除定时器
})
```

### 3. Lighthouse CI 配置（项目集成）

```ts
// .github/workflows/lighthouse.yml
// 每次 PR 在 CI 中跑 Lighthouse，性能低于 70 分则报 warning
// npx lighthouse https://staging.example.com --output=json --output-path=./lighthouse.json
// 关注 LCP <= 2.5s、TBT <= 300ms、CLS <= 0.1
```

## 易错点

1. **只看 Lighthouse 不看 Performance 面板** -- Lighthouse 给的是实验室数据，真实用户卡顿（INP）只有 Performance 面板能复现
2. **不会看火焰图** -- 火焰图要从下往上看（从调用者到被调用者），黄色/红色块面积大的就是瓶颈；不要横向看时间线就完事
3. **内存泄漏排查只拍一次快照** -- 必须拍至少 3 次：操作前 → 操作后 → 再操作后，对比才有意义
4. **Coverage 面板只看不看用** -- 发现未使用代码 80% 但不做 tree-shaking，等于白看
5. **Network 面板只看总时间不看瀑布图** -- 队列时间长、TTFB 长、下载时间长，优化方向完全不同

## 面试信号

面试官问"你怎么定位页面卡顿"时，你的回答骨架：
1. **先录 Performance**：看火焰图找长任务，看 FPS 确认掉帧
2. **再看 Network**：确认是不是接口慢拖慢了页面
3. **必要时看 Memory**：排除内存泄漏导致的累积性卡顿
4. **最后看 Coverage**：清理未使用的代码减小包体积

"工具只是手段，能说出 Performance 面板里每一栏叫什么、怎么读、对应什么指标和优化方向，才是真本事。"

## 相关阅读

- [Web Vitals](./web-vitals.md) — LCP/INP/CLS 指标详解
- [首屏优化](./first-screen.md) — 从定位到优化的完整链路
- [打包优化](./bundle-optimization.md) — 减少包体积、提升加载速度
- [浏览器渲染流程](../浏览器/render-process.md) — 理解火焰图中的 Layout/Paint/Composite
- [性能优化知识地图](./index.md)

## 更新记录

- 2026-07-06：初始创建，覆盖 Performance / Lighthouse / Memory / Network / Coverage 五大面板 + 项目实战案例
