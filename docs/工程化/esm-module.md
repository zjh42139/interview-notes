---
title: ESM 模块化深入
description: ES Modules 静态结构、Tree Shaking 原理、动态导入、sideEffects、循环引用深层分析
category: 工程化
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - ESM
  - Tree Shaking
  - sideEffects
  - 动态导入
  - 循环引用
  - Live Binding
---

# ESM 模块化深入

> ⭐⭐⭐⭐｜难度：高级

**Tree Shaking 为什么只能基于 ESM？ESM 的"值的引用"和 CJS 的"值的拷贝"到底意味着什么？** 本文深入 ESM 的静态结构本质，连接模块化理论和工程化实践。

## 一句话总结

**ESM 是 JS 语言标准的静态模块系统，`import`/`export` 在编译时确定依赖图，输出的是"值的实时引用"而非拷贝——这三点让 Tree Shaking、代码分割和循环引用安全处理成为可能。**

## 核心机制

### 1. ESM vs CJS 的本质区别

| 维度 | ESM | CommonJS |
|------|-----|----------|
| 加载时机 | 编译时静态分析（import hoisting） | 运行时动态加载（require 是函数调用） |
| 导出内容 | 值的引用（Live Binding） | 值的拷贝（module.exports 的快照） |
| this 指向 | `undefined`（模块顶层） | `module.exports` |
| Tree Shaking | 天然支持（静态依赖图） | 无法支持（运行时才知道用了什么） |
| 语法 | `import` / `export` 关键字 | `require()` / `module.exports` 对象 |
| 动态导入 | `import()` 返回 Promise | `require()` 同步返回 |

### 2. 值的引用 vs 值的拷贝——这是核心

```ts
// ============= CommonJS：值的拷贝 =============
// counter.js (CJS)
let count = 0
function increment() { count++ }
module.exports = { count, increment }

// main.js (CJS)
const { count, increment } = require("./counter")
console.log(count)   // 0
increment()
console.log(count)   // 仍然 0！—— count 是原始值的拷贝

// ============= ESM：值的引用（Live Binding）=============
// counter.mjs (ESM)
export let count = 0
export function increment() { count++ }

// main.mjs (ESM)
import { count, increment } from "./counter.mjs"
console.log(count)   // 0
increment()
console.log(count)   // 1！—— import 的是对 count 变量的"实时绑定"
```

**面试深度解释**：CJS 的 `module.exports = { count }` 在导出时就把 `count` 的当前值（0）拷贝到对象中。之后模块内部的 `count++` 改变的是内部变量，不影响已拷贝出去的值。而 ESM 的 `import { count }` 不是拷贝，是建立了对 `count` 这个**变量的只读引用**——模块内部改变 `count`，所有 import 它的地方都能看到最新值。这就是 Live Binding 的含义。

### 3. import / export 全语法

```ts
// ============= 命名导出 =============
export const name = "test"
export function foo() {}
export class Bar {}

// 集中导出
const a = 1, b = 2
export { a, b }

// 重命名导出
export { a as alpha, b as beta }

// ============= 默认导出 =============
export default function () {}  // 一个模块只能有一个 default
// 等价于 { default: function () {} }

// 同时具名 + 默认
export { a, b }
export default function main() {}

// ============= 聚合导出（re-export）=============
export { default as Foo } from "./foo"   // 转发默认导出并重命名
export { bar, baz } from "./utils"       // 转发具名导出
export * from "./constants"              // 转发全部（不含 default）
export * as utils from "./utils"         // 命名空间聚合
```

### 4. `import()` 动态导入

```ts
// 静态 import：必须在模块顶层，路径不能是变量
import { foo } from "./module"

// 动态 import()：任何位置调用，返回 Promise<Module>
const module = await import("./module")
// module 是 Module Namespace Object：{ foo, bar, default, [Symbol.toStringTag]: 'Module' }

// 代码分割的基础：路由懒加载
const routes = [
  { path: "/dashboard", component: () => import("@/views/Dashboard.vue") },
  { path: "/settings", component: () => import("@/views/Settings.vue") },
]

// 条件加载
if (process.env.NODE_ENV === "development") {
  const { logger } = await import("./dev-logger")
  logger("debug mode")
}
```

