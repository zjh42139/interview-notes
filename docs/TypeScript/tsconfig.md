---
title: tsconfig.json 配置
description: TypeScript 编译配置完全指南——strict 全家桶逐项解释、模块解析策略、路径别名配置、不同项目类型的推荐配置
category: TypeScript
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - tsconfig
  - strict
  - moduleResolution
  - paths
  - 模块解析
---

# tsconfig.json 配置

> ⭐⭐⭐｜难度：中级

## 一句话总结

**`tsconfig.json` 告诉 TypeScript 编译器三件事：代码在哪、编译到哪、检查多严。关键是理解 strict 全家桶每项子规则的意义、模块解析策略的选择、以及路径别名的配置——面试中被问到"项目的 TS 怎么配的"时，别只说"开了 strict"，要说清楚开了哪些子规则、为什么、以及模块解析在什么场景下影响什么行为。**

## 核心机制

### strict 全家桶：逐项拆解

`"strict": true` 本质是 **8 项子规则的快捷开关**：

```jsonc
{
  "compilerOptions": {
    "strict": true,  // 一行开启下面全部 8 项
  },
}
```

等价于：

```jsonc
{
  "compilerOptions": {
    "strictNullChecks": true,            // ①
    "noImplicitAny": true,               // ②
    "strictFunctionTypes": true,         // ③
    "strictBindCallApply": true,         // ④
    "strictPropertyInitialization": true,// ⑤
    "noImplicitThis": true,              // ⑥
    "alwaysStrict": true,                // ⑦
    "useUnknownInCatchVariables": true,  // ⑧
  },
}
```

逐项解释什么场景下会触发：

| # | 规则 | 做什么 | 什么场景触发 |
|---|------|--------|------------|
| ① | **strictNullChecks** | `null` 和 `undefined` 不是所有类型的子类型 | `let x: string = null;` 报错；DOM API 返回值可能为 `null` 时有提示 |
| ② | **noImplicitAny** | 类型推断不出时必须显式写出来 | 函数参数没写类型、回调函数参数没写类型 |
| ③ | **strictFunctionTypes** | 函数参数**逆变**（不允许收窄回调参数类型） | `(dog: Dog) => void` 赋给 `(animal: Animal) => void` 报错 |
| ④ | **strictBindCallApply** | `bind` / `call` / `apply` 参数类型检查 | `fn.call(wrongThis, wrongArg)` 报错 |
| ⑤ | **strictPropertyInitialization** | class 属性必须在构造器中赋值 | 声明了 `name: string` 但构造器中没赋值（或在构造器外声明） |
| ⑥ | **noImplicitThis** | 函数内 `this` 必须有明确类型 | standalone 函数中 `this.foo()`——TS 不知道 this 是什么类型 |
| ⑦ | **alwaysStrict** | 编译输出 `"use strict"`，ECMAScript strict 模式 | 影响运行时行为——禁止给未声明变量赋值、禁止删除变量等 |
| ⑧ | **useUnknownInCatchVariables** | `catch (e)` 中 `e` 默认是 `unknown` 而不是 `any` | `catch (e) { e.message }` 报错——必须先收窄类型 |

**逐步开启策略**：老项目从 JS 迁移时，不要一次性全开——建议顺序：②→①→⑧→⑤→③→④→⑥。每开一项修复一轮类型错误，确认通过后再开下一项。

### 模块解析（Module Resolution）

模块解析决定 TypeScript 如何找到 `import './foo'` 对应的文件：

```jsonc
{
  "compilerOptions": {
    "module": "ESNext",                    // 输出何种模块格式
    "moduleResolution": "bundler",         // 用什么策略解析模块路径
  },
}
```

| 策略 | 适用场景 | 行为 |
|------|---------|------|
| **classic** | 已废弃 | 从当前目录逐级向上找——和 Node.js 行为不一致 |
| **node** | Node.js CJS | 模拟 Node.js `require()` 解析：查 `node_modules`、查 `package.json` 的 `main` |
| **node16 / nodenext** | Node.js ESM | 完整模拟 Node.js ESM + CJS interop——要求 `.js` 扩展名、处理 `exports` 字段 |
| **bundler** | Vite/Webpack 等打包工具 | 跟 node 类似但不要求文件扩展名——打包工具会在构建时处理路径，不需要扩展名 |

**面试关键点**：`bundler` 是 Vite 项目的推荐配置——它不要求 `.js`/`.ts` 扩展名，因为打包器会帮你处理。`node16` 是 Node.js ESM 环境下的唯一正确选择——要求完整的文件扩展名和 `package.json` 的 `exports` 字段。

