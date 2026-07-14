---
title: 类型收窄（Type Narrowing）
description: TypeScript 的 typeof、instanceof、in、is (type predicate)、asserts 五种类型收窄方式，以及可辨识联合和穷举检查的实战应用
category: TypeScript
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - 类型收窄
  - type guard
  - type predicate
  - typeof
  - instanceof
  - 可辨识联合
---

# 类型收窄（Type Narrowing）

> ⭐⭐⭐⭐｜难度：中级｜项目：★★★★

## 一句话总结

**类型收窄就是把一个"宽"的类型变成"窄"的类型——`string | number` 通过 `typeof` 在 if 块里变成 `string`，`unknown` 通过类型守卫变成具体类型。面试中五种 Type Guard 是必问的，但更关键的是理解它们的原理和适用场景。**

## 核心机制

TypeScript 的控制流分析（Control Flow Analysis）会跟踪变量在 `if`、`switch`、`return` 等分支中的类型变化——同一个变量在不同代码块中可能对应不同的类型，TS 全程知道。

### 1. `typeof` —— 基础类型的收窄

最常用的 Type Guard，JavaScript 原生 `typeof` 在 TypeScript 中被识别为类型收窄操作符：

```typescript
function format(input: string | number | boolean): string {
  if (typeof input === 'string') {
    return input.trim();           // input: string
  } else if (typeof input === 'number') {
    return input.toFixed(2);       // input: number
  } else {
    return input.toString();       // input: boolean（唯一剩下的可能）
  }
}
```

TS 能识别 `typeof` 的以下返回值：`"string"` / `"number"` / `"bigint"` / `"boolean"` / `"symbol"` / `"undefined"` / `"object"` / `"function"`。注意 `typeof null === "object"` 是一个陷阱——TS 不会因为 `typeof x === "object"` 就把 `x` 收窄为 `object`，因为 TS 知道 `null` 也返回 `"object"`。

### 2. `instanceof` —— 类实例的收窄

用于判断对象是否是某个类的实例：

```typescript
function parseError(error: unknown): string {
  if (error instanceof AxiosError) {
    // error: AxiosError —— 可以访问 response、config 等属性
    return `请求错误 ${error.response?.status}`;
  } else if (error instanceof Error) {
    // error: Error
    return error.message;
  } else {
    return String(error);
  }
}
```

`instanceof` 沿着原型链查找，所以子类实例也会通过父类的 `instanceof` 检查。TS 识别这种原型链继承。

### 3. `in` —— 检查属性是否存在

用于收窄联合类型中"某个对象有特定属性"的分支：

```typescript
interface User { name: string; email: string; }
interface Admin { name: string; email: string; permissions: string[]; }

function getAccess(user: User | Admin): string[] {
  if ('permissions' in user) {
    // user: Admin（只有 Admin 有 permissions）
    return user.permissions;
  }
  // user: User
  return [];
}
```

`"key" in obj` 在 JavaScript 中总是返回 `boolean`，TS 不做运行时检查——它信任这个表达式的真假。

### 4. `is`（Type Predicate）—— 自定义类型守卫

关键字 `is` 让你自定义"返回布尔值的函数"成为 TS 能理解的 Type Guard：

```typescript
// 返回值类型是 "value is SomeType"，而不是 boolean
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.name === 'string'
    && typeof obj.email === 'string';
}

function process(data: unknown) {
  if (isUser(data)) {
    // data: User —— 完全类型安全
    console.log(data.name.toUpperCase());
  }
  // data: unknown
}
```

Type predicate 是最灵活的类型收窄方式——你可以用任意运行时逻辑验证数据的结构，TS 完全信任 `true` 返回意味着类型成立。

### 5. `asserts`（Assertion Function）—— 断言函数

TypeScript 3.7+ 支持，失败时抛异常，成功后的代码块中变量被收窄：

```typescript
// 返回值类型是 asserts value is Type
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError(`Expected string, got ${typeof value}`);
  }
}

function handle(data: unknown) {
  assertIsString(data);
  // data: string —— 断言通过后，后续代码都知道 data 是 string
  return data.toUpperCase();
}
```

`asserts` 在 Node.js 后端代码中很常见——在函数入口一次性验证所有参数。在浏览器端适合验证从 URL 参数、localStorage 中读取的不可信数据。

### 五种 Type Guard 选择指南

| 场景 | 推荐方式 |
|------|---------|
| 原始类型联合（`string \| number`） | `typeof` |
| 类实例判断 | `instanceof` |
| 对象联合类型，有标志性属性 | `in` |
| 需要复杂运行时验证 | 自定义 Type Predicate (`is`) |
| 入口参数校验，提前抛异常 | Assertion Function (`asserts`) |

