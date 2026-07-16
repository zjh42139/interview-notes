---
title: 回溯算法
description: 回溯算法（Backtracking）——全排列、组合总和、N 皇后等经典题型的通用模板
category: 算法
type: algorithm
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 回溯
  - DFS
  - 全排列
  - 组合
  - 剪枝
---

# 回溯算法

> ⭐⭐⭐⭐｜难度：高级｜字节/阿里中等难度常考

**回溯是穷举所有可能性的算法模式——DFS 遍历决策树，发现走不通就撤销选择回到上一步。前端面试中全排列和组合总和是出现频率最高的两道回溯题。**

## 一句话总结

**回溯 = 递归 + 循环。在递归的每一层枚举所有可能的选择，做出选择后进入下一层，递归返回后撤销选择（恢复状态）。模板：`function backtrack(path, options) { if (终止条件) 记录结果; for (选项 of options) { 做选择; backtrack(path, options); 撤销选择 } }`**

## 通用模板

```typescript
function backtrack<T>(
  path: T[],           // 当前路径
  choices: T[],        // 剩余可选项
  result: T[][]        // 收集所有解
) {
  // 终止条件：找到一个解
  if (path.length === targetLength) {
    result.push([...path])
    return
  }

  for (let i = 0; i < choices.length; i++) {
    // 剪枝：跳过不满足条件的选项
    if (shouldSkip(choices[i])) continue

    // 做选择
    path.push(choices[i])
    // 递归：进入下一层（缩小选项范围）
    backtrack(path, choices.filter((_, idx) => idx !== i), result)
    // 撤销选择（回溯的核心）
    path.pop()
  }
}
```

## 经典题目

### 1. 全排列（LeetCode 46）

```typescript
function permute(nums: number[]): number[][] {
  const result: number[][] = []

  function backtrack(path: number[], used: boolean[]) {
    if (path.length === nums.length) {
      result.push([...path])
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue  // 跳过已使用的
      path.push(nums[i])
      used[i] = true
      backtrack(path, used)
      path.pop()     // 撤销
      used[i] = false
    }
  }

  backtrack([], Array(nums.length).fill(false))
  return result
}
```

### 2. 括号生成（LeetCode 22）

```typescript
function generateParenthesis(n: number): string[] {
  const result: string[] = []

  function backtrack(path: string, open: number, close: number) {
    if (path.length === n * 2) {
      result.push(path)
      return
    }
    // 剪枝：左括号数量 < n 才能加
    if (open < n) backtrack(path + '(', open + 1, close)
    // 剪枝：右括号数量 < 左括号数量 才能加
    if (close < open) backtrack(path + ')', open, close + 1)
  }

  backtrack('', 0, 0)
  return result
}
```

### 3. 组合总和（LeetCode 39）

```typescript
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = []

  function backtrack(start: number, path: number[], sum: number) {
    if (sum === target) {
      result.push([...path])
      return
    }
    if (sum > target) return  // 剪枝

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i])
      backtrack(i, path, sum + candidates[i])  // 允许重复选当前元素
      path.pop()
    }
  }

  backtrack(0, [], 0)
  return result
}
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "回溯和 DFS 的区别" | DFS 是树/图遍历模式，回溯是"做选择→递归→撤销"的决策树穷举。回溯用 DFS 实现 |
| "怎么避免重复解" | 剪枝——排序后跳过相同元素、限制选择范围（start 参数） |
| "排列和组合的回溯区别" | 排列每次从头遍历所有选项（用 used[] 标记），组合只从 start 往后遍历 |

## 相关阅读

- [DFS / BFS](./dfs-bfs.md) — 回溯是 DFS 在决策树上的应用
- [动态规划](./dynamic-programming.md) — DP 求最优解（回溯求所有解）

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐
