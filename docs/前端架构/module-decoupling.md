---
title: 模块解耦
description: 前端模块解耦方案：高内聚低耦合原则、props/emit、provide/inject、Pinia store 全局通信、微内核架构的适用场景对比
category: 前端架构
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - 模块解耦
  - 高内聚低耦合
  - provide/inject
  - 微内核
  - Pinia
---

# 模块解耦

> "当你改一个业务模块时，需要同时改另外三个模块的代码 —— 这就是耦合的信号。"

---

## 一句话总结

模块解耦的核心是**高内聚低耦合**：业务模块内部高度自洽（自己的状态、自己的逻辑、自己的组件），模块之间通过**明确的接口**通信。Vue3 生态下，跨模块通信有 4 层选择：`props/emit`（父子） -> `provide/inject`（跨层级） -> `Pinia store`（全局共享） -> 微内核事件总线（插件式架构）。选择的原则是：**能局部不全局，能单向不双向**。

---

## 核心机制

### 1. 模块通信方式全景对比

| 通信方式 | 适用距离 | 数据流向 | 耦合度 | 典型场景 |
|---------|---------|---------|-------|---------|
| `props` + `emit` | 父子组件 | 单向（父→子→父） | 低 | 表单组件传值 |
| `v-model` | 父子组件 | 双向语法糖 | 低 | 输入框封装 |
| `provide` + `inject` | 祖先→任意子孙 | 单向（上→下） | 中 | 主题/语言/权限上下文 |
| Pinia store | 任意距离 | 任意方向 | 中 | 用户信息、权限列表、购物车 |
| 事件总线（mitt） | 任意距离 | 任意方向 | 高 | 不推荐，仅遗留代码使用 |
| 微内核插件 | 框架→插件 | 单向（核→插件） | 最低 | 权限模块、多 Tab 页签系统 |

### 2. props/emit：最基础的解耦方式

```vue
<!-- 父组件 -->
<UserTable
  :data="userList"
  :loading="loading"
  @delete="handleDelete"
  @edit="handleEdit"
/>

<!-- 子组件 UserTable.vue -->
<script setup lang="ts">
interface Props {
  data: User[]
  loading: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  delete: [id: number]
  edit: [user: User]
}>()
</script>
```

**原则**：子组件不关心数据从哪来、操作到哪去，只管"渲染 props"和"通知父组件"。

### 3. provide/inject：跨越组件层级的利器

```ts
// 祖先组件 —— 提供权限上下文
// src/views/system/index.vue
import { provide, ref } from 'vue'

const permissionMap = ref<Record<string, boolean>>({})
provide('permissionMap', permissionMap)      // key 用 Symbol 更安全

// 深层子孙组件 —— 注入权限上下文
// src/views/system/user/components/UserActions.vue
import { inject } from 'vue'

const permMap = inject<Ref<Record<string, boolean>>>('permissionMap')!
const canDelete = computed(() => permMap.value['user:delete'] ?? false)
```

**适用场景**：不需要全局 Pinia store 但又要跨多层级传递的数据，如当前页面的编辑模式、表单禁用状态、主题色。

### 4. Pinia store：全局共享的终极方案

```ts
// src/stores/app.ts
export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const currentTheme = ref<'light' | 'dark'>('light')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, currentTheme, toggleSidebar }
})
```

Pinia 是模块间通信的**事实标准**，因为：
- 任何组件都可以直接读写，不需要层层传递
- 天然响应式，数据变更自动同步到所有使用者
- devtools 支持时间旅行调试

---

## 深度拓展

### 追问1：为什么事件总线不推荐？

```ts
// ❌ mitt 事件总线 —— 项目管理噩梦
import mitt from 'mitt'
const bus = mitt()
bus.emit('user:deleted', { id: 1 })       // 谁在监听？不知道
bus.on('user:deleted', handleDelete)      // 谁在发送？不知道
```

三大问题：
1. **不可追踪**：事件从哪来、到哪去，只能全局搜索字符串
2. **内存泄漏**：组件卸载时忘记 `bus.off()`，监听器残留
3. **难以维护**：新增人员不知道有哪些事件、谁用谁

**替代方案**：如果不适合 Pinia（如纯逻辑触发），用 `provide/inject` + callback 模式。

### 追问2：微内核架构怎么落地？

微内核 = **core 包（壳子）** + **业务插件（功能模块）**。核只提供生命周期钩子和插件注册机制，不包含业务逻辑。

```ts
// @my-project/core —— 只定义接口
export interface AppPlugin {
  name: string
  install: (ctx: PluginContext) => void | Promise<void>
}
export interface PluginContext {
  app: App                    // Vue 应用实例
  router: Router              // 路由实例
  registerRoute: (route: RouteRecordRaw) => void
  onReady: (cb: () => void) => void
}

// src/plugins/index.ts —— 核的插件管理器
const plugins: AppPlugin[] = []

export async function bootstrap(pluginList: AppPlugin[]) {
  for (const plugin of pluginList) {
    await plugin.install(ctx)     // 依次安装，插件间可通信
  }
}

// permission-plugin/index.ts —— 权限插件（独立 npm 包）
export const PermissionPlugin: AppPlugin = {
  name: 'permission',
  install(ctx) {
    ctx.registerRoute({ path: '/admin', component: AdminLayout })
    ctx.onReady(() => {
      // 应用启动后，初始化权限数据
    })
  },
}
```

核不需要知道插件怎么实现；插件只需要遵守核定义的接口。新增业务模块 = 新增一个插件 —— 对核零侵入。

---

## 项目实战

### 权限模块与业务模块的解耦（完整思路）

问题：业务模块（如用户管理）需要知道"当前用户能否删除"。

**错误做法** —— 业务模块直接依赖权限模块：

```vue
<!-- ❌ 业务组件直接 import 权限工具 -->
<script setup>
import { hasPermission } from '@/plugins/permission'
const canDelete = hasPermission('user:delete')
</script>
```

**正确做法** —— 通过 provide/inject 注入，业务组件只消费：

```ts
// 1. layout 层或路由守卫层统一计算权限，注入
// src/layout/index.vue
const permMap = computed(() => ({
  'user:delete': hasPermission('user:delete'),
  'user:edit': hasPermission('user:edit'),
}))
provide('permissionMap', permMap)

// 2. 业务组件只注入，不 import 权限模块
// src/views/user/components/ActionBar.vue
const permMap = inject('permissionMap')
const canDelete = computed(() => permMap.value['user:delete'])
```

**好处**：如果将来权限模块从 RBAC 换成 ABAC，业务组件一行代码不用改 —— 解耦完成。

---

## 易错点

1. **❌ provide 的数据层级不清晰**：祖先 provide 了 `theme`，5 层以下子孙 inject，中间可能被其他组件覆盖，排查困难。建议用 `Symbol` 作为 key 避免冲突。

2. **❌ Pinia store 过大**：把所有全局状态塞进一个 store，文件超过 500 行。拆成 `useUserStore`、`useAppStore`、`usePermissionStore`。

3. **❌ 循环依赖**：`storeA` 里 `useStoreB()`，`storeB` 里又 `useStoreA()`。Pinia 的 `useStore()` 必须在 setup 函数内调用，能缓解但不能根治。

---

## 面试信号

当面试官问"你们项目怎么解耦的"，你的回答结构：

1. **先说原则**："高内聚低耦合，每个业务模块文件夹内部闭环"
2. **再说通信**："父子用 props/emit，跨层级用 provide/inject，全局共享用 Pinia"
3. **最后亮点**："权限和数据用 provide 注入，业务组件不 import 权限模块，实现了框架层和业务层的彻底解耦"

---

## 相关阅读

- [项目分层设计](./project-structure.md) — 分层是解耦的基础
- [组件设计](./component-design.md) — 组件接口设计决定了耦合程度
- [设计模式](./design-patterns.md) — 策略、观察者等模式在解耦中的应用

---

## 更新记录

- 2026-07-06：完成内容填充，新增加 4 种通信方式对比表、微内核架构落地实现、权限与业务解耦完整思路
