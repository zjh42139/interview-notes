---
title: 一面：JS 基础
description: JavaScript + CSS + 浏览器基础面试模拟，45分钟全流程脚本
category: 模拟面试
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - JavaScript
  - CSS
  - 浏览器
  - 手写
---

# 一面：JS 基础模拟面试（45 分钟）

> 适用对象：3 年中级前端工程师，技术栈 Vue3 + TypeScript + Element Plus
> 难度定位：覆盖 JS 核心基础 + CSS 布局 + 一道手写题，全面考察基础扎实程度

---

## 一、面试开场白（0-5 min）

### 面试官话术

> 面试官：你好，欢迎来参加今天的一面面试。我是今天的前端面试官，主要负责前端技术面的基础考察。接下来大约 45 分钟，我们会围绕 JavaScript 基础、CSS 布局以及一道简单的手写题来展开。过程中如果有不清楚的地方，随时可以跟我确认。放轻松，我们正式开始吧。
>
> 首先，请你做一个简单的自我介绍，大概 2-3 分钟。可以介绍一下你的工作经历、技术栈，以及一个你觉得最值得分享的项目或技术亮点。

### 面试官内心 OS（候选人自我介绍期间）

- 关注候选人表达是否流畅、逻辑是否清晰，这能侧面反映沟通能力和技术表达的精准度。
- 留意技术栈描述是否和简历一致：3 年经验是否扎实，Vue3 + TS 使用深度如何，有没有真正参与过复杂项目的开发。
- 项目描述中能否说出"我做了什么、解决了什么问题、取得了什么成果"，而不是泛泛而谈"我们团队做了 xxx"。前者是有独立思考的工程师，后者可能是搭便车的。
- 如果候选人提到"最骄傲的项目"，观察他/她是否真正有技术热情，眼睛会不会亮。技术热情是最难伪装的软素质。
- 同时快速扫一眼简历，圈出可以追问的亮点或疑点（如"写过脚手架"、"做过性能优化 30%+"），为后续提问做储备。

### 自我介绍后的过渡

> 面试官：好的，感谢你的介绍。刚才你提到了使用 Vue3 + TypeScript 做项目，那我们今天先从 JavaScript 基础开始聊起，看看你的底层功底怎么样。

---

## 二、JS 基础深挖（5-20 min）

### Q1：this 指向问题（5-8 min）

#### 面试官话术

> 面试官：我们先来聊一个经典问题——JavaScript 中的 `this` 指向。我先给你看一段代码，你来分析一下每一处 `console.log` 分别输出什么，以及为什么。

```javascript
// 场景1：全局
console.log(this);

// 场景2：对象方法
const obj = {
  name: 'obj',
  sayName() {
    console.log(this.name);
  },
};
obj.sayName();
const fn = obj.sayName;
fn();

// 场景3：箭头函数
const obj2 = {
  name: 'obj2',
  sayName: () => {
    console.log(this.name);
  },
};
obj2.sayName();

// 场景4：call / apply / bind
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}
const person = { name: 'Alice' };
greet.call(person, 'Hello', '!');
greet.apply(person, ['Hi', '~']);
const boundGreet = greet.bind(person, 'Hey');
boundGreet('.');

// 场景5：class 构造函数
class Person {
  constructor(name) {
    this.name = name;
  }
  getName() {
    console.log(this.name);
  }
}
const p = new Person('Bob');
p.getName();

// 场景6：事件处理（口述即可）
// button.addEventListener('click', function() { console.log(this); });
// button.addEventListener('click', () => { console.log(this); });
```

#### 考点

- `this` 的 5 种绑定规则（默认绑定、隐式绑定、显式绑定、new 绑定、箭头函数绑定）及其优先级。
- 对 `this` 丢失（隐式丢失）的理解——方法赋值给变量后调用会丢失原对象的绑定，退化为默认绑定。
- 箭头函数 `this` 的特殊性：定义时确定，无法被 `call`/`apply`/`bind` 改变。
- `new` 绑定与显式绑定的优先级对比，以及 `bind` 返回函数被 `new` 调用时的特殊行为。

#### 预期回答

1. **场景1（全局）**：浏览器环境输出 `window`，Node.js 环境输出 `global`（或 ES Module 中为 `undefined`）。这是默认绑定。
2. **场景2（对象方法）**：`obj.sayName()` 输出 `'obj'`（隐式绑定，this 指向调用者 obj）。`fn()` 输出 `undefined`（非严格模式下输出 `window`），原因是函数引用赋值丢失了隐式绑定，退化为默认绑定——这就是经典的"隐式丢失"。
3. **场景3（箭头函数）**：输出 `undefined`（浏览器中通常没有 `window.name` 属性），也可能输出空字符串。因为箭头函数的 `this` 在定义时确定，指向外层作用域的 `this`（此处为全局/模块作用域），它不拥有自己的 `this`，不继承 obj2 的调用上下文。`obj2.sayName.call({name: 'x'})` 也无法改变它的 this。
4. **场景4（call/apply/bind）**：`call` 输出 `'Hello, Alice!'`，`apply` 输出 `'Hi, Alice~'`，`bind` 输出 `'Hey, Alice.'`。三者都属于显式绑定。`call` 和 `apply` 立即执行（区别仅在于传参方式——逗号分隔 vs 数组），`bind` 返回一个永久绑定了 this 的新函数，且支持柯里化（预置部分参数）。
5. **场景5（class）**：输出 `'Bob'`。`new` 操作符创建一个新对象并将构造函数中的 `this` 指向该新对象。这是 new 绑定。new 绑定的优先级高于显式绑定——即使构造函数上用了 bind，new 时 this 仍然指向新实例。
6. **场景6（事件处理）**：普通函数作为事件处理函数时，`this` 指向绑定的 DOM 元素（当前触发事件的元素）；箭头函数作为事件处理函数时，`this` 指向定义时的外层作用域，不会自动指向 DOM 元素。

**绑定规则优先级总结**：new 绑定 > 显式绑定（call/apply/bind）> 隐式绑定（对象方法调用）> 默认绑定（全局/undefined）。箭头函数是特例——它的 `this` 由外层词法作用域在定义时决定，且一旦确定无法被任何方式改变，因为它内部没有 `[[ThisBinding]]` 机制。

#### 参考答案链接

- [JavaScript/this](../JavaScript/this.md)
- [JavaScript/call-apply-bind](../JavaScript/call-apply-bind.md)

#### 追问方向

**追问1**：箭头函数的 `this` 能通过 `call`/`apply`/`bind` 改变吗？为什么？

> 预期回答：不能。箭头函数没有自己的 `this`，它的 `this` 捕获自定义时所在外层作用域的 `this`。`call`/`apply`/`bind` 对箭头函数无效，因为箭头函数内部没有 `[[ThisBinding]]` 机制，传入的 this 会被直接忽略。举例：
> ```javascript
> const arrow = () => console.log(this);
> const obj = { name: 'test' };
> arrow.call(obj); // 仍然输出 window（或 undefined），不会输出 obj
> ```
> 这个特性使箭头函数非常适合用在回调中（如 `setTimeout`、数组方法的回调），不用担心 this 被意外改变。

**追问2**：手写 `call`/`apply`/`bind` 的核心思路是什么？

> 预期回答：
> - **`call` 的核心思路**：将函数临时挂载到目标对象上作为一个方法，执行后删除。需要处理 `null`/`undefined` 的 this 指向全局，处理参数传递（从第二个参数开始）。
> - **`apply` 与 `call` 类似**，只是参数以数组形式传入，需要处理数组为空的情况。
> - **`bind` 的核心思路**：返回一个新函数，新函数内部使用 `apply` 绑定 this。关键难点：(1) bind 返回的函数可以被 `new` 调用（此时 this 应指向新创建的实例而非绑定的对象）；(2) 需要维护原型链，让新函数的 prototype 指向原函数的 prototype；(3) 支持柯里化——bind 时可以预置部分参数。

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 能说出普通函数指向调用者、箭头函数指向定义时的外层、call/apply/bind 可以改变 this，但说不出优先级或对隐式丢失解释不清，场景2的 fn() 可能会答错 |
| 中级 | 能完整说出 5 种绑定规则及优先级，能准确分析代码中每处的输出并解释原因，对隐式丢失有清晰认识 |
| 高级 | 在中级基础上，能深入解释 this 的实现机制（如 Execution Context 中的 ThisBinding、Reference Record），能手写 call/apply/bind，能说明 bind 返回函数被 new 调用时的 this 优先级特殊处理逻辑 |

#### 过渡语

> 面试官：好的，你对 this 的理解不错。那接下来我们看一个跟作用域和闭包相关的经典题目。

---

### Q2：闭包输出题（8-12 min）

#### 面试官话术

> 面试官：请看下面这段代码，告诉我它会输出什么，并解释原因。

```javascript
for (var i = 1; i <= 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
```

#### 考点

- 闭包的本质：函数 + 函数定义时所在词法环境的引用（变量对象）。
- `var` 的函数作用域特性——没有块级作用域，循环体内外共用一个 `i`。
- 事件循环（Event Loop）：`setTimeout` 回调是宏任务，在主线程同步代码执行完毕后才会被推入执行栈。
- 闭包中捕获的是变量的**引用**（或者说变量对象），而不是值的快照。回调执行时读取的是循环结束后的 `i` 值。

#### 预期回答

输出结果为：每隔约 1 秒输出一个 `6`，共输出 5 个 `6`。

**原因分析**：
1. `var` 声明的 `i` 在全局/函数作用域内，整个 for 循环共用一个 `i` 变量。循环结束时，`i` 变成了 `6`（最后一次 `i++` 之后，`i` 为 6，不满足 `i <= 5` 的条件，循环退出）。
2. `setTimeout` 是异步宏任务，5 个回调被依次放入任务队列，但都不会立即执行。主线程代码（for 循环）先执行完毕，此时 `i` 已经等于 6。
3. 当 5 个回调陆续执行时，它们访问的都是同一个变量 `i`，闭包保存的是对变量 `i` 的引用，不是当时的值，所以都输出 `6`。
4. 每个回调的延迟时间分别为 1s, 2s, 3s, 4s, 5s（`i * 1000` 在每次循环时立即计算并传递给 `setTimeout`），所以 5 个 `6` 的输出间隔约 1 秒。

