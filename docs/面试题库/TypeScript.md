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
companies:
  - 字节跳动
  - 腾讯
  - 阿里
  - 美团
---

# TypeScript 高频面试题

> 收录字节/腾讯/阿里/美团近两年（2024-2025）真实面经中的高频 TypeScript 真题，共 N 道。
> 题目按出现频率从高到低排列。

---

### Q1: 泛型的使用场景与实践
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：什么是泛型？请举出在项目中至少 3 个泛型的使用场景，并写出示例代码。如何约束泛型的范围？

**考察点**：
- 泛型本质：类型参数化，延迟到使用时确定类型
- `extends` 约束（generic constraints）
- 实际场景：axios 响应包装类型、表格列定义、通用组件的 props 类型
- `Partial<T>` / `Record<K, V>` 等内置工具类型的泛型应用
- 函数、接口、类的泛型定义

> 答案参考：[../TypeScript/generics.md](../TypeScript/generics.md)

---

### Q2: Utility Types 实现原理
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

### Q7: TypeScript 配置文件（tsconfig.json）
> ⭐⭐⭐ | 难度：中级

**题目**：`tsconfig.json` 中 `strict`、`paths`、`include/exclude`、`references` 分别有什么作用？`strict` 模式具体包含了哪些子选项？

**考察点**：
- `strict: true` 包含：`strictNullChecks` / `noImplicitAny` / `strictFunctionTypes` / `strictBindCallApply` / `strictPropertyInitialization` / `noImplicitThis` / `alwaysStrict`
- `paths` + `baseUrl` 实现路径别名
- `references` 实现项目引用（monorepo 场景）
- `include` / `exclude` 控制编译范围
- `target` vs `lib`、`module` vs `moduleResolution` 的区别

> 答案参考：[../TypeScript/index.md](../TypeScript/index.md)

---

### Q8: 类型体操基础
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

### Q10: Enum vs const enum
> ⭐⭐⭐ | 难度：中级

**题目**：`enum` 和 `const enum` 有什么区别？`enum` 编译后的 JS 代码是怎样的？项目中一般推荐用 `enum` 还是联合类型？

**考察点**：
- `enum` 编译为双向映射对象（key->value 和 value->key）
- `const enum` 编译时内联，不生成运行时代码
- `const enum` 的限制：不能反向映射、不能在 `isolatedModules` 模式下使用
- 联合类型 + `as const` 的替代方案：更 JavaScriptic、更好的类型安全
- 字符串枚举 vs 数字枚举的行为差异

> 答案参考：[../TypeScript/generics.md](../TypeScript/generics.md)

---

### Q11: as const 的用法
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

### Q12: 条件类型的分发（Distributive Conditional Types）
> ⭐⭐⭐ | 难度：中高级

**题目**：什么是条件类型的分发行为？如何触发分发？如何阻止分发？写出以下类型的结果：

```typescript
type Test1 = string extends string | number ? true : false;   // ?
type Test2 = (string | number) extends string ? true : false; // ?
type Test3 = Exclude<string | number | boolean, string>;      // ?
```

**考察点**：
- 联合类型在条件类型中自动分发（`T extends U ? X : Y` 中 T 是裸类型参数时）
- 阻止分发：用 `[T]` 元组包裹
- `never` 作为联合类型的空集，分发时结果为空
- `Exclude<T, U>` 的本质：`T extends U ? never : T`
- 实际应用：`IsUnion<T>` 工具类型的实现

> 答案参考：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---

### Q13: TypeScript 的类型收窄（Type Narrowing）
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

### Q14: 协变与逆变（Variance）
> ⭐⭐ | 难度：高级

**题目**：请解释 TypeScript 中的协变（Covariance）和逆变（Contravariance）是什么？函数参数位置是逆变还是协变？为什么？

**考察点**：
- 协变：子类型可以赋值给父类型（`Array<Cat>` 可以赋值给 `Array<Animal>`）
- 逆变：父类型可以赋值给子类型（函数参数位置）
- TypeScript 默认使用"双变"（bivariant），`strictFunctionTypes: true` 强制逆变
- 函数返回值位置是协变，参数位置是逆变
- 实际影响：事件处理函数、回调函数的类型兼容性

> 答案参考：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---

### Q15: 项目中的 TypeScript 最佳实践
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
