---
title: 声明文件 / declare 面试回答
description: 面试中如何回答声明文件和 declare——.d.ts 场景、declare module 扩展、declare global 实践
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - TypeScript
  - declare
  - .d.ts
  - 声明文件
  - 面试回答
---

# 声明文件 / declare 面试回答

> 考察 TypeScript 工程化能力——如何告诉 TS "这个东西存在但我没有它的实现代码"。

## Q1: 什么场景需要写 .d.ts？declare module / declare global 怎么用？

### 30 秒版本

".d.ts 是纯类型声明文件不含实现——给无类型的 JS 库补充类型、扩展现有模块的类型、声明非 JS 模块（.vue/.css）。declare module 为模块声明类型，declare global 扩展全局作用域（Window 加属性）。核心：declare 告诉 TS 运行时存在这个东西，编译后全部消失。"

### 2 分钟版本

**4 个核心场景**：

**场景 1：为无类型的 JS 项目/库补充类型**。第三方包没有 @types/xxx 时，在项目里写 `declare module 'my-lib'` 给它一个基本的类型骨架。

**场景 2：声明非 JS/TS 模块**。Vite 项目里导入 `.vue` 文件、`.scss` 文件——TS 不认识这些扩展名。用 `declare module '*.vue'` 让 TS 知道它们：

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

**场景 3：扩展第三方库的类型（Module Augmentation）**。axios 拦截器给 config 加了自定义字段 `showLoading`、`retryCount`，但 `AxiosRequestConfig` 类型里没有——用 `declare module 'axios'` 扩展：

```typescript
declare module 'axios' {
  interface AxiosRequestConfig {
    showLoading?: boolean;
    retryCount?: number;
  }
}
// 之后所有 axios 请求的 config.showLoading 都有类型提示
```

同样，为 Vue 的 ComponentCustomProperties 扩展全局挂载的属性（$message、$http 等）。

**场景 4：扩展全局作用域**。后台管理系统在 HTML 里通过后端模板注入 `window.__ADMIN_CONFIG__`，TS 不知道 Window 上有这个属性：

```typescript
declare global {
  interface Window {
    __ADMIN_CONFIG__: {
      apiBaseUrl: string;
      version: string;
      env: 'dev' | 'test' | 'prod';
    };
  }
}
```

**.d.ts vs .ts 的本质区别**：.d.ts 编译时只用于类型检查，不产生任何 JS 输出——类似 C 语言的 .h 头文件。.ts 编译成 .js 包含运行时代码。

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| ".d.ts 和 .ts 有什么区别" | .d.ts 只有类型声明没有实现——编译后不产生 JS 代码。.ts 包含实现——编译后产生 JS。类似 C 的头文件和源文件的关系 |
| "declare module 和 declare global 的区别" | declare module 扩展模块作用域——axios、vue 等有 import/export 的模块。declare global 扩展全局作用域——Window、Array、String 等没有 import/export 的全局对象 |
| "在 .ts 文件里写 declare global 不生效怎么办" | .ts 文件如果有 import/export 就是模块文件——需要 export {} 标记为模块，declare global 才生效。或者干脆放在 .d.ts 文件里——.d.ts 文件没有模块概念 |
| "declare module 能不能扩展已有模块" | 能——Module Augmentation。在同一份声明里不用 export，直接写要扩展的 interface 成员即可。这是 interface 声明合并能力最重要的应用场景 |
| "interface vs type 在声明文件里怎么选" | 声明文件里优先 interface——因为声明合并是 interface 独有的能力。多个 .d.ts 文件可以分散扩展同一个 interface，最终自动合并。type 不支持此能力 |

## 别踩的坑

1. **declare 不导出** —— `declare module 'xxx'` 里写了 `function foo()` 但没加 `export`，外部文件无法引用。显式加 export。

2. **.d.ts 里写了实现** —— 写了 `export function foo() { return 1 }` 编译直接报错。.d.ts 只能有 declare 语句，不能有实现。

3. **tsconfig include 没覆盖 .d.ts** —— 自定义类型目录写了声明文件但没在 tsconfig 的 include 里包含，结果不生效。确保 include 覆盖所有 .d.ts 路径。

## 相关阅读

- [声明文件 / declare](../../TypeScript/declaration.md)
- [基础类型 / 类型注解](../../TypeScript/basic-types.md) —— interface vs type 完整对比
- [tsconfig.json 配置](../../TypeScript/tsconfig.md)
- [泛型 / 工具类型](./generics-utility.md)

## 更新记录

- 2026-07-14：新建（.d.ts 四大场景 + declare module/global + Module Augmentation）
