---
title: 数组方法大全
description: JavaScript 数组核心方法——map/filter/reduce 高级用法、sort 陷阱、splice/slice 区别、数组去重/扁平化/检测方案
category: JavaScript
type: mechanism
score: 80
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 数组
  - map
  - reduce
  - sort
  - 手写题
---

# 数组方法大全

> ⭐⭐⭐⭐⭐｜难度：中级｜手写题第一来源

## 一句话总结

**数组方法是前端面试手写题的第一来源——map/filter/reduce 考察对回调和高阶函数的理解，splice/slice 考察对原数组的副作用认知，sort 的默认行为是经典陷阱。**

## 核心机制

### 遍历方法（不改变原数组）

```javascript
// map：映射每个元素为新数组（核心：有返回值）
[1, 2, 3].map(x => x * 2);         // [2, 4, 6]

// filter：筛选满足条件的元素
[1, 2, 3, 4].filter(x => x > 2);   // [3, 4]

// reduce：归并计算（面试最爱考）
[1, 2, 3].reduce((acc, cur) => acc + cur, 0); // 6

// forEach：遍历执行副作用（无返回值！）
[1, 2, 3].forEach(x => console.log(x));

// find / findIndex：查找第一个满足条件的元素/索引
[1, 2, 3].find(x => x > 1);        // 2
[1, 2, 3].findIndex(x => x > 1);   // 1

// some / every：条件测试
[1, 2, 3].some(x => x > 2);        // true（至少一个）
[1, 2, 3].every(x => x > 0);       // true（全部满足）

// includes / indexOf：查找元素
[1, 2, 3].includes(2);             // true
[1, 2, 3].indexOf(2);              // 1
```

### 变异方法（改变原数组）

| 方法 | 作用 | 返回值 |
|------|------|--------|
| `push/pop` | 尾部增/删 | push 返回新长度，pop 返回删除元素 |
| `unshift/shift` | 头部增/删 | unshift 返回新长度，shift 返回删除元素 |
| `splice(start, count, ...items)` | 删除/替换/插入 | 被删除的元素数组 |
| `sort(fn)` | 排序 | 原数组引用 |
| `reverse()` | 反转 | 原数组引用 |

### sort 的陷阱（高频面试题）

```javascript
// 默认排序：按字符串 Unicode 排序——不是数值排序！
[1, 2, 10, 20].sort();              // [1, 10, 2, 20] ❌ 不是 [1, 2, 10, 20]
// 原因：每个元素被转为字符串，"10" < "2"（逐字符比较'1'<'2'）

// 正确数值排序
[1, 2, 10, 20].sort((a, b) => a - b);  // [1, 2, 10, 20] ✅

// V8 的排序算法：短数组用插入排序，长数组用快排/TimSort
// sort 不保证稳定性（ES2019 前），ES2019 后要求稳定
```

### splice vs slice（高频混淆）

```javascript
const arr = [1, 2, 3, 4, 5];

// slice(start, end)：不改变原数组，返回新数组
arr.slice(1, 3);   // [2, 3]
arr;                // [1, 2, 3, 4, 5] —— 原数组不变

// splice(start, count, ...items)：改变原数组，返回删除的元素
arr.splice(1, 2, 'a', 'b');  // [2, 3]
arr;                          // [1, 'a', 'b', 4, 5] —— 原数组被修改
```

## 深度拓展

### reduce 的高级用法

```javascript
// 1. 数组扁平化
const flatten = (arr) => arr.reduce((acc, cur) =>
  acc.concat(Array.isArray(cur) ? flatten(cur) : cur), []);

// 2. 按属性分组
const users = [{name:'a', age:20}, {name:'b', age:20}, {name:'c', age:30}];
users.reduce((acc, u) => {
  (acc[u.age] ||= []).push(u);
  return acc;
}, {});  // { 20: [{a,20},{b,20}], 30: [{c,30}] }

// 3. 数组去重
[1, 2, 1, 3].reduce((acc, cur) =>
  acc.includes(cur) ? acc : [...acc, cur], []);  // [1,2,3]

// 4. 实现 map
Array.prototype.myMap = function(fn) {
  return this.reduce((acc, cur, i, arr) => {
    acc.push(fn(cur, i, arr));
    return acc;
  }, []);
};
```

### 数组去重全方案

| 方案 | 代码 | 特点 |
|------|------|------|
| Set | `[...new Set(arr)]` | 最简单，无法去重对象 |
| filter+indexOf | `arr.filter((v,i) => arr.indexOf(v)===i)` | O(n²)，兼容性好 |
| Map 按字段去重 | `[...new Map(arr.map(v=>[v.id,v])).values()]` | O(n)，按指定字段 |

### 类数组转数组

```javascript
// arguments、NodeList、字符串等类数组对象
Array.from(arguments);
Array.prototype.slice.call(arguments);
[...arguments];  // 需要迭代器
```

## 易错点

❌ **forEach 不能中途跳出** —— `return` 只跳过当前回调，不终止循环。需要跳出的用 `for...of` 或 `some/every`（some 返回 true 相当于 break）。

❌ **map 的回调不 return 返回 undefined 数组** —— `[1,2,3].map(x => { x * 2 })` 忘了 return，结果是 `[undefined, undefined, undefined]`。

❌ **sort 默认排序是字符串顺序** —— `[1, 2, 10].sort()` 不是 `[1, 2, 10]` 而是 `[1, 10, 2]`。数值排序必须传比较函数。

❌ **splice 改变原数组，slice 不改变** —— 单词差一个字母，行为完全不同。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "map 和 forEach 有什么区别" | 追问返回值——map 返回新数组，forEach 返回 undefined |
| "怎么用 reduce 实现 map" | 追问"reduce 的第二个参数是做什么的"——初始值 |
| "sort 为什么 10 排在 2 前面" | 追问字符串排序 vs 数值排序 |
| "怎么给对象数组去重" | 追问 Map 按 key 去重 |

## 相关阅读

- [数组去重 / 扁平化](./set-map-weakmap.md)
- [Map / Set / WeakMap](./set-map-weakmap.md)
- [迭代器 / for...of](./for-of-for-in.md)

## 更新记录

- 2026-07-16：新建——遍历方法/map-reduce-filter/sort陷阱/splice-slice/数组去重全方案
