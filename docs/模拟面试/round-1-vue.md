---
title: 一面：Vue 框架
description: Vue3 响应式原理 + 组合式 API + 组件通信 + Diff 算法 + 手写，45分钟全流程脚本
category: 模拟面试
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - Vue3
  - 响应式
  - Diff
  - 组合式API
  - 手写
---

# 一面：Vue 框架

> 适用场景：3年前端，Vue3 + TypeScript + Element Plus 后台管理系统 + 组件库封装经验。45分钟全流程脚本，每道题附评分标准和追问阶梯。

---

## 面试开场白（0-5 min）

### 面试官（你）

> "你好，我先简单介绍一下今天的面试流程。本次是 Vue 框架的一面，大概 45 分钟左右，主要会围绕 Vue3 的响应式原理、组合式 API、组件通信和 Diff 算法这几个方向来聊。中间会有一道手写题，最后留几分钟给你提问。先请你花 2-3 分钟简单介绍一下你使用 Vue3 的项目经历，以及你觉得最有挑战的一个技术点。"

**面试官内心OS：**

- 看候选人是否能用几句话把项目说清楚（项目规模、角色、技术栈、核心难点），判断是真实操盘还是跟在后面写页面。
- 如果候选人只说"做了后台管理系统，用了 Element Plus"，追问："这个系统大概有多少个页面？你主要负责了哪些模块？遇到过什么技术难点？"
- 如果候选人说"封装了组件库"，立刻标记 —— 这是高潜信号，后续 Q7（组件通信）、Q9（手写）可以适当放大考察比例。
- 如果候选人支支吾吾说不清项目细节，即使后面原理背得滚瓜烂熟也要扣分——项目经验的水分嫌疑。

**时间控制：** 严格控制在 5 分钟以内。如果候选人讲得太长，3 分钟时优雅打断："好的，了解了，我们进入具体的技术问题。"

---

## Vue3 响应式体系（5-15 min）

### Q1：reactive vs ref（5-8 min）

**面试官：**

> "先从最常用的开始。reactive 和 ref 都可以定义响应式数据，它们有什么区别？什么场景下用 reactive，什么场景下用 ref？底层的实现差异是什么？"

**考点：**

- Vue3 响应式 API 的设计哲学
- Proxy 拦截 vs getter/setter 类访问器的本质差异
- ref 的自动解包机制（template 中、reactive 对象中）
- 对基本类型和对象类型的适配策略
- 实际项目中的最佳实践

**预期回答（中级水平基准线）：**

| 维度 | reactive | ref |
|------|----------|-----|
| 适用类型 | 只接受对象类型（Object/Array/Map/Set） | 任意类型（基本类型 + 对象类型） |
| 底层实现 | `new Proxy(target, handlers)` | `class RefImpl` 的 `get value()` / `set value()` 访问器 |
| 访问方式 | 直接 `.属性名` | `.value` 访问（template 中自动解包） |
| 替换整个对象 | 不支持（解构会丢失响应式，直接 `state = ...` 是赋值给变量而非修改代理） | 支持（`ref.value = newValue`，触发 setter） |
| 解构保持响应式 | 需要 `toRefs()` | 本身就是独立的响应式引用 |
| 内部处理对象 | — | 对象类型会内部调用 `toReactive()` 转为 Proxy 代理 |

**面试官追问阶梯：**

**追问 1（中级）：** "为什么 ref 要设计 `.value` 这种方式？直接像 reactive 一样不香吗？"

> 预期回答：JavaScript 的基本类型（number、string、boolean）是值传递，无法用 Proxy 代理。ref 用 `{ value: xxx }` 的对象包装把基本类型"变成"对象，从而统一了响应式系统 —— 基本类型走 getter/setter，对象类型在 getter/setter 内部再包一层 reactive。`.value` 的代价换来了"一套响应式系统覆盖所有类型"的统一性。

**追问 2（中级偏上）：** "shallowRef 和 ref 有什么区别？什么业务场景下适合用 shallowRef？"

> 预期回答：`shallowRef` 只对 `.value` 的顶层引用做响应式处理，不进行深层 reactive 转换。`.value` 被整体替换时触发更新，但 `.value.someProp = xxx` 不触发。典型场景：
> - 大数据量的只读列表（表格数据一次性替换整个数组引用）
> - 第三方库实例对象（ECharts 实例、地图实例等，不需要也不应该被深度代理）
> - 大文件分片上传（只需要顶层引用变了就更新进度条）

> 关键理解：`ref` 内部对对象类型会自动 `toReactive()`，这个递归过程有性能开销。`shallowRef` 跳过了这个开销。

**参考答案链接：**

- [../Vue3/reactivity.md](../Vue3/reactivity.md) —— 第 1 节 reactive 和 ref 底层源码
- [../Vue3/composition-api.md](../Vue3/composition-api.md) —— 项目实战中的使用场景

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只能说出"reactive 用于对象，ref 用于基本类型"，说不出底层差异 |
| 中级 | 能说出 Proxy vs getter/setter 的实现区别，理解 ref 自动解包机制，知道 shallowRef 的存在 |
| 高级 | 能说出 ref 为什么需要 `.value`（基本类型值传递的限制 + 统一响应式系统的设计权衡），能结合项目给出 shallowRef 的具体使用场景和性能收益 |

---

### Q2：Proxy vs Object.defineProperty + 为什么用 Reflect（8-12 min）

**面试官：**

> "Vue2 用的是 Object.defineProperty，Vue3 换成了 Proxy。为什么做这个替换？Proxy 解决了 defineProperty 解决不了的哪些问题？另外 Proxy 的 handler 里为什么要用 Reflect，而不是直接 `target[key]`？"

**考点：**

- defineProperty 的局限性（新增属性、数组索引、delete、性能）
- Proxy 的 13 种拦截能力及其在 Vue3 中的应用
- Reflect 的三个核心作用：this 绑定修正、返回值一致性、API 对应性
- 惰性代理 vs 初始化递归的性能差异
- 对面试官来说：这道题是分水岭 —— 背答案的人说得出"Proxy 能拦截 13 种操作"，实战过的人能解释 Reflect + receiver 为什么解决 getter 的 this 问题

**预期回答（中级水平基准线）：**

**defineProperty 的五大局限：**
1. **无法检测新增属性**：`obj.newProp = 1` 需要 `Vue.set(obj, 'newProp', 1)`
2. **无法检测删除属性**：`delete obj.prop` 需要 `Vue.delete(obj, 'prop')`
3. **数组索引赋值**：`arr[0] = 1` 检测不到，只能通过重写 7 个变异方法（push/pop/shift/unshift/splice/sort/reverse）间接实现
4. **数组 length 修改**：`arr.length = 0` 检测不到
5. **初始化性能**：必须递归遍历对象的所有属性并逐一劫持，深层嵌套对象在初始化时就有大量性能开销

**Proxy 的优势：**
- 拦截 13 种操作（get、set、deleteProperty、has、ownKeys、getOwnPropertyDescriptor、defineProperty、preventExtensions、getPrototypeOf、isExtensible、setPrototypeOf、apply、construct）
- 代理对象本身而非属性，新增/删除/数组索引/Map/Set 全部天然支持
- **惰性代理**：只在 `get` 中访问到子对象时才 `reactive(result)`，不需要初始化时深层递归

