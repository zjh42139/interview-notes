---
title: Promise.all / allSettled / any / race
description: 手写 Promise 四个静态方法的完整实现，含边界处理和面试技巧
category: 手写题
type: exercise
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - Promise
  - Promise.all
  - Promise.allSettled
  - Promise.race
  - Promise.any
  - 手写题
---

# Promise.all / allSettled / any / race

> &#11088;&#11088;&#11088;&#11088;&#11088;｜难度：中级&#9733;&#9733;&#9733;

## 一句话总结

**四个并发方法的核心差异：all 一个失败全失败、allSettled 等全部结束、race 取第一个完成（不管成败）、any 取第一个成功（全失败才拒绝）。实现上 all 和 allSettled 本质相同——区别只在遇到 reject 时是立即失败还是继续等。**

## Promise.all

### 题目

手写 `Promise.all`：接收 promise 数组，全部成功时 resolve 结果数组，有一个失败就 reject。

### 思路

计数器模式——用一个 count 变量记录完成数量。每个 promise resolve 时 count++，当 count === 总数时 resolve 结果数组。任何一个 reject 就立即 reject。注意：结果数组中值的顺序要和 promises 数组顺序一致，不是按完成顺序。

### 基础版实现

```javascript
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'))
    }

    const results = new Array(promises.length)
    let settledCount = 0

    if (promises.length === 0) {
      return resolve(results)  // 空数组直接 resolve
    }

    promises.forEach((promise, index) => {
      // 用 Promise.resolve 包一层——兼容非 Promise 值
      Promise.resolve(promise).then(
        value => {
          results[index] = value      // 按原始顺序存结果
          settledCount++
          if (settledCount === promises.length) {
            resolve(results)
          }
        },
        reason => {
          reject(reason)              // 一个失败→整体失败
        }
      )
    })
  })
}
```

### 边界处理

```javascript
// 1. 空数组 → 立即 resolve([])
Promise.myAll([])  // Promise { [] }

// 2. 非 Promise 值 → 自动包装
Promise.myAll([1, 2, 3])  // Promise { [1, 2, 3] }

// 3. 可迭代对象 → 先转数组或使用 for...of
Promise.myAll = function(iterable) {
  const promises = Array.from(iterable)
  // ... 同上
}

// 4. 如果一个 reject 了，其他还在执行的 promise 不会停止
//    因为 Promise 一旦创建就无法取消
```

---

## Promise.allSettled

### 题目

`allSettled` 和 `all` 的唯一区别：不管成败，等所有 promise 都 settle 之后才 resolve。每个结果都是 `{ status: 'fulfilled', value }` 或 `{ status: 'rejected', reason }`。

### 实现

```javascript
Promise.myAllSettled = function(promises) {
  return new Promise((resolve) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'))
    }

    const results = new Array(promises.length)
    let settledCount = 0

    if (promises.length === 0) {
      return resolve(results)
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          results[index] = { status: 'fulfilled', value }
        },
        reason => {
          results[index] = { status: 'rejected', reason }
          // ⬆ 关键：reject 不阻止继续等，只是记录失败结果
        }
      ).finally(() => {
        // 无论成功失败，settledCount 都 +1
        settledCount++
        if (settledCount === promises.length) {
          resolve(results)
        }
      })
    })
  })
}
```

**为什么 finally 更好**：成功和失败都要计数。在 `.then(onFulfilled, onRejected)` 的两个回调里都写 `settledCount++` 有重复——`.finally` 里写一次就够了。

---

## Promise.race

### 题目

`race` 接收 promise 数组，返回第一个 settle（不管成功或失败）的结果。

### 实现

```javascript
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'))
    }

    for (const promise of promises) {
      Promise.resolve(promise).then(resolve, reject)
      // 注意：这里没有 return——Promise 一旦 settled 就不能改变
      // 第一个完成的自动 resolve/reject 了外面的 Promise
      // 后面完成的 .then 调用会被忽略
    }
  })
}
```

**关键理解**：Promise 状态一旦确定就不会再变。第一个完成的 promise 已经让外层的 Promise settled 了——后面完成的 `.then(resolve, reject)` 中 resolve/reject 不会再有效果。

### race 的实际用途——超时控制

```javascript
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('请求超时')), timeout)
    )
  ])
}
```

---

## Promise.any

### 题目

`any` 和 `race` 相反：返回第一个成功的。只有全部失败时才 reject（抛 AggregateError）。

### 实现

```javascript
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'))
    }

    const errors = new Array(promises.length)
    let rejectedCount = 0

    if (promises.length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'))
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          resolve(value) // 第一个成功直接 resolve
        },
        reason => {
          errors[index] = reason
          rejectedCount++
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'))
          }
        }
      )
    })
  })
}
```

---

## 四合一对比

| 方法 | 成功条件 | 失败条件 | 返回值 | 场景 |
|------|----------|----------|--------|------|
| **all** | 全部成功 | 任意一个失败 | 结果数组 | 批量请求——一个失败全停 |
| **allSettled** | 全部 settle | 永远不 reject | `{status, value/reason}[]` | 批量操作——部分失败不影响 |
| **race** | 第一个 settle | 第一个 settle 且失败 | 单个结果 | 超时控制——谁快用谁 |
| **any** | 任意一个成功 | 全部失败 | 单个成功值 | 多 CDN 降级——哪个快拿哪个 |

## 易错点

1. **all 一个失败就全失败——但其他请求还在跑**。Promise 创建后无法取消——那些还在执行的请求结果会被丢弃。这和很多人的直觉相反
2. **race 和 any 的区别是高频考点** —— race 看谁先 settle（不管成败），any 看谁先成功。面试官经常会混淆两者来设陷阱
3. **all 结果顺序跟完成顺序无关** —— 用 index 存结果，而不是 push 进数组。push 会让结果顺序变成完成顺序
4. **空数组的 all([]) 立刻 resolve** —— 这个边界很少有人注意。ES2020 后 `allSettled([])` 也一样立刻 resolve

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "all 和 allSettled 有什么区别" | 追问什么时候用 allSettled（批量操作不能因为一个失败全停） |
| "race 和 any 有什么区别" | 追问各自的实际场景（超时 vs 多 CDN） |
| "all 怎么保证结果顺序" | 追问为什么用 index 而不是 push |
| "怎么让 race 支持取消" | 追问 AbortController——取消未完成的请求 |

## 相关阅读

- [Promise 原理](../JavaScript/promise.md)
- [手写 Promise](./promise.md)
- [async / await](../JavaScript/async-await.md)

## 更新记录

- 2026-07-10：新建（all/allSettled/race/any 四合一对比 + 完整实现 + 边界处理）
