---
title: Promise 面试回答
description: 面试中如何回答 Promise——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-10
reviewed: null
tags:
  - Promise
  - async/await
  - 链式调用
  - 面试回答
---

# Promise 面试回答

## Q1: Promise 的链式调用是怎么实现的？

### 30 秒版本

"`.then` 每次调用都返回一个**全新的 Promise**，不是返回 this。新 Promise 的状态取决于回调函数的返回值——返回普通值 resolve、返回 Promise 则等待它的结果、抛异常 reject。这就是链式调用的核心机制。"

### 2 分钟版本

"Promise 能链式调用的根本原因在于 `.then()` 每次返回一个新 Promise，而不是 this。这和 jQuery 的链式调用完全不同——jQuery 链式是每个方法返回 this 继续操作同一个对象，Promise 链式是每个 `.then` 创建一个新的状态容器。

具体流程：第一个 `.then` 的回调执行→返回值→`.then` 内部用 `Promise.resolve(返回值)` 包装→返回新 Promise→下一个 `.then` 注册到新 Promise 上。

**值的传递**：回调返回普通值→新 Promise resolve 这个值→下一个 `.then` 拿到它。回调返回 Promise→新 Promise "等待"这个 Promise 的结果→resolve/reject 透传到下一个 `.then`。回调抛异常→新 Promise reject→被后面的 `.catch` 捕获。

**链式断裂**：如果 `.then` 回调里没有 return（返回 undefined），下一个 `.then` 收到的就是 undefined——链断了但不报错。这是最常见的 Promise 使用错误。

**async/await 的区别**：async/await 可以理解为 Promise 模式的语法封装。async 函数始终返回 Promise；await 暂停函数执行等待 Promise settle。`try/catch` 替代了 `.catch()`，代码读起来像同步。但本质上还是 Promise——await 后面接非 Promise 值时，JS 内部用 `Promise.resolve()` 包装。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "async/await 和 Promise 怎么选" | async/await 可读性更好——特别是多个异步操作有依赖关系时（"先获取用户、再获取权限"）。独立并发请求用 `Promise.all` 更好 |
| "Promise.all 一个失败会怎样" | 立即 reject——返回第一个失败的 reason。其他还在执行的请求不会停止（Promise 创建后无法取消），但结果被忽略 |
| "Promise.allSettled 和 all 的区别" | allSettled 等全部 settle——不管成败。返回 `[{status:'fulfilled',value},{status:'rejected',reason}]`。场景：批量操作不能因为一个失败全停 |

## Q2: 手写 Promise 怎么说？

### 30 秒版本

"手写 Promise 骨架分三部分：构造函数定义状态机和 resolve/reject、`.then` 收集回调并返回新 Promise、`.catch` 是 `.then(null, onRejected)` 的简写。核心难点是回调队列——promise 可能在 `.then` 注册之前就 resolve 了，所以需要用队列存回调。"

### 2 分钟版本

"手写 Promise 的骨架——构造函数里维护三种状态（pending/fulfilled/rejected），resolve 把状态改为 fulfilled 并执行成功回调，reject 改 rejected 执行失败回调。`.then` 返回新 Promise——如果当前 promise 已经 settled，直接用返回值 resolve 或 reject 新 promise；如果还在 pending，把回调存进队列。

三个关键细节：1) 状态不可逆——`pending → fulfilled` 之后不能再变；2) resolve 的值为另一个 Promise 时——需要递归等待；3) `.then` 的回调是异步执行的——用 `queueMicrotask(fn)`（或 `Promise.resolve().then(fn)`）模拟微任务。

面试不要求手写完整 Promises/A+ 规范——能把构造函数 + `.then` + 链式调用写清楚就够了。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "为什么 `.then` 回调要异步执行" | Promises/A+ 规范要求——onFulfilled 和 onRejected 必须作为微任务执行。确保 `.then` 注册时 promise 的状态和回调的执行顺序是可预测的 |
| "Promise.resolve() 和 new Promise(resolve => resolve()) 区别" | Promise.resolve 对传入的 thenable 对象会尝试展开（递归解析），new Promise 不会。Promise.resolve(promise) 直接返回同一个 promise |

## 别踩的坑

1. **"async/await 是同步的"** —— await 后面的代码被拆成了 `.then` 回调——是异步微任务。面试中说"await 变同步了"减分
2. **Promise 构造函数里抛异常** —— 自动被 catch 住并 reject。这和普通回调函数不同
3. **for 循环里用 await vs forEach** —— `forEach` 的回调不会等 await——因为 `forEach` 的实现不处理返回的 Promise。`for...of` + `await` 才会串行执行

## 相关阅读

- [Promise 知识文档](../../JavaScript/promise.md)
- [手写 Promise](../../手写题/promise.md)
- [Event Loop 面试回答](./event-loop.md)

## 更新记录

- 2026-07-10：重构（30秒/2分钟/追问预判/易错点 标准格式）
