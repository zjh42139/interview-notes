---
title: 二分查找
description: 二分查找算法面试知识点
category: 算法
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 二分查找
  - 搜索
  - 有序数组
---

# 二分查找

> ⭐⭐⭐⭐｜难度：中级｜项目：★★

**二分查找是"有序"场景下的 O(log n) 查找利器。看起来简单，但边界条件（`<=` vs `<`、`mid` 取整方向、收缩边界是否 ±1）是高频易错点。掌握基础二分 + 左右边界二分三个模板，能覆盖绝大多数面试场景。**

## 一句话总结

**二分查找每次排除一半搜索空间，O(log n) 时间；核心是边界收缩（left/right 的更新配套循环条件），配合"二分答案"技巧可解决更复杂的最值问题。**

## 核心机制

### 基本模板：精确查找

```js
// 基础二分：在有序数组中查找目标值，返回下标，不存在返回 -1
function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;

  // <= 表示搜索区间是 [left, right] 闭区间
  // 如果用 < 则搜索区间是 [left, right) 左闭右开，配套的边界更新也不同
  while (left <= right) {
    // mid 防溢出写法：避免 (left + right) 超出安全整数范围
    const mid = left + ((right - left) >> 1);

    if (nums[mid] === target) {
      return mid;          // 命中目标
    } else if (nums[mid] < target) {
      left = mid + 1;      // target 在右半部分，左边界右移
    } else {
      right = mid - 1;     // target 在左半部分，右边界左移
    }
  }
  return -1; // left > right，区间为空，未找到
}
```

**关键细节**：
- `mid = left + ((right - left) >> 1)`：防溢出，`>> 1` 等价于 `Math.floor(x / 2)`（正数范围）
- `left = mid + 1` / `right = mid - 1`：**必须 ±1**，否则 `left` 和 `right` 无法交错，导致死循环
- `while (left <= right)`：闭区间写法，`left > right` 即区间为空时退出

### 变体 1：查找左边界（第一个等于 target）

```js
// 左边界二分：找到 target 第一次出现的位置
function leftBound(nums, target) {
  let left = 0, right = nums.length - 1;

  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (nums[mid] < target) {
      left = mid + 1;
    } else if (nums[mid] > target) {
      right = mid - 1;
    } else {
      // 找到了，但可能不是第一个 -> 继续往左收缩
      right = mid - 1;
    }
  }
  // 退出时 left = right + 1，left 是第一个 >= target 的位置
  if (left >= nums.length || nums[left] !== target) return -1;
  return left;
}
```

### 变体 2：查找右边界（最后一个等于 target）

```js
// 右边界二分：找到 target 最后一次出现的位置
function rightBound(nums, target) {
  let left = 0, right = nums.length - 1;

  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (nums[mid] < target) {
      left = mid + 1;
    } else if (nums[mid] > target) {
      right = mid - 1;
    } else {
      // 找到了，但可能不是最后一个 -> 继续往右收缩
      left = mid + 1;
    }
  }
  // 退出时 right = left - 1，right 是最后一个 <= target 的位置
  if (right < 0 || nums[right] !== target) return -1;
  return right;
}
```

### 经典题：搜索插入位置

```js
// 搜索插入位置：找到 target 应该插入的下标（第一个 >= target 的位置）
function searchInsert(nums, target) {
  let left = 0, right = nums.length; // 注意：right = nums.length，因为答案可能在末尾

  while (left < right) { // 左闭右开 [left, right)
    const mid = left + ((right - left) >> 1);
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid; // mid 可能是答案，不能排除
    }
  }
  return left; // 第一个 >= target 的位置
}
```

## 面试套路

| 题目特征 | 优先方案 |
|---------|---------|
| 有序数组 + 查找某值是否存在 | 基础二分 |
| 有序数组 + 找第一个/最后一个位置 | 左右边界二分 |
| "搜索插入位置" | 二分找左边界 |
| 旋转排序数组中查找 target | 二分 + 判断哪半边有序 |
| "最大值最小化" / "最小值最大化" | 二分答案（对答案值范围二分） |
| 峰值查找（局部有序） | 二分 + 比较相邻元素 |

## 深拓展

### 二分答案（Binary Search on Answer）

当题目是"在 XX 范围内找一个满足条件的值"时，可以对**答案值**做二分。如："k 天内完成所有运输任务的最小运力"——对运力值二分，每次 O(n) 验证当前运力是否可行。总时间复杂度 O(n log W)，W 是答案值范围。这个技巧把"求最优值"转化为"判断某值是否可行"，非常适合二分。

### `>> 1` vs `Math.floor`

`>> 1` 是带符号右移一位，对于正数等价于 `Math.floor(x / 2)`，但更快。不过 `>> 1` 只适用于 32 位有符号整数（最大约 21 亿），对于超长数组（> 2^31）需要 `Math.floor`。面试中用 `Math.floor((left + right) / 2)` 也完全可以接受，重点是把边界逻辑写对。

## 易错点

1. **`while` 条件是 `<=` 还是 `<`**：闭区间 `[left, right]` 用 `<=`；左闭右开 `[left, right)` 用 `<`。两者等价，但配套的边界更新不同。**统一用一种风格**，不要混用。
2. **边界更新忘记 ±1**：`left = mid + 1` / `right = mid - 1`。写成 `left = mid` 或 `right = mid` 可能死循环（当区间只剩 2 个元素时）。
3. **`mid` 取整方向**：`Math.floor` 使 `mid` 偏左。在左右边界二分中，这个偏左特性恰好匹配"找到 target 后继续往左/右收缩"的逻辑。
4. **返回前检查越界**：左右边界二分找到的位置可能越界（left >= nums.length 或 right < 0）或不等于 target，必须判断后再返回。
5. **搜索插入位置的 `right` 初始值**：`right = nums.length`（不是 `nums.length - 1`），因为插入位置可能在数组末尾。

## 相关阅读

- [算法 知识地图](./index.md)
- [数组](./array.md)
- [排序](./sort.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-06：初始创建，覆盖基础二分、左右边界二分、搜索插入位置、二分答案、易错点、面试套路