**Reflect 的三大作用：**
1. **`receiver` 参数修正 this 指向**（最重要）：当 target 有 getter（如 `get name() { return this.first + this.last }`），`Reflect.get(target, key, receiver)` 确保 getter 里的 `this` 指向 Proxy 而不是原始对象，这样在 getter 内部访问 this.first 依然能触发 track
2. **返回值一致性**：`Reflect.set` 返回 boolean，和 Proxy 的 set trap 要求一致；`target[key] = value` 在严格模式下赋值失败会抛异常
3. **API 对应性**：Proxy 的 13 种 trap 在 Reflect 上都有同名静态方法，语义统一

**面试官追问阶梯：**

**追问 1（中级）：** "Proxy 有什么缺点或者说兼容性顾虑吗？"

> 预期回答：Proxy 不支持 IE11（Vue3 官方放弃了 IE 支持）。另外 Proxy 的代理是引用透明的 —— target 和 proxy 是同一个代理关系上的不同对象，某些对引用做严格相等判断（===）的库可能会有意外行为。性能上，Proxy 比 defineProperty 在单次属性访问时要慢一些（Proxy 有拦截层的开销），但整体应用性能更好（因为惰性代理避免了初始化时的全量递归）。

**追问 2（中级偏上）：** "如果你用 Proxy 监听一个数组的 `push` 操作，会触发几次 set？为什么？"

> 预期回答：会触发两次 set —— 第一次是设置新的数组索引（如 `arr[3] = newItem`），第二次是修改 `length` 属性。Vue3 的解决方案是：在数组的 7 种变异方法执行期间，**暂停依赖追踪（pauseTracking）**，执行完原生方法后再恢复（resetTracking）。这样 push 内部的 length 读取和索引写入不会触发多余的 track/trigger。面试者如果能进一步说出"暂停追踪避免了潜在的死循环"更好。

> 源码参考：`packages/reactivity/src/arrayInstrumentations.ts`，Vue3 在 Proxy 的 get trap 里判断 key 是否为变异方法名，命中则返回包装后的版本。

**参考答案链接：**

- [../Vue3/reactivity.md](../Vue3/reactivity.md) —— 第 2 节 Proxy 拦截 + 追问详解 + 数组变异方法处理

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只能说出"Proxy 能拦截新增属性"这一个点，不知道 Reflect 的作用 |
| 中级 | 能系统说出 defineProperty 的 3+ 局限 + Proxy 的惰性代理优势，知道 Reflect 修正 this 指向 |
| 高级 | 能解释 Reflect receiver 在 getter 场景下的 this 问题（配代码示例），能说出数组 push 触发几次 set 以及暂停追踪的解决机制，知道 Proxy 的引用透明性问题 |

---

### Q3：effect-track-trigger 机制（12-15 min）

**面试官：**

> "第三个问题，也是 Vue3 响应式最核心的部分。请你简述一下 Vue3 的 effect / track / trigger 三件套的工作流程。可以用语言描述，也可以画图 —— 就说清楚'数据变了，怎么通知到组件更新'的完整链路。"

**考点：**

- 响应式系统的三大支柱：effect（响应式副作用）、track（依赖收集）、trigger（派发更新）
- targetMap 的数据结构：WeakMap -> Map -> Set
- 为什么是 WeakMap（GC 回收）
- 嵌套 effect 的处理（parent 栈）
- scheduler 的角色（将更新从同步变为异步批量）
- 整个链路是否能用一张图/一段话串起来，是区分"背了知识点"和"理解了系统"的关键

**预期回答（中级水平基准线）：**

**核心数据结构：**

```
targetMap: WeakMap<原始对象, Map<属性名, Set<ReactiveEffect>>>
```

三层嵌套：
1. `WeakMap`：key 是原始对象（弱引用，对象被销毁时自动 GC）
2. `Map`：key 是属性名
3. `Set`：value 是所有依赖该属性的 effect 集合（自动去重）

**工作流程：**

1. **注册阶段**：组件渲染时，`effect()` 包裹组件的 render 函数（本质是 `new ReactiveEffect(componentUpdateFn)`），将当前 effect 设为全局 `activeEffect`，然后执行 render 函数
2. **收集阶段（track）**：render 执行过程中访问响应式数据 → Proxy get 拦截 → 调用 `track(target, key)`，在 targetMap 中记录"当前 activeEffect 依赖了 target.key"
3. **变更阶段（trigger）**：数据被修改 → Proxy set 拦截 → 调用 `trigger(target, key)`，从 targetMap 取出依赖该属性的所有 effect，放入 scheduler 的任务队列（而非立即执行）
4. **调度阶段（scheduler）**：scheduler 将组件更新 effect 通过 `queueJob()` 入队（去重），在当前同步代码执行完后以微任务（Promise.then）清空队列，批量执行所有待更新 effect
5. **更新阶段**：effect.run() 重新执行组件的 render 函数 → 生成新 VNode → patch 对比旧 VNode → 更新 DOM

**面试官追问阶梯：**

**追问 1（中级）：** "你提到用 WeakMap 做最外层。为什么是 WeakMap，而不是 Map？"

> 预期回答：WeakMap 的 key 是**弱引用**。当响应式对象在应用中被销毁（组件卸载、路由切换等），它作为 WeakMap key 的弱引用不会阻止 GC 回收，Map 中对应的所有依赖关系也会随之被自动回收。如果用 Map，强引用会导致即使组件已被销毁，它的响应式数据和所有 effect 依赖关系也无法被 GC，造成内存泄漏。这是框架级别的内存安全设计。

**追问 2（中高级）：** "computed 内部的 effect 和组件渲染的 effect 有什么区别？"

> 预期回答：两者都是 `ReactiveEffect` 实例，但配置不同：
> - **组件渲染 effect**：scheduler 是 `queueJob()`，把更新任务推入微任务队列，实现"同一 tick 内多次修改只触发一次渲染"
> - **computed 内部的 effect**：scheduler 只做一件事 —— 把 `_dirty = true`（标记脏），**不主动重新计算**（惰性求值）。真正计算发生在 `.value` 被读取时。另外 computed effect 的 `lazy` 为 true，不会在创建时立即执行一次
> - **普通 effect（watchEffect）**：没有特殊 scheduler，可以选择 flush 时机（pre/post/sync）

**追问 3（高级）：** "如果 effect 嵌套（比如在 watchEffect 里又触发了另一个 watchEffect），怎么处理？"

> 预期回答：Vue3 的 `ReactiveEffect` 上有 `parent` 属性，构成了一个**栈结构**。当嵌套 effect 执行时：
> 1. 当前 `activeEffect` 保存到新 effect 的 `parent` 上
> 2. 新 effect 设为新的 `activeEffect`
> 3. 新 effect 执行完毕，`activeEffect` 恢复为 `parent`
>
> 这确保依赖收集时 track 记录的是**最内层正在执行的 effect**，而不是外层，从而实现了正确的依赖关系绑定。类似 Vue2 的 Dep.target 栈机制。

**参考答案链接：**

