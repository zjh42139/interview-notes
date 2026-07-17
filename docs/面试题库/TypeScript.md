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

**题目**：请手写实现 `Partial`、`Required`、`Readonly`、`Pick`、`Omit`、`Record`、`Exclude`、`Extract`、`ReturnType`、`Parameters`，并说明它们之间的关系。其中 `ReturnType` 和 `Parameters` 涉及 `infer` 关键字——是面试中最容易单独抽出来考的 infer 实战题。

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
> 🎤 回答稿：[../面试回答/TypeScript/generics-utility.md](../面试回答/TypeScript/generics-utility.md)
> 延伸：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)

---

### Q3: any / unknown / never 的区别

> 🏷️ 对比题
> ⭐⭐⭐⭐⭐ | 难度：中级

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
> 🎤 回答稿：[../面试回答/TypeScript/any-unknown-never-answer.md](../面试回答/TypeScript/any-unknown-never-answer.md)

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
> 🎤 回答稿：[../面试回答/TypeScript/extends-infer-answer.md](../面试回答/TypeScript/extends-infer-answer.md)

---

### Q5: satisfies 关键字的用法

> 🏷️ 概念题
> ⭐⭐⭐ | 难度：中级

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
> 🎤 回答稿：[../面试回答/TypeScript/as-const-satisfies-answer.md](../面试回答/TypeScript/as-const-satisfies-answer.md)
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
> 🎤 回答稿：[../面试回答/TypeScript/keyof-mapped-conditional-answer.md](../面试回答/TypeScript/keyof-mapped-conditional-answer.md)
> 延伸：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---

### Q7: TypeScript 和 JavaScript 的区别

> 🏷️ 概念题
> ⭐⭐⭐⭐⭐ | 难度：初级

**题目**：TypeScript 和 JavaScript 的核心区别是什么？为什么要用 TypeScript？项目中引入 TS 带来了哪些实际收益？

**考察点**：
- 静态类型检查 vs 动态类型——编译期发现错误而非运行时
- 类型系统带来的 IDE 体验提升——智能补全、重构、查找引用
- 工程化收益——类型即文档、接口契约、减少低级 bug
- 代价——学习曲线、类型声明编写/维护、编译时间
- TS 不是替代 JS 而是在 JS 上加了一层类型系统

**30秒答**：TS 在 JS 上加了一层静态类型系统——编译期检查类型错误，IDE 有完整的智能提示和重构。代价是学习成本和类型维护。核心价值：bug 提前到编译期发现、代码即文档、重构有底气——项目的可维护性显著提升。
**追问预测**：
- "TS 的缺点是什么" → 学习曲线、类型体操过度抽象化、三方库缺类型需要写 declare module、编译时间
- "什么项目不适合 TS" → 快速原型、一次性脚本、小项目——类型维护成本可能超过收益
- "TS 编译后是什么" → 纯 JS——所有类型注解和 TS 特有语法在编译时全部消失

> 答案参考：[../TypeScript/basic-types.md](../TypeScript/basic-types.md)
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
> 🎤 回答稿：[../面试回答/TypeScript/type-gymnastics-answer.md](../面试回答/TypeScript/type-gymnastics-answer.md)
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
> 🎤 回答稿：[../面试回答/TypeScript/declaration-answer.md](../面试回答/TypeScript/declaration-answer.md)

---

### Q10: interface 和 type 的深度区别

> 🏷️ 对比题
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：`interface` 和 `type` 有什么区别？什么时候用 interface、什么时候用 type？为什么 interface 能声明合并而 type 不能？

**考察点**：
- 区别一：声明合并——interface 同名自动合并（扩展第三方类型的关键能力），type 不行
- 区别二：表达能力——type 能定义联合/交叉/映射类型，interface 只能描述对象形状
- 区别三：extends 方式——interface 用 `extends`，type 用 `&`
- 声明合并的设计意图——让 `.d.ts` 文件可以分散扩展同一个 interface
- 实际选择：描述对象形状→interface；联合/交叉/映射/工具类型→type

**30秒答**：三个核心区别——声明合并（interface 同名自动合并，type 不行）、表达能力（type 能做联合/交叉/映射类型，interface 只能描述对象形状）、extends 方式（interface 用 extends，type 用 &）。推荐：描述对象形状用 interface，需要联合/交叉/映射能力时用 type。
**追问预测**：
- "为什么 interface 能声明合并" → TS 有意为之——.d.ts 中多个 interface Window 分散在不同库的类型文件中，最终自动合并为完整类型
- "type 为什么不支持声明合并" → 类型别名定义后固定，不允许隐式修改——保证类型来源的单一性
- "项目中怎么选" → 团队定一个默认（推荐 interface），只在需要联合/交叉/映射时切 type

> 答案参考：[../TypeScript/basic-types.md](../TypeScript/basic-types.md)
> 🎤 回答稿：[../面试回答/TypeScript/interface-type-answer.md](../面试回答/TypeScript/interface-type-answer.md)
> 延伸：[../TypeScript/declaration.md](../TypeScript/declaration.md)

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
> 🎤 回答稿：[../面试回答/TypeScript/as-const-satisfies-answer.md](../面试回答/TypeScript/as-const-satisfies-answer.md)
> 🆕 延伸：[../TypeScript/satisfies.md](../TypeScript/satisfies.md)

---

### Q12: void 和 never 的区别

> 🏷️ 对比题
> ⭐⭐⭐ | 难度：中级

**题目**：`void` 和 `never` 分别表示什么？它们在函数返回值、类型系统层次中各有什么区别？各有什么使用场景？

**考察点**：
- `void`：函数正常返回但返回值无意义（仍可以 return 或不 return）
- `never`：函数永远不会返回到调用点（抛异常或死循环）
- 类型层次：void 不是 bottom type，never 是
- `void` 的调用方不能依赖返回值（strictNullChecks 下）
- `never` 在联合类型中自动消失、穷举检查中做编译期守卫

**30秒答**：void=函数返回了但返回值没意义——调用方不能用返回值。never=函数不会返回到调用点——抛异常或死循环。never 是 bottom type——可以赋给任何类型；void 不是。穷举检查用 never 做编译期守卫。
**追问预测**：
- "void 和 undefined 的区别" → void 表示"别用返回值"——函数可以返回任何东西但 TS 阻止调用方使用。undefined 表示"返回的就是 undefined"——调用方可以安全使用
- "never 的实际应用" → 穷举检查——default 分支赋值给 never 确保所有联合成员都处理了；条件类型中过滤掉不想要的类型

> 答案参考：[../TypeScript/any-unknown-never.md](../TypeScript/any-unknown-never.md)

---

### Q13: TypeScript 的类型收窄（Type Narrowing）

> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中级

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

### Q14: typeof / keyof 在类型位置的用法

> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：TypeScript 中 `typeof` 和 `keyof` 在类型位置（type context）如何配合使用？请举例说明如何从值推导类型，以及如何提取对象键的联合类型。

**考察点**：
- `typeof` 在 type context 中提取变量的类型（不同于 JS 的运行时 typeof）
- `keyof` 提取对象类型所有键的联合类型
- `keyof typeof` 组合：从值提取键的联合类型（如从常量对象提取 key union）
- `T[K]` 索引访问类型——从对象类型中取某个属性的类型
- 实际场景：从路由配置、权限字典等常量中自动推导类型

**30秒答**：typeof 在类型位置取变量的类型、keyof 取对象键的联合类型。keyof typeof 组合从常量值提取键的字面量联合——`type Role = keyof typeof ROLES`。T[K] 索引访问——从对象类型里取某个属性的类型。
**追问预测**：
- "typeof 在 JS 和 TS 中有什么区别" → JS 的 typeof 是运行时操作符返回字符串；TS 的 typeof 在 type context 中提取变量的类型，编译后消失
- "keyof typeof 的实际应用" → 从 as const 常量/路由配置/权限字典中自动提取类型，消除值和类型的手动同步

> 答案参考：[../TypeScript/basic-types.md](../TypeScript/basic-types.md)
> 延伸：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)

---

### Q15: 项目中的 TypeScript 最佳实践

> 🏷️ 场景题
> ⭐⭐⭐⭐⭐ | 难度：中级

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

---

### Q16: 协变与逆变

> 🏷️ 概念题
> ⭐⭐⭐ | 难度：高级

**题目**：请解释 TypeScript 中的协变（Covariance）和逆变（Contravariance）。函数参数为什么是逆变的？`strictFunctionTypes` 开启后有什么影响？

**考察点**：
- 协变：子类型可以赋值给父类型（返回值——`Dog` 可赋给 `Animal`）
- 逆变：父类型可以赋值给子类型（参数——回调参数必须能接受所有可能传入的值）
- `strictFunctionTypes` 开启后方法参数变为逆变检查
- 实际场景：事件回调的类型安全、Array 方法签名中的逆变应用

**30秒答**：协变=返回值可以更具体（Dog→Animal），逆变=参数可以更宽泛（Animal→Dog的同位）。strictFunctionTypes 开启后回调参数必须能接受所有可能传入的值——避免运行时类型错误。
**追问预测**：
- "为什么函数参数是逆变的" → 回调调用方传入 Animal，回调实现如果只接受 Dog 就会对 Cat 炸掉
- "strictFunctionTypes 什么时候开启" → strict 模式下默认开启——双向协变是旧版本的兼容行为

> 答案参考：[../TypeScript/structural-typing.md](../TypeScript/structural-typing.md)
> 🎤 回答稿：[../面试回答/TypeScript/covariance-contravariance-answer.md](../面试回答/TypeScript/covariance-contravariance-answer.md)
> 延伸：[../TypeScript/extends-infer.md](../TypeScript/extends-infer.md)

---

### Q17: 函数重载

> 🏷️ 概念题
> ⭐⭐ | 难度：中级

**题目**：TypeScript 的函数重载和 Java/C++ 有什么不同？请写出一个函数重载的完整例子，并说明重载签名和实现签名的关系。

**考察点**：
- TS 重载=多个类型签名+一个实现签名（不是多个实现）
- 实现签名对外部调用者不可见
- 实现签名的参数必须覆盖所有重载签名的参数类型
- 重载签名的返回值可以不同——这是它相比联合类型的核心优势
- 入参类型和返回值有一一对应关系时用重载

**30秒答**：TS 重载不是多个实现——是多个类型签名+一个实现签名。实现签名参数必须是所有重载签名的超集。重载的最大价值：不同入参类型→不同返回值类型有精确映射，联合类型做不到。
**追问预测**：
- "重载和联合类型怎么选" → 入参→返回值有一一对应映射时用重载；入参不同但返回值相同时联合类型就够了
- "实现签名为什么对外部不可见" → 因为 TS 只根据重载签名匹配调用——实现签名是内部细节

> 答案参考：[../TypeScript/basic-types.md](../TypeScript/basic-types.md)

---

### Q18: enum 和 const enum

> 🏷️ 对比题
> ⭐⭐⭐ | 难度：中级

**题目**：TypeScript 中普通 enum、字符串 enum、const enum 有什么区别？社区为什么不推荐 enum？项目中用什么替代方案？

**考察点**：
- 数字 enum 有反向映射、字符串 enum 无反查、const enum 编译时内联
- enum 编译产物的运行时开销（IIFE ~200 字节/每个）
- const enum 在 Babel/ESBuild isolatedModules 下的兼容问题
- `as const` + `typeof` 替代方案——零运行时开销
- 需要反向映射时数字 enum 仍有用

