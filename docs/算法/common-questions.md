---
title: 高频题
description: 高频算法面试题合集
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
  - LeetCode
  - 面试题
  - Top30
---

# 高频题

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★

**前端面试 30 道高频算法题，以简单到中等难度为主，重点是思路 + 复杂度分析 + 能写出来。按类型分组（字符串/数组/链表/树/动态规划/其他），每类标注频率和难度。**

## 一句话总结

**前端面试 30 道高频算法题，以简单到中等难度为主，重点是思路 + 复杂度分析 + 能写出来。**

## 核心机制

按类型分组，每类挑选频率最高、最有代表性的题目。面试时优先刷前三类（字符串、数组、链表），再补树和动态规划。

| 类别 | 频率 | 代表题 | 核心技巧 |
|------|------|--------|---------|
| 字符串 | 极高 | 有效括号、最长公共前缀 | 栈、纵向扫描 |
| 数组 | 极高 | 两数之和、买卖股票 | 哈希表、贪心 |
| 链表 | 高 | 反转链表、环检测 | 双指针、dummy |
| 树 | 高 | 最大深度、中序遍历 | DFS/BFS 递归 |
| 动态规划 | 中 | 爬楼梯、最大子数组和 | 状态转移 |
| 其他 | 中 | LRU 缓存、栈实现队列 | 数据结构设计 |

## 深度拓展

### 字符串类

**1. 有效括号** -- 栈匹配，遇到左括号入栈，右括号检查栈顶是否匹配。

```ts
function isValid(s: string): boolean {
  const stack: string[] = []
  const map: Record<string, string> = { ")": "(", "]": "[", "}": "{" }
  for (const ch of s) {
    if (!map[ch]) { stack.push(ch) }
    else if (stack.pop() !== map[ch]) return false
  }
  return stack.length === 0
}
// 时间 O(n)，空间 O(n)
```

**2. 最长公共前缀** -- 纵向扫描：以第一个字符串为基准，逐字符对比所有字符串。

```ts
function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return ""
  for (let i = 0; i < strs[0].length; i++) {
    const ch = strs[0][i]
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== ch) return strs[0].slice(0, i)
    }
  }
  return strs[0]
}
// 时间 O(S)，S 为所有字符总数，空间 O(1)
```

**3. 字符串相加（大数加法）** -- 双指针从末尾模拟竖式加法，维护进位 carry。

```ts
function addStrings(num1: string, num2: string): string {
  let i = num1.length - 1, j = num2.length - 1, carry = 0
  const result: string[] = []
  while (i >= 0 || j >= 0 || carry) {
    const sum = (num1[i--] ?? "0").charCodeAt(0) - 48 +
                (num2[j--] ?? "0").charCodeAt(0) - 48 + carry
    result.push(String(sum % 10))
    carry = Math.floor(sum / 10)
  }
  return result.reverse().join("")
}
// 时间 O(max(m, n))，空间 O(max(m, n))
```

### 数组类

**4. 两数之和** -- 哈希表存 value->index，遍历时查 complement。

```ts
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i]
    if (map.has(comp)) return [map.get(comp)!, i]
    map.set(nums[i], i)
  }
  return []
}
// 时间 O(n)，空间 O(n)
```

**5. 买卖股票的最佳时机** -- 一次遍历记录最低价，计算当天卖出的最大利润。

```ts
function maxProfit(prices: number[]): number {
  let minPrice = Infinity, maxProfit = 0
  for (const price of prices) {
    minPrice = Math.min(minPrice, price)
    maxProfit = Math.max(maxProfit, price - minPrice)
  }
  return maxProfit
}
// 时间 O(n)，空间 O(1)
```

**6. 合并两个有序数组** -- 从后往前填充，避免覆盖 nums1 的未处理元素。

```ts
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  let p1 = m - 1, p2 = n - 1, tail = m + n - 1
  while (p2 >= 0) {
    nums1[tail--] = p1 >= 0 && nums1[p1] > nums2[p2] ? nums1[p1--] : nums2[p2--]
  }
}
// 时间 O(m+n)，空间 O(1)
```

### 链表类

**7. 反转链表** -- 迭代三指针 prev/curr/next，递归 `head.next.next = head`。

```ts
function reverseList(head: ListNode | null): ListNode | null {
  let prev = null, curr = head
  while (curr) { const next = curr.next; curr.next = prev; prev = curr; curr = next }
  return prev
}
// 时间 O(n)，空间 O(1)
```

**8. 环形链表** -- 快慢指针，fast 每次 2 步，slow 每次 1 步，相遇则有环。

```ts
function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow!.next; fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
// 时间 O(n)，空间 O(1)
```

**9. 合并两个有序链表** -- 归并思想 + dummy 节点统一处理。

```ts
function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0); let tail = dummy
  while (l1 && l2) {
    if (l1.val < l2.val) { tail.next = l1; l1 = l1.next }
    else { tail.next = l2; l2 = l2.next }
    tail = tail.next
  }
  tail.next = l1 || l2
  return dummy.next
}
// 时间 O(m+n)，空间 O(1)
```

### 树类

**10. 二叉树最大深度** -- 递归 `1 + max(左, 右)`，迭代用 BFS 层序遍历计数。

```ts
function maxDepth(root: TreeNode | null): number {
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}
// 时间 O(n)，空间 O(h)，h 为树高
```

