---
title: 版本号比较 / LazyMan / 寄生组合继承
description: 手写版本号比较（美团高频）+ LazyMan 链式调用 + ES5 寄生组合继承
category: 手写题
type: practice
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 字符串
  - 链式调用
  - 继承
  - 手写题
---

# 版本号比较 / LazyMan / 寄生组合继承

> ⭐⭐⭐⭐｜难度：中级｜美团/字节补缺题

## 1. 版本号比较

```typescript
// 输入: '1.2.3', '1.10.1' → 输出: -1（前者小于后者）
// 关键：不能直接 Number('1.2.3')，要逐段比较数字
function compareVersion(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  const len = Math.max(parts1.length, parts2.length)

  for (let i = 0; i < len; i++) {
    const n1 = parts1[i] || 0
    const n2 = parts2[i] || 0
    if (n1 > n2) return 1
    if (n1 < n2) return -1
  }
  return 0
}
// 追问：'1.0.0' 和 '1.0.0.0' → 相等（缺位补 0）
```

## 2. LazyMan（链式调用 + 异步任务队列）

```typescript
// 字节/阿里场景题：实现 LazyMan('Tony').eat('apple').sleep(2).eat('banana')
class LazyMan {
  private queue: (() => Promise<void>)[] = []

  constructor(name: string) {
    this.queue.push(() => {
      console.log(`Hi, I am ${name}`)
      return Promise.resolve()
    })
    setTimeout(() => this.run())  // 等链式调用全部注册完再执行
  }

  eat(food: string) {
    this.queue.push(() => {
      console.log(`Eating ${food}`)
      return Promise.resolve()
    })
    return this
  }

  sleep(seconds: number) {
    this.queue.push(() =>
      new Promise<void>(resolve => setTimeout(() => {
        console.log(`Wake up after ${seconds}s`)
        resolve()
      }, seconds * 1000))
    )
    return this
  }

  sleepFirst(seconds: number) {
    this.queue.unshift(() =>  // 插队到最前面
      new Promise<void>(resolve => setTimeout(() => {
        console.log(`Wake up after ${seconds}s`)
        resolve()
      }, seconds * 1000))
    )
    return this
  }

  private async run() {
    for (const task of this.queue) {
      await task()
    }
  }
}

function createLazyMan(name: string) {
  return new LazyMan(name)
}
```

## 3. 寄生组合继承

```typescript
// ES5 终极继承方案
function Parent(name: string) {
  this.name = name
}
Parent.prototype.say = function () {
  console.log(this.name)
}

function Child(name: string, age: number) {
  Parent.call(this, name)  // ① 继承实例属性
  this.age = age
}
// ② 继承原型方法——Object.create 创建纯净原型，避免 new Parent() 引入多余的实例属性
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child  // ③ 修正 constructor 指向

// 对比其他继承方式的缺陷：
// 原型链继承：Child.prototype = new Parent() → 引用类型共享
// 构造函数继承：Parent.call(this) → 无法继承原型方法
// 组合继承：call + new Parent() → 调两次父类构造函数
// 寄生组合：call + Object.create → 最优解
```

## 面试追问

| 追问 | 回答 |
|------|------|
| "寄生组合继承为什么最优" | 只调一次父类构造函数，原型链上无冗余属性 |
| "Object.create 在这里的作用" | 创建纯净原型——`Child.prototype.__proto__ === Parent.prototype`，但不执行 Parent 构造函数 |
| "LazyMan 为什么用 setTimeout" | 让所有 `.eat().sleep()` 链式调用先执行完、把所有 task 注册到队列里，然后才开始执行 |

## 相关阅读

- [原型链](../JavaScript/prototype-chain.md)
- [Object 系列 API](../JavaScript/object-api.md)

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐
