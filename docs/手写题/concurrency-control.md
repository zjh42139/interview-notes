---
title: 批量请求并发控制
description: 手写并发控制——同时只发 N 个请求，一个完成就启动下一个，保持并发窗口始终满
category: 手写题
type: exercise
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - 并发
  - 请求池
  - 手写题
  - Promise
---

# 批量请求并发控制

> &#11088;&#11088;&#11088;&#11088;｜难度：高级&#9733;&#9733;&#9733;&#9733;

## 一句话总结

**并发控制的核心是维护一个并发窗口（如最多同时发 3 个请求）。用计数器或 Promise.race 追踪运行中的请求数——完成一个就从队列取下一个，始终保持窗口塞满。这和 Promise.all 完全不同——all 是所有一起发，并发控制是控制同时发的数量。**

## 题目

实现 `concurrencyLimit(tasks, limit)`：
- `tasks` 是返回 Promise 的函数数组（不是 Promise 实例——那样就全发了）
- `limit` 是最大并发数
- 返回所有任务完成后的结果数组（保持顺序）
- 任何时候同时运行的任务 ≤ limit

## 为什么不能用 Promise.all

```javascript
// ❌ Promise.all 一次性全部发出——10000 个请求 = 浏览器/TCP 连接爆炸
const results = await Promise.all(urls.map(url => fetch(url)))

// ✅ 并发控制——一次只发 limit 个，完成一个补一个
const results = await concurrencyLimit(
  urls.map(url => () => fetch(url)),  // 注意：传函数，不传 Promise
  3
)
```

## 思路

```
维护一个"滑动窗口"：
  1. 前 limit 个任务立即开始
  2. 每个任务完成后 → 从队列取下一个任务 → 执行
  3. 所有任务完成 → resolve 结果数组

关键数据结构：
  results[]  —— 结果数组（按原始 index 存）
  running    —— 当前正在执行的数量
  cursor     —— 下一个要执行的任务索引

循环：
  while (cursor < tasks.length && running < limit) {
    执行 tasks[cursor]
    cursor++, running++
    完成后 running--, results[i] = value
    → 再次尝试启动新任务
  }
```

## 基础版实现

```javascript
function concurrencyLimit(tasks, limit) {
  return new Promise((resolve) => {
    const results = new Array(tasks.length)
    let running = 0
    let cursor = 0      // 下一个要执行的任务索引
    let completed = 0    // 已完成数

    function next() {
      // 当还有任务 + 还有空闲位置 → 启动新任务
      while (cursor < tasks.length && running < limit) {
        const index = cursor++
        running++

        Promise.resolve(tasks[index]())
          .then(value => {
            results[index] = value
          })
          .catch(err => {
            results[index] = err  // 或者按需求：遇到错误直接 reject 全部
          })
          .finally(() => {
            running--
            completed++

            if (completed === tasks.length) {
              resolve(results)
            } else {
              next()  // 继续尝试启动新任务
            }
          })
      }
    }

    next()
  })
}
```

## 升级版——支持单个任务失败不影响整体

```javascript
async function concurrencyLimit(tasks, limit) {
  const results = new Array(tasks.length)
  let cursor = 0

  // 创建一个 worker——每个 worker 循环取任务执行
  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor++    // 原子性地取一个任务
      try {
        results[index] = await tasks[index]()
      } catch (err) {
        results[index] = { error: err }  // 单个失败不阻塞其他
      }
    }
  }

  // 启动 limit 个 worker
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, () => worker())
  )

  return results
}
```

**Worker 模式的优点**：
- 逻辑更简洁——每个 worker 是独立循环，取任务→执行→取任务→执行
- `cursor++` 是同步的——不会多个 worker 取到同一个 index
- 单个任务失败后 worker 继续取下一个——不会中断批量处理

## 深度拓展

### 并发数怎么选

```
场景 A：浏览器发出 HTTP 请求
  Chrome 同域名限制 6 个 TCP 连接
  → 设置 limit=3~4 合理（留一点给页面其他请求）

场景 B：Node.js 调用外部 API
  无浏览器限制，但服务端有频率限制（rate limit）
  → 根据 API 限制设置——如 100 次/秒 → 考虑令牌桶限流

场景 C：CPU 密集操作（Worker 中）
  → limit = navigator.hardwareConcurrency - 1（留一个核给主线程）
```

### 并发控制的变种——带重试

```javascript
async function concurrencyWithRetry(tasks, limit, maxRetries = 3) {
  const results = new Array(tasks.length)
  let cursor = 0

  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor++
      let retries = 0
      while (retries <= maxRetries) {
        try {
          results[index] = await tasks[index]()
          break  // 成功了就退出重试循环
        } catch (err) {
          retries++
          if (retries > maxRetries) {
            results[index] = { error: err, retries }
          }
        }
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, () => worker())
  )
  return results
}
```

## 项目实战

### 后台管理系统中的并发控制

1. **大文件分片上传**：limit=3，同时上传 3 个分片——一个完成立刻发下一个。既控制浏览器连接数、又保证进度条稳定推进
2. **批量导入 Excel**：1000 行数据 → 100 个批次 → 每批 limit=5 → 5 个同时写入后端。比 `Promise.all` 全发好——不会压垮后端
3. **图片批量压缩**：100 张图片在 Worker 中压缩——limit = CPU 核心数 - 1，留一个核心给主线程渲染 UI

## 易错点

1. **tasks 是函数数组，不是 Promise 数组** —— 传 `[fetch(url1), fetch(url2)]` 会全部立即发出。必须传 `[() => fetch(url1), () => fetch(url2)]`。面试笔试中最常见的陷阱
2. **cursor++ 的原子性** —— 在 JS 单线程中 `cursor++` 是安全的（事件循环的同步阶段）。但如果用 Worker 或多线程方案，需要 Atomics
3. **completed 和 cursor 要区分** —— cursor 到末尾只说明任务分配完了，不代表全部完成。completed === tasks.length 才代表全部结束
4. **空数组直接 resolve** —— `tasks.length === 0` 时直接 `resolve([])`，不用走 worker 逻辑

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "并发控制和 Promise.all 有什么区别" | 追问为什么不用 all——一次性全发的问题 |
| "并发数怎么确定" | 追问浏览器 TCP 连接限制（6个）和 HTTP/2 的影响 |
| "单个任务失败了怎么处理" | 追问是否需要取消其他运行中的任务 |
| "Worker 模式和计数器模式怎么选" | 追问 Worker 模式代码更简洁——计数器模式对单个失败控制更细 |

## 相关阅读

- [Promise 原理](../JavaScript/promise.md)
- [手写 Promise](./promise.md)
- [大文件上传](../项目实战/业务场景/big-file-upload.md)

## 更新记录

- 2026-07-10：新建（计数器版 + Worker 版 + 重试变种 + 并发数选择指南）
