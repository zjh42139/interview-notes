---
title: history / hash 模式
description: Vue Router 两种路由模式的核心原理、区别与服务端部署方案
category: VueRouter
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - hash
  - history
  - pushState
  - popstate
  - hashchange
  - Nginx
---

# history / hash 模式

> 面试必问。能说清楚"hash 的 `#` 不会发到服务器"这一点，基本就过关了；能进一步讲出 History 模式的 Nginx 配置，面试官会觉得你有真实部署经验。

## 一句话总结

Hash 模式通过 URL 的 `#` 锚点部分管理前端路由，`#` 后面的内容不会发送到服务器，前端通过 `hashchange` 事件监听变化；History 模式基于 HTML5 History API（`pushState`、`replaceState`）操作完整 URL 路径，URL 美观但需要服务端将所有路径回退到 `index.html`，否则刷新会 404。

## 核心机制

### 1. Hash 模式：`#` + `hashchange`

Hash 模式的核心是浏览器原生的 **锚点机制**：URL 中 `#` 及之后的部分统称为 "fragment identifier"，浏览器从不在 HTTP 请求中携带它。

```ts
// Hash 模式的工作原理简化版
window.addEventListener('hashchange', (e) => {
  // URL 从 /#/foo 变成 /#/bar 时触发
  const { oldURL, newURL } = e
  // 提取 # 后面的路径进行路由匹配
  const path = window.location.hash.slice(1)  // '/foo' → '/foo'
  router.match(path)
})

// 触发 hashchange 的三种方式：
// 1. 用户点击 <a href="#/foo">
// 2. 用户手动修改地址栏
// 3. 浏览器前进/后退按钮
```

**创建 router 实例时**：

```ts
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})
// 实际 URL 变成: http://localhost:3000/#/     和 http://localhost:3000/#/about
```

**关键行为**：用户访问 `http://localhost:3000/#/about`，浏览器发送给服务器的请求是 `GET /` —— `#` 及之后的内容完全不参与 HTTP 传输。

### 2. History 模式：HTML5 History API + `popstate`

History 模式利用 `pushState` / `replaceState` 在不刷新页面的情况下修改地址栏 URL，使得前端路由拥有**正常的 URL 外观**。

```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})
// 实际 URL 变成: http://localhost:3000/      和 http://localhost:3000/about
```

底层依赖三个浏览器 API：

| API | 作用 | 触发 popstate |
|-----|------|-------------|
| `history.pushState(state, title, url)` | 新增一条历史记录，URL 更新 | 否 |
| `history.replaceState(state, title, url)` | 替换当前历史记录，URL 更新 | 否 |
| `history.back()` / `history.forward()` | 前进/后退 | **是** |

```ts
// Vue Router 内部简化的 History 模式实现
window.addEventListener('popstate', (e) => {
  // 用户点击前进/后退按钮时触发
  const path = window.location.pathname
  router.match(path)  // 匹配对应路由并渲染组件
})

// 编程式导航内部调用 pushState（不触发 popstate，所以需要手动处理）
function navigate(path: string) {
  history.pushState({}, '', path)   // 修改 URL，不刷新页面
  router.match(path)                 // 手动触发路由匹配
}
```

**关键结论**：`pushState` 和 `replaceState` 只是单纯地修改 URL，浏览器不会发请求也不会做路由匹配，所有匹配逻辑都靠 Vue Router 在 JS 层面完成。只有用户刷新页面或直接访问时，浏览器才会发 HTTP 请求到服务器。

### 3. 核心区别对比

| 维度 | Hash 模式 | History 模式 |
|------|----------|-------------|
| URL 外观 | `xxx.com/#/user/profile` | `xxx.com/user/profile` |
| 发送到服务器 | `#` 之后内容**不发送** | **完整路径**都发送 |
| SEO 友好度 | 较差（搜索引擎基本忽略 `#` 后内容） | 良好（完整 URL 可以被收录） |
| 服务端配置 | **不需要**，前端 100% 控制 | **必须**配置 fallback |
| 监听事件 | `hashchange` | `popstate` |
| 兼容性 | IE8+ | IE10+（`pushState` 是 HTML5 特性） |
| 锚点功能 | 冲突（`#` 被路由占用） | 正常使用 `#anchor` |
| 实现复杂度 | 简单 | 需要前后端配合 |

## 深度拓展

### 追问1：History 模式为什么刷新会 404？

这是最能体现"理解深度"的问题。

用户直接访问 `http://example.com/user/profile`，浏览器向服务器发出 `GET /user/profile` 的请求。服务器上没有 `/user/profile` 这个静态文件，也没有匹配的后端路由，于是返回 404。

而 Hash 模式下，访问 `http://example.com/#/user/profile`，浏览器发送的请求是 `GET /`，服务器返回 `index.html`，前端拿到后再解析 `#/user/profile` 去匹配路由 —— 全程没服务器的事。

**解决方案核心思想**：让服务器对所有匹配不到静态文件的路径，都返回 `index.html`。

