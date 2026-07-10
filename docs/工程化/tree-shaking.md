---
title: Tree Shaking
description: Tree Shaking 死代码消除面试知识点
category: 工程化
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Tree Shaking
  - sideEffects
  - dead code
---

# Tree Shaking

> ⭐⭐⭐⭐｜难度：中级｜项目：★★★

**Tree Shaking 是打包体积优化的核心技术，但真正理解它需要深入 ESM 静态结构和 sideEffects 字段。** 面试中不要只停留在"去掉未使用代码"的口号上。

## 一句话总结

**Tree Shaking 是基于 ESM 静态 import/export 结构的死代码消除技术，打包工具在编译阶段分析模块依赖图，标记并移除未被引用的导出，配合 sideEffects 字段可以进一步安全地删除"看似无副作用"的模块。**

## 核心机制

### 为什么 ESM 才能 Tree Shaking？

Tree Shaking 的前提是**在编译阶段就能确定模块的导入/导出关系**。ESM 的 `import`/`export` 是静态语法，必须在模块顶层，不能被条件语句包裹：

```ts
// ESM — 静态结构，编译时就知道导出了什么
export const a = 1
export const b = 2
export default { a, b }

// import { a } from "./module" — 编译时就能确定只用了 a
```

```ts
// CommonJS — 动态结构，exports 可以在运行时任意修改
const { a } = require("./module") // if (condition) { require(...) }
// exports.a = something  // 条件赋值、循环赋值都可以
// 打包工具无法在编译时确定哪些是"未使用的"，所以不能 Tree Shaking
```

**核心差异**：ESM 的依赖图是编译时确定的静态图；CJS 的依赖图是运行时构造的动态图。Tree Shaking 依赖"静态可分析"这个前提。

### sideEffects 字段：安全网

即使代码是 ESM，打包工具也不敢随便删除"看起来没用但是有副作用"的模块。`sideEffects` 字段是在 `package.json` 中告诉打包工具："这个包的模块没有副作用，放心删"：

```json
// package.json
{
  "name": "my-utils",
  "sideEffects": false,
  // 或者标记特定文件有副作用
  "sideEffects": [
    "*.css",       // CSS 文件有副作用（插入样式到 DOM）
    "src/polyfill.js" // polyfill 有副作用
  ]
}
```

```ts
// 没有标记 sideEffects 的模块，打包工具不敢删
// 即使没有 import 任何导出，这个模块也执行了
import "./styles/global.css" // 副作用：往 DOM 注入样式
import "core-js/stable"      // 副作用：Polyfill 全局对象

// 这就是为什么 Element Plus 的样式按需导入需要额外配置
// 如果不标记 .css 为 sideEffects，打包时样式可能被 Tree Shaking 删掉！
```

### Rollup 和 Webpack 的 Tree Shaking 实现差异

两者都基于 ESM 做 Tree Shaking，但实现方式不同：

**Rollup**（Vite 生产构建使用）：
- 天然设计就是 ESM-first，Tree Shaking 是其核心功能
- 能判断函数调用的副作用，更精准
- 会对代码做更激进的 DCE（Dead Code Elimination）

**Webpack**：
- 通过 `usedExports` 优化：标记每个 export 是否被使用
- 依赖 Terser 做实际的 dead code 删除
- 对 CommonJS 模块可以做一些保守的 shaking（但不保证安全）

```ts
// webpack.config.ts
module.exports = {
  mode: "production", // 生产模式默认开启 Tree Shaking
  optimization: {
    usedExports: true,    // 标记未使用的导出
    minimize: true,       // Terser 删除被标记的代码
    sideEffects: true,    // 读取 package.json 的 sideEffects 字段
  },
}
```

### /*#__PURE__*/ 注释

有时候打包工具无法判断函数调用是否有副作用，可以用 PURE 注释手动标记：

```ts
// 打包工具会认为 const a = /*#__PURE__*/ someCall() 没有副作用
// 如果 a 没有被使用，这行代码会被整体删除
const result = /*#__PURE__*/ heavyComputation(x)

// Vue 3 源码中大量使用
// 标记 h() 调用为无副作用，便于 Tree Shaking
export const createVNode = (__DEV__
  ? createVNodeWithArgsTransform
  : _createVNode) as typeof _createVNode
```

