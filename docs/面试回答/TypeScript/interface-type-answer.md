---
title: interface vs type 面试回答
description: 面试中如何回答 interface 和 type 的区别——声明合并、表达能力、extends 方式三个核心差异 + 项目选择原则
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - TypeScript
  - interface
  - type
  - 面试回答
---

# interface vs type 面试回答

> TS 面试最高频的对比题。80% 的人只能说"interface 能 extends"，然后卡住。

## Q1: interface 和 type 有什么区别？什么时候用哪个？

### 30 秒版本

"三个核心区别——声明合并、表达能力、extends 方式。interface 同名自动合并，type 不行——这是扩展第三方库类型的关键能力。type 能定义联合/交叉/映射类型，interface 只能描述对象形状。推荐：描述对象形状用 interface，需要联合/交叉/映射能力时用 type。"

### 2 分钟版本

"先说三个区别，再说设计意图，最后讲项目里怎么选。

**区别一：声明合并。** `interface User { name: string }` 和 `interface User { age: number }` 写在不同文件里会自动合并。这是 interface 最独特的能力——扩展第三方库的类型全靠它。type 不支持——同名 type 直接报重复标识符。

**区别二：表达能力。** type 能做 interface 做不了的事——联合类型 `type Status = 'pending' | 'success'`、交叉类型 `type A = B & C`、映射类型 `type Readonly&lt;T> = { readonly [K in keyof T]: T[K] }`。interface 只能描述对象形状，这些它全做不到。

**区别三：extends 方式。** interface 用 `extends` 关键字继承，type 用 `&` 交叉。语义上 extends 更清晰——'Admin 是 User 的扩展'比 'Admin = User & { role }'更直观。

**为什么 interface 能声明合并而 type 不能？** 这是 TS 有意为之。`.d.ts` 文件中多个库可以各自扩展一次 `interface Window`，最终自动合并为一个完整类型。type 不允许多次定义——保证了类型来源的单一性，一旦定义就固定了。

**项目里怎么选？** 团队定一个默认——我推荐 interface。描述对象形状时用 interface——声明合并 + extends 语义清晰。需要联合/交叉/映射类型时用 type。不确定时先写 interface，发现能力不够再切 type。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "type 能用 extends 吗" | 能——条件类型中的 extends 是类型判断，不是继承。`type IsString&lt;T> = T extends string ? true : false`——这是条件类型跟 interface extends 完全是两回事 |
| "interface 能表示联合类型吗" | 不能。interface 只能描述对象形状。需要联合类型必须用 type |
| "为什么很多开源项目全用 type" | type 更灵活——一套语法覆盖所有场景，不需要在 interface 和 type 之间切换心智。小团队或偏好简洁的会选择全用 type。两者没有绝对的好坏，关键是团队统一 |

## 别踩的坑

1. **"interface 和 type 完全一样，只是语法不同"** —— 声明合并是 interface 独有的能力，说"完全一样"会被追问。
2. **项目中混用** —— 同一个项目里一会儿用 interface 一会儿用 type 描述对象形状，读代码的人不知道该选哪个。团队定一个默认。
3. **把 type 的 extends 当成继承** —— 条件类型 `T extends U ? X : Y` 是类型判断，逻辑上更像三元表达式而不是继承。

## 相关阅读

- [基础类型 / 类型注解](../../TypeScript/basic-types.md#5-interface-vs-type-高频对比)
- [声明文件 / declare](../../TypeScript/declaration.md)
- [泛型 / 工具类型](./generics-utility.md)

## 更新记录

- 2026-07-15：新建（三核心区别 + 设计意图 + 项目选择 + 追问预判）
