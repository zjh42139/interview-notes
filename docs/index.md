---
title: 前端面试知识库
description: 体系化的前端面试准备资料——知识文章学原理、面试题库刷真题、面试回答教你怎么说
---

# 前端面试知识库

一个给前端准备的面试知识库，覆盖 JS/Vue3/浏览器/工程化等核心模块。**知识文章学原理，面试题库刷真题，面试回答教你怎么说。** 自己用为主，公开分享为辅。

---

## 怎么用

1. **先看优先级**：打开 [阅读指南](./阅读指南.md)，按四档分档分配时间——时间有限时只精读第一档
2. **按阶段推进**：打开 [复习路线](./roadmap.md)，确定当前阶段
3. **按组进入**：下方 5 个分组按需进入——学原理看基础、练表达看冲刺
4. **跳读**：每篇文章先读「一句话总结 + 面试信号表」，判断需不需要通读
5. **练说**：关掉文章，打开 [面试回答](./面试回答/)，练能不能 30 秒口头说清

---

## 策展路径

> 不要试图读完所有文章。先看 [阅读指南](./阅读指南.md) 确定优先级，再按 [复习路线](./roadmap.md) 推进阶段。

| 路径 | 适合 | 看什么 |
|------|------|--------|
| 🔰 入门 | 刚开始准备 | HTML5语义化 → 盒模型 → BFC → Flexbox → this → 闭包 → 原型链 → Promise → Event Loop |
| 🎯 冲刺 | 两周后面试 | 每个核心模块挑 3 篇最高频的（JS/Vue3/浏览器/手写/网络），配合 [面试回答](./面试回答/) 逐篇练脱稿 |
| ⚔️ 进阶 | 需要区分度 | V8 引擎 → 内存泄漏 → Scheduler → 同源策略 → CSP → webpack → 设计模式 → 微前端 |

---

## 一、核心基础（学原理）

面试中 70% 的问题从这里出，是地基。

| 模块 | 文章 | 说明 |
|------|------|------|
| [JavaScript](JavaScript/) | 21 | this / 闭包 / 原型链 / Promise / Event Loop / async-await / 类型转换 / 模块化 |
| [Vue3](Vue3/) | 22 | 响应式 / Diff / KeepAlive / 生命周期 / Composition API / Scheduler / 组件体系 |
| [HTML](HTML/) | 17 | 语义化 / 表单 / Canvas vs SVG / History API / Web Worker / SEO / Web Components |
| [CSS](CSS/) | 23 | BFC / Flexbox / Grid / 层叠上下文 / 响应式 / @layer / :has() / 容器查询 |
| [浏览器](浏览器/) | 30 | 渲染流程 / 缓存 / XSS/CSRF/CSP / V8 / 内存泄漏 / GC / Service Worker / 跨标签页 |
| [网络](网络/) | 12 | HTTP/HTTPS / HTTP2/3 / TCP / DNS/CDN / WebSocket / CORS / Fetch API / 代理 |

## 二、框架生态（深入框架）

围绕 Vue3 技术栈的周边知识。

| 模块 | 文章 | 说明 |
|------|------|------|
| [TypeScript](TypeScript/) | 16 | 基础类型 / 泛型 / extends infer / Utility Types / 声明文件 / tsconfig / Vue3+TS |
| [Vue Router](VueRouter/) | 9 | history/hash / 动态路由 / 路由守卫 / KeepAlive 集成 / 导航故障 |
| [Pinia](Pinia/) | 8 | defineStore / state/getters/actions / 持久化 / vs Vuex / 插件 |

## 三、工程实践（懂工程）

决定你从"能干活"到"能负责项目"的关键差距。

| 模块 | 文章 | 说明 |
|------|------|------|
| [工程化](工程化/) | 21 | Vite / Webpack / Tree Shaking / pnpm / ESM / Node / ESLint / Code Splitting / 日志监控 |
| [性能优化](性能优化/) | 9 | Web Vitals / 首屏 / 虚拟列表 / 打包优化 / 缓存策略 / 网络优化 |
| [架构设计](前端架构/) | 13 | 项目分层 / 组件设计 / 设计模式 / 插件化 / 配置化 / qiankun / Module Federation |
| [Git](Git/) | 11 | Commit 规范 / merge vs rebase / stash / reset vs revert / reflog / hooks |
| [CICD](CICD/) | 4 | GitHub Actions / Jenkins / Docker |

## 四、算法手写（练 coding）

面试必考，没有捷径——多写、多练、多总结。

| 模块 | 文章 | 说明 |
|------|------|------|
| [算法](算法/) | 13 | 排序 / 树 / DP / DFS/BFS / 滑动窗口 / 双指针 |
| [手写题](手写题/) | 10 | Promise / bind / 深拷贝 / EventEmitter / LRU / 并发控制 |

## 五、面试冲刺（练表达）

知识学完了？下一步是把知识变成嘴能说出来的话。

| 模块 | 文章 | 说明 |
|------|------|------|
| [面试题库](面试题库/) | 16 | HTML / CSS / JS / TS / Vue3 / 浏览器 / 网络 / 工程化 / 手写题 / 算法 / 安全 |
| [面试回答](面试回答/) | 60 | 逐字回答稿：30 秒版 + 2 分钟版 + 追问预判 / 覆盖 11 个模块 |
| [模拟面试](模拟面试/) | 6 | 完整面试流程脚本——3 轮一面 + 二面 + 三面 |
| [项目实战](项目实战/) | 25 | 登录鉴权 / 权限 RBAC / 大文件上传 / ECharts / 国际化 / 错误监控 |
| [HR](HR/) | 6 | 自我介绍 / 离职原因 / 职业规划 / 优缺点 |

---

## 文档规范

所有文档遵循 [Writing Rules](./writing-rules.md)，包含五维评分体系和按文章类型分级的写作模板。

## 更新记录

详见 [Changelog](./changelog.md)
