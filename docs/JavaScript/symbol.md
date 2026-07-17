---
title: Symbol
description: ES6 Symbol 原始类型——唯一标识符、内置 Well-Known Symbol、Symbol.iterator / Symbol.toStringTag / Symbol.toPrimitive 等实战用法
category: JavaScript
type: mechanism
score: 72
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - Symbol
  - Well-Known Symbol
  - Symbol.iterator
  - Symbol.toStringTag
  - 元编程
---

# Symbol

> ⭐⭐⭐⭐｜难度：中高级｜源码级知识点

**Symbol 是 ES6 引入的第六种原始类型（算上 object 常被称作"第七种数据类型"），核心价值是"创建绝对不会重复的标识符"。Vue/React/Node 源码中大量使用 Symbol 做内部标记。**

## 一句话总结

**Symbol 创建全局唯一的标识符——`Symbol('desc')` 即使描述相同返回的值也不同。Well-Known Symbol（如 `Symbol.iterator`/`Symbol.toStringTag`）是 JS 元编程的核心机制，让普通对象可以自定义语言内置行为的底层实现。**

## 核心机制

### 基础用法

```javascript
// 1. 创建唯一标识
const s1 = Symbol('foo')
const s2 = Symbol('foo')
s1 === s2  // false —— 同描述也不同

// 2. 全局注册表 —— Symbol.for() 跨模块共享
const global1 = Symbol.for('app.key')
const global2 = Symbol.for('app.key')
global1 === global2  // true —— 全局唯一

// 3. 对象属性 —— 不参与 for...in / Object.keys / JSON.stringify
const hidden = Symbol('internal')
const obj = {
  [hidden]: 'secret',
  visible: 'public',
}
Object.keys(obj)  // ['visible'] —— Symbol 键被隐藏
JSON.stringify(obj)  // '{"visible":"public"}'
Object.getOwnPropertySymbols(obj)  // [Symbol(internal)]
```

### Well-Known Symbol —— JS 元编程的钥匙

Well-Known Symbol 是 ECMAScript 规范预定义的 Symbol 值，允许开发者自定义语言内置行为。

**Symbol.iterator —— 让对象可迭代**

```javascript
// for...of / [...spread] / Array.from 依赖 Symbol.iterator
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
        return { value: undefined, done: true }
      },
    }
  },
};
[...range]  // [1, 2, 3, 4, 5]
// 注意上面对象字面量结尾的分号不能省——否则 [...range] 会被解析成
// 对前面对象的属性访问（经典 ASI 陷阱）
```

**Symbol.toStringTag —— 控制 Object.prototype.toString 输出**

```javascript
class MyCollection {
  get [Symbol.toStringTag]() { return 'MyCollection' }
}
Object.prototype.toString.call(new MyCollection())  // '[object MyCollection]'

// Vue3 源码: 用 Symbol.toStringTag 标记响应式对象类型
// target[ReactiveFlags.IS_REACTIVE] 检查是否已经是 Proxy
```

**Symbol.toPrimitive —— 控制对象转原始值**

```javascript
const money = {
  amount: 99.5,
  currency: 'CNY',
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return `¥${this.amount}`
    if (hint === 'number') return this.amount
    return this.amount  // default
  },
}
+money        // 99.5 (hint:'number')
`${money}`    // '¥99.5' (hint:'string')
money + 0     // 99.5 (hint:'default')
```

**Symbol.hasInstance —— 自定义 instanceof**

```javascript
class EvenArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance) && instance.length % 2 === 0
  }
}
[1, 2] instanceof EvenArray     // true
[1, 2, 3] instanceof EvenArray  // false
```

### 其他常用 Well-Known Symbol

| Symbol | 控制的行为 |
|--------|---------|
| `Symbol.toPrimitive` | 对象转原始值（优先级高于 toString/valueOf） |
| `Symbol.hasInstance` | `instanceof` 操作符 |
| `Symbol.species` | 派生对象（如 `Array.map` 返回的构造函数） |
| `Symbol.match` / `Symbol.replace` / `Symbol.search` / `Symbol.split` | `String.prototype.match` 等方法的行为 |
| `Symbol.isConcatSpreadable` | `Array.prototype.concat` 是否展开 |
| `Symbol.unscopables` | `with` 语句中排除的属性 |

## 项目实战

### Vue3 源码中的 Symbol

```typescript
// Vue3 真正用 Symbol 的地方——内部标记不可被外部伪造
export const ITERATE_KEY = Symbol('iterate') // track 对象迭代（for...in/size）依赖的特殊 key
export const Fragment = Symbol('Fragment')   // vnode 类型标记
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

// 注意：ReactiveFlags（'__v_isReactive' / '__v_raw' 等）用的是字符串 key，
// 不是 Symbol——面试时别把两者混为一谈
```

### Object.prototype.toString 类型检测

```javascript
// 用 Symbol.toStringTag 定制类型检测
class ValidatedString {
  get [Symbol.toStringTag]() { return 'ValidatedString' }
}
function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}
getType(new ValidatedString())  // 'ValidatedString'
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Symbol 有什么实际作用" | 追问"对象私有属性怎么做" → Symbol + WeakMap |
| "Symbol.iterator 怎么用" | 追问"实现一个可迭代对象" → 手写 next() |
| "你知道哪些 Well-Known Symbol" | 追问 Symbol.toPrimitive / toStringTag 的实战用法 |

## 相关阅读

- [迭代器 / 生成器](./generator-iterator.md)
- [Proxy / Reflect](./proxy-reflect.md)
- [Set / Map / WeakMap](./set-map-weakmap.md)

## 更新记录

- 2026-07-16：新建——Symbol 基础 + Well-Known Symbol + Vue3 源码实战
