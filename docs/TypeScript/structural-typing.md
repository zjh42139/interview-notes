---
title: 类型兼容性（结构型 vs 标称型）
description: TypeScript 采用结构类型系统（Structural Typing），通过"形状"判断类型兼容而非"名字"，理解这条线才能理解为什么多余的属性检查是例外、协变逆变在哪里生效
category: TypeScript
type: mechanism
score: 0
difficulty: 中高级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - 结构类型
  - 标称类型
  - 类型兼容性
  - 协变
  - 逆变
---

# 类型兼容性（结构型 vs 标称型）

> ⭐⭐⭐｜难度：中高级

## 一句话总结

**TypeScript 是结构类型系统（Structural Typing）——判断两个类型是否兼容不看名字，只看"形状"。你有 `{ name: string }`，我也有 `{ name: string }`，你们就是兼容的，不需要显式声明继承关系。这跟 Java/C# 的标称类型系统（Nominal Typing——必须显式 `implements`/`extends` 才算一家人）完全不同。理解这一条线，才能理解"为什么这个赋值不报错"以及"为什么那个多余属性突然报错了"。**

## 核心机制

### 结构类型：只看形状不看名字

```typescript
// 两个类型完全没有继承关系，但形状相同 —— 兼容！
interface Person {
  name: string;
  age: number;
}

interface Animal {
  name: string;
  age: number;
}

let person: Person = { name: '张三', age: 30 };
let animal: Animal = person;  // ✅ Person 赋值给 Animal，不报错！
// 为什么？因为 Person 和 Animal 的形状一模一样
// 在结构类型系统中，它们就是同一个类型
```

更精确的表述：**如果 X 的每个属性在 Y 中都有对应属性且类型兼容，则 X 可赋值给 Y。** `person` 有 `name: string` 和 `age: number`，`Animal` 也需要 `name: string` 和 `age: number`——完全匹配，所以兼容。

"鸭子类型"（Duck Typing）的经典表述：如果它走起来像鸭子、叫起来像鸭子，它就是鸭子。

### 属性多的一方可以赋给少的一方

```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

let p2d: Point2D = { x: 0, y: 0 };
let p3d: Point3D = { x: 0, y: 0, z: 0 };

p2d = p3d;   // ✅ Point3D 包含了 Point2D 需要的所有属性（x, y）
// p3d = p2d; // ❌ Point2D 缺少 z 属性

// 核心原则：源类型的属性 ≥ 目标类型的属性
// 这保证了"目标类型需要的东西源类型一定提供"
```

### 函数参数的双向协变

函数参数的类型检查有两个方向：

```typescript
// 参数类型：逆变（Contravariance）—— 函数参数接受更宽的类型
type Handler = (arg: string | number) => void;
let fn: Handler = (arg: string) => {};  // ❌ strictFunctionTypes 下报错
// 参数从 string|number 变为 string，接受范围缩小了——不安全

// 严格模式下纠正：
let fn2: Handler = (arg: string | number) => {
  // arg 至少跟 Handler 声明的一样宽
};
```

```typescript
// 返回值类型：协变（Covariance）—— 返回值可以更窄
type Factory = () => string | number;
let fn: Factory = (): string => 'hello';  // ✅
// 返回值从 string|number 变为 string —— 在外面使用时仍然兼容
```

**面试话术**："TypeScript 整体是结构类型系统，但函数参数在 strictFunctionTypes 开启后是逆变的——回调函数的参数必须能接受所有可能的传入值。这是为了函数调用安全。"

### 多余属性检查（Excess Property Checking）—— 唯一的例外

```typescript
interface Config {
  url: string;
  timeout?: number;
}

// 直接字面量赋值 → 触发多余属性检查（报错！）
const config: Config = {
  url: '/api',
  timeout: 5000,
  retry: 3,      // ❌ 报错：'retry' 不存在于 Config 中
};

// 通过中间变量 → 不触发（结构类型的正常行为）
const temp = { url: '/api', timeout: 5000, retry: 3 };
const config2: Config = temp;  // ✅ 不报错！
```

**为什么**：直接字面量赋值时，多出来的属性在所有上下文中都无法访问——大概率是拼写错误或误解了接口定义。这是 TypeScript 有意加的一层"安全网"，不是结构类型系统的例外，而是实用性补丁。

**新鲜对象（Fresh Object）**：字面量创建的对象没有经过任何类型标注，TypeScript 会执行严格的多余属性检查。一旦赋值给有类型标注的变量，这个对象就被"拓宽"为那个类型，后续不再检查。

## 深度拓展

### 追问 1：标称类型在 TS 中怎么实现？

TypeScript 没有原生标称类型，但可以通过 **brand** 模式模拟：

