---
title: 基础类型 / 类型注解
description: TypeScript 基础类型系统全解——类型注解、类型推断、字面量类型、函数重载、interface vs type 对比
category: TypeScript
type: mechanism
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - 类型注解
  - 类型推断
  - 字面量类型
  - 函数重载
  - interface
  - type
---

# 基础类型 / 类型注解

> ⭐⭐⭐⭐⭐｜难度：初级

## 一句话总结

**TypeScript 的类型系统在"不动运行时代码"的前提下给变量、参数、返回值打上标签——编译器从你显式写的类型注解和你没写但能推导出来的类型推断两条路收集信息，然后在你写代码的时候就告诉你哪里会炸。基础类型、字面量类型、函数重载、interface 和 type 的选择，是这套系统的最底层积木。**

## 核心机制

### 1. 基础类型注解

TypeScript 的类型写在 `:` 后面，编译后全部消失，不影响运行时。

```typescript
// 原始类型
let name: string = '张三';
let age: number = 25;
let isAdmin: boolean = false;
let nothing: null = null;
let notDefined: undefined = undefined;
let big: bigint = 100n;
let unique: symbol = Symbol('id');

// 数组 —— 两种写法完全等价
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];

// 元组 —— 长度和类型都固定
let tuple: [string, number] = ['hello', 42];
// let err: [string, number] = [42, 'hello'];  // ❌ 顺序不对

// 对象
let obj: { name: string; age: number } = { name: '张三', age: 25 };

// 函数
function add(a: number, b: number): number {
  return a + b;
}
const multiply = (a: number, b: number): number => a * b;

// 可选参数 & 默认值
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : name;
}
```

**`?` 和 `undefined` 的区别**：`title?: string` 允许调用时不传这个参数，而 `title: string | undefined` 必须显式传值（可以传 `undefined`）。类型层面两者近似但不完全等价——开启 `exactOptionalPropertyTypes` 后，`?` 表示"属性可缺失"，`| undefined` 表示"属性存在但值可能是 undefined"，语义不同。

### 2. 类型推断（Type Inference）

TypeScript 会**自动推导**变量的类型——你不用写，它也知道。

```typescript
// 基础推断
let x = 10;              // TS 推断 x: number
let y = 'hello';         // TS 推断 y: string
let z = [1, 2, 3];       // TS 推断 z: number[]
let obj = { a: 1, b: 2 };// TS 推断 obj: { a: number; b: number }

// const 收窄 —— 这就是字面量类型的入口
const n = 10;            // TS 推断 n: 10（不是 number！）
const s = 'hello';       // TS 推断 s: 'hello'（不是 string！）
// 为什么？const 的值不会变，收窄到字面量类型是安全的

// let 不收窄 —— 因为值可能被改
let m = 10;              // TS 推断 m: number
```

**最佳实践：能不写类型就不写。** TypeScript 的类型推断覆盖了 90% 的场景，只在三种情况下显式写注解：(1) 函数参数 (2) 没有初始值的变量 (3) 想让类型比推断结果更宽/更窄时。

`noImplicitAny` 开启后，TS 推断不出类型的地方全部报错——这是 strict 模式的第一道防线。

### 3. 字面量类型（Literal Types）

字面量类型把类型精确到**具体的值**，不只是宽泛的 `string` 或 `number`。

```typescript
// 字符串字面量类型 —— 限制变量只能是某几个值
type Direction = 'north' | 'south' | 'east' | 'west';
let dir: Direction = 'north';   // ✅
// let dir2: Direction = 'up';  // ❌

// 数字字面量类型
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 6;         // ✅

// 布尔字面量类型 —— 虽然很少直接用，但理解底层有用
type True = true;
let t: True = true;             // ✅
// let f: True = false;         // ❌

// 字面量类型 + 联合类型 = TypeScript 版 "枚举"
type Status = 'pending' | 'approved' | 'rejected';
function handle(status: Status) {
  switch (status) {
    case 'pending':  return '处理中';
    case 'approved': return '已通过';
    case 'rejected': return '已驳回';
    // 没有 default —— Status 的所有可能都被覆盖了
  }
}
```

**字面量类型是后续所有高级类型操作的基础**：联合类型 (`'a' | 'b'`)、模板字面量类型 (`` `on${Capitalize<T>}` ``)、`as const` 收窄——底层都是字面量类型的组合。

### 4. 函数重载（Function Overloads）

TypeScript 的重载跟 Java/C++ 完全不同——不是多个实现，而是**多个类型签名 + 一个实现签名**。

```typescript
// 重载签名（声明不同参数组合的返回值映射）
function format(input: string): string;
function format(input: number): string;
function format(input: Date): string;
// 实现签名（必须兼容所有重载签名，但对外部不可见）
function format(input: string | number | Date): string {
  if (typeof input === 'string') {
    return input.trim();
  } else if (typeof input === 'number') {
    return input.toFixed(2);
  } else {
    return input.toISOString();
  }
}

format(' hello ');   // TS 知道返回 string，并允许 string 方法
format(42);           // TS 知道返回 string
// format(true);      // ❌ 没有匹配的重载
```

**核心规则**：
- 重载签名之间是函数调用时可选的参数组合，实现签名对外部调用者**不可见**
- 实现签名的参数类型必须**覆盖**所有重载签名的参数类型（用联合类型）
- 重载签名的返回值类型可以不同——这是它相比联合类型的核心优势

**什么时候用重载而不是联合类型**：当入参类型和返回值类型有**一一对应关系**时。`string → string, number → number` 用重载；`string | number → string` 用联合类型就够了。

