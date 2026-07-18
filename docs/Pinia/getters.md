---
title: getters
description: Pinia getters 的 computed 封装、传参模式、this 指向与跨 store 访问
category: Pinia
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - getters
  - computed
  - Pinia
  - 权限
---

# getters

> getters 是 store 的"计算属性"，封装派生状态。面试中最常见的追问是：getter 如何传参？如何在 getter 中访问其他 store？

## 一句话总结

Pinia 的 getters 本质就是 Vue 的 `computed`：Options Store 中用 `getters` 配置项定义，Setup Store 中直接用 `computed()`。getter 的 `this` 指向 store 实例，传参通过"返回函数的 getter"模式实现，访问其他 store 只需在 getter 内调用 `useOtherStore()`。

## 核心机制

### 1. Options Store 的 getters

```ts
export const useProductStore = defineStore('product', {
  state: () => ({
    items: [] as Product[],
    filterKeyword: '',
  }),
  getters: {
    // 基础用法：接收 state 参数
    totalCount: (state) => state.items.length,

    // 使用 this 访问其他 getter（必须用 function 声明，不能用箭头函数）
    filteredList(): Product[] {
      return this.items.filter((item) =>
        item.name.includes(this.filterKeyword)
      )
    },

    // this 也可以访问 state
    hasItems(): boolean {
      return this.totalCount > 0
    },

    // 返回函数的 getter：给 getter 传参数
    getById: (state) => {
      return (id: number): Product | undefined =>
        state.items.find((item) => item.id === id)
    },
  },
})
```

**注意事项**：当 getter 中需要使用 `this` 访问其他 getter 或 state 时，必须用 `function` 声明，不能使用箭头函数。箭头函数的 `this` 不会指向 store 实例。

TypeScript 类型标注：

```ts
getters: {
  // 返回值类型标注
  totalCount(state): number {
    return state.items.length
  },
  // 使用 this 的 getter 必须显式标注返回值类型（TS 推断限制）
  filteredList(): Product[] {
    return this.items.filter(item => item.name.includes(this.filterKeyword))
  },
}
```

### 2. Setup Store 的 getters

Setup Store 中直接用 `computed()`，写法完全等同于 Vue 组件内的 `computed`。

```ts
export const useProductStore = defineStore('product', () => {
  const items = ref<Product[]>([])
  const filterKeyword = ref('')

  // 基础 getter
  const totalCount = computed(() => items.value.length)

  // 依赖其他 getter
  const hasItems = computed(() => totalCount.value > 0)

  // 依赖其他 state
  const filteredList = computed(() =>
    items.value.filter((item) =>
      item.name.includes(filterKeyword.value)
    )
  )

  // 返回函数的 getter（传参）
  const getById = computed(() => {
    return (id: number): Product | undefined =>
      items.value.find((item) => item.id === id)
  })

  return { items, filterKeyword, totalCount, hasItems, filteredList, getById }
})
```

### 3. getter 传参数：返回函数的 getter 模式

```ts
// 定义：getter 返回一个函数
const getById = computed(() => {
  return (id: number) => items.value.find(item => item.id === id)
})

// 使用
const product = store.getById(42)
```

**原理**：`getById` 这个 computed 缓存的只是一个函数引用——computed 体内没有读取任何响应式数据（`items.value` 是在返回的函数被调用时才读取），所以它不会因 `items` 变化而重新求值，函数引用保持稳定。真正的依赖收集发生在**调用处**：模板里调用 `getById(42)` 时，渲染函数读取了 `items.value`，`items` 变化时组件照常重新渲染。注意：这种模式的 getter 不再具有缓存计算结果的能力（每次调用都重新查找），它只是让 getter 能接收参数。

**性能提示**：如果按 id 查询非常频繁，用 computed 预建一张索引 Map——computed 体内遍历 `items.value` 建立了依赖，items 变化时索引表自动重建，真正享受 computed 缓存且不会返回过期数据：

```ts
const productById = computed(() => {
  const map = new Map<number, Product>()
  for (const item of items.value) {
    map.set(item.id, item)
  }
  return map
})

// 使用：O(1) 查找
const product = productById.value.get(42)
```

反面写法是在返回的闭包里塞一个 Map 做缓存——computed 体内没有响应式依赖，永远不会重新求值，`items` 更新后缓存不失效，会一直返回过期数据。

### 4. 跨 store 访问 getter

```ts
// stores/useOrderStore.ts
export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])

  // 在 getter 中直接使用另一个 store
  const ordersWithUserName = computed(() => {
    // 直接在 computed 内部调用 useUserStore()
    const userStore = useUserStore()
    return orders.value.map(order => ({
      ...order,
      userName: userStore.getById(order.userId)?.name ?? 'Unknown',
    }))
  })

  return { orders, ordersWithUserName }
})
```

