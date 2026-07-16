---
title: this / call / apply / bind 面试回答
description: 面试中如何回答 this 指向和 call/apply/bind——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - this
  - call
  - apply
  - bind
  - 面试回答
---

# this / call / apply / bind 面试回答

## Q1: this 的指向规则是什么？

### 30 秒版本

"this 指向由调用方式决定——不是定义位置。四种绑定：new 绑定——this 指向新对象；显式绑定——call/apply/bind 指定；隐式绑定——对象.方法()；默认绑定——严格模式 undefined 否则 window。箭头函数不绑 this——它从外层作用域继承。"

### 2 分钟版本

"this 是 JS 面试中最容易被问到的动态特性。记住**四条绑定规则的优先级**就够了：

**1. new 绑定（最高优先级）**：`new Fn()` → this 指向新创建的实例对象。new 做了四件事：创建空对象→设原型→执行构造函数→返回对象。

**2. 显式绑定**：call、apply、bind。`fn.call(obj, a, b)`——第一个参数就是 this。call 和 apply 的区别只在于传参方式——call 逐个传、apply 数组传。bind 返回一个永久绑定了 this 的新函数——bind 绑过的函数再 bind 无效，因为 bind 返回的是一个新函数。

**3. 隐式绑定**：`obj.method()`——this 是 `.` 前面的对象。最容易丢的是回调——`setTimeout(obj.method, 0)` 里 method 被当成普通函数调用了，this 丢失。

**4. 默认绑定**：`fn()` 独立调用——严格模式 this 为 undefined，非严格为 window/global。

**箭头函数**：不绑自己的 this——从定义位置的外层作用域继承。`const obj = { fn: () => this }` —— fn 的 this 是定义时外层的 this（不是 obj）。这就是为什么对象方法不该用箭头函数。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "call 和 apply 的区别" | 传参方式——call 逐个传(`fn.call(obj, a, b)`)，apply 数组传(`fn.apply(obj, [a, b])`)。功能完全相同。记忆技巧：apply→array 都是 a 开头 |
| "bind 返回的函数再 bind 会怎样" | 第二次 bind 无效——bind 返回的是一个新函数，第二次 bind 是给这个新函数 bind，不改变原函数的 this。同理 new 的优先级也高于 bind |
| "箭头函数的 this 能改吗" | 不能。call/bind 对箭头函数无效——箭头函数压根没有自己的 this。new 箭头函数直接报错 |

## 别踩的坑

1. **回调丢失 this** —— `obj.method` 当回调传参时 this 会丢。解决方案：箭头函数包装、bind 绑定、或者用箭头函数定义方法
2. **"箭头函数没有 this"太绝对** —— 箭头函数没有**自己的** this，但可以通过词法作用域访问外层的 this
3. **call 和 bind 能改箭头函数 this** —— 这是错的。面试中说这句话会直接减分

## 相关阅读

- [this 知识文档](../../JavaScript/this.md)
- [call / apply / bind](../../JavaScript/call-apply-bind.md)
- [手写 bind / call / apply](../../手写题/bind-call-apply.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）
