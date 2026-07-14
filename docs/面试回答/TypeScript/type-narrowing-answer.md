---
title: 类型收窄 面试回答
description: 面试中如何回答 TypeScript 类型收窄——typeof/instanceof/in/is/asserts 五种方式 + 可辨识联合 + 穷举检查
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - TypeScript
  - 类型收窄
  - type guard
  - type predicate
  - 面试回答
---

# 类型收窄 面试回答

> 考察从宽类型中安全提取具体类型的能力——TS 控制流分析 + 五种 Type Guard 是核心。

## Q1: TypeScript 有哪些类型收窄的方式？

### 30 秒版本

"五种方式——typeof 基础类型、instanceof 类实例、in 检查属性存在、自定义 type predicate（`arg is Type`）返回值告诉 TS 类型、asserts 断言函数抛异常收窄。日常最常用的是 typeof + type predicate 两种。根本原理是 TS 的控制流分析——跟踪变量经过 if/switch 后类型如何变化。"

### 2 分钟版本

**typeof** —— 基础类型收窄。注意 `typeof null === 'object'` 的陷阱。

**instanceof** —— 类实例判断。沿原型链查找，子类也通过父类检查。在错误处理中极其常见——区分 AxiosError / Error / unknown。

**in** —— 检查属性是否存在。用于联合类型中区分"有标志性属性"的成员。面试要提一句效率问题——in 只检查属性存在不检查值，属性可能是 undefined。

**自定义 Type Predicate** —— `arg is Type`。最灵活的方式，适合校验 API 响应、localStorage 数据、URL 参数等外部不可信数据：

```typescript
function isUser(data: unknown): data is User {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.name === 'string' && typeof obj.email === 'string';
}

function handle(data: unknown) {
  if (isUser(data)) {
    console.log(data.name.toUpperCase()); // ✅ data 自动收窄为 User
  }
}
```

**asserts** —— TS 3.7+，适合入口校验。断言通过后的代码全部受益，比 type predicate 更激进——不需要 if 检查：

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('Expected string');
}
// 调用后 value 自动是 string，不需要 if
```

**可辨识联合** —— 给联合类型成员加共同字面量字段（kind、type、status），然后 switch 穷举收窄。这是 TS 版的模式匹配，在状态管理、消息处理中非常实用。

**面试最关键的一句话**：Type predicate 的正确性完全由开发者保证。`function isNumber(x: unknown): x is number { return true }`——TS 不会阻止你写错。所以项目中的 type predicate 必须写全运行时校验逻辑。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "type predicate 和 asserts 怎么选" | type predicate 返回布尔值让调用方自己判断——适合需要分支处理。asserts 失败直接抛异常——适合入口校验。后端 API 参数校验用 asserts，前端 API 响应校验用 type predicate |
| "is 和 as 有什么区别" | is 是类型守卫——告诉 TS 在 if 块内可以安全收窄。as 是类型断言——告诉 TS "相信我，就是这个类型"但没有任何运行时检查。is 更安全，as 更危险 |
| "可辨识联合怎么用" | 给联合类型的每个成员加一个字面量类型的公共字段（kind/type），然后用 switch 匹配。switch 的穷举性由 TS 自动检查——加新成员时不更新 switch 会编译报错 |

## 别踩的坑

1. **typeof null 返回 "object"** —— 用 `typeof x === 'object'` 做 type guard 时记得加 `&& x !== null`。

2. **type predicate 的逻辑漏洞** —— `return true` 永远不会被 TS 阻止。写好 type predicate 的唯一方法是写全运行时校验。漏一个属性检查，后续代码就在用错误类型运行。

3. **in 操作符检查出的属性可能是 undefined** —— `'name' in obj` 只检查属性存在，不保证值有意义。如果需要保证非 undefined，额外检查 `typeof obj.name === 'string'`。

## 相关阅读

- [类型收窄](../../TypeScript/type-narrowing.md)
- [any / unknown / never](../../TypeScript/any-unknown-never.md) —— unknown 必须收窄才能用
- [泛型 / 工具类型](./generics-utility.md)

## 更新记录

- 2026-07-14：新建（五种 Type Guard + 可辨识联合 + 穷举检查）
