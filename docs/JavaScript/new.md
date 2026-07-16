---
title: new
description: JavaScript 中 new 关键字的执行过程与手写实现
category: JavaScript
type: mechanism
score: 82
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - new
  - 构造函数
  - 原型链
---

# new

> &#11088;&#11088;&#11088;&#11088;｜难度：初级&#9733;&#9733;&#9733;

## 一句话总结

**new 运算符创建一个实例对象，内部经历"创建空对象 -> 绑定原型 -> 绑定 this -> 返回对象"四步**，让构造函数中的 `this.xxx` 能挂到实例上，同时让实例能沿着原型链找到共享方法。

## 核心机制

### new Foo() 的四步内部流程

```ts
function myNew(constructor: Function, ...args: any[]): object {
  // 第 1 步：创建一个新的空对象
  const obj = {}
  // 第 2 步：将新对象的 __proto__ 指向构造函数的 prototype
  Object.setPrototypeOf(obj, constructor.prototype) // obj.__proto__ = constructor.prototype
  // 第 3 步：将新对象作为 this 绑定，执行构造函数
  const result = constructor.apply(obj, args)
  // 第 4 步：如果构造函数返回了引用类型，用返回值；否则返回新对象
  return result instanceof Object ? result : obj
}
```

每一步你都要能解释**为什么**：

| 步骤 | 做了什么 | 为什么 |
|------|---------|--------|
| 创建空对象 | `{}` | 给实例一个独立的内存空间 |
| 绑定原型 | `obj.__proto__ = Fn.prototype` | 让实例能访问构造函数 prototype 上的共享方法 |
| 绑定 this | `Fn.apply(obj, args)` | 让构造函数内的 `this.xxx` 赋值挂到实例上 |
| 返回对象 | `return obj` | 自动 return 实例；但构造函数自己 return 引用类型时会覆盖 |

### 构造函数 return 不同值的区别

这是面试中一定会追的问题：

```ts
function Foo1() { this.name = "foo"; return 123 }      // return 基本类型 → 忽略
function Foo2() { this.name = "foo"; return { x: 1 } }  // return 引用类型 → 覆盖！
function Foo3() { this.name = "foo" /* 无 return */ }   // 返回 this（新对象）

console.log(new Foo1()) // Foo1 { name: "foo" } — return 123 被忽略
console.log(new Foo2()) // { x: 1 } — 构造函数中的 this.name 白赋值了
console.log(new Foo3()) // Foo3 { name: "foo" } — 默认行为
```

**为什么 return 基本类型被忽略而引用类型不忽略？** 这是 ECMAScript 规范明确规定的：`[[Construct]]` 内部方法检查返回值的 Type，如果是 Object（包括函数、数组等），就用返回值代替新对象；否则丢弃返回值。

## 深度拓展

### 追问：new 和 Object.create() 的关系

两者都能创建对象并设置原型，但用途不同：

```ts
// new: 执行构造函数 + 创建实例
function Person(name) { this.name = name }
Person.prototype.sayHi = function () { console.log(this.name) }
const p = new Person("Tom") // p 可以 sayHi，也有 name 属性

// Object.create: 只创建以指定对象为原型的空对象，不执行任何函数
const p2 = Object.create(Person.prototype)
// p2 可以 sayHi，但没有 name 属性 —— 构造函数没跑
```

`Object.create()` 本质是 new 流程的前两步（创建对象 + 绑定原型），但没有执行构造函数的第 3 步。它在寄生组合继承中取代了早期的 `new Parent()` 方案。

### 追问：class 的 new 和 function 的 new 有区别吗？

有细微区别。class 必须用 new 调用，否则报 `TypeError`；而 function 构造函数可以当普通函数调用（this 指向 window，产生 bug）。class 内部方法默认为严格模式，且不可枚举。

```ts
class Foo { constructor() { this.x = 1 } }
Foo() // TypeError: Class constructor Foo cannot be invoked without 'new'

function Bar() { this.x = 1 }
Bar() // 不报错，但 this → window，window.x = 1（污染全局）
```

