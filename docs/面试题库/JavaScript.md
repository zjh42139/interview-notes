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
> 题目按分组 + 频率排列。

---

## 基础语法与类型（8 题）

### Q1: 闭包 + setTimeout

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 输出题

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

**30秒答**：闭包 = 函数能记住并访问它被创建时所在的作用域——即使外层函数已经执行完了。for + var + setTimeout 全输出 5 是经典题——var 是函数作用域，所有回调共享同一个 i；用 let 或 IIFE 创建独立作用域解决。
**追问预测**：
- "let 为什么能解决 for+setTimeout" → let 块作用域，每次迭代创建新绑定，闭包引用独立的 i
- "不用 let 怎么解决" → IIFE 包一层创建独立作用域
- "闭包会导致内存泄漏吗" → 不会——除非你把大对象挂在闭包引用链上长期不释放

> 答案参考：[../JavaScript/closure.md](../JavaScript/closure.md)
> 🎤 回答稿：[../面试回答/JavaScript/closure.md](../面试回答/JavaScript/closure.md)

---

### Q2: this 指向判断

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 概念题

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

**30秒答**：this 由调用方式决定——new 绑定→call/apply/bind 显式→对象.方法 隐式→默认(window/undefined)。箭头函数没自己的 this，从外层词法继承，call/bind 对它无效。
**追问预测**：
- "call 和 apply 的区别" → 传参方式——call 逐个、apply 数组，功能完全相同
- "箭头函数的 this 怎么确定" → 从定义位置外层词法继承，call/bind 对箭头函数无效
- "严格模式下 this 是什么" → 默认绑定为 undefined（非严格为 window）

> 答案参考：[../JavaScript/this.md](../JavaScript/this.md)
> 🎤 回答稿：[../面试回答/JavaScript/this-bind.md](../面试回答/JavaScript/this-bind.md)

---

### Q3: var / let / const 区别 + 变量提升

> ⭐⭐⭐⭐ | 难度：初级-中级
> 🏷️ 对比题

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

**追问预测**：
- "let 和 var 在 for 循环里有什么区别" → let 块作用域每次迭代创建新绑定；var 函数作用域共享一个变量
- "暂时性死区什么时候触发" → 在声明前访问 let/const 变量——从块开始到声明之间的区间
- "const 对象属性能改吗" → 能——const 锁的是引用不是值。不能重新赋值整个变量


**30秒答**：var 函数作用域/可重复声明/有变量提升；let 块作用域/不可重复声明/有 TDZ；const 块作用域/不可重复声明/不可重新赋值（但对象属性可改）。现在默认用 const——需要改的用 let——不用 var。

> 答案参考：[../JavaScript/closure.md](../JavaScript/closure.md)
> 延伸：[../JavaScript/var-let-const.md](../JavaScript/var-let-const.md)
> 🎤 回答稿：[../面试回答/JavaScript/var-let-const.md](../面试回答/JavaScript/var-let-const.md)

---

### Q4: JS 类型检测方式

> ⭐⭐⭐⭐ | 难度：初级-中级
> 🏷️ 概念题

**题目**：JS 中 `typeof`、`instanceof`、`Object.prototype.toString.call()` 各有什么优缺点？如何安全判断一个变量是数组？`Array.isArray()` 的实现原理是什么？

**考察点**：
- `typeof` 的返回值映射 + `typeof null === 'object'` 历史原因
- `instanceof` 沿原型链查找 + 跨 iframe 失效
- `Object.prototype.toString.call()` 的万能检测
- `Array.isArray()` 原理——ES5 引入的 Object.prototype.toString 判断 + ES6 后检查内部 [[IsArray]] slot

**30秒答**：typeof 基础类型够用但 null 误判为 object。instanceof 检查原型链但跨 iframe 失效。Object.prototype.toString.call 最可靠——返回 [object Type] 格式。Array.isArray 是 ES5 标准方法——比 instanceof 安全、比 toString 简洁。

**追问预测**：
- "typeof null 为什么是 object" → JS 底层用 3 位二进制标记类型，对象是 000，null 全零也碰上是 000——历史 bug
- "怎么判断数组" → Array.isArray()——解决 instanceof 跨 iframe 问题
- "bigint 和 number 能混算吗" → 不能——TypeError。需要显式转换

> 答案参考：[../JavaScript/type-coercion.md](../JavaScript/type-coercion.md)

---

### Q5: 垃圾回收机制

> ⭐⭐⭐⭐ | 难度：中高级
> 🏷️ 概念题

**题目**：请解释 V8 引擎的垃圾回收机制，包括新生代和老生代的回收策略。如何在开发中避免内存泄漏？

**考察点**：
- 新生代：Scavenge 算法（From/To 空间），复制存活对象
- 老生代：标记-清除（Mark-Sweep）+ 标记-整理（Mark-Compact）
- 增量标记（Incremental Marking）降低 GC 停顿
- 常见内存泄漏：全局变量、未清除的定时器、闭包引用、游离 DOM

**追问预测**：
- "引用计数和标记清除哪个好" → 标记清除——能解决循环引用。引用计数简单但循环引用导致内存泄漏
- "怎么排查内存泄漏" → Chrome DevTools Memory 面板——heap snapshot 对比，找 detached DOM 节点
- "WeakMap 和 GC 的关系" → WeakMap key 是弱引用——key 被回收后 value 自动 GC


