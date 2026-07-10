---
title: any / unknown / never
description: any、unknown、never 是 TypeScript 中三个特殊但容易混淆的类型，分别代表任意值、未知值和永不存在的值
category: TypeScript
type: mechanism
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - any
  - unknown
  - never
  - 类型安全
---

# any / unknown / never

> ⭐⭐⭐⭐｜难度：初级｜项目：★★★★

## 一句话总结

> `any` 是类型系统的"后门"——直接放弃检查，赋值给别人或接收别人的赋值都畅通无阻（双向协变）；`unknown` 是类型安全的 `any`——你可以把任何东西赋给它，但要用它必须**先做类型收窄**；`never` 是"永远不会发生的类型"——它是 bottom type，在联合类型中自动消失，常用来做穷举检查。面试时别只说定义，要讲清楚**什么时候用、为什么这样设计**。

## 核心机制

### any：类型系统的"逃生舱"

```typescript
// any 的双向协变 —— 可以赋给任何类型，也可以接收任何类型的赋值
let a: any = 42;
let str: string = a;    // ✅ any 赋给 string，不报错
let num: number = a;    // ✅ any 赋给 number，不报错
a = 'hello';             // ✅ 任何类型赋给 any，不报错
a.foo.bar.baz();         // ✅ 访问不存在的属性，不报错
a();                     // ✅ 当成函数调用，不报错

// 本质：any 关闭了该变量的所有类型检查，相当于回到了 JavaScript
```

any 的问题不是它本身，而是**传染性**：一旦你在一个地方用了 any，任何消费它的变量也跟着失去类型安全。一个 `JSON.parse()` 不约束返回值，整个数据流都是 any。

面试话术："any 在快速原型、渐进式迁移 JS 项目时有用，但生产代码里出现 any 应该是一个红灯信号。"

### unknown：类型安全的 any

```typescript
// unknown 只能被赋值，不能赋值给其他类型（需要类型收窄）
let u: unknown = 42;
u = 'hello';             // ✅ 任何类型都能赋给 unknown
u = { name: 'foo' };     // ✅

let s: string = u;       // ❌ unknown 不能赋给 string！
let n: number = u;       // ❌ unknown 不能赋给 number！

// ✅ 必须先收窄类型再使用
if (typeof u === 'string') {
  let s: string = u;     // ✅ 这个块里 u 被收窄为 string
}

// 未知值也是安全的
u.foo.bar;               // ❌ 不能直接访问 unknown 的属性
u();                     // ❌ 不能直接调用 unknown
```

`unknown` 的设计哲学：先用 unknown 接收一切，然后用类型守卫验证后使用。这是"信任但验证"（trust but verify）的类型化体现。

### never：永不发生的类型

```typescript
// never 是 bottom type —— 可以赋值给任何类型（但实际运行时永远不会有值）
function throwError(message: string): never {
  throw new Error(message);   // 函数永远不会正常返回
}

function infiniteLoop(): never {
  while (true) {}              // 永远执行不完
}

// never 在联合类型中自动消失
type A = string | never;       // string —— never 被吞掉了
type B = number | never;       // number
type C = never | never;        // never

// 为什么？因为联合类型的语义是"可能是这些中的某一个"
// 永远不可能出现的那个分支自然就消失了，这符合直觉
```

关键认知：`void` 是"没有有意义的值"（函数正常返回了但返回 undefined），`never` 是"永远不会返回到调用点"（抛异常或死循环）。

### 三者的层次关系

从类型系统的角度，这三个类型形成了一个"允许范围"的递进：

```
any        —— 放弃一切检查（最不安全）
  ↑
unknown    —— 需要类型收窄才能用（安全）
  ↑
具体类型    —— 如 string、number、自定义 interface
  ↑
never      —— 什么都没有（bottom type，可以赋给任何类型）
```

面试加分点：TypeScript 的类型系统中，`unknown` 是 top type（所有类型都是 unknown 的子类型），`never` 是 bottom type（never 是所有类型的子类型）。这和集合论的"全集"与"空集"的概念对应。

## 深度拓展

### 追问1：unknown 有哪几种类型收窄方式？

实际开发中四种常用方式：

```typescript
function handle(response: unknown) {
  // 方式1：typeof 基础类型判断
  if (typeof response === 'string') {
    console.log(response.toUpperCase()); // string
  }
  // 方式2：instanceof 判断类的实例
  if (response instanceof Date) {
    console.log(response.getFullYear()); // Date
  }
  // 方式3：自定义 type guard（type predicate）
  if (isUserResponse(response)) {
    console.log(response.data.name);     // ApiResponse<User>
  }
  // 方式4：as 断言（最不推荐，但某些场景下很实用）
  const data = response as ApiResponse<User>;
}
```

### 追问2：never 的实际应用有哪些？

**1. 穷举检查（exhaustive check）——永远不会执行到的 else 分支：**

```typescript
type Status = 'pending' | 'approving' | 'approved' | 'rejected';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending':   return '待处理';
    case 'approving': return '审批中';
    case 'approved':  return '已通过';
    case 'rejected':  return '已驳回';
    default: {
      // 如果 Status 未来加了新值，这里会编译报错
      const _exhaustive: never = status; // ✅ 所有分支覆盖时，status 是 never
      return _exhaustive;
    }
  }
}
```

这是最实用的 never 用法：当你确保所有联合类型的成员都被处理完了，剩余分支中变量的类型就是 never。如果有人往 Status 里加了 `'archived'`，这个 default 分支就会报错，提醒你漏了一个 case。这就是**编译期强制穷举**。

**2. 条件类型中过滤类型：**

```typescript
// 利用 never 在联合类型中消失的特性实现类型过滤
type NonNullable<T> = T extends null | undefined ? never : T;
type FilterNumber<T> = T extends number ? never : T;

type Result = FilterNumber<string | number | boolean>; // string | boolean
// number 被映射为 never，然后在联合类型中消失
```

**3. 阻止意外的赋值：**

```typescript
// 定义一个"不可赋值"的占位类型
type NoInfer<T> = [T][T extends any ? 0 : never];

// 用在泛型约束中，阻止某些类型参数的推断
function create<T extends object>(obj: T & { id: never }): void {}
// create({ id: 1 })  ❌ 报错：id 不能有值
```

### 追问3：为什么要避免 any？

三个层面的原因：

1. **安全层面**：any 关掉所有类型检查，一个 `.foo.bar` 就能在运行时炸掉，完全违背了用 TypeScript 的初衷。
2. **维护层面**：any 传染性强，污染类型推导链。一个 `JSON.parse()` 返回 any，整个数据处理链路的类型都废了。
3. **IDE 体验层面**：any 变量没有智能补全、没有重构支持、没有"查找引用"。

替代方案：能用 `unknown` + 类型守卫就不用 any；能用泛型就不用 any；能用 `Record<string, unknown>` 就不用 `any`。

## 项目实战

### 1. API 响应先用 unknown 再用类型守卫验证

```typescript
// Vue3 + Element Plus 后台系统中，封装 axios 请求
import axios, { AxiosError } from 'axios';

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// ✅ 关键：响应数据先用 unknown 接收
async function request<T>(url: string): Promise<T> {
  try {
    // axios 的 response.data 默认是 any
    // 我们用泛型约束返回值，但内部仍然需要验证
    const response = await axios.get<ApiResponse<T>>(url);

    // 类型守卫验证响应结构
    if (!isValidResponse(response.data)) {
      throw new Error('接口返回数据结构异常');
    }

    return response.data.data;
  } catch (error: unknown) {  // ✅ catch 的 error 用 unknown
    if (error instanceof AxiosError) {
      // 在这里 error 被收窄为 AxiosError，可以访问 response、status 等属性
      ElMessage.error(`请求失败：${error.message}`);
    } else if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('未知错误');
    }
    throw error;
  }
}

// 类型守卫：运行时验证 API 响应结构
function isValidResponse(data: unknown): data is ApiResponse<unknown> {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.code === 'number' && 'data' in d && typeof d.message === 'string';
}
```

### 2. 错误处理中 catch (e: unknown) 的规范写法

```typescript
// TS 4.0+ 支持 catch 子句中声明 unknown 类型
// 这是推荐的写法，因为抛出的不一定是 Error 实例

async function submitForm(formData: CreateRoleForm) {
  try {
    await roleApi.create(formData);
    ElMessage.success('创建成功');
  } catch (error: unknown) {
    // 类型安全的错误处理流水线
    if (error instanceof AxiosError) {
      const serverMsg = error.response?.data?.message;
      ElMessage.error(serverMsg || '服务器错误');
    } else if (error instanceof Error) {
      ElMessage.error(error.message);
    } else if (typeof error === 'string') {
      ElMessage.error(error);
    } else {
      ElMessage.error('操作失败，请稍后重试');
    }
    // 统一上报错误日志
    console.error('[RoleCreate]', error);
  }
}
```

### 3. 权限路由中的穷举检查

```typescript
// 后台管理系统中的路由权限类型
type PermissionLevel = 'admin' | 'editor' | 'viewer' | 'guest';

function getMenuAccess(level: PermissionLevel): string[] {
  switch (level) {
    case 'admin':  return ['dashboard', 'users', 'roles', 'settings'];
    case 'editor': return ['dashboard', 'users', 'roles'];
    case 'viewer': return ['dashboard', 'users'];
    case 'guest':  return ['dashboard'];
    default: {
      // ✅ 穷举检查：如果 PermissionLevel 增加新角色
      // 这里会编译报错，强制开发者为新角色定义菜单权限
      const _check: never = level;
      throw new Error(`未处理的权限级别: ${_check}`);
    }
  }
}
```

### 4. Pinia Store 中的 unknown 类型参数

```typescript
// Pinia action 接收外部数据时，用 unknown + 类型守卫
export const useNoticeStore = defineStore('notice', () => {
  const notices = ref<Notice[]>([]);

  function loadFromCache(data: unknown) {
    // 不是直接就 data as Notice[]，而是先验证
    if (Array.isArray(data) && data.every(isNotice)) {
      notices.value = data; // ✅ 验证通过后才赋值
    } else {
      console.warn('缓存数据格式异常，已丢弃');
    }
  }

  return { notices, loadFromCache };
});

// 运行时类型守卫：验证对象是否是 Notice 类型
function isNotice(obj: unknown): obj is Notice {
  if (typeof obj !== 'object' || obj === null) return false;
  const n = obj as Record<string, unknown>;
  return typeof n.id === 'number'
    && typeof n.title === 'string'
    && typeof n.content === 'string';
}
```

## 易错点

❌ **catch 不声明类型就是 any**：在开启了 `useUnknownInCatchVariables` 的 strict 模式下，catch 的 error 默认是 unknown；否则默认是 any。**永远显式写 `catch (e: unknown)`**。

```typescript
// ❌ 危险：strict 模式未开启时，error 是 any
try { /*...*/ } catch (error) {
  console.log(error.message); // any，运行时报错也不提示
}

// ✅ 正确：显式声明 unknown
try { /*...*/ } catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```

❌ **以为 void 和 never 一样**：`void` 表示函数返回了（只是返回的是 undefined 或无意义的值），`never` 表示函数根本不会返回到调用点。

```typescript
// ❌ 常见混淆
function fn1(): void { return; }      // 正常返回了 undefined
function fn2(): never { throw ''; }   // 永远不会返回到调用者

const r1 = fn1(); // r1 类型是 void  ✅
const r2 = fn2(); // r2 类型是 never ✅，但代码执行不到这里
```

❌ **用 `as any` 绕过类型错误**：这是最常见的坏习惯。`as any` 把问题藏起来而不是解决掉。

```typescript
// ❌ 掩耳盗铃
const data = response as any;
data.user.profile.name; // 运行时可能炸，编译期完全不管

// ✅ 正确的处理方式
if (isValidResponse(response)) {
  const data = response; // 类型守卫后 data 类型安全
}
```

❌ **`never` 不能赋值给其他类型（方向反了）**：never 可以赋值给任何类型（因为它是 bottom type），但没有值可以赋给 never（除非你断言或抛异常）。

```typescript
let n: never;
let s: string = n;    // ✅ never 赋给 string
let n2: never = s;    // ❌ string 不能赋给 never
n = 1 as never;       // ✅ 强制断言可以
```

## 相关阅读

- [TypeScript Handbook: any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any)
- [TypeScript Handbook: unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)
- [TypeScript Handbook: never](https://www.typescriptlang.org/docs/handbook/2/functions.html#never)
- [utility-types](utility-types.md) —— 工具类型中大量使用 never 做条件类型过滤
- [satisfies](satisfies.md) —— satisfies 和 unknown 都是"类型安全"理念的体现
- [generics](generics.md) —— 泛型约束中经常涉及 never 的用法
