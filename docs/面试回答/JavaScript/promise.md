---
title: Promise 面试回答稿
description: Promise 相关的逐字面试回答（链式调用 / async-await 区别 / 手写 Promise）
category: 面试回答
type: interview
score: 0
section: JavaScript
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Promise
  - async/await
  - 手写Promise
  - 面试回答
  - 逐字稿
---

# Promise 面试回答稿

> 逐字回答稿，可用于背诵和模拟面试练习。每个回答约 1.5--2 分钟（正常语速 200--240 字/分钟）。

---

## Q1: "Promise为什么能链式调用？"

**预计时长：1分45秒**

---

这个问题问得很好，Promise 能链式调用的根本原因在于——**then 方法每次调用都会返回一个全新的 Promise**，而不是返回 this。

我先说一个容易产生的误解。很多人刚开始学 Promise 的时候，会以为链式调用是类似 jQuery 那种——每个方法返回 this，然后继续操作同一个对象。其实**完全不是一回事**。Promise 的链式调用，本质上是**状态机 + 回调队列 + 新 Promise 的组合机制**。

具体来说分三个层面。

**第一个层面，状态机。**每个 Promise 内部维护一个不可逆的状态——pending、fulfilled、rejected。一旦从 pending 变成 fulfilled 或者 rejected，就永远定格了。这意味着，如果 then 直接返回 this，那链上的每一个 then 拿到的都是同一个 fulfilled 状态的 Promise，根本没法传递不同的值。所以**必须返回新实例**。

**第二个层面，then 的回调注册机制。**当你调用 .then(onFulfilled, onRejected) 的时候，内部会创建一个新的 Promise，然后把 onFulfilled 包装成一个微任务，放到新 Promise 的决议流程里。这里有一个很关键的设计——如果当前 Promise 已经是 settled 状态了，回调会通过 queueMicrotask 异步执行；如果还是 pending，回调就会被**收集到当前 Promise 的回调队列里**，等 resolve 或 reject 的时候统一触发。这就是**发布-订阅模式**在 Promise 里的应用。

**第三个层面，值的传递规则。**then 的回调返回不同东西，行为是不一样的。返回普通值，新 Promise 直接 resolve 那个值；返回一个 Promise，新 Promise 会**等那个 Promise settle 之后才决议**——这就是 Promise Resolution Procedure，也是链式调用中最精妙的部分。

我举个简单的例子，口头描述一下代码：假设有一个 `fetchUser().then(user => fetchOrders(user.id)).then(orders => console.log(orders))`。第一个 then 返回 `fetchOrders` 的结果——本身就是一个 Promise。第二个 then 不会立刻拿到一个 Promise 对象，而是等这个 Promise resolve 之后，拿到的就是真正的 orders 数组。这种**递归展开 thenable** 的能力，才是链式调用的核心。

所以总结一下：链式调用的本质是**then 每次都返回新 Promise + 状态机不可逆 + resolvePromise 递归展开**，三者缺一不可。

---

### 如果面试官继续追问"那如果then里返回一个Promise呢"，你可以这样回答：

对，这正是 Promise/A+ 规范里最核心的部分——Promise Resolution Procedure。简单说，当 then 的回调返回一个值 x 的时候，新 Promise 不会简单地直接 resolve(x)，而是走一个递归解析过程：如果 x 是 Promise 实例，就调用 `x.then(resolve, reject)`，把新 Promise 的决议权**交给 x**——等 x settle 了，新 Promise 才跟着 settle。如果 x 又返回了另一个 Promise，这个过程会继续递归下去。这就是为什么你可以无限 `.then().then().then()` 下去，每一层都在等上一层的 Promise 解开。

---

## Q2: "Promise和async/await的区别？"

**预计时长：2分钟**

---

async/await 本质上是 Promise 的语法糖，这一点毋庸置疑——Babel 编译 async/await 的时候，就是把它转成 Generator + Promise。但是，**语法糖和实际使用体验是两码事**，它们在代码可读性、错误处理和调试上有着本质区别。

**第一，写法上的区别。**Promise 用 .then 链式调用，代码是横向增长的——你会发现回调嵌套变成链式，链式长了变成"链式地狱"，特别是需要中间变量的时候，得在链外面声明变量，或者通过 then 一层层往下传。而 async/await 是**同步风格的代码**，从上到下按顺序写，中间的值直接用变量存就行，可读性完全不在一个量级。

**第二，错误处理。**Promise 的错误处理是 .catch() 在链的末尾统一兜底，问题是你不好定位错误到底是从哪一层抛出来的。async/await 直接用 **try-catch**，跟同步代码的错误处理习惯一模一样，可以精确地捕获到是哪个 await 炸了。