## 深度拓展

### 可辨识联合（Discriminated Union）

给联合类型的每个成员加一个**共同的字面量字段**，用 `switch`/`if` 区分：

```typescript
// kind 字段是"标签"——TS 通过它区分联合中的每个成员
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;  // shape: Circle
    case 'rectangle':
      return shape.width * shape.height;    // shape: Rectangle
    case 'triangle':
      return (shape.base * shape.height) / 2; // shape: Triangle
  }
}
```

这是 TypeScript 版的"模式匹配"——`kind` 字段的值直接决定了 `shape` 被收窄为哪个成员类型。

### 穷举检查（Exhaustive Check）—— never 的经典用法

```typescript
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':    return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    case 'triangle':  return (shape.base * shape.height) / 2;
    default:
      // 如果 Shape 新增了 'square'，这里会编译报错
      // 因为 shape 在 default 分支不是 never
      return assertNever(shape); // ✅ 当前：所有分支都处理完了
  }
}
```

如果你在未来给 `Shape` 加了一个 `{ kind: 'square'; side: number }`，`default` 分支里 `shape` 的类型就不再是 `never` 而是 `{ kind: 'square'; side: number }`——`assertNever(shape)` 立即报错，告诉开发者忘了处理新类型。

## 项目实战

### 1. API 响应验证

```typescript
// 后台管理系统中，任何从后端来的数据都应该先验证
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

function isValidApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.code === 'number'
    && 'data' in obj
    && typeof obj.message === 'string';
}

async function safeFetch<T>(url: string, validate: (v: unknown) => v is T): Promise<T> {
  const res = await fetch(url);
  const json: unknown = await res.json();

  if (validate(json)) {
    return json;  // json: T —— 验证通过，类型安全
  }
  throw new Error('接口返回数据格式异常');
}
```

### 2. 路由参数类型安全

```typescript
// 从 URL 参数解析 ID
function parseId(raw: string | string[] | undefined): number {
  if (typeof raw === 'string') {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) return parsed;
  }
  throw new Error(`无效的 ID 参数: ${raw}`);
}

// Vue Router 中使用
const id = parseId(route.params.id);
// id: number —— 后续直接用，不需要再检查
```

### 3. Element Plus 表单验证中的 Type Guard

```typescript
interface CreateUserForm {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

function isValidRole(value: unknown): value is CreateUserForm['role'] {
  return value === 'admin' || value === 'editor' || value === 'viewer';
}

const formRules = {
  role: [
    {
      validator: (_rule: unknown, value: unknown, callback: Function) => {
        if (!isValidRole(value)) {
          callback(new Error('无效的角色类型'));
        } else {
          // value 被收窄为 'admin' | 'editor' | 'viewer'
          callback();
        }
      },
    },
  ],
};
```

## 易错点

❌ **`typeof null === 'object'`**：`typeof` 不能区分 `null` 和其他对象——需要额外检查 `value !== null`。

❌ **Type Predicate 的返回值不保证类型安全**：`function isNumber(x: unknown): x is number { return true }` 永远不会被 TS 阻止——类型守卫的正确性完全由你保证。**写 type predicate 时务必把运行时逻辑写周全**。

❌ **`in` 操作符检查出的属性可能是 `undefined`**：即使 `'name' in obj` 返回 `true`，`obj.name` 仍可能是 `undefined`——`in` 只检查属性存在，不管值。

❌ **忘记穷举检查导致运行时 lost branch**：联合类型加了新成员但没更新所有 switch——建议在所有 switch 中加 `default: assertNever(value)`。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "TypeScript 有哪些类型收窄方式" | 追问 typeof/instanceof/in/is 的区别和适用场景 |
| "type predicate 和 asserts 有什么区别" | 追问 is 返回布尔值让调用方判断；asserts 抛异常直接中断 |
| "可辨识联合怎么定义" | 追问 kind/type 公共字段 + switch 穷举收窄 |
| "一个 unknown 类型的 API 响应怎么处理" | 追问 type predicate 验证结构 + 泛型推导 |

## 相关阅读

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [any / unknown / never](./any-unknown-never.md) —— unknown 必须收窄后才能用的底层逻辑
- [satisfies](./satisfies.md) —— 跟类型收窄互补的概念（验证但不改变类型）
- [as const](./as-const.md) —— const 断言——另一种"让类型更精确"的方式
- [泛型](./generics.md) —— 泛型 + type predicate 实现通用类型安全的工具函数

## 更新记录

- 2026-07-14：新建——五种 Type Guard + 可辨识联合 + 穷举检查 + 项目实战