**打包工具的分割策略**：Webpack/Rollup 遇到 `import()` 会在依赖图中标记一个"异步边界"，自动生成独立的 chunk。动态 import 是代码分割的语法级声明。

## 深度拓展

### 1. Tree Shaking 原理：为什么只能基于 ESM？

Tree Shaking 的本质是**在编译时分析模块依赖图，找出那些被 export 但从未被任何模块 import 的代码，标记为 dead code 并删除**。

```
// utils.ts
export function used() { return "I am used" }
export function unused() { return "I am dead code" }

// main.ts
import { used } from "./utils"   // 只导入了 used
console.log(used())
// unused 虽然被 export，但没有模块 import 它 → 可以被删除
```

这要求依赖关系在**运行时之前**就能确定——这正是 ESM 的"静态结构"提供的：
- `import` 声明只能在模块顶层（不能放在 if/for/函数内）
- `import` 路径必须是字符串字面量（不能是变量）
- `import` 声明的绑定是只读的（不能改写导入的变量）

CJS 的 `require()` 是运行时函数调用，可以在任何地方、以任何路径变量调用，打包工具无法提前知道会导入什么。所以 Webpack 对 CJS 的 Tree Shaking 非常保守（基本不做）。

### 2. sideEffects：告诉打包工具"这个模块没有副作用"

```json
// package.json
{
  "name": "my-lib",
  "sideEffects": false  // 全部模块都没有副作用
  // 或指定文件有副作用：
  // "sideEffects": ["*.css", "*.scss", "./src/polyfills.ts"]
}
```

**副作用的含义**：一个模块被导入时，如果除了导出内容之外还执行了其他操作（如修改全局变量、注册事件监听、polyfill），就有"副作用"。

```ts
// 无副作用：打包工具可以安全地删除未使用的导出
export function add(a, b) { return a + b }
export function sub(a, b) { return a - b }

// 有副作用：即使没有显式 import 任何导出，这行也会执行
import "./polyfills"  // 修改了全局 Array.prototype.flat
// 标记 sideEffects: false 后，这个文件可能被整体删除！
```

**实践陷阱**：如果你写的组件库 `sideEffects: false` 但引用了全局 CSS，Tree Shaking 后样式会丢失。解决方案：在 `sideEffects` 数组中排除 CSS 文件。

### 3. 循环引用：ESM vs CJS 的不同表现

CJS 的循环引用问题及解决方案详见 [Node / CommonJS / ESM](../工程化/Node/commonjs-esm.md)。这里聚焦 ESM 的处理方式。

```ts
// a.mjs
import { bValue } from "./b.mjs"
export const aValue = "a: " + bValue

// b.mjs
import { aValue } from "./a.mjs"
export const bValue = "b: " + aValue

// ESM 的处理：
// 1. 解析阶段：发现 a 依赖 b，b 依赖 a → 检测到循环
// 2. 链接阶段：建立 Live Binding 映射
//    - b.mjs 中的 aValue 绑定到 a.mjs 的 aValue 变量
//    - a.mjs 中的 bValue 绑定到 b.mjs 的 bValue 变量
// 3. 执行阶段：先执行 a.mjs → 计算 aValue 时访问 bValue
//    此时 b.mjs 尚未执行，bValue 处于 TDZ → ReferenceError！
```

**对比总结**：
- CJS 循环引用：不报错，但拿到未完成的"部分副本"，可能逻辑错误
- ESM 循环引用：通过 Live Binding 机制解决，但执行时机不当会触发 TDZ 错误

**最佳实践**：**避免循环引用**。在工程中，抽离共同依赖到第三个模块；在组件中，使用事件总线或依赖注入解耦。

### 4. Node.js 中启用 ESM

