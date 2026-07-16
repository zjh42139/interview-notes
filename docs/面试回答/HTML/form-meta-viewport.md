---
title: meta viewport / HTML5 表单 面试回答
description: 面试中如何回答 meta viewport 移动端适配、HTML5 表单新特性
category: 面试回答
type: interview
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - HTML
  - viewport
  - 表单
  - 移动端
  - 面试回答
---

# meta viewport / HTML5 表单 面试回答

> 覆盖 Q3 meta viewport + Q4 HTML5 表单——移动端适配和表单增强两道高频题。

## Q1: meta viewport 是干什么的？

### 30 秒版本

"width=device-width 让布局视口等于设备宽度——不写默认 980px 缩小塞进屏幕字很小。三个视口：布局视口（CSS 基准）、视觉视口（屏幕可见）、理想视口（设备宽度）。user-scalable=no 违反 WCAG 无障碍标准。"

### 2 分钟版本

"移动端适配的基石概念。没有 meta viewport——手机浏览器默认布局视口宽度为 980px——CSS 按 980 布局→缩小塞进 375px 屏幕→字小到看不清。

三个视口的区别面试常考：1) 布局视口——CSS 布局的参照宽度，viewport meta 改变的就是这个值；2) 视觉视口——用户当前看到的屏幕区域，缩放改变这个值；3) 理想视口——设备的实际屏幕宽度——iPhone 14 是 390 CSS px。

`width=device-width` 让布局视口 = 理想视口——移动端适配的第一步。`initial-scale=1.0` 初始不缩放。`user-scalable=no` 和 `maximum-scale=1.0` 禁止用户缩放——违反 WCAG 无障碍标准，视觉障碍用户无法放大文字。除非在 PWA/Web App 场景，否则不推荐禁缩放。

加分：viewport 和 rem/vw 移动端适配的关系——viewport 设好基准后，用 rem 做全局缩放、vw 做组件级适配。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "布局视口和视觉视口的区别" | 布局视口 CSS 布局基准（meta viewport 控制的）；视觉视口屏幕可见区域（缩放控制的） |
| "user-scalable=no 为什么不好" | 违反 WCAG 无障碍标准——视觉障碍用户无法放大页面。PWA 可例外 |
| "viewport 和 rem/vw 的关系" | viewport 设好基准后，rem 做全局缩放（html font-size）、vw 做组件级适配 |

## Q2: HTML5 新增了哪些表单特性？

### 30 秒版本

"新 input 类型 email/url/number/date/range/color、新属性 required/pattern/placeholder/autocomplete、Constraint Validation API——checkValidity/setCustomValidity 自定义校验。CSS :valid/:invalid/:user-invalid 伪类零 JS 反馈。datalist 自动补全。"

### 2 分钟版本

"HTML5 表单增强覆盖三个层面：

1. 输入类型：email(自动校验格式)、url、number(min/max/step)、date(移动端弹出原生日期选择器——体验远超 JS 日历组件)、range(滑块)、color(取色器)、search、tel(移动端弹出数字键盘)。

2. 验证属性：required(必填)、pattern(正则)、placeholder(占位提示——不能替代 label)、autocomplete(浏览器自动填充)、inputmode(移动端键盘类型优化)。

3. 约束验证 API：checkValidity() 返回布尔——全部验证通过返回 true。reportValidity() 展示浏览器默认错误气泡。setCustomValidity('自定义错误信息') 设置自定义消息。validityState 对象包含详细状态——valueMissing/typeMismatch/patternMismatch/tooLong/tooShort/rangeUnderflow/rangeOverflow。

CSS 校验伪类——:valid 有效、:invalid 无效、:user-invalid 用户交互过后才显示错误（避免页面加载时全红色）。:in-range/:out-of-range 数值范围校验。

面试亮点：传统验证用 JS 手写正则——HTML5 原生验证更语义化、性能更好、移动端体验更优。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Constraint Validation API 怎么用" | checkValidity()/reportValidity()/setCustomValidity()——自定义校验文案。validityState 读详细错误类型 |
| "input type=date 的兼容性" | 现代浏览器全部支持。移动端体验更好——弹出原生日期选择器。不支持时降级为 text |
| "怎么自定义表单校验样式" | :valid/:invalid/:user-invalid CSS 伪类——无需 JS。:user-invalid 在用户交互后才触发 |

## 别踩的坑

1. **placeholder 替代 label** —— placeholder 是提示不是标签。提交后用户看不到 placeholder。无障碍要求 input 必须有 label
2. **required 就够了不验证后端** —— 前端验证只改 UX 不提供安全。后端必须独立验证
3. **input type=number 验证浮点数** —— number 的 step 属性默认 1——验证整数。验证浮点数需设 step=any

## 相关阅读

- [DOCTYPE / Meta](../../HTML/doctype-meta.md)
- [HTML5 表单](../../HTML/form-validation.md)
- [移动端 1px 问题](../../CSS/mobile-1px.md)

## 更新记录

- 2026-07-16：新建——合并 Q3/Q4 移动端适配+表单
