---
title: 微前端 知识地图
description: 微前端面试知识体系：方案对比、qiankun、Module Federation、iframe 的选型与应用
category: 微前端
---

# 微前端 知识地图

```mermaid
mindmap
  root((微前端方案对比))
    iframe
      天然隔离
      URL不同步
      postMessage通信
      性能开销大
      SEO不友好
    single-spa
      应用注册
      生命周期
      路由劫持
      无沙箱
      无CSS隔离
    qiankun
      基于single-spa
      ProxySandbox
      SnapshotSandbox
      CSS隔离
      initGlobalState
      预加载
    Module Federation
      Webpack 5原生
      exposes暴露
      remotes消费
      shared共享
      运行时模块共享
      技术栈无关
```

## 推荐学习顺序

1. ⭐⭐⭐⭐   [微前端概述](./overview.md) —— 四种方案的适用场景对比
2. ⭐⭐⭐⭐⭐ [qiankun 深度解析](./qiankun.md) —— 阿里系微前端框架，面试高频
3. ⭐⭐⭐⭐   [Module Federation](./module-federation.md) —— Webpack 5 原生联邦模块
4. ⭐⭐⭐     [iframe 方案的优劣](./iframe.md) —— 最简单也最容易被忽视的方案

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [微前端概述](./overview.md) | ⭐⭐⭐⭐ | 中级 | — | filled |
| [qiankun](./qiankun.md) | ⭐⭐⭐⭐⭐ | 高级 | — | filled |
| [Module Federation](./module-federation.md) | ⭐⭐⭐⭐ | 高级 | — | filled |
| [iframe 方案](./iframe.md) | ⭐⭐⭐ | 初级 | — | filled |
