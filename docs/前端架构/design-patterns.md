---
title: 设计模式在前端
description: 结合 Vue3 源码讲设计模式：策略、观察者/发布订阅、单例、装饰器、代理、适配器在前端工程中的实际应用
category: 前端架构
type: comparison
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - 设计模式
  - 策略模式
  - 观察者模式
  - 发布订阅
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
}

// 带参数的规则用"工厂函数"生成 Validator——
// 注意它的类型是 (len: number) => Validator，不能直接塞进上面的 Record<string, Validator>
const maxLength = (len: number): Validator => (v) =>
  v?.length > len ? `最多${len}个字符` : null

function validate(value: any, rules: Validator[]): string | null {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

// 使用时：新增规则只需加一个函数，不修改 validate 逻辑
const emailRules = [validators.required, validators.email]
validate('', emailRules)                    // '必填'
validate('a'.repeat(20), [maxLength(10)])   // '最多10个字符'
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

### 2. 观察者 vs 发布订阅：Vue 响应式的灵魂

两者常被混为一谈，但面试官爱问的恰恰是区别：**有没有中间人**。

**观察者模式**：Subject 直接持有 Observer 列表，状态变了就地遍历通知——没有中间层，目标和观察者互相知道对方的接口。

```ts
// 观察者模式：目标直接持有观察者集合——Vue3 的 Dep 就是这个结构
class Subject {
  private observers = new Set<() => void>()

  subscribe(fn: () => void) { this.observers.add(fn) }  // 登记观察者
  notify() { this.observers.forEach(fn => fn()) }       // 直接遍历通知
}

const dep = new Subject()
dep.subscribe(() => console.log('组件重新渲染'))
dep.notify()  // 数据变更 → Subject 直接通知所有观察者
```

**发布订阅模式**：发布者和订阅者互不感知，全部经过一个**事件中心**（Broker）按事件名转发。

```ts
// 发布订阅：多了一个事件中心（events 映射表），双方只认识它
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

const bus = new EventEmitter()
bus.on('user:login', user => console.log('侧边栏刷新', user))  // 订阅者不知道谁在发布
bus.emit('user:login', { name: 'admin' })                     // 发布者不知道谁在订阅
```

| 维度 | 观察者模式 | 发布订阅模式 |
|------|-----------|-------------|
| **结构** | Subject 直接持有 Observer 列表 | 发布者/订阅者经**事件中心**转发 |
| **耦合** | 目标知道观察者的存在（接口级耦合） | 双方互不感知，只依赖事件中心 |
| **典型实现** | Vue3 的 dep→effect、IntersectionObserver | EventEmitter、EventBus、Node.js events |

一句话记忆：**发布订阅 = 观察者 + 中间人**——把"谁通知谁"从直连改成经纪人转发，解耦更彻底，代价是数据流更难追踪（EventBus 难维护的根源）。

**Vue3 响应式属于观察者模式**：每个响应式属性的 dep 直接持有依赖它的 effect 集合，没有独立的事件中心。

- `track()` —— 把当前 `activeEffect` 加入该属性的 dep（登记观察者）
- `trigger()` —— 属性变更时遍历 dep 里的 effect 依次执行（直接通知）
- `effect(fn)` —— 创建观察者本身

面试时能说清"Vue 响应式是观察者（dep 直连 effect），EventBus 是发布订阅（经事件中心）"，比背"观察者模式有 Subject 和 Observer"强 10 倍。

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
| **单例** | 调度器的任务队列 `queue` 与 `nextTick` 共用的微任务 Promise（模块级唯一）——注意 `createApp()` 是工厂而非单例，Vue3 特意用它摆脱 Vue2 全局 Vue 对象的单例污染 |
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

- 2026-07-18：二审——观察者与发布订阅拆分为两种结构（新增 Subject 直连示例、有无中间人对比表），Vue3 响应式归位为观察者模式（原文误作"加强版发布-订阅"）；修正策略模式 maxLength 类型错误（工厂函数移出 `Record<string, Validator>`）；修正源码模式表单例行（createApp 是工厂而非单例，改为调度器任务队列）
- 2026-07-06：完成内容填充，所有模式均绑定 Vue3 源码或项目场景，新增 Vue3 源码模式索引表
