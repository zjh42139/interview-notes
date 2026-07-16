---
title: call / apply / bind
description: JavaScript 中 call、apply、bind 的实现原理与手写
category: JavaScript
type: mechanism
score: 82
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - call
  - apply
  - bind
  - this
---

# call / apply / bind

> &#11088;&#11088;&#11088;&#11088;｜难度：中级&#9733;&#9733;&#9733;

## 一句话总结

**call / apply 立即执行函数并改变 this，bind 返回一个永久绑定了 this 的新函数**。三者都是显式改变 this 指向的方式，但执行时机不同。

## 核心机制

### 语法差异

```ts
fn.call(thisArg, arg1, arg2, arg3)   // 逐个传参
fn.apply(thisArg, [arg1, arg2, arg3]) // 数组传参
fn.bind(thisArg)(arg1, arg2, arg3)   // 返回新函数，延迟执行
```

### 实现原理

三者底层用了同一个 trick：**在目标对象上临时挂载方法，调用后删除**。这个思路也是手写实现的核心。

```ts
// 手写 call 的核心逻辑（简化版）
Function.prototype.myCall = function (context, ...args) {
  // 1. 处理 null/undefined → 指向全局对象
  context = context ?? (typeof globalThis !== "undefined" ? globalThis : window)
  // 2. 防止属性名冲突，用 Symbol
  const fnKey = Symbol("fn")
  // 3. 把当前函数临时挂到 context 上
  context[fnKey] = this
  // 4. 通过 context 调用 → this 自然指向 context
  const result = context[fnKey](...args)
  // 5. 清理
  delete context[fnKey]
  return result
}
```

### apply 与 call 的性能差异

call 通常比 apply 快 -- 原因是 apply 需要对第二个参数做额外的类型检查和数组展开。在参数固定时优先用 call：

```ts
// 参数个数确定 → call 更快（引擎不需要处理数组参数）
fn.call(obj, a, b, c)
// 参数个数不确定 → apply 更自然
fn.apply(obj, argsArray)
```

## 深度拓展

### 追问：bind 返回的函数为何不能被二次 bind？

bind 使用 `[[BoundTargetFunction]]` 和 `[[BoundThis]]` 两个内部属性。当对 bound function 再次 bind 时，只有第一次 bind 的 this 生效：

```ts
function foo() { console.log(this.name) }
const a = { name: "A" }
const b = { name: "B" }
const bound1 = foo.bind(a)
const bound2 = bound1.bind(b)
bound2() // "A" — 不是 "B"，第二次 bind 被忽略
```

原因是规范规定：bound function 没有自己的 `[[ThisMode]]`，它的 this 由第一次 bind 的 `[[BoundThis]]` 固定。

**new 覆盖 bind 的 this** 是唯一打破绑定的情况：

```ts
function Person(name) { this.name = name }
const BoundPerson = Person.bind({ name: "ignored" })
const p = new BoundPerson("real")
console.log(p.name) // "real" — new 的优先级高于 bind
```

### 追问：bind 的柯里化特性

bind 不仅可以绑定 this，还能**预置参数**（partial application）：

```ts
function multiply(a, b) { return a * b }
const double = multiply.bind(null, 2) // 预置 a = 2
double(5)  // 10
double(10) // 20
```

这在实际项目中非常有用 -- 比如表单校验中，用 bind 预置校验规则，只暴露出需要业务方填的参数。

## 手写实现

### 完整 call 实现

```ts
Function.prototype.myCall = function (context: any, ...args: any[]): any {
  // 处理 null/undefined
  context = context ?? globalThis
  // 转为基础类型用 Object() 包裹
  if (typeof context !== "object" && typeof context !== "function") {
    context = Object(context)
  }
  const fnKey = Symbol("fn")
  context[fnKey] = this
  const result = context[fnKey](...args)
  delete context[fnKey]
  return result
}
```

### 完整 apply 实现

```ts
Function.prototype.myApply = function (context: any, args?: any[]): any {
  context = context ?? globalThis
  if (typeof context !== "object" && typeof context !== "function") {
    context = Object(context)
  }
  const fnKey = Symbol("fn")
  context[fnKey] = this
  const result = args ? context[fnKey](...args) : context[fnKey]()
  delete context[fnKey]
  return result
}
```

### 完整 bind 实现（含 new 优先级）

```ts
Function.prototype.myBind = function (context: any, ...boundArgs: any[]): Function {
  const originalFn = this // 保存原函数
  // 返回的新函数
  function boundFn(this: any, ...callArgs: any[]) {
    // 关键判断：如果是 new 调用，this 指向新实例，忽略传入的 context
    const actualThis = this instanceof boundFn ? this : context
    // 合并预置参数和运行时参数
    return originalFn.apply(actualThis, [...boundArgs, ...callArgs])
  }
  // 维护原型链：让 new 出来的实例能访问到原函数的 prototype
  boundFn.prototype = Object.create(originalFn.prototype)
  return boundFn
}
```

面试时手写 bind 的关键加分点就是 **new 优先级判断**那行 `this instanceof boundFn`。

## 项目实战

### 1. 防抖节流中保留 this 指向

```ts
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args) // 用 apply 保留调用时的 this
    }, delay)
  }
}
```

### 2. Vue 组件中把方法 bind 后传给子组件

```ts
// 父组件 — 把回调函数 bind 了预置参数再给子组件
const handleDelete = (id: number) => {
  api.deleteUser(id).then(() => fetchList())
}
// 在模板中：
// <UserTable @delete="handleDelete.bind(null, row.id)" />
// 或用箭头函数：@delete="() => handleDelete(row.id)"
```

### 3. Axios 取消请求时的 this 绑定

```ts
class RequestManager {
  private pendingMap = new Map<string, AbortController>()

  addPending(config: AxiosRequestConfig) {
    const controller = new AbortController()
    config.signal = controller.signal
    // bind 预设 key，便于取消时按 key 查找
    const key = `${config.method}:${config.url}`
    const cancel = this.cancelPending.bind(this, key)
    this.pendingMap.set(key, controller)
  }

  cancelPending(key: string) {
    this.pendingMap.get(key)?.abort()
    this.pendingMap.delete(key)
  }
}
```

## 易错点

1. **bind 会立即执行** -- bind 返回的是新函数，不会立即执行；call / apply 才会立即执行
2. **apply 第二个参数可以是任意值** -- apply 第二个参数必须是数组或类数组，否则报 TypeError
3. **多次 bind 只有第一次生效** -- bound function 的 this 被首次 bind 永久固定（new 除外）
4. **箭头函数上 call / apply 能改变 this** -- 箭头函数的 this 是词法绑定的，call/apply/bind 对它无效，静默返回原函数结果
5. **null/undefined 作为 thisArg** -- 非严格模式下会被替换为全局对象，严格模式下保持 null/undefined

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "call 和 apply 区别" | 手写 call 或手写 bind |
| "手写 bind" | new 优先级：new bound 函数时 this 指向谁 |
| "为什么箭头函数不能 bind" | 词法 this vs 动态 this |
| "bind 后还能再 bind 吗" | bound function 内部属性 `[[BoundThis]]` |

## 相关阅读

- [上一篇](./async-await.md)
- [下一篇](./prototype-chain.md)
- [this](./this.md)
- [new](./new.md)
- [手写题：bind / call / apply](../手写题/bind-call-apply.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（手写三件套 + new 优先级 + 项目实战）
