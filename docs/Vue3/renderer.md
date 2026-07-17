---
title: Renderer
description: Vue3 自定义渲染器的设计原理与 createRenderer API
category: Vue3
type: mechanism
score: 85
difficulty: 高级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - Renderer
  - createRenderer
  - patch
  - 自定义渲染器
---

# Renderer

> 这个点能回答好，说明你对 Vue3 架构有全局理解。大部分面试者只知道"Vue 更新 DOM"，不知道 Vue 其实**不关心渲染的目标是什么**。

## 一句话总结

Vue3 的 Renderer 是**平台无关的渲染引擎**，通过 `createRenderer( nodeOps )` 注入平台特定的 DOM 操作，实现了运行时（响应式 + 组件系统）和渲染目标（DOM / Canvas / 小程序 / 终端）的完全解耦。

## 核心机制

### 1. createRenderer：自定义渲染器的工厂函数

```ts
// 核心架构（源码: packages/runtime-core/src/renderer.ts）
function createRenderer(options: RendererOptions) {
  const {
    createElement,   // 创建元素: document.createElement (DOM) 或 new Element (Canvas)
    insert,          // 插入节点: parent.insertBefore (DOM)
    remove,          // 移除节点: parent.removeChild (DOM)
    patchProp,       // 更新属性: el.setAttribute / el.addEventListener (DOM)
    setElementText,  // 设置文本: el.textContent (DOM)
    // ... 等等
  } = options

  // ========== 平台无关的 patch 逻辑 ==========
  function patch(n1, n2, container, ...) {
    // 类型不同 → 卸载旧的、挂载新的
    // 类型相同 → 根据 shapeFlag 分发
    //   - ELEMENT → processElement  (再细分: 创建/更新/卸载)
    //   - COMPONENT → processComponent (再细分: 挂载/更新)
    //   - TEXT → processText
    //   - FRAGMENT → processFragment
    //   - TELEPORT → processTeleport
  }

  function mountElement(vnode, container, ...) {
    const el = createElement(vnode.type)   // ← 平台相关
    // 设置 props, 递归 patch children
    insert(el, container)                  // ← 平台相关
  }

  return {
    render(vnode, container) { /* 首次渲染入口 */ },
    hydrate(vnode, container) { /* SSR 注水入口 */ }
  }
}

// ========== DOM 渲染器：Vue3 默认导出 ==========
const renderer = createRenderer({
  createElement: (tag) => document.createElement(tag),
  insert: (child, parent, anchor) => parent.insertBefore(child, anchor || null),
  remove: (child) => { const p = child.parentNode; p && p.removeChild(child) },
  patchProp: (el, key, prev, next) => {
    if (key.startsWith('on')) {
      // 事件处理: addEventListener / removeEventListener
    } else if (key === 'class') {
      el.className = next
    } else if (key === 'style') {
      // style 对象 diff
    } else {
      el.setAttribute(key, next)
    }
  },
  // ...
})
```

### 2. 为什么要把 Renderer 抽离出来？

```mermaid
flowchart TB
    subgraph Runtime["@vue/runtime-core (平台无关)"]
        Reactivity["响应式系统"]
        Component["组件系统"]
        Scheduler["调度器"]
        RendererCore["createRenderer()"]
        DiffPatch["Diff/Patch 算法"]
    end

    subgraph Platform["平台实现"]
        DOM["@vue/runtime-dom<br/>浏览器渲染"]
        SSR["@vue/server-renderer<br/>服务端字符串"]
        Custom["自定义渲染器<br/>小程序/Canvas/终端"]
    end

    Runtime -->|"传入 nodeOps"| Platform
```

三个关键收益：
1. **逻辑分层复用**：`@vue/runtime-core` 沉淀了组件系统/Diff/调度等平台无关逻辑，`@vue/runtime-dom` 只是注入了浏览器 `nodeOps` 的一个实例（注意：`@vue/server-renderer` 走的是独立的字符串序列化路径，不经过 patch/Diff）
2. **跨平台**：小程序渲染器（如 uni-app）、Canvas 渲染器、终端 UI 渲染器都基于 `createRenderer`
3. **测试**：单元测试中可以注入 mock 的 `nodeOps`，不依赖真实 DOM（Vue 官方的 `@vue/runtime-test` 就是这么做的）

