---
title: var / let / const 面试回答
description: 面试中如何回答 var/let/const 区别——变量提升、暂时性死区、块级作用域、const 本质
category: 面试回答
type: interview
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - JavaScript
  - var
  - let
  - const
  - 变量提升
  - 面试回答
---

# var / let / const 面试回答

> 基础题的深度考法——不是"var 有提升 let 没有"，而是"let 也有提升，只是有暂时性死区"。

## Q1: var、let、const 有什么区别？变量提升是什么？

### 30 秒版本

"三个区别——作用域（var 函数级/let 块级）、变量提升（var 提升并初始化 undefined/let 提升但不初始化——暂时性死区）、重复声明（var 可以/let 不行）。const 跟 let 一样只是不能重新赋值——对象属性可以改。const 是引用锁定不是值锁定。"

### 2 分钟版本

**var 的问题**——三个坑：

```javascript
// 坑1：变量提升 + 初始化为 undefined
console.log(a); // undefined——没报错但拿到 undefined
var a = 1;

// 坑2：无块级作用域
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3, 3, 3——不是 0, 1, 2
}

// 坑3：可重复声明
var x = 1;
var x = 2; // 不报错——坑
```

**let/const 的暂时性死区（TDZ）**——很多人说"let 没有变量提升"是错的：

```javascript
console.log(b); // ReferenceError——说明 b 存在于作用域中但未初始化
let b = 1;
// 从块开始到 let b 声明之前的区域就是 TDZ——变量存在但不能访问
```

let/const 有提升——JS 引擎在进入作用域时就注册了变量——只是不初始化为 undefined，访问它就抛 ReferenceError。

**const 的引用锁定**——`const obj = { a: 1 }` 后 `obj.a = 2` 可以，但 `obj = {}` 不行。const 锁定的是变量和内存地址的绑定关系——对象的属性不受影响。需要真正不可变用 `Object.freeze(obj)`。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "为什么说 let 也有变量提升" | JS 引擎在进入块级作用域时就创建了 let 变量——只是放到 TDZ 里。如果没提升，`let x = x` 应该报 x is not defined 而不是 TDZ 错误 |
| "for 循环里 var 和 let 有什么区别" | var 只创建一个绑定 i——循环结束 i=3。let 每次迭代创建新的绑定——每个定时器捕获自己的 i 值 |
| "const 声明对象属性能改吗" | 能——const 锁引用不锁内容。true 不可变用 Object.freeze() + 递归深冻结 |

## 别踩的坑

1. **"let 没有变量提升"** —— 被面试官追问 TDZ 会露馅。
2. **const 以为是值不可变** —— 面试官给 `const obj = {a:1}; obj.a=2` 让你判断——不报错。
3. **在声明前使用变量** —— var 拿到 undefined 是 bug 的来源，let 报 ReferenceError 是提示你写法有问题。

## 相关阅读

- [闭包](./closure.md)
- [闭包](./closure.md)

## 更新记录

- 2026-07-15：新建（TDZ 深度解释 + var 三坑 + const 引用锁定量）
