---
title: Tree Shaking / HMR 面试回答
description: 面试中如何回答 Tree Shaking 原理和 HMR 热更新机制
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 工程化
  - Tree Shaking
  - HMR
  - 面试回答
---

# Tree Shaking / HMR 面试回答

> 工程化深度题。Tree Shaking 考察对 ESM 和副作用的理解，HMR 考察对模块热替换流程的掌握。

## Q1: Tree Shaking 的原理是什么？什么情况下会失效？

### 30 秒版本

"Tree Shaking 利用 ESM 的静态导入——编译时分析 import/export 生成依赖图，标记未使用的导出，打包时删除。关键条件：必须用 ESM（CJS 的 require 是动态的没法静态分析）、package.json 的 sideEffects: false 告诉打包器所有模块无副作用可安全删除。失效最常见原因——CJS 模块、动态 import、副作用代码（如 polyfill）被误删。"

### 2 分钟版本

**三步原理**：

1. 静态分析：ESM 的 import/export 在编译时确定，不像 CJS 的 require 可以在 if/for 里动态调用。Rollup/Webpack 扫描所有模块的导出和引用
2. 标记无用代码：从入口开始遍历依赖图——标记每个导出的引用次数。引用计数为 0 的导出即为 dead code
3. DCE（Dead Code Elimination）：Terser/UglifyJS 在压缩阶段删除被标记的代码

**为什么必须 ESM**：CJS 的 `require()` 和 `module.exports` 是运行时动态的——代码结构变了就无法在构建时分析。"ESM 是实现 Tree Shaking 的前提"是面试常考的因果关系。

**sideEffects 的作用**：`package.json` 设 `"sideEffects": false` = 告诉打包器"我的模块都是纯函数，删除未使用的导出不会改变程序行为"。设为数组 `["*.css", "*.scss"]` = CSS 文件有副作用（注入样式），不要摇掉。

**Tree Shaking 失效的五种场景**：
- CJS 模块：lodash 要用 `lodash-es`（ESM 版本）才能 tree-shake
- 副作用代码：`import './polyfill'` 需要标记在 sideEffects 数组中
- 动态属性访问：`obj[computedKey]` 打包器不知道访问了哪个属性，保留所有
- Class 的方法：TS 编译后的 class 方法挂在 prototype 上，打包器很难分析
- 导出被外部使用但内部有副作用：`export const x = initGlobal()` 即使 x 没人用 initGlobal() 也执行了

## Q2: HMR（热模块替换）的原理？

### 30 秒版本

"HMR 让模块变更不刷新页面就直接更新。Webpack 用 WebSocket 通信——文件变更→重新编译→通过 WS 推 JSON 描述变更内容→客户端 runtime 接收→替换旧模块→如果模块注册了 accept 回调就局部更新，否则冒泡到上层直到全量刷新。"

### 2 分钟版本

**Webpack HMR 四步流程**：

1. 文件变更：webpack-dev-server 监听到文件改动，重新编译变更的模块
2. 生成 manifest：编译完成后生成 hot-update.json（含变更的 chunk 和 hash）和 hot-update.js（变更后的新代码）
3. WS 推送：webpack-dev-server 通过 WebSocket 把 hot-update.json 推给浏览器
4. Runtime 热替换：HMR runtime 接收→用 jsonp 加载新代码→`module.hot.accept()` 注册回调替换模块实例

**Vite 的 HMR 更快**：Vite 基于原生 ESM，文件变更只重新请求变更的那个模块——不需要重新打包。Webpack 需要重新编译整个 chunk 图。Vite 的 HMR 是真正的"按需编译"——变更一个 Vue 组件的 template，只重新请求这一个 .vue 文件的编译结果。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Vue 组件 HMR 怎么保持组件状态" | Vue-loader 在编译时为每个组件注入 accept 回调——用新组件的 render 替换旧组件的，但 data/state 保留。这就是改了 template 不丢表单输入的原理 |
| "HMR 失败会怎样" | 冒泡到入口——全量刷新页面。控制台显示"[HMR] Cannot apply update" |
| "Tree Shaking 和 Code Splitting 的区别" | Tree Shaking 删除未使用的代码（减体积）。Code Splitting 把代码拆成多个文件按需加载（减首屏加载量）。一横一竖——目标不同 |

## 别踩的坑

1. **sideEffects: false 误删 CSS** —— CSS 文件 import 有副作用（注入样式）。设为 `["*.css"]` 或在 entry 处显式 import CSS。
2. **"Tree Shaking 基于静态分析"** —— 没说 ESM 是前提条件。CJS 模块完全不支持。

## 相关阅读

- [Vite / Webpack](./vite-webpack.md)
- [构建优化实战](./build-optimization.md)

## 更新记录

- 2026-07-15：新建（Tree Shaking 三步骤 + 五种失效场景 + HMR 四步流程 + Vite vs Webpack）
