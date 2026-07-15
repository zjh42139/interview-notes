---
title: 水平垂直居中 面试回答
description: 面试中如何回答水平垂直居中——至少 5 种方案、各方案的适用场景和优缺点
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - CSS
  - 居中
  - Flexbox
  - Grid
  - 面试回答
---

# 水平垂直居中 面试回答

> CSS 面试开场题。面试官不要你"说出 Flexbox"，要你"根据场景选方案"。

## Q1: 实现水平垂直居中，你能说出多少种方案？

### 30 秒版本

"5 种——Flexbox 最通用、Grid 一行代码最简洁、绝对定位 + transform 不需要知道自身尺寸、absolute + margin:auto 需要定宽高、table-cell 兼容最好但最老。选型：不知道自身尺寸用 Flex/Grid、需要兼容 IE 用 table、固定宽高用 margin:auto。"

### 2 分钟版本

**方案一：Flexbox（日常首选）**——不依赖内容尺寸，浏览器支持 97%+：

```css
.parent { display: flex; justify-content: center; align-items: center; }
```

**方案二：Grid（最简洁）**——一行搞定：

```css
.parent { display: grid; place-items: center; }
```

**方案三：绝对定位 + transform（不知道自身宽高时）**：

```css
.child {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
```

**方案四：绝对定位 + margin:auto（需定宽高）**：

```css
.child {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  width: 200px; height: 100px; margin: auto;
}
```

**方案五：table-cell（兼容到 IE8）**：

```css
.parent { display: table-cell; vertical-align: middle; text-align: center; }
```

**选型原则**：不知道尺寸→Flexbox/Grid/transform。知道尺寸→margin:auto。兼容老浏览器→table-cell。面试时说出 5 种方案并给出选型依据就及格了。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "transform 居中有什么缺陷" | 可能导致文字模糊——浏览器会把元素提升到一个新合成层，渲染时有亚像素偏移。现代浏览器已基本修复 |
| "内联元素怎么居中" | 水平用 text-align:center、垂直单行用 line-height 等于容器高度、多行用 Flexbox |

## 别踩的坑

1. **只用了一种方案** —— 面试官追问"还有吗"答不出来。准备至少 5 种来应对。
2. **transform 被其他 transform 覆盖** —— 元素上本身有动画 transform 时，translate 会覆盖它。

## 相关阅读

- [Flex / Grid / 居中](./flexbox-grid-layout.md)
- [盒模型 / BFC](./box-model-bfc.md)

## 更新记录

- 2026-07-15：新建（5 种居中方案 + 选型决策树）
