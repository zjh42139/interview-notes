---
title: CSS Modules / Scoped
description: CSS Modules 和 Vue Scoped CSS 是两种主流的样式隔离方案，通过编译时机制自动生成唯一选择器，从根本上解决全局样式污染问题
category: CSS
type: comparison
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - CSS Modules
  - Scoped CSS
  - 样式隔离
  - Vue
---

# CSS Modules / Scoped

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

> CSS Modules 和 Scoped CSS 都是编译时样式隔离方案：CSS Modules 通过在类名后追加唯一 hash（`.title` -> `._title_abc123`）来隔离；Vue Scoped CSS 通过在 HTML 和 CSS 上同时追加 `data-v-xxx` 属性选择器来隔离。两者都是在 BEM 那样的"人工约定"基础上升级为"工具强制"。

面试时这样开口："CSS 全局作用域的问题，纯靠 BEM 命名规范约束力度不够，所以社区发展出了编译时自动隔离的方案。CSS Modules 和 Vue Scoped 是目前最主流的两种，核心区别在于隔离粒度——CSS Modules 按文件隔离，每个文件产生独立 hash；Scoped 按组件隔离，靠属性选择器的特异性匹配。"

## 核心机制

### CSS Modules：编译时给类名加 hash

CSS Modules 的核心流程：**编译时把 `.module.css` 文件里的类名映射为唯一的 hash 类名，同时生成一个 JS 对象暴露这个映射关系。**

```css
/* App.module.css */
.title { color: red; }
.wrapper { padding: 20px; }
```

编译后实际输出的 CSS：

```css
._title_abc123 { color: red; }
._wrapper_xyz789 { padding: 20px; }
```

React 里的用法：

```jsx
import styles from './App.module.css';

function App() {
  return <h1 className={styles.title}>Hello</h1>;
  // 渲染为 <h1 class="_title_abc123">Hello</h1>
}
```

关键点：**`styles.title` 在编译时就已经确定了 hash 值**，不是运行时生成的。不同文件即使有同名类名也不会冲突——`App.module.css` 的 `.title` 和 `Header.module.css` 的 `.title` 编译后是两个不同的 hash。

### `:global()` 和 `composes`

有时候需要退回到全局样式（比如覆盖第三方组件），CSS Modules 提供了两个关键能力：

```css
/* 声明全局类名，不会被 hash 化 */
:global(.ant-btn) {
  border-radius: 4px;
}

/* 选择器中混合 local 和 global */
.title :global(.highlight) {
  color: #409eff;
}

/* composes：样式继承/复用，不用 JS 也能组合 */
.baseButton {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}
.primaryButton {
  composes: baseButton;      /* 继承 baseButton 的所有样式 */
  background: #409eff;
  color: #fff;
}
```

`composes` 编译后会同时输出两个类名：`class="_primaryButton_xxx _baseButton_yyy"`，相当于在编译层面实现了样式组合，避免了 Sass 的 `@extend` 带来的选择器爆炸。

### Vue Scoped CSS：`data-v-xxx` 属性选择器

Vue 的 `<style scoped>` 换了一种思路——不修改类名，而是给每个元素打上一个唯一的自定义属性：

```vue
<template>
  <div class="title">Hello</div>
</template>

<style scoped>
.title { color: red; }
</style>
```

编译后实际输出：

```html
<div class="title" data-v-f3f3eg9>Hello</div>
```

```css
.title[data-v-f3f3eg9] { color: red; }
```

原理是：**同一个组件的模板和样式都会被打上相同的 `data-v-xxx` 属性。CSS 选择器通过属性选择器的特异性绑定到带有相同属性的元素上，其他组件的元素没有这个属性，所以不会被命中。**

### 关于值为 "f3f3eg9" 的 data-v-xxx 属性，实际代表什么？

这个值是编译时根据**文件路径 + 文件内容**生成的**唯一 hash**。同一个 `.vue` 文件里的所有标签 CSS 样式共享同一个 hash。文件内容变了 hash 也会变（类似 content hash），确保缓存无效化。它不是随机字符串，而是构建工具（Vite/Webpack + vue-loader）在编译时确定性的计算结果。

### 深度选择器演进：`>>>` -> `/deep/` -> `::v-deep` -> `:deep()`

Scoped 隔离很安全，但它也阻止了你修改子组件的样式。坑就来了——你用 Element Plus 的 `<el-input>`，想改里面的 `.el-input__inner` 输入框样式，Scoped 下直接写不生效，因为子组件的内部元素没有你的 `data-v-xxx` 属性。

于是有了深度选择器：

```css
/* 历史演变：已经被废弃的写法 */
.a >>> .b { }       /* CSS 原生，但浏览器不支持 */
.a /deep/ .b { }    /* Vue 2.x，已废弃 */
.a ::v-deep .b { }  /* Vue 2.7+ 过渡写法 */

/* 现代写法：Vue 3.x 推荐 */
.a :deep(.b) { }
```

`:deep()` 做了什么？它会把你组件自己的 `data-v-xxx` 属性选择器"穿透"到子选择器上，编译结果类似：

```css
.a[data-v-f3f3eg9] .b { }
/* 而不是 .a .b[data-v-f3f3eg9] */
```

注意 `data-v-xxx` 在 `.a` 上，所以子组件的 `.b` 样式被正确覆盖了。

