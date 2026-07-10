---
title: defineStore
description: Pinia 定义 Store 的两种方式：Setup Store 和 Options Store，命名规范与实例化时机
category: Pinia
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - defineStore
  - Setup Store
  - Options Store
  - Pinia
---

# defineStore

> defineStore 是 Pinia 的入口 API，一切状态管理都从这里开始。面试必问两种写法的区别和选择。

## 一句话总结

Pinia 通过 `defineStore` 定义 Store，支持 **Setup Store**（函数式，推荐）和 **Options Store**（配置式，类 Vuex）两种语法。Store 的 id 必须全局唯一，命名遵循 `useXxxStore` 规范，且必须在 `setup()` 中调用实例化。

## 核心机制

### 1. Setup Store 语法（推荐）

Setup Store 本质上就是一个 Vue Composition API 的 `setup` 函数，你可以使用 `ref`、`computed`、`watch`、`inject` 等所有 Composition API。

```ts
// stores/useCounterStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state: 用 ref/reactive 定义
  const count = ref(0)

  // getters: 用 computed
  const doubleCount = computed(() => count.value * 2)

  // actions: 用普通函数
  function increment() {
    count.value++
  }

  async function fetchCount() {
    const res = await fetch('/api/count')
    count.value = await res.json()
  }

  // 必须 return 需要暴露的内容
  return { count, doubleCount, increment, fetchCount }
})
```

**Setup Store 的优势**：可以使用 `watch` 监听状态变化、用 `inject` 注入依赖、用其他 Composition API 封装逻辑，灵活性远超 Options Store。

### 2. Options Store 语法

Options Store 的结构和 Vuex 非常相似，适合从 Vuex 迁移过来的开发者快速上手。

```ts
// stores/useCounterStore.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter' as string,
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    // this 指向 store 实例，可以访问其他 getter
    doubleCountPlusOne(): number {
      return this.doubleCount + 1
    },
  },
  actions: {
    increment() {
      this.count++
    },
    async fetchCount() {
      const res = await fetch('/api/count')
      this.count = await res.json()
    },
  },
})
```

### 3. 两种写法对比

| 维度 | Setup Store | Options Store |
|------|------------|---------------|
| 语法风格 | Composition API（函数式） | 配置对象（类 Vuex） |
| state 定义 | `ref()` / `reactive()` | `state: () => ({ ... })` |
| getters 定义 | `computed()` | `getters: { fn(state) {} }` |
| actions 定义 | 普通函数 / async 函数 | `actions: { fn() {} }` |
| 使用 Composition API | 可以（watch/inject 等） | 不可以 |
| `$reset()` | 需要手动实现 | 开箱即用 |
| TypeScript | 类型推导更自然 | 需要额外类型标注 |
| 适合场景 | 新项目、复杂逻辑 | Vuex 迁移、简单 store |

**核心结论**：Setup Store 是官方推荐的方向。它让你在 store 内自由组合 Composition API，不需要学习新的概念 -- 会用 Vue3 就会写 Setup Store。

### 4. Store 命名规范

```ts
// ✅ 正确：useXxxStore 驼峰命名
export const useUserStore = defineStore('user', () => { ... })
export const usePermissionStore = defineStore('permission', () => { ... })
export const useAppStore = defineStore('app', () => { ... })

// ❌ 错误
export const userStore = defineStore('user', () => { ... })        // 没有 use 前缀
export const useUser = defineStore('user', () => { ... })          // 没有 Store 后缀
export const use_user_store = defineStore('user', () => { ... })   // 不是驼峰
```

**Store id 必须全局唯一**，建议和文件名保持一致。如果多个模块有同名 store，使用 `模块名/storeId` 的格式，如 `'admin/user'`。

### 5. Store 实例化时机

```ts
// ❌ 错误：在纯 JS 函数中调用（不在 setup 内）
function doSomething() {
  const store = useCounterStore()  // 可能报错：getActivePinia() 找不到 pinia 实例
}

// ✅ 正确：在组件的 setup() 中调用
<script setup lang="ts">
import { useCounterStore } from '@/stores/useCounterStore'
const counterStore = useCounterStore()
</script>

// ✅ 正确：在 action 内部访问其他 store
export const useOrderStore = defineStore('order', () => {
  const userStore = useUserStore()  // action/ggetter 内部可以

  async function submitOrder() {
    console.log(userStore.token)     // 正常访问
  }
  return { submitOrder }
})
```

为什么必须在 setup 中调用？`useXxxStore()` 内部需要获取当前 Vue 应用的 `pinia` 实例（通过 `inject`），只有在 setup 上下文中才能正确获得。

## 深度拓展

### 追问1：$reset() 在 Setup Store 中如何实现？

Options Store 的 `$reset()` 会调用 `state()` 函数重新获取初始状态并替换。Setup Store 没有 `state()` 函数，需要手动实现：

```ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Counter')

  function $reset() {
    count.value = 0
    name.value = 'Counter'
  }

  return { count, name, $reset }
})
```

或者使用 `$dispose()` + 重新初始化，但不如手动实现简洁。

### 追问2：Setup Store 如何实现类似 Options Store 中 getter 的 this 访问？

Setup Store 中不需要 `this`，因为你在同一个作用域内，变量和函数直接通过闭包访问：

```ts
export const useUserStore = defineStore('user', () => {
  const firstName = ref('San')
  const lastName = ref('Zhang')

  // 直接访问同作用域的变量（闭包），不需要 this
  const fullName = computed(() => `${firstName.value} ${lastName.value}`)

  return { firstName, lastName, fullName }
})
```

## 项目实战

在实际后台管理系统中，我们会按功能模块拆分 store：

```ts
// stores/usePermissionStore.ts -- 权限状态
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const permissions = ref<string[]>([])

  const hasPermission = computed(() => {
    return (code: string) => permissions.value.includes(code)
  })

  async function generateRoutes() {
    const res = await fetchUserPermissions()
    permissions.value = res.permissions
    routes.value = filterAsyncRoutes(res.menus)
  }

  return { routes, permissions, hasPermission, generateRoutes }
})

// stores/useAppStore.ts -- 全局应用状态
export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const locale = ref('zh-CN')
  const theme = ref<'light' | 'dark'>('light')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, locale, theme, toggleSidebar }
})
```

## 易错点

**在 setup 外调用 store 导致报错**

```ts
// ❌ 在 router 的 beforeEach 中直接调用
router.beforeEach((to) => {
  const userStore = useUserStore()  // 可能找不到 pinia 实例
})

// ✅ 在 setup 中调用后传入
// 或者在 Pinia 初始化后的回调中使用（确保 app.use(pinia) 已执行）
```

**忘记 return 需要暴露的内容**

Setup Store 中未 return 的变量/函数不可被外部访问。如果某个状态只在 store 内部使用（如中间变量），可以不 return，天然实现了"私有"。

## 面试信号

- 能清晰对比 Setup Store 和 Options Store 的 5 个以上差异维度
- 能解释为什么 Setup Store 更灵活（watch、inject、Composition API 生态）
- 能说明 store 为什么必须在 setup 中调用（依赖 inject 获取 pinia 实例）
- 能给出实际项目中 store 的组织方式（按功能模块拆分）

## 相关阅读

- [state](./state.md) -- defineStore 内部 state 的详细用法
- [getters](./getters.md) -- getter 的传参和跨 store 访问
- [actions](./actions.md) -- action 的异步处理和订阅机制
- [响应式原理](../Vue3/reactivity.md) -- state 底层依赖 reactive/ref

## 更新记录

- 2026-07-06：初始创建
