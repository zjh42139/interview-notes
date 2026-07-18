---
title: 链表
description: 链表相关算法面试知识点
category: 算法
type: algorithm
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-18
reviewed: null
tags:
  - 链表
  - 反转
  - 环检测
  - 双指针
---

# 链表

> ⭐⭐⭐⭐｜难度：中级

**链表的核心操作是反转和双指针（快慢指针检测环），空间复杂度 O(1) 是面试要点 -- 链表题用额外数组辅助通常不算合格，面试官期待你用指针原地操作。**

## 一句话总结

**链表的核心操作是反转和双指针（快慢指针检测环），空间复杂度 O(1) 是面试要点。**

## 核心机制

### 反转链表

反转链表是链表题的基石，很多题（回文链表、K 个一组反转）都以它为基础。面试官期望你同时掌握迭代和递归两种写法。

```ts
class ListNode {
  val: number
  next: ListNode | null
  constructor(val: number, next: ListNode | null = null) {
    this.val = val
    this.next = next
  }
}

// 迭代：三指针 prev / curr / next
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let curr = head
  while (curr) {
    const next = curr.next   // 1. 保存下一个节点
    curr.next = prev         // 2. 反转指向
    prev = curr              // 3. prev 前进
    curr = next              // 4. curr 前进
  }
  return prev  // prev 就是新头节点
}

// 递归：reverseList(head.next) 后 head.next.next = head
function reverseListRecursive(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head  // 空或只剩一个节点
  const newHead = reverseListRecursive(head.next)
  head.next.next = head  // 让下一个节点指回自己
  head.next = null       // 断开原来的链接
  return newHead
}
```

### 快慢指针（Floyd 算法）

快指针每次走 2 步，慢指针每次走 1 步。三大用途：找中点、检测环、找环入口。

```ts
// 找中点：快指针走完时慢指针恰好在中间
function findMiddle(head: ListNode | null): ListNode | null {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
  }
  return slow
}

// 环检测：快慢指针相遇即有环
function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}

// 找环入口：相遇后快指针重置到头，两者同步走，再次相遇即为入口
function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) {        // 相遇
      fast = head               // 重置 fast 到头
      while (slow !== fast) {
        slow = slow!.next
        fast = fast!.next
      }
      return slow               // 再次相遇即入口
    }
  }
  return null
}
```

**Floyd 算法正确性证明**：设头到环入口距离为 a，环入口到相遇点距离为 b，相遇点到环入口距离为 c。相遇时 slow 走了 a+b，fast 走了 a+b+n(b+c)。因为 fast 速度是 slow 两倍，所以 `2(a+b) = a+b+n(b+c)`，化简得 `a = (n-1)(b+c) + c`。即从头部走 a 步 = 从相遇点走到环入口（c 步 + n-1 圈），所以重置后同步走必在入口相遇。

### 哑节点（Dummy Node）

在链表头部前面加一个虚拟节点，统一处理删除头节点等边界情况。

```ts
// 删除倒数第 N 个节点 — 有了 dummy，删除头节点不需要特殊处理
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head)
  let fast: ListNode | null = dummy, slow: ListNode | null = dummy
  // fast 先走 n+1 步
  for (let i = 0; i <= n; i++) fast = fast!.next
  // 同步走，fast 到 null 时 slow 在倒数第 n+1 个
  while (fast) { fast = fast.next; slow = slow!.next }
  slow!.next = slow!.next!.next  // 删除
  return dummy.next  // 关键：返回 dummy.next，不是 head
}
```

## 深度拓展

### 1. 反转链表（迭代+递归）

见上方核心机制代码。面试官常追问"递归的空间复杂度是多少？" -- O(n)（递归栈），迭代是 O(1)。

### 2. 环形链表 I 和 II

检测环用快慢指针相遇，找入口用 Floyd 算法。如果面试官问"能不能用哈希表？"，答案是可以但空间 O(n)，快慢指针才是 O(1) 空间的最优解。

### 3. 合并两个有序链表

```ts
function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0)
  let tail = dummy
  while (l1 && l2) {
    if (l1.val < l2.val) { tail.next = l1; l1 = l1.next }
    else { tail.next = l2; l2 = l2.next }
    tail = tail.next
  }
  tail.next = l1 || l2  // 接上剩余
  return dummy.next
}
```

### 4. 删除链表的倒数第 N 个节点

双指针间距 N + dummy 节点，见核心机制代码。

### 5. 回文链表

