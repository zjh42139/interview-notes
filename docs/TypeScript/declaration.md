---
title: 声明文件 / declare
description: TypeScript 声明文件与 declare 关键字全解：.d.ts 文件编写、declare module/global 类型扩展、interface vs type 对比、项目中的实际应用
category: TypeScript
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
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

> ⭐⭐⭐⭐⭐｜难度：中高级

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

// declare global：扩展全局类型（只能写在模块里——文件需含顶层 import/export，见易错点 5）
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
// 1. .d.ts 顶层的 var/function/class 声明必须带 declare 或 export（否则报 TS1046）；
//    interface/type 可直接写；declare module / declare namespace 内部成员可省略 declare
// 2. 编译时只用于类型检查，不产生任何 JS 输出
// 3. @types/xxx 就是社区维护的三方库 .d.ts 文件集合

// .d.ts vs .ts 的本质区别
// .ts  → 编译成 .js，包含实现代码
// .d.ts → 仅类型检查，不产生输出，可以被其他文件引用类型
```

### interface vs type 在声明文件语境中

> interface vs type 的完整三区别对比（声明合并 / 表达能力 / extends 语法）见[基础类型 / 类型注解](./basic-types.md#5-interface-vs-type高频对比)。

在声明文件的语境中，**声明合并**是 interface 最不可替代的能力：

```ts
// .d.ts 中多个同名 interface 自动合并 —— type 做不到
// 这就是为什么第三方库的类型扩展必须用 interface
interface Window {
  __ADMIN_CONFIG__: { apiBaseUrl: string }
}
// 另一个 .d.ts 文件中可以继续扩展
interface Window {
  $message: (msg: string) => void
}
// 最终 Window 同时拥有 __ADMIN_CONFIG__ 和 $message
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
// 前提：该文件必须是模块（至少一个顶层 import/export），否则 declare module 'vue' 会整体覆盖原类型
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
    "typeRoots": ["./node_modules/@types", "./src/types"],  // 自动包含的类型包根目录（默认只有 node_modules/@types）
    "types": [],                                            // 白名单：只自动加载列出的类型包，[] 表示全都不自动加载
    // 注意：types 一旦设置，typeRoots 下未列出的包就不再自动包含
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]               // 自己的散装 .d.ts 靠 include 生效，而不是 typeRoots
}

// 查找规则：
// 1. import 按模块解析规则找 .ts / .d.ts（发包时 .d.ts 与 .js 同名配对）
// 2. typeRoots 下的每个子目录被当作一个类型包自动包含（需要 index.d.ts 入口）
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

export {}  // 关键：declare global 只能出现在模块中——export {} 把这个 .d.ts 标记为模块

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
5. **declare global / 模块增强所在文件不是模块** -- `declare global` 只能出现在模块中，文件没有任何顶层 import/export 时要补 `export {}`（否则报 TS2669）；同理 `declare module 'xxx'` 写在非模块文件里是"环境模块声明"，会整体覆盖原模块类型而不是增强

## 面试信号

面试官问"interface 和 type 有什么区别"时，你的回答骨架：
1. **声明合并**：interface 同名自动合并（扩展第三方类型的关键能力），type 不行
2. **表达能力**：type 能定义联合/交叉/映射类型，interface 只能描述对象形状
3. **extends 方式**：interface 用 `extends`，type 用 `&`
4. **实际选择**：描述对象形状用 interface，组合/工具类型用 type
5. **加分项**：提一句 `declare module` 的实际用法（为 Vue 插件/axios 扩展类型）

"能从声明合并、表达能力、extends 三个维度说清区别 + 讲出 declare module 的实际场景，面试官就知道你不是背八股文。"

## 相关阅读

- [基础类型 / 类型注解](./basic-types.md) 🆕 — interface vs type 完整对比
- [泛型](./generics.md) — 声明文件中的泛型类型声明
- [extends / infer](./extends-infer.md) — 条件类型与类型推断（interface 无法实现）
- [Utility Types](./utility-types.md) — 用 type 实现的工具类型
- [TypeScript 知识地图](./index.md)

## 更新记录

- 2026-07-06：初始创建，覆盖 declare 关键字 + .d.ts 文件 + interface vs type 三个核心区别 + declare module 四种实战场景
- 2026-07-18：事实审计——修正".d.ts 顶层可省略 declare"（TS1046 要求 declare/export）、typeRoots/types 注释矛盾、declare global 必须在模块中（示例补 export {}）、模块增强需模块文件的前提
