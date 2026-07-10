---
title: 持久化
description: Pinia 状态持久化插件 pinia-plugin-persistedstate 的配置、安全注意事项与自定义序列化
category: Pinia
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - 持久化
  - persist
  - localStorage
  - sessionStorage
  - 安全
  - Pinia
---

# 持久化

> 页面刷新后 Pinia state 丢失是后台管理系统的常见痛点。持久化插件解决这个问题，但 token 的安全存储是面试高频追问。

## 一句话总结

`pinia-plugin-persistedstate` 让 Pinia state 自动同步到 localStorage/sessionStorage。配置 `paths` 可精确控制持久化字段，`beforeRestore`/`afterRestore` 钩子实现数据清洗。核心安全原则：敏感数据（token）不存 localStorage，必须放 httpOnly cookie。

## 核心机制

### 1. 安装与基础配置

```bash
npm install pinia-plugin-persistedstate
```

```ts
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
```

### 2. 在 Store 中启用持久化

```ts
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const refreshToken = ref('')
  const userInfo = ref<UserInfo | null>(null)
  const theme = ref<'light' | 'dark'>('light')

  return { token, refreshToken, userInfo, theme }
}, {
  persist: {
    key: 'user-store',                         // localStorage 中的 key，默认是 store id
    storage: localStorage,                     // 存储介质，默认 localStorage
    paths: ['token', 'userInfo', 'theme'],     // 只持久化这些字段
    // paths: ['token', '!refreshToken'],      // 也可以排除特定字段（加 ! 前缀）
  },
})
```

### 3. 选择 localStorage vs sessionStorage

| 存储方式 | 生命周期 | 适用场景 | 典型数据 |
|---------|---------|---------|---------|
| `localStorage` | 永久存储，除非手动清除 | 跨会话持久化 | 主题设置、语言偏好、用户偏好配置 |
| `sessionStorage` | 关闭标签页即清除 | 单会话临时存储 | 用户登录信息、当前页面的筛选条件 |
| httpOnly cookie | 由服务端控制过期时间 | 敏感数据 | token、refreshToken |

**项目中的选择策略**：

```ts
// 用户信息：用 sessionStorage（关闭浏览器自动清除，安全）
export const useUserStore = defineStore('user', () => {
  const token = ref('')         // 不持久化，存 httpOnly cookie
  const userInfo = ref(null)    // 持久化到 sessionStorage

  return { token, userInfo }
}, {
  persist: {
    storage: sessionStorage,    // 关闭标签页即清除
    paths: ['userInfo'],        // token 不放这里！
  },
})

// 主题设置：用 localStorage（用户偏好，跨会话保留）
export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>('light')
  const sidebarCollapsed = ref(false)

  return { theme, sidebarCollapsed }
}, {
  persist: {
    storage: localStorage,      // 永久保留
    paths: ['theme', 'sidebarCollapsed'],
  },
})
```

### 4. 安全注意事项（高频面试考点）

**为什么 token 不能放在 localStorage 中？**

XSS（跨站脚本攻击）可以通过注入脚本读取 `localStorage.getItem('token')` 获取用户的认证令牌。而 httpOnly cookie 不可以通过 JavaScript 访问，即使页面被注入 XSS 脚本也无法读取。

```ts
// ❌ 危险：token 持久化到 localStorage
persist: {
  storage: localStorage,
  paths: ['token', 'refreshToken'],  // XSS 可以直接读取！
}

// ✅ 安全方案：
// 1. 登录时 token 由后端通过 Set-Cookie 写入 httpOnly cookie
// 2. Pinia state 中的 token 只在内存中，不持久化
// 3. 需要时从 cookie 或服务端获取
```

**如果必须在前端存储 token**（如移动端/某些架构下），至少应该：
- 使用 sessionStorage（标签页关闭即清除）
- 不存储 refreshToken
- 设置较短的过期时间
- 配合 CSP（内容安全策略）防止 XSS

### 5. beforeRestore / afterRestore 钩子

```ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const lastLoginTime = ref<string>('')

  return { userInfo, lastLoginTime }
}, {
  persist: {
    storage: localStorage,

    // 恢复前：可以校验数据合法性、做数据迁移
    beforeRestore(context) {
      console.log('准备恢复数据:', context)
      // 如果存储的数据过期或格式不对，可以返回新对象替换
    },

    // 恢复后：可以做一些初始化操作
    afterRestore(context) {
      // 数据已恢复到 store，可以在这里做后续处理
      if (context.store.userInfo) {
        console.log('用户信息已恢复:', context.store.userInfo.name)
      }
    },
  },
})
```

