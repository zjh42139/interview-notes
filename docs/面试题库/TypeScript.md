---
title: TypeScript 高频面试题
category: 面试题库
type: interview
score: 0
difficulty: 中级
status: reviewed
tags:
  - TypeScript
  - 泛型
  - Utility Types
  - 类型体操


---
# TypeScript 高频面试题

> 收录前端面试中的高频 TypeScript 真题
> 题目按出现频率从高到低排列。

---

### Q1: 泛型的使用场景与实践
> 🏷️ 概念题
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：什么是泛型？请举出在项目中至少 3 个泛型的使用场景，并写出示例代码。如何约束泛型的范围？

**考察点**：
- 泛型本质：类型参数化，延迟到使用时确定类型
- `extends` 约束（generic constraints）
- 实际场景：axios 响应包装类型、表格列定义、通用组件的 props 类型
- `Partial<T>` / `Record<K, V>` 等内置工具类型的泛型应用
- 函数、接口、类的泛型定义

> 答案参考：[../TypeScript/generics.md](../TypeScript/generics.md)
> 🎤 回答稿：[../面试回答/TypeScript/generics-utility.md](../面试回答/TypeScript/generics-utility.md)

---

### Q2: Utility Types 实现原理
> 🏷️ 手写题
> ⭐⭐⭐⭐⭐ | 难度：中高级

**题目**：请手写实现 `Partial`、`Required`、`Readonly`、`Pick`、`Omit`、`Record`、`Exclude`、`Extract`、`ReturnType`，并说明它们之间的关系。

**考察点**：
- `keyof` 获取对象所有 key 的联合类型
- 映射类型 `[K in keyof T]` 遍历
- 条件类型 `T extends U ? X : Y`
- `infer` 推断类型变量
- `Omit<T, K>` 可以用 `Pick<T, Exclude<keyof T, K>>` 实现

> 答案参考：[../TypeScript/utility-types.md](../TypeScript/utility-types.md)
> 延伸：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)

---

### Q3: any / unknown / never 的区别
> 🏷️ 对比题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：请详细对比 `any`、`unknown`、`never` 三种类型。各自的使用场景是什么？为什么应该尽量避免使用 `any`？

**考察点**：
- `any` 放弃类型检查（传染性），可赋值给任意类型，可从任意类型赋值
- `unknown` 安全版本的 `any`：只能赋值给 `unknown` 和 `any`，使用前必须类型收窄
- `never` 表示永远不存在的类型：函数永不返回、类型收窄到的空集
- `never` 在条件类型分发中的作用
- 项目中使用 `unknown` 替代 `any` 处理第三方数据

> 答案参考：[../TypeScript/any-unknown-never.md](../TypeScript/any-unknown-never.md)

---

### Q4: extends 和 infer 详解
> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中高级

**题目**：`extends` 在 TypeScript 中有哪些用法？`infer` 关键字的作用是什么？请用 `infer` 实现一个获取函数参数类型的工具类型。

**考察点**：
- `extends` 的三种含义：接口继承、泛型约束、条件类型
- 条件类型中的分发行为（distributive conditional types）
- `infer` 只能在条件类型的 `extends` 子句中使用
- 用 `infer` 实现 `Parameters<T>`、`ReturnType<T>`、`InstanceType<T>`
- `infer` + 协变/逆变位置的行为差异

> 答案参考：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---

### Q5: satisfies 关键字的用法
> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：TypeScript 4.9 引入的 `satisfies` 关键字解决了什么问题？与类型标注（`: Type`）和 `as` 断言有什么区别？

**考察点**：
- `satisfies` 既检查类型兼容，又保留最精确的类型推导
- 与 `: Type` 对比：不会丢失字面量类型信息
- 与 `as` 对比：不会绕过类型检查
- 典型场景：`Record<string, RGB>` 用 `satisfies` 同时检查键值约束并保留字面量
- 在常量对象（`as const` + `satisfies`）中的组合使用

> 答案参考：[../TypeScript/satisfies.md](../TypeScript/satisfies.md)

---

### Q6: keyof + 映射类型 + 条件类型
> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中高级

**题目**：`keyof`、映射类型（Mapped Types）和条件类型（Conditional Types）分别是什么？它们如何组合使用？请实现一个类型工具：选出对象中值为特定类型的 key。