### new.target -- 检测函数是否被 new 调用

```ts
function Foo() {
  if (!new.target) {
    // 普通函数调用，this 跑偏了 → 安全兜底
    return new Foo()
  }
  this.name = "safe"
}
Foo()    // 返回新实例（而不是污染全局）
new Foo() // 正常工作
```

## 项目实战

### 1. Vue3 中 new 几乎消失了

Vue3 用函数式 `createApp()` 替代了 Vue2 的 `new Vue()`：

```ts
// Vue2 — 面向对象风格
new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
})

// Vue3 — 函数式风格
const app = createApp(App)
app.use(router).use(pinia).mount("#app")
// 内部 new 被封装了，你不再需要关心构造函数机制
```

### 2. 手写 EventEmitter 工具类

项目中需要事件总线时（跨组件通信），用 class + new：

```ts
class EventEmitter {
  private events = new Map<string, Set<Function>>()

  on(event: string, fn: Function) {
    if (!this.events.has(event)) this.events.set(event, new Set())
    this.events.get(event)!.add(fn)
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach((fn) => fn(...args))
  }

  off(event: string, fn?: Function) {
    if (!fn) { this.events.delete(event); return }
    this.events.get(event)?.delete(fn)
  }
}
const bus = new EventEmitter() // new 创建独立的事件总线实例
```

### 3. Element Plus 表单验证 -- 构造函数模式的应用

```ts
// 项目中的动态表单生成器，使用构造函数 + new 创建规则实例
interface ValidationRule {
  validator: (value: any) => Promise<boolean>
  message: string
}

class FormValidator {
  private rules: Map<string, ValidationRule[]> = new Map()

  addRule(field: string, rule: ValidationRule) {
    const existing = this.rules.get(field) ?? []
    this.rules.set(field, [...existing, rule])
  }

  async validateAll(data: Record<string, any>): Promise<boolean> {
    const results = await Promise.allSettled(
      Array.from(this.rules.entries()).flatMap(([field, rules]) =>
        rules.map((r) => r.validator(data[field]).then((ok) => {
          if (!ok) throw new Error(r.message)
        }))
      )
    )
    return results.every((r) => r.status === "fulfilled")
  }
}
```

## 手写实现

完整版 myNew（上面的核心机制部分已经给出了最核心的 4 步实现）。面试时补充：

```ts
function myNew<T>(constructor: new (...args: any[]) => T, ...args: any[]): T {
  // 1. 创建对象，绑定原型
  const obj = Object.create(constructor.prototype as object)
  // 2. 执行构造函数
  const result = constructor.apply(obj, args)
  // 3. 判断返回值：引用类型用返回值，否则用 obj
  const isObject = result !== null && (typeof result === "object" || typeof result === "function")
  return isObject ? result : obj
}
```

## 易错点

1. **new 箭头函数** -- 箭头函数没有 `[[Construct]]` 内部方法，`new (() => {})` 会抛 TypeError
2. **构造函数 return 一定会覆盖实例** -- 只有 return 引用类型（Object / Array / Function）才会覆盖；return 基本类型被忽略
3. **忘记 new 调用构造函数** -- 普通调用导致 this 指向 window（非严格模式），属性挂到全局污染上
4. **new 和 bind 的优先级** -- new 绑定 > 显式绑定，`new (Foo.bind(obj))()` 中的 this 指向新实例而非 obj
5. **class vs function** -- class 必须 new 调用，function 可以裸调（这是一个危险的设计差异）

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "new 做了什么" | 手写 new |
| "手写 new" | 追问 return 不同值的区别 |
| "new 和 Object.create 区别" | 原型链 + 寄生组合继承 |
| "class 和 function 构造函数的区别" | new.target、严格模式 |

## 相关阅读

- [上一篇](./prototype-chain.md)
- [下一篇](./deep-clone.md)
- [原型链](./prototype-chain.md)
- [this](./this.md)
- [手写题：new](../手写题/new.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（四步流程 + 手写 + Vue3 中 new 的消失）
