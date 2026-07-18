---
title: async/await 面试回答
description: 面试中如何回答 async/await——Generator 语法糖、错误处理、并行优化、与 Promise 的关系
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
  - JavaScript
  - async/await
  - Promise
  - 面试回答
---

# async/await 面试回答

> 几乎每轮面试必问。async/await 不是替代 Promise，而是在 Promise 之上的一层更自然的语法。

## Q1: async/await 是什么？和 Promise 有什么关系？

### 30 秒版本

"async/await 是 Promise 的语法糖——async 函数始终返回 Promise，await 等待 Promise 结果。它让异步代码看起来像同步代码——不用 .then() 链式嵌套。错误处理直接 try/catch，比 Promise 的 .catch() 更自然。"

### 2 分钟版本

**本质**：async 函数内部是 Generator 函数的语法糖——自动执行 Generator，每次 yield 一个 Promise，等待完成后继续。Babel 编译 async/await 就是用的 Generator + 自动执行器。

**三个关键行为**：
1. async 函数始终返回 Promise——即使你 return 一个普通值，也会被包成 Promise.resolve()
2. await 通常用在 async 函数内——它会暂停函数执行直到 Promise settle。ES2022 起支持顶层 await（Top-level await），ES Module 中可以直接在模块顶层使用 await
3. await 后面的代码相当于 .then() 里的回调——在微任务队列中执行

**错误处理**：async/await 用 try/catch 捕获错误——比 Promise 的 .catch() 更符合同步代码的习惯。

```javascript
// ❌ 嵌套地狱
fetchUser().then(user => fetchOrders(user.id).then(orders => ...))

// ✅ async/await
async function load() {
  const user = await fetchUser();
  const orders = await fetchOrders(user.id);
}
```

**性能陷阱**——连续 await 独立请求会串行执行：

```javascript
// ❌ 慢：先等 user 再等 orders——两个请求完全独立却串行
const user = await fetchUser();
const orders = await fetchOrders();

// ✅ 快：两个请求并行发出，同时等待结果
const [user, orders] = await Promise.all([fetchUser(), fetchOrders()]);
```

面试说出现这个陷阱并给出 Promise.all 修复方案，比只背定义有用得多。

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "async 函数返回的是什么" | Promise——即使你 return 原始值，JS 自动包成 Promise.resolve() |
| "await 后面的代码什么时候执行" | 作为微任务执行——await 一个已 resolve 的原生 Promise 只花 1 个 tick（ES2019 优化后）；但 async 函数 return 一个 Promise 要额外多 2 个 tick（thenable 采纳）。输出题里"某个数字排最后"多半是这个原因 |
| "多个 await 有什么问题" | 独立请求被串行化——本来可以并行的变慢。用 Promise.all 同时发出 |

## 别踩的坑

1. **循环里用 await** —— `for` 循环里 await 是串行的——每条等前一条完成。独立任务应该用 `Promise.all(arr.map(fn))`。
2. **用 try/catch 包整个函数** —— 太大，catch 不到具体哪个 await 出错。关键操作单独 try/catch。
3. **忘记 async 函数返回 Promise** —— `const result = asyncFn()` 拿到的是 Promise，不是返回值。

## 相关阅读

- [Promise](./promise.md)
- [Event Loop](./event-loop.md)
- [async/await 原理](../../JavaScript/async-await.md)

## 更新记录

- 2026-07-18：Phase 4 对齐——追问"await 后代码执行时机"改为与知识文件一致（await 已 resolve 原生 Promise 1 tick；async return Promise 额外 +2 tick）
- 2026-07-15：新建（Generator 语法糖本质 + 性能陷阱 + try/catch 模式）
