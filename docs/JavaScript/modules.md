---
title: "JS 模块化（ESM / CommonJS）"
description: ESM 与 CommonJS 核心区别——静态 vs 动态、值拷贝 vs 值引用、循环引用行为差异、Tree Shaking 前提
category: JavaScript
type: mechanism
score: 80
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - ESM
  - CommonJS
  - 模块化
  - Tree Shaking
---

# JS 模块化（ESM / CommonJS）

> ⭐⭐⭐⭐⭐｜难度：中级｜工程化基础

## 一句话总结

**CJS 运行时加载、值拷贝、同步；ESM 编译时加载、值引用、支持异步。ESM 的静态结构是 Tree Shaking 的前提——打包器在编译时就能分析哪些导出被使用。**

## 核心机制

### CommonJS —— Node.js 的默认模块系统

```javascript
// 导出：module.exports 和 exports 的关系
// exports 是 module.exports 的引用
module.exports = { name: 'foo' };       // ✅ 替换整个导出
exports.name = 'foo';                    // ✅ 给导出对象加属性
// exports = { name: 'foo' };           // ❌ 切断引用，无效

// 导入：require 是同步的，返回 module.exports 的值拷贝
const { name } = require('./foo');      // name 是值的拷贝

// 动态特性：require 可以在任何地方调用
if (condition) {
  const mod = require('./dynamic');     // 运行时才知道加载什么
}

// 缓存：模块只执行一次，结果缓存
require('./foo'); // 第一次执行并缓存
require('./foo'); // 直接返回缓存
```

**CJS 的循环引用行为**：a.js require b.js → b.js require a.js 时 a.js 返回**已执行部分**的 exports（可能不完整）。CJS 靠缓存机制避免死循环——但可能导致拿到半成品的模块。

### ESM —— ES2015 标准模块系统

```javascript
// 导出：命名导出和默认导出
export const name = 'foo';              // 命名导出
export default function() {};           // 默认导出
export { name as alias };               // 重命名导出

// 导入：import 必须写在顶层，编译时静态分析
import { name } from './foo.js';        // 命名导入
import fn from './foo.js';              // 默认导入
import * as mod from './foo.js';        // 命名空间导入

// 动态导入：import() 返回 Promise，运行时按需加载
const mod = await import('./dynamic.js');

// 值引用：导入的是值的引用——改了会同步
// counter.js: export let count = 0; export function add() { count++ }
// main.js: import { count, add } from './counter.js';
//          add(); console.log(count); // 1 —— 引用，实时同步
```

**ESM 的循环引用行为**：ESM 通过"绑定"解决循环引用——import 拿到的是值的引用而非拷贝。a.mjs import b.mjs → b.mjs import a.mjs 时 a.mjs 还未执行完，但 import 绑定的是引用，a.mjs 执行完后 b.mjs 能拿到最终值。

### CJS vs ESM 核心区别

| | CJS | ESM |
|---|------|-----|
| 加载时机 | 运行时动态 `require()` | 编译时静态 `import` |
| 输出方式 | 值拷贝 | 值引用（live binding） |
| 加载方式 | 同步（阻塞） | 异步（不阻塞） |
| this 指向 | 当前模块 | undefined |
| 循环引用 | 返回半成品 | 绑定引用——不丢 |
| Tree Shaking | ❌ 不支持 | ✅ 支持 |
| 使用场景 | Node.js 默认 | 浏览器 + 现代 Node（.mjs） |

### 为什么 Tree Shaking 必须用 ESM？

CJS 的 `require()` 和 `module.exports` 是动态的——可以在 if/for 里调用、可以动态拼接路径、可以用变量替换导入。打包器无法在构建时确定"哪些导出被用到了"。

ESM 的 `import` 和 `export` 必须写在模块顶层，不能嵌套在条件/循环中。打包器可以静态分析整个依赖图，标记未被引用的导出为 dead code，在压缩阶段删除——这就是 Tree Shaking 的前提条件。

## 深度拓展

### Node.js 中 CJS 和 ESM 互操作

```javascript
// ESM 加载 CJS：可以
import cjsModule from './legacy.cjs';
// Node 将 module.exports 映射为 default export

// CJS 加载 ESM：不能直接用 require
// require('./modern.mjs'); // ❌ Error
// 必须用动态 import()
const esmModule = await import('./modern.mjs');
```

### package.json 的 type 字段

```json
// "type": "module" → .js 文件被解释为 ESM
// "type": "commonjs"（默认）→ .js 文件被解释为 CJS
// .mjs 强制 ESM，.cjs 强制 CJS——不受 type 影响
```

## 易错点

❌ **ESM 和 CJS 只是语法不同** —— 加载时机（静态/动态）和输出方式（拷贝/引用）完全不同，不是语法糖关系。

❌ **`exports = {}` 期望替换整个导出** —— CJS 的 exports 只是 module.exports 的引用。直接赋值 exports 切断引用，外部拿不到。用 `module.exports` 替换。

❌ **CJS 中 `import()` 是同步的** —— `import()` 是 ESM 提供的动态导入，返回 Promise，CJS 文件中也可以使用（Node 13+）。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "ESM 和 CJS 有什么区别" | 追问值拷贝 vs 值引用——"举例说明" |
| "为什么 Tree Shaking 必须 ESM" | 追问静态分析 vs 动态加载 |
| "CJS 循环引用会怎样" | 追问"ESM 循环引用和 CJS 有什么不同" |
| "Node 怎么用 ESM" | 追问 .mjs / package.json type / 互操作 |

## 相关阅读

- [工程化：ESM / CJS 面试回答](../面试回答/工程化/esm-cjs.md) 🎤
- [工程化：Tree Shaking](../工程化/tree-shaking.md)

## 更新记录

- 2026-07-16：新建——CJS/ESM 三区别 + 循环引用差异 + Tree Shaking 前提 + Node 互操作
