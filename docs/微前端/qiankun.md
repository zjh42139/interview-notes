---
title: qiankun 深度解析
description: qiankun 微前端框架核心机制：JS 沙箱（ProxySandbox vs SnapshotSandbox）、CSS 隔离、initGlobalState 通信、生命周期、预加载与常见坑点
category: 微前端
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
tags:
  - qiankun
  - 微前端
  - ProxySandbox
  - SnapshotSandbox
  - CSS隔离
  - initGlobalState
---

# qiankun 深度解析

> "qiankun 不是微前端标准，但它几乎成了国内微前端的事实标准。"

---

## 一句话总结

qiankun 是基于 single-spa 封装的微前端框架，由阿里出品。它在 single-spa 的路由分发能力之上，提供了三大核心能力：**JS 沙箱**（ProxySandbox / SnapshotSandbox）、**CSS 样式隔离**（Shadow DOM / 前缀加 scope）、**应用间通信**（initGlobalState）。子应用只需导出 `bootstrap`、`mount`、`unmount` 三个生命周期函数即可接入，配合 `prefetch` 预加载机制，在空闲时提前拉取子应用资源，实现页面秒切。

---

## 核心机制

### 1. 核心 API

```ts
import { registerMicroApps, start, setDefaultMountApp } from 'qiankun'

// 注册子应用
registerMicroApps([
  {
    name: 'user-app',             // 子应用唯一标识
    entry: '//localhost:8081',    // 子应用入口地址
    container: '#sub-app-container', // 子应用挂载的 DOM 节点
    activeRule: '/user',          // 激活路由
    props: {                      // 传递给子应用的数据
      globalState: { token: 'xxx' },
      parentRouter: router,
    },
  },
  {
    name: 'order-app',
    entry: '//localhost:8082',
    container: '#sub-app-container',
    activeRule: '/order',
  },
])

// 设置默认加载的子应用
setDefaultMountApp('/user')

// 启动微前端
start({
  prefetch: true,       // 预加载子应用资源
  sandbox: {
    strictStyleIsolation: true,  // 严格 CSS 隔离
  },
})
```

### 2. JS 沙箱：ProxySandbox vs SnapshotSandbox

这是 qiankun 面试的最高频考点。

#### ProxySandbox（推荐）

```ts
// 原理：用 Proxy 代理子应用的 window 操作
class ProxySandbox {
  constructor() {
    this.proxy = new Proxy(window, {
      get(target, key) {
        // 优先从沙箱自己的"伪造 window"取值
        if (key in this.updateValueMap) {
          return this.updateValueMap[key]
        }
        return target[key]
      },
      set(target, key, value) {
        // 写入操作记录到 updateValueMap，不污染真实 window
        this.updateValueMap[key] = value
        return true
      },
    })
  }

  // 激活沙箱：子应用的代码在沙箱内运行
  active() {
    // 子应用代码执行时，所有 window 操作被 Proxy 拦截
  }

  // 关闭沙箱：子应用卸载时，清除记录
  inactive() {
    this.updateValueMap = {}
  }
}
```

**核心思想**：子应用的全局变量修改被拦截在一个 `updateValueMap` 里，不会污染真实的 `window`。子应用 A 写 `window.userName = 'A'`，子应用 B 看到的 `window.userName` 还是 `undefined` —— 因为它们各自访问的是不同沙箱的代理对象。

#### SnapshotSandbox（兼容 IE 的降级方案）

```ts
class SnapshotSandbox {
  active() {
    // 1. 激活前：保存当前 window 快照
    this.windowSnapshot = {}
    Object.keys(window).forEach(key => {
      this.windowSnapshot[key] = window[key]
    })

    // 2. 恢复上次快照记录
    this.modifyMap.forEach((value, key) => {
      window[key] = value
    })
  }

  inactive() {
    // 3. 失活时：记录子应用修改过的 key
    Object.keys(window).forEach(key => {
      if (window[key] !== this.windowSnapshot[key]) {
        this.modifyMap.set(key, window[key])
        // 4. 恢复 window 到快照值
        window[key] = this.windowSnapshot[key]
      }
    })
  }
}
```

**核心思想**：激活前拍快照（备份），失活时对比差异、记录修改、恢复原状。就像 Git 的 stash 机制。

#### 两种沙箱对比

| 维度 | ProxySandbox | SnapshotSandbox |
|------|-------------|-----------------|
| **原理** | Proxy 代理拦截，读写隔离 | 快照-恢复，激活前备份/失活后还原 |
| **性能** | 高（无需遍历 window） | 低（每次激活/失活都要遍历 window 所有 key） |
| **支持多实例** | 支持（每个子应用独立沙箱实例） | 不支持（依赖真实 window 做快照还原） |
| **兼容性** | 需要 Proxy（不支持 IE） | 无特殊要求，IE 可用 |
| **使用场景** | 现代浏览器 | 需要兼容 IE 的老项目 |

> 面试信号："能说出 ProxySandbox 和 SnapshotSandbox 的区别和适用场景"

### 3. CSS 隔离

#### strictStyleIsolation：Shadow DOM

```ts
start({ sandbox: { strictStyleIsolation: true } })
```

原理：将子应用包裹在 Shadow DOM 中，Shadow DOM 内的样式天然与外部隔离。

