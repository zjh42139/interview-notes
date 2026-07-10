---
title: 泛型 / 工具类型 面试回答
description: 面试中如何回答 TypeScript 泛型和工具类型——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - TypeScript
  - 泛型
  - Utility Types
  - 面试回答
---

# 泛型 / 工具类型 面试回答

> TypeScript 面试的两个核心：泛型考察抽象能力，工具类型考察对类型系统的熟悉度。

## Q1: 泛型是什么、为什么需要它？

### 30 秒版本

"泛型就是把类型当参数。一个函数可以处理不同类型的数据，但类型安全不丢失——传入什么类型，返回什么类型，编译器能推导出来。它的价值是让你写一套代码适配多种类型，同时保留完整的类型检查和 IDE 提示。"

### 2 分钟版本

"理解泛型最好的方式是对比——没有泛型之前，你写一个工具函数有两种选择：

```typescript
// 方案 A：any —— 类型安全彻底丢失
function identity(arg: any): any { return arg }
const result = identity('hello')  // result 是 any，没有代码提示

// 方案 B：重载 —— 类型安全但不可维护
function identity(arg: string): string
function identity(arg: number): number
function identity(arg: any) { return arg }
// 每增加一种类型就多两行重载——不现实
```

泛型解决了这个困境：

```typescript
function identity<T>(arg: T): T { return arg }
const result = identity('hello')
// result 自动推导为 string，IDE 知道它可以 .toUpperCase()
```

**泛型的本质是"类型变量"**——`T` 不是具体类型，而是一个占位符。调用时 TS 根据你传入的值自动推导出 T 是什么，然后在整个函数签名中替换——参数、返回值、函数体里用到 T 的地方全部替换为实际类型。

我在项目里使用泛型最多的场景是封装 API 请求：

```typescript
// 请求函数——入参类型决定返回值类型
async function request<T>(url: string): Promise<T> {
  const res = await fetch(url)
  return res.json()  // 返回类型是 T，调用方 auto-complete 直接用
}

// 使用时传入具体类型
interface User { id: number; name: string }
const user = await request<User>('/api/user/1')
// user.name 有自动补全——不需要 as User 断言
```

泛型是 TS 类型体操的入口——懂了泛型，约束（`extends`）、条件类型（`T extends U ? X : Y`）、映射类型才能一个一个学下去。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "泛型约束是什么" | 用 `extends` 限制 T 必须满足某个条件。比如 `<T extends { length: number }>` 限制 T 必须有 length 属性——这样函数体内可以安全访问 `arg.length`。 |
| "泛型默认值怎么用" | `<T = string>`——调用时不传类型参数就默认 string。常用在工具函数中减少调用方的模板代码。 |
| "什么时候不用泛型" | 当类型确实是固定的——不要为了泛型而泛型。比如 `function sum(a: number, b: number)` 没必要泛型化——它只处理 number。 |

---

## Q2: Pick / Omit / Partial / Required 的区别和实现？

### 30 秒版本

"四个工具类型分两组：Pick/Omit 是属性过滤——Pick 从类型中挑属性，Omit 排除属性。Partial/Required 是属性可选性控制——Partial 把所有属性变成可选，Required 把所有属性变成必填。它们都是映射类型的具体应用，TypeScript 内置好的。"

### 2 分钟版本

"先说它们各自做什么，再说怎么实现：

| 工具类型 | 效果 | 实际场景 |
|---------|------|---------|
| `Pick<T, K>` | 从 T 中**挑选** K 指定的属性 | API 返回全量 User，但编辑表单只需要 name + email |
| `Omit<T, K>` | 从 T 中**排除** K 指定的属性 | 列表查询参数排除 page/pageSize（单独处理） |
| `Partial<T>` | 所有属性**变可选** | 更新接口——只传改动的字段 |
| `Required<T>` | 所有属性**变必填** | 构造函数参数——确保初始化时所有字段都有值 |

**怎么实现的——核心是映射类型**：

```typescript
// Partial 的实现——遍历 T 的所有 key，每个都加 ?
type MyPartial<T> = { [K in keyof T]?: T[K] }

// Required 的实现——遍历 T 的所有 key，去掉 ?
type MyRequired<T> = { [K in keyof T]-?: T[K] }
// -? 是映射类型的修饰符语法——把可选变成必填

// Pick 的实现——只遍历 K 中指定的 key
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

// Omit 的实现——先用 Exclude 排除指定的 key，再 Pick
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
```

**面试官想听到的深度**：不是背 API，而是理解映射类型的原理——`[K in keyof T]` 在遍历类型的键，`T[K]` 在取值的类型。如果你能手写 Pick/Omit/Partial 的实现，说明你真正理解了 TS 的类型操作。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "`Record` 和 `Pick` 有什么区别" | `Record<K, V>` 是创建新对象类型——K 是键的联合类型，V 是值的类型。`Pick` 是从已有类型中挑选。`Record` 是新建，`Pick` 是过滤。 |
| "`Exclude` 和 `Omit` 有什么区别" | `Exclude<T, U>` 作用于联合类型（排除 union 的成员），`Omit<T, K>` 作用于对象类型（排除对象的属性）。domain 不同。 |
| "`DeepPartial` 怎么实现" | 递归——`type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }`。但要注意循环引用和数组的处理。 |

---

## 别踩的坑

1. **"泛型就是 any"** —— 面试中说出这句话基本直接挂。泛型和 any 完全相反——泛型保留类型信息，any 丢失类型信息。

2. **只列举不解释** —— 面试官问"你知道哪些工具类型"，不是说 10 个名字就完了。挑 3 个最常用的，解释场景 + 手写实现。

3. **Omit 的类型安全陷阱** —— `Omit<T, K>` 在 K 不存在于 T 时不会报错（`Omit<User, 'nonexistent'>` 合法）。这是 TS 的设计选择——Omit 是宽松的。面试时如果你能指出这个细节是加分项。

## 相关阅读

- [泛型](../../TypeScript/generics.md)
- [Utility Types](../../TypeScript/utility-types.md)
- [extends / infer](../../TypeScript/extends-infer.md)
- [keyof / mapped / conditional](../../TypeScript/keyof-mapped-conditional.md)

## 更新记录

- 2026-07-10：新建（泛型本质 + 四工具类型手写实现 + 追问预判 + 对比陷阱）
