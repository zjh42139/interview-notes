---
title: satisfies
description: satisfies 是 TypeScript 4.9 引入的操作符，用于在保持类型推断的同时校验类型兼容性，解决 const 断言和类型注解的局限性
category: TypeScript
type: mechanism
score: 0
difficulty: 初级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-18
reviewed: null
tags:
  - satisfies
  - 类型推断
  - const
---

# satisfies

> ⭐⭐⭐｜难度：初级

## 一句话总结

> `satisfies` 是 TypeScript 4.9 引入的类型检查操作符，写法 `value satisfies Type`，它**校验 value 符合 Type 定义但不改变 value 的推断类型**，让你既能享受类型检查的安全感，又能保留字面量等精确类型信息 —— 同时解决类型注解"太宽"和 `as const`"太死"两个痛点。

## 核心机制

### 问题的起源：类型注解 vs 字面量类型的矛盾

```typescript
// 场景：定义颜色映射表，需要保留具体的颜色值
const colors = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
};

// 问题1：不加类型注解 —— 属性名精确（keyof 是 'red' | 'green' | 'blue'）
//        但值被扩宽为 string，且没有任何结构约束（有人加个 number 值也不报错）
type R = typeof colors['red']; // string（const 对象的属性值会被扩宽，拿不到 '#ff0000'）

// 问题2：加类型注解 —— 结构安全了，但属性名精确度丢失
const colors2: Record<string, string> = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
};
type K2 = keyof typeof colors2; // string ❌ 丢失了 'red' | 'green' | 'blue'！
// 访问 colors2.yellow 也不报错——任何 string key 都合法

// 问题3：as const —— 保留了精确值，但完全写死了
const colors3 = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
} as const;
type R3 = typeof colors3['red']; // '#ff0000' ✅
// 但你不能约束"value 必须是 string"这个条件了
```

### satisfies 的解决方案

```typescript
// ✅ satisfies：两边都要
const colors = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
} satisfies Record<string, string>;

// 类型检查：值不符合 string 会报错
// 类型推断：结构保留，但值类型按原始推断——不加 as const 时 '#ff0000' 已被扩宽为 string
type Red = typeof colors['red']; // string（不是 '#ff0000'）
```

`satisfies` 的工作方式是：TypeScript 检查 `colors` 是否满足 `Record<string, string>`，但**不把 `colors` 的类型收窄为那个宽类型**。推断结果依然是 TS 从原始值推导出的 `{ red: string; green: string; blue: string; }`——属性名精确，值类型按正常推断规则（不加 `as const` 则扩宽为 `string`）。

> **要保留值字面量类型**：用 `as const satisfies` 组合。`as const` 负责收窄到字面量，`satisfies` 负责类型检查——两者叠加才同时拥有"精确值类型"和"类型约束"。

### satisfies vs 类型注解 vs as const 的对比表

| 特性 | 类型注解 | as const | satisfies |
|------|----------|----------|-----------|
| 类型安全检查 | ✅ | ❌ | ✅ |
| 保留属性名精确度 | ❌ 扩宽为宽类型 | ✅ 定死 | ✅ 保留 |
| 保留值字面量类型 | ❌ | ✅ | ❌（除非配合 as const） |
| 允许后续修改值 | ✅ | ❌ readonly | ✅ |
| 约束值类型 | ✅ | ❌ | ✅ |

### 深入一点的例子

```typescript
// satisfies 还能检查 key 的存在性
type RolePermissions = 'create' | 'read' | 'update' | 'delete';

const permissions = {
  admin: ['create', 'read', 'update', 'delete'],
  editor: ['create', 'read', 'update'],
  viewer: ['read'],
} satisfies Record<string, RolePermissions[]>;

// 即使写错了也不会被悄悄吞掉：
// permissions.admin[0] 类型是 RolePermissions（即 'create' | 'read' | 'update' | 'delete'），不是 string
// 要拿到单字面量 'create' 需配合 as const

// 更重要的是：访问 permissions.admin 时，属性名也是精确的
// 编辑器自动补全会提示 'admin' | 'editor' | 'viewer'
```

## 项目实战

### 1. 路由配置 —— satisfies 在 Vue Router 中的最佳实践

```typescript
// 不用 satisfies 的写法：手写 RouteRecordRaw 类型注解，丢失路径字面量
import type { RouteRecordRaw } from 'vue-router';

// ❌ 传统写法：path 类型是 string，无法用模板字面量类型做路径推导
const routes: RouteRecordRaw[] = [
  { path: '/user/list', name: 'UserList', component: () => import('@/views/user/List.vue') },
  { path: '/user/detail/:id', name: 'UserDetail', component: () => import('@/views/user/Detail.vue') },
];

// ✅ satisfies 写法：保留 path 的字面量类型，路由跳转时能精确推导
const routes = [
  {
    path: '/user/list' as const,
    name: 'UserList',
    component: () => import('@/views/user/List.vue'),
    meta: { title: '用户列表', icon: 'list', permission: 'user:list' },
  },
  {
    path: '/user/detail/:id' as const,
    name: 'UserDetail',
    component: () => import('@/views/user/Detail.vue'),
    meta: { title: '用户详情', hidden: true },
  },
] as const satisfies readonly RouteRecordRaw[];
// 注意：as const 后数组是 readonly 元组，satisfies 的目标必须写成 readonly RouteRecordRaw[]
// 写 satisfies RouteRecordRaw[]（可变数组）会直接编译报错

// 现在 router.push 时路径是精确字面量，重构路径时所有引用处自动报错
```

### 2. 表格列配置 —— 保留联合类型以便后续使用

```typescript
// Element Plus 后台管理系统中，表格列配置的 prop 需要精确推导
import type { TableColumnCtx } from 'element-plus';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 0 | 1 | 2;
}

// ✅ 用 satisfies 同时享受类型安全和精确 key
const columnsSpec = {
  id:    { prop: 'id' as const,    label: 'ID',     width: 80 },
  name:  { prop: 'name' as const,  label: '用户名',  width: 150 },
  email: { prop: 'email' as const, label: '邮箱',    width: 200 },
  role:  { prop: 'role' as const,  label: '角色',    width: 120 },
  status:{ prop: 'status' as const,label: '状态',    width: 100 },
} satisfies Record<keyof UserItem, { prop: keyof UserItem; label: string; width?: number }>;

// 关键收益：typeof columnsSpec['name']['prop'] 类型是 'name' 字面量，不是 string
// 这样后续写 formatter 时可以精确推导：
type ColumnProp = typeof columnsSpec[keyof typeof columnsSpec]['prop'];
// 'id' | 'name' | 'email' | 'role' | 'status'
```

### 3. 颜色/主题常量 —— 保留具体值供运行时使用

```typescript
// 后台系统的主题色彩定义
const themeColors = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399',
} as const satisfies Record<string, string>;

// as const 保留字面量，satisfies 校验"value 必须是 string"
const cssVariables = Object.entries(themeColors).map(([key, value]) => {
  // value 类型是 '#409EFF' | '#67C23A' | ... 的字面量联合，不是 string
  return `--el-color-${key}: ${value};`;
});
// ✅ readonly 只是不能改属性，不影响读取和模板字符串拼接
// （只写 satisfies 不加 as const 的话，value 会被扩宽为 string——检查还在，精度没了）
```

## 易错点

❌ **误以为 satisfies 可以替代类型注解**：`satisfies` 只做检查，不改变类型。如果你需要的是"这个变量就是这个类型"，用类型注解；如果你需要的是"检查但不影响推断"，用 `satisfies`。

```typescript
// ❌ 这样写，TypeScript 认为 keys 是 string[]，不是具体的字面量数组
const keys = ['id', 'name', 'email'] satisfies string[];
// typeof keys => string[]，不是 ('id' | 'name' | 'email')[]

// ✅ 想要保留字面量数组类型，用 as const
const keys = ['id', 'name', 'email'] as const satisfies readonly string[];
// typeof keys => readonly ['id', 'name', 'email']
```

❌ **误以为 `satisfies` 只检查顶层**：`satisfies` 会递归检查嵌套结构。如果你见过"嵌套没被约束"的现象，那是因为目标类型写得太宽（如 `Record<string, object>`——`object` 不约束任何属性），不是 `satisfies` 不递归。

```typescript
// 用具体类型就能看到递归检查效果：
const config = {
  api: { baseURL: 'https://api.example.com', timeout: 5000 },
} satisfies { api: { baseURL: string; timeout: string } };
//                                     ^^^^^^^ 报错！number 不能赋给 string
// ✅ 证明 satisfies 确实递归检查了嵌套结构

// 若换成 satisfies Record<string, object> 则不会报错——
// 因为 object 类型不约束任何属性，任何对象都满足它
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "satisfies 和 as 有什么区别" | 追问 satisfies 做类型检查但不改变推导类型——as 是强制断言 |
| "什么时候用 satisfies 而不是类型注解" | 追问需要保留字面量类型推导的场景 |
| "satisfies 和 const 断言有什么不同" | 追问 satisfies 做类型校验、as const 做只读收窄 |

## 相关阅读

- [TypeScript 4.9 Release Notes: satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- [utility-types](utility-types.md) —— 配合工具类型使用效果更佳
- [any-unknown-never](any-unknown-never.md) —— 类型安全体系的基石
- [keyof-mapped-conditional](keyof-mapped-conditional.md) —— 理解类型推断和类型收窄的底层原理

## 更新记录

- 2026-07-18：事实审计——修正"不加注解可保留值字面量"的错误结论（属性值会扩宽为 string）、路由示例改为 `satisfies readonly RouteRecordRaw[]`、主题色示例改为 as const satisfies 并删除"readonly 无法拼接"的错误说法、理顺嵌套检查易错点的表述
