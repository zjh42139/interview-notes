---
title: 浏览器 知识地图
description: 浏览器面试知识体系
category: 浏览器
---

# 浏览器 知识地图

```mermaid
mindmap
  root((浏览器))
    URL到页面展示
      网络
      渲染
    多进程架构
      Browser
      Renderer
      GPU
    渲染流程
      DOM树
      CSSOM
      布局
      绘制
      合成
    重绘回流
    rAF
      帧动画
      requestIdleCallback
    V8 引擎
      Ignition 解释器
      TurboFan 编译器
      隐藏类
      内联缓存
    页面生命周期
      DOMContentLoaded
      load
      visibilitychange
      bfcache
    缓存
      强缓存
      协商缓存
      Service Worker
    Web Storage
      Cookie
      LocalStorage
      SessionStorage
    IndexedDB
    Web Worker
    垃圾回收
      新生代 Scavenge
      老生代 Mark-Sweep
      增量标记
    内存泄漏
      泄漏模式
      WeakMap / WeakRef
      DevTools 排查
    安全
      同源策略
      XSS / CSRF
      CSP
      iframe 安全
    Observer API
      MutationObserver
      IntersectionObserver
      ResizeObserver
      PerformanceObserver
    DOM 事件
      捕获-目标-冒泡
      事件委托
      e.target
    DevTools
      Performance
      Memory
      Network
    BOM
      navigator
      screen
      location
      history
    跨标签页通信
      BroadcastChannel
      postMessage
      localStorage 事件
      SharedWorker
```

## 推荐学习顺序

### 一、页面加载与渲染

1. ⭐⭐⭐⭐⭐ [输入 URL 到页面展示](./url-to-page.md)
2. ⭐⭐⭐⭐⭐ [渲染流程](./render-process.md)
3. ⭐⭐⭐⭐⭐ [重绘 / 回流](./reflow-repaint.md)
4. ⭐⭐⭐⭐ [浏览器多进程架构](./browser-architecture.md)
5. ⭐⭐⭐⭐ [页面生命周期](./page-lifecycle.md)
6. ⭐⭐⭐⭐ [浏览器缓存](./cache.md)
7. ⭐⭐⭐⭐ [requestAnimationFrame](./request-animation-frame.md)
8. ⭐⭐⭐⭐ [Performance API](./performance-api.md)

### 二、安全与存储

9. ⭐⭐⭐⭐⭐ [Web 安全](./安全/index.md)（含 XSS / CSRF / CSP / Clickjacking / HTTPS / Token 存储 / 依赖安全 / JWT / 数据泄露 9 篇）
10. ⭐⭐⭐⭐⭐ [同源策略](./same-origin-policy.md)
11. ⭐⭐⭐⭐⭐ [Cookie 深度解析](./cookie.md)
12. ⭐⭐⭐⭐ [Web Storage](./storage.md)
13. ⭐⭐⭐⭐ [DOM 事件机制 / 事件委托](./dom-event-delegation.md)
14. ⭐⭐⭐ [跨标签页通信](./cross-tab-communication.md)

### 三、引擎与性能

15. ⭐⭐⭐⭐ [V8 引擎 / JIT 编译](./v8-engine.md)
16. ⭐⭐⭐⭐ [垃圾回收 GC](./gc.md)
17. ⭐⭐⭐⭐ [内存泄漏排查](./memory-leak.md)
18. ⭐⭐⭐⭐ [Service Worker](./service-worker.md)

### 四、工具与扩展

19. ⭐⭐⭐ [浏览器 DevTools](./devtools.md)
20. ⭐⭐⭐ [BOM 全景](./bom.md)
21. ⭐⭐⭐ [Observer API](./observer-api.md)
22. ⭐⭐⭐ [Web Worker](./web-worker.md)
23. ⭐⭐⭐ [IndexedDB](./indexeddb.md)

## 知识点索引

| 知识点 | 频率 | 难度 | 状态 |
|--------|------|------|------|
| [输入 URL 到页面展示](./url-to-page.md) | &#11088;&#11088;&#11088;&#11088;&#11088; | 高级 | filled |
| [浏览器多进程架构](./browser-architecture.md) | &#11088;&#11088;&#11088;&#11088; | 中级 | filled |
| [渲染流程](./render-process.md) | &#11088;&#11088;&#11088;&#11088;&#11088; | 高级 | draft |
| [重绘 / 回流](./reflow-repaint.md) | &#11088;&#11088;&#11088;&#11088;&#11088; | 中级 | draft |
| [浏览器缓存](./cache.md) | &#11088;&#11088;&#11088;&#11088; | 中级 | draft |
| [同源策略](./same-origin-policy.md) | &#11088;&#11088;&#11088;&#11088;&#11088; | 中级 | drafted |
| [Cookie 深度解析](./cookie.md) | &#11088;&#11088;&#11088;&#11088;&#11088; | 中级 | drafted |
| [Web Storage](./storage.md) | &#11088;&#11088;&#11088;&#11088; | 初级 | draft |
| [Web 安全](./安全/index.md) | &#11088;&#11088;&#11088;&#11088;&#11088; | 中级 | draft |
| [V8 引擎 / JIT 编译](./v8-engine.md) | &#11088;&#11088;&#11088;&#11088; | 高级 | drafted |
| [页面生命周期](./page-lifecycle.md) | &#11088;&#11088;&#11088;&#11088; | 中级 | drafted |
| [Observer API](./observer-api.md) | &#11088;&#11088;&#11088;&#11088; | 中级 | drafted |
| [DOM 事件机制 / 事件委托](./dom-event-delegation.md) | &#11088;&#11088;&#11088;&#11088; | 中级 | draft |
| [requestAnimationFrame](./request-animation-frame.md) | &#11088;&#11088;&#11088;&#11088; | 中级 | filled |
| [内存泄漏排查](./memory-leak.md) | &#11088;&#11088;&#11088;&#11088;&#11088; | 高级 | drafted |
| [垃圾回收 GC](./gc.md) | &#11088;&#11088;&#11088;&#11088; | 高级 | filled |
| [Service Worker](./service-worker.md) | &#11088;&#11088;&#11088;&#11088; | 高级 | filled |
| [浏览器 DevTools](./devtools.md) | &#11088;&#11088;&#11088; | 中级 | drafted |
| [BOM 全景](./bom.md) | &#11088;&#11088;&#11088; | 初级 | drafted |
| [Web Worker](./web-worker.md) | &#11088;&#11088;&#11088; | 中级 | draft |
| [IndexedDB](./indexeddb.md) | ⭐⭐⭐ | 中级 | filled |
| [跨标签页通信](./cross-tab-communication.md) | ⭐⭐⭐ | 中级 | draft |
