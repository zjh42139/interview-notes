---
title: actions
description: Pinia actions 的同步/异步处理、$onAction 订阅机制、与 Vuex mutation+action 的本质区别
category: Pinia
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - actions
  - $onAction
  - 异步
  - Pinia
  - Vuex
---

# actions

> actions 是 Pinia 的业务逻辑层，也是和 Vuex 差异最大的部分：没有 mutation，action 可以直接修改 state。

## 一句话总结

Pinia 的 actions 统一了 Vuex 中 mutation 和 action 两个概念 -- action 可以直接修改 state，不管是同步还是异步操作。通过 `$onAction()` 可以订阅所有 action 的执行过程，是实现全局 loading、埋点上报、错误处理的利器。

## 核心机制

### 1. Setup Store 的 actions

Setup Store 中的 action 就是普通函数，同步异步都可以。

```ts
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)

  // 同步 action：直接修改 state
  function setToken(newToken: string) {
    token.value = newToken
  }

  // 异步 action：async/await 后修改 state
  async function login(username: string, password: string) {
    loading.value = true
    try {
      const res = await api.login({ username, password })
      token.value = res.token
      userInfo.value = res.userInfo
      return res  // action 可以有返回值
    } catch (error) {
      ElMessage.error('登录失败')
      throw error  // 重新抛出，让调用方也能捕获
    } finally {
      loading.value = false
    }
  }

  // 访问其他 action
  function logout() {
    // 直接调用同 store 内其他 action
    setToken('')
    userInfo.value = null
  }

  return { token, userInfo, loading, setToken, login, logout }
})
```

### 2. Options Store 的 actions

Options Store 的 action 通过 `this` 访问 state 和其他 action。

```ts
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null as UserInfo | null,
    loading: false,
  }),
  actions: {
    setToken(newToken: string) {
      this.token = newToken  // 通过 this 访问 state
    },
    async login(username: string, password: string) {
      this.loading = true
      try {
        const res = await api.login({ username, password })
        this.token = res.token
        this.userInfo = res.userInfo
        return res
      } catch (error) {
        ElMessage.error('登录失败')
        throw error
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.setToken('')      // 通过 this 访问其他 action
      this.userInfo = null
    },
  },
})
```

### 3. action 返回值：支持 async/await 链式调用

```ts
// 组件中调用 action 并获取返回值
<script setup lang="ts">
const userStore = useUserStore()

async function handleLogin() {
  try {
    // action 返回 Promise，可以 await 或 .then()
    const result = await userStore.login(form.username, form.password)
    router.push('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>
```

这和 Vuex 不同：Vuex 中 action 虽然也能返回 Promise 供 await，但规范上不允许在 action 中直接修改 state（strict 模式下会报错，必须 commit mutation），同一份业务逻辑被拆到 action 和 mutation 两处。

### 4. $onAction：订阅 action（高级特性）

`store.$onAction()` 可以监听 action 的整个生命周期，是 Pinia 中最强大的扩展机制之一。

```ts
const store = useUserStore()

// 订阅所有 action 的执行
const unsubscribe = store.$onAction(({
  name,      // action 名称，如 'login'
  store,     // 当前 store 实例
  args,      // 传给 action 的参数数组
  after,     // action 成功后的回调
  onError,   // action 失败后的回调
}) => {
  console.log(`Action "${name}" 开始执行，参数:`, args)

  // 记录开始时间
  const startTime = Date.now()

  // action 成功执行后
  after((result) => {
    const duration = Date.now() - startTime
    console.log(`Action "${name}" 执行成功，耗时: ${duration}ms，返回:`, result)
  })

  // action 抛出异常时
  onError((error) => {
    const duration = Date.now() - startTime
    console.error(`Action "${name}" 执行失败，耗时: ${duration}ms，错误:`, error)
    // 可以在这里做统一错误上报
    reportError({ action: name, error, duration })
  })
})

// 取消订阅
// unsubscribe()
```

**实战用法 -- 全局 action 加载状态**：

```ts
// 在 App.vue 或全局初始化中
const userStore = useUserStore()

userStore.$onAction(({ name, after, onError }) => {
  // 显示全局 loading
  const loadingInstance = ElLoading.service({ fullscreen: true })

  after(() => {
    loadingInstance.close()
  })

  onError(() => {
    loadingInstance.close()
  })
})
```

## 深度拓展

### 追问1：Pinia 为什么不需要 mutation？

这是 Pinia 和 Vuex 最本质的设计哲学差异：

- **Vuex**：受 Flux 架构影响，强制 state -> mutation -> action 的单向数据流。mutation 必须是同步的（方便 devtools 追踪），异步操作只能在 action 中通过 commit mutation 间接修改 state。
- **Pinia**：mutation 的本质是「显式收敛修改入口 + 强制同步保证 devtools 快照可追踪」，这是设计约束，不是响应式系统的能力限制。Pinia 通过 `$subscribe` 和新版 devtools API 同样能记录每次变更的类型与快照，权衡后认为 mutation 层的样板代码得不偿失，于是把修改统一收敛到 action。去掉 mutation 后，开发体验大幅提升。

```ts
// Vuex 中修改 state：必须 commit mutation
// store.js (Vuex)
mutations: { SET_TOKEN(state, token) { state.token = token } },
actions: { async login({ commit }, payload) {
  const res = await api.login(payload)
  commit('SET_TOKEN', res.token)  // 必须通过 commit
}}

// Pinia 中修改 state：直接在 action 中改
// store.ts (Pinia)
async function login(payload: LoginPayload) {
  const res = await api.login(payload)
  token.value = res.token  // 直接修改，简洁明了
}
```

**关键收益**：状态修改相关的样板代码大幅减少，不再需要在 mutations 里写大量的 SET_XXX 模板代码。TypeScript 类型推断也更好（不再需要为每个 mutation 写类型）。

### 追问2：$onAction 和中间件的对比

`$onAction` 类似于 Express/Koa 的中间件模式。你可以写多个 $onAction 订阅者，它们按注册顺序执行。

```ts
// 第一个订阅者：日志
store.$onAction(({ name, after, onError }) => {
  console.log(`[LOG] ${name} started`)
  after(() => console.log(`[LOG] ${name} success`))
  onError((e) => console.error(`[LOG] ${name} error`, e))
})

// 第二个订阅者：性能监控
store.$onAction(({ name, after }) => {
  const start = performance.now()
  after(() => {
    trackMetric(name, performance.now() - start)
  })
})
```

### 追问3：action 中调用另一个 store 的 action

```ts
export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])

  async function createOrder(data: CreateOrderParams) {
    const userStore = useUserStore()

    // 调用 user store 的 action 获取用户信息
    if (!userStore.userInfo) {
      await userStore.fetchUserInfo()
    }

    const order = await api.createOrder({
      ...data,
      userId: userStore.userInfo!.id,
    })
    orders.value.push(order)
    return order
  }

  return { orders, createOrder }
})
```

## 项目实战

### 完整的后台登录流程（含 action 订阅埋点）

```ts
// stores/useAuthStore.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)

  async function login(username: string, password: string) {
    const res = await api.login({ username, password })
    token.value = res.token
    userInfo.value = res.userInfo
    return res
  }

  async function getUserInfo() {
    const res = await api.getUserInfo()
    userInfo.value = res
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    router.push('/login')
  }

  return { token, userInfo, login, getUserInfo, logout }
})

// 全局 action 监控（在 main.ts 或 App.vue 中初始化）
export function setupActionMonitor() {
  // 对所有 store 的 action 进行监控
  const authStore = useAuthStore()

  authStore.$onAction(({ name, args, after, onError }) => {
    // 埋点上报
    analytics.track(`action_${name}_start`, { args })

    after((result) => {
      analytics.track(`action_${name}_success`, { result })
    })

    onError((error) => {
      analytics.track(`action_${name}_error`, {
        message: error.message,
      })
      // 关键 action 失败时通知用户
      if (['login', 'getUserInfo'].includes(name)) {
        ElMessage.error(`操作失败: ${error.message}`)
      }
    })
  })
}
```

## 易错点

**跨 store 引用的两个误区**

```ts
// 误区一：以为顶层拿到的 store 状态会「过时」—— 不会。
// useUserStore() 返回的是同一个单例，属性读取发生在 action 执行时，永远是最新值
const userStore = useUserStore()  // setup store 顶层单向引用，官方支持的写法

async function submitOrder() {
  const userId = userStore.userInfo?.id  // ✅ 读到的就是当前最新状态
}

// 误区二（真正的坑）：两个 store 顶层互相 useXxxStore() 会造成初始化循环依赖
// A 的 setup 顶层调 useB，B 的 setup 顶层调 useA -> 初始化死循环
// ✅ 互相引用时，把 useXxxStore() 挪到 action/getter 内部延迟获取
async function submitOrder() {
  const userStore = useUserStore()  // 延迟到调用时再获取，打破循环
  const userId = userStore.userInfo?.id
}
```

**忘记处理异步异常，导致调用方 await 无法 catch**

```ts
// ❌ 吞掉异常，调用方无法感知错误
async function login(username: string, password: string) {
  try {
    const res = await api.login({ username, password })
    token.value = res.token
  } catch (error) {
    console.error(error)
    // 忘记重新抛出！
  }
}

// ✅ 重新抛出，让调用方也能处理
async function login(username: string, password: string) {
  try {
    const res = await api.login({ username, password })
    token.value = res.token
  } catch (error) {
    ElMessage.error('登录失败')
    throw error  // 重新抛出
  }
}
```

## 面试信号

- 核心信号：能清晰对比 Vuex 的 mutation + action 和 Pinia action 的设计差异
- 能写出 $onAction 的完整用法：name、after、onError 三个回调
- 能说明 action 返回值的用法：支持 await、链式调用
- 能给出 $onAction 的实战场景：全局 loading、埋点上报、错误日志
- 能处理跨 store 的 action 调用和循环依赖问题

## 相关阅读

- [vs-vuex](./vs-vuex.md) -- Pinia 和 Vuex 的完整差异对比
- [defineStore](./defineStore.md) -- action 在两种 Store 语法中的写法
- [state](./state.md) -- action 修改 state 的底层响应式机制
- [plugins](./plugins.md) -- 用插件替代 $onAction 实现全局 action 拦截

## 更新记录

- 2026-07-18：事实审计：修正去 mutation 原因的 Proxy 归因、重写「顶层 store 状态会过时」这一错误易错点（真实风险是互相引用的循环依赖）、删去无出处的 40% 数据
- 2026-07-06：初始创建
