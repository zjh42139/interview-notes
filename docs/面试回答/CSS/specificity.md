---
title: CSS 选择器优先级 面试回答
description: 面试中如何回答 CSS 优先级——权重计算、!important 本质、@layer 对优先级的影响
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - CSS
  - 优先级
  - important
  - layer
  - 面试回答
---

# CSS 选择器优先级 面试回答

> 不止背权重——面试官要你解释"为什么我写了 !important 还是不生效"。

## Q1: CSS 优先级怎么计算？!important 一定最高吗？

### 30 秒版本

"权重按 a-b-c 三级——ID、类/伪类/属性、元素/伪元素。内联样式 > 外部样式。!important 最高，但注意 @layer 中 !important 是反转的——先声明的 layer 中的 !important 反而优先。非 layer 的 !important 始终最高。"

### 2 分钟版本

**权重计算（特异度 Specificity）**：

| 级别 | 包含 | 权重值 |
|------|------|--------|
| a | 内联 style 属性 | (1,0,0) |
| b | ID 选择器 `#id` | (0,1,0) |
| c | 类 `.class` / 伪类 `:hover` / 属性 `[type]` | (0,0,1) |
| d | 元素 `div` / 伪元素 `::before` | (0,0,0,1) |

**权重比较只比较同级的值**——1 个 ID 大于 100 个类。权重不进位——11 个类不等于 1 个 ID。

**!important 的真规则**：
- `!important` 优先于一切普通声明
- 两个都有 `!important` 时回到权重比较
- **关键坑**：`!important` 在 `@layer` 中的行为是**反转的**——先声明的 layer 中的 `!important` 反而优先于后声明的 layer 中的 `!important`。这是 CSS Cascade Level 5 最容易混淆的规则。

```
胜出顺序（从高到低）：
1. CSS Transitions（临时覆盖一切）
2. 非 layer 的 !important（不受任何 layer 影响，最高优先级）
3. @layer 先声明的 !important（layer 内 !important 反转——先声明的反而赢）
4. @layer 后声明的 !important
5. 非 layer 的普通声明 + 内联样式
6. @layer 后声明的普通声明（layer 内正序——后声明的赢）
7. 选择器权重（同层内部）
8. 书写顺序（最后的胜出）
```

**覆盖率问题**：写了 `.class { color: red !important }` 后被另一个 `.class { color: blue !important }` 覆盖——回权重比较。被 `#id { color: green !important }` 覆盖——ID 权重大于类。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "怎么覆盖一个已经设了 !important 的样式" | 同权重也加 !important 写在后面、提高权重后用 !important。注意：非 layer 的 !important 始终最高；layer 内则是先声明 layer 的 !important 反而赢（反转） |
| "CSS 变量和优先级的关系" | CSS 变量本身不参与优先级——`var(--color)` 只是一个值的占位符。变量值的解析发生在级联之后 |
| "`*` 通配符的权重" | (0,0,0,0)——最低。能被任何选择器覆盖，包括元素选择器 |

## 别踩的坑

1. **"!important 永远最高"** —— 不跨 @layer，且 layer 内 !important 反转（先声明的 layer 中的 !important 反而赢）。两个 !important 之间还要比权重和 layer 顺序。
2. **权重进位思维** —— 11 个 class 选择器不等于 1 个 ID 选择器。权重不进位。
3. **`*` 不是最低** —— `*` 权重 (0,0,0)，继承的属性权重更低（无权重）。继承 vs `*`，继承输。

## 相关阅读

- [CSS 知识库](../../CSS/)

## 更新记录

- 2026-07-15：新建（权重计算 + !important 坑 + @layer 新规则 + 级联层）
