---
title: TypeScript 高频面试题
category: 面试题库
type: interview
score: 0
difficulty: 中级
status: reviewed
tags:
  - TypeScript
  - 泛型
  - Utility Types
  - 类型体操


---
# TypeScript 高频面试题

> 收录前端面试中的高频 TypeScript 真题
> 题目按出现频率从高到低排列。

---

### Q1: 泛型的使用场景与实践

> 🏷️ 概念题
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：什么是泛型？请举出在项目中至少 3 个泛型的使用场景，并写出示例代码。如何约束泛型的范围？

**考察点**：
- 泛型本质：类型参数化，延迟到使用时确定类型
- `extends` 约束（generic constraints）
- 实际场景：axios 响应包装类型、表格列定义、通用组件的 props 类型
- `Partial<T>` / `Record<K, V>` 等内置工具类型的泛型应用
- 函数、接口、类的泛型定义

**30秒答**：泛型=类型参数化——延迟到使用时确定类型。保留类型安全不丢失推导。场景：axios 响应包装类型、表格列定义、通用组件 props。extends 约束泛型范围。
**追问预测**：
- "泛型约束怎么实现" → extends——<T extends {length:number}> 限制 T 必须有 length 属性
- "什么时候不用泛型" → 类型确定不变时——如 sum(a:number,b:number) 不需要泛型化
- "泛型默认值" → <T=string>——调用时不传类型参数就用默认类型

> 答案参考：[../TypeScript/generics.md](../TypeScript/generics.md)
> 🎤 回答稿：[../面试回答/TypeScript/generics-utility.md](../面试回答/TypeScript/generics-utility.md)

---

### Q2: Utility Types 实现原理

> 🏷️ 手写题
> ⭐⭐⭐⭐⭐ | 难度：中高级

**题目**：请手写实现 `Partial`、`Required`、`Readonly`、`Pick`、`Omit`、`Record`、`Exclude`、`Extract`、`ReturnType`，并说明它们之间的关系。

**考察点**：
- `keyof` 获取对象所有 key 的联合类型
- 映射类型 `[K in keyof T]` 遍历
- 条件类型 `T extends U ? X : Y`
- `infer` 推断类型变量
- `Omit<T, K>` 可以用 `Pick<T, Exclude<keyof T, K>>` 实现

**30秒答**：Pick 挑选属性、Omit 排除属性、Partial 全部可选、Required 全部必填。核心是映射类型——[K in keyof T]:T[K]。Pick/Omit/Partial 能手写实现说明真懂了。
**追问预测**：
- "Pick 和 Omit 的区别" → Pick 挑选属性；Omit 排除属性——互补操作
- "Partial 和 Required 的关系" → 互逆——Partial 全可选；Required 全必填
- "怎么实现 DeepPartial" → 递归映射——T[K] extends object ? DeepPartial<T[K]> : T[K]

> 答案参考：[../TypeScript/utility-types.md](../TypeScript/utility-types.md)
> 延伸：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)

---

### Q3: any / unknown / never 的区别

> 🏷️ 对比题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：请详细对比 `any`、`unknown`、`never` 三种类型。各自的使用场景是什么？为什么应该尽量避免使用 `any`？

**考察点**：
- `any` 放弃类型检查（传染性），可赋值给任意类型，可从任意类型赋值
- `unknown` 安全版本的 `any`：只能赋值给 `unknown` 和 `any`，使用前必须类型收窄
- `never` 表示永远不存在的类型：函数永不返回、类型收窄到的空集
- `never` 在条件类型分发中的作用
- 项目中使用 `unknown` 替代 `any` 处理第三方数据

**30秒答**：any 放弃类型检查——传染性危险。unknown 类型安全——使用前必须收窄(typeof/instanceof/is)。never 永远不返回(抛异常/死循环)或不可能分支(穷举检查)。
**追问预测**：
- "unknown 和 any 的本质区别" → unknown 类型安全——使用前必须类型收窄；any 放弃类型检查
- "never 的使用场景" → 永远不返回的函数（抛异常/死循环）、不可能的分支（exhaustive check）
- "unknown 怎么转成具体类型" → 类型收窄——typeof/instanceof/自定义 type guard

> 答案参考：[../TypeScript/any-unknown-never.md](../TypeScript/any-unknown-never.md)

---

### Q4: extends 和 infer 详解

> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中高级

**题目**：`extends` 在 TypeScript 中有哪些用法？`infer` 关键字的作用是什么？请用 `infer` 实现一个获取函数参数类型的工具类型。

**考察点**：
- `extends` 的三种含义：接口继承、泛型约束、条件类型
- 条件类型中的分发行为（distributive conditional types）
- `infer` 只能在条件类型的 `extends` 子句中使用
- 用 `infer` 实现 `Parameters<T>`、`ReturnType<T>`、`InstanceType<T>`
- `infer` + 协变/逆变位置的行为差异

