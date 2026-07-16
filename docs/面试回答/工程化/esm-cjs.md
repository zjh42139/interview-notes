---
title: ESM / CJS 模块化 面试回答
description: 面试中如何回答 ESM 和 CommonJS 的区别——静态 vs 动态、值拷贝 vs 值引用、Tree Shaking 前提
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 工程化
  - ESM
  - CommonJS
  - 模块化
  - 面试回答
---

# ESM / CJS 模块化 面试回答

> "为什么 Tree Shaking 必须用 ESM"的答案就在这道题里。两条线并行讲——编译时 vs 运行时、值拷贝 vs 值引用。

## Q1: ESM 和 CommonJS 有什么区别？

### 30 秒版本

"三个核心区别——加载时机（CJS 运行时动态/ESM 编译时静态）、输出方式（CJS 值拷贝/ESM 值引用）、作用域（CJS this 指向当前模块/ESM this 是 undefined）。ESM 的静态结构是 Tree Shaking 的前提——打包器在编译时就知道哪些导出没被使用。"

### 2 分钟版本

**区别一：加载时机。** CJS 的 `require()` 可以在 if/for/函数内部动态调用——运行时才知道加载什么。ESM 的 `import` 必须写在模块顶层——编译时静态分析依赖图。这就是为什么 Tree Shaking 必须用 ESM——CJS 的依赖在运行时才确定，打包器没法静态分析。

**区别二：输出方式。** CJS 输出值的拷贝——`module.exports = { count: 0 }` 后改了 count，导入方拿到的是拷贝不受影响。ESM 输出值的引用——改了 count，导入方实时看到变化。

```javascript
// CJS：值拷贝
// counter.cjs → let count = 0; module.exports = { count, add }
const { count, add } = require('./counter.cjs');
add(); console.log(count); // 0 —— 拷贝，不受影响

// ESM：值引用
// counter.mjs → export let count = 0; export function add() { count++ }
import { count, add } from './counter.mjs';
add(); console.log(count); // 1 —— 引用，实时同步
```

**区别三：this 指向。** CJS 模块顶层 this 指向当前模块的 exports 对象。ESM 模块顶层 this 是 undefined。

**互操作**：ESM 可以通过 `import` 加载 CJS 模块（Node.js 默认行为）。CJS 不能通过 `require` 加载 ESM——要用 `import()` 动态导入。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "为什么 Tree Shaking 必须 ESM" | CJS 的 require 和 module.exports 是动态的——打包器不知道哪个导出会被用到。ESM 的 import/export 是静态的——编译时就确定了依赖图，能标记未使用的导出做 DCE |
| "Node 怎么用 ESM" | .mjs 扩展名或 package.json 设 `"type": "module"`。之后 import/export 就是 ESM 语法，require 不可用 |
| "import 和 require 能混用吗" | ESM 可以用 `import` 加载 CJS 模块（Node 自动处理）。CJS 不能 `require` ESM——要用动态 `import()` |

## 别踩的坑

1. **"ESM 和 CJS 只是语法不同"** —— 加载时机和输出方式都不一样，不能互换。面试说这句话会被追问到翻车。
2. **CJS 的导出是值的拷贝** —— 面试官给的例子就是 counter 那个，必须答对。

## 相关阅读

- [Vite / Webpack](./vite-webpack.md)
- [Tree Shaking / HMR](./tree-shaking-hmr.md)

## 更新记录

- 2026-07-15：新建（三核心区别 + Tree Shaking 前提 + 值拷贝 vs 值引用实例）