#### 参考答案链接

- [JavaScript/closure](../JavaScript/closure.md)
- [JavaScript/event-loop](../JavaScript/event-loop.md)

#### 追问方向

**追问1**：如果期望输出 1, 2, 3, 4, 5（每个隔 1 秒），有哪些解决方案？各方案的原理是什么？

> 预期回答（至少说出 3 种）：
>
> 1. **用 `let` 替代 `var`**（最简单）：
>    ```javascript
>    for (let i = 1; i <= 5; i++) {
>      setTimeout(function () { console.log(i); }, i * 1000);
>    }
>    ```
>    原理：`let` 有块级作用域，每次循环迭代都会创建一个新的词法环境，其中的 `i` 绑定是独立的。每个 `setTimeout` 回调捕获的是各自迭代中的 `i` 值。这是 ES6 之后最推荐的写法。
>
> 2. **IIFE（立即执行函数表达式）**：
>    ```javascript
>    for (var i = 1; i <= 5; i++) {
>      (function(j) {
>        setTimeout(function() { console.log(j); }, j * 1000);
>      })(i);
>    }
>    ```
>    原理：每次循环时立即执行一个匿名函数，将当时的 `i` 值作为参数 `j` 传入。每个回调函数闭包引用的是各自 IIFE 作用域中的 `j`，而 `j` 是按值传递的副本，不会随循环变化。
>
> 3. **使用 `bind` 柯里化**：
>    ```javascript
>    for (var i = 1; i <= 5; i++) {
>      setTimeout(function(j) { console.log(j); }.bind(null, i), i * 1000);
>    }
>    ```
>    原理：`bind` 可以预置参数，每次循环都会创建一个新函数，`i` 的当前值作为第一个参数 `j` 被绑定（预置）到新函数中。实际执行时 `j` 取出的是绑定时的快照值。
>
> 4. **使用 `setTimeout` 的第三个参数**：
>    ```javascript
>    for (var i = 1; i <= 5; i++) {
>      setTimeout(function(j) { console.log(j); }, i * 1000, i);
>    }
>    ```
>    原理：`setTimeout(callback, delay, arg1, arg2, ...)` 从第三个参数开始都会作为回调函数的参数传入。每次循环时将当前的 `i` 作为参数传给回调，相当于每次都有独立的参数值。不过这个方案 IE9 及以下不支持。

**追问2**：闭包在实际项目中遇到过哪些应用场景？有没有遇到过由于闭包引发的内存泄漏？

> 预期回答：
> - **常见应用场景**：
>   - **防抖/节流（debounce/throttle）**：timer 变量通过闭包保存在外层函数中，避免被全局污染。
>   - **模块模式**：用 IIFE 创建私有变量，return 对外暴露的 API，实现数据封装。
>   - **数据缓存/记忆化（memoization）**：闭包持有计算结果缓存，避免重复计算。
>   - **循环绑定事件时保存索引**：经典场景，用闭包（或 let）为每个元素绑定独立的事件处理函数。
>   - **Vue3 Composition API / React Hooks**：`ref`、`reactive`、`useState`、`useCallback`、`useEffect` 等底层都依赖闭包来保存和追踪状态。
> - **内存泄漏场景与解决**：
>   - DOM 元素被闭包引用，但 DOM 元素已从页面移除，闭包仍持有其引用导致 GC 无法回收。
>   - 定时器/事件监听器未清除，其中引用了大对象或 DOM 节点。
>   - 解决方案：组件/页面卸载时清理定时器（`clearTimeout`/`clearInterval`）、移除事件监听器（`removeEventListener`）、手动置空闭包引用（如 `timer = null`、`element = null`）。

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 能说出输出 5 个 6，知道是因为 var 作用域 + 异步，但说不出事件循环层面原因，只会 let 一种解决方案 |
| 中级 | 能完整解释输出原因（var 作用域 + 闭包引用 + 事件循环宏任务），能给出 3 种以上解决方案并解释各自原理，能说出 2 个以上的实际应用场景 |
| 高级 | 在中级基础上，能从规范层面解释词法环境和环境记录（Lexical Environment / Environment Record），能分析闭包内存泄漏及排查方法（Chrome DevTools Memory Profiler 中查看 Detached DOM 节点），了解 V8 的闭包优化策略（如只捕获闭包内实际被使用的变量，未使用的变量会被 GC） |

#### 过渡语

> 面试官：你对闭包和事件循环的理解不错。那我们继续深入异步编程——来看一道 Promise 的执行顺序题。

---

### Q3：Promise 执行顺序题（12-17 min）

#### 面试官话术

> 面试官：请看下面这段代码，不用急着回答，先在脑子里过一遍。然后告诉我完整的输出顺序，并解释每一步为什么。

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

new Promise((resolve, reject) => {
  console.log('4');
  resolve();
})
  .then(() => {
    console.log('5');
    setTimeout(() => {
      console.log('6');
    }, 0);
  })
  .then(() => {
    console.log('7');
  });

setTimeout(() => {
  console.log('8');
  Promise.resolve().then(() => {
    console.log('9');
  });
}, 0);

console.log('10');

async function async1() {
  console.log('11');
  await async2();
  console.log('12');
}

async function async2() {
  console.log('13');
}

async1();

