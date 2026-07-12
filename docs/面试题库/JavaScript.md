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

### Q1: Promise 执行顺序 | 输出题输出题

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

**30秒答**：先同步后异步——new Promise里的代码同步执行，.then回调进微任务队列。当前宏任务跑完→清空全部微任务→再取下一个宏任务。1 4 7 5 6 2 3 这个输出顺序就是"同步→微→宏"的体现。
**追问预测**：
- "setTimeout(fn,0) 换成 0 一样吗" → 0 是最小延迟，嵌套 5 层后强制 4ms
- "requestAnimationFrame 加进来顺序怎么变" → rAF 在渲染前执行，既不是宏也不是微任务
- "Node.js Event Loop 结果一样吗" → 不同——Node 有 6 阶段 libuv 循环

> 答案参考：[../JavaScript/promise.md](../JavaScript/promise.md)
> 延伸：[../JavaScript/event-loop.md](../JavaScript/event-loop.md)
> 🎤 回答稿：[../面试回答/JavaScript/promise.md](../面试回答/JavaScript/promise.md)

---

### Q2: 手写 bind | 手写题 / call / apply
> ⭐⭐⭐⭐⭐ | 难度：中级

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
> 延伸：[../手写题/bind-call-apply.md](../手写题/bind-call-apply.md)

---

### Q3: 闭包 + setTimeout | 输出题 输出题

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

**30秒答**：闭包 = 函数能记住并访问它被创建时所在的作用域——即使外层函数已经执行完了。for + var + setTimeout 全输出 5 是经典题——var 是函数作用域，所有回调共享同一个 i；用 let 或 IIFE 创建独立作用域解决。
**追问预测**：
- "let 为什么能解决 for+setTimeout" → let 块作用域，每次迭代创建新绑定，闭包引用独立的 i
- "不用 let 怎么解决" → IIFE 包一层创建独立作用域
- "闭包会导致内存泄漏吗" → 不会——除非你把大对象挂在闭包引用链上长期不释放

> 答案参考：[../JavaScript/closure.md](../JavaScript/closure.md)
> 🎤 回答稿：[../面试回答/JavaScript/closure.md](../面试回答/JavaScript/closure.md)

---

### Q4: this 指向判断 | 概念题

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

**30秒答**：this 由调用方式决定——new 绑定→call/apply/bind 显式→对象.方法 隐式→默认(window/undefined)。箭头函数没自己的 this，从外层词法继承，call/bind 对它无效。
**追问预测**：
- "call 和 apply 的区别" → 传参方式——call 逐个、apply 数组，功能完全相同
- "箭头函数的 this 怎么确定" → 从定义位置外层词法继承，call/bind 对箭头函数无效
- "严格模式下 this 是什么" → 默认绑定为 undefined（非严格为 window）

> 答案参考：[../JavaScript/this.md](../JavaScript/this.md)
> 🎤 回答稿：[../面试回答/JavaScript/this-bind.md](../面试回答/JavaScript/this-bind.md)

---

### Q5: Event Loop | 概念题 浏览器 vs Node
> ⭐⭐⭐⭐⭐ | 难度：中级

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

### Q6: 手写深拷贝 | 手写题

> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请手写一个 `deepClone` 函数，要求支持对象、数组、Date、RegExp、Map、Set，并处理循环引用的场景。

**考察点**：
- 递归遍历对象/数组
- `typeof` 的类型判断缺陷
- `WeakMap` 解决循环引用
- 特殊对象（Date / RegExp / Map / Set）的处理
- `Object.getOwnPropertyDescriptors` 保留属性描述符

**30秒答**：递归遍历对象——基本类型直接返回，对象创建新容器递归拷贝。三个难点：循环引用用 WeakMap 记录已拷贝对象、Date/RegExp 用 instanceof 判断重新构造、Symbol 用 getOwnPropertySymbols 获取。
**追问预测**：
- "怎么处理循环引用" → WeakMap 记录已拷贝对象，遇到重复引用直接返回缓存
- "Date/RegExp/Map/Set 怎么拷贝" → instanceof 判断类型，调用对应构造函数重新创建
- "怎么拷贝 Symbol 属性" → Object.getOwnPropertySymbols + Reflect.ownKeys

> 答案参考：[../JavaScript/deep-clone.md](../JavaScript/deep-clone.md)
> 延伸：[../手写题/deep-clone.md](../手写题/deep-clone.md)

---

### Q7: async/await | 输出题 + Promise 混合输出题

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

**30秒答**：async 函数返回 Promise，await 等 Promise settle 后继续——await 后面的代码相当于 .then 回调，作为微任务执行。try/catch 可以替代 .catch——代码读起来像同步。
**追问预测**：
- "async 函数的返回值是什么" → 永远是 Promise——返回普通值自动用 Promise.resolve 包装
- "await 后面的代码什么时候执行" → 作为微任务——在当前同步代码执行完后
- "forEach 里 await 为什么不等" → forEach 回调不会等待返回的 Promise——用 for...of

> 答案参考：[../JavaScript/async-await.md](../JavaScript/async-await.md)
> 延伸：[../JavaScript/promise.md](../JavaScript/promise.md)

---

### Q8: 原型链 | 概念题 + instanceof 原理
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

**追问预测**：
- "prototype 和 __proto__ 的区别" → prototype 是函数属性（构造函数），__proto__ 是对象属性（实例指向原型）
- "怎么实现继承" → 寄生组合继承：Child.prototype = Object.create(Parent.prototype)
- "class 和 prototype 继承的关系" → class 是语法糖——底层还是 prototype 链


