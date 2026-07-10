---
title: 插件
description: Pinia 插件机制：自定义插件、全局 loading、共享方法与状态、日志埋点
category: Pinia
type: api-reference
score: 0
difficulty: 高级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - 插件
  - plugin
  - $onAction
  - loading
  - Pinia
---

# 插件

> Pinia 插件是扩展 store 能力的核心机制。`pinia-plugin-persistedstate` 就是插件的最佳范例。理解插件机制能让你封装出项目级的通用能力。

## 一句话总结

Pinia 插件是一个函数，接收 `{ store, pinia, app }` 上下文，可以给所有 store 添加共享方法/状态、拦截 action、或实现全局逻辑。核心应用场景：全局 loading 管理、action 日志/埋点、错误统一处理、store 缓存。

## 核心机制

### 1. 插件函数的基本结构

```ts
// plugins/myPlugin.ts
import type { PiniaPluginContext } from 'pinia'

export function myPlugin(context: PiniaPluginContext) {
  // context 包含三个对象
  const { store, pinia, app } = context
  // store:  当前正在创建的 store 实例
  // pinia:  全局 pinia 实例
  // app:    Vue 应用实例

  console.log(`Store "${store.$id}" 正在被创建`)

  // 可以给 store 添加属性/方法
  // ...
}
```

注册插件：

```ts
// main.ts
import { createPinia } from 'pinia'
import { myPlugin } from './plugins/myPlugin'

const pinia = createPinia()
pinia.use(myPlugin)       // 对所有 store 生效
pinia.use(anotherPlugin)  // 可以链式注册多个
app.use(pinia)
```

### 2. 给所有 store 添加共享方法

```ts
// plugins/globalMethods.ts
export function globalMethodsPlugin({ store }: PiniaPluginContext) {
  // 给每个 store 添加 $confirmAction 方法
  store.$confirmAction = async function (
    action: () => Promise<void>,
    message: string = '确认执行此操作？'
  ) {
    // 这里可以引入 ElMessageBox（需要确保已注册）
    try {
      return await action()
    } catch (error) {
      console.error(`Action in store "${store.$id}" failed:`, error)
      throw error
    }
  }
}

// TypeScript 类型声明
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $confirmAction: (action: () => Promise<void>, message?: string) => Promise<void>
  }
}
```

使用：

```ts
export const useUserStore = defineStore('user', () => {
  async function deleteUser(id: number) {
    // $confirmAction 由插件注入，所有 store 可用
    await this.$confirmAction(
      () => api.deleteUser(id),
      `确定要删除用户 ${id} 吗？`
    )
  }
  return { deleteUser }
})
```

### 3. 给所有 store 添加共享状态

```ts
// plugins/globalState.ts
import { ref } from 'vue'

export function globalStatePlugin({ store }: PiniaPluginContext) {
  // 给每个 store 添加一个全局计数器
  store.$actionCount = ref(0)
  store.$createdAt = new Date()

  // 也可以把全局状态挂到 pinia 实例上
  // 但挂到 store 上让每个 store 都能访问
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $actionCount: Ref<number>
    $createdAt: Date
  }
}
```

### 4. 全局 action 拦截（无侵入埋点）

```ts
// plugins/actionLogger.ts
export function actionLoggerPlugin({ store }: PiniaPluginContext) {
  store.$onAction(({ name, args, after, onError }) => {
    const startTime = Date.now()

    console.log(
      `[${store.$id}] Action "${name}" started with args:`,
      JSON.stringify(args)
    )

    after((result) => {
      console.log(
        `[${store.$id}] Action "${name}" succeeded after ${Date.now() - startTime}ms`
      )
    })

    onError((error) => {
      console.error(
        `[${store.$id}] Action "${name}" failed after ${Date.now() - startTime}ms:`,
        error
      )
    })
  })
}
```

## 深度拓展

### 追问1：插件执行顺序和时机

插件按 `pinia.use()` 的注册顺序依次执行。每个插件在**每个 store 第一次被实例化时**执行一次。

```ts
pinia.use(pluginA)  // 第一个执行
pinia.use(pluginB)  // 第二个执行
pinia.use(pluginC)  // 第三个执行

// 当 useUserStore() 被第一次调用时：
// pluginA -> pluginB -> pluginC 依次执行
// 当 useUserStore() 再次调用时：不再执行插件（store 已创建）
```

### 追问2：插件中 $onAction 和直接在 store 中使用 $onAction 的区别

- **插件中注册**：对**所有 store** 的所有 action 生效，全局统一处理
- **store 中注册**：只对**当前 store** 的 action 生效

```ts
// 插件中：全局统一处理，适合埋点、错误上报
export function reportPlugin({ store }: PiniaPluginContext) {
  store.$onAction(({ name, onError }) => {
    onError((error) => {
      reportError({ store: store.$id, action: name, error })
    })
  })
}

// 组件中：针对特定 store，适合 UI 反馈
const userStore = useUserStore()
userStore.$onAction(({ name, after }) => {
  if (name === 'login') {
    const loading = ElLoading.service({ fullscreen: true })
    after(() => loading.close())
  }
})
```

