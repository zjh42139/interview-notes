---
title: this / call / apply / bind 面试回答
description: this 指向和 call/apply/bind 的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# this / call / apply / bind 面试回答

> 对应题库：[面试题库/JavaScript](../../面试题库/JavaScript.md)

## 30 秒版

this 的值不是在定义时确定的，而是在函数被调用时确定的——谁调用了函数，this 就指向谁。四种绑定优先级：new > 显式绑定 > 隐式绑定 > 默认绑定。call 和 apply 立即执行并指定 this（区别在传参方式），bind 返回一个永久绑定 this 的新函数。

---

## 2 分钟版

**第一：this 的四种绑定规则。**

默认绑定——独立函数调用时 this 指向全局（严格模式下是 undefined）。隐式绑定——`obj.fn()`，this 指向 obj。但有一个陷阱：如果把方法赋值给变量再调用，this 丢失——`const fn = obj.fn; fn()`，this 回到默认绑定。显式绑定——`fn.call(obj, a, b)` 和 `fn.apply(obj, [a, b])`，区别只在传参格式——call 逐个传，apply 数组传。new 绑定——new 一个构造函数时，内部创建新对象，this 指向它。优先级：new > 显式 > 隐式 > 默认。

**第二：箭头函数的 this。**

箭头函数没有自己的 this——它的 this 是词法的，就是定义时外层作用域的 this。所以箭头函数里的 this 不受调用方式影响。这就是为什么 React 类组件里 `onClick={this.handleClick}` 需要 bind，但函数组件里 `onClick={() => this.handleClick}` 或者直接在 render 中写箭头函数不需要 bind——箭头函数的 this 已经绑死了外层。

**第三：bind 的实现原理。**

`fn.bind(obj)` 返回一个新函数，新函数内部用 `fn.apply(obj, args)` 调用。bind 一旦绑定，this 就永久固定——再次 bind 也改不了。面试手写题中 bind 的步骤：返回新函数 → 新函数内部用 apply 指定 this → 处理 new 的情况（`this instanceof fBound` 时用 this 代替 boundThis）→ 拼接参数。

**第四：call/apply 的实战场景。**

`Math.max.apply(null, arr)` —— apply 把数组展开为参数。`Array.prototype.slice.call(arguments)` —— 把类数组转为真数组（现代用 `Array.from` 或 `[...arguments]`）。`Object.prototype.toString.call(value)` —— 精准判断类型，返回 `[object Array]` 这样的字符串。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "call 和 apply 的区别，什么时候用 apply" | apply 第二个参数是数组——适合参数本身就是数组的场景（如 Math.max）。其他都一样——性能差异在现代引擎中可以忽略 |
| "bind 之后还能再 bind 吗" | 不能。返回的绑定函数已经锁死 this——内部用的是第一次 bind 传入的 this，后续 bind 不会生效 |
| "箭头函数能用 call 改 this 吗" | 不能。箭头函数没有自己的 this，call/apply/bind 对它无效。编译后箭头函数直接引用外层 `_this`，不经过动态绑定 |

---

## 别踩的坑

- "回调函数里 this 丢了"——`obj.method` 作为回调传给 `setTimeout` 时 this 变成 window。解决：箭头函数包一层或 bind
- "'use strict' 下 this 是 undefined"——全局函数里 this 不是 window，是 undefined。很多人写 `(function(){ console.log(this) })()` 在严格模式下打出 undefined 就懵了
- "手写 bind 时忘记处理 new"——如果 new 了 bind 返回的函数，this 应该是新创建的对象（`this instanceof fBound`）而不是 boundThis
