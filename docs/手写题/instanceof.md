---
title: instanceof 手写实现
description: 手写 instanceof——沿着原型链查找 prototype，原型链理解的直接检验
category: 手写题
type: practice
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - instanceof
  - 原型链
  - 手写题
---

# instanceof 手写实现

> ⭐⭐⭐⭐｜难度：初级｜手写题必会

**`A instanceof B` 的本质：在 `A.__proto__` 链上找 `B.prototype`。手写 instanceof 是面试检验原型链理解的第一道题。**

## 核心实现

```typescript
function myInstanceof(instance: any, constructor: Function): boolean {
  // 基本类型直接返回 false
  if (instance === null || (typeof instance !== 'object' && typeof instance !== 'function')) {
    return false
  }

  let proto = Object.getPrototypeOf(instance)  // 等价于 instance.__proto__

  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)  // 沿原型链向上查找
  }

  return false  // 到 Object.prototype.__proto__ === null 为止
}

// 测试
console.log(myInstanceof([], Array))       // true
console.log(myInstanceof([], Object))      // true —— 原型链上同时有 Array.prototype 和 Object.prototype
console.log(myInstanceof({}, Array))       // false
console.log(myInstanceof(1, Number))       // false —— 基本类型
console.log(myInstanceof(() => {}, Function)) // true
```

## 关键细节

```typescript
// 1. 处理 Symbol.hasInstance（规范要求）
function myInstanceofStrict(instance: any, constructor: Function): boolean {
  // 如果 constructor 有 Symbol.hasInstance 方法，优先使用
  if (typeof constructor[Symbol.hasInstance] === 'function') {
    return constructor[Symbol.hasInstance](instance)
  }
  // 否则走原型链查找
  return myInstanceof(instance, constructor)
}

// 2. 箭头函数不能做 constructor
// (() => {}).prototype === undefined —— 箭头函数没有 prototype
// myInstanceof(obj, arrowFn) 中 constructor.prototype 为 undefined，循环直接结束返回 false
```

## 面试追问

| 追问 | 回答 |
|------|------|
| "为什么不能用 `__proto__`" | `__proto__` 是旧 API，`Object.create(null)` 的对象没有 `__proto__`。`Object.getPrototypeOf` 是标准 API |
| "instanceof 和 typeof 的区别" | typeof 检查原始类型（number/string/boolean/undefined/symbol/bigint/function/object），instanceof 检查原型链。typeof [] === 'object' 区分不了 Array |
| "instanceof 跨 iframe 为什么失效" | 不同 iframe 有独立的全局执行环境，Array.prototype 是不同的对象。`[] from iframeA instanceof Array from iframeB === false` |

## 相关阅读

- [原型链](../JavaScript/prototype-chain.md)
- [new 操作符](./new.md)
- [Symbol](../JavaScript/symbol.md) — Symbol.hasInstance 的实现

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐
