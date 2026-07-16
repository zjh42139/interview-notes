---
title: "var / let / const 与变量提升"
description: var 提升+初始化 undefined、let/const 暂时性死区、块级作用域、for 循环中的经典闭包问题
category: JavaScript
type: mechanism
score: 85
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - var
  - let
  - const
  - 变量提升
  - TDZ
---

# var / let / const 与变量提升

> ⭐⭐⭐⭐⭐｜难度：初级

## 一句话总结

**var 有变量提升且初始化为 undefined；let/const 也有提升但进入暂时性死区（TDZ），声明前访问抛 ReferenceError；const 锁定引用而非值。三者区别 = 作用域 + 提升行为 + 重复声明三个维度。**

## 核心机制

### var —— 函数级作用域 + 提升 + 初始化为 undefined

```javascript
// var 的提升：声明被提到作用域顶部，初始化为 undefined
console.log(a); // undefined —— 没报错但拿到 undefined
var a = 1;

// 等价于：
var a = undefined;
console.log(a);
a = 1;

// 函数级作用域 —— 块级（if/for）不起作用
if (true) { var x = 1; }
console.log(x); // 1 —— 没有块级隔离

// for 循环经典问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3, 3, 3
}
// i 是同一个变量——循环结束时 i=3，三个回调全读到 3

// 可重复声明——隐藏的 bug 来源
var y = 1;
var y = 2; // 不报错
```

### let / const —— 块级作用域 + 暂时性死区

```javascript
// 块级作用域
if (true) { let x = 1; }
// console.log(x); // ReferenceError —— 块外不可见

// for 循环中的 let —— 每次迭代创建新的绑定
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 0, 1, 2
}

// TDZ：声明前访问抛 ReferenceError
// console.log(b); // ❌ ReferenceError: Cannot access 'b' before initialization
let b = 1;

// 不可重复声明
let c = 1;
// let c = 2; // ❌ SyntaxError
```

### const —— 引用锁定非值锁定

```javascript
const obj = { a: 1 };
obj.a = 2;        // ✅ 属性可改——const 锁引用不锁值
// obj = {};      // ❌ TypeError —— 不能重新赋值

const arr = [1, 2];
arr.push(3);       // ✅ 数组内容可改
// arr = [1, 2, 3]; // ❌

// 真不可变需要 Object.freeze() 或 as const（TS）
```

### 三者对比

| | var | let | const |
|---|:---:|:---:|:---:|
| 作用域 | 函数级 | 块级 | 块级 |
| 提升 | 提升并初始化为 undefined | 提升但 TDZ | 提升但 TDZ |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局声明 | 挂到 window | 不挂 window | 不挂 window |

## 深度拓展

### TDZ 的本质

很多人说"let 没有变量提升"是错的。JS 引擎在进入块级作用域时就创建了 let/const 变量（词法环境已注册），但标记为"未初始化"。从块开始到声明语句执行完之前，变量存在但不可访问——这就是 TDZ。

```javascript
// 证明 let 也有提升
let x = 1;
{
  // console.log(x); // ❌ TDZ——不是"访问外层的 x=1"
  let x = 2;         // 这个声明让块内的 x 进入 TDZ
}
// 如果 let 没提升，内层应该读到外层的 1——但实际报 ReferenceError
```

**为什么需要 TDZ？** 让声明前使用成为明确的错误——var 的 undefined 太容易产生 bug。const 更需要 TDZ——const 声明后不可改，声明前读取 undefined 毫无意义。

### for 循环底层差异

```javascript
// var —— 一个变量绑定，循环体内所有异步回调共享
for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i)); } // 3,3,3

// let —— 每次迭代创建新的词法环境，i 有独立绑定
for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i)); } // 0,1,2
// 等价于：
for (let i = 0; i < 3; i++) {
  let _i = i; // 每次迭代捕获当前值
  setTimeout(() => console.log(_i));
}
```

## 易错点

❌ **let 没有变量提升** —— 面试官追问 TDZ 就会暴露。准确说法："let 也有提升，但不初始化为 undefined，而是进入暂时性死区"。

❌ **const 声明对象后属性不可改** —— `const obj = {a:1}; obj.a = 2` 完全合法。const 锁定变量名和内存地址的绑定，不关心地址里存的内容。

❌ **全局 var 挂 window，let 不挂** —— `var a = 1` 后 `window.a === 1`；`let a = 1` 后 `window.a === undefined`。这是两种声明在全局作用域的不同行为。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "var 和 let 有什么区别" | 追问 TDZ——"let 有变量提升吗" |
| "const 声明的对象能改吗" | 追问"那什么才能真正不可变" → Object.freeze / Immutable.js |
| "for 循环 var 和 let 有什么不同" | 追问底层机制——每次迭代新绑定 |
| "什么是暂时性死区" | 追问"为什么需要 TDZ"——避免声明前使用的 bug |

## 相关阅读

- [闭包](./closure.md) —— for 循环 + var/let 的经典闭包问题
- [块级作用域与作用域链](./closure.md#作用域链)
- [面试回答：var / let / const](../面试回答/JavaScript/var-let-const.md) 🎤

## 更新记录

- 2026-07-16：新建——覆盖提升+TDZ+块级作用域+for循环差异+全局挂载行为