console.log('14');
```

#### 考点

- 微任务（Microtask）与宏任务（Macrotask）的执行顺序：同步代码 > 微任务队列 > 宏任务队列，且每个宏任务执行完后会**清空微任务队列**，再取下一个宏任务。
- 微任务来源：`Promise.then/catch/finally`、`MutationObserver`、`queueMicrotask`、`await` 后面的代码。
- 宏任务来源：`setTimeout`、`setInterval`、`I/O`、`UI rendering`、`postMessage`、`MessageChannel`。
- `async/await` 的执行机制：`await` 右侧的表达式立即同步执行，`await` 后面的代码等价于 `Promise.resolve(...).then(() => { ... })`，属于微任务。
- `new Promise` 中的 executor 函数是**同步执行**的（这一点很多候选人会忘）。
- 微任务队列的执行时机：当前宏任务执行完毕后、下一个宏任务开始前，会清空整个微任务队列。微任务执行过程中新产生的微任务也会在这一轮内被处理。

#### 预期回答

**完整输出顺序**：`1 → 4 → 11 → 13 → 10 → 14 → 5 → 7 → 12 → 2 → 3 → 8 → 9 → 6`

**逐步分析**：

**第一轮宏任务（整体 script 脚本）——同步代码执行**：
- `console.log('1')` => 输出 `1`
- 第一个 `setTimeout`：回调加入宏任务队列（记作 **宏A**）
- `new Promise(executor)` 中的 executor 同步执行：
  - `console.log('4')` => 输出 `4`
  - `resolve()` 将第一个 `.then` 的回调加入微任务队列（记作 **微1**）
  - 链式 `.then` 的回调需要等微1完成后才注册
- 第二个 `setTimeout`：回调加入宏任务队列（记作 **宏B**）
- `console.log('10')` => 输出 `10`
- `async1()` 调用：
  - `console.log('11')` => 输出 `11`
  - `await async2()`：`async2` 内 `console.log('13')` => 输出 `13`
  - `await` 后面的 `console.log('12')` 等价于 `Promise.resolve().then(() => console.log('12'))`，加入微任务队列（记作 **微2**）
- `console.log('14')` => 输出 `14`

同步代码执行完毕。此时：**微任务队列** = [微1(输出5), 微2(输出12)]，**宏任务队列** = [宏A(输出2,3), 宏B(输出8,9)]

**清空微任务队列**：
- 执行 **微1**：`console.log('5')` => 输出 `5`；然后 `setTimeout(() => console.log('6'), 0)` 加入宏任务队列（记作 **宏C**）；微1的 `.then` 回调加入微任务队列（记作 **微3**）
- 执行 **微2**：`console.log('12')` => 输出 `12`
- 执行 **微3**（同一轮微任务中新增的也被处理）：`console.log('7')` => 输出 `7`

微任务队列清空。此时宏任务队列 = [宏A, 宏B, 宏C]

**执行宏A**（第一个 setTimeout）：
- `console.log('2')` => 输出 `2`
- `Promise.resolve().then(() => console.log('3'))` => 加入微任务队列（记作 **微4**）
- 宏A执行完毕，**清空微任务队列**：执行微4 => 输出 `3`

**执行宏B**（第二个 setTimeout）：
- `console.log('8')` => 输出 `8`
- `Promise.resolve().then(() => console.log('9'))` => 加入微任务队列（记作 **微5**）
- 宏B执行完毕，**清空微任务队列**：执行微5 => 输出 `9`

**执行宏C**（第三个 setTimeout，在微1中注册）：
- `console.log('6')` => 输出 `6`

**最终完整顺序**：`1, 4, 11, 13, 10, 14, 5, 7, 12, 2, 3, 8, 9, 6`

**几个容易出错的关键点**：
- `4` 在同步阶段输出，不是在 `.then` 中输出（`new Promise` 的 executor 是同步的）。
- `11, 13` 在同步阶段输出，`12` 在微任务阶段输出——`await` 右边的表达式同步执行，await 后面的代码才是微任务。
- `10` 在 `14` 之前输出，`12` 在两者之后——因为 `async1()` 里同步部分只执行到 `13`，`12` 被放进了微任务队列。
- `6` 在最后输出，尽管 `setTimeout(6, 0)` 在代码中写在很前面，但它注册得晚——在第一个 `.then` 回调（微任务）里面才注册，所以它排在所有已有的宏任务之后。

#### 参考答案链接

- [JavaScript/promise](../JavaScript/promise.md)
- [JavaScript/event-loop](../JavaScript/event-loop.md)
- [JavaScript/async-await](../JavaScript/async-await.md)

#### 追问方向

**追问1**：如果让 `async` 函数在最外层用 `await` 但不包 IIFE 会怎样？你知道顶层 `await`（Top-Level await）吗？

> 预期回答：
> - 在 ES Module 环境（`<script type="module">` 或 `.mjs`）中，ES2022 已经正式支持顶层 `await`，不需要 IIFE 包裹。它会阻塞当前模块以及所有导入该模块的模块的执行，直到 Promise resolve。这在模块初始化（如动态加载配置）时很有用，但需注意可能影响页面加载性能。
> - 在 CommonJS（`require`）或普通 `<script>` 标签中，顶层 `await` 会直接报语法错误（`await is only valid in async functions`），必须包裹在 async IIFE 中。这是当前最常见的写法：
>   ```javascript
>   (async () => {
>     const data = await fetchData();
>   })();
>   ```
> - 顶层 `await` 的注意事项：如果模块之间有依赖关系，顶层 await 可能产生"死锁"般的阻塞链；在浏览器中可能延迟页面的可交互时间；Server-side 场景中可能阻塞服务启动。

**追问2**：`Promise.all` 和 `Promise.allSettled` 在业务场景中如何选择？还有 `Promise.race` 和 `Promise.any` 的区别是什么？

> 预期回答：
> - **`Promise.all`**：所有 Promise 都成功才成功，任意一个失败立即 reject 并返回该错误（其他还在 pending 的 Promise 不会被取消，但结果被忽略）。适用场景：**必须全部成功**，如初始化时需要同时获取用户信息、权限列表和配置项，任何一项失败都是致命错误。
> - **`Promise.allSettled`**：等待所有 Promise 结束（无论成功或失败），返回每个 Promise 的结果数组（`{status: 'fulfilled'/'rejected', value/reason}`）。适用场景：**独立请求、部分失败可接受**，如批量上传多张图片——某张失败了不影响其他的检查结果展示。
> - **`Promise.race`**：返回第一个完成的 Promise（无论成功或失败）。适用场景：**超时控制**，如请求 3 秒未响应则 reject。
> - **`Promise.any`**：返回第一个成功的 Promise；如果全部失败才 reject（返回 AggregateError）。适用场景：**从多个 CDN 加载同一资源，谁先成功用谁的**（资源冗余策略）。

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 能区分同步/异步，知道 Promise.then 比 setTimeout 先执行，但面对复杂混合代码时顺序容易出错，对 async/await 的等价转换（await = Promise.then 微任务）理解模糊 |
| 中级 | 能正确分析完整的输出顺序，清晰区分微任务和宏任务，能逐个宏任务轮次地解释执行过程，对 async/await 的等价转换理解准确 |
| 高级 | 在中级基础上，能深入事件循环的浏览器实现细节（一个宏任务结束后清空所有微任务、`requestAnimationFrame` 在渲染前执行、`requestIdleCallback` 在空闲时执行），了解 Node.js 环境下事件循环的阶段划分（timers -> poll -> check）以及 `process.nextTick` 和 `Promise` 的优先级差异 |

#### 过渡语

> 面试官：异步这块掌握得不错。最后我们收一收，聊一个更底层的——原型链。

---

### Q4：原型链（17-20 min）

#### 面试官话术

> 面试官：JavaScript 的继承是通过原型链实现的。请你解释一下 `__proto__` 和 `prototype` 的区别，然后画出这条链的每一环：
>
> `instance -> Constructor.prototype -> Object.prototype -> null`
>
> 每一环之间是通过什么属性关联的？属性查找在这条链上是怎么进行的？

#### 考点

- `prototype` 是函数（构造函数）才有的属性，指向一个原型对象（prototype object），该对象上的属性和方法会被所有实例共享。
- `__proto__`（标准访问方式 `Object.getPrototypeOf()`）是每个对象（除了 `Object.create(null)` 创建的对象）都有的内部属性，指向其构造函数的 `prototype` 对象，是原型链的实际链接节点。
- 原型链的终点是 `null`：`Object.prototype.__proto__ === null`。
- 属性查找机制：先在实例自身属性查找 -> 找不到则沿 `__proto__` 向上查找 -> 一直到 `null` 为止。这就是原型链继承的运行时机制。

#### 预期回答

**`__proto__` vs `prototype`**：

- **`prototype`**（显式原型）：
  - 只有**函数对象**才拥有的属性（准确说是除箭头函数外的所有函数）。
  - 当函数作为构造函数被 `new` 调用时，新创建的实例对象的 `__proto__` 会指向该构造函数的 `prototype`。
  - `prototype` 本身是一个普通的对象，包含 `constructor` 属性指回构造函数本身。在这个对象上定义的属性和方法会被所有实例共享。

- **`__proto__`**（隐式原型）：
  - **每个对象**都有的内部属性（`[[Prototype]]`），是原型链的物理链接。
  - 指向创建该对象的构造函数的 `prototype`。
  - 推荐使用 `Object.getPrototypeOf(obj)` 和 `Object.setPrototypeOf(obj, proto)` 替代直接操作 `__proto__`（虽然 `__proto__` 已被 ES6 标准化，但性能不如标准方法）。

**原型链的每一环**：

```
const instance = new Constructor();

instance.__proto__ === Constructor.prototype
    // 第1环：实例的 __proto__ 指向构造函数的 prototype 对象
    // 实例可以访问 Constructor.prototype 上定义的所有属性和方法

Constructor.prototype.__proto__ === Object.prototype
    // 第2环：Constructor.prototype 本身是一个普通对象，
    // 它的 __proto__ 指向 Object.prototype
    // 因此所有实例都能访问 toString、hasOwnProperty、valueOf 等方法

Object.prototype.__proto__ === null
    // 第3环：原型链的终点是 null
    // 引擎查找属性时，查到 null 还没找到，返回 undefined
```

**属性查找过程**：
1. 查找实例自身的属性（`hasOwnProperty` 为 true 的那些）。
2. 若找不到，沿 `instance.__proto__`（即 `Constructor.prototype`）查找。
3. 若还找不到，继续沿 `Constructor.prototype.__proto__`（即 `Object.prototype`）查找。
4. 若还找不到，查 `Object.prototype.__proto__`（即 `null`），到达终点，返回 `undefined`。

> 面试官内心 OS：原型链是区分"会用 JS"和"懂 JS"的关键知识点。如果候选人能顺便提一下 `Function.__proto__ === Function.prototype` 和 `Object.__proto__ === Function.prototype` 这种"鸡生蛋蛋生鸡"的关系，说明理解得比较深。但如果跑偏了去背各种细节，反而扣分——实际工作中原型链不需要倒背如流，但要能用。

#### 参考答案链接

- [JavaScript/prototype-chain](../JavaScript/prototype-chain.md)
- [JavaScript/new](../JavaScript/new.md)

#### 追问方向

**追问1**：ES6 的 `class` 语法糖的本质是什么？babel 或 TypeScript 是怎么把它编译到 ES5 的？

> 预期回答：
> - `class` 本质上还是**构造函数 + 原型链继承**的语法糖，目的是提供更清晰、更面向对象的语法。
> - `constructor` 对应构造函数本身；类中定义的方法被添加到 `ClassName.prototype` 上；`static` 方法直接添加到构造函数对象上（`ClassName.methodName`）。
> - `extends` 本质是**寄生组合式继承**：(1) 在子类 constructor 中调用 `super(...)` 相当于 `ParentClass.call(this, ...)` 借用父类构造函数；(2) 使用 `Object.create(ParentClass.prototype)` 或 `Object.setPrototypeOf` 建立 SubClass.prototype 和 ParentClass.prototype 之间的原型链；(3) 同时 `Object.setPrototypeOf(SubClass, ParentClass)` 使子类也能继承静态方法。
> - TypeScript/Babel 编译后大致会生成 `_createClass`、`_inherits` 等辅助函数。例如 `_createClass` 用 `Object.defineProperty` 将方法挂到 prototype 上，`_inherits` 用 `Object.create` + `Object.setPrototypeOf` 处理继承关系。

**追问2**：`instanceof` 的原理是什么？如何用它来判断一个值是不是数组？有没有局限性？

> 预期回答：
> - **原理**：沿着左侧对象的 `__proto__` 链向上逐级查找，检查是否等于右侧构造函数的 `prototype`。找到返回 `true`，到达 `null` 还不匹配返回 `false`。
> - **判断数组**：`arr instanceof Array` 可以判断，但有**局限性**——在跨 iframe 或跨 window 场景下，不同全局执行上下文有各自独立的 `Array` 构造函数，一个 iframe 中的数组 `instanceof` 另一个 iframe 的 `Array` 会返回 `false`。更可靠的方式：
>   - `Array.isArray(arr)`（ES5，推荐，不受跨上下文影响）
>   - `Object.prototype.toString.call(arr) === '[object Array]'`（终极兜底方案）
> - **手动实现 instanceof**：
>   ```javascript
>   function myInstanceof(left, right) {
>     // 基本类型直接返回 false
>     if (left === null || typeof left !== 'object' && typeof left !== 'function') {
>       return false;
>     }
>     let proto = Object.getPrototypeOf(left);
>     const prototype = right.prototype;
>     while (proto !== null) {
>       if (proto === prototype) return true;
>       proto = Object.getPrototypeOf(proto);
>     }
>     return false;
>   }
>   ```

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 知道 prototype 是函数的属性、__proto__ 是对象的属性，能画出基本原型链（instance -> Constructor.prototype -> Object.prototype），但对终点是 null 和属性查找机制解释不够精确 |
| 中级 | 能清晰区分 prototype 和 __proto__ 的用途和归属，完整画出链条并解释每环的链接方式，能解释 instanceof 的原理，知道 class 是语法糖 |
| 高级 | 在中级基础上，能深入讨论 Function.prototype、Object、Function 三者之间的互相引用关系（`Function.__proto__ === Function.prototype`），能讲 V8 中属性的隐藏类（Hidden Class / Map）优化原理，能对比 ES5 各种继承方式（原型链、借用构造函数、组合、寄生组合）的优缺点和实现 |

#### 过渡语

> 面试官：JS 基础部分我们就到这里。接下来切换一下方向，看看你的 CSS 布局功底，这部分在实际业务中也很重要。

---

## 三、CSS 布局（20-35 min）

### Q5：手写居中布局（20-23 min）

#### 面试官话术

> 面试官：实际开发中经常遇到居中布局的需求。请你口述一下：一个宽高不定的 `div`，如何在父容器中实现水平垂直居中？至少说出 3 种方法，并简单说明各自的适用场景和局限性。

#### 考点

- 常见 CSS 居中方案的广度和深度。
- 对"宽高不定"这个约束条件的理解——会直接排除一些需要元素固定宽高的方案。
- 对各方案的适用场景与渲染性能的评估能力。

#### 预期回答

**方法一：Flexbox（推荐，日常最常用）**

```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

