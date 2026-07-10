---
title: 前端面试知识库
description: 体系化的前端面试准备资料——知识文章学原理、面试题库刷真题、面试回答教你怎么说
---

# 前端面试知识库

一个给前端准备的面试知识库，覆盖 JS/TS/Vue3/浏览器/工程化等核心模块。**知识文章学原理，面试题库刷真题，面试回答教你怎么说。** 自己用为主，公开分享为辅。

---

## 怎么用

1. **先看学习路线**：打开 [复习路线](./roadmap.md)，确定当前阶段
2. **从策展路径开始**：不要试图读完所有文章——下面的路径帮你按场景选
3. **跳读**：每篇文章先读「一句话总结 + 面试信号表」，判断需不需要通读
4. **练说**：关掉文章，打开 [面试回答](./面试回答/)，练能不能 30 秒口头说清

---

## 策展路线

### 🔰 入门：刚开始准备面试

> 你还在学基础，需要的是"看完一篇就能答一道题"

HTML5 语义化 → 盒模型 → BFC → 块级/行内 → Flexbox → this → 闭包 → 原型链 → Promise → Event Loop

### 🎯 冲刺：两周后面试

> 你没时间全部重学，需要最高频、最致命、追问链最密的内容

| 模块       | 看这 3 篇                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| JavaScript | [Promise](JavaScript/promise.md) · [Event Loop](JavaScript/event-loop.md) · [原型链](JavaScript/prototype-chain.md) |
| Vue3       | [响应式原理](Vue3/reactivity.md) · [Diff/Patch](Vue3/diff-patch.md) · [组件通信](Vue3/component-communication.md)   |
| 浏览器     | [URL 到页面](浏览器/url-to-page.md) · [XSS/CSRF](浏览器/xss-csrf.md) · [缓存](浏览器/cache.md)                      |
| 手写       | [Promise](手写题/promise.md) · [深拷贝](手写题/deep-clone.md) · [bind/call/apply](手写题/bind-call-apply.md)        |
| 网络       | [HTTP/HTTPS](网络/http-https.md) · [TCP](网络/tcp.md) · [CORS](网络/cors.md)                                        |

### ⚔️ 进阶：

> 你需要区分度——80% 的候选人答不对的这些

V8 引擎 → [内存泄漏排查](浏览器/memory-leak.md) → [Vue3 Scheduler](Vue3/scheduler.md) → [同源策略](浏览器/same-origin-policy.md) → [CSP](浏览器/browser-security.md) → [webpack](工程化/webpack.md) → [设计模式](前端架构/design-patterns.md) → [微前端](微前端/overview.md)

---

## 模块导航

| 模块                      | 说明                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| [JavaScript](JavaScript/) | this / 闭包 / 原型链 / Promise / Event Loop / async-await          |
| [Vue3](Vue3/)             | 响应式 / Diff / KeepAlive / 生命周期 / Composition API / Scheduler |
| [浏览器](浏览器/)         | 渲染流程 / 缓存 / 安全 / V8 / 内存泄漏 / GC                        |
| [手写题](手写题/)         | Promise / bind / 深拷贝 / EventEmitter / compose-pipe              |
| [面试题库](面试题库/)     | HTML / CSS / JS / TS / Vue3 / 浏览器 / 网络 / 工程化               |
| [面试回答](面试回答/)     | 逐字回答稿：30 秒版 + 2 分钟版 + 追问预判                          |
| [HTML](HTML/)             | 语义化 / 表单 / Canvas vs SVG / History API / Web Worker           |
| [CSS](CSS/)               | BFC / Flexbox / Grid / 层叠上下文 / 响应式 / 性能                  |
| [网络](网络/)             | HTTP/HTTPS / HTTP2/3 / TCP / DNS/CDN / WebSocket / CORS            |
| [TypeScript](TypeScript/) | 泛型 / extends/infer / utility types / 声明文件                    |
| [Git](Git/)               | Commit 规范 / merge vs rebase / stash / reset vs revert            |
| [Vue Router](VueRouter/)  | history/hash / 动态路由 / 路由守卫 / KeepAlive 集成                |
| [Pinia](Pinia/)           | defineStore / state/getters/actions / 持久化 / vs Vuex             |
| [工程化](工程化/)         | Vite / Webpack / Tree Shaking / pnpm / ESM                         |
| [性能优化](性能优化/)     | Web Vitals / 首屏 / 虚拟列表 / 打包优化                            |
| [安全](安全/)             | XSS / CSRF / CSP / Token 存储                                      |
| [算法](算法/)             | 排序 / 树 / DP / DFS/BFS / 滑动窗口 / 双指针                       |
| [前端架构](前端架构/)     | 项目分层 / 组件设计 / 设计模式 / Monorepo                          |
| [微前端](微前端/)         | qiankun / Module Federation / iframe 方案                          |
| [项目实战](项目实战/)     | 登录鉴权 / 权限 RBAC / 大文件上传 / ECharts / 国际化               |
| [Node](Node/)             | CommonJS/ESM / Event Loop / Express/Koa                            |
| [CICD](CICD/)             | GitHub Actions / Jenkins / Docker                                  |
| [日志监控](日志监控/)     | Sentry / 埋点 / 性能监控 / 线上定位                                |
| [HR](HR/)                 | 自我介绍 / 离职原因 / 职业规划                                     |
| [模拟面试](模拟面试/)     | 完整面试流程脚本                                                   |

---

## 文档规范

所有文档遵循 [Writing Rules](./writing-rules.md)，包含五维评分体系和按文章类型分级的写作模板。

## 更新记录

详见 [Changelog](./changelog.md)
