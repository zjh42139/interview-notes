---
title: 导航故障处理
description: Vue Router 4 导航故障的检测与处理：NavigationFailure 返回值判断、isReady 初始化与 onError 全局兜底
category: VueRouter
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - NavigationFailure
  - isNavigationFailure
  - isReady
  - onError
  - aborted
  - cancelled
  - duplicated
---

# 导航故障处理

> 面试频率中等，但如果你在回答路由守卫或动态路由的问题时，顺带提一句"这里还要处理 NavigationFailure，比如判断 duplicated 就静默忽略"，会让面试官觉得你工程化经验扎实。

## 一句话总结

Vue Router 4 的每次导航都返回 Promise，且**导航层面的失败不会 reject**——Promise resolve 出一个 `NavigationFailure` 对象（成功时是 `undefined`），用 `isNavigationFailure()` 判断三种失败类型（`aborted`、`cancelled`、`duplicated`）；守卫里的重定向不算失败。配合 `router.isReady()` 等待初始解析、`router.onError()` 兜底真正的异常，构成完整的路由错误处理体系。

## 核心机制

### 1. 导航的结果：检查返回值，而不是 try/catch

```ts
import { isNavigationFailure, NavigationFailureType } from 'vue-router'

// VR4：push 对导航故障不 reject，而是 resolve 出 NavigationFailure（成功时是 undefined）
const failure = await router.push('/dashboard')

if (!failure) {
  // 导航成功
} else if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  // 守卫中 return false 或 next(false) → 按需提示用户
} else if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
  // 在完成前又发起了新导航（如用户连续快速点击）→ 静默忽略
} else if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
  // 重复导航到当前路由 → 静默忽略
}
// 只有真正的异常（守卫抛错、异步组件 chunk 加载失败）才会 reject
// → 交给 try/catch 或 router.onError 上报
```

| 类型 | 含义 | 触发场景 | 处理方式 |
|------|------|---------|---------|
| `aborted` | 导航被中止 | 守卫中 `return false` 或 `next(false)` | 按需提示用户 |
| `cancelled` | 导航被取消 | 在上一次导航完成前发起了新导航 | **静默忽略**（最常见） |
| `duplicated` | 重复导航 | `router.push('/same')` 而当前已在 `/same` | **静默忽略** |

**`redirected` 呢？** VR3 有 redirected 失败类型，VR4 已把它从 `NavigationFailureType` 枚举中移除——守卫里 `return '/login'` 不是失败，而是开启一条新导航，原 push 的 Promise 会等新导航结束后才 resolve。要检测"这次到达是被重定向来的"，读 `router.currentRoute.value.redirectedFrom`（守卫参数 `to.redirectedFrom` 同理），而不是 NavigationFailure。

### 2. 检测导航失败：`isNavigationFailure()`

```ts
const failure = await router.push('/dashboard')

// 用法1：不传类型——判断"是不是导航失败"
if (isNavigationFailure(failure)) {
  console.warn('导航未完成:', failure.type, failure.from.fullPath, '→', failure.to.fullPath)
}

// 用法2：传类型精确判断。类型是位标志，可用 | 组合
if (isNavigationFailure(failure, NavigationFailureType.cancelled | NavigationFailureType.duplicated)) {
  // 两类都属于框架内部行为 → 静默
}
```

`NavigationFailure` 对象带 `to`、`from`、`type` 属性；`isNavigationFailure` 同时是 TS 类型守卫，判断通过后 `failure` 自动收窄为 `NavigationFailure` 类型。

**关键**：`cancelled` 是最容易遇到的。用户在列表页点击详情，但在详情页的组件还没渲染完时又点了返回，此时前一个详情页的导航就会被 cancel。

### 3. `router.isReady()` —— 等待路由初始化完成

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)

// router.isReady() 确保初始导航解析完成后再挂载应用
// 这对于 SSR、异步路由注册、或 beforeResolve 中有异步操作时很重要
router.isReady().then(() => {
  app.mount('#app')
  console.log('路由初始化完成，应用已挂载')
})
```

`isReady()` 等待两件事：
1. **初始导航完成**（包括所有异步组件解析）
2. **初始导航关联的所有异步 enter 守卫**（如 `beforeResolve`）执行完毕

如果不使用 `isReady()`，当有异步组件还未解析时，页面会短暂显示空白或 `router-view` 中什么都没有。

### 4. `router.onError()` —— 全局错误捕获

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({ ... })

// 全局错误处理：捕获所有导航过程中未被 catch 的异常（注意：NavigationFailure 不算异常，不会走到这里）
router.onError((error, to) => {
  console.error(`导航到 ${to.fullPath} 时发生错误:`, error)

  // 区分错误类型
  const errorMessage = (error as Error).message ?? ''

  if (/Failed to fetch dynamically imported module/.test(errorMessage)) {
    // chunk 加载失败：新版本发布后旧页面的 chunk 404
    // 提示用户刷新页面
    ElMessage.warning('检测到新版本，即将刷新页面')
    setTimeout(() => window.location.reload(), 1500)

  } else if (/Loading chunk .* failed/.test(errorMessage)) {
    // Webpack 的另一种加载失败文案
    ElMessage.warning('资源加载失败，即将刷新页面')
    setTimeout(() => window.location.reload(), 1500)

  } else {
    // 其他错误：上报到监控平台
    // errorTracker.captureException(error, { route: to.fullPath })
    console.error('未预期的路由错误:', error)
  }
})
```

## 深度拓展

### 追问1：为什么 push 失败时也 resolve，而不是 reject？

VR 3.1 给 `push` 加上 Promise 后，重复导航会 reject 一个 `NavigationDuplicated` 错误，逼得社区流行全局 patch `router.push` 加 `.catch(() => {})` 吞错——顺带把 chunk 加载失败这类真错误也吞了。VR4 重新划界：

1. **导航层面的结果**（成功 / aborted / cancelled / duplicated）都走 resolve，用返回值表达
2. **真正的异常**（守卫抛错、异步组件加载失败）才 reject，走 try/catch 或 `router.onError`

这样 `await router.push()` 之后的代码天然表示"导航流程已结束"，错误处理语义回归正常：

```ts
// await 导航完成后再做后续操作
const failure = await router.push('/user/list')
if (!failure) {
  // 此时组件已挂载，DOM 已更新
  document.querySelector('.highlight-row')?.scrollIntoView()
}
```

### 追问2：如何封装统一的 `safePush`？

在 composable 或工具函数中封装，避免每处导航都写一遍类型判断：

```ts
// utils/router.ts
import router from '@/router'
import { isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from 'vue-router'

// 返回是否导航成功；只有 aborted 需要调用方感知，其余静默
export async function safePush(to: RouteLocationRaw): Promise<boolean> {
  const failure = await router.push(to)  // 真异常仍会 reject，由调用方或 onError 处理
  if (!failure) return true
  if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
    // 被守卫拦截（如无权限、表单未保存）→ 交给调用方决定是否提示
    return false
  }
  // cancelled / duplicated：框架内部行为，静默
  return false
}
```

### 追问3：`cancelled` vs `aborted` 的本质区别

- **`aborted`**：守卫**主动拒绝**了这次导航（`return false` 或 `next(false)`），说明有人不让你去。通常需要提示用户"你无权限"或"请先保存表单"
- **`cancelled`**：在导航完成前，又**发起了一次新导航**，旧的被取消了。这是框架内部行为，不是错误，不需要任何用户提示

**面试关键点**：`cancelled` 不应该触发用户提示。如果你做了一个点击按钮跳转 + `ElMessage.error("跳转失败")` 的逻辑，在用户快速双击时会看到这条无关的提示——这说明你没有正确区分导航失败类型。

### 追问4：初始导航与 `isReady` 的时序

初始导航（应用启动时对当前 URL 的第一次解析）也是一次普通导航：要跑守卫、解析异步组件。如果在它完成之前就手动 `router.push()`，初始导航会像其他导航一样**被 cancelled**，可能出现"首屏渲染的不是 URL 对应的页面"这类时序问题。

解法：永远使用 `router.isReady().then(() => app.mount('#app'))`，不要在 `isReady` 兑现前做编程式导航。

## 项目实战

```ts
// composables/useNavigation.ts —— 业务层封装的导航 hook
import { useRouter, isNavigationFailure, NavigationFailureType } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

export function useNavigation() {
  const router = useRouter()

  async function navigate(to: RouteLocationRaw, options?: {
    successMsg?: string
  }): Promise<boolean> {
    try {
      // 导航失败不 reject——从返回值拿 NavigationFailure
      const failure = await router.push(to)
      if (failure) {
        if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
          // 被守卫拦截（如无权限）→ 守卫内部已经做了提示，这里不需要额外处理
        }
        // duplicated / cancelled → 静默
        return false
      }
      if (options?.successMsg) {
        ElMessage.success(options.successMsg)
      }
      return true
    } catch (e) {
      // 真正的异常：chunk 加载失败、守卫抛错
      console.error('导航异常:', e)
      ElMessage.error('页面跳转失败，请重试')
      return false
    }
  }

  // 封装 replace（不产生历史记录）
  async function redirect(to: RouteLocationRaw): Promise<boolean> {
    try {
      return !(await router.replace(to))  // 无 failure 即成功
    } catch {
      return false
    }
  }

  return { navigate, redirect }
}
```

