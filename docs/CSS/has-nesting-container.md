---
title: ":has() / 嵌套 / 容器查询"
description: "CSS :has() 父选择器、原生嵌套规则、@container 容器查询——现代 CSS 三大新特性"
category: CSS
type: mechanism
score: 72
difficulty: 中级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - has
  - nesting
  - container-query
---

# :has() / 嵌套 / 容器查询

> ⭐⭐⭐｜难度：中级｜现代 CSS 三大新特性

## :has() —— "父选择器"

```css
/* 选择包含 img 的 figure */
figure:has(img) { padding: 0; }

/* 选择有错误输入的 form-group */
.form-group:has(input:invalid) { border-color: red; }

/* 选择子元素被 hover 时的父元素 */
.card:has(.btn:hover) { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
```

**面试话术**：":has() 是 CSS 的'父选择器'——在此之前 CSS 只能向下选择（父选子），:has() 让 CSS 可以根据子元素状态回过来影响父元素。"

## 原生嵌套

```css
/* 传统写法 */
.card { padding: 16px; }
.card .title { font-size: 18px; }
.card .title:hover { color: blue; }

/* 原生嵌套（等价于 SCSS/Less 的嵌套，但现在是 CSS 标准） */
.card {
  padding: 16px;
  .title {
    font-size: 18px;
    &:hover { color: blue; }
  }
}
```

**和 SCSS 的区别**：SCSS 的 `&` 是字符串替换，CSS 嵌套的 `&` 是真正的父选择器引用——`&:hover` 不会变成 `.card :hover`（多一个空格）。

## 容器查询 @container

```css
/* 传统媒体查询：只能根据视口宽度 */
@media (min-width: 600px) { .card { ... } }

/* 容器查询：根据父容器宽度 */
.card-wrapper { container-type: inline-size; }
@container (min-width: 400px) {
  .card { display: flex; } /* 父容器宽度≥400 时切换布局 */
}
```

容器查询让组件根据**自己能用的空间**而不是视口宽度来调整布局——组件可以在不同容器里自适应。

**和 `@media` 的核心区别**：

| | `@media` | `@container` |
|---|---|---|
| 查询基准 | 视口（viewport） | 最近祖先容器 |
| 适用场景 | 页面级响应式（全局布局） | 组件级自适应（侧边栏/主内容区/弹窗） |
| 典型问题 | 同一视口宽度下，组件可能在窄侧边栏里（300px）也可能在主内容区（800px）——`@media` 无法区分 | 组件根据容器实际宽度自适应，天然支持不同上下文 |

**三步使用**：
1. **声明容器**：`container-type: inline-size`（水平尺寸）/ `size`（水平+垂直）/ `normal`（不查询）
2. **命名容器**（可选）：`container-name: sidebar` → `@container sidebar (min-width: 200px)`
3. **编写查询**：`@container (min-width: 400px) { ... }`——语法和 `@media` 相同

**面试常问**："Container Query 能不能替代 @media？"
- 不能完全替代——页面级布局仍需要 `@media`（如导航栏折叠、多栏→单栏切换）
- 但组件级自适应**应该用 @container**——组件不应该依赖视口宽度
- 两者配合：`@media` 管页面骨架，`@container` 管组件肌肉

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| ":has() 和之前的 CSS 有什么区别" | 追问父选择器——"不用 JS 判断子元素状态了" |
| "容器查询和媒体查询区别" | 追问"组件级响应 vs 页面级响应" |

## 相关阅读

- [@layer 级联层](./at-layer.md)
- [响应式设计](./responsive.md)

## 更新记录

- 2026-07-16：新建——:has()+原生嵌套+容器查询
