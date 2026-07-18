---
title: CSR / SSR / SSG / ISR 区别与选型 面试回答
description: 面试中如何回答 CSR/SSR/SSG/ISR 的区别——30 秒速答 + 2 分钟详解 + 追问预判
category: HTML
type: interview
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-18
updated: 2026-07-18
tags:
  - CSR
  - SSR
  - SSG
  - ISR
  - Hydration
  - SEO
  - 面试回答
---

# CSR / SSR / SSG / ISR 区别与选型 面试回答

## Q: 讲讲 CSR / SSR / SSG / ISR 的区别与选型

### 30 秒版本

"四个渲染策略的核心区别在'HTML 在哪生成、什么时候生成'。CSR 是'服务器返回空壳 HTML `<div id='app'></div>`，浏览器下载 JS 后再渲染内容'——爬虫看到白板，适合需要登录的后台系统。SSR 是'服务端接到请求时执行 Vue/React 组件生成完整 HTML 返回给浏览器'——SEO 好、首屏快，适合电商和新闻。SSG 是'构建时把所有路由预渲染成静态 HTML，直接部署到 CDN'——性能和 SEO 最优、服务器成本几乎为零，适合文档站和博客。ISR 是 SSG 的升级——'大部分页面静态生成，但可以按需或定时重新生成单个页面'，在静态性能和内容时效之间折中。Hydration 是 SSR 到可交互的关键一步——服务端 HTML 到了浏览器后，Vue/React 不重建 DOM，而是在现有 DOM 上绑定事件和建立响应式关联。"

### 2 分钟版本

"从四个渲染策略的本质、关键概念 Hydration、以及选型决策逻辑三个层面讲清楚。

**一、CSR——客户端渲染，HTML 是空壳。**

流程：浏览器请求 → 服务器返回 `<div id='app'></div>` 空壳 → 浏览器下载 JS bundle → 执行 `createApp().mount('#app')` → 渲染页面内容。优点：前后端分离彻底——前端独立部署、服务器只分发静态文件、压力极小；开发体验好——Vite HMR 热更新、组件化开发。缺点：SEO 差——爬虫看到的是空 `<div>`，百度直接收录空白页、Googlebot 的 JS 渲染队列可能延迟几天；首屏慢——白屏时间 = JS 下载 + JS 解析/执行 + 首次渲染，低端设备和弱网下体验很差。典型场景：**后台管理系统**——需要登录才能访问，SEO 毫无意义，首屏在桌面端内网环境下可以接受，开发效率第一。

**二、SSR——服务端渲染，HTML 是完整的。**

流程：浏览器请求 → Node.js 环境运行 Vue/React 组件 → 生成完整 HTML 字符串 → 返回给浏览器 → 浏览器立即显示内容（HTML 里有数据、爬虫能看到）→ 同时下载 JS bundle → Hydration 激活交互。优点：SEO 完美——爬虫收到的是带数据的完整 HTML；首屏快——FCP/LCP 极佳，因为 HTML 到达就有内容；支持流式渲染——Vue3 的 `renderToStream` 和 React 18 的 `renderToPipeableStream` 把 HTML 分块发送，不等整页渲染完就开始传，TTFB 更低。缺点：服务器压力大——每个请求都要跑组件渲染，并发上去了 CPU/内存吃紧；部署复杂——需要 Node.js 服务器、负载均衡、进程管理；开发约束——组件不能用 `window`/`document`/`localStorage`，需要用 `if (import.meta.client)` 等守卫。典型场景：**电商商品详情页、新闻内容页**——需要 SEO 且内容实时变化、用户分享链接要看到同样内容。

**三、SSG——静态站点生成，HTML 构建时就确定了。**