**30秒答**：标记清除——从根对象出发标记所有可达对象，不可达的回收。引用计数——记录每个对象的引用次数，归零回收但解决不了循环引用。V8 分代 GC——新生代 Scavenge 复制，老生代 Mark-Sweep-Compact。

> 答案参考：[../浏览器/gc.md](../浏览器/gc.md)

---

### Q6: null 和 undefined 的区别
> ⭐⭐⭐⭐ | 难度：初级
> 🏷️ 对比题

**题目**：null 和 undefined 有什么区别？`typeof null` 为什么返回 `"object"`？

**30秒答**：undefined 是"没赋值"（变量声明了没初始化、参数没传、对象属性不存在），null 是"空值"（主动设为空）。`==` 下两者相等、`===` 下不等——`value == null` 可同时判断两者。`typeof null === "object"` 是 JS 的历史 bug——null 的类型标签是 0，和对象一样。
**追问预测**：
- "怎么同时判断 null 和 undefined" → `value == null`（宽松等号，null 和 undefined 相等）
- "void 0 是什么" → 返回 undefined，确保不被人重写 undefined 变量影响

**2 分钟版**：区别——1) `undefined == null` 为 true，`===` 为 false；2) Number(null) = 0，Number(undefined) = NaN；3) JSON 序列化 null 保留，undefined 被忽略；4) 函数默认参数只有 undefined 触发，null 不触发

> 📖 答案参考：[类型转换](../JavaScript/type-coercion.md)

---

### Q7: JS 隐式类型转换

> ⭐⭐⭐⭐ | 难度：中级
> 🏷️ 对比题

**题目**：JS 的隐式类型转换规则是什么？请解释 `[] == ![]`、`[] + {}` vs `{} + []`、`true + true` 的结果和原理。

**考察点**：
- `==` 的抽象相等比较算法（ToPrimitive → valueOf → toString）
- 对象的 ToPrimitive 转换规则
- 运算符触发的类型转换（`+` 的字符串拼接优先 vs `-` 的数学运算优先）
- `!` 操作符优先触发 Boolean 转换

**30秒答**：`==` 比较走 ToPrimitive 规则——对象先调 valueOf 再调 toString。`[] == ![]`——`![]` 先转 false，然后 `[] == false`→ToPrimitive([])→""→""==false→0==0→true。`[] + {}`→""+"[object Object]"→字符串。`true + true` → 1+1=2。

**追问预测**：
- "[] == ![] 结果是 true，为什么" → ![] 是 false，[] 转原始值是 ""，最终 0==0
- "什么时候用 == 什么时候用 ===" → 永远用 ===，除非你知道自己在比较 null/undefined（`x == null` 同时检查 null 和 undefined）

> 答案参考：[../JavaScript/type-coercion.md](../JavaScript/type-coercion.md)

---

### Q8: 浮点数精度问题

> ⭐⭐⭐ | 难度：中高级
> 🏷️ 概念题

**题目**：为什么 `0.1 + 0.2 !== 0.3`？如何解决 JS 中的浮点数精度问题？项目中如何处理金额计算？

**考察点**：
- IEEE 754 双精度浮点数标准
- 十进制小数转二进制的无限循环问题
- 解决方案：`Number.EPSILON` 误差容限
- 第三方库（big.js、decimal.js）实现任意精度
- 业务常见做法：金额以"分"为单位存储，避免小数运算

**追问预测**：
- "怎么判断两个浮点数相等" → `Math.abs(a - b) < Number.EPSILON`——不用 ===
- "项目中怎么处理金额" → 乘以 100 用分做单位、用 big.js/Decimal 库、后端用 decimal 类型
- "toFixed 的坑" → 银行家舍入——四舍六入五成双。不同浏览器行为可能不同


**30秒答**：JS 用 IEEE754 双精度存储——0.1+0.2 二进制无限循环导致精度丢失。解决：转整数计算、toFixed 格式化、或用 big.js/Decimal 库。面试说清"二进制不能精确表示十进制小数"就够了。

> 答案参考：[../JavaScript/type-coercion.md](../JavaScript/type-coercion.md)

---

## 原型与面向对象（5 题）

### Q9: 原型链 + instanceof 原理

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 概念题

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

**追问预测**：
- "prototype 和 __proto__ 的区别" → prototype 是函数属性（构造函数），__proto__ 是对象属性（实例指向原型）
- "怎么实现继承" → 寄生组合继承：Child.prototype = Object.create(Parent.prototype)
- "class 和 prototype 继承的关系" → class 是语法糖——底层还是 prototype 链


**30秒答**：每个对象都有 __proto__ 指向原型，原型又有自己的原型——串成原型链。函数才有 prototype——new 出来的对象 __proto__ 指向函数的 prototype。instanceof 就是顺着 __proto__ 找 prototype。class 本质是语法糖。

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)
> 🎤 回答稿：[../面试回答/JavaScript/prototype-chain.md](../面试回答/JavaScript/prototype-chain.md)
> 延伸：[../JavaScript/new.md](../JavaScript/new.md)

---

