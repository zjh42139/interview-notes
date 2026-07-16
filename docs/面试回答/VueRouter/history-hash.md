---
title: Vue Router history vs hash 面试回答
description: 面试中如何回答 history 和 hash 模式的区别、底层原理、部署配置
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - VueRouter
  - history
  - hash
  - 路由
  - 面试回答
---

# Vue Router history vs hash 面试回答

> Q1 ⭐⭐⭐⭐⭐——Vue Router 最高频面试题。

## Q1: history 和 hash 模式有什么区别？怎么选？

### 30 秒版本

"hash 模式 `#` 后内容不发送服务端——基于 hashchange 事件，实现简单刷新不 404。history 模式基于 HTML5 History API——URL 干净 SEO 友好，但刷新依赖 Nginx `try_files` 兜底。后台用 hash 省心，C端用 history 美观。"

### 2 分钟版本

"两个模式的本质区别在于 URL 结构和底层 API。

hash 模式：URL 中 `#` 及之后的内容不会发送到服务端——浏览器认为是页内锚点。底层依赖 `hashchange` 事件——`#` 变化时触发。优点：零服务器配置——部署到任何静态服务器都能正常工作，刷新不会 404。缺点：URL 带 `#`——不够美观，SEO 不友好（搜索引擎忽略 `#` 后内容）。适合后台管理系统、内部工具。

history 模式：基于 HTML5 History API——`pushState` 和 `popstate`。URL 干净——没有 `#`。SEO 友好——搜索引擎能正常索引。但需要服务器配合：用户直接访问 `/user/123` → 浏览器发请求到服务器 → 服务器没有这个路径的文件 → 404。解决：Nginx 配置 `try_files $uri $uri/ /index.html`——非静态资源请求全部返回 index.html，前端路由接管。

选型决策：后台管理系统用 hash（零配置省心），C 端产品用 history（SEO + 美观）。混合方案：网站用 history + SSR（Nuxt/Next），后台用 hash。

加分项：hash 模式可以通过 `window.location.hash` 跨页面传递简单状态（不依赖 JS 框架）。history 模式 `history.state` 能在刷新后保持数据。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "history 模式刷新 404 怎么办" | Nginx `try_files $uri $uri/ /index.html`——非静态资源全部回退到 index.html。Node 后端用 connect-history-api-fallback 中间件 |
| "hash 模式能 SEO 吗" | 不能——搜索引擎忽略 `#` 后的内容，也不触发 JS。需要 SEO 用 SSR + history 模式 |
| "popstate 什么时候触发" | 前进/后退时——pushState 和 replaceState 本身不触发 popstate。vue-router 内部封装了这个差异 |

## 别踩的坑

1. **history 模式忘了配 Nginx 就上线** —— 刷新直接 404。测试环境通常是 SPA dev server 自动处理——生产环境才暴露问题
2. **hash 模式的路由中手动修改 hash** —— 会触发路由导航，可能导致死循环
3. **hash 中传敏感信息** —— `#` 后的内容虽然不发送到服务器，但会保留在浏览器历史中

## 相关阅读

- [Vue Router history vs hash](../../VueRouter/history-vs-hash.md)
- [History API](../../HTML/history-api.md)
- [路由守卫](./route-guards.md)

## 更新记录

- 2026-07-16：新建——VueRouter 最高频面试题回答稿