**第三，调试体验。**这一点面试官可能不太常问，但在实际开发中差别巨大。async/await 里设置断点，在 await 那一行停住然后 step over —— 你期望的效果是跳到下一行。但是在 .then 链里，你设置断点以后 step over 可能跳到了 Promise 内部的实现代码，或者跳到别的回调里了，调试体验真的很割裂。

**第四，中间值的问题。**用 Promise 的时候，如果第二个请求依赖第一个请求的结果，而第三个又分别依赖前两个的结果，用 then 就得在外部声明变量或者嵌套闭包。用 async/await 的话，`const user = await fetchUser()`，`const orders = await fetchOrders(user.id)`，值全在同一个作用域里，自然地存下来。

**至于什么时候该用哪个**——简单任务、只有一两个异步操作的，直接用 then 就行，干净利落。但如果超过三层依赖，或者需要 try-catch 精确捕获错误，或者多个请求之间需要复用中间值，**我肯定选 async/await**。

性能上其实有一点需要注意：`return await` 比 `return` 多产生一个微任务，所以在 try-catch 外面直接 return 一个 Promise 就够了，不用加 await。但是 try-catch 里面必须 `return await`，否则 reject 不会被 catch 到——这是一个很容易出错的细节。

---

### 如果面试官追问"async/await怎么处理并发"，你可以这样回答：

async/await 本身是串行的——如果写三个 await 连着来，第二个要等第一个结束才开始。如果这三个请求彼此没有依赖关系，这种写法就很浪费性能。正确做法是用 **Promise.all** 配合 await：`const [users, roles, perms] = await Promise.all([fetchUsers(), fetchRoles(), fetchPermissions()])`。注意这里的关键是，三个 fetch 是同时发出的，Promise.all 只等最慢的那一个。在我们后台管理系统的 Dashboard 页面，用户信息、角色列表、权限数据三个接口如果不加 Promise.all 串行执行需要将近 3 秒，加了并行之后 1 秒内全部搞定——这个优化效果非常显著。

---

## Q3: "手写一个Promise"（边说边写稿）

**预计时长：写代码 8--10 分钟 + 口述同步进行**

> 以下是在白板/编辑器上手写 Promise 时，你一边写一边说的话。代码写到哪里就说到哪里，不要一口气背完。

---

### 步骤 1：先搭骨架（边写边说）

"我先写一个 MyPromise 类的大骨架。Promise 有三个状态——PENDING、FULFILLED、REJECTED——我用一个枚举或者直接定义三个常量来表示。**核心是三个实例字段：state 表示当前状态、value 存储成功的值、reason 存储失败的原因。**"

```js
class MyPromise {
  static PENDING = "pending"
  static FULFILLED = "fulfilled"
  static REJECTED = "rejected"

  constructor(executor) {
    this.state = MyPromise.PENDING
    this.value = null
    this.reason = null
    // 两个回调队列 —— 因为同一个 Promise 可以被 .then 多次
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
  }
}
```

---

### 步骤 2：写 constructor 里的 resolve 和 reject（边写边说）

"接下来写 resolve 和 reject 方法。**关键点是状态锁——只有 PENDING 状态才能改变**，已经 settled 就不能再改，这就是 Promise 不可逆的核心。

resolve 的时候，把 state 改成 FULFILLED，存下值，然后**把所有收集到的 onFulfilled 回调遍历执行**——这就是发布-订阅模式的通知阶段。

reject 同理，改成 REJECTED，存下原因，执行所有 onRejected 回调。**最后用 try-catch 包住 executor 的执行**，万一 executor 里抛了同步错误，自动 reject。"

```js
constructor(executor) {
  // ... 前面的字段定义

  const resolve = (value) => {
    if (this.state !== MyPromise.PENDING) return  // 状态锁
    this.state = MyPromise.FULFILLED
    this.value = value
    this.onFulfilledCallbacks.forEach(fn => fn())
  }

  const reject = (reason) => {
    if (this.state !== MyPromise.PENDING) return
    this.state = MyPromise.REJECTED
    this.reason = reason
    this.onRejectedCallbacks.forEach(fn => fn())
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}
```

---

### 步骤 3：写 then 方法（边写边说）

"接下来是**最核心的 then 方法**。then 要做三件事：

第一，**值穿透处理**——如果 onFulfilled 或 onRejected 不是函数，就给它一个默认的，成功透传值，失败抛出错误。这样 `.then(null).then(v => console.log(v))` 才能正常工作。

第二，**返回新 Promise**——这是链式调用的基础。

第三，**根据当前状态决定行为**——如果已经是 FULFILLED，就把 onFulfilled 作为微任务执行；如果是 REJECTED，就把 onRejected 作为微任务执行；如果还是 PENDING，就把回调收集到队列里，等 settle 了再执行。

**最重要的是执行回调后拿到结果 x，要通过 resolvePromise 来递归解析**——因为 x 可能又是一个 Promise。"

