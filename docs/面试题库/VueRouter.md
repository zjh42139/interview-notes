---
title: Vue Router 高频面试题
description: Vue Router 面试真题——路由守卫、动态路由、history vs hash、懒加载、KeepAlive 集成
category: 面试题库
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - VueRouter
  - 路由
  - 路由守卫
  - 动态路由
  - history
  - hash
---

# Vue Router 高频面试题

> 收录前端面试中的高频 Vue Router 真题，共 7 题。
> 题目按出现频率从高到低排列。

---

### Q1: history 和 hash 模式 | 对比题 原理与选型

**30秒答**：hash 模式 `#` 后内容不发送服务端——实现简单刷新不 404，基于 hashchange 事件。history 模式基于 pushState + popstate——URL 干净 SEO 友好，但刷新依赖 Nginx try_files 兜底。后台用 hash 省心，C 端用 history 好看。

**追问预测**：
- "history 模式刷新 404 怎么办" → Nginx `try_files $uri $uri/ /index.html`——非静态资源全部回退到 index.html
- "hash 模式能 SEO 吗" → 不能——搜索引擎忽略 `#` 后的内容，也不触发 JS。需要 SEO 用 SSR + history 模式
- "popstate 什么时候触发" → 前进/后退时——pushState 和 replaceState 本身不触发 popstate
> ⭐⭐⭐⭐⭐ | 难度：中级 | 🏷️ 对比题

**题目**：Vue Router 的 history 模式和 hash 模式有什么区别？如何选择？history 模式部署需要注意什么？

**考察点**：
- hash 模式底层：`hashchange` 事件，`#` 及之后的内容不发送到服务器
- history 模式底层：HTML5 History API（pushState/replaceState/popstate）
- 服务端配置：Nginx `try_files` 将所有路径回退到 `index.html`
- 选型：后台管理用 hash（零配置），C 端/官网用 history（SEO + 美观）

> 答案参考：[../VueRouter/history-vs-hash.md](../VueRouter/history-vs-hash.md)

---

### Q2: 路由守卫 | 概念题 全局/路由/组件三层守卫

**30秒答**：三层守卫——全局 beforeEach/beforeResolve/afterEach、路由独享 beforeEnter、组件内 beforeRouteEnter/beforeRouteUpdate/beforeRouteLeave。执行顺序：全局 beforeEach→路由 beforeEnter→组件 beforeRouteEnter→全局 beforeResolve→导航确认→afterEach。next 函数在 Vue3 中已不推荐——用 return 替代。

**追问预测**：
- "beforeEach 和 beforeResolve 有什么区别" → beforeEach 在组件解析前；beforeResolve 在组件解析后、导航确认前——"最后一道防线"
- "beforeRouteEnter 为什么不能访问 this" → 组件实例还没创建——回调的 next(vm) 参数可以拿到
- "守卫里怎么中断导航" → return false 或抛出 Error——Vue3 不推荐用 next(false)，用 return false
> ⭐⭐⭐⭐⭐ | 难度：中级 | 🏷️ 概念题

**题目**：Vue Router 的路由守卫有哪些类型？它们的执行顺序是怎样的？beforeEach 和 beforeResolve 的区别是什么？

**考察点**：
- 全局守卫（beforeEach/beforeResolve/afterEach）、路由独享（beforeEnter）、组件内（beforeRouteEnter/Update/Leave）
- 完整导航解析流程：beforeEach→beforeEnter→beforeRouteEnter→beforeResolve→afterEach
- Vue3 中 next 参数不再是必须——推荐 return false 或 return 路径
- 典型场景：权限校验（beforeEach）、数据预加载（beforeRouteEnter）、离开确认（beforeRouteLeave）

> 答案参考：[../VueRouter/route-guards.md](../VueRouter/route-guards.md)

---

### Q3: 动态路由 + 权限路由 | 场景题 addRoute 实现

**30秒答**：登录后后台返回角色路由表→router.addRoute 动态注入。关键细节：addRoute 之后需要 next({...to}) 触发重新匹配——否则当前 `*` 路由会吃掉未匹配的路径。removeRoute 用于退出登录清路由。菜单基于 router.getRoutes() 动态渲染。

**追问预测**：
- "addRoute 之后为什么需要 next" → addRoute 不会自动触发当前路由重新解析——未匹配的 `*` 通配符不会重新检查
- "怎么防止用户手动输 URL 访问无权限页面" → beforeEach 中检查 `to.meta.roles`——不在权限范围内则 403 或跳首页
- "退出登录怎么清路由" → `router.removeRoute('name')` + 重置为初始静态路由。或者 `window.location.reload()` 简单粗暴
> ⭐⭐⭐⭐⭐ | 难度：高级 | 🏷️ 场景题

**题目**：后台管理系统的权限路由是怎么实现的？`addRoute` 有哪些坑？如何保证不同角色看到不同的菜单？

**考察点**：
- `router.addRoute()` 运行时注入路由，支持嵌套路由
- `addRoute` 后需 `next({ ...to, replace: true })` 重新匹配
- `router.hasRoute()`/`router.getRoutes()` 运行时检查
- 菜单基于 `getRoutes()` 过滤 + 渲染（不依赖手动维护的菜单配置）
- 退出登录调用 `router.removeRoute()` 清理或 location.reload
- 前端权限只是 UX——真正的安全在后端 API 校验

> 答案参考：[../VueRouter/dynamic-routing.md](../VueRouter/dynamic-routing.md)
> 延伸：[../项目实战/权限系统/permission-rbac.md](../项目实战/权限系统/permission-rbac.md)

---

### Q4: 路由懒加载 | 概念题 原理 + 分包策略