- [../Vue3/reactivity.md](../Vue3/reactivity.md) —— 第 3 节 track/trigger/effect 三者关系 + Mermaid 全链路图
- [../Vue3/scheduler.md](../Vue3/scheduler.md) —— 调度器三队列机制 + 与 nextTick 的关系

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只能说"数据变了视图更新"这个现象，说不出 track/trigger |
| 中级 | 能说出 WeakMap→Map→Set 三层结构和 track/trigger 的作用，知道渲染是异步批量的（scheduler），但嵌套 effect 解释不清 |
| 高级 | 能画出/口述完整链路（data → Proxy get → track → effect 收集 → Proxy set → trigger → scheduler 异步队列 → flush → patch），能解释 WeakMap 的 GC 考量 + 嵌套 effect 栈机制 + computed vs 组件 effect 的 scheduler 差异 |

---

## 组合式 API 与响应式工具（15-25 min）

### Q4：computed vs watch（15-19 min）

**面试官：**

> "computed 和 watch 都是 Vue3 中处理响应式数据变化的工具，但它们的设计哲学完全不同。请说说它们的区别：computed 的缓存机制是怎么实现的？什么情况下必须用 watch 而不是 computed？"

**考点：**

- 派生数据（computed）vs 副作用（watch）的本质区分
- computed 的惰性求值 + dirty 标记缓存机制
- computed 内部 effect 的 scheduler 设计与组件渲染 effect 的差异
- watch 的 deep / immediate / flush 选项
- watchEffect 的自动依赖收集

**预期回答（中级水平基准线）：**

| 维度 | computed | watch |
|------|----------|-------|
| 用途 | 派生计算一个新值（基于已有响应式数据） | 监听数据变化后执行副作用（API 请求、DOM 操作、localStorage） |
| 返回值 | 返回一个 `ComputedRef`（只读 ref） | 不返回值（回调函数无返回值语义） |
| 执行时机 | **惰性求值**：依赖变化时只标记 dirty，不立即计算；真正被读取时才执行 getter | 依赖变化时立即（或在指定 flush 时机）执行回调 |
| 缓存 | 有缓存（`_dirty` 标记，依赖不变时重复读取返回上次结果） | 无缓存，每次触发都重新执行回调 |
| 异步 | **不支持**（getter 必须同步返回），async computed 需要社区方案 | 天然支持异步操作 |
| 依赖声明 | 自动收集（getter 里用到的响应式数据自动成为依赖） | 手动指定 source（或 watchEffect 自动收集） |

**computed 缓存机制核心：**
```ts
// computed 内部维护一个 _dirty 标记
_dirty = true   // 初始/依赖变化时为 true
// 读取 .value 时：
if (this._dirty) {
  this._value = this.effect.run()   // 重新计算
  this._dirty = false               // 标记为干净
}
track(this, 'value')                // 收集 computed 自己的订阅者
return this._value                  // 脏时返回新值，干净时返回缓存
// scheduler: 依赖变化时只把 _dirty = true，不主动计算
```

**面试官追问阶梯：**

**追问 1（中级）：** "如果一个 computed 依赖了一个频繁变化的 ref，但计算结果没变（比如 filter 条件没变，列表数据变了但过滤结果相同），会触发组件重新渲染吗？"

> 预期回答：**会触发组件重新渲染**。虽然 computed 内部做了值相等判断（`hasChanged`），如果新值和旧值相同，不会 trigger 自己的订阅者。但组件渲染 effect 可能**同时依赖了那个频繁变化的 ref 和 computed**——只要那个 ref 变化，组件的渲染 effect 就会被 trigger 调度，无论 computed 的值是否变化。
>
> 更深一层：如果组件 render 中只用了 computed 的结果，没有直接读取那个频繁变化的 ref，那么 computed 的值没变 → computed 不会 trigger → 组件不会重新渲染。这体现了 computed 对下游的"缓冲"效果。
>
> 优化技巧：如果 computed 依赖的 ref 变化频繁但 computed 结果不变，可以在 computed 内部做更细粒度的过滤，让 computed 的缓存尽量命中。

**追问 2（中级偏上）：** "watch 的 deep 选项和 flush 选项分别是什么？有哪些坑？"

> 预期回答：
> - **deep: true**：对嵌套对象做深度遍历（`traverse()`），让每一层属性的 get 都触发 track。注意：如果 watch 的 source 本身就是一个 `reactive` 对象，**默认就是深层监听**；只有 watch 一个返回对象的 getter 函数时才需要显式设置 `deep: true`。深层遍历有性能开销，对于大对象需要谨慎。
> - **flush: 'pre' | 'post' | 'sync'**：
>   - `'pre'`（默认）：在 DOM 更新前执行回调
>   - `'post'`：在 DOM 更新后执行回调（类似 nextTick 之后）
>   - `'sync'`：同步执行，每次变化立刻触发（不经过 scheduler 批量合并，性能代价高）

**追问 3（中高级）：** "watchEffect 和 watch 有什么关键区别？为什么不推荐在 watchEffect 的 callback 里做异步请求？"

> 预期回答：
> - watchEffect **不需要手动指定依赖源**，执行期间自动追踪所有访问的响应式数据；watch 必须显式传入 source
> - watchEffect **初始化时立即执行一次**（为了收集依赖）；watch 默认惰性（除非 `immediate: true`）
> - watchEffect 在回调里做异步请求本身没问题，但需要注意：如果异步请求的回调里又修改了被追踪的依赖数据，可能导致"数据变→请求→数据变→请求→..."的**无限循环**。这时应该用 watch + 明确的 source + 条件判断来精确控制

**参考答案链接：**

- [../Vue3/computed-watch.md](../Vue3/computed-watch.md) —— computed 简化源码、缓存机制、onCleanup 竞态处理
- [../Vue3/reactivity.md](../Vue3/reactivity.md) —— computed 底层依赖的 ReactiveEffect + scheduler

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只能说"computed 有缓存，watch 做副作用"，说不出 _dirty 标记 |
| 中级 | 能说出惰性求值 + _dirty 缓存机制 + flush 选项，理解 computed 不支持异步 |
| 高级 | 能说清 computed 依赖变了但值没变时是否触发渲染的双重判断逻辑，能解释 watchEffect 的自动追踪可能带来的无限循环问题，知道 onCleanup 解决竞态请求 |

---

### Q5：nextTick 原理（19-22 min）

**面试官：**

> "说一个你一定在项目中用过的 API —— nextTick。它是什么？解决了什么问题？内部实现用了什么 API？和浏览器 Event Loop 的关系是什么？"

**考点：**

- Vue 的异步 DOM 更新机制
- nextTick 的降级策略（Vue2 的 4 级降级 vs Vue3 直接 Promise.then）
- 微任务 vs 宏任务的选择理由
- 多次 nextTick 的执行顺序
- 和 scheduler 的协作关系

**预期回答（中级水平基准线）：**

**本质：** nextTick 将回调延迟到**下次 DOM 更新循环结束之后**执行。它利用了微任务（Promise.then），确保在同一个 Event Loop tick 中所有同步数据变更触发的 DOM 更新都已完成后再执行回调。

**为什么需要：** Vue 的 DOM 更新是**异步批量的**。同一个同步代码块中的多次数据修改会被 scheduler 合并为一次组件更新 effect，这个更新 effect 在当前同步代码执行完后通过微任务执行。如果你在修改数据后立刻访问 DOM，读到的是更新前的旧值。nextTick 的回调挂在同一个微任务的 `.then` 链上，保证在 DOM 更新之后才执行。