## 深度拓展

### CSS Modules vs Scoped 怎么选？

这个问题没有标准答案，但有一条非常实用的经验：

**CSS Modules** 的隔离更"干净"——它改造的是类名本身，生成的 hash 类名在任何地方都是唯一的，即使通过 `document.querySelector` 选 DOM 也不会混淆。适合组件库、跨项目复用、不依赖 Vue/React 框架限制的场景。

**Scoped CSS** 和模板更"紧密"——在 `.vue` 文件里模板和样式写在一起，开发体验非常流畅；属性选择器的隔离力度稍弱（你仍然可以通过全局 CSS 用选择器特异性覆盖它），但这对业务开发反而是好事——偶尔需要覆盖子组件时，`:deep()` 比 CSS Modules 的 `:global()` 更语义化。

**实战经验：我参与的项目里，组件库/设计系统用 CSS Modules，业务页面用 Scoped。** 组件库需要发布 npm，CSS Modules 不依赖 Vue，给 React 团队也能用。业务页面用的是 Vue SFC，Scoped 是天然选择。

### 追问：为什么 Scoped 会"泄漏"到子组件的根节点？

```vue
<!-- Parent.vue -->
<template>
  <Child class="child-root" />
</template>

<!-- Child.vue -->
<template>
  <div class="child-content">  ← 这个 div 是子组件根节点 -->
    <span>hello</span>
  </div>
</template>
```

编译后，Parent 的 `data-v-parentxxx` 属性会**同时加在 Parent 的根元素和 Child 的根元素上**。这是 Vue 故意设计的——让你可以用 `<Child class="xxx" />` 直接控制子组件根节点的样式。但子组件内部 `<span>` 不会有 parent 的 data-v。这个行为经常造成困惑：为什么改 Child 的根节点能生效，改内部 span 就不行？这就是 `:deep()` 的用武之地。

## 项目实战

### 组件库用 CSS Modules

我们项目的基础组件库采用 CSS Modules：

```tsx
// Button/index.tsx
import styles from './Button.module.css';

interface Props {
  type?: 'primary' | 'default';
}

export const Button: React.FC<Props> = ({ type = 'default', children }) => (
  <button className={`${styles.btn} ${styles[type]}`}>{children}</button>
);
```

```css
/* Button.module.css */
.btn { padding: 8px 20px; border: none; cursor: pointer; }
.primary { background: #409eff; color: #fff; }
.default { background: #f0f0f0; color: #333; }
```

发布到 npm 后 `.btn` 会变成 `.Button_btn_a1b2c3`，使用方完全不用担心样式冲突——这才是组件库该有的隔离力度。

### 业务页面用 Scoped + Element Plus

后台管理系统的业务页面统一用 Vue Scoped：

```vue
<template>
  <div class="user-page">
    <el-table :data="users">
      <el-table-column label="操作">
        <template #default>
          <el-button class="user-page__action-btn">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
/* 穿透 el-button 内部样式：需要 :deep() */
.user-page__action-btn :deep(.el-button__text) {
  font-size: 12px;
}
</style>
```

如果你的后台系统需要全局主题切换（暗黑模式），Scoped 的 `:deep()` 搭配 [CSS 变量](./css-variables.md) 是最佳实践——变量写在 `:root` 里全局生效，Scoped 确保业务样式不泄漏。

## 易错点

- ❌ **Scoped 下直接改子组件内部类名**：写的样式不生效，然后怀疑自己选择器写错了。✅ 本质是子组件内部元素没有你的 `data-v-xxx`，需要用 `:deep()` 穿透。
- ❌ **CSS Modules 动态类名忘了用方括号语法**：`styles['my-class']` 写成 `styles.my-class`，连字符被解析成减法，返回 NaN。✅ 带连字符的类名用 `styles['my-class']`。
- ❌ **`composes` 循环引用**：A composes B，B composes A，打包时直接报错。✅ `composes` 的依赖关系必须是单向的。
- ❌ **在 Scoped 的 style 标签里写 `@import`**：导入的 CSS 不会被 scoped 处理，等于裸奔在全局。✅ 用 `<style src="...">` 或改成 JS 动态导入。
- ❌ **以为 Scoped 能隔离所有样式**：Scoped 只对当前组件模板内的元素生效，通过 `v-html` 插入的内容不会被 scoped 处理。✅ `v-html` 的内容需要用 `:deep()` 或者单独的全局样式覆盖。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "CSS Modules 和 Scoped 有什么区别" | 追问 hash 类名 vs data 属性选择器的实现差异 |
| "Scoped 的穿透怎么写" | 追问 :deep() 的原理和何时用 |
| "CSS-in-JS 和 CSS Modules 怎么选" | 追问运行时开销和构建时生成的权衡 |

## 相关阅读

- [CSS Modules 官方文档](https://github.com/css-modules/css-modules)
- [Vue SFC CSS Features — Scoped](https://vuejs.org/api/sfc-css-features.html#scoped-css)
- [Vue Loader — Scoped CSS](https://vue-loader.vuejs.org/guide/scoped-css.html)
- [BEM 命名规范](./bem.md)
- [CSS 变量与主题切换](./css-variables.md)

## 更新记录

- 2026-07：Phase 2 填充（面试笔记版）
