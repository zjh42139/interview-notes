---
title: Vue Router 4 新特性与 Composition API 面试回答
description: 面试中如何回答 Vue Router 4 的破坏性变更和 Composition API 用法——30 秒速答 + 2 分钟详解 + 追问预判
category: VueRouter
type: interview
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-18
updated: 2026-07-18
tags:
  - Vue Router 4
  - createRouter
  - useRouter
  - useRoute
  - pathMatch
  - NavigationFailure
  - 面试回答
---

# Vue Router 4 新特性与 Composition API 面试回答

## Q: Vue Router 4 相比 VR3 有哪些破坏性变更？Composition API 怎么用？

### 30 秒版本

"Vue Router 4 是配套 Vue 3 重写的，核心变化五个。第一，用 `createRouter`/`createWebHistory` 工厂函数替代 `new VueRouter` 构造函数——ESM 具名导出，没 import 的模式代码不会进 bundle，VR3 用 `mode` 字符串运行时分支则无法 tree-shaking。第二，`useRouter` 拿路由器实例、`useRoute` 拿响应式当前路由——但解构 `useRoute()` 会丢失响应性，因为每次导航后 route 属性被整体替换成新对象，解构出的变量还指着旧值。第三，`*` 通配符移除，404 兜底用自定义正则参数 `/:pathMatch(.*)*`——末尾 `*` 让匹配结果按 `/` 分段成数组而非整串。第四，导航守卫的 `next` 变成可选，推荐用 return 值——不会忘调也不会双调。第五，push 到相同路由不再 reject——而是 resolve 出一个 `NavigationFailure` 对象，用 `isNavigationFailure` 判断失败类型。"

### 2 分钟版本

"分五个点讲清楚：创建方式、Composition API 用法和坑、路由匹配变化、守卫写法、导航行为——每个点都是 VR3 到 VR4 的破坏性变更。

**一、创建方式——工厂函数替代构造函数，tree-shaking 友好。**

VR3 只有一个 `VueRouter` class——`new VueRouter({ mode: 'history', routes })`。Hash 和 History 两种模式都挂在 class 内部，靠 `mode` 字符串在运行时分支选择——打包器无法静态分析剔除没用到的模式代码，Hash 模式的代码永远在 bundle 里。

VR4 用三个具名导出的 history 工厂——`createWebHistory(baseURL?)`（History 模式）、`createWebHashHistory(baseURL?)`（Hash 模式）、`createMemoryHistory(baseURL?)`（SSR/测试）。ESM 静态 import 意味着打包器可以精确分析：如果你的代码只 import 了 `createWebHistory`，`createWebHashHistory` 的代码整块不会进 bundle——这就是 tree-shaking 友好的实际含义。`base` 选项也从 VR3 构造函数的选项收进了 history 工厂函数的第一个参数。

安装方式也变了：VR3 是 `Vue.use(VueRouter)` + `new Vue({ router })` 两步。VR4 是 `app.use(router)` 一步——Vue 3 的 plugin 系统统一用 `app.use()`。

**二、Composition API——useRouter/useRoute 的用法和两大坑。**

`useRouter()` 返回路由器实例——`push`/`replace`/`go`/`addRoute`（VR3 的 `addRoutes` 批量添加已被移除，只留单条 `addRoute`）。`useRoute()` 返回**当前路由**的 reactive 对象——每次导航后 route 对象的属性被整体替换，因为它是只读快照。

**大坑 1——解构 `useRoute()` 丢响应性。** `const { query, params } = useRoute()` 拿到的只是当次导航那一刻的值的快照。根因：导航后 route 属性**整体替换**成新对象，你解构出的 `query` 变量是一个普通对象，它就是被替换前的那个 query 快照——新的 route 跟这个变量没有引用关系。症状：第一次进页面 query 正常，router.push 改 query 后 `route.query.page` 变了、但解构出的 `query` 没变、computed 依赖解构变量的不会重新计算。三种保响应性的方式：`computed(() => route.query.page)`——每次都从最新的 route 读，track 正常；`toRefs(route)`——`const { query } = toRefs(route)` 后 `query` 是 Ref，`.value` 指向最新值；`watch(() => route.query, fn)`——getter 函数每次访问最新 route，依赖追踪正确。