**降级策略（体现深度）：**
- **Vue2**：4 级降级：`Promise.then` → `MutationObserver` → `setImmediate` → `setTimeout`（为了兼容 IE，宏任务和微任务混用）
- **Vue3**：直接用 `Promise.resolve().then()`，因为 Vue3 放弃了 IE11，96%+ 浏览器原生支持 Promise

**和 Event Loop 的关系：** 同步代码 → 微任务队列（flushJobs 执行 DOM 更新 + nextTick 回调）→ 浏览器渲染。nextTick 确保回调在"本轮 Event Loop 的微任务阶段"执行，此时 DOM 已更新但浏览器通常还未渲染。

**面试官追问阶梯：**

**追问 1（中级）：** "在一段同步代码中连续三次修改了同一个 ref，然后调用了 nextTick，会触发几次 nextTick 回调？"

> 预期回答：一次。三次修改会被 scheduler 去重合并为一个组件更新 effect，放在同一个微任务中执行。nextTick 的回调挂在这个微任务的 `.then` 链之后。所以只会执行一次 DOM 更新 + 一次 nextTick 回调。

**追问 2（中级偏上）：** "如果在 nextTick 的回调中又修改了数据，会不会陷入无限循环？"

> 预期回答：不会无限循环，但有递归上限保护。nextTick 回调中修改数据 → 触发新的 effect → 通过 scheduler 再次入队 → 如果当前 flush 还在进行中，新 job 会被追加到队列末尾继续执行。但如果这形成了一个"改数据 → 更新 → 改数据 → 更新 → ..."的无限链，Vue3 的 scheduler 有递归上限检测（默认同一 effect 在单次 flush 中最多执行 100 次），超过后抛出 `Maximum recursive updates exceeded` 警告并终止。

**追问 3（高级）：** "nextTick 拿到 DOM 后，浏览器一定渲染了吗？如果需要确保浏览器已经渲染，应该怎么做？"

> 预期回答：不一定。`nextTick` 的回调在微任务阶段执行，此时 DOM 已经在内存中更新，但**浏览器通常还未进行渲染**（渲染在微任务清空之后才可能发生）。如果需要在浏览器渲染后操作（如测量布局偏移、计算动画起始位置），需要配合 `requestAnimationFrame`：
```ts
await nextTick()
requestAnimationFrame(() => {
  // 此时浏览器已完成本次渲染
  const rect = el.getBoundingClientRect()
})
```

**参考答案链接：**

- [../Vue3/nextTick.md](../Vue3/nextTick.md) —— 降级策略、scheduler 协同、手写简化版
- [../JavaScript/event-loop.md](../JavaScript/event-loop.md) —— 宏任务/微任务基础 + 必考输出题

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只知道"数据变了等 DOM 更新就用 nextTick"，说不出原理 |
| 中级 | 能说出 Vue 异步批量更新 + 微任务 + Promise.then，知道多次修改合并为一次 |
| 高级 | 能对比 Vue2 降级策略和 Vue3 的简化，说清 nextTick 和 rAF 的执行时机差异，能解释 nextTick 回调中修改数据不会无限循环（递归上限 100 次） |

---

### Q6：生命周期 —— 父子组件执行顺序（22-25 min）

**面试官：**

> "这个题目看起来简单，但能说清楚的不多。请描述一下：父组件和子组件的 setup、beforeMount、mounted、beforeUpdate、updated、beforeUnmount、unmounted 的执行顺序是怎样的？setup 函数在哪个阶段执行？为什么 Vue3 取消了 beforeCreate 和 created？"

**考点：**

- 父子组件生命周期钩子的执行先后顺序（挂载是子先完成父后完成，更新也是子先完成父后完成，卸载前钩子父先触发子后触发）
- setup 的执行时机（beforeCreate 和 created 之间）
- Vue3 取消 beforeCreate/created 的设计理由
- KeepAlive 下的 onActivated/onDeactivated 与 mounted/unmounted 的区别

**预期回答（中级水平基准线）：**

**挂载阶段（子先完成，父后完成）：**
```
父 setup() → 子 setup() →
父 onBeforeMount → 子 onBeforeMount →
子 onMounted → 父 onMounted
```

**更新阶段（同样是子先完成，父后完成）：**
```
父 onBeforeUpdate → 子 onBeforeUpdate →
子 onUpdated → 父 onUpdated
```

**卸载阶段（父先触发卸载前钩子，子后触发；但卸载完成是子先，父后）：**
```
父 onBeforeUnmount → 子 onBeforeUnmount →
子 onUnmounted → 父 onUnmounted
```

**记忆口诀：挂载和更新都是"子先完成，父后完成"；卸载则是"父先触发卸载前，但子先卸载完"。**

**setup 的执行时机：** 在解析完 props 之后、创建组件实例之前执行，正好处于 Options API 的 `beforeCreate` 和 `created` 之间。这也是为什么 setup 中不能使用 `this` —— 组件实例尚未完全创建。

**为什么取消 beforeCreate/created：** `setup()` 本身替代了这两个钩子的功能。在 Options API 时代，`beforeCreate` 和 `created` 的主要用途是初始化非响应式数据和调用 API，现在这些逻辑直接写在 `setup()` 函数体中即可。保留它们只会造成 API 冗余。Vue3 依然可以在 Options API 中使用这两个钩子，但 Composition API 中用 `setup()` 替代。

**面试官追问阶梯：**

**追问（中级）：** "KeepAlive 包裹的组件，onActivated / onDeactivated 和 mounted / unmounted 的执行有什么区别？"

> 预期回答：
> - **首次挂载**：`onMounted` → `onActivated`（两个都会触发）
> - **从缓存恢复**：只触发 `onActivated`，不触发 `onMounted`（组件实例被复用，不需要重新挂载）
> - **被缓存（切走）**：只触发 `onDeactivated`，不触发 `onUnmounted`（组件实例被保留在缓存中）
> - **缓存淘汰/手动销毁**：同时触发 `onDeactivated`（如果之前是激活状态）+ `onUnmounted`
> - **典型场景**：定时器/轮询/WebSocket 连接，应该在 `onDeactivated` 中暂停/断开，`onActivated` 中恢复；而不是在 `onUnmounted` 中清理（因为 KeepAlive 下可能永远不触发 unmounted）。但 `onUnmounted` 的清理仍然要保留，作为"缓存被淘汰"的兜底。

**参考答案链接：**

- [../Vue3/lifecycle.md](../Vue3/lifecycle.md) —— 父子组件执行顺序 Mermaid 图 + SSR 差异
- [../Vue3/keepalive.md](../Vue3/keepalive.md) —— onActivated/onDeactivated 钩子详解 + LRU 淘汰

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只能列出 8 个钩子的名字，说不出父子顺序 |
| 中级 | 能正确说出挂载/更新的父子顺序（子先完成父后完成），知道 setup 在 beforeCreate/created 之间 |
| 高级 | 能同时说清卸载阶段的顺序（父先触发 onBeforeUnmount），清楚 KeepAlive 下 activated 和 mounted 的触发差异 + 清理时机的双重保障 |

---

## 组件通信与 Diff 算法（25-35 min）

### Q7：组件通信方案全景（25-29 min）

**面试官：**

> "在一个中大型后台管理系统中，组件通信是一个绕不开的话题。请完整说一下 Vue3 中有哪些组件间通信的方式，分别适用于什么场景？—— 父子、祖孙、兄弟、跨层级都覆盖到。另外，Vue2 中的 event bus（$on/$emit）在 Vue3 中还能用吗？如果不能用，替代方案是什么？"

**考点：**

- 组件通信方案矩阵（8 种方案各自适用场景）
- provide/inject 的响应式原理及注意事项
- v-model 的语法变迁（Vue2 的 .sync vs Vue3 的统一 v-model）
- Vue3 移除 $on/$off/$once 的设计理念及替代方案
- 对候选人的项目经验判断：是否根据实际场景选择合适的方案，而非"一刀切全用 Pinia"

**预期回答（中级水平基准线）：**

| 通信方式 | 适用场景 | 关键特点 |
|---------|---------|---------|
| **props + emits** | 父子组件直传 | Vue3 中 emit 需要在 `defineEmits` 中显式声明，TypeScript 类型支持更好 |
| **v-model** | 父子组件双向绑定 | Vue3 支持多个 v-model（`v-model:title`, `v-model:visible`），内部是 `modelValue` prop + `update:modelValue` emit |
| **provide + inject** | 祖先→后代（跨层级） | 默认非响应式，需要配合 `ref`/`reactive` + `computed` 或直接 `provide(key, ref)` 来保持响应式 |
| **Pinia / Vuex** | 全局状态管理 | 适用于跨模块、跨路由的共享状态：用户信息、权限、主题、多标签页状态等 |
| **$parent / $refs** | 紧急逃生口 | 不推荐，破坏数据流单向性，使组件强耦合。仅在需要调用子组件方法（如 `childRef.focus()`）等有限场景使用 |
| **mitt / tiny-emitter** | 兄弟组件/跨层级事件 | Vue3 移除了 `$on/$off/$once`（不再内置 Event Bus），用 `mitt` 等轻量库替代 |
| **路由参数** | 跨页面传递 | 通过 route params/query 传递，组件通过 `useRoute()` 获取 |
| **透传（$attrs）** | 二次封装组件 | 将未被声明为 props 的属性自动传给子组件的根元素 |

**关于 Event Bus：**
- Vue3 **移除了实例上的 `$on`、`$off`、`$once` 方法**。这是有意为之的设计决策：Event Bus 模式在大型应用中导致数据流难以追踪（任意组件都可以发送/监听事件，调试困难），违背了"单向数据流"和"显式依赖"的原则
- 替代方案：`mitt`（200 字节的 EventEmitter 库）、Pinia action、provide/inject。如果项目规模小，mitt 足够用；规模大则用 Pinia

**面试官追问阶梯：**

**追问 1（中高级）：** "provide 一个 ref 给子组件，子组件 inject 后修改 `.value`，会影响父组件中的原始值吗？为什么？这种设计好不好？"

> 预期回答：**会影响**。因为 provide/inject 传递的是引用 —— `provide(key, myRef)` 传递的是 ref 对象本身的引用，子组件 inject 后拿到的是同一个 ref 对象，修改 `.value` 就是修改同一个响应式引用。这个设计本身没有好坏，取决于使用意图：
> - **如果是共享状态（好处）**：祖先组件可以"有意"把某个 ref 的修改权下放给后代组件，实现协作修改
> - **如果是单向数据流（风险）**：后代组件可能"无意"修改了祖先的状态，导致数据流混乱。需要靠团队规范来约束
> - **最佳实践**：如果只想让后代读但不让改，可以在 provide 时用 `readonly()` 包裹，或者在 provide 层用 `computed` 返回只读版本

**追问 2（中级）：** "为什么不建议用 $parent/$refs 作为常规通信方式？"

> 预期回答：
> - 破坏了组件的封装性和可复用性（子组件依赖父组件的特定结构）
> - 使数据流从"单向"变成"网状"，调试时无法追踪状态变更来源
> - 在 TypeScript 中类型推断困难（需要手动类型断言）
> - Vue3 的 `<script setup>` 默认不暴露组件实例，需要用 `defineExpose` 显式声明，本身就是一种"不要随便用"的信号
> - 合理用途：表单聚焦（`inputRef.value?.focus()`）、触发子组件动画的方法调用等**有限的命令式场景**

**参考答案链接：**

- [../Vue3/composition-api.md](../Vue3/composition-api.md) —— provide/inject + composable 模式
- [../Vue3/reactivity.md](../Vue3/reactivity.md) —— readonly + toRef 在通信中的应用

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只能说 props/emits + Vuex/Pinia，不知道 provide/inject 和其他方案 |
| 中级 | 能列出 5+ 种通信方式并说出适用场景，知道 Vue3 移除了 $on/$off/$once |
| 高级 | 能深入分析 provide/inject 的响应式机制（readonly 包裹、computed 封装），能讨论 Event Bus 移除的设计哲学，对多种方案有取舍判断（而非背诵列表） |

---

### Q8：Diff 算法概述 + 实际场景题（29-35 min）

**面试官：**

> "现在进入虚拟 DOM 和 Diff 的部分。Vue3 的 Diff 算法相比 Vue2 做了哪些优化？为什么 Vue3 引入了 Longest Increasing Subsequence（最长递增子序列）？我给你一个具体的场景，你来描述 Diff 过程。"

**场景题：**

> 假设有以下列表：
> ```
> 旧： [A(key=1), B(key=2), C(key=3), D(key=4)]
> 新： [D(key=4), A(key=1), B(key=2), C(key=3)]
> ```
> 也就是最后一个元素 D 被移到了最前面。请描述 Vue3 的 `patchKeyedChildren` 如何处理这个场景。

**考点：**

- Vue3 编译时优化（Block Tree + PatchFlag + 静态提升）
- patchKeyedChildren 五步法
- LIS 算法在 Diff 中的角色（最小化 DOM 移动）
- key 的重要性（为什么不能用 index）
- 对 Vue2 双端对比 vs Vue3 五步法的理解深度

**预期回答（中级水平基准线）：**

**Vue3 Diff 的三大优化（对比 Vue2）：**

1. **编译时优化 —— Block Tree + PatchFlag**：
   - 编译器标记动态节点（`PatchFlags.TEXT`、`PatchFlags.CLASS` 等）
   - 生成 `dynamicChildren` 数组，Diff 时只遍历动态子节点，静态节点直接跳过
   - 静态节点会被**提升（hoist）**到 render 函数外部，复用同一份 VNode，不再每次渲染重新创建
   - 这是 Vue3 Diff 快的**根本原因**：编译器告诉运行时"只需要对比什么"，运行时就只需要比那么多

2. **子节点 Diff 算法 —— 5 步法替代双端对比**：
   - Vue2 用双端对比（oldStart/oldEnd/newStart/newEnd 四个指针从两端向中间收拢）
   - Vue3 用五步法：头部对比 → 尾部对比 → 挂载新节点 → 卸载旧节点 → 乱序用 LIS

3. **LIS 最小化 DOM 移动**：
   - 在乱序处理阶段，找出旧节点在新数组中的「最长递增子序列」
   - 递增子序列中的节点保持原位不动，只移动不在该序列中的节点
   - 时间复杂度 O(n log n)，移动次数最少

**场景分析：`[A,B,C,D]` → `[D,A,B,C]`：**

