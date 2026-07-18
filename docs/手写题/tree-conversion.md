---
title: 列表转树 / 树转列表
description: 手写扁平数组与树形结构互转——id-parentId 映射
category: 手写题
type: practice
score: 0
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 树
  - 递归
  - Map
  - 手写题
---

# 列表转树 / 树转列表

> ⭐⭐⭐⭐｜难度：中高级｜字节/阿里常考

**后端返回扁平数组（id + parentId），前端需要渲染成树（菜单/组织架构）。两向互转是日常开发最高频的数据结构操作。**

## 列表转树

```typescript
interface TreeNode {
  id: number; parentId: number | null; name: string; children?: TreeNode[]
}

function listToTree(list: TreeNode[]): TreeNode[] {
  const map = new Map<number, TreeNode>()
  const roots: TreeNode[] = []
  for (const node of list) {
    map.set(node.id, { ...node, children: [] })
  }
  for (const node of list) {
    const current = map.get(node.id)!
    const parent = map.get(node.parentId!)
    if (parent) { parent.children!.push(current) }
    else { roots.push(current) }
  }
  return roots
}
// O(n) 两遍循环：先建索引，再挂载。比递归过滤 O(n^2) 快 100 倍以上
```

## 树转列表

```typescript
function treeToList(root: TreeNode): TreeNode[] {
  const result: TreeNode[] = []
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()!
    const { children, ...rest } = node
    result.push(rest as TreeNode)
    if (children) queue.push(...children)
  }
  return result
}
```

## 面试追问

| 追问 | 回答 |
|------|------|
| "为什么常用两遍循环" | 子节点可能在父节点之前出现，先建完索引再挂载最不易错。严格说单循环也能做——遇到还没出现的 parentId 先创建占位节点——但代码更绕，面试写两遍循环最稳 |
| "Map 方案和递归方案的时间复杂度" | O(n) vs O(n^2)——10万条数据差距 >100 倍 |

## 相关阅读

- [算法：树](../算法/tree.md)
- [数组扁平化+去重+排序](./flatten-unique-sort.md)

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐
