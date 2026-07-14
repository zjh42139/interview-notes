---
title: as const / satisfies 面试回答
description: 面试中如何回答 as const 和 satisfies——const 断言三件事、与 enum 对比、与 satisfies 的互补关系
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: draft
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - TypeScript
  - as const
  - satisfies
  - 面试回答
---

# as const / satisfies 面试回答

> as const 和 satisfies 是 TS 4.x 引入的两个"让类型更精确"的机制。一个收窄类型，一个验证类型——组合起来是项目中最实用的模式之一。

## Q1: as const 做了什么？和 enum 怎么选？

### 30 秒版本

"as const 做三件事——把每个值收窄到最精确的字面量类型、给所有属性加 readonly、把数组变成只读元组。和 enum 比，as const 零运行时开销、tree-shaking 友好、isolatedModules 兼容。现在的推荐是：不需要反向映射就用 as const + typeof 替代 enum。"

### 2 分钟版本

**as const 三件事**。拿 `const colors = { red: '#ff0000' } as const` 举例——TS 知道 `colors.red` 的类型是字面量 `'#ff0000'` 而不是 string，所有属性 readonly 递归生效，不能修改。

**核心价值**：从值推导类型，消除重复。改常量只需改值，类型自动同步：

```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'
```

**和 enum 的选择**。enum 在编译后生成 IIFE 代码——约 200 字节每个。项目里 20 个 enum 就是 4KB 额外体积。const enum 有跨文件兼容性问题——Babel/ESBuild 无法内联跨文件常量。

选择顺序：需要反向映射（数字→键名）→ 数字 enum；只在当前文件内用且不用 Babel → const enum；其他所有场景 → as const + typeof。我们项目里权限字典、路由路径、状态映射全部用 as const 实现。

## Q2: satisfies 解决了什么问题？

### 30 秒版本

"satisfies 做类型检查但不改变变量类型——value 通过了 Type 的验证，但 TS 推断出的类型还是 value 原始的最精确版本。这填补了类型注解 '太宽' 和 as const '太死' 之间的空白。"

### 2 分钟版本

**痛点**。你有一个调色板对象，想约束所有 value 是 string，但又想保留每个 value 的字面量类型用于自动补全。`: Record&lt;string, string>` 把值全扩宽成 string——丢了字面量。`as const` 收窄成字面量——但无法约束 value 的类型。

**satisfies 同时解决两个问题**：

```typescript
const themeColors = {
  primary: '#409EFF',
  success: '#67C23A',
} satisfies Record<string, string>;
// 1. 检查通过——所有 value 都是 string ✅
// 2. typeof themeColors.primary 仍是 '#409EFF' 字面量 ✅
```

**as const satisfies 组合**——两者叠加实现"约束 + 精确"：

```typescript
const KEYS = ['id', 'name', 'email'] as const satisfies readonly string[];
type Key = (typeof KEYS)[number]; // 'id' | 'name' | 'email'
// as const 保留字面量、satisfies 确保每个元素是 string
```

日常场景：路由配置既要约束结构又要保留路径字面量、权限字典既要保证值格式又要精确推导、表格列配置既要检查 key 合法性又要保留 prop 字面量——全都适合 as const satisfies 组合。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "satisfies 和类型注解的区别" | `: Type` 改变了变量的类型——把字面量扩宽为 string。satisfies 只做检查不改变类型——字面量类型原样保留。性能无差异，都是在编译时完成 |
| "satisfies 和 as 的区别" | satisfies 做类型检查——不通过会报错。as 做类型断言——强制告诉 TS"这就是这个类型"但不做任何检查。satisfies 是安全的，as 是危险的 |
| "as const 和 readonly 的区别" | readonly 只加只读——类型还是 string。as const 加只读 + 类型收窄到字面量。需要只读不要字面量收窄用 readonly，两者都要用 as const |

## 别踩的坑

1. **as const 后数组不能 push** —— 数组变成只读元组后 push/pop/sort 全部失效。需要可变数组用 readonly 类型注解替代 as const。

2. **satisfies 检查深度取决于约束类型** —— satisfies 本身是递归检查的，但如果约束类型太宽（如 `Record&lt;string, object>`），嵌套结构就不会被有效约束。用具体的 interface 而非泛泛的 `object`。

3. **const enum 跨文件使用** —— Babel/ESBuild 下跨文件 const enum 会保留运行时引用，导致 `ReferenceError`。新项目建议不用 const enum。

## 相关阅读

- [as const / const assertion](../../TypeScript/as-const.md)
- [satisfies](../../TypeScript/satisfies.md)
- [enum / class 类型](../../TypeScript/enum-class.md)

## 更新记录

- 2026-07-14：新建（as const 三件事 + enum 对比 + satisfies 互补 + as const satisfies 组合）