```
Step 1: 头部对比
  old[0]=A(key=1) vs new[0]=D(key=4) → key 不同，停止
  i = 0

Step 2: 尾部对比
  old[3]=D(key=4) vs new[3]=C(key=3) → key 不同，停止
  e1 = 3, e2 = 3

Step 3 & 4: 跳过（新旧都没有提前遍历完）

Step 5: 乱序处理
  中间区域: 旧 [A,B,C,D]  新 [D,A,B,C]
  构建 key→newIndex Map: { D:0, A:1, B:2, C:3 }

  遍历旧节点:
  - A(key=1): newIndexMap 中匹配到 newIndex=1 → newIndexToOldIndex[1] = 0+1 = 1
  - B(key=2): newIndexMap 中匹配到 newIndex=2 → newIndexToOldIndex[2] = 1+1 = 2
  - C(key=3): newIndexMap 中匹配到 newIndex=3 → newIndexToOldIndex[3] = 2+1 = 3
  - D(key=4): newIndexMap 中匹配到 newIndex=0 → newIndexToOldIndex[0] = 3+1 = 4

  newIndexToOldIndex = [4, 1, 2, 3]
  LIS 计算: [1, 2, 3] → 对应索引 [1, 2, 3] → 即 A,B,C 三个节点不动
  倒序遍历 new children:
  - C(idx=3): 在 LIS 中，不动
  - B(idx=2): 在 LIS 中，不动
  - A(idx=1): 在 LIS 中，不动
  - D(idx=0): 不在 LIS 中，移动！将 D 的 DOM 移动到最前面
```

**关键结论：** 4 个节点中只需要**移动 1 次 DOM**（把 D 移到前面），A/B/C 原地不动。如果不用 LIS 而用暴力法，可能需要移动 3 次。

**面试官追问阶梯：**

**追问 1（中级）：** "为什么不建议用 index 作为 v-for 的 key？给一个实际会出 bug 的场景。"

> 预期回答：
> 当列表顺序改变时（排序、筛选、头部插入/删除），index 对应的数据已经变了，但 key 没变。Diff 算法认为"同一个 key 的节点可以复用"，于是**复用了错误的 DOM 节点**，只更新了文本/属性内容。这可能导致：
> - **输入框内容错位**：如果列表项里有 `<input>`，头部插入新项后，输入框里的内容会跟着 index 往下移而不是跟着数据往下移（因为 DOM 复用了但输入框的**非响应式状态**——光标位置、未提交文本——不会跟随更新）
> - **动画异常**：`<transition-group>` 的移动动画错乱
> - **组件状态丢失**：如果子组件有内部状态（如展开/折叠），index 变化后状态错位
> - 必须使用**稳定、唯一的数据标识**（如 `item.id`）作为 key

**追问 2（中高级）：** "template 写模板和 JSX 写 render 函数，在 Vue3 的编译优化上有区别吗？"

> 预期回答：**有本质区别**。Vue3 的三大编译优化（Block Tree、PatchFlag、静态提升）**只对 template 生效**，因为优化发生在 template → render function 的编译阶段。JSX（或 `h()` 函数）会绕过编译器，直接生成 VNode，不会生成 `dynamicChildren` 和 PatchFlag 标记。因此 JSX 写法的 Diff **会退化为类似 Vue2 的全量对比**。
>
> 但这不是说 JSX 就无法优化 —— 你可以手动使用 Vue3 提供的编译提示 API（如 `withDirectives`、`vModelText`）或自己实现类似的优化。Vue3 的 template 编译优势在于**零成本优化**，不需要开发者手动做任何事情。

**追问 3（高级）：** "Vue3 的 Block Tree 在 `v-if` 和 `v-for` 同时存在时会怎么样？会影响编译优化吗？"

> 预期回答：Vue3 中 **`v-if` 优先级高于 `v-for`**（Vue2 是 `v-for` 优先）。不推荐在同一元素上同时使用 `v-if` 和 `v-for`（ESLint 规则会报警）。从 Block Tree 角度说，`v-if` 会导致分支内的动态节点结构变化，编译器会为每个分支生成独立的 Block 来保证靶向更新依然有效。但如果 `v-if` 和 `v-for` 混写，编译器会难以正确分析依赖关系，可能导致优化失效。最佳实践是用 `computed` 过滤列表后传给 `v-for`。

**参考答案链接：**

- [../Vue3/diff-patch.md](../Vue3/diff-patch.md) —— patchKeyedChildren 五步法 + LIS 手写 + Vue2 对比
- [../Vue3/renderer.md](../Vue3/renderer.md) —— renderer 如何驱动 patch + 平台无关性

**评分标准：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 知道 Diff 是比对新旧 VNode，知道 key 的作用但不能深入 |
| 中级 | 能说出五步法（头→尾→挂→卸→乱序），知道编译优化（Block Tree + PatchFlag），能解释 index 做 key 的 bug |
| 高级 | 能结合实际数组推演 Diff 过程 + LIS 作用，能对比 Vue2/Vue3 Diff 的优劣和适用场景，知道 template vs JSX 在编译优化上的差异，能讨论 v-if/v-for 混写对编译优化的影响 |

---

## 手写实现（35-45 min）

### Q9：手写简化版 computed 或 EventEmitter（35-43 min）

**面试官：**

> "现在到了手写环节。我给你两个选项，你选一个你比较有把握的来写。时间 8 分钟左右，不要求一字不差能运行，但核心逻辑要到位。"
>
> "**选项 A**：手写一个简化版的 `computed(fn)` 函数，返回一个带有 `.value` 属性的对象，实现惰性求值和缓存（依赖不变时不重新计算，依赖变化时标记为脏，下次读取才重新计算）。"
>
> "**选项 B**：手写一个 `EventEmitter` 类，实现 `on(event, fn)`、`once(event, fn)`、`emit(event, ...args)`、`off(event, fn?)` 方法。要求支持链式调用，考虑 emit 过程中的 off 安全性。"
>
> "你选哪个？"

**考点：**

- 选项 A：对 Vue3 响应式系统核心机制（ReactiveEffect、track/trigger、dirty 标记、惰性求值）的理解深度
- 选项 B：发布订阅模式、错误隔离、安全迭代（snapshot）、once 的 wrapper 包装模式
- TypeScript 类型定义
- 代码组织能力和边界条件处理

---

### 选项 A：手写简化版 computed

**给候选人的代码模板：**

```ts
// ===== 已知的上下文（不需要实现，可以直接使用）=====

// 假设有一个全局的 activeEffect 变量，指向当前正在执行的 effect
let activeEffect: ReactiveEffect | null = null

// 全局依赖中心: WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap<object, Map<string | symbol, Set<ReactiveEffect>>>()

// ReactiveEffect 类（已实现，可以直接使用）
class ReactiveEffect {
  fn: Function
  scheduler?: () => void
  constructor(fn: Function, scheduler?: () => void) {
    this.fn = fn
    this.scheduler = scheduler
  }
  run() {
    activeEffect = this
    const result = this.fn()
    activeEffect = null
    return result
  }
}

// track 函数：依赖收集（已实现）
function track(target: object, key: string | symbol) { /* ... */ }

// trigger 函数：派发更新（已实现）
function trigger(target: object, key: string | symbol) { /* ... */ }

// ===== 请实现以下函数 =====
function computed<T>(getter: () => T): { readonly value: T } {
  // TODO: 你的实现
}
```

**预期回答（完整实现）：**