**优点**：彻底隔离，不会有任何样式泄漏。
**缺点**：子应用内的弹窗组件（如 element-plus 的 Dialog）默认挂载在 `document.body` 上，会跑到 Shadow DOM 外面，导致弹窗没有样式。需要手动调整挂载点。

#### experimentalStyleIsolation：前缀加 scope

```ts
start({ sandbox: { experimentalStyleIsolation: true } })
```

原理：给子应用的所有样式选择器添加一个唯一的前缀属性，如 `div[data-qiankun-user-app]`。

**优点**：不影响弹窗等挂载到 body 的组件。
**缺点**：实验性功能，对动态插入的 `<style>` 标签处理不完善；性能开销（需要遍历修改每一条 CSS 规则）。

### 4. 应用间通信：initGlobalState

```ts
import { initGlobalState, MicroAppStateActions } from 'qiankun'

// 基座 —— 初始化全局状态
const actions: MicroAppStateActions = initGlobalState({
  user: { name: 'admin', role: 'super' },
  token: 'xxx',
})

// 监听状态变更
actions.onGlobalStateChange((state, prev) => {
  console.log('全局状态发生变化：', state, prev)
})

// 修改全局状态
actions.setGlobalState({
  user: { name: 'editor', role: 'normal' },
})

// 子应用 —— 通过 props 接收 actions
export async function mount(props) {
  // props 中包含 onGlobalStateChange 和 setGlobalState
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用收到状态变更：', state)
  })
}
```

本质上是一个发布-订阅模式的小型状态池，不是 Redux/Pinia 级别的状态管理，只适合**少量、低频**的全局数据（如用户信息、主题、语言）。

### 5. 生命周期

```
浏览器 URL 变化
    ↓
匹配 activeRule
    ↓
beforeLoad（子应用资源开始加载）
    ↓
bootstrap（子应用初始化，只执行一次）
    ↓
mount（子应用挂载，每次激活都执行）
    ↓
    …… 用户切换子应用 ……
    ↓
unmount（子应用卸载，清理资源）
    ↓
update（可选：props 更新时触发）
```

子应用入口改造（以 Vue3 为例）：

```ts
// main.ts —— 子应用需要导出生命周期函数
let instance: App<Element> | null = null

function render(props = {}) {
  const { container } = props as any
  instance = createApp(App)
  instance.mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行（非 qiankun 环境）
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('子应用初始化')
}

export async function mount(props: any) {
  render(props)
}

export async function unmount() {
  instance?.unmount()
  instance = null
}
```

### 6. 预加载机制

```ts
start({ prefetch: true })
```

`prefetch: true` 时，qiankun 会在浏览器空闲时（利用 `requestIdleCallback`）提前拉取其他子应用的 HTML/CSS/JS 资源并缓存。当用户真正切换到该子应用时，资源已经在缓存中，实现**秒切**效果。

可选值：`true`（所有子应用）、`'all'`（所有）、`string[]`（指定子应用名称数组）、`'popstate'`（仅在浏览器前进/后退时预加载）。

---

## 常见问题

### 1. 子应用路由 404

**原因**：子应用单独开发时，访问 `/user/detail` 是由子应用的 devServer 处理的。但接入 qiankun 后，是由基座的 URL 拼接的子应用路径。

**解决**：子应用的 webpack devServer 需要配置 `publicPath`，路由需要配置 `base`。

```ts
// vue-router
const router = createRouter({
  history: createWebHistory((window as any).__POWERED_BY_QIANKUN__ ? '/user' : '/'),
  routes,
})
```

### 2. 样式冲突

即使配置了 CSS 隔离，仍可能出现冲突：
- 子应用修改了全局样式（如 `body { margin: 0 }`）
- 第三方库的样式被全局挂载

**解决**：子应用约定 CSS 命名空间（如所有选择器加 `.user-app` 前缀），或使用 CSS Modules。

### 3. 公共依赖重复加载

**问题**：子应用 A 和子应用 B 各自打包了 element-plus（500KB+），用户切换应用时重复下载。

**解决**：通过 webpack `externals` 配置，将 element-plus、vue、lodash 等公共库从子应用 bundle 中排除，由基座或 CDN 统一提供。

```js
// 子应用的 vue.config.js / webpack.config.js
module.exports = {
  configureWebpack: {
    externals: {
      vue: 'Vue',
      'element-plus': 'ElementPlus',
    },
  },
}
```

---

## 面试信号

当面试官问 qiankun 时，能区分以下几个层次：

1. **基础**：能说出 `registerMicroApps`、`start`、生命周期
2. **进阶**：能解释 ProxySandbox 的 Proxy 拦截原理，对比 SnapshotSandbox 的快照恢复
3. **实战**：遇到过样式冲突、路由 404、公共依赖重复加载，并知道如何解决
4. **深度**：知道 qiankun 的更新机制（`update` 生命周期 + props 变更检测）、资源加载机制（import-html-entry 解析子应用 HTML 提取 JS/CSS）

---

## 相关阅读

- [微前端概述](./overview.md) — 四种方案对比与选型决策
- [Module Federation](./module-federation.md) — 另一种模块共享思路
- [CSS Flexbox 布局](../CSS/flexbox) — 子应用内布局方案

---

## 更新记录

- 2026-07-06：完成内容填充，新增 ProxySandbox vs SnapshotSandbox 对比、CSS 隔离两种模式、生命周期流程图、三种常见问题及解决方案
