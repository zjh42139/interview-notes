---
title: HTML5 语义化
description: HTML5 语义化标签的作用、常见标签和可访问性
category: HTML
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - HTML5
  - 语义化
  - SEO
  - ARIA
  - 可访问性
---

# HTML5 语义化

> 一句话总结：HTML5 语义化是用正确的标签描述内容结构，让搜索引擎和辅助设备能理解页面，而不是满屏 `<div>`。

## 核心机制

### 为什么需要语义化

在 HTML5 之前，页面结构全靠 `<div>` + class 名来表达：

```html
<!-- ❌ HTML4 时代 -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="main">...</div>
<div class="footer">...</div>
```

HTML5 引入了表达页面结构的专用标签，让机器（爬虫、读屏器）能"看懂"页面。

### HTML5 语义化标签

```html
<!-- ✅ HTML5 语义化 -->
<header>    头部区域</header>
<nav>       导航区域</nav>
<main>      主体内容（页面唯一）</main>
<article>   独立完整的内容块（博客文章、新闻）</article>
<section>   主题分组（有标题的内容块）</section>
<aside>     侧边栏 / 补充内容</aside>
<footer>    底部区域</footer>
```

**关键区别**：

| 标签 | 用途 | 关键特征 |
|------|------|----------|
| `<article>` | 独立、完整的内容单元 | RSS 可直接分发的内容 |
| `<section>` | 主题分组 | 通常自带 `<h1>-<h6>` 标题 |
| `<div>` | 无语义的纯容器 | 只为样式或脚本服务 |
| `<main>` | 页面核心内容 | 一个页面只能用一次 |

### 四个层面的价值

1. **SEO**：搜索引擎会给 `<article>`、`<h1>` 更高权重。`<em>` 比 `<i>` 有语义加权重
2. **可访问性**：读屏器通过 `<nav>` 提供快捷跳转，通过 `<main>` 跳过重复内容
3. **代码可读性**：`<article>` 比 `<div class="article">` 更清晰
4. **样式健壮**：浏览器能正常渲染未知标签，不会报错

## 深度拓展

### HTML5 大纲算法（Outline Algorithm）

浏览器会根据 `<h1>-<h6>` + `<section>` / `<article>` 自动生成文档大纲。但**实际浏览器并没有实现这个算法**，SEO 和读屏器仍然只依赖层级正确的标题层级。所以**不要依赖 section 自动降级标题**，应该显式使用正确的 `<h1>-<h6>`。

### figure / figcaption

```html
<figure>
  <img src="chart.png" alt="2025年用户增长曲线" />
  <figcaption>图1：2025年各季度用户增长数据</figcaption>
</figure>
```

`<figure>` 和 `<figcaption>` 配合让图表、代码块有自己的语义容器，SEO 能理解这是一个"有说明的图示"。

### time 标签

```html
<time datetime="2026-07-06">2026年7月6日</time>
```

搜索引擎会优先展示带有 `<time datetime>` 的时间信息，因为机器能精准解析 ISO 格式。

### 可访问性补充：WAI-ARIA

语义化标签不够用时，用 ARIA 属性补充：

```html
<div role="button" tabindex="0" aria-label="关闭弹窗">×</div>
```

但 **ARIA 第一条规则：能用原生 HTML 就不用 ARIA**。`<button>` 自带 role="button"、键盘焦点和点击事件，`<div role="button">` 需要手动处理一切。

## 项目实战

### 在我们的后台管理系统中

后台管理系统的语义化往往被忽略——全是 `<div>` + `<el-*>` 组件。我们在做 SEO 需求的管理端时做了以下改进：

1. **布局层面**：`<aside>` 放侧边栏，`<main>` 放核心内容区，`<header>` 放顶栏
2. **表单层面**：`<fieldset>` + `<legend>` 包裹分组表单，读屏器能识别分组逻辑
3. **表格层面**：`<thead>`、`<tbody>`、`<tfoot>` 正确分离——Element Plus 的 `el-table` 默认已处理好
4. **弹窗**：`<dialog>` 作为弹窗容器（原生支持 `showModal()`、`::backdrop`、ESC 关闭）

## 易错点

### 1. section 必须有标题

`<section>` 在 HTML5 规范中应该包含一个标题（`h1-h6`）。没有标题的 `<section>` 应该用 `<div>`。验证工具会对无标题 section 产生警告。

### 2. main 不能嵌套在 article/aside/nav/header/footer 内

`<main>` 是"页面独有内容"，不应该出现在侧边栏或页头中。

### 3. em 和 i 不是一回事

- `<em>` = 语义强调（读屏器会改变语调）
- `<i>` = 纯视觉斜体（图标字体常用）

### 4. strong 和 b 也是一样

- `<strong>` = 语义上的重要（紧急/警告）
- `<b>` = 纯视觉加粗

## 面试信号

当面试官问"HTML5 有哪些新特性"时，**不要只列标签名**——要说清每个标签解决了什么问题：

> "HTML5 的语义化标签解决了三个问题：第一是 SEO——搜索引擎能识别页面结构；第二是可访问性——读屏器通过 `<nav>`、`<main>` 提供快速跳转；第三是可维护性——`<header>`、`<footer>` 比 `<div class="header">` 更清晰。"

提到 `<dialog>` 原生弹窗能力 + `<form method="dialog">` 自动关联关闭，说明你关注现代 HTML 标准。

## 相关阅读

- [DOCTYPE / Meta](./doctype-meta.md)
- [块级 / 行内元素](./block-inline.md)
- [浏览器 渲染流程](../浏览器/render-process.md)
