---
title: 设计模式在前端
description: 结合 Vue3 源码讲设计模式：策略、观察者、单例、装饰器、代理、适配器在前端工程中的实际应用
category: 前端架构
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
tags:
  - 设计模式
  - 策略模式
  - 观察者模式
  - 单例模式
  - 代理模式
  - 适配器模式
---

# 设计模式在前端

> "面试官想听的不是你背 GoF 23 种设计模式的定义，而是你能结合 Vue 源码和项目场景，说出'我在这里用策略模式替代了 200 行的 if-else'。"

---

## 一句话总结

设计模式在前端的价值不是"用上"，而是**用对场景**。策略模式替代 if-else 地狱，观察者模式是 Vue 响应式的基石，单例管理全局实例，装饰器让 Composables 可组合，Proxy 驱动 Vue3 响应式，适配器统一异构数据。6 种模式覆盖 90% 的日常架构决策。

---

## 核心机制

### 1. 策略模式：消灭 if-else 地狱

```ts
// ❌ 反模式：表单校验 — 每个字段都写 if-else
function validate(value: any, rule: string): string | null {
  if (rule === 'required') {
    if (!value) return '必填'
  } else if (rule === 'email') {
    if (!/^[\w-]+@/.test(value)) return '邮箱格式错误'
  } else if (rule === 'phone') {
    if (!/^1[3-9]\d{9}$/.test(value)) return '手机号格式错误'
  }
  // 加一个规则 = 加一个 if 分支 = 违反开闭原则
}

// ✅ 策略模式：规则可插拔、可扩展
type Validator = (value: any) => string | null

const validators: Record<string, Validator> = {
  required: (v) => (!v ? '必填' : null),
  email:    (v) => (!/^[\w-]+@/.test(v) ? '邮箱格式错误' : null),
  phone:    (v) => (!/^1[3-9]\d{9}$/.test(v) ? '手机号格式错误' : null),
  maxLength: (len: number) => (v) =>
    v?.length > len ? `最多${len}个字符` : null,
}

function validate(value: any, rules: Validator[]): string | null {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

// 使用时：新增规则只需加一个函数，不修改 validate 逻辑
const emailRules = [validators.required, validators.email]
validate('', emailRules)  // '必填'
```

**第二个经典场景：权限判断**

```ts
// ❌ if-else 权限判断
if (role === 'admin') { /* 全部权限 */ }
else if (role === 'editor') { /* 编辑权限 */ }
else if (role === 'viewer') { /* 只读权限 */ }

// ✅ 策略模式
const permissionStrategies: Record<string, string[]> = {
  admin:  ['*'],
  editor: ['user:view', 'user:edit', 'article:*'],
  viewer: ['user:view', 'article:view'],
}
const permissions = permissionStrategies[role] || []
```

### 2. 观察者模式（发布-订阅）：Vue 响应式的灵魂

```ts
// 手写 EventEmitter — 理解 Vue3 的 effect track/trigger 前身
class EventEmitter {
  private events = new Map<string, Set<Function>>()

  on(event: string, fn: Function) {
    if (!this.events.has(event)) this.events.set(event, new Set())
    this.events.get(event)!.add(fn)
  }

  off(event: string, fn: Function) {
    this.events.get(event)?.delete(fn)
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach(fn => fn(...args))
  }
}
```

Vue3 响应式系统本身就是一个**加强版发布-订阅**：
- `track()` = `on('read_key', activeEffect)` —— 订阅数据变更
- `trigger()` = `emit('write_key', newValue)` —— 通知订阅者
- `effect(fn)` = 创建订阅者（观察者）

面试时把这个关联讲清楚，比背"观察者模式有 Subject 和 Observer"强 10 倍。

### 3. 单例模式：全局只有一个实例

```ts
// 场景1：全局 Loading 服务
// src/utils/loading.ts
import { ElLoading } from 'element-plus'

class LoadingService {
  private instance: ReturnType<typeof ElLoading.service> | null = null

  show(text = '加载中...') {
    if (this.instance) return              // 已存在，不重复创建
    this.instance = ElLoading.service({ fullscreen: true, text })
  }

  hide() {
    this.instance?.close()
    this.instance = null
  }
}

export const loadingService = new LoadingService()  // 导出唯一实例

// 场景2：Pinia store 本质就是单例
// defineStore('user', ...) — 不管在多少个组件里 useUserStore()，
// 拿到的永远是同一个 store 实例（Pinia 内部用 Map 缓存）
```

### 4. 装饰器模式：HOC 与 Composables

```ts
// Vue3 Composables = 函数式装饰器
// 为组件"装饰"上额外的能力，而不修改组件本身

// 场景：给任意组件加上"权限检查"能力
export function withPermission(permission: string) {
  return function usePermissionCheck() {
    const hasAccess = computed(() => hasPermission(permission))
    return { hasAccess }
  }
}

// 使用：在任何组件里"装饰"上权限检查
const { hasAccess: canDelete } = withPermission('user:delete')()
const { hasAccess: canEdit } = withPermission('user:edit')()

// 场景2：为 fetch 装饰上 loading 和 error 处理
export function useRequest<T>(fetcher: () => Promise<T>) {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T>()

  async function execute() {
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}
// 任何请求函数都可以被 useRequest"装饰"
const { loading, data, execute } = useRequest(() => getUserList(params))
```

### 5. 代理模式：Proxy 无处不在

```ts
// Vue3 响应式 = 代理模式最佳实践
const state = reactive({ count: 0 })
state.count++  // Proxy 代理了读写操作，自动 track + trigger

// 场景2：图片懒加载 — 代理 img.src
function lazyLoad(img: HTMLImageElement, src: string) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src                      // 真正设置 src
        observer.unobserve(img)
      }
    })
  })
  observer.observe(img)
}

// 场景3：API 请求缓存代理
function createCachedFetcher<T>(fetcher: () => Promise<T>, ttl = 5000) {
  let cache: { data: T; timestamp: number } | null = null
  return async (): Promise<T> => {
    if (cache && Date.now() - cache.timestamp < ttl) return cache.data
    const data = await fetcher()
    cache = { data, timestamp: Date.now() }
    return data
  }
}
```

### 6. 适配器模式：统一异构数据

```ts
// 场景：后端不同微服务返回格式不统一
// A 服务返回：{ code: 0, result: [...], msg: 'ok' }
// B 服务返回：{ status: 200, data: { items: [...] }, message: 'success' }

// 适配器统一为前端内部格式
interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

function adaptServiceA<T>(res: any): ApiResponse<T> {
  return {
    data: res.result,
    message: res.msg,
    success: res.code === 0,
  }
}

function adaptServiceB<T>(res: any): ApiResponse<T> {
  return {
    data: res.data.items,
    message: res.message,
    success: res.status === 200,
  }
}

// axios 响应拦截器 = 全局适配器
request.interceptors.response.use(
  (response) => adaptServiceA(response.data),  // 统一出口
  (error) => Promise.reject(error),
)
```

---

## 深度拓展

### 追问：Vue3 源码中哪些地方用了设计模式？

| 设计模式 | Vue3 源码中的体现 |
|---------|------------------|
| **观察者** | `effect/track/trigger` — 整个响应式系统 |
| **代理** | `reactive()` 返回的 Proxy 对象 |
| **单例** | `createApp()` 创建的应用实例（全局唯一） |
| **策略** | `patchKeyedChildren` 中的 Diff 算法分支（快速路径 vs 全量 Diff） |
| **装饰器** | Compiler 的 `transform` 插件体系（transformElement、vModel 等） |
| **适配器** | `renderer` 的 `nodeOps` — 适配 DOM / SSR / Canvas 不同渲染目标 |

---

## 项目实战

实际项目中不需要刻意使用设计模式，但**识别场景是关键**：

- 看到 **if-else 覆盖 5+ 种情况**且经常需要新增分支 -> 策略模式
- 看到**多个组件都需要同一段逻辑** -> Composables（装饰器）
- 看到**后端返回格式不统一** -> 适配器
- 看到**全局弹窗/通知/Loading 被多次创建** -> 单例

---

## 易错点

1. **❌ 过度设计**：3 个 if-else 不需要策略模式 —— 代码比原来的 if-else 还长。
2. **❌ 背 GoF 定义**：面试官问"你用过什么设计模式"，你回答"单例模式确保一个类只有一个实例" —— 这是背书，不是经验。正确回答："我们项目的全局 Loading 就是单例，原因是..."
3. **❌ 模式混用**：一个组件同时用 5 种模式，看起来"高大上"，实际维护者根本看不懂。

---

## 面试信号

面试官问"你用过什么设计模式"时，你的回答脚本：

1. **先抛 Vue 源码**：先说 Vue3 响应式的观察者模式（track/trigger），展现你对框架底层有理解
2. **再讲项目**：说用策略模式替代了权限判断的 if-else，用适配器统一了 3 个微服务的返回格式
3. **最后总结**："设计模式不是为了用而用，是识别到代码的坏味道后自然地重构过去"

---

## 相关阅读

- [Vue3 响应式原理](../Vue3/reactivity.md) — 观察者+代理模式的源码级实现
- [模块解耦](./module-decoupling.md) — 策略模式在权限模块的应用
- [组件设计](./component-design.md) — 装饰器模式（Composables）在组件中的应用

---

## 更新记录

- 2026-07-06：完成内容填充，所有模式均绑定 Vue3 源码或项目场景，新增 Vue3 源码模式索引表
