---
title: new 操作符 面试回答
description: 面试中如何回答 new 操作符——四步执行过程、手写 new、箭头函数不能 new 的原因
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - JavaScript
  - new
  - 构造函数
  - 面试回答
---

# new 操作符 面试回答

> 考察对 JS 对象创建机制的理解。new 做了四件事——说清楚这四步就能手写出来。

## Q1: new 操作符做了什么？请手写实现

### 30 秒版本

"new 做四件事——创建一个空对象、把这个对象的 __proto__ 指向构造函数的 prototype、以这个对象为 this 调用构造函数、如果构造函数返回了对象就用返回值否则返回新对象。手写 myNew 就是模拟这四步。"

### 2 分钟版本

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建新对象，__proto__ 指向 Constructor.prototype
  const obj = Object.create(Constructor.prototype);
  // 2. 以 obj 为 this 调用构造函数
  const result = Constructor.apply(obj, args);
  // 3. 构造函数返回引用类型则用返回值，否则返回新对象
  return result instanceof Object ? result : obj;
}

// 验证
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`);
};
const p = myNew(Person, '张三');
p.sayHi(); // Hi, 张三
p instanceof Person; // true
```

**为什么第三步要判断返回值？** 构造函数可以显式 return 一个对象来覆盖 new 的默认行为——`return { hacked: true }` 会让 new 返回那个对象而不是新创建的实例。但返回原始类型（123、'hello'）会被忽略——仍然返回新对象。

**箭头函数不能用 new**——因为箭头函数没有 prototype。`(() => {}).prototype` 是 undefined——第一步 Object.create(undefined) 直接报错。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "new 一个箭头函数会怎样" | TypeError: () => {} is not a constructor——箭头函数没有 prototype 也没有 [[Construct]] 内部方法 |
| "构造函数 return 一个字符串会怎样" | 忽略——仍然返回新对象。只有 return 引用类型（对象/数组/函数）才覆盖默认行为 |
| "Object.create 和 new 的区别" | Object.create 只做第 1 步（创建对象 + 设 __proto__），不调构造函数。适合原型继承 |

## 别踩的坑

1. **忘了处理构造函数的返回值** —— 手写 new 时如果构造函数 return 了一个对象，你得返回那个对象。
2. **prototype 和 __proto__ 搞反** —— `Object.create(Constructor.prototype)` 不是 `Object.create(Constructor.__proto__)`。

## 相关阅读

- [原型链](./prototype-chain.md)
- [this / call / apply / bind](./this-bind.md)

## 更新记录

- 2026-07-15：新建（四步分解 + 手写 myNew + 箭头函数限制）
