---
title: 生命周期 面试回答
description: 面试中如何回答 Vue3 生命周期——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - 生命周期
  - onMounted
  - setup
  - 父子组件
  - 面试回答
---

# 生命周期 面试回答

## Q1: Vue3 的生命周期钩子有哪些？父子组件执行顺序是怎样的？

### 30 秒版本

"Vue3 用 onXxx 形式的钩子——onMounted/onUpdated/onUnmounted 等 8 个。setup 替代了 beforeCreate 和 created——在这两个之前执行。父子顺序——挂载是子组件先 mounted 父后，更新是父先 beforeUpdate 子后 updated。记不住就记'挂载从子到父，更新从父到子'。"

### 2 分钟版本

"先说 Vue3 比 Vue2 的变化：beforeCreate 和 created 被 setup 替代——因为它们做的初始化工作在 setup 里更自然。其余钩子改名：destroyed→unmounted、beforeDestroy→beforeUnmount，加了 onRenderTracked/onRenderTriggered 两个调试钩子。

**父子组件的执行顺序**是面试高频追问：

挂载阶段：父 setup→父 beforeMount→子 setup（父 render 到子组件时才创建它）→子 beforeMount→子 mounted→父 mounted。为什么是这个顺序？因为父组件的挂载需要子组件先完成——父的 DOM 包含子的 DOM，子没挂完父就不能算挂好；而子组件的创建又发生在父 render 之后，所以子 setup 排在父 beforeMount 后面。

更新阶段：父 beforeUpdate→子 beforeUpdate→子 updated→父 updated。父的更新影响子（props 变了），所以子先更新完父才算更新完。

卸载阶段：父 beforeUnmount→子 beforeUnmount→子 unmounted→父 unmounted。和挂载对称——子先卸父后卸。

**KeepAlive 组件的特殊钩子**：被缓存的组件多了 activated（切回来）和 deactivated（切出去）。首次挂载时 activated 也会触发——在 mounted 之后；之后的切换只走 activated/deactivated，不再触发 mounted/unmounted。

**setup 执行时机**：props 初始化→setup()→beforeCreate→created→…。setup 最早——连 beforeCreate 都在它后面。所以在 setup 里没有 this。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "setup 和 created 哪个先执行" | setup 先——setup 在组件实例创建前执行，created 在实例创建后。setup 里 this 是 undefined 就是因为实例还没创建 |
| "为什么挂载顺序是子先父后" | 父组件的 DOM 包含子组件——子组件挂载是父组件挂载的一部分。所以子 mounted 先触发，父 mounted 后触发 |
| "onMounted 里能做异步请求吗" | 可以——但不推荐。异步请求应该放在 setup 顶层直接执行（甚至不用 `await`），配合 Suspense 处理加载态 |

## Q2: Vue3 onUnmounted 里应该做什么？和 Vue2 destroyed 的区别？

### 30 秒版本

"onUnmounted 是清理时机——清除定时器、取消 DOM 事件监听、停止 watch/effect 追踪、断开 WebSocket。和 destroyed 功能一样——都是在组件实例销毁后调用。区别只是 Vue3 的命名更明确：unmounted = 已卸载。此时 DOM 已移除、响应式已停、实例已销毁——你的清理代码不会触发响应式更新，也不会有任何意外。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "onBeforeUnmount 和 onUnmounted 的区别" | onBeforeUnmount 时 DOM 还在——还能读取尺寸做退出动画；onUnmounted 时 DOM 已移除 |
| "不清理定时器会怎样" | 组件卸载后定时器回调仍然会执行——尝试更新已销毁组件的数据→控制台警告。单页应用中尤其严重——反复进入退出→定时器堆积 |

## 别踩的坑

1. **"created 里能访问 DOM"** —— 不能。created 时组件还没挂载。DOM 操作放 onMounted 里
2. **onMounted 在服务端渲染不执行** —— SSR 时组件在 Node 环境创建——只有 beforeCreate 和 created（setup）。onMounted 只有客户端执行
3. **setup 里没有 this** —— setup 在组件实例创建前执行——this 是 undefined。访问 props 用参数、emit 用 context.emit

## 相关阅读

- [生命周期 知识文档](../../Vue3/lifecycle.md)
- [KeepAlive 面试回答](../../Vue3/keepalive.md)（知识文档）
- [响应式原理 面试回答](./reactivity.md)

## 更新记录

- 2026-07-18：Phase 4 对齐——挂载顺序补全 setup 位置（父 setup→父 beforeMount→子 setup→子 beforeMount→子 mounted→父 mounted）、KeepAlive 钩子时机改为"首次挂载 activated 在 mounted 之后"
- 2026-07-11：新建（30秒/2分钟/追问预判/易错点 标准格式）
