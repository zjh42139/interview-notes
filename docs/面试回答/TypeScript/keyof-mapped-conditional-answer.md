---
title: keyof / 映射类型 / 条件类型 面试回答
description: 面试中如何回答 TypeScript 类型编程三板斧——keyof 提取键、映射类型遍历转换、条件类型分支过滤，以及三者组合实战
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
  - keyof
  - 映射类型
  - 条件类型
  - 面试回答
---

# keyof / 映射类型 / 条件类型 面试回答

> TS 类型编程的"三板斧"——理解这三个操作符的组合方式，就能从已有类型推导出任何你需要的新类型。

## Q1: keyof、映射类型和条件类型分别是什么？怎么组合使用？

### 30 秒版本

"keyof 拿对象所有键的联合类型、映射类型遍历联合类型给每个键重新定义属性、条件类型根据类型关系做分支判断。三者组合：`{ [K in keyof T as T[K] extends U ? K : never]: T[K] }`——遍历 T 的键，用条件类型过滤出值类型匹配的键，再用映射类型生成新对象。"

### 2 分钟版本

"按递进逻辑讲——它们在实际使用中就是层层叠加的。

**第一层：keyof。** `keyof User` 返回 `'id' | 'name' | 'email'`——所有键的联合类型。注意是联合类型不是数组。一个小技巧——对联合类型 `keyof (A | B)` 取交集（只能安全访问共有属性），对交叉类型 `keyof (A & B)` 取并集，很精妙的对称设计。

**第二层：映射类型。** 语法 `{ [K in 联合类型]: 新类型 }`——像运行时的 for...in 但作用在类型上。`Partial&lt;T>` 就是 `{ [K in keyof T]?: T[K] }`——遍历每个键加 `?` 变可选。四个修饰符：`readonly`/`?` 加，`-readonly`/`-?` 去。TS 4.1 引入 `as` 重映射键——`{ [K in keyof T as \`get${Capitalize&lt;string & K>}\`]: () => T[K] }` 一键生成 getter 类型。

**第三层：条件类型。** `T extends U ? X : Y`——类型层面的分支。配合 never 在联合类型中自动消失的特性实现类型过滤：`T extends U ? never : T` 从联合中筛掉 U。

**三者组合——面试手写频率最高的模式**：

```typescript
// PickByValueType：选出对象中值类型匹配的属性
type PickByValueType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
// T 是 { name: string; age: number; }
// PickByValueType<T, string> → { name: string }
// age 被过滤掉因为 T[K] extends string 不成立 → 键映射为 never → 自动移除
```

面试时从 keyof 讲到 mapped 讲到 conditional 再讲到组合——一条线串下来，面试官就知道你真正理解了类型编程的思维方式。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "映射类型和 Record 有什么区别" | Record 把 K 所有成员映射为同一个值类型 V——值是统一的。映射类型遍历 T 的键，每个键的值类型是原始类型 `T[K]`——各不相同。Record 是映射类型的特例 |
| "as 重映射键中为什么写 string & K" | 排除 symbol 键——Capitalize 只接受 string 类型参数 |
| "映射类型中的 -readonly 能递归吗" | 不能——只去掉当前层的 readonly。深层要自己写 DeepMutable——递归遍历嵌套对象去除每一层的 readonly |
| "怎么从联合类型中过滤掉某个成员" | `Exclude&lt;T, 'a'>` 本质就是分布式条件类型——`T extends 'a' ? never : T`，`'a'` 命中变 never 自动消失 |

## 别踩的坑

1. **keyof T 是联合类型不是数组** —— 不能用 forEach 遍历，用 `[K in keyof T]` 在映射类型里遍历。
2. **keyof (A | B) 是交集不是并集** —— 联合类型只能安全访问共有属性，所以取 keyof 的交集。
3. **条件类型分发是隐式的** —— 写在 `T extends U` 里，T 是联合类型时自动分发。不需要 for 循环，TS 自动帮你做。

## 相关阅读

- [keyof / mapped / conditional 类型编程](../../TypeScript/keyof-mapped-conditional.md)
- [Utility Types](../../TypeScript/utility-types.md)
- [泛型 / 工具类型](./generics-utility.md)
- [extends / infer](./extends-infer-answer.md)

## 更新记录

- 2026-07-15：新建（三板斧递进逻辑 + 组合模式 + 追问预判）
