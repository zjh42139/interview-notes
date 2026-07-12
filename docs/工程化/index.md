---
title: 工程化 知识地图
description: 前端工程化面试知识体系
category: 工程化
difficulty: null
frequency: null
status: draft
created: 2026-07-05
updated: 2026-07-11
reviewed: null
tags:
  - 工程化
---

# 工程化 知识地图

```mermaid
mindmap
  root((工程化))
    构建工具
      Vite
        ESBuild 预构建
        Rollup 生产打包
      Webpack
        loader
        plugin
      Babel / ESBuild
        AST 转换
    包管理
      npm
        dependencies
        lock
      pnpm
        workspace
        monorepo
    模块与优化
      ESM / CommonJS
      Tree Shaking
      代码分割
    样式工程
      Tailwind CSS
        原子化 CSS
    Node.js
      CommonJS vs ESM
      Express / Koa
      Event Loop
      package.json
    测试与质量
      测试体系
        Vitest
        Vue Test Utils
        Playwright
    日志与监控
      Sentry
      性能监控
      埋点追踪
      线上调试
```

## 推荐学习顺序

### 一、包管理与模块

1. ⭐⭐⭐⭐⭐ [npm 深入](./npm-deep.md)
2. ⭐⭐⭐⭐   [pnpm](./pnpm.md)
3. ⭐⭐⭐⭐   [ESM / CommonJS](./esm-module.md)

### 二、构建工具

4. ⭐⭐⭐⭐⭐ [Vite](./vite.md)
5. ⭐⭐⭐⭐⭐ [Vite 深入](./vite-deep.md)
6. ⭐⭐⭐⭐   [Webpack](./webpack.md)
7. ⭐⭐⭐     [Babel / ESBuild](./babel-esbuild.md)
8. ⭐⭐⭐⭐   [Tree Shaking](./tree-shaking.md)

### 三、样式与质量

9. ⭐⭐⭐     [Tailwind CSS](./tailwindcss.md)
10. ⭐⭐⭐     [前端测试体系](./testing.md)

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [npm 深入](./npm-deep.md) | ⭐⭐⭐⭐⭐ | 中级 | — | filled |
| [Vite](./vite.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [Vite 深入](./vite-deep.md) | ⭐⭐⭐⭐⭐ | 高级 | — | filled |
| [Webpack](./webpack.md) | ⭐⭐⭐⭐ | 高级 | — | draft |
| [pnpm](./pnpm.md) | ⭐⭐⭐⭐ | 初级 | — | draft |
| [Tree Shaking](./tree-shaking.md) | ⭐⭐⭐⭐ | 中级 | — | draft |
| [ESM / CommonJS](./esm-module.md) | ⭐⭐⭐⭐ | 中级 | — | draft |
| [Babel / ESBuild](./babel-esbuild.md) | ⭐⭐⭐ | 高级 | — | draft |
| [Tailwind CSS](./tailwindcss.md) | ⭐⭐⭐ | 中级 | — | draft |
| [前端测试体系](./testing.md) | ⭐⭐⭐ | 中高级 | — | draft |

## 相关阅读

- [Node.js 知识地图](./Node/index.md) — Express/Koa、Event Loop、package.json
- [日志监控 知识地图](./日志监控/index.md) — Sentry、性能监控、埋点追踪
- [前端架构 知识地图](../前端架构/index.md) — 微前端、Monorepo
- [面试题库：工程化](../面试题库/工程化.md) — 12 道工程化高频真题
- [面试回答：工程化](../面试回答/工程化/vite-webpack.md) — Vite/Webpack 面试回答

## 更新记录

- 2026-07-12：学习顺序三组分类（包管理与模块/构建工具/样式与质量），pnpm+ESM归入包管理
- 2026-07-11：补 vite.md / testing.md / esm-module.md 到学习顺序和知识点索引；mindmap 扩大覆盖 Node.js/测试/日志/监控
- 2026-07-05：初始创建