```js
then(onFulfilled, onRejected) {
  // 值穿透
  onFulfilled = typeof onFulfilled === "function"
    ? onFulfilled
    : value => value
  onRejected = typeof onRejected === "function"
    ? onRejected
    : reason => { throw reason }

  const promise2 = new MyPromise((resolve, reject) => {
    if (this.state === MyPromise.FULFILLED) {
      queueMicrotask(() => {
        try {
          const x = onFulfilled(this.value)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    } else if (this.state === MyPromise.REJECTED) {
      queueMicrotask(() => {
        try {
          const x = onRejected(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    } else if (this.state === MyPromise.PENDING) {
      this.onFulfilledCallbacks.push(() => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
      this.onRejectedCallbacks.push(() => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  })

  return promise2
}
```

---

### 步骤 4：写 resolvePromise（边写边说）

"**这是整个手写 Promise 中最难、也是最体现功底的部分。**resolvePromise 的作用是根据回调返回值 x，来决定新 Promise promise2 的命运。

**有四条规则：**

第一，**不能循环引用**——如果 x 和 promise2 是同一个对象，直接 reject 一个 TypeError，否则会无限递归。

第二，**如果 x 是 MyPromise 实例**——就调用 `x.then(v => resolvePromise(promise2, v, resolve, reject), reject)`，把 promise2 的决议权委托给 x。

第三，**如果 x 是 thenable 对象**——也就是一个对象或者函数，有 then 方法——那就调用这个 then，并且用 called 标志防止重复调用。这也是为了兼容其他 Promise 实现。

第四，**普通值直接 resolve**。"

```js
function resolvePromise(promise2, x, resolve, reject) {
  // 1. 循环引用检查
  if (promise2 === x) {
    return reject(new TypeError("Chaining cycle detected"))
  }

  // 2. x 是 MyPromise 实例
  if (x instanceof MyPromise) {
    x.then(
      v => resolvePromise(promise2, v, resolve, reject),
      reject
    )
    return
  }

  // 3. x 是 thenable 对象/函数
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    let called = false
    try {
      const then = x.then
      if (typeof then === "function") {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (!called) {
        called = true
        reject(e)
      }
    }
    return
  }

  // 4. 普通值
  resolve(x)
}
```

---

### 写到这一步，你可以主动说：

"这部分代码写到这里，核心的 constructor + then + resolvePromise 三大块就基本完成了。这四个要点——**状态不可逆、then 返回新 Promise、微任务调度、resolvePromise 递归展开**——覆盖了 Promise/A+ 规范中最核心的部分。"

---

### 步骤 5：最后补上静态方法（加分项）

"如果时间允许，我再补两个常用的静态方法。**Promise.resolve 和 Promise.reject**：resolve 要兼容传入已经是 Promise 的情况；reject 就简单了，直接返回一个 rejected 状态的 Promise。

**Promise.all** 是面试中手写频率最高的静态方法：接收一个数组，返回新 Promise。关键是用一个计数器 count——每个 Promise resolve 时 count 加一，当 count 等于总长度时，说明全部完成，resolve 结果数组。任何一个 reject 就整体 reject。

```js
static resolve(value) {
  if (value instanceof MyPromise) return value
  return new MyPromise(resolve => resolve(value))
}

static reject(reason) {
  return new MyPromise((_, reject) => reject(reason))
}

static all(promises) {
  return new MyPromise((resolve, reject) => {
    if (promises.length === 0) return resolve([])
    const results = new Array(promises.length)
    let count = 0
    for (let i = 0; i < promises.length; i++) {
      MyPromise.resolve(promises[i]).then(
        value => {
          results[i] = value
          if (++count === promises.length) resolve(results)
        },
        reject
      )
    }
  })
}
```

---

### 完成后总结（放下笔/键盘，面向面试官说）

"这是简化版的 Promise 实现，完整版其实还需要考虑——构造函数里 resolve 传了 Promise 的情况需要递归解析；finally 方法的实现，它要透传原值但要等回调执行完；还有 allSettled、any、race 这几个静态方法。

但我认为**核心就这两个点**：**then 必须返回新 Promise**，以及 **resolvePromise 对 thenable 的递归展开**。只要理解了这两点，Promise 的链式调用、异步流程控制、甚至 async/await 的底层原理——这些都能串起来理解了。"

---

## 相关阅读

- [JavaScript Promise 知识文档](../../JavaScript/promise.md)
- [JavaScript async/await 知识文档](../../JavaScript/async-await.md)
- [手写题 Promise 知识文档](../../手写题/promise.md)
- [JavaScript Event Loop 知识文档](../../JavaScript/event-loop.md)

## 更新记录

- 2026-07-05：Phase 2 填充完整回答稿（3 道题，含逐字稿 + 边说边写 + 追问应对）
