---
title: 原型链 面试回答
description: 面试中如何回答原型链——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - 原型链
  - prototype
  - __proto__
  - instanceof
  - 面试回答
---

# 原型链 面试回答

## Q1: 原型链是什么？prototype 和 `__proto__` 有什么区别？

### 30 秒版本

"JS 靠原型链实现继承——每个对象都有 `__proto__` 指向它的原型，原型又有自己的原型，一层层往上直到 null。`prototype` 是函数才有的属性——用这个函数 new 出来的对象，`__proto__` 指向函数的 `prototype`。"

### 2 分钟版本

"记住两条线：

**构造器线（Function 这边）**：每个函数都有 `prototype` 属性——指向一个对象，这个对象里放了所有实例共享的方法。比如 `Array.prototype.push`，所有数组实例都能用 `push`——它们不从实例上找，顺着 `__proto__` 到 `Array.prototype` 找。

**实例线（Object 这边）**：每个对象都有 `__proto__`——指向构造它的函数的 `prototype`。`const arr = [1,2,3]`，`arr.__proto__ === Array.prototype`。`arr.__proto__.__proto__ === Object.prototype`。再往上 `Object.prototype.__proto__ === null`——原型链的终点。

**一句话区分**：`prototype` 是函数独有的——"我给未来的实例准备的原型对象"；`__proto__` 是所有对象都有的——"我顺着它去找属性和方法"。`Object.getPrototypeOf(obj)` 是标准 API，比 `__proto__` 更推荐。

**instanceof 的原理**：`A instanceof B` 就是在 `A.__proto__` 链上找 `B.prototype`。`[] instanceof Array` —— `[].__proto__ === Array.prototype` → true。`[] instanceof Object` → `[].__proto__.__proto__ === Object.prototype` → true。这就是为什么"数组 instanceof 什么都是 true"。

**class 的本质**：`class` 是 prototype 的语法糖。`class Dog extends Animal` 底层就是 `Dog.prototype.__proto__ = Animal.prototype`。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "class 和 function 构造函数的区别" | class 是语法糖——底层还是 prototype。区别：class 必须 new 调用、内部自动严格模式、方法不可枚举、有 TDZ。继承上 class 的 extends 同时设置了 constructor.prototype 和 `__proto__` 两条链 |
| "怎么判断一个属性是实例自身的还是原型上的" | `obj.hasOwnProperty('prop')` 或 `Object.hasOwn(obj, 'prop')`。for...in 会遍历原型上的可枚举属性——要加 hasOwnProperty 守卫 |
| "为什么 `Object.prototype` 的 `__proto__` 是 null" | 原型链必须有个终点，否则会无限循环。null 就是原型链的终点——访问 `.toString()` 找到 Object.prototype 就停了 |

## 别踩的坑

1. **`__proto__` 和 `prototype` 搞反** —— `prototype` 只有函数有，`__proto__` 所有对象都有。面试说反了基本挂
2. **"prototype 是函数的原型"** —— 不能说"函数的原型"——这是自我指涉。应该说"函数 new 出来的对象的原型"
3. **修改原型影响所有实例** —— `Array.prototype.myMethod = ...` 会影响所有数组。这是危险的——生产代码中库之间可能冲突

## 相关阅读

- [原型链 知识文档](../../JavaScript/prototype-chain.md)
- [class / extends / super](../../JavaScript/class-extends.md)
- [闭包 面试回答](./closure.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）
