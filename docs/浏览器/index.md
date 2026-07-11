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
```

## 推荐学习顺序

1. &#11088;&#11088;&#11088;&#11088;&#11088; [输入 URL 到页面展示](./url-to-page.md)
2. &#11088;&#11088;&#11088;&#11088; [浏览器多进程架构](./browser-architecture.md)
3. &#11088;&#11088;&#11088;&#11088;&#11088; [渲染流程](./render-process.md)
4. &#11088;&#11088;&#11088;&#11088;&#11088; [重绘 / 回流](./reflow-repaint.md)
5. &#11088;&#11088;&#11088;&#11088; [浏览器缓存](./cache.md)
6. &#11088;&#11088;&#11088;&#11088;&#11088; [同源策略](./same-origin-policy.md)
7. &#11088;&#11088;&#11088;&#11088;&#11088; [Cookie 深度解析](./cookie.md)
8. &#11088;&#11088;&#11088;&#11088; [Web Storage](./storage.md)
9. &#11088;&#11088;&#11088;&#11088;&#11088; [Web 安全](./安全/index.md)（XSS / CSRF / CSP / HTTPS / Clickjacking / 依赖安全）
10. &#11088;&#11088;&#11088;&#11088; [V8 引擎 / JIT 编译](./v8-engine.md)
11. &#11088;&#11088;&#11088;&#11088; [页面生命周期](./page-lifecycle.md)
12. &#11088;&#11088;&#11088;&#11088; [Observer API](./observer-api.md)
13. &#11088;&#11088;&#11088;&#11088; [DOM 事件机制 / 事件委托](./dom-event-delegation.md)
14. &#11088;&#11088;&#11088;&#11088; [requestAnimationFrame](./request-animation-frame.md)
15. &#11088;&#11088;&#11088;&#11088; [内存泄漏排查](./memory-leak.md)
16. &#11088;&#11088;&#11088;&#11088; [垃圾回收 GC](./gc.md)
17. &#11088;&#11088;&#11088;&#11088; [Service Worker](./service-worker.md)
18. &#11088;&#11088;&#11088; [浏览器 DevTools](./devtools.md)
19. &#11088;&#11088;&#11088; [BOM 全景](./bom.md)
20. &#11088;&#11088;&#11088; [Web Worker](./web-worker.md)
21. &#11088;&#11088;&#11088; [IndexedDB](./indexeddb.md)

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
| [IndexedDB](./indexeddb.md) | &#11088;&#11088;&#11088; | 中级 | filled |
