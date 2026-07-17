---
title: Vue Router 高频面试题
description: Vue Router 面试真题——路由守卫、动态路由、history vs hash、懒加载、KeepAlive 集成、VR4 新特性、路由传参
category: 面试题库
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-11
updated: 2026-07-18
reviewed: null
tags:
  - VueRouter
  - 路由
  - 路由守卫
  - 动态路由
  - history
  - hash
  - 路由传参
  - CompositionAPI
---

# Vue Router 高频面试题

> 收录前端面试中的高频 Vue Router 真题，共 10 题。
> Q1–Q7 按出现频率从高到低排列，Q8–Q10 为 2026-07 真题校验新增。

---

### Q1: history 和 hash 模式 | 对比题 原理与选型

> ⭐⭐⭐⭐⭐ | 难度：中级 | 🏷️ 对比题

**题目**：Vue Router 的 history 模式和 hash 模式有什么区别？如何选择？history 模式部署需要注意什么？

**考察点**：
- hash 模式底层：`hashchange` 事件，`#` 及之后的内容不发送到服务器
- history 模式底层：HTML5 History API（pushState/replaceState/popstate）
- 服务端配置：Nginx `try_files` 将所有路径回退到 `index.html`
- 选型：后台管理用 hash（零配置），C 端/官网用 history（SEO + 美观）

**30秒答**：hash 模式 `#` 后内容不发送服务端——实现简单刷新不 404，基于 hashchange 事件。history 模式基于 pushState + popstate——URL 干净 SEO 友好，但刷新依赖 Nginx try_files 兜底。后台用 hash 省心，C 端用 history 好看。
**追问预测**：
- "history 模式刷新 404 怎么办" → Nginx `try_files $uri $uri/ /index.html`——非静态资源全部回退到 index.html
- "hash 模式能 SEO 吗" → 不能——搜索引擎忽略 `#` 后的内容，也不触发 JS。需要 SEO 用 SSR + history 模式
- "popstate 什么时候触发" → 前进/后退时——pushState 和 replaceState 本身不触发 popstate

> 答案参考：[../VueRouter/history-vs-hash.md](../VueRouter/history-vs-hash.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/VueRouter/history-hash.md)

---

### Q2: 路由守卫 | 概念题 全局/路由/组件三层守卫

> ⭐⭐⭐⭐⭐ | 难度：中级 | 🏷️ 概念题

**题目**：Vue Router 的路由守卫有哪些类型？它们的执行顺序是怎样的？beforeEach 和 beforeResolve 的区别是什么？

**考察点**：
- 全局守卫（beforeEach/beforeResolve/afterEach）、路由独享（beforeEnter）、组件内（beforeRouteEnter/Update/Leave）
- 完整导航解析流程：beforeEach→beforeEnter→beforeRouteEnter→beforeResolve→afterEach
- Vue3 中 next 参数不再是必须——推荐 return false 或 return 路径
- 典型场景：权限校验（beforeEach）、数据预加载（beforeRouteEnter）、离开确认（beforeRouteLeave）

**30秒答**：三层守卫——全局 beforeEach/beforeResolve/afterEach、路由独享 beforeEnter、组件内 beforeRouteEnter/beforeRouteUpdate/beforeRouteLeave。执行顺序：全局 beforeEach→路由 beforeEnter→组件 beforeRouteEnter→全局 beforeResolve→导航确认→afterEach。next 函数在 Vue3 中已不推荐——用 return 替代。
**追问预测**：
- "beforeEach 和 beforeResolve 有什么区别" → beforeEach 在组件解析前；beforeResolve 在组件解析后、导航确认前——"最后一道防线"
- "beforeRouteEnter 为什么不能访问 this" → 组件实例还没创建——回调的 next(vm) 参数可以拿到
- "守卫里怎么中断导航" → return false 或抛出 Error——Vue3 不推荐用 next(false)，用 return false

> 答案参考：[../VueRouter/route-guards.md](../VueRouter/route-guards.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/VueRouter/route-guards.md)

---

### Q3: 动态路由 + 权限路由 | 场景题 addRoute 实现

> ⭐⭐⭐⭐⭐ | 难度：高级 | 🏷️ 场景题

**题目**：后台管理系统的权限路由是怎么实现的？`addRoute` 有哪些坑？如何保证不同角色看到不同的菜单？

**考察点**：
- `router.addRoute()` 运行时注入路由，支持嵌套路由
- `addRoute` 后需 `next({ ...to, replace: true })` 重新匹配
- `router.hasRoute()`/`router.getRoutes()` 运行时检查
- 菜单基于 `getRoutes()` 过滤 + 渲染（不依赖手动维护的菜单配置）
- 退出登录调用 `router.removeRoute()` 清理或 location.reload
- 前端权限只是 UX——真正的安全在后端 API 校验

**30秒答**：登录后后台返回角色路由表→router.addRoute 动态注入。关键细节：addRoute 之后需要 next({...to}) 触发重新匹配——否则当前路径已被 `:pathMatch(.*)*` 兜底路由吃掉（VR4 已移除 `*` 通配符）。removeRoute 用于退出登录清路由。菜单基于 router.getRoutes() 动态渲染。
**追问预测**：
- "addRoute 之后为什么需要 next" → addRoute 不会自动触发当前路由重新解析——落在 `:pathMatch(.*)*` 兜底路由上的路径不会重新匹配
- "怎么防止用户手动输 URL 访问无权限页面" → beforeEach 中检查 `to.meta.roles`——不在权限范围内则 403 或跳首页
- "退出登录怎么清路由" → `router.removeRoute('name')` + 重置为初始静态路由。或者 `window.location.reload()` 简单粗暴

> 答案参考：[../VueRouter/dynamic-routing.md](../VueRouter/dynamic-routing.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/VueRouter/dynamic-routing.md)
> 延伸：[../项目实战/权限系统/permission-rbac.md](../项目实战/权限系统/permission-rbac.md)

---

### Q4: 路由懒加载 | 概念题 原理 + 分包策略

> ⭐⭐⭐⭐ | 难度：初级 | 🏷️ 概念题

**题目**：Vue Router 的路由懒加载是怎么实现的？如何设计分包策略？

**考察点**：
- 动态 `import()` 返回 Promise，构建工具将其拆分为独立 chunk
- webpack 魔法注释 `/* webpackChunkName: "dashboard" */`
- 分组策略：首页同步加载、业务页面按模块分组、第三方库单独拆
- 与 prefetch/prerender 的区别和配合

**30秒答**：`() => import('./Foo.vue')` 动态导入——构建时拆分为独立 chunk，路由访问时才加载。魔法注释 webpackChunkName 指定包名。分组策略——首页路由不懒加载，次要页面全拆分。预加载用 `/* prefetch */`。
**追问预测**：
- "懒加载对首屏有影响吗" → 正向影响——首屏只加载首页 chunk，不加载其他页面的代码，FCP 更快
- "chunk 太大怎么办" → 按路由粒度拆分、用 splitChunks 提取公共依赖、分析包组成后优化
- "Suspense + 异步组件和路由懒加载的关系" → Suspense 处理异步组件加载态——loading 占位 + error fallback。路由懒加载是拆分维度，Suspense 是 UI 维度

> 答案参考：[../VueRouter/lazy-loading.md](../VueRouter/lazy-loading.md)
> 延伸：[../性能优化/bundle-optimization.md](../性能优化/bundle-optimization.md)

---

### Q5: KeepAlive + Router | 场景题 页面缓存

> ⭐⭐⭐⭐ | 难度：中级 | 🏷️ 场景题

**题目**：Vue Router 如何配合 KeepAlive 实现页面缓存？缓存后如何刷新数据？列表到详情再返回列表的体验怎么保证？

**考察点**：
- `router-view` 的 v-slot 获取 Component——`<KeepAlive><component :is /></KeepAlive>`
- include/exclude 基于组件 name，非路由名称
- activated 钩子中判断是否需要刷新
- scrollBehavior + savedPosition 恢复滚动

**30秒答**：router-view 用 v-slot + KeepAlive + include——指定哪些组件缓存。include 匹配组件 name 属性——不是路由 name。缓存后多了 activated/deactivated 钩子。配合 scrollBehavior 恢复滚动位置。A→详情→返回 A 这种典型场景。
**追问预测**：
- "KeepAlive 的 include 匹配什么" → 组件 name 属性——不是路由名称。组件没有 name → 无法被 include/exclude 精确控制
- "缓存页面的数据怎么刷新" → activated 钩子里判断是否需要重新请求——如缓存时间过期或数据版本号变化
- "KeepAlive max 超过上限会怎样" → LRU 淘汰最久未访问的组件——不触发 beforeUnmount，只触发 deactivated

> 答案参考：[../VueRouter/keepalive-integration.md](../VueRouter/keepalive-integration.md)
> 延伸：[../Vue3/keepalive.md](../Vue3/keepalive.md)

---

### Q6: 导航故障 | 排查题 NavigationFailure 处理

> ⭐⭐ | 难度：中级 | 🏷️ 排查题

**题目**：Vue Router 4 中如何检测和处理导航故障？`router.push().catch(() => {})` 这种写法还有必要吗？

**考察点**：
- VR4 中 `router.push()` 返回 Promise——导航故障时 resolve 出 NavigationFailure 对象，而不是 reject
- `isNavigationFailure(failure, NavigationFailureType.xxx)` 精确判断类型：`aborted`/`cancelled`/`duplicated`
- `.catch(() => {})` 吞错是 VR3 时代的兼容手段——VR3 重复导航会 reject，VR4 不再需要
- `router.isReady()` 确保初始导航完成，`router.onError()` 兜底真正的异常（如 chunk 加载失败）

**30秒答**：VR4 里 push 返回 Promise——导航被中止/取消/重复时不 reject，而是 resolve 出一个 NavigationFailure 对象，用 `isNavigationFailure()` 判断类型再决定提示还是静默。以前的 `router.push().catch(() => {})` 吞错写法是 VR3 兼容手段——VR3 重复导航会 reject，VR4 不会了，这么写反而会把 chunk 加载失败这类真错误也吞掉。全局兜底用 router.onError()，初始导航用 router.isReady() 等待。
**追问预测**：
- "为什么 push 同一个路由会报错" → 那是 VR3 的行为——VR3 重复导航会 reject Promise，所以社区流行 catch 吞错。VR4 不再 reject，而是 resolve 一个 duplicated 类型的 NavigationFailure，按需静默即可
- "怎么区分导航故障和真正的错误" → 导航故障从 push 的返回值里拿（isNavigationFailure 判断）；守卫抛异常、异步 chunk 加载失败才会 reject，走 router.onError 上报
- "router.replace 和 router.push 的区别" → push 新增历史记录（可返回），replace 替换当前记录（不可返回）

> 答案参考：[../VueRouter/navigation-failures.md](../VueRouter/navigation-failures.md)

---

### Q7: scrollBehavior | 概念题 滚动行为控制

> ⭐⭐⭐ | 难度：初级 | 🏷️ 概念题

**题目**：Vue Router 的 scrollBehavior 是怎么用的？如何实现"从列表到详情再返回列表时，滚动条保持原位"？

**考察点**：
- scrollBehavior 签名：`(to, from, savedPosition) => position`
- savedPosition 由 popstate 提供——仅在前进/后退时有值
- el 选择器实现 hash 锚点滚动
- 与 KeepAlive 的配合：KeepAlive 缓存 DOM，scrollBehavior 恢复位置

**30秒答**：scrollBehavior 控制路由切换后的滚动位置——返回 savedPosition 保持列表位置、对象指定 x/y 锚点、el 选择器滚动到指定元素。smoothBehavior 需浏览器兼容。和 KeepAlive 组合使用才能实现"列表→详情→返回列表→停留原位"。
**追问预测**：
- "savedPosition 什么时候是 null" → 第一次进入页面（无历史位置）或 forward 导航——此时可以用 `top: 0`
- "scrollBehavior 和 KeepAlive 的关系" → KeepAlive 缓存 DOM 但不恢复滚动——scrollBehavior 单独处理滚动位置
- "hash 锚点滚动怎么处理" → 返回 `{ el: hash }`——如 `{ el: '#section-3' }`

> 答案参考：[../VueRouter/scroll-behavior.md](../VueRouter/scroll-behavior.md)

---

### Q8: Vue Router 4 新特性 | 概念题 Composition API 与破坏性变更

> ⭐⭐⭐⭐⭐ | 难度：中级 | 🏷️ 概念题

**题目**：Vue Router 4 相比 Vue Router 3 有哪些破坏性变更？setup 中怎么拿到路由？解构 `useRoute()` 的返回值会有什么问题？

**考察点**：
- 工厂函数替代构造函数：`createRouter` + `createWebHistory`/`createWebHashHistory` 替代 `new VueRouter({ mode })`
- Composition API：setup 中用 `useRouter()`（操作实例）/`useRoute()`（响应式路由信息）替代 `this.$router`/`this.$route`
- 响应性陷阱：`const { params } = useRoute()` 解构后丢失响应性——用 `computed(() => route.params.id)` 或 `toRefs(route)` 保住
- `*` 通配符移除：404 兜底改为 `:pathMatch(.*)*` 自定义参数正则，惯例放路由表最后
- 动态路由 API 变化：批量 `addRoutes` 移除，只保留单条 `addRoute`，配合 `removeRoute`/`hasRoute`/`getRoutes`

**30秒答**：VR4 的核心变化四点：一是创建方式——createRouter 工厂函数替代 new VueRouter，mode 选项变成 history: createWebHistory() 这种显式工厂。二是 Composition API——setup 里 useRouter 拿操作实例、useRoute 拿响应式路由信息；坑在 useRoute 返回的是 reactive 对象，直接解构 params 会丢响应性，我一般用 computed 包一层。三是 `*` 通配符移除——404 兜底改写成 `:pathMatch(.*)*`，惯例放路由表最后。四是动态路由只留单条 addRoute，批量 addRoutes 移除了。
**追问预测**：
- "为什么解构 route 会丢响应性" → route 是 reactive 代理——解构相当于把当前值赋给普通变量，脱离了 Proxy 的依赖追踪。computed 或 toRefs 保留响应式引用
- "`:pathMatch(.*)*` 末尾的 `*` 是什么意思" → 可重复修饰符——匹配结果按 `/` 切成数组放进 params.pathMatch；不加 `*` 拿到的是整段字符串
- "为什么移除 addRoutes" → VR4 匹配器重写为基于评分排序——addRoute 单条注入返回删除函数、支持指定父路由嵌套，批量场景循环调用即可

> 答案参考：[../VueRouter/vue-router-4.md](../VueRouter/vue-router-4.md)
> 延伸：[../VueRouter/dynamic-routing.md](../VueRouter/dynamic-routing.md)（addRoute）、[../VueRouter/history-vs-hash.md](../VueRouter/history-vs-hash.md)

---

### Q9: params vs query 传参 | 对比题 传参方式与场景决策

> ⭐⭐⭐⭐⭐ | 难度：初级 | 🏷️ 对比题

**题目**：路由传参 params 和 query 有什么区别？各适合什么场景？敏感数据想传到下一个页面但不出现在 URL 里怎么办？

**考察点**：
- URL 形态：params 是路径的一部分（`/user/1`，需在路由表声明 `:id`）；query 是查询串（`/user?id=1`，无需路由配置）
- VR4 坑：params 必须配合命名路由——`push({ path, params })` 中 params 被直接忽略；未在 path 声明的"隐形 params"刷新必丢，4.1.4 起直接丢弃并告警
- 场景决策：单个资源标识用 params（RESTful）、筛选/分页/批量 id 用 query（支持数组多值）、敏感数据不进 URL——history state 或 Pinia
- 新标签页打开：`router.resolve(to).href` + `window.open()`——push 只作用于当前窗口
- `$route` vs `$router`：一个是只读路由信息对象（params/query/meta），一个是路由器操作实例（push/replace/go）

**30秒答**：params 是路径的一部分——/user/1，要在路由表声明 :id，RESTful 风格；query 是问号后的查询串——/user?id=1，不用改路由配置，天然支持多值，适合筛选分页和批量 id。VR4 有个坑：params 必须搭配命名路由，push({ path, params }) 里的 params 会被忽略；没在 path 里声明的隐形 params 刷新就丢，4.1.4 之后干脆废弃了。敏感数据不进 URL——用 push 的 state 选项或者 Pinia。顺带区分下 $route 和 $router：一个是当前路由信息对象，一个是执行导航的操作实例。
**追问预测**：
- "$router.push 和 location.href 的区别" → push 走路由匹配——SPA 内部导航、不刷新页面、经过守卫和 scrollBehavior；location.href 触发整页刷新——应用重新初始化、内存状态全丢，只适合跳外部链接
- "params 传了但刷新后丢了，怎么回事" → 传的是未在 path 声明的隐形 params——只存在内存里，URL 上没有，刷新后路由重新解析自然拿不到。要持久就声明成 :id 或改用 query
- "怎么在新标签页打开路由页面" → `router.resolve(to)` 拿到 href 再 `window.open(href)`——push/replace 只能在当前窗口导航

> 答案参考：[../VueRouter/route-meta-props.md](../VueRouter/route-meta-props.md)

---

### Q10: 监听路由参数变化 | 场景题 组件复用与参数响应

> ⭐⭐⭐⭐ | 难度：中级 | 🏷️ 场景题

**题目**：从 /user/1 跳到 /user/2，页面数据没有刷新，为什么？有哪几种解决方案，各自的取舍是什么？

**考察点**：
- 原因：两条路由匹配同一组件——Vue 复用组件实例，setup/onMounted 不会重新执行
- 方案一 watch：`watch(() => route.params.id, fetchData)`——最灵活，source 精确到字段、可控 immediate
- 方案二 `:key="$route.fullPath"`：强制销毁重建组件——写法最省事，但组件全量重建、内部状态全丢
- 方案三 onBeforeRouteUpdate：守卫时机——导航确认前拿到 to/from，可取消导航或提前请求
- 与 KeepAlive 组合时 key 策略影响缓存粒度

**30秒答**：因为两条路由渲染的是同一个组件——Vue 直接复用实例，onMounted 不会再跑，数据停在旧参数上。三种解法：一是 watch route.params.id 重新请求——最常用，粒度可控；二是给 `<router-view :key="$route.fullPath">` 加 key——一行解决但组件整个销毁重建，状态全丢、开销大；三是 onBeforeRouteUpdate 守卫——导航确认前就拿到 to/from，适合要拦截或提前校验的场景。日常我默认 watch，只有组件足够轻、状态简单时才用 key。
**追问预测**：
- "watch route.params 会不会被 query 变化误触发" → source 精确到具体字段（`() => route.params.id`）就不会——直接 watch 整个 route 或 params 对象才会被无关变化带动；多字段用数组 source
- "onBeforeRouteUpdate 和 watch 的时机差异" → 守卫在导航确认前触发——可以 return false 取消导航；watch 在导航确认、响应式更新后触发。要拦截用守卫，只刷数据用 watch
- ":key 方案和 KeepAlive 一起用会怎样" → fullPath 作 key 让每个参数组合都成为独立缓存实例——缓存数量膨胀，需要配 max 上限或精细的 include 控制

> 答案参考：[../VueRouter/route-guards.md](../VueRouter/route-guards.md)（beforeRouteUpdate）
> 延伸：[../VueRouter/keepalive-integration.md](../VueRouter/keepalive-integration.md)（fullPath key 与缓存粒度）