**30秒答**：extends 三个角色——泛型约束(T extends U)、条件类型(T extends U?X:Y)、继承(class extends)。infer 在条件类型中声明类型变量——提取 ReturnType/Awaited 等。
**追问预测**：
- "extends 在泛型中有几种含义" → 约束（限制 T）、条件类型（三元判断）、继承（class/interface）
- "infer 只能用在条件类型中吗" → 是——infer 在条件类型的 extends 分支中声明类型变量
- "infer 的实际使用场景" → 提取函数返回值 ReturnType、提取 Promise 内类型 Awaited、提取数组元素类型

> 答案参考：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---

### Q5: satisfies 关键字的用法

> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：TypeScript 4.9 引入的 `satisfies` 关键字解决了什么问题？与类型标注（`: Type`）和 `as` 断言有什么区别？

**考察点**：
- `satisfies` 既检查类型兼容，又保留最精确的类型推导
- 与 `: Type` 对比：不会丢失字面量类型信息
- 与 `as` 对比：不会绕过类型检查
- 典型场景：`Record<string, RGB>` 用 `satisfies` 同时检查键值约束并保留字面量
- 在常量对象（`as const` + `satisfies`）中的组合使用

**30秒答**：satisfies 保留类型推导不做断言——as 强制转换可能丢失类型安全。和:类型标注的区别——satisfies 不改变变量类型保留更精确推导。场景：既要约束又不丢字面量类型。
**追问预测**：
- "satisfies 和 as 的区别" → satisfies 保留类型推导不做断言；as 强制转换可能丢失类型安全
- "satisfies 和 : 类型标注的区别" → satisfies 不改变变量类型——保留更精确的推导
- "什么时候用 satisfies" → 既要类型检查约束又不丢失字面量类型——如调色板对象

> 答案参考：[../TypeScript/satisfies.md](../TypeScript/satisfies.md)
> 🆕 延伸：[../TypeScript/as-const.md](../TypeScript/as-const.md)

---

### Q6: keyof + 映射类型 + 条件类型

> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中高级

**题目**：`keyof`、映射类型（Mapped Types）和条件类型（Conditional Types）分别是什么？它们如何组合使用？请实现一个类型工具：选出对象中值为特定类型的 key。

**考察点**：
- `keyof T` 返回对象所有 key 的联合类型
- 映射类型 `[K in Keys]: NewType` 逐个转换属性
- 条件类型配合 `never` 过滤属性
- `as` 子句在映射类型中重新映射 key
- 组合示例：`{ [K in keyof T as T[K] extends U ? K : never]: T[K] }`

**30秒答**：keyof 取对象键的联合类型——keyof typeof 取值的键。映射类型 [K in keyof T]:... 遍历键生成新类型。配合 extends 做条件类型过滤。模板字面量类型做字符串拼接。
**追问预测**：
- "keyof 和 typeof 配合怎么用" → typeof 取值的类型→keyof typeof 取对象键的联合类型
- "映射类型的 as 子句" → {[K in keyof T as ...]:T[K]}——重映射键名
- "模板字面量类型" → type EventName = `on${Capitalize<string>}`——字符串拼接类型

> 答案参考：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)
> 延伸：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---

### Q8: 类型体操基础

> 🏷️ 手写题
> ⭐⭐⭐ | 难度：中高级

**题目**：请实现 `DeepReadonly<T>` 和 `DeepPartial<T>`，递归地处理嵌套对象。并实现一个 `MyExclude<T, U>`。

**考察点**：
- 递归条件类型的写法
- 映射类型递归遍历嵌套对象
- 条件类型分发中 `never` 的处理（用元组 `[T]` 包裹防止分发）
- `infer` + 模板字面量类型（Template Literal Types）
- 实际应用：表单配置类型的深度只读、API 响应的深度 Partial

**30秒答**：DeepReadonly/DeepPartial 递归映射——T[K] extends object ? X<T[K]> : T[K]。实用价值：写出更准确的类型定义。边界：不要为了炫技写过于复杂降低可读性的类型。
**追问预测**：
- "DeepReadonly 怎么实现" → 递归映射——T[K] extends object ? DeepReadonly<T[K]> : T[K]
- "类型体操的实用价值" → 写出更准确的类型定义——让编译器帮你发现错误而不是靠运行时
- "类型体操的边界" → 不要为了炫技写过于复杂的类型——降低可读性得不偿失

> 答案参考：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)
> 延伸：[../TypeScript/utility-types.md](../TypeScript/utility-types.md)

---

### Q9: 声明文件（.d.ts）与 declare

> 🏷️ 概念题
> ⭐⭐⭐ | 难度：中级

**题目**：什么场景下需要写 `.d.ts` 声明文件？`declare` / `declare global` / `declare module` 分别怎么用？如何为第三方库扩展类型？

**考察点**：
- `.d.ts` 为无类型的 JS 库提供类型声明
- `declare` 声明变量的类型而不定义实现
- `declare global` 扩展全局作用域（Window、String 等）
- `declare module '*.vue'` 声明非 JS/TS 模块
- Module Augmentation：用 `declare module 'xxx'` 扩展现有库的类型

