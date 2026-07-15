---
title: extends / infer 面试回答
description: 面试中如何回答 extends 三种身份和 infer 类型推断——条件类型分发、ReturnType/Parameters 手写、分布式条件类型陷阱
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - TypeScript
  - extends
  - infer
  - 条件类型
  - 面试回答
---

# extends / infer 面试回答

> extends 有三种完全不同的身份，infer 只能在一个地方出现——说清楚这两点，面试官就知道你不是背八股。

## Q1: extends 在 TS 中有哪几种用法？infer 的作用是什么？

### 30 秒版本

"extends 三种身份——泛型约束限制类型参数范围、条件类型做类型层面的三元判断、接口/类的继承。infer 只能在条件类型的 extends 右侧使用——从类型结构中提取子类型。最经典的例子是手写 ReturnType 和 Parameters。"

### 2 分钟版本

**extends 三种用法**。面试时先分清楚，混着讲容易把自己绕进去：

**用法一：泛型约束。** `&lt;T extends { length: number }>` 限制 T 必须有 length 属性。注意这里的 extends 含义是"可赋值给"而不是"继承自"——string 和数组都能赋给有 length 的对象类型。

**用法二：条件类型。** `T extends U ? X : Y`——类型层面的三元表达式。关键是**分布式条件类型**：当 T 是裸泛型参数且是联合类型时，条件分会到每个成员上分别求值，结果再合并。Exclude 的原理就是这个——`T extends U ? never : T`，`'a' | 'b' | 'c'` 对 `'a'` 做分发，命中的变 never 被自动过滤掉。

**阻止分发**用方括号 `[T]` 包裹——`[T] extends [U]` 不会分发。

**用法三：继承。** `interface Admin extends User`、`class Dog extends Animal`——这是 JS 本身的概念，TS 只做类型检查。

**infer。** 只能在条件类型的 extends 右侧声明一个待推断的类型变量。最关键的应用：

```typescript
// 提取函数返回值
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

// 提取函数参数元组
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

// 递归解包 Promise
type Awaited<T> = T extends Promise<infer V> ? Awaited<V> : T;
```

**infer 在协变/逆变位置的差异**：同一个类型变量在协变位置（返回值）的多候选推断为联合类型，在逆变位置（参数）的多候选推断为交叉类型。这是面试加分点——但日常开发几乎碰不到。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "分布式条件类型的触发条件" | 三个条件——T 是裸泛型参数、T 是联合类型、T 出现在 extends 左侧。用 `[T]` 包裹阻止分发。`never extends string` 直接写不触发分发——never 是具体类型不是裸参数 |
| "infer 能提取哪些类型" | 函数返回值、函数参数元组、Promise 包裹类型、数组元素类型、模板字面量类型中的变量。本质是从符合模式的结构中捕获子类型 |
| "ReturnType 用 any 和 never 有什么区别" | `infer R ? R : any`——匹配不到返回 any，丧失了类型安全。`infer R ? R : never`——匹配不到返回 never，调用方编译报错。用 never 更安全 |

## 别踩的坑

1. **"extends 就是继承"** —— 只说了一种。面试官追问"那条件类型里的 extends 呢？"，答不出来就暴露了。
2. **忘记分布式条件类型只在裸泛型参数时触发** —— 直接写 `never extends string ? yes : no` 结果是 `yes`（never 是所有类型的子类型）。泛型参数传入 never（如 `Test&lt;never>`）结果才是 never。
3. **infer 用在条件类型外面** —— 编译直接报错。infer 只能在 `extends` 子句的内部使用。

## 相关阅读

- [extends / infer](../../TypeScript/extends-infer.md)
- [泛型](../../TypeScript/generics.md)
- [泛型 / 工具类型](./generics-utility.md)
- [keyof / mapped / conditional 类型编程](../../TypeScript/keyof-mapped-conditional.md)

## 更新记录

- 2026-07-15：新建（extends 三种身份 + infer 提取 + 分布式条件类型陷阱 + ReturnType/Parameters 手写）
