---
title: LRU Cache
description: 手写 LRU（最近最少使用）缓存，支持 O(1) 的 get 和 put 操作
category: 手写题
type: exercise
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - LRU
  - 哈希表
  - 双向链表
  - Map
  - 手写题
---

# LRU Cache

> &#11088;&#11088;&#11088;&#11088;｜难度：中级&#9733;&#9733;

## 一句话总结

**LRU（Least Recently Used）的核心是"最近没用到的优先淘汰"。O(1) 查询+更新的关键是用哈希表定位节点 + 双向链表管理顺序——访问时移到链表头，淘汰时删链表尾。实际项目中可以用 `new Map()` 天然实现，因为 Map 的 key 按插入顺序排列。**

## 题目

实现 `LRUCache` 类：
- `get(key)` —— 如果 key 存在，返回值并标记为"最近使用"。O(1)
- `put(key, value)` —— 插入或更新。如果容量满了，删除最久未使用的。O(1)

## 思路

两个数据结构的组合：

```
哈希表（key→链表节点） → O(1) 查找节点
双向链表（头→尾 = 最近→最久） → O(1) 移动/删除/插入

操作：
  get: 哈希找到节点 → 移到链表头部 → 返回值
  put: 哈希找到节点→更新值→移到头部
       没找到→新建节点→插入头部→存入哈希
       容量超了→删除链表尾部节点→从哈希删除
```

```
双向链表结构：
  [head] ⇄ [最近使用] ⇄ [次近] ⇄ ... ⇄ [最久未用] ⇄ [tail]
    ↑                                         ↑
   新节点插入这里                          满了删这里
```

## 基础版——手写双向链表

```javascript
// 双向链表节点
class ListNode {
  constructor(key, value) {
    this.key = key
    this.value = value
    this.prev = null
    this.next = null
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map()  // key → ListNode

    // 虚拟头尾节点——简化边界处理
    this.head = new ListNode(0, 0)  // dummy head
    this.tail = new ListNode(0, 0)  // dummy tail
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  get(key) {
    if (!this.map.has(key)) return -1

    const node = this.map.get(key)
    this._moveToHead(node)   // 标记为最近使用
    return node.value
  }

  put(key, value) {
    if (this.map.has(key)) {
      // 已存在 → 更新值 + 移到头部
      const node = this.map.get(key)
      node.value = value
      this._moveToHead(node)
    } else {
      // 新建节点
      const node = new ListNode(key, value)
      this.map.set(key, node)
      this._addToHead(node)

      if (this.map.size > this.capacity) {
        // 超出容量 → 删除尾部节点
        const removed = this._removeTail()
        this.map.delete(removed.key)
      }
    }
  }

  // --- 双向链表操作 ---
  _addToHead(node) {
    node.prev = this.head
    node.next = this.head.next
    this.head.next.prev = node
    this.head.next = node
  }

  _removeNode(node) {
    node.prev.next = node.next
    node.next.prev = node.prev
  }

  _moveToHead(node) {
    this._removeNode(node)   // 从原位置摘下来
    this._addToHead(node)    // 插到头部
  }

  _removeTail() {
    const node = this.tail.prev
    this._removeNode(node)
    return node  // 返回被删节点——调用方需要从 map 中删除
  }
}
```

## 升级版——利用 Map 的天然顺序

```javascript
// JS 的 Map 按插入顺序迭代——天然支持 LRU
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map()
  }

  get(key) {
    if (!this.map.has(key)) return -1

    const value = this.map.get(key)
    // 关键：删除再插入——让它变成"最新"
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  put(key, value) {
    // 已存在→删旧
    if (this.map.has(key)) {
      this.map.delete(key)
    }

    this.map.set(key, value)

    // 超出容量→删除最旧的（Map 的第一个 key）
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value
      this.map.delete(oldest)
    }
  }
}
```

**面试技巧**：先写升级版（10 行、Map 天然有序），再写基础版（手写链表展示底层理解）。这展示你是"知道怎么最简洁地解决问题 + 也知道底层怎么实现"。

## 深度拓展

### LRU 在实际项目中的使用

1. **KeepAlive 组件的缓存淘汰**：Vue3 的 `<KeepAlive max="10">` 内部就是 LRU——缓存最多 10 个组件实例，超出就淘汰最久未访问的
2. **图片/资源缓存**：浏览器对已渲染图片的内存缓存也是类似 LRU 的变种
3. **API 响应缓存**：前端缓存 API 响应——相同参数短时间内不重复请求。LRU 控制缓存大小防止内存爆炸
4. **路由标签页**：后台管理系统的 Tab 标签页——打开太多 Tab 时自动关闭最久未查看的

### LFU（Least Frequently Used）—— LRU 的升级

```
LRU：最近没用的优先淘汰（只看时间）
LFU：使用频率最低的优先淘汰（看次数）

例子：
  页面 A 被访问了 100 次，但最近 1 小时没人看
  页面 B 被访问了 3 次，最近 1 分钟被访问过
  
  LRU → 淘汰 A（时间最久）        可能不对——A 是高频页面
  LFU → 淘汰 B（次数最少）        更合理——A 虽然暂时没人看但历史热度高

LFU 实现需要：
  哈希表 key→Node（和 LRU 一样）
  频率哈希表 freq→双向链表（每个频率维护一个 LRU 链表）
  淘汰时找最小频率对应的链表→删尾部
```

## 易错点

1. **虚拟头尾节点的 next/prev 要双向连接** —— `head.next = tail; tail.prev = head`。只设一边会导致 `_removeTail` 时 `node.prev` 是 null，访问 `node.prev.next` 直接报错
2. **Map 版 LRU 的 delete 再 set** —— 不能只 `map.set(key, value)`。set 不会改变已存在 key 的顺序——`map.keys().next()` 仍然指向它。必须先 delete 再 set
3. **capacity 可能为 0** —— `put` 前检查 capacity ≤0 直接返回。面试时没人提但生产代码必须处理
4. **_removeTail 忘了从 map 删除** —— 双向链表删了但 map 还持有引用——内存泄漏

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "LRU 怎么实现 O(1)" | 追问为什么用双向链表而不是单向——删除节点需要前驱指针 |
| "Map 版 LRU 为什么要先 delete 再 set" | 追问 Map 的插入顺序语义和迭代器 |
| "LRU 和 LFU 有什么区别" | 追问 LFU 的实现——频率桶+双向链表 |
| "实际项目中哪里用了 LRU" | 追问 KeepAlive 的 max 属性就是 LRU |

## 相关阅读

- [Set / Map / WeakMap](../JavaScript/set-map-weakmap.md)
- [KeepAlive](../Vue3/keepalive.md)
- [浏览器缓存](../浏览器/cache.md)

## 更新记录

- 2026-07-10：新建（双向链表版 + Map 版 + 升级版/LFU + 项目实战场景）
