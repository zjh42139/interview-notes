---
title: Vue3 高频面试题
category: 面试题库
type: interview
score: 0
difficulty: 中级
status: reviewed
tags:
  - Vue3
  - 响应式
  - Diff
  - Composition API
  - 组件


---
# Vue3 高频面试题

> 收录前端面试中的高频 Vue3 真题
> 题目按出现频率从高到低排列。

---

### Q1: Vue3 响应式 | 概念题原理（Proxy 实现）

**追问预测**：
- "Proxy 和 defineProperty 的本质区别" → Proxy 代理整个对象——无需递归劫持、能检测新增删除、支持数组和 Map/Set
- "ref 和 reactive 怎么选" → 基本类型用 ref、对象用 reactive。ref 重新赋值不丢响应性
- "为什么 Vue3 比 Vue2 快" → Proxy 惰性代理、静态提升 PatchFlag、编译时优化跳过静态节点
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请详细描述 Vue3 的响应式系统原理，包括 `reactive` 和 `ref` 的实现。与 Vue2 的 `Object.defineProperty` 相比有哪些优势？

**考察点**：
- `Proxy` 拦截 13 种操作（get/set/has/deleteProperty/ownKeys 等）
- `Reflect` 配合 Proxy 使用的原因
- 依赖收集（track）和派发更新（trigger）的流程
- `effect` 副作用函数的实现
- 与 Vue2 对比：Proxy 可拦截数组索引和 length、动态属性新增/删除、不需要递归遍历

> 答案参考：[../Vue3/reactivity.md](../Vue3/reactivity.md)
> 🎤 回答稿：[../面试回答/Vue3/reactivity.md](../面试回答/Vue3/reactivity.md)

---

### Q2: Diff 算法 | 概念题 + 最长递增子序列（LIS）

**追问预测**：
- "key 的作用是什么" → 节点唯一标识——没有 key 时 Diff 只靠索引匹配，内容完全可能不对
- "index 当 key 有什么问题" → 数组头部插入——所有旧元素 index 改变，Diff 认为全部是新节点
- "Diff 为什么是 O(n) 不是 O(n³)" → 只做同层比较——不会把 A 层节点和 B 层节点做对比
> ⭐⭐⭐⭐⭐ | 难度：中高级

**题目**：请描述 Vue3 的 Diff 算法做了哪些优化？为什么要使用最长递增子序列（LIS）？它解决了什么问题？

**考察点**：
- 静态标记（PatchFlags）+ 动态节点靶向更新
- 头头/尾尾/头尾/尾头四步快速比较
- 中间乱序部分的 LIS 算法：找到最长递增子序列后，移动不在序列中的节点
- `key` 在 Diff 中的作用：唯一标识、复用 DOM
- 与 Vue2 双端比较的对比

> 答案参考：[../Vue3/diff-patch.md](../Vue3/diff-patch.md)
> 🎤 回答稿：[../面试回答/Vue3/diff-patch.md](../面试回答/Vue3/diff-patch.md)

---

### Q3: computed | 对比题 vs watch 区别与原理

**追问预测**：
- "computed 和 methods 区别" → computed 有缓存——依赖不变直接返回缓存值，methods 每次重新执行
- "computed 能写吗" → 可以——提供 get 和 set。set 时通常修改依赖的响应式数据
- "computed 的原理" → 内部 effect + 惰性求值 + dirty 标记——依赖变了标记 dirty，访问时才重新计算
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请对比 `computed` 和 `watch` 的区别。`computed` 是如何实现缓存和懒执行的？什么场景下更适合用 `watch`？

**考察点**：
- `computed` 惰性求值：依赖不变时返回缓存值，不重新计算
- `computed` 依赖收集的 `dirty` 标记机制
- `watch` 监听数据变化执行副作用（如 API 请求）
- `computed` 有返回值，`watch` 没有
- `computed` vs `methods`：computed 有缓存，methods 每次调用都执行

> 答案参考：[../Vue3/computed-watch.md](../Vue3/computed-watch.md)
> 延伸：[../Vue3/reactivity.md](../Vue3/reactivity.md)
> 🎤 回答稿：[../面试回答/Vue3/reactivity.md](../面试回答/Vue3/reactivity.md)

---

### Q4: nextTick | 概念题 原理与使用场景