### 6. 自定义序列化

```ts
// 场景：需要对存储的数据加密/解密，或处理特殊类型（如 Date、Map）
persist: {
  serializer: {
    // 存储前序列化
    serialize(value: any): string {
      // 可以在这里做数据脱敏、或加密
      const sanitized = { ...value }
      delete sanitized.token  // 存储前移除敏感字段
      return JSON.stringify(sanitized)
    },
    // 读取后反序列化
    deserialize(value: string): any {
      const parsed = JSON.parse(value)
      // 可以在这里做数据版本迁移
      return parsed
    },
  },
}
```

实际场景：数据版本升级时的迁移。

```ts
serializer: {
  serialize: JSON.stringify,
  deserialize(value: string) {
    const data = JSON.parse(value)
    // 从 v1 迁移到 v2：userInfo 字段改名了
    if (data.profile && !data.userInfo) {
      data.userInfo = data.profile
      delete data.profile
    }
    return data
  },
}
```

## 深度拓展

### 追问1：不用插件如何手动实现持久化？

用 `$subscribe` 实现最简单的持久化：

```ts
// 手动持久化（学习用途，生产环境推荐用插件）
const store = useAppStore()

// state 变化时自动写入 localStorage
store.$subscribe((_mutation, state) => {
  localStorage.setItem('app-store', JSON.stringify(state))
})

// 应用初始化时恢复
const saved = localStorage.getItem('app-store')
if (saved) {
  store.$state = JSON.parse(saved)
}
```

插件比自己实现的好处：自动去抖、支持 `paths` 过滤、支持多种 storage、处理了循环引用等边缘情况。

### 追问2：多个标签页如何同步状态？

`storage` 事件可以监听其他标签页的 localStorage 变化：

```ts
// 监听其他标签页的 storage 变化
window.addEventListener('storage', (event) => {
  if (event.key === 'user-store') {
    const newState = JSON.parse(event.newValue ?? '{}')
    userStore.$patch(newState)
  }
})
```

注意：`storage` 事件只在**其他标签页**修改 localStorage 时触发，当前标签页不会触发。sessionStorage 不支持跨标签页。

## 项目实战

后台管理系统的持久化配置策略：

```ts
// stores/useAppStore.ts -- 全局配置
export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>('light')
  const locale = ref('zh-CN')
  const sidebarCollapsed = ref(false)
  const breadcrumbEnabled = ref(true)

  return { theme, locale, sidebarCollapsed, breadcrumbEnabled }
}, {
  persist: {
    key: 'app-config',
    storage: localStorage,     // 用户偏好，长保留
    paths: ['theme', 'locale', 'sidebarCollapsed'],
  },
})

// stores/useUserStore.ts -- 用户状态
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  return { userInfo }
}, {
  persist: {
    key: 'user-session',
    storage: sessionStorage,   // 会话级，关闭即清
    paths: ['userInfo'],
  },
})

// stores/useTagsViewStore.ts -- 标签页状态
export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  return { visitedViews, cachedViews }
}, {
  persist: {
    key: 'tags-view',
    storage: sessionStorage,
    paths: ['visitedViews'],
  },
})
```

## 易错点

**持久化了不该持久化的数据（如 WebSocket 实例、DOM 引用）**

```ts
// ❌ ws 实例、element 引用等不可序列化的对象
const ws = ref<WebSocket | null>(null)
// 持久化时 JSON.stringify(ws) 会丢失连接，恢复后是普通对象

// ✅ 只持久化可序列化的基础数据
const connected = ref(false)  // 序列化布尔值安全
```

**忘记处理存储空间满的情况**

`localStorage` 有 5-10MB 的存储限制，写入时可能抛 `QuotaExceededError`。插件内部会 catch 这个错误并静默失败，但你应该知道这个风险，不要试图持久化大量数据（如表格全量数据）。

## 面试信号

- 核心信号：能清楚解释为什么 token 不放在 localStorage（XSS 可读取，httpOnly cookie 不可读）
- 能区分 localStorage 和 sessionStorage 的适用场景（用户偏好 vs 会话状态）
- 能说出持久化插件的核心配置项：key、storage、paths、serializer
- 能将持久化策略和后台管理系统实际场景结合（主题、语言、标签页、用户信息）

## 相关阅读

- [state](./state.md) -- $subscribe 手动持久化的基础机制
- [plugins](./plugins.md) -- persist 插件本质是 Pinia 插件机制的应用
- [权限系统 RBAC](../项目实战/权限系统/permission-rbac.md) -- token 安全存储的完整策略

## 更新记录

- 2026-07-06：初始创建
