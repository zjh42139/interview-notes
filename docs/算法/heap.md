---
title: 堆（优先队列）
description: 堆的核心原理——大顶堆/小顶堆、数组存储、上浮下沉、Top-K 问题、手写二叉堆实现
category: 算法
type: algorithm
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - 堆
  - 优先队列
  - Top-K
  - 二叉堆
---

# 堆（优先队列）

> ⭐⭐⭐⭐｜难度：高级｜项目：★★

## 一句话总结

**堆是一种完全二叉树。大顶堆的每个节点都大于等于子节点（堆顶最大），小顶堆反之。JS 没有内置堆，面试中手写二叉堆的核心是两个操作——上浮（insert）和下沉（pop），都是 O(log n)。堆的实际价值在于 Top-K 问题：在百万级数据中找最大/最小的 K 个元素，用堆只需 O(n log k)。**

## 堆的定义

```
大顶堆：每个节点 ≥ 子节点 → 堆顶是最大值
小顶堆：每个节点 ≤ 子节点 → 堆顶是最小值

         [9]              ← 堆顶（最大）
        /   \
      [7]   [5]
     /  \   /
   [3] [1] [4]

数组存储：索引 i 的
  左子节点 = 2i + 1
  右子节点 = 2i + 2
  父节点   = Math.floor((i - 1) / 2)
```

**为什么用数组**：完全二叉树用数组存储没有空洞——内存紧凑，父子关系用索引公式 O(1) 算出，不需要指针。

## 手写小顶堆

```javascript
class MinHeap {
  constructor() {
    this.heap = []
  }

  // --- 公开方法 ---
  size() { return this.heap.length }
  peek() { return this.heap[0] }

  insert(val) {
    this.heap.push(val)
    this._bubbleUp(this.heap.length - 1)  // 末尾加入，上浮到正确位置
  }

  pop() {
    if (this.heap.length === 1) return this.heap.pop()
    const top = this.heap[0]
    this.heap[0] = this.heap.pop()        // 末尾元素提到堆顶
    this._sinkDown(0)                      // 下沉到正确位置
    return top
  }

  // --- 核心操作 ---
  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.heap[parent] <= this.heap[index]) break  // 已满足小顶堆
      ;[this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]]
      index = parent
    }
  }

  _sinkDown(index) {
    const len = this.heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2

      if (left < len && this.heap[left] < this.heap[smallest]) smallest = left
      if (right < len && this.heap[right] < this.heap[smallest]) smallest = right

      if (smallest === index) break  // 已就位
      ;[this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]]
      index = smallest
    }
  }
}
```

**大顶堆只需改两个比较方向**：`_bubbleUp` 中 `parent >= index` 时 break，`_sinkDown` 中找最大的子节点。

## 核心应用：Top-K 问题

**题目**：从 100 万个数字中找出最大的 10 个。

**思路**：维护一个大小为 K 的**小顶堆**（堆顶是这 K 个数里最小的）。遍历所有数字——如果当前数大于堆顶，弹出堆顶，插入当前数。遍历完后堆中就是最大的 K 个数。

```javascript
function topK(nums, k) {
  const heap = new MinHeap()

  for (const num of nums) {
    heap.insert(num)
    if (heap.size() > k) heap.pop()  // 保持堆大小不超过 K
  }

  return heap.heap  // 此时堆中就是最大的 k 个数
}
```

**复杂度**：时间 O(n log k)，空间 O(k)。如果先排序再取前 K，时间 O(n log n)。当 k << n 时，堆方案远优于排序。

**为什么用小顶堆找最大 K 个？** 小顶堆的堆顶是堆里最小的。新元素比堆顶还小 → 肯定不是 Top-K → 跳过。新元素比堆顶大 → 堆顶出去，新元素进来 → 堆顶重新变成堆里最小的。最终堆里的所有元素都"足够大"。

## 高频场景

| 场景 | 解法 | 核心 |
|------|------|------|
| 数组第 K 大元素 | 大小为 K 的小顶堆 | 堆顶即第 K 大 |
| 合并 K 个有序链表 | 小顶堆存 K 个链表头 | 每次取最小头 |
| 数据流中位数 | 大顶堆 + 小顶堆对半分 | 大顶堆存较小一半，小顶堆存较大一半 |
| 频率 Top-K | Map 统计频率 + 小顶堆按频率排序 | 堆里存 `[num, freq]`，按 freq 比较 |
| 定时器任务调度 | 小顶堆按触发时间排序 | 取堆顶看是否到期 |

## 数据流中位数（进阶）

```javascript
class MedianFinder {
  constructor() {
    this.maxHeap = new MaxHeap()  // 存较小的一半（大顶堆取最大值）
    this.minHeap = new MinHeap()  // 存较大的一半（小顶堆取最小值）
  }

  addNum(num) {
    // 先放大顶堆，平衡后把大顶堆最大值移到小顶堆
    this.maxHeap.insert(num)
    this.minHeap.insert(this.maxHeap.pop())

    // 保持大顶堆 ≥ 小顶堆（或相等）
    if (this.maxHeap.size() < this.minHeap.size()) {
      this.maxHeap.insert(this.minHeap.pop())
    }
  }

  findMedian() {
    if (this.maxHeap.size() > this.minHeap.size()) {
      return this.maxHeap.peek()                    // 奇数个，中位数在大顶堆堆顶
    }
    return (this.maxHeap.peek() + this.minHeap.peek()) / 2  // 偶数个，两堆顶平均
  }
}
```

## JS 的替代方案：使用数组排序

```javascript
// 非手写场景：直接用数组维护 + sort（简单但不高效）
class PriorityQueue {
  constructor(compare = (a, b) => a - b) {
    this.data = []
    this.compare = compare
  }
  enqueue(val) {
    this.data.push(val)
    this.data.sort(this.compare)  // O(n log n)，适合小数据量
  }
  dequeue() { return this.data.shift() }
}
```

**面试时**：如果只是用优先队列作为工具（不是手写堆本身），可以说"这里我需要一个最小堆，实际项目会用开源实现，现在手写核心逻辑"。不要写上面的排序版——面试官会让你手写堆。

## 易错点

1. **父子索引算错** —— 左子 `2i+1` 不是 `2i`（根节点 2×0=0，自己不能是自己儿子）。这个偏移是面试中手写堆最容易翻车的地方
2. **上浮和下沉的条件搞反** —— 小顶堆上浮：孩子 < 父 → 交换。下沉：找最小孩子，父 > 最小孩子 → 交换。大顶堆方向相反。面试时画个图帮助思考
3. **pop 时空数组** —— 边界：`heap.length === 0` return null/undefined。`heap.length === 1` 直接 pop 不需要重新调整堆
4. **Top-K 用大顶堆** —— 这是最经典的错误。找最大的 K 个应该用小顶堆——因为你需要快速淘汰"不够大"的元素（堆顶）。用大顶堆的话堆顶是最大的，淘汰反而是淘汰了最大值

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Top-K 问题怎么解" | 追问为什么用小顶堆不是大顶堆 |
| "手写一个堆" | 追问上浮和下沉的逻辑——以及时间复杂度 O(log n) |
| "数据流中位数怎么做" | 追问为什么用两个堆——大顶堆存小的一半，小顶堆存大的一半 |
| "堆和二叉搜索树有什么区别" | 追问堆只保证父子关系（不保证兄弟间顺序）——不能高效查找任意元素 |

## 相关阅读

- [排序](./sort.md)
- [DFS / BFS](./dfs-bfs.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-10：新建（二叉堆手写 + Top-K + 数据流中位数 + 大小顶堆选择逻辑）