```ts
function computed<T>(getter: () => T): { readonly value: T } {
  let _value: T
  let _dirty = true                    // 脏标记：true 表示需要重新计算

  // 创建内部 effect
  // scheduler: 当 getter 依赖的响应式数据变化时被调用
  // 注意此处不立即执行 compute，只标记为脏
  const effect = new ReactiveEffect(getter, () => {
    if (!_dirty) {
      _dirty = true                    // 1. 标记为脏
      trigger(obj, 'value')           // 2. 通知 computed 自身的订阅者
    }
  })

  const obj = {
    get value(): T {
      if (_dirty) {
        _value = effect.run()         // 3. 真正计算（惰性求值）
        _dirty = false                // 4. 标记为干净
      }
      track(obj, 'value')             // 5. 收集当前 computed 的依赖者
      return _value
    }
  }

  return obj
}
```

**预期回答中的关键点：**
1. `_dirty` 标记：缓存的核心，`true` 才重新计算
2. scheduler 回调中**不主动计算**，只标记 `_dirty = true` + trigger —— 体现惰性求值
3. `.value` getter 中根据 `_dirty` 决定是否执行 `effect.run()`
4. 在 getter 中 `track(obj, 'value')` 收集依赖 computed 的订阅者
5. scheduler 回调中的 `if (!_dirty)` 优化：如果已经是脏的，不需要重复 trigger

**追问（中高级）：** "你的 computed 在依赖变化但计算结果没变的情况下（比如 getter 是 `() => a.value > 0`，a 从 1 变成 2），会不会通知订阅者？如果不想通知，怎么做？"

> 预期回答：当前实现会通知。因为 scheduler 里直接 `trigger(obj, 'value')`，没有比较新旧值。要优化的话，需要在 trigger 之前做值比较：
> ```ts
> const newValue = effect.run()        // 立刻计算新值
> if (!Object.is(newValue, _value)) {  // 只有真正变了才通知
>   _value = newValue
>   _dirty = false
>   trigger(obj, 'value')
> }
> ```
> 但这样做**破化了惰性求值的特性**（scheduler 里被迫计算了）。这是 computed 的一个设计权衡：Vue3 源码中的做法是，scheduler 里先用 hasChanged 比较，如果值确实变了才 trigger，否则什么都不做。这需要在 scheduler 里同步执行 getter，虽然牺牲了一点惰性，但避免了不必要的下游更新，实测是净收益。

**参考答案链接：**

- [../Vue3/computed-watch.md](../Vue3/computed-watch.md) —— ComputedRefImpl 完整源码
- [../Vue3/reactivity.md](../Vue3/reactivity.md) —— ReactiveEffect + track/trigger 底层

---

### 选项 B：手写 EventEmitter

**给候选人的代码模板：**

```ts
type Listener = (...args: any[]) => void

class EventEmitter {
  private events: Record<string, Listener[]> = {}

  // 注册事件，支持链式调用
  on(event: string, listener: Listener): this {
    // TODO
  }

  // 触发事件，按注册顺序依次执行回调
  // 返回 boolean：是否有监听器被触发
  emit(event: string, ...args: any[]): boolean {
    // TODO
  }

  // 移除监听器
  // - 传入 listener：只移除该回调
  // - 不传 listener：移除该事件的所有回调
  off(event: string, listener?: Listener): this {
    // TODO
  }

  // 只监听一次，触发后自动移除
  once(event: string, listener: Listener): this {
    // TODO
  }
}
```

**预期回答（完整实现）：**

```ts
type Listener = (...args: any[]) => void

class EventEmitter {
  private events: Record<string, Listener[]> = {}

  on(event: string, listener: Listener): this {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
    return this
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events[event]
    if (!listeners || listeners.length === 0) return false

    // 关键：拷贝一份快照，防止 emit 过程中 off 导致索引错乱
    const snapshot = [...listeners]

    for (const listener of snapshot) {
      try {
        listener(...args)
      } catch (error) {
        console.error(`[EventEmitter] Error in event "${event}":`, error)
      }
    }

    return true
  }

  off(event: string, listener?: Listener): this {
    const listeners = this.events[event]
    if (!listeners) return this

    if (!listener) {
      // 移除该事件的所有监听器
      delete this.events[event]
      return this
    }

    // 从后往前遍历，避免 splice 影响索引
    const len = listeners.length
    for (let i = len - 1; i >= 0; i--) {
      if (
        listeners[i] === listener ||
        (listeners[i] as any).__original === listener  // 兼容 once 包装
      ) {
        listeners.splice(i, 1)
        // 不 break —— 同一函数可能被多次 on，全部移除
      }
    }

    // 没监听器了就清理 key
    if (listeners.length === 0) {
      delete this.events[event]
    }

    return this
  }

  once(event: string, listener: Listener): this {
    // 用 wrapper 包装，触发后 self-removal
    const wrapper: Listener = (...args: any[]) => {
      this.off(event, wrapper)   // 先移除自己
      listener(...args)           // 再执行原始回调
    }

    // 挂 __original 引用，使外部 off(event, originalListener) 依然生效
    ;(wrapper as any).__original = listener

    this.on(event, wrapper)
    return this
  }
}
```

**预期回答中的关键点（面试官重点关注）：**

1. **emit 中拷贝快照（snapshot）**：防止 emit 过程中回调调用 off 导致 splice 索引错乱
2. **once 的 wrapper 包装模式**：高阶函数 + `__original` 引用保留原始 listener 的引用关系
3. **off 从后往前遍历**：splice 时不会影响前面未处理的索引
4. **off 中同时匹配 `listener` 和 `wrapper.__original`**：使 once 注册的也能被外部精确移除
5. **同一函数多次 on 的处理**：不去重，保留多次注册；off 时全部移除，不 break
6. **错误隔离**：try-catch 包裹每个回调，一个报错不影响其他回调的执行
7. **链式调用**：所有方法返回 `this`
8. **边界条件**：空事件时 emit 返回 false，off 安全处理

**追问（中高级）：** "如果我想让所有的 emit 调用都是异步的（在微任务队列中执行），怎么修改？改动最小的情况下。如果想把所有 emit 调用放在同一个队列中合并执行呢？"

> 预期回答：
> - **异步 emit**：最简单的方式是在 emit 方法中把 `listener(...args)` 用 `Promise.resolve().then(() => listener(...args))` 包裹。但要注意这改变了语义（所有 listener 都变成了异步），而且 emit 的执行顺序会被打散到多个微任务
> - **合并执行**：类似 Vue3 的 scheduler 设计 —— 维护一个全局的任务队列，所有 `emit` 被触发时不立刻执行回调，而是把一个"清空队列"的微任务调度到 Promise.then 中，同一轮 Event Loop 中的多次 emit 会被合并为一次队列清空。注意需要去重（同一个事件的多次 emit 只取最后一次的参数？还是依次执行？需要定义语义）
> - **更好的设计**：不是修改 emit 本身，而是提供一个 `emitAsync` 方法或者在构造时传入配置（`new EventEmitter({ async: true })`），让使用方自行选择

**参考答案链接：**

- [../手写题/event-emitter.md](../手写题/event-emitter.md) —— EventEmitter 完整实现 + 测试用例 + 追问深挖
- [../Vue3/computed-watch.md](../Vue3/computed-watch.md) —— computed 简化源码

**评分标准（两道题共用）：**

