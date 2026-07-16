---
title: 深拷贝 面试回答
description: 面试中如何回答手写深拷贝——递归 + WeakMap 循环引用 + Date/RegExp/Map/Set 处理
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - JavaScript
  - 深拷贝
  - deepClone
  - 面试回答
---

# 深拷贝 面试回答

> 大厂手写题 top 3。面试官要的不是你背代码，而是你如何处理 3 个边界——循环引用、特殊对象、Symbol。

## Q1: 请手写一个 deepClone

### 30 秒版本

"递归遍历对象——基本类型直接返回，对象创建新容器。三个难点：循环引用用 WeakMap 记录已拷贝对象、Date/RegExp/Map/Set 用 instanceof 判断重新构造、Symbol 和不可枚举属性用 Reflect.ownKeys 获取。WeakMap 比 Map 好——拷贝完自动 GC，不阻止垃圾回收。"

### 2 分钟版本

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 基本类型和 null 直接返回
  if (obj === null || typeof obj !== 'object') return obj;
  // 循环引用：已拷贝过直接返回缓存
  if (hash.has(obj)) return hash.get(obj);

  // 特殊对象处理
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (obj instanceof Map) {
    const clone = new Map();
    hash.set(obj, clone);
    obj.forEach((v, k) => clone.set(deepClone(k, hash), deepClone(v, hash)));
    return clone;
  }
  if (obj instanceof Set) {
    const clone = new Set();
    hash.set(obj, clone);
    obj.forEach(v => clone.add(deepClone(v, hash)));
    return clone;
  }

  // 普通对象/数组：保留原型链，拷贝所有属性（含 Symbol）
  const clone = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, clone);
  Reflect.ownKeys(obj).forEach(key => {
    clone[key] = deepClone(obj[key], hash);
  });
  return clone;
}
```

**关键决策**：WeakMap 存已经拷贝过的对象——遇到循环引用直接返回缓存而不是递归死循环。WeakMap 存的是弱引用——拷贝完原始对象可被 GC，不泄漏内存。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "为什么用 WeakMap 而不是 Map" | WeakMap 存弱引用——拷贝完原始对象可以被 GC。Map 存强引用——即使原始对象不再使用也 GC 不了 |
| "JSON.parse(JSON.stringify()) 为什么不行" | 丢 undefined/函数/Symbol、Date 变字符串、RegExp 变空对象、Map/Set 变 {}、循环引用直接报错。只适合纯数据对象 |
| "怎么处理 Function" | 通常不需要拷贝函数——函数是逻辑不是数据。非要拷贝用 `new Function('return ' + fn.toString())()` ——只能在特定场景 |

## 别踩的坑

1. **忘了循环引用** —— 对象 A 引对象 B，B 引回 A——递归直接爆栈。WeakMap 是标配。
2. **JSON 大法不是万能** —— 面试官追问 JSON 的缺陷是一道附加题。
3. **Object.keys 漏 Symbol** —— 用 Reflect.ownKeys 同时拿到字符串键和 Symbol 键。

## 相关阅读

- [深拷贝](../../JavaScript/deep-clone.md)
- [手写题：深拷贝](../../手写题/deep-clone.md)

## 更新记录

- 2026-07-15：新建（递归 + WeakMap 循环引用 + Date/RegExp/Map/Set + Reflect.ownKeys）