流程：构建时读取数据源（Markdown 文件、Headless CMS API）→ 预渲染所有路由为 HTML → 输出 dist 目录 → 部署到 CDN。用户发请求 → CDN 直接返回 HTML（没有服务端运行时）。优点：性能极致——CDN 边缘节点全球分发、HTML 最快到达用户；服务器成本几乎为零——不需要 Node.js 服务器，一个 Nginx/对象存储就够了；安全性最高——没有服务端运行时，攻击面极小；SEO 完美。缺点：只适合内容不变的页面——所有用户看到同一份 HTML，无法根据登录态展示不同内容；构建时间随页面数量增长——十万篇博客页面构建可能几十分钟；内容更新有延迟——从内容变更到用户可见 = 构建时间 + 部署时间 + CDN 缓存刷新时间。典型场景：**技术博客、产品文档、个人主页、官网**——内容更新频率低，SEO 和性能是核心 KPI。

**四、ISR——增量静态再生，SSG + 按需更新。**

核心思想：大部分页面预渲染为静态 HTML，但标记某些页面为"可重新生成"。当用户访问某个设置了 ISR 的页面时，如果当前静态版本已过期（比如超过 10 分钟），服务器在后台触发重新生成，同时先返回旧的静态版本——这个用户暂时看到旧内容，下一个用户就能看到新版本。Nuxt 里通过 `routeRules` 实现：`'/news/**': { swr: 3600 }` 表示该路由渲染结果缓存 1 小时，过期后的第一个请求触发后台重生成。适合：**内容站中需要定时更新的页面**——新闻站首页每小时更新头条、电商站活动页每天换 Banner。不是完全实时，但比纯 SSG 的时效性好很多。

**五、Hydration——SSR 最关键的概念。**

服务端渲染的 HTML 到浏览器后，用户能看到内容，但页面是"死"的——没有事件绑定、没有响应式关联。Hydration 就是给这块"干海绵"注水：Vue/React 遍历已有 DOM 树 → 建立虚拟 DOM → 对比确认虚拟 DOM 和真实 DOM 一致 → 绑定事件监听器 → 建立 computed/watcher 等响应式关联 → 页面可交互。

两个关键坑：第一，Hydration Mismatch——SSR 输出的 HTML 和客户端首次渲染的 VNode 结构不一致，框架会报警告甚至丢弃 SSR 结果重新渲染，导致"首屏闪烁"。常见原因：组件中用了 `Date.now()`/`Math.random()` 导致服务端和客户端值不同、条件渲染分支不同；或访问浏览器 API 返回 undefined 导致 DOM 差异。第二，TTI 可能比 CSR 更晚——SSR HTML 虽然先到了，但 JS bundle 还是要完整下载 + Hydration 跑完才能交互，如果 bundle 很大，用户"看见但点不了"的时间很长，这现象叫"uncanny valley"。

**六、选型决策——按业务线对号入座。**

toB 后台管理系统：CSR（Vue3 SPA + Vite）。SEO 无意义（需登录）、开发效率第一、桌面端内网下首屏 OK。

toC 内容站（博客/文档/官网）：SSG（VitePress / Nuxt Content）。内容更新频率低、SEO 流量是核心、CDN 成本接近于零。

toC 电商/社交/新闻：SSR（Nuxt / Next.js）。需要 SEO 且内容实时变化、有个性化推荐和登录态、分享链接有社交传播需求。

混合场景——内容站中部分动态页面：ISR。搭配 CI/CD webhook 触发重新构建 + ISR 增量更新，在静态优势和时效性间取得平衡。"

### 追问预判

