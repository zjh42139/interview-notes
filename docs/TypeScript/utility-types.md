---
title: Utility Types
description: TypeScript 内置的工具类型如 Partial、Pick、Omit、Record、ReturnType 等，是日常开发中最常用的类型操作手段
category: TypeScript
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-18
reviewed: null
tags:
  - Partial
  - Pick
  - Omit
  - Record
  - ReturnType
---

# Utility Types

> ⭐⭐⭐⭐⭐｜难度：中级

## 一句话总结

> TypeScript 内置工具类型（Partial、Required、Readonly、Pick、Omit、Record、Exclude、Extract、NonNullable、ReturnType、Parameters 等）本质上是**泛型 + 映射类型 + 条件类型的组合体操**，让你不需要手写重复的类型变换逻辑，直接用内置"工具函数"操作类型系统。面试时别只背 API，要能说出它们的实现原理和项目里怎么用。

## 核心机制

工具类型不是黑魔法，它们的源码你完全可以用 TypeScript 手写出来。理解源码是面试加分项。

### 1. 映射类型家族 —— 基于已有类型变换属性

```typescript
// Partial: 所有属性变可选
// 源码: [P in keyof T]?: T[P]
type Partial<T> = { [P in keyof T]?: T[P] };

// 举例
interface User { id: number; name: string; email: string; }
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

// Required: 所有属性变必填，-? 移除可选修饰符
type Required<T> = { [P in keyof T]-?: T[P] };

// Readonly: 所有属性变只读
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```

关键点：`keyof T` 拿到 T 的所有 key 的联合类型，`[P in keyof T]` 是映射类型语法，逐个遍历每个 key 生成新属性。`?` 和 `readonly` 是属性修饰符，`-` 前缀表示移除。

### 2. Pick 和 Omit —— 选取和排除属性

```typescript
// Pick<T, K>: 从 T 中挑出 K 指定的属性
// 源码: [P in K]: T[P]，K 必须 extends keyof T
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// Omit<T, K>: 从 T 中排除 K 指定的属性
// 源码: Pick<T, Exclude<keyof T, K>>
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// 举例
interface User { id: number; name: string; email: string; password: string; }
type PublicUser = Omit<User, 'password'>;   // { id; name; email; }
type UserPreview = Pick<User, 'id' | 'name'>; // { id; name; }
```

面试要点：Pick 的 K 约束为 `extends keyof T`，所以你只能 Pick 存在的属性，写错属性名编辑器直接报错。Omit 的 K 约束是 `extends keyof any`（即 `string | number | symbol`），所以你可以 Omit 不存在的属性而不报错 —— 这是有意为之的宽松设计。

### 3. Record —— 构造键值对类型

```typescript
// Record<K, V>: 构造一个对象类型，键是 K，值是 V
// 源码: [P in K]: V
type Record<K extends keyof any, V> = { [P in K]: V };

// 举例
type PageMode = 'list' | 'detail' | 'create';
type PageConfig = Record<PageMode, { title: string; icon: string }>;
// { list: {title;icon}; detail: {title;icon}; create: {title;icon}; }
```

Record 在项目中非常实用：权限映射、状态映射、配置字典，凡是"key 固定、value 结构统一"的场景都用它。

### 4. 条件类型家族 —— 基于类型关系的筛选

```typescript
// Exclude<T, U>: 从 T 中排除可以赋值给 U 的类型
// 源码: T extends U ? never : T
// 关键：分布式条件类型 —— 当 T 是联合类型时，会逐个分发判断
type Exclude<T, U> = T extends U ? never : T;

// Extract<T, U>: 从 T 中提取可以赋值给 U 的类型
type Extract<T, U> = T extends U ? T : never;

// NonNullable<T>: 从 T 中排除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T;
// TS 4.8 起官方实现简化为交叉类型：type NonNullable<T> = T & {}
// {} 表示"任何非 null/undefined 的值"，交叉后同样排除 null | undefined

// 举例
type A = Exclude<'a' | 'b' | 'c', 'a' | 'b'>;  // 'c'
type B = Extract<'a' | 'b' | 'c', 'a' | 'c'>;   // 'a' | 'c'
type C = NonNullable<string | null | undefined>; // string
```

分布式条件类型的核心：**裸类型参数** `T extends U ? X : Y` 中，如果 T 是联合类型，条件会被分发到每个成员上分别判断，结果再合并为联合类型。这是面试最爱追问的点。注意：如果 T 被包裹（如 `[T] extends [U]`），则不会触发分发。

### 5. infer 推断家族 —— 从函数类型中提取

```typescript
// ReturnType<T>: 获取函数返回值类型
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

// Parameters<T>: 获取函数参数类型（元组）
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// 举例
declare function getUser(id: number): Promise<{ name: string }>;
type Resp = ReturnType<typeof getUser>;          // Promise<{ name: string }>
type Params = Parameters<typeof getUser>;         // [id: number]
```