```typescript
// 经典场景：入参决定返回值类型
function getData(id: number): User;
function getData(ids: number[]): User[];
function getData(idOrIds: number | number[]): User | User[] {
  if (Array.isArray(idOrIds)) return idOrIds.map(id => fetchUser(id));
  return fetchUser(idOrIds);
}
const user = getData(1);       // TS 知道是 User
const users = getData([1,2]);  // TS 知道是 User[]
```

### 5. interface vs type（高频对比）

这是 TypeScript 面试中最高频的问题之一。只有说清楚以下三个核心区别才算过关：

```typescript
// 区别一：声明合并 —— interface 可以，type 不行
interface User { name: string }
interface User { age: number }
// 自动合并为 User = { name: string; age: number }
// 这在扩展第三方库类型时极其有用

// type User = { name: string }
// type User = { age: number }             // ❌ 报错：Duplicate identifier

// 区别二：type 可以定义联合/交叉/映射类型，interface 只能描述对象形状
type Status = 'pending' | 'success' | 'error'           // 联合类型
type WithCode<T> = { data: T } & { code: number }        // 交叉类型
type Readonly<T> = { readonly [K in keyof T]: T[K] }     // 映射类型
// interface 都做不到

// 区别三：extends 方式不同
interface Admin extends User { role: string }            // interface 用 extends
type Admin = User & { role: string }                     // type 用 & 交叉

// 推荐实践：
// 描述对象形状 → interface（声明合并 + extends 语义更清晰）
// 联合/交叉/映射/工具类型 → type（type 原生能力）
// 不确定用哪个 → 先写 interface，发现需要联合/交叉能力时再切 type
```

**为什么 interface 能声明合并**：这是 TS 有意为之——`.d.ts` 文件中多个 `interface Window` 定义可以分散在不同库的类型文件中，最终合并为一个完整类型。type 不支持合并也是有意为之——类型别名一旦定义就固定了，不允许隐式修改，这保证了类型来源的单一性。

> 声明合并的深入用法（declare module 扩展第三方类型）见[声明文件 / declare](./declaration.md)。

## 项目实战

后台管理系统中基础类型无处不在，关键在于"不写多余的类型注解"：

```typescript
// ✅ 好：让 TS 自动推断
const roles = ['admin', 'editor', 'viewer'];  // TS 推断 string[]
const config = { apiBase: '/api', timeout: 5000 };  // TS 推断完整类型

// ❌ 差：重复 TS 已经知道的信息
const roles: string[] = ['admin', 'editor', 'viewer'];  // 多余的注解
const config: { apiBase: string; timeout: number } = { /*...*/ };

// ⚠️ 需要注解的三种情况：
// 1. 函数参数
function createRole(name: string, permissions: string[]) { /*...*/ }
// 2. 延迟初始化
let result: User | null = null;  // 没有初始值，必须注解
result = await fetchUser();
// 3. 想收窄类型
let status: Status = 'pending';  // 收窄为字面量联合类型，不是 string
```

## 易错点

❌ **把 TypeScript 的类型注解当成运行时检查**：`const n: number = parseInt('abc')` 编译不报错，但运行时 `n` 是 `NaN`。类型注解不是 schema 验证——运行时数据仍然需要用类型守卫验证。

❌ **混淆 `void` 和 `undefined` 的行为**：区别不在函数体内——两者都可以 `return;` 或不 return——而在**调用方**能否使用返回值。

```typescript
function fn1(): void { }              // ✅
function fn2(): void { return; }      // ✅
function fn3(): undefined { return; } // ✅ return; 等价于 return undefined;

// 真正的区别在这里：
const v1 = fn1();  // typeof v1 = void，不能赋值给 string/number 等具体类型
const v3 = fn3();  // typeof v3 = undefined，可以赋值给 undefined 类型

let u: undefined;
u = fn3();   // ✅ undefined 类型兼容
// u = fn1(); // ❌ void 不能赋值给 undefined（strictNullChecks 下）
```

> `void` 的语义是"这个返回值你别用"——函数可以返回任何东西，但 TS 会阻止调用方依赖它。`undefined` 的语义是"返回的就是 undefined"——调用方可以安全使用。所以声明回调函数返回值时优先用 `void`（兼容各种实现），只有真的需要调用方拿到 `undefined` 时才用 `undefined`。

❌ **字面量类型收窄被类型断言覆盖**：`const n = 10 as number` 会强制扩宽为 `number` 类型，覆盖了字面量推导——很少需要这样做。

❌ **重载签名和实现签名不兼容**：实现签名的参数必须是所有重载参数的超集，返回值必须是所有重载返回值的联合——否则 TS 报错但不直观。

❌ **`interface` 和 `type` 混用不当**：同一个项目中一会儿用 `interface` 一会儿用 `type` 描述对象形状，造成代码风格不一致。团队应该定一个默认选择（推荐 interface），只在需要联合/交叉/映射时用 type。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "TypeScript 的类型注解怎么写" | 追问 const 和 let 的推断差异——const 收窄到字面量 |
| "类型推断什么时候不工作" | 追问 noImplicitAny 开启后哪些位置必须手动注解 |
| "函数重载和联合类型有什么区别" | 追问入参和返回值有一一对应映射时用重载 |
| "interface 和 type 怎么选" | 追问声明合并是 interface 的独有特性 |

## 相关阅读

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [类型兼容性](./structural-typing.md) —— 结构型类型系统到底怎么判断兼容
- [声明文件 / declare](./declaration.md) —— interface 声明合并的深入用法
- [any / unknown / never](./any-unknown-never.md) —— 特殊类型的正确用法
- [类型收窄](./type-narrowing.md) —— typeof/instanceof/in/is 收窄类型

## 更新记录

- 2026-07-14：新建——合并基础类型注解、类型推断、字面量类型、函数重载、interface vs type 五大块
