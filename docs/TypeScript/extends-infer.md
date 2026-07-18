---
title: extends / infer
description: extends 用于泛型约束和条件类型判断，infer 用于在条件类型中推断类型变量，两者结合构成 TypeScript 类型编程的基础
category: TypeScript
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-05
updated: 2026-07-18
reviewed: null
tags:
  - extends
  - infer
  - 条件类型
---

# extends / infer

> ⭐⭐⭐⭐｜难度：高级

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

关键：**分布式条件类型**——当 `extends` 左侧是**裸类型参数**（没有被 `[]`、`Promise<>` 等包裹的 `T`），且传入联合类型时，条件自动分发到每个成员：

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

// 提取函数返回类型（参数位要写 any[]：函数参数是逆变位置，
// unknown[] 匹配不上 (x: number) => string 这类具体签名，条件会走 false 分支）
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

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
type MyReturnType<T extends (...args: any[]) => any> =
  T extends (...args: any[]) => infer R ? R : never;

type MyParameters<T extends (...args: any[]) => any> =
  T extends (...args: infer P) => any ? P : never;

type MyInstanceType<T extends abstract new (...args: any[]) => any> =
  T extends abstract new (...args: any[]) => infer R ? R : never;
```

参数位置必须用 `any[]`（官方 lib 的 `ReturnType` 同款写法）。写成 `(...args: unknown[]) => unknown` 会因为参数逆变，既通不过泛型约束、也匹配不上 `(x: number) => string` 这类具体签名——这是 `any` 少数不可替代的场景。

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

### 进阶：UnionToIntersection —— 逆变位置的经典应用

`UnionToIntersection` 是类型体操中的经典面试题：**将联合类型 `A | B` 转为交叉类型 `A & B`**。

```typescript
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never

// UnionToIntersection<{ a: 1 } | { b: 2 }>
// → { a: 1 } & { b: 2 }
```

**为什么能工作——逆变（contravariance）**：

函数参数是逆变位置：`((k: A) => void) | ((k: B) => void)` 这个联合类型要安全调用，实参必须同时满足两个签名（即 `A & B`），所以它可以赋值给 `(k: A & B) => void`——参数位置的推断因此取交叉。

分解步骤：
1. `U extends any ? ... : never` → 分布式条件类型将 `U` 分发为单个成员
2. `{ a: 1 } | { b: 2 }` 分发为 `((k: { a: 1 }) => void) | ((k: { b: 2 }) => void)`
3. `extends (k: infer I) => void` → 用 `infer` 在逆变位置提取参数类型
4. TypeScript 推断 `I` 时，逆变位置会将联合转为交叉：`I` = `{ a: 1 } & { b: 2 }`

**实际用途**：从 mixin 模式推断合并后的类型、从多个类型中提取共同约束。

> 这个知识点面试出现率不高，但它的原理（逆变位置 + infer 提取）是理解 TypeScript 类型系统深度的标志。能讲清 UnionToIntersection 的原理，说明你对协变/逆变有真正的理解。

## 易错点

**❌ 条件类型的分布式行为是 bug**
是特性，不是 bug。没有它就没有 `Exclude` / `Extract`。理解它并知道用 `[T]` 关闭即可。

**❌ `A extends B ? C : D` 行为完全等价于 JS if/else**
分布行为是最大不同。JS if/else 不会对联合类型分支分别求值，TS 条件类型会。面试说"条件类型像 if/else"后必须补上"但对联合类型有分发行为"。

**❌ infer 可以在任何地方使用**
`infer` 只能在条件类型的 `extends` 右侧使用，别处写会报错。

**❌ `never extends string ? yes : no` 结果是 `no`**

这个结论只对**裸泛型参数**成立（`Test<never>` 触发分发，结果 `never`）。直接写 `never extends string ? "yes" : "no"` 时 never 是具体类型不是裸参数，不触发分发，结果是 `"yes"`（never 是所有类型的子类型）。面试时说这个陷阱题一定要区分"泛型参数传入 never"和"直接对 never 写条件类型"两种场景。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "extends 和 infer 怎么配合" | 追问 extends 做条件类型、infer 在条件中提取类型变量 |
| "extends 在泛型约束和条件类型中有什么不同" | 追问 `T extends U` 约束 vs `T extends U ? X : Y` 条件 |
| "infer 能提取哪些类型" | 追问函数返回值、数组元素、Promise 包裹类型都可以提取 |

## 相关阅读

- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [泛型（Generics）](./generics.md)
- [keyof / mapped / conditional 类型编程](./keyof-mapped-conditional.md)
- [Utility Types 工具类型](./utility-types.md)

## 更新记录

- 2026-07：Phase 2 填充 —— 完整面试内容
- 2026-07-18：事实审计 —— 手写 ReturnType/Parameters/InstanceType 参数位从 `unknown[]` 改为 `any[]`（逆变导致 unknown[] 匹配失败，实测报错）；补充分布式条件类型"裸类型参数"限定；重写 UnionToIntersection 逆变赋值的解释
