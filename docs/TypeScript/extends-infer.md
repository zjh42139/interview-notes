---
title: extends / infer
description: extends 用于泛型约束和条件类型判断，infer 用于在条件类型中推断类型变量，两者结合构成 TypeScript 类型编程的基础
category: TypeScript
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - extends
  - infer
  - 条件类型
---

# extends / infer

> ⭐⭐⭐⭐｜难度：高级｜项目：★★★

## 一句话总结

> `extends` 在 TS 里有三重身份：泛型约束、条件类型判断、接口继承。`infer` 是条件类型中的"类型提取器"——如果类型符合某种模式，就从中捕获某部分作为新类型变量。两者组合就是 TS 类型编程的核心武器。

## 核心机制

面试讲 `extends`，先分清三种用法，混着讲容易绕晕自己：

**用法一：泛型约束**。限定泛型参数的范围，`extends` 读作"必须可赋值给"：

```typescript
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}
```

**用法二：条件类型**。这是 `extends` 最强大的用法，类型层面的三元表达式：

```typescript
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<"hello">; // "yes"
type B = IsString<42>;       // "no"
```

关键：**分布式条件类型**——当 `T` 是联合类型时，条件自动分发到每个成员：

```typescript
type ToArray<T> = T extends unknown ? T[] : never;
// string | number → string[] | number[]（分发到每个成员）
type Result = ToArray<string | number>;
```

阻止分发：用方括号 `[T]` 包裹：

```typescript
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
// → (string | number)[]
```

**用法三：接口继承**。最基础的，`interface Dog extends Animal`。

---

`infer` 只能在条件类型的 `extends` 右侧使用，作用是从类型结构中**抽取**子类型：

```typescript
// 提取数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : never;
type A = ElementType<string[]>;   // string
type C = ElementType<boolean>;    // never（不匹配数组模式）

// 提取函数返回类型
type MyReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;

// 递归解包 Promise（面试必考题）
type Awaited<T> = T extends Promise<infer V> ? Awaited<V> : T;
```

`Awaited` 递归不断剥开 `Promise<>` 的壳，直到拿到非 Promise 的值类型。

## 深度拓展

### 追问点 1：never 在条件类型中的特殊行为

`never` 是空联合类型，分发时相当于对 0 个成员分别执行判断，结果就是 `never`：

```typescript
type Test<T> = T extends string ? "yes" : "no";
type Result = Test<never>; // never！不是 "no"
```

这是 `Exclude` 等工具类型故意利用的特性，但在某些场景是坑——用 `[T]` 可阻止。

### 追问点 2：infer 在协变和逆变位置

同一个类型变量在协变位置（返回值）和逆变位置（参数），infer 推断结果不同：

```typescript
// 协变位置：多候选 → 联合类型
type Co<T> = T extends { a: infer U; b: infer U } ? U : never;
type T1 = Co<{ a: string; b: number }>; // string | number

// 逆变位置：多候选 → 交叉类型
type Contra<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void } ? U : never;
type T2 = Contra<{ a: (x: string) => void; b: (x: number) => void }>;
// string & number → never
```

### 追问点 3：手写 ReturnType / Parameters / InstanceType

面试高频题，模式都一样——先用 `extends` 约束、再用 `infer` 提取：

```typescript
type MyReturnType<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => infer R ? R : never;

type MyParameters<T extends (...args: unknown[]) => unknown> =
  T extends (...args: infer P) => unknown ? P : never;

type MyInstanceType<T extends abstract new (...args: unknown[]) => unknown> =
  T extends abstract new (...args: unknown[]) => infer R ? R : never;
```

## 项目实战

Vue3 + Element Plus 后台管理中 `extends + infer` 用于处理深层类型：

**1. 实现 DeepReadonly**——菜单配置需要深度只读保护：

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepReadonly<T[K]>
    : T[K];
};

const MENU_CONFIG: DeepReadonly<MenuItem[]> = [...];
// 全局配置不会被意外修改
```

用递归条件类型：是对象就深入，遇到 `Function` 停下（函数不需要 DeepReadonly），否则停在原始类型。

**2. 提取 API 响应数据类型**：

```typescript
type ExtractApiData<T> = T extends ApiResponse<infer D> ? D : never;
type ExtractListData<T> = T extends ApiResponse<{ list: infer L }> ? L : never;

type UserItem = ExtractListData<ApiResponse<{ list: UserInfo[] }>>; // UserInfo[]
```

封装通用请求函数时自动推导 `data` 的具体类型，不用手动转换。

**3. 提取 Vue 组件 Props 类型**：

```typescript
type ComponentProps<T> = T extends { $props: infer P } ? P : never;
```

写泛型表格组件、泛型表单组件时，拿到子组件 Props 类型才能在父组件里安全传参。

## 易错点

**❌ 条件类型的分布式行为是 bug**
是特性，不是 bug。没有它就没有 `Exclude` / `Extract`。理解它并知道用 `[T]` 关闭即可。

**❌ `A extends B ? C : D` 行为完全等价于 JS if/else**
分布行为是最大不同。JS if/else 不会对联合类型分支分别求值，TS 条件类型会。面试说"条件类型像 if/else"后必须补上"但对联合类型有分发行为"。

**❌ infer 可以在任何地方使用**
`infer` 只能在条件类型的 `extends` 右侧使用，别处写会报错。

**❌ `never extends string ? yes : no` 结果是 `no`**
结果是 `never`。`never` 触发分布式条件类型的"零迭代"——这是面试官的经典陷阱题。

## 相关阅读

- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [泛型（Generics）](./generics.md)
- [keyof / mapped / conditional 类型编程](./keyof-mapped-conditional.md)
- [Utility Types 工具类型](./utility-types.md)

## 更新记录

- 2026-07：Phase 2 填充 —— 完整面试内容
