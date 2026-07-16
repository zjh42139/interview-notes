---
title: keyof / mapped / conditional
description: keyof 获取对象键的联合类型，映射类型基于旧类型创建新类型，条件类型实现类型层面的 if/else 逻辑
category: TypeScript
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - keyof
  - mapped-type
  - conditional-type
---

# keyof / mapped / conditional

> ⭐⭐⭐｜难度：高级

## 一句话总结

> `keyof` 把对象键提取成联合类型，**映射类型**遍历联合类型给每个键重新定义属性，**条件类型**根据条件分支决定最终类型。三者组合是 TypeScript 类型编程的"三板斧"——从已有类型推导出任何你需要的新类型，几乎不需要手写重复的类型定义。

## 核心机制

面试按"递进"逻辑串起来讲，因为它们在实际使用中就是层层叠加的。

**第一层：`keyof` —— 拿到所有的键**

`keyof T` 返回 `T` 所有属性名的**联合类型**（不是数组）：

```typescript
interface User { id: number; name: string; email: string; }
type UserKey = keyof User; // "id" | "name" | "email"
type AllKeys = keyof any;  // string | number | symbol
```

索引签名类型里 `keyof` 返回索引参数类型；对交叉类型 `keyof (A & B)` 取并集，对联合类型 `keyof (A | B)` 取交集——这是很精妙的对称设计。

**第二层：映射类型 —— 遍历键，改造类型**

语法 `{ [K in 联合类型]: 新类型 }`——遍历每个键并重新指定类型。像运行时的 `for...in` 但作用在类型上：

```typescript
type MyPartial<T>  = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
```

四个修饰符：`readonly` / `?` 是加，`-readonly` / `-?` 是减（移除）：

```typescript
type Mutable<T>  = { -readonly [K in keyof T]: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
```

**第三层：`as` 重映射键（Key Remapping）** —— TS 4.1 引入，用 `as` 在映射中重新定义键名：

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person { name: string; age: number; }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }
```

`string & K` 是为了排除 `symbol` 键（`Capitalize` 只接受 `string`），这是一个实用的细节。

**第四层：条件类型 —— 类型层面的 if/else**

语法 `T extends U ? X : Y`。当 `T` 是联合类型时**分发**到每个成员：

```typescript
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
```

**第五层：模板字面量类型** —— 字符串也能作为类型计算：

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">; // "onClick"
```

实际项目中总是在组合这五层。一个典型例子——把对象中所有 string 字段改成带前缀：

```typescript
type PrefixStringKeys<T, Prefix extends string> = {
  [K in keyof T as T[K] extends string ? `${Prefix}${string & K}` : K]: T[K];
};
```

同时用了 keyof + 映射类型 + as 重映射 + 条件类型 + 模板字面量。

## 深度拓展
### 追问点 1：`[K in keyof T]` 中 K 的类型

`K` 保留的是**字面量类型**。遍历 `{ id: number; name: string }` 时，`K` 第一轮是 `"id"`（不是宽泛的 `string`），第二轮是 `"name"`。所以能用它做模板字面量拼接。如果 T 有索引签名 `[key: string]: unknown`，K 退化为 `string`。

### 追问点 2：模板字面量 + infer 组合

`infer` 可以从模板字面量中**逆向解析**出变量：

```typescript
type ExtractEvent<T> = T extends `on${infer E}` ? Uncapitalize<E> : never;
type Event = ExtractEvent<"onClick">; // "click"
```

在 Vue 组件事件推导、路由参数解析中非常实用——比如推导 `emit('update:modelValue')` 中 value 的类型。

### 追问点 3：映射类型 vs Record 的区别

`Record<K, V>` 把 K 所有成员映射为**同一个**值类型 V。映射类型 `[K in keyof T]: T[K]` 保留了每个键的**原始**值类型——值类型各不相同。Record 是映射类型的特例（值类型统一化的特例）。

## 项目实战

Vue3 + Element Plus 后台管理中"三板斧"频繁使用：

**1. 实现 PickByValueType<T, V> —— 按值类型筛选字段**

表单场景：日期范围选择器只绑定 Date 类型字段：

```typescript
type PickByValueType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

interface SearchForm {
  keyword: string;
  status: number;
  startDate: Date;
  endDate: Date;
}

type DateFields = PickByValueType<SearchForm, Date>;
// { startDate: Date; endDate: Date; }
```

`as T[K] extends V ? K : never` 是关键——值类型匹配保留键，不匹配映射为 `never`（`never` 类型的属性被 TS 自动移除）。面试手写这个能把 keyof + 映射 + as + 条件类型全用上，非常加分。

**2. 实现 PrefixKeys<T, P> —— 给所有 key 加前缀**

后端接口要求 `search_`、`filter_` 前缀，映射类型一键生成，不用手写：

```typescript
type PrefixKeys<T, Prefix extends string> = {
  [K in keyof T & string as `${Prefix}${K}`]: T[K];
};

interface FilterParams { keyword: string; status: number; }
type QueryParams = PrefixKeys<FilterParams, "search_">;
// { search_keyword: string; search_status: number; }
```

`keyof T & string` 过滤掉 symbol/number 键，因为模板字面量只接受 `string`。

**3. 路由配置类型安全**——Vue Router 路径参数和 Props 对应，模板字面量 + infer + 映射类型保证编译期检查：

```typescript
type RouteParams<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & RouteParams<`/${Rest}`>
    : P extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>;

// "/user/:id" → { id: string }
// "/order/:orderId/detail" → { orderId: string }
```

路径变更时编译期就能提示 params 推导需要更新，避免运行时才发现路由参数不匹配。

## 易错点

**❌ `keyof T` 返回数组，可以用 forEach 遍历**
`keyof T` 是**联合类型**，不是数组。用 `[K in keyof T]` 在映射类型里遍历，跟 `Object.keys()` 是完全不同的概念。

**❌ `keyof (A | B)` 结果是 `keyof A | keyof B`**
应该是 `keyof A & keyof B`（交集）。记忆技巧：联合类型只能安全访问共有属性→取交集；交叉类型拥有所有属性→取并集。交→并，并→交，对称的。

**❌ 条件类型就是类型版 if/else，行为完全等价**
分布行为是最大区别——JS if/else 不会对联合类型分支分别求值。面试说"条件类型像 if/else"后一定要补"但对联合类型有分发行为"。

**❌ `-readonly` 能一步到位去掉所有深层只读**
`-readonly` 只对映射类型当前层的 `readonly` 生效，不会递归。要去掉嵌套对象的只读，需要自己实现 `DeepMutable<T>`。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "keyof、mapped、conditional 怎么组合" | 追问 `[K in keyof T]: T[K]` 的基础模式 |
| "模板字面量类型是什么" | 追问 `${Prefix}${string}` 实现字符串级别的类型约束 |
| "as 在 mapped type 中怎么用" | 追问 key remapping——`[K in keyof T as NewKey]: T[K]` |

## 相关阅读

- [TypeScript Handbook: keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [泛型（Generics）](./generics.md)
- [extends / infer 深度解析](./extends-infer.md)
- [Utility Types 工具类型](./utility-types.md)

## 更新记录

- 2026-07：Phase 2 填充 —— 完整面试内容
