---
title: JavaScript 高频面试题
category: 面试题库
type: interview
score: 0
difficulty: 中级
status: reviewed
tags:
  - JavaScript
  - Promise
  - EventLoop
  - 原型链
  - 手写题


---
# JavaScript 高频面试题

> 收录前端面试中的高频 JS 真题
> 题目按出现频率从高到低排列。

---

### Q1: Promise 执行顺序输出题
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：写出以下代码的输出顺序：

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

new Promise((resolve) => {
  console.log('4');
  resolve();
}).then(() => {
  console.log('5');
}).then(() => {
  console.log('6');
});

console.log('7');
```

**考察点**：
- 宏任务与微任务的执行顺序（Event Loop）
- Promise executor 是同步执行的
- `setTimeout` 属于宏任务，`.then()` 属于微任务
- 微任务队列的清空时机：每个宏任务执行后必须清空微任务队列

> 答案参考：[../JavaScript/promise.md](../JavaScript/promise.md)
> 延伸：[../JavaScript/event-loop.md](../JavaScript/event-loop.md)

---

### Q2: 手写 bind / call / apply
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请手写实现 `Function.prototype.bind`，并说明 bind 和 call/apply 的区别。

**考察点**：
- 显示绑定 this 的三种方式及差异
- bind 返回新函数的特性（柯里化基础）
- 原型链关系处理（`new` 操作符场景）
- 参数合并逻辑

> 答案参考：[../JavaScript/call-apply-bind.md](../JavaScript/call-apply-bind.md)
> 延伸：[../手写题/bind-call-apply.md](../手写题/bind-call-apply.md)

---

### Q3: 闭包 + setTimeout 输出题
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：以下代码输出什么？如何让输出变成 0 1 2 3 4？

```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
```

**考察点**：
- 闭包的作用域链机制
- `var` 没有块级作用域，`let` 有
- 闭包捕获的是变量的引用，不是值
- 多种解决方案：`let`、IIFE、`setTimeout` 的第三个参数

> 答案参考：[../JavaScript/closure.md](../JavaScript/closure.md)

---

### Q4: this 指向判断
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：判断以下场景中 `this` 的指向，并说明原因：

```javascript
const obj = {
  name: 'obj',
  foo: function () {
    console.log(this.name);
  },
  bar: () => {
    console.log(this.name);
  },
};

obj.foo();           // ?
const fn = obj.foo;
fn();                // ?
obj.bar();           // ?
new obj.foo();       // ?
obj.foo.call({ name: 'other' }); // ?
```

**考察点**：
- 默认绑定、隐式绑定、显式绑定、new 绑定的优先级
- 箭头函数没有自己的 `this`，继承外层作用域
- 严格模式下的 `this` 行为
- 方法赋值丢失绑定问题

> 答案参考：[../JavaScript/this.md](../JavaScript/this.md)

---

### Q5: Event Loop 浏览器 vs Node
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请详细描述浏览器 Event Loop 机制，并与 Node.js 的 Event Loop 对比有什么区别？

**考察点**：
- 浏览器中宏任务和微任务的完整分类
- 渲染时机（requestAnimationFrame）在 Event Loop 中的位置
- Node.js 中 6 个阶段的执行顺序
- `process.nextTick` vs `Promise.then` 的执行优先级
- Node 11+ 版本对微任务的修改

> 答案参考：[../JavaScript/event-loop.md](../JavaScript/event-loop.md)
> 延伸：[../Node/node-event-loop.md](../Node/node-event-loop.md)

---

### Q6: 手写深拷贝
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请手写一个 `deepClone` 函数，要求支持对象、数组、Date、RegExp、Map、Set，并处理循环引用的场景。

**考察点**：
- 递归遍历对象/数组
- `typeof` 的类型判断缺陷
- `WeakMap` 解决循环引用
- 特殊对象（Date / RegExp / Map / Set）的处理
- `Object.getOwnPropertyDescriptors` 保留属性描述符

> 答案参考：[../JavaScript/deep-clone.md](../JavaScript/deep-clone.md)
> 延伸：[../手写题/deep-clone.md](../手写题/deep-clone.md)

---

### Q7: async/await + Promise 混合输出题
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：写出以下代码的输出顺序：

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');
```

**考察点**：
- `async` 函数返回 Promise
- `await` 后面的代码等效于 `.then()` 微任务
- `await` 右侧表达式是同步执行的
- 宏任务和微任务的嵌套顺序

> 答案参考：[../JavaScript/async-await.md](../JavaScript/async-await.md)
> 延伸：[../JavaScript/promise.md](../JavaScript/promise.md)

---

### Q8: 原型链 + instanceof 原理
> ⭐⭐⭐⭐ | 难度：中级

**题目**：请解释原型链的查找机制，并手写实现 `instanceof` 操作符。以下代码输出什么？

```javascript
function Foo() {}
Foo.prototype = {};

const f = new Foo();
console.log(f instanceof Foo);      // ?
console.log(f instanceof Object);   // ?
Foo.prototype = {};
console.log(f instanceof Foo);      // ?
```

**考察点**：
- `__proto__` vs `prototype` 的区别
- 原型链的查找路径
- `instanceof` 的本质：沿着 `__proto__` 查找 `prototype`
- 动态修改原型的影响

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)
> 延伸：[../JavaScript/new.md](../JavaScript/new.md)

---

### Q9: var / let / const 区别 + 变量提升
> ⭐⭐⭐⭐ | 难度：初级-中级

**题目**：请详细对比 `var`、`let`、`const` 的区别，并解释"暂时性死区"（TDZ）的概念。

```javascript
console.log(a); // ?
var a = 1;

console.log(b); // ?
let b = 2;
```

**考察点**：
- `var` 存在变量提升，`let`/`const` 不存在（但有 TDZ）
- 块级作用域 `{}` 对三种变量的影响
- `const` 声明必须初始化，且基本类型值不可修改
- TDZ 的原理：从块开始到声明之间不可访问

> 答案参考：[../JavaScript/closure.md](../JavaScript/closure.md)

---

### Q10: 防抖与节流
> ⭐⭐⭐⭐ | 难度：中级

**题目**：请手写 `debounce` 和 `throttle` 函数，分别说明其使用场景，以及防抖如何实现"立即执行"版本。

**考察点**：
- 防抖（最后一次触发后延迟执行）vs 节流（固定间隔执行）
- 闭包保存定时器的写法
- `debounce` 的 `immediate` 参数（首次立即执行）
- `throttle` 的时间戳实现 vs 定时器实现
- 实际场景：搜索框输入（debounce）、滚动加载（throttle）

> 答案参考：[../JavaScript/debounce-throttle.md](../JavaScript/debounce-throttle.md)
> 延伸：[../手写题/debounce-throttle.md](../手写题/debounce-throttle.md)

---

### Q11: new 操作符的执行过程
> ⭐⭐⭐⭐ | 难度：中级

**题目**：请描述 `new` 操作符做了什么，并手写一个 `_new` 函数模拟 `new` 的行为。

**考察点**：
- 创建空对象 + 绑定原型
- 执行构造函数并绑定 `this`
- 构造函数返回值判断（引用类型 vs 基本类型）
- `new` 优先级 > 隐式绑定

> 答案参考：[../JavaScript/new.md](../JavaScript/new.md)
> 延伸：[../手写题/new.md](../手写题/new.md)

---

### Q12: JS 数据类型 + 类型检测
> ⭐⭐⭐⭐ | 难度：初级-中级

**题目**：JS 中有哪些数据类型？`typeof` 和 `Object.prototype.toString.call()` 各有什么优缺点？如何判断一个变量是数组？

**考察点**：
- 基本类型（7种） vs 引用类型
- `typeof null === 'object'` 的历史原因
- `instanceof` 的跨 iframe 问题
- 安全类型检测：`Object.prototype.toString.call(value).slice(8, -1)`
- `Array.isArray()` 的实现原理

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)

---

### Q13: 垃圾回收机制
> ⭐⭐⭐⭐ | 难度：中高级

**题目**：请解释 V8 引擎的垃圾回收机制，包括新生代和老生代的回收策略。如何在开发中避免内存泄漏？

**考察点**：
- 新生代：Scavenge 算法（From/To 空间），复制存活对象
- 老生代：标记-清除（Mark-Sweep）+ 标记-整理（Mark-Compact）
- 增量标记（Incremental Marking）降低 GC 停顿
- 常见内存泄漏：全局变量、未清除的定时器、闭包引用、游离 DOM

> 答案参考：[../浏览器/reflow-repaint.md](../浏览器/reflow-repaint.md)

---

### Q14: for...in vs for...of
> ⭐⭐⭐⭐ | 难度：初级-中级

**题目**：`for...in` 和 `for...of` 有什么区别？`for...of` 如何遍历普通对象？如何让自定义对象支持 `for...of`？

**考察点**：
- `for...in` 遍历可枚举属性（含原型链），`for...of` 遍历可迭代对象的值
- `Symbol.iterator` 迭代器协议
- `Object.keys()` / `Object.values()` / `Object.entries()` 遍历对象
- 如何给自定义对象实现 `[Symbol.iterator]` 方法

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)

---

### Q15: 手写柯里化函数
> ⭐⭐⭐⭐ | 难度：中级

**题目**：请实现一个 `curry` 函数，使以下调用等效：

```javascript
function add(a, b, c) { return a + b + c; }
const curriedAdd = curry(add);
curriedAdd(1)(2)(3);    // 6
curriedAdd(1, 2)(3);    // 6
curriedAdd(1)(2, 3);    // 6
```

**考察点**：
- 闭包缓存参数
- 参数个数判断（`fn.length`）
- 递归返回新函数直到参数足够
- 实际应用：参数复用、延迟执行

> 答案参考：[../JavaScript/closure.md](../JavaScript/closure.md)
> 延伸：[../手写题/compose-pipe.md](../手写题/compose-pipe.md)

---

### Q16: 浮点数精度问题
> ⭐⭐⭐ | 难度：中高级

**题目**：为什么 `0.1 + 0.2 !== 0.3`？如何解决 JS 中的浮点数精度问题？项目中如何处理金额计算？

**考察点**：
- IEEE 754 双精度浮点数标准
- 十进制小数转二进制的无限循环问题
- 解决方案：`Number.EPSILON` 误差容限
- 第三方库（big.js、decimal.js）实现任意精度
- 业务常见做法：金额以"分"为单位存储，避免小数运算

> 答案参考：[../JavaScript/deep-clone.md](../JavaScript/deep-clone.md)

---

### Q17: 手写 Promise（含链式调用）
> ⭐⭐⭐⭐⭐ | 难度：中高级

**题目**：请按照 Promises/A+ 规范手写一个 Promise，支持 `.then()` 链式调用、`catch`、`finally`、`Promise.resolve`、`Promise.reject`、`Promise.all`、`Promise.race`。

**考察点**：
- Promise 三种状态（pending/fulfilled/rejected）及不可逆
- `.then()` 返回新 Promise 实现链式调用
- 异步执行（`setTimeout` 模拟微任务）
- 发布-订阅模式收集回调
- `Promise.all` 的失败快速返回 vs `Promise.allSettled`

> 答案参考：[../手写题/promise.md](../手写题/promise.md)
> 延伸：[../JavaScript/promise.md](../JavaScript/promise.md)

---

### Q18: 事件委托 / 事件代理
> ⭐⭐⭐⭐ | 难度：中级

**题目**：什么是事件委托？请实现一个通用的委托函数。事件委托的原理是什么？

**考察点**：
- 利用冒泡机制，将子元素事件委托到父元素
- `event.target` 获取实际触发元素
- `matches()` API 做选择器匹配
- 动态添加元素无需重新绑定事件
- 不适合委托的场景：`focus`/`blur` 等不冒泡的事件

> 答案参考：[../JavaScript/event-loop.md](../JavaScript/event-loop.md)
> 延伸：[../手写题/event-emitter.md](../手写题/event-emitter.md)

---

### Q19: class 与 ES5 构造函数的区别
> ⭐⭐⭐ | 难度：中级

**题目**：ES6 的 `class` 和 ES5 的构造函数写法有什么区别？`class` 的本质是什么？

**考察点**：
- `class` 本质是语法糖，底层仍是原型继承
- `class` 声明不会提升（有 TDZ）
- `class` 内部自动使用严格模式
- `class` 的方法不可枚举，构造函数原型方法可枚举
- `class` 必须用 `new` 调用，构造函数可普通调用
- `extends` 和 `super` 的实现原理

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)
> 延伸：[../JavaScript/new.md](../JavaScript/new.md)

---

### Q20: Map vs WeakMap / Set vs WeakSet
> ⭐⭐⭐ | 难度：中级

**题目**：Map 和 WeakMap 有什么区别？WeakMap 有哪些典型使用场景？

**考察点**：
- `Map` 的 key 可以是任何类型，`WeakMap` 的 key 必须是对象
- `WeakMap` 对 key 的引用是弱引用，不影响 GC
- `WeakMap` 不可迭代、没有 `size` 属性
- 使用场景：DOM 节点关联的元数据、私有属性实现、缓存系统
- `WeakSet` 只能存对象，弱引用

> 答案参考：[../JavaScript/deep-clone.md](../JavaScript/deep-clone.md)
