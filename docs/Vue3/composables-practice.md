---
title: Composables 实战模式
description: Vue3 Composable 的设计原则、常见模式（useFetch/useStorage/useEventListener/useDebounce）与高级技巧（effectScope、懒加载 composable）
category: Vue3
type: pattern
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - composable
  - Composition API
  - 逻辑复用
  - useFetch
  - effectScope
---

# Composables 实战模式

> Composables 不只是"提出去的函数"——面试中如果只说"把逻辑提取到 useXxx 函数里"，深度不够。这里讲 composable 的设计原则、常见模式和 effectScope 的高级用法。

## 一句话总结

**Composable 是以 use 开头、返回响应式数据 + 方法的组合函数。设计原则：单一职责、显式输入参数、无副作用遗留（onUnmounted 清理）。底层依赖 Vue 的 effectScope 实现自动清理。常见模式：useFetch、useStorage、useEventListener、useDebounce。**

---

## 核心原则

### Composable 六条军规

1. **命名以 `use` 开头** — 不仅是约定——Vue 官方 eslint 插件强制，IDE 也能识别 composable
2. **参数明确、返回清晰** — 不要依赖"魔法变量"（如全局 store），输入全通过参数
3. **单一职责** — 一个 composable 只做一件事。`useSearch` 只管搜索逻辑——不需要管路由跳转
4. **副作用可清理** — 定时器、事件监听、WebSocket 在 onUnmounted 中自动清理——composable 对调用者透明
5. **返回值是 ref/reactive** — 保证调用方能响应式使用
6. **在 setup 顶层同步调用** — composable 不能在条件分支或异步回调中调用——生命周期钩子需要在 setup 同步执行阶段注册

### 和 React Hook 的关键区别

Vue composable 不需要 `useCallback`/`useMemo`/依赖数组。因为 Vue 的响应式系统精确追踪依赖——当数据变化时，只有用到了这个数据的组件才重新渲染，不会"整个组件树重新执行"。

---

## 常见模式

### useFetch — 通用请求封装

```javascript
export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    try {
      const res = await fetch(url)
      data.value = await res.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  execute()
  return { data, error, loading, execute }
}
// 使用：const { data, loading } = useFetch('/api/users')
```

### useStorage — localStorage 响应式封装

```javascript
export function useStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const data = ref(stored ? JSON.parse(stored) : defaultValue)

  watch(data, (val) => {
    localStorage.setItem(key, JSON.stringify(val))
  }, { deep: true })

  return data
}
// 使用：const theme = useStorage('theme', 'light')
// 修改 theme.value → 自动同步 localStorage
```

### useEventListener — 自动清理的事件监听

```javascript
export function useEventListener(target, event, handler) {
  onMounted(() => target.addEventListener(event, handler))
  onUnmounted(() => target.removeEventListener(event, handler))
}
// 调用者不需要关心清理——composable 内部处理
// 使用：useEventListener(window, 'resize', onResize)
```

### useDebounce — 结合 composable 的防抖 ref

```javascript
export function useDebounce(value, delay = 300) {
  const debounced = ref(value)
  let timer = null

  watch(value, (val) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = val }, delay)
  })

  onUnmounted(() => clearTimeout(timer))
  return debounced
}
```

---

## 高级技巧

### effectScope — composable 的底层支撑

每个组件实例都有一个 effectScope——组件的所有 effect（响应式追踪）都在这个 scope 中。组件卸载时，scope 自动停止所有 effect——这就是为什么 composable 中的 watch/watchEffect/事件监听会自动清理。

```javascript
import { effectScope, onScopeDispose } from 'vue'

// 手动创建 scope——不绑定组件实例
const scope = effectScope()
scope.run(() => {
  const data = ref(0)
  watch(data, () => console.log(data.value))
  onScopeDispose(() => console.log('cleanup'))
})
scope.stop() // 手动停止——触发所有 cleanup
```

**场景**：需要创建一个"可手动控制生命周期"的响应式作用域——如插件系统、动态注册的 composable。

### 懒加载 composable

不是所有 composable 都必须在 setup 顶层调用。如果 composable 只在某个操作后才需要——可以延迟初始化：

```javascript
const { data } = useLazyComposable(() => {
  // 只在 clicked 为 true 时初始化 effect
  if (clicked.value) {
    return useFetch('/api/data')
  }
})
```

---

## 易错点

1. **composable 内注册的生命周期只在组件中有效** —— composable 脱离组件调用时（如单元测试中），onMounted 不会触发
2. **composable 返回值解构时需注意响应式** —— `const { data } = useFetch()`——data 是 ref，模板自动解包，JS 中需 `.value`
3. **不要在 composable 中修改 props** —— composable 应该"消费"数据而非"修改"来源。修改操作通过返回函数暴露给调用者

## 相关阅读

- [Composition API 知识文档](./composition-api.md) — 组合式 API 的设计动机和基础用法
- [Composition API 面试回答](../面试回答/Vue3/composition-api.md) — composable vs mixin 的面试回答
- [响应式原理](./reactivity.md) — effect/track/trigger 是 composable 的底层支撑

## 更新记录

- 2026-07-11：新建（设计原则 + 4 种常见模式 + effectScope + 易错点）
