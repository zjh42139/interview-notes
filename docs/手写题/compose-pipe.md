---
title: 手写 compose / pipe
description: 手写实现 compose 和 pipe 函数组合
category: 手写题
difficulty: 初级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - compose
  - pipe
  - 函数式编程
---

# 手写 compose / pipe

> ⭐⭐⭐｜难度：初级｜项目：★★★

## 一句话总结

**compose 从右到左组合函数 `compose(f, g, h)(x) = f(g(h(x)))`，pipe 从左到右 `pipe(h, g, f)(x) = f(g(h(x)))`，两者的核心都是用 `reduce` 实现函数串联，空参数返回 identity 函数。**

## 核心机制

```typescript
// ========== 基础版本：同步 compose / pipe ==========

/**
 * compose: 从右到左组合函数
 * compose(f, g, h)(x) 等价于 f(g(h(x)))
 */
function compose<R>(...fns: Array<(arg: any) => any>): (arg: any) => R {
  if (fns.length === 0) {
    return (arg: any) => arg as unknown as R;
  }

  if (fns.length === 1) {
    return fns[0] as (arg: any) => R;
  }

  return fns.reduce((a, b) => (...args: any[]) => a(b(...args))) as (arg: any) => R;
}

/**
 * pipe: 从左到右组合函数
 * pipe(h, g, f)(x) 等价于 f(g(h(x)))
 */
function pipe<R>(...fns: Array<(arg: any) => any>): (arg: any) => R {
  if (fns.length === 0) {
    return (arg: any) => arg as unknown as R;
  }

  if (fns.length === 1) {
    return fns[0] as (arg: any) => R;
  }

  return fns.reduce((a, b) => (...args: any[]) => b(a(...args))) as (arg: any) => R;
}

// ========== 异步版本：支持 async/await ==========

/**
 * asyncCompose: 从右到左组合，自动处理 Promise
 */
function asyncCompose<T = any, R = any>(
  ...fns: Array<(arg: any) => any | Promise<any>>
): (arg: T) => Promise<R> {
  if (fns.length === 0) {
    return (arg: T) => Promise.resolve(arg as unknown as R);
  }

  if (fns.length === 1) {
    return (arg: T) => Promise.resolve(fns[0](arg)) as Promise<R>;
  }

  return fns.reduce((a, b) => async (x: any) => {
    const result = await b(x);
    return a(result);
  }) as (arg: T) => Promise<R>;
}

/**
 * asyncPipe: 从左到右组合，自动处理 Promise
 */
function asyncPipe<T = any, R = any>(
  ...fns: Array<(arg: any) => any | Promise<any>>
): (arg: T) => Promise<R> {
  if (fns.length === 0) {
    return (arg: T) => Promise.resolve(arg as unknown as R);
  }

  if (fns.length === 1) {
    return (arg: T) => Promise.resolve(fns[0](arg)) as Promise<R>;
  }

  return fns.reduce((a, b) => async (x: any) => {
    const result = await a(x);
    return b(result);
  }) as (arg: T) => Promise<R>;
}

// ==================== 测试用例 ====================

// --- 基础 compose ---
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const square = (x: number) => x * x;

// compose(f, g, h)(5) = f(g(h(5))) = square(double(addOne(5)))
// = square(double(6)) = square(12) = 144
const composed = compose(square, double, addOne);
console.log('compose(5):', composed(5)); // 144

// pipe(h, g, f)(5) = f(g(h(5))) = square(double(addOne(5))) = 144
const piped = pipe(addOne, double, square);
console.log('pipe(5):', piped(5)); // 144

// --- 字符串处理管道 ---
const trim = (s: string) => s.trim();
const toLower = (s: string) => s.toLowerCase();
const replaceSpaces = (s: string) => s.replace(/\s+/g, '-');

const slugify = pipe(trim, toLower, replaceSpaces);
console.log('slugify:', slugify('  Hello World  ')); // "hello-world"

// --- 空参数 / 单参数 ---
console.log('空 compose:', compose()(42));  // 42（identity）
console.log('单 compose:', compose(double)(5)); // 10
console.log('空 pipe:', pipe()(42));        // 42（identity）
console.log('单 pipe:', pipe(double)(5));   // 10

// --- 异步 compose ---
const fetchUser = async (id: number) => {
  // 模拟 API 调用
  return { id, name: `User${id}` };
};
const enrichUser = async (user: { id: number; name: string }) => {
  return { ...user, role: 'admin', timestamp: Date.now() };
};
const formatResponse = (user: any) => ({
  success: true,
  data: user,
});

const userPipeline = asyncCompose(formatResponse, enrichUser, fetchUser);
userPipeline(1).then(console.log);
// { success: true, data: { id: 1, name: 'User1', role: 'admin', timestamp: ... } }

// --- 异步 pipe ---
const asyncSlugify = asyncPipe(
  trim,
  toLower,
  replaceSpaces,
);
asyncSlugify('  Async Pipe  ').then(console.log); // "async-pipe"
```

## 深度拓展

### 追问点 1：compose 和 pipe 的 reduce 实现有什么区别？

```typescript
// compose: fns.reduce((a, b) => (...args) => a(b(...args)))
// a 是累积的包装函数，b 是当前遍历到的函数
// 最终的效果：最右边的函数先执行，最左边的最后执行
//
// fns = [A, B, C]，reduce 过程：
// 第1步：(a, b) = (A, B) → (...args) => A(B(...args))
// 第2步：(a, b) = ((...args) => A(B(...args)), C) → (...args) => A(B(C(...args)))
// 结果 = A(B(C(x))) = compose(A, B, C)(x) ✓

// pipe: fns.reduce((a, b) => (...args) => b(a(...args)))
// fns = [A, B, C]，reduce 过程：
// 第1步：(a, b) = (A, B) → (...args) => B(A(...args))
// 第2步：(a, b) = ((...args) => B(A(...args)), C) → (...args) => C(B(A(...args)))
// 结果 = C(B(A(x))) = pipe(A, B, C)(x) ✓
```

### 追问点 2：为什么用 `reduce` 而不是手动写 `return f(g(h(x)))`？

```typescript
// reduce 的优势：
// 1. 动态参数数量：可能传入 2 个函数，也可能 10 个
// 2. 可读性：reduce 表达的语义是"累积执行"，比嵌套调用清晰
// 3. 可扩展：加错误处理、日志等功能只需在 reduce 回调里加逻辑

// 等价对比：
const manual = (x: any) => f(g(h(x))); // 只能 3 个
const auto = compose(f, g, h);          // 可以是任意多个
auto(x);
// 两者完全等价
```

### 追问点 3：compose 在 Redux 和 Koa 中的应用？

```typescript
// Redux 中间件：compose(m1, m2, m3)(store.dispatch)
// 中间件本质是函数组合：(next) => (action) => { ... next(action) ... }

// Koa 中间件：洋葱模型
// app.use(async (ctx, next) => {
//   console.log('1-start');
//   await next();
//   console.log('1-end');
// });
// 多个中间件通过 compose 串成洋葱调用链

// 简化版 Koa compose：
function koaCompose(
  middlewares: Array<(ctx: any, next: () => Promise<void>) => Promise<void>>
) {
  return (ctx: any) => {
    let index = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = middlewares[i];
      if (!fn) return Promise.resolve();
      return fn(ctx, () => dispatch(i + 1));
    };
    return dispatch(0);
  };
}

// 这个实现比简单的 reduce 更复杂，因为它需要双向执行（洋葱模型）
// 但本质上也是一种 compose
```

## 项目实战

### 场景1：数据处理管道

```typescript
// 后台管理系统：从 API 响应到表格数据
interface ApiResponse {
  code: number;
  data: { list: Array<{ userName: string; userAge: number }> };
}

const extractData = (res: ApiResponse) => res.data.list;
const formatNames = (list: any[]) =>
  list.map((item) => ({ ...item, userName: item.userName.trim() }));
const filterAdults = (list: any[]) =>
  list.filter((item) => item.userAge >= 18);
const sortByAge = (list: any[]) =>
  list.sort((a, b) => a.userAge - b.userAge);

const processUserList = pipe(
  extractData,
  formatNames,
  filterAdults,
  sortByAge
);

// fetch('/api/users').then(res => res.json()).then(processUserList).then(console.log)
```

### 场景2：字符串校验管道

```typescript
// 表单校验：组合多个校验函数
type Validator = (value: string) => string | null; // null=通过, string=错误

const required = (msg = '必填') => (value: string) =>
  value.trim() ? null : msg;

const minLength = (n: number, msg = `至少 ${n} 个字符`) => (value: string) =>
  value.length >= n ? null : msg;

const isEmail = (msg = '邮箱格式不正确') => (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : msg;

// 组合校验：短路返回第一个错误
const composeValidators = (...validators: Validator[]) =>
  (value: string): string | null => {
    for (const fn of validators) {
      const error = fn(value);
      if (error) return error;
    }
    return null;
  };

const emailValidator = composeValidators(
  required('邮箱不能为空'),
  minLength(5, '邮箱至少 5 个字符'),
  isEmail()
);
console.log(emailValidator(''));       // "邮箱不能为空"
console.log(emailValidator('a@'));     // "邮箱至少 5 个字符"
console.log(emailValidator('hello'));  // "邮箱格式不正确"
console.log(emailValidator('a@b.com')); // null（通过）
```

## 易错点

1. **compose 和 pipe 方向搞混**：`compose(f, g) = f(g(x))`，`pipe(f, g) = g(f(x))`。记住：compose 是"内层先执行"（像数学函数复合），pipe 是"从左到右读"。

2. **reduce 空数组**：`[].reduce(fn)` 会抛 TypeError（没有初始值时 reduce 要求数组至少有一个元素）。必须单独处理 `fns.length === 0`。

3. **TypeScript 类型推导**：简单版用 `(...args: any[]) => any` 会丢失类型信息。复杂项目可以写函数重载：

```typescript
// 进阶类型（面试时不要求，但可以提一句）
function compose<A, B>(fn1: (a: A) => B): (a: A) => B;
function compose<A, B, C>(fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => C;
function compose<A, B, C, D>(fn3: (c: C) => D, fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => D;
// ... 一直到 10 个参数
// 实现用 any
```

4. **异步函数和同步函数混用**：如果用同步 compose 组合 async 函数，返回值是 Promise 而不是实际值。需要用 asyncCompose/asyncPipe 专用版本。

5. **错误处理缺失**：reduce 链式调用中一个函数抛错会中断整个管道。可以用 try-catch 包裹或引入 Either monad 模式。

## 相关阅读

- [手写 debounce/throttle](./debounce-throttle.md) -- 同为常用工具函数
- [JavaScript 闭包](../JavaScript/closure.md) -- compose 内部 reduce 创建的函数依赖闭包
- [手写 EventEmitter](./event-emitter.md) -- 发布订阅模式，与中间件管道不同思路
- [手写 Promise](./promise.md) -- Promise 的 then 链也是一种"管道"式组合

## 更新记录

- 2026-07-05：Phase 2 填充完整实现
- 2026-07：初始占位（Phase 1）
