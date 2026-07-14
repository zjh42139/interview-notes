---
title: Vue3 + TypeScript 最佳实践 面试回答
description: 面试中如何回答 Vue3 + TS 最佳实践——defineProps/defineEmits 泛型、ref/reactive 推导、InjectionKey、Pinia Store 类型、composable 标注
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - TypeScript
  - Vue3
  - 最佳实践
  - defineProps
  - Pinia
  - 面试回答
---

# Vue3 + TypeScript 最佳实践 面试回答

> 考察在真实项目中将 TS 与 Vue3 深度整合的能力。面试官要的不是语法列表，而是"你在项目里具体怎么用的"。

## Q1: Vue3 + TS 项目中，你有哪些最佳实践？

### 30 秒版本

"五个入口——props 用 `defineProps&lt;T>()` 泛型、emits 用 `defineEmits&lt;T>()` 函数签名、ref 显式泛型避免 `Ref&lt;null>`、provide/inject 用 `InjectionKey&lt;T>` 保证类型安全、Pinia setup store 自动推导类型。再加上 composable 显式标注返回类型、strict 全开、any 替换为 unknown。关键是每一点我都能说出为什么这样做。"

### 2 分钟版本

**1. defineProps&lt;T>()** —— 传一个 interface 给泛型，比运行时声明 `defineProps({ name: String })` 强在能处理复杂类型（联合类型、泛型接口）。需要默认值时用 `withDefaults(defineProps&lt;Props>(), { ... })`——默认值消除 `undefined`。

**2. defineEmits&lt;T>()** —— 3.3+ 用函数签名语法，每个重载精确描述事件名和参数类型。emit 时参数类型不匹配立即编译报错——比字符串声明安全一个量级。

**3. ref 显式泛型** —— `const user = ref(null)` TS 推断为 `Ref&lt;null>`，后续赋值 `user.value = { ... }` 报错。解决：`const user = ref&lt;User | null>(null)`。template ref 同理：`const formRef = ref&lt;FormInstance>()`。

**4. InjectionKey&lt;T>** —— 不用 InjectionKey 时 provide 端给 string，inject 端拿到 unknown——类型联系彻底断裂。用 `const KEY: InjectionKey&lt;Ref&lt;User>> = Symbol('user')` 保证两端类型同步。项目中所有 provide/inject 的 Key 集中在一个 `injection-keys.ts` 文件管理。

**5. Pinia setup store** —— setup 语法下 ref/computed 自动推导，defineStore 自动提取返回类型。组件中 `useUserStore()` 后所有属性都有完整类型——不需要任何手动标注。

**6. composable 返回类型** —— composable 内部变量让 TS 自动推断，**返回类型必须显式标注**（`UseRequestReturn&lt;T>`）。调用方一眼看到返回什么类型，不用读代码推断。

**7. strict 逐步开启**。按顺序：noImplicitAny → strictNullChecks → useUnknownInCatchVariables → strictFunctionTypes。每开一项修复一轮，确认通过再开下一项。项目里 strict 全开后，运行时 bug 减少了至少 50%。

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "defineProps 泛型和运行时声明怎么选" | Vue3 项目统一用泛型 `defineProps&lt;Props>()`。运行时声明 `defineProps({ name: String })` 是 Vue2 的包袱——复杂类型（泛型接口、联合类型）无法表达。只有一种情况用运行时声明：需要 Vue 级别的 prop 验证（validator）时 |
| "为什么要用 InjectionKey" | 不用 InjectionKey，provide/inject 的类型联系是断的。提供端给 `Ref&lt;User>`，注入端拿到 `unknown`，必须手动 as 断言。InjectionKey 是唯一保证两端类型一致的机制——改了 provide 的类型，inject 端自动同步报错 |
| "Pinia store 类型需要手动写吗" | setup store 不需要——defineStore 自动从 setup 返回值提取类型。option store 需要手动写。推荐 setup store——代码更少、类型推导更完整、组合逻辑更自然 |
| "any 在 Vue3 项目中怎么处理" | 能不用就不用。API 响应用泛型约束——`request.get&lt;ApiResponse&lt;User>>()`。catch 用 unknown——`catch (error: unknown)` 然后类型收窄。第三方库没类型用 declare module——声明一次全局受益 |

## 别踩的坑

1. **`defineProps` 泛型不能配合 validator** —— `defineProps&lt;T>()` 是纯类型语法，不支持 Vue 的运行时 prop 验证。需要 validator 时退回运行时声明或直接在组件内手动验证。

2. **reactive 不接受原始类型** —— `const n = reactive(1)` 直接报错。原始类型用 ref，对象用 reactive 或 ref（ref 内部对对象走 reactive）。

3. **ref 不显式泛型导致 `Ref&lt;null>`** —— 忘记写 `ref&lt;User | null>(null)` 而写 `ref(null)`，后续赋值报错。养成习惯：ref 初始值为 null 时必写泛型。

4. **composable 不标注返回类型** —— 调用方每次都要 hover 看类型，可读性差。显式写 `interface UseXxxReturn { ... }` 作为返回类型。

## 相关阅读

- [Vue3 + TS 最佳实践](../../TypeScript/vue3-ts-practice.md)
- [泛型 / 工具类型](./generics-utility.md)
- [泛型](../../TypeScript/generics.md)
- [tsconfig.json 配置](../../TypeScript/tsconfig.md)

## 更新记录

- 2026-07-14：新建（defineProps/Emits 类型 + ref 推导 + InjectionKey + Pinia + composable + strict 策略）