### Q10: new 操作符的执行过程

> ⭐⭐⭐⭐ | 难度：中级
> 🏷️ 概念题

**题目**：请描述 `new` 操作符做了什么，并手写一个 `_new` 函数模拟 `new` 的行为。

**考察点**：
- 创建空对象 + 绑定原型
- 执行构造函数并绑定 `this`
- 构造函数返回值判断（引用类型 vs 基本类型）
- `new` 优先级 > 隐式绑定

**追问预测**：
- "new 一个构造函数返回对象会怎样" → 如果 return 引用类型——new 返回那个对象而不是 this
- "new 的优先级为什么高于 bind" → new 会创建新对象——绑定 this 到新对象优先于 bind 的绑定
- "不用 new 调用构造函数怎么检测" → `new.target` 是否等于构造函数——配合 Object.create 做安全模式


**30秒答**：new 做四步——创建空对象→设 __proto__ 指向构造函数 prototype→执行构造函数绑定 this→返回对象（构造函数不 return 对象的话）。面试常问：return 一个对象，new 就返回那个对象。

> 答案参考：[../JavaScript/new.md](../JavaScript/new.md)
> 延伸：[../手写题/new.md](../手写题/new.md)
> 🎤 回答稿：[../面试回答/JavaScript/new-operator.md](../面试回答/JavaScript/new-operator.md)

---

### Q11: JS 继承方式全对比

> ⭐⭐⭐⭐ | 难度：中高级
> 🏷️ 对比题

**题目**：JS 有哪些继承方式？请写出原型链继承、构造函数继承、组合继承、寄生组合继承、ES6 class extends 的代码，并对比优缺点。为什么寄生组合继承是最优解？

**考察点**：
- 原型链继承：`Child.prototype = new Parent()`——共享引用类型缺陷
- 构造函数继承：`Parent.call(this)`——无法继承原型方法
- 组合继承：call + prototype = new Parent()——调两次父类构造函数
- 寄生组合继承：call + `Object.create(Parent.prototype)`——最优
- ES6 class extends：语法糖，底层仍是寄生组合 + 静态属性继承

**30秒答**：6 种方式。原型链共享引用、构造函数无法继承原型、组合继承调两次、寄生组合最优——call 继承实例属性 + Object.create 继承原型。ES6 class 是寄生组合的语法糖——多了 `Child.__proto__ === Parent` 静态继承。

**追问预测**：
- "为什么寄生组合是最优的" → 只调一次父类构造函数，不引入多余的父类实例属性在原型上
- "class extends 和寄生组合有什么区别" → 本质相同，class 多了静态属性继承（`Child.__proto__ === Parent`）和内置类继承支持（`class MyArray extends Array`）

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)

---

### Q12: Object.defineProperty vs Proxy

> ⭐⭐⭐⭐ | 难度：中级
> 🏷️ 对比题

**题目**：`Object.defineProperty` 和 `Proxy` 有什么区别？为什么 Vue3 从 defineProperty 迁移到了 Proxy？

**考察点**：
- defineProperty：劫持对象已有属性——新增/删除属性无感知，需 $set/$delete
- Proxy：代理整个对象——13 种拦截操作，包括新增/删除/数组索引/for...in
- 性能：Proxy 在大量属性场景下更优（不需要递归遍历每个属性）
- 兼容性：Proxy 不支持 IE，defineProperty 支持 IE9+

**30秒答**：defineProperty 只监听已有属性的 get/set——新增/删除属性无感知、数组索引变更无感知、需要递归遍历每个属性。Proxy 代理整个对象——所有 13 种操作全拦截、新增删除数组变更全捕获、惰性不递归。Vue3 用 Proxy 解决了 Vue2 响应式的 3 大缺陷——数组、动态属性、性能。

**追问预测**：
- "Proxy 的缺点" → IE 完全不支持、Proxy 对象不等于原对象（`proxy !== target`）、嵌套对象只在访问时才代理（延迟但初次访问慢于 defineProperty 的全量递归）
- "defineProperty 能监听数组吗" → 可以劫持数组索引但性能差——而且 push/pop 等修改方法不会触发 setter

> 答案参考：[../Vue3/reactivity.md](../Vue3/reactivity.md)
> 🎤 回答稿：[../面试回答/JavaScript/defineproperty-proxy.md](../面试回答/JavaScript/defineproperty-proxy.md)

---

### Q13: class 与 ES5 构造函数的区别

> ⭐⭐⭐ | 难度：中级
> 🏷️ 对比题

**题目**：ES6 的 `class` 和 ES5 的构造函数写法有什么区别？`class` 的本质是什么？

**考察点**：
- `class` 本质是语法糖，底层仍是原型继承
- `class` 声明不会提升（有 TDZ）
- `class` 内部自动使用严格模式
- `class` 的方法不可枚举，构造函数原型方法可枚举
- `class` 必须用 `new` 调用，构造函数可普通调用
- `extends` 和 `super` 的实现原理

**追问预测**：
- "class 私有字段怎么声明" → `#field`——硬私有。TypeScript 的 `private` 只是编译时检查
- "extends 做了什么" → 设置 prototype 链 + `super()` 调用父类构造函数
- "static 方法和实例方法的区别" → static 在类上、实例方法在 prototype 上


**30秒答**：class 是 prototype 的语法糖。区别：class 必须 new、内部自动严格模式、方法不可枚举、有 TDZ。extends 同时设置了 constructor.prototype 和 __proto__ 两条继承链——比 ES5 寄生组合继承更简洁。

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)
> 延伸：[../JavaScript/new.md](../JavaScript/new.md)

---

## 异步编程（6 题）

### Q14: Promise 执行顺序

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 输出题

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

**30秒答**：先同步后异步——new Promise里的代码同步执行，.then回调进微任务队列。当前宏任务跑完→清空全部微任务→再取下一个宏任务。1 4 7 5 6 2 3 这个输出顺序就是"同步→微→宏"的体现。
**追问预测**：
- "setTimeout(fn,0) 换成 0 一样吗" → 0 是最小延迟，嵌套 5 层后强制 4ms
- "requestAnimationFrame 加进来顺序怎么变" → rAF 在渲染前执行，既不是宏也不是微任务
- "Node.js Event Loop 结果一样吗" → 不同——Node 有 6 阶段 libuv 循环

> 答案参考：[../JavaScript/promise.md](../JavaScript/promise.md)
> 延伸：[../JavaScript/event-loop.md](../JavaScript/event-loop.md)
> 🎤 回答稿：[../面试回答/JavaScript/promise.md](../面试回答/JavaScript/promise.md)

---

### Q15: Event Loop 浏览器 vs Node

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 概念题

**题目**：请详细描述浏览器 Event Loop 机制，并与 Node.js 的 Event Loop 对比有什么区别？

**考察点**：
- 浏览器中宏任务和微任务的完整分类
- 渲染时机（requestAnimationFrame）在 Event Loop 中的位置
- Node.js 中 6 个阶段的执行顺序
- `process.nextTick` vs `Promise.then` 的执行优先级
- Node 11+ 版本对微任务的修改

**追问预测**：
- "Node.js Event Loop 和浏览器有什么区别" → Node 有 6 个阶段（timer/poll/check 等），浏览器只有宏/微两级
- "process.nextTick 在哪个阶段" → 每个阶段之间执行——优先级高于 Promise.then
- "requestAnimationFrame 在 Event Loop 中吗" → 在渲染前——既不是宏也不是微任务


**30秒答**：JS 单线程靠 Event Loop 调度——同步代码执行完→清空微任务(Promise.then/MutationObserver)→取一个宏任务(setTimeout/事件)→再清空微→可能渲染→循环。微任务优先级高于宏任务。

> 答案参考：[../JavaScript/event-loop.md](../JavaScript/event-loop.md)
> 🎤 回答稿：[../面试回答/JavaScript/event-loop.md](../面试回答/JavaScript/event-loop.md)
> 延伸：[../工程化/Node/node-event-loop.md](../工程化/Node/node-event-loop.md)
> 🎤 回答稿：[../面试回答/JavaScript/promise.md](../面试回答/JavaScript/promise.md)

---

### Q16: async/await + Promise 混合输出题

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 输出题

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

**30秒答**：async 函数返回 Promise，await 等 Promise settle 后继续——await 后面的代码相当于 .then 回调，作为微任务执行。try/catch 可以替代 .catch——代码读起来像同步。
**追问预测**：
- "async 函数的返回值是什么" → 永远是 Promise——返回普通值自动用 Promise.resolve 包装
- "await 后面的代码什么时候执行" → 作为微任务——在当前同步代码执行完后
- "forEach 里 await 为什么不等" → forEach 回调不会等待返回的 Promise——用 for...of
- "多个无依赖的 await 怎么优化" → 逐个 await 会串行执行，是性能问题——先同时发起拿到 Promise，再 Promise.all 并行等待

> 答案参考：[../JavaScript/async-await.md](../JavaScript/async-await.md)
> 延伸：[../JavaScript/promise.md](../JavaScript/promise.md)
> 🎤 回答稿：[../面试回答/JavaScript/async-await.md](../面试回答/JavaScript/async-await.md)

---

### Q17: Promise.all / allSettled / any / race 对比
> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 对比题

**题目**：Promise.all、allSettled、any、race 有什么区别？各适用什么场景？请手写实现 `Promise.all` 和 `Promise.race`。

**考察点**：
- all：全部成功才 resolve，一个失败就 reject。场景：批量请求——一个失败全停
- allSettled：等全部 settle（不管成败），返回 `{status, value/reason}[]`。场景：批量操作——部分失败不影响
- race：第一个 settle（不管成败）的结果。场景：超时控制——谁快用谁
- any：第一个成功的，全失败抛 AggregateError。场景：多 CDN 降级——哪个快用哪个
- 共同点：都接收 Promise 数组，返回 Promise

**30秒答**：all 全成功才 resolve/一个失败就 reject。allSettled 等全部 settle 不管成败。race 取第一个 settle 的结果。any 取第一个成功的——全失败才抛 AggregateError。场景：all 批量请求；race 超时控制；any 多 CDN 降级。
**追问预测**：
- "all 一个失败，其他请求还在跑吗" → 还在跑——Promise 创建后无法取消
- "any 和 race 的本质区别" → race 看谁先 settle（不管成败），any 看谁先成功

> 📖 答案参考：[Promise 原理](../JavaScript/promise.md)
> 🎤 回答稿：[Promise 面试回答](../面试回答/JavaScript/promise.md)
> ✍️ 手写参考：[Promise.all / allSettled / any / race](../手写题/promise-static.md)

---

### Q18: Promise 并发调度器

> ⭐⭐⭐⭐ | 难度：高级
> 🏷️ 手写题

**题目**：实现一个 `PromiseScheduler` 类，能控制 Promise 的并发执行数量。如传入 10 个请求函数，每次最多并发 3 个，一个完成立即启动下一个，直到全部完成。

**考察点**：
- 异步流程控制——不依赖第三方库实现并发限制
- Promise 链式调用 + 队列管理
- `Promise.race` 或递归驱动的并发窗口滑动
- 错误处理——单个失败是否影响其他任务

**30秒答**：维护一个执行队列和当前并发计数。初始启动 N 个任务，每个任务完成后从队列取下一个。核心是递归驱动——`run()` 函数：while 当前并发 < 上限 且 队列非空 → 并发+1 → 执行任务 → .finally 并发-1 → 递归 run()。

**追问预测**：
- "单个任务失败了怎么处理" → 取决于场景——批量上传失败一个不影响其他的用 catch 吞掉继续；全成功才 resolve 的用 all 逻辑
- "怎么获取每个任务的结果" → 返回 Promise.all 或维护结果数组按索引填入

> 🎤 回答稿：[../面试回答/JavaScript/promise-scheduler.md](../面试回答/JavaScript/promise-scheduler.md)

---

### Q19: AJAX / fetch 封装

> ⭐⭐⭐ | 难度：中级
> 🏷️ 手写题

**题目**：请基于 `fetch` 封装一个请求函数，支持超时控制、请求取消、失败重试。fetch 相比 XMLHttpRequest 有哪些核心区别？

**考察点**：
- fetch 基于 Promise——Response 对象的 `.json()` / `.text()` / `.blob()`
- fetch 不 reject 非 2xx 状态码——需要手动 `if (!res.ok) throw`
- 取消请求：`AbortController`——`fetch(url, { signal })` + `controller.abort()`
- 超时控制：`AbortController` + `setTimeout`，或原生 `AbortSignal.timeout(ms)`
- 失败重试：循环/递归包装——只对网络错误和 5xx 重试，配合延迟退避
- 历史对比：XHR 基于事件回调，fetch 是它的 Promise 化现代替代

**30秒答**：fetch 基于 Promise——res.json() 解析响应体。关键坑：fetch 不 reject HTTP 错误状态码（404/500），只在网络层错误才 reject——必须手动检查 res.ok。取消用 AbortController——signal 传给 fetch，controller.abort() 中断；超时就是 AbortController + setTimeout，新环境可直接用 AbortSignal.timeout。重试用循环包装——失败延迟重发，只重试网络错误和 5xx。XHR 是事件回调时代的方案，如今只作历史对比。

**追问预测**：
- "fetch 为什么 404 不 reject" → fetch 只在网络层错误（无法连接/DNS 失败）时 reject。HTTP 状态码是应用层——404 也是成功的 HTTP 响应
- "AbortController 可以取消已发出的请求吗" → 浏览器会断开连接——但服务端可能已经收到并处理了

> 答案参考：[../网络/fetch-api.md](../网络/fetch-api.md)

---

## 手写实现（7 题）

### Q20: 手写 bind / call / apply

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 手写题

**题目**：请手写实现 `Function.prototype.bind`，并说明 bind 和 call/apply 的区别。

**考察点**：
- 显示绑定 this 的三种方式及差异
- bind 返回新函数的特性（柯里化基础）
- 原型链关系处理（`new` 操作符场景）
- 参数合并逻辑

**追问预测**：
- "bind 返回的函数还能改 this 吗" → 不能——再 bind 无效。new 的优先级高于 bind
- "call 和 apply 除了传参还有什么区别" → 完全相同——只是传参方式不同。call 逐个、apply 数组
- "箭头函数能用 call/bind 吗" → 不能——箭头函数没有自己的 this，call/bind 对它无效


**30秒答**：bind 返回一个永久绑定了 this 的新函数。call 和 apply 的区别只在传参——call 逐个传、apply 数组传。两个关键点：bind 返回的函数再 bind 无效，new 的优先级高于 bind。

> 答案参考：[../JavaScript/call-apply-bind.md](../JavaScript/call-apply-bind.md)
> 🎤 回答稿：[../面试回答/JavaScript/this-bind.md](../面试回答/JavaScript/this-bind.md)
> 延伸：[../手写题/bind-call-apply.md](../手写题/bind-call-apply.md)

---

### Q21: 手写深拷贝

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 手写题

**题目**：请手写一个 `deepClone` 函数，要求支持对象、数组、Date、RegExp、Map、Set，并处理循环引用的场景。

**考察点**：
- 原生 `structuredClone()`——2026 面经首选答案：支持循环引用、Map/Set/Date，但不支持函数、DOM 节点和原型链
- 递归遍历对象/数组
- `typeof` 的类型判断缺陷
- `WeakMap` 解决循环引用
- 特殊对象（Date / RegExp / Map / Set）的处理
- `Object.getOwnPropertyDescriptors` 保留属性描述符

**30秒答**：先答原生 `structuredClone()`——支持循环引用、Map/Set/Date，但函数、DOM 节点、原型链拷不了，所以面试仍要手写。手写核心：递归遍历——基本类型直接返回，对象创建新容器递归拷贝。三个难点：循环引用用 WeakMap 记录已拷贝对象、Date/RegExp 用 instanceof 判断重新构造、Symbol 用 getOwnPropertySymbols 获取。
**追问预测**：
- "怎么处理循环引用" → WeakMap 记录已拷贝对象，遇到重复引用直接返回缓存
- "Date/RegExp/Map/Set 怎么拷贝" → instanceof 判断类型，调用对应构造函数重新创建
- "怎么拷贝 Symbol 属性" → Object.getOwnPropertySymbols + Reflect.ownKeys

> 答案参考：[../JavaScript/deep-clone.md](../JavaScript/deep-clone.md)
> 🎤 回答稿：[../面试回答/JavaScript/deep-clone.md](../面试回答/JavaScript/deep-clone.md)
> 延伸：[../手写题/deep-clone.md](../手写题/deep-clone.md)

---

### Q22: 防抖与节流

> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 手写题

**题目**：请手写 `debounce` 和 `throttle` 函数，分别说明其使用场景，以及防抖如何实现"立即执行"版本。

**考察点**：
- 防抖（最后一次触发后延迟执行）vs 节流（固定间隔执行）
- 闭包保存定时器的写法
- `debounce` 的 `immediate` 参数（首次立即执行）
- `throttle` 的时间戳实现 vs 定时器实现
- 实际场景：搜索框输入（debounce）、滚动加载（throttle）

**追问预测**：
- "防抖立即执行版本什么时候用" → 按钮点击防重复提交——第一次立即执行，后续点击忽略
- "节流用时间戳和定时器有什么区别" → 时间戳：第一次立即执行；定时器：最后一次延迟执行
- "防抖和节流能互相替代吗" → 不能——防抖等操作停止，节流等时间间隔。场景完全不同


**30秒答**：防抖——连续触发只执行最后一次（搜索框输入）。节流——连续触发按固定频率执行（页面滚动）。核心都是 setTimeout 控制频率。防抖每次重置计时器，节流一段时间内只执行一次。

> 答案参考：[../JavaScript/debounce-throttle.md](../JavaScript/debounce-throttle.md)
> 🎤 回答稿：[../面试回答/JavaScript/debounce-throttle.md](../面试回答/JavaScript/debounce-throttle.md)
> 延伸：[../手写题/debounce-throttle.md](../手写题/debounce-throttle.md)

---

### Q23: 手写 Promise（含链式调用）

> ⭐⭐⭐⭐⭐ | 难度：中高级
> 🏷️ 手写题

**题目**：请按照 Promises/A+ 规范手写一个 Promise，支持 `.then()` 链式调用、`catch`、`finally`、`Promise.resolve`、`Promise.reject`、`Promise.all`、`Promise.race`。

**考察点**：
- Promise 三种状态（pending/fulfilled/rejected）及不可逆
- `.then()` 返回新 Promise 实现链式调用
- 异步执行（`setTimeout` 模拟微任务）
- 发布-订阅模式收集回调
- `Promise.all` 的失败快速返回 vs `Promise.allSettled`

**追问预测**：
- ".then 返回新 Promise 的理念是什么" → 链式调用——每个 then 创建新容器承载返回值，不是修改原有 Promise
- "Promise 构造函数里抛异常会怎样" → 自动被 catch——等价于 reject(error)
- "Promise.resolve 和 new Promise(resolve=>resolve()) 区别" → resolve 对 thenable 对象会递归展开


**30秒答**：构造函数维护三态 pending/fulfilled/rejected——状态不可逆。.then 返回新 Promise——回调返回值决定新 Promise 状态。then 回调异步执行（微任务）。手写核心：状态机 + 回调队列 + then 返回新 Promise。

> 答案参考：[../手写题/promise.md](../手写题/promise.md)
> 🎤 回答稿：[../面试回答/JavaScript/promise.md](../面试回答/JavaScript/promise.md)
> 延伸：[../JavaScript/promise.md](../JavaScript/promise.md)

---

### Q24: 事件委托 / 事件代理

> ⭐⭐⭐⭐ | 难度：中级
> 🏷️ 概念题

**题目**：什么是事件委托？请实现一个通用的委托函数。事件委托的原理是什么？

**考察点**：
- 利用冒泡机制，将子元素事件委托到父元素
- `event.target` 获取实际触发元素
- `matches()` API 做选择器匹配
- 动态添加元素无需重新绑定事件
- 不适合委托的场景：`focus`/`blur` 等不冒泡的事件

**追问预测**：
- "事件委托不适合什么场景" → focus/blur/scroll 等不冒泡的事件——这些事件需要直接绑定
- "e.target 和 e.currentTarget 的区别" → target 是实际点击元素，currentTarget 是绑定监听器的元素
- "怎么在委托中排除某些子元素" → matches() 判断是否匹配选择器——不匹配的忽略


**30秒答**：利用事件冒泡——把监听绑在父元素上，通过 e.target 判断真正被点击的子元素。好处：动态新增子元素无需重新绑定、减少内存占用。不冒泡的事件（focus/blur/scroll）不能委托。

> 答案参考：[../浏览器/dom-event-delegation.md](../浏览器/dom-event-delegation.md)
> 延伸：[../手写题/event-emitter.md](../手写题/event-emitter.md)

---

### Q25: 发布订阅 EventEmitter

> ⭐⭐⭐⭐ | 难度：中级
> 🏷️ 手写题

**题目**：请手写实现一个 EventEmitter（事件总线），支持 `on`、`off`、`once`、`emit` 方法。one 注册的监听器触发一次后自动移除。

**考察点**：
- 事件注册表数据结构——`Map<eventName, Set<handler>>`
- once 用包装函数——触发后自动调用 off
- off 时注意删除空集合
- emit 时复制监听器列表避免"在监听器中移除其他监听器"导致的问题

**30秒答**：events 对象存 `{[name]: Set<fn>}`。on 就 add，emit 就 forEach 执行，off 就 delete。once 用包装函数——触发时先 off 再调原 fn。关键坑：emit 时要复制 Set 再遍历——防止回调里 off 导致遍历中 Set 变化。

**追问预测**：
- "once 怎么实现" → 包一层——`const wrapper = (...args) => { this.off(name, wrapper); fn(...args) }`
- "emit 时为什么要复制 Set" → 防止回调中 off 其他监听器导致当前 Set 在 forEach 中变化——JS 的 Set 在遍历过程中被修改会跳过元素

> ✍️ 手写参考：[EventEmitter / 发布订阅](../手写题/event-emitter.md)

---

### Q26: 函数柯里化 curry

> ⭐⭐⭐ | 难度：中级
> 🏷️ 手写题

**题目**：请实现一个 `curry` 函数，将多参数函数转化为可多次调用的柯里化形式。如 `curry(add)(1)(2)(3)` 和 `curry(add)(1, 2)(3)` 都能正确执行。

**考察点**：
- 闭包保存已收集的参数
- 参数个数达到原函数形参数量时执行，否则返回新函数
- 与偏函数（partial application）的区别

**30秒答**：curry 收集每次调用的参数，累计达到原函数参数个数时调用 fn.apply(this, args)，否则返回新函数继续收集。核心：`fn.length` 判断参数个数、闭包持有 args 数组。

**追问预测**：
- "curry 和 partial application 的区别" → curry 每次传一个参数直到全部传入；partial 一次传部分参数立即返回固定了部分参数的新函数
- "fn.length 的局限性" → 不包含默认参数和剩余参数——`function(a, b=1){}` 的 length 是 1

---

## 数组与数据结构（6 题）

### Q27: for...in vs for...of
> ⭐⭐⭐⭐ | 难度：初级-中级

**题目**：`for...in` 和 `for...of` 有什么区别？`for...of` 如何遍历普通对象？如何让自定义对象支持 `for...of`？

**考察点**：
- `for...in` 遍历可枚举属性（含原型链），`for...of` 遍历可迭代对象的值
- `Symbol.iterator` 迭代器协议
- `Object.keys()` / `Object.values()` / `Object.entries()` 遍历对象
- 如何给自定义对象实现 `[Symbol.iterator]` 方法

**追问预测**：
- "for...in 会遍历原型链吗" → 会——遍历所有可枚举属性包括原型。用 hasOwnProperty 过滤
- "for...of 能遍历对象吗" → 不能——需要实现 Symbol.iterator。用 Object.entries/keys/values
- "Object.keys 和 for...in 的区别" → keys 只返回自身可枚举；for...in 包含原型链


**30秒答**：for...in 遍历可枚举属性包括原型链——适合对象。for...of 遍历可迭代对象的值——适合数组/Map/Set/字符串。Object.keys/values/entries 遍历对象自身属性不碰原型。自定义迭代器实现 Symbol.iterator。

> 答案参考：[../JavaScript/for-of-for-in.md](../JavaScript/for-of-for-in.md)

---

### Q28: 数组去重方法
> ⭐⭐⭐⭐ | 难度：初级
> 🏷️ 概念题

**题目**：数组去重有哪些方法？各有什么优缺点？

**30秒答**：最简单 [...new Set(arr)]——一行搞定基本类型。对象数组按 id 去重用 Map——[...new Map(arr.map(v=>[v.id,v])).values()]——O(n)保持顺序。Set 去重对象不行——比较的是引用。
**追问预测**：
- "Set 去重对象数组为什么不行" → Set 比较引用——`{a:1} !== {a:1}`
- "怎么按 id 去重对象数组" → `[...new Map(arr.map(v => [v.id, v])).values()]`

**回答框架**：
1. `[...new Set(arr)]` —— 最简洁，但只对基本类型有效（对象比较引用）
2. `filter + indexOf` —— 兼容性好，O(n²) 性能差
3. `reduce + includes` —— 逻辑清晰，也是 O(n²)
4. 对象数组按某字段去重：`Map` 以该字段为 key —— O(n)

> 📖 答案参考：[Set / Map / WeakMap](../JavaScript/set-map-weakmap.md)

