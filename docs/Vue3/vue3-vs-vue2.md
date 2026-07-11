---
title: Vue3 vs Vue2 全方位对比
description: Vue3 相比 Vue2 的完整变化：响应式、API设计、编译优化、性能、TypeScript支持、新内置组件、移除的API、迁移策略
category: Vue3
type: comparison
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - Vue3
  - Vue2
  - 对比
  - 迁移
  - Proxy
  - Composition API
---

# Vue3 vs Vue2 全方位对比

> "Vue3 相比 Vue2 有哪些改进"是面试开场白级别的高频题。回答不能只停留在"响应式变了"——面试官在等你说出响应式、编译、API、生态四个维度的完整图景。

## 一句话总结

**Vue3 的核心改进分四个层面：响应式用 Proxy 替代 defineProperty（能检测新增删除+数组）；API 用 Composition API 解决逻辑复用和 TS 支持；编译器加 PatchFlag/Block Tree 把 Diff 从 O(n) 优化到接近 O(动态节点数)；打包体积降低 41%（移除非核心 API + Tree Shaking）。**

---

## 一、响应式系统

| 维度 | Vue2 | Vue3 |
|------|------|------|
| 实现 | `Object.defineProperty` | `Proxy` + `Reflect` |
| 新增/删除属性 | ❌ 检测不到，需要 `$set` | ✅ 直接检测 |
| 数组索引/长度 | ❌ 检测不到 | ✅ 直接检测 |
| Map/Set/WeakMap/WeakSet | ❌ 不支持 | ✅ 全部支持 |
| 初始化性能 | 递归遍历所有属性做劫持 | 惰性代理——访问时才递归 |
| 内存 | 每个属性一个 getter/setter | 一个 Proxy 代理整个对象 |
| 响应式 API | 仅 `Vue.observable` | ref/reactive/shallowRef/toRaw 等全套工具 |

### Proxy 带来但 defineProperty 做不到的

```javascript
// Vue2 做不到的：
const state = reactive({})
state.newKey = 'hello'  // ✅ Proxy 拦截 set——响应式生效

const arr = reactive([])
arr[0] = 'first'  // ✅ Proxy 拦截数组索引赋值

const map = reactive(new Map())
map.set('key', 'value')  // ✅ Proxy 拦截 Map 操作
```

---

## 二、API 设计

### Composition API vs Options API

| 维度 | Options API | Composition API |
|------|------------|----------------|
| 代码组织 | 按选项类型分散 | 按功能逻辑聚合 |
| 逻辑复用 | mixin（命名冲突/来源不清） | composable 函数（显式 import） |
| TypeScript | 需要额外类型体操 | 原生完整推导 |
| tree shaking | 差——API 全挂 this 上 | 好——导入才打包 |
| 学习曲线 | 低（直观） | 中（需要理解响应式引用） |

### `<script setup>` 语法糖

Vue2 需要 `export default { data, methods, computed }`；Vue3 `<script setup>` 顶层变量自动暴露给模板、defineProps/defineEmits 编译宏零样板代码、更好的 IDE 类型提示。

---

## 三、编译时优化

这是 Vue3 快的最关键原因，也是面试中区分"背过答案"和"真正理解"的分水岭：

| 优化 | 机制 | 效果 |
|------|------|------|
| **PatchFlag** | 编译时给动态绑定打标记——只有 class 会变就只比对 class | 跳过 90%+ 的属性比对 |
| **Block Tree** | 把动态节点收集到 flat array——Diff 时不遍历静态部分 | 跳过整个静态子树 |
| **静态提升** | 静态 VNode 提到 render 外——不参与每次的 createVNode | 减少内存分配和 GC |
| **预字符串化** | 连续静态节点编译为 innerHTML 字符串——一个 DOM 操作替代 N 个 | 挂载速度 ↑ 300%+ |
| **Target** | 编译时标记动态 children——Diff 只走动态子节点 | 接近 O(动态节点数) |
| **Event Cache** | 内联事件处理函数缓存——不触发子组件 props 变化 | 减少子组件更新 |

### PatchFlag 示例

```html
<!-- Vue2 编译后：整个 div 需要全量 Diff -->
<div id="static" :class="dynamic" :style="dynamicStyle">
  <span>{{ msg }}</span>
</div>

<!-- Vue3 编译后：只标记 class、style、text 三个 flag -->
_createVNode('div', { id: 'static', class: _ctx.dynamic }, [
  _createVNode('span', null, _ctx.msg, 1 /* TEXT */)
], 2 /* CLASS */ | 4 /* STYLE */)
```

