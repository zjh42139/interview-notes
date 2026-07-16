---
title: computed / watch 面试回答
description: 面试中如何回答 computed 和 watch——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - computed
  - watch
  - watchEffect
  - 响应式
  - 面试回答
---

# computed / watch 面试回答

## Q1: computed 和 methods 有什么区别？computed 的缓存是怎么实现的？

### 30 秒版本

"computed 有缓存——依赖不变时直接返回上次的计算结果，不重新执行。methods 每次调用都重新执行。computed 内部用 effect + dirty 标记实现——依赖变了标记 dirty 为 true，下次访问时重新计算并把 dirty 设回 false。这就是它的惰性求值机制。"

### 2 分钟版本

"computed vs methods 是面试经典开场，但深度在于 computed 的缓存原理。

**缓存机制**：computed 内部创建了一个 effect（和渲染 effect 同类），但它不是立即执行的——它是惰性的。effect 有一个 dirty 标记。依赖的响应式数据变化时，trigger 把 computed 的 dirty 标为 true，但不立即重新计算。只有当组件真正访问 computed.value 时，才检查 dirty——如果为 true 就重新计算，如果为 false 就返回缓存值。这就是为什么 computed 叫"惰性求值"。

**和 methods 的关键区别**：模板中调 methods：每次渲染都重新执行；模板中访问 computed：只在依赖变化时重新计算。在一个循环渲染 100 行的表格里，`methods()` 每次 re-render 执行 100 次，`computed` 依赖不变时执行 0 次。

**computed 可以写**：提供 set 方法。`computed({ get() { return ... }, set(val) { ... } })`。set 时通常修改依赖的响应式数据——触发 computed 重新计算。

**和 Vue2 的区别**：Vue2 的 computed 是通过 `Object.defineProperty` 挂到 vm 上的——对组件实例有侵入。Vue3 的 computed 是纯函数——返回一个 ref，更干净。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "computed 依赖的其他 computed 会怎样" | 链式依赖——A computed 依赖 B computed。B dirty→A dirty。访问 A 时会先递归检查所有依赖的 dirty 状态 |
| "computed 里能做异步吗" | 不应该。computed 的设计是同步纯函数——没有 await。异步派生用 watch + 手动赋值 |
| "为什么 computed 不适合做副作用" | computed 的 getter 应该无副作用——它可能在多次访问期间被多次调用。副作用（发请求/写 cookie）放 watch 里 |

## Q2: watch 和 watchEffect 有什么区别？什么时候用哪个？

### 30 秒版本

"watch 惰性执行——需要指定数据源、支持 oldValue/newValue 对比。watchEffect 立即执行——自动追踪回调中用到的所有响应式数据。watch 适合'数据变化后做某件事'（如路由参数变化后发请求），watchEffect 适合'任何依赖变化都要重新执行'（如根据多个响应式值更新 DOM）。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "watch 的 deep 选项有什么性能问题" | deep 会递归遍历所有嵌套属性做依赖收集——大对象 deep watch 非常耗性能。尽量 watch 具体属性而非整个对象 |
| "watchEffect 怎么停止" | 返回值是 stop 函数——调用即停止追踪。组件卸载时在 setup 中注册的 watchEffect 自动停止 |
| "flush:'post' 是什么意思" | 回调在 DOM 更新后执行——相当于在 nextTick 之后。适合需要在回调中操作更新后 DOM 的场景 |

## Q3: watch 的 immediate 和 deep 分别怎么用、有什么坑？

### 30 秒版本

"immediate 让 watch 在初始时就执行一次——第一个参数 oldValue 是 undefined。deep 递归遍历对象的所有嵌套属性做依赖收集——大对象耗性能。两者可以组合——`{ immediate: true, deep: true }` 初始就深度监听。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "deep watch 大对象怎么办" | 用 `() => obj.specificKey` 只 watch 具体路径——代替 deep:true。或用 shallowRef 包装 |
| "watch 数组怎么监听" | `watch([a, b], ([newA, newB], [oldA, oldB]) => {})`——数组形式同时监听多个源 |

## 别踩的坑

1. **"computed 是响应式的所以能 watch computed"** —— 可以。computed 返回 ref——watch 可以直接监听
2. **watchEffect 不能获取 oldValue** —— 它的设计是自动追踪——不像 watch 能明确传 oldValue/newValue
3. **watch 的 reactive 对象新旧值相同** —— watch 一个 reactive 对象时，newVal === oldVal（都是同一个 Proxy 对象）。需要监听具体属性才能拿到不同的值

## 相关阅读

- [computed / watch 知识文档](../../Vue3/computed-watch.md)
- [响应式原理 面试回答](./reactivity.md)
- [Scheduler 调度器](../../Vue3/scheduler.md)

## 更新记录

- 2026-07-11：新建（30秒/2分钟/追问预判/易错点 标准格式）