## 深度拓展

### 为什么 CommonJS 不能 Tree Shaking？

```ts
// CJS：exports 可以动态修改
// 打包工具无法分析下面哪些导出被使用了
let count = 0
module.exports = {
  get a() { return count++ ? getB() : getA() }, // 调用顺序影响结果！
  get b() { return count++ ? getA() : getB() },
}
```

ESM 中 `export` 声明在编译时确定，不会在运行时改变结构。CJS 的 `module.exports` 是一个普通的 JS 对象，可以在任何地方被赋值、删除、添加属性。这是本质区别。

### sideEffects: false 的风险

```ts
// 如果 package.json 中 sideEffects: false
// 但代码中有这行：
import "./init" // init.ts 里注册了全局组件、全局指令

// 打包工具会认为 init.ts 没有任何导出被使用
// 也没有标记 sideEffects → 删除整个 init.ts！
// 结果：全局组件注册丢失，运行时翻车
```

安全做法：不要随便对整个包标记 `sideEffects: false`，明确列出有副作用的文件路径。

### 为什么打包后依然有未使用的代码？

三个常见原因：
1. **代码里有副作用**：函数调用、全局赋值等无法被静态分析确定无副作用
2. **CJS 模块混在依赖里**：某个依赖导出的是 CJS，Tree Shaking 对它不生效
3. **动态 import**：`import(variable)` 无法静态分析，该模块及其所有依赖都会被保留

## 项目实战

### 1. Element Plus 按需导入 -- Tree Shaking 的实战应用

```ts
// ❌ 全量导入：打包 ~1.5MB
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
app.use(ElementPlus)

// ✅ 按需导入 + unplugin-vue-components：打包 ~200KB
// 配合 Tree Shaking，只打包实际使用的组件
// vite.config.ts
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"

export default defineConfig({
  plugins: [
    Components({
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
    }),
  ],
})

// 在 .vue 文件中直接使用，自动按需导入
// <ElButton>提交</ElButton>  →  只打包 Button 组件及其样式
```

### 2. package.json 中正确配置 sideEffects

```json
{
  "name": "admin-system",
  "sideEffects": [
    "*.css",
    "*.scss",
    "*.less",
    "src/assets/**/*.css",
    "src/styles/index.scss",
    "src/**/*.global.ts",
    "./setup.ts"
  ]
}
```

### 3. 验证 Tree Shaking 是否生效

```bash
# Vite / Rollup：用 rollup-plugin-visualizer 生成可视化报告
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from "rollup-plugin-visualizer"
export default defineConfig({
  plugins: [visualizer({ open: true, gzipSize: true })],
})
# 打开 stats.html 查看每个模块的实际占用

# Webpack：用 webpack-bundle-analyzer
npm install -D webpack-bundle-analyzer
# 在 plugins 中配置 BundleAnalyzerPlugin
```

## 易错点

1. **导入但未使用不代表会 Tree Shaking 掉** -- 如果模块有副作用（顶层立即执行代码），整个模块都会被保留
2. **把 CSS import 标为 sideEffects: false** -- CSS 导入是副作用（向 DOM 插入 `<style>`），删掉后样式丢失。必须在 sideEffects 里排除 `*.css`
3. **Barrel 文件（index.ts 重新导出）导致 Tree Shaking 失效** -- `import { Button } from "../components"` 如果 `components/index.ts` 重新导出了所有组件，即使只用 Button 也会打包所有组件。用直接路径导入 `../components/Button.vue`
4. **`export default` 的 Tree Shaking 效果更好** -- 不，`export default` 导出的是一个对象，打包工具很难分析对象内部哪些属性被使用。命名导出 `export const xxx` 更利于 Tree Shaking
5. **生产构建后仍有 console.log** -- `console.log` 是副作用调用，Terser/Rollup 不会删除。需要手动配置 `drop_console: true` 或在 esbuild 中 `drop: ["console"]`

## 相关阅读

- [工程化 知识地图](./index.md)
- [Webpack](./webpack.md)
- [Vite](./vite.md)
- [Babel / ESBuild](./babel-esbuild.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（ESM 静态结构 + sideEffects + Rollup/Webpack 差异 + PURE 注释 + Element Plus 按需实战）
