---
title: 类型体操 面试回答
description: 面试中如何回答 TypeScript 类型体操——DeepReadonly/DeepPartial 递归实现、Exclude 的分布式原理、类型体操的实用价值和边界
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - TypeScript
  - 类型体操
  - DeepReadonly
  - DeepPartial
  - 面试回答
---

# 类型体操 面试回答

> 考察对 TS 类型系统的深入理解。面试官不指望你写 UnionToIntersection，但 DeepReadonly/DeepPartial 是基础线。

## Q1: 请实现 DeepReadonly&lt;T> 和 DeepPartial&lt;T>

### 30 秒版本

"核心是递归——`T[K] extends object ? DeepXxx&lt;T[K]> : T[K]`。遇到对象就递归深入，遇到原始类型就停下。注意三点：函数不需要 DeepReadonly 因为函数不涉及状态修改、数组需要特殊处理留出数组方法、注意循环引用可以用类型层面的环检测但日常场景很少需要。"

### 2 分钟版本

**DeepReadonly——递归版的 Readonly**：

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]                      // 函数不需要只读，直接保留
      : DeepReadonly<T[K]>         // 对象类型——递归深入
    : T[K];                        // 原始类型——加 readonly 就够了
};
```

三层逻辑：原始类型直接加 readonly、函数类型原样保留（函数没有"修改"的概念）、对象类型递归。

**DeepPartial——递归版的 Partial**：

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>           // 对象——递归变可选
    : T[K];                        // 原始类型——加 ? 变可选
};
```

**这两者的实用价值**：表单草稿保存——用户只填了 `{ basic: { name: '张三' } }` 也能通过类型检查。菜单配置全局只读——`const MENU: DeepReadonly&lt;MenuItem[]> = [...]` 防止任何地方意外修改。

**Exclude 的实现**——比上面两个简单，但考察的是类型编程的核心思想：

```typescript
type MyExclude<T, U> = T extends U ? never : T;
// 'a' | 'b' | 'c' 对 'a' 做 Exclude
// → 分发到每个成员: ('a' extends 'a' ? never : 'a') | ('b' extends 'a' ? never : 'b') | ('c' extends 'a' ? never : 'c')
// → never | 'b' | 'c'
// → 'b' | 'c'  (never 在联合类型中自动消失)
```

**关于类型体操的边界**——面试一定要主动说：类型体操的实用价值是写出更准确的类型定义，让编译器帮你发现错误。超出了手写几个常用工具类型的范围，就应该考虑——是不是把问题复杂化了。为了炫技把类型写成迷宫，降低可读性得不偿失。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "DeepReadonly 中为什么要排除 Function" | 函数没有"修改"的概念，加 readonly 没有意义。而且函数类型被 readonly 修饰后会变成 `{ (...args): ... }` 而不是原来简洁的函数签名形式 |
| "递归类型有深度限制吗" | TS 编译器有默认递归深度限制（50 层）。项目中的实际嵌套一般不超过 5 层——完全够用 |
| "类型体操的实用价值是什么" | 写出更准确的类型——表单/配置/API 响应的精确约束让编译器在编码期发现问题。目的是提高代码安全性，不是炫技 |

## 别踩的坑

1. **递归忘记 base case** —— 类型递归也需要终止条件。`T[K] extends object` 就是终止判断——原始类型、Function、数组需要各自处理。
2. **DeepReadonly 对数组的处理** —— 递归 DeepReadonly 对 `number[]` 会把数组索引也变成 readonly，但 push/pop 等修改方法的位置是类型系统的灰色地带。通常 DeepReadonly 用于纯数据对象而非数组，如果用于数组就用 `readonly T[]` 而非递归。
3. **循环引用** —— `type A = { parent: A }` 的情况。TS 能处理有限的递归深度，但无限递归会导致编译器陷入死循环。日常业务代码中极少遇到。

## 相关阅读

- [extends / infer 深度解析](../../TypeScript/extends-infer.md)
- [Utility Types](../../TypeScript/utility-types.md)
- [keyof / mapped / conditional](./keyof-mapped-conditional-answer.md)
- [泛型 / 工具类型](./generics-utility.md)

## 更新记录

- 2026-07-15：新建（DeepReadonly/DeepPartial/MyExclude 递归实现 + 实用价值 + 边界）
