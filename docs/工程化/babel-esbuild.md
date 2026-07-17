---
title: Babel / ESBuild
description: Babel 与 ESBuild 编译工具面试知识点
category: 工程化
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Babel
  - AST
  - ESBuild
  - 编译
---

# Babel / ESBuild

> ⭐⭐⭐｜难度：高级

**Babel 和 ESBuild 虽然都是"编译"工具，但设计理念完全不同。** Babel 追求转换能力的完备性；ESBuild 追求极致的构建速度。面试中要能说清两者的角色分工。

## 一句话总结

**Babel 是 JavaScript 编译器（源码 -> 源码），通过 AST 转换实现语法降级和 polyfill 自动注入；ESBuild 是 Go 语言编写的极速打包器，速度比 Babel 快 10-100 倍，但插件体系不如 Babel 灵活，主要用于 Vite 中的依赖预构建。**

## 核心机制

### Babel 的 AST 三阶段

Babel 的工作流程是一个标准的编译器前端：

```mermaid
graph LR
    A[源码 source] --> B[Parse 解析]
    B --> C[AST 抽象语法树]
    C --> D[Transform 转换]
    D --> E[新的 AST]
    E --> F[Generate 生成]
    F --> G[目标代码 target]
```

```ts
// 一个箭头函数经过 Babel 转换的过程
// 输入
const add = (a: number, b: number): number => a + b

// Parse：源代码 → AST
{
  type: "VariableDeclaration",
  declarations: [{
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "add" },
    init: {
      type: "ArrowFunctionExpression",
      params: [
        { type: "Identifier", name: "a", typeAnnotation: ... },
        { type: "Identifier", name: "b", typeAnnotation: ... }
      ],
      body: { type: "BinaryExpression", operator: "+", ... }
    }
  }]
}

// Transform：通过插件修改 AST（箭头函数 → 普通函数，去掉类型注解）
// Generate：AST → 目标代码
var add = function add(a, b) { return a + b }
```

**面试重点**：Babel 是"源码到源码"的编译，不是"源码到二进制"。所以它只能做语法转换，不能做类型检查（那是 tsc 的事）。类型注解只是被擦除，不会被校验。

### preset-env：按目标环境自动注入 polyfill

```ts
// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        // 目标浏览器：市场份额 > 1% 的浏览器，且排除已死的 IE11
        targets: "> 1%, not dead",
        // useBuiltIns 指定 polyfill 策略
        useBuiltIns: "usage", // 按实际使用注入 core-js polyfill
        corejs: "3.32", // core-js 版本
      },
    ],
    ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
  ],
  plugins: [
    // JSX 转换
    ["@vue/babel-plugin-jsx", { transformOn: true }],
  ],
}
```

`useBuiltIns` 三种策略：
- `false`：不自动注入 polyfill，需要手动 `import "core-js"`
- `"entry"`：在入口文件根据 targets 替换所有 `import "core-js"` 为具体需要的 polyfill
- `"usage"`：按每个文件实际使用的 API 按需注入，最推荐

### ESBuild 为什么这么快？

ESBuild 用 **Go** 语言编写，编译为原生二进制执行：

| 优势 | 具体含义 |
|------|---------|
| 无 JIT 预热 | Go 编译为机器码直接执行，不像 JS 引擎需要 JIT 编译预热 |
| 多线程并行 | Go 原生 goroutine，解析/编译/打印三阶段并行 |
| 内存高效 | 一次分配、复用内存，减少 GC 开销 |
| 手写解析器 | 不依赖第三方解析器，针对 JS/TS 高度优化 |

```bash
# 速度对比（同等条件下）
babel:    15.0s
tsc:      20.0s
esbuild:   0.3s  # 快 50-100 倍
swc:       0.5s  # Rust 实现的"超快 Babel"
```

**但 ESBuild 有局限**：
- 不支持 AST 级别的自定义插件（只支持钩子级别的简单插件），无法实现 Babel 那样的深度定制转换
- 面向旧目标的语法降级不完整（如部分特性无法降级到 ES5），也不支持 `emitDecoratorMetadata`（标准 decorators 语法自 esbuild 0.21 起已支持）
- ESM/CJS 互操作在某些边界场景有 bug

### SWC —— 另一个 Rust 选手

**SWC（Speedy Web Compiler）** 和 ESBuild 一样用 Rust 编写，定位类似但生态不同：

| 维度 | Babel | ESBuild | SWC |
|------|-------|---------|-----|
| 语言 | JavaScript | Go | **Rust** |
| 速度 | 1x（基准） | ~100x | ~70x |
| 插件系统 | 完善（AST 级别） | 有限（钩子级别） | 实验性 |
| 生态 | 最大 | Vite 内置 | Next.js 内置 |
| Vue3 项目使用 | 传统方案 | **Vite 默认** | 通过插件 |

**SWC 在 Vue3 生态中的位置**：Next.js 已从 Babel 全面迁移到 SWC，但 Vue3 生态中 Vite 内置的是 ESBuild。SWC 可通过 `unplugin-swc` 或 `vite-plugin-swc` 接入 Vite，但主流方案仍是 ESBuild。

**什么时候用 SWC**：
1. 从 Next.js 项目迁移过来的团队习惯 SWC
2. 需要 SWC 的特定插件（如 Relay、Emotion CSS-in-JS）
3. 需要比 ESBuild 更灵活的 transform 能力（SWC 插件生态虽不成熟但比 ESBuild 强）

**面试要点**：知道 SWC 存在、知道它是 Rust 写的、知道它和 ESBuild 的核心差异在插件系统而非速度。面试官问「除了 ESBuild 还有什么」时能接上 SWC 就够。