| 面试官追问 | 你的应答要点 |
|-----------|---------|
| "Hydration Mismatch 具体怎么排查和修" | 常见三个原因：`Date.now()`/`Math.random()` 服务端和客户端值不同导致条件渲染分支不同；浏览器 API（window/document/localStorage）在服务端返回 undefined 导致客户端有但服务端无的 DOM 节点；Vue 的 `<ClientOnly>`/React 的 `useEffect` 中的条件渲染。排查：对比 SSR 输出的 HTML（view-source 看）和客户端首次渲染的 VNode，定位不一致的节点。修复：不确定性值放 `onMounted`/`useEffect` 里执行；用 `import.meta.client` 或 `typeof window !== 'undefined'` 做守卫；第三方库用 `<ClientOnly>` 包裹 |
| "Nuxt 和 Next.js 的 SSR 实现有什么本质区别" | 渲染层：Nuxt 用 Vue `renderToString`/`renderToStream`（Vue 3 支持流式），Next 用 React `renderToString`/`renderToPipeableStream`（React 18 支持 Suspense 流式）。服务器引擎：Nuxt 3 基于 Nitro（兼容 Node/Bun/Edge/Serverless），Next 仅 Node.js runtime。底层原理一致——同构渲染（一套代码两端运行）、支持 Streaming SSR、都有 hydration 阶段。选择取决于技术栈：用 Vue 就 Nuxt，用 React 就 Next，框架层面的 SSR 能力基本对等 |
| "SSG 站点更新内容后用户怎么看到新的" | 触发重新构建：内容变更 → webhook → CI/CD → `vitepress build` / `nuxt generate` → 推 dist 到 CDN/存储。端到端延迟 = 构建时间(30s-1min) + 部署 + CDN 缓存刷新。几百页的文档站整流程约 2-3 分钟。时效要求更高：用 ISR 让单页面按需重生成，或用 SSR 彻底解决时效问题。如果 CDN 做了多层缓存，部署后还要考虑 CDN purge 策略——否则旧 HTML 在 CDN 节点上可能存活很久 |

## 别踩的坑

1. **把 SSG 当 SSR 用——所有用户看到同一份 HTML。** SSG 在构建时渲染，构建时没有"当前登录用户"，所以无法展示用户头像、购物车数量、个性化推荐这些依赖用户身份的内容。错误表述："我们的用户中心用 VitePress SSG，用户登录后显示自己的数据"——SSG 的 HTML 在构建时生成，构建时连用户是谁都不知道，怎么可能在 HTML 里渲染用户数据？要么客户端 JS 发 API 获取后补上（但这就不是 SSG 的诉求了），要么换 SSR。
2. **"SSR 比 CSR 快"说绝对了——混淆 TTFB 和 TTI。** SSR 首屏快——HTML 一到就有内容，FCP/LCP 确实秒杀 CSR。但 TTI（可交互时间）可能持平甚至更晚——因为 JS bundle 还是那么大，Hydration 要把组件树重新遍历一遍建立响应式关联。如果 JS bundle 500KB、Hydration 耗时 2 秒，SSR 的可交互时间不会比 CSR 快。正确的说法："SSR 感知性能更好——用户能更快看到内容，对 SEO 有决定性优势；但可交互时间的优化要靠代码分割和懒加载，和是否 SSR 没有直接关系"。
3. **"CSR SEO 没问题因为 Google 能渲染 JS"——把命交给爬虫。** Googlebot 确实能执行 JS，但：渲染队列可能延迟几天——内容更新了但搜索引擎索引还是旧版本；动态内容（基于用户交互/路由切换）不一定被抓到；百度、Bing、DuckDuckGo 等搜索引擎的 JS 渲染能力远不如 Google。工程上可靠的 SEO 方案始终是 SSR/SSG——把完整 HTML 直接喂给所有爬虫，不用赌爬虫能不能执行你的 JS。

## 相关阅读

- [SEO / SSR / CSR / Hydration 知识文档](../../HTML/seo-ssr.md)
- [HTML5 语义化](./semantic-doctype.md)
- [Vue3 Renderer](../../Vue3/renderer.md)
- [首屏优化](../性能优化/first-screen.md)
- [面试题库：HTML](../../面试题库/HTML.md)

## 更新记录

- 2026-07-18：新建（30秒/2分钟/追问预判/别踩坑 标准格式）
