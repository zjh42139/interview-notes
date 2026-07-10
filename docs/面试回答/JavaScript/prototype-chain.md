---
title: 原型链 面试回答
description: 原型链的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# 原型链 面试回答

> 对应题库：[面试题库/JavaScript](../../面试题库/JavaScript.md)

## 30 秒版

JS 的继承是通过原型链实现的。每个对象都有一个 `__proto__` 指向它的原型，原型也是一个对象，也有自己的 `__proto__`，这样一层层往上连成一条链——直到 `Object.prototype`，它的 `__proto__` 是 null。访问一个对象的属性时，JS 先在自己身上找，找不到就沿着原型链往上找，找到了就返回，找到头都没有就返回 undefined。

---

## 2 分钟版

**第一：prototype 和 `__proto__` 的区别。**

构造函数（比如 `function Person() {}`）有一个 `prototype` 属性，指向它的原型对象。这个构造函数 `new` 出来的实例，它们的 `__proto__` 指向同一个 `prototype`。所以 `person.__proto__ === Person.prototype`。`__proto__` 是浏览器暴露的内部属性，标准写法是 `Object.getPrototypeOf()`。

`Object.prototype` 是所有对象的根。`Function.prototype` 是所有函数的根——因为函数也是对象。这就形成了一个有趣的三角：`Function.__proto__ === Function.prototype`（Function 是它自己的实例）。

**第二：instanceof 的原理。**

`A instanceof B` 就是沿着 A 的 `__proto__` 链往上找，看能不能找到 `B.prototype`。`[] instanceof Array` → 找 `[].__proto__` 是不是 `Array.prototype` → 是，返回 true。跨 Realm 的问题——不同 iframe 中的 Array 构造函数不同，所以 `iframe.contentWindow.Array` 的实例 instanceof 主窗口的 Array 返回 false。

**第三：ES6 class 和原型链的关系。**

class 本质是语法糖。`class Dog extends Animal` 编译后就是 `Dog.prototype.__proto__ = Animal.prototype` + `Dog.__proto__ = Animal`（静态方法继承）。class 增加的只是一些保护——比如 `new.target` 检查、内部方法不可枚举。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "`__proto__` 和 prototype 有什么区别" | prototype 是函数才有的属性，`__proto__` 是每个对象都有的内部链接。构造函数的 prototype = 实例的 `__proto__` |
| "Object.create(null) 和 {} 有什么区别" | `Object.create(null)` 创建的对象没有 `__proto__`——连 `hasOwnProperty`、`toString` 都没有。适合当纯键值对字典，不用担心原型污染 |
| "hasOwnProperty 有什么用" | 区分属性是自身还是原型上的。`for...in` 会遍历原型上的可枚举属性，用 `hasOwnProperty` 过滤掉 |

---

## 别踩的坑

- "把 prototype 和 `__proto__` 说反了"——实例.`__proto__` → 构造函数.prototype → 再往上找。面试中画线时写反直接挂
- "for...in 会遍历原型属性"——这和其他语言的 for-in 行为不同，JS 里要加 `hasOwnProperty` 守卫
- "arr.forEach / arr.map 不是在 arr 上定义的"——它们在 `Array.prototype` 上，能调用是因为原型链查找