**30秒答**：enum 有运行时开销——每个生成 IIFE 代码。const enum 跨文件在 Babel 下失效。社区推荐 as const + typeof 替代——零运行时、tree-shaking 友好。唯一例外：需要反向映射时用数字 enum。
**追问预测**：
- "enum 和 as const 怎么选" → as const 零运行时开销、tree-shaking 友好——新项目首选
- "const enum 为什么有问题" → Babel/ESBuild 单文件转译无法获取跨文件枚举值做内联
- "数字 enum 的反向映射是什么" → Direction[0] → "Up"——数字枚举编译后同时生成键→值和值→键的双向映射

> 答案参考：[../TypeScript/enum-class.md](../TypeScript/enum-class.md)
> 延伸：[../TypeScript/as-const.md](../TypeScript/as-const.md)

---

### Q19: 可辨识联合类型建模状态

> 🏷️ 场景题
> ⭐⭐⭐⭐⭐ | 难度：中级

**题目**：请用可辨识联合（Discriminated Union）为异步请求建模 `idle | loading | success | error` 四种状态，要求 success 才有 data、error 才有错误信息，非法组合（如 loading 同时带 data）在编译期无法表达。如何配合 `never` 做穷举检查？

**考察点**：
- 可辨识联合三要素：公共字面量判别字段（tag）+ 联合类型 + switch 收窄
- "让非法状态无法表达"的建模思想——对比单对象堆多个可选属性的缺陷
- switch 判别字段后 TS 在各分支自动收窄
- `assertNever` 穷举检查：default 分支参数类型为 `never`，新增状态漏处理编译报错
- 实际场景：请求状态机、表单流转状态、消息类型分发

**30秒答**：给每个状态一个字面量 tag——`{ status: 'success'; data: T }` 和 `{ status: 'error'; error: E }` 这样组成联合。比一个对象堆可选属性好在：loading 还带 data 这种非法状态直接无法构造。switch tag 后 TS 自动收窄各分支，default 里调 assertNever 做穷举——以后加新状态漏处理会编译报错，不用靠人肉排查。

**追问预测**：
- "和多个可选属性建模比好在哪" → 可选属性会出现 loading 和 data 同时存在的非法组合——可辨识联合让非法状态在编译期就无法表达
- "assertNever 怎么写" → 参数类型是 never 的函数——default 分支传入，联合有漏网成员时传参就编译报错
- "判别字段有什么要求" → 各成员共有、且是字面量类型（如 'success'）——TS 才能据它收窄

> 答案参考：[../TypeScript/type-narrowing.md](../TypeScript/type-narrowing.md)
> 🎤 回答稿：[../面试回答/TypeScript/type-narrowing-answer.md](../面试回答/TypeScript/type-narrowing-answer.md)
> 延伸：[../TypeScript/any-unknown-never.md](../TypeScript/any-unknown-never.md)

---

### Q20: 联合类型 vs 交叉类型

> 🏷️ 对比题
> ⭐⭐⭐⭐ | 难度：初级

**题目**：`A | B` 和 `A & B` 分别表示什么？两个对象类型联合后能访问哪些属性、交叉后能访问哪些属性？各自的典型使用场景是什么？

**考察点**：
- `|` 是"或"：值是成员之一，只能安全访问所有成员的公共属性
- `&` 是"且"：值同时满足所有成员，属性合并全部可访问
- 从值集合看：联合是并集、交叉是交集——和"属性变多变少"方向相反，容易答反
- 同名属性类型冲突时交叉出 `never`（如 `string & number`）
- 场景：联合建模互斥状态/多形态入参；交叉做类型合并扩展（mixin、给响应包公共字段）

**30秒答**：`A | B` 是或——值只是其中一个，所以只能访问两者的公共属性，其余要先收窄；`A & B` 是且——同时满足两个类型，属性合并都能访问。反直觉的点：交叉属性更多但值的集合更小。同名属性类型冲突交叉会变 never。联合用来建模互斥状态，交叉用来做类型合并扩展。

**追问预测**：
- "为什么联合只能访问公共属性" → TS 不知道运行时到底是哪个成员——只有公共属性一定存在，访问其余属性要先类型收窄
- "`string & number` 是什么" → never——不存在同时是两者的值，交集为空
- "`keyof (A | B)` 和 `keyof (A & B)` 的结果" → 联合取 keyof 交集、交叉取 keyof 并集——和值集合的并交刚好对称