| 级别 | 表现描述 |
|------|---------|
| 初级 | 只能写出基本骨架（on 注册、emit 遍历），缺少 snapshot 保护、错误隔离、边界处理 |
| 中级 | 功能完整：emit 中 snapshot 拷贝、错误隔离、off 从后往前、once 的 wrapper 包装、链式调用。——全部到位 |
| 高级 | 中级全部满足 + 能主动讨论 `__original` 的设计考量（once 包装后外部 off 的兼容性问题）、讨论同步 vs 异步 emit 的设计取舍、能联系 Vue3 scheduler 的多队列设计进行类比 |

**手写环节时间控制：**

- 0-2 min：候选人读题 + 选择选项
- 2-7 min：候选人写代码（面试官保持安静，不提示）
- 7-8 min：候选人讲解代码 + 面试官追问
- 如果候选人在 4 分钟时卡住无法进展，面试官可以给一个小提示（如"想想怎么实现缓存"或"想想 emit 过程中如果回调调用了 off 会怎样"），但需要降档评分

---

## 反问环节（43-45 min）

**面试官：**

> "好的，技术环节到这里。最后几分钟留给你，有什么想了解的可以问我。"

**给候选人的建议 —— 哪些问题是「好问题」：**

1. "团队目前的技术栈是怎样的？Vue3 项目占多大比例？有计划升级到更新的版本吗？" —— 示你对技术演进的关注
2. "团队在组件库/基建方面是自己维护还是用开源方案？有专人负责吗？" —— 暗示你对基建的兴趣和能力
3. "这个岗位主要负责什么业务模块？前端团队大概多少人？分工是怎样的？" —— 正常的问题，了解工作内容
4. "前端项目的 CI/CD 流程是怎样的？有自动化测试和代码审查流程吗？" —— 显示工程化意识

**哪些问题是「减分问题」：**

- "能透露一下薪资范围吗？" —— 一面通常不是谈薪资的时机，留给 HR 面
- "加班多吗？" —— 问法不对，换成"团队的发布节奏是怎样的？"
- 没有问题 —— 这是一个负面信号，说明候选人对岗位/公司没有足够兴趣

**推荐回答示例：**

> "我比较想了解两个点：一是团队目前在 Vue3 生态上用到了哪些周边工具（比如 Nuxt、Vite、Pinia、Vitest 等），以及未来的技术方向；二是从你看来，这个岗位最希望候选人在入职前 3 个月能快速贡献什么？"

---

## 面试结束语 + 面试官复盘

**面试官（结束语）：**

> "好的，今天的一轮面试到这里就结束了。感谢你的时间，后续如果有下一轮面试安排，HR 会通知你。今天聊得不错/有一些亮点，希望你后续顺利。"

**面试官复盘评分表（内部使用，不给候选人看）：**

### 综合评分矩阵

| 评估维度 | 权重 | 初级(1-2分) | 中级(3-4分) | 高级(5分) | 得分 |
|---------|------|------------|------------|----------|------|
| 响应式原理 (Q1-Q3) | 25% | 知道 API 用法的表面区别 | 理解 Proxy/Reflect/WeakMap 三层结构和 track/trigger | 能画出完整链路图，解释嵌套effect栈和scheduler协作 | /5 |
| 组合式 API (Q4-Q6) | 20% | 用过 computed/watch/nextTick，但说不出原理 | 理解 _dirty 缓存、异步批量更新、生命周期执行顺序 | 能深入讨论 scheduler 三队列和 computed 惰性求值的边界场景 | /5 |
| 组件+Diff (Q7-Q8) | 25% | 知道 props/emits 和 Pinia，知道 key 很重要 | 列出 5+ 种通信方案，说出五步法和 LIS 的作用 | 对方案有取舍判断，能推演具体 Diff 过程，讨论编译优化 | /5 |
| 手写实现 (Q9) | 20% | 写出骨架但细节缺失 | 功能完整，关键细节（snapshot/_dirty/wrapper）到位 | 全部到位 + 能主动讨论设计取舍和优化方向 | /5 |
| 工程素养+沟通 | 10% | 背答案痕迹明显，追问延展困难 | 有项目经验的支撑，能把原理对应到实际场景 | 能主动引申，有架构思维，沟通清晰自信 | /5 |

**综合评级：**

- **强烈推荐（>= 4.5）**：所有模块都达到中高级水平，手写题完整且能深入讨论设计取舍，建议进入二面
- **推荐（3.5 - 4.4）**：大部分模块达到中级水平，核心原理扎实，手写题功能基本完整，可以进入二面但需要二面深挖项目实战
- **待定（2.5 - 3.4）**：基础原理了解但深度不足，手写题有缺失，可以放二面但需要二面侧重考察实际项目能力
- **不推荐（< 2.5）**：原理层面停留在 API 使用层面，追问均无法深入，手写题失败，不建议进入下一轮

### 核心判定信号速查

| 信号 | 含义 |
|------|------|
| 能独立画出响应式全链路图 | 高级信号，极少见 |
| 能解释 Reflect receiver 的 this 问题 | 中高级分水岭 |
| 能说清楚 push 触发几次 set + 暂停追踪 | 实战经验信号 |
| 能把 Diff 五步法落实到具体数组推演 | 中级确定信号 |
| computed 手写中正确使用 dirty + scheduler | 理论与实践的桥梁 |
| EventEmitter 手写中主动用 snapshot 防索引错乱 | 工程意识信号 |
| 能联系 scheduler 三队列讨论设计取舍 | 系统思维信号 |
| 全程只能说出"Proxy 能拦截新增属性" | 背题信号，需要结合项目问题验证 |
| 说不出组件通信除 props/emits/Pinia 之外的方案 | 项目经验可能水分 |
| 反问环节没有问题或只问薪资 | 岗位兴趣度存疑 |

---

## 附录：面试节奏与时间控制建议

| 时间段 | 环节 | 关键动作 |
|--------|------|---------|
| 0-3 min | 开场破冰 + 项目介绍 | 判断项目经验水分，为后续问题定难度基调 |
| 3-5 min | 过渡 | 如果项目经验信号强，后续可适当加速基础问题通过 |
| 5-12 min | Q1 + Q2 | reactive/ref + Proxy/Reflect —— 基础中的基础，如果这里卡壳，后续直接降难度 |
| 12-15 min | Q3 | effect/track/trigger —— 核心分水岭，深度决定候选人天花板 |
| 15-19 min | Q4 | computed vs watch —— 高频，注意 computed 缓存 + 惰性求值的理解深度 |
| 19-22 min | Q5 | nextTick —— 检验是否理解 Vue 异步更新机制 |
| 22-25 min | Q6 | 生命周期 —— 基础但父子组件的顺序 80% 的人说不全 |
| 25-29 min | Q7 | 组件通信全景 —— 考察广度 + 方案选择判断力 |
| 29-35 min | Q8 | Diff 算法 + 场景推演 —— 考察深度 + 逻辑推演能力 |
| 35-43 min | Q9 | 手写题 —— 8 分钟，注意时间控制，不足 4 分钟可给 1 次提示 |
| 43-45 min | 反问 | 观察候选人对技术/团队的关注点 |
| 45 min 后 | 复盘 | 填写评分矩阵，输出聘用建议 |

---

## 更新记录

- 2026-07-05：Phase 2 完整填充 —— 9 道题 + 追问阶梯 + 评分标准 + 复盘矩阵 + 附录时间控制
