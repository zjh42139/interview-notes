---
title: Teleport / Suspense
description: Vue3 Teleport 传送门与 Suspense 异步组件的使用场景
category: Vue3
difficulty: 初级
frequency: ⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - Teleport
  - Suspense
  - 异步组件
---

# Teleport / Suspense

> 一轻一重两个特性。Teleport 解决"组件写在哪和渲染在哪可以不同"的问题，Suspense 解决"异步组件加载时的白屏体验"问题。面试频率不高，但知道的加分。

## 一句话总结

**Teleport 把组件的内容渲染到 DOM 树的任意位置**（常用于 Modal/Dialog 逃离层叠上下文），**Suspense 为异步组件提供 loading 状态的声明式处理**（fallback 插槽 + async setup）。

## 核心机制

### 1. Teleport：DOM 穿越

```html
<!-- 组件写在 <App> 的深层位置 -->
<template>
  <div class="dashboard">
    <Teleport to="#modal-container">
      <Modal v-if="showModal" @close="showModal = false" />
    </Teleport>
  </div>
</template>

<!-- 但 DOM 实际渲染到了 body 下的 #modal-container -->
<body>
  <div id="app">...</div>
  <div id="modal-container">
    <div class="modal">...</div>  <!-- 这里的 DOM -->
  </div>
</body>
```

**核心原理**：Teleport 在 patch 阶段（`process` 函数）不做特殊处理，但在 `move` 阶段，如果目标容器和当前父容器不同，就执行 `insert` 把 DOM 节点移动到 `to` 指向的目标。

```ts
// 简化版：Teleport 的 patch 逻辑
if (n2.shapeFlag & ShapeFlags.TELEPORT) {
  // 找到 to 指定的容器
  const target = document.querySelector(n2.props.to)
  // 把 children 渲染到 target 而非当前父容器
  n2.children.forEach(child => {
    process(child, null, target, ...)   // 关键：anchor 是 target
  })
}
```

**为什么需要它？** CSS 中很多属性会创建**层叠上下文**（z-index、transform、opacity、filter 等），导致 Modal 的 `z-index: 9999` 仍然被父级的 `transform: translate(0)` 困在里面。Teleport 把 Modal 扔到 `body` 下直接解决这个问题。

### 2. Suspense：异步加载

```html
<!-- 异步组件加载时显示 skeleton/loading -->
<Suspense>
  <template #default>
    <AsyncDashboard />
  </template>
  <template #fallback>
    <DashboardSkeleton />
  </template>
</Suspense>
```

```ts
// 异步组件的定义
const AsyncDashboard = defineAsyncComponent(() =>
  import('./Dashboard.vue')
)

// 或者用 async setup（实验性）
const DashboardWithAsyncSetup = {
  async setup() {
    const data = await fetchDashboardData()
    return { data }
  }
}
```

Suspense 本质是**捕获子组件的 async setup 抛出的 Promise**，在 Promise pending 期间渲染 fallback 插槽，resolved 后切换到 default 插槽。它还处理了嵌套 Suspense 的协调（当多个异步组件嵌套时，等所有都 ready 才一起切换）。

## 深度拓展

### 追问1：Teleport 的内容能响应式更新吗？

可以。Teleport 只是改变了 DOM 的挂载位置，**组件的响应式系统完全不受影响**。Modal 里的 `v-model`、`v-if`、`watch` 等一切照常工作。

### 追问2：多个 Teleport 挂到同一个 to

后渲染的追加到目标容器末尾。如果同时渲染和销毁，DOM 操作是独立的。

### 追问3：Suspense 和路由懒加载结合

```ts
const routes = [
  {
    path: '/dashboard',
    component: () => import('./Dashboard.vue'),  // 异步组件
    meta: { suspense: true }
  }
]
```

配合 `<router-view v-slot="{ Component }">` 和 `<Suspense>` 可以实现路由级别的统一 loading 处理。

## 项目实战

```html
<!-- 1. Dialog/Drawer 必须用 Teleport 到 body -->
<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="visible" @click.self="close">
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<!-- 2. 通知消息、Tooltip、Dropdown 同理 -->
<Teleport to="#popup-root">
  <Notification :message="msg" />
</Teleport>

<!-- 3. 图表仪表盘 + Suspense loading -->
<Suspense>
  <template #default>
    <DashboardCharts />
  </template>
  <template #fallback>
    <el-skeleton :rows="10" animated />
  </template>
</Suspense>
```

```ts
// 4. 封装一个通用异步加载 hook
function useAsyncComponent(loader: () => Promise<any>) {
  const AsyncComp = defineAsyncComponent({
    loader,
    loadingComponent: h('div', 'Loading...'),
    errorComponent: h('div', 'Load failed'),
    delay: 200,        // loading 组件延迟 200ms 显示（避免闪烁）
    timeout: 10000,    // 10 秒超时
  })
  return AsyncComp
}
```

## 易错点

**❌ Teleport 改变了组件层级关系**
Teleport 只改变 DOM 位置，不改变组件层级。父组件的 provide/inject、事件冒泡（在 Vue 组件树层面）都不受影响。但**原生 DOM 事件冒泡**会沿 DOM 树向上（因为 DOM 真的在 body 下）。

**❌ 所有异步组件都要用 Suspense**
`defineAsyncComponent` 本身就有 `loadingComponent` 和 `errorComponent` 选项，大部分场景不需要 Suspense。Suspense 更适合**多个异步组件协同等待**的场景。

## 相关阅读

- [Composition API](./composition-api.md) — async setup 的写法
- [生命周期](./lifecycle.md) — Suspense 对生命周期执行时机的影响

## 更新记录

- 2026-07：完整填充（Phase 2），加入层叠上下文原理、Suspense 结合路由、易错点