---

## 四、新增组件与能力

| 组件/能力 | 说明 | Vue2 |
|-----------|------|------|
| **Fragment** | 组件可以返回多个根节点——不需要 `<div>` 包裹 | ❌ 必须单根节点 |
| **Teleport** | 把内容渲染到 DOM 树的其他位置——如弹窗渲染到 `<body>` | ❌ |
| **Suspense** | 异步组件的加载/错误/fallback 统一管理 | ❌ 需手动 |
| **多 v-model** | `v-model:title` + `v-model:content` | ❌ 只有一个 v-model + .sync |
| **动态插槽名** | `<template #[slotName]>` | ❌ 只有静态名 |
| **Emits 声明** | `defineEmits(['submit'])`——显式声明、类型安全 | ❌ 隐式 |

---

## 五、移除 / 废弃的 API

| Vue2 API | Vue3 替代 |
|----------|----------|
| `$on` / `$off` / `$once` | mitt（第三方事件总线）或 Pinia/provide+inject |
| `.sync` 修饰符 | 合并到 v-model 参数语法：`v-model:propName` |
| `filters` | 全局用 computed 或函数替代 |
| `$listeners` | 合并到 `$attrs` |
| `Vue.extend` | `defineComponent` |
| `Vue.set` / `Vue.delete` | 不需要——Proxy 自动检测 |
| `Vue.prototype.xxx` | `app.config.globalProperties` |
| `new Vue()` | `createApp()` |
| `Vue.mixin()` | 不推荐——用 composable 替代 |
| event bus 模式 | Pinia / provide+inject |
| `keyCode` 修饰符 (`@keyup.13`) | 用 key name (`@keyup.enter`) |

---

## 六、性能数据

| 指标 | Vue2 | Vue3 | 提升 |
|------|------|------|------|
| 打包体积（min+gzip） | ~22KB | ~13KB | ↓41% |
| 初始化速度 | 慢（递归劫持） | 快（惰性 Proxy） | ↑2x |
| Diff 速度 | O(模板大小) | 接近 O(动态节点数) | ↑1.3-2x |
| 内存占用 | 高（每个属性独立 getter/setter） | 低（一个 Proxy） | ↓30%+ |
| SSR 速度 | 基准 | 优化后 | ↑2-3x |

---

## 七、迁移策略

### 渐进式迁移

1. **先升级构建工具**：切换到 Vite（Vue CLI → Vite）——不涉及 Vue 版本
2. **Vue2 + Composition API 插件**：安装 `@vue/composition-api`——在 Vue2 中试用 Composition API
3. **逐步替换组件**：新组件用 `<script setup>` 写，旧组件保留 Options API——Vue3 兼容 Options API
4. **消除破坏性变更**：替换 `$on/$off`→Pinia、`filters`→computed、`.sync`→v-model 参数、`$listeners`→合并到 `$attrs`
5. **升级生态依赖**：Vuex→Pinia、Vue CLI→Vite、Element UI→Element Plus、Vue 2→Vue 3

### 兼容性说明

- Vue3 模板兼容 Options API——旧代码大多数能直接跑
- IE11 不支持（Vue3 只用 Proxy，无法 polyfill）
- `@vue/compat`（兼容构建）：Vue2→Vue3 迁移过渡方案——对 Vue2 API 发出废弃警告但不报错

---

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Vue3 相比 Vue2 有什么变化" | 追问 Proxy 解决了 defineProperty 什么问题 |
| "除了响应式还有什么改进" | 追问编译时优化（PatchFlag/Block Tree） |
| "Vue2 项目迁移 Vue3 要注意什么" | 追问 $on/$off 替代方案、生态库迁移成本 |

---

## 相关阅读

- [响应式原理](./reactivity.md) — Proxy 实现细节 + track/trigger
- [Composition API](./composition-api.md) — composable + script setup
- [Diff / Patch](./diff-patch.md) — PatchFlag + Block Tree 的运行时代码
- [v-model 原理](./v-model.md) — Vue3 v-model 参数语法 + defineModel

---

## 更新记录

- 2026-07-11：新建（响应式/API/编译/性能/新增组件/移除API/迁移策略七个维度）