### 追问3：如何让插件只在特定 store 上生效？

插件函数内部通过 `store.$id` 判断：

```ts
export function adminOnlyPlugin({ store }: PiniaPluginContext) {
  // 只对 id 包含 'admin' 的 store 生效
  if (!store.$id.startsWith('admin')) return

  store.$onAction(({ name, after, onError }) => {
    // 只对管理模块的 store 做额外处理
  })
}
```

## 项目实战

### 封装一个全局 loading 插件

这是后台管理系统中最实用的 Pinia 插件：自动跟踪所有 action 的 pending 状态，无需在每个 store 中手动维护 loading 标志。

```ts
// plugins/loadingPlugin.ts
import { ref } from 'vue'
import type { PiniaPluginContext } from 'pinia'

export function loadingPlugin({ store }: PiniaPluginContext) {
  // 给每个 store 注入一个全局的 $loading 状态
  store.$loading = ref(false)
  // 记录当前正在执行的 action 数量
  let pendingCount = 0

  store.$onAction(({ name, after, onError }) => {
    pendingCount++
    store.$loading.value = true
    // 可选：记录正在执行的具体 action 名称
    console.log(`[Loading] ${store.$id}.${name} 开始 (pending: ${pendingCount})`)

    const finish = () => {
      pendingCount--
      if (pendingCount <= 0) {
        pendingCount = 0
        store.$loading.value = false
        console.log(`[Loading] ${store.$id} 所有 action 完成`)
      }
    }

    after(finish)
    onError(finish)
  })
}

// 类型声明
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $loading: Ref<boolean>
  }
}
```

**组件中使用**：

```vue
<template>
  <!-- 全局 loading，基于任意 store 的 $loading 状态 -->
  <div v-if="userStore.$loading" class="global-loading-bar" />

  <el-button :loading="userStore.$loading" @click="userStore.login()">
    登录
  </el-button>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()
// userStore.$loading 自动反映该 store 是否有 action 正在执行
</script>
```

**对比传统写法**：

```ts
// ❌ 传统：每个 store 手动维护 loading
export const useUserStore = defineStore('user', () => {
  const loading = ref(false)  // 每个 store 都要写

  async function login() {
    loading.value = true       // 每个 action 都要写
    try {
      // ...
    } finally {
      loading.value = false    // 每个 action 都要写
    }
  }
  return { loading, login }
})

// ✅ 用插件：零 ~ 侵 ~ 入
export const useUserStore = defineStore('user', () => {
  async function login() {
    const res = await api.login(...)
    // 不需要维护 loading！
  }
  return { login }
})
// $loading 由插件自动注入和管理
```

### 完整的错误上报插件

```ts
// plugins/errorReportPlugin.ts
export function errorReportPlugin({ store }: PiniaPluginContext) {
  store.$onAction(({ name, args, onError }) => {
    onError((error) => {
      // 结构化错误信息
      const reportData = {
        storeId: store.$id,
        actionName: name,
        args: JSON.stringify(args),
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }

      // 上报到监控平台（如 Sentry）
      console.error('[ActionError]', reportData)

      // 可选：发送到服务端
      // navigator.sendBeacon('/api/error-report', JSON.stringify(reportData))
    })
  })
}
```

## 易错点

**插件中直接修改 store 的 state**

插件在 store 创建阶段执行，此时 state 可能还未完全初始化。应该在 `$onAction` 的回调中或通过添加新属性来扩展，而不是直接修改 state 自身。

**忘记 TypeScript 类型声明**

添加的自定义属性在 store 上没有类型提示，需要在 `pinia` 模块中声明扩展接口：

```ts
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $loading: Ref<boolean>
    $myMethod: () => void
  }
}
```

**多个插件的执行顺序依赖**

如果插件 B 依赖插件 A 添加的属性，必须确保 `pinia.use(A).use(B)` 的注册顺序。不要依赖隐式顺序，尽量让插件独立。

## 面试信号

- 能写出插件的基本结构：`({ store, pinia, app }) => { ... }`
- 能说明 `store.$onAction` 在插件中的价值（全局无侵入拦截）
- 能给出至少两个实战场景：全局 loading 插件、action 日志/埋点插件
- 能区分插件中的 `$onAction` 和组件中 `$onAction` 的差异（全局 vs 局部）
- 加分项：能补充 TypeScript 类型声明让自定义属性有类型提示

## 相关阅读

- [actions](./actions.md) -- $onAction 是插件的核心钩子
- [persist](./persist.md) -- persist 插件是 Pinia 插件机制的经典案例
- [defineStore](./defineStore.md) -- 理解 store 的创建生命周期

## 更新记录

- 2026-07-06：初始创建