**30秒答**：.d.ts 只有类型声明无实现——类似 C 头文件。declare module 为无类型第三方库声明类型。declare global 扩展全局类型——给 Window 加自定义属性。
**追问预测**：
- ".d.ts 和 .ts 的区别" → .d.ts 只有类型声明没有实现——类似 C 的头文件
- "declare module 怎么用" → 为没有类型的第三方库声明类型——或扩展已有模块类型
- "declare global 的作用" → 扩展全局类型——如给 Window 加自定义属性

> 答案参考：[../TypeScript/declaration.md](../TypeScript/declaration.md)

---

### Q11: as const 的用法

> 🏷️ 概念题
> ⭐⭐⭐ | 难度：中级

**题目**：`as const`（const assertion）有什么作用？在项目中有哪些典型应用场景？

**考察点**：
- `as const` 将类型收窄到最精确的字面量类型 + `readonly`
- 对象、数组全面 `readonly`（递归处理）
- 场景：常量配置对象（无需重复定义类型）、枚举替代方案
- 与 `typeof` 配合：从 `as const` 值提取类型
- 配合 `satisfies` 的检查 + 精确推导

**30秒答**：as const 固定字面量类型为最窄——readonly+literal。数组变 readonly tuple——每个元素精确到字面量。和 enum 比——更轻量不生成运行时代码。
**追问预测**：
- "as const 和 readonly 的区别" → as const 把字面量类型固定为最窄——readonly + literal；readonly 只是只读
- "as const 对数组的影响" → 变成 readonly tuple——每个元素类型精确到字面量
- "as const 和 enum 怎么选" → as const + union 类型更轻量——不生成运行时代码

> 答案参考：[../TypeScript/as-const.md](../TypeScript/as-const.md)
> 🆕 延伸：[../TypeScript/satisfies.md](../TypeScript/satisfies.md)

---

### Q13: TypeScript 的类型收窄（Type Narrowing）

> 🏷️ 概念题
> ⭐⭐⭐ | 难度：中级

**题目**：TypeScript 有哪些类型收窄的方式？请举例说明 `typeof`、`instanceof`、`in`、自定义类型守卫（Type Predicate）的用法。

**考察点**：
- `typeof` 收窄基本类型（注意 `typeof null === 'object'`）
- `instanceof` 收窄类实例
- `in` 操作符收窄联合类型（检查属性是否存在）
- 自定义类型守卫 `value is Type`：返回值告知 TypeScript 类型
- 断言函数（Assertion Functions）：`asserts value is Type`
- 可辨识联合（Discriminated Unions）：通过字面量共同属性区分

**30秒答**：typeof/instanceof/in/is 四种收窄。自定义 type guard 返回 arg is SomeType——TS 在 if 块内自动收窄。never 穷举检查——default 分支赋值给 never 遗漏编译报错。
**追问预测**：
- "类型收窄的几种方式" → typeof/instanceof/in/自定义 type guard（is）/switch 穷举
- "自定义 type guard 怎么写" → 返回值是 arg is SomeType——TS 识别 if 块内自动收窄
- "never 在穷举检查中的作用" → default: const _:never = value——遗漏分支编译报错

> 答案参考：[../TypeScript/type-narrowing.md](../TypeScript/type-narrowing.md)
> 🎤 回答稿：[../面试回答/TypeScript/type-narrowing-answer.md](../面试回答/TypeScript/type-narrowing-answer.md)
> 延伸：[../TypeScript/any-unknown-never.md](../TypeScript/any-unknown-never.md)

---

### Q15: 项目中的 TypeScript 最佳实践

> 🏷️ 场景题
> ⭐⭐⭐ | 难度：中级

**题目**：在 Vue3 + TypeScript 项目中，你有哪些最佳实践？如何为组件的 props、emits、template ref、provide/inject 提供类型？

**考察点**：
- `defineProps<T>()` 泛型定义 props 类型（纯类型语法）
- `defineEmits<T>()` 定义 emits 事件类型
- `ref<T>()` 和 `reactive<T>()` 泛型标注
- `InstanceType<typeof Component>` 获取组件实例类型
- `InjectionKey<T>` 为 provide/inject 提供类型安全
- `@types/` 类型声明文件的维护

**30秒答**：Vue3 defineProps 用泛型传类型、Pinia 完整 TS 推导、composables 标注返回类型。strict 严格模式逐步开启。any 尽量不用——用 unknown 替代。第三方无类型用 declare module。
**追问预测**：
- "Vue3+TS 项目的最佳实践" → defineProps 用泛型传类型、Pinia store 完整 TS 类型推导、composables 返回类型标注
- "TS 严格模式开了哪些" → strictNullChecks/noUncheckedIndexedAccess/strictFunctionTypes——逐步开启
- "any 的使用原则" → 尽量不用——实在不行用 unknown。第三方库没类型用 declare module

> 答案参考：[../TypeScript/vue3-ts-practice.md](../TypeScript/vue3-ts-practice.md)
> 🎤 回答稿：[../面试回答/TypeScript/vue3-ts-answer.md](../面试回答/TypeScript/vue3-ts-answer.md)
