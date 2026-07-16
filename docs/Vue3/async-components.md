---
title: "异步组件 / 自定义指令"
description: Vue3 defineAsyncComponent 异步组件加载、Suspense 配合、自定义指令 7 个钩子与权限指令实战
category: Vue3
type: mechanism
score: 78
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 异步组件
  - defineAsyncComponent
  - 自定义指令
  - v-permission
---

# 异步组件 / 自定义指令

> ⭐⭐⭐⭐｜难度：中级｜首屏优化和权限控制的核心手段

## 一句话总结

**`defineAsyncComponent` 让组件异步加载——配合 Suspense 自动处理加载/错误状态。自定义指令在 DOM 元素上挂载可复用的行为——7 个生命周期钩子，v-permission 是最常见的权限指令实战。**

## 异步组件

### 基础用法

```javascript
import { defineAsyncComponent } from 'vue';

// 简单用法
const AsyncModal = defineAsyncComponent(() => import('./Modal.vue'));

// 完整配置
const AsyncChart = defineAsyncComponent({
  loader: () => import('./Chart.vue'),
  loadingComponent: LoadingSpinner,     // 加载中显示
  errorComponent: ErrorDisplay,         // 加载失败显示
  delay: 200,                           // 200ms 后才显示 loading
  timeout: 10000,                       // 10s 超时报错
});
```

### 与 Suspense 配合

```vue
<template>
  <Suspense>
    <AsyncDashboard />
    <template #fallback>
      <SkeletonScreen />  <!-- Dashboard 加载时显示骨架屏 -->
    </template>
  </Suspense>
</template>
```

Suspense 等待异步 setup 完成——组件顶层有 await 时自动触发。

### 什么时候用异步组件

| 场景 | 方式 |
|------|------|
| 路由懒加载 | `component: () => import(...)` — 最常用 |
| 条件渲染的大组件 | `defineAsyncComponent` — 弹窗、图表等 |
| 非首屏重量级组件 | 富文本编辑器、代码编辑器、可视化图表 |

## 自定义指令

### 7 个生命周期钩子

```javascript
// 全局注册 v-permission 权限指令
app.directive('permission', {
  // 元素挂载到 DOM
  mounted(el, binding) {
    const { value } = binding; // 传入的权限码
    if (!hasPermission(value)) {
      el.parentNode?.removeChild(el); // 无权限——移除 DOM
    }
  },
  // 权限值变化时（如角色切换）
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      // 重新判断权限
    }
  },
});

// 使用
<button v-permission="'user:delete'">删除</button>
```

指令的 7 个钩子与组件生命周期对应：`created → beforeMount → mounted → beforeUpdate → updated → beforeUnmount → unmounted`。

### 局部注册（Composition API）

```vue
<script setup>
// 在 <script setup> 中，v 开头的变量自动注册为指令
const vFocus = {
  mounted: (el) => el.focus(),
};
</script>
<template>
  <input v-focus />
</template>
```

## 易错点

❌ **异步组件和路由懒加载混淆** —— 路由懒加载是异步组件的一种用法——但 `defineAsyncComponent` 提供更丰富的加载/错误状态控制。

❌ **指令的 updated 钩子不常用** —— 大部分指令只需要 mounted 和 unmounted。不合适的 updated 可能导致每次数据变化都触发——性能浪费。

❌ **v-permission 移除 DOM 有闪烁** —— 指令执行前 DOM 已渲染。更好的方案是在路由守卫层面拦截——页面不可见比按钮不可见更安全。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "大组件怎么懒加载" | 追问 defineAsyncComponent + loading/error 状态 |
| "自定义指令怎么用" | 追问 v-permission 权限指令实战 |
| "Suspense 是什么" | 追问异步 setup 配合——"和 React.Suspense 类比" |

## 相关阅读

- [条件渲染 / 列表渲染](./template-syntax.md)
- [路由守卫 / 动态路由](../VueRouter/route-guards.md)
- [组件通信](./component-communication.md)

## 更新记录

- 2026-07-16：新建——异步组件+defineAsyncComponent+Suspense+自定义指令+v-permission
