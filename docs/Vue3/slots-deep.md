---
title: 插槽深入
description: Vue3 插槽的完整体系：默认/具名/作用域插槽、v-slot 语法、动态插槽名、slot 与 render 函数、与 React children 的对比
category: Vue3
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - 插槽
  - slot
  - v-slot
  - 作用域插槽
  - 动态插槽
---

# 插槽深入

> 面试中 slot 常被低估——大多数人只会说"默认插槽和具名插槽"，但作用域插槽的数据流和 render 函数中的插槽才是区分"用过"和"理解透了"的分水岭。

## 一句话总结

**插槽（Slot）是父组件给子组件传递"模板内容"的机制——不仅仅是数据，而是一段 DOM + 逻辑的组合。默认/具名/作用域三种插槽解决不同的内容分发场景，底层编译为 render 函数的 slot 对象。**

---

## 核心机制

### 1. 三种插槽对照

| 类型 | 语法 | 数据方向 | 场景 |
|------|------|---------|------|
| 默认插槽 | `<slot />` | 无 | 最基础的内容分发 |
| 具名插槽 | `<slot name="header" />` | 无 | 多个分发出口——类似门户 |
| 作用域插槽 | `<slot :data="item" />` | **子→父** | 子组件暴露数据给父组件渲染 |

### 2. 作用域插槽——子传父的数据反转

这是最容易混淆的一点——**作用域插槽的数据流是从子组件流向父组件**：

```vue
<!-- 子组件 -->
<slot :item="item" :index="index" />

<!-- 父组件 -->
<template v-slot:default="{ item, index }">
  <div>{{ index }} - {{ item.name }}</div>
</template>
```

子组件暴露数据，父组件决定怎么渲染——这是一个"控制反转"模式。和 React render props 是同一个思想。

### 3. v-slot 语法

```vue
<!-- 具名插槽缩写 -->
<template v-slot:header> → <template #header>

<!-- 作用域插槽 -->
<template v-slot:default="slotProps"> → <template #default="slotProps">

<!-- 解构 -->
<template #default="{ item, index = 0 }">

<!-- 动态插槽名 (Vue 2.6+ 即支持，随动态指令参数引入) -->
<template #[dynamicSlotName]>
```

**注意**：`v-slot` 只能用在 `<template>` 或组件上——不能用在原生 HTML 元素上。和 `v-bind`/`v-on` 规则一样。

### 4. render 函数中的插槽

```javascript
// 子组件 render
export default {
  setup(props, { slots }) {
    // slots.default() — 默认插槽内容
    // slots.header() — 具名插槽内容
    // slots.header({ data: 'scope' }) — 传作用域数据
    return () => h('div', [
      slots.default?.(),
      slots.header?.({ title: 'Hello' })
    ])
  }
}
```

`slots` 对象是**惰性的**——只有真正调用 `slots.default()` 时才会渲染。这是插槽性能优于每次都传入新函数的 React render props 的原因。

## 深度拓展

### 插槽和 props 传 JSX/函数 的区别

React 中"插槽"通过 props 传 JSX 或 render 函数实现。Vue 的 slot 比 React render props 有两个优势：
1. **插槽内容在父组件作用域编译**——能直接访问父组件数据，不用传回调
2. **插槽是惰性的**——只在子组件调用 `slots.default()` 时才渲染，不会在父组件 re-render 时重复执行

### 编译后的 slot 长什么样

```vue
<!-- 模板 -->
<Child><span>{{ msg }}</span></Child>

<!-- 编译为 -->
h(Child, null, {
  default: () => [h('span', ctx.msg)]
})
```

插槽编译为**函数**——`() => [vnode]`。当子组件调用 `slots.default()` 时执行函数→生成 vnode→patch 到 slot 出口。函数形式保证了**每次调用都拿最新的父组件数据**。

## 易错点

1. **作用域插槽数据不是"双向"的** —— 数据从子到父、模板从父到子。本质是子暴露数据、父决定渲染——不是双向绑定
2. **`v-slot` 不能用在原生元素上** —— 只能用在 `<template>` 或组件标签上
3. **插槽默认内容处于子组件作用域** —— `<slot>默认内容</slot>` 的 fallback 写在子组件模板里，只能访问子组件自己的数据（可以是响应式的），无法访问父组件数据；且仅在父组件未提供该插槽内容时渲染

## 相关阅读

- [组件通信](./component-communication.md) — props/emits/provide/inject 与 slot 的协作
- [Composition API](./composition-api.md) — setup 中访问 slots
- [Diff / Patch](./diff-patch.md) — slot 内容更新时的 Diff 流程

## 更新记录

- 2026-07-11：新建（三种插槽 + 作用域插槽数据流 + render 函数 slot + 编译原理）