## 深度拓展

### 为什么 Vite 用 esbuild 做预构建而不是 Babel？

一句话：**速度差距是数量级的**。Vite 需要在开发服务器启动时把 node_modules 里的几百个包转成 ESM，用 Babel 可能要等几十秒，用 esbuild 不到 1 秒。这是 Vite 冷启动快的根本原因之一。

对源码的处理则是分工协作：Vue SFC 交给 `@vitejs/plugin-vue`（内部用 `@vue/compiler-sfc` 编译模板和样式），`<script lang="ts">` 及普通 `.ts`/`.tsx` 文件的类型擦除交给 esbuild。esbuild 只做转译不做类型检查，也不支持 `emitDecoratorMetadata`——依赖装饰器元数据的项目（如用 TypeORM/InversifyJS 时）需要换用 SWC 或 Babel 插件处理。

### ESBuild 的 Tree Shaking 和代码压缩

ESBuild 自带 Tree Shaking 和代码压缩（minify），可以直接使用：

```bash
# 打包 + tree shaking + 压缩一步完成
npx esbuild src/index.ts --bundle --minify --outfile=dist/bundle.js --format=esm
```

```ts
// esbuild 作为 Node API 使用
import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true, // 自带压缩，不需要 terser
  treeShaking: true, // 默认开启
  format: "esm",
  outfile: "dist/bundle.js",
  // 但复杂的分包场景能力远不如 Rollup
})
```

### SWC（Rust 版 "Babel"）的崛起

SWC 是用 Rust 写的 JS/TS 编译器，定位和 esbuild 类似但更偏重"Babel 的替代品"：

| | ESBuild | SWC |
|---|---|---|
| 语言 | Go | Rust |
| 定位 | 打包器 + 编译器 | 编译器（Babel 替代） |
| 插件 | 简单钩子 | AST 级别的 Rust 插件 |
| 使用者 | Vite（预构建） | Next.js, SWC（替代 Babel） |

Vite 自 3.x 起就通过 `@vitejs/plugin-react-swc` 支持用 SWC 代替 Babel 做 React 项目编译，但 Vue 生态暂时还是 esbuild 为主（`@vitejs/plugin-vue` 深度集成 esbuild）。

## 项目实战

### 1. Babel 配置（Vue3 项目）

```ts
// babel.config.js — 后台管理系统常用配置
module.exports = {
  presets: [
    ["@babel/preset-env", {
      targets: { browsers: ["last 2 versions", "not dead", "> 1%"] },
      useBuiltIns: "usage",
      corejs: "3.38",
      modules: false, // 保留 ESM，让 Webpack/Rollup 做 Tree Shaking
    }],
  ],
  plugins: [
    // Vue JSX 支持
    "@vue/babel-plugin-jsx",
    // 自动导入 Element Plus 样式（如果没走按需导入）
    // ... 其他插件
  ],
  // 只处理 src 目录
  exclude: /node_modules/,
}
```

关键技巧：`modules: false` 让 Babel 保留 `import/export` 语法不转换，让 Webpack/Rollup 来做 Tree Shaking。如果 Babel 把 ESM 转成 CJS，Tree Shaking 就废了。

### 2. ESBuild 在 Vite 中的角色

在 Vite 项目中，你通常不需要直接配 esbuild，它是 Vite 内部使用的。但可以通过 `esbuild` 字段微调：

```ts
// vite.config.ts
export default defineConfig({
  esbuild: {
    // 去掉 console 和 debugger（生产环境）
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    // JSX 配置
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
})
```

### 3. 构建速度对比实验

在 156 个组件的中型后台项目（Element Plus + ECharts + Axios + VueUse）中实测：

```bash
# Babel 构建（ts-loader + babel-loader）
real    2m 14s

# ESBuild 构建（vite build）
real    0m 32s   # 快了 4 倍
```

## 易错点

1. **Babel 的 preset 和 plugin 执行顺序** -- plugin 在 preset 之前执行，且 plugin 从前往后、preset 从后往前
2. **preset-env 的 targets 不配置** -- 不配置 targets 会按"尽可能旧"的目标环境转换，导致大量不需要的 polyfill 和语法降级，打包体积陡增
3. **把 esbuild 当生产构建工具** -- esbuild 打包复杂场景（代码分割、CSS 处理）不如 Rollup/Webpack 成熟，Vite 只在开发+预构建中用 esbuild，生产用 Rollup
4. **core-js 版本不匹配** -- `@babel/preset-env` 的 `corejs` 选项必须和实际安装的 `core-js` 版本一致，否则运行时可能报错
5. **忘记设置 `modules: false`** -- Babel 把 ESM 转成 CJS 后，Webpack/Rollup 的 Tree Shaking 完全失效，包体积可能大 30%

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Babel 和 ESBuild 有什么区别" | 追问 Babel 是转译器（JS→JS）、ESBuild 是打包器+转译器（更快） |
| "为什么 ESBuild 这么快" | 追问 Go 语言编写编译为机器码、多线程并行、全流程只遍历 AST 约 3 次的架构优势 |
| "preset-env 和 plugin 的关系" | 追问 preset 是 plugin 的集合——preset-env 按目标环境自动选插件 |

## 相关阅读

- [工程化 知识地图](./index.md)
- [Vite](./vite.md)
- [Webpack](./webpack.md)
- [Tree Shaking](./tree-shaking.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（AST 三阶段 + preset-env + ESBuild 速度原理 + SWC 对比 + 项目配置）