`infer R` 是条件类型中的"类型变量声明"，TypeScript 自动推断出 R 的具体类型。这在写泛型工具库时非常常用。

### 补充：另外 5 个内置 Utility Types 手写

```typescript
// 12. Awaited<T> —— 递归展开 Promise 层
type MyAwaited<T> =
  T extends null | undefined ? T :
  T extends Promise<infer R> ? MyAwaited<R> : T
// 简化版：官方 Awaited 匹配的是任意 thenable（带 then 方法的对象），
// 用 infer 提取 then 的 onfulfilled 回调参数类型，而不是只认 Promise

type A1 = MyAwaited<Promise<string>>          // string
type A2 = MyAwaited<Promise<Promise<number>>>  // number（递归展开）
// 面试常问：Awaited 为什么不直接展开一层？——因为 async/await 会递归展开

// 13. InstanceType<T> —— 从构造函数提取实例类型
type MyInstanceType<T extends new (...args: any) => any> =
  T extends new (...args: any) => infer R ? R : never

class User { constructor(public name: string, public age: number) {} }
type UserInstance = MyInstanceType<typeof User>  // User

// 14. ConstructorParameters<T> —— 从构造函数提取参数元组
type MyConstructorParameters<T extends new (...args: any) => any> =
  T extends new (...args: infer P) => any ? P : never

type UserParams = MyConstructorParameters<typeof User>  // [name: string, age: number]
// 注意：ConstructorParameters 和 Parameters 不同——前者用于构造函数，后者用于普通函数

// 15. ThisParameterType<T> —— 提取函数的 this 类型
type MyThisParameterType<T extends (...args: any) => any> =
  T extends (this: infer U, ...args: any[]) => any ? U : unknown

function greet(this: { name: string }) { return `Hi ${this.name}` }
type ThisType = MyThisParameterType<typeof greet>  // { name: string }

// 16. OmitThisParameter<T> —— 移除函数的 this 参数
type MyOmitThisParameter<T> =
  T extends (this: any, ...args: infer P) => infer R
    ? (...args: P) => R
    : T

// 作用：拿到不依赖 this 的纯函数签名
// type PureGreet = MyOmitThisParameter<typeof greet>  // () => string
```

**面试提示**：这 5 个类型的面试频率不如 Partial/Pick/Omit/Record 高，但 `Awaited`（递归 + 分布式）和 `InstanceType`（`infer` + extends 构造函数签名）是类型体操的经典考察点。

## 深度拓展

### 追问1：深层工具类型怎么实现？

内置的工具类型只做浅层变换。深层版本需要递归：

```typescript
// DeepPartial: 递归地将所有层级属性变为可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// DeepReadonly: 递归地将所有层级属性变为只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 项目用例：表单草稿保存时，深层 partial 让所有字段可选
interface FormState {
  basic: { name: string; age: number; };
  address: { city: string; street: string; };
}
type Draft = DeepPartial<FormState>;
// 可以只保存 basic.name 而其他全空
```

### 追问2：自定义工具类型的实战

```typescript
// 提取所有非可选 key —— 找出哪些字段是必填的
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// 提取所有可选 key
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// 只保留必填属性
type OnlyRequired<T> = Pick<T, RequiredKeys<T>>;

// 实际效果
interface User { id: number; name: string; email?: string; age?: number; }
type RequiredUserFields = RequiredKeys<User>;   // 'id' | 'name'
type OptionalUserFields = OptionalKeys<User>;   // 'email' | 'age'
```

原理说明：`{} extends Pick<T, K>` 只有在 Pick<T, K> 是 `{}`（所有属性都可选）时才成立，这意味着 K 这个属性是可选的。这是判断可选属性的一个 trick。

### 追问3：工具类型如何组合使用？

```typescript
// 实际场景：API 列表接口返回的分页数据
interface User { id: number; name: string; email: string; createdAt: Date; }
type ListItem = Pick<User, 'id' | 'name' | 'createdAt'>;
type CreateUser = Omit<Partial<User>, 'id'>;  // 创建时 id 自动生成，其他可填
type UpdateUser = Partial<Omit<User, 'id'>> & { id: number }; // 更新时 id 必填
```

## 项目实战

在 Vue3 + Element Plus 后台管理系统中，工具类型无处不在：

### 1. 表单数据类型派生

```typescript
// 实体完整类型 —— 对应数据库 schema
interface Role {
  id: number;
  name: string;
  code: string;
  permissions: string[];
  status: 0 | 1;
  createdAt: string;
  updatedAt: string;
}

// 创建表单：id 和时间字段不需要，所有字段可选以支持分步填写
type CreateRoleForm = Omit<Partial<Role>, 'id' | 'createdAt' | 'updatedAt'>;

// 编辑表单：id 必须，其他可选（部分更新）
type EditRoleForm = Pick<Role, 'id'> & Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>;

// 列表展示：只取需要的字段
type RoleListItem = Pick<Role, 'id' | 'name' | 'code' | 'status'>;

// 在组件中使用
import { reactive, ref } from 'vue';
import type { FormInstance } from 'element-plus';

const formRef = ref<FormInstance>();
const formData = reactive<EditRoleForm>({
  id: 0,
  name: '',
  code: '',
});
```

