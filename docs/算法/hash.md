---
title: 哈希表
description: 哈希表面试知识点
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
  - 哈希表
  - Map
  - Set
  - 两数之和
---

# 哈希表

> ⭐⭐⭐⭐⭐｜难度：中级

**哈希表是空间换时间的典型数据结构，O(1) 的平均查找时间使其成为"查找"、"去重"、"计数"类问题的首选方案。前端面试中最常见的是用 Map/Set 配合数组解决两数之和、最长无重复子串等高频题。**

## 一句话总结

**哈希表通过哈希函数将 key 映射到数组下标，实现 O(1) 的增删查；JS 中 Map / Set / WeakMap / WeakSet 各有适用场景，选对数据结构事半功倍。**

## 核心机制

### 哈希表原理

核心流程：**key -> hash function -> hash code -> bucket index**。底层用数组存储，每个位置称为"桶"（bucket）。当多个 key 映射到同一个桶时，产生哈希冲突，需要用链地址法或开放寻址法解决。

```js
// 简化模拟：哈希表的内部结构
class MyHashMap {
  constructor(size = 16) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
  }

  _hash(key) {
    // 简单哈希：字符串累加取模（31 是经典乘数，分布更均匀）
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.size;
    }
    return hash;
  }

  put(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    // 链地址法：遍历桶内链表，更新或追加
    for (const pair of bucket) {
      if (pair[0] === key) { pair[1] = value; return; }
    }
    bucket.push([key, value]);
  }

  get(key) {
    const index = this._hash(key);
    for (const pair of this.buckets[index]) {
      if (pair[0] === key) return pair[1];
    }
    return -1;
  }
}
```

### JS 中的 Map / Set / WeakMap / WeakSet

| 数据结构 | 特点 | 使用场景 |
|---------|------|---------|
| `Map` | 键值对，key 可以是任意类型，保持插入顺序 | 计数、映射关系、缓存 |
| `Set` | 唯一值集合，自动去重 | 去重、存在性判断 |
| `WeakMap` | key 只能是对象，弱引用（不阻止 GC），不可遍历 | 私有数据、DOM 元数据 |
| `WeakSet` | value 只能是对象，弱引用，不可遍历 | 标记对象状态 |

**WeakMap 的典型场景**：给 DOM 元素关联额外数据，当 DOM 被移除时，WeakMap 中的记录自动被垃圾回收，避免内存泄漏。WeakMap 没有 `size`、`forEach`、迭代器，因为弱引用的对象随时可能被回收，不可枚举。

### 经典面试题

**两数之和 — 哈希表 O(n)**：遍历数组，对每个元素 `nums[i]`，检查 `target - nums[i]` 是否已经在 Map 中。

```js
// 两数之和：空间换时间，O(n) 时间、O(n) 空间
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    // 核心操作：O(1) 查找"补数"是否存在
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i); // 存值与下标的映射
  }
  return [-1, -1];
}
```

**最长无重复子串 — Set + 滑动窗口**：Set 用于 O(1) 判断字符是否在当前窗口内。

```js
// 滑动窗口 + Set：Set 的 has/delete 都是 O(1)
function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    // 遇到重复字符 → 左指针收缩直到窗口内无重复
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

### 哈希冲突解决

1. **链地址法（Chaining）**：每个桶存一个链表/红黑树，冲突时追加到链表。Java HashMap 和 JS 引擎内部均使用此方法。当链表长度超过阈值（如 8）时转为红黑树，最坏情况从 O(n) 降到 O(log n)。

2. **开放寻址法（Open Addressing）**：冲突时按某种规则（线性探测、二次探测、双重哈希）找下一个空桶。缓存友好，但删除麻烦（需要墓碑标记），负载因子高时性能下降严重。

## 面试套路

| 题目特征 | 优先考虑的方案 |
|---------|--------------|
| "查找"、"是否存在"、"两数之和" | Map 存储映射关系 |
| "去重"、"是否重复"、"第一个不重复" | Set 或 Map 计数 |
| "计数"、"出现次数"、"频率统计" | Map（value 为出现次数） |
| "最长/最短子串" + 无重复约束 | Set + 滑动窗口 |
| 给对象/DOM 关联私有/元数据 | WeakMap（防止内存泄漏） |

## 深拓展

### 为什么哈希表平均 O(1)？

好的哈希函数将 key 均匀分散到各桶，使得每个桶的元素数量接近 `n / bucketCount`（负载因子）。负载因子越低，冲突越少，查找越快。当负载因子超过阈值（如 0.75）时，扩容并重新哈希（rehash），摊还分析后仍为 O(1)。

### 两数之和 vs 三数之和

两数之和用哈希表 O(n) 是标准解。三数之和需要**排序 + 固定一个数 + 双指针** O(n^2)，因为三数之和要求返回**不重复**的三元组——用哈希表去重非常麻烦，而排序后跳过相同元素就简单得多。这说明不同问题结构需要不同数据结构组合。

## 易错点

1. **Map vs 普通对象**：普通对象 `{}` 的 key 只能是字符串/Symbol，`obj[1]` 和 `obj["1"]` 是同一个 key。Map 的 key 可以是任意类型，`1` 和 `"1"` 是不同的 key。
2. **Set 判断存在用 `has` 不是 `includes`**：Set 没有 `includes` 方法，用 `set.has(value)`。
3. **WeakMap 不可遍历**：不能 `for...of`，没有 `.size`，只用于关联元数据而非"存储数据集合"。
4. **哈希冲突导致的最坏情况**：极端输入（如故意构造哈希碰撞）可能让查找退化到 O(n)，这也是为什么面试官有时会问"如何攻击哈希表"。

## 相关阅读

- [算法 知识地图](./index.md)
- [数组](./array.md)
- [滑动窗口](./sliding-window.md)
- [高频题](./common-questions.md)

## 更新记录

- 2026-07-06：初始创建，覆盖哈希表原理、JS Map/Set 系列、经典面试题、冲突解决、面试套路
