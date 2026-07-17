---
title: "CSS @layer 级联层"
description: "CSS @layer 规则——声明优先级层次、解决组件库样式覆盖问题、与选择器权重的交互"
category: CSS
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - layer
  - 级联层
  - 优先级
---

# @layer 级联层

> ⭐⭐⭐⭐｜难度：中级｜现代 CSS 核心特性

## 一句话总结

**`@layer` 让开发者显式声明样式的优先级层次——后声明的 layer 覆盖先声明的，不受选择器权重影响。解决了组件库样式覆盖的噩梦——不再需要用 `!important` 或提高选择器权重来"压过"默认样式。**

## 核心机制

### 基本用法

```css
/* 声明层的顺序——越后面优先级越高 */
@layer base, components, utilities;

@layer base {
  a { color: blue; }
}

@layer components {
  .card { padding: 16px; }
}

@layer utilities {
  .text-red { color: red; }  /* 优先级最高——utilities 在最后 */
}
```

**层的优先级规则**：后声明的 layer > 先声明的 layer。选择器权重不影响跨层比较——`@layer utilities` 里的 `.text-red`（权重 10）能覆盖 `@layer base` 里的 `#title`（权重 100）。

### @layer 解决什么问题

**传统问题的根源**：组件库（Element Plus）的 CSS 权重低（单类选择器），用户想覆盖默认样式只能提高权重或 `!important`——代码越来越脏。

**@layer 的解决方案**：组件库把样式放在低优先级层里——用户写在更高层的任何样式自动覆盖。

```css
/* 组件库 */
@layer library { .btn { color: blue; } }

/* 用户代码——和组件库放在不同层，自动覆盖 */
@layer user { .btn { color: red; } }
```

## 深度拓展

### !important 在 @layer 中的反转

**关键规则**：`!important` 在 layer 中的行为是反转的——更低优先级的 layer 中的 `!important` 反而胜出，且**分层的 `!important` 全部压过未分层的 `!important`**。

```
胜出顺序（从高到低）：
1. 先声明的 layer 的 !important（!important 跨层反转：越早声明的层越强）
2. 后声明的 layer 的 !important
3. 非 layer 的 !important（未分层样式视为"隐式最后一层"，反转后在 !important 组里垫底）
4. 非 layer 的普通声明（比所有 layer 的普通声明优先级都高）
5. 后声明的 layer 的普通声明（layer 间正序：后声明的赢）
6. 先声明的 layer 的普通声明
```

这是因为低 layer 的样式通常是库默认值——库需要 `!important` 来"保护"关键的默认样式不被轻易覆盖。

### 嵌套 @layer

```css
@layer framework {
  @layer base, components; /* 嵌套层的优先级 */
  
  @layer base {
    body { margin: 0; }
  }
}
/* 完整层名：framework.base */
```

## 易错点

❌ **@layer 和选择器权重不是一个维度的** —— @layer 是"级联层"——跨层比较时权重不参与。同层内部才按权重比较。

❌ **浏览器兼容性** —— @layer 在现代浏览器全部支持（Chrome 99+、Safari 15.4+、Firefox 97+）。需要兼容旧浏览器时用 PostCSS 降级。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "组件库样式怎么覆盖" | 追问 @layer 替代权重提升 |
| "@layer 和 !important 的关系" | 追问跨层 !important 的反转规则 |

## 相关阅读

- [CSS 优先级](../面试回答/CSS/specificity.md) 🎤
- [CSS 变量](./css-variables.md)

## 更新记录

- 2026-07-18：事实审计——修正 !important 跨层顺序（分层 !important 压过未分层 !important，未分层为隐式最后一层）
- 2026-07-16：新建——@layer 级联+组件库覆盖+!important反转+嵌套层
