---
title: 深拷贝
description: JavaScript 深拷贝的实现方案与 structuredClone API
category: JavaScript
type: mechanism
score: 86
difficulty: 中级
frequency: ⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - deep-clone
  - structuredClone
  - WeakMap
---

# 深拷贝

> &#11088;&#11088;&#11088;｜难度：中级&#9733;&#9733;&#9733;

## 一句话总结

**深拷贝是创建一个完全独立的副本，递归复制所有嵌套对象，处理循环引用和 Date、RegExp、Map、Set 等特殊类型，核心工具是 WeakMap（解决循环引用）和递归遍历。**

## 核心机制

### 浅拷贝 vs 深拷贝 -- 一张表说清楚

```ts
const obj = { a: 1, b: { c: 2 }, d: [1, 2, 3] }

// 浅拷贝 — 只复制第一层
const shallow1 = { ...obj }
const shallow2 = Object.assign({}, obj)
shallow1.b.c = 999
console.log(obj.b.c) // 999 — 原对象也被改了！共享同一个 b 引用

// JSON 深拷贝 — 最便捷但有局限
const deep1 = JSON.parse(JSON.stringify(obj))
deep1.b.c = 666
console.log(obj.b.c) // 999 — 原对象不受影响
```

| 方式 | 浅/深 | 循环引用 | undefined | 函数 | Date | RegExp | Map/Set | Symbol |
|------|-------|---------|-----------|------|------|--------|---------|--------|
| `{...obj}` | 浅 | - | - | - | - | - | - | ✅ |
| JSON.parse(stringify) | 深 | 报错 | 丢失 | 丢失 | 变字符串 | 变 {} | 丢失 | 丢失 |
| `structuredClone()` | 深 | 支持 | 支持 | 报错 | 支持 | 支持 | 支持 | 报错 |
| `lodash.cloneDeep` | 深 | 支持 | 支持 | 保留引用 | 支持 | 支持 | 支持 | 支持 |
| 手写 deepClone | 深 | WeakMap | 支持 | 支持 | 支持 | 支持 | 支持 | 支持 |

### structuredClone -- 2022 年的新选择

```ts
// 浏览器和 Node 17+ 原生支持
const original = {
  date: new Date(),
  map: new Map([["key", "value"]]),
  nested: { arr: [1, 2, 3] },
}
original.nested.self = original.nested // 循环引用

const cloned = structuredClone(original)
// cloned.nested.self === cloned.nested — 循环引用被正确处理！
// cloned.date instanceof Date — true，保留类型
// cloned.map instanceof Map — true
```

**structuredClone 的限制**：不能拷贝函数、Symbol、DOM 节点、Error 对象、原型链信息。如果你需要拷贝的对象只包含 JSON 兼容类型 + Date + Map/Set + 循环引用，structuredClone 是最佳选择。

### 手写深拷贝的核心架构

```ts
function deepClone<T>(obj: T, hash = new WeakMap<object, any>()): T {
  // 0. null 和基本类型直接返回
  if (obj === null || typeof obj !== "object") return obj

  // 1. 处理循环引用：如果已经拷贝过，直接返回缓存的副本
  if (hash.has(obj)) return hash.get(obj)

  // 2. 处理 Date
  if (obj instanceof Date) return new Date(obj.getTime()) as any

  // 3. 处理 RegExp
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as any

  // 4. 处理 Map
  if (obj instanceof Map) {
    const cloneMap = new Map()
    hash.set(obj, cloneMap)
    obj.forEach((value, key) => cloneMap.set(deepClone(key, hash), deepClone(value, hash)))
    return cloneMap as any
  }

  // 5. 处理 Set
  if (obj instanceof Set) {
    const cloneSet = new Set()
    hash.set(obj, cloneSet)
    obj.forEach((value) => cloneSet.add(deepClone(value, hash)))
    return cloneSet as any
  }

  // 6. 处理数组和普通对象 — 保留原型
  const cloneObj: any = Array.isArray(obj)
    ? []
    : Object.create(Object.getPrototypeOf(obj))
  hash.set(obj, cloneObj)

  // 7. 遍历所有自有属性（包括 Symbol key）
  for (const key of Reflect.ownKeys(obj)) {
    cloneObj[key] = deepClone((obj as any)[key], hash)
  }

  return cloneObj
}
```

**为什么用 WeakMap 而不是 Map？** WeakMap 的 key 是弱引用，原对象被销毁后，WeakMap 中的记录会被自动回收，避免内存泄漏。如果用 Map，缓存会永远持有原对象的引用。

## 深度拓展

### JSON.parse(JSON.stringify()) 的局限性 -- 为什么不够？

```ts
const obj = {
  a: undefined,             // → 整个 key 消失
  b: Symbol("id"),          // → 整个 key 消失
  c: function () {},        // → 整个 key 消失
  d: new Date(),            // → "2026-07-05T..." 字符串，不再是 Date
  e: /test/g,               // → {} 空对象
  f: new Map([["k", "v"]]), // → {} 空对象
  g: NaN,                   // → null（JSON 不支持 NaN）
  h: Infinity,              // → null（JSON 不支持 Infinity）
}
JSON.parse(JSON.stringify(obj))
// { d: "2026-07-05T...", e: {}, f: {}, g: null, h: null }
// 丢失了 a, b, c；d/e/f/g/h 的类型都变了
```

面试时这个表格一列出来就能展示你确实用过、踩过坑。

### structuredClone 的内部原理

structuredClone 使用浏览器的**结构化克隆算法**（和 `postMessage` 传输数据的算法相同）。它不是逐属性递归的，而是在 C++ 层直接序列化和反序列化对象图，所以性能更好、能正确处理循环引用和大部分内建类型。

### lodash.cloneDeep 的实现思路

lodash 的判断层比手写更完善：它通过 `Object.prototype.toString.call(value)` 获取内部 `[[Class]]` 标签来判断类型，支持 `ArrayBuffer`、`DataView`、`Float32Array` 等所有类型化数组、`Error` 类型、原型链保持等。手写时提到这些就能加分。

## 项目实战

### 1. Vue3 表单重置用深拷贝初始值

```ts
// 项目中的编辑弹窗：保存初始数据，取消时恢复
const initialFormData = reactive({
  name: "",
  roles: [] as string[],
  config: { notifications: true, theme: "light" },
})

// 编辑时拷贝初始值
const formData = reactive(deepClone(initialFormData))

// 取消时恢复（不需要深拷贝 initialFormData 本身，但需要拷贝它的值）
function handleCancel() {
  Object.assign(formData, deepClone(initialFormData))
}
```

### 2. Pinia store 数据导出需要深拷贝

```ts
// 项目中的用户 store
const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo | null>(null)

  // ❌ 错误：直接返回 ref 的值，调用方可能修改内部对象
  function getUserInfo() {
    return userInfo.value
  }

  // ✅ 正确：深拷贝后返回，防止外部修改污染 store
  function getUserInfo() {
    return userInfo.value ? deepClone(userInfo.value) : null
  }

  return { userInfo, getUserInfo }
})
```

### 3. 表格编辑时的数据备份

```ts
// 项目中的行内编辑表格
function startEdit(row: TableRow) {
  // 编辑前深拷贝当前行数据，作为备份
  backupMap.set(row.id, deepClone(row))
  row._editing = true
}

function cancelEdit(row: TableRow) {
  const backup = backupMap.get(row.id)
  if (backup) {
    Object.assign(row, backup) // 恢复
    backupMap.delete(row.id)
  }
  row._editing = false
}
```

### 4. 组件 props 传递对象时的防御性深拷贝

```ts
// 子组件可能会修改传入的对象 → 用深拷贝防御
// 父组件
const formData = reactive({ name: "", items: [] })
// <ChildForm :initialData="deepClone(formData)" />
// 这样无论子组件怎么改 initialData，都不会影响父组件的 formData
```

## 手写实现

完整版已在核心机制中给出。面试加分点：
1. **WeakMap 解决循环引用**（比 Map 更好，不会阻止 GC）
2. **Reflect.ownKeys 遍历 Symbol key**（`for...in` 和 `Object.keys` 都不包括 Symbol）
3. **保留原型链**（`Object.create(Object.getPrototypeOf(obj))`）
4. **处理 Map/Set 的迭代**
5. **处理 Date/RegExp 的类型保留**

## 易错点

1. **扩展运算符是深拷贝** -- `{...obj}` 和 `[...arr]` 都是浅拷贝，嵌套对象仍共享引用
2. **JSON.parse(stringify) 是万能的** -- 丢失 undefined/函数/Symbol/Date/RegExp/Map/Set，不处理循环引用
3. **structuredClone 兼容所有浏览器** -- 在 Worker 中使用受限（无法拷贝 DOM 节点、函数、Symbol），且 IE 完全不支持
4. **Object.assign 是深拷贝** -- 只是把源对象的**可枚举自有属性**复制到目标对象，一层的浅拷贝
5. **深拷贝和浅拷贝的性能差异很大** -- 对大型对象深拷贝确实很慢（O(n) 还要递归），项目中注意只在必要时深拷贝

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "深拷贝怎么实现" | 追问循环引用——用 WeakMap 记录已拷贝对象 |
| "JSON.parse(JSON.stringify) 有什么问题" | 追问不支持的 6 种类型（undefined/function/symbol/Date/RegExp/Map） |
| "structuredClone 和手写深拷贝的区别" | 追问浏览器原生 API 支持的类型和不可克隆的类型 |
| "为什么用 WeakMap 而不是 Map" | 追问垃圾回收——源对象销毁后 WeakMap 中的记录自动清除 |

## 相关阅读

- [上一篇](./new.md)
- [下一篇](./debounce-throttle.md)
- [原型链](./prototype-chain.md)（保留构造函数类型的原理）
- [手写题：深拷贝](../手写题/deep-clone.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（五方案对比表 + 手写 + 项目实战 + structuredClone）
