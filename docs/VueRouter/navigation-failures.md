---
title: 导航故障处理
description: Vue Router 导航失败的类型、检测与处理，包括重复导航、守卫取消和全局错误兜底
category: VueRouter
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - NavigationFailure
  - isReady
  - onError
  - 导航故障
  - cancelled
  - duplicated
---

# 导航故障处理

> 面试频率中等，但如果你在回答路由守卫或动态路由的问题时，顺带提一句"这里还要处理 NavigationFailure，比如判断 duplicated 就静默忽略"，会让面试官觉得你工程化经验扎实。

## 一句话总结

Vue Router 4 为每一次导航都返回一个 Promise，导航失败时不是抛出常规 Error，而是返回 `NavigationFailure` 对象，包含 4 种失败类型（`redirected`、`aborted`、`cancelled`、`duplicated`）。通过 `router.isReady()` 确保初始解析完成、`router.onError()` 做全局兜底，可以构建健壮的路由错误处理体系。

## 核心机制

### 1. 导航的四种结果

```ts
import { isNavigationFailure, NavigationFailureType } from 'vue-router'

try {
  await router.push('/dashboard')
} catch (e) {
  if (isNavigationFailure(e, NavigationFailureType.redirected)) {
    // 在守卫中被重定向了 → 正常行为，不需要处理
    console.log('导航被重定向到了:', (e as any).to)
  }
  if (isNavigationFailure(e, NavigationFailureType.aborted)) {
    // beforeEach 中 next(false) 或 return false → 通知用户
  }
  if (isNavigationFailure(e, NavigationFailureType.cancelled)) {
    // 在完成前又发起了新导航（如用户连续快速点击）→ 静默忽略
  }
  if (isNavigationFailure(e, NavigationFailureType.duplicated)) {
    // 重复导航到同一个路由 → 静默忽略
  }
  // 其他 Error：真正的异常（如 chunk 加载失败）→ 上报
}
```

| 类型 | 含义 | 触发场景 | 处理方式 |
|------|------|---------|---------|
| `redirected` | 导航被重定向 | `beforeEach` 中 `next('/xxx')` 或 `return '/xxx'` | 正常行为，一般忽略 |
| `aborted` | 导航被中止 | `beforeEach` 中 `next(false)` 或 `return false` | 按需提示用户 |
| `cancelled` | 导航被取消 | 在上一次导航完成前发起了新导航 | **静默忽略**（最常见） |
| `duplicated` | 重复导航 | `router.push('/same')` 而当前已在 `/same` | **静默忽略** |

### 2. 检测导航失败：`isNavigationFailure()`

```ts
// 基础用法：检测是否是导航失败
const result = await router.push('/dashboard').catch(e => e)
if (isNavigationFailure(result)) {
  // 统一处理失败
  console.warn('导航未完成:', result.type)
}

// 精确判断类型
async function safeNavigate(to: RouteLocationRaw) {
  try {
    await router.push(to)
    return { success: true }
  } catch (e) {
    // 只有 aborted 需要提醒用户
    if (isNavigationFailure(e, NavigationFailureType.aborted)) {
      return { success: false, reason: 'blocked' }
    }
    // duplicated / cancelled / redirected 都静默处理
    return { success: false, reason: 'ignored' }
  }
}
```

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
2. **所有 `beforeResolve` 守卫完成**

如果不使用 `isReady()`，当有异步组件还未解析时，页面会短暂显示空白或 `router-view` 中什么都没有。

### 4. `router.onError()` —— 全局错误捕获

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({ ... })

// 全局错误处理：捕获所有导航过程中未被 catch 的异常
router.onError((error, to) => {
  console.error(`导航到 ${String(to)} 时发生错误:`, error)

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

### 追问1：为什么 `router.push()` 返回的是 Promise？

Vue Router 4 的设计中，每一次导航都是异步的（因为要解析异步组件）。`push()` 返回 Promise 让调用方可以：

1. **`await` 导航完成**，确保此时 DOM 已更新
2. **捕获导航失败**，根据类型做不同处理

```ts
// await 导航完成后再做后续操作
await router.push('/user/list')
// 此时组件已挂载，DOM 已更新
document.querySelector('.highlight-row')?.scrollIntoView()
```

### 追问2：如何统一处理 `cancelled` 的冗余错误？

在 Pinia action 或 composable 中封装一个 `safePush` 方法，避免每次导航都写 try-catch：

```ts
// utils/router.ts
import router from '@/router'
import { isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from 'vue-router'

export async function safePush(to: RouteLocationRaw): Promise<void> {
  try {
    await router.push(to)
  } catch (e) {
    // 只有真正需要关注的错误才抛出
    if (isNavigationFailure(e, NavigationFailureType.duplicated)) {
      return  // 重复导航，静默
    }
    if (isNavigationFailure(e, NavigationFailureType.cancelled)) {
      return  // 被新导航取消，静默
    }
    if (isNavigationFailure(e, NavigationFailureType.redirected)) {
      return  // 被重定向，静默
    }
    // aborted 和真正的异常继续抛出，由调用方处理
    throw e
  }
}
```

### 追问3：`canceled` vs `aborted` 的本质区别

- **`aborted`**：守卫**主动拒绝**了这次导航（`next(false)` 或 `return false`），说明有人不让你去。通常需要提示用户"你无权限"或"请先保存表单"
- **`cancelled`**：在导航完成前，又**发起了一次新导航**，旧的被取消了。这是框架内部行为，不是错误，不需要任何用户提示

**面试关键点**：`cancelled` 不应该触发用户提示。如果你做了一个点击按钮跳转 + `ElMessage.error("跳转失败")` 的逻辑，在用户快速双击时会看到这条无关的提示——这说明你没有正确区分导航失败类型。

### 追问4：初始导航的 `duplicated` 问题

应用启动时，如果 URL 是 `/`，而路由配置中 `{ path: '/', redirect: '/dashboard' }`，初次导航会从 `/` 重定向到 `/dashboard`。如果在 `router.isReady()` 前手动调了一次 `router.push('/')`，可能导致内部的初始解析发生冲突。

解法：永远使用 `router.isReady().then(() => app.mount('#app'))`，不要在 `isReady` 前做任何编程式导航。

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
    abortMsg?: string
  }): Promise<boolean> {
    try {
      await router.push(to)
      if (options?.successMsg) {
        ElMessage.success(options.successMsg)
      }
      return true
    } catch (e) {
      if (isNavigationFailure(e, NavigationFailureType.duplicated)) {
        // 重复导航到当前页 → 不需要提示
        return false
      }
      if (isNavigationFailure(e, NavigationFailureType.aborted)) {
        // 被守卫拦截（如无权限）→ 守卫内部已经做了提示，这里不需要额外处理
        return false
      }
      if (isNavigationFailure(e, NavigationFailureType.cancelled)) {
        // 被新导航取消 → 静默
        return false
      }
      // 真正的异常
      console.error('导航异常:', e)
      ElMessage.error('页面跳转失败，请重试')
      return false
    }
  }

  // 封装 replace（不产生历史记录）
  async function redirect(to: RouteLocationRaw): Promise<boolean> {
    try {
      await router.replace(to)
      return true
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

**❌ 不对导航失败做类型区分，所有失败都弹出错误提示**
最常见的反例：保存表单后跳转列表页，`await router.push` 用 try-catch 包裹，catch 中 `ElMessage.error("跳转失败")`。用户连续点击"保存"按钮时触发 duplicated，看到了不相关的错误提示。**必须通过 `isNavigationFailure` + `NavigationFailureType` 区分类型。**

**❌ `router.push` 不 await，导致后续代码在导航完成前执行**
`push` 是异步的（返回 Promise），导航还未完成，DOM 还未更新，你就去操作 DOM 了。虽然很多情况下"看起来正常"，但在异步组件慢的场景下会有 bug。

**❌ 忘记 `router.onError` 做 chunk 加载失败的重载处理**
新版本发布后，旧页面上缓存的 JS 引用到已被删除的 chunk 文件，加载 404。不加处理用户看到的是白屏 + 控制台报错。`router.onError` 中检测 chunk 失败并自动刷新是最低成本的解决方案。

**❌ 使用 `window.location.href` 代替 `router.push` 做错误恢复**
`window.location.href` 会触发完整的页面重载，导致状态丢失。优先尝试 `router.push` + 错误处理。

## 面试信号

当面试官问"路由导航失败了你怎么处理"，你的回答骨架：

1. **Vue Router 的导航是异步的**：`push()` / `replace()` 返回 Promise，失败时抛出 `NavigationFailure`
2. **四种失败类型**：`duplicated`（重复导航）、`cancelled`（被新导航取消）→ 静默忽略；`aborted`（守卫拒绝）→ 按需提示；`redirected`（被重定向）→ 正常行为
3. **检测方式**：`isNavigationFailure(e, NavigationFailureType.xxx)` 精确判断类型，不同类型的处理方式不能混
4. **全局兜底**：`router.onError()` 统一捕获 chunk 加载失败等异常，自动刷新页面
5. **初始化**：`router.isReady()` 等待初始解析完成后再挂载应用，避免时序问题

## 相关阅读

- [路由守卫](./route-guards.md) — `next(false)` 产生 `aborted` 类型，守卫中的取消逻辑
- [动态路由](./dynamic-routing.md) — addRoute 后 `next({ ...to })` 触发新导航，旧的会被 cancelled
- [路由懒加载](./lazy-loading.md) — chunk 加载失败的检测与兜底方案

## 更新记录

- 2026-07：完整填充（Phase 1），含四种失败类型对比、safePush 工厂、onError 全局兜底
