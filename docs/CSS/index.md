---
title: CSS 知识地图
description: CSS 面试知识体系
category: CSS
---

# CSS 知识地图

```mermaid
mindmap
  root((CSS))
    基础
      盒模型
      选择器优先级
      CSS继承性
    布局
      BFC
      position 定位
      层叠上下文
      Flexbox
      Grid
      居中方案
      三栏布局
    适配
      响应式
      rem/vw
      移动端1px
    细节
      文本溢出省略
      transition vs animation
      伪类 vs 伪元素
    性能
      CSS渲染性能
    工程化
      CSS变量
      BEM
      CSS Modules/Scoped
```

## 推荐学习顺序

### 一、基础

1. ⭐⭐⭐⭐⭐ [盒模型](./box-model.md)
2. ⭐⭐⭐⭐⭐ [选择器优先级](./specificity.md)
3. ⭐⭐⭐⭐   [CSS 继承性](./inheritance.md)

### 二、布局

4. ⭐⭐⭐⭐⭐ [position 定位](./position.md)
5. ⭐⭐⭐⭐⭐ [BFC](./bfc.md)
6. ⭐⭐⭐⭐⭐ [Flexbox](./flexbox.md)
7. ⭐⭐⭐⭐⭐ [居中方案](./center-layout.md)
8. ⭐⭐⭐⭐   [Grid](./grid.md)
9. ⭐⭐⭐⭐   [三栏布局](./three-column-layout.md)
10. ⭐⭐⭐⭐   [层叠上下文](./stacking-context.md)

### 三、适配

11. ⭐⭐⭐⭐   [rem / vw 移动端适配](./rem-vw.md)
12. ⭐⭐⭐⭐   [移动端 1px 问题](./mobile-1px.md)
13. ⭐⭐⭐     [响应式](./responsive.md)

### 四、细节

14. ⭐⭐⭐⭐   [文本溢出省略](./text-overflow.md)
15. ⭐⭐⭐⭐   [transition vs animation](./transition-animation.md)
16. ⭐⭐⭐⭐   [伪类 vs 伪元素](./pseudo.md)

### 五、性能

17. ⭐⭐⭐⭐   [CSS 渲染性能](./css-performance.md)

### 六、工程化

18. ⭐⭐⭐⭐   [CSS 变量](./css-variables.md)
19. ⭐⭐⭐⭐   [BEM 命名规范](./bem.md)
20. ⭐⭐⭐⭐   [CSS Modules / Scoped](./css-modules-scoped.md)

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [盒模型](./box-model.md) | ⭐⭐⭐⭐⭐ | 初级 | — | draft |
| [选择器优先级](./specificity.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [position 定位](./position.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [BFC](./bfc.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [Flexbox](./flexbox.md) | ⭐⭐⭐⭐⭐ | 初级 | — | draft |
| [居中方案](./center-layout.md) | ⭐⭐⭐⭐⭐ | 初级 | — | draft |
| [CSS 继承性](./inheritance.md) | ⭐⭐⭐⭐ | 初级 | — | draft |
| [Grid](./grid.md) | ⭐⭐⭐⭐ | 中级 | — | draft |
| [三栏布局](./three-column-layout.md) | ⭐⭐⭐⭐ | 中级 | ✅ | draft |
| [层叠上下文](./stacking-context.md) | ⭐⭐⭐⭐ | 中级 | — | draft |
| [rem / vw](./rem-vw.md) | ⭐⭐⭐⭐ | 中级 | — | filled |
| [移动端 1px](./mobile-1px.md) | ⭐⭐⭐ | 中级 | — | draft |
| [文本溢出省略](./text-overflow.md) | ⭐⭐⭐⭐ | 初级 | — | draft |
| [transition vs animation](./transition-animation.md) | ⭐⭐⭐⭐ | 中级 | — | draft |
| [伪类 vs 伪元素](./pseudo.md) | ⭐⭐⭐⭐ | 初级 | — | draft |
| [CSS 渲染性能](./css-performance.md) | ⭐⭐⭐⭐ | 高级 | — | draft |
| [CSS 变量](./css-variables.md) | ⭐⭐⭐⭐ | 中级 | — | filled |
| [BEM 命名](./bem.md) | ⭐⭐⭐⭐ | 初级 | — | filled |
| [CSS Modules / Scoped](./css-modules-scoped.md) | ⭐⭐⭐⭐ | 中级 | — | filled |
| [响应式](./responsive.md) | ⭐⭐⭐ | 中级 | — | draft |

## 相关阅读

- [面试题库：CSS](../面试题库/CSS.md) — 16 道 CSS 高频真题
- [面试回答：CSS](../面试回答/CSS/box-model-bfc.md) — 4 篇 CSS 逐字回答稿（盒模型+BFC / Flex+Grid+居中 / 水平垂直居中 / 选择器优先级）

## 更新记录

- 2026-07-12：学习顺序六组分类（基础/布局/适配/细节/性能/工程化），继承性归入基础、响应式归入适配
- 2026-07-05：初始创建
