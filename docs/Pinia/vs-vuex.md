---
title: Pinia vs Vuex
description: Pinia 与 Vuex 的核心差异对比：mutation、modules、TypeScript、体积、devtools 及迁移策略
category: Pinia
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - Pinia
  - Vuex
  - 对比
  - 迁移
  - TypeScript
---

# Pinia vs Vuex

> 这是面试必问题。"为什么 Pinia 取代了 Vuex？"你能对比几个维度，就决定面试官对"你真的用过还是只背了八股文"的判断。

## 一句话总结

Pinia 实现了 Vuex 5 RFC 的绝大部分提案，被官方视为「事实上的 Vuex 5」（Vuex 5 本身从未发布，Pinia 是官方继任者）。相比 Vuex 4 去掉了 mutation 层、去掉了嵌套 modules、提供了完整的 TypeScript 类型推断、体积约为 Vuex 的一半（官方宣传 min+gzip 约 1.5KB），开发体验全面提升。Vue 官方已推荐 Pinia 作为 Vue3 项目的默认状态管理方案。

## 核心机制

### 1. 核心差异对比表

| 维度 | Vuex 4 | Pinia |
|------|--------|-------|
| **mutation** | 必须通过 mutation 修改 state（同步） | 无 mutation，action 直接修改 state |
| **模块化** | 嵌套 modules，通过 `namespaced: true` 隔离 | 独立 store 实例，天然隔离，互相引用 |
| **TypeScript** | 需要复杂的类型包装和声明，类型推断差 | 开箱即用，完整的类型推断 |
| **体积** | ~10KB minified (gzipped ~4KB) | ~6KB minified (gzipped ~2KB，官方宣传 ~1.5KB) |
| **devtools** | 扁平列表，模块多了难管理 | 按 store 分组，清晰直观 |
| **代码量** | 需要定义 state/mutation/action/getter | Setup Store 一个函数搞定 |
| **动态注册** | 通过 `registerModule` API | `defineStore` 在调用时才懒初始化 |
| **响应式依赖** | Vuex 3 基于 Vue2 defineProperty；Vuex 4 基于 Vue3 reactive | 基于 Vue3 reactive/effectScope，可在组件外使用 |
| **热更新** | 需要手动 accept 并调用 `store.hotUpdate()` | 官方提供 `acceptHMRUpdate`，一行接入且保留 state |

### 2. 核心差异详解

#### 差异一：没有 mutation（最核心的差异）

```ts
// ========== Vuex 写法 ==========
const vuexStore = createStore({
  state: { count: 0 },
  mutations: {
    INCREMENT(state, payload: number) {
      state.count += payload
    },
    SET_COUNT(state, count: number) {
      state.count = count
    },
  },
  actions: {
    incrementAsync({ commit }, payload: number) {
      setTimeout(() => {
        commit('INCREMENT', payload)
      }, 1000)
    },
    // 异步修改 count -> 必须 commit mutation
    async fetchCount({ commit }) {
      const res = await api.getCount()
      commit('SET_COUNT', res.data)      // 还是得 commit
    },
  },
})

// ========== Pinia 写法 ==========
const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function increment(payload: number) {
    count.value += payload             // 直接修改
  }

  async function fetchCount() {
    const res = await api.getCount()
    count.value = res.data             // 直接修改
  }

  return { count, increment, fetchCount }
})
```

**为什么 Pinia 可以去掉 mutation？**

Vuex 强制 mutation 有两个原因：一是显式收敛修改入口（每次变更都有名字、可回放，符合 Flux 单向数据流），二是强制同步执行，保证 devtools 的每份状态快照可预测、可追踪。注意这是**设计约束，不是响应式系统的能力限制**——Vue2 的 defineProperty 同样能拦截属性赋值（Vuex 的 strict 模式就是靠深度 watcher 检测 mutation 之外的修改）。Pinia 的取舍是：通过 `$subscribe` 和新版 devtools API 依然能追踪每次变更的类型与前后快照，mutation 层的样板代码得不偿失，于是把修改入口收敛到 action（靠约定而非强制）。

#### 差异二：没有嵌套 modules（扁平化设计）

```ts
// ========== Vuex modules ==========
// 嵌套结构，深层访问，命名空间易冲突
const store = createStore({
  modules: {
    user: {
      namespaced: true,
      state: { name: '' },
      modules: {
        profile: {
          namespaced: true,
          state: { avatar: '' },
        },
      },
    },
  },
})
// 访问深层模块状态：store.state.user.profile.avatar
// 提交 mutation：store.commit('user/profile/SET_AVATAR', url)

// ========== Pinia stores ==========
// 扁平结构，独立的 store 实例
const userStore = useUserStore()
const profileStore = useProfileStore()

// 互相引用也很直观
const ordersWithUser = computed(() => {
  const user = userStore.userInfo
  const profile = profileStore.avatar
  return { user, profile }
})
```

**为什么要扁平化？** 嵌套 modules 在大型项目中很难维护 -- 命名空间容易冲突、`rootState` 和 `rootGetters` 的概念容易混淆、跨模块访问很麻烦。Pinia 用独立的 store 实例替代嵌套，每个 store 都是独立的，互不干扰，但可以显式地互相引用。

#### 差异三：TypeScript 支持

