---
title: for...of vs for...in
description: for...of（迭代器协议）和 for...in（遍历可枚举属性）的本质区别、适用场景和常见陷阱
category: JavaScript
type: comparison
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - for...of
  - for...in
  - 迭代器
  - Symbol.iterator
  - 枚举
---

# for...of vs for...in

> &#11088;&#11088;&#11088;&#11088;｜难度：初级&#9733;&#9733;

## 一句话总结

**`for...in` 遍历对象的所有可枚举属性（包括原型链上的），用于 Object。`for...of` 遍历可迭代对象的元素值，用于 Array/Map/Set/String。面试中把 for...in 用在数组上是最常见的挂法——它会遍历数组索引（字符串类型），还会把原型上扩展的属性也算进去。**

## 核心机制

### 一张对比表

| 维度 | for...in | for...of |
|------|----------|----------|
| 遍历目标 | **属性名**（key） | **属性值**（value） |
| 适用类型 | 对象（Object） | 可迭代对象（Array/Map/Set/String/arguments/NodeList） |
| 原型链 | **会**遍历原型上的可枚举属性 | 不会——只取 `[Symbol.iterator]()` 返回的值 |
| 顺序 | 先数字属性升序，再字符串属性按创建顺序 | 按迭代器定义的顺序（数组按索引、Map 按插入） |
| 底层机制 | `[[Enumerate]]` → 枚举所有可枚举属性 | `[Symbol.iterator]()` → 调用 next() 直到 done |
| typeof key | **string**（数组索引也返回字符串） | 由迭代器决定（数组返回元素本身） |

### 常见误区：for...in 遍历数组

```javascript
const arr = ['a', 'b', 'c']
arr.customProp = 'hello'

// ❌ 常见错误——for...in 遍历数组
for (let i in arr) {
  console.log(i, typeof i, arr[i])
}
// 输出：
// '0' string 'a'   ← 索引是字符串！不是 number
// '1' string 'b'
// '2' string 'c'
// 'customProp' string 'hello'  ← 属性名被遍历出来了

// ✅ for...of 遍历数组——拿到元素值
for (let val of arr) {
  console.log(val)  // 'a' 'b' 'c'
  // customProp 不会出现——迭代器不包含它
}

// ✅ 或者 forEach / 普通 for 循环
arr.forEach((val, i) => console.log(i, val))
```

**为什么索引是字符串？** 因为 `for...in` 本质在遍历属性名——JS 对象的属性名永远是字符串（或 Symbol）。数组的元素本质是 `arr['0']`、`arr['1']`——属性名是字符串 `"0"`。

### 为什么 for...of 不能遍历普通对象

```javascript
const obj = { a: 1, b: 2 }

// ❌ for (let val of obj) {}  → TypeError: obj is not iterable

// 因为 obj 没有 [Symbol.iterator] 方法
// for...of 只认迭代器——不认属性
```

**解决方案**：用 `Object.keys/values/entries` 拿到迭代器

```javascript
for (let val of Object.values(obj)) { }  // 1, 2
for (let [key, val] of Object.entries(obj)) { }  // ['a',1], ['b',2]
```

## 深度拓展

### 迭代器协议——for...of 的底层

```javascript
// 一个对象要支持 for...of，必须有 [Symbol.iterator] 方法
// 这个方法返回一个迭代器——有 next() 方法，返回 { value, done }

// 手写一个迭代器——让任何对象支持 for...of
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      next() {
        if (this.current <= this.last) {
          return { value: this.current++, done: false }
        }
        return { done: true }
      }
    }
  }
}
for (let n of range) console.log(n)  // 1 2 3 4 5
```

**内置可迭代对象**：Array、String、Map、Set、TypedArray、arguments、NodeList、Generator 对象。

### for...in 的 hasOwnProperty 守卫

```javascript
// ❌ 危险——原型链上的属性也被遍历
Array.prototype.myMethod = function() {}
for (let key in { a: 1 }) {
  console.log(key)  // 'a' + 所有原型上可枚举的属性
}

// ✅ 标准守卫
for (let key in obj) {
  if (Object.hasOwn(obj, key)) {  // 现代写法，比 hasOwnProperty 更安全
    console.log(key, obj[key])
  }
}
```

### 遍历对象的选择矩阵

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| 数组元素值 | `for...of` / `forEach` | 拿值不拿索引，不担心原型污染 |
| 数组索引+值 | `arr.forEach((v,i) => ...)` | i 是 number，比 for...in 的字符串索引安全 |
| 对象属性 | `Object.keys/values/entries` + for...of | 最干净——只拿自有属性、可配合解构 |
| Map 遍历 | `for...of` | Map 是 iterable——`for (let [k,v] of map)` |
| 字符串逐字符 | `for...of` | 正确支持 Unicode——`for...of '😀😃'` 拿到两个 emoji 而不是被拆成代理对 |
| 需要 break/continue | `for...of` | forEach 不能用 break |

## 项目实战

### 后台管理系统中 for...of 的实际应用

1. **批量下载文件**：`const urls = [...]` → `for (const url of urls)` 逐个下载，中间可以 break 终止。`urls.forEach` 做不到——forEach 不能用 break
2. **DOM 操作**：`for (const row of document.querySelectorAll('.table-row'))` —— NodeList 支持 for...of
3. **Map 的权限映射**：Pinia store 里用 Map 存权限→组件映射——`for (const [perm, comp] of permissionMap)` 同时拿 key 和 value

## 易错点

1. **for...in 遍历数组** —— 索引是字符串 "0"，不是 number。而且在 ESLint 中会直接报错 `no-restricted-syntax`
2. **for...in 会拿到原型上的属性** —— 如果某个库给 `Object.prototype` 加了方法，所有 for...in 都会中招。这就是为什么永远要加 `hasOwnProperty` 守卫
3. **for...of 不能遍历对象** —— 忘了转成 `Object.entries()` 就会 TypeError。这是刚学 JS 的开发者最常见的困惑之一
4. **for...of 遍历字符串正确处理 emoji** —— `'😀😃'.length === 4`（两个代理对），但 `for...of` 正确拿到两个 emoji。这是 for...of 相对 for 循环的一大优势

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "for...in 和 for...of 有什么区别" | 追问为什么 for...of 不能遍历对象 |
| "怎么让一个对象支持 for...of" | 追问 `[Symbol.iterator]` 和 next() 的实现 |
| "for...in 遍历数组的结果是什么" | 追问索引是字符串类型——追问为什么是字符串 |
| "如何安全地遍历对象属性" | 追问 `Object.keys` vs `for...in + hasOwnProperty` 的取舍 |

## 相关阅读

- [生成器 / 迭代器](./generator-iterator.md)
- [原型链](./prototype-chain.md)
- [Set / Map / WeakMap](./set-map-weakmap.md)
- [类型转换](./type-coercion.md)

## 更新记录

- 2026-07-10：新建（for...in vs for...of 对比 + 迭代器协议 + 遍历选择矩阵 + emoji 支持）
