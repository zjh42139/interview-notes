---
title: 模板字面量类型
description: TypeScript 4.1+ 模板字面量类型——字符串模式匹配、类型级字符串拼接、Capitalize/Uncapitalize 等内置工具
category: TypeScript
type: mechanism
score: 68
difficulty: 中高级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 模板字面量
  - 字符串体操
  - TS5
---

# 模板字面量类型

> ⭐⭐⭐｜难度：中高级｜TS4.1+ 新特性

**模板字面量类型是 TypeScript 4.1 引入的字符串类型操作——用 JavaScript 模板字符串语法在类型层面拼接、匹配、转换字符串。不少开源库（Nuxt/vue-router/Express）用它做类型级路由/事件名的推导。**

## 一句话总结

**模板字面量类型（`` type Greeting = `hello ${World}` ``）让类型系统能操作字符串——拼接、提取、转换大小写。配合 infer 和联合类型，可以实现类型层面的字符串 DSL。**

## 核心机制

### 基础——类型级字符串拼接

```typescript
type World = 'world'
type Greeting = `hello ${World}`  // "hello world"

// 联合类型自动分发（笛卡尔积）
type Color = 'red' | 'blue'
type Size = 'sm' | 'lg'
type Button = `btn-${Color}-${Size}`
// "btn-red-sm" | "btn-red-lg" | "btn-blue-sm" | "btn-blue-lg"
```

### TS 内置字符串工具类型

```typescript
type EventName = 'mouseClick'

// Uppercase / Lowercase / Capitalize / Uncapitalize（TS 4.1+）
type U = Uppercase<EventName>       // "MOUSECLICK"
type L = Lowercase<EventName>       // "mouseclick"
type C = Capitalize<EventName>      // "MouseClick" —— 首字母大写
type UC = Uncapitalize<EventName>   // "mouseClick" —— 首字母小写
```

### infer 配合模板字面量——提取模式

```typescript
// 提取 onXxx 事件的 Xxx 部分
type GetEventName<T> = T extends `on${infer Name}` ? Name : never
type Click = GetEventName<'onClick'>   // "Click"
type Change = GetEventName<'onChange'> // "Change"

// 提取路由参数
type ParseRoute<T extends string> =
  T extends `${string}/user/${infer Id}/${infer Action}`
    ? { id: Id; action: Action }
    : never
type R = ParseRoute<'/api/user/123/edit'>  // { id: "123"; action: "edit" }
```

### 递归模板字面量类型（TS 4.5+ 尾递归优化）

```typescript
// 将联合类型转为对象类型的 key 映射
type EventHandler<T extends string> = {
  [K in T as `on${Capitalize<K>}`]: (e: K) => void
}
// EventHandler<'click' | 'change'>
// → { onClick: (e: 'click') => void; onChange: (e: 'change') => void }
```

## 项目实战

### vue-router 类型级路由

```typescript
// 实际项目：路由路径字符串按模块分组类型推导
type RoutePath = '/user/profile' | '/user/settings' | '/admin/dashboard'

// 提取 /user/* 的子路由
type UserRoutes = Extract<RoutePath, `/user/${string}`>
// "/user/profile" | "/user/settings"
```

### 表单字段联动

```typescript
// 表单校验规则的类型安全映射
type FieldName = 'email' | 'password' | 'confirmPassword'
type ErrorKey = `${FieldName}Error`  // "emailError" | "passwordError" | "confirmPasswordError"
type FormErrors = Record<ErrorKey, string>

// 在组件中使用
const errors: FormErrors = {
  emailError: '',
  passwordError: '',
  confirmPasswordError: '',
}
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "TS 4.1 有什么新特性" | 追问模板字面量类型——写一个 onXxx 模式匹配的例子 |
| "怎么从字符串中提取类型" | 追问 infer + 模板字面量——"联合类型的自动分发" |

## 相关阅读

- [泛型](./generics.md)
- [extends / infer](./extends-infer.md)
- [keyof / mapped / conditional](./keyof-mapped-conditional.md)

## 更新记录

- 2026-07-16：新建——模板字面量类型 + 内置工具 + 项目实战
