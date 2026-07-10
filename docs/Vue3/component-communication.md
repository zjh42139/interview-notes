---
title: 组件通信
description: Vue3 组件通信全景图：props/emit、v-model、ref/defineExpose、provide/inject、slot、Pinia、mitt 七大方式及其适用场景与决策树
category: Vue3
type: mechanism
score: 86
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 组件通信
  - props
  - emit
  - provide
  - inject
  - slot
  - defineExpose
  - ref
---

# 组件通信

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★★★

**面试官问"Vue 组件间怎么通信"，你只回答 props 和 emit 就亏了。** 能列全 7 种方式并说清各自的通信方向和适用场景，画出通信全景图，说明你对 Vue 的组件体系有系统性的认识——这是 P6 到 P7 面试中稳定出现的区分题。

## 一句话总结

**Vue3 组件通信共有 7 种方式：props + emit（父子标准）、v-model（双向语法糖）、ref + defineExpose（父调子方法）、provide + inject（跨层级传递）、slot（内容分发）、Pinia（全局状态）、mitt（事件总线）。选型原则：父子用 props/emit，跨层级用 provide/inject，全局共享用 Pinia，临时通信用 mitt。**

## 核心机制

### 方式一：props + emit -- 父子组件标准通信

```ts
// 子组件
interface Props { title: string; count?: number }
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'close'): void
}>()

// 使用
emit('update', 42)
```

props 是单向数据流——父传子。子组件**不应该**直接修改 props，而是通过 emit 通知父组件修改。这是 Vue 组件通信的铁律。

### 方式二：v-model -- 双向绑定语法糖

```ts
// 本质是 props + emit 的语法糖
// <Child v-model="value" /> 等价于
// <Child :modelValue="value" @update:modelValue="value = $event" />

// 子组件
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>()

// 多个 v-model
// <Child v-model:title="title" v-model:content="content" />
const props = defineProps<{ title: string; content: string }>()
const emit = defineEmits<{ (e: 'update:title', val: string): void; (e: 'update:content', val: string): void }>()
```

详见 [`./v-model.md`](./v-model.md)。

### 方式三：ref + defineExpose -- 父组件调用子组件方法

```ts
// 子组件：通过 defineExpose 暴露方法/属性
const count = ref(0)
function reset() { count.value = 0 }
function validate(): boolean { return count.value > 0 }
defineExpose({ count, reset, validate })

// 父组件：通过 ref 获取子组件实例
const childRef = ref<InstanceType<typeof ChildComponent>>()
function handleReset() {
  childRef.value?.reset()                    // 调用子组件暴露的方法
  childRef.value?.validate()
}
```

**适用场景**：父组件需要调用子组件的方法（如调用表单的 `validate()`、触发子组件的动画、获取子组件的内部状态）。注意：ref 只能拿到子组件显式 `defineExpose` 的内容，不是整个组件实例。

### 方式四：provide + inject -- 跨层级传递

```ts
// 祖先组件：提供数据
const theme = ref<'light' | 'dark'>('light')
const user = reactive({ name: 'admin', role: 'editor' })
provide('theme', readonly(theme))            // readonly 防止子组件修改
provide('user', user)
provide('setTheme', (t: 'light' | 'dark') => { theme.value = t })

// 后代组件：注入数据（可以是任意层级）
const theme = inject<Ref<'light' | 'dark'>>('theme')
const user = inject('user')

// 带默认值
const locale = inject('locale', 'zh-CN')     // 第二个参数为默认值

// Symbol key 避免命名冲突（推荐）
// injectionKeys.ts
export const THEME_KEY = Symbol('theme') as InjectionKey<Ref<'light' | 'dark'>>
```

**适用场景**：跨多层级传递（祖先 -> 任意后代），避免 prop drilling。典型如：全局主题、语言地域、表单上下文（`el-form` 就是通过 provide/inject 让 `el-form-item` 获取校验规则的）。