```vue
<!-- 使用示例：表单提交后跳转 -->
<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation'

const { navigate } = useNavigation()

async function handleSubmit() {
  const res = await saveForm()
  if (res.ok) {
    await navigate(
      { name: 'UserList', query: { ref: 'form' } },
      { successMsg: '保存成功' }
    )
  }
}
</script>
```

```ts
// main.ts —— 启动时的健壮初始化
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const app = createApp(App)
app.use(router)

// 全局错误兜底——应用级别，只注册一次
router.onError((error) => {
  const msg = error instanceof Error ? error.message : String(error)
  if (/Failed to fetch|Loading chunk|NetworkError/i.test(msg)) {
    ElMessage.warning('检测到版本更新，即将刷新页面')
    setTimeout(() => window.location.reload(), 1500)
  } else {
    console.error('[Router Error]', msg)
  }
})

// 使用 isReady 确保初始导航完成
router.isReady().then(() => {
  // 初始解析完成后再检查用户状态（避免时序问题）
  const userStore = useUserStore()
  if (userStore.token && !userStore.isInfoLoaded) {
    userStore.fetchUserInfo()
  }
  app.mount('#app')
})
```

## 易错点

**❌ 还在用 try/catch 捕导航失败**
VR3.1 时代 `router.push().catch(() => {})` 吞 `NavigationDuplicated` 的写法在 VR4 里是死代码——aborted / cancelled / duplicated 不 reject，catch 根本接不到；能进 catch 的只有真异常。保留这种吞错写法反而会把 chunk 加载失败静默掉。**从返回值拿 NavigationFailure，用 `isNavigationFailure` 判断。**

**❌ 不对导航失败做类型区分，所有 failure 都弹错误提示**
最常见的反例：`const failure = await router.push(...)`，只要 `failure` 存在就 `ElMessage.error("跳转失败")`。用户连续点击"保存"按钮时触发 duplicated / cancelled，看到了不相关的错误提示。**必须按 `NavigationFailureType` 区分：只有 aborted 值得提示。**

**❌ `router.push` 不 await，导致后续代码在导航完成前执行**
`push` 是异步的（返回 Promise），导航还未完成，DOM 还未更新，你就去操作 DOM 了。虽然很多情况下"看起来正常"，但在异步组件慢的场景下会有 bug。

**❌ 忘记 `router.onError` 做 chunk 加载失败的重载处理**
新版本发布后，旧页面上缓存的 JS 引用到已被删除的 chunk 文件，加载 404。不加处理用户看到的是白屏 + 控制台报错。`router.onError` 中检测 chunk 失败并自动刷新是最低成本的解决方案。

**❌ 使用 `window.location.href` 代替 `router.push` 做错误恢复**
`window.location.href` 会触发完整的页面重载，导致状态丢失。优先尝试 `router.push` + 错误处理。

## 面试信号

当面试官问"路由导航失败了你怎么处理"，你的回答骨架：

1. **VR4 的导航是异步的且失败不 reject**：`push()` / `replace()` 返回 Promise，导航故障时 resolve 出 `NavigationFailure`（成功时是 `undefined`），只有真异常才 reject
2. **三种失败类型**：`duplicated`（重复导航）、`cancelled`（被新导航取消）→ 静默忽略；`aborted`（守卫拒绝）→ 按需提示。`redirected` 已从枚举移除——重定向不算失败，用 `redirectedFrom` 检测
3. **检测方式**：`isNavigationFailure(failure, NavigationFailureType.xxx)` 精确判断类型（位标志可用 `|` 组合），不同类型的处理方式不能混
4. **全局兜底**：`router.onError()` 统一捕获 chunk 加载失败等真异常，自动刷新页面
5. **初始化**：`router.isReady()` 等待初始解析完成后再挂载应用，避免初始导航被 cancelled

## 相关阅读

- [Vue Router 4 新特性](./vue-router-4.md) — 重复导航从 reject 改为 resolve 的来龙去脉
- [路由守卫](./route-guards.md) — `return false` 产生 `aborted` 类型，守卫中的取消逻辑
- [动态路由](./dynamic-routing.md) — 守卫中 addRoute 后 `return to.fullPath` 属于重定向（不产生失败，用 `redirectedFrom` 检测）
- [路由懒加载](./lazy-loading.md) — chunk 加载失败的检测与兜底方案

## 更新记录

- 2026-07-18：VR3 → VR4 口径重写（Phase 3 事实审计）——push 对导航故障 resolve 而非 reject、`redirected` 移出失败类型（改用 redirectedFrom 检测）、全部示例改为返回值判断
- 2026-07：完整填充（Phase 1），含失败类型对比、safePush 工厂、onError 全局兜底
