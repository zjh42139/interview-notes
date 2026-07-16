---
title: 函数柯里化 curry
description: 手写 curry 函数——将多参数函数转化为可多次调用的柯里化形式
category: 手写题
type: practice
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - curry
  - 柯里化
  - 闭包
  - 手写题
---

# 函数柯里化 curry

> ⭐⭐⭐⭐⭐｜难度：中级｜字节/阿里/美团高频

**柯里化是把多参数函数变成一系列单参数函数。和 bind 原理相同——闭包收集参数，攒够了就执行。**

## 核心实现

```typescript
// 基础版：每次接收一个参数
function curry<T extends any[], R>(fn: (...args: T) => R) {
  return function curried(...args: any[]): any {
    // 参数够了就执行
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    // 参数不够返回新函数继续收集
    return function (...nextArgs: any[]) {
      return curried.apply(this, [...args, ...nextArgs])
    }
  }
}

// 使用示例
function add(a: number, b: number, c: number) {
  return a + b + c
}

const curriedAdd = curry(add)
curriedAdd(1)(2)(3)    // 6
curriedAdd(1, 2)(3)    // 6
curriedAdd(1)(2, 3)    // 6
```

## 变体：支持占位符

```typescript
// 进阶：用 Symbol 做占位符，支持"先传后面的参数"
const _ = Symbol('placeholder')

function curryWithPlaceholder(fn: (...args: any[]) => any) {
  return function curried(...args: any[]): any {
    // 去掉末尾的占位符来检查有效参数数量
    const validArgs = args.filter(a => a !== _)
    if (validArgs.length >= fn.length && !args.slice(0, fn.length).includes(_)) {
      return fn.apply(this, args.slice(0, fn.length))
    }
    return function (...nextArgs: any[]) {
      // 用新参数填充占位符
      const merged = args.map(a => (a === _ && nextArgs.length ? nextArgs.shift() : a))
      return curried.apply(this, [...merged, ...nextArgs])
    }
  }
}
```

## 面试追问

| 追问 | 回答 |
|------|------|
| "fn.length 有什么局限" | 不包含默认参数和剩余参数——`function(a, b=1){}` 的 length 是 1 |
| "curry 和 partial application 的区别" | curry 逐步接收所有参数才执行，partial 一次传部分参数立即返回新函数 |
| "实际项目哪里用到柯里化" | 表单校验器工厂——`createValidator(rules)(value)`，把 rules 先固化、value 后传入 |

## 相关阅读

- [bind / call / apply](./bind-call-apply.md) — curry 和 bind 都基于闭包收集参数
- [compose / pipe](./compose-pipe.md) — 函数式编程的另两个核心概念

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐
