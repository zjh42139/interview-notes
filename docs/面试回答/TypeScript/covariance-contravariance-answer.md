---
title: 协变 / 逆变 面试回答
description: 面试中如何回答 TypeScript 的协变和逆变——协变（子类型可赋给父类型）、逆变（函数参数的反向关系）、strictFunctionTypes 的影响
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - TypeScript
  - 协变
  - 逆变
  - strictFunctionTypes
  - 面试回答
---

# 协变 / 逆变 面试回答

> 大厂 TS 面试的深度分水岭。回答了"interface vs type"和"泛型"只是入场券，"为什么函数参数是逆变的"才是真正区分理解深度的题。

## Q1: 什么是协变和逆变？为什么函数参数是逆变的？

### 30 秒版本

"协变——子类型可以赋值给父类型。函数的返回值是协变的——返回 Dog 可以赋给返回 Animal。逆变——方向反过来，父类型可以赋值给子类型。函数参数是逆变的——回调声明接受 Animal 时，你不能传入只接受 Dog 的实现，因为调用方可能会传 Cat。strictFunctionTypes 开启后强制执行逆变检查。"

### 2 分钟版本

"先说清楚协变逆变是什么，再说为什么这样设计。

**协变（Covariance）**：如果一个类型构造器保持了子类型关系的方向，它就是协变的。比如函数的返回值——`() => Dog` 是 `() => Animal` 的子类型。这符合直觉——你期望得到一个 Animal，我给你一个 Dog，没问题。

**逆变（Contravariance）**：方向反过来。函数参数是逆变的——`(animal: Animal) => void` 是 `(dog: Dog) => void` 的子类型。这意味着接受 Animal 的处理函数，可以赋给接受 Dog 的位置。

**为什么参数是逆变的？** 用反例证明最清楚：

```typescript
type DogHandler = (dog: Dog) => void;
type AnimalHandler = (animal: Animal) => void;

let handleDog: DogHandler = (dog: Dog) => dog.bark();
// 如果参数是协变的，这行应该能通过：
let handleAnimal: AnimalHandler = handleDog; // ❌ 如果允许
// 然后有人调用 handleAnimal(new Cat())
// Cat 没有 bark() → 运行时炸了！
```

这就是逆变的逻辑——回调的实现不能比声明需要的参数类型更窄，否则调用方传入声明范围外的类型就会炸。逆变的本质是**调用方安全**。

**strictFunctionTypes 的作用**：TS 2.6 引入。开启前函数参数是双向协变（既协变又逆变）——这是旧 TS 版本为了兼容 JS 库的权宜之计。开启后强制逆变检查，回调必须接受所有可能传入的类型。strict 模式下默认开启。

**实际触发逆变检查的场景**：把回调函数赋值给一个声明了更宽参数类型的变量、Array 方法的回调类型检查（`[1,2,3].forEach` 的回调参数接受 `number | undefined`）、事件处理器类型检查。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "协变逆变在项目中遇到过实际问题吗" | 事件回调类型——`addEventListener('click', (e: MouseEvent) => {})` 是协变的（返回值 void），`onClick: (e: Event) => void` 如果用 MouseEvent 的回调赋值会根据 strictFunctionTypes 产生逆变警告或报错 |
| "Array&lt;T> 是协变还是逆变" | 协变——`Array&lt;Dog>` 是 `Array&lt;Animal>` 的子类型。Array 的只读方法是协变安全的，但 `push` 方法 `(item: T) => number` 的参数位置从类型系统角度应该是逆变的——这也是为什么 `Array&lt;Dog>` 赋值给 `Array&lt;Animal>` 后 push Cat 有风险，TS 为了实用性允许了这种协变 |
| "双向协变是什么" | TS 默认参数双向协变——既协变又逆变。`strictFunctionTypes` 开启后只保留逆变。双向协变是旧版的兼容处理，不开启严格模式的项目仍然存在 |

## 别踩的坑

1. **协变逆变不要和 any/unknown 混淆** —— any 是完全跳过类型检查，跟方差没有关系。说"any 是双向协变"会混用两个完全不同的概念。
2. **strictFunctionTypes 只影响函数参数位置** —— 返回值仍然是协变的。类型构造器的协变/逆变由它在类型系统中的位置决定，不是全局开关。
3. **把接口的方法签名和属性签名搞混** —— `interface A { fn(p: string): void }` 和 `interface A { fn: (p: string) => void }` 在 strictFunctionTypes 下的逆变行为不同——前者不检查，后者检查。

## 相关阅读

- [类型兼容性](../../TypeScript/structural-typing.md)
- [tsconfig.json 配置](../../TypeScript/tsconfig.md)
- [extends / infer](./extends-infer-answer.md)

## 更新记录

- 2026-07-15：新建（协变逆变概念 + 参数逆变反例 + strictFunctionTypes + Array 协变陷阱）
