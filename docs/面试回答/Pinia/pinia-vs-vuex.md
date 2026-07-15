---
title: Pinia vs Vuex 面试回答
description: 面试中如何回答 Pinia 和 Vuex 的区别——设计理念、setup store、TypeScript 支持
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - Pinia
  - Vuex
  - 面试回答
---

# Pinia vs Vuex 面试回答

> 状态管理对比题。面试官要的不是背差异表，而是"为什么 Pinia 能替代 Vuex"和"你项目里 Pinia setup store 怎么写"。

## Q1: Pinia 和 Vuex 有什么区别？

### 30 秒版本

"四个维度——API 设计（Pinia 无 mutations，actions 直接改 state）、模块化（Pinia 多个独立 store 代替 Vuex 的 modules 嵌套）、TypeScript（Pinia 原生类型推导，Vuex 需额外适配）、体积（Pinia ~1KB vs Vuex ~10KB）。核心差异：Pinia 是 Composition API 时代的状态管理，Vuex 是 Options API 时代的。"

### 2 分钟版本

| 对比维度 | Vuex | Pinia |
|---------|------|-------|
| mutations | 必须通过 mutation 改 state | 无 mutations——actions 直接改 |
| 模块化 | modules 嵌套——命名空间 | 多个独立 store——扁平引入 |
| TS 支持 | 需要额外类型声明 | defineStore 自动推导所有类型 |
| 体积 | ~10KB | ~1KB |
| devtools | 支持 | 支持 |

**为什么 Pinia 去掉了 mutations？** Vuex 的 mutations 是为了 devtools 追踪状态变更。Pinia 直接用 actions + devtools 追踪——无需中间层。去掉 mutations 后代码量少了三分之一——不再需要 `commit('SET_USER')` 这种模板代码。

**Pinia setup store 写法**：

```javascript
// Options Store
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (state) => state.count * 2 },
  actions: { increment() { this.count++ } },
})

// Setup Store（推荐）
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
})
// 类型自动推导——不需要任何手动标注
```

**为什么推荐 setup store**：和 Composition API 写法统一、composables 可以直接复用、类型推导零手动标注。缺点是不能用 `$reset` 和 `$patch`——但 `$patch` 本来就不推荐（破坏可变点单一原则）。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Vue2 项目能用 Pinia 吗" | 能——Pinia 同时支持 Vue2 和 Vue3。Vue2 需要用 @vue/composition-api 插件 |
| "Pinia 怎么持久化" | pinia-plugin-persistedstate——一行配置自动存到 localStorage/sessionStorage。刷新不丢——不需要手动写序列化逻辑 |
| "多个 store 之间怎么通信" | 直接在 store 的 action 里 `import` 另一个 store 并调用——扁平化的好处，不需要 modules 嵌套的命名空间 |

## 别踩的坑

1. **解构 store 丢响应式** —— `const { count } = useCounterStore()` 后 count 不再响应式。用 `storeToRefs(store)` 解构保持响应性。
2. **setup store 不能用 $reset** —— Vuex 的 `$reset` 是 options store 特有的。setup store 手动写 reset 方法。
3. **在 setup 外使用 store** —— `useXxxStore()` 必须在 setup 或 action 内部使用——依赖 Pinia 的 active pinia 实例。在 router.beforeEach 里可以用——Pinia 自动注入。

## 相关阅读

- [路由守卫 / 动态路由](../VueRouter/route-guards.md)
- [Vue3 响应式原理](../Vue3/reactivity.md)

## 更新记录

- 2026-07-15：新建（四大对比 + mutations 取消原因 + setup store vs options store + 三个坑）