**30秒答**：`() => import('./Foo.vue')` 动态导入——构建时拆分为独立 chunk，路由访问时才加载。魔法注释 webpackChunkName 指定包名。分组策略——首页路由不懒加载，次要页面全拆分。预加载用 `/* prefetch */`。

**追问预测**：
- "懒加载对首屏有影响吗" → 正向影响——首屏只加载首页 chunk，不加载其他页面的代码，FCP 更快
- "chunk 太大怎么办" → 按路由粒度拆分、用 splitChunks 提取公共依赖、分析包组成后优化
- "Suspense + 异步组件和路由懒加载的关系" → Suspense 处理异步组件加载态——loading 占位 + error fallback。路由懒加载是拆分维度，Suspense 是 UI 维度
> ⭐⭐⭐⭐ | 难度：初级 | 🏷️ 概念题

**题目**：Vue Router 的路由懒加载是怎么实现的？如何设计分包策略？

**考察点**：
- 动态 `import()` 返回 Promise，构建工具将其拆分为独立 chunk
- webpack 魔法注释 `/* webpackChunkName: "dashboard" */`
- 分组策略：首页同步加载、业务页面按模块分组、第三方库单独拆
- 与 prefetch/prerender 的区别和配合

> 答案参考：[../VueRouter/lazy-loading.md](../VueRouter/lazy-loading.md)
> 延伸：[../性能优化/bundle-optimization.md](../性能优化/bundle-optimization.md)

---

### Q5: KeepAlive + Router | 场景题 页面缓存

**30秒答**：router-view 用 v-slot + KeepAlive + include——指定哪些组件缓存。include 匹配组件 name 属性——不是路由 name。缓存后多了 activated/deactivated 钩子。配合 scrollBehavior 恢复滚动位置。A→详情→返回 A 这种典型场景。

**追问预测**：
- "KeepAlive 的 include 匹配什么" → 组件 name 属性——不是路由名称。组件没有 name → 无法被 include/exclude 精确控制
- "缓存页面的数据怎么刷新" → activated 钩子里判断是否需要重新请求——如缓存时间过期或数据版本号变化
- "KeepAlive max 超过上限会怎样" → LRU 淘汰最久未访问的组件——不触发 beforeUnmount，只触发 deactivated
> ⭐⭐⭐⭐ | 难度：中级 | 🏷️ 场景题

**题目**：Vue Router 如何配合 KeepAlive 实现页面缓存？缓存后如何刷新数据？列表到详情再返回列表的体验怎么保证？

**考察点**：
- `router-view` 的 v-slot 获取 Component——`<KeepAlive><component :is /></KeepAlive>`
- include/exclude 基于组件 name，非路由名称
- activated 钩子中判断是否需要刷新
- scrollBehavior + savedPosition 恢复滚动

> 答案参考：[../VueRouter/keepalive-integration.md](../VueRouter/keepalive-integration.md)
> 延伸：[../Vue3/keepalive.md](../Vue3/keepalive.md)

---

### Q6: 导航故障 | 排查题 duplicate navigation 处理

**30秒答**：重复导航（点同一路由）或导航取消会抛 NavigationFailure。Vue3 Router 用 `router.isReady()` 等待初始导航完成。`router.onError()` 全局捕获。常用兼容写法：`await router.push().catch(() => {})`——吞掉导航重复错误。

**追问预测**：
- "为什么 push 同一个路由会报错" → Vue3 Router 默认拦截重复导航——避免不必要的组件重渲染和性能浪费
- "怎么全局处理导航错误" → `router.onError(handler)` 或 beforeEach 中 try/catch——统一错误提示
- "router.replace 和 router.push 的区别" → push 新增历史记录（可返回），replace 替换当前记录（不可返回）
> ⭐⭐⭐ | 难度：中级 | 🏷️ 排查题

**题目**：Vue Router 中如何捕获和处理导航故障？`NavigationFailureType` 有哪些类型？

**考察点**：
- `NavigationFailureType`：`redirected`/`aborted`/`cancelled`/`duplicated`
- `router.push().catch()` 吞掉导航重复错误
- `router.isReady()` 确保初始导航完成
- `router.onError()` 全局导航错误处理

> 答案参考：[../VueRouter/navigation-failures.md](../VueRouter/navigation-failures.md)

---

### Q7: scrollBehavior | 概念题 滚动行为控制

**30秒答**：scrollBehavior 控制路由切换后的滚动位置——返回 savedPosition 保持列表位置、对象指定 x/y 锚点、el 选择器滚动到指定元素。smoothBehavior 需浏览器兼容。和 KeepAlive 组合使用才能实现"列表→详情→返回列表→停留原位"。

**追问预测**：
- "savedPosition 什么时候是 null" → 第一次进入页面（无历史位置）或 forward 导航——此时可以用 `top: 0`
- "scrollBehavior 和 KeepAlive 的关系" → KeepAlive 缓存 DOM 但不恢复滚动——scrollBehavior 单独处理滚动位置
- "hash 锚点滚动怎么处理" → 返回 `{ el: hash }`——如 `{ el: '#section-3' }`
> ⭐⭐⭐ | 难度：初级 | 🏷️ 概念题

**题目**：Vue Router 的 scrollBehavior 是怎么用的？如何实现"从列表到详情再返回列表时，滚动条保持原位"？

**考察点**：
- scrollBehavior 签名：`(to, from, savedPosition) => position`
- savedPosition 由 popstate 提供——仅在前进/后退时有值
- el 选择器实现 hash 锚点滚动
- 与 KeepAlive 的配合：KeepAlive 缓存 DOM，scrollBehavior 恢复位置

> 答案参考：[../VueRouter/scroll-behavior.md](../VueRouter/scroll-behavior.md)