### 路径别名（paths）

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],         // import { foo } from '@/utils/foo'
      "@components/*": ["src/components/*"],
    },
    // "baseUrl": "." 是 paths 的前置条件
    // paths 中的路径是相对于 baseUrl 的
  },
}
```

**三处配合**：tsconfig 的 `paths` 只负责编译时类型检查。运行时还需要：

1. **Vite**：`vite.config.ts` 中 `resolve.alias` 对应 `@/` → `src/`
2. **Webpack**：`resolve.alias` 对应 `@/` → `src/`
3. **Vitest/Jest**：各自的配置文件中 `moduleNameMapper` 对应 `@/` → `src/`

面试时说"tsconfig 配了 paths"，一定要接一句"同时构建工具的 alias 也要配，否则编译能过但运行时报 module not found"。

### 其他高频配置项

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",             // 编译输出目标 JS 版本。ES2020 支持可选链+空值合并
    "lib": ["ES2020", "DOM"],       // 可用的内置类型声明。通常跟 target 一致+DOM 类型
    "outDir": "./dist",             // 输出目录
    "rootDir": "./src",             // 源码根目录——决定输出目录结构
    "allowJs": true,                // 允许编译 JS 文件（迁移阶段开启）
    "declaration": true,            // 生成 .d.ts 声明文件（库项目开启）
    "declarationDir": "./dist/types", // 声明文件输出目录
    "sourceMap": true,              // 生成 .map 文件——Debug 和错误追踪需要
    "skipLibCheck": true,           // 跳过 .d.ts 文件检查——大幅提升编译速度
    "esModuleInterop": true,        // 允许 default import CJS 模块
    "forceConsistentCasingInFileNames": true, // 文件名大小写一致——防止跨平台问题
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"],  // 哪些文件需要编译
  "exclude": ["node_modules", "dist"],           // 哪些文件排除
}
```

## 深度拓展

### 追问 1：esModuleInterop 和 allowSyntheticDefaultImports

```typescript
// CJS 模块导出
// lib.js → module.exports = { foo: 42 }

// 没有 esModuleInterop 时：
import * as lib from './lib';   // ✅
import lib from './lib';         // ❌ 编译报错

// 开启 esModuleInterop 后：
import lib from './lib';         // ✅ 编译器自动加 __importDefault helper
// 同时允许 .d.ts 中用 export default 描述 CJS 导出
```

面试话术："esModuleInterop 让 CJS 模块的默认导入行为跟 ESM 一致——开启后编译器自动注入一个 `__importDefault` 辅助函数。"

### 追问 2：skipLibCheck 为什么要开

`skipLibCheck: true` 跳过所有 `.d.ts` 文件的类型检查。这不是偷懒——社区库的类型文件有时包含不兼容的类型定义（两个库声明了同一个全局类型），这些错误不影响你的代码。开启后编译速度可以提升 50-70%。代价是自定义 `.d.ts` 的类型错误也会被跳过——如果项目有大量自定义声明文件需要检查，考虑关掉 `skipLibCheck` 或将类型放在 `.ts` 文件中。

### 追问 3：项目类型的配置差异

```jsonc
// ① Vue3 应用项目（当前项目使用）
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",   // Vite 是打包器
    "strict": true,
    "jsx": "preserve",              // 让 Vite 处理 JSX
    "paths": { "@/*": ["src/*"] },
    "skipLibCheck": true,
  },
}

// ② Node.js 库/CLI 项目
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "node16",
    "moduleResolution": "node16",    // Node.js ESM
    "strict": true,
    "declaration": true,             // 生成 .d.ts
    "declarationDir": "./dist/types",
    "outDir": "./dist",
  },
}

// ③ JS→TS 迁移中的项目
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,                 // 先不开启
    "noImplicitAny": false,          // 先不开启
    "allowJs": true,                 // 混合 JS 和 TS
    "checkJs": false,                // 不检查 JS 文件
    "outDir": "./dist",
  },
}
```

## 项目实战

### Vue3 后台管理系统的 tsconfig（参考当前项目）

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
    },
    "types": ["vite/client", "element-plus/global"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,     // 禁止未使用的局部变量
    "noUnusedParameters": true,  // 禁止未使用的参数
    "noFallthroughCasesInSwitch": true, // 禁止 switch 穿透
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"],
}
```

面试时描述你的 tsconfig："strict 全开（8 项子规则全覆盖）、moduleResolution: bundler 适配 Vite、paths 别名配合 vite alias、noUnusedLocals + noUnusedParameters 保持代码干净。"

## 易错点

❌ **只配 tsconfig paths 不配构建工具 alias**：编译能过，运行时 `module not found`——两端各改一端，最常踩的坑。

❌ **moduleResolution 跟 module 不匹配**：`module: ESNext` 但 `moduleResolution: node`——此时编译器用 CJS 策略解析 ESM 导入，行为不一致，可能遗漏报错。

❌ **skipLibCheck 后引入不兼容的类型定义**：`skipLibCheck` 跳过所有 `.d.ts` 检查，如果你的自定义 `.d.ts` 有错误也会被跳过——把自己的声明文件放在单独的目录下确保不被跳过。

❌ **strict: true 后新增的规则会自动开启**：TS 新版本可能给 `strict` 添加新的子规则——升级 TS 版本后突然多了类型错误，通常是新规则导致的。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "项目 TS 怎么配的" | 追问 strict 开了哪些子规则、为什么开 |
| "模块解析策略怎么选" | 追问 bundler 不加文件扩展名、node16 必须加 |
| "路径别名配了为什么还报错" | 追问 tsconfig paths 和构建工具 alias 要同时配 |
| "tsconfig 中 include/exclude 的区别" | 追问 include 指定编译范围、exclude 排除子集 |

## 相关阅读

- [TypeScript Handbook: tsconfig.json](https://www.typescriptlang.org/tsconfig/)
- [TypeScript Handbook: Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [声明文件 / declare](./declaration.md) —— declaration/declarationDir 与 .d.ts 的关系
- [Vue3 + TS 最佳实践](./vue3-ts-practice.md) —— 在 Vite 项目中 tsconfig 如何配合
- [工程化](../工程化/) —— 构建工具侧的配置对应

## 更新记录

- 2026-07-14：新建——strict 8 项逐项解释 + 模块解析策略对比 + paths+alias 三处配合 + 三种项目类型推荐配置