```ts
function isPalindrome(head: ListNode | null): boolean {
  if (!head) return true
  // 1. 快慢指针找中点
  let slow: ListNode | null = head, fast: ListNode | null = head
  while (fast && fast.next) { slow = slow!.next; fast = fast.next.next }
  // 2. 反转后半段
  let prev: ListNode | null = null
  while (slow) {
    const next = slow.next; slow.next = prev; prev = slow; slow = next
  }
  // 3. 比较前后两段
  let left = head, right = prev
  while (right) {
    if (left.val !== right.val) return false
    left = left.next!; right = right.next
  }
  return true
}
```

## 项目实战

### 1. LRU 缓存

双向链表 + HashMap，Vue 的 KeepAlive 组件就是 LRU 的变体 -- 缓存最近访问的组件实例，超出 max 时淘汰最久未使用的：

```ts
class LRUCache {
  private map = new Map<number, DoublyListNode>()
  private head = new DoublyListNode(0, 0)
  private tail = new DoublyListNode(0, 0)
  constructor(private capacity: number) {
    this.head.next = this.tail
    this.tail.prev = this.head
  }
  get(key: number): number {
    if (!this.map.has(key)) return -1
    const node = this.map.get(key)!
    this.moveToHead(node)  // 每次访问移到头部
    return node.value
  }
  put(key: number, value: number): void {
    if (this.map.has(key)) {
      this.map.get(key)!.value = value
      this.moveToHead(this.map.get(key)!)
      return
    }
    const node = new DoublyListNode(key, value)
    this.map.set(key, node)
    this.addToHead(node)
    if (this.map.size > this.capacity) {
      const removed = this.removeTail()
      this.map.delete(removed.key)
    }
  }
  private moveToHead(node: DoublyListNode) { this.removeNode(node); this.addToHead(node) }
  private addToHead(node: DoublyListNode) { /* 插入到 head 后 */ }
  private removeNode(node: DoublyListNode) { /* 从链表中移除 */ }
  private removeTail(): DoublyListNode { /* 移除 tail 前的节点 */ }
}
```

### 2. 撤销/重做

双向链表记录操作历史，`undo` 向前移动指针，`redo` 向后移动指针。新的操作会截断后续的 redo 历史：

```ts
class UndoRedoStack<T> {
  private history = new DoublyLinkedList<T>()
  private current = this.history.head
  push(state: T) { /* 插入到 current 后，截断后续 */ }
  undo(): T | null { /* current 前移 */ }
  redo(): T | null { /* current 后移 */ }
}
```

### 3. 任务队列

单向链表实现 FIFO 队列，入队 O(1)，出队 O(1)，常用于异步任务调度：

```ts
class TaskQueue {
  private head: ListNode | null = null
  private tail: ListNode | null = null
  enqueue(task: Task) {
    const node = new ListNode(task)
    if (!this.tail) { this.head = this.tail = node; return }
    this.tail.next = node
    this.tail = node
  }
  dequeue(): Task | null {
    if (!this.head) return null
    const task = this.head.val
    this.head = this.head.next
    if (!this.head) this.tail = null
    return task
  }
}
```

## 易错点

1. **空链表判断**：所有链表方法必须首先检查 `head === null`，否则 `null.next` 直接报错。
2. **dummy 节点忘记返回 `dummy.next`**：`return dummy.next` 而不是 `return head`，因为 head 可能已被删除。
3. **环检测边界**：`while (fast && fast.next)` 不能写成 `while (fast.next && fast.next.next)`，因为 fast 本身可能为空。
4. **反转时断开链表导致丢失**：迭代反转必须**先保存 next**，再修改 `curr.next`，顺序错了链表后半段就丢了，无法恢复。
5. **回文链表比较循环条件用 `while (right)`**：反转后前半段尾节点仍连着反转段的尾部，沿 left 方向可走的节点数不少于 right 链长度（偶数长度时恰好多 1 个共享的尾节点）。写成 `while (left)` 时，偶数长度下 right 先耗尽变 null，继续访问 `right.val` 会报错。

## 相关阅读

- [算法 知识地图](./index.md)
- [数组](./array.md)
- [树](./tree.md)
- [排序](./sort.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-18：Phase 3 事实审计——修正易错点 5 回文链表比较条件的说明（原"奇数时前半段多一个中间节点"有误，实际是偶数长度时 right 链先耗尽）；修正笔误"追问问"
- 2026-07-05：Phase 2 深度填充（反转链表 + Floyd 快慢指针 + dummy 节点 + 5 道高频题 + 项目实战）
