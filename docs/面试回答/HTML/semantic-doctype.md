---
title: HTML5 语义化 / DOCTYPE 面试回答
description: 面试中如何回答 HTML5 语义化标签、DOCTYPE 的作用、em/strong 与 i/b 的区别
category: 面试回答
type: interview
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - HTML
  - 语义化
  - DOCTYPE
  - SEO
  - 面试回答
---

# HTML5 语义化 / DOCTYPE 面试回答

> 覆盖 Q1 语义化 + Q2 DOCTYPE + Q5 em/strong vs i/b——三道面试高频基础题。

## Q1: HTML5 新增了哪些语义化标签？和 div 有什么区别？

### 30 秒版本

"header、nav、main、article、section、aside、footer 七个核心标签替代 div。三个价值：SEO——搜索引擎给语义标签更高权重、可访问性——读屏器可以快速跳转到 main/article/nav、代码可读性——一眼看出页面骨架。article 是独立完整内容可以单独分发，section 必须有标题需要上下文。"

### 2 分钟版本

"HTML5 语义化是对 web 标准的重大改进。核心标签分层：页面级 header/nav/main/footer，内容级 article/section/aside。

面试时三个层面展开：1) SEO——搜索引擎爬虫能理解页面结构，header 权重最高、article 是内容核心、nav 是导航索引；2) 无障碍——读屏软件支持 landmark 快捷导航，视力障碍用户按 D 跳到 main、按 H 跳到 header；3) 代码质量——`<div class='header'>` 和 `<header>` 功能完全一样但语义不同。

article vs section vs div 的选择：article 独立完整可独立分发（论坛帖子、新闻稿），section 是页面中的一个主题区块必须有标题，div 没有任何语义只在需要包裹样式时用。

加分项：提 `<dialog>` 原生弹窗——`showModal()` 自动加遮罩和焦点管理，form 加 `method='dialog'` 提交自动关闭。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "article 和 section 的区别" | article 独立完整内容可独立分发；section 是页面中的一个章节需上下文。判断标准：把内容单独拿出来放到另一页还成立吗？成立→article，不成立→section |
| "语义化对 SEO 的影响" | 搜索引擎给 header/nav/main/article 更高权重——理解页面结构后能更精准地索引和排序 |

## Q2: DOCTYPE 是干什么的？不写会怎样？

### 30 秒版本

"DOCTYPE 不是 HTML 标签，是文档类型声明——触发标准模式渲染。不写或写错触发怪异模式——盒模型变成 IE5 行为：width 包含 padding 和 border。HTML5 简化为 `<!DOCTYPE html>`，必须在文档第一行。"

### 2 分钟版本

"这是个经典的'一句话就能说清但很多人说不清'的问题。DOCTYPE 的核心作用：告诉浏览器用哪个版本的 HTML 规范渲染页面。HTML5 之前——HTML4 和 XHTML 的 DOCTYPE 依赖 DTD，又臭又长还要指定 DTD 文件的 URL。HTML5 直接简化成 `<!DOCTYPE html>`——因为不需要再引用外部的 DTD。

不写 DOCTYPE → 浏览器进入怪异模式。怪异模式下盒模型回退到 IE5 行为——width 包含 padding 和 border（默认是 content-box 不含）。这会导致布局整体错位——同一套 CSS 在标准模式和怪异模式下渲染结果不同。

两个细节：1) `<!DOCTYPE html>` 必须是文档第一行——前面不能有空行或 BOM（字节序标记），否则 IE 可能触发怪异模式；2) DOCTYPE 不区分大小写但习惯用小写。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "怪异模式和标准模式的区别" | 怪异模式模拟 IE5 盒模型——width 含 padding+border；标准模式跟随 W3C 规范。实际项目中不写 DOCTYPE 的页面基本不存在——所有现代框架 HTML 模板都自带 |
| "HTML4 和 HTML5 的 DOCTYPE 区别" | HTML4 依赖 DTD（SGML）有严格/过渡/框架三种；HTML5 只一行——因为规范不再基于 SGML，不需要外部 DTD |

## Q3: em 和 i、strong 和 b 有什么区别？

### 30 秒版本

"em 语义强调——读屏器改变语调，SEO 给权重。i 纯视觉斜体——无语义。strong 语义重要/紧急，b 纯视觉加粗。SEO 给 strong 更高权重——关键词用 strong 包装有助排名。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "bold 和 strong 实际表现一样吗" | 视觉一样——但 strong 语义重要/紧急。读屏器会重读 strong 内容。i 用于图标/术语/外来语——纯斜体无强调语义 |
| "b 和 strong 对 SEO 的影响" | SEO 给 strong 更高权重——关键词用 strong 包装有助排名。但不要滥用——搜索引擎会识别过度优化 |

## 别踩的坑

1. **语义化 = 完全不用 div** —— div 是合法的语义中性容器。语义化是"该用语义标签的地方用语义标签"，不是"禁止 div"
2. **article 必须独立** —— 判断标准是"可以独立分发"。产品列表中的单个产品卡片不是 article，但论坛帖子是
3. **DOCTYPE 要大写** —— 不需要。`<!doctype html>` 一样有效。规范推荐小写

## 相关阅读

- [HTML5 语义化](../../HTML/html5-semantic.md)
- [DOCTYPE / Meta](../../HTML/doctype-meta.md)
- [块级 / 行内元素](../../HTML/block-inline.md)

## 更新记录

- 2026-07-16：新建——合并 Q1/Q2/Q5 三道 HTML 高频基础题
