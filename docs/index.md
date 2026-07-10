---
title: 前端面试知识库
description: 体系化的前端面试准备资料——知识文章学原理、面试题库刷真题、面试回答教你怎么说
---

# 前端面试知识库

一个给前端准备的面试知识库，覆盖 JS/Vue3/浏览器/工程化等核心模块。**知识文章学原理，面试题库刷真题，面试回答教你怎么说。** 自己用为主，公开分享为辅。

---

## 怎么用

1. **先看学习路线**：打开 [复习路线](./roadmap.md)，确定当前阶段
2. **按组进入**：下方 5 个分组按需进入——学原理看基础、练表达看冲刺
3. **跳读**：每篇文章先读「一句话总结 + 面试信号表」，判断需不需要通读
4. **练说**：关掉文章，打开 [面试回答](./面试回答/)，练能不能 30 秒口头说清

---

## 策展路径

> 不要试图读完所有文章。三条路径按场景选 → 详细路线见 [复习路线](./roadmap.md)

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
| [JavaScript](JavaScript/) | 18 | this / 闭包 / 原型链 / Promise / Event Loop / async-await |
| [Vue3](Vue3/) | 12 | 响应式 / Diff / KeepAlive / 生命周期 / Composition API / Scheduler |
| [HTML](HTML/) | 16 | 语义化 / 表单 / Canvas vs SVG / History API / Web Worker |
| [CSS](CSS/) | 20 | BFC / Flexbox / Grid / 层叠上下文 / 响应式 / CSS 性能 |
| [浏览器](浏览器/) | 26 | 渲染流程 / 缓存 / 安全 / V8 / 内存泄漏 / GC |
| [网络](网络/) | 8 | HTTP/HTTPS / HTTP2/3 / TCP / DNS/CDN / WebSocket / CORS / Fetch API |

## 二、框架生态（深入框架）

围绕 Vue3 技术栈的周边知识。

| 模块 | 文章 | 说明 |
|------|------|------|
| [TypeScript](TypeScript/) | 8 | 泛型 / extends infer / Utility Types / 声明文件 |
| [Vue Router](VueRouter/) | 7 | history/hash / 动态路由 / 路由守卫 / KeepAlive 集成 |
| [Pinia](Pinia/) | 7 | defineStore / state/getters/actions / 持久化 / vs Vuex |

## 三、工程实践（懂工程）

决定你从"能干活"到"能负责项目"的关键差距。

| 模块 | 文章 | 说明 |
|------|------|------|
| [工程化](工程化/) | 17 | Vite / Webpack / Tree Shaking / pnpm / ESM / Node / 日志监控 |
| [性能优化](性能优化/) | 8 | Web Vitals / 首屏 / 虚拟列表 / 打包优化 / 缓存策略 |
| [架构设计](前端架构/) | 9 | 项目分层 / 组件设计 / 设计模式 / qiankun / Module Federation |
| [Git](Git/) | 9 | Commit 规范 / merge vs rebase / stash / reset vs revert |
| [CICD](CICD/) | 4 | GitHub Actions / Jenkins / Docker |

## 四、算法手写（练 coding）

面试必考，没有捷径——多写、多练、多总结。

| 模块 | 文章 | 说明 |
|------|------|------|
| [算法](算法/) | 12 | 排序 / 树 / DP / DFS/BFS / 滑动窗口 / 双指针 |
| [手写题](手写题/) | 10 | Promise / bind / 深拷贝 / EventEmitter / LRU / 并发控制 |

## 五、面试冲刺（练表达）

知识学完了？下一步是把知识变成嘴能说出来的话。

| 模块 | 文章 | 说明 |
|------|------|------|
| [面试题库](面试题库/) | 11 | HTML / CSS / JS / TS / Vue3 / 浏览器 / 网络 / 工程化 |
| [面试回答](面试回答/) | 22 | 逐字回答稿：30 秒版 + 2 分钟版 + 追问预判 |
| [模拟面试](模拟面试/) | 6 | 完整面试流程脚本——3 轮一面 + 二面 + 三面 |
| [项目实战](项目实战/) | 17 | 登录鉴权 / 权限 RBAC / 大文件上传 / ECharts / 国际化 |
| [HR](HR/) | 5 | 自我介绍 / 离职原因 / 职业规划 |

---

## 文档规范

所有文档遵循 [Writing Rules](./writing-rules.md)，包含五维评分体系和按文章类型分级的写作模板。

## 更新记录

详见 [Changelog](./changelog.md)