这样类型定义和数据库实体始终保持一致，实体加字段只需改一处，所有派生类型自动更新。

### 2. API 响应类型包装

```typescript
// 后端统一响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 分页响应
interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用 ReturnType 提取函数返回值
async function fetchRoles(): Promise<ApiResponse<PageResponse<Role>>> {
  return request.get('/api/roles');
}
type RoleListResp = Awaited<ReturnType<typeof fetchRoles>>;
// ReturnType 拿到的是 Promise<ApiResponse<...>>，再套一层 Awaited 才是响应体类型
```

### 3. Pinia State 类型定义

```typescript
// store 中用 Partial 做状态重置
interface UserState {
  userInfo: User | null;
  token: string;
  permissions: string[];
}

const initialState: UserState = {
  userInfo: null, token: '', permissions: [],
};

export const useUserStore = defineStore('user', () => {
  const state = reactive<UserState>({ ...initialState });

  // 重置方法：用 Partial 支持只重置部分字段
  function resetState(patch?: Partial<UserState>) {
    const target = patch ? { ...initialState, ...patch } : initialState;
    Object.assign(state, target);
  }

  return { state, resetState };
});
```

### 4. 表格列配置用 Record

```typescript
// Element Plus 表格列配置的类型安全写法
type ColumnAlign = 'left' | 'center' | 'right';
type ColumnFixed = 'left' | 'right';

interface TableColumn {
  prop: string;
  label: string;
  width?: number;
  align?: ColumnAlign;
  fixed?: ColumnFixed;
  sortable?: boolean;
}

// 列配置字典：key 是字段名，value 是列配置
type RoleColumns = Record<keyof RoleListItem, TableColumn>;

const columns: RoleColumns = {
  id:    { prop: 'id',   label: 'ID',   width: 80,  align: 'center' },
  name:  { prop: 'name', label: '角色名', width: 150 },
  code:  { prop: 'code', label: '角色编码', width: 150 },
  status:{ prop: 'status', label: '状态', width: 100, align: 'center' },
};
// keyof RoleListItem 保证列配置和实体字段一一对应，多/少字段都会报错
```

## 易错点

❌ **以为 Partial 是深层的**：`Partial<{a: {b: string}}>` 只会让 a 可选，a.b 仍然是必填的 `string`。深层需要 `DeepPartial`。

```typescript
// ❌ 误区
type T = Partial<{ a: { b: string } }>;
const obj: T = {};         // ok
const obj2: T = { a: {} }; // ❌ 报错！a.b 缺了 string

// ✅ 正确理解：Partial 只影响第一层
```

❌ **Omit 删不掉不存在的属性但不报错**：因为 Omit 的 K 约束是 `keyof any` 而不是 `keyof T`，所以 `Omit<User, 'xxx'>` 不会报错，只是啥也不干。

```typescript
interface User { id: number; name: string; }
type T = Omit<User, 'hahaha'>; // ❌ 不报错，但也没意义
// ✅ 想要严格约束：自己包装一层
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
```

❌ **把 Record 当 Map 用**：Record 是对象类型，key 只能是 `string | number | symbol`，不能是对象、数组等引用类型。需要真正的 Map 请用 `Map<K, V>`。

❌ **Exclude 只在 T 是裸类型参数时才分发**：

```typescript
type T1 = Exclude<'a' | 'b', 'a'>;                // 'b' ✅
type T2 = 'a' | 'b' extends 'a' ? never : 'a' | 'b'; // 'a' | 'b' ❌ 不分发！

// ✅ 区别在于：Exclude 的 T 是泛型参数，触发分发；直接写联合类型不会分发
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Partial、Required、Pick、Omit 怎么实现" | 追问 mapped type + keyof 的基础组合 |
| "ReturnType 和 Parameters 的原理" | 追问 infer 在条件类型中提取函数签名 |
| "Exclude 和 Extract 怎么用" | 追问分发条件类型——`T extends U ? never : T` 的联合类型遍历 |

## 相关阅读

- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [generics](generics.md) —— 工具类型的泛型基础
- [keyof-mapped-conditional](keyof-mapped-conditional.md) —— keyof / 映射类型 / 条件类型的深入讲解
- [extends-infer](extends-infer.md) —— extends 条件分发和 infer 类型推断
- [satisfies](satisfies.md) —— 4.9 新操作符，和类型注解的区别
- [any-unknown-never](any-unknown-never.md) —— 特殊类型的对比理解

## 更新记录

- 2026-07-18：事实审计——NonNullable 补 TS 4.8 官方实现 `T & {}`、Awaited 补 thenable 说明、ConstructorParameters 示例改为带构造器参数的 class（原注释与实际推断不符）、ReturnType 示例补 Awaited 解包、补 ref 导入、getUser 改为 declare function