> 答案参考：[../TypeScript/basic-types.md](../TypeScript/basic-types.md)
> 延伸：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)

---

### Q21: 模板字面量类型

> 🏷️ 手写题
> ⭐⭐⭐⭐ | 难度：中高级

**题目**：什么是模板字面量类型（Template Literal Types）？请从配置对象 `{ click: ...; focus: ... }` 派生出事件名类型 `'onClick' | 'onFocus'`，并说明映射类型中 `as` 子句（key remapping）的用法。

**考察点**：
- 模板字面量类型：类型层的字符串拼接，如 `on${string}`
- 内置字符串工具类型：`Capitalize` / `Uncapitalize` / `Uppercase` / `Lowercase`
- key remapping：`[K in keyof T as ...]` 重映射键名，配合 `on${Capitalize<string & K>}`
- `string & K` 的作用：keyof 结果含 symbol，先收窄成 string 才能进模板
- 实际场景：事件名派生、getter/setter 名派生、路由路径参数提取

**30秒答**：模板字面量类型就是在类型层面做字符串拼接——`on${Capitalize<K>}` 能从 'click' 算出 'onClick'。配合映射类型的 as 子句做 key remapping，就能从配置对象自动派生事件名类型——值和类型不用手动同步，加一个配置项事件名类型自动多一个。Vue 的 emits 类型提示底层就是这套。

**追问预测**：
- "as 子句除了改名还能做什么" → 配合条件类型把 key 映射成 never——该 key 直接被过滤掉，实现按值类型筛选属性
- "为什么要写 `string & K`" → keyof 结果是 string | number | symbol 联合——模板字面量只接受可字符串化的类型，用交叉收窄掉 symbol
- "模板字面量能反向拆解吗" → 能——条件类型里用 infer 占位，如 `${infer A}-${infer B}` 拆解字符串提取片段

> 答案参考：[../TypeScript/template-literal-types.md](../TypeScript/template-literal-types.md)
> 延伸：[../TypeScript/keyof-mapped-conditional.md](../TypeScript/keyof-mapped-conditional.md)

---

### Q22: 类型断言体系

> 🏷️ 对比题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：`as` 断言、类型声明（`: Type`）、非空断言 `!` 三者的行为有什么区别？类型断言会改变运行时的值吗？什么是双重断言（`as unknown as T`），为什么危险？

**考察点**：
- `: Type` 是声明——TS 完整检查值与类型的兼容性；`as` 是断言——"信我"，只拦截毫无重叠的转换
- 断言是纯编译期行为：运行时值不变（区别于 Java/C++ 的强转），断错了运行时照样炸
- 非空断言 `!` 只是压掉 null/undefined 检查——不做任何运行时判空
- 双重断言 `as unknown as T` 经 unknown 中转绕过一切兼容检查——局部放弃类型系统
- 正确姿势：优先类型收窄/守卫；断言只用在确实比编译器知道更多的边界（DOM 查询、事件 target）

**30秒答**：`: Type` 是声明，TS 会真检查兼容性；`as` 是断言，告诉编译器"信我"，只拦截完全不相关的转换；`!` 是非空断言，只是压掉 null 检查。关键认知：断言全是编译期行为，运行时值不会有任何变化——断错了照样炸。`as unknown as T` 双重断言能绕过一切检查，等于局部放弃类型系统，code review 我会重点盯它。

**追问预测**：
- "什么时候用 as 是合理的" → 编译器确实不知道的边界——如 `getElementById` 断言成具体元素类型、经运行时校验后的数据
- "! 和可选链 ?. 怎么选" → ?. 是运行时安全访问；! 只是编译期闭嘴——值真可能为空时必须用 ?. 或显式判空
- "为什么有的 as 会直接报错" → as 要求两个类型有子类型重叠——完全不相关必须经 unknown 中转，这正是双重断言的危险信号

> 答案参考：[../TypeScript/satisfies.md](../TypeScript/satisfies.md)
> 延伸：[../TypeScript/as-const.md](../TypeScript/as-const.md)

---

### Q23: 类型擦除与运行时边界

> 🏷️ 场景题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：TypeScript 的类型在运行时还存在吗？为什么接口响应标注了 `: User` 仍可能在运行时出错？项目中如何处理编译期类型与运行时数据的边界（接口响应、localStorage、URL 参数）？

**考察点**：
- 类型擦除：编译后所有类型注解消失——TS 不提供任何运行时保证
- 类型只约束代码内部一致性；外部输入（API/存储/用户输入）是类型系统的盲区
- `res as User` 是"假装安全"——正确做法：边界处先接 `unknown`，运行时校验后再收窄
- schema 校验库（zod 等）：一份 schema 同时产出运行时校验和静态类型（`z.infer`）
- 轻量方案：自定义 type guard；注意 `JSON.parse` 返回 any 的陷阱

**30秒答**：TS 类型编译后全部擦除，运行时不存在——类型只保证代码内部的一致性，保证不了外部数据。接口标 `: User` 只是"我声称它是"，后端改字段照样运行时炸。我的做法：边界处先当 unknown，用 zod 这类 schema 校验后再进类型世界——schema 还能用 z.infer 反推静态类型，运行时校验和编译期类型是同一份定义不会脱节。

**追问预测**：
- "为什么不直接 as User" → as 只是编译期断言，数据不对不会有任何提示——错误延迟到深层使用处更难排查
- "zod 怎么和 TS 类型打通" → `z.infer<typeof schema>` 从 schema 推导静态类型——单一数据源，改 schema 类型自动同步
- "所有接口都要跑运行时校验吗" → 权衡成本——核心链路、表单提交、第三方接口值得；内部稳定接口可只在联调期开启

> 答案参考：[../TypeScript/any-unknown-never.md](../TypeScript/any-unknown-never.md)
> 延伸：[../TypeScript/type-narrowing.md](../TypeScript/type-narrowing.md)

---

### Q24: 结构化类型系统

> 🏷️ 概念题
> ⭐⭐⭐⭐ | 难度：中级

**题目**：什么是结构化类型系统（Structural Typing）？与名义类型（Nominal Typing）有什么区别？为什么对象字面量直接赋值/传参时会触发"多余属性检查"这个例外？

**考察点**：
- 结构化类型：兼容性只看结构不看名字——编译期的"鸭子类型"
- 对比名义类型（Java/C#）：必须显式声明继承/实现关系才兼容
- 兼容方向：属性多的可以赋给属性少的（满足结构要求即可）
- 多余属性检查是唯一例外：对象字面量"新鲜值"直接赋值/传参时多余属性报错——防拼写错误
- 名义化技巧：brand 类型区分结构相同但语义不同的类型（如 UserId vs OrderId）

**30秒答**：TS 的类型兼容看结构不看名字——两个 interface 成员相同就互相兼容，本质是编译期的鸭子类型；Java 那种名义类型必须显式 implements 才行。特例是多余属性检查：对象字面量直接传参时多写属性会报错——字面量场景多余属性几乎必是拼写错误，TS 特意收紧；中转成变量后就按正常结构兼容走。要名义效果可以用 brand 字段模拟，区分两种结构相同的 string。

**追问预测**：
- "为什么中转变量就不报多余属性错" → 检查只针对新鲜的对象字面量——赋给变量后是普通引用，按结构兼容规则走
- "结构化类型有什么坑" → 结构相同语义不同的类型互通——UserId 和 OrderId 都是 string 会混用，用 brand 类型（交叉一个唯一标记）区分
- "空对象类型为什么约束不了什么" → 结构兼容——任何对象都满足"零成员要求"，所以几乎接受一切非空值

> 答案参考：[../TypeScript/structural-typing.md](../TypeScript/structural-typing.md)
> 延伸：[../TypeScript/basic-types.md](../TypeScript/basic-types.md)