**与 Pinia 的区别**：provide/inject 绑定在组件树上，Pinia 是全局的。同一个组件树有两个不同实例时，它们的 provide 值各自独立——这是 provide/inject 不可替代的场景。

### 方式五：slot（插槽） -- 内容分发

```ts
// 父组件向子组件传递"内容"（模板片段），而非"数据"
// 默认插槽
<Child>
  <p>这段内容传给子组件的 &lt;slot /&gt;</p>
</Child>

// 具名插槽：子组件定义多个插槽位置
// 子组件模板：
//   <header><slot name="header" /></header>
//   <main><slot /></main>
//   <footer><slot name="footer" /></footer>
// 父组件：
<Child>
  <template #header><h1>标题</h1></template>
  <p>默认内容</p>
  <template #footer><button>确定</button></template>
</Child>

// 作用域插槽：子组件向父组件暴露数据
// 子组件：<slot :item="item" :index="index" />
// 父组件：<template #default="{ item, index }">{{ item.name }}</template>
```

slot 的本质是"父组件写模板，子组件定位置"。作用域插槽让父组件能读取子组件的数据来渲染——最常见的应用就是表格的 `el-table-column` 自定义列。

### 方式六：Pinia -- 全局状态

```ts
// 任意组件间共享，不限于组件树关系
// store/user.ts
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  function login() { /* ... */ }
  return { token, userInfo, login }
})

// 任意组件中
const userStore = useUserStore()
console.log(userStore.token)                 // 全局状态，任何组件都能访问
```

详见 [`../Pinia/defineStore.md`](../Pinia/defineStore.md)。

### 方式七：mitt -- 轻量事件总线

```ts
// Vue3 移除了 Vue2 的 $on/$off/$once，推荐 mitt 替代
import mitt from 'mitt'

// utils/eventBus.ts
type Events = {
  'user:login': { userId: string }
  'theme:change': { theme: 'light' | 'dark' }
  'message': string
}
export const eventBus = mitt<Events>()

// 组件 A：发送事件
eventBus.emit('theme:change', { theme: 'dark' })

// 组件 B：监听事件
eventBus.on('theme:change', ({ theme }) => {
  console.log('主题切换为', theme)
})

// 组件销毁时移除监听（重要！）
onUnmounted(() => {
  eventBus.off('theme:change')
})
```

**适用场景**：两个完全不相关的组件需要通信，用 Pinia 太"重"，用 props 传不了。比如：顶部通知栏收到 WebSocket 消息要通知侧边栏更新计数。注意 `onUnmounted` 中必须移除监听，否则组件销毁后事件仍触发会导致内存泄漏。

## 深度拓展

### 七种方式对比表

| 方式 | 通信方向 | 复杂度 | 适用场景 |
|------|---------|--------|---------|
| props + emit | 父<->子 | 低 | 直接父子关系，标准方式 |
| v-model | 父<->子 | 低 | 双向绑定的表单/输入类组件 |
| ref + defineExpose | 父->子 | 低 | 父调子方法（表单验证、动画控制） |
| provide + inject | 祖先->后代 | 中 | 跨多层级传递（主题、语言、表单上下文） |
| slot | 父->子（内容） | 中 | 容器类组件（对话框、表格、布局） |
| Pinia | 任意方向 | 中 | 全局共享状态（用户信息、权限） |
| mitt | 任意方向 | 中 | 不相关组件间轻量通信（通知、广播） |

### 决策树

```
需要通信的两个组件是什么关系？
├── 直接父子
│   ├── 传数据 → props
│   ├── 子通知父 → emit
│   ├── 双向绑定 → v-model
│   └── 父调子方法 → ref + defineExpose
├── 祖先传后代（跨多级）
│   └── provide + inject
├── 父向子传内容/模板
│   └── slot
├── 全局状态，任意组件需要
│   └── Pinia
└── 不相关组件，临时事件通知
    └── mitt
```

## 项目实战

### 1. Tab 切换 + 内容区域（provide/inject 典型案例）

```ts
// Tabs.vue：祖先组件 provide 当前激活的 tab
const activeTab = ref('')
provide('activeTab', readonly(activeTab))
function switchTab(name: string) { activeTab.value = name }

// TabPane.vue：后代组件 inject，判断自己是否激活
const activeTab = inject<Ref<string>>('activeTab')
const isActive = computed(() => activeTab?.value === props.name)

// 多层嵌套的 TabPane 不需要逐层传 props，直接 inject 即可
```

### 2. 用户选择器组件（v-model + defineExpose）

```ts
// UserPicker.vue：封装用户选择弹窗
const props = defineProps<{ modelValue: string[] }>()          // 已选用户 ID
const emit = defineEmits<{ (e: 'update:modelValue', ids: string[]): void }>()
// ... 内部维护选中状态，确认时 emit('update:modelValue', selectedIds)

// 暴露方法，允许父组件直接打开选择器
defineExpose({ open: () => { dialogVisible.value = true } })

// 父组件使用
const pickerRef = ref<InstanceType<typeof UserPicker>>()
// <UserPicker ref="pickerRef" v-model="selectedUserIds" />
// pickerRef.value?.open()  -- 直接打开选择器
```

### 3. 全局通知系统（mitt 实际应用）

```ts
// WebSocket 收到新消息 → mitt 广播 → 侧边栏徽标数 +1
// websocket.ts
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.type === 'new') {
    eventBus.emit('message', `您有新的审批通知`)
  }
}

// Sidebar.vue
const unreadCount = ref(0)
eventBus.on('message', () => { unreadCount.value++ })
onUnmounted(() => { eventBus.off('message') })               // 必须清理
```

## 易错点

1. **provide 的数据被子组件直接修改** -- 用 `readonly()` 包裹 provide 的数据，把修改方法也 provide 下去，形成"受控修改"
2. **mitt 监听未在 onUnmounted 中清理** -- 组件销毁后事件回调仍存在，导致内存泄漏和异常调用
3. **ref + defineExpose 暴露了不该暴露的内部状态** -- 只暴露必要的方法，不要直接把内部 ref 全暴露出去
4. **provide/inject 的 key 使用字符串** -- 容易命名冲突，推荐使用 `Symbol` + `InjectionKey<T>` 提供类型安全
5. **混淆 provide/inject 和 Pinia 的适用场景** -- provide/inject 绑定在组件树上，同一组件树的两个实例各自独立；Pinia 是全局单例

## 面试信号

面试官问"Vue 组件通信有哪些方式"时，你的回答骨架：
1. **全量枚举**：7 种方式一口气报完（props/emit、v-model、ref/defineExpose、provide/inject、slot、Pinia、mitt）
2. **画出通信方向**：父子（4 种）、跨层级（provide/inject）、任意方向（Pinia、mitt）、内容分发（slot）
3. **说出决策逻辑**：直接父子用 props/emit，跨层级用 provide/inject，全局共享用 Pinia，临时通知用 mitt
4. **给实际场景**：后台系统的 Tab 用 provide/inject，用户选择器用 v-model+defineExpose，全局配置用 Pinia

"面试时最重要的是画出一个通信全景图：哪个方向、用什么方式、为什么。能讲清楚，就说明你的 Vue 组件设计能力是体系化的。"

## 相关阅读

- [v-model 原理](./v-model.md) — 双向绑定语法糖的深入拆解
- [Composition API](./composition-api.md) — Composable 逻辑复用的底层基础
- [defineStore](../Pinia/defineStore.md) — Pinia 全局状态管理
- [路由守卫](../VueRouter/route-guards.md) — 路由层面的组件控制
- [Vue3 知识地图](./index.md)

## 更新记录

- 2026-07-06：初始创建，覆盖 7 种通信方式 + 对比表 + 决策树 + 3 个项目实战场景