---

### Q29: LRU 缓存

> ⭐⭐⭐⭐ | 难度：中高级
> 🏷️ 手写题

**题目**：请实现一个 LRU（Least Recently Used）缓存类，支持 `get(key)` 和 `put(key, value)` 操作，时间复杂度 O(1)。超出容量时淘汰最久未使用的数据。

**考察点**：
- Hash + 双向链表——O(1) 查找 + O(1) 移动节点
- 虚拟头尾节点简化边界处理
- get/put 都将节点移到链表头部（最新）
- 超出容量时删除尾部节点（最旧）

**30秒答**：Map 存 key→node 实现 O(1) 查找，双向链表维护访问顺序。每次 get/put 把节点移到头部，put 超出容量时删尾部节点。虚构头尾两个哨兵节点——`addToHead` 和 `removeNode` 不用判空。前端场景：KeepAlive 组件缓存就是 LRU。

**追问预测**：
- "为什么不用数组" → 数组的 unshift/splice 是 O(n)，LRU 要求 O(1)
- "为什么需要双向链表" → 单向链表删节点需要前驱——O(n)。双向 O(1)
- "KeepAlive 是怎么用 LRU 的" → Vue3 的 KeepAlive 用 LRU 算法管理组件缓存——超出 max 属性时淘汰最久未访问的组件

> ✍️ 手写参考：[LRU 缓存](../手写题/lru-cache.md)

---

### Q30: Map vs WeakMap / Set vs WeakSet

> ⭐⭐⭐ | 难度：中级
> 🏷️ 对比题

**题目**：Map 和 WeakMap 有什么区别？WeakMap 有哪些典型使用场景？

**考察点**：
- `Map` 的 key 可以是任何类型，`WeakMap` 的 key 必须是对象
- `WeakMap` 对 key 的引用是弱引用，不影响 GC
- `WeakMap` 不可迭代、没有 `size` 属性
- 使用场景：DOM 节点关联的元数据、私有属性实现、缓存系统
- `WeakSet` 只能存对象，弱引用

**追问预测**：
- "WeakMap 为什么不可迭代" → key 是弱引用随时可能被 GC——没有稳定的大小和顺序
- "Map 和 Object 怎么选" → Map key 任意类型、保持插入顺序、有 size、频繁增删更快
- "WeakMap 的私有属性实现" → 用 WeakMap 存储私有数据——闭包外部无法访问 WeakMap key


**30秒答**：Map key 可以是任意类型且保持插入顺序；WeakMap key 只能是对象且是弱引用——key 被回收后 value 自动 GC。WeakMap 不可迭代、没有 size——因为 key 随时可能被 GC。场景：DOM 节点关联数据、私有属性。

> 答案参考：[../JavaScript/set-map-weakmap.md](../JavaScript/set-map-weakmap.md)

---

### Q31: 数组扁平化 flat

> ⭐⭐⭐ | 难度：中级
> 🏷️ 手写题

**题目**：请用至少 3 种方法实现数组扁平化（flatten），并说明各种方法的优缺点。如何控制扁平化的深度？

**考察点**：
- `Array.prototype.flat(depth)` 原生方法
- 递归 + concat/reduce——最直观的实现
- `toString().split(',')`——仅适用于数字/字符串数组的取巧方法
- 迭代 + 栈——避免递归爆栈
- `[].concat(...arr)` 的一层替代

**30秒答**：原生 `arr.flat(Infinity)` 一行搞定。手写版：递归 `[].concat(...arr.map(v => Array.isArray(v) ? flatten(v) : v))`。迭代版用栈：while 栈非空 pop 出来——是数组展开 push 回栈，不是数组 push 结果。栈版不会递归爆栈。

**追问预测**：
- "怎么控制深度" → 递归时传 depth-1，depth 为 0 时直接 push
- "flat 的兼容性" → ES2019 引入。旧环境用 polyfill

---

### Q32: 迭代器协议 / Symbol.iterator / Generator

> ⭐⭐⭐ | 难度：中级
> 🏷️ 概念题

**题目**：什么是迭代器协议？如何让一个普通对象支持 `for...of` 遍历？Generator 函数和迭代器有什么关系？

**考察点**：
- 迭代器协议：对象有 `next()` 方法，返回 `{ value, done }`
- 可迭代协议：对象有 `Symbol.iterator` 方法——返回迭代器
- for...of 调用对象的 Symbol.iterator 获取迭代器
- Generator 函数自动返回迭代器对象——`yield` 语法糖

**30秒答**：`Symbol.iterator` 方法返回 `{ next: () => { value, done } }`。实现了这个接口，对象就能被 for...of 遍历。Generator 函数内部用 yield 暂停，调用后自动返回迭代器——比手写 next 更简洁。`[...obj]`、`Array.from(obj)`、`for...of obj` 都依赖 Symbol.iterator。

**追问预测**：
- "for...of 和 for...in 的区别" → for...of 遍历值（走迭代器协议），for...in 遍历键（包括原型链上的可枚举属性）
- "Generator 的返回值是什么" → 迭代器对象——有 next/return/throw 三个方法

> 答案参考：[../JavaScript/generator-iterator.md](../JavaScript/generator-iterator.md)
