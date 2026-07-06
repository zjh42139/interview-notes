---
title: 双指针
description: 双指针算法面试知识点
category: 算法
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 双指针
  - 对撞指针
  - 快慢指针
  - Floyd 判圈
---

# 双指针

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★

**双指针是数组和链表问题中最高频的解题模式，核心思想是用两根指针的移动来缩小搜索空间或维护区间。掌握对撞、快慢、分离三种指针模式，能解决绝大多数的数组原地操作和链表操作面试题。**

## 一句话总结

**双指针通过两根指针协同移动降低时间复杂度，主要有三类：对撞指针（两端向中间）、快慢指针（一快一慢同向）、分离指针（各自遍历不同序列）。**

## 核心机制

### 对撞指针（左右指针）

两个指针从数组两端开始，向中间移动，每次根据条件决定移动哪一侧。核心在于**每次移动都能安全地排除一端**，将 O(n^2) 降到 O(n)。

```
// 指针移动方向示意
//  L -->              <-- R
// [1,  2,  3,  4,  5,  6,  7,  8]
//  首端                    尾端
```

**有序数组的两数之和**：sum 太小 -> 左指针右移增大 sum；sum 太大 -> 右指针左移减小 sum。

```js
// 对撞指针：有序数组的两数之和 O(n)
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    // 根据 sum 与 target 的关系，安全地收缩一端
    else if (sum < target) left++;   // sum 太小，增大左边界
    else right--;                    // sum 太大，减小右边界
  }
  return [-1, -1];
}
```

**验证回文串**：首尾字符比较，不同则不是回文。

```js
// 对撞指针：验证回文串（忽略非字母数字）
function isPalindrome(s) {
  s = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}
```

### 快慢指针

快指针每次走 2 步，慢指针走 1 步。在数组中去重/删除时，快指针遍历所有元素，慢指针记录有效位置，做到**原地操作**。

```js
// 链表环检测 — Floyd 判圈算法
// 有环则快慢指针必然相遇；无环则 fast 走到 null
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;           // 慢指针走 1 步
    fast = fast.next.next;      // 快指针走 2 步
    if (slow === fast) return true; // 相遇 = 有环
  }
  return false;
}

// 有序数组原地去重：快指针遍历，慢指针记录不重复元素位置
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast]; // 把新元素覆盖到 slow 位置
    }
  }
  return slow + 1; // 新数组长度 = 慢指针位置 + 1
}
```

### 分离指针

两个指针分别遍历两个不同的有序序列，常用于**合并**操作。典型题：合并两个有序数组。

```js
// 合并两个有序数组：从后往前填充，避免覆盖 nums1 未处理元素
function merge(nums1, m, nums2, n) {
  let i = m - 1;      // nums1 有效部分的末尾
  let j = n - 1;      // nums2 的末尾
  let k = m + n - 1;  // 填充位置从末尾开始
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k--] = nums1[i--];
    } else {
      nums1[k--] = nums2[j--];
    }
  }
}
```

## 面试套路

| 题目特征 | 优先考虑 | 指针方向 |
|---------|---------|---------|
| 有序数组 + 查找两数/三数之和 | 对撞指针 | 两端 -> 中间 |
| 链表 + 环/中点/倒数第 k 个 | 快慢指针 | 同向不同速 |
| 原地去重/原地删除指定元素 | 快慢指针 | 同向不同速 |
| 合并两个有序序列 | 分离指针 | 各自遍历 |
| 回文串/反转判断 | 对撞指针 | 两端 -> 中间 |
| 盛水容器/接雨水 | 对撞指针 | 两端 -> 中间 |

## 深拓展

### Floyd 判圈算法的正确性

快指针速度是慢指针的 2 倍。如果存在环，快指针先入环并在环内循环；当慢指针也入环时，快指针已在环内领先。由于速度差为 1，快指针每次移动就接近慢指针 1 步，最终必然相遇。时间复杂度 O(n)，空间 O(1)，不需要额外的 visited 集合。

### 为什么三数之和不用哈希表？

两数之和用哈希表 O(n)；三数之和如果用哈希表存所有两数之和，去重逻辑会非常复杂。排序 + 固定第一个数 + 对撞指针的 O(n^2) 方案既能利用排序去重（跳过相邻相同元素），又满足面试对"时间复杂度合理"的要求。

## 易错点

1. **对撞指针的 while 条件**：`while (left < right)` 不是 `<=`，`left === right` 时指向同一元素没有意义。
2. **快慢指针的边界检查**：链表题中 `while (fast && fast.next)` 两个条件缺一不可，否则 `null.next` 报错。
3. **去重逻辑的起点**：有序数组去重时快指针从 1 开始（不是 0），慢指针从 0 开始。
4. **合并数组时正向 vs 逆向**：合并到 `nums1` 时要从后往前填，如果从前往后会覆盖 `nums1` 还未处理的有效元素。

## 相关阅读

- [算法 知识地图](./index.md)
- [数组](./array.md)
- [链表](./linked-list.md)
- [滑动窗口](./sliding-window.md)

## 更新记录

- 2026-07-06：初始创建，覆盖对撞/快慢/分离三种指针模式、Floyd 判圈、面试套路