```ts
// ========== Vuex + TypeScript（痛苦） ==========
// 需要手动声明类型
type UserState = { name: string; age: number }
const userModule: Module<UserState, RootState> = {
  state: { name: '', age: 0 },
  getters: {
    // 需要标注 4 个泛型参数！
    isAdult: (state, getters, rootState, rootGetters): boolean => {
      return state.age >= 18
    },
  },
  mutations: {
    // mutation 无法被外部类型安全地调用
    SET_NAME(state, name: string) { state.name = name },
  },
}
// 组件中 dispatch 时没有类型提示
store.dispatch('user/fetchUser', payload)  // payload 类型不会检查

// ========== Pinia + TypeScript（丝滑） ==========
const useUserStore = defineStore('user', () => {
  const name = ref('')
  const age = ref(0)
  const isAdult = computed(() => age.value >= 18)
  function setName(newName: string) { name.value = newName }
  return { name, age, isAdult, setName }
})
// 组件中调用：完整的类型推断和提示
const store = useUserStore()
store.setName('Zhang San')  // 参数类型自动检查
store.name                   // 自动推断为 string
```

#### 差异四：体积差异

```text
Vuex 4:   ~10KB minified, ~4KB gzipped
Pinia:    ~5-6KB minified, ~1.5-2KB gzipped
```

Pinia 更小是因为：
- 去掉了 mutation 层的代码
- 去掉了 modules 嵌套解析逻辑
- 去掉了大量类型包装代码
- 直接复用 Vue3 的 reactive/computed，不需要自己实现

#### 差异五：devtools 体验

Vuex 的 devtools 将所有模块的 mutation 列在一个扁平列表中，模块多了很难定位。Pinia 在 devtools 中按 store 分组，每个 store 有自己的 state、getters、actions 面板，类似 Chrome DevTools 的 Scope 面板，直观清晰。

#### 差异六：热更新（HMR）

```ts
// Vuex HMR 需要额外配置：手动 accept 后调用 store.hotUpdate() 替换模块
if (import.meta.hot) {
  import.meta.hot.accept(['./modules/user'], () => {
    store.hotUpdate({ modules: { user: newUserModule } })
  })
}

// Pinia HMR：官方提供 acceptHMRUpdate，一行接入（编辑 store 时保留现有 state）
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUserStore = defineStore('user', () => { /* ... */ })

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
```

## 迁移建议

### Vuex 项目如何迁移到 Pinia

**渐进式迁移策略**：

1. **共存阶段**：Pinia 和 Vuex 可以在同一个项目中并存。新功能用 Pinia，老模块保留 Vuex。
2. **逐模块迁移**：按优先级迁移 store 模块（从最常用/最简单的开始）。
3. **语法转换**：

```ts
// Vuex module 到 Pinia store 的映射
// Vuex state         -> Pinia ref()/reactive()
// Vuex getters       -> Pinia computed()
// Vuex mutations     -> 合并到 Pinia actions 中
// Vuex actions       -> Pinia async functions
// Vuex namespaced    -> Pinia store id
```

**迁移工具**：可以将 Vuex store 的 state/getters/mutations/actions 自动提取并生成对应的 Pinia store，但建议理解原理后手动迁移，避免隐藏的类型问题。

### Vuex 和 Pinia 并存

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createStore } from 'vuex'   // Vuex 4

const app = createApp(App)
const pinia = createPinia()
const vuex = createStore({ /* ... */ })

app.use(pinia)
app.use(vuex)
// 两者可以共存
```

## 项目实战

迁移过程中的实际经验：

```ts
// Vuex 中常见的 rootGetters 模式（访问其他模块的 state）
// Vuex:
getters: {
  ordersWithUser: (state, getters, rootState) => {
    return state.orders.map(order => ({
      ...order,
      userName: rootState.user.userInfo.name,
    }))
  },
}

// Pinia 中直接导入另一个 store（更直观）
const ordersWithUserName = computed(() => {
  const userStore = useUserStore()
  return orders.value.map(order => ({
    ...order,
    userName: userStore.userInfo?.name,
  }))
})
```

## 易错点

**假设 Pinia 和 Vuex 的 API 是 1:1 对应的**

虽然概念相似，但实现细节不同。比如 `$subscribe` 不等同于 Vuex 的 `watch`；`$patch` 没有 Vuex 的直接对应物。

**在迁移时原封不动地保留 mutation**

如果从 Vuex 迁移，不要机械地将每个 mutation 转成一个 Pinia action。正确的做法是审视业务逻辑，将 mutation + action 的逻辑合并到同一个 Pinia action 中。

## 面试信号

- 核心信号：能逐一对比 6 个以上维度，且有具体代码示例支撑
- 能解释"为什么可以去掉 mutation"（mutation 是设计约束而非响应式能力限制；Pinia 靠 $subscribe/devtools API 追踪变更，省掉样板代码）
- 能说明扁平化 store 比嵌套 modules 好的理由（循环引用、类型推断、代码组织）
- 能给出实际的迁移策略（共存 -> 渐进式迁移 -> 语法映射），而不只是说"重写"
- 加分项：能提到 Pinia 可以在 Vue 组件之外使用（测试、Node 脚本、路由守卫），因为它只依赖 Vue 的响应式系统，不依赖组件实例

## 相关阅读

- [defineStore](./defineStore.md) -- Pinia 定义 store 的两种方式
- [actions](./actions.md) -- Pinia action 和 Vuex mutation+action 的对比
- [state](./state.md) -- Pinia state 和 Vuex state 的差异
- [响应式原理](../Vue3/reactivity.md) -- 理解 Pinia state 底层的 reactive/ref 机制

## 更新记录

- 2026-07-18：事实审计：修正 Vuex 5 关系表述、体积数据前后矛盾、Vuex 4 响应式归属、HMR 需 acceptHMRUpdate、去 mutation 原因的归因
- 2026-07-06：初始创建
