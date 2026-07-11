---
title: Vue3 知识地图
description: Vue3 面试知识体系
category: Vue3
difficulty: null
frequency: null
status: reviewed
created: 2026-07-05
---

# Vue3 知识地图

```mermaid
mindmap
  root((Vue3))
    核心机制
      响应式原理
        Proxy vs defineProperty
        ref / reactive / track / trigger
      computed / watch
        dirty 缓存 / 惰性求值
        watchEffect / deep / flush
      异步更新
        nextTick / 微任务
        Scheduler 批量更新
      渲染机制
        Diff / Patch
        Renderer
        编译优化（PatchFlag / Block Tree）
    组件体系
      组件通信
        props / emits / provide / inject / Pinia
      v-model
        语法糖 / 多 v-model / 修饰符
      插槽
        默认 / 具名 / 作用域
      生命周期
        setup / onMounted / 父子顺序
      内置组件
        KeepAlive（LRU 缓存）
        Teleport / Suspense
        Transition / TransitionGroup
    API 与模式
      Composition API
        script setup / composable
      Composables 实战
        useFetch / useStorage / effectScope
      Vue3 vs Vue2 对比
        响应式 / 编译 / API / 生态迁移
      性能优化
        shallowRef / v-memo / KeepAlive / 懒加载
```

## 推荐学习顺序

### 一、核心机制（理解 Vue3 怎么工作）

1. ⭐⭐⭐⭐⭐ [Vue3 vs Vue2 对比](./vue3-vs-vue2.md)
2. ⭐⭐⭐⭐⭐ [响应式原理](./reactivity.md)
3. ⭐⭐⭐⭐⭐ [computed / watch](./computed-watch.md)
4. ⭐⭐⭐⭐   [nextTick](./nextTick.md)
5. ⭐⭐⭐     [Scheduler](./scheduler.md)
6. ⭐⭐⭐⭐⭐ [Diff / Patch](./diff-patch.md)
7. ⭐⭐⭐     [Renderer](./renderer.md)

### 二、组件开发（日常写组件需要的知识）

8.  ⭐⭐⭐⭐⭐ [组件通信](./component-communication.md)
9.  ⭐⭐⭐⭐⭐ [v-model 原理](./v-model.md)
10. ⭐⭐⭐⭐   [插槽深入](./slots-deep.md)
11. ⭐⭐⭐⭐   [生命周期](./lifecycle.md)
12. ⭐⭐⭐⭐   [KeepAlive](./keepalive.md)
13. ⭐⭐       [Teleport / Suspense](./teleport-suspense.md)
14. ⭐⭐⭐     [Transition 动画](./transition-animation.md)

### 三、模式与优化（进阶）

15. ⭐⭐⭐⭐   [Composition API](./composition-api.md)
16. ⭐⭐⭐⭐   [Composables 实战](./composables-practice.md)
17. ⭐⭐⭐⭐   [性能优化 Checklist](./vue3-performance.md)

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [Vue3 vs Vue2 对比](./vue3-vs-vue2.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [响应式原理](./reactivity.md) | ⭐⭐⭐⭐⭐ | 高级 | — | reviewed |
| [computed / watch](./computed-watch.md) | ⭐⭐⭐⭐⭐ | 中级 | — | reviewed |
| [nextTick](./nextTick.md) | ⭐⭐⭐⭐ | 中级 | [✅](./nextTick.md) | reviewed |
| [Scheduler](./scheduler.md) | ⭐⭐⭐ | 高级 | — | reviewed |
| [Diff / Patch](./diff-patch.md) | ⭐⭐⭐⭐⭐ | 高级 | [✅ LIS](./diff-patch.md) | reviewed |
| [Renderer](./renderer.md) | ⭐⭐⭐ | 高级 | — | reviewed |
| [组件通信](./component-communication.md) | ⭐⭐⭐⭐⭐ | 中级 | — | reviewed |
| [v-model 原理](./v-model.md) | ⭐⭐⭐⭐⭐ | 中级 | — | reviewed |
| [插槽深入](./slots-deep.md) | ⭐⭐⭐⭐ | 中级 | — | reviewed |
| [生命周期](./lifecycle.md) | ⭐⭐⭐⭐ | 初级 | — | reviewed |
| [KeepAlive](./keepalive.md) | ⭐⭐⭐⭐ | 高级 | — | reviewed |
| [Teleport / Suspense](./teleport-suspense.md) | ⭐⭐ | 初级 | — | reviewed |
| [Transition 动画](./transition-animation.md) | ⭐⭐⭐ | 中级 | — | draft |
| [Composition API](./composition-api.md) | ⭐⭐⭐⭐ | 中级 | — | reviewed |
| [Composables 实战](./composables-practice.md) | ⭐⭐⭐⭐ | 中级 | — | reviewed |
| [性能优化 Checklist](./vue3-performance.md) | ⭐⭐⭐⭐ | 高级 | — | draft |

## 相关阅读

- [Vue Router 知识地图](../VueRouter/index.md) — 路由守卫、动态路由、history vs hash
- [Pinia 知识地图](../Pinia/index.md) — 状态管理、defineStore、持久化
- [面试题库：Vue3](../面试题库/Vue3.md) — 17 道 Vue3 高频真题
- [面试题库：Vue Router](../面试题库/VueRouter.md) — 7 道路由高频真题
- [面试题库：Pinia](../面试题库/Pinia.md) — 7 道状态管理高频真题
- [面试回答：Vue3 响应式](../面试回答/Vue3/reactivity.md) — 8 篇 Vue3 逐字回答稿

## 更新记录

- 2026-07-11：学习顺序三组分组（核心机制→组件开发→模式与优化）；mindmap 缩并为 3 大分支（17→3 一级节点）；补全新增文件的 mindmap 节点
- 2026-07-05：初始创建
