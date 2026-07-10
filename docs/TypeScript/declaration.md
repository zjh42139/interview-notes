---
title: 声明文件 / declare
description: TypeScript 声明文件与 declare 关键字全解：.d.ts 文件编写、declare module/global 类型扩展、interface vs type 对比、项目中的实际应用
category: TypeScript
type: mechanism
score: 0
difficulty: 中高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - declare
  - .d.ts
  - interface vs type
  - namespace
  - 声明文件
  - 类型扩展
---

# 声明文件 / declare

> ⭐⭐⭐⭐⭐｜难度：中高级｜项目：★★★★

**面试官问"interface 和 type 有什么区别"，80% 的人只能说"interface 能 extends"，然后卡住。** 声明文件是 TypeScript 工程化的基石——能让 JS 库有类型提示、能为 Vue 插件扩展类型、能让 `window.__ADMIN_CONFIG__` 有智能提示。今天把 declare 全家桶和 interface vs type 三个核心区别讲透。

## 一句话总结

**declare 关键字告诉 TypeScript"这个东西存在但不是我写的"；.d.ts 文件是纯类型声明文件不含实现；interface 能声明合并、type 能定义联合/交叉/映射类型——二者各有所长，描述对象形状用 interface，组合/工具类型用 type。**

## 核心机制

### declare 关键字：告诉编译器"它存在"

```ts
// declare 的核心语义：声明一个存在于运行时的东西的类型，但不生成任何 JS 代码
// 编译后 declare 语句全部消失

// declare var / function / class
declare var jQuery: (selector: string) => any
declare function getConfig(key: string): string
declare class Animal { name: string; eat(): void }

// declare module：为非 TS 模块声明类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare module '*.css' { const content: Record<string, string>; export default content }
// declare module '*.scss' { const content: Record<string, string>; export default content }

// declare global：扩展全局类型
declare global {
  interface Window {
    __ADMIN_CONFIG__: { apiBaseUrl: string; version: string }
    $message: (msg: string) => void
  }
}
```

### .d.ts 文件：只有类型，没有实现

```ts
// src/types/global.d.ts —— 典型声明文件结构
// 1. .d.ts 文件中写 declare 可以省略 declare 关键字（顶层声明自动 ambient）
// 2. 编译时只用于类型检查，不产生任何 JS 输出
// 3. @types/xxx 就是社区维护的三方库 .d.ts 文件集合

// .d.ts vs .ts 的本质区别
// .ts  → 编译成 .js，包含实现代码
// .d.ts → 仅类型检查，不产生输出，可以被其他文件引用类型
```

### interface vs type（高频对比）

这是 TypeScript 面试中最高频的问题之一。只有说清楚以下三个核心区别才算过关：

```ts
// 区别一：声明合并 —— interface 可以，type 不行
interface User { name: string }
interface User { age: number }             // 自动合并：User = { name: string; age: number }
// 这在扩展第三方库类型时极其有用

// type User = { name: string }
// type User = { age: number }             // ❌ 报错：Duplicate identifier

// 区别二：type 可以定义联合/交叉/映射类型，interface 只能描述对象形状
type Status = 'pending' | 'success' | 'error'           // 联合类型
type Response<T> = { data: T } & { code: number }        // 交叉类型
type Readonly<T> = { readonly [K in keyof T]: T[K] }     // 映射类型
// interface 都做不到

// 区别三：extends 方式不同
interface Admin extends User { role: string }            // interface 用 extends
type Admin = User & { role: string }                     // type 用 & 交叉

// 推荐实践：
// 描述对象形状 → interface（声明合并 + extends 语义清晰）
// 联合/交叉/映射/工具类型 → type（type 原生能力）
```

## 深度拓展

### namespace：了解即可

```ts
// namespace 将相关类型组织在一起，现代项目用 ES Module 替代
// 但在 .d.ts 中仍有使用场景（声明大型库的类型）
declare namespace MyLib {
  interface Config { debug: boolean }
  function init(config: Config): void
}
// MyLib.init({ debug: true })

// 现代替代方案：直接用 ES Module 的 import/export
// namespace 面试中知道有这个东西、知道在 .d.ts 里还有用就够了
```

### declare module 的实际场景（重点）

