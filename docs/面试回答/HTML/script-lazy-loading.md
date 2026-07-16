---
title: script 加载 / 图片懒加载 / Resource Hints 面试回答
description: 面试中如何回答 defer vs async、图片懒加载实现、preload/prefetch 选型
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - HTML
  - script
  - 懒加载
  - preload
  - 面试回答
---

# script 加载 / 懒加载 / Resource Hints 面试回答

> 覆盖 Q6 defer/async + Q7 图片懒加载 + Q8 preload/prefetch——加载性能三道高频题。

## Q1: script 标签的 defer 和 async 有什么区别？

### 30 秒版本

"普通 script 阻塞 DOM 解析——立即下载执行。defer 异步下载、等 DOM 完成后按顺序执行。async 异步下载、下载完立即执行不保证顺序。type=module 默认行为同 defer。选型：主应用 bundle 用 defer、独立分析脚本用 async。"

### 2 分钟版本

"三种加载模式的区别是面试高频送分题——但很多人说不清 defer 和 async 的执行时机。

普通 script：浏览器遇到 script 标签 → 暂停 DOM 解析 → 下载脚本 → 执行 → 继续解析。后果：script 放 head 不加处理→白屏时间长。

defer：异步下载（不阻塞解析）+ DOMContentLoaded 前按顺序执行。关键：多个 defer 脚本保证执行顺序。适合有依赖关系的脚本——Vue/React 主应用用 defer。

async：异步下载（不阻塞解析）+ 下载完立即执行（不保证顺序）。关键：执行时机不可控——谁先下载完谁先执行，可能在 DOM 解析过程中执行。适合独立脚本——Sentry 监控、统计脚本。

type=module 默认行为同 defer——异步下载、DOM 完成后按顺序执行。ES module 天然不需要额外标记。

面试亮点：提 webpack 的 splitChunks 和路由懒加载——它们本质是 defer 行为。Vite 开发模式直接用浏览器原生 ESM——每个文件一个 ESM 请求。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "defer 和 async 怎么选" | 有依赖用 defer——保证执行顺序；独立脚本用 async——谁先下载完谁执行。监控 SDK 用 async——不影响页面加载 |
| "多个 async script 的执行顺序" | 不保证——谁先下载完谁先执行。依赖顺序的脚本不能用 async |
| "type=module 的行为" | 默认同 defer——异步下载等 DOM 完成后按顺序执行。可以手动加 async 覆盖 |

## Q2: 图片懒加载怎么实现？

### 30 秒版本

"loading=lazy 零代码浏览器原生支持。IntersectionObserver 20 行自定义触发距离。滚动监听不推荐——性能差。首屏图不懒加载——设 fetchpriority=high 优先。配合 srcset+sizes 响应式图片。"

### 2 分钟版本

"三层方案从简单到复杂：

1. loading=lazy（Chrome 77+）：img 标签加一个属性，浏览器自动处理——可视区域附近的图片才加载。缺点：不可自定义提前加载距离。

2. IntersectionObserver：创建 observer 监听 img 元素——进入视口或 rootMargin 范围内时替换 data-src 为 src。rootMargin: '200px' 提前 200px 加载——用户滚动到附近就开始加载。

3. 滚动监听 + getBoundingClientRect（不推荐）：性能差——scroll 事件不节流会每帧计算几十次位置。

实用细节：首屏图不懒加载——加 fetchpriority='high' 告诉浏览器优先下载。响应式图片配合懒加载——srcset+sizes 根据屏幕宽度选图。LQIP：先加载 20px 模糊占位图再替换原图——感知加载更快。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "loading=lazy 和 IntersectionObserver 怎么选" | loading=lazy 零代码不可自定义；IO 灵活可控——设 rootMargin 提前触发 |
| "首屏图片需要懒加载吗" | 不需要——首屏图设 fetchpriority=high 优先加载。懒加载反而延误首屏 |
| "懒加载对 SEO 的影响" | loading=lazy 不影响——搜索引擎能看到 src 属性。JS 懒加载需 SSR 兜底 |

## Q3: preload / prefetch / preconnect / dns-prefetch 是什么？

### 30 秒版本

"preload 当前页一定需要的资源高优先级立即加载——字体、首屏图。prefetch 下个页面可能需要的资源空闲时低优先级加载。preconnect 提前建立完整连接 DNS+TCP+TLS。dns-prefetch 只做 DNS 解析更轻量。同一资源不要同时 preload 和 prefetch。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "同一资源同时 preload 和 prefetch 会怎样" | Chrome 会去重，但其他浏览器可能加载两次——不要混用 |
| "preconnect 和 dns-prefetch 的区别" | preconnect DNS+TCP+TLS 全建连——适合确定会用的 CDN/API；dns-prefetch 只 DNS——更轻量，适合不确定的域名 |
| "preload 的 as 属性为什么重要" | 告诉浏览器资源类型——决定加载优先级。字体不设 as 可能被忽略 |

## 别踩的坑

1. **所有 script 都用 async** —— 有依赖关系时用 defer 保证顺序。async 随机执行可能让初始化代码跑在依赖前面
2. **全部图片都懒加载** —— 首屏图懒加载适得其反。用户打开页面应该立刻看到首屏内容
3. **preload 了但不消费** —— Console 会警告。preload 的资源必须在 3 秒内被页面使用

## 相关阅读

- [defer / async](../../HTML/script-defer-async.md)
- [图片懒加载](../../HTML/lazy-loading.md)
- [src / href Resource Hints](../../HTML/src-href.md)
- [网络传输优化](../../性能优化/network-optimization.md)

## 更新记录

- 2026-07-16：新建——合并 Q6/Q7/Q8 三道加载性能高频题
