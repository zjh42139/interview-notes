---
title: Object 系列 API
description: Object.create / assign / freeze / seal / defineProperty / getOwnPropertyDescriptors / hasOwn 等核心 Object 静态方法完整对比
category: JavaScript
type: api-reference
score: 78
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - Object
  - 原型链
  - 不可变数据
  - 属性描述符
---

# Object 系列 API

> ⭐⭐⭐⭐｜难度：中级｜面试高频 API 集合

**Object 静态方法是原型链和属性操作的基础设施。面试不单独问"Object 有哪些方法"，而是散落在原型链、深浅拷贝、不可变数据、Vue 响应式原理中——但不会用的就是不会用。**

## 一句话总结

**Object.create 控制原型链、Object.assign 浅拷贝、Object.freeze/seal 控制可变性、Object.defineProperty 精确控制属性——四组 API 覆盖了原型、拷贝、安全、元编程四个维度。**

## 原型链方法

### Object.create(proto, descriptors?)

```javascript
// 1. 创建以 proto 为原型的对象 —— 寄生组合继承的核心
const parent = { greet() { return 'hello' } }
const child = Object.create(parent)
child.greet()  // 'hello' —— 原型链查找

// 2. 创建纯字典 —— 没有原型链污染
const dict = Object.create(null)
dict.__proto__     // undefined
dict.toString      // undefined —— 不怕 key 冲突

// 3. 第二个参数：属性描述符
const obj = Object.create(parent, {
  name: { value: 'child', writable: true, enumerable: true },
})
```

### Object.setPrototypeOf / getPrototypeOf

```javascript
// __proto__ 的标准化替代
Object.getPrototypeOf([]) === Array.prototype  // true
Object.setPrototypeOf(obj, newProto)
// ⚠️ 性能警告：动态改原型会让引擎丢弃对该对象的优化
```

## 拷贝与合并

### Object.assign(target, ...sources)

```javascript
// 浅拷贝——只拷贝自有可枚举属性、不拷贝原型链
const copy = Object.assign({}, source)

// Vue3 响应式：reactive 内部用 Object.assign 合并代理
// const proxy = new Proxy(target, mutableHandlers)
// shallowReactive 用 Object.assign 而非深度递归

// ⚠️ getter 在 assign 时求值——属性描述符丢失
const src = {
  get name() { return 'computed' },
}
Object.assign({}, src)  // { name: 'computed' } —— 普通属性，不再有 getter
```

### Object.getOwnPropertyDescriptors —— 完整拷贝

```javascript
// 保留 getter/setter、可枚举性、可配置性
const complete = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(source)
)
// 这是深拷贝中处理属性描述符的标准方式
```

## 不可变数据

### Object.freeze —— 冻结对象

```javascript
const config = Object.freeze({
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000,
})
config.API_URL = 'new'    // 静默失败（严格模式抛 TypeError）
delete config.TIMEOUT     // 静默失败
// Object.isFrozen(config) === true

// 限制：浅冻结——嵌套对象仍可变
const data = Object.freeze({ user: { name: 'z' } })
data.user.name = 'new'  // 成功修改！需要 deepFreeze
```

### Object.seal —— 密封对象

```javascript
// 不能新增/删除属性，但可修改已有属性的值
const obj = Object.seal({ a: 1, b: 2 })
obj.a = 10     // ✅ 可修改
obj.c = 3      // ❌ 不新增
delete obj.b   // ❌ 不删除
```

### freeze vs seal vs preventExtensions

| 方法 | 新增 | 删除 | 修改值 | 修改属性描述符 |
|------|:---:|:---:|:---:|:---:|
| `Object.freeze` | ❌ | ❌ | ❌ | ❌ |
| `Object.seal` | ❌ | ❌ | ✅ | ❌ |
| `Object.preventExtensions` | ❌ | ✅ | ✅ | ✅ |

## 属性定义

### Object.defineProperty —— 精确控制

```javascript
// Vue2 响应式的核心 API
Object.defineProperty(obj, 'name', {
  value: 'z',
  writable: false,       // 不可写
  enumerable: false,     // 不可枚举（for...in / keys 看不到）
  configurable: false,   // 不可配置（delete / redefine 禁止）
  get() { ... },         // getter（与 value 互斥）
  set(v) { ... },        // setter
})

// Object.defineProperties —— 批量定义
Object.defineProperties(obj, {
  name: { value: 'z', enumerable: true },
  age: { value: 25, writable: true },
})
```

### 属性描述符查询

```javascript
const desc = Object.getOwnPropertyDescriptor(obj, 'name')
// { value, writable, enumerable, configurable }

const allDescs = Object.getOwnPropertyDescriptors(obj)
// { name: {...}, age: {...} }
```

## 自有属性判断

```javascript
// Object.hasOwn (ES2022) —— 替代 Object.prototype.hasOwnProperty
Object.hasOwn(obj, 'key')  // ✅ 推荐：不受原型链污染

// Object.hasOwnProperty —— 可能被覆盖
obj.hasOwnProperty('key')  // ⚠️ Object.create(null) 没有这个方法
Object.prototype.hasOwnProperty.call(obj, 'key')  // 安全但啰嗦

// in vs hasOwn
'toString' in {}            // true —— 原型链上的
Object.hasOwn({}, 'toString')  // false —— 只看自身
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Object.create 和 new 的区别" | 追问"原型链的底层机制" → `__proto__` vs `prototype` |
| "怎么实现深拷贝" | 追问"getOwnPropertyDescriptors 怎么处理 getter" |
| "freeze 和 seal 的区别" | 追问"为什么不直接用 const" |

## 相关阅读

- [原型链](./prototype-chain.md)
- [深拷贝](./deep-clone.md)
- [Proxy / Reflect](./proxy-reflect.md)

## 更新记录

- 2026-07-16：新建——四组 Object API 完整对比
