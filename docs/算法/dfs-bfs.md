---
title: DFS / BFS
description: 深度优先搜索与广度优先搜索面试知识点
category: 算法
type: algorithm
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
reviewed: null
tags:
  - DFS
  - BFS
  - 回溯
  - 二叉树
  - 图
---

# DFS / BFS

> ⭐⭐⭐⭐｜难度：高级

**DFS（深度优先搜索）和 BFS（广度优先搜索）是树和图问题的两种基本遍历策略。DFS 适合"找所有路径"、"回溯"类问题，用递归或栈实现；BFS 适合"最短路径"、"层序遍历"类问题，用队列实现。**

## 一句话总结

**DFS 是一条路走到黑（递归/栈 + 回溯），BFS 是层层扩散（队列 + 最短路径）。二叉树前/中/后序遍历用 DFS，层序遍历用 BFS。求所有路径用 DFS，求最短路径用 BFS。**

## 核心机制

### DFS：深度优先搜索

DFS 的核心是**回溯**：沿一条路径走到尽头，然后回退一步，换另一条路继续。递归是最自然的实现，也可以用栈手动模拟。

**二叉树遍历（DFS 三种变体）**：

```js
// 前序 Preorder：根 -> 左 -> 右 （用于序列化/拷贝树）
// 中序 Inorder：  左 -> 根 -> 右 （BST 得到有序序列）
// 后序 Postorder：左 -> 右 -> 根 （计算子树高度、删除节点）

// 递归版 DFS 前序遍历
function preorder(root, result = []) {
  if (!root) return result;
  result.push(root.val);     // 先处理当前节点
  preorder(root.left, result);
  preorder(root.right, result);
  return result;
}

// 迭代版 DFS（栈模拟）：手动压栈替代系统调用栈
function preorderIterative(root) {
  if (!root) return [];
  const result = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();           // 弹出栈顶
    result.push(node.val);
    // 先压右再压左，保证左子树先出栈
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return result;
}
```

**回溯模板**：回溯 = DFS + 状态重置。

```js
// 回溯通用模板：做选择 -> 递归 -> 撤销选择
function backtrack(path, choices, result) {
  if (/* 满足结束条件 */) {
    result.push([...path]); // 注意拷贝，path 后续会被修改
    return;
  }
  for (const choice of choices) {
    path.push(choice);          // 做选择
    backtrack(path, newChoices, result); // 递归探索
    path.pop();                 // 撤销选择（回溯的关键！）
  }
}
```

### BFS：广度优先搜索

BFS 用**队列**实现，逐层处理。核心特点：**先处理的节点离起点最近**，因此天然适合求最短路径。

```js
// BFS 层序遍历模板
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length; // 当前层的节点数
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift(); // 出队
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel); // 一层处理完毕
  }
  return result;
}
// 注意：Array.shift() 是 O(n)；生产环境可用索引指针优化为 O(1)
```

### 经典题：岛屿数量

网格中的连通性问题，DFS 和 BFS 均可解，DFS 代码更简洁。

```js
// DFS 解法：遍历网格，遇到陆地(1)递归淹没整个岛屿
function numIslands(grid) {
  let count = 0;
  const rows = grid.length, cols = grid[0].length;

  // DFS 淹没函数：将当前陆地及相连的所有陆地标记为水
  function dfs(r, c) {
    // 越界或遇到水 -> 终止条件
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') return;
    grid[r][c] = '0'; // 淹没（标记已访问，省去 visited 数组）
    // 向四个方向递归探索
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;    // 发现新岛屿
        dfs(r, c);  // 淹没整个岛屿，防止重复计数
      }
    }
  }
  return count;
}
```

## DFS vs BFS 选择依据

| 场景 | 选择 | 原因 |
|------|------|------|
| 找所有路径 / 所有组合排列 | DFS（回溯） | DFS 天然支持路径记录和回溯 |
| 最短路径 / 最少步数 / 最少操作 | BFS | BFS 逐层扩散，首次到达即最短 |
| 树的遍历（前/中/后序） | DFS | 递归自然对应三种顺序 |
| 树的层序遍历 | BFS | 队列天然按层处理 |
| 网格连通性（岛屿、迷宫） | 皆可 | DFS 代码简洁；BFS 避免栈溢出 |
| 图深度未知、可能很深 | BFS | 避免 DFS 递归栈溢出 |

## 面试套路

| 题目特征 | 优先方案 |
|---------|---------|
| "所有路径"、"所有组合/排列/子集" | DFS + 回溯 |
| "最短路径"、"最少步数"、"最小操作次数" | BFS |
| "层序遍历"、"逐层处理"、"锯齿形遍历" | BFS |
| 二叉树前/中/后序遍历 | DFS（递归最简洁） |
| 网格搜索（岛屿、被围绕的区域） | DFS（代码简洁）或 BFS |
| "是否存在某路径" | DFS（到就停）或 BFS（找最短） |

## 易错点

1. **递归栈溢出**：树/链表深度过大时（如 10000 个节点），递归版 DFS 会爆栈。改用迭代栈或 BFS。
2. **BFS 用 `Array.shift()` 的性能隐患**：`shift()` 是 O(n)，大量元素时很慢。可维护一个 `head` 索引指针，用 `queue[head++]` 替代 `shift()`。
3. **visited 标记遗漏**：图/网格的 DFS 必须标记已访问节点，否则会无限循环（环）或重复访问（网格）。
4. **回溯时状态未重置**：递归返回后必须恢复到递归前的状态（`path.pop()`），否则影响其他分支的结果。
5. **岛屿 DFS 中修改原数组**：面试时先确认是否可以修改输入；如果不能，需要额外的 `visited` 二维数组。

## 相关阅读

- [算法 知识地图](./index.md)
- [树](./tree.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-18：Phase 3 事实审计——删除相关阅读中重复且缺 `.md` 后缀的"树"链接
- 2026-07-06：初始创建，覆盖 DFS/BFS 原理、二叉树遍历、回溯、岛屿数量、选择依据、面试套路
