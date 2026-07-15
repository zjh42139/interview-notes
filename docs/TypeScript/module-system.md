---
title: TS 模块系统
description: TypeScript 模块解析策略、ESM/CJS interop、moduleResolution 选型、import type、.mts/.cts
category: TypeScript
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - moduleResolution
  - ESM
  - CJS
  - import type
---

# TS 模块系统

> ⭐⭐⭐⭐｜难度：中级｜模块解析决定 TS 怎么找到你的 import

## 一句话总结

**`moduleResolution` 决定 TS 按什么规则找模块——有 node/bundler/node16 三种策略。`import type` 让类型导入编译后消失——避免循环依赖和安全地做 Tree Shaking。`.mts`/`.cts` 是 ESM/CJS 的 TS 对应物。**

## 核心机制

### moduleResolution 三种策略

| 策略 | 适用场景 | 行为 |
|------|---------|------|
| **bundler** | Vite/Webpack | 和 node 类似但不要求文件扩展名——打包器会处理路径 |
| **node16/nodenext** | Node.js ESM | 完整模拟 Node.js ESM+CJS interop，要求扩展名 |
| **node** | 旧 Node CJS | 模拟 require() 查找——不支持 exports 字段 |

**面试关键**：Vite 项目用 `bundler`——不要求 `.js`/`.ts` 扩展名，打包器会处理。Node 原生 ESM 项目用 `node16`——要求完整扩展名和 `package.json` exports 字段。选错了——TS 的行为和运行时不一致，编译能过运行报 `module not found`。

### import type —— 类型导入

```typescript
// 普通 import：值和类型都导入——编译后保留 import 语句
import { User, getUser } from './user';

// import type：只导入类型——编译后完全消失
import type { User } from './user';

// 混合导入（TS 4.5+）
import { getUser, type User } from './user';
```

**为什么用 import type？**
1. 避免循环依赖——A.ts import B.ts，B.ts import type from A.ts（类型关系不产生运行时依赖）
2. Tree Shaking——打包器能明确知道哪些导入是类型（可以删），哪些是值（需要保留）
3. `isolatedModules` 要求——Babel/esbuild 等单文件转译器需要显式标记类型导入

### ESM/CJS Interop

```json
// tsconfig.json 关键配置
{
  "compilerOptions": {
    "module": "ESNext",          // 输出什么模块格式
    "moduleResolution": "bundler", // 用什么策略解析
    "esModuleInterop": true,       // 允许 import CJS 模块时用默认导入
    "allowSyntheticDefaultImports": true, // 允许写 import React from 'react'
  }
}
```

**esModuleInterop**：CJS 的 `module.exports` 不是 ESM 的 `export default`。开启后 TS 自动注入 `__importDefault` helper——`import React from 'react'` 能正确拿到 CJS 的导出。

### .mts / .cts 扩展名

- `.mts` → 强制 ESM → 编译为 `.mjs`
- `.cts` → 强制 CJS → 编译为 `.cjs`
- 不受 `package.json` 的 `type` 字段影响

## 深度拓展

### 路径别名三处同步

```json
// tsconfig.json — 编译时类型检查
{ "paths": { "@/*": ["src/*"] } }

// vite.config.js — 构建时路径解析
// resolve: { alias: { '@': '/src' } }

// package.json 或 jest.config — 测试时
// moduleNameMapper: { '@/(.*)': '<rootDir>/src/$1' }
```

三处不改同步——"编译能过，运行报错 module not found"。

## 易错点

❌ **moduleResolution 和 module 不匹配** —— `module: ESNext` 但 `moduleResolution: node`——用 CJS 策略找 ESM 模块，行为不一致。

❌ **普通 import 导入了只用于类型的值** —— 运行时 import 会保留——可能造成循环依赖。类型专用的用 `import type`。

❌ **`esModuleInterop` 默认 false** —— 新项目 `tsc --init` 不会自动开启。手动设为 true——否则 `import React from 'react'` 报错。

## 相关阅读

- [tsconfig.json 配置](./tsconfig.md)
- [声明文件 / declare](./declaration.md)
- [JS 模块化（ESM / CommonJS）](../JavaScript/modules.md)

## 更新记录

- 2026-07-16：新建——moduleResolution 三策略+import type+esModuleInterop+.mts/.cts
