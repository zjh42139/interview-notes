---
title: 滑动窗口
description: 滑动窗口算法面试知识点
category: 算法
type: algorithm
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 滑动窗口
  - 子串
  - 子数组
  - 双指针
---

# 滑动窗口

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★

**滑动窗口是处理子串/子数组问题的核心技巧，通过左右指针维护一个"窗口"，右指针扩张、左指针收缩，将暴力 O(n^2) 优化到 O(n)。是字符串和数组面试题的最高频考点之一。**

## 一句话总结

**滑动窗口 = 右指针扩张纳入新元素 + 左指针收缩排除旧元素，维护窗口内状态始终满足约束。每个元素最多被访问两次，时间复杂度 O(n)。**

## 核心机制

### 窗口示意与模板

```
窗口示意（可变窗口）：
        L       R
[ a, b, c, d, e, f, g ]
        |_______|
         窗口 = 当前考察的子串/子数组
```

**通用模板代码**（右指针驱动 + 左指针条件收缩）：

```js
function slidingWindow(s) {
  let left = 0, right = 0;
  let result = 0;
  const window = new Map(); // 窗口状态：Map/Set/计数器均可

  // 右指针不断扩张（主循环）
  while (right < s.length) {
    const c = s[right];
    right++; // 窗口扩大
    // 【1】更新窗口状态 — 加入新元素
    window.set(c, (window.get(c) || 0) + 1);

    // 【2】当窗口不满足条件时，左指针收缩
    while (/* 窗口需要收缩的条件 */) {
      const d = s[left];
      left++; // 窗口缩小
      // 更新窗口状态 — 移除元素
      window.set(d, window.get(d) - 1);
      if (window.get(d) === 0) window.delete(d);
    }

    // 【3】此时窗口满足条件，更新结果
    result = Math.max(result, right - left);
  }
  return result;
}
```

**模板关键点**：
- `right` 是主循环驱动（for 或 while），每次扩展一个元素
- `left` 是内层循环（while），当窗口违反约束时不断收缩
- **结果更新位置**取决于题目：求最短在收缩后更新，求最长在扩张后更新

### 经典题：最长无重复子串（可变窗口 + Set）

```js
// 最长无重复子串：Set 维护窗口内字符唯一性
function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    // 遇到重复字符 -> 左指针收缩直到窗口内没有重复
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]); // 右指针扩张
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

### 经典题：最小覆盖子串（可变窗口 + Map 计数）

```js
// 最小覆盖子串：在 s 中找包含 t 所有字符的最短子串
function minWindow(s, t) {
  const need = new Map(); // t 中字符的需求量
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);

  const window = new Map();
  let left = 0, right = 0;
  let valid = 0; // 已满足条件的字符种类数
  let start = 0, minLen = Infinity;

  while (right < s.length) {
    // 扩张：加入右指针字符
    const c = s[right];
    right++;
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1);
      if (window.get(c) === need.get(c)) valid++;
    }

    // 收缩：当所有字符需求都满足时，尝试缩小窗口找更短解
    while (valid === need.size) {
      if (right - left < minLen) {
        start = left;
        minLen = right - left;
      }
      const d = s[left];
      left++;
      if (need.has(d)) {
        if (window.get(d) === need.get(d)) valid--;
        window.set(d, window.get(d) - 1);
      }
    }
  }
  return minLen === Infinity ? '' : s.substring(start, start + minLen);
}
```

### 时间复杂度分析

虽然有两层循环（`while` 套 `while`），但内层 `while` 的总执行次数不超过 n：每个元素最多被右指针加入一次，被左指针移除一次。每个元素最多被访问**两次**，因此总时间复杂度为 **O(n)**。这是滑动窗口的核心优势。

## 面试套路

| 题目特征 | 优先方案 |
|---------|---------|
| "最长/最短子串" + 无重复/覆盖等约束 | 滑动窗口 + Set/Map |
| "子数组" + 和/乘积的条件约束 | 滑动窗口 + 计数器 |
| "覆盖/包含"某集合所有元素 | 滑动窗口 + 字符计数（valid 变量） |
| "恰好包含 K 个不同字符" | 滑动窗口（可能配合前缀和） |
| 固定长度的子串/子数组问题 | 固定窗口（不需要内层 while 收缩） |

## 深拓展

### 固定窗口 vs 可变窗口

- **固定窗口**：窗口大小恒定，右指针每走一步左指针跟进一步，不需要内层 `while` 收缩。如"找到长度为 k 的所有子数组的最大平均值"。
- **可变窗口**：窗口大小动态调整，右指针扩张 + 条件不满足时左指针收缩。如"最长无重复子串"、"最小覆盖子串"。

### 滑动窗口能用吗？——单调性判断

滑动窗口适用的前提是**收缩决策是单调的**：当窗口从满足条件变为不满足条件时，只有收缩左边界才能重新满足。如果数据有负数、收缩后条件可能更差（如"和为 K 的子数组"可能有负数），就不能用滑动窗口，需要用前缀和 + 哈希表。判断标准：**扩大窗口是否必然使条件更趋向满足？** 是则可以用滑动窗口。

## 易错点

1. **结果更新位置错误**：求最短在收缩循环内更新，求最长在扩张后更新，写反导致答案错误。
2. **收缩条件用 `if` 而非 `while`**：可能需要连续收缩多次才能重新满足条件，`if` 只执行一次会漏掉。
3. **Map/Set 清理残留**：收缩时记得将计数归零的 key 从 Map 中删除，否则 `valid === need.size` 的判断可能出错。
4. **窗口长度计算**：`right - left`（right 已自增）不是 `right - left + 1`，取决于当前 right 的语义。

## 相关阅读

- [算法 知识地图](./index.md)
- [数组](./array.md)
- [哈希表](./hash.md)
- [双指针](./two-pointers.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-06：初始创建，覆盖滑动窗口模板、固定/可变窗口、最长无重复子串、最小覆盖子串、时间复杂度分析、面试套路
