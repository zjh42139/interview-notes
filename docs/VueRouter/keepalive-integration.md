---
title: KeepAlive + Router
description: Vue Router 配合 KeepAlive 实现页面缓存、多标签页管理及滚动位置恢复
category: VueRouter
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - KeepAlive
  - router-view v-slot
  - include
  - onActivated
  - onDeactivated
  - 标签页缓存
---

# KeepAlive + Router

> 后台管理系统里"列表页进详情页再返回"这个场景的体验好坏，基本取决于 KeepAlive 用得对不对。能说出 `router-view` 的 `v-slot` + `KeepAlive` + `<component :is>` 这套组合拳，说明你真正做过中大型项目。

## 一句话总结

KeepAlive 与 Router 配合的核心是 `<router-view v-slot>` 暴露当前路由组件，再通过 `<KeepAlive>` 包裹 `<component :is>` 实现按路由级别缓存组件实例，配合 `include`/`exclude` 和 `onActivated`/`onDeactivated` 生命周期，精确控制哪些页面缓存、缓存多少、何时刷新。

## 核心机制

### 1. 基础配对：`v-slot` + `KeepAlive` + `component :is`

传统写法中 `<router-view>` 是内置组件，你没法在它外面包一层 `<KeepAlive>` 还能精确控制。Vue Router 4 提供了 `v-slot` API 来解决这个问题：

```vue
<!-- App.vue —— 基础用法 -->
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViewNames">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>
```

`v-slot` 暴露了：
- `Component` — 当前匹配到的路由组件（VNode 的 component 定义）
- `route` — 当前的路由对象，可用于 `:key` 绑定

**为什么需要 `:key="route.fullPath"`？**

同一组件在不同路由间复用（如 `/user/1` → `/user/2`），如果不设置 `key`，KeepAlive 会按**组件类型**（组件对象本身）缓存，导致切换参数后复用了缓存的旧数据。用 `fullPath` 作为 key，确保："同组件不同参数 = 不同缓存实例"。

### 2. 按 `route.meta` 精细化控制缓存

```ts
// router/index.ts
const routes = [
  {
    path: '/users',
    name: 'UserList',
    component: () => import('@/views/user/List.vue'),
    meta: { title: '用户列表', keepAlive: true }   // 标记需要缓存
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: () => import('@/views/user/Detail.vue'),
    meta: { title: '用户详情', keepAlive: false }  // 不需要缓存
  }
]
```

```vue
<!-- App.vue —— 根据路由 meta 区分缓存 -->
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="keepAliveRoutes">
      <component :is="Component" :key="route.path" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// 从路由表中提取所有标记了 keepAlive 的组件名
const keepAliveRoutes = computed(() => {
  return router.getRoutes()
    .filter(r => r.meta?.keepAlive)
    .map(r => (r.components?.default as any)?.name ?? r.name)
    .filter(Boolean) as string[]
})
</script>
```

**关键**：`include` 匹配的是**组件的 `name` 属性**，不是路由的 `name`。所以每个试图被缓存的组件必须显式设置 `name`：

```vue
<!-- views/user/List.vue -->
<script setup lang="ts">
defineOptions({ name: 'UserList' })  // 必须设置，KeepAlive 用这个名字匹配
</script>
```

### 3. 双路由视图方案（另一种常见模式）

有些后台系统采用**双 `<router-view>`** 区分缓存/非缓存路由：

```vue
<template>
  <!-- 缓存的路由 -->
  <router-view v-slot="{ Component }">
    <keep-alive :max="10">
      <component :is="Component" :key="$route.fullPath" v-if="$route.meta.keepAlive" />
    </keep-alive>
  </router-view>

  <!-- 不缓存的路由 -->
  <router-view v-slot="{ Component }">
    <component :is="Component" v-if="!$route.meta.keepAlive" />
  </router-view>
</template>
```

这种方式的好处是逻辑清晰，缺点是模板冗余。**推荐用法是 `include`/`exclude` 动态控制**，一套 `<router-view>` 更简洁。

### 4. onActivated / onDeactivated 生命周期

被 KeepAlive 缓存的组件有两种生命周期：

```vue
<script setup lang="ts">
import { onActivated, onDeactivated, ref } from 'vue'

const userList = ref<User[]>([])
const searchKeyword = ref('')

// 激活时（首次挂载 + 从缓存恢复）—— 刷新数据
onActivated(() => {
  // 如果是首次进入，也拿的是最新数据
  fetchUserList(searchKeyword.value)
})

// 失活时（切走，但组件不销毁）—— 停止副作用
onDeactivated(() => {
  // 清理定时器、停止 WebSocket 连接等
  stopPolling()
})
</script>
```

注意：`onMounted` 只在首次创建时触发一次，从缓存恢复时**不触发** `onMounted`。所以如果你既有首次加载逻辑又有恢复刷新逻辑，要同时写 `onMounted` + `onActivated`，或者全部放在 `onActivated` 里。

## 深度拓展

### 追问1：KeepAlive 的缓存 key 到底是什么？

KeepAlive 内部用 `vnode.key ?? vnode.type` 作为缓存 key。`vnode.key` 就是你模板里绑定的 `:key`，`vnode.type` 是组件的定义对象（即 `defineComponent` 的返回值或组件对象本身）。

所以当你不设 `:key` 时，相同组件类型的路由会**共享**同一个缓存实例 —— 这意味着从 `/user/1` 切到 `/user/2`，显示的还是 1 的数据。

### 追问2：max 缓存数量满了之后淘汰谁？

KeepAlive 内部用 **LRU（最近最少使用）** 策略 —— 淘汰最久未被访问的那个缓存实例。具体实现是用 `Map` + `Set`（按插入顺序迭代）维护访问顺序，`max` 超限时删除 `Set` 中的第一个（即最旧的）。详见 [KeepAlive 章节](../Vue3/keepalive.md) 的核心机制部分。

### 追问3：为什么缓存的组件必须在 `defineOptions` 里设置 `name`？

因为 `include`/`exclude` 在组件被 render 时**通过 `vnode.type.name` 或 `vnode.type.__name` 来匹配**。`script setup` 的 SFC 编译时会从**文件名**推断出 `__name`（Vue 3.2.34+ 才参与 include 匹配），但隐式推断有两个坑：路由页面大量叫 `index.vue`，推断出来全是 `index`，相互冲突；低版本 Vue 下 `__name` 不被 KeepAlive 识别。**显式设置 `name` 是最稳妥的做法。**

```ts
// ✅ 显式声明
defineOptions({ name: 'UserList' })

// ❌ 依赖文件名隐式推断：一堆 index.vue 会推断出同名 'index'，include 全部误伤
```

### 追问4：切走时手动释放大数据能优化内存吗？

完全可以。这是 KeepAlive 的最佳实践：

```ts
const bigData = ref<LargeData[]>([])

onDeactivated(() => {
  // 切走时释放大数据集，但保留搜索条件
  bigData.value = []
})

onActivated(() => {
  // 切回时重新请求数据，用保存的搜索条件
  fetchData(searchParams.value)
})
```

这样既保留了搜索条件（组件实例还在，`searchParams` 的值不变），又释放了大量数据占用的内存。这也是为什么后台管理系统的标签页缓存不直接依赖 KeepAlive 的默认行为，而需要手动调优。

## 项目实战

```vue
<!-- 完整的后台管理布局 —— 标签页模式 -->
<!-- layouts/DefaultLayout.vue -->
<template>
  <el-container>
    <el-aside><!-- 侧边栏 --></el-aside>
    <el-container>
      <el-header>
        <!-- 标签页 UI（基于 Pinia store 维护的 visitedViews） -->
        <tab-bar :tabs="visitedViews" @close="closeTab" />
      </el-header>
      <el-main>
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachedViewNames" :max="15">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTabsStore } from '@/store/tabs'

const tabsStore = useTabsStore()

// 需要缓存的组件名列表
const cachedViewNames = computed(() =>
  tabsStore.visitedViews
    .filter(t => t.meta?.keepAlive !== false)
    .map(t => t.name as string)
)

const visitedViews = computed(() => tabsStore.visitedViews)
</script>
```

```ts
// store/tabs.ts —— Pinia 管理标签页
interface Tab {
  title: string
  name: string
  fullPath: string
  meta?: { keepAlive?: boolean }
}

export const useTabsStore = defineStore('tabs', () => {
  const visitedViews = ref<Tab[]>([])

  // router.afterEach 中调用此方法添加标签
  function addVisitedView(route: RouteLocationNormalized) {
    if (route.meta.hidden) return  // 隐藏路由不加入标签页
    const exists = visitedViews.value.find(v => v.fullPath === route.fullPath)
    if (!exists) {
      visitedViews.value.push({
        title: route.meta.title as string,
        name: route.name as string,
        fullPath: route.fullPath,
        meta: route.meta as any
      })
    }
  }

  // 关闭标签时要考虑：如果关闭的是当前激活标签，跳转到哪个标签
  function removeVisitedView(tab: Tab, currentRoute: RouteLocationNormalized) {
    const i = visitedViews.value.findIndex(v => v.fullPath === tab.fullPath)
    if (i !== -1) {
      visitedViews.value.splice(i, 1)
      if (tab.fullPath === currentRoute.fullPath) {
        // 关闭的是当前页 → 跳转到右侧或最后一个标签
        const nextTab = visitedViews.value[i] ?? visitedViews.value[visitedViews.value.length - 1]
        if (nextTab) {
          router.push(nextTab.fullPath)
        } else {
          router.push('/')
        }
      }
    }
  }

  return { visitedViews, addVisitedView, removeVisitedView }
})
```

## 易错点

**❌ 忘记给组件设置 `name`，导致 `include` 不生效**
`include` 匹配的是组件的 `name` 选项，不是路由的 `name`。在 `<script setup>` 中必须显式 `defineOptions({ name: 'XXX' })`。

**❌ 不设 `:key` 导致同组件不同参数数据错乱**
`/user/1` → `/user/2`，不设 `:key`，KeepAlive 按组件类型匹配，显示的是 `/user/1` 的数据。用 `route.fullPath` 或 `route.path + JSON.stringify(route.params)` 作为 key。

**❌ 只在 `onMounted` 中请求数据**
从缓存恢复时 `onMounted` 不触发，列表页显示的是旧数据。应该用 `onActivated` 请求数据（或在 `beforeRouteEnter` 中处理）。

**❌ `max` 值设得太大导致内存溢出**
后台管理系统建议 `max: 10-15`，移动端 H5 建议 `max: 3-5`。标签页模式天然限制打开数量，但也要在 KeepAlive 层面做最后兜底。

## 面试信号

当面试官问"你们项目里怎么配合使用 KeepAlive 和 Vue Router"，你的回答骨架：

1. **基础组合**：`<router-view v-slot>` 暴露 `Component`，配合 `KeepAlive` 包裹 `<component :is>`，`:key` 绑定 `route.fullPath`
2. **精细化控制**：在路由 `meta` 上设置 `keepAlive` 字段，通过 `include` 动态过滤需要缓存的组件名列表
3. **生命周期**：`onActivated` 处理"每次切回来"的逻辑（如刷新数据），`onDeactivated` 清理副作用
4. **标签页实践**：Pinia store 管理已打开视图，`afterEach` 自动添加标签，关闭时联动 `removeVisitedView` 和路由跳转
5. **内存优化**：大数据页面在 `onDeactivated` 中释放数据，`onActivated` 中重新加载

## 相关阅读

- [../Vue3/keepalive.md](../Vue3/keepalive.md) — KeepAlive 组件的 LRU 缓存原理与源码实现
- [../Vue3/生命周期.md](../Vue3/lifecycle.md) — onActivated / onDeactivated 触发的完整时序
- [路由守卫](./route-guards.md) — beforeRouteEnter 与 onActivated 的执行顺序关系
- [scrollBehavior](./scroll-behavior.md) — 与 KeepAlive 配合恢复滚动位置

## 更新记录

- 2026-07-18：事实修正（Phase 3）——缓存 key 表述改为「组件类型（对象本身）」、`__name` 隐式推断的坑改为 index.vue 同名冲突与版本要求（删去「打包后被压缩」的错误说法）
- 2026-07：完整填充（Phase 1），含 v-slot 模式、双路由视图、标签页实战
