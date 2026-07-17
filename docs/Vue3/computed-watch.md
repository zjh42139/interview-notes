---
title: computed / watch
description: Vue3 中 computed 与 watch 的实现原理及 scheduler 调度机制
category: Vue3
type: mechanism
score: 86
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - computed
  - watch
  - watchEffect
  - scheduler
---

# computed / watch

> 面试频率仅次于响应式原理。面试官从"computed 和 watch 区别"切入，然后往缓存和调度深挖。

## 一句话总结

**computed 是惰性求值的派生状态**（依赖变了不立刻算，有人读才算），**watch 是被动观察的回调**（依赖变了立刻执行副作用）。共同点是底层都基于 `ReactiveEffect` + `scheduler`。

## 核心机制

### 1. computed：带缓存的懒计算

```ts
// 简化版 computed 实现（源码: packages/reactivity/src/computed.ts）
class ComputedRefImpl<T> {
  private _value!: T
  private _dirty = true                    // ✅ 脏标记，缓存的核心
  private effect: ReactiveEffect

  constructor(getter: () => T, private _setter?: (v: T) => void) {
    // computed 内部也是一个 effect，但有特殊的 scheduler
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true                 // 依赖变化时，只标记 dirty，不立即计算
        trigger(this, 'value')             // 通知 computed 的订阅者
      }
    })
  }

  get value(): T {
    if (this._dirty) {                     // 脏了才计算
      this._value = this.effect.run()
      this._dirty = false
    }
    track(this, 'value')                   // 收集 computed 自己的依赖者
    return this._value                     // 干净时直接返回缓存
  }

  set value(newVal: T) {
    this._setter?.(newVal)                  // 调用用户提供的 setter
  }
}
```

**核心设计**：
- `_dirty` 标记实现缓存：依赖不变时重复读取返回上次结果，不重新计算
- `scheduler` 回调：依赖变化时只把 `_dirty = true`，不主动计算 —— **惰性求值**
- 链式依赖：`computedA → computedB → template`，A 变了只标记 B dirty，真正读取 B 时才级联计算

### 2. watch：命令式的主动观察

```ts
// watch 的核心：给被观察的响应式数据创建 effect，scheduler 里执行回调
function watch(source, cb, { deep, immediate, flush }) {
  // 1. 把 source 转为 getter 函数
  let getter = isRef(source)
    ? () => source.value
    : isReactive(source)
      ? () => source                                    // reactive 对象
      : source                                           // 已经是函数

  // 2. deep: true → 递归遍历触发所有属性的 track
  if (deep) getter = () => traverse(source)

  let oldValue: any
  const effect = new ReactiveEffect(getter, () => {
    // scheduler: 依赖变化时执行
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  })

  if (immediate) {
    // 立即执行回调（此时 oldValue 为 undefined）
  } else {
    oldValue = effect.run()   // 先收集依赖 + 记录 oldValue
  }
}
```

### 3. watchEffect：自动收集，无需手动指定源

```ts
// watchEffect 不用显式声明依赖，执行期间自动收集
watchEffect(() => {
  // 自动追踪 count.value 和 name.value
  console.log(`count: ${count.value}, name: ${name.value}`)
})
// 等价于：
watch([count, name], ([c, n]) => console.log(`count: ${c}, name: ${n}`))
```

**区别**：`watchEffect` 初始化时立即执行一次（收集依赖），`watch` 默认惰性除非设 `immediate: true`。

## 深度拓展

### 追问1：computed 内部依赖了多个 ref，为什么只计算一次？

**关键机制：惰性求值 + 幂等 dirty 标记，而非异步合并。**

当 A 和 B 同时变化时，每个依赖变更都会触发 computed effect 的 scheduler 回调，但 scheduler 只做一件事：**设置 `this._dirty = true`**。这个操作是幂等的 —— 设置 1 次和设置 100 次的效果完全一样（true 就是 true）。此时**不会立即重新计算**，真正的计算延迟到 `computed.value` 被读取时才执行（惰性求值）。

```ts
// computed scheduler 做的事情非常少，是同步的
scheduler: () => {
  if (!this._dirty) {
    this._dirty = true       // 幂等：重复设置还是 true
    trigger(this, 'value')   // 通知依赖 computed 的订阅者（如 template）
  }
}
```

**整个过程是同步的，与 nextTick / 微任务无关**。这也是为什么可以在同一个同步代码块中既修改依赖又读取 computed.value 并获得最新值的根本原因。

> **对比**：组件渲染 effect 的 scheduler 才会将 effect 推入微任务队列（通过 `queueJob`），实现"同一 tick 内多次修改只触发一次重新渲染"。computed 使用的是完全不同的懒惰策略。

### 追问2：computed 返回函数的陷阱