**大坑 2——setup 外调用 useRouter/useRoute 返回 undefined。** 两者底层是 `inject('router')` / `inject('route location key')`。Vue 的 inject 只在组件 setup 同步执行期有注入上下文——组件实例没创建时 inject 返回 undefined。在路由守卫文件、axios 拦截器、Pinia store、工具函数里调用 `useRoute()` 会得到 undefined。正确做法：守卫文件直接 `import { router } from '@/router'`，用 `router.currentRoute.value`（VR4 中 `currentRoute` 是 ref）或守卫参数 `to`/`from`；Pinia store 中把路由信息作为参数传入 action 而非 store 内部自己去取。

**三、路由匹配——`*` 通配符移除 + 路径评分排序。**

VR3 的 `{ path: '*', component: NotFound }` 在 VR4 运行时会直接抛错：`Catch all routes ("*") must now be defined using a param with a custom regexp`。404 兜底改为 `{ path: '/:pathMatch(.*)*', name: 'NotFound' }`。语法分解：`:` 参数前缀、`pathMatch` 参数名、`(.*)` 自定义正则（匹配任意字符）、末尾 `*` 表示参数可重复。匹配 `/a/b/c` 时 `params.pathMatch = ['a', 'b', 'c']`——按 `/` 分段成数组，非常方便做路径展示。如果末尾不加 `*`：匹配结果变成整串 `'a/b/c'`（含斜杠），且按 name 反向导航时斜杠会被 `encodeURIComponent` 编码成 `%2F`——URL 不可读。

同时匹配策略从"声明顺序优先"改为**路径评分排序**。打分规则：静态段（`/user`）分高、动态段（`/:id`）分低、catch-all（`/:pathMatch(.*)*`）分数最低。所以 404 路由放哪里都能正确兜底——不一定非得最后一行。但按惯例仍放末尾便于阅读。

**四、守卫写法——next 可选，推荐 return 结果。**

VR3 的 `router.beforeEach((to, from, next) => { next() })` 要求 `next` 必须恰好调用一次——漏调导航永远挂起（页面卡死不动）、双调报错且不易排查。VR4 保留了 `next` 的兼容（同一守卫里别混用 return 和 next），但推荐用返回值表达意图：`return { path: '/login', query: { redirect: to.fullPath } }` 表示重定向；`return false` 取消本次导航；`return undefined` 或 `return true` 表示放行。好处：不会忘调、不会双调、返回值类型能被 TypeScript 精确推导。

组件内守卫也有 composable：`onBeforeRouteUpdate((to, from) => { ... })` 监听路由变化、`onBeforeRouteLeave((to, from) => { ... })` 拦截离开——都在 `setup` 中注册。`beforeRouteEnter` 没有对应 composable（组件实例尚未创建），逻辑放全局守卫或路由独享 `beforeEnter` 配置。

**五、重复导航不再 reject——VR3 最烦人的坑被根治。**

VR3.1 起 `router.push` 返回 Promise，push 到当前相同路径会 reject `NavigationDuplicated` 错误——大量项目被迫全局 patch `router.push` 来吞掉这个错误。VR4 改为：导航层面的失败（重复导航、守卫拦截）**不再 reject**，Promise 总是 resolve——成功时值为 `undefined`，失败时值为 `NavigationFailure` 对象。

```ts
import { isNavigationFailure, NavigationFailureType } from 'vue-router'

const result = await router.push('/dashboard')
if (!result) { /* 导航成功 */ }
else if (isNavigationFailure(result, NavigationFailureType.duplicated)) { /* 重复导航，静默 */ }
else if (isNavigationFailure(result, NavigationFailureType.aborted)) { /* 被守卫 return false 拦截 */ }
```

只有代码真正抛出异常（如路由懒加载 chunk 加载失败）才会 reject。所有之前用 `try/catch` 包 `push` 的代码在 VR4 里都是死代码——捕获不到任何东西。

**六、其他破坏性变更速览。** `<transiton>` 包裹 `<router-view>` → 改为 `<router-view>` 的 `v-slot` 里包 `<transition>`（`<keep-alive>` 同理）。`router.match()` → `router.resolve()`。`router.getMatchedComponents()` → `router.currentRoute.value.matched`。`<router-link>` 的 `tag`/`event` prop 移除 → 用 `custom` + `v-slot` 自定义渲染。`router.app` 移除——`app.use(router)` 支持同一 router 实例安装到多个应用。"

### 追问预判

| 面试官追问 | 你的应答要点 |
|-----------|---------|
| "`/:pathMatch(.*)` 和 `/:pathMatch(.*)*` 到底有什么区别" | 末尾多一个 `*` 表示参数可重复——区别两点。不加 `*`：匹配 `/a/b/c` 时 `params.pathMatch = 'a/b/c'`（整串含斜杠）；按 name 反向导航时斜杠被编码成 `%2F`，URL 变成 `/a%2Fb%2Fc`——不可读。加了 `*`：匹配结果 `params.pathMatch = ['a', 'b', 'c']`——按 `/` 分段成数组，反向导航 URL 正确。所以 404 兜底一律加末尾 `*`。另外还有一个容易被忽略的点：动态权限场景中 `addRoute` 补充路由之前当前导航已经用旧路由表匹配到了 404，即使 `addRoute` 后新路由表里有匹配项了，本次导航已经结束——需要在守卫里 `return to.fullPath` 重放本次导航 |
| "`useRoute()` 拿到的 route 和 Options API 的 `$route` 是一个东西吗" | 是完全相同的 reactive 对象。`useRoute()` 返回的就是 `$route` 的底层引用——二者行为完全一致：导航后自动更新、只读（不能 `route.params.xxx = 'new'` 直接赋值）、需要通过 `router.push/replace` 触发导航。区别只有获取方式——Composition API `useRoute()`，Options API `this.$route`。另外模板里也可以用 `$route.query.page` 直接取值——但 Options API 中 `this.$route` 也要注意不能解构（同理丢响应性）。setup 里推荐始终用 `useRoute()`，不混用 `$route` |
| "在 Pinia store 里怎么获取当前路由信息" | 不要试图在 store 里调 `useRoute()`——Options Store 没有 inject 上下文。稳妥做法：import 路由实例 `import { router } from '@/router'`，`router.currentRoute.value.query.xxx` 拿当前路由。或者在 action 参数里传入：`async function fetchData(page: number) { ... }` 让调用方传 `route.query.page`，store 不关心数据来源。前者耦合路由但方便，后者解耦但多传参——大项目倾向后者，store 保持纯净 |

## 别踩的坑

1. **解构 `useRoute()` 丢响应性——"第一次进页面正常、切 tab 后视图不动"的根因。** `const { query } = useRoute()` 是快照。route 属性在每次导航后被整体替换成新 reactive 对象，解构出的 query 指向旧 route 的 query。三种修复：`computed(() => route.query.page)`（简洁，模板用最自然）、`toRefs(route)` 然后 `.value` 读（适合解构多字段）、`watch(() => route.query, fn)`（适合副作用）。
2. **`path: '*'` 写法残留导致运行时报错。** VR3 迁移最常见的 `[Vue Router warn]`。直接改成 `/:pathMatch(.*)*`。动态权限场景额外注意：`addRoute` 后 404 已匹配，需 `return to.fullPath` 重放导航。
3. **还在 try/catch 里捕重复导航——VR4 里捕不到。** VR3 era 的 `router.push().catch(() => {})` 或 `routerPush.install` 全局 patch，在 VR4 里不会报错但也不会执行到——push 不再 reject。替换为 `const result = await router.push(...); if (isNavigationFailure(result)) { ... }`。

## 相关阅读

- [Vue Router 4 新特性 知识文档](../../VueRouter/vue-router-4.md)
- [history / hash 模式](./history-hash.md)
- [路由守卫](./route-guards.md)
- [动态路由](./dynamic-routing.md)
- [导航故障处理](../../VueRouter/navigation-failures.md)
- [面试题库：Vue Router](../../面试题库/VueRouter.md)

## 更新记录

- 2026-07-18：新建（30秒/2分钟/追问预判/别踩坑 标准格式）