```ts
// 场景 1：为 Vue 插件扩展组件实例类型
// 如 Element Plus 的 $message 挂载到 app.config.globalProperties
declare module 'vue' {
  interface ComponentCustomProperties {
    $message: (options: { type: string; message: string }) => void
    $confirm: (msg: string) => Promise<void>
  }
}

// 场景 2：为 axios 实例扩展 $http 全局类型
// 项目中封装了 axios 实例，挂载到 window 上
declare global {
  interface Window {
    $http: import('axios').AxiosInstance
  }
}
// window.$http.get('/api/users')  // 有完整的类型提示

// 场景 3：扩展已有的 npm 包类型（模块增强）
// axios 的请求拦截器给 config 加了自定义字段
declare module 'axios' {
  interface AxiosRequestConfig {
    showLoading?: boolean           // 扩展字段：是否显示 loading
    retryCount?: number             // 扩展字段：重试次数
  }
}

// 场景 4：声明没有 @types 的第三方库
declare module 'my-internal-lib' {
  export function doSomething(x: number): string
}
```

### 声明文件查找与 tsconfig 配置

```ts
// tsconfig.json 中的关键配置
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"],  // 声明文件查找路径
    "types": [],                                            // 只加载指定的 @types 包
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]               // .d.ts 需要被 include 覆盖
}

// 查找规则：
// 1. 先在同级目录找 .d.ts
// 2. 再在 typeRoots 下找
// 3. node_modules/@types 是默认的 typeRoots
```

## 项目实战

### 1. 为 window.__ADMIN_CONFIG__ 扩展 Window 类型

```ts
// src/types/global.d.ts
// 后台管理系统在 HTML 里通过后端模板注入配置：
// <script>window.__ADMIN_CONFIG__ = { apiBaseUrl: '/api', version: '2.3.1' }</script>

declare global {
  interface Window {
    __ADMIN_CONFIG__: {
      apiBaseUrl: string
      version: string
      env: 'dev' | 'test' | 'prod'
      featureFlags?: Record<string, boolean>
    }
  }
}

// 使用时有完整的类型提示和校验
const config = window.__ADMIN_CONFIG__
console.log(config.apiBaseUrl)           // 有智能提示
// console.log(config.xxx)               // ❌ 类型报错
```

### 2. 为 axios 增强请求配置

```ts
// src/types/axios.d.ts
import type { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean                   // 跳过 token 注入
    showLoading?: boolean                // 是否显示全局 loading
    errorMessage?: string                // 自定义错误提示
  }
}

// 使用时
axios.get('/api/data', { skipAuth: true, showLoading: false })
// skipAuth 和 showLoading 都有完整类型提示
```

### 3. 声明 Vue 组件的自定义属性

```ts
// 为 router-link 的自定义属性声明类型
declare module 'vue' {
  interface ComponentCustomProperties {
    $router: import('vue-router').Router
    $route: import('vue-router').RouteLocationNormalized
  }
}
```

## 易错点

1. **interface 和 type 混用不当** -- 描述对象形状用 interface（能声明合并），定义联合/交叉/映射类型用 type；不要所有地方都只用 type
2. **.d.ts 里写了实现** -- .d.ts 文件只能有声明，不能有实现代码；写了 `export function foo() {}` 会编译报错
3. **declare module 未声明导出** -- `declare module 'xxx'` 里如果不 export，外部文件无法引用
4. **忽略声明文件的 include** -- tsconfig 的 `include` 没有覆盖 `.d.ts` 文件路径，导致声明不生效
5. **declare global 未放在 .d.ts 中或未使用 export {}** -- 在 .ts 文件中写 `declare global`，模块化文件需要 `export {}` 标记为模块才能使用 global 增强

## 面试信号

面试官问"interface 和 type 有什么区别"时，你的回答骨架：
1. **声明合并**：interface 同名自动合并（扩展第三方类型的关键能力），type 不行
2. **表达能力**：type 能定义联合/交叉/映射类型，interface 只能描述对象形状
3. **extends 方式**：interface 用 `extends`，type 用 `&`
4. **实际选择**：描述对象形状用 interface，组合/工具类型用 type
5. **加分项**：提一句 `declare module` 的实际用法（为 Vue 插件/axios 扩展类型）

"能从声明合并、表达能力、extends 三个维度说清区别 + 讲出 declare module 的实际场景，面试官就知道你不是背八股文。"

## 相关阅读

- [泛型](./generics.md) — 声明文件中的泛型类型声明
- [extends / infer](./extends-infer.md) — 条件类型与类型推断（interface 无法实现）
- [Utility Types](./utility-types.md) — 用 type 实现的工具类型
- [TypeScript 知识地图](./index.md)

## 更新记录

- 2026-07-06：初始创建，覆盖 declare 关键字 + .d.ts 文件 + interface vs type 三个核心区别 + declare module 四种实战场景