**考察点**：
- `keyof T` 返回对象所有 key 的联合类型
- 映射类型 `[K in Keys]: NewType` 逐个转换属性
- 条件类型配合 `never` 过滤属性
- `as` 子句在映射类型中重新映射 key
- 组合示例：`{ [K in keyof T as T[K] extends U ? K : never]: T[K] }`

> 答案参考：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)
> 延伸：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---


### Q8: 类型体操基础
> 🏷️ 手写题
> ⭐⭐⭐ | 难度：中高级

**题目**：请实现 `DeepReadonly<T>` 和 `DeepPartial<T>`，递归地处理嵌套对象。并实现一个 `MyExclude<T, U>`。

**考察点**：
- 递归条件类型的写法
- 映射类型递归遍历嵌套对象
- 条件类型分发中 `never` 的处理（用元组 `[T]` 包裹防止分发）
- `infer` + 模板字面量类型（Template Literal Types）
- 实际应用：表单配置类型的深度只读、API 响应的深度 Partial

> 答案参考：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)
> 延伸：[../TypeScript/utility-types.md](../TypeScript/utility-types.md)

---

### Q9: 声明文件（.d.ts）与 declare
> 🏷️ 概念题
> ⭐⭐⭐ | 难度：中级

**题目**：什么场景下需要写 `.d.ts` 声明文件？`declare` / `declare global` / `declare module` 分别怎么用？如何为第三方库扩展类型？

**考察点**：
- `.d.ts` 为无类型的 JS 库提供类型声明
- `declare` 声明变量的类型而不定义实现
- `declare global` 扩展全局作用域（Window、String 等）
- `declare module '*.vue'` 声明非 JS/TS 模块
- Module Augmentation：用 `declare module 'xxx'` 扩展现有库的类型

> 答案参考：[../TypeScript/index.md](../TypeScript/index.md)

---


### Q11: as const 的用法
> 🏷️ 概念题
> ⭐⭐⭐ | 难度：中级

**题目**：`as const`（const assertion）有什么作用？在项目中有哪些典型应用场景？

**考察点**：
- `as const` 将类型收窄到最精确的字面量类型 + `readonly`
- 对象、数组全面 `readonly`（递归处理）
- 场景：常量配置对象（无需重复定义类型）、枚举替代方案
- 与 `typeof` 配合：从 `as const` 值提取类型
- 配合 `satisfies` 的检查 + 精确推导

> 答案参考：[../TypeScript/satisfies.md](../TypeScript/satisfies.md)

---


### Q13: TypeScript 的类型收窄（Type Narrowing）
> 🏷️ 概念题
> ⭐⭐⭐ | 难度：中级

**题目**：TypeScript 有哪些类型收窄的方式？请举例说明 `typeof`、`instanceof`、`in`、自定义类型守卫（Type Predicate）的用法。

**考察点**：
- `typeof` 收窄基本类型（注意 `typeof null === 'object'`）
- `instanceof` 收窄类实例
- `in` 操作符收窄联合类型（检查属性是否存在）
- 自定义类型守卫 `value is Type`：返回值告知 TypeScript 类型
- 断言函数（Assertion Functions）：`asserts value is Type`
- 可辨识联合（Discriminated Unions）：通过字面量共同属性区分

> 答案参考：[../TypeScript/any-unknown-never.md](../TypeScript/any-unknown-never.md)

---


### Q15: 项目中的 TypeScript 最佳实践
> 🏷️ 场景题
> ⭐⭐⭐ | 难度：中级

**题目**：在 Vue3 + TypeScript 项目中，你有哪些最佳实践？如何为组件的 props、emits、template ref、provide/inject 提供类型？

**考察点**：
- `defineProps<T>()` 泛型定义 props 类型（纯类型语法）
- `defineEmits<T>()` 定义 emits 事件类型
- `ref<T>()` 和 `reactive<T>()` 泛型标注
- `InstanceType<typeof Component>` 获取组件实例类型
- `InjectionKey<T>` 为 provide/inject 提供类型安全
- `@types/` 类型声明文件的维护

> 答案参考：[../TypeScript/generics.md](../TypeScript/generics.md)
> 🎤 回答稿：[../面试回答/TypeScript/generics-utility.md](../面试回答/TypeScript/generics-utility.md)
