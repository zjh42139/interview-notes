---
title: any / unknown / never 面试回答
description: 面试中如何回答 any / unknown / never 的区别——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-14
updated: 2026-07-14
reviewed: null
tags:
  - TypeScript
  - any
  - unknown
  - never
  - 面试回答
---

# any / unknown / never 面试回答

> 考察类型系统的理解深度，三种特殊类型代表三个方向：完全放弃安全、安全但需验证、逻辑上不可能。

## Q1: any、unknown、never 三者有什么区别？

### 30 秒版本

"any 关闭类型检查——双向协变、访问任何属性不报错，是逃生舱。unknown 是安全的 any——什么都能赋给它，但用它必须先用 typeof/instanceof/自定义守卫做类型收窄。never 是 bottom type——表示永远不会发生的类型，在联合类型中自动消失，常用来做穷举检查。"

### 2 分钟版本

"三个类型从类型安全的角度看形成了一个递进关系：

**any —— 放弃一切检查**。`any` 变量可以赋给 `string`，可以接收 `number`，可以访问 `.foo.bar.baz`，TS 全都不管。问题是传染性——一旦你用 `JSON.parse()` 返回 any，整个数据处理链类型全废。

**unknown —— 安全版本**。`unknown` 只能赋值给 `unknown` 和 `any`，不能赋值给其他类型。想用 unknown 变量必须先类型收窄。这就是 'trust but verify' 的类型化体现。

```typescript
function handle(data: unknown) {
  // data.foo;  // ❌ 不能直接访问
  if (typeof data === 'string') {
    return data.toUpperCase();  // ✅ 收窄后可用
  }
}
```

**never —— 永远不会发生**。抛异常或死循环的函数返回 never。最实用的是穷举检查——switch 的 default 分支中，如果所有联合成员都处理完了，剩余变量类型就是 never。有人给联合加新成员时这里编译报错，强制开发者更新逻辑。

```typescript
type Status = 'pending' | 'approved' | 'rejected';
function handle(status: Status) {
  switch (status) {
    case 'pending':  return '处理中';
    case 'approved': return '已通过';
    case 'rejected': return '已驳回';
    default: {
      const _check: never = status; // 所有分支覆盖时编译通过
      return _check;
    }
  }
}
```

**三层递进**：any（最不安全）→ unknown（先验证再用）→ 具体类型 → never（什么都不是，bottom type）。面试把这条线讲清楚就过关了。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "unknown 和 any 本质区别是什么" | unknown 是 top type——任何类型都能赋值给 unknown，但 unknown 只能赋值给 any 和 unknown。any 是双向——既可以被任何类型赋值，也能赋值给任何类型。unknown 是安全的单向门 |
| "never 能赋值给 string 吗" | 能——never 是 bottom type，可以赋值给任何类型。但反过来不行——string 不能赋值给 never。实际运行时，never 类型永远不会有值，所以这个赋值操作实际上永远不会执行 |
| "什么时候用 unknown 而不是 any" | 所有场景都用 unknown 代替 any，只有三种情况可以放宽：快速原型、渐进迁移 JS 项目时、调用没有类型的三方库且不想立即写 declare module |
| "void 和 never 的区别" | void 表示函数返回了（返回 undefined 或无意义的返回值），never 表示函数不会返回到调用点（抛异常或死循环）。`const r = fn()` 如果是 void——r 存在但无意义；如果是 never——这行代码之后的逻辑永远不会执行 |

## 别踩的坑

1. **"catch 里 error 是 any"** —— strict 模式下 `catch (e)` 中 e 默认是 unknown，不声明类型不能访问 `.message`。永远写 `catch (error: unknown)` 然后类型收窄。

2. **"never 和 void 是一样的"** —— 面试说出这句话会被追问。void 函数可以 return，never 函数不能正常 return。

3. **"any 方便，先用着"** —— 一个 `JSON.parse()` 返回 any，后续代码全部失去类型安全。用泛型 + unknown + 类型守卫在数据入口做一次验证，整个链路都安全。

## 相关阅读

- [any / unknown / never](../../TypeScript/any-unknown-never.md)
- [类型收窄](../../TypeScript/type-narrowing.md)
- [泛型 / 工具类型](./generics-utility.md)

## 更新记录

- 2026-07-14：新建（三类型递进关系 + 穷举检查 + catch unknown）
