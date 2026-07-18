---
title: qiankun 深度解析
description: qiankun 微前端框架核心机制：三种 JS 沙箱（SnapshotSandbox / LegacySandbox / ProxySandbox）、with+proxy 执行机制、CSS 隔离、initGlobalState 通信、生命周期、预加载与常见坑点
category: 微前端
type: comparison
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - qiankun
  - 微前端
  - ProxySandbox
  - LegacySandbox
  - SnapshotSandbox
  - CSS隔离
  - initGlobalState
---

# qiankun 深度解析

> "qiankun 不是微前端标准，但它几乎成了国内微前端的事实标准。"

---

## 一句话总结

qiankun 是基于 single-spa 封装的微前端框架，由阿里出品。它在 single-spa 的路由分发能力之上，提供了三大核心能力：**JS 沙箱**（SnapshotSandbox / LegacySandbox / ProxySandbox 三种）、**CSS 样式隔离**（Shadow DOM / 前缀加 scope）、**应用间通信**（initGlobalState）。子应用只需导出 `bootstrap`、`mount`、`unmount` 三个生命周期函数即可接入，配合 `prefetch` 预加载机制，在空闲时提前拉取子应用资源，实现页面秒切。

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

### 2. JS 沙箱：SnapshotSandbox / LegacySandbox / ProxySandbox

这是 qiankun 面试的最高频考点。三种沙箱是一条演进线：快照（兼容 IE）→ 记账（Proxy 单实例）→ 完全隔离（Proxy 多实例）。

#### ProxySandbox（推荐）

```ts
// 原理：用 Proxy 代理子应用的 window 操作（简化版，真实实现代理的是一个 fakeWindow）
class ProxySandbox {
  updateValueMap: Record<PropertyKey, any> = {}

  // 注意：trap 要用箭头函数捕获实例 this——
  // 普通方法写法里 this 指向 handler 对象，拿不到 updateValueMap
  proxy = new Proxy(window, {
    get: (target, key) => {
      // 优先从沙箱自己的"伪造 window"取值
      if (key in this.updateValueMap) {
        return this.updateValueMap[key]
      }
      return (target as any)[key]
    },
    set: (_target, key, value) => {
      // 写入操作记录到 updateValueMap，不污染真实 window
      this.updateValueMap[key] = value
      return true
    },
  })

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
const win = window as any

class SnapshotSandbox {
  windowSnapshot: Record<string, any> = {}   // 激活时的 window 备份
  modifyMap = new Map<string, any>()         // 子应用改过的 key（跨激活保留）

  active() {
    // 1. 激活前：保存当前 window 快照
    this.windowSnapshot = {}
    Object.keys(window).forEach(key => {
      this.windowSnapshot[key] = win[key]
    })

    // 2. 恢复上次运行时的修改记录
    this.modifyMap.forEach((value, key) => {
      win[key] = value
    })
  }

  inactive() {
    // 3. 失活时：对比快照，记录子应用修改过的 key
    Object.keys(window).forEach(key => {
      if (win[key] !== this.windowSnapshot[key]) {
        this.modifyMap.set(key, win[key])
        // 4. 恢复 window 到快照值
        win[key] = this.windowSnapshot[key]
      }
    })
  }
}
```

**核心思想**：激活前拍快照（备份），失活时对比差异、记录修改、恢复原状。就像 Git 的 stash 机制。

#### LegacySandbox（单实例 Proxy 沙箱）

介于两者之间的过渡方案：也用 Proxy，但不伪造 window，而是**边写边记账**。通过 `sandbox: { loose: true }` 启用。

```ts
class LegacySandbox {
  // 三张记录表——只记 diff，不做全量快照
  addedPropsMapInSandbox = new Map()                 // 沙箱期间新增的 window 属性
  modifiedPropsOriginalValueMapInSandbox = new Map() // 被修改属性的原始值
  currentUpdatedPropsValueMap = new Map()            // 新增+修改的最新值（再次激活时回放）

  proxy = new Proxy(window, {
    set: (target: any, key, value) => {
      if (!target.hasOwnProperty(key)) {
        this.addedPropsMapInSandbox.set(key, value)        // 新增属性
      } else if (!this.modifiedPropsOriginalValueMapInSandbox.has(key)) {
        this.modifiedPropsOriginalValueMapInSandbox.set(key, target[key]) // 首次修改，记原值
      }
      this.currentUpdatedPropsValueMap.set(key, value)
      target[key] = value   // ⚠️ 仍然直接写真实 window——运行期间照样污染
      return true
    },
    get: (target: any, key) => target[key],
  })

  active() {
    // 回放上一次运行时的修改
    this.currentUpdatedPropsValueMap.forEach((v, k) => ((window as any)[k] = v))
  }

  inactive() {
    // 按账本精准还原：改过的恢复原值，新增的删掉
    this.modifiedPropsOriginalValueMapInSandbox.forEach((v, k) => ((window as any)[k] = v))
    this.addedPropsMapInSandbox.forEach((_, k) => delete (window as any)[k])
  }
}
```

**核心思想**：和快照沙箱一样"失活还原"，但靠 Proxy 在写入时记账，激活/失活只处理**变更过的属性**，不用遍历 window 全部 key —— 性能优于 SnapshotSandbox。代价是写操作仍落在真实 window 上：运行期间照样污染全局，且同一时刻只能跑一个子应用（单实例）。

#### 三种沙箱对比

