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
