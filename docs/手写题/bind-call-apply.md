---
title: 手写 bind / call / apply
description: 手写实现 bind、call、apply，掌握 this 绑定机制
category: 手写题
type: exercise
score: 82
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - bind
  - call
  - apply
  - this
---

# 手写 bind / call / apply

> ⭐⭐⭐⭐⭐｜难度：中级｜项目：★★★

## 一句话总结

**call 和 apply 的核心是"临时把函数挂到 context 上，用 `obj.fn()` 的方式调用，触发 this 隐式绑定，然后删掉"；bind 在此基础上返回一个新函数，额外处理了 `new` 优先级和柯里化参数合并。**

## 核心机制

```typescript
// ========== myCall ==========
Function.prototype.myCall = function (
  this: Function,
  context: any,
  ...args: any[]
): any {
  // 处理 context：null/undefined → globalThis，原始值 → 包装对象
  if (context == null) {
    context = typeof globalThis !== 'undefined' ? globalThis : window;
  } else if (typeof context !== 'object' && typeof context !== 'function') {
    context = Object(context);
  }

  // 用 Symbol 创建唯一 key，防止覆盖 context 上已有的同名属性
  const fnKey = Symbol('myCall');
  context[fnKey] = this;   // this 就是被调用的函数本身

  // 调用并保存结果
  const result = context[fnKey](...args);

  // 清理
  delete context[fnKey];

  return result;
};

// ========== myApply ==========
Function.prototype.myApply = function (
  this: Function,
  context: any,
  argsArray?: any[]
): any {
  // context 处理与 call 一致
  if (context == null) {
    context = typeof globalThis !== 'undefined' ? globalThis : window;
  } else if (typeof context !== 'object' && typeof context !== 'function') {
    context = Object(context);
  }

  const fnKey = Symbol('myApply');
  context[fnKey] = this;

  // 参数校验：argsArray 为空则无参调用
  let result: any;
  if (argsArray == null || argsArray.length === 0) {
    result = context[fnKey]();
  } else if (!Array.isArray(argsArray)) {
    // 严格模式下，apply 要求第二个参数是数组或类数组
    throw new TypeError('CreateListFromArrayLike called on non-object');
  } else {
    result = context[fnKey](...argsArray);
  }

  delete context[fnKey];
  return result;
};

// ========== myBind ==========
Function.prototype.myBind = function (
  this: Function,
  context: any,
  ...boundArgs: any[]
): any {
  // 保存原函数
  const originalFn = this;

  // 如果 this 不是函数，抛出 TypeError（规范要求）
  if (typeof originalFn !== 'function') {
    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  }

  // 返回绑定后的新函数
  const boundFn = function (this: any, ...callArgs: any[]): any {
    // 合并柯里化参数
    const combinedArgs = [...boundArgs, ...callArgs];

    // 核心：new 优先于 bound this
    // 如果 boundFn 被 new 调用，this 指向新创建的对象（该对象的原型指向 boundFn.prototype）
    // 否则 this 指向传入的 context
    const isNewCall = this instanceof boundFn;
    const finalThis = isNewCall ? this : context;

    return originalFn.apply(finalThis, combinedArgs);
  };

  // 维护原型链：boundFn 的实例应该能访问 originalFn.prototype 上的属性
  // 用一个空函数做中转，避免直接引用原函数的 prototype（修改 boundFn.prototype 不会影响原函数）
  if (originalFn.prototype) {
    // 兼容 ES5 的方式：boundFn.prototype = Object.create(originalFn.prototype)
    const Empty = function () {};
    Empty.prototype = originalFn.prototype;
    (boundFn as any).prototype = new (Empty as any)();
  }

  return boundFn;
};

// ==================== 测试用例 ====================

// --- call 测试 ---
const person = { name: 'Alice' };
function greet(greeting: string, punctuation: string) {
  return `${greeting}, ${this.name}${punctuation}`;
}
console.log(greet.myCall(person, 'Hello', '!'));  // "Hello, Alice!"

// context 为 null → globalThis
console.log(greet.myCall(null, 'Hi', '.'));       // "Hi, undefined."

// context 为原始值 → 包装对象
function showThisType() {
  return typeof this;
}
console.log(showThisType.myCall(123));             // "object" (Number 包装对象)

// --- apply 测试 ---
console.log(greet.myApply(person, ['Hey', '!!'])); // "Hey, Alice!!"
console.log(greet.myApply(person));                 // "undefined, Aliceundefined"

// --- bind 测试 ---
const greetAlice = greet.myBind(person, 'Hi');
console.log(greetAlice('~'));                      // "Hi, Alice~"（柯里化）

// bind + new：new 优先级高于 bound this
function User(this: any, name: string, age: number) {
  this.name = name;
  this.age = age;
}
User.prototype.sayHi = function () {
  return `I'm ${this.name}`;
};

const BoundUser = (User as any).myBind({ name: 'ignored' }, 'Default');
const instance = new BoundUser(25);

console.log(instance.name);  // "Default"（new 生效，bound this 被忽略）
console.log(instance.age);   // 25
console.log(instance.sayHi()); // "I'm Default"（原型链完整）
console.log(instance instanceof BoundUser); // true
console.log(instance instanceof User);      // true
```

## 深度拓展

### 追问点 1：为什么 bind 中用 `instanceof` 判断 new 调用？

```typescript
// 面试官追问：怎么区分 bind 返回的函数是被普通调用还是 new 调用？

// 当 new boundFn() 时，JS 引擎会：
// 1. 创建一个新对象
// 2. 将新对象的 __proto__ 指向 boundFn.prototype
// 3. 用这个新对象作为 this 调用 boundFn
// 因此，boundFn 内部的 this 是新对象，新对象 instanceof boundFn 为 true

function myBind_new_detect() {
  // 在 boundFn 内部
  if (this instanceof boundFn) {
    // new 调用：忽略 bound context，this 就是新创建的对象
  } else {
    // 普通调用：this 就是传入的 context
  }
}
```

### 追问点 2：boundFn.prototype 的处理为什么重要？

```typescript
// 如果 bind 不处理 prototype，会丢失原始函数的原型链：

const F = function() {};
F.prototype.method = () => 'hello';

const BoundF = F.myBind(null);
// BoundF 没有 prototype → new BoundF() 无法访问 method

// 正确做法：
// boundFn.prototype 应该继承 originalFn.prototype
// 用一个空函数做中转（原型式继承），而不是直接赋值
const Empty = function() {};
Empty.prototype = originalFn.prototype;
boundFn.prototype = new Empty();
// 这样修改 boundFn.prototype 不会污染 originalFn.prototype
```

## 项目实战

```typescript
// 场景1：后台管理系统中的工具函数借用
const arrayLike = document.querySelectorAll('.item'); // NodeList 没有 map
const ids = Array.prototype.map.myCall(arrayLike, (el) => el.dataset.id);

// 场景2：组件事件回调中绑定 this
class TableComponent {
  data: any[] = [];

  onRowClick(row: any) {
    console.log(this.data); // this 指向 TableComponent 实例
  }

  bindEvents() {
    document.querySelectorAll('.row').forEach((row) => {
      // 原生 bind：确保回调中的 this
      row.addEventListener('click', this.onRowClick.myBind(this, row));
    });
  }
}

// 场景3：Math.max 配合 apply 找数组最大值
const scores = [89, 95, 76, 91];
const max = Math.max.myApply(null, scores); // 95
```

## 易错点

1. **call/apply 中 context 为 null/undefined 时**：应指向 globalThis（浏览器中是 window），不能直接 `context || window`，因为 context 可能为 falsy 值（如 0、''）。

2. **原始值 context 要转为包装对象**：`greet.call(123)` 中 this 是 `Number(123)`，不是原始值 123。用 `Object(context)` 包装即可。

3. **bind 中忘记 `this instanceof boundFn` 会怎样？** new 调用时也会强行把 this 绑到 bound context，导致构造函数无法给新实例赋值。

4. **bind 多次绑定**：只有第一次 bind 生效。`fn.bind(ctx1).bind(ctx2)` 得到的函数依然绑定 ctx1。实现时不需要特殊处理，因为 `originalFn` 是固定的。

5. **apply 的第二个参数不传和传 null 行为不同**：`fn.apply(obj)` 等价于 `fn.apply(obj, [])`，但很多手写实现漏了 `argsArray == null` 的判别直接展开数组会报错。

## 相关阅读

- [JavaScript call/apply/bind](../JavaScript/call-apply-bind.md) -- this 绑定规则的完整原理
- [手写 new](./new.md) -- new 操作符实现，bind + new 配合
- [JavaScript 原型链](../JavaScript/prototype-chain.md) -- boundFn.prototype 继承的原理
- [JavaScript new](../JavaScript/new.md) -- new 的四步执行过程

## 更新记录

- 2026-07-05：Phase 2 填充完整实现
- 2026-07：初始占位（Phase 1）