| 维度 | SnapshotSandbox | LegacySandbox | ProxySandbox |
|------|-----------------|---------------|--------------|
| **原理** | 激活拍快照，失活 diff + 还原 | Proxy 记账（三张 Map），失活按账本还原 | Proxy + fakeWindow，写操作不落真实 window |
| **运行期间污染 window** | 污染（失活后还原） | 污染（失活后还原） | 不污染 |
| **性能** | 低（激活/失活都要遍历 window 全部 key） | 中（只处理变更过的属性） | 高（无遍历、无还原成本） |
| **支持多实例** | 不支持 | 不支持（直接操作真实 window） | 支持（每个子应用独立 fakeWindow） |
| **启用条件** | 浏览器不支持 Proxy（IE）时自动降级 | `sandbox: { loose: true }` | 支持 Proxy 的浏览器默认启用 |

> 面试信号："能说出三种沙箱的演进关系（快照 → 记账 → 完全隔离）和各自的启用条件"

#### 沙箱如何生效：with(proxy) + new Function

沙箱对象造出来了，怎么让子应用代码"以为"proxy 就是 window？qiankun 通过 import-html-entry 拿到子应用的 JS 代码**字符串**后，不是直接插 `<script>` 执行，而是包一层再执行：

```js
// import-html-entry 中 execScripts 的简化逻辑
const executableScript = `
  ;(function(window, self, globalThis){
    with(window) {
      ${scriptText}
    }
  }).bind(window.proxy)(window.proxy, window.proxy, window.proxy);
`
eval(executableScript)  // 或 new Function 构造后调用
```

两个关键点：

1. **形参遮蔽**：函数形参 `window`/`self`/`globalThis` 全部传入沙箱的 proxy，子应用代码里显式的 `window.xxx` 读写全部命中代理
2. **with 兜底**：`with(window)` 把 proxy 顶到作用域链最前端，子应用里**不带前缀的全局访问**（如直接引用 `Vue`、给隐式全局变量赋值）也会先经过 proxy 的 `has`/`get`/`set` 陷阱，而不是直接落到真实全局作用域

所以"沙箱能拦住全局变量泄漏"不是 Proxy 一个人的功劳，而是 **with 改作用域链 + Proxy 拦截读写** 配合的结果。

> 细节：`with(window)` 包裹只在严格沙箱（ProxySandbox）路径启用；`loose: true` 的 LegacySandbox 只有形参遮蔽、没有 with——这也是它拦不住隐式全局变量（`foo = 1` 不带 `window.` 前缀）的原因之一。

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

原理：给子应用的所有样式选择器添加一个属性前缀，如 `.app-main` 被改写为 `div[data-qiankun="user-app"] .app-main`（容器 div 上会挂 `data-qiankun="应用名"` 属性）。

**优点**：不影响弹窗等挂载到 body 的组件的**存在**（不会像 Shadow DOM 那样连 DOM 都找不到），实现类似 Vue scoped 的效果。
**缺点**：实验性功能，有明确的能力边界——`@keyframes`、`@font-face`、`@import` 等规则不会被改写（动画名/字体仍是全局的）；挂到 `document.body` 的弹窗因为不在容器内，属性选择器匹配不到，样式照样丢；运行时遍历改写每条 CSS 规则有性能开销。

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
update（可选：loadMicroApp 手动加载模式下，调用 microApp.update(props) 触发）
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

`prefetch: true` 时，qiankun 会在**第一个子应用 mount 完成后**，利用浏览器空闲时间（`requestIdleCallback`）提前拉取其他子应用的 HTML/CSS/JS 资源并缓存。当用户真正切换到该子应用时，资源已经在缓存中，实现**秒切**效果。

可选值：`true`（默认，第一个子应用挂载后预加载其他子应用）、`'all'`（`start()` 后立即预加载所有子应用，不等首个应用挂载）、`string[]`（第一个子应用挂载后只预加载指定名称的子应用）、`function`（完全自定义，区分首屏关键应用和次要应用的加载时机）、`false`（关闭预加载）。

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
4. **深度**：知道 qiankun 的更新机制（loadMicroApp 手动模式下的 `update` 生命周期，路由模式不会自动检测 props 变更）、资源加载机制（import-html-entry 解析子应用 HTML 提取 JS/CSS）

---

## 相关阅读

- [微前端概述](./overview.md) — 六种方案对比与选型决策
- [Module Federation](./module-federation.md) — 另一种模块共享思路
- [CSS Flexbox 布局](../../CSS/flexbox.md) — 子应用内布局方案

---

## 更新记录

- 2026-07-18（二审）：SnapshotSandbox 示例补齐字段声明（原代码首次 active 会因 modifyMap 未初始化报错）；补充 with 包裹仅在非 loose 路径启用的细节；update 生命周期描述修正（loadMicroApp 手动触发，路由模式不自动检测 props）；相关阅读"四种"→"六种"
- 2026-07-18：事实审计——补齐 LegacySandbox 小节（三张记录表 + 单实例 + 与快照沙箱的性能对比）、新增 with(proxy) + new Function 执行机制小节、两沙箱对比表扩为三沙箱；修正 experimentalStyleIsolation 选择器格式（`div[data-qiankun="应用名"]`）及能力边界（@keyframes/@font-face 不被改写）；修正 prefetch 可选值（删除不存在的 `'popstate'`，补 true 与 'all' 的时机差异）；修复 ProxySandbox 示例中 handler 内 this 指向错误
- 2026-07-06：完成内容填充，新增 ProxySandbox vs SnapshotSandbox 对比、CSS 隔离两种模式、生命周期流程图、三种常见问题及解决方案
