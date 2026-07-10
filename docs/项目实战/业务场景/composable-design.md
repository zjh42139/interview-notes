---
title: Composable 设计
description: Vue3 Composable / Hook 的设计原则与实践：单一职责、可组合、自动清理，覆盖 useRequest/useTable/usePermission/useDialog 等核心封装
category: 项目实战
type: project
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - composable
  - hook
  - useRequest
  - useTable
  - usePermission
  - 封装
---

# Composable 设计

> ⭐⭐⭐⭐⭐｜难度：中高级｜项目：★★★★★

**面试官问"你们项目里怎么复用逻辑"，如果你只说 Mixin 或复制粘贴，直接挂。** Composable 是 Vue3 逻辑复用的核心范式——和 React Hooks 同理念，但基于 Vue 的响应式系统。能把 useRequest、useTable、usePermission 的设计讲清楚，说明你具备了中高级工程师的核心能力：抽象和封装。

## 一句话总结

**Composable 是 Vue3 的逻辑复用方案——将可复用的有状态逻辑封装成函数，遵循单一职责、可组合、自动清理三大原则，通过返回 ref/reactive 让组件按需消费响应式状态。**

## 核心机制

### 为什么封装 Composable

```ts
// ❌ 没有 Composable：数据加载逻辑散落在每个组件里
const loading = ref(false)
const data = ref([])
const error = ref(null)
async function fetchData() {
  loading.value = true
  try { data.value = await api.getList() }
  catch (e) { error.value = e }
  finally { loading.value = false }
}
// 这段逻辑在 10 个组件里重复出现……

// ✅ 封装成 Composable：一行引入，逻辑复用
const { data, loading, error, execute } = useRequest(() => api.getList())
```

### 三大设计原则

```ts
// 原则一：单一职责 —— 一个 composable 只做一件事
// useTable 只管表格数据+分页，usePermission 只管权限判断，互不干扰

// 原则二：可组合 —— composable 之间可以互相调用
function useTablePage() {
  const pagination = usePagination()          // 复用纯分页逻辑
  const { data, loading, execute } = useRequest(api.getList) // 复用请求逻辑
  // 组合起来，对外暴露统一接口
  return { data, loading, pagination, search }
}

// 原则三：自动清理 —— onUnmounted 中清除副作用
function usePolling(fn: () => void, interval = 5000) {
  const timer = setInterval(fn, interval)
  onUnmounted(() => clearInterval(timer))     // 组件销毁时自动清理
}
```

### 返回值设计

```ts
// 返回 ref/reactive，而非直接值（保持响应式）
// ✅ 正确
export function useCounter() {
  const count = ref(0)
  function increment() { count.value++ }
  return { count, increment }                // count 是 ref，调用方可 watch/computed
}

// ❌ 错误
export function useCounter() {
  let count = 0
  function increment() { count++ }
  return { count, increment }                // count 是普通 number，失去响应式
}
```

## 深度拓展

### 核心 Composable 实践

#### useRequest -- 通用请求封装

```ts
// 封装 loading/error/data + 请求去重 + 竞态处理 + 自动重试
export function useRequest<T>(
  fn: () => Promise<T>,
  options?: { retry?: number; retryDelay?: number }
) {
  const data = ref<T>()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 竞态处理：保证只有最后一次请求的结果生效
  let version = 0

  async function execute() {
    const currentVersion = ++version         // 递增版本号
    loading.value = true
    error.value = null

    let retries = options?.retry ?? 0
    while (true) {
      try {
        const result = await fn()
        if (currentVersion === version) {    // 只应用最新一次的结果
          data.value = result
        }
        return result
      } catch (e) {
        if (retries-- <= 0) {
          if (currentVersion === version) error.value = e as Error
          throw e
        }
        await new Promise(r => setTimeout(r, options?.retryDelay ?? 1000))
      }
    }
  }

  // 组件卸载时标记过期，防止 setData 到已销毁组件
  onUnmounted(() => { version = -1 })

  return { data: readonly(data), loading: readonly(loading), error: readonly(error), execute }
}
```

**竞态处理**：用户快速切换 Tab，请求 A 和 B 先后发出。B 先返回，A 后返回。如果不处理，界面上会显示 A 的结果而不是 B 的。解决方案：闭包计数器 `version`，每次请求递增，只应用 `version` 匹配的结果。

#### useTable -- 表格数据+分页+搜索

```ts
export function useTable<T>(fetchFn: (params: any) => Promise<{ list: T[]; total: number }>) {
  const { data, loading, execute } = useRequest(fetchFn)
  const list = ref<T[]>([])
  const total = ref(0)
  const pagination = reactive({ page: 1, pageSize: 20 })
  const searchForm = ref<Record<string, any>>({})

  async function fetch() {
    const params = { ...pagination, ...searchForm.value }
    await execute(params)
    list.value = data.value?.list ?? []
    total.value = data.value?.total ?? 0
  }

  function onSearch(form: Record<string, any>) {
    searchForm.value = form
    pagination.page = 1                       // 搜索后重置到第一页
    fetch()
  }

  function onPageChange(page: number) {
    pagination.page = page
    fetch()
  }

  onMounted(() => fetch())

  return { list, total, loading, pagination, onSearch, onPageChange, refresh: fetch }
}
```

#### usePagination -- 纯分页逻辑

```ts
export function usePagination(defaultPageSize = 20) {
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  function reset() { page.value = 1 }
  function next() { if (hasNext.value) page.value++ }
  function prev() { if (hasPrev.value) page.value-- }

  return { page, pageSize, total, totalPages, hasNext, hasPrev, reset, next, prev }
}
```

#### usePermission -- 权限判断封装

```ts
// Composable 形式封装权限判断，替代指令/v-if 中写死的权限码
export function usePermission() {
  const store = useUserStore()
  const permissions = computed(() => store.permissions ?? [])

  function hasPermission(code: string): boolean {
    return permissions.value.includes(code)
  }
  function hasAnyPermission(...codes: string[]): boolean {
    return codes.some(c => permissions.value.includes(c))
  }
  function hasAllPermissions(...codes: string[]): boolean {
    return codes.every(c => permissions.value.includes(c))
  }

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions }
}

// 使用
const { hasPermission } = usePermission()
// <el-button v-if="hasPermission('user:delete')">删除</el-button>
```

#### useDialog -- 弹窗控制

```ts
export function useDialog() {
  const visible = ref(false)
  const confirmLoading = ref(false)

  function open()  { visible.value = true }
  function close() { visible.value = false; confirmLoading.value = false }
  function toggle(){ visible.value = !visible.value }

  async function onConfirm(handler: () => Promise<void>) {
    confirmLoading.value = true
    try { await handler(); close() }
    catch { /* 错误处理留给调用方 */ }
    finally { confirmLoading.value = false }
  }

  return { visible, confirmLoading, open, close, toggle, onConfirm }
}
```

### Composable vs Pinia：何时用哪个

| 维度 | Composable | Pinia |
|------|-----------|-------|
| 作用域 | 组件实例级（每次调用独立） | 应用级（全局单例） |
| 适用场景 | 组件内复用的**行为逻辑** | 跨组件共享的**全局状态** |
| 典型例子 | useTable、useDialog、useRequest | 用户信息、主题、权限列表 |
| 是否响应式 | 返回 ref/reactive | state 本身就是 reactive |

**判断标准**：这个状态需要多个不相关组件共享吗？需要 -> Pinia；不需要 -> Composable。表格页的 `useTable` 每个表格实例独立，用 Composable；用户登录信息全局一份，用 Pinia。

## 项目实战

### 1. 后台管理 CRUD 页面完整 Composable 组合

```ts
// 一个完整的列表页 = useTable + useDialog + usePermission 组合
function useCrudPage<T>(fetchFn: any) {
  const table = useTable<T>(fetchFn)
  const dialog = useDialog()
  const { hasPermission } = usePermission()

  function handleEdit(row: T) {
    if (!hasPermission('data:edit')) return
    dialog.open()
    // formData.value = { ...row }
  }

  function handleDelete(id: string) {
    if (!hasPermission('data:delete')) return
    // 调用删除 API -> table.refresh()
  }

  return { ...table, ...dialog, hasPermission, handleEdit, handleDelete }
}
```

### 2. 自动保存草稿 Composable

```ts
export function useAutoSave(key: string, getData: () => object, interval = 10000) {
  const lastSaved = ref<string>('')

  function save() {
    const data = getData()
    localStorage.setItem(key, JSON.stringify(data))
    lastSaved.value = new Date().toLocaleTimeString()
  }

  function restore(): object | null {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  }

  const timer = setInterval(save, interval)
  onUnmounted(() => {
    clearInterval(timer)
    save()                                   // 组件销毁时最后一次保存
  })

  return { lastSaved, restore }
}
```

## 易错点

1. **在 Composable 外部修改 ref 值** -- 返回 `readonly()` 包裹的 ref，防止调用方直接修改内部状态
2. **忘记自动清理** -- 定时器/事件监听/WebSocket 必须在 `onUnmounted` 中清除，否则内存泄漏
3. **竞态条件未处理** -- `useRequest` 中多次快速调用，必须用计数器或 `AbortController` 保证只有最新一次结果生效
4. **Composable 和 Pinia 混用** -- 把 Composable 的状态当成全局的用，结果在两个组件里各创建了一份独立状态，数据对不上
5. **返回值不是响应式** -- 返回普通值而不是 ref/reactive，调用方无法 watch

## 面试信号

面试官问"你们项目怎么封装通用逻辑"时，你的回答骨架：
1. **先说设计原则**：单一职责、可组合、自动清理（三个词就够）
2. **举 2-3 个实际示例**：useRequest（请求封装+竞态处理）、useTable（表格+分页+搜索）、usePermission（权限判断）
3. **说出和 Pinia 的选择边界**：全局状态用 Pinia，组件级复用用 Composable
4. **强调清理**：onUnmounted 中清除定时器和事件，避免内存泄漏

"三板斧——设计原则、核心示例、清理保底，缺一不可。"

## 相关阅读

- [Axios 封装](../基础设施/axios-encapsulation.md) — useRequest 的上游依赖
- [Composition API](../../Vue3/composition-api.md) — Composable 的底层基础
- [defineStore](../../Pinia/defineStore.md) — Pinia 与 Composable 的对比选择
- [响应式原理](../../Vue3/reactivity.md) — 理解 ref/reactive 的底层机制
- [项目实战知识地图](../index.md)

## 更新记录

- 2026-07-06：初始创建，覆盖 Composable 三大设计原则 + useRequest/useTable/usePermission/useDialog/usePagination 五类核心实践
