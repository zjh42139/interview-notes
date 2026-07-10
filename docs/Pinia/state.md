---
title: state
description: Pinia state 的响应式定义、storeToRefs 解构、$patch 批量更新与 $subscribe 订阅
category: Pinia
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - state
  - storeToRefs
  - $patch
  - $subscribe
  - $reset
  - Pinia
---

# state

> state 是 Pinia store 的核心数据载体。storeToRefs 和直接解构的区别是面试最高频考点，没有之一。

## 一句话总结

Pinia 的 state 底层就是 `reactive()`，通过 `ref`/`reactive` 定义响应式数据。解构时必须用 `storeToRefs()` 保持响应式（只解构 state 和 getters，不含 actions）。`$patch` 支持对象和函数两种批量更新方式，`$subscribe` 可以监听 state 的每一次变化。

## 核心机制

### 1. 用 ref / reactive 定义响应式状态

```ts
// Setup Store: 直接用 ref / reactive
export const useUserStore = defineStore('user', () => {
  // 基本类型用 ref
  const token = ref<string>('')
  const userId = ref<number | null>(null)

  // 对象用 ref 或 reactive
  const profile = ref<UserProfile>({ name: '', email: '' })
  // 或
  const profile2 = reactive<UserProfile>({ name: '', email: '' })

  // 数组
  const permissions = ref<string[]>([])

  return { token, userId, profile, permissions }
})
```

**ref vs reactive 在 state 中的选择**：ref 更推荐，因为 ref 可以整体替换 `.value = newData`，而 reactive 整体替换会断开响应式连接。ref 的 `.value` 在 template 中自动解包，代码更一致。

### 2. storeToRefs：解构保持响应式（高频考点）

```ts
// ❌ 直接解构：丢失响应式
const { count, doubleCount } = useCounterStore()
// count 现在是普通数值，不再是响应式引用
// doubleCount 同理

// ✅ storeToRefs：保持响应式
import { storeToRefs } from 'pinia'
const { count, doubleCount } = storeToRefs(useCounterStore())
// count 是 Ref<number>，修改会触发视图更新
// doubleCount 也是 Ref<number>（computed 自动转 ref）
```

**storeToRefs 只解构 state 和 getters，不解构 actions**。这是刻意设计：actions 不需要响应式包装，直接用 `store.actionName()` 调用即可。

```ts
const store = useCounterStore()

// storeToRefs 返回的是 ToRefs，只包含 state 和 getters
const { count, doubleCount } = storeToRefs(store)
// increment 不在其中！actions 直接通过 store 调用
store.increment()
```

为什么这样设计？`storeToRefs` 的名字就已经暗示 -- 它是 `toRefs`，只把需要响应式追踪的属性转成 ref。action 是函数，不需要也不应该被转成 ref。

### 3. $patch：批量更新

`$patch` 是 Pinia 提供的批量更新方法，一次修改多个 state 属性，只触发一次响应式更新。

```ts
const store = useUserStore()

// 方式一：对象形式（适合简单批量赋值）
store.$patch({
  token: 'new-token-xxx',
  userId: 42,
  profile: { name: 'Zhang San', email: 'zhang@example.com' },
})

// 方式二：函数形式（适合复杂逻辑，能访问当前 state）
store.$patch((state) => {
  // state 是 store 的 $state，可直接修改
  state.permissions.push('admin:read')
  state.permissions.push('admin:write')
  // 可以写 if/else 等复杂逻辑
  if (state.profile.name === '') {
    state.profile.name = 'Unknown'
  }
})
```

**对象形式 vs 函数形式**：对象形式是一次性覆盖，适合简单的赋值场景；函数形式在 patch 函数内能做任意复杂操作，且可以访问当前的 state 值，适合数组 push/splice 等操作。

### 4. $state：替换整个 state

```ts
// 直接替换整个 state 对象
store.$state = {
  token: 'new-token',
  userId: 99,
  profile: { name: 'Li Si', email: 'li@example.com' },
  permissions: ['read'],
}

// 场景：从服务端获取完整的最新状态后直接替换
const data = await fetchUserFullState()
store.$state = data
```

注意：`$state` 替换时必须提供完整的 state 对象，不符合的类型会报错（TypeScript 类型检查）。

### 5. $subscribe：监听 state 变化

