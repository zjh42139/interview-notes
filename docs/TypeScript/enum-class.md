---
title: enum / class 类型
description: TypeScript 的 enum 枚举类型和 class 类型系统扩展——enum 的编译产物与选择原则、class 访问修饰符与结构类型下的行为
category: TypeScript
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: draft
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - enum
  - const enum
  - class
  - 访问修饰符
  - implements
---

# enum / class 类型

> ⭐⭐⭐｜难度：中级｜项目：★★★

## 一句话总结

**enum 是 TypeScript 少数几个"生成运行时代码"的特性之一——数字枚举有反向映射、字符串枚举更安全但仍是 IIFE；越来越多的团队用 `as const` + `typeof` 替代 enum 以消除运行时开销。class 在 TS 中既当类型又当值——访问修饰符（private/protected/public）只在编译时检查，`implements` 只约束公有成员签名。**

## 核心机制

### enum：编译时类型，运行时有产物

TypeScript 的 enum 跟其他语言的枚举不同——它会**生成运行时代码**：

```typescript
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

// ↓ 编译后 ↓
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
  Direction[Direction["Left"] = 2] = "Left";
  Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));

// 结果：
// Direction.Up    → 0
// Direction[0]    → "Up"（反向映射！数字枚举特有）
```

**数字枚举**：自增、支持反向映射、默认从 0 开始。特点是运行时可以通过值查键名。

**字符串枚举**：每个成员必须初始化、无反向映射、运行时是普通对象：

```typescript
enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}
// 编译后依然是 IIFE，但没有反向映射
// Status.Pending → 'pending'
// Status['pending'] → undefined（字符串枚举无反查）
```

**const enum**：编译时直接内联值——**运行时代码消失**：

```typescript
const enum Color {
  Red = '#ff0000',
  Green = '#00ff00',
}

const bg = Color.Red;
// ↓ 编译后 ↓
// const bg = "#ff0000";  ← Color 不存在了，直接被替换为值
```

但 `const enum` 有兼容性问题——Babel 和 ESBuild 无法内联跨文件的 const enum（它们不读取 `.d.ts` 中不存在的常量），在 `isolatedModules` 下行为不一致。**新项目建议避免 const enum**。

### 为什么不推荐 enum？选择建议

| 特性 | 数字 enum | 字符串 enum | const enum | as const + typeof |
|------|----------|------------|------------|-------------------|
| 运行时产物 | IIFE | IIFE | 无（内联） | 无 |
| Tree-shaking | 差 | 差 | N/A | 优 |
| `isolatedModules` 兼容 | ✅ | ✅ | ❌ 跨文件有问题 | ✅ |
| 联合类型提取 | `Status` 即类型 | `Status` 即类型 | `Color` 即类型 | 需 `typeof` 提取 |
| 反向映射 | ✅ | ❌ | ❌ | ❌ |

**推荐选择顺序**：
1. 需要反向映射（通过数字查键名）→ 数字 enum
2. 被 enum 的值约束且 enum 只在当前文件内用 → const enum
3. 其他场景 → `as const` + `typeof`（零运行时、tree-shaking 友好）

### class 类型：既是值又是类型

class 在 TypeScript 中有双重身份——作为**值**（运行时构造函数）和作为**类型**（实例类型）：

```typescript
class User {
  name: string;
  private _age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this._age = age;
  }

  // 参数属性 —— 构造器里一行完成声明+赋值
  // constructor(public name: string, private _age: number) {}
  // 等价于上面的声明 + 赋值，是 TS 的语法糖
}

// User 作为类型
let user: User = new User('张三', 25);

// User 作为值（构造函数）
let UserCtor: typeof User = User;
```

### 访问修饰符：编译时检查，运行时全公开

```typescript
class Employee {
  public name: string;        // 默认 public，任何地方可访问
  private salary: number;     // 只有 Employee 内部可访问
  protected department: string; // Employee 及其子类可访问
  readonly id: number;        // 只读，初始化后不可改

  constructor(name: string, salary: number, dept: string, id: number) {
    this.name = name;
    this.salary = salary;
    this.department = dept;
    this.id = id;
  }
}

const emp = new Employee('张三', 10000, 'IT', 1);
emp.name;       // ✅
// emp.salary;  // ❌ 编译报错：属性"salary"为私有属性
// emp.id = 2;  // ❌ 编译报错：无法分配到 "id"，因为是只读

// ⚠️ 重要：private 只在 TS 编译时检查，运行时 salary 照样可以访问
// console.log(emp['salary']);   // 运行时 OK——TS 不会生成 # 私有字段
```

**`private` vs `#`（JS 硬私有字段）**：

