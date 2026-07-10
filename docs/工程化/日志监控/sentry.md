---
title: Sentry 错误监控
description: Sentry 接入、Source Map 上传、Release 管理、Breadcrumbs
category: 日志监控
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - Sentry
  - 错误监控
  - Source Map
---

# Sentry 错误监控

## ✅ 核心机制

### 1. Sentry 是什么？

Sentry 是一个**开源的实时错误追踪平台**，支持前端（JS/Vue/React）和后端（Node/Java/Python 等）。它能在生产环境报错时自动捕获异常、记录上下文、聚合相同错误，并提供完整的堆栈信息。

一句话总结：**线上代码出错了，Sentry 能告诉你哪里错了、怎么错的、影响了多少用户。**

### 2. 前端接入方式

```js
import * as Sentry from '@sentry/vue';

Sentry.init({
  app,
  dsn: 'https://xxx@sentry.io/xxx',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.3,                    // 生产环境建议 0.1~0.3
  replaysOnErrorSampleRate: 1.0,            // 报错时全量回放
  environment: 'production',
  release: process.env.GIT_COMMIT_HASH,     // 关联 Git commit
});
```

关键配置：`dsn`（上报地址）、`tracesSampleRate`（采样率，控制费用）、`release`（版本追踪，定位引入 bug 的 commit）。

### 3. 自动捕获的错误类型

Sentry SDK 初始化后会自动捕获以下错误，无需手动 `try-catch`：

- **JS 运行时错误**：`ReferenceError`、`TypeError` 等未被 catch 的异常
- **Promise rejection**：未处理的 `Promise.reject()` 或 async/await 抛出
- **资源加载错误**：`<script>`、`<img>` 等标签加载失败（需监听 `error` 事件）
- **接口报错**：需结合 Axios 拦截器手动上报（Sentry 不会自动捕获 XHR/fetch 错误）

### 4. Source Map 上传

**问题**：生产环境代码经过打包压缩混淆后，Sentry 捕获的堆栈信息指向压缩后的代码（如 `chunk-abc123.js:1:23456`），无法定位到源码。

**解决方案**：构建时生成 `.map` 文件并上传到 Sentry。

```js
// vite.config.js
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default {
  build: {
    sourcemap: true,          // 生成 source map
  },
  plugins: [
    sentryVitePlugin({
      org: 'my-org',
      project: 'my-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: process.env.GIT_COMMIT_HASH },
    }),
  ],
};
```

上传完成后，**必须将 `.map` 文件从生产服务器删除**（或配置服务器禁止公开访问），避免源码泄露。

## ⭐ 深度拓展

### 5. Release 管理

Release 是 Sentry 中**以版本为粒度管理错误**的机制。每次发版时，通知 Sentry 创建新 Release，Sentry 就能告诉你一个 bug 是从哪个版本开始出现的。

```bash
# CI/CD 流程中创建 Release
sentry-cli releases new $GIT_COMMIT_HASH
sentry-cli releases set-commits $GIT_COMMIT_HASH --auto
sentry-cli releases deploys $GIT_COMMIT_HASH new -e production
```

结合 Git 集成后，Sentry 能**直接定位到可能引入 bug 的 commit 和开发者**，这就是 "Suggested Assignee" 功能的原理。

### 6. Breadcrumbs（面包屑）

Breadcrumbs 是 Sentry 记录的事件时间线，展示了**报错前用户做了什么操作**：

- 点击了哪个按钮
- 发起了什么请求
- 导航到了哪个页面
- `console.log` 输出了什么

自定义添加面包屑：

```js
Sentry.addBreadcrumb({
  category: 'user-action',
  message: '用户点击了"提交订单"按钮',
  level: 'info',
});
```

Breadcrumbs 对复现问题极为重要——你不需要问用户"你之前做了什么"，Sentry 已经帮你记下来了。

### 7. Sentry 的不足

- **不是日志系统**：Sentry 聚焦错误，不替代 ELK/SLS 做全量日志检索
- **采样率控制**：高流量场景需控制 `tracesSampleRate`，否则费用爆炸
- **隐私合规**：`replay` 需配置 `maskAllText` 等脱敏选项，避免录制敏感信息

## ⭕ 项目实战

### 后台管理系统接入流程

1. 安装 `@sentry/vue`，在 `main.js` 中初始化
2. `vite.config.js` 配置 Source Map 上传插件
3. CI/CD 中添加 `sentry-cli` 创建 Release
4. Axios 拦截器中手动上报 HTTP 错误
5. 关键业务操作处添加自定义 Breadcrumbs
6. Nginx 配置禁止 `.map` 文件公开访问

### 易错点

| 易错点 | 正确做法 |
|--------|----------|
| 忘记上传 Source Map | 每次构建后自动上传，纳入 CI 流程 |
| `.map` 文件留在生产服务器 | Nginx 配置 `location ~ \.map$ { deny all; }` |
| Release 版本号不一致 | 使用 Git commit hash 而非手动维护版本号 |
| 不区分 environment | 明确配置 dev/staging/prod，避免测试环境错误污染 |

### 面试信号

> **"Source Map + Release + Breadcrumbs 三件套说起来"**

当被问到"如何做前端错误监控"时，回答框架：

1. 使用 Sentry 做错误捕获和聚合
2. Source Map 上传保证错误能定位到源码行
3. Release 管理追踪版本与 bug 的关系
4. Breadcrumbs 记录用户操作路径辅助复现
5. 结合日志系统做全量检索兜底

说完这五点，面试官基本不会再追问。如果还能提到 Sampling Rate 控制和隐私脱敏，就是加分项。
