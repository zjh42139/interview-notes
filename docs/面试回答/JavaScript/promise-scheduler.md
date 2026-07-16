---
title: Promise 并发调度器 面试回答
description: 面试中如何回答 Promise 并发控制——并发限制调度器、递归驱动、滑动窗口
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - JavaScript
  - Promise
  - 并发控制
  - 面试回答
---

# Promise 并发调度器 面试回答

> 字节跳动必考手写题。考察异步流程控制——不用第三方库实现并发限制。

## Q1: 实现一个带并发限制的 Promise 调度器

### 30 秒版本

"维护一个任务队列 + 当前并发计数。初始启动 N 个任务，每个任务完成后从队列取下一个——递归驱动。核心是 run() 函数——while 当前并发小于上限且队列非空，并发+1，执行任务，.finally 里并发-1 再递归 run()。返回 Promise.all 收集所有结果。"

### 2 分钟版本

```javascript
class PromiseScheduler {
  constructor(limit) {
    this.limit = limit;      // 最大并发数
    this.running = 0;         // 当前并发数
    this.queue = [];          // 等待队列
  }

  // 添加一个任务，返回 Promise（任务完成时 resolve）
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();  // 尝试启动
    });
  }

  run() {
    // 只要并发有空位且队列有任务，就一直取
    while (this.running < this.limit && this.queue.length) {
      const { task, resolve, reject } = this.queue.shift();
      this.running++;
      task()
        .then(resolve, reject)       // 任务成功/失败透传
        .finally(() => {              // 关键：完成后减计数+继续
          this.running--;
          this.run();
        });
    }
  }
}

// 使用：10 个请求，最多 3 个并发
const scheduler = new PromiseScheduler(3);
const tasks = urls.map(url => () => fetch(url));
Promise.all(tasks.map(t => scheduler.add(t))).then(results => {
  // 全部完成
});
```

**核心思想**：用队列缓冲、用 run() 递归驱动、用 Promise 包装让调用方拿到任务结果。这其实就是简化版的 p-limit 库。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "怎么获取每个任务的结果" | 每个任务的 Promise 通过 resolve/reject 透传——scheduler.add() 返回的 Promise 就是那个任务的完成信号 |
| "单个任务失败怎么办" | 取决于需求——上面的实现用 `task().then(resolve, reject)` 失败会 reject 对应的 Promise。要失败不影响其他任务，在 task() 内部 catch 吞掉 |
| "和 Promise.all 有什么区别" | Promise.all 同时启动所有 Promise——100 个请求全发出去。调度器控制同时只有 N 个在执行——适合节流 API 请求/文件上传 |

## 别踩的坑

1. **忘记 finally 里调 run()** —— 任务完成后不检查队列，后面的任务永远不会启动。
2. **Promise.all 前忘了 new Promise 包装** —— scheduler.add() 必须返回 Promise——调用方要知道这个特定任务何时完成。
3. **task 是函数不是 Promise** —— 提前创建 Promise 任务已经开始执行了，必须包装成工厂函数延迟执行。

## 相关阅读

- [Promise](./promise.md)
- [Event Loop](./event-loop.md)

## 更新记录

- 2026-07-15：新建（class 实现 + 递归驱动 + 透传结果 + 封装模式）
