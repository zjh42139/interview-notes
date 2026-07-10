---
title: Event Loop 面试回答
description: Event Loop 的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# Event Loop 面试回答

> 对应题库：[面试题库/浏览器 Q8](../../面试题库/浏览器.md)

## 30 秒版

JS 是单线程的，Event Loop 是它的异步调度机制。代码分同步和异步，异步又分宏任务和微任务。执行顺序是：一个宏任务执行完 → 清空所有微任务 → 渲染（如果需要）→ 取下一个宏任务。宏任务包括 setTimeout、事件回调、I/O；微任务包括 Promise.then、MutationObserver。这就是为什么 Promise.then 里的代码比 setTimeout 先执行。

---

## 2 分钟版

**第一：为什么需要 Event Loop。**

JS 设计之初就是单线程——为了简单，避免 DOM 操作的并发冲突。但单线程处理异步操作（网络请求、定时器、用户事件）需要一个调度机制，这就是 Event Loop。浏览器给 JS 提供了 Web API（定时器、AJAX、DOM 事件），这些 API 在别的线程执行，完成后把回调推入任务队列，Event Loop 负责从队列中取任务执行。

**第二：宏任务和微任务的执行模型。**

每次 Event Loop 的迭代叫一个 tick。一个 tick 的过程：从宏任务队列中取一个任务执行 → 这个宏任务执行期间可能产生新的微任务 → 宏任务执行完毕后，清空微任务队列（清空的过程中新产生的微任务也会在这个 tick 中执行，直到队列为空）→ 浏览器有机会进行一次渲染 → 下一个 tick 开始。

这意味着两件事。一：微任务总是比下一个宏任务先执行——`Promise.resolve().then()` 一定在下一个 `setTimeout` 回调之前。二：如果在微任务里递归添加微任务，主线程会被永远阻塞——因为微任务队列永远清不完，永远到不了下一个宏任务，也不能渲染。这就是"微任务饿死宏任务"。

**第三：经典代码的执行顺序。**

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')
// 输出：1 4 3 2
```

为什么？`1` 和 `4` 是同步代码，直接执行。`setTimeout` 是宏任务，回调进宏任务队列。`.then` 是微任务，回调进微任务队列。同步代码执行完 → 清空微任务 → `3`。渲染（如果有）→ 取下一个宏任务 → `2`。

**第四：Node.js 的 Event Loop。（加分项）**

浏览器的事件循环和 Node.js 的不一样。Node 有 6 个阶段——timers（setTimeout）、pending callbacks、idle/prepare、poll（I/O）、check（setImmediate）、close callbacks。`process.nextTick` 是一个独立的队列，比任何微任务都优先。如果你能说出 Node 和浏览器的这个差异，面试官会知道你不仅是会用，还知道底层。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "requestAnimationFrame 在哪个位置" | 在微任务清空之后、下一个宏任务之前，浏览器有机会渲染的时候执行。所以 rAF 和微任务的顺序是：宏任务 → 微任务 → rAF → 渲染 → 下一个宏任务 |
| "async/await 和 Event Loop 的关系" | `await` 后面的代码相当于 `.then` 里的回调——放进微任务队列。所以 `await` 下面的代码不会立即执行，要等当前宏任务执行完、清微任务时才跑 |
| "为什么 setTimeout 不准" | setTimeout 的最小延迟是 4ms（嵌套超过 5 层后），而且它只是把回调放入队列——必须等前面的任务执行完才轮到它。一个长任务可能让 setTimeout 延迟几百毫秒才执行 |

---

## 别踩的坑

- "以为 `setTimeout(fn, 0)` 是立即执行"——`0` 不是立即，是最小延迟。实际上是"尽快，但至少 4ms 后，而且必须等前面任务执行完"
- "把 async/await 当成同步"——`await` 之后没有其他操作时执行流程是同步的，但 `await` 本身会将下面的代码变成微任务。跟面试官解释时要说明这个"变成微任务"的机制
- "混淆宏任务和微任务的分类"——Promise.then/catch/finally 和 async/await 的下文是微任务。setTimeout/setInterval/事件回调/postMessage/MessageChannel 是宏任务。区分的关键：微任务在当前宏任务结束后立即执行，宏任务要等下一个 tick