| | `private` (TS) | `#` (JS) |
|---|---|---|
| 检查时机 | 编译时 | 运行时 |
| 运行时可绕过 | ✅ `obj['field']` | ❌ 无法访问 |
| 编译产物 | 完全消失 | 保留 WeakMap 兼容 |
| 继承后可见 | ❌ | ❌ |

面试中说到"封装"时，明确区分 TS 的 soft private 和 JS 的 hard private——TS 的 `private` 是"建议你不要碰"，`#` 是"你碰不到"。

### `implements` vs `extends`

```typescript
interface Runnable {
  run(): void;
}

interface Stoppable {
  stop(): void;
}

// implements：确保 class 实现了接口的公有成员签名
class Task implements Runnable, Stoppable {
  run() { console.log('running'); }
  stop() { console.log('stopped'); }
}

// extends：继承另一个类的实现
class TimedTask extends Task {
  constructor(private timeout: number) {
    super();
  }

  run() {
    setTimeout(() => super.run(), this.timeout);
  }
}
```

`implements` 不改变继承链——只做一层"类型合同的校验"。`extends` 建立原型链继承——子类拥有父类的所有公有和受保护成员。

**在结构类型系统下**：即使你不写 `implements Runnable`，只要 class 有 `run(): void` 方法，它就自动兼容 `Runnable` 类型。但显式写 `implements` 有两个好处：(1) 拼写错误时立即报错、(2) 代码意图更清晰。

## 项目实战

### 1. 后台表单 —— class 作为数据模型

```typescript
class RoleForm {
  constructor(
    public id: number = 0,
    public name: string = '',
    public code: string = '',
    public permissions: string[] = [],
  ) {}

  // 从 API 响应构建实例
  static fromResponse(data: Record<string, unknown>): RoleForm {
    return new RoleForm(
      data.id as number ?? 0,
      data.name as string ?? '',
      data.code as string ?? '',
      data.permissions as string[] ?? [],
    );
  }

  // 转为提交数据
  toSubmitData() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      permissions: this.permissions,
    };
  }

  // 动态计算
  get isEdit(): boolean {
    return this.id > 0;
  }
}

const form = RoleForm.fromResponse(response.data);
// form 有完整的方法和类型提示
```

### 2. as const 替代 enum 的实践

```typescript
// 后台管理系统——用 as const 定义操作类型
const OPERATION = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
} as const;

type Operation = (typeof OPERATION)[keyof typeof OPERATION];

function logOperation(type: Operation) {
  // type 精确为 'add' | 'edit' | 'delete' | 'export'
  console.log(`执行了 ${type} 操作`);
}

// 配合权限按钮组
const operations: { key: Operation; label: string; icon: string }[] = [
  { key: 'add', label: '新增', icon: 'plus' },
  { key: 'edit', label: '编辑', icon: 'edit' },
  // key 的类型约束保证不会写错
];
```

## 易错点

❌ **enum 的编译产物不可忽视**：一个 enum 声明的 IIFE 代码大约 200 字节。如果一个项目有 20 个 enum，就是 4KB 的额外代码。在性能敏感场景下用 `as const` 替代。

❌ **const enum 跨文件使用在 Babel 下失效**：`const enum` 的内联只在本文件生效。跨文件引用 const enum 时，Babel 无法读取 `.d.ts` 中的常量值，会保留 `Color.Red` 引用——运行时找不到 Color 对象而报错。

❌ **TS `private` 不等于 JS `#`**：运行时 `private` 字段可以被绕过——`obj['_privateField']` 可以访问。如果安全要求高（如框架内部状态），用 `#` 或 WeakMap。

❌ **class 不显式写 `implements` 也能通过类型检查**：因为 TS 是结构类型系统——只要 class 有对应的方法签名就行。但显式 `implements` 是自文档化 + 能在拼写失误时立即报错。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "enum 和 as const 怎么选" | 追问 enum 有运行时开销——as const 零成本 |
| "TS 的 private 和 JS 的 # 有什么区别" | 追问编译时 vs 运行时——`obj['field']` 绕过 private |
| "implements 和 extends 有什么区别" | 追问 implements 只约束公有签名、extends 建立原型链 |
| "为什么现在社区不太推荐 enum" | 追问 tree-shaking 差 + isolatedModules 兼容问题 |

## 相关阅读

- [TypeScript Handbook: Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [as const / const assertion](./as-const.md) —— enum 的最佳替代方案
- [基础类型 / 类型注解](./basic-types.md) —— class 类型的底层基础
- [类型兼容性](./structural-typing.md) —— class 在结构类型系统下如何判断兼容

## 更新记录

- 2026-07-14：新建——enum 编译产物 + const enum 陷阱 + class 访问修饰符 + implements vs extends