### 3. renderer 和 compiler 的关系

**Compiler（编译器）** 把 template 编译成 VNode 创建函数（`render` 函数），**Renderer（渲染器）** 把 VNode 变成真实 DOM。两者通过 **VNode 数据结构** 解耦：

```
Template → [Compiler] → render() → VNode → [Renderer] → DOM
```

这也是为什么可以只用 `h()` 函数而不用 template —— 你手动构造 VNode，直接交给 Renderer。

## 深度拓展

### 自定义渲染器实战：概念代码

```ts
// 把 Vue 组件渲染到 Canvas
const canvasRenderer = createRenderer({
  createElement(type) {
    // 不是 document.createElement，而是创建一个绘图指令对象
    return { type, props: {}, children: [] }
  },
  insert(child, parent) {
    parent.children.push(child)
  },
  patchProp(el, key, prev, next) {
    el.props[key] = next
    // 触发重绘
    redrawCanvas()
  },
  setElementText(el, text) {
    el.text = text
    redrawCanvas()
  },
  // 没有 parentNode.removeChild，而是标记为待删除
  remove(child) { /* ... */ },
})

// 使用：在 Canvas 环境中运行 Vue 的响应式和组件系统
canvasRenderer.createApp({
  data: () => ({ count: 0 }),
  template: `<rect :x="count * 10" y="0" width="50" height="50" />`
}).mount('#canvas')
```

## 项目实战

后台管理系统通常不需要自定义渲染器，但理解它有助于：
- 理解**Vue DevTools** 的工作方式（它本质上是 hook 进了 renderer）
- 理解**单元测试中 Vue Test Utils** 的 `mount()`（组件被挂载到 jsdom/happy-dom 模拟的 DOM 环境中，用的仍是 runtime-dom）
- 理解**uni-app / Taro** 等跨端框架的 Vue3 适配（它们提供了小程序平台的 nodeOps）

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Vue3 的渲染器做了什么" | 追问 patch 函数——创建、更新、卸载三种操作的统一入口 |
| "虚拟 DOM 和真实 DOM 怎么同步" | 追问挂载（mount）和更新（patch）的两阶段流程 |
| "SSR 的渲染器和 DOM 渲染器有什么区别" | 追问服务端用 `@vue/server-renderer` 的 renderToString 直接把 VNode 序列化为 HTML 字符串（不走 patch）；`createSSRApp` 是客户端注水（hydration）入口 |
| "自定义渲染器怎么用" | 追问 createRenderer 传入自定义 nodeOps 实现跨平台渲染 |

## 易错点

1. **renderer 和 scheduler 不分** —— renderer 负责 DOM 操作（挂载/更新/卸载），scheduler 负责调度（什么时候更新）。面试中说"渲染器负责调度"直接暴露理解模糊
2. **patch 不是 diff** —— patch 是应用差异到 DOM，diff 是找差异。两个独立步骤，面试时常被混为一谈
3. **自定义渲染器的 nodeOps 不是随便写** —— createRenderer 传入的 nodeOps 必须实现完整的 insert/create/remove/setText 等接口，漏一个就报错
4. **SSR 不是"换一套 nodeOps 的渲染器"** —— `@vue/server-renderer` 复用的是 runtime-core 的组件/响应式逻辑，但输出走独立的字符串序列化路径（renderToString 遍历 VNode 拼 HTML，或执行编译出的 ssrRender 推字符串），服务端没有 patch/Diff；真正体现 `createRenderer` 换 nodeOps 价值的是 runtime-dom 与各类自定义渲染器

## 相关阅读

- [Diff / Patch](./diff-patch.md) — patch 函数是 Renderer 的核心
- [响应式原理](./reactivity.md) — Renderer 如何消费响应式数据变更
- [Scheduler](./scheduler.md) — Renderer 如何与异步任务调度协作

## 更新记录

- 2026-07：完整填充（Phase 2），加入架构图、createRenderer 简化源码、Canvas 渲染器概念代码
