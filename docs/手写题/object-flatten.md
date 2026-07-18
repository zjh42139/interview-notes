---
title: 对象扁平化 / 数组原型方法手写
description: 手写嵌套对象扁平化 + Array.prototype.map/filter/reduce + sleep + JSON.parse/stringify
category: 手写题
type: practice
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 对象
  - 递归
  - 数组方法
  - Promise
  - 手写题
---

# 对象扁平化 / 数组方法 / 工具函数

> ⭐⭐⭐⭐｜难度：中级｜大厂二面手写补充题

**这些是手写题的"第二梯队"——不如 Promise/bind/深拷贝高频，但字节/阿里/美团二面常作为补充题出现。考点集中：递归思维、原型方法理解、Promise 控制。**

## 1. 对象扁平化

```typescript
// 输入: { a: { b: { c: 1 } }, d: 2 }
// 输出: { 'a.b.c': 1, 'd': 2 }

function flattenObject(obj: Record<string, any>, prefix = '', result: Record<string, any> = {}): Record<string, any> {
  for (const key of Object.keys(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], newKey, result)
    } else {
      result[newKey] = obj[key]
    }
  }
  return result
}
```

## 2. Array.prototype.map

```typescript
Array.prototype.myMap = function <T, U>(
  callback: (value: T, index: number, array: T[]) => U,
  thisArg?: any
): U[] {
  const result: U[] = new Array(this.length)  // 原生 map 的结果 length 与原数组一致
  for (let i = 0; i < this.length; i++) {
    if (i in this) {  // 空位不调用 callback，且在结果中保留为空位（不能用 push——会压缩长度）
      result[i] = callback.call(thisArg, this[i], i, this)
    }
  }
  return result
}
```

## 3. Array.prototype.filter

```typescript
Array.prototype.myFilter = function <T>(
  callback: (value: T, index: number, array: T[]) => boolean,
  thisArg?: any
): T[] {
  const result: T[] = []
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i])
    }
  }
  return result
}
```

## 4. Array.prototype.reduce

```typescript
Array.prototype.myReduce = function <T, U>(
  callback: (acc: U, value: T, index: number, array: T[]) => U,
  initialValue?: U
): U {
  // 用 arguments.length 区分「没传初始值」和「显式传了 undefined」（对齐原生）
  const hasInit = arguments.length >= 2
  let startIndex = 0
  let acc: any

  if (hasInit) {
    acc = initialValue
  } else {
    // 无初始值：取第一个非空位元素作为 acc；空数组直接抛错（对齐原生）
    while (startIndex < this.length && !(startIndex in this)) startIndex++
    if (startIndex >= this.length) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
    acc = this[startIndex++]
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      acc = callback(acc, this[i], i, this)
    }
  }
  return acc
}
```

## 5. sleep 函数

```typescript
// 基础版
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 带取消能力
function cancellableSleep(ms: number) {
  let timer: ReturnType<typeof setTimeout>
  const promise = new Promise<void>(resolve => {
    timer = setTimeout(resolve, ms)
  })
  return {
    promise,
    cancel: () => clearTimeout(timer),
  }
}
```

## 6. JSON.stringify（简化版）

```typescript
function myStringify(value: any): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    return `[${value.map(v => myStringify(v)).join(',')}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, v]) => v !== undefined && typeof v !== 'function' && typeof v !== 'symbol')
      .map(([k, v]) => `"${k}":${myStringify(v)}`)
    return `{${entries.join(',')}}`
  }
  return undefined!  // function/undefined/symbol → 忽略
}
```

## 面试追问

| 追问 | 回答 |
|------|------|
| "map 和 forEach 的区别" | map 返回新数组、forEach 无返回值。手写时 map 多了 result.push |
| "reduce 不加 initialValue 会怎样" | 取数组第一个（非空位）元素作为 acc，从下一个元素开始循环。空数组会抛 TypeError |
| "JSON.stringify 处理不了什么" | function/undefined/symbol/循环引用——生产级需要 WeakMap 去重和类型判断 |

## 相关阅读

- [深拷贝](./deep-clone.md) — 递归遍历 + 类型判断的完整实现
- [数组方法大全](../JavaScript/array-methods.md)

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐
