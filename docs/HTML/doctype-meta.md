---
title: DOCTYPE / Meta
description: DOCTYPE 声明的作用、Meta 标签分类和 viewport 配置
category: HTML
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - DOCTYPE
  - Meta
  - viewport
  - SEO
  - 移动端适配
---

# DOCTYPE / Meta

> 一句话总结：DOCTYPE 触发标准模式渲染，Meta 标签提供页面元信息给浏览器和搜索引擎。

## 核心机制

### DOCTYPE 是什么

```html
<!DOCTYPE html>
```

它不是 HTML 标签，而是一个**声明**，告诉浏览器用"标准模式"渲染页面。它的历史背景是：

| 渲染模式 | 触发条件 | 行为 |
|----------|----------|------|
| 标准模式 | 有正确的 `<!DOCTYPE html>` | 按 W3C 规范渲染 CSS 盒模型 |
| 怪异模式 | 没有 DOCTYPE 或写错 | 模拟 IE5 的盒模型（width 包含 padding+border） |

**面试中这是常见陷阱题**：在怪异模式下，`box-sizing: border-box` 是**默认行为**，`width: 200px; padding: 20px` 的实际内容区宽度是 160px。

### HTML4 时代的 DOCTYPE

```html
<!-- HTML 4.01 Strict -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
  "http://www.w3.org/TR/html4/strict.dtd">

<!-- HTML 4.01 Transitional（允许废弃标签） -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
  "http://www.w3.org/TR/html4/loose.dtd">
```

HTML4 的 DOCTYPE 基于 SGML，引用 DTD 文件定义文档结构。HTML5 不再依赖 SGML，所以只需要 `<!DOCTYPE html>`。

### Meta 标签分类

```html
<!-- 1. 字符编码（必须放在 head 的前 1024 字节内） -->
<meta charset="UTF-8" />

<!-- 2. viewport：移动端适配的核心 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- 3. SEO 相关 -->
<meta name="description" content="前端面试知识库" />
<meta name="keywords" content="前端,面试,JavaScript,Vue3" />
<meta name="robots" content="index, follow" />

<!-- 4. HTTP 等效 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta http-equiv="Cache-Control" content="no-cache" />

<!-- 5. Open Graph（社交分享） -->
<meta property="og:title" content="前端面试知识库" />
<meta property="og:description" content="体系化的面试准备资料" />
<meta property="og:image" content="/og-image.png" />
```

## 深度拓展

### Viewport 详解

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0,
  maximum-scale=1.0, user-scalable=no" />
```

| 属性 | 含义 | 推荐值 |
|------|------|--------|
| `width` | 视口宽度 | `device-width`（设备逻辑宽度） |
| `initial-scale` | 初始缩放比例 | `1.0` |
| `maximum-scale` | 最大缩放 | `1.0`（禁用缩放会降低可访问性，不推荐） |
| `user-scalable` | 用户可否缩放 | `yes`（设为 `no` 违反 WCAG 无障碍标准） |

**三个 Viewport 的区别**：

| 概念 | 说明 | JS 获取 |
|------|------|---------|
| 布局视口 (layout viewport) | CSS 布局的基准视口（PC 默认 980px） | `document.documentElement.clientWidth` |
| 视觉视口 (visual viewport) | 用户当前看到的区域（缩小后可见更大区域） | `window.visualViewport.width` |
| 理想视口 (ideal viewport) | 设备屏幕宽度 = 布局视口 | 需要 `<meta viewport>` 才能启用 |

**没有 viewport meta 时**，手机浏览器会用 980px 作为布局宽度，然后把整个页面缩小塞进屏幕——这就是为什么没有 viewport 的手机页面字特别小。

### charset 的位置陷阱

浏览器在解析 HTML 时，前 1024 字节内必须确定编码方式。如果 `<meta charset>` 放在第 1024 字节之后，浏览器会用之前的编码来推测，可能导致乱码。**最佳实践**：`<meta charset>` 放在 `<head>` 的第一行。

### SEO 相关 Meta

```html
<!-- 搜索引擎索引控制 -->
<meta name="robots" content="noindex, nofollow" />  <!-- 不收录、不跟踪链接 -->
<meta name="robots" content="noarchive" />          <!-- 不显示缓存快照 -->

<!-- 移动端友好标记 -->
<meta name="applicable-device" content="pc,mobile" />

<!-- 百度专用 -->
<meta name="baidu-site-verification" content="code-xxx" />
```

## 项目实战

### 后台管理系统中的 Meta 优化

在我们的 Vue3 后台管理系统中：

1. **动态 Meta**：用 `useHead`（`@vueuse/head`）动态修改描述。比如用户详情页的 `<meta name="description">` 变为"用户 xxx 的详情"，便于内部搜索
2. **favicon 配置**：在 `index.html` 中同时放置 `favicon.ico` 和多尺寸 PNG，浏览器按场景选择
3. **SPA 的 SEO 陷阱**：如果后台的某个页面需要搜索引擎收录（如登录页、帮助文档），必须做 SSR 或预渲染——因为爬虫不一定执行 JS

## 易错点

### 1. 写了 DOCTYPE 但还是怪异模式？

如果 DOCTYPE 前面有任何字符（包括 BOM、空格、XML 声明），IE6-10 会进入怪异模式。**`<!DOCTYPE html>` 必须是 HTML 文档的第一行**。

### 2. viewport 禁缩放的可访问性问题

`user-scalable=no` 会导致视觉障碍用户无法放大文字，违反 WCAG 2.1 标准。除非有非常特殊的理由（如全屏游戏），不要禁用缩放。

### 3. keywords 已经无效

Google 和百度早已不再使用 `<meta name="keywords">` 作为排名因素。维持它无害但不会有任何效果。

## 面试信号

面试官问"viewport 是干什么的"，不要只说"做移动端适配"就停了——要说出**三个 viewport 的概念和区别**，以及没有 viewport meta 时的默认行为（980px 布局视口）。

面试官问"DOCTYPE 有什么用"，如果只回答"告诉浏览器用标准模式渲染"，评分是初级。能说出**怪异模式下的盒模型差异**（width 包含 padding），评分直接到中级。

## 相关阅读

- [HTML5 语义化](./html5-semantic.md)
- [响应式布局](../CSS/responsive.md)
- [HTTP 缓存](../网络/http-https.md)
- [浏览器渲染流程](../浏览器/render-process.md)
