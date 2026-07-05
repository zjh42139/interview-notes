---
title: 排序
description: 排序算法面试知识点
category: 算法
difficulty: 中级
frequency: ⭐⭐⭐
status: drafted
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 快排
  - 归并
  - 堆排序
  - 时间复杂度
---

# 排序

> ⭐⭐⭐｜难度：中级｜项目：★★★

**快排是面试最常手写的排序（平均 O(n log n)），归并排序适合外部排序和链表排序，堆排序用于 TopK 问题。前端面试还要特别注意 `Array.prototype.sort()` 的默认行为陷阱。**

## 一句话总结

**快排是面试最常手写的排序（平均 O(n log n)），归并排序适合外部排序和链表排序。**

## 核心机制

### 快排（Quick Sort）

核心是 `partition` 分区函数：选一个 pivot，把小于它的放左边，大于的放右边，然后递归处理左右子数组。

```ts
// 快排核心：partition
function quickSort(nums: number[], left = 0, right = nums.length - 1): void {
  if (left >= right) return
  const pivotIndex = partition(nums, left, right)
  quickSort(nums, left, pivotIndex - 1)
  quickSort(nums, pivotIndex + 1, right)
}

function partition(nums: number[], left: number, right: number): number {
  // 随机选 pivot 交换到末尾，避免退化 O(n^2)
  const randomIndex = left + Math.floor(Math.random() * (right - left + 1))
  ;[nums[randomIndex], nums[right]] = [nums[right], nums[randomIndex]]

  const pivot = nums[right]
  let i = left // i 指向第一个 >= pivot 的位置
  for (let j = left; j < right; j++) {
    if (nums[j] < pivot) {
      [nums[i], nums[j]] = [nums[j], nums[i]]
      i++
    }
  }
  [nums[i], nums[right]] = [nums[right], nums[i]] // pivot 归位
  return i
}
```

**时间复杂度**：平均 O(n log n)，最坏 O(n^2)（每次 pivot 都是最值）。随机化 pivot 或三数取中可以避免退化。**不稳定排序**：相同元素的相对位置可能改变。

### 归并排序（Merge Sort）

分治思想：递归拆分数组到单元素，再两两合并有序子数组。

```ts
function mergeSort(nums: number[]): number[] {
  if (nums.length <= 1) return nums
  const mid = Math.floor(nums.length / 2)
  const left = mergeSort(nums.slice(0, mid))
  const right = mergeSort(nums.slice(mid))
  return merge(left, right)
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) { result.push(left[i]); i++ }
    else { result.push(right[j]); j++ }
  }
  return result.concat(left.slice(i), right.slice(j))
}
```

**稳定排序**：`left[i] <= right[j]` 保证相等时左边的先放入，相对顺序不变。**需要 O(n) 额外空间**，适合链表排序（链表不需要额外空间）。时间复杂度始终 O(n log n)。

### 堆排序（Heap Sort）

建堆 O(n) + n 次取堆顶 O(n log n)，原地排序但**不稳定**。

```ts
function heapSort(nums: number[]): void {
  const n = nums.length
  // 1. 建大顶堆：从最后一个非叶子节点开始下沉
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(nums, n, i)
  // 2. 依次取堆顶放到末尾
  for (let i = n - 1; i > 0; i--) {
    [nums[0], nums[i]] = [nums[i], nums[0]]  // 堆顶交换到末尾
    heapify(nums, i, 0) // 剩余元素重新下沉
  }
}

function heapify(nums: number[], size: number, root: number): void {
  let largest = root
  const left = 2 * root + 1
  const right = 2 * root + 2
  if (left < size && nums[left] > nums[largest]) largest = left
  if (right < size && nums[right] > nums[largest]) largest = right
  if (largest !== root) {
    [nums[root], nums[largest]] = [nums[largest], nums[root]]
    heapify(nums, size, largest) // 继续下沉
  }
}
```

### 稳定性对比

| 排序算法 | 平均时间 | 最坏时间 | 空间 | 稳定 |
|---------|---------|---------|------|-----|
| 快排 | O(n log n) | O(n^2) | O(log n) | 不稳定 |
| 归并 | O(n log n) | O(n log n) | O(n) | 稳定 |
| 堆排 | O(n log n) | O(n log n) | O(1) | 不稳定 |
| 冒泡 | O(n^2) | O(n^2) | O(1) | 稳定 |
| 插入 | O(n^2) | O(n^2) | O(1) | 稳定 |

## 深度拓展

### 1. `Array.prototype.sort()` 的坑

JavaScript 的 `sort()` 默认将元素转为**字符串**再比较 Unicode 码点。所以 `[1, 2, 10].sort()` 结果是 `[1, 10, 2]`（因为 "10" < "2"）。**永远记得传比较函数**：

```ts
// 错误
[1, 2, 10].sort()           // [1, 10, 2] ❌
// 正确
[1, 2, 10].sort((a, b) => a - b)  // [1, 2, 10] ✅
```

V8 引擎在 ES2019 后使用 **TimSort**（归并排序 + 插入排序的混合），保证稳定排序。

### 2. TimSort 原理

TimSort 的核心思想是"利用数据中已有的有序片段（run）"。先找出连续的升序/降序子序列，反转降序段为升序，然后用归并的方式合并这些 run。对部分有序的数据效率极高（接近 O(n)）。Python 和 Java 也是默认 TimSort。

### 3. 计数/桶/基数排序

线性时间 O(n+k) 的排序，前提是数据为整数且范围有限。**计数排序**：统计每个值的出现次数，按值映射输出。**桶排序**：数据分到 m 个桶里，桶内用其他排序，再合并。**基数排序**：按个位、十位、百位……依次排序，适合等长字符串或数字。前端场景如"成绩排名"（分数范围 0-750）用计数排序比快排更高效。

```ts
// 计数排序：适用于范围有限的整数
function countingSort(nums: number[], maxVal: number): number[] {
  const count = new Array(maxVal + 1).fill(0)
  for (const num of nums) count[num]++
  const result: number[] = []
  for (let i = 0; i <= maxVal; i++) {
    while (count[i]-- > 0) result.push(i)
  }
  return result
}
```

## 项目实战

### 1. 表格多列排序

Element Plus 表格自定义排序，传入 comparator 函数：

```ts
// el-table-column 的 sort-method
function multiFieldSort(a: User, b: User, sortBy: string, order: string): number {
  // 按多个字段优先级：积分 > 等级 > 注册时间
  const comparators: Array<(a: User, b: User) => number> = [
    (a, b) => (b.points ?? 0) - (a.points ?? 0),  // 积分降序
    (a, b) => (b.level ?? 0) - (a.level ?? 0),    // 等级降序
    (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0), // 注册时间升序
  ]
  for (const cmp of comparators) {
    const result = cmp(a, b)
    if (result !== 0) return order === "ascending" ? result : -result
  }
  return 0
}
```

### 2. 数据导出前排序

导出 CSV/Excel 前按指定字段排序，通常用稳定排序保证后续排序不破坏之前的顺序：

```ts
function sortForExport(data: Record[], fields: string[]): Record[] {
  // 从最低优先级开始排序，利用稳定排序的特性
  let sorted = [...data]
  for (let i = fields.length - 1; i >= 0; i--) {
    sorted = sorted.sort((a, b) => String(a[fields[i]]).localeCompare(String(b[fields[i]])))
  }
  return sorted
}
```

### 3. 排行榜多维度排序

```ts
function rankPlayers(players: Player[]): Player[] {
  return players.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score     // 分数降序
    if (b.achievements !== a.achievements) return b.achievements - a.achievements
    return a.joinTime - b.joinTime                         // 加入时间升序
  })
}
```

## 易错点

1. **`sort()` 默认字符串排序**：`[1, 2, 10].sort()` 返回 `[1, 10, 2]`，因为 "10" 的 Unicode 码点比 "2" 小。永远传比较函数 `(a, b) => a - b`。
2. **快排退化 O(n^2)**：已排序数组 + 固定选第一个/最后一个元素作为 pivot 会退化。用随机化或三数取中避免。
3. **归并的额外空间 O(n)**：虽然是稳定排序，但需要额外数组，不适合内存紧张的场景。链表场景下归并不需要额外空间。
4. **稳定性的实际意义**：多列排序时，第二次排序不应该打乱第一次排序的顺序。比如先按姓名排序再按部门排序，稳定排序保证同部门的人仍按姓名有序。
5. **TimSort 误用**：不要以为 JS 的 sort 默认稳定就不传比较函数 -- 默认的字符串比较行为不会因为你用了新引擎而改变。

## 相关阅读

- [算法 知识地图](./index.md)
- [数组](./array.md)
- [链表](./linked-list.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（快排 + 归并 + 堆排 + 稳定性对比 + TimSort + 线性排序 + 项目实战）
