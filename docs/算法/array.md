---
title: 数组
description: 数组相关算法面试知识点
category: 算法
type: algorithm
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 数组
  - 双指针
  - 滑动窗口
  - 前缀和
---

# 数组

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★

**数组算法核心是双指针和滑动窗口，用于解决查找、去重、子数组等问题，几乎所有数组题都围绕这两种思路展开，配合哈希表和前缀和可以覆盖 90% 的面试场景。**

## 一句话总结

**数组算法核心是双指针和滑动窗口，用于解决查找、去重、子数组等问题。**

## 核心机制

### 双指针

双指针是数组最核心的解题模式，通过两根指针的移动来缩小搜索空间。根据指针的移动方向，可以分为三类：

1. **快慢指针**：快指针遍历每个元素，慢指针记录有效位置。适用于原地去重、原地删除指定元素。
2. **左右指针**：左指针从 0 开始，右指针从末尾开始，根据条件向中间收缩。适用于有序数组的两数之和、盛水容器。
3. **对撞指针**：左右指针的变体，在有序数组中从两端向中间逼近目标值。

```ts
// 1. 快慢指针：原地删除 val，返回新长度
function removeElement(nums: number[], val: number): number {
  let slow = 0
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== val) {
      nums[slow] = nums[fast]
      slow++
    }
  }
  return slow
}

// 2. 左右指针：有序数组两数之和
function twoSum(nums: number[], target: number): number[] {
  let left = 0, right = nums.length - 1
  while (left < right) {
    const sum = nums[left] + nums[right]
    if (sum === target) return [left, right]
    else if (sum < target) left++
    else right--
  }
  return [-1, -1]
}

// 3. 对撞指针：盛最多水的容器
function maxArea(height: number[]): number {
  let left = 0, right = height.length - 1, max = 0
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left)
    max = Math.max(max, area)
    // 移动较矮的一边，因为移动高边不可能增加面积
    if (height[left] < height[right]) left++
    else right--
  }
  return max
}
```

### 滑动窗口

滑动窗口是双指针的进阶：左右指针之间构成一个窗口，右指针扩张窗口（增加元素），左指针收缩窗口（移除元素）。关键在于**维护窗口内的状态**。

```ts
// 最长无重复子串 — 滑动窗口模板
function lengthOfLongestSubstring(s: string): number {
  const set = new Set<string>()
  let left = 0, maxLen = 0
  for (let right = 0; right < s.length; right++) {
    // 遇到重复字符，收缩左边界直到没有重复
    while (set.has(s[right])) {
      set.delete(s[left])
      left++
    }
    set.add(s[right])
    maxLen = Math.max(maxLen, right - left + 1)
  }
  return maxLen
}
```

### 前缀和

前缀和是预处理技术：`preSum[i]` 表示 `nums[0..i-1]` 的和。区间和 `sum(L, R) = preSum[R+1] - preSum[L]`，将 O(n) 的区间查询降到 O(1)。

```ts
class NumArray {
  private preSum: number[]
  constructor(nums: number[]) {
    this.preSum = [0] // preSum[0] = 0 简化边界
    for (let i = 0; i < nums.length; i++) {
      this.preSum[i + 1] = this.preSum[i] + nums[i]
    }
  }
  sumRange(left: number, right: number): number {
    return this.preSum[right + 1] - this.preSum[left]
  }
}
```

### 哈希表辅助

空间换时间，用 Map 或 Set 存储中间结果，将 O(n^2) 降为 O(n)。经典场景："两数之和"中存储已遍历的值和下标；"和为 K 的子数组"中存储前缀和的出现次数。

```ts
// 两数之和（无序数组）：哈希表 O(n)
function twoSumUnordered(nums: number[], target: number): number[] {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) return [map.get(complement)!, i]
    map.set(nums[i], i)
  }
  return [-1, -1]
}
```

## 深度拓展

### 1. 两数之和 vs 三数之和：思路对比

两数之和用哈希表 O(n)，三数之和就不能直接用哈希表了 -- 需要**排序 + 固定一个数 + 双指针**，时间复杂度 O(n^2)。为什么？因为三数之和要求去重，哈希表去重非常麻烦，而排序后跳过相同元素就简单得多。

```ts
// 三数之和：排序 + 固定 i + 双指针
function threeSum(nums: number[]): number[][] {
  const result: number[][] = []
  nums.sort((a, b) => a - b)
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue // 去重
    let left = i + 1, right = nums.length - 1
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]])
        while (left < right && nums[left] === nums[left + 1]) left++ // 去重
        while (left < right && nums[right] === nums[right - 1]) right--
        left++; right--
      } else if (sum < 0) left++
      else right--
    }
  }
  return result
}
```

### 2. 盛最多水的容器：正确性证明

左右指针从两端向中间移动，每次移动较矮的一边。为什么移动高边不能得到更大面积？因为面积 = min(左高, 右高) * 间距。移动高边时，间距减小，且 min(左高, 右高) 不可能增加（短板不会变长），所以面积不可能更大。因此移动短板是唯一可能找到更大面积的操作。

### 3. 最长无重复子串：滑动窗口的本质

窗口内始终是"无重复字符的子串"，当右指针遇到重复字符时，左指针收缩直到窗口内没有重复。整个过程每个字符最多被访问两次（右指针加入 + 左指针移除），所以是 O(n)。如果面试官追问"能不能用 Map 优化"，可以用 Map 记录字符上一次出现的位置，让左指针直接跳到 `max(left, map.get(ch) + 1)`。

## 项目实战

### 1. 表格多选去重

当用户通过多个入口（行点击、复选框、全选）选择表格行时，需要合并去重：

```ts
function mergeSelectedIds(
  existing: number[],
  incoming: number[],
  selectAll: boolean
): number[] {
  const set = new Set(selectAll ? [] : existing)
  for (const id of incoming) set.add(id)
  return Array.from(set)
}
```

### 2. 权限列表合并

两个有序权限数组（如用户的角色 ID 列表和管理员分配的权限 ID 列表），用双指针归并：

```ts
function mergeSortedArrays(a: number[], b: number[]): number[] {
  const result: number[] = []
  let i = 0, j = 0
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) { result.push(a[i]); i++ }
    else if (a[i] > b[j]) { result.push(b[j]); j++ }
    else { result.push(a[i]); i++; j++ } // 去重
  }
  while (i < a.length) result.push(a[i++])
  while (j < b.length) result.push(b[j++])
  return result
}
```

### 3. 搜索关键词高亮匹配

用滑动窗口在长文本中匹配多个关键词的位置，生成高亮区间：

```ts
function findHighlightRanges(
  text: string,
  keywords: string[]
): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  for (const kw of keywords) {
    let start = 0
    while ((start = text.indexOf(kw, start)) !== -1) {
      ranges.push([start, start + kw.length])
      start++ // 允许重叠匹配
    }
  }
  // 合并重叠区间（类似合并区间问题）
  return mergeRanges(ranges)
}
```

## 易错点

1. **边界条件**：空数组、单元素数组、所有元素相同。滑动窗口的 `left <= right` 还是 `left < right` 容易搞混。
2. **while vs for**：左右指针用 `while (left < right)`，滑动窗口用 `for (right)` 套 `while (收缩条件)`，不要写反。
3. **去重逻辑**：三数之和、四数之和中，去重必须用 `while` 循环而不是单次 `if`，因为可能连续多个相同元素。
4. **前缀和下标偏移**：`preSum[0] = 0` 是哨兵，区间和是 `preSum[R+1] - preSum[L]`，不是 `preSum[R] - preSum[L]`。
5. **哈希表 key 选错**：有时需要存的是"前缀和的值"作为 key，"出现次数"作为 value，有时需要存"值到下标"的映射，混淆导致 WA。

## 补充题型

### 版本号比较

字符串分割后逐段比较数字大小，处理不同长度的版本号（如 `1.0.0` vs `1.0.0.1`）：

```ts
function compareVersion(v1: string, v2: string): number {
  const arr1 = v1.split('.').map(Number)
  const arr2 = v2.split('.').map(Number)
  const len = Math.max(arr1.length, arr2.length)

  for (let i = 0; i < len; i++) {
    const n1 = arr1[i] || 0  // 缺位补 0
    const n2 = arr2[i] || 0
    if (n1 > n2) return 1    // v1 > v2
    if (n1 < n2) return -1   // v1 < v2
  }
  return 0  // 相等
}
```

时间 O(n)，空间 O(n)。面试追问："1.0.0" 和 "1.0.0.0" 是否相等？上述代码返回 0（缺位补 0）。

### 大数相加

两个字符串数字逐位相加，处理进位。不能在 JS 中用 `BigInt` 或 `Number` 直接加（可能溢出或精度丢失）：

```ts
function addStrings(num1: string, num2: string): string {
  let i = num1.length - 1, j = num2.length - 1
  let carry = 0
  const result: number[] = []

  while (i >= 0 || j >= 0 || carry > 0) {
    const d1 = i >= 0 ? +num1[i] : 0
    const d2 = j >= 0 ? +num2[j] : 0
    const sum = d1 + d2 + carry
    result.push(sum % 10)       // 当前位
    carry = Math.floor(sum / 10) // 进位
    i--; j--
  }
  return result.reverse().join('')
}
```

时间 O(max(m,n))，空间 O(max(m,n))。面试追问：如果输入可能是小数？先对齐小数点再逐位加。如果是任意进制？把 `%10` 和 `/10` 替换为 `%base` 和 `/base`。

## 相关阅读

- [算法 知识地图](./index.md)
- [链表](./linked-list.md)
- [树](./tree.md)
- [排序](./sort.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（双指针 + 滑动窗口 + 前缀和 + 项目实战）
