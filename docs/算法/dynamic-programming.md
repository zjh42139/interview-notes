---
title: 动态规划基础
description: 动态规划面试知识点（前端岗位难度）
category: 算法
type: algorithm
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 动态规划
  - DP
  - 状态转移
  - 最优子结构
---

# 动态规划基础

> ⭐⭐⭐⭐｜难度：高级｜项目：★★

**动态规划（DP）的核心是"记住已经算过的结果"，避免重复计算。前端岗位 DP 考得不深，重点是理解最优子结构 + 重叠子问题的思想，能解决爬楼梯、打家劫舍、最长递增子序列等经典题即可，不需要深入编辑距离、正则匹配等难题。**

## 一句话总结

**DP = 最优子结构 + 重叠子问题 + 状态转移方程，把大问题拆成小问题，用数组/哈希表记录子问题结果（记忆化），避免指数级重复计算。**

## 核心机制

### DP 三要素

1. **最优子结构**：大问题的最优解包含小问题的最优解
2. **重叠子问题**：递归过程中大量子问题被重复计算（这是 DP 优于纯递归的原因）
3. **状态转移方程**：`dp[i] = f(dp[i-1], dp[i-2], ...)`，描述如何从更小的子问题推导当前问题

### 入门题：爬楼梯

```js
// 爬楼梯：每次爬 1 或 2 阶，到达第 n 阶有多少种方法？
// 状态转移：dp[i] = dp[i-1] + dp[i-2]
// 含义：到达 i 阶 = 从 i-1 跨 1 步 + 从 i-2 跨 2 步
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1; // dp[i-2]
  let prev1 = 2; // dp[i-1]
  // 空间优化：只用两个变量，不需要整个 dp 数组
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

### 经典题：打家劫舍

```js
// 打家劫舍：不能偷相邻的，求最大收益
// dp[i] = max(dp[i-1], dp[i-2] + nums[i])
//  偷 i：dp[i-2] + nums[i]   不偷 i：dp[i-1]
function rob(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  let prev2 = nums[0];                   // dp[i-2]
  let prev1 = Math.max(nums[0], nums[1]); // dp[i-1]

  for (let i = 2; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

### 经典题：最长递增子序列（LIS）

```js
// LIS：求数组中最长严格递增子序列的长度
// dp[i] = 以 nums[i] 结尾的 LIS 长度
// dp[i] = max(dp[j] + 1)，对所有 j < i 且 nums[j] < nums[i]
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1); // 每个元素自身构成长度为 1 的 LIS
  let maxLen = 1;

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }
  return maxLen;
}
// O(n^2)，面试加分项：可优化到 O(n log n) 用贪心 + 二分
```

### dp 数组 vs 记忆化递归

```js
// 方式一：自顶向下 — 记忆化递归（从大问题递归到小问题）
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n]; // 命中缓存
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// 方式二：自底向上 — dp 迭代（从小问题推导大问题）
function fibDP(n) {
  if (n <= 1) return n;
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
```

**选择建议**：面试优先写自底向上（dp 数组迭代），因为容易做空间优化（只保留需要的状态），且不会爆递归栈。记忆化递归在状态转移不直观、递归结构更清晰时使用。

### 一维 DP -> 二维 DP 的递进

- **一维 DP**：爬楼梯、打家劫舍、最大子数组和 — `dp[i]` 只依赖固定的前几个位置
- **二维 DP**：不同路径、编辑距离、背包问题 — `dp[i][j]` 表格形式，依赖左边和上边

```js
// 不同路径（二维 DP 入门）：从左上角到右下角有多少条路径
// dp[i][j] = dp[i-1][j] + dp[i][j-1]（到达当前格 = 从上来 + 从左来）
function uniquePaths(m, n) {
  // 空间优化：滚动数组，只用一维数组
  const dp = new Array(n).fill(1); // 第一行全是 1
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] = dp[j] + dp[j - 1]; // dp[j] 是上一行的值，dp[j-1] 是本行左边刚算出的值
    }
  }
  return dp[n - 1];
}
```

## 面试套路

| 题目特征 | 优先方案 |
|---------|---------|
| "最大/最小/最多/最少" + 有明显递推 | DP |
| "有多少种方法/路径/方案" | DP |
| 序列 + "子序列/子数组" + 最值 | DP（LIS 或 Kadane 模式） |
| 二维网格 + 路径/面积 | 二维 DP |
| 选或不选 + 容量限制（背包变体） | 0-1 背包 DP |
| 前端岗位提醒 | DP 考得不深，掌握 3-5 道经典题即可，不考编辑距离 |

## 深拓展

### DP 通用解题步骤

1. **定义状态**：`dp[i]` 或 `dp[i][j]` 代表什么？是"以 i 结尾"还是"前 i 个"？
2. **找状态转移方程**：当前状态如何由之前的状态推导？
3. **初始化 base case**：`dp[0]`、`dp[1]` 等边界条件
4. **确定遍历顺序**：从小到大还是从大到小？二维时先遍历哪个维度？
5. **返回结果**：`dp[n]` 或 `Math.max(...dp)`

### 空间优化：滚动数组

很多 DP 题 `dp[i]` 只依赖 `dp[i-1]` 和 `dp[i-2]`，可以用两个变量替代整个数组，空间从 O(n) 降到 O(1)。二维 DP 中若 `dp[i][j]` 只依赖上一行，可用一维数组代替二维矩阵（如上面的"不同路径"）。面试时先写完整 dp 数组确保正确，再提空间优化方案，不要一步到位导致 bug。

## 易错点

1. **dp 数组初始化值错误**：LIS 初始化为 1（每个元素自身是长度 1 的 LIS），最大子数组和初始化为 `nums[0]` 或 `-Infinity`。
2. **状态定义模糊**：`dp[i]` 是"以 i 结尾"还是"前 i 个"？定义不同，转移方程完全不同。写代码前先在注释写清楚定义。
3. **遍历顺序错误**：二维 DP 依赖左边和上边时，必须从上到下、从左到右遍历。依赖右边时要从右到左。
4. **忘记 base case**：没有初始化边界导致 `dp[0]` 或 `dp[1]` 为 `undefined`，后续计算得到 NaN。

## 相关阅读

- [算法 知识地图](./index.md)
- [二分查找](./binary-search.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-06：初始创建，覆盖 DP 三要素、经典入门题、记忆化 vs dp 数组、一维到二维递进、面试套路