- **原理**：Flex 容器的两个对齐属性，`justify-content` 控制主轴（默认水平）对齐，`align-items` 控制交叉轴（默认垂直）对齐。`center` 值让子元素在相应轴上居中。
- **优点**：不关心子元素宽高，语义清晰，代码最简洁，现代浏览器全面支持。
- **缺点**：IE10/11 需要 `-ms-` 前缀；子元素会变成 flex item（如 `display: block` 的元素不再占满宽度），可能需要额外处理。

**方法二：Grid**

```css
.parent {
  display: grid;
  place-items: center;
}
```

- **原理**：`place-items` 是 `align-items` 和 `justify-items` 的简写。Grid 容器内，子元素在各自 grid cell 中水平和垂直居中。
- **优点**：一句 `place-items: center` 搞定，极其优雅；代码可读性最高。
- **缺点**：适合 Grid 布局体系内的居中。对单个子元素来说，用 Grid 有点"杀鸡用牛刀"。IE 不支持 Grid。

**方法三：绝对定位 + transform**

```css
.parent {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

- **原理**：`top: 50%` 和 `left: 50%` 将子元素的左上角定位到父容器的中心点；`transform: translate(-50%, -50%)` 将子元素沿自身宽高向左上各偏移 50%，使子元素的几何中心与父容器的中心重合。
- **优点**：兼容性好（IE9+，需要 `-ms-` 前缀），不依赖 flex/grid，父容器不需要特定 display 值。
- **缺点**：`transform` 会创建新的合成层（compositing layer），在低配设备上极端场景下可能影响渲染性能；百分比是相对于元素自身的，如果子元素内部有使用百分比定位的内容需要注意。

**方法四：table-cell（老旧方案，兼容 IE8）**

```css
.parent {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  /* 可能需要固定宽高 */
}
.child {
  display: inline-block;
}
```

- **原理**：模拟 `<td>` 的居中对齐行为。`vertical-align: middle` 控制垂直居中，`text-align: center` 控制水平居中。子元素设为 `inline-block` 让它作为行内块参与对齐。
- **优点**：兼容性非常好（IE8+）。
- **缺点**：父容器需要固定宽高或由内容撑开，语义上不够清晰；子元素需要改为 `inline-block`，可能影响原有的布局行为；现代项目中不推荐使用，除非有极端的兼容性需求。

> 面试官内心 OS：如果候选人提到"绝对定位 + margin: auto"，提醒他/她 re-check 题目——"宽高不确定"，这个方案要求子元素必须定宽高。能自己发现这个约束不相容的，说明读题仔细、思维严谨。

#### 参考答案链接

- [CSS/center-layout](../CSS/center-layout.md)
- [CSS/flexbox](../CSS/flexbox.md)

#### 追问方向

**追问**：如果父容器有固定宽高，子元素不定宽高，用 `transform: translate(-50%, -50%)` 和用 `margin: auto` 有什么区别？`margin: auto` 能在这种场景下生效吗？

> 预期回答：
> - **`margin: auto` 在绝对定位中的生效条件**：只有当元素在对应方向上同时设置了 `left + right`（水平）或 `top + bottom`（垂直）且元素有**明确的宽高**时，浏览器才能计算出自动分配的外边距。如果子元素宽高不定（由内容撑开），`margin: auto` 不会产生居中效果——因为浏览器无法计算剩余空间来分配 margin。
> - **`transform: translate(-50%, -50%)` 不受此限制**：百分比永远基于**元素自身**的宽高，无论是否明确指定，都能正确计算出偏移量，因此在"宽高不定"的场景下是唯一可用的绝对定位居中方案。
> - **补充知识点**：`transform` 会让元素被提升到独立的合成层（GPU 加速），但 `translate` 不会触发重排（reflow）或重绘（repaint），只触发合成（composite），性能影响非常小。少数情况下子像素渲染（sub-pixel rendering）可能会导致 1px 级别的模糊。

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 能说出 flex 或绝对定位中的一种方案，但对 transform 的百分比参照自身不清楚，"宽高不定"条件下可能误提 margin: auto |
| 中级 | 能说出 3 种方案（flex、grid、绝对定位+transform），清晰说明每种方案的核心原理和适用场景，能自主排除不符合"宽高不定"条件的方案 |
| 高级 | 在中级基础上，能对比各方案的渲染性能差异（table-cell 触发重排、transform 只触发合成），能在 flex/grid 语境下解释为什么 margin: auto 也能居中（flex 和 grid 改变了 margin 的计算规则），提及 `place-content: center` 在 Grid 中的用法 |

#### 过渡语

> 面试官：居中布局掌握得不错。那我们来一个稍微复杂一点的——经典的三栏布局。

---

### Q6：三栏布局（23-27 min）

#### 面试官话术

> 面试官：请实现一个左右固定宽度 200px、中间自适应的三栏布局，至少说出 3 种方案。如果可能，也说说每种方案的核心思想、优缺点，以及 DOM 结构的注意事项。

#### 考点

- CSS 多栏布局的方案多样性。
- 对各方案兼容性、可维护性、语义化的综合评估能力。
- 对 DOM 顺序（source order）和视觉顺序之间关系的理解，尤其是圣杯/双飞翼的"中间列先渲染"设计理念。

#### 预期回答

**方案一：Flexbox（现代推荐，最简洁）**

```html
<div class="container">
  <div class="left">左 200px</div>
  <div class="center">中间自适应</div>
  <div class="right">右 200px</div>
</div>
```

```css
.container {
  display: flex;
}
.left,
.right {
  width: 200px;
  flex-shrink: 0;  /* 防止空间不足时被压缩 */
}
.center {
  flex: 1;  /* 占据所有剩余空间 */
}
```

- **核心思想**：利用 Flex 容器中 `flex: 1` 占据剩余空间的特性。左右固定宽度并设 `flex-shrink: 0` 防止收缩。
- **优点**：代码最简洁（4 行核心 CSS），DOM 顺序等于视觉顺序，语义直观，易于理解和维护。
- **缺点**：IE10/11 有限支持（需要 `-ms-` 前缀且部分属性不支持）；DOM 顺序是 left-center-right，如果 SEO 要求主体内容优先，可以用 CSS `order` 调整视觉顺序（Flex 子元素默认 `order: 0`，可以给 center 设 `order: -1` 使它视觉上在最前面，但 DOM 顺序不变，不改善 SEO）。

**方案二：Grid（最优雅）**

```html
<div class="container">
  <div class="left">左 200px</div>
  <div class="center">中间自适应</div>
  <div class="right">右 200px</div>
</div>
```

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  /* 或者用 grid-template-columns: 200px minmax(0, 1fr) 200px; */
}
```

- **核心思想**：Grid 的轨道定义 `grid-template-columns` 以 `1fr` 单位占据剩余空间。`minmax(0, 1fr)` 可以防止内容撑开导致溢出（因为 `1fr` 的默认最小值是 `auto`）。
- **优点**：一句核心 CSS 搞定，语义最佳，布局意图在代码层面最明确。
- **缺点**：IE 完全不支持 Grid（IE 只支持旧版 `-ms-grid` 语法，差异很大），适合只面向现代浏览器的项目。

**方案三：圣杯布局（Holy Grail）—— Float + 负 margin + 相对定位**

```html
<div class="container">
  <div class="center">中间自适应</div>
  <div class="left">左 200px</div>
  <div class="right">右 200px</div>
</div>
```

```css
.container {
  padding: 0 200px;  /* 为左右栏留出空间 */
}
.center {
  float: left;
  width: 100%;
  /* 内容区利用容器的 padding 来避开左右栏 */
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%;   /* 拉到上一行最左边（center 的左边） */
  position: relative;
  left: -200px;         /* 再向左偏移 200px，落入容器左侧 padding 区域 */
}
.right {
  float: left;
  width: 200px;
  margin-left: -200px;  /* 拉到上一行最右边（center 的右边） */
  position: relative;
  right: -200px;        /* 再向右偏移 200px，落入容器右侧 padding 区域 */
}
```

- **核心思想**：三列都浮动，利用负 margin 将左右栏"拉"到与中间列同一行，再利用容器的 padding 和相对定位将左右栏"挤"到 padding 留白区域。中间列永远是 100% 宽度，利用容器的 `padding` 给左右栏让出空间。
- **优点**：主体内容（center）在 DOM 最前面，对 SEO 友好；兼容性极好（IE6+）。
- **缺点**：代码复杂、理解成本高；需要清除浮动；当中间列内容区宽度小于左栏宽度时，布局会错乱（左栏掉下去）；需要精确计算 padding 和偏移值。

**方案四：双飞翼布局 —— Float + 负 margin + 额外 wrapper**

```html
<div class="container">
  <div class="center-wrapper">
    <div class="center">中间自适应</div>
  </div>
  <div class="left">左 200px</div>
  <div class="right">右 200px</div>
</div>
```

```css
.center-wrapper {
  float: left;
  width: 100%;
}
.center {
  margin: 0 200px;   /* 用 margin 给左右栏让路，而非容器的 padding */
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%;
}
.right {
  float: left;
  width: 200px;
  margin-left: -200px;
}
```

- **核心思想**：与圣杯类似，但多了一层 wrapper。中间内容使用自身的 `margin` 而非容器的 `padding` 来避开左右栏，避免使用相对定位。
- **与圣杯的区别**：不用相对定位，不会出现圣杯中内容宽度不够时排版错乱的问题；代价是多了一层 DOM（center-wrapper）。
- **优点**：结构更稳定，不会因内容过窄导致左右栏掉落；中间列优先渲染（SEO 友好）。
- **缺点**：多一层无意义的 wrapper；仍然需要清除浮动。

#### 追问方向

**追问**：这些方案中哪个最简洁？哪个兼容性最好？如果 DOM 顺序要求中间内容必须放在最前面（SEO 优先），你会选哪种？

> 预期回答：
> - **最简洁**：Grid（一句 `grid-template-columns`），其次是 Flex（4 行核心 CSS）。
> - **兼容性最好**：圣杯/双飞翼（支持到 IE6），但现代项目中基本不需要。圣杯的"最窄宽度"问题使其不如双飞翼稳定。
> - **SEO 优先 + 中间内容 DOM 最前面**：圣杯或双飞翼。因为它们的 DOM 顺序是 center 在最前面，搜索引擎爬虫会优先抓取主体内容。Flex/Grid 虽然可以通过 `order` 属性改变视觉顺序，但不改变 DOM 顺序，不改善 SEO。
> - **实际业务推荐**：大多数现代项目用 Flex 就够了，简单且易维护。如果项目用了 Grid 布局体系，可以统一用 Grid。只在需要兼容 IE 且有 SEO 强需求时考虑双飞翼。

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 能说出 flex 方案，对圣杯/双飞翼不熟悉或说不上来，遇到类似布局倾向于查文档 |
| 中级 | 能说出 3 种方案（flex、grid、圣杯/双飞翼之一），理解负 margin 为什么能把元素拉上去（脱离文档流的错觉），能对比各方案的优缺点和 DOM 顺序 |
| 高级 | 能完整写出 4 种方案的代码，能深入解释负 margin 的工作机制（负 margin 让元素在渲染时被"拉"到上一行），能结合实际业务场景给出技术选型理由（如移动端 H5 用 flex、中后台 PC 用 grid、老项目兼容用双飞翼） |

#### 过渡语

> 面试官：布局方案你了解得很全面。接下来我们稍微深入一点，聊聊 BFC。

---

### Q7：BFC 解释（27-31 min）

#### 面试官话术

> 面试官：请你解释一下什么是 BFC（Block Formatting Context）？有哪些常见的触发条件？它在实际开发中帮我们解决了哪些布局问题？能各举一个具体例子吗？

#### 考点

- BFC 的本质：一个独立的**渲染区域**，内部元素的布局不会影响外部，外部也不会影响内部。
- BFC 的触发条件及记忆规律。
- BFC 解决的三大实际问题：外边距合并（margin collapse）、浮动元素高度塌陷（clearfix）、自适应两栏布局（浮动元素不重叠）。

#### 预期回答

**BFC（块级格式化上下文）定义**：它是 Web 页面可视化 CSS 渲染的一部分，是一个独立的渲染区域。在这个区域内，块级盒子按照一定的规则进行布局，并且这个区域内的元素与外部元素**互不影响**。

**BFC 内部的布局规则**：
- 内部的 Box 在垂直方向上一个接一个地放置。
- 同一个 BFC 内，两个相邻 Block Box 的垂直 margin 会发生**重叠**（collapse），取较大值。
- BFC 的区域不会与浮动元素（float box）重叠。
- 计算 BFC 的高度时，内部的浮动元素也参与计算（不会发生高度塌陷）。

**常见的触发方式**：
- 根元素 `<html>` 天然就是一个 BFC
- `float` 不为 `none`（`left` / `right`）
- `position` 为 `absolute` 或 `fixed`
- `display` 为 `inline-block` / `flex` / `grid` / `table-cell` / `table-caption` / `flow-root`
- `overflow` 不为 `visible`（`hidden` / `auto` / `scroll`）
- `contain: layout` / `content` / `paint`（CSS Containment 新规范）

> 面试官内心 OS：大部分候选人只会背 `overflow: hidden` 触发 BFC。能说出 `display: flow-root` 这个专门用来创建 BFC 且无副作用的现代属性的，属于额外加分。能说出"为什么 `overflow: hidden` 触发 BFC 会清除浮动"的原理而非死记硬背，说明 CSS 功底扎实。

**BFC 解决的三大实际问题**：

**1. 外边距合并（Margin Collapse）**

现象：父子元素或兄弟元素之间的垂直 margin 会发生合并，取最大值而非相加。

```html
<!-- 父元素的第一个子元素有 margin-top: 30px，
     这个 margin 会"传递"给父元素，使父元素也向下移动 30px -->
<div style="background: #eee;">
  <div style="margin-top: 30px;">子元素</div>
</div>
```

解决方案：给父元素触发 BFC，隔断 margin 的传递。

```css
.parent {
  overflow: hidden;  /* 触发 BFC */
}
```

**2. 清除浮动（包含浮动子元素）**

现象：父元素包含浮动的子元素时，如果父元素没有触发 BFC，其高度会塌陷为 0（因为浮动元素脱离了正常流，父元素"看不到"它们的高度）。

```html
<div style="border: 1px solid #000;">
  <div style="float: left; width: 100px; height: 100px;"></div>
  <!-- 父元素高度为 0，边框不会包裹浮动子元素 -->
</div>
```

解决方案：给父元素触发 BFC。

```css
.parent {
  overflow: hidden;         /* 传统方案 */
  /* 或 */
  display: flow-root;       /* 现代方案，专门用于创建 BFC，无 overflow 的裁剪副作用 */
}
```

**3. 阻止元素被浮动元素覆盖（自适应两栏布局）**

现象：一个元素设置了 `float`，后面的普通块级元素会被浮动元素"遮盖"（实际上内容是在浮动元素旁边环绕的）。

```html
<div style="float: left; width: 200px; height: 100px; background: red;"></div>
<div style="height: 200px; background: blue;">右侧内容</div>
<!-- 蓝色 div 的一部分被红色 div 遮挡 -->
```

解决方案：给右侧元素触发 BFC，BFC 区域不会与浮动元素重叠。

```css
.right {
  overflow: hidden;  /* 触发 BFC，自动避开左侧浮动元素 */
}
```

这就构成了经典的两栏自适应布局：左侧浮动固定宽度，右侧触发 BFC 占据剩余空间。

#### 参考答案链接

- [CSS/bfc](../CSS/bfc.md)
- [CSS/stacking-context](../CSS/stacking-context.md)

#### 追问方向

**追问**：BFC 和 IFC（Inline Formatting Context）有什么区别？层叠上下文（Stacking Context）和 BFC 是一回事吗？

> 预期回答：
> - **BFC vs IFC**：
>   - BFC 是块级格式化上下文，内部 Box 在垂直方向排列，每个 Box 宽度撑满父容器（block-level）。
>   - IFC 是行内格式化上下文，内部 Box 在水平方向排列，换行由 line box（行框）决定，垂直对齐由 `vertical-align` 控制。一个 BFC 内部可以包含多个 IFC（比如块级元素里的文字和 inline 元素形成 IFC）。
>   - 还有 FFC（Flex Formatting Context，由 `display: flex/inline-flex` 触发）和 GFC（Grid Formatting Context，由 `display: grid/inline-grid` 触发）。
> - **层叠上下文（Stacking Context）vs BFC**：
>   - 它们是完全独立的两个概念，解决完全不同的问题。
>   - **BFC** 控制的是盒子的**二维布局和定位**（在文档流中的位置、margin 是否合并、是否被 float 遮盖、是否包含浮动子元素）。
>   - **层叠上下文**控制的是盒子的 **Z 轴（垂直于屏幕）的堆叠顺序**——决定谁盖在谁上面，由 `z-index` 控制。
>   - 有些属性既创建 BFC 又创建层叠上下文（如 `position: fixed`、`opacity < 1`、`transform`、`will-change`），但也有很多属性只创建其中一种。例如：`overflow: hidden` 触发 BFC 但不创建层叠上下文；`opacity: 0.5` 创建层叠上下文但不触发 BFC。所以它们不是一回事。
>   - 面试中常见的误区就是把这两个概念混为一谈，能区分开的候选人说明 CSS 功底比较扎实。

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 知道 BFC 这个概念，能说出 1-2 个触发条件（如 `overflow: hidden`），知道解决浮动塌陷，但对 margin 合并解释不清或不知道 |
| 中级 | 能完整说出 BFC 的定义、4 个以上触发条件、三大应用场景，每个场景能举出具体的代码示例，能区分 BFC 和层叠上下文 |
| 高级 | 能深入对比 BFC/IFC/FFC/GFC，知道 `display: flow-root` 是现代创建 BFC 的最佳方式且无 `overflow: hidden` 的裁剪副作用，能解释为什么 BFC 会形成"隔离区域"（Box 的布局由 Formatting Context 决定，不同的 FC 之间布局互不影响） |

#### 过渡语

> 面试官：BFC 理解得不错。Flex 布局已经是我们的日常了，那考一个 flex 的细节——`flex: 1` 到底是什么意思？

---

### Q8：flex: 1 含义（31-35 min）

#### 面试官话术

> 面试官：`flex: 1` 应该是我们日常写布局时用得最多的简写属性了。请你完整回答：`flex: 1` 是哪些属性的缩写？`flex-grow`、`flex-shrink`、`flex-basis` 各自的默认值是什么？`flex: 1` 和 `flex: auto` 有什么区别？能用一个实际的例子来说明区别吗？

#### 考点

- `flex` 简写属性的完整展开。
- `flex-grow`、`flex-shrink`、`flex-basis` 三个子属性的含义和默认值。
- `flex: 1` vs `flex: auto` 的核心差异（`flex-basis: 0%` vs `flex-basis: auto`）及其布局效果的实质区别。
- 对 `flex-basis` 与 `width` 之间优先级关系的理解。

#### 预期回答

**`flex` 简写属性拆解**：

`flex` 属性是 `flex-grow`、`flex-shrink`、`flex-basis` 三个属性的简写。不同取值对应的展开如下：

| 简写 | flex-grow | flex-shrink | flex-basis | 说明 |
|------|-----------|-------------|------------|------|
| `flex: 1` | 1 | 1 | 0% | 最常用，均分空间 |
| `flex: auto` | 1 | 1 | auto | 先保留内容宽度再分配 |
| `flex: none` | 0 | 0 | auto | 不伸缩，保持原尺寸 |
| `flex: 1 0 200px` | 1 | 0 | 200px | 从 200px 开始增长，不收缩 |
| `flex: initial`（默认） | 0 | 1 | auto | 不增长但会收缩（默认行为） |
| `flex: 0` | 0 | 1 | 0% | 按比例收缩 |
| 只写 `flex: 2` | 2 | 1 | 0% | 等价于 `flex: 2 1 0%` |

**三个子属性的含义**：

- **`flex-grow`**（默认值 `0`）：定义项目的**放大比例**。当 Flex 容器有剩余空间时，各子项按 `flex-grow` 的比例分配剩余空间。`0` 表示不放大，保持原尺寸。
- **`flex-shrink`**（默认值 `1`）：定义项目的**缩小比例**。当 Flex 容器空间不足时，各子项按 `flex-shrink` 的比例收缩。`0` 表示不收缩，可能导致溢出。默认 `1` 表示所有子项等比收缩。
- **`flex-basis`**（默认值 `auto`）：定义项目在**分配剩余空间之前**的初始主轴尺寸。`auto` 表示使用元素自身的 `width`/`height`（或由内容决定的尺寸）；具体的长度值（如 `200px`、`0%`）表示以此值为基准进行伸缩。

**`flex: 1` vs `flex: auto` 的核心区别**：

| 对比维度 | flex: 1 | flex: auto |
|----------|---------|------------|
| 展开 | flex-grow: 1; flex-shrink: 1; flex-basis: 0% | flex-grow: 1; flex-shrink: 1; flex-basis: auto |
| 初始尺寸 | 0%（忽略自身内容宽度） | auto（保留自身内容或 width 决定的宽度） |
| 最终效果 | 各子项**完全均分**容器空间，不考虑内容大小 | 各子项**先保留内容宽度**，再对剩余空间按比例分配 |
| 典型结果 | 三个 flex: 1 的子项宽度完全相同 | 三个 flex: auto 的子项宽度通常不相等 |

**实际效果对比示例**：

```html
<h3>flex: 1（完全均分）</h3>
<div style="display: flex; width: 600px; background: #eee;">
  <div style="flex: 1; background: red;">短</div>
  <div style="flex: 1; background: green;">这个内容比较长一些</div>
  <div style="flex: 1; background: blue;">中</div>
</div>
<!-- 结果：三个 div 都是 200px（完全均分），忽略各自内容长短 -->

<h3>flex: auto（按内容分配）</h3>
<div style="display: flex; width: 600px; background: #eee;">
  <div style="flex: auto; background: red;">短</div>
  <div style="flex: auto; background: green;">这个内容比较长一些</div>
  <div style="flex: auto; background: blue;">中</div>
</div>
<!-- 结果："这个内容比较长一些"的 div 最宽，因为它的内容初始宽度最大 -->
```

**使用建议**：
- 需要多个元素**严格等宽**（如导航栏 tab）时，用 `flex: 1`。
- 需要元素**按内容比例分配**（如标签列表、关键词云）时，用 `flex: auto` 或自定义 flex 值。

#### 参考答案链接

- [CSS/flexbox](../CSS/flexbox.md)

#### 追问方向

**追问1**：`flex-shrink` 在什么情况下不生效？`flex-basis` 和 `width` 同时存在时，优先级是怎样的？

> 预期回答：
>
> **`flex-shrink` 不生效的情况**：
> 1. 容器总宽度充足，不需要收缩。
> 2. 子元素设置了 `flex-shrink: 0`，明确告诉浏览器不收缩。
> 3. 子元素已收缩到 `min-width` 下限（默认 `min-width: auto` 在 flex 子项上等于内容的最小宽度，比如最长单词的宽度），无法继续收缩。这就是为什么有时 flex 子元素内容溢出——`flex-shrink` 不能把元素缩得比内容最小宽度更小。解决方案：设置 `min-width: 0`。
> 4. `flex-wrap: wrap` 时，空间不足会换行而非收缩。
>
> **`flex-basis` 和 `width` 的优先级**（主轴为水平方向时）：
> - `flex-basis` 的优先级**高于** `width`。
> - 具体规则：`flex-basis` 不为 `auto` 时，以 `flex-basis` 为准，`width` 被忽略；`flex-basis: auto` 时，回退到 `width`（或 `height`）；两者都没有时，使用元素内容的 `max-content` 大小。
> - 例外：`flex-basis: content` 等价于 `auto`（基于内容自动计算）。如果一个元素同时设置了 `flex-basis` 和 `width`，`flex-basis` 决定初始尺寸，`width` 作为 fallback。

**追问2（加分题）**：`flex-grow` 的计算公式是怎样的？能举个例子算一下吗？

> 预期回答：
> - **剩余空间** = 容器主轴尺寸 - 所有子元素的 flex-basis（或实际尺寸）之和 - 所有固定边距/border/padding 之和
> - **每个子元素的增长量** = 剩余空间 * (该元素的 `flex-grow` / 所有子元素的 `flex-grow` 之和)
> - **最终尺寸** = `flex-basis` + 增长量
>
> 示例：
> - 容器宽度 600px，三个子元素：A(`flex: 1 1 50px`)、B(`flex: 2 1 100px`)、C(`flex: 1 1 0px`)
> - 初始基准尺寸之和 = 50 + 100 + 0 = 150px
> - 剩余空间 = 600 - 150 = 450px
> - grow 总和 = 1 + 2 + 1 = 4
> - A 增长: 450 * (1/4) = 112.5px -> 最终 162.5px
> - B 增长: 450 * (2/4) = 225px -> 最终 325px
> - C 增长: 450 * (1/4) = 112.5px -> 最终 112.5px

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | 知道 flex: 1 就是均分空间，但说不出三个子属性，对 flex-basis 概念模糊或完全不知道 |
| 中级 | 能完整展开 flex: 1 的三个子属性及各自默认值，能清晰区分 flex: 1 和 flex: auto 的核心区别（basis: 0% vs auto），能举例说明实际效果差异，知道 flex-basis 优先级高于 width |
| 高级 | 在中级基础上，能写出 flex-grow 和 flex-shrink 的完整计算公式并举数字例子算一遍，能分析 flex-shrink 计算比 flex-grow 复杂的原因（收缩时还要考虑 min-width/content size 下限），知道 `min-width: 0` 在 flex 布局中的必要性（让元素可以缩到比内容宽度更小），了解 CSS Grid 中 `fr` 单位的设计思路与 `flex-grow` 的类比关系 |

#### 过渡语

> 面试官：理论和布局部分就到这里。接下来我们进入最后一块——手写题。给你两个方向，你可以选一个你拿手的来写。

---

## 四、手写题（35-45 min）

### Q9：手写防抖或深拷贝（35-43 min）

#### 面试官话术

> 面试官：最后是手写题环节。我给你两个选项，你可以选一个更有把握的来写。不用担心写到一半卡住，我们更看重思路和边界思考。
>
> **选项A：手写防抖（debounce）**
> - 实现一个 `debounce` 函数
> - 支持 `leading`（首次触发立即执行）和 `trailing`（延迟结束后执行）两种选项
> - 支持 `cancel` 方法，可以取消当前等待中的延迟调用
> - 正确传递 `this` 和参数
> - 加分项：如果写得快，可以扩展讲一下 `throttle` 的实现思路
>
> **选项B：手写深拷贝（deepClone）**
> - 实现一个 `deepClone` 函数
> - 处理循环引用（不能爆栈）
> - 正确拷贝 `Date`、`RegExp`、`Map`、`Set`
> - 拷贝 `Symbol` 类型的 key
> - 保持原型链
> - 加分项：处理 `WeakMap`/`WeakSet`、不可枚举属性、getter/setter
>
> 这两个题在实际业务中都很常用，选你更擅长的来写就好。

#### 考点

- **选A（debounce）**：闭包应用、定时器管理、this 绑定与参数透传、高阶函数设计、leading 和 trailing 的协作逻辑。
- **选B（deepClone）**：递归思维、类型判断（`typeof`、`instanceof`、`Object.prototype.toString`）、循环引用处理（`WeakMap`）、特殊对象遍历（`Map.forEach`/`Set.forEach`）、原型链保持（`Object.create`）、不可枚举属性的获取（`Object.getOwnPropertyDescriptors`）。
- 无论选哪个，都在考察候选人的代码组织能力、边界思考全面性和代码书写习惯。

#### 预期回答

---

**选项A：防抖（debounce）参考实现**

```javascript
/**
 * 防抖函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（ms）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否首次立即执行（默认 false）
 * @param {boolean} options.trailing - 是否延迟后执行（默认 true）
 * @returns {Function} 防抖后的函数，附带 cancel 方法
 */
function debounce(fn, delay = 300, options = {}) {
  const { leading = false, trailing = true } = options;

  let timer = null;
  let lastInvokeTime = 0;  // 记录上次真正执行的时间戳，用于 leading 判断

  function debounced(...args) {
    const now = Date.now();
    const context = this;

    // 清除上一次的定时器（每次调用都重置延迟计时）
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    // ==================== leading 逻辑 ====================
    // 判断是否需要 leading 调用：
    // 1. leading 开关打开
    // 2. 距离上次真正执行的时间 >= delay（防止连续快速点击导致的 leading 多次触发）
    const shouldLeading = leading && (now - lastInvokeTime >= delay);

    if (shouldLeading) {
      lastInvokeTime = now;
      fn.apply(context, args);
      // leading 执行后，如果 leading 和 trailing 都开启，
      // 则在同一个 delay 周期内 trailing 不应再执行（避免双击效果）
      return;
    }

    // ==================== trailing 逻辑 ====================
    if (trailing) {
      // 如果开启了 leading，重置 lastInvokeTime 以记录本次"触发尝试"
      // 这样在 delay 内后续的连续调用不会触发新的 leading
      if (leading) {
        lastInvokeTime = now;
      }

      timer = setTimeout(() => {
        timer = null;
        lastInvokeTime = Date.now();
        fn.apply(context, args);
      }, delay);
    }
  }

  // cancel 方法：取消防抖，清除定时器并重置状态
  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastInvokeTime = 0;
  };

  // 刷新方法（加分项）：立即执行并重置定时器
  debounced.flush = function (...args) {
    debounced.cancel();
    lastInvokeTime = Date.now();
    fn.apply(this, args);
  };

  return debounced;
}
```

> 面试官内心 OS：这个题最容易翻车的地方是 leading + trailing 同时开启时的逻辑——一次连续触发中，leading 执行后 trailing 还要不要执行？如果需要，两次执行之间必须间隔至少一个 delay；如果不需要，leading 执行后 trailing 要沉默。很多候选人会忽略这个边界。此外，cancel 方法很多候选人会忘了重置 lastInvokeTime。

**节流（throttle）追问参考实现**：

```javascript
/**
 * 节流函数
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 间隔时间（ms）
 * @param {Object} options - { leading: true, trailing: true }
 */
function throttle(fn, delay = 300, options = {}) {
  const { leading = true, trailing = true } = options;

  let timer = null;
  let lastTime = 0;  // 上次执行的时间戳

  return function throttled(...args) {
    const now = Date.now();
    const context = this;

    // 首次调用：如果 leading 为 false 且 lastTime 为 0，
    // 将 lastTime 设为 now，这样第一次调用不会立即执行
    if (lastTime === 0 && !leading) {
      lastTime = now;
    }

    // 计算距离下次可执行的时间剩余
    const remaining = delay - (now - lastTime);

    if (remaining <= 0) {
      // 间隔已到，可以执行
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(context, args);
    } else if (!timer && trailing) {
      // 间隔未到且没有等待中的定时器，设置一个 trailing 定时器
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0;
        timer = null;
        fn.apply(context, args);
      }, remaining);
    }
  };
}
```

**防抖（debounce）vs 节流（throttle）业务场景区分**：

| 对比维度 | 防抖（debounce） | 节流（throttle） |
|----------|------------------|-------------------|
| 核心行为 | 连续触发只执行最后一次（或首次） | 固定时间间隔执行一次 |
| 比喻 | "等你不动了再干活" | "按固定节奏来，到点了就干一次" |
| 典型场景 | 搜索框输入联想、窗口 resize 重算布局、表单按钮防重复提交 | 滚动加载更多（scroll）、鼠标移动跟踪（mousemove）、抢购按钮点击限频 |
| 关注点 | 最后一次触发的状态 | 过程中持续但不频繁的更新 |

---

**选项B：深拷贝（deepClone）参考实现**

```javascript
/**
 * 深拷贝函数
 * @param {*} target - 需要拷贝的目标
 * @param {WeakMap} map - 用于处理循环引用的映射表
 * @returns {*} 深拷贝后的新对象
 */
function deepClone(target, map = new WeakMap()) {
  // 1. null 和基本类型直接返回（typeof null === 'object' 需要优先处理）
  if (target === null || typeof target !== 'object') {
    return target;
  }

  // 2. 处理循环引用：如果已经拷贝过，直接返回之前的拷贝结果
  if (map.has(target)) {
    return map.get(target);
  }

  // 3. 处理 Date
  if (target instanceof Date) {
    return new Date(target.getTime());
  }

  // 4. 处理 RegExp
  if (target instanceof RegExp) {
    return new RegExp(target.source, target.flags);
  }

  // 5. 处理 Map
  if (target instanceof Map) {
    const clonedMap = new Map();
    map.set(target, clonedMap);  // 先存入 map 再递归，防止循环引用
    target.forEach((value, key) => {
      clonedMap.set(
        deepClone(key, map),     // Map 的 key 也可能是对象
        deepClone(value, map)
      );
    });
    return clonedMap;
  }

  // 6. 处理 Set
  if (target instanceof Set) {
    const clonedSet = new Set();
    map.set(target, clonedSet);
    target.forEach((value) => {
      clonedSet.add(deepClone(value, map));
    });
    return clonedSet;
  }

  // 7. 获取原型并创建同类型对象（保持原型链）
  const proto = Object.getPrototypeOf(target);
  const clonedObj = Array.isArray(target)
    ? []
    : Object.create(proto);

  // 存入 map（在递归拷贝属性之前，防止循环引用致爆栈）
  map.set(target, clonedObj);

  // 8. 拷贝所有自有属性（包括字符串 key 和 Symbol key）
  // 获取所有自有属性名（包括不可枚举的）
  const keys = Reflect.ownKeys(target);
  // Reflect.ownKeys 返回: [...Object.keys, ...Object.getOwnPropertySymbols]
  // 包含不可枚举属性，但不包含原型链上的属性

  for (const key of keys) {
    // 使用 getOwnPropertyDescriptor 获取完整的属性描述符
    const descriptor = Object.getOwnPropertyDescriptor(target, key);

    // 如果属性有 getter/setter，直接复制描述符
    if (descriptor.get || descriptor.set) {
      Object.defineProperty(clonedObj, key, descriptor);
    } else {
      // 普通数据属性：递归拷贝 value
      clonedObj[key] = deepClone(descriptor.value, map);
    }
  }

  return clonedObj;
}
```

> 面试官内心 OS：深拷贝是面试"试金石"——代码行数越多，越容易暴露候选人对边界的思考是否全面。几个关键的评判点：(1) 是否用了 WeakMap 而非 Map 处理循环引用（WeakMap 的 key 是弱引用，利于 GC）；(2) 是否处理了 Symbol key（`Object.keys` 拿不到，须用 `Object.getOwnPropertySymbols` 或 `Reflect.ownKeys`）；(3) 是否保持原型链（用 `Object.create(proto)` 而非 `{}`）；(4) 是否处理了 Map/Set 内部元素的递归拷贝；(5) 是否处理了 getter/setter（用 `Object.getOwnPropertyDescriptor`）。

#### 参考答案链接

- [手写题/debounce-throttle](../手写题/debounce-throttle.md)
- [手写题/deep-clone](../手写题/deep-clone.md)
- [JavaScript/deep-clone](../JavaScript/deep-clone.md)
- [JavaScript/debounce-throttle](../JavaScript/debounce-throttle.md)

#### 追问方向

**追问A（选 debounce 的追问——throttle）**：防抖和节流的核心区别是什么？各自的典型业务场景有哪些？

> 参考答案见上方"防抖 vs 节流业务场景区分"表格。

**追问B（选 deepClone 的追问——拷贝方案对比）**：深拷贝有几个备选方案——`JSON.parse(JSON.stringify())`、浏览器原生 `structuredClone`、手写递归。各自的局限是什么？`structuredClone` 比手写好在哪，又有什么做不到的？

> 预期回答：
>
> **`JSON.parse(JSON.stringify())`**：
> - 优点：代码最短，一行搞定。
> - 局限：
>   - 丢失 `undefined`、`Function`、`Symbol`（key 和 value 都会被忽略）
>   - `BigInt` 直接报错（`TypeError: Do not know how to serialize a BigInt`）
>   - `Date` 变成 ISO 字符串（需要手动 `new Date()` 转回）
>   - `RegExp` 变成空对象 `{}`
>   - `Map`/`Set` 变成空对象 `{}`
>   - `NaN`、`Infinity` 变成 `null`
>   - 无法处理循环引用（直接报错 `TypeError: Converting circular structure to JSON`）
>   - 丢失原型链
>   - 丢失不可枚举属性
>
> **`structuredClone(target)`**（Chrome 98+, Node.js 17+, 所有现代浏览器均支持）：
> - 优点：浏览器原生 API，性能远优于手写递归；天然支持循环引用；能正确处理 `Date`、`RegExp`、`Map`、`Set`、`ArrayBuffer`、`Blob`、`ImageData` 等 Web API 对象；错误处理完善。
> - 局限（做不到的）：
>   - 不能拷贝 `Function`（抛出 `DataCloneError`）
>   - 不能拷贝 `Symbol`（同上）
>   - 不能拷贝 DOM 节点
>   - 不能保留原型链（拷贝结果永远是普通对象或数组）
>   - 不能拷贝不可枚举属性
>   - 不能拷贝 getter/setter（只拷贝 getter 的返回值）
>   - 不能拷贝 `Error` 对象
> - **实际使用建议**：在不需要拷贝函数/Symbol/原型链的纯数据场景，直接用 `structuredClone` 是最优解。需要完全体拷贝时才用手写递归方案。
>
> **手写递归**：
> - 优点：最灵活，理论上可以处理所有类型。
> - 局限：代码量大，需要自行处理所有边界；递归深度过大可能爆栈（可以改写为迭代 + 栈模拟解决）。

#### 评分标准

| 级别 | 标准 |
|------|------|
| 初级 | **防抖**：能写出基本的 trailing-only 版本（定时器 + 闭包），参数和 this 基本能传递。**深拷贝**：能写出基础递归版本（处理普通对象和数组），但未处理循环引用和特殊对象。代码能跑但边界考虑不足 |
| 中级 | **防抖**：支持 leading/trailing 选项，参数和 this 传递正确，有 cancel 方法，代码结构清晰。**深拷贝**：用 WeakMap 处理循环引用，处理了 Date/RegExp，用 `Object.getOwnPropertySymbols` 或 `Reflect.ownKeys` 处理 Symbol key，保持原型链。代码风格规范，注释合理 |
| 高级 | **防抖**：在中级基础上，正确处理 leading + trailing 共存时的协作逻辑（避免一次触发执行两次），额外实现 flush 方法，能从事件循环角度解释为什么即使 `setTimeout(fn, 0)` 也不能保证"立即"执行。**深拷贝**：全面处理 Map/Set/WeakMap/WeakSet，使用 `Object.getOwnPropertyDescriptor` 保持 getter/setter 和不可枚举属性，考虑爆栈时改用迭代（栈 + while 循环）方案，代码逻辑严密无遗漏 |

#### 过渡语

> 面试官：好的，手写题环节就到这里。接下来是我留给你的反问环节，有什么想了解的可以直接问我。

---

## 五、反问环节（43-45 min）

### 面试官话术

> 面试官：面试的主体内容差不多了。现在有大概 2-3 分钟，你有什么想了解的都可以问我——关于团队、技术栈、项目方向、成长空间等等，随意聊。

### 推荐的反问问题

**推荐问题1：团队的技术栈和发展方向**

> 候选人：想了解一下咱们团队目前主要的技术栈是什么？主要是做 B 端中后台还是 C 端产品？未来有什么技术方向上的规划吗？

> 面试官预期回答：
> "我们团队目前主要用 Vue3 + TypeScript + Element Plus 做中后台管理系统，这是我们的主力技术栈。同时也有一些面向 C 端的小程序和 H5 项目，根据场景会用到 Nuxt/Next 做 SSR。React 技术栈的项目也有，团队里两种框架都有人在做，不强求每个人都会。接下来我们想在低代码和 AI 辅助开发方向做一些探索，如果你对这方面感兴趣，机会很多。"

**推荐问题2：对新人的培养和成长机制**

> 候选人：团队对新人的融入和成长有什么支持吗？比如有没有导师制度或者定期的技术分享？

> 面试官预期回答：
> "我们每个新同事入职后会配一个 mentor，前 1-3 个月会重点帮你熟悉代码规范和业务模块。Code Review 特别关注代码质量，前期的 CR 会给比较详细的建议。团队每周有技术分享会，轮流主讲；每季度有一次 hack day，你可以自由组队做任何技术探索，不限于业务需求。公司内部也有技术社区和博客平台，鼓励输出和分享。"

**推荐问题3：目前面临的技术挑战**

> 候选人：目前团队在技术上面临什么比较有挑战的问题？或者说最近在攻克什么有意思的技术难题？

> 面试官预期回答：
> （这个问题问得很好，关注"能不能学到东西"比"加不加班"更能体现技术热情）"我们最近在做动态表单引擎的架构重构，涉及到 JSON Schema 驱动的渲染引擎和复杂联动逻辑的 AST 解析优化，性能瓶颈不少。另外也在尝试微前端来整合几个老系统，技术选型刚过完。如果你对这方面感兴趣，会有很多深入参与的空间。"

**推荐问题4：面试流程和后续安排**

> 候选人：后续的面试流程大概是怎样的？大概多久能有反馈？

> 面试官预期回答：
> "今天的是一面，主要考察技术基础。通过了会安排二面，二面会侧重项目深挖和架构设计。如果顺利还有一轮终面，终面更多聊综合素质和团队匹配度。一般每轮 1-3 个工作日会有结果，HR 会电话或微信联系你。"

### 不建议问的问题及原因

| 问题 | 为什么不建议 |
|------|-------------|
| "加班多吗？" / "你们 996 吗？" | 一面阶段问加班，容易被解读为"想找清闲工作"。可以通过面试官的状态和语气侧面感受团队节奏，或者等终面/HR 面再正式问 |
| "薪资能给多少？" | 薪资谈判是 HR 的专业领域，技术面试官通常不掌握薪资预算和具体数字，问了也得不到答案，反而显得着急、不专业 |
| "你们公司是做什么的？" | 暴露你完全没做功课，连公司主营业务都不知道就来面试。面试官会严重降低期望分——这是基本态度问题 |
| "这个岗位的 JD 写得不清楚，能再讲讲做什么的吗？" | JD 上写得明明白白，问这个只能说明没认真看。如果确实有 JD 没覆盖的问题，换成更具体的："除了 JD 上写的，日常还有哪些跨团队协作的场景？" |
| "你觉得我刚才表现怎么样？" | 让面试官很尴尬——说好也不是、说差也不是。一般公司流程不允许面试官当场给反馈，而且可能影响后续面试官的判断独立性。想知道结果就等 HR 通知 |
| "这个岗招了多久了？为什么还没招到人？" | 这个问题带有质疑意味，会让面试官防备。如果真的关心，可以在有其他 offer 时委婉地表达，但一面不建议问这个 |

---

## 六、面试结语

### 面试官话术

> 面试官：好的，时间差不多了。今天的面试到这里就结束了。整体和你聊下来挺顺畅的，你各方面的基础情况我也有了大致了解。后续如果通过了，HR 会在 1-3 个工作日内联系你安排二面。今天辛苦了，回去路上注意安全，拜拜。

### 面试官赛后立即完成的小动作

- [ ] 在评分表上快速打上 Q1-Q9 的分数（趁记忆新鲜）。
- [ ] 写下 2-3 句整体评价（一句话总结优势和不足）。
- [ ] 标出需要在二面中补测的点（比如：原型链理解较浅 -> 二面补测 ES6 class 继承）。
- [ ] 如果候选人在反问中问了很好的问题，记录下来——这是技术热情的加分项。

---

## 面试官复盘（面试后填写）

> 以下内容为面试官内部使用，用于评分和复盘记录，**不展示给候选人**。

### 各题评分汇总

| 题目 | 权重 | 得分（1-5） | 核心评语 |
|------|------|------------|----------|
| Q1: this 指向 | 15% |  | |
| Q2: 闭包输出 | 15% |  | |
| Q3: Promise 执行顺序 | 20% |  | |
| Q4: 原型链 | 10% |  | |
| Q5: 居中布局 | 5% |  | |
| Q6: 三栏布局 | 5% |  | |
| Q7: BFC | 10% |  | |
| Q8: flex: 1 | 5% |  | |
| Q9: 手写题 | 15% |  | |
| **加权总分** | **100%** | **/ 5.0** | |

### 综合能力雷达评估

| 维度 | 得分（1-5） | 说明 |
|------|------------|------|
| JS 基础深度 |  | this/闭包/作用域/原型链/Promise/事件循环的整体掌握深度 |
| CSS 布局能力 |  | 居中/多栏/BFC/Flex/Grid 的应用能力和原理理解 |
| 异步编程理解 |  | 事件循环/微任务宏任务/async-await/Promise 组合 API 的理解 |
| 代码能力 |  | 手写题的代码质量、边界处理、代码风格、变量命名 |
| 表达能力 |  | 逻辑是否清晰、技术概念是否能用简洁语言准确描述 |
| 学习潜力 |  | 是否对原理有探究欲、反问质量、技术视野 |

### 通过建议（判定标准）

**强烈推荐（加权总分 >= 4.0）**
- Q3 异步顺序完全正确 + Q9 手写题边界处理到位 = 必过。
- 典型画像：JS + CSS 基础都非常扎实，能主动说出"为什么"而不仅是"是什么"，有强烈的技术探究意识。

**推荐（加权总分 >= 3.0）**
- 核心知识点基本正确，个别细节需要面试官适当引导，但整体输出质量合格。
- 可以进入二面，建议二面面试官侧重**项目深挖 + 架构设计**，以此考察实战深度。
- 如果 Q1-Q4（JS 核心）得分偏低但 CSS/Q9 表现好，二面重点补测 JS 理论。

**不推荐（加权总分 < 3.0）**
- JS 核心知识点（Q1-Q4）中如果有 2 题及以上只能达到初级水平（如完全不懂事件循环、this 绑定规则混淆、原型链画不出来），说明基础不够扎实。
- 手写题完全写不出来或基本框架都写不对。一面作为筛基础底线的轮次，Q1-Q4 + Q9 大面积翻车的不建议通过。

### 3 年中级前端的典型通过画像

| 题目 | 期望级别 | 关键表现 |
|------|----------|----------|
| Q1 this | 中级 | 5 种绑定规则及优先级清晰，代码分析全对，知道隐式丢失和箭头函数 this 不可变 |
| Q2 闭包 | 中级 | 输出结果正确，3 种解决方案且能解释原理，能说出 2+ 个实际项目应用场景 |
| Q3 Promise | 中级 | 14 步输出顺序完全正确，能按事件循环轮次逐步分析，async/await 等价转换理解准确 |
| Q4 原型链 | 中级 | 完整画出链条，`__proto__` vs `prototype` 区分清晰，instanceof 原理能讲对 |
| Q5-Q8 CSS | 中级 | flex/grid/绝对定位三种居中方案能说出来，三栏布局至少 3 种方案，BFC 三大场景能举例，flex:1 三个子属性及与 flex:auto 的区别清晰 |
| Q9 手写 | 中级 | 核心逻辑正确，关键边界（循环引用/leading+trailing/cancel/Symbol key）处理到位 |

---

### 补充说明

- 本脚本的 CSS 部分（Q5-Q8）权重相对较低（合计 25%），因为这是一面的 JS 基础轮次。如果候选人 JS 基础非常好但 CSS 略弱（比如 BFC 只能说出 2 个场景），仍然值得推荐通过——CSS 可以在业务中快速补。
- 如果候选人 JS 基础薄弱但 CSS 非常出色（CSS 满分的初级 JS），不建议通过。一面的定位是**筛 JS 基础**，JS 基本功不过关，CSS 再好也难以胜任有深度的前端工作。
- 如果候选人对于某个问题回答得特别深入（明显超出了题目本身的要求），应记录下来——这可能是高潜力的信号，可以在二面中进一步验证。