**追问预测**：
- "nextTick 的原理" → 回调推入微任务队列——Promise.then 优先，降级 setImmediate/setTimeout
- "什么时候必须用 nextTick" → 修改数据后立即读取 DOM 状态——此时 DOM 还未更新
- "nextTick 和 setTimeout 区别" → nextTick 微任务当前 tick 结束执行，setTimeout 宏任务下一个 tick
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请解释 `nextTick` 的实现原理。在什么场景下需要用到 `nextTick`？Vue3 的 `nextTick` 与 Vue2 有什么差异？

**考察点**：
- DOM 更新是异步的，`nextTick` 在 DOM 更新后执行回调
- 内部使用微任务（Promise.then）优先，降级方案（MutationObserver -> setImmediate -> setTimeout）
- Vue 的调度队列（scheduler job queue）确保更新只执行一次
- 典型场景：获取更新后的 DOM 元素

> 答案参考：[../Vue3/nextTick.md](../Vue3/nextTick.md)
> 延伸：[../Vue3/scheduler.md](../Vue3/scheduler.md)

---

### Q5: KeepAlive | 概念题 原理 + LRU 缓存策略

**追问预测**：
- "KeepAlive 怎么实现缓存" → 内部 Map——key 是组件名 value 是 VNode；有 max 属性时触发 LRU 淘汰
- "缓存的组件多了哪些生命周期" → activated 切回时触发、deactivated 切出时触发
- "LRU 怎么实现 O(1)" → 哈希表定位节点 + 双向链表管理顺序
> ⭐⭐⭐⭐ | 难度：中高级

**题目**：`<KeepAlive>` 组件的实现原理是什么？它的缓存策略是怎样的？如何使用 LRU 算法管理缓存？

**考察点**：
- 组件实例缓存到 `cache` Map 中，`keys` 数组记录访问顺序
- LRU（最近最少使用）：超过 `max` 时淘汰最久未访问的组件
- `activated` / `deactivated` 生命周期钩子
- 虚拟 DOM 层面：渲染缓存的 vnode 而非创建新 vnode
- `include` / `exclude` 的字符串/正则/数组匹配

> 答案参考：[../Vue3/keepalive.md](../Vue3/keepalive.md)

---

### Q6: Composition | 对比题 API vs Options API

**追问预测**：
- "为什么引入 Composition API" → 逻辑复用替代 mixin、TS 类型推导更好、代码按功能而非选项组织
- "setup 里不能访问 this 为什么" → setup 在组件实例创建前执行——此时 this 还不存在
- "Options 和 Composition 能混用吗" → 可以——但同一功能不要分散在两种写法中
> ⭐⭐⭐⭐ | 难度：中级

**题目**：Composition API 相比 Options API 解决了什么问题？请举例说明在大型组件中两者的差异。

**考察点**：
- Options API 按选项类型分割，逻辑分散（data/methods/watch 分开）
- Composition API 按功能组织，逻辑内聚
- `setup` 中抽取组合函数（composables）实现逻辑复用
- Mixin 的问题：命名冲突、来源不清晰、隐式依赖
- 更好的 TypeScript 类型推导支持

> 答案参考：[../Vue3/composition-api.md](../Vue3/composition-api.md)

---

### Q7: 为什么 v-for | 概念题 需要绑定 key

**追问预测**：
- "用 index 当 key 可以吗" → 不可以——数组顺序变化时 index 全错，Diff 全部重建
- "key 必须全局唯一吗" → 不需要——同层唯一即可，不同层级可以复用相同 key
- "v-for 和 v-if 能一起用吗" → Vue3 v-if 优先级更高——不推荐。用 computed 过滤数据
> ⭐⭐⭐⭐ | 难度：中级

**题目**：`v-for` 为什么必须使用 `key`？为什么不能用 `index` 作为 `key`？有什么场景下用 `index` 也问题不大？

**考察点**：
- `key` 是虚拟 DOM 的唯一标识，用于比对算法判断节点是否可复用
- 没有 `key` 时默认"就地复用"，可能导致状态错乱
- `index` 做 key：列表头尾增删导致大量 DOM 更新（所有 key 都变了）
- `index` 可用场景：静态列表、不涉及增删改、无状态组件

> 答案参考：[../Vue3/diff-patch.md](../Vue3/diff-patch.md)
> 🎤 回答稿：[../面试回答/Vue3/diff-patch.md](../面试回答/Vue3/diff-patch.md)

---

### Q8: Vue3 vs Vue2 | 对比题 全面对比