```ts
// 类似 watch，监听 store 的 state 变化
const unsubscribe = store.$subscribe((mutation, state) => {
  // mutation.type: 'direct'（直接修改）| 'patch object'（$patch 对象）| 'patch function'（$patch 函数）
  console.log('变更类型:', mutation.type)
  console.log('变更的目标 store id:', mutation.storeId)
  console.log('变更后的 state:', state)

  // 场景1：敏感操作日志
  if (mutation.storeId === 'user') {
    logToServer(`用户状态变更: ${mutation.type}`)
  }
})

// 场景2：同步到 localStorage（简单持久化方案）
store.$subscribe((_mutation, state) => {
  localStorage.setItem('app-state', JSON.stringify(state))
})

// component unmount 时需要取消订阅
// onUnmounted(() => { unsubscribe() })

// 第二个参数：{ detached: true } 表示组件卸载后依然监听
store.$subscribe(callback, { detached: true })
```

**$subscribe 和 watch 的区别**：

| 特性 | $subscribe | watch |
|------|-----------|-------|
| 监听粒度 | 整个 store 的所有 state 变化 | 指定属性 |
| 获取变更信息 | mutation.type / storeId | 无 |
| detached 选项 | 支持（组件卸载后继续监听） | 无 |
| 使用场景 | 日志、持久化、同步 | 特定字段变化后的副作用 |

### 6. $reset：重置到初始状态

```ts
// Options Store 开箱即用
const counterStore = useCounterStore()
counterStore.count = 100
counterStore.$reset()  // count 回到初始值 0

// Setup Store 需要手动实现
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function $reset() {
    count.value = 0
  }

  return { count, $reset }
})
```

## 深度拓展

### 追问1：storeToRefs 内部实现原理

```ts
// 简化版 storeToRefs 实现
function storeToRefs(store) {
  // Pinia store 本身就是 reactive 对象
  const result = {}
  for (const key in store) {
    const value = store[key]
    // 只把 state 和 getters（ref/computed）转出来
    // actions（函数）跳过
    if (isRef(value) || isReactive(value)) {
      result[key] = toRef(store, key)
    }
  }
  return result
}
```

关键点：遍历 store 的所有属性，判断哪些是 ref/computed/reactive，对它们调用 `toRef` 保持和原 store 的响应式连接。actions 是函数，被跳过。

### 追问2：$patch 为什么比逐个赋值好？

假设你需要修改 3 个字段，逐个赋值会触发 3 次订阅回调（如果有多个订阅者，浪费性能）。`$patch` 内部将多次修改合并为一次 mutation，只触发一次订阅通知。

## 项目实战

```ts
// 后台管理系统的用户 store -- 涵盖 state 的完整用法
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo>({ id: 0, name: '', role: '' })
  const permissions = ref<string[]>([])

  // 登录后批量更新
  async function login(username: string, password: string) {
    const res = await api.login({ username, password })
    // 批量更新 3 个字段，只触发一次响应式
    token.value = res.token
    userInfo.value = res.userInfo
    permissions.value = res.permissions
    // 或使用 $patch
  }

  // 退出登录：重置所有状态
  function logout() {
    token.value = ''
    userInfo.value = { id: 0, name: '', role: '' }
    permissions.value = []
  }

  return { token, userInfo, permissions, login, logout }
})

// 组件中使用
const userStore = useUserStore()
const { token, userInfo } = storeToRefs(userStore)
// actions 直接从 store 调用
userStore.login('admin', '123456')
```

## 易错点

**直接解构 store 导致丢失响应式**

```ts
const store = useCounterStore()
const { count } = store          // ❌ count 是普通 number，不再响应式
const { count } = storeToRefs(store)  // ✅ count 是 Ref<number>
```

**给 ref 赋值用了 ref 而非 .value**

```ts
// state 中的 ref 在 js/ts 代码中必须 .value
const count = ref(0)
count = 1        // ❌ 错误，这会让 count 变成普通变量
count.value = 1  // ✅ 正确
```

**把 action 也解构了**

```ts
const { increment } = storeToRefs(store)  // ❌ increment 不在 storeToRefs 返回中
// 正确做法：直接从 store 调用
store.increment()
```

## 面试信号

- 能说出 storeToRefs 只解构 state 和 getters，不解构 actions，以及为什么
- 能解释 $patch 对象形式和函数形式的区别和使用场景
- 能说明 $subscribe 和 watch 的差异（粒度、mutation 信息、detached 选项）
- 能解释 ref 和 reactive 在 state 中的选择原则

## 相关阅读

- [defineStore](./defineStore.md) -- store 的定义和初始化
- [getters](./getters.md) -- getter 也是 storeToRefs 解构的一部分
- [persist](./persist.md) -- $subscribe 实现持久化的基础
- [响应式原理](../Vue3/reactivity.md) -- state 底层依赖 ref/reactive

## 更新记录

- 2026-07-06：初始创建