**30秒答**：每个对象都有 __proto__ 指向原型，原型又有自己的原型——串成原型链。函数才有 prototype——new 出来的对象 __proto__ 指向函数的 prototype。instanceof 就是顺着 __proto__ 找 prototype。class 本质是语法糖。

> 答案参考：[../JavaScript/prototype-chain.md](../JavaScript/prototype-chain.md)
> 🎤 回答稿：[../面试回答/JavaScript/prototype-chain.md](../面试回答/JavaScript/prototype-chain.md)
> 延伸：[../JavaScript/new.md](../JavaScript/new.md)

---

### Q9: var | 对比题 / let / const 区别 + 变量提升
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

**追问预测**：
- "let 和 var 在 for 循环里有什么区别" → let 块作用域每次迭代创建新绑定；var 函数作用域共享一个变量
- "暂时性死区什么时候触发" → 在声明前访问 let/const 变量——从块开始到声明之间的区间
- "const 对象属性能改吗" → 能——const 锁的是引用不是值。不能重新赋值整个变量


**30秒答**：var 函数作用域/可重复声明/有变量提升；let 块作用域/不可重复声明/有 TDZ；const 块作用域/不可重复声明/不可重新赋值（但对象属性可改）。现在默认用 const——需要改的用 let——不用 var。

> 答案参考：[../JavaScript/closure.md](../JavaScript/closure.md)
> 🎤 回答稿：[../面试回答/JavaScript/closure.md](../面试回答/JavaScript/closure.md)

---

### Q10: 防抖 | 手写题与节流
> ⭐⭐⭐⭐ | 难度：中级

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

### Q11: new 操作符 | 概念题的执行过程
> ⭐⭐⭐⭐ | 难度：中级

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

---

### Q12: JS 数据类型 | 概念题 + 类型检测
> ⭐⭐⭐⭐ | 难度：初级-中级

**题目**：JS 中有哪些数据类型？`typeof` 和 `Object.prototype.toString.call()` 各有什么优缺点？如何判断一个变量是数组？

**考察点**：
- 基本类型（7种） vs 引用类型
- `typeof null === 'object'` 的历史原因
- `instanceof` 的跨 iframe 问题
- 安全类型检测：`Object.prototype.toString.call(value).slice(8, -1)`
- `Array.isArray()` 的实现原理

**追问预测**：
- "typeof null 为什么是 object" → JS 历史 bug——null 的类型标签是 0，和对象标签相同
- "怎么判断数组" → Array.isArray() 解决 instanceof 的跨 iframe 问题
- "bigint 和 number 能混算吗" → 不能——TypeError。需要显式转换：BigInt(num) 或 Number(big)


**30秒答**：基本类型 7 种——string/number/boolean/undefined/null/symbol/bigint。引用类型——Object/Array/Function。typeof null === object 是历史 bug。最可靠判断用 Object.prototype.toString.call。

> 答案参考：[../JavaScript/type-coercion.md](../JavaScript/type-coercion.md)

---

### Q13: 垃圾回收 | 概念题机制
> ⭐⭐⭐⭐ | 难度：中高级

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

### Q14: for...in vs for...of
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

### Q15: 浮点数 | 概念题精度问题
> ⭐⭐⭐ | 难度：中高级

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

### Q16: 手写 Promise | 手写题（含链式调用）
> ⭐⭐⭐⭐⭐ | 难度：中高级

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

### Q17: 事件委托 | 概念题 / 事件代理
> ⭐⭐⭐⭐ | 难度：中级

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

### Q18: class | 对比题 与 ES5 构造函数的区别
> ⭐⭐⭐ | 难度：中级

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

### Q19: Map vs WeakMap | 对比题 / Set vs WeakSet
> ⭐⭐⭐ | 难度：中级

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

### Q20: Promise.all / allSettled / any / race 对比
> ⭐⭐⭐⭐⭐ | 难度：中级
> 🏷️ 对比题

**题目**：Promise.all、allSettled、any、race 有什么区别？各适用什么场景？

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

### Q21: null 和 undefined 的区别
> ⭐⭐⭐⭐ | 难度：初级
> 🏷️ 对比题

**题目**：null 和 undefined 有什么区别？`typeof null` 为什么返回 `"object"`？

**30 秒版**：undefined 是"没赋值"（变量声明了没初始化、参数没传、对象属性不存在），null 是"空值"（主动设为空）。`typeof null === "object"` 是 JS 的历史 bug——null 的类型标签是 0，和对象一样。
**追问预测**：
- "怎么同时判断 null 和 undefined" → `value == null`（宽松等号，null 和 undefined 相等）
- "void 0 是什么" → 返回 undefined，确保不被人重写 undefined 变量影响

**2 分钟版**：区别——1) `undefined == null` 为 true，`===` 为 false；2) Number(null) = 0，Number(undefined) = NaN；3) JSON 序列化 null 保留，undefined 被忽略；4) 函数默认参数只有 undefined 触发，null 不触发

**30秒答**：undefined 是没赋值（变量声明未初始化、参数没传、属性不存在）。null 是主动设的空值。== 下 null 和 undefined 相等，=== 下不等。typeof null === object 是 JS 历史 bug。value == null 同时判断两者。

> 📖 答案参考：[类型转换](../JavaScript/type-coercion.md)

---

### Q22: 数组去重方法
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
