---
title: BEM 命名规范
description: BEM（Block Element Modifier）是 CSS 命名方法论，通过 block__element--modifier 的命名约定解决全局作用域下的样式冲突问题
category: CSS
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - BEM
  - 命名规范
  - CSS工程化
---

# BEM 命名规范

> ⭐⭐⭐⭐｜难度：初级

## 一句话总结

> BEM 是 CSS 命名方法论，核心思想是把界面拆成 **Block（块）、Element（元素）、Modifier（修饰符）** 三个层级，用 `block__element--modifier` 的命名约定在全局作用域下"模拟"出局部作用域，从根本上避免样式冲突。

面试时这样开口："BEM 是 CSS 命名规范里最经典的一套，核心理念就是通过约定命名来防止样式冲突。它把页面拆成 Block、Element、Modifier 三层，团队只要遵循这套命名规则，不需要任何工具就能写出可维护的 CSS。但随着项目变大，BEM 名字太长的问题也很明显，所以后来出现了 CSS Modules 和 Scoped CSS 这些工具化的方案。"

## 核心机制

### 三个概念一句话说清楚

```
Block（块）       → 独立的、可复用的组件               .menu
Element（元素）   → Block 内部的组成部分，依赖 Block    .menu__item
Modifier（修饰符） → Block 或 Element 的变体/状态       .menu--dark  .menu__item--active
```

三者之间的关系用一句话概括：**Element 一定属于某个 Block，不能独立存在；Modifier 描述的是 Block 或 Element 的某个状态或版本。**

### 命名规则

```css
/* Block：单词用连字符分隔 */
.search-form { }
.menu-bar { }

/* Element：Block + 双下划线 + Element */
.search-form__input { }
.search-form__button { }
.menu-bar__item { }

/* Modifier：Block/Element + 双连字符 + Modifier */
.search-form--collapsed { }      /* Block 的变体 */
.search-form__input--disabled { } /* Element 的状态 */
.menu-bar__item--active { }
.menu-bar--dark { }
```

关键规则：
1. **Element 不能嵌套使用**：只能写 `.block__element`，不能写 `.block__el1__el2`。DOM 结构可以嵌套，但类名里只反映"一个 Block 一个 Element"的层级关系。
2. **Modifier 不能独立使用**：`.menu--dark` 必须和 `.menu` 同时出现 `<div class="menu menu--dark">`，确保基础样式 + 修饰样式叠加生效。
3. **永远用 class，不用 id**：id 优先级太高且不可复用，彻底放弃。

### 为什么需要 CSS 命名规范

CSS 的本质问题是**全局作用域**——你在 A 页面写的 `.title { color: red; }` 会影响 B 页面所有 `.title` 元素。项目越大、人越多，撞名字的概率就越高。在没有 CSS Modules / Scoped CSS 的年代，解决这个问题的思路只有两条：一是从工具层面解决（预处理器嵌套、CSS Modules 编译），二是从约定层面解决（命名规范）。BEM 就是约定方案里最成功的一个。

## 深度拓展

### 追问：BEM vs CSS Modules vs Scoped CSS vs CSS-in-JS

面试官让你对比这些方案时，本质上是在考察**你对 CSS 隔离问题的理解深度**。别只列定义，说清楚每个方案的"适用场景"：

| 方案 | 原理 | 隔离方式 | 优点 | 缺点 |
|------|------|----------|------|------|
| **BEM** | 约定命名 | 人为约定 | 零工具成本，纯 CSS 即可，跨框架通用 | 名字长，依赖团队纪律 |
| **CSS Modules** | 编译时 hash | 类名自动加唯一 hash | 真正的局部作用域，无命名冲突 | 动态类名麻烦，需要构建工具 |
| **Vue Scoped** | 编译时注入属性 | `data-v-xxx` 属性选择器 | 和模板天然绑定，写起来简单 | 子组件根节点会被"污染"，深度选择器需要额外语法 |
| **CSS-in-JS** | JS 运行时生成 | 动态生成唯一类名 | 组件级别的动态样式能力强 | 运行时开销，包体积，SSR 复杂 |

你不能说哪个绝对好：**BEM 适合静态官网/多框架混用/不想引入构建工具的项目；CSS Modules 适合中大型 React 项目、组件库；Scoped CSS 适合 Vue 项目、业务页面；CSS-in-JS 适合样式高度动态、和 JS 逻辑强耦合的场景。**

### 追问：Element Plus 里的 BEM 影子

Element Plus 虽然内部用了 Scoped CSS，但它的**类名设计**明显参考了 BEM 思路：

```html
<!-- 一个 Element Plus 按钮 -->
<button class="el-button el-button--primary el-button--large is-disabled">
  <span class="el-button__text">提交</span>
</button>
```

- Block：`el-button`
- Modifier：`el-button--primary`（主题）、`el-button--large`（尺寸）、`is-disabled`（状态——这个用了 `is-` 前缀，是 SMACSS 的状态约定，和 BEM 混搭）
- 这种设计的好处是**开发者一看类名就知道元素的层级和状态**，不需要翻文档。

### BEM 的优缺点总结

**优点：**
- 命名即文档——通过类名就能推断 DOM 结构和组件关系
- 优先级扁平——全部用单 class 选择器，不会出现权重战争
- 重构友好——改一个 Block 只需要搜 `block-name` 前缀

**缺点：**
- 名字确实长，一个深度嵌套的组件可能写成 `.product-detail__info__price__currency--highlight`——虽然 BEM 规范禁止 `__` 嵌套，但很多团队不严格遵守
- 纯靠人肉，没有编译时的强制校验，新人容易写错
- 和组件化框架（React/Vue）的组件名有概念重叠——同一个东西在 CSS 里叫 Block，在 JS 里叫 Component

## 项目实战

### 后台管理系统表单页面实践

一个真实的后台表单 Block：

```html
<div class="user-form">
  <div class="user-form__header">
    <h2 class="user-form__title">编辑用户</h2>
    <span class="user-form__subtitle">修改用户基本信息</span>
  </div>
  <div class="user-form__body">
    <div class="user-form__field user-form__field--required">
      <label class="user-form__label">用户名</label>
      <input class="user-form__input user-form__input--error" />
      <span class="user-form__error-msg">用户名不能为空</span>
    </div>
  </div>
  <div class="user-form__footer">
    <button class="user-form__btn user-form__btn--primary">保存</button>
    <button class="user-form__btn user-form__btn--cancel">取消</button>
  </div>
</div>
```

CSS 侧和 HTML 严格对应：

```css
.user-form { max-width: 600px; margin: 0 auto; }
.user-form__input { width: 100%; padding: 8px 12px; border: 1px solid #dcdfe6; }
.user-form__input--error { border-color: #f56c6c; }
.user-form__btn { padding: 8px 20px; border: none; cursor: pointer; }
.user-form__btn--primary { background: #409eff; color: #fff; }
```

在 Vue3 + Element Plus 项目中，如果组件较小且不需要动态主题，可以直接用 BEM 手写；对于大型组件库或主题系统，CSS Modules/Scoped 更合适。

### 和 Vue Scoped 的混合使用

实际业务中常有这种写法：

```vue
<style scoped>
/* Scoped 提供了组件级隔离 */
.el-form__field { }  /* 注意：这是 BEM 命名，Scoped 提供隔离 */
.el-form__field--required { }
</style>
```

BEM 保证类名可读，Scoped 保证类名不冲突——两者互补。

## 易错点

- ❌ **Element 嵌套**：`.block__el1__el2` 看似表达了 DOM 层级，实际违反了 BEM 规则，也解决不了任何问题。✅ 只保留一层 Element：`.block__el2`。
- ❌ **Modifier 单独使用**：`<div class="menu--dark">` 这样写丢掉了 `.menu` 的基础样式，布局都毁掉了。✅ 永远写成 `<div class="menu menu--dark">`。
- ❌ **用 BEM 拆得太细**：一个按钮就三个 Element（icon、text、badge），每个又有多种 Modifier，最终 class 标签比内容还长。✅ 只在需要复用的边界处用 BEM，内部私有的小元素用普通类名就行。
- ❌ **BEM + 后代选择器混用**：`.user-form .title` 这种写法和 BEM 的"单 class 选择器"原则冲突，权重开始不统一，维护性下降。✅ 坚持单 class：`.user-form__title`。
- ❌ **以为 BEM 过时了**：BEM 在纯 CSS/静态站/多框架项目里仍然是最务实的方案。面试官问你 BEM，是在考察 CSS 工程化的演进理解，不是让你评价它老不老。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "BEM 是什么" | 追问 Block/Element/Modifier 的命名规则和层级关系 |
| "BEM 和 CSS Modules 怎么选" | 追问全局污染 vs 局部作用域的区别 |
| "BEM 有什么缺点" | 追问命名过长、嵌套过深时的维护问题 |

## 相关阅读

- [BEM 官方文档](https://en.bem.info/methodology/)
- [BEM 101 — CSS-Tricks](https://css-tricks.com/bem-101/)
- [Vue Scoped CSS 原理](https://vuejs.org/api/sfc-css-features.html#scoped-css)
- [CSS Modules 与 BEM 的关系](./css-modules-scoped.md)
- [CSS 变量的主题切换](./css-variables.md)
- [HTML5 语义化标签](../HTML/html5-semantic.md)

## 更新记录

- 2026-07：Phase 2 填充（面试笔记版）
