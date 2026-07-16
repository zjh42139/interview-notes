---
title: Composition API 面试回答
description: 面试中如何回答 Composition API——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - Composition API
  - Options API
  - setup
  - composable
  - mixin
  - 面试回答
---

# Composition API 面试回答

## Q1: Composition API 解决了什么问题？和 Options API 的区别？

### 30 秒版本

"Composition API 按功能组织代码——同一个功能的数据/计算/方法写在一起。Options API 按选项类型分散——data/methods/watch 分开，功能大了之后逻辑碎片化。Composition 还解决了 mixin 的命名冲突和来源不清晰问题——composable 函数显式 import，逻辑来源一目了然。"

### 2 分钟版本

"先说核心动机：Options API 的问题是逻辑分散。一个搜索功能可能横跨 data（搜索词、结果）、computed（过滤后的结果）、watch（搜索词变化防抖）、methods（请求方法）——这些散落在不同选项块中。当组件超过 300 行，维护起来像在几个箱子之间来回翻。

Composition API 用 setup——把同一个功能的代码写在一个代码块里。更关键的是可以提取为 composable 函数——`useSearch()`、`useAuth()`——在组件间复用逻辑。

**和 mixin 的对比**：mixin 的问题——1) 命名冲突：两个 mixin 有相同的 data 名，后面覆盖前面，没任何警告。2) 来源不清晰：模板里用了一个变量，你不知道它是从哪个 mixin 来的。3) 隐式依赖：mixin A 假定宿主组件有某个 data，崩了都不知道为什么。Composition API 全部显式 import——变量从哪来、依赖了谁，代码里清清楚楚。

**TypeScript 配合**：Options API 的类型推导靠 Vue.extend 或 defineComponent 的黑魔法。Composition API 里 ref/reactive 是纯 JavaScript 值——TypeScript 自然推导，不需要额外类型声明。

**可以混用**：同一个项目可以 Options + Composition 共存。但同一个功能不要分散在两种写法中——要么全放 setup，要么全放 Options。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "小型组件需要用 Composition API 吗" | 不需要为用而用——50 行以内的小组件 Options API 完全够。Composition 的优势在复杂组件和逻辑复用场景中显现 |
| "setup 比 Options API 快吗" | 运行时性能几乎无差异——Composition 编译为 setup 函数，Options 也编译为 setup 函数，最终都一样。差异在开发效率和 TS 类型支持 |
| "script setup 和 setup() 函数有什么区别" | script setup 是语法糖——顶层变量自动暴露、defineProps/defineEmits 编译宏自动生成。底层等价于 setup() |

## Q2: composable 的设计原则是什么？

### 30 秒版本

"composable 就是返回响应式数据+方法的函数——类似 React hook。命名以 use 开头、输入参数明确、返回 ref/reactive。原则：单一职责（一个 composable 只做一件事）、可组合（多个 composable 可以互相调用）、无副作用遗留（onUnmounted 里清理）。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "composable 和 React hook 的区别" | Vue composable 不需要依赖顺序、不需要 useCallback/useMemo（响应式自动精确追踪依赖）、不会重复执行 |
| "composable 里能用生命周期钩子吗" | 可以——onMounted/onUnmounted 等可以在 composable 中调用。它们自动绑定到当前组件实例 |
| "怎么测试 composable" | 用 `@vue/test-utils` 或 vitest 配合 `createApp` 在测试组件中调用 composable |

## Q3: `<script setup>` 和普通 `<script>` 的区别？

### 30 秒版本

"script setup 是编译时语法糖——顶层绑定自动暴露给模板、defineProps/defineEmits 是编译宏无需 import、defineExpose 显式声明对外暴露属性。更少样板代码、更好的 IDE 支持。编译为 setup 函数，运行时开销为零。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "script setup 中怎么访问 $refs、$el" | 用 template ref——`const el = ref(null)`，模板中 `<div ref="el">`。$attrs 用 useAttrs()，$slots 用 useSlots() |
| "defineProps 和普通 props 有什么区别" | defineProps 是编译宏——不需要 import，编译时直接替换为 props 定义。运行时也是普通 props |

## 别踩的坑

1. **"setup 里可以用 this"** —— 不能。setup 在组件实例创建前执行，this 是 undefined
2. **composable 里注册生命周期但不调用** —— 如果 composable 只在条件分支里调用——生命周期钩子不会自动注册。composable 必须在 setup 顶层同步调用
3. **"Composition API 能替代 Vuex/Pinia"** —— 不能完全替代。composable + provide/inject 可以替代简单的全局共享，但缺少 DevTools 支持、状态追踪和持久化等特性

## 相关阅读

- [Composition API 知识文档](../../Vue3/composition-api.md)
- [响应式原理 面试回答](./reactivity.md)
- [生命周期 面试回答](./lifecycle.md)
- [Pinia vs Vuex](../../Pinia/vs-vuex.md)

## 更新记录

- 2026-07-11：新建（30秒/2分钟/追问预判/易错点 标准格式）