**重要规则**：在 getter/action 内部调用其他 store 是安全且推荐的。单向引用时，在 setup 函数顶层调用 `useOtherStore()` 也是官方支持的写法；但两个 store **互相引用**时，双方都在顶层调用会造成初始化循环依赖，必须把其中一方挪到 getter/action 内部延迟获取。

如果两个 store 互相引用，按以下方式处理：

```ts
// A、B 互相引用时：
const userStore = useUserStore()  // ❌ 双方都在顶层调用 -> 初始化循环依赖

const someGetter = computed(() => {
  const userStore = useUserStore()  // ✅ 懒加载：computed/action 内部调用，打破循环
  return userStore.someData
})
```

## 深度拓展

### 追问1：getter 的缓存机制

和 Vue 的 `computed` 完全一致：只有当 getter 依赖的响应式数据发生变化时，getter 才会重新计算。多次访问同一个 getter 只会计算一次（结果被缓存）。

```ts
const fullName = computed(() => {
  console.log('computing...') // 只会在 firstName/lastName 变化时打印
  return firstName.value + ' ' + lastName.value
})

// 连续访问 3 次
store.fullName  // 打印 "computing..."
store.fullName  // 不打印（命中缓存）
store.fullName  // 不打印（命中缓存）
```

### 追问2：getter 和 method 的区别

- getter 有缓存，method 每次调用都执行
- getter 不能传参（除了返回函数的模式），method 可以传参
- getter 通过 `storeToRefs` 可以解构成 ref，method 不行

## 项目实战

权限系统中最常见的 getter 用法：`hasPermission` 函数式 getter。

```ts
export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<string[]>([])

  // 返回函数的 getter：传入权限码，返回是否有权限
  const hasPermission = computed(() => {
    return (code: string): boolean => permissions.value.includes(code)
  })

  // 批量检查权限
  const hasAnyPermission = computed(() => {
    return (...codes: string[]): boolean =>
      codes.some(code => permissions.value.includes(code))
  })

  const hasAllPermissions = computed(() => {
    return (...codes: string[]): boolean =>
      codes.every(code => permissions.value.includes(code))
  })

  // 按模块分组权限
  const permissionsByModule = computed(() => {
    const map = new Map<string, string[]>()
    permissions.value.forEach(code => {
      const module = code.split(':')[0]  // 'admin:user:read' -> 'admin'
      if (!map.has(module)) map.set(module, [])
      map.get(module)!.push(code)
    })
    return map
  })

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions, permissionsByModule }
})
```

**组件中使用**：

```vue
<template>
  <!-- 配合 v-if 做权限控制 -->
  <el-button v-if="hasPermission('admin:user:delete')" type="danger">
    删除用户
  </el-button>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/usePermissionStore'

const permissionStore = usePermissionStore()
// getter 是 computed，解构要用 storeToRefs 保持响应式
const { hasPermission } = storeToRefs(permissionStore)
// hasPermission 是 Ref<(code: string) => boolean>：
// - 模板中自动解包，可直接写 hasPermission('admin:user:delete')
// - script 中调用需要 .value：hasPermission.value('admin:user:delete')
// 权限列表变化时，函数内部读取的 permissions 是响应式的，
// 模板里调用它的组件会随 permissions 变化重新渲染
</script>
```

## 易错点

**箭头函数中使用 this（Options Store）**

```ts
getters: {
  // ❌ 箭头函数：this 指向 undefined / window
  doubleCount: (state) => this.count * 2,  // this 不是 store

  // ✅ 使用 state 参数（箭头函数）
  doubleCount: (state) => state.count * 2,

  // ✅ 使用 function 声明
  doubleCount(): number {
    return this.count * 2  // this 指向 store 实例
  },
}
```

**在 Setup Store 的 computed 中忘记写 .value**

```ts
// ❌ 忘记 .value
const total = computed(() => items.length)  // items 是 Ref，需要 .value

// ✅ 正确
const total = computed(() => items.value.length)
```

## 面试信号

- 能说出 getter 传参的实现原理（返回函数的 computed）
- 能解释 Options Store 中 this 的指向规则（箭头函数 vs function 声明）
- 能说明跨 store 访问 getter 的方式和循环依赖的规避策略
- 能给出 getter 在权限系统中的实战用法（hasPermission 模式）

## 相关阅读

- [state](./state.md) -- getter 依赖 state 实现派生状态
- [defineStore](./defineStore.md) -- getter 在两种 Store 语法中的不同写法
- [computed / watch](../Vue3/computed-watch.md) -- getter 底层依赖 computed
- [权限系统 RBAC](../项目实战/权限系统/permission-rbac.md) -- hasPermission getter 的完整实战

## 更新记录

- 2026-07-18：事实审计：修正传参 getter 的缓存原理（依赖收集在调用处）、替换闭包 Map 缓存反例为索引 Map（原示例缓存永不失效）、修正组件示例的 storeToRefs 用法、澄清顶层跨 store 调用规则
- 2026-07-06：初始创建
