---
title: 代码分割（Code Splitting）
description: Webpack splitChunks 分包策略、动态 import、chunk 命名规范、Rollup manualChunks
category: 工程化
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - Code Splitting
  - splitChunks
  - 动态导入
  - 分包策略
---

# 代码分割（Code Splitting）

> ⭐⭐⭐⭐｜难度：中级｜性能+工程化交叉考点

## 一句话总结

**代码分割 = 把代码拆成多个文件按需加载——首屏只加载当前页面需要的代码，其余延迟加载。三种方式：入口起点分割、动态 import（路由懒加载）、splitChunks 提取公共模块。**

## 核心机制

### 动态 import —— 路由懒加载

```javascript
// 静态导入：所有组件打包在一起——首屏全下载
import Dashboard from './views/Dashboard.vue';

// 动态导入：按需加载——访问该路由才下载
const Dashboard = () => import('./views/Dashboard.vue');

// Vue Router 中的懒加载
const routes = [
  { path: '/dashboard', component: () => import('@/views/Dashboard.vue') },
  { path: '/users',     component: () => import('@/views/Users.vue') },
];
// Webpack 自动为每个动态 import() 创建单独的 chunk
```

**magic comments**（Webpack 命名 chunk）：

```javascript
import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue');
import(/* webpackPrefetch: true */ './views/Analytics.vue');  // 空闲时预取
```

### splitChunks —— 提取公共模块

```javascript
// webpack.config.js
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
      },
      common: {
        minChunks: 2,          // 至少被 2 个入口共享
        priority: 5,
        reuseExistingChunk: true,
      },
    },
  },
}
```

**分包策略**：

| 分组 | 内容 | 原因 |
|------|------|------|
| vendor | Vue/React/Element Plus | 第三方库不常变——缓存命中率高 |
| common | 多入口共享的 utils/components | 提取出来避免每个入口各自打包一份 |
| async | 路由懒加载页面 | 首屏不需要的延迟加载 |

### Vite / Rollup 的 manualChunks

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-vue': ['vue', 'vue-router', 'pinia'],
        'vendor-ui': ['element-plus'],
        'vendor-utils': ['axios', 'dayjs'],
      },
    },
  },
}
```

### 为什么要分包？

1. **缓存利用率**：vendor 包很少变——用户浏览器缓存后不再下载。业务代码变了只更新业务 chunk
2. **首屏体积**：只加载当前路由的 JS——首屏从 2MB 降到 300KB
3. **并行下载**：HTTP2 多路复用下多个小文件比一个大文件下载更快

## 深度拓展

### chunk 大小权衡

太小（<10KB）：文件多、HTTP 请求开销大、压缩效率低。太大（>500KB）：缓存粒度粗糙——改一行代码整个 chunk 缓存失效。最佳范围 30-100KB——平衡缓存粒度和请求数。

### 动态 import 的预加载

```html
<!-- prefetch：浏览器空闲时提前下载"将来可能用到"的 chunk（与悬停无关，写在 HTML 里就会在空闲时拉取） -->
<link rel="prefetch" href="/assets/dashboard.abc123.js">

<!-- preload：当前页面马上就要用的资源（优先级比 prefetch 高） -->
<link rel="preload" href="/assets/hero.js" as="script">
```

Webpack 用 `/* webpackPrefetch: true */` 自动注入 prefetch 标签。

## 易错点

❌ **所有路由都懒加载** —— 首屏关键组件（导航栏、登录页）不需要懒加载——延迟加载反而增加首屏白屏时间。只有非首屏的路由才拆。

❌ **splitChunks 太激进** —— 把 `minChunks: 2` 设太低，所有共享组件全拆成独立文件——HTTP 请求数爆炸。一般 3-5 个 cacheGroups 就够了。

❌ **chunk 名字不带 hash** —— `name: 'vendors'` 不包含 hash，发布新版本时浏览器读旧缓存。应该让 Webpack 自动生成 `[name].[contenthash].js`。

## 相关阅读

- [Tree Shaking](./tree-shaking.md)
- [打包优化](../性能优化/bundle-optimization)
- [首屏优化](../性能优化/first-screen.md)

## 更新记录

- 2026-07-16：新建——动态 import/splitChunks/manualChunks/分包策略/chunk 大小权衡