```ts
// ❌ 错误：computed 返回的是一个函数，每次调用都重新执行，没有缓存
const getFiltered = computed(() => {
  return (keyword: string) => items.value.filter(i => i.includes(keyword))
})
// 使用时: getFiltered.value('search') → 每次 filter 都是新的执行

// ✅ 正确思路：把 keyword 也变成响应式数据
const keyword = ref('')
const filtered = computed(() =>
  items.value.filter(i => i.includes(keyword.value))
)
```

### 追问3：computed setter 在 v-model 中的应用

```html
<!-- checkbox 全选/反选是 computed get+set 的经典场景 -->
<script setup>
const selectedIds = ref<string[]>([])
const allItems = ref<Item[]>([])

const isAllSelected = computed({
  get: () => selectedIds.value.length === allItems.value.length,
  set: (checked: boolean) => {
    selectedIds.value = checked ? allItems.value.map(i => i.id) : []
  }
})
</script>
<template>
  <el-checkbox v-model="isAllSelected">全选</el-checkbox>
</template>
```

### 追问4：watch / watchEffect 的 onCleanup 有什么用？

`onCleanup` 用于清理上一次副作用的"残留"。当 watch 的回调是异步操作（如请求数据）且依赖变化触发新一轮回调时，上一轮可能还未完成，`onCleanup` 注册的清理函数会在下一次回调执行前被调用：

```ts
watch(keyword, (newVal, oldVal, onCleanup) => {
  let cancelled = false
  const timer = setTimeout(() => { /* 防抖逻辑 */ }, 300)

  // 注册清理函数：下次 keyword 变化时先执行
  onCleanup(() => {
    cancelled = true        // 标记过期
    clearTimeout(timer)     // 取消防抖定时器
  })
  // 适用于：竞态请求（fetch 还未返回时又触发了新的）、定时器、事件监听注销等
})

// watchEffect 同样支持
watchEffect((onCleanup) => {
  const id = setInterval(() => { /* ... */ }, 1000)
  onCleanup(() => clearInterval(id))  // 自动追踪的依赖变化时清除上次的定时器
})
```

**典型场景**：搜索框输入防抖 + 请求竞态。用户快速输入 "vue" → "vue3" → "vue3 源码"，前两次请求未返回时被 `onCleanup` 标记为过期，抛弃结果，只有最后一次有效。

## 项目实战

```ts
// 1. 搜索筛选 —— computed 动态过滤列表
const keyword = ref('')
const status = ref('all')
const tableData = ref<Item[]>([])

const filteredData = computed(() => {
  return tableData.value
    .filter(i => !keyword.value || i.name.includes(keyword.value))
    .filter(i => status.value === 'all' || i.status === status.value)
})
// template 中直接 v-for="item in filteredData"

// 2. 表格合计行 —— computed 自动求和
const totalAmount = computed(() =>
  tableData.value.reduce((sum, i) => sum + i.amount, 0)
)

// 3. watch 监听路由变化重新请求数据
const route = useRoute()
watch(
  () => route.params.id,
  (newId) => {
    fetchDetail(newId)
  }
)

// 4. watchEffect 初始化数据（自动收集）
watchEffect(() => {
  // 自动监听所有在 setup 中用到的响应式依赖
  if (userStore.isLoggedIn) {
    fetchNotifications().then(data => notifications.value = data)
  }
})
```

## 易错点

**❌ watch 一定比 computed 好 —— 场景不同**
计算属性的值是派生数据，应该用 computed（返回一个新值）。副作用（发请求、操作 DOM、存 localStorage）应该用 watch。computed 产出一个值；watch 的回调不产出值（`watch()` 调用本身的返回值是停止函数）。

**❌ computed 可以异步 —— 不推荐**
computed 的 getter 必须是同步函数，返回 Promise 会导致值不稳定。需要异步派生数据时，考虑 `asyncComputed`（社区方案）或改用 watch + ref。

**❌ watchEffect 需要手动指定依赖**
watchEffect **不需要**也不支持手动指定依赖 —— 它的卖点就是自动收集。watch 才是手动指定的。

**❌ deep: true 直接传 reactive 对象就能深层监听**
Vue3 中当 watch 的 source 是一个 reactive 对象时，**默认就是 deep 监听**（自动深层）。需要显式 `deep: true` 的是 watch 一个返回对象的 getter 函数。

## 面试信号

| 问题 | 信号 |
|------|------|
| "computed 和 watch 区别" | 基础关 |
| "computed 怎么实现缓存" | dirty 标记 + scheduler，你能说出来就过了中级 |
| "computed 依赖变了什么时候重新计算" | 惰性求值 —— 读的时候才重新算 |
| "手写一个简化版 computed" | 高阶，需要理解 ReactiveEffect + dirty + track/trigger |

## 相关阅读

- [响应式原理](./reactivity.md) — computed/watch 的底层依赖
- [Scheduler](./scheduler.md) — computed 的 scheduler 回调如何延迟计算
- [手写题 compose-pipe](../手写题/compose-pipe.md)

## 更新记录

- 2026-07：完整填充（Phase 2），加入 computed 简化源码、全选实战、异步陷阱