**11. 二叉树中序遍历（迭代）** -- 栈模拟：一路向左入栈，出栈时访问，再转向右子树。

```ts
function inorderTraversal(root: TreeNode | null): number[] {
  const res: number[] = [], stack: TreeNode[] = []
  let curr = root
  while (curr || stack.length) {
    while (curr) { stack.push(curr); curr = curr.left }
    curr = stack.pop()!; res.push(curr.val); curr = curr.right
  }
  return res
}
// 时间 O(n)，空间 O(h)
```

**12. 对称二叉树** -- 双指针递归比较镜像位置 `(p.left, q.right)` 和 `(p.right, q.left)`。

```ts
function isSymmetric(root: TreeNode | null): boolean {
  function check(p: TreeNode | null, q: TreeNode | null): boolean {
    if (!p && !q) return true
    if (!p || !q) return false
    return p.val === q.val && check(p.left, q.right) && check(p.right, q.left)
  }
  return check(root, root)
}
// 时间 O(n)，空间 O(h)
```

### 动态规划

**13. 爬楼梯** -- `dp[i] = dp[i-1] + dp[i-2]`，本质就是斐波那契数列。

```ts
function climbStairs(n: number): number {
  if (n <= 2) return n
  let prev1 = 1, prev2 = 2
  for (let i = 3; i <= n; i++) {
    [prev1, prev2] = [prev2, prev1 + prev2]
  }
  return prev2
}
// 时间 O(n)，空间 O(1)
```

**14. 最大子数组和（Kadane 算法）** -- `dp[i] = max(nums[i], dp[i-1] + nums[i])`。

```ts
function maxSubArray(nums: number[]): number {
  let maxSum = nums[0], currentSum = nums[0]
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i])
    maxSum = Math.max(maxSum, currentSum)
  }
  return maxSum
}
// 时间 O(n)，空间 O(1)
```

### 其他（数据结构设计）

**15. 用栈实现队列** -- 两个栈：inStack 入队，outStack 出队。outStack 为空时把 inStack 全部倒入。

```ts
class MyQueue {
  private inStack: number[] = []
  private outStack: number[] = []
  push(x: number): void { this.inStack.push(x) }
  pop(): number {
    this.prepare(); return this.outStack.pop()!
  }
  peek(): number {
    this.prepare(); return this.outStack[this.outStack.length - 1]
  }
  empty(): boolean { return !this.inStack.length && !this.outStack.length }
  private prepare(): void {
    if (!this.outStack.length) {
      while (this.inStack.length) this.outStack.push(this.inStack.pop()!)
    }
  }
}
// 均摊时间 O(1)
```

## 项目实战

### 1. 权限树遍历

递归 DFS 遍历后端返回的权限树，收集所有 `checked` 节点的 ID 列表，或过滤出当前用户拥有的权限项：

```ts
function collectCheckedPermissions(tree: PermNode[]): number[] {
  const ids: number[] = []
  function dfs(nodes: PermNode[]) {
    for (const node of nodes) {
      if (node.checked) ids.push(node.id)
      if (node.children) dfs(node.children)
    }
  }
  dfs(tree)
  return ids
}
```

### 2. 搜索关键词匹配

在文章列表中用字符串匹配筛选含有关键词的文章，高亮匹配片段。核心是 `indexOf` 或 `includes` 的批量应用，大数据量时可预处理为倒排索引：

```ts
function searchArticles(articles: Article[], keyword: string): Article[] {
  const lowerKw = keyword.toLowerCase()
  return articles.filter((a) =>
    a.title.toLowerCase().includes(lowerKw) ||
    a.content.toLowerCase().includes(lowerKw)
  )
}
```

### 3. 任务调度优先级

给定一组任务（每个有 deadline 和 profit），按利润降序排序后贪心安排，每个时间槽只做一件事，超时跳过。这本质是"最后期限调度"问题：

```ts
function scheduleTasks(tasks: Task[]): Task[] {
  tasks.sort((a, b) => b.profit - a.profit)  // 利润降序
  const maxDeadline = Math.max(...tasks.map((t) => t.deadline))
  const slots = new Array(maxDeadline + 1).fill(null)
  for (const task of tasks) {
    for (let t = task.deadline; t >= 1; t--) {
      if (!slots[t]) { slots[t] = task; break }
    }
  }
  return slots.filter(Boolean)
}
```

## 易错点

1. **边界条件**：空数组、空字符串、单节点链表、null 根节点 -- 永远是第一行判断。
2. **空输入**：`strs[0]` 在 `strs.length === 0` 时是 undefined，取 `strs[0][0]` 直接报错。
3. **整数溢出**：大数加法/斐波那契等题目，JS 的 number 是 53 位精度，超过 `Number.MAX_SAFE_INTEGER` 要用 BigInt 或字符串模拟。
4. **复杂度分析忽略空间**：递归有栈空间 O(h)；BFS 队列最坏 O(n)；哈希表也占空间。只说时间复杂度不提空间复杂度是不完整的。
5. **两数之和返回下标不要排序**：排序后下标就乱了。如果题目要求返回下标，哈希表是唯一 O(n) 的方案；如果只返回值，排序+双指针也可以。

## 相关阅读

- [算法 知识地图](./index.md)
- [数组](./array.md)
- [树](./tree.md)
- [链表](./linked-list.md)
- [排序](./sort.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（15 道高频题 + 6 大分类 + 项目实战 + 复杂度分析）