```json
// package.json
{ "type": "module" }
// 之后 .js 文件默认为 ESM，CJS 需用 .cjs
```

```bash
# 不修改 package.json：
# .mjs 始终是 ESM
# .cjs 始终是 CJS
node --input-type=module -e "import fs from 'fs'; console.log(fs)"
```

Node.js ESM 的限制和注意点——`__dirname`/`__filename` 不可用（用 `import.meta.url` + `fileURLToPath` 替代）、`require` 不可用（用动态 `import()` 替代）、JSON 文件不能用 `import` 直接导入（需用 assert 或 fs）。

## 项目实战

### 1. 在我们的组件库中验证 Tree Shaking

```bash
# 构建分析：检查哪个模块被意外全量打包
npx vite build --debug
# Rollup 会输出 "First-level this is the initial..." 等 Tree Shaking 日志

# 用 rollup-plugin-visualizer 可视化
npm install --save-dev rollup-plugin-visualizer
```

```ts
// vite.config.ts 中启用打包分析
import { visualizer } from "rollup-plugin-visualizer"
export default defineConfig({
  plugins: [
    visualizer({ open: true, gzipSize: true, brotliSize: true }),
  ],
})
```

### 2. `sideEffects` 在 monorepo 中的配置

```json
// packages/shared/package.json
{
  "sideEffects": ["**/*.css", "**/*.scss"],
  // shared 包的 CSS 文件有副作用（全局样式注入），不能被 Tree Shaking 删除
}
```

## 易错点

1. **以为 `import` 是解构赋值** -- 实际上 `import { foo }` 是类似解构的**语法**，但本质是 Live Binding 建立，不是对象解构。不能写成 `const { foo } = import("...")`
2. **ESM 中 `import` 被 hoist** -- 所有 import 声明会在模块代码执行前处理完毕，这是规范要求，也是 Tree Shaking 的基础
3. **`export default` 和命名导出混用的导入差异** -- `import foo from "x"` 拿到 default；`import * as foo from "x"` 拿到 Module Namespace Object，`foo.default` 才是默认导出
4. **CJS 中解构 `module.exports` 不能用 Tree Shaking** -- 因为解构发生在运行时，打包工具无法静态分析
5. **动态 import 的路径变量限制** -- `import(\`./components/\${name}.vue\`)` 中，模板字符串的前缀 `./components/` 必须是字面量，否则打包工具无法确定需要打包哪些文件

## 面试信号

当面试官问"CJS 和 ESM 的区别"，不要停留在"语法不同"——**抓住两条核心线**：

> "核心区别有两条线。第一条是**加载时机**：CJS 是运行时动态加载，`require` 是函数调用，可以在任何地方、以变量路径调用；ESM 是编译时静态加载，`import` 必须是顶层声明、路径必须是字面量。这一差异决定了 Tree Shaking 只能基于 ESM——打包工具必须在运行前就能确定完整的依赖图。
>
> 第二条是**导出语义**：CJS 导出的是值的拷贝——`module.exports = { count }` 把当前值快照到对象中，之后模块内部改变 `count` 不影响外部；ESM 导出的是值的引用（Live Binding）——`import { count }` 是在 `count` 变量上建立只读连接，模块内部修改后所有导入方都能看到最新值。"

## 相关阅读

- [Node / CommonJS / ESM](../工程化/Node/commonjs-esm.md) -- CJS 侧的完整分析（加载流程、互操作、条件导出、易错点）
- [Tree Shaking](./tree-shaking.md) -- Tree Shaking 的更多实践细节
- [Vite 深入](./vite-deep.md) -- ESM 在 Vite 中如何支撑"按需编译"
- [工程化 知识地图](./index.md)

## 更新记录

- 2026-07-06：Phase 3 深度填充（Live Binding vs 值拷贝 + Tree Shaking 原理 + sideEffects + 循环引用 ESM 侧表现 + Node.js ESM 启用 + 聚合导出语法）
