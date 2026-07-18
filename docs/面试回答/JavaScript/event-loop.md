---
title: Event Loop 面试回答
description: 面试中如何回答 Event Loop——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - Event Loop
  - 宏任务
  - 微任务
  - 面试回答
---

# Event Loop 面试回答

## Q1: 说说 Event Loop 的执行机制

### 30 秒版本

"JS 是单线程的——一次只做一件事。Event Loop 是任务调度机制：同步代码先跑完 → 清空微任务队列（Promise.then）→ 取一个宏任务（setTimeout）→ 再清空微任务 → 可能渲染 → 循环。微任务优先级高于宏任务。"

### 2 分钟版本

"关键是区分三种队列的优先级：

**同步代码**：主线程执行栈，按顺序跑。Promise 的 executor 函数也是同步的——这是最容易被坑的地方。`new Promise(resolve => console.log(1))`——这个 `1` 是同步打印的。

**微任务（Microtask）**：Promise.then/catch/finally、MutationObserver、queueMicrotask。**在当前宏任务执行完后、下一个宏任务开始前，必须清空整个微任务队列。** 清空过程中新产生的微任务也会在同一次清空中执行——递归添加微任务会饿死宏任务，永远到不了下一个宏任务。

**宏任务（Macrotask）**：setTimeout/setInterval、I/O、setImmediate(Node)、MessageChannel。每次只取一个宏任务执行。注意：UI 渲染是 Event Loop 中的独立步骤（在清空微任务之后、下一个宏任务之前），不是宏任务。

**经典执行顺序**：`console.log(1)`、`setTimeout(→2)`、`new Promise(executor 打印 3).then(→4)`、`console.log(5)`——输出 `1 3 5 4 2`：executor 同步执行、then 是微任务、setTimeout 是宏任务。进阶版：`.then` 里 `return Promise.resolve()` 时，外层 Promise 采纳这个内部 Promise 要花 **2 个额外微任务 tick**——两条 then 链交错时输出 `1 3 4 2`。能推演这两段，Event Loop 就算掌握了。

**Node 差异**：浏览器是宏→清微→渲染→宏。Node 的 libuv 有 6 个阶段的循环。面试中大部分公司不要求 Node Event Loop 的细节。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "requestAnimationFrame 在哪个阶段" | 既不是宏任务也不是微任务——在渲染之前执行。顺序：宏任务→清微→rAF→渲染→下一个宏任务 |
| "setTimeout(fn, 0) 精准吗" | 不精准——HTML 规范要求嵌套超过 5 层后最小延迟 4ms。"0"只代表到期，真正执行还要排队 |
| "Promise 和 setTimeout 谁先" | Promise.then（微任务）一定在 setTimeout（宏任务）之前。同一轮中微任务先于宏任务 |

## 别踩的坑

1. **把 Promise executor 当异步** —— `new Promise(resolve => console.log('sync'))` 同步执行。面试官会在执行顺序题里藏这个陷阱
2. **"微任务全部执行完才到宏任务"** —— 说法不准。应该是"当前宏任务执行完→清空微任务→下一个宏任务"
3. **浏览器和 Node Event Loop 混为一谈** —— Node 有 6 个阶段，被问到时应意识到不同

## 相关阅读

- [Event Loop 知识文档](../../JavaScript/event-loop.md)
- [Promise 面试回答](./promise.md)
- [Node Event Loop](../../工程化/Node/node-event-loop.md)

## 更新记录

- 2026-07-18：Phase 4 对齐——"经典执行顺序"原引用一段不存在的 7 行代码，改为知识文件中的必考题（1 3 5 4 2）与微任务嵌套题（1 3 4 2，return Promise +2 tick）
- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）
