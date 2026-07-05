---
title: 手写 new
description: 手写实现 new 操作符，理解构造函数和原型
category: 手写题
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - new
  - 构造函数
  - 原型
---

# 手写 new

> ⭐⭐⭐⭐｜难度：初级｜项目：★★★

## 一句话总结

**new 做了四件事：创建空对象并挂原型链、执行构造函数绑定 this、判断构造函数返回值、返回最终对象。** 代码很短，但边界判断是区分初级和中级的考点。

## 核心机制

```typescript
/**
 * myNew：模拟 new 操作符
 *
 * 四步流程：
 * 1. 创建一个空对象，其 __proto__ 指向 constructor.prototype
 * 2. 用该对象作为 this 执行构造函数
 * 3. 判断构造函数的返回值：
 *    - 如果返回引用类型（且不是 null），用返回值覆盖
 *    - 否则返回步骤 1 创建的对象
 * 4. 返回最终对象
 */
function myNew<T extends object>(
  Constructor: { new (...args: any[]): T },
  ...args: any[]
): T {
  // 安全检查：箭头函数不能 new（没有 [[Construct]] 内部方法）
  if (typeof Constructor !== 'function') {
    throw new TypeError('myNew: Constructor is not a function');
  }

  // ========== 步骤 1：创建空对象，挂原型链 ==========
  // Object.create 创建一个新对象，将其 [[Prototype]] 设为 Constructor.prototype
  const obj = Object.create(
    (Constructor as any).prototype as object
  );

  // ========== 步骤 2：以 obj 为 this 执行构造函数 ==========
  const result = (Constructor as Function).apply(obj, args);

  // ========== 步骤 3：判断返回值 ==========
  // 如果构造函数返回了一个引用类型（object 或 function），就用它替代 obj
  // 注意：typeof null === 'object'，但 null 是原始值，需要特殊处理
  const isObject =
    result !== null && (typeof result === 'object' || typeof result === 'function');

  // ========== 步骤 4：返回最终对象 ==========
  return isObject ? result : obj;
}

// ==================== 测试用例 ====================

// 测试 1：普通构造函数
function Person(name: string, age: number) {
  this.name = name;
  this.age = age;
  // 没有显式 return
}

Person.prototype.sayHi = function () {
  return `Hi, I'm ${this.name}`;
};

const p = myNew(Person, 'Alice', 25);
console.log(p.name);          // "Alice"
console.log(p.age);           // 25
console.log(p.sayHi());       // "Hi, I'm Alice"
console.log(p instanceof Person); // true

// 测试 2：构造函数返回对象（覆盖 this）
function ForceObj(name: string) {
  this.name = 'ignored';
  return { name, force: true };  // 显式返回新对象
}

const fo = myNew(ForceObj, 'Bob');
console.log(fo.name);   // "Bob"（返回的对象覆盖了 this）
console.log(fo.force);  // true
// console.log(fo instanceof ForceObj); // false（返回的不是 ForceObj 的实例）

// 测试 3：构造函数返回 null
function ReturnNull(this: any) {
  this.value = 42;
  return null;  // null 是原始值，忽略，返回 this
}

const rn = myNew(ReturnNull);
console.log(rn.value);          // 42
console.log(rn instanceof ReturnNull); // true

// 测试 4：构造函数返回函数
function Factory(fn: () => string) {
  this.data = 'ignored';
  return fn;  // 返回函数，是引用类型，覆盖 this
}

const f = myNew(Factory, () => 'hello from fn');
console.log(f());               // "hello from fn"
console.log(f instanceof Factory); // false

// 测试 5：箭头函数不能 new（模拟原生行为，实际 TypeScript 编译期禁止）
// const Arrow = () => {};
// myNew(Arrow); // 运行时不报错，但没有 prototype，行为与原生不同

// ==================== 对比原生 new ====================
console.log('\n--- 对比原生 new ---');
const nativeP = new Person('Carl', 30);
const myP = myNew(Person, 'Carl', 30);
console.log(nativeP instanceof Person);  // true
console.log(myP instanceof Person);      // true
```

## 深度拓展

### 追问点 1：`typeof null === 'object'` 为什么需要特殊处理？

```typescript
// 面试官：返回 null 时 new 的行为是什么？

// 规范中定义：如果构造函数返回了一个 Object，就用返回值替代新对象
// 但 null 虽然是 typeof null === 'object'，但它不是 Object 类型
// 所以 null 被排除在外，返回新创建的对象

// ❌ 错误写法：
const isObject = result !== null && typeof result === 'object';
// 只检查 typeof === 'object' 会漏掉 null

// ✅ 正确写法：同时排除 null
const isObject = result !== null
  && (typeof result === 'object' || typeof result === 'function');

// 验证：
function TestNull() { this.x = 1; return null; }
const t = new TestNull();
console.log(t.x); // 1（null 被忽略，返回 this 对象）
```

### 追问点 2：箭头函数能 new 吗？

```typescript
// 箭头函数没有 [[Construct]] 内部方法，也没有 prototype 属性
// 原生 new 会抛出 TypeError:
//   new (() => {}) // TypeError: (intermediate value) is not a constructor

// 在 myNew 中：
// Object.create(undefined) 会报错 → 因为箭头函数没有 prototype
// 为了更好的错误提示，可以在开头加上函数类型检查（但无法精确区分箭头函数和普通函数）

// 实际面试中，可以在开头加上：
if (!Constructor.prototype) {
  throw new TypeError('Constructor does not have a prototype');
}
```

### 追问点 3：为什么用 `Object.create` 而不是直接 `obj.__proto__ = ...`？

```typescript
// __proto__ 虽然被大多数引擎支持，但在 ES 规范中不是标准的属性访问器
// Object.create(proto) 是 ES5 标准方法，兼容性更好
// 而且性能更优（JIT 对 Object.create 有专门优化）

// 面试中可以直接说：
// "我用 Object.create(Constructor.prototype) 创建一个新对象，
//  确保新对象的原型链指向构造函数的 prototype 对象"
```

## 项目实战

```typescript
// 场景：实现一个依赖注入容器，需要模拟 new 来自动装配
class Container {
  private registry = new Map<string, any>();

  register<T>(token: string, Constructor: new (...args: any[]) => T) {
    this.registry.set(token, Constructor);
  }

  resolve<T>(token: string, ...args: any[]): T {
    const Constructor = this.registry.get(token);
    if (!Constructor) throw new Error(`Token ${token} not registered`);
    // 用 myNew 创建实例，方便加钩子（如 AOP、日志）
    return myNew(Constructor, ...args);
  }
}
```

## 易错点

1. **忘记处理 `null` 返回值**：`typeof null === 'object'`，不排除会导致 `new fn()` 中 `return null` 时拿到 null 而非实例。

2. **用 `typeof result === 'object'` 判断不够**：构造函数可能返回函数（函数也是引用类型），应该用 `typeof result === 'object' || typeof result === 'function'`。

3. **用 `instanceof` 判断返回值类型**：`result instanceof Object` 会漏掉通过 `Object.create(null)` 创建的对象。

4. **`Object.create(proto)` 的 proto 不能是 null/undefined**：箭头函数没有 prototype，直接创建会报错。

5. **忘记 `apply` 或 `call`**：构造函数需要用正确的 this 调用，不能直接 `Constructor(...)`。

## 相关阅读

- [JavaScript new](../JavaScript/new.md) -- new 操作符的完整原理和规范
- [手写 bind/call/apply](./bind-call-apply.md) -- this 绑定机制，new 优先级
- [JavaScript 原型链](../JavaScript/prototype-chain.md) -- 原型链的建立和查找过程
- [JavaScript new](../JavaScript/new.md) -- 构造函数和 class 的关系

## 更新记录

- 2026-07-05：Phase 2 填充完整实现
- 2026-07：初始占位（Phase 1）
