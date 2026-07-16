---
title: 数组扁平化 + 去重 + 排序
description: 手写数组组合操作——flat/flatten + 去重 + 排序，一道题考三个知识点
category: 手写题
type: practice
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 数组
  - flat
  - 递归
  - 去重
  - 排序
---

# 数组扁平化 + 去重 + 排序

> ⭐⭐⭐⭐⭐｜难度：中级｜美团/字节/阿里高频组合题

**面试官最喜欢的一题多考点：扁平化考递归/迭代，去重考 Set/Map，排序考 comparator。一道题覆盖三个知识点。**

## 核心实现

```typescript
// 题目：给定嵌套数组 [1, [2, [3, [4]], 5]]，扁平化后去重、排序
// 输入：任意深度嵌套的数组，可能包含重复数字
// 输出：升序排列的去重数组

function flattenUniqueSort(arr: any[]): number[] {
  // Step 1: 扁平化——递归版本
  function flatten(arr: any[]): number[] {
    const result: number[] = []
    for (const item of arr) {
      if (Array.isArray(item)) {
        result.push(...flatten(item))
      } else if (typeof item === 'number') {
        result.push(item)
      }
    }
    return result
  }

  // Step 2: 去重 + 排序
  return [...new Set(flatten(arr))].sort((a, b) => a - b)
}

// 测试
const arr = [1, [2, [3, [4]], 5], 2, [3, 1]]
console.log(flattenUniqueSort(arr))  // [1, 2, 3, 4, 5]
```

## 变体实现

```typescript
// 迭代版扁平化（栈）——避免深层嵌套递归爆栈
function flattenIterative(arr: any[]): number[] {
  const result: number[] = []
  const stack = [...arr]
  while (stack.length) {
    const item = stack.pop()
    if (Array.isArray(item)) {
      stack.push(...item)  // 展开后重新入栈
    } else if (typeof item === 'number') {
      result.push(item)
    }
  }
  return result.reverse()  // 栈是反的，反转回来
}

// 控制深度版本
function flattenDepth(arr: any[], depth: number = 1): number[] {
  if (depth === 0) return arr.filter(v => typeof v === 'number')
  const result: number[] = []
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flattenDepth(item, depth - 1))
    } else if (typeof item === 'number') {
      result.push(item)
    }
  }
  return result
}
```

## 面试追问

| 追问 | 回答 |
|------|------|
| "递归版本和迭代版本怎么选" | 数据量小用递归（简洁），深度不可控或 1000+ 层用迭代（防爆栈） |
| "怎么按对象字段去重" | `[...new Map(arr.map(v => [v.id, v])).values()]`——Map 保证 key 唯一 |
| "时间复杂度和空间复杂度" | 扁平化 O(n)、去重 O(n)、排序 O(n log n)，总体 O(n log n) |

## 相关阅读

- [深拷贝](./deep-clone.md) — 递归遍历的进阶应用
- [数组方法大全](../JavaScript/array-methods.md) — 原生 flat/sort/filter 的完整用法

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐
