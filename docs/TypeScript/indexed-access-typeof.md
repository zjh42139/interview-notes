---
title: "T[K] / typeof 类型操作符"
description: Indexed Access Types——索引访问类型 T[K] 和 typeof 类型操作符在 TypeScript 中的完整用法
category: TypeScript
type: mechanism
score: 80
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - indexed access
  - typeof
  - T[K]
  - 类型操作
---

# T[K] / typeof 类型操作符

> ⭐⭐⭐⭐｜难度：中级｜类型编程三板斧的第四块

## 一句话总结

**`T[K]`（索引访问类型）从对象类型中取出某个属性的类型——类似 JS 的 `obj[key]` 但在类型层面。`typeof`（类型上下文）从值提取类型——`typeof var` 拿到变量的类型。两者组合 `typeof obj[keyof typeof obj]` 是从常量值推导类型的最常用模式。**

## 核心机制

### T[K] —— 索引访问类型

```typescript
interface User {
  name: string;
  age: number;
  roles: string[];
}

// 取出单个属性的类型
type NameType = User['name'];       // string
type AgeType = User['age'];         // number

// K 可以是联合类型——取出多个属性的联合类型
type NameOrAge = User['name' | 'age']; // string | number

// 配合 keyof——取出所有属性值的联合类型
type AllValues = User[keyof User];     // string | number | string[]
```

**T[K] 是类型世界里的属性访问**——JS 里 `obj.key` 拿到的是值，TS 里 `T['key']` 拿到的是类型。

### typeof —— 类型上下文的类型提取

```typescript
// JS 的 typeof：运行时返回字符串
typeof 'hello'; // "string"

// TS 的 typeof（type context）：从值提取类型
const user = { name: 'Alice', age: 30 };
type UserType = typeof user; // { name: string; age: number; }

// 经典模式：从常量推导类型——只改一处
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'
// 加了新角色——只改 ROLES 数组，Role 类型自动同步
```

**typeof + keyof 组合**：

```typescript
const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
} as const;

// 从值提取 key 的联合类型
type PermissionKeys = keyof typeof PERMISSIONS; // 'READ' | 'WRITE' | 'DELETE'

// 从值提取 value 的联合类型
type PermissionValues = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]; // 'read' | 'write' | 'delete'
```

## 深度拓展

### T[K] 与泛型配合

```typescript
// 安全地访问对象的属性——K 必须是 T 的 key
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
getProperty(user, 'name');     // 返回类型 string ✅
// getProperty(user, 'email'); // ❌ 'email' 不是 'name'|'age'
```

**面试信号**：面试官问"怎么让函数返回类型跟传入的 key 对应"——这就是 T[K] 的典型用法。

### Deep Indexed Access

```typescript
// 深层取值——连续索引访问
interface API {
  response: { data: { user: { name: string } } };
}
type UserName = API['response']['data']['user']['name']; // string
```

### T[K] + 条件类型过滤

```typescript
// 仅选取值类型为 string 的属性
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T]; // 拿到所有符合条件的 key

interface User { name: string; age: number; email: string; }
type StringProps = StringKeys<User>; // 'name' | 'email'
```

## 易错点

❌ **T[K] 的 K 必须是 T 的 key** —— `User['email']` 如果 email 不在 User 中——TS 直接报错。不加 `K extends keyof T` 约束无法安全使用。

❌ **typeof 在 JS 和 TS 中是两个东西** —— `typeof x === 'string'` 是 JS 运行时；`type T = typeof x` 是 TS 编译时——两者完全独立，不要混为一谈。

❌ **`T[K]` 拿到的是类型不是值** —— `User['name']` 在类型位置等于 `string`——但在 JS 代码里 `obj['name']` 是值。类型编程里写 T[K] 永远在 type/interface 声明中。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "怎么从常量数组提取类型" | 追问 `typeof arr[number]` |
| "索引访问类型怎么用" | 追问 T[K] + keyof 组合——提取所有值的联合 |
| "typeof 在 TS 中有几种用法" | 追问 JS typeof vs TS typeof 的区别 |

## 相关阅读

- [keyof / mapped / conditional 类型编程](./keyof-mapped-conditional.md)
- [泛型](./generics.md)
- [as const](./as-const.md)

## 更新记录

- 2026-07-16：新建——T[K]索引访问+typeof类型提取+组合模式+泛型约束