```typescript
// Brand 模式 —— 用唯一的 symbol/number 标记区分两个 string 类型
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function getUser(id: UserId) { /* ... */ }
function getOrder(id: OrderId) { /* ... */ }

const userId = 'u123' as UserId;
const orderId = 'o456' as OrderId;

getUser(userId);    // ✅
// getUser(orderId); // ❌ OrderId 不能赋值给 UserId
// 虽然底层都是 string，但 brand 让编译器区分它们
```

典型场景：货币金额、数据库 ID、度量单位——底层都是 `number` 或 `string`，但语义上绝对不能互换。

### 追问 2：函数的协变/逆变在什么场景出问题？

```typescript
// 经典反例：为什么 Array<T> 的方法签名用了逆变
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

// 实际场景：回调注册时的参数逆变
type DogHandler = (dog: Dog) => void;
type AnimalHandler = (animal: Animal) => void;

let handleDog: DogHandler = (dog: Dog) => dog.bark();
let handleAnimal: AnimalHandler = (animal: Animal) => console.log(animal.name);

// handleDog = handleAnimal;  // ✅ strictFunctionTypes 下也 OK——Animal 比 Dog 更宽
// handleAnimal = handleDog;  // ❌ 如果允许：传入 Cat 也会调用 bark()——炸了
```

### 追问 3：`{}`、`object`、`Object` 有什么区别？

```typescript
// {} —— 除了 null 和 undefined 之外的所有值
let a: {} = 42;          // ✅
let b: {} = 'hello';     // ✅
let c: {} = { x: 1 };    // ✅
// let d: {} = null;     // ❌ strictNullChecks 下报错

// object —— 只接受引用类型（非原始类型）
let e: object = { x: 1 }; // ✅
// let f: object = 42;    // ❌ number 是原始类型

// Object —— 尽量不要用（是 JS 的 Object 构造函数类型，行为复杂）
```

## 项目实战

结构类型在 Vue3 后台管理中有三个实用场景：

**1. 页面 Props 复用**：

```typescript
// 多个页面都需要 userId 和 role —— 不用 extends，形状相同就能用
interface UserPageProps { userId: number; role: string; }

// UserDetail 页面
const props = defineProps<{ userId: number; role: string; }>();
// UserEdit 页面
const props2 = defineProps<{ userId: number; role: string; }>();

// 可以写一个公共函数接受两个页面的 props
function checkAccess(props: { userId: number; role: string }) {
  return props.role === 'admin';
}
checkAccess(props);   // ✅ 形状匹配就兼容
checkAccess(props2);  // ✅
```

**2. API 响应适配**：

```typescript
// 后端返回了 20 个字段，但你只需要 3 个
interface UserFull {
  id: number; name: string; email: string; role: string;
  createdAt: string; updatedAt: string;
  // ...再加 10 个没用到的字段
}
// 你的表格只需要 3 个字段
interface UserRow { id: number; name: string; role: string; }

// TS 不会因为后端类型多了字段而报错——结构类型允许
const row: UserRow = fetchUser(); // ✅ UserFull 包含 UserRow 需要的所有字段
```

**3. Brand 保护 ID 类型**：

```typescript
type RoleId = number & { __brand: 'RoleId' };
type UserId = number & { __brand: 'UserId' };

function assignRole(userId: UserId, roleId: RoleId) { /* ... */ }

assignRole(1 as UserId, 2 as RoleId);  // ✅ 必须显式断言
// assignRole(1, 2);                   // ❌ number 不能赋给 branded type
```

## 易错点

❌ **混淆多余属性检查和结构类型的兼容规则**：直接字面量赋值检查多余属性，中间变量不检查——这不是 bug，是 TS 的"新鲜对象"安全策略。

❌ **以为 interface 的继承改变了赋值兼容性**：`interface A extends B` 只是让 TS 帮你复制属性，不影响兼容性——`{ x: number; y: number }` 永远可赋值给 `{ x: number }`，跟是否 extends 无关。

❌ **`strictFunctionTypes` 不开启时回调参数双向协变**：旧项目或宽松 tsconfig 中，`(dog: Dog) => void` 可以赋给 `(animal: Animal) => void`——这在运行时可能炸。新项目务必开启。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "TypeScript 是怎么判断类型兼容的" | 追问结构类型只看形状不看名字 |
| "为什么字面量有额外属性会报错但中间变量不会" | 追问多余属性检查是 TS 的安全网不是类型系统本身 |
| "怎么在 TS 中实现标称类型" | 追问 brand 模式（交叉类型 + 唯一标记） |

## 相关阅读

- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [基础类型 / 类型注解](./basic-types.md) —— 类型系统的基石
- [any / unknown / never](./any-unknown-never.md) —— top type 和 bottom type 对兼容性的影响
- [enum / class 类型](./enum-class.md) —— class 在结构类型系统中的行为
- [声明文件 / declare](./declaration.md) —— 声明合并让 interface 可以跨文件扩展

## 更新记录

- 2026-07-14：新建——结构类型 vs 标称类型核心概念 + 多余属性检查 + 协变逆变 + brand 模式
