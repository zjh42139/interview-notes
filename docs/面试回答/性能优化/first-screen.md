---
title: 首屏优化 面试回答
description: 面试中如何回答首屏加载优化——从分析到执行的完整链路
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 性能优化
  - 首屏
  - LCP
  - 面试回答
---

# 首屏优化 面试回答

> 性能优化最高频题。面试官要的不是"压缩图片"，而是"你怎么发现问题→分析瓶颈→执行优化→量化效果"的完整链路。

## Q1: 首屏加载慢，你怎么优化？

### 30 秒版本

"四步走——测量找到瓶颈（Lighthouse/Performance）、网络优化减少传输（压缩/CDN/缓存）、资源优化减少体积（Tree Shaking/代码分割/图片优化）、渲染优化减少阻塞（SSR/骨架屏/关键 CSS 内联）。效果要有数字：LCP 从 3.2s 降到 1.1s，首屏 JS 从 480KB 降到 120KB。"

### 2 分钟版本

**第一步：测量，找到瓶颈。** Lighthouse 跑一份——看 LCP/FCP/TBT 三个指标。Performance 面板录一次加载——看哪个文件最大、哪个请求最慢。Network 面板看瀑布图——哪个请求卡后面的渲染。

**第二步：网络传输优化。**
- 静态资源上 CDN——延迟从 100ms 降到 5ms
- Brotli 压缩替代 Gzip——JS/CSS 再小 20%
- HTTP2 多路复用——不需要合并文件了
- 关键资源用 preload 提前下载

**第三步：资源体积优化。**
- Tree Shaking 摇掉未使用的导出
- 路由懒加载——首屏只加载当前页面的 JS
- 图片用 WebP/AVIF + 响应式 srcset + 懒加载
- 第三方库按需引入——`import { Button } from 'element-plus'` 而不是全量

**第四步：渲染优化。**
- HTML 用 no-cache 协商缓存——保证用户拿到最新版本
- 关键 CSS 内联到 &lt;head&gt;——首屏渲染不等待外部 CSS
- 骨架屏——用户感知"在加载了"而不是白屏
- Web Vitals 驱动的持续监控

**面试一定要带数字**：首屏从 3.2s 到 1.1s、LCP 从 4.5s 到 1.8s、打包体积从 2.1M 到 780K——面试官要的是结果。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "你怎么衡量首屏时间" | LCP（Largest Contentful Paint）——最大可见内容元素渲染完成的时间。用 Lighthouse/Performance API/web-vitals 库采集 |
| "SSR 和 SSG 怎么选" | SSR 每次请求实时渲染——适合个性化内容。SSG 构建时预渲染——适合内容不常变的文档站。CSR 首屏慢但交互快——适合后台管理系统 |
| "骨架屏和 Loading 哪个好" | 骨架屏提升感知性能——用户看到内容占位知道"马上来了"。Loading 转圈无时间感——用户不知道等 1 秒还是 10 秒 |

## 别踩的坑

1. **优化没数据** —— 只说"变快了"没有说服力。Lighthouse 前后对比截图 + LCP/TBT 数字。
2. **所有页面都 SSR** —— 后台管理系统不需要 SSR——没有 SEO 需求，SSR 增加服务器成本和开发复杂度。
3. **preload 了所有资源** —— preload 是最高优先级——preload 过多相互抢占带宽反而更慢。只 preload 首屏必须的字体和关键 CSS/JS。

## 相关阅读

- [首屏优化](../../性能优化/first-screen.md)
- [缓存策略体系](../../性能优化/caching-strategy.md)
- [构建优化实战](../工程化/build-optimization.md)

## 更新记录

- 2026-07-15：新建（四步优化链路 + 量化数据 + 工具选型）