**追问预测**：
- "Vue3 删除了哪些 API" → $on/$off/$once 事件总线、filters 过滤器、$listeners 合并到 $attrs
- "Vue2 项目迁移 Vue3 的最大成本" → 生态配套——Element UI→Element Plus、Vuex→Pinia
- "Vue3 的 Tree Shaking 支持" → Vue3 按需导出——未使用的 API 打包时自动移除，减小产物体积
> ⭐⭐⭐⭐ | 难度：中级

**题目**：请从响应式、编译优化、API 设计、性能、TypeScript 支持等方面，全面对比 Vue3 和 Vue2 的差异。

**考察点**：
- 响应式：Proxy vs Object.defineProperty
- 编译优化：静态提升（hoistStatic）、预字符串化、PatchFlags 靶向更新
- 虚拟 DOM: Block Tree 优化跳过静态内容
- API：Composition API + `<script setup>` vs Options API
- Tree Shaking：按需引入（Vue2 全量引入）
- TypeScript 支持从"可以写"到"一等公民"
- Fragment / Teleport / Suspense 新内置组件

> 答案参考：[../Vue3/index.md](../Vue3/index.md)
> 延伸：[../Vue3/reactivity.md](../Vue3/reactivity.md)
> 🎤 回答稿：[../面试回答/Vue3/reactivity.md](../面试回答/Vue3/reactivity.md)

---

### Q9: 父子组件 | 概念题生命周期执行顺序

**追问预测**：
- "完整生命周期顺序" → 父 beforeCreate→created→beforeMount→子 created→mounted→父 mounted
- "setup 替代了哪些生命周期" → beforeCreate 和 created——setup 在这两者之前执行
- "keep-alive 组件多了什么" → activated 切回时触发、deactivated 切出时触发
> ⭐⭐⭐⭐ | 难度：中级

**题目**：父子组件在挂载和更新时，生命周期的执行顺序是怎样的？为什么是这个顺序？

**考察点**：
- 挂载：父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted
- 更新：父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated
- 卸载：父 beforeUnmount -> 子 beforeUnmount -> 子 unmounted -> 父 unmounted
- 原因：父组件的挂载需要子组件先完成（递归渲染），更新也需要子组件先更新完才能确认父组件更新完

> 答案参考：[../Vue3/lifecycle.md](../Vue3/lifecycle.md)

---

### Q10: ref vs | 对比题 reactive 详解

**追问预测**：
- "reactive 解构后还响应式吗" → 不是——解构是值拷贝。必须用 toRefs() 保持响应性
- "ref 在模板中需要 .value 吗" → 不需要——模板自动解包顶层 ref。嵌套 ref 不自动解
- "template ref 和响应式 ref 是同一个东西吗" → 不是——template ref 是 DOM 引用，响应式 ref 是数据包装
> ⭐⭐⭐⭐ | 难度：中级

**题目**：`ref` 和 `reactive` 分别适用于什么场景？`ref` 的内部实现是怎样的？为什么模板中 `ref` 可以自动解包 `.value`？

**考察点**：
- `reactive` 通过 Proxy 代理对象，不能代理基本类型
- `ref` 内部创建 class RefImpl，用 `.value` 的 getter/setter 做依赖追踪
- `ref` 可包装任意类型，`reactive` 只能包装对象
- 模板中 ref 自动解包（编译时处理），reactive 不需要解包
- `toRef` / `toRefs` 解构响应式对象保持响应性

> 答案参考：[../Vue3/reactivity.md](../Vue3/reactivity.md)
> 🎤 回答稿：[../面试回答/Vue3/reactivity.md](../面试回答/Vue3/reactivity.md)

---

### Q11: watchEffect | 对比题 vs watch

**追问预测**：
- "watchEffect 和 watch 的本质区别" → watchEffect 自动追踪依赖立即执行；watch 惰性需指定数据源且支持旧值
- "watchEffect 怎么停止" → 返回值是 stop 函数——调用即停止追踪
- "什么时候用 watchEffect" → 不需要对比旧值、依赖动态变化多——如根据多个响应式值更新 DOM
> ⭐⭐⭐ | 难度：中级

**题目**：`watchEffect` 和 `watch` 有什么区别？`watchEffect` 的自动依赖追踪是如何实现的？

**考察点**：
- `watch` 指定监听源，`watchEffect` 自动追踪回调中用到的响应式数据
- `watchEffect` 默认立即执行，`watch` 需配置 `immediate: true`
- `watch` 可获取 oldValue 和 newValue，`watchEffect` 不能直接获取
- `watchEffect` 内部使用 effect 的 track 自动收集依赖
- `flush` 配置：'pre'（渲染前）、'post'（渲染后）、'sync'（同步）

