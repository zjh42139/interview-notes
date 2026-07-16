---
title: "可访问性 ARIA / WAI-ARIA"
description: Web 可访问性基础——ARIA 角色/属性、焦点管理、屏幕阅读器兼容、语义化 HTML 的 A11Y 价值
category: HTML
type: mechanism
score: 70
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - ARIA
  - 可访问性
  - a11y
  - 语义化
---

# 可访问性 ARIA / WAI-ARIA

> ⭐⭐⭐⭐｜难度：中级｜大厂（尤其外企）面试高频

## 一句话总结

**ARIA 是弥补 HTML 语义不足的属性集——`role` 告诉屏幕阅读器"我是什么"、`aria-label` 告诉"我有什么含义"、`aria-hidden` 告诉"忽略我"。但第一条永远是：先用原生语义化 HTML——`&lt;button>` 比 `&lt;div role="button">` 好一万倍。**

## 核心机制

### 三个最核心的 ARIA 属性

```html
<!-- role：定义元素的语义角色 -->
<div role="button" tabindex="0">点击</div>
<!-- 优先用 <button>——原生支持键盘、焦点、表单提交 -->

<!-- aria-label：给屏幕阅读器提供文本描述 -->
<button aria-label="关闭对话框">×</button>
<!-- 视觉上是 ×，读屏器读"关闭对话框" -->

<!-- aria-hidden：对辅助技术隐藏元素 -->
<span aria-hidden="true">👋</span>
<!-- emoji 不需要被读屏器朗读 -->
```

### 语义化 HTML = 自带 A11Y

| 非语义化 | 语义化 | A11Y 差异 |
|---------|--------|---------|
| `&lt;div class="nav">` | `&lt;nav>` | 屏幕阅读器自动识别为导航区 |
| `&lt;div onclick>` | `&lt;button>` | button 自带键盘焦点+Enter/Space 触发 |
| `&lt;div class="h1">` | `&lt;h1>` | 屏幕阅读器自动建立标题导航 |
| `&lt;div class="table">` | `&lt;table>` | 自动关联行列标题 |

**面试话术**："ARIA 的第一条规则——不要用 ARIA。能用原生 HTML 元素表达的语义就用原生的——`&lt;button>` 不需要 `role="button"`。"

### 焦点管理

```html
<!-- tabindex 控制 Tab 键焦点顺序 -->
<button tabindex="0">正常焦点</button>        <!-- 0: 按 DOM 顺序 -->
<button tabindex="-1">需 JS 聚焦</button>     <!-- -1: 不参与 Tab 但可被 JS focus -->
<!-- 永远不要 tabindex > 0 — 破坏自然 Tab 顺序 -->

<!-- 模态框打开时——焦点陷阱 -->
<!-- Tab 在弹窗内循环，不会跑到背景页面去 -->
```

### 常见 A11Y 检查清单

| 检查项 | 怎么做 |
|--------|--------|
| 图片有 alt | `&lt;img alt="描述">`，纯装饰用 `alt=""` |
| 表单有 label | `&lt;label for="id">` 关联 `&lt;input id="id">` |
| 颜色不唯一传达信息 | 错误提示不仅有红色还有图标/文字 |
| 标题层级正确 | h1→h2→h3，不跳级 |
| 键盘可操作 | 所有交互元素可通过 Tab 访问 |

## 易错点

❌ **ARIA 是用来"修"语义的** —— ARIA 不能代替语义化 HTML。`&lt;div role="button">` 不会自动获得 button 的所有行为——keyboard handler、表单提交、disabled 状态都需要自己实现。

❌ **aria-hidden="true" 对可聚焦元素无效** —— 一个 `aria-hidden="true"` 的 button 仍然可以 Tab 聚焦。需要同时加 `tabindex="-1"`。

❌ **只关注颜色对比度就完了** —— a11y 不只是颜色。标题层级、键盘导航、屏幕阅读器兼容、焦点管理都是必须的。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你关注过可访问性吗" | 追问具体措施——"你在项目中做了什么" |
| "div 和 button 有什么区别" | 追问 A11Y——"div 没有键盘支持" |

## 相关阅读

- [HTML5 语义化](./html5-semantic.md)
- [表单验证](./form-validation.md)

## 更新记录

- 2026-07-16：新建——ARIA 三核心属性+语义化=A11Y+焦点管理+检查清单
