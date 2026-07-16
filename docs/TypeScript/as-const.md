---
title: as const / const assertion
description: TypeScript 的 as const（const 断言）将类型收窄到最精确的字面量类型 + readonly，是枚举替代和常量化配置的核心工具
category: TypeScript
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - as const
  - const assertion
  - 字面量类型
  - enum 替代
---

# as const / const assertion

> ⭐⭐⭐｜难度：中级

## 一句话总结

**`as const` 做三件事：把每个值收窄到最精确的字面量类型、给所有属性加上 `readonly`、把数组变成只读元组。它跟 `satisfies` 互补——一个定死类型一个验证类型，`as const satisfies` 组合写法在项目中越来越常见。**

## 核心机制

### as const 做三件事

```typescript
// 没有 as const —— 类型很宽
const colors1 = {
  red: '#ff0000',
  green: '#00ff00',
};
// typeof colors1 = { red: string; green: string; }
// colors1.red = '#abc'; ✅ 可以改

// 有 as const —— 类型精确到字面量
const colors2 = {
  red: '#ff0000',
  green: '#00ff00',
} as const;
// typeof colors2 = { readonly red: "#ff0000"; readonly green: "#00ff00"; }
// colors2.red = '#abc'; ❌ 只读
```

逐个拆解三件事：

**① 值收窄为字面量类型**：`'#ff0000'` 不是 `string`，而是字面量类型 `'#ff0000'`。这意味着 TS 知道 `colors2.red` 的精确值。

**② 所有属性加 `readonly`**：递归作用于所有嵌套对象和数组——深层的值也不能改。

**③ 数组变只读元组**：

```typescript
const arr = ['admin', 'editor', 'viewer'] as const;
// typeof arr = readonly ['admin', 'editor', 'viewer']
// 每个元素是字面量类型、数组长度固定、不能再 push

const first = arr[0];   // 'admin'（不是 string！）
const len = arr.length;  // 3（不是 number！）
```

### typeof 提取 as const 的类型

`as const` 精确了值的类型后，用 `typeof` 反过来提取这个精确类型：

```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number];
// 'admin' | 'editor' | 'viewer'

const PERMISSIONS = {
  ADMIN: 'admin' as const,
  EDITOR: 'editor' as const,
  VIEWER: 'viewer' as const,
};
type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
// 'admin' | 'editor' | 'viewer'
```

这个模式非常实用——**从值推导类型**，避免了值和类型重复定义。改配置只改一处，类型自动同步。

### as const vs enum

`as const` 是越来越多团队替代 TypeScript enum 的方式：

```typescript
// enum 方式 —— 生成运行时代码
enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}
// 编译后：var Status; (function(Status) { ... })(Status || (Status = {}));
// → 额外的 IIFE 代码，影响 tree-shaking

// as const 方式 —— 零运行时开销
const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
// 'pending' | 'approved' | 'rejected'
// 编译后：完全消失，只有 'pending' | 'approved' | 'rejected' 字面量
// → Tree-shaking 友好、运行时代码更小
```

| | enum | as const + type |
|---|------|-----------------|
| 运行时产物 | 额外的 IIFE 代码 | 无（零成本） |
| 反向映射 | 数字枚举有 | 无（但很少需要） |
| Tree-shaking | 差 | 优 |
| `isolatedModules` 兼容 | const enum 有问题 | 完全兼容 |
| 联合类型推断 | 自动 | 需要 typeof 提取 |

> 推荐：新项目用 `as const` + `typeof` 替代 enum，除非你需要数字枚举的反向映射。const enum 在 `isolatedModules` 下行为不一致，Babel/ESBuild 直接忽略。

### as const + satisfies 组合

一个变量先被 `as const` 收窄，再被 `satisfies` 检查：

```typescript
const themeColors = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
} as const satisfies Record<string, `#${string}`>;

// 双重效果：
// 1. as const: typeof themeColors.primary = '#409EFF'（字面量）
// 2. satisfies: 确保所有 value 都是 # 开头的字符串
// 3. 遍历时每个 value 精确到字面量，不是 string

// as const satisfies 组合在数组中的使用
const KEYS = ['id', 'name', 'email'] as const satisfies readonly string[];
type Key = (typeof KEYS)[number]; // 'id' | 'name' | 'email'
// satisfies 确保每个元素都是 string（如果有人写了个 number 就报错）
// as const 保留字面量类型
```

## 项目实战

### 1. 路由配置的精确类型

```typescript
// 后台管理的路由路径——既要约束类型，又要保留字面量
const routePaths = {
  USER_LIST: '/system/user/list',
  USER_DETAIL: '/system/user/detail/:id',
  ROLE_LIST: '/system/role/list',
} as const satisfies Record<string, string>;

type RoutePath = (typeof routePaths)[keyof typeof routePaths];
// '/system/user/list' | '/system/user/detail/:id' | '/system/role/list'

// router.push 时参数精确推导
function navigateTo(path: RoutePath) {
  router.push(path);  // 自动补全所有路径
}
```

### 2. 状态映射表

```typescript
const STATUS_MAP = {
  0: { text: '待审核', color: 'warning' },
  1: { text: '已通过', color: 'success' },
  2: { text: '已驳回', color: 'danger' },
} as const;

type StatusCode = keyof typeof STATUS_MAP;         // 0 | 1 | 2
type StatusText = (typeof STATUS_MAP)[StatusCode]['text'];
// '待审核' | '已通过' | '已驳回'

function getStatusLabel(code: StatusCode): StatusText {
  return STATUS_MAP[code].text;  // 返回值精确到字面量
}
```

### 3. 权限字典——const 替代 enum

```typescript
const PERMISSION = {
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  ROLE_VIEW: 'role:view',
  ROLE_MANAGE: 'role:manage',
} as const;

type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];

// 使用：完全的类型安全 + 零运行时开销
function checkPermission(permission: Permission): boolean {
  return userPermissions.value.includes(permission);
  // permission 有完整的字面量类型，不会写错
}
```

## 易错点

❌ **把 `as const` 当 `readonly` 用**：`as const` 比 `readonly` 更强——它除了加只读，还把类型收窄到字面量。如果你只需要只读不要字面量收窄，用 `Readonly<T>` 或 `readonly` 关键字。

❌ **`as const` 后无法 push 数组**：数组变成只读元组后 `push`/`pop`/`sort` 全部失效——如果需要可变数组，用 `readonly` 类型注解替代。

❌ **`as const` 不阻止类型层面的约束**：即使用了 `as const`，如果配合 `satisfies Record<string, string>`，value 的类型会受 `string` 约束——`satisfies` 只检查，不改变类型推断。

❌ **`const enum`** 在 `isolatedModules` 或 Babel/ESBuild 编译时行为不一致——跨项目不建议使用，用 `as const` + `typeof` 替换。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "as const 做了什么" | 追问字数面量类型 + readonly + 数组变元组三件事 |
| "as const 和 enum 怎么选" | 追问零运行时开销 + tree-shaking 优势 |
| "as const 和 satisfies 怎么配合" | 追问 as const satisfies 双重效果——约束 + 保留字面量 |

## 相关阅读

- [TypeScript Handbook: const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- [基础类型 / 类型注解](./basic-types.md) —— 字面量类型的前置知识
- [satisfies](./satisfies.md) —— 与之互补的类型检查操作符
- [类型收窄](./type-narrowing.md) —— 与之同属于"让类型更精确"的语义范畴
- [enum / class 类型](./enum-class.md) —— enum 的详细对比和选择建议

## 更新记录

- 2026-07-14：新建——as const 三件事 + 与 enum 对比 + 与 satisfies 组合 + 项目实战