> 答案参考：[../Vue3/computed-watch.md](../Vue3/computed-watch.md)

---


### Q13: Scheduler 调度器 + 批量更新机制
> ⭐⭐⭐ | 难度：中高级

**题目**：Vue3 的调度器（Scheduler）是如何实现批量异步更新的？`queueJob` 和 `queueFlush` 的流程是怎样的？

**考察点**：
- 同步修改多次，DOM 只更新一次：通过微任务队列合并更新
- `isFlushing` 标记防止重复入队
- `job` 允许去重（`allowRecurse` 控制递归更新）
- `queueJob` 将更新任务加入队列，`queueFlush` 异步执行
- `nextTick` 通过 `queueFlush` 的回调队列实现

> 答案参考：[../Vue3/scheduler.md](../Vue3/scheduler.md)
> 延伸：[../Vue3/nextTick.md](../Vue3/nextTick.md)

---

### Q14: 自定义指令 | 概念题（Custom Directive）

**追问预测**：
- "自定义指令的 7 个钩子" → created/mounted/updated/beforeUnmount/unmounted——与组件生命周期对齐
- "指令和组件的区别" → 指令操作底层 DOM 元素，组件封装 UI + 逻辑
- "v-permission 指令原理" → mounted 时查权限数组——无权限则 el.parentNode.removeChild(el)
> ⭐⭐⭐ | 难度：中级

**题目**：如何在 Vue3 中注册和使用自定义指令？指令的生命周期钩子有哪些？请实现一个 `v-permission` 权限指令。

**考察点**：
- 指令钩子：`created` / `beforeMount` / `mounted` / `beforeUpdate` / `updated` / `beforeUnmount` / `unmounted`
- 与 Vue2 的钩子名称差异（bind -> beforeMount, inserted -> mounted 等）
- 指令参数（binding.value / arg / modifiers）
- `v-permission` 实现：根据用户权限列表移除 DOM 元素
- 实际场景：防抖指令、点击外部关闭指令、水印指令

> 答案参考：[../Vue3/composition-api.md](../Vue3/composition-api.md)

---


### Q16: Pinia | 对比题 vs Vuex

**追问预测**：
- "Pinia 和 Vuex 核心区别" → Pinia 无 mutations、完整 TS 推导、去 modules 改为多 store
- "Pinia 怎么持久化" → pinia-plugin-persistedstate——自动同步 localStorage 或 sessionStorage
- "多个 store 之间怎么互相访问" → 直接 import 另一个 store——互相可见，循环引用注意处理
> ⭐⭐⭐ | 难度：中级

**题目**：Pinia 与 Vuex 相比有哪些优势？为什么 Vue 官方推荐使用 Pinia？

**考察点**：
- Pinia 移除了 mutations，只保留 state / getters / actions
- 完整的 TypeScript 类型推导，不需要额外的类型声明
- 没有模块嵌套（namespaced modules），store 扁平化管理
- 支持多个 store 直接相互引用
- 更轻量（~1KB）、去除了 `commit` / `dispatch` 的概念
- 支持 Composition API 风格定义 store

> 答案参考：[../Vue3/composition-api.md](../Vue3/composition-api.md)

---

### Q17: `<script setup>` 语法糖

**追问预测**：
- "script setup 和普通 script 的区别" → 语法糖——无需 return、自动暴露顶层绑定、更好的 TS 推导
- "怎么暴露方法给父组件" → defineExpose——显式声明对外可访问的属性
- "defineProps 和 defineEmits 怎么用" → 编译宏——无需 import，直接在 script setup 中使用
> ⭐⭐⭐ | 难度：中级

**题目**：`<script setup>` 相比标准 `<script>` 有哪些简化和优势？`defineProps` / `defineEmits` / `defineExpose` 是怎样工作的？

**考察点**：
- 顶层变量/导入自动暴露给模板
- 编译时宏 `defineProps`/`defineEmits`/`defineExpose`（无需导入）
- 更少的样板代码，更好的 IDE 支持
- `useSlots` / `useAttrs` 替代 `$slots` / `$attrs`
- 编译为 `setup()` 函数，运行时开销为零

> 答案参考：[../Vue3/composition-api.md](../Vue3/composition-api.md)

---