### 追问2：Nginx 如何配置 History 模式？

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
    # try_files 的工作逻辑：
    # 1. 尝试匹配 $uri（请求的路径对应的文件）
    # 2. 找不到文件，尝试 $uri/（对应目录）
    # 3. 还找不到，回退到 /index.html
    # 最终由 Vue Router 接管前端路由匹配
}
```

如果是子路径部署（如 `/admin/`），则需要配合 router 的 `base` 选项：

```ts
// router 配置
const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [...]
})
```

```nginx
# Nginx 子路径部署
location /admin/ {
    try_files $uri $uri/ /admin/index.html;
}
```

### 追问3：Vite / Webpack 开发环境如何处理？

开发环境下，Vite 和 webpack-dev-server 都内置了 History API fallback：

```ts
// vite.config.ts —— Vite 默认开启 historyApiFallback，无需配置

// vue.config.js —— webpack 需要显式配置
module.exports = {
  devServer: {
    historyApiFallback: true
    // 子路径部署：
    // historyApiFallback: { rewrites: [{ from: /^\/admin/, to: '/admin/index.html' }] }
  }
}
```

`historyApiFallback` 本质是一个中间件，当请求的文件不存在时，自动返回 `index.html` 而不是 404。

### 追问4：为什么后台管理系统通常用 Hash 模式？

很多后台管理系统之所以用 Hash 模式，不是因为 History 模式不好，而是因为**部署环境的不可控性**：

1. **Nginx 不一定能改**：很多公司运维和前端是不同团队，申请修改 Nginx 配置流程长
2. **静态资源托管平台**：部分云存储（如 OSS 静态网站托管）不支持 `try_files` 这种 rewrite 配置
3. **混合部署**：一个 Nginx 下挂着多个子系统，配置 `try_files` 可能影响其他系统
4. **历史遗留**：项目初期用 Hash 模式，后期改造成本高，加上后台管理系统的 SEO 不重要，没人推动切换

面试时这样回答优于"Hash 兼容性好"——前者反映真实的团队协作与部署场景认知。

## 项目实战

```ts
// 后台管理系统：Hash 模式 + 环境变量切换（为后续迁移预留空间）
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const router = createRouter({
  // 通过环境变量控制模式，方便后续迁移到 History
  history: import.meta.env.VITE_ROUTER_MODE === 'history'
    ? createWebHistory(import.meta.env.BASE_URL)
    : createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      meta: { title: '首页' }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: { title: '仪表盘', icon: 'dashboard', affix: true }
    }
  ]
})

// 如果后续改为 History 模式部署到 /admin/ 子路径
// 只需修改 .env.production:
//   VITE_ROUTER_MODE=history
//   BASE_URL=/admin/
// 同时 Nginx 对应配置 try_files
```

## 易错点

**❌ 以为 `popstate` 触发所有 URL 变化**
`pushState` 和 `replaceState` 不触发 `popstate`，只有前进/后退/`history.go()` 才会。Vue Router 内部在调用 `pushState` 后手动执行路由匹配，而不是依赖 `popstate`。

**❌ Hash 模式下 `location.hash` 的怪异值**
`location.hash` 返回的值**包含** `#`，如 `#/foo` 而不是 `/foo`。如果手动读取做比较，记得 `slice(1)` 去掉 `#`。

**❌ Hash 模式下锚点跳转**
Hash 模式占用了 `#`，原生的 `<a href="#section">` 锚点跳转失效。需要通过 `scrollBehavior` 或 `document.querySelector('#section').scrollIntoView()` 手动实现。

**❌ 部署到 Express / Koa 忘记配置 fallback**

```ts
// Koa 后端的 fallback 配置
const Koa = require('koa')
const static = require('koa-static')
const { historyApiFallback } = require('koa2-connect-history-api-fallback')

const app = new Koa()
app.use(historyApiFallback({ whiteList: ['/api'] }))  // /api 开头的依然走后端
app.use(static('./dist'))
```

## 面试信号

当面试官问"Vue Router 的两种模式有什么区别"，你的回答骨架：

1. **Hash 模式**：依赖 `#` 锚点，`#` 后内容不发送到服务器，前端通过 `hashchange` 监听变化。部署简单，不需要服务端配合，但 URL 不够美观，SEO 差
2. **History 模式**：依赖 HTML5 History API（`pushState` / `replaceState` / `popstate`），URL 美观、SEO 友好，但需要服务端将所有路径回退到 `index.html`，否则刷新 404
3. **部署方案**：Nginx 用 `try_files $uri $uri/ /index.html`；开发时 Vite 内置支持、webpack 需配 `historyApiFallback`
4. **场景选择**：后台管理系统通常用 Hash（部署简单、不依赖运维），C 端/官网用 History（SEO 和分享链接友好）

## 相关阅读

- [路由守卫](./route-guards.md) — 两种模式下守卫行为完全一致
- [导航故障处理](./navigation-failures.md) — duplicate navigation 与模式无关

## 更新记录

- 2026-07：完整填充（Phase 1），含 Nginx 配置、子路径部署、开发环境 fallback
