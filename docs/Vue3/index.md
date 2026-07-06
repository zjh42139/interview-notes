---
title: Vue3 知识地图
description: Vue3 面试知识体系
category: Vue3
---

# Vue3 知识地图

```mermaid
mindmap
  root((Vue3))
    v-model
      语法糖
      多v-model
      修饰符
    响应式
      Proxy + Reflect
      reactive / ref
      effect
      track
      trigger
      scheduler
    computed
      dirty 缓存
      惰性求值
    watch
      deep
      immediate
      flush
    渲染
      Renderer
      Diff / Patch
      patchKeyedChildren
      LIS
      Block Tree
      PatchFlag
    nextTick
      Promise 微任务
      降级策略
    生命周期
      setup
      onMounted
      onUnmounted
      onActivated
    KeepAlive
      LRU 缓存
      include / exclude
    Teleport
      DOM 穿越
      层叠上下文
    Suspense
      异步组件
      fallback
    Composition API
      composable
      script setup
      逻辑复用
```

## 推荐学习顺序

1. ⭐⭐⭐⭐⭐ [响应式原理](./reactivity.md)
2. ⭐⭐⭐⭐⭐ [v-model 原理](./v-model.md)
3. ⭐⭐⭐⭐⭐ [computed / watch](./computed-watch.md)
4. ⭐⭐⭐⭐⭐ [Diff / Patch](./diff-patch.md)
5. ⭐⭐⭐⭐   [nextTick](./nextTick.md)
6. ⭐⭐⭐⭐   [生命周期](./lifecycle.md)
7. ⭐⭐⭐⭐   [Composition API](./composition-api.md)
8. ⭐⭐⭐⭐   [KeepAlive](./keepalive.md)
9. ⭐⭐⭐     [Renderer](./renderer.md)
10. ⭐⭐⭐     [Scheduler](./scheduler.md)
11. ⭐⭐      [Teleport / Suspense](./teleport-suspense.md)

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [响应式原理](./reactivity.md) | ⭐⭐⭐⭐⭐ | 高级 | — | reviewed |
| [v-model 原理](./v-model.md) | ⭐⭐⭐⭐⭐ | 中级 | — | filled |
| [computed / watch](./computed-watch.md) | ⭐⭐⭐⭐⭐ | 中级 | — | reviewed |
| [Diff / Patch](./diff-patch.md) | ⭐⭐⭐⭐⭐ | 高级 | [✅ LIS](./diff-patch.md) | reviewed |
| [nextTick](./nextTick.md) | ⭐⭐⭐⭐ | 中级 | [✅](./nextTick.md) | reviewed |
| [生命周期](./lifecycle.md) | ⭐⭐⭐⭐ | 初级 | — | reviewed |
| [Composition API](./composition-api.md) | ⭐⭐⭐⭐ | 中级 | — | reviewed |
| [KeepAlive](./keepalive.md) | ⭐⭐⭐⭐ | 高级 | — | reviewed |
| [Renderer](./renderer.md) | ⭐⭐⭐ | 高级 | — | reviewed |
| [Scheduler](./scheduler.md) | ⭐⭐⭐ | 高级 | — | reviewed |
| [Teleport / Suspense](./teleport-suspense.md) | ⭐⭐ | 初级 | — | reviewed |
